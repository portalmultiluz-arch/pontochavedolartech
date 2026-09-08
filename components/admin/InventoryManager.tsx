import React, { useState, useEffect, useMemo, startTransition } from 'react';
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    AlertTriangle, 
    Check, 
    X, 
    Image as ImageIcon, 
    Video, 
    Package, 
    FileText, 
    Calendar, 
    DollarSign, 
    Eye, 
    EyeOff,
    Play, 
    Sparkles, 
    Calculator, 
    Percent, 
    TrendingUp, 
    Ruler, 
    Weight, 
    Droplets, 
    Flame, 
    Layers, 
    Zap,
    Tag,
    Archive,
    AlertOctagon,
    Clock,
    Truck,
    History,
    Upload,
    Download,
    CheckSquare,
    Square,
    FolderKanban,
    ArrowUp,
    ArrowDown,
    PlusCircle,
    ImagePlus,
    Star,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Table,
    Wrench,
    Lightbulb,
    ShieldCheck,
    Database,
    RefreshCw,
    Boxes,
    MapPin
} from 'lucide-react';
import { subscribeToCollection, createDocument, updateDocument, deleteDocument, deleteDocumentsBatch } from '../../services/firebaseService';
import { Product } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { parseMediaUrl, getProductDisplayImage } from '../../lib/mediaHelper';
import { calculateProductPrice } from '../../lib/taxCalculator';
import { 
    getProductPromoDetails, 
    getProductDiscontinuedDetails, 
    getProductOffMarketDetails, 
    isProductEligibleForStorefront, 
    getProductSalesEligibility 
} from '../../lib/productStatusHelper';
import { 
    ProductTableKey, 
    CATALOG_TABLES, 
    getProductTableKey, 
    getProductTableBadge, 
    fastSearchProduct,
    allReferenceCatalogs,
    isKitProduct
} from '../../lib/catalogHelper';
import { RestockModal } from './RestockModal';
import { MediaBankManager } from './MediaBankManager';
import { ProductImportModal } from './ProductImportModal';
import { ProductEnrichModal } from './ProductEnrichModal';
import { ProductFormModal } from './ProductFormModal';
import { PromoActionModal } from './PromoActionModal';
import { KitBuilderModal } from './KitBuilderModal';
import { CostPriceAdjustmentModal } from './CostPriceAdjustmentModal';
import { ErrorBoundary } from '../ErrorBoundary';

const PRESET_IMAGES = [
    { label: 'Logo Oficial Ponto Chave do Lar (Padrão)', url: '/ponto_chave_logo.jpg' },
    { label: 'Caixa Organizadora Bambu', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800' },
    { label: 'Porta-Temperos Inox Giratório', url: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&q=80&w=800' },
    { label: 'Spray Dosador Azeite Inox', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800' },
    { label: 'Luminária Touch Sem Fio', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800' },
    { label: 'Barra LED Magnética USB', url: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&q=80&w=800' },
    { label: 'Kit Lavabo Vidro Canelado', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800' },
    { label: 'Porta-Toalhas Alumínio Preto', url: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=800' },
    { label: 'Difusor Efeito Chama de Fogo', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800' },
    { label: 'Vaso Cerâmica Nórdico', url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=800' },
    { label: 'Ducha / Metais Banheiro', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800' },
    { label: 'Ferramentas & Furadeira', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800' }
];

const INITIAL_FORM: Partial<Product> = {
    code: '',
    sku: '',
    name: '',
    description: '',
    price: 0,
    costPrice: 0,
    icmsPercent: 18,
    ipiPercent: 0,
    pisPercent: 1.65,
    cofinsPercent: 7.60,
    otherTaxesPercent: 0,
    profitMarginPercent: 40,
    stock: 1,
    minStock: 3,
    category: 'Ferramentas & Máquinas',
    isActive: true,
    showInStore: true,
    isImported: false,
    imageUrl: '/ponto_chave_logo.jpg',
    videoUrl: '',
    supplierName: '',
    batchNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    expiryDate: '',
    technicalSpecs: '',
    gallery: [],
    // Dimensões e atributos físicos
    dimensionsSize: '',
    height: '',
    width: '',
    length: '',
    grossWeight: undefined,
    netWeight: undefined,
    capacityLiters: '',
    packagingType: 'Unidade',
    nature: 'Não-inflamável',
    material: 'Plástico',
    voltage: 'Bivolt (110V/220V)',
    // 1) Promoção por Período
    isPromo: false,
    promoPrice: 0,
    promoDiscountPercent: 0,
    promoStartDate: '',
    promoEndDate: '',
    // 2) Produto Descontinuado por Período
    isDiscontinued: false,
    discontinuedStartDate: '',
    discontinuedEndDate: '',
    discontinuedReason: '',
    // 3) Produto Fora de Comercialização por Período
    isOffMarket: false,
    offMarketStartDate: '',
    offMarketEndDate: '',
    offMarketReason: '',
    purchaseHistory: []
};

interface InventoryManagerProps {
    initialProducts?: Product[];
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ initialProducts }) => {
    const [products, setProducts] = useState<Product[]>(initialProducts || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [storefrontFilter, setStorefrontFilter] = useState<'all' | 'in_store' | 'hidden_stock' | 'issues'>('all');
    const [isAdding, setIsAdding] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [restockProduct, setRestockProduct] = useState<Product | null>(null);
    const [enrichProduct, setEnrichProduct] = useState<Product | null>(null);
    const [isMediaBankModalOpen, setIsMediaBankModalOpen] = useState(false);
    const [mediaBankTarget, setMediaBankTarget] = useState<'main' | number | 'add_gallery' | 'gallery'>('main');
    
    // Novos estados de Importação e Ações em Lote (Excluir / Atualizar)
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [bulkCategoryModalOpen, setBulkCategoryModalOpen] = useState(false);
    const [bulkCategoryValue, setBulkCategoryValue] = useState('Ferramentas & Máquinas');
    const [confirmMassDeleteOpen, setConfirmMassDeleteOpen] = useState(false);
    const [isSeedingStrategic, setIsSeedingStrategic] = useState(false);
    const [isSeedingSamsClub, setIsSeedingSamsClub] = useState(false);
    const [isSyncingTable, setIsSyncingTable] = useState<string | null>(null);

    // Gestão de Itens em Promoção (Incluir, Alterar, Excluir)
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [promoModalTargetProduct, setPromoModalTargetProduct] = useState<Product | null>(null);

    // Gestão de Kits & Combos (Montagem e edição com lista de itens)
    const [isKitModalOpen, setIsKitModalOpen] = useState(false);
    const [editingKit, setEditingKit] = useState<Product | null>(null);

    // Gestão de Reajuste de Preço de Custo por Margem de Índice (%)
    const [isCostPriceAdjustmentModalOpen, setIsCostPriceAdjustmentModalOpen] = useState(false);

    // Filtro dinâmico por Tabela de Fornecedores (Famastil, Foxlux, Tramontina, Pampulha) e Paginação de Alta Performance
    const [selectedTable, setSelectedTable] = useState<ProductTableKey>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(25);

    // Troca de Tabela com reset instantâneo de filtros para carregamento e abertura imediata
    const handleSelectTable = (tableKey: ProductTableKey) => {
        startTransition(() => {
            setSelectedTable(tableKey);
            setSelectedCategory('Todos');
            setStorefrontFilter('all');
            setSearchTerm('');
            setCurrentPage(1);
            setSelectedProductIds([]);
        });
    };

    // Sincroniza quando initialProducts mudar no pai
    useEffect(() => {
        if (initialProducts && initialProducts.length > 0) {
            setProducts(initialProducts);
        }
    }, [initialProducts]);

    useEffect(() => {
        // Se initialProducts for fornecido, a sincronização em tempo real já é mantida no componente pai
        if (initialProducts && initialProducts.length > 0) {
            return;
        }
        const unsubscribe = subscribeToCollection('products', (data) => {
            setProducts(data as Product[]);
        }, 'name');
        return () => unsubscribe();
    }, [initialProducts]);

    const [pendingMediaAsset, setPendingMediaAsset] = useState<string | null>(null);

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4000);
    };

    const handleOpenCreate = () => {
        setEditingProduct(null);
        setIsAdding(true);
    };

    const handleOpenEdit = (product: Product) => {
        setEditingProduct(product);
        setIsAdding(true);
    };

    const handleCloseForm = () => {
        setIsAdding(false);
        setEditingProduct(null);
        setPendingMediaAsset(null);
    };

    // Ações de Kits & Combos
    const handleOpenCreateKit = () => {
        setEditingKit(null);
        setIsKitModalOpen(true);
    };

    const handleOpenEditKit = (kit: Product) => {
        setEditingKit(kit);
        setIsKitModalOpen(true);
    };

    // Ações de Promoção (Incluir, Alterar, Excluir)
    const handleOpenPromoModal = (product?: Product | null) => {
        setPromoModalTargetProduct(product || null);
        setIsPromoModalOpen(true);
    };

    const handleSavePromo = async (productId: string, promoData: {
        isPromo: boolean;
        promoPrice: number;
        promoDiscountPercent: number;
        promoStartDate: string;
        promoEndDate: string;
    }) => {
        try {
            await updateDocument('products', productId, {
                isPromo: true,
                promoPrice: Number(promoData.promoPrice),
                promoDiscountPercent: Number(promoData.promoDiscountPercent || 0),
                promoStartDate: promoData.promoStartDate,
                promoEndDate: promoData.promoEndDate
            });
            showFeedback('success', 'Promoção salva e ativada com sucesso!');
        } catch (err: any) {
            console.error('Erro ao salvar promoção:', err);
            showFeedback('error', 'Erro ao salvar promoção: ' + (err.message || 'Falha de conexão'));
            throw err;
        }
    };

    const handleRemovePromo = async (productId: string) => {
        try {
            await updateDocument('products', productId, {
                isPromo: false,
                promoPrice: 0,
                promoDiscountPercent: 0,
                promoStartDate: '',
                promoEndDate: ''
            });
            showFeedback('success', 'Promoção excluída com sucesso. Produto retornou ao preço normal.');
        } catch (err: any) {
            console.error('Erro ao excluir promoção:', err);
            showFeedback('error', 'Erro ao excluir promoção: ' + (err.message || 'Falha de conexão'));
            throw err;
        }
    };

    const handleSaveProduct = async (payload: Partial<Product>, saveAndNew: boolean = false) => {
        setIsSaving(true);
        try {
            if (editingProduct?.id) {
                await updateDocument('products', editingProduct.id, payload);
                showFeedback('success', `Produto "${payload.name}" atualizado com sucesso!`);
            } else {
                await createDocument('products', payload);
                showFeedback('success', `Produto "${payload.name}" cadastrado com sucesso!`);
            }

            if (!saveAndNew) {
                setIsAdding(false);
                setEditingProduct(null);
                setPendingMediaAsset(null);
            }
        } catch (err: any) {
            console.error('Erro ao salvar produto:', err);
            showFeedback('error', `Falha ao salvar produto: ${err.message || 'Verifique as permissões de acesso.'}`);
            throw err;
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        try {
            await deleteDocument('products', id);
            setDeleteConfirmId(null);
            setSelectedProductIds(prev => prev.filter(x => x !== id));
            showFeedback('success', `Produto "${name}" removido com sucesso.`);
        } catch (err: any) {
            console.error('Erro ao remover produto:', err);
            showFeedback('error', `Erro ao excluir produto: ${err.message || 'Permissão negada'}`);
        }
    };

    // Ações em Lote (Multi-seleção)
    const handleToggleSelectAll = (filteredList: Product[]) => {
        if (selectedProductIds.length === filteredList.length && filteredList.length > 0) {
            setSelectedProductIds([]);
        } else {
            setSelectedProductIds(filteredList.map(p => p.id));
        }
    };

    const handleToggleSelectProduct = (id: string) => {
        setSelectedProductIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleBulkDeleteSelected = async () => {
        if (selectedProductIds.length === 0) return;
        setIsBulkProcessing(true);
        try {
            const deletedCount = await deleteDocumentsBatch('products', selectedProductIds);
            showFeedback('success', `${deletedCount} produto(s) excluído(s) com sucesso do banco de dados.`);
            setSelectedProductIds([]);
            setConfirmMassDeleteOpen(false);
        } catch (err: any) {
            console.error('Erro na exclusão em lote:', err);
            showFeedback('error', 'Erro ao excluir produtos: ' + (err.message || 'Falha de permissão'));
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleBulkToggleActive = async (targetActive: boolean) => {
        if (selectedProductIds.length === 0) return;
        setIsBulkProcessing(true);
        try {
            for (const id of selectedProductIds) {
                await updateDocument('products', id, { isActive: targetActive });
            }
            showFeedback('success', `${selectedProductIds.length} produto(s) ${targetActive ? 'ativado(s)' : 'pausado(s)'} com sucesso.`);
            setSelectedProductIds([]);
        } catch (err: any) {
            console.error('Erro ao atualizar status:', err);
            showFeedback('error', 'Erro ao atualizar status: ' + err.message);
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleBulkToggleStorefront = async (targetInStore: boolean) => {
        if (selectedProductIds.length === 0) return;
        setIsBulkProcessing(true);
        try {
            for (const id of selectedProductIds) {
                await updateDocument('products', id, { showInStore: targetInStore });
            }
            showFeedback('success', `${selectedProductIds.length} produto(s) ${targetInStore ? 'publicado(s) na vitrine principal' : 'ocultado(s) da vitrine (mantidos no estoque)'}.`);
            setSelectedProductIds([]);
        } catch (err: any) {
            console.error('Erro ao atualizar visibilidade da vitrine:', err);
            showFeedback('error', 'Erro ao alterar visibilidade: ' + err.message);
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleToggleSingleProductStorefront = async (product: Product, e: React.MouseEvent) => {
        e.stopPropagation();
        const currentVisibility = getProductSalesEligibility(product).isStoreVisible;
        const newVisibility = !currentVisibility;
        try {
            await updateDocument('products', product.id, { showInStore: newVisibility });
            showFeedback('success', `"${product.name}" agora está ${newVisibility ? 'PUBLICADO na vitrine da loja' : 'OCULTO da vitrine (apenas estoque interno)'}.`);
        } catch (err: any) {
            console.error('Erro ao alternar visibilidade:', err);
            showFeedback('error', 'Erro ao alterar visibilidade: ' + err.message);
        }
    };

    const handleBulkApplyCategory = async () => {
        if (selectedProductIds.length === 0) return;
        setIsBulkProcessing(true);
        try {
            for (const id of selectedProductIds) {
                await updateDocument('products', id, { category: bulkCategoryValue });
            }
            showFeedback('success', `${selectedProductIds.length} produto(s) alterado(s) para "${bulkCategoryValue}".`);
            setSelectedProductIds([]);
            setBulkCategoryModalOpen(false);
        } catch (err: any) {
            console.error('Erro ao atualizar categorias:', err);
            showFeedback('error', 'Erro ao atualizar categorias: ' + err.message);
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleBulkApplyOfficialLogo = async () => {
        if (selectedProductIds.length === 0) return;
        setIsBulkProcessing(true);
        try {
            for (const id of selectedProductIds) {
                await updateDocument('products', id, { imageUrl: '/ponto_chave_logo.jpg' });
            }
            showFeedback('success', `Logo Oficial Ponto Chave do Lar aplicado em ${selectedProductIds.length} produto(s) com sucesso!`);
            setSelectedProductIds([]);
        } catch (err: any) {
            console.error('Erro ao aplicar logo em lote:', err);
            showFeedback('error', 'Erro ao aplicar logo nos produtos: ' + err.message);
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleReplaceYarnImagesWithLogo = async () => {
        if (products.length === 0) {
            showFeedback('error', 'Nenhum produto cadastrado no catálogo.');
            return;
        }

        // Procura produtos com imagem de novelo/trico (photo-1584992236310) ou vazias/inválidas
        const yarnProducts = products.filter(p => 
            !p.imageUrl || 
            p.imageUrl.includes('photo-1584992236310') ||
            p.imageUrl.includes('trico') ||
            p.imageUrl.includes('novelo') ||
            p.imageUrl === 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=800'
        );

        const targetList = yarnProducts.length > 0 ? yarnProducts : products;
        const msg = yarnProducts.length > 0 
            ? `Deseja substituir as imagens de novelo de ${yarnProducts.length} produto(s) pelo Logo Oficial da Ponto Chave do Lar?`
            : `Deseja atualizar a foto principal de todos os ${products.length} produto(s) pelo Logo Oficial da Ponto Chave do Lar?`;

        if (window.confirm(msg)) {
            setIsBulkProcessing(true);
            try {
                for (const p of targetList) {
                    await updateDocument('products', p.id, { imageUrl: '/ponto_chave_logo.jpg' });
                }
                showFeedback('success', `Sucesso! ${targetList.length} produto(s) atualizado(s) com o Logo Oficial Ponto Chave do Lar.`);
            } catch (err: any) {
                console.error('Erro ao substituir imagens de novelo:', err);
                showFeedback('error', 'Erro ao substituir imagens: ' + (err.message || 'Falha de permissão'));
            } finally {
                setIsBulkProcessing(false);
            }
        }
    };

    const handleBulkDeleteProducts = async () => {
        if (selectedProductIds.length === 0) return;
        if (!window.confirm(`⚠️ Tem certeza que deseja EXCLUIR PERMANENTEMENTE ${selectedProductIds.length} produto(s) selecionado(s) do banco de dados?`)) {
            return;
        }
        setIsBulkProcessing(true);
        try {
            const deletedCount = await deleteDocumentsBatch('products', selectedProductIds);
            showFeedback('success', `${deletedCount} produto(s) excluído(s) com sucesso do banco de dados.`);
            setSelectedProductIds([]);
        } catch (err: any) {
            console.error('Erro ao excluir produtos em lote:', err);
            showFeedback('error', 'Erro ao excluir produtos: ' + err.message);
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleDeleteTableProducts = async (tableKey: ProductTableKey) => {
        if (tableKey === 'all') {
            await handleDeleteAllProducts();
            return;
        }
        const targetProducts = products.filter(p => getProductTableKey(p) === tableKey);
        const tableName = CATALOG_TABLES[tableKey]?.label || tableKey;
        if (targetProducts.length === 0) {
            showFeedback('error', `Não há produtos cadastrados na ${tableName} para excluir.`);
            return;
        }

        const confirmed = window.confirm(
            `⚠️ Tem certeza que deseja EXCLUIR TODOS OS ${targetProducts.length} produtos da ${tableName} do banco de dados?\n\nEsta ação limpará exclusivamente os itens da ${tableName} para você realizar uma nova importação limpa.`
        );
        if (!confirmed) return;

        setIsBulkProcessing(true);
        try {
            const targetIds = targetProducts.map(p => p.id);
            const count = await deleteDocumentsBatch('products', targetIds);
            setSelectedProductIds(prev => prev.filter(id => !targetIds.includes(id)));
            showFeedback('success', `Sucesso! Todos os ${count} produtos da ${tableName} foram excluídos do banco de dados. A tabela está limpa para nova importação.`);
        } catch (err: any) {
            console.error('Erro ao excluir produtos da tabela:', err);
            showFeedback('error', `Erro ao excluir produtos da ${tableName}: ${err.message || 'Falha de conexão'}`);
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleDeleteAllProducts = async () => {
        if (products.length === 0) {
            showFeedback('error', 'Nenhum produto cadastrado no banco de dados para excluir.');
            return;
        }
        const confirmed = window.confirm(
            `🚨 ATENÇÃO: Deseja realmente EXCLUIR TODOS OS ${products.length} PRODUTOS cadastrados no banco de dados?\n\nEsta ação limpará o catálogo por completo para que você possa realizar novas importações alinhadas à sua realidade. Esta ação é irreversível!`
        );
        if (!confirmed) return;

        setIsBulkProcessing(true);
        try {
            const allIds = products.map(p => p.id);
            const count = await deleteDocumentsBatch('products', allIds);
            setSelectedProductIds([]);
            showFeedback('success', `Todos os ${count} produtos foram excluídos com sucesso! O banco de dados está limpo para nova importação.`);
        } catch (err: any) {
            console.error('Erro ao excluir todos os produtos:', err);
            showFeedback('error', 'Erro ao excluir produtos do banco: ' + (err.message || 'Falha de conexão'));
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const categories = useMemo(() => {
        const set = new Set<string>();
        set.add('Todos');
        products.forEach(p => {
            if (p.category && p.category.trim()) {
                set.add(p.category.trim());
            }
        });
        return Array.from(set);
    }, [products]);

    const handleSeedStrategicProducts = async () => {
        setIsSeedingStrategic(true);
        try {
            const strategicList = [
                {
                    code: 'ORG-360-01',
                    sku: 'SKU-ORG-360',
                    name: 'Organizador Giratório Multiuso 360° com Divisórias Acrílicas',
                    description: 'Organizador giratório 360° com divisórias transparentes em acrílico cristal de alta resistência. Rolamento suave de esferas de aço. Ideal para geladeiras, armários de cozinha, despensas, bancadas de maquiagem, perfumes e cosméticos.',
                    price: 64.90,
                    costPrice: 24.00,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 55,
                    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 25,
                    minStock: 5,
                    category: 'Organização & Praticidade',
                    supplierName: 'Tropical Distribuidora / Importação Direta',
                    isActive: true,
                    showInStore: true,
                    material: 'Plástico / Acrílico',
                    dimensionsSize: '28cm x 9cm (Diâmetro x Altura)',
                    technicalSpecs: 'NCM: 3924.90.00 | Material: Acrílico PET Cristal BPA Free | Rotação 360° com esferas em inox.',
                    packagingType: 'Unidade' as const
                },
                {
                    code: 'ORG-BAM-02',
                    sku: 'SKU-ORG-BAM',
                    name: 'Caixa Organizadora com Tampa em Bambu Natural & Corpo Fosco',
                    description: 'Caixa organizadora modular com tampa em bambu natural ecológico e corpo em polipropileno fosco de alta durabilidade. Estética nórdica minimalista para closets, lavanderias, salas, quartos e home office.',
                    price: 79.90,
                    costPrice: 28.00,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 52,
                    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 20,
                    minStock: 4,
                    category: 'Organização & Praticidade',
                    supplierName: 'Tropical Distribuidora / Importação Direta',
                    isActive: true,
                    showInStore: true,
                    material: 'Madeira / Bambu e Plástico',
                    dimensionsSize: '30cm x 20cm x 15cm',
                    technicalSpecs: 'NCM: 3924.90.00 / 4421.99.00 | Tampa em Bambu Natural Tratado Antibacteriano | Corpo PP Fosco Resistente.',
                    packagingType: 'Unidade' as const
                },
                {
                    code: 'COZ-ESP-03',
                    sku: 'SKU-COZ-ESP',
                    name: 'Porta-Temperos Giratório Inox com 12 Frascos de Vidro Herméticos',
                    description: 'Suporte giratório em torre de aço inoxidável escovado com 12 frascos de vidro herméticos com dosadores duplos e tampas vedantes em inox. Sofisticação, ergonomia e praticidade para bancadas gourmet e cozinhas planejadas.',
                    price: 129.90,
                    costPrice: 48.00,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 50,
                    imageUrl: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 18,
                    minStock: 3,
                    category: 'Cozinha Contemporânea & Mesa Posta',
                    supplierName: 'Tropical Distribuidora / Importação Direta',
                    isActive: true,
                    showInStore: true,
                    material: 'Metal / Inox e Vidro',
                    dimensionsSize: '22cm x 18cm (Torre) | 12 Frascos de 100ml',
                    technicalSpecs: 'NCM: 7323.93.00 | Estrutura em Aço Inox 430 Escovado | 12 Potes de Vidro Borossilicato.',
                    packagingType: 'Unidade' as const
                },
                {
                    code: 'COZ-SPR-04',
                    sku: 'SKU-COZ-SPR',
                    name: 'Pulverizador / Spray Dosador para Azeite e Vinagre em Vidro com Bico Inox',
                    description: 'Borrifador dosador gourmet em vidro reforçado com tampa protetora e gatilho em aço inoxidável. Proporciona névoa ultrafina e homogênea de azeite para Air Fryer, saladas, carnes e grelhados sem desperdício.',
                    price: 39.90,
                    costPrice: 14.00,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 58,
                    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 45,
                    minStock: 10,
                    category: 'Cozinha Contemporânea & Mesa Posta',
                    supplierName: 'Tropical Distribuidora / Importação Direta',
                    isActive: true,
                    showInStore: true,
                    material: 'Vidro e Metal / Inox',
                    capacityLiters: '200ml',
                    dimensionsSize: '18cm x 4cm (200ml)',
                    technicalSpecs: 'NCM: 7013.49.00 | Vidro Transparente Graduado com Bico Pressurizador Anti-Entupimento.',
                    packagingType: 'Unidade' as const
                },
                {
                    code: 'ILU-TCH-05',
                    sku: 'SKU-ILU-TCH',
                    name: 'Luminária de Mesa Touch Sem Fio Recarregável Minimalista',
                    description: 'Luminária portátil contemporânea de mesa em corpo de alumínio usinado. Bateria recarregável via USB-C, acionamento touch com 3 temperaturas de cor (3000K, 4500K e 6500K) e dimerização contínua.',
                    price: 109.90,
                    costPrice: 38.00,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 54,
                    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 22,
                    minStock: 4,
                    category: 'Iluminação Decorativa & Smart Light',
                    supplierName: 'Tropical Distribuidora / Importação Direta',
                    isActive: true,
                    showInStore: true,
                    material: 'Alumínio / Metal',
                    voltage: 'Bivolt (110V/220V)',
                    dimensionsSize: '38cm x 11cm',
                    technicalSpecs: 'NCM: 9405.21.00 | Bateria 5200mAh (até 16h) | Recarga USB Tipo-C | Potência 3.5W LED.',
                    packagingType: 'Unidade' as const
                },
                {
                    code: 'ILU-BAR-06',
                    sku: 'SKU-ILU-BAR',
                    name: 'Barra de Luz LED com Sensor de Presença e Fixação Magnética USB',
                    description: 'Barra ultrafina de iluminação LED inteligente com sensor infravermelho de movimento (PIR) e fotocélula integrada. Fixação magnética sem fios e sem furos com fita 3M. Bateria recarregável USB para closets e armários.',
                    price: 49.90,
                    costPrice: 18.00,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 56,
                    imageUrl: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 35,
                    minStock: 6,
                    category: 'Iluminação Decorativa & Smart Light',
                    supplierName: 'Tropical Distribuidora / Importação Direta',
                    isActive: true,
                    showInStore: true,
                    material: 'Alumínio e Plástico',
                    voltage: 'Bivolt (110V/220V)',
                    dimensionsSize: '30cm x 4cm x 0.9cm (Ultrafina)',
                    technicalSpecs: 'NCM: 9405.42.00 | Sensor PIR alcance 3m/120° | Bateria Lítio 1200mAh Recarregável USB.',
                    packagingType: 'Unidade' as const
                },
                {
                    code: 'BAN-LUX-07',
                    sku: 'SKU-BAN-LUX',
                    name: 'Kit Lavabo Luxo em Vidro Canelado com Válvula Pump Matte',
                    description: 'Conjunto premium para lavabo e banheiro composto por porta-sabonete líquido dispenser em vidro canelado espesso com válvula pump metálica preta fosca, porta-escovas/difusor e bandeja suporte espelhada.',
                    price: 119.90,
                    costPrice: 44.00,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 52,
                    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 16,
                    minStock: 3,
                    category: 'Banheiro, Lavabo & Spa Residencial',
                    supplierName: 'Tropical Distribuidora / Importação Direta',
                    isActive: true,
                    showInStore: true,
                    material: 'Vidro e Metal / Inox',
                    dimensionsSize: 'Kit 3 Peças (Dispenser 350ml, Porta-Escovas e Bandeja)',
                    technicalSpecs: 'NCM: 7013.99.00 / 6912.00.00 | Vidro Canelado Âmbar/Fumê Pesado com Válvula Anticorrosiva.',
                    packagingType: 'Caixa' as const
                },
                {
                    code: 'BAN-TOA-08',
                    sku: 'SKU-BAN-TOA',
                    name: 'Porta-Toalhas e Suportes de Box em Alumínio Espacial Autoadesivo',
                    description: 'Porta-toalhas duplo e prateleira organizadora de box fabricados em liga de alumínio espacial anticorrosivo com pintura eletrostática preta fosca. Fixação autoadesiva de ultra aderência sem furos na parede.',
                    price: 54.90,
                    costPrice: 20.00,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 56,
                    imageUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 30,
                    minStock: 5,
                    category: 'Banheiro, Lavabo & Spa Residencial',
                    supplierName: 'Tropical Distribuidora / Importação Direta',
                    isActive: true,
                    showInStore: true,
                    material: 'Alumínio',
                    dimensionsSize: '50cm x 12cm x 6cm',
                    technicalSpecs: 'NCM: 7615.10.00 | Alumínio Espacial Inoxidável | Suporta até 10kg com Adesivo Estrutural.',
                    packagingType: 'Unidade' as const
                },
                {
                    code: 'DEC-DIF-09',
                    sku: 'SKU-DEC-DIF',
                    name: 'Difusor & Umidificador Ultrassônico de Aromas Efeito Chama de Fogo',
                    description: 'Aromatizador e umidificador ultrassônico de ambientes com tecnologia LED que projeta uma névoa iluminada simulando o visual de chamas de lareira. Compatível com essências e óleos aromáticos com desligamento automático.',
                    price: 129.90,
                    costPrice: 45.00,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 54,
                    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 15,
                    minStock: 3,
                    category: 'Decoração, Aromas & Estilo de Vida',
                    supplierName: 'Tropical Distribuidora / Importação Direta',
                    isActive: true,
                    showInStore: true,
                    material: 'Plástico',
                    voltage: 'Bivolt (110V/220V)',
                    capacityLiters: '200ml',
                    dimensionsSize: '17cm x 10cm x 7.5cm',
                    technicalSpecs: 'NCM: 8509.80.90 | Difusão Ultrassônica Silenciosa (<30dB) | Luz LED Efeito Chama | Alimentação USB-C.',
                    packagingType: 'Unidade' as const
                },
                {
                    code: 'DEC-VAS-10',
                    sku: 'SKU-DEC-VAS',
                    name: 'Vaso Decorativo em Cerâmica com Textura Orgânica & Design Nórdico',
                    description: 'Vaso decorativo contemporâneo em cerâmica artesanal fosca com textura orgânica e formato curvilíneo abstrato estilo Japandi / Nórdico. Peça escultural de destaque para salas e aparadores.',
                    price: 79.90,
                    costPrice: 28.00,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 55,
                    imageUrl: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 18,
                    minStock: 3,
                    category: 'Decoração, Aromas & Estilo de Vida',
                    supplierName: 'Tropical Distribuidora / Importação Direta',
                    isActive: true,
                    showInStore: true,
                    material: 'Cerâmica',
                    dimensionsSize: '22cm x 15cm x 6cm',
                    technicalSpecs: 'NCM: 6913.90.00 | Cerâmica Esmaltada Fosca Texturizada com Acabamento Artesanal.',
                    packagingType: 'Unidade' as const
                }
            ];

            let addedCount = 0;
            const existingCodes = products.map(p => p.code).filter(Boolean);

            for (const item of strategicList) {
                if (!existingCodes.includes(item.code)) {
                    await createDocument('products', {
                        ...item,
                        isImported: true,
                        importBatchId: 'batch_tropical_top10',
                        importBatchName: 'Lote 10 Campeões (Tropical)',
                        importedAt: new Date().toISOString()
                    });
                    addedCount++;
                }
            }

            if (addedCount > 0) {
                showFeedback('success', `Sucesso! ${addedCount} novos produtos estratégicos dos 5 departamentos foram inseridos no banco de dados.`);
            } else {
                showFeedback('success', 'Os 10 produtos estratégicos já constam no banco de dados Firestore.');
            }
        } catch (err: any) {
            console.error('Erro ao cadastrar produtos estratégicos:', err);
            showFeedback('error', 'Erro ao cadastrar produtos: ' + (err.message || 'Falha no banco'));
        } finally {
            setIsSeedingStrategic(false);
        }
    };

    const handleSeedSamsClubProducts = async () => {
        setIsSeedingSamsClub(true);
        try {
            const samsClubList = [
                {
                    code: 'SC-JEEP-1200',
                    sku: 'SKU-SC-CP1200',
                    name: 'Copo Térmico Jeep com Canudo e Alça Ergonômica 1200ml',
                    description: 'Copo térmico em aço inoxidável com parede dupla e isolamento a vácuo oficial Jeep. Capacidade de 1200ml, tampa multifuncional hermética com bocal e canudo em inox, alça ergonômica e base compatível com porta-copos veiculares. Mantém bebidas geladas por até 12 horas e quentes por até 7 horas.',
                    price: 149.90,
                    costPrice: 89.98,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 40,
                    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 15,
                    minStock: 2,
                    category: 'Cozinha Contemporânea & Mesa Posta',
                    supplierName: 'Sam\'s Club (Pampulha) / Oficial Jeep',
                    isActive: true,
                    showInStore: true,
                    material: 'Aço Inoxidável 18/8 e Silicone BPA Free',
                    capacityLiters: '1200ml (1.2L)',
                    dimensionsSize: '27cm x 10cm x 10cm',
                    technicalSpecs: 'NCM: 9617.00.10 | Isolamento Térmico a Vácuo Parede Dupla | Bocal com canudo inox e tampa vedante.',
                    packagingType: 'Unidade' as const
                },
                {
                    code: 'SC-GAR-JEEP',
                    sku: 'SKU-SC-GT1000',
                    name: 'Garrafa Térmica Jeep Adventure 1000ml Aço Inox Vácuo',
                    description: 'Garrafa térmica em aço inox 18/8 com isolamento térmico a vácuo de alta performance licenciada Jeep. Tampa com alça de transporte reforçada, bico dosador e vedação 100% estanque anti-vazamento. Conserva líquidos frios por até 24h e quentes por até 12h.',
                    price: 299.90,
                    costPrice: 199.98,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 34,
                    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 12,
                    minStock: 2,
                    category: 'Cozinha Contemporânea & Mesa Posta',
                    supplierName: 'Sam\'s Club (Pampulha) / Oficial Jeep',
                    isActive: true,
                    showInStore: true,
                    material: 'Aço Inox 304 e Polipropileno Livre de BPA',
                    capacityLiters: '1000ml (1 Litro)',
                    dimensionsSize: '31cm x 8.5cm',
                    technicalSpecs: 'NCM: 9617.00.10 | Aço Inox 304 de Grau Alimentício | Retenção Térmica Extrema com Tampa Rosqueável.',
                    packagingType: 'Unidade' as const
                },
                {
                    code: 'SC-MM-FRP3',
                    sku: 'SKU-SC-FRP3',
                    name: 'Conjunto Café French Press Prensa Francesa Member\'s Mark 3 Peças',
                    description: 'Kit sofisticado de café com Prensa Francesa (French Press) em vidro borossilicato resistente a choque térmico com estrutura em inox e dois copos/canecas de parede dupla. Extrai os óleos essenciais do café com crema densa e aroma marcante.',
                    price: 239.90,
                    costPrice: 149.98,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 38,
                    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 10,
                    minStock: 2,
                    category: 'Cozinha Contemporânea & Mesa Posta',
                    supplierName: 'Sam\'s Club (Pampulha) / Member\'s Mark',
                    isActive: true,
                    showInStore: true,
                    material: 'Vidro Borossilicato e Aço Inox',
                    dimensionsSize: 'Kit 3 Peças (1 Cafeteira 1L + 2 Canecas Dupla Parede 250ml)',
                    technicalSpecs: 'NCM: 7013.37.00 | Prensa Francesa com Êmbolo em Aço Inox e Filtro Micro-Mesh | Copos Isolados.',
                    packagingType: 'Caixa' as const
                },
                {
                    code: 'SC-MM-TERM2',
                    sku: 'SKU-SC-TERM2',
                    name: 'Conjunto Térmico para Café com Garrafa e Bule de Mesa 2 Peças',
                    description: 'Conjunto térmico contemporâneo com garrafa térmica de acionamento por botão de pressão e bule de mesa em acabamento acetinado com cabo ergonômico amadeirado/soft touch. Excelente retenção térmica com vedação hermética.',
                    price: 229.90,
                    costPrice: 139.99,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 39,
                    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 14,
                    minStock: 2,
                    category: 'Cozinha Contemporânea & Mesa Posta',
                    supplierName: 'Sam\'s Club (Pampulha) / Importado',
                    isActive: true,
                    showInStore: true,
                    material: 'Ampola de Vidro Térmica e Polímero Fosco Premium',
                    capacityLiters: '1000ml + 650ml',
                    dimensionsSize: 'Kit 2 Peças (Garrafa 1.0L + Bule 650ml)',
                    technicalSpecs: 'NCM: 9617.00.10 | Ampola de Vidro com Conservação Térmica de até 12 Horas | Bico Direcionador Anti-Gota.',
                    packagingType: 'Caixa' as const
                },
                {
                    code: 'SC-TOG-TAL30',
                    sku: 'SKU-SC-TAL30',
                    name: 'Conjunto de Faqueiro / Talheres Drop Tognana em Aço Inox 30 Peças',
                    description: 'Faqueiro italiano Tognana Drop com 30 peças fabricadas em aço inoxidável polido de alta espessura e acabamento espelhado. Composto por facas de corte preciso, garfos de mesa, colheres de sopa, garfos e colheres de sobremesa. Estética refinada e alta durabilidade.',
                    price: 219.90,
                    costPrice: 129.98,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 41,
                    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 12,
                    minStock: 2,
                    category: 'Cozinha Contemporânea & Mesa Posta',
                    supplierName: 'Sam\'s Club (Pampulha) / Tognana Itália',
                    isActive: true,
                    showInStore: true,
                    material: 'Aço Inoxidável Polido Extra Brilho',
                    dimensionsSize: 'Serviço para 6 Pessoas (30 Peças)',
                    technicalSpecs: 'NCM: 8215.20.00 | Aço Inox 18/0 com Resistência a Riscos e Lavadora de Louças | Design Italiano Tognana.',
                    packagingType: 'Caixa' as const
                },
                {
                    code: 'SC-MM-LIX60',
                    sku: 'SKU-SC-LIX60',
                    name: 'Lixeira Seletiva Dupla Dual Korb 60L em Aço Inox Anti-Digital Member\'s Mark',
                    description: 'Lixeira dupla de pedal com 2 compartimentos independentes de 30L (total 60L) para coleta seletiva e separação de recicláveis. Corpo em aço inoxidável escovado com tratamento anti-impressão digital (fingerprint resistant) e fechamento suave e silencioso Soft-Close.',
                    price: 799.90,
                    costPrice: 539.98,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 33,
                    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 8,
                    minStock: 1,
                    category: 'Organização & Praticidade',
                    supplierName: 'Sam\'s Club (Pampulha) / Member\'s Mark',
                    isActive: true,
                    showInStore: true,
                    material: 'Aço Inox 430 Escovado e Baldes Internos em PP',
                    capacityLiters: '60 Litros (2 x 30L)',
                    dimensionsSize: '65cm x 50cm x 33cm',
                    technicalSpecs: 'NCM: 7323.99.00 | Pedal de Aço Reforçado | Sistema de Amortecimento Soft-Close | Tratamento Anti-Manchas.',
                    packagingType: 'Caixa' as const
                },
                {
                    code: 'SC-MM-CEST3',
                    sku: 'SKU-SC-CEST3',
                    name: 'Conjunto de Cestos Decorativos e Organizadores em Palha Natural Member\'s Mark',
                    description: 'Kit com cestos organizadores tecidos à mão em fibra natural de palha e folhas trançadas com estrutura reforçada e alças laterais integradas. Estilo Boho Chic / Rústico Orgânico para salas, lavabos, quartos, mantas e plantas.',
                    price: 399.90,
                    costPrice: 269.98,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 33,
                    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 10,
                    minStock: 2,
                    category: 'Organização & Praticidade',
                    supplierName: 'Sam\'s Club (Pampulha) / Member\'s Mark',
                    isActive: true,
                    showInStore: true,
                    material: 'Fibras Naturais / Palha Trançada Artesanal',
                    dimensionsSize: 'Kit com 2 Cestos Médios / Grandes com Alças',
                    technicalSpecs: 'NCM: 4602.19.00 | Palha e Folhas Naturais Tratadas Anti-Mofo | Estrutura Rígida Trançada à Mão.',
                    packagingType: 'Caixa' as const
                },
                {
                    code: 'SC-OU-LUM-PR',
                    sku: 'SKU-SC-LUM-PR',
                    name: 'Kit de Cestos Organizadores Multiuso Lume Preto Fosco - Ou',
                    description: 'Conjunto de cestos organizadores Lume na cor preto fosco com design vazado contemporâneo. Ideais para bancadas, armários, closets, lavanderias e despensas. Práticos, modulares e com empilhamento inteligente.',
                    price: 139.90,
                    costPrice: 79.97,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 43,
                    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 20,
                    minStock: 3,
                    category: 'Organização & Praticidade',
                    supplierName: 'Sam\'s Club (Pampulha) / Ou Martiplast',
                    isActive: true,
                    showInStore: true,
                    material: 'Polipropileno (PP) Fosco de Alta Resistência',
                    dimensionsSize: 'Conjunto Modular com Múltiplas Peças',
                    technicalSpecs: 'NCM: 3924.90.00 | Design com Ventilação Linear | Material 100% Reciclável e Livre de BPA.',
                    packagingType: 'Kit' as const
                },
                {
                    code: 'SC-OU-LUM-VD',
                    sku: 'SKU-SC-LUM-VD',
                    name: 'Kit de Cestos Organizadores Multiuso Lume Verde Musgo Botanical - Ou',
                    description: 'Conjunto de cestos organizadores Lume na elegante tonalidade Verde Musgo Botanical. Design moderno com laterais ventiladas e pegas ergonômicas para compor decorações contemporâneas, organização de banheiros e escritórios.',
                    price: 139.90,
                    costPrice: 79.97,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 43,
                    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 20,
                    minStock: 3,
                    category: 'Organização & Praticidade',
                    supplierName: 'Sam\'s Club (Pampulha) / Ou Martiplast',
                    isActive: true,
                    showInStore: true,
                    material: 'Polipropileno (PP) Fosco Premium',
                    dimensionsSize: 'Conjunto Modular com Múltiplas Peças',
                    technicalSpecs: 'NCM: 3924.90.00 | Cor Verde Musgo Fosco | Encaixe Modular para Otimização de Armários e Gavetas.',
                    packagingType: 'Kit' as const
                },
                {
                    code: 'SC-BOH-WHS6',
                    sku: 'SKU-SC-BOH-WHS6',
                    name: 'Conjunto de Copos para Whisky Lauros Crystal Bohemia 320ml 6 Peças',
                    description: 'Jogo com 6 copos baixos para whisky e drinks On The Rocks lapidados em puro Cristal de Titânio Ecológico Bohemia (Origem República Tcheca). Modelo Lauros com brilho excepcional, fundo pesado e acabamento em relevo geométrico de alta refração da luz.',
                    price: 179.90,
                    costPrice: 99.98,
                    icmsPercent: 18,
                    ipiPercent: 5,
                    pisPercent: 1.65,
                    cofinsPercent: 7.60,
                    profitMarginPercent: 44,
                    imageUrl: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&q=80&w=800',
                    gallery: [
                        'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800'
                    ],
                    stock: 15,
                    minStock: 2,
                    category: 'Cozinha Contemporânea & Mesa Posta',
                    supplierName: 'Sam\'s Club (Pampulha) / Crystal Bohemia',
                    isActive: true,
                    showInStore: true,
                    material: 'Cristal de Titânio Ecológico Sem Chumbo Bohemia',
                    capacityLiters: '320ml cada (6 Unidades)',
                    dimensionsSize: 'Kit 6 Copos (9.5cm Altura x 8.5cm Diâmetro)',
                    technicalSpecs: 'NCM: 7013.28.00 | Cristal Ecológico com Titânio (Maior Resistência a Lascas e Impactos) | Fabricado na República Tcheca.',
                    packagingType: 'Caixa' as const
                }
            ];

            let addedCount = 0;
            const existingCodes = products.map(p => p.code).filter(Boolean);

            for (const item of samsClubList) {
                if (!existingCodes.includes(item.code)) {
                    await createDocument('products', {
                        ...item,
                        isImported: true,
                        importBatchId: 'batch_sams_club_pampulha',
                        importBatchName: "Lote Sam's Club (Pampulha)",
                        importedAt: new Date().toISOString()
                    });
                    addedCount++;
                }
            }

            if (addedCount > 0) {
                showFeedback('success', `Sucesso! ${addedCount} produtos da Coleção Sam's Club (Pampulha) foram cadastrados com sucesso.`);
            } else {
                showFeedback('success', 'Os 10 produtos do Sam\'s Club já constam cadastrados no banco de dados Firestore.');
            }
        } catch (err: any) {
            console.error('Erro ao cadastrar produtos Sam\'s Club:', err);
            showFeedback('error', 'Erro ao cadastrar produtos: ' + (err.message || 'Falha no banco'));
        } finally {
            setIsSeedingSamsClub(false);
        }
    };

    // Sincroniza produtos oficiais de uma tabela específica (Pampulha, Famastil, Foxlux, Tramontina)
    const handleSyncCatalogTable = async (tableKey: ProductTableKey) => {
        setIsSyncingTable(tableKey);
        try {
            const targetList = tableKey === 'all' 
                ? allReferenceCatalogs.all
                : (allReferenceCatalogs[tableKey] || []);

            if (targetList.length === 0) {
                showFeedback('error', 'Nenhum item encontrado no catálogo de referência.');
                return;
            }

            const existingCodes = new Set(
                products
                    .map(p => (p.code || '').trim().toUpperCase())
                    .filter(Boolean)
            );
            let addedCount = 0;

            for (const item of targetList) {
                const itemCode = (item.code || '').trim().toUpperCase();
                if (!itemCode || !existingCodes.has(itemCode)) {
                    const payload: Partial<Product> = {
                        ...item,
                        stock: item.stock || 0,
                        isActive: item.isActive !== undefined ? item.isActive : true,
                        showInStore: item.showInStore !== undefined ? item.showInStore : false,
                        imageUrl: item.imageUrl || '/ponto_chave_logo.jpg',
                        isImported: true,
                        importBatchId: item.importBatchId || `batch_${tableKey}_tabela_oficial`,
                        importBatchName: item.importBatchName || `Tabela Oficial ${CATALOG_TABLES[tableKey]?.label || tableKey}`,
                        importedAt: new Date().toISOString()
                    };
                    await createDocument('products', payload);
                    if (itemCode) existingCodes.add(itemCode);
                    addedCount++;
                }
            }

            const tableName = CATALOG_TABLES[tableKey]?.label || 'Tabela';
            if (addedCount > 0) {
                showFeedback('success', `Sucesso! ${addedCount} produtos da ${tableName} foram sincronizados no banco de dados com sucesso.`);
            } else {
                showFeedback('success', `Todos os produtos da ${tableName} já constam cadastrados no banco de dados Firestore.`);
            }
        } catch (err: any) {
            console.error('Erro ao sincronizar tabela:', err);
            showFeedback('error', 'Erro ao sincronizar produtos da tabela: ' + (err.message || 'Falha no banco'));
        } finally {
            setIsSyncingTable(null);
        }
    };

    // Contadores para os filtros de vitrine
    const storefrontCounts = useMemo(() => {
        let inStore = 0;
        let hidden = 0;
        let issues = 0;
        for (const p of products) {
            const eligibility = getProductSalesEligibility(p);
            if (eligibility.isEligible) {
                inStore++;
            } else if (eligibility.badgeVariant === 'hidden') {
                hidden++;
            } else {
                issues++;
            }
        }
        return { total: products.length, inStore, hidden, issues };
    }, [products]);

    // Mapa memoizado de chaves de tabela (O(1) para cada produto, evitando repetição de checagens de strings)
    const productTableKeyMap = useMemo(() => {
        const map = new Map<string, ProductTableKey>();
        for (let i = 0; i < products.length; i++) {
            const p = products[i];
            map.set(p.id, getProductTableKey(p));
        }
        return map;
    }, [products]);

    // Contagem de categorias memoizada em 1 único loop O(N) em vez de N * M no corpo do JSX
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { Todos: products.length };
        for (let i = 0; i < products.length; i++) {
            const cat = products[i].category?.trim();
            if (cat) {
                counts[cat] = (counts[cat] || 0) + 1;
            }
        }
        return counts;
    }, [products]);

    // Set para checagem instantânea O(1) de seleção de produtos na tabela
    const selectedProductIdsSet = useMemo(() => new Set(selectedProductIds), [selectedProductIds]);

    // Contadores por Tabela Oficial de Fornecedores
    const tableCounts = useMemo(() => {
        let promo = 0;
        let kits = 0;
        let pampulha = 0;
        let famastil = 0;
        let foxlux = 0;
        let tramontina = 0;
        let other = 0;

        for (let i = 0; i < products.length; i++) {
            const p = products[i];
            if (p.isPromo) promo++;
            if (isKitProduct(p)) kits++;

            const key = productTableKeyMap.get(p.id) || 'other';
            if (key === 'pampulha') pampulha++;
            else if (key === 'famastil') famastil++;
            else if (key === 'foxlux') foxlux++;
            else if (key === 'tramontina') tramontina++;
            else other++;
        }

        return {
            all: products.length,
            promo,
            kits,
            pampulha,
            famastil,
            foxlux,
            tramontina,
            other
        };
    }, [products, productTableKeyMap]);

    // Tokens de busca indexados para velocidade máxima
    const searchTokens = useMemo(() => {
        return searchTerm.trim().toLowerCase().split(/\s+/).filter(Boolean);
    }, [searchTerm]);

    // Filtragem de alta performance combinando Tabela, Categoria, Vitrine e Tokens
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            // 1. Filtro por Tabela Oficial de Fornecedor / Aba Promoção / Aba Kits
            if (selectedTable === 'promo') {
                if (!p.isPromo) return false;
            } else if (selectedTable === 'kits') {
                if (!isKitProduct(p)) return false;
            } else if (selectedTable !== 'all') {
                const tableKey = productTableKeyMap.get(p.id) || 'other';
                if (tableKey !== selectedTable) return false;
            }

            // 2. Filtro por Categoria
            if (selectedCategory !== 'Todos' && p.category !== selectedCategory) {
                return false;
            }

            // 3. Filtro por Status da Vitrine
            if (storefrontFilter !== 'all') {
                const eligibility = getProductSalesEligibility(p);
                if (storefrontFilter === 'in_store' && !eligibility.isEligible) return false;
                if (storefrontFilter === 'hidden_stock' && eligibility.badgeVariant !== 'hidden') return false;
                if (storefrontFilter === 'issues' && eligibility.badgeVariant !== 'draft' && eligibility.badgeVariant !== 'blocked') return false;
            }

            // 4. Busca rápida por tokens
            if (searchTokens.length > 0 && !fastSearchProduct(p, searchTokens)) {
                return false;
            }

            return true;
        });
    }, [products, selectedTable, selectedCategory, storefrontFilter, searchTokens, productTableKeyMap]);

    // Sempre que os filtros mudarem, reseta para a primeira página sem re-render desnecessário
    useEffect(() => {
        setCurrentPage(prev => (prev === 1 ? prev : 1));
    }, [selectedTable, selectedCategory, storefrontFilter, searchTerm, itemsPerPage]);

    // Itens fatiados para renderização ultra-rápida (Zero Lag)
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
    const paginatedProducts = useMemo(() => {
        if (itemsPerPage >= 9999) return filteredProducts;
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProducts, currentPage, itemsPerPage]);

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            {/* Cabeçalho */}
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold">
                            Catálogo & Banco de Dados
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                            {products.length} itens cadastrados
                        </span>
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-brand-dark flex items-center gap-3">
                        <Package className="text-brand-primary" size={32} />
                        Gestão de Estoque & Produtos
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Cadastre, importe em lote, edite e acompanhe os produtos, códigos e notas fiscais.
                    </p>
                </div>
                
                <div className="flex items-center flex-wrap gap-3">
                    {/* Botão de Padronizar Imagens com Logo Ponto Chave do Lar */}
                    {products.length > 0 && (
                        <button
                            onClick={handleReplaceYarnImagesWithLogo}
                            disabled={isBulkProcessing}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 px-4 py-3.5 rounded-2xl flex items-center justify-center space-x-2 font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                            title="Substituir imagens antigas de novelo/tricô de todos os produtos pelo Logo Oficial Ponto Chave do Lar"
                        >
                            <Sparkles size={18} className="text-amber-700" />
                            <span>Substituir Novelo por Logo da Loja</span>
                        </button>
                    )}

                    {/* Botão Limpar Catálogo / Excluir Todos */}
                    {products.length > 0 && (
                        <button
                            onClick={handleDeleteAllProducts}
                            disabled={isBulkProcessing}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 px-4 py-3.5 rounded-2xl flex items-center justify-center space-x-2 font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                            title="Excluir todos os produtos cadastrados no banco de dados para iniciar uma importação limpa"
                        >
                            <Trash2 size={18} className="text-rose-600" />
                            <span>Limpar Catálogo ({products.length})</span>
                        </button>
                    )}

                    {/* Botão de Importar Produtos (PDF / Lote) */}
                    <button 
                        onClick={() => setIsImportModalOpen(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-3.5 rounded-2xl flex items-center justify-center space-x-2 font-bold transition-all shadow-md hover:shadow-lg active:scale-95 border border-amber-400"
                        title="Importar catálogo via PDF, planilhas CSV ou colando lista de produtos"
                    >
                        <Upload size={19} />
                        <span>Importar Produtos (PDF / Lote)</span>
                    </button>

                    {/* Botão Montar Novo Kit */}
                    <button 
                        onClick={handleOpenCreateKit}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-3.5 rounded-2xl flex items-center justify-center space-x-2 font-bold transition-all shadow-md hover:shadow-lg active:scale-95 border border-purple-400/40 cursor-pointer"
                        title="Montar e cadastrar Kits de Pedreiro, Dona de Casa, Eletricista ou Utilidades com itens inclusos"
                    >
                        <Boxes size={20} className="text-yellow-300" />
                        <span>Montar Novo Kit</span>
                    </button>

                    {/* Botão Novo Produto */}
                    <button 
                        onClick={handleOpenCreate}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center space-x-2 font-bold transition-all shadow-md active:scale-95"
                    >
                        <Plus size={20} className="text-amber-400" />
                        <span>Novo Produto Técnico</span>
                    </button>
                </div>
            </header>

            {/* Banner de Feedback */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mb-6 p-4 rounded-2xl flex items-center justify-between border ${
                            feedback.type === 'success' 
                                ? 'bg-green-50 text-green-800 border-green-200' 
                                : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            {feedback.type === 'success' ? <Check size={20} className="text-green-600" /> : <AlertTriangle size={20} className="text-red-600" />}
                            <span className="font-medium text-sm">{feedback.message}</span>
                        </div>
                        <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Cadastro / Edição de Produtos Ultra-Rápido & Ficha Técnica */}
            {isAdding && (
                <ProductFormModal 
                    isOpen={isAdding}
                    onClose={handleCloseForm}
                    onSave={handleSaveProduct}
                    editingProduct={editingProduct}
                    existingProducts={products}
                    onOpenMediaBank={(target) => {
                        setMediaBankTarget(target);
                        setIsMediaBankModalOpen(true);
                    }}
                    onOpenEnrichWithAI={(product) => {
                        setEnrichProduct(product);
                    }}
                    onOpenRestock={(product) => {
                        setRestockProduct(product);
                    }}
                    isSaving={isSaving}
                    pendingMediaAsset={pendingMediaAsset}
                    onClearPendingMedia={() => setPendingMediaAsset(null)}
                />
            )}

            {/* Barra de Ações em Lote (Quando itens estão selecionados) */}
            <AnimatePresence>
                {selectedProductIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800"
                    >
                        <div className="flex items-center space-x-3">
                            <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center shadow-xs">
                                {selectedProductIds.length}
                            </span>
                            <div>
                                <span className="font-bold text-sm text-white">produtos selecionados</span>
                                <p className="text-xs text-slate-300">Escolha uma ação em massa para aplicar ao catálogo:</p>
                            </div>
                        </div>

                        <div className="flex items-center flex-wrap gap-2">
                            {/* Publicar na Vitrine em Lote */}
                            <button
                                onClick={() => handleBulkToggleStorefront(true)}
                                disabled={isBulkProcessing}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                                title="Exibir produtos selecionados na vitrine da loja principal para clientes"
                            >
                                <Eye size={14} />
                                <span>Publicar na Vitrine</span>
                            </button>

                            {/* Ocultar da Vitrine em Lote */}
                            <button
                                onClick={() => handleBulkToggleStorefront(false)}
                                disabled={isBulkProcessing}
                                className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                                title="Ocultar produtos selecionados da vitrine (permanecem no estoque interno)"
                            >
                                <Archive size={14} />
                                <span>Ocultar da Vitrine</span>
                            </button>

                            {/* Botão de Ativar em Lote */}
                            <button
                                onClick={() => handleBulkToggleActive(true)}
                                disabled={isBulkProcessing}
                                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                            >
                                <Check size={14} />
                                <span>Ativar</span>
                            </button>

                            {/* Botão de Pausar em Lote */}
                            <button
                                onClick={() => handleBulkToggleActive(false)}
                                disabled={isBulkProcessing}
                                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                            >
                                <AlertOctagon size={14} />
                                <span>Pausar</span>
                            </button>

                            {/* Botão de Mudar Categoria */}
                            <button
                                onClick={() => setBulkCategoryModalOpen(true)}
                                disabled={isBulkProcessing}
                                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                            >
                                <FolderKanban size={14} />
                                <span>Mudar Categoria</span>
                            </button>

                            {/* Botão de Aplicar Logo Oficial nos Selecionados */}
                            <button
                                onClick={handleBulkApplyOfficialLogo}
                                disabled={isBulkProcessing}
                                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                                title="Aplicar o Logo Oficial Ponto Chave do Lar em todos os produtos selecionados"
                            >
                                <Sparkles size={14} className="text-slate-950" />
                                <span>Aplicar Logo da Loja</span>
                            </button>

                            {/* Botão de Excluir em Lote */}
                            <button
                                onClick={handleBulkDeleteProducts}
                                disabled={isBulkProcessing}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                                title="Excluir produtos selecionados do banco de dados"
                            >
                                <Trash2 size={15} />
                                <span>Excluir ({selectedProductIds.length})</span>
                            </button>

                            {/* Limpar Seleção */}
                            <button
                                onClick={() => setSelectedProductIds([])}
                                className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-all ml-1"
                                title="Desmarcar todos"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SELETOR DE TABELA OFICIAL DE FORNECEDORES (PAMPULHA, FAMASTIL, FOXLUX, TRAMONTINA) */}
            <div className="bg-slate-950 p-5 rounded-3xl text-white shadow-xl border border-slate-800 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                            <Table size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-bold text-white">
                                    Consultar por Tabela de Fornecedor
                                </h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                                    Zero Lag • Busca Rápida
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Isole a consulta por catálogo específico (Pampulha, Famastil, Foxlux, Tramontina) para agilizar o atendimento.
                            </p>
                        </div>
                    </div>

                    {/* Ações Rápidas de Sincronização e Importação */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsImportModalOpen(true)}
                            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                            title="Abrir Central de Importação de Catálogos"
                        >
                            <Upload size={15} />
                            <span>Importar / Sincronizar Tabelas</span>
                        </button>
                    </div>
                </div>

                {/* Grid de Tabelas Oficiais */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                    {/* Todas */}
                    <button
                        type="button"
                        onClick={() => handleSelectTable('all')}
                        className={`p-3 rounded-2xl text-left transition-all flex flex-col justify-between border cursor-pointer ${
                            selectedTable === 'all'
                                ? 'bg-white text-slate-950 border-white shadow-lg ring-2 ring-amber-400'
                                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-[11px] uppercase tracking-wider font-extrabold">Todas</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${selectedTable === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-800 text-slate-300'}`}>
                                {tableCounts.all}
                            </span>
                        </div>
                        <span className={`text-[11px] truncate font-medium ${selectedTable === 'all' ? 'text-slate-600' : 'text-slate-400'}`}>
                            Acervo Geral
                        </span>
                    </button>

                    {/* PROMOÇÃO (Aba antes de Kits) */}
                    <button
                        type="button"
                        onClick={() => handleSelectTable('promo')}
                        className={`p-3 rounded-2xl text-left transition-all flex flex-col justify-between border cursor-pointer relative overflow-hidden ${
                            selectedTable === 'promo'
                                ? 'bg-gradient-to-br from-red-600 to-amber-600 text-white border-red-400 shadow-xl ring-2 ring-red-400'
                                : 'bg-slate-900/90 text-red-400 border-red-900/40 hover:bg-red-950/40 hover:border-red-500'
                        }`}
                    >
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-[11px] uppercase tracking-wider font-black flex items-center gap-1">
                                <Flame size={14} className={selectedTable === 'promo' ? 'text-yellow-300 animate-pulse' : 'text-red-400'} />
                                Promoção
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${selectedTable === 'promo' ? 'bg-black/40 text-yellow-300' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                                {tableCounts.promo}
                            </span>
                        </div>
                        <span className={`text-[11px] truncate font-medium ${selectedTable === 'promo' ? 'text-yellow-100 font-bold' : 'text-red-300/80'}`}>
                            Ofertas & Queimas
                        </span>
                    </button>

                    {/* KITS & COMBOS (Aba dedicada a Kits Prontos) */}
                    <button
                        type="button"
                        onClick={() => handleSelectTable('kits')}
                        className={`p-3 rounded-2xl text-left transition-all flex flex-col justify-between border cursor-pointer relative overflow-hidden ${
                            selectedTable === 'kits'
                                ? 'bg-gradient-to-br from-purple-700 to-indigo-800 text-white border-purple-400 shadow-xl ring-2 ring-purple-400'
                                : 'bg-slate-900/90 text-purple-300 border-purple-900/40 hover:bg-purple-950/40 hover:border-purple-500'
                        }`}
                    >
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-[11px] uppercase tracking-wider font-black flex items-center gap-1">
                                <Boxes size={14} className={selectedTable === 'kits' ? 'text-yellow-300 animate-pulse' : 'text-purple-400'} />
                                Kits & Combos
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${selectedTable === 'kits' ? 'bg-black/40 text-yellow-300' : 'bg-purple-950 text-purple-300 border border-purple-800'}`}>
                                {tableCounts.kits}
                            </span>
                        </div>
                        <span className={`text-[11px] truncate font-medium ${selectedTable === 'kits' ? 'text-purple-100 font-bold' : 'text-purple-300/80'}`}>
                            Pedreiro, Lar, Elétrica
                        </span>
                    </button>

                    {/* Pampulha */}
                    <button
                        type="button"
                        onClick={() => handleSelectTable('pampulha')}
                        className={`p-3 rounded-2xl text-left transition-all flex flex-col justify-between border cursor-pointer ${
                            selectedTable === 'pampulha'
                                ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white border-orange-400 shadow-lg ring-2 ring-orange-400'
                                : 'bg-slate-900/90 text-orange-300 border-slate-800 hover:bg-orange-950/40 hover:border-orange-600'
                        }`}
                    >
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-[11px] uppercase tracking-wider font-extrabold flex items-center gap-1">
                                <Zap size={13} className={selectedTable === 'pampulha' ? 'text-white' : 'text-orange-400'} />
                                Pampulha
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${selectedTable === 'pampulha' ? 'bg-orange-950 text-white' : 'bg-slate-800 text-orange-300'}`}>
                                {tableCounts.pampulha}
                            </span>
                        </div>
                        <span className={`text-[11px] truncate font-medium ${selectedTable === 'pampulha' ? 'text-orange-100' : 'text-slate-400'}`}>
                            {tableCounts.pampulha > 0 ? 'Elétricos & Hidráulica' : '0 itens cadastrados'}
                        </span>
                    </button>

                    {/* Famastil */}
                    <button
                        type="button"
                        onClick={() => handleSelectTable('famastil')}
                        className={`p-3 rounded-2xl text-left transition-all flex flex-col justify-between border cursor-pointer ${
                            selectedTable === 'famastil'
                                ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 border-amber-400 shadow-lg ring-2 ring-amber-400'
                                : 'bg-slate-900/90 text-amber-300 border-slate-800 hover:bg-amber-950/40 hover:border-amber-600'
                        }`}
                    >
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-[11px] uppercase tracking-wider font-extrabold flex items-center gap-1">
                                <Wrench size={13} className={selectedTable === 'famastil' ? 'text-slate-950' : 'text-amber-400'} />
                                Famastil
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${selectedTable === 'famastil' ? 'bg-amber-950 text-white' : 'bg-slate-800 text-amber-300'}`}>
                                {tableCounts.famastil}
                            </span>
                        </div>
                        <span className={`text-[11px] truncate font-medium ${selectedTable === 'famastil' ? 'text-amber-950 font-bold' : 'text-slate-400'}`}>
                            Ferramentas Manuais
                        </span>
                    </button>

                    {/* Foxlux */}
                    <button
                        type="button"
                        onClick={() => handleSelectTable('foxlux')}
                        className={`p-3 rounded-2xl text-left transition-all flex flex-col justify-between border cursor-pointer ${
                            selectedTable === 'foxlux'
                                ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-950 border-yellow-300 shadow-lg ring-2 ring-yellow-400'
                                : 'bg-slate-900/90 text-yellow-300 border-slate-800 hover:bg-yellow-950/40 hover:border-yellow-600'
                        }`}
                    >
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-[11px] uppercase tracking-wider font-extrabold flex items-center gap-1">
                                <Lightbulb size={13} className={selectedTable === 'foxlux' ? 'text-slate-950' : 'text-yellow-400'} />
                                Foxlux
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${selectedTable === 'foxlux' ? 'bg-yellow-950 text-white' : 'bg-slate-800 text-yellow-300'}`}>
                                {tableCounts.foxlux}
                            </span>
                        </div>
                        <span className={`text-[11px] truncate font-medium ${selectedTable === 'foxlux' ? 'text-yellow-950 font-bold' : 'text-slate-400'}`}>
                            Iluminação & Sensores
                        </span>
                    </button>

                    {/* Tramontina */}
                    <button
                        type="button"
                        onClick={() => handleSelectTable('tramontina')}
                        className={`p-3 rounded-2xl text-left transition-all flex flex-col justify-between border cursor-pointer ${
                            selectedTable === 'tramontina'
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-400 shadow-lg ring-2 ring-blue-400'
                                : 'bg-slate-900/90 text-blue-300 border-slate-800 hover:bg-blue-950/40 hover:border-blue-600'
                        }`}
                    >
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-[11px] uppercase tracking-wider font-extrabold flex items-center gap-1">
                                <ShieldCheck size={13} className={selectedTable === 'tramontina' ? 'text-white' : 'text-blue-400'} />
                                Tramontina
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${selectedTable === 'tramontina' ? 'bg-blue-950 text-white' : 'bg-slate-800 text-blue-300'}`}>
                                {tableCounts.tramontina}
                            </span>
                        </div>
                        <span className={`text-[11px] truncate font-medium ${selectedTable === 'tramontina' ? 'text-blue-100' : 'text-slate-400'}`}>
                            Linha Liz & Disjuntores
                        </span>
                    </button>

                    {/* Outras Tabelas */}
                    <button
                        type="button"
                        onClick={() => handleSelectTable('other')}
                        className={`p-3 rounded-2xl text-left transition-all flex flex-col justify-between border cursor-pointer ${
                            selectedTable === 'other'
                                ? 'bg-slate-700 text-white border-slate-500 shadow-lg ring-2 ring-slate-400'
                                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-[11px] uppercase tracking-wider font-extrabold flex items-center gap-1">
                                <Package size={13} />
                                Outras
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${selectedTable === 'other' ? 'bg-slate-900 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                {tableCounts.other}
                            </span>
                        </div>
                        <span className="text-[11px] truncate text-slate-400 font-medium">
                            Marcas Avulsas
                        </span>
                    </button>
                </div>

                {/* Sub-barra de Gestão da Tabela Selecionada (Promoção / Excluir / Reimportar) */}
                {selectedTable !== 'all' && (
                    <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-400">
                                {CATALOG_TABLES[selectedTable]?.label || (selectedTable === 'promo' ? 'Produtos em Promoção' : selectedTable === 'kits' ? 'Kits & Combos Prontos' : selectedTable)}:
                            </span>
                            <span className="text-slate-300">
                                {tableCounts[selectedTable]} produto(s) {selectedTable === 'promo' ? 'em oferta ativa/agendada' : selectedTable === 'kits' ? 'kit(s) montados' : 'cadastrado(s) no banco de dados'}.
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            {selectedTable === 'promo' ? (
                                <button
                                    type="button"
                                    onClick={() => handleOpenPromoModal(null)}
                                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-extrabold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer border border-yellow-300/40"
                                    title="Incluir novo produto na lista de Promoções com data inicial e final"
                                >
                                    <Flame size={16} className="text-yellow-200" />
                                    <span>Incluir Item em Promoção</span>
                                </button>
                            ) : selectedTable === 'kits' ? (
                                <button
                                    type="button"
                                    onClick={handleOpenCreateKit}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer border border-purple-300/40"
                                    title="Montar e cadastrar um novo Kit de ferramentas ou utilidades"
                                >
                                    <Boxes size={16} className="text-yellow-300" />
                                    <span>Montar Novo Kit</span>
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsCostPriceAdjustmentModalOpen(true)}
                                        className="px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                        title="Atualizar e aplicar alteração do preço de custo por margem de índice percentual (%)"
                                    >
                                        <Calculator size={13} />
                                        <span>Reajustar Custo (%)</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsImportModalOpen(true)}
                                        className="px-3 py-1.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                        title="Importar novos itens em PDF ou Lote"
                                    >
                                        <Upload size={13} />
                                        <span>Importar Novos Itens</span>
                                    </button>

                                    {tableCounts[selectedTable] > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteTableProducts(selectedTable)}
                                            disabled={isBulkProcessing}
                                            className="px-3 py-1.5 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                            title={`Excluir todos os produtos da ${CATALOG_TABLES[selectedTable]?.label || selectedTable} para reimportar do zero`}
                                        >
                                            <Trash2 size={13} />
                                            <span>Excluir Todos ({tableCounts[selectedTable]}) para Reimportar</span>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Tabela e Filtros */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Filtros de Visibilidade da Vitrine e Categorias */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 space-y-4">
                    {/* Linha 1: Abas Rápidas de Vitrine vs Estoque */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center space-x-1.5 bg-gray-200/70 p-1 rounded-2xl">
                            <button
                                onClick={() => setStorefrontFilter('all')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    storefrontFilter === 'all'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-gray-600 hover:text-slate-900'
                                }`}
                            >
                                <span>Todos</span>
                                <span className="px-1.5 py-0.2 bg-gray-100 text-gray-700 rounded-full text-[10px]">
                                    {storefrontCounts.total}
                                </span>
                            </button>

                            <button
                                onClick={() => setStorefrontFilter('in_store')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    storefrontFilter === 'in_store'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'text-emerald-800 hover:bg-emerald-50'
                                }`}
                                title="Produtos visíveis e prontos para venda na página principal"
                            >
                                <Eye size={13} />
                                <span>Na Vitrine da Loja</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${storefrontFilter === 'in_store' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                                    {storefrontCounts.inStore}
                                </span>
                            </button>

                            <button
                                onClick={() => setStorefrontFilter('hidden_stock')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    storefrontFilter === 'hidden_stock'
                                        ? 'bg-slate-800 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                title="Produtos configurados para não estar ativos na página principal (mantidos no estoque interno)"
                            >
                                <EyeOff size={13} />
                                <span>Não Ativo na Principal</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${storefrontFilter === 'hidden_stock' ? 'bg-slate-900 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                    {storefrontCounts.hidden}
                                </span>
                            </button>

                            {storefrontCounts.issues > 0 && (
                                <button
                                    onClick={() => setStorefrontFilter('issues')}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        storefrontFilter === 'issues'
                                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                                            : 'text-amber-800 hover:bg-amber-50'
                                    }`}
                                    title="Produtos que possuem pendências para venda (sem preço, estoque zerado ou pausados)"
                                >
                                    <AlertTriangle size={13} />
                                    <span>Com Pendências</span>
                                    <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full text-[10px]">
                                        {storefrontCounts.issues}
                                    </span>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {selectedTable !== 'all' && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    Filtro: {CATALOG_TABLES[selectedTable]?.label}
                                </span>
                            )}
                            <span className="text-xs text-gray-500 font-medium">
                                Exibindo <strong>{filteredProducts.length}</strong> de {products.length} produtos
                            </span>
                        </div>
                    </div>

                    {/* Linha 2: Busca por texto e Filtro de Categorias */}
                    <div className="flex flex-col md:flex-row gap-3 justify-between items-center pt-2 border-t border-gray-200/60">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder={
                                    selectedTable === 'all' 
                                        ? "Buscar por nome, código (1351), tabela ou NF..." 
                                        : `Buscar dentro da tabela ${CATALOG_TABLES[selectedTable]?.shortLabel}...`
                                }
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <label className="text-xs font-bold text-slate-600 whitespace-nowrap hidden sm:inline">Departamento:</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full md:w-auto max-w-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none shadow-xs cursor-pointer"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat} ({categoryCounts[cat] || 0})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tabela de Produtos */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/80 text-gray-400 uppercase text-[11px] font-bold tracking-wider">
                            <tr>
                                <th className="px-4 py-4 w-12 text-center">
                                    <button 
                                        type="button"
                                        onClick={() => handleToggleSelectAll(paginatedProducts)}
                                        className="text-gray-400 hover:text-brand-primary transition-colors"
                                        title={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProductIdsSet.has(p.id)) ? "Desmarcar página atual" : "Selecionar itens da página atual"}
                                    >
                                        {paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProductIdsSet.has(p.id)) ? (
                                            <CheckSquare size={18} className="text-brand-primary" />
                                        ) : (
                                            <Square size={18} />
                                        )}
                                    </button>
                                </th>
                                <th className="px-4 py-4">Produto & Código</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4">Estoque</th>
                                <th className="px-6 py-4">Custo, Tributos & Venda</th>
                                <th className="px-6 py-4">Vitrine & Venda</th>
                                <th className="px-6 py-4">Nota Fiscal / Data</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {paginatedProducts.map((p) => {
                                const isLowStock = (p.stock || 0) <= (p.minStock || 3);
                                const promoDetails = getProductPromoDetails(p);
                                const discontinuedDetails = getProductDiscontinuedDetails(p);
                                const offMarketDetails = getProductOffMarketDetails(p);
                                const eligibility = getProductSalesEligibility(p);
                                const isSelected = selectedProductIdsSet.has(p.id);

                                return (
                                    <tr key={p.id} className={`transition-colors ${isSelected ? 'bg-amber-50/60' : 'hover:bg-gray-50/50'}`}>
                                        <td className="px-4 py-4 text-center">
                                            <button 
                                                type="button"
                                                onClick={() => handleToggleSelectProduct(p.id)}
                                                className="text-gray-400 hover:text-brand-primary transition-colors"
                                            >
                                                {isSelected ? (
                                                    <CheckSquare size={18} className="text-brand-primary" />
                                                ) : (
                                                    <Square size={18} />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center space-x-3">
                                                <img 
                                                    src={p.imageUrl || PRESET_IMAGES[0].url} 
                                                    alt={p.name} 
                                                    onClick={() => handleOpenEdit(p)}
                                                    className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0 bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity" 
                                                    title="Clique para editar"
                                                />
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {isKitProduct(p) && (
                                                            <span className="px-2 py-0.5 rounded-md bg-purple-600 text-yellow-300 font-bold text-[10px] flex items-center gap-1 shadow-xs">
                                                                <Boxes size={11} />
                                                                KIT ({p.kitItems?.length ? `${p.kitItems.length} itens` : 'Combo'})
                                                            </span>
                                                        )}
                                                        {p.code && (
                                                            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-amber-400 font-mono text-[11px] font-bold shadow-xs">
                                                                #{p.code}
                                                            </span>
                                                        )}
                                                        {p.sku && (
                                                            <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[10px]">
                                                                {p.sku}
                                                            </span>
                                                        )}
                                                        <button 
                                                            onClick={() => handleOpenEdit(p)}
                                                            className="font-bold text-gray-900 hover:text-brand-primary text-left transition-colors cursor-pointer hover:underline"
                                                            title="Clique para editar"
                                                        >
                                                            {p.name}
                                                        </button>
                                                    </div>
                                                    
                                                    {/* Fornecedor */}
                                                    {p.supplierName && (
                                                        <span className="text-[11px] text-gray-500 font-medium block mt-0.5">
                                                            Forn: {p.supplierName} {p.batchNumber ? `(Lote: ${p.batchNumber})` : ''}
                                                        </span>
                                                    )}

                                                    {/* Tags e Atributos Físicos */}
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
                                                        {(p.pickupOrLocal15kmOnly || p.isSpecialDelivery) && (
                                                            <span 
                                                                className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 font-bold border border-amber-300" 
                                                                title="Produto somente com retirada no nosso PONTO DE APOIO ou entrega num raio de até 15 km do nosso domicílio, com frete por conta do cliente"
                                                            >
                                                                <MapPin size={11} className="mr-1 text-amber-700" /> Ponto de Apoio / Raio 15km
                                                            </span>
                                                        )}

                                                        {p.isSpecialDelivery && (
                                                            <span 
                                                                className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 font-bold border border-indigo-200" 
                                                                title={`Logística Especial por CEP: ${p.specialDeliveryCepCode || 'Fora do Padrão Correios'} - ${p.specialDeliveryCepRange || ''}`}
                                                            >
                                                                <Truck size={11} className="mr-1 text-indigo-600" /> Entrega Especial CEP
                                                            </span>
                                                        )}

                                                        {p.material && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                                                                {p.material}
                                                            </span>
                                                        )}

                                                        {(p.dimensionsSize || p.height || p.width || p.length) && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium border border-blue-100">
                                                                {p.dimensionsSize || `${p.height || '—'}x${p.width || '—'}${p.length ? `x${p.length}` : ''}`}
                                                            </span>
                                                        )}

                                                        {p.voltage && p.voltage !== 'Não se aplica' && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                                                                <Zap size={11} className="mr-0.5 text-amber-600 fill-amber-500" /> {p.voltage}
                                                            </span>
                                                        )}

                                                        {p.capacityLiters && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-medium border border-sky-100">
                                                                {p.capacityLiters} {p.packagingType && p.packagingType !== 'Unidade' ? `(${p.packagingType})` : ''}
                                                            </span>
                                                        )}

                                                        {(p.grossWeight || p.netWeight) && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                                                                {p.netWeight ? `${p.netWeight}kg líq.` : `${p.grossWeight}kg br.`}
                                                            </span>
                                                        )}

                                                        {p.nature === 'Inflamável' && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold border border-red-200">
                                                                Inflamável
                                                            </span>
                                                        )}

                                                        {p.videoUrl && (
                                                            <span className="inline-flex items-center text-[10px] text-brand-primary font-semibold">
                                                                <Video size={12} className="mr-0.5" /> Vídeo
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                                                {p.category || 'Geral'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <span className={`font-bold text-sm ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {p.stock} un
                                                </span>
                                                {isLowStock && (
                                                    <span className="inline-flex items-center text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                                                        Baixo
                                                    </span>
                                                )}
                                            </div>
                                            {p.purchaseHistory && p.purchaseHistory.length > 0 && (
                                                <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                                                    {p.purchaseHistory.length} reposições
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {promoDetails.isPromoActive ? (
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-red-600 text-base">R$ {Number(p.promoPrice).toFixed(2)}</span>
                                                        <span className="text-xs text-gray-400 line-through">R$ {Number(p.price || 0).toFixed(2)}</span>
                                                    </div>
                                                    <span className="inline-flex items-center text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                                                        {promoDetails.discountPercent}% OFF
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="font-bold text-brand-dark">R$ {Number(p.price || 0).toFixed(2)}</div>
                                            )}

                                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                                {p.costPrice !== undefined && p.costPrice !== null ? (
                                                    <span className="text-[11px] text-gray-500 font-medium">
                                                        Custo: R$ {Number(p.costPrice).toFixed(2)}
                                                        {Boolean(p.costPriceMarginIndexPercent) && (
                                                            <span className="text-amber-700 font-bold ml-1">
                                                                ({(p.costPriceMarginIndexPercent || 0) > 0 ? '+' : ''}{p.costPriceMarginIndexPercent}% ind.)
                                                            </span>
                                                        )}
                                                    </span>
                                                ) : null}
                                                {((p.icmsPercent || 0) + (p.ipiPercent || 0) + (p.pisPercent || 0) + (p.cofinsPercent || 0) + (p.otherTaxesPercent || 0)) > 0 && (
                                                    <span className="inline-flex items-center text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-bold border border-amber-200">
                                                        Trib: {((p.icmsPercent || 0) + (p.ipiPercent || 0) + (p.pisPercent || 0) + (p.cofinsPercent || 0) + (p.otherTaxesPercent || 0)).toFixed(1)}%
                                                    </span>
                                                )}
                                                {(p.profitMarginPercent || 0) > 0 && (
                                                    <span className="inline-flex items-center text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                                                        Margem: {p.profitMarginPercent}%
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        
                                        {/* Coluna de Vitrine da Loja & Condição de Venda */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                {/* Botão de Alternar Publicação na Vitrine (1 clique) */}
                                                <button
                                                    onClick={(e) => handleToggleSingleProductStorefront(p, e)}
                                                    className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                                                        eligibility.isStoreVisible 
                                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                                    }`}
                                                    title={eligibility.isStoreVisible ? 'Clique para desativar da página principal (manter apenas no estoque interno)' : 'Clique para ativar a exibição na página principal'}
                                                >
                                                    {eligibility.isStoreVisible ? (
                                                        <>
                                                            <Eye size={13} className="text-emerald-600" />
                                                            <span>Na Vitrine</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff size={13} className="text-slate-500" />
                                                            <span>Não Ativo</span>
                                                        </>
                                                    )}
                                                </button>

                                                {/* Badge da Condição de Venda */}
                                                <div>
                                                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                                        eligibility.badgeVariant === 'ready' 
                                                            ? 'bg-emerald-100 text-emerald-800' 
                                                            : eligibility.badgeVariant === 'hidden'
                                                            ? 'bg-slate-100 text-slate-600'
                                                            : eligibility.badgeVariant === 'draft'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-rose-100 text-rose-800'
                                                    }`}>
                                                        {eligibility.badgeText}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs text-gray-700">{p.invoiceNumber || '—'}</div>
                                            <div className="text-[11px] text-gray-400">
                                                {p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-1">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                        p.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {p.isActive !== false ? 'Ativo (Sim)' : 'Inativo (Não)'}
                                                    </span>

                                                    {eligibility.isStoreVisible ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200" title="Visível na página principal">
                                                            <Eye size={10} /> Vitrine OK
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200" title="Não ativo para exibição na página principal">
                                                            <EyeOff size={10} /> Oculto na Principal
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Badges de Vigência / Status Especial */}
                                                {promoDetails.isPromoActive && (
                                                    <div className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 font-bold flex items-center gap-1">
                                                        <Tag size={10} />
                                                        <span>Promoção Vigente</span>
                                                    </div>
                                                )}

                                                {discontinuedDetails.isDiscontinued && (
                                                    <div className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-bold flex items-center gap-1">
                                                        <Archive size={10} />
                                                        <span>Descontinuado</span>
                                                    </div>
                                                )}

                                                {offMarketDetails.isOffMarket && (
                                                    <div className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-300 font-bold flex items-center gap-1">
                                                        <AlertOctagon size={10} />
                                                        <span>Fora de Mercado</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center space-x-1.5">
                                                {/* Botão de Promoção / Oferta com 1 clique */}
                                                <button
                                                    onClick={() => handleOpenPromoModal(p)}
                                                    className={`p-2 rounded-xl transition-all font-semibold flex items-center shadow-2xs cursor-pointer ${
                                                        promoDetails.isPromoActive
                                                            ? 'text-red-700 bg-red-100 hover:bg-red-200 border border-red-300'
                                                            : p.isPromo
                                                            ? 'text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300'
                                                            : 'text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-700 border border-slate-200'
                                                    }`}
                                                    title={promoDetails.isPromoActive ? 'Promoção Ativa! Clique para alterar ou excluir' : p.isPromo ? 'Promoção agendada/inativa. Clique para gerenciar' : 'Colocar este produto em Promoção com desconto e datas'}
                                                >
                                                    <Flame size={16} className={promoDetails.isPromoActive ? 'text-red-600 animate-pulse' : ''} />
                                                </button>

                                                {/* Botão de Enriquecimento com IA & Ativação */}
                                                <button
                                                    onClick={() => setEnrichProduct(p)}
                                                    className="p-2 text-amber-700 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-200 border border-amber-300/60 rounded-xl transition-all font-semibold flex items-center shadow-2xs cursor-pointer"
                                                    title="Enriquecer Ficha Técnica & SEO com IA para Ativação na Vitrine"
                                                >
                                                    <Sparkles size={16} className="text-amber-700" />
                                                </button>

                                                {/* Botão de Reposição de Estoque / Nova Compra */}
                                                <button
                                                    onClick={() => setRestockProduct(p)}
                                                    className="p-2 text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all font-semibold flex items-center"
                                                    title="Repor Estoque / Lançar Nova Compra (NF, Fornecedor, Preço)"
                                                >
                                                    <Truck size={17} />
                                                </button>

                                                {isKitProduct(p) ? (
                                                    <button 
                                                        onClick={() => handleOpenEditKit(p)}
                                                        className="px-2.5 py-1.5 text-xs font-bold text-purple-700 hover:text-white hover:bg-purple-600 bg-purple-50 border border-purple-200 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                                                        title="Editar Kit e Composição de Itens"
                                                    >
                                                        <Boxes size={14} />
                                                        <span>Editar Kit</span>
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleOpenEdit(p)}
                                                        className="px-2.5 py-1.5 text-xs font-bold text-brand-primary hover:text-white hover:bg-brand-primary bg-brand-light/80 border border-brand-primary/20 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                                                        title="Editar Ficha Técnica do Produto"
                                                    >
                                                        <Edit2 size={14} />
                                                        <span>Editar</span>
                                                    </button>
                                                )}
                                                
                                                {deleteConfirmId === p.id ? (
                                                    <div className="flex items-center space-x-1 bg-red-50 p-1 rounded-xl">
                                                        <button 
                                                            onClick={() => handleDelete(p.id, p.name)}
                                                            className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
                                                        >
                                                            Confirmar
                                                        </button>
                                                        <button 
                                                            onClick={() => setDeleteConfirmId(null)}
                                                            className="p-1 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => setDeleteConfirmId(p.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Excluir Produto"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="text-center py-16 px-4 text-gray-400">
                                        {selectedTable === 'pampulha' && tableCounts.pampulha === 0 ? (
                                            <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center shadow-xs">
                                                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                    <Zap size={24} />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900 mb-1">Nenhum Produto Pampulha Cadastrado</h3>
                                                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                                                    Nenhum produto oficial da Pampulha Condutores foi encontrado no acervo ativo.
                                                </p>
                                                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                                                    <button 
                                                        type="button"
                                                        onClick={() => { setSelectedTable('all'); setCurrentPage(1); }}
                                                        className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                                                    >
                                                        <span>Ver Todas as Tabelas</span>
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setIsImportModalOpen(true)}
                                                        className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Upload size={14} />
                                                        <span>Importar Novo Arquivo / PDF</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : selectedTable === 'famastil' && tableCounts.famastil === 0 ? (
                                            <div className="max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center shadow-xs">
                                                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                    <Wrench size={24} />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900 mb-1">Tabela Famastil Não Sincronizada</h3>
                                                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                                                    O catálogo oficial Famastil (Ferramentas Manuais & Construção) está pronto para inserção no banco de dados.
                                                </p>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleSyncCatalogTable('famastil')}
                                                    disabled={isSyncingTable === 'famastil'}
                                                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
                                                >
                                                    {isSyncingTable === 'famastil' ? (
                                                        <>
                                                            <RefreshCw size={14} className="animate-spin" />
                                                            <span>Sincronizando Famastil...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Wrench size={14} />
                                                            <span>⚡ Sincronizar Catálogo Famastil</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        ) : selectedTable === 'foxlux' && tableCounts.foxlux === 0 ? (
                                            <div className="max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center shadow-xs">
                                                <div className="w-12 h-12 bg-yellow-100 text-yellow-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                    <Lightbulb size={24} />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900 mb-1">Tabela Foxlux Não Sincronizada</h3>
                                                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                                                    O catálogo oficial Foxlux (Iluminação LED, Fitas & Sensores) está pronto para inserção no banco de dados.
                                                </p>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleSyncCatalogTable('foxlux')}
                                                    disabled={isSyncingTable === 'foxlux'}
                                                    className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
                                                >
                                                    {isSyncingTable === 'foxlux' ? (
                                                        <>
                                                            <RefreshCw size={14} className="animate-spin" />
                                                            <span>Sincronizando Foxlux...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lightbulb size={14} />
                                                            <span>⚡ Sincronizar Catálogo Foxlux</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        ) : selectedTable === 'tramontina' && tableCounts.tramontina === 0 ? (
                                            <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center shadow-xs">
                                                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                    <ShieldCheck size={24} />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900 mb-1">Tabela Tramontina Não Sincronizada</h3>
                                                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                                                    O catálogo oficial Tramontina (Linha Liz & Disjuntores DIN) está pronto para inserção no banco de dados.
                                                </p>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleSyncCatalogTable('tramontina')}
                                                    disabled={isSyncingTable === 'tramontina'}
                                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
                                                >
                                                    {isSyncingTable === 'tramontina' ? (
                                                        <>
                                                            <RefreshCw size={14} className="animate-spin" />
                                                            <span>Sincronizando Tramontina...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShieldCheck size={14} />
                                                            <span>⚡ Sincronizar Catálogo Tramontina</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <Package size={48} className="mx-auto mb-3 opacity-30" />
                                                <p className="font-medium">Nenhum produto encontrado com os filtros selecionados.</p>
                                                <p className="text-xs text-gray-400 mt-1 mb-4">
                                                    {selectedTable !== 'all' 
                                                        ? `Existem ${tableCounts[selectedTable]} produto(s) nesta tabela, mas nenhum corresponde à busca ou categoria ativa.` 
                                                        : 'Tente limpar os termos de busca ou filtros de categoria.'}
                                                </p>
                                                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedCategory('Todos');
                                                            setStorefrontFilter('all');
                                                            setSearchTerm('');
                                                            setCurrentPage(1);
                                                        }}
                                                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                                                    >
                                                        <span>Limpar Todos os Filtros</span>
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setIsImportModalOpen(true)}
                                                        className="inline-flex items-center space-x-2 text-xs font-bold text-amber-600 hover:underline"
                                                    >
                                                        <Upload size={14} />
                                                        <span>Importar catálogo (PDF / Lote)</span>
                                                    </button>
                                                    <span className="text-gray-300">|</span>
                                                    <button 
                                                        type="button"
                                                        onClick={handleOpenCreate}
                                                        className="inline-flex items-center space-x-2 text-xs font-bold text-brand-primary hover:underline"
                                                    >
                                                        <Plus size={14} />
                                                        <span>Cadastrar manual</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* BARRA DE CONTROLE DE PAGINAÇÃO DE ALTA PERFORMANCE */}
                {filteredProducts.length > 0 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-xs text-slate-600">
                            <span>
                                Mostrando <strong className="text-slate-900 font-bold">{Math.min(filteredProducts.length, (currentPage - 1) * itemsPerPage + 1)}</strong> até <strong className="text-slate-900 font-bold">{Math.min(filteredProducts.length, currentPage * itemsPerPage)}</strong> de <strong className="text-slate-900 font-bold">{filteredProducts.length}</strong> produtos
                            </span>

                            <span className="text-slate-300">|</span>

                            <div className="flex items-center gap-1.5">
                                <span className="text-slate-500">Por página:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                                >
                                    <option value={25}>25 itens</option>
                                    <option value={50}>50 itens</option>
                                    <option value={100}>100 itens</option>
                                    <option value={250}>250 itens</option>
                                </select>
                            </div>
                        </div>

                        {/* Botões de Navegação */}
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                                className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                title="Primeira página"
                            >
                                « Primeira
                            </button>
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                title="Página anterior"
                            >
                                ‹ Anterior
                            </button>

                            <div className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-extrabold shadow-sm">
                                {currentPage} / {totalPages}
                            </div>

                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                title="Próxima página"
                            >
                                Próxima ›
                            </button>
                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                                className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                title="Última página"
                            >
                                Última »
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Confirmação de Exclusão em Massa */}
            {confirmMassDeleteOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 relative">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-center text-brand-dark mb-2">
                            Excluir {selectedProductIds.length} produto(s)?
                        </h3>
                        <p className="text-xs text-gray-500 text-center mb-6 leading-relaxed">
                            Esta ação removerá permanentemente os itens selecionados do banco de dados do Firestore.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setConfirmMassDeleteOpen(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleBulkDeleteSelected}
                                disabled={isBulkProcessing}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all text-sm shadow-md disabled:opacity-50"
                            >
                                {isBulkProcessing ? 'Excluindo...' : 'Sim, Excluir Todos'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Alteração de Categoria em Lote */}
            {bulkCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 relative">
                        <h3 className="text-xl font-bold text-brand-dark mb-2 flex items-center gap-2">
                            <FolderKanban size={22} className="text-brand-primary" />
                            Mudar Categoria em Lote
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Selecione a nova categoria para os {selectedProductIds.length} produtos selecionados:
                        </p>
                        <select
                            value={bulkCategoryValue}
                            onChange={(e) => setBulkCategoryValue(e.target.value)}
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none font-medium mb-6"
                        >
                            <option value="Ferramentas & Máquinas">Ferramentas & Máquinas</option>
                            <option value="Banheiro">Banheiro</option>
                            <option value="Metais & Hidráulica">Metais & Hidráulica</option>
                            <option value="Iluminação">Iluminação</option>
                            <option value="Móveis">Móveis</option>
                            <option value="Decoração">Decoração</option>
                            <option value="Cozinha">Cozinha</option>
                            <option value="Livros / E-books">Livros / E-books</option>
                            <option value="Geral">Geral</option>
                        </select>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setBulkCategoryModalOpen(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleBulkApplyCategory}
                                disabled={isBulkProcessing}
                                className="flex-1 py-3 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-dark transition-all text-sm shadow-md disabled:opacity-50"
                            >
                                {isBulkProcessing ? 'Salvando...' : 'Aplicar Categoria'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Reposição / Lançamento de Nova Compra de Produtos Existentes */}
            {restockProduct && (
                <RestockModal 
                    isOpen={Boolean(restockProduct)}
                    product={restockProduct}
                    onClose={() => setRestockProduct(null)}
                    onSuccess={(updatedProduct, msg) => {
                        setRestockProduct(null);
                        showFeedback('success', msg);
                    }}
                    onSaved={() => {
                        setRestockProduct(null);
                        showFeedback('success', 'Nova compra / reposição de estoque lançada com sucesso!');
                    }}
                />
            )}

            {/* Modal do Banco de Imagens Integrado */}
            {isMediaBankModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4 sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold font-serif text-brand-dark flex items-center gap-2">
                                    <ImageIcon size={20} className="text-brand-primary" />
                                    Selecionar Imagem do Banco de Mídias
                                </h3>
                                <p className="text-xs text-gray-500">Escolha uma foto da galeria ou faça upload de uma nova com 1 clique.</p>
                            </div>
                            <button
                                onClick={() => setIsMediaBankModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <MediaBankManager 
                            isModalMode={true}
                            onSelectImageForProduct={(selectedUrl) => {
                                setPendingMediaAsset(selectedUrl);
                                showFeedback('success', 'Foto selecionada do Banco de Mídias!');
                                setIsMediaBankModalOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Modal de Importação de Produtos (PDF / Lote / CSV) */}
            {isImportModalOpen && (
                <ErrorBoundary
                    fallbackTitle="Central de Importação"
                    fallbackDescription="Ocorreu uma falha ao abrir a central de importação. Tente novamente."
                    onReset={() => setIsImportModalOpen(false)}
                >
                    <ProductImportModal 
                        isOpen={isImportModalOpen}
                        onClose={() => setIsImportModalOpen(false)}
                        onSuccess={(importedCount) => {
                            showFeedback('success', `${importedCount} produtos importados e cadastrados com sucesso com a data de hoje!`);
                        }}
                        onEditProduct={(productToEdit) => {
                            handleOpenEdit(productToEdit);
                        }}
                    />
                </ErrorBoundary>
            )}

            {/* Modal de Enriquecimento com IA & Ativação */}
            <ProductEnrichModal
                isOpen={Boolean(enrichProduct)}
                onClose={() => setEnrichProduct(null)}
                product={enrichProduct}
                onEnrichComplete={(updatedData) => {
                    if (enrichProduct?.id) {
                        updateDocument('products', enrichProduct.id, updatedData);
                    }
                    showFeedback('success', 'Ficha técnica e dados do produto enriquecidos com IA com sucesso!');
                }}
                onOpenMediaBank={(target) => {
                    setMediaBankTarget(target);
                    setIsMediaBankModalOpen(true);
                }}
            />
            {/* Modal de Gestão de Promoções (Incluir, Alterar, Excluir) */}
            <PromoActionModal 
                isOpen={isPromoModalOpen}
                onClose={() => {
                    setIsPromoModalOpen(false);
                    setPromoModalTargetProduct(null);
                }}
                allProducts={products}
                products={products}
                targetProduct={promoModalTargetProduct}
                onSavePromo={handleSavePromo}
                onRemovePromo={handleRemovePromo}
            />

            {/* Modal de Gestão e Montagem de Kits & Combos */}
            <KitBuilderModal 
                isOpen={isKitModalOpen}
                onClose={() => {
                    setIsKitModalOpen(false);
                    setEditingKit(null);
                }}
                allProducts={products}
                editingKit={editingKit}
                onSaveKit={async (kitPayload) => {
                    if (editingKit?.id) {
                        await updateDocument('products', editingKit.id, kitPayload);
                        showFeedback('success', `Kit "${kitPayload.name}" atualizado com sucesso!`);
                    } else {
                        await createDocument('products', kitPayload);
                        showFeedback('success', `Kit "${kitPayload.name}" criado e cadastrado com sucesso!`);
                    }
                    setIsKitModalOpen(false);
                    setEditingKit(null);
                }}
            />

            {/* Modal de Reajuste de Preço de Custo por Margem de Índice Percentual */}
            <CostPriceAdjustmentModal 
                isOpen={isCostPriceAdjustmentModalOpen}
                onClose={() => setIsCostPriceAdjustmentModalOpen(false)}
                products={products}
                defaultTableKey={selectedTable}
                onSuccess={(updatedCount, indexPercent) => {
                    showFeedback('success', `Preço de custo reajustado com sucesso para ${updatedCount} produtos (${indexPercent >= 0 ? '+' : ''}${indexPercent}%).`);
                }}
            />
        </div>
    );
};
