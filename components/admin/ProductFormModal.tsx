import React, { useState, useEffect, useMemo } from 'react';
import { 
    X, 
    Check, 
    Sparkles, 
    DollarSign, 
    Package, 
    FileText, 
    Calendar, 
    Image as ImageIcon, 
    Plus, 
    Trash2, 
    Eye, 
    Calculator, 
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
    ArrowUp, 
    ArrowDown, 
    ImagePlus, 
    PlusCircle, 
    AlertTriangle,
    LayoutGrid,
    SlidersHorizontal,
    Edit2,
    FolderPlus,
    Boxes
} from 'lucide-react';
import { Product } from '../../types';
import { calculateProductPrice } from '../../lib/taxCalculator';
import { parseMediaUrl } from '../../lib/mediaHelper';
import { getProductTaxonomy, saveProductTaxonomy, ProductTaxonomySettings } from '../../lib/productClassesConfig';
import { motion, AnimatePresence } from 'motion/react';

const PRESET_IMAGES = [
    { label: 'Logo Oficial Ponto Chave do Lar', url: '/ponto_chave_logo.jpg' },
    { label: 'Caixa Organizadora Bambu', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800' },
    { label: 'Porta-Temperos Inox Giratório', url: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&q=80&w=800' },
    { label: 'Spray Dosador Azeite Inox', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800' },
    { label: 'Escorredor de Louças Preto', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800' },
    { label: 'Luminária Pendente Tubular Dourada', url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800' },
    { label: 'Kit Furadeira Parafusadeira Impacto', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800' }
];

const CATEGORIES = [
    'Materiais Elétricos e Ferramentas',
    'Materiais Elétricos',
    'Materiais de Telefonia e Comunicação',
    'Telefonia, Informática & Segurança',
    'Ferramentas & Máquinas',
    'Iluminação',
    'Metais & Hidráulica',
    'Segurança - EPI',
    'Casa - Jardim - Agrícola',
    'Kits & Combos',
    'Jardinagem',
    'Agrícolas',
    'Smart',
    'Utilidades',
    'Banheiro',
    'Móveis',
    'Decoração',
    'Cozinha',
    'Livros / E-books',
    'Geral'
];

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: Partial<Product>, saveAndNew?: boolean) => Promise<void>;
    editingProduct: Product | null;
    existingProducts?: Product[];
    onOpenMediaBank: (target: 'main' | 'gallery' | 'add_gallery', index?: number) => void;
    onOpenEnrichWithAI: (product: Product) => void;
    onOpenRestock?: (product: Product) => void;
    isSaving: boolean;
    pendingMediaAsset?: string | null;
    onClearPendingMedia?: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editingProduct,
    existingProducts = [],
    onOpenMediaBank,
    onOpenEnrichWithAI,
    onOpenRestock,
    isSaving,
    pendingMediaAsset,
    onClearPendingMedia
}) => {
    // Modo de visualização: 'express' (Cadastro Rápido em 10s) ou 'full' (Ficha Técnica Completa em Abas)
    const [viewMode, setViewMode] = useState<'express' | 'full'>('express');
    const [activeTab, setActiveTab] = useState<'basics' | 'tax' | 'media' | 'specs' | 'status'>('basics');

    // Inicializador do estado do formulário
    const getInitialFormData = (product: Product | null): Partial<Product> => {
        if (product) {
            return { ...product };
        }

        // Sugestão automática de código sequencial para agilizar o cadastro
        let nextCode = '1001';
        if (existingProducts.length > 0) {
            const numericCodes = existingProducts
                .map(p => parseInt(p.code || '', 10))
                .filter(n => !isNaN(n) && n > 0);
            if (numericCodes.length > 0) {
                nextCode = String(Math.max(...numericCodes) + 1);
            } else {
                nextCode = String(existingProducts.length + 1001);
            }
        }

        return {
            code: nextCode,
            sku: `PCL-${nextCode}`,
            name: '',
            description: '',
            category: 'Ferramentas & Máquinas',
            price: '' as any,
            costPrice: '' as any,
            icmsPercent: 18,
            ipiPercent: 0,
            pisPercent: 1.65,
            cofinsPercent: 7.6,
            otherTaxesPercent: 0,
            profitMarginPercent: 40,
            stock: 10,
            minStock: 3,
            isActive: editingProduct ? editingProduct.isActive !== false : true,
            pickupOrLocal15kmOnly: Boolean(editingProduct?.pickupOrLocal15kmOnly || editingProduct?.isSpecialDelivery),
            showInStore: false,
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
            dimensionsSize: '',
            height: '',
            width: '',
            length: '',
            grossWeight: undefined,
            netWeight: undefined,
            capacityLiters: '',
            packagingType: 'Unidade',
            nature: 'Não-inflamável',
            material: 'Metal / Inox',
            voltage: 'Bivolt (110V/220V)',
            isPromo: false,
            promoPrice: 0,
            promoDiscountPercent: 0,
            promoStartDate: '',
            promoEndDate: '',
            isDiscontinued: false,
            discontinuedStartDate: '',
            discontinuedEndDate: '',
            discontinuedReason: '',
            isOffMarket: false,
            offMarketStartDate: '',
            offMarketEndDate: '',
            offMarketReason: '',
            purchaseHistory: [],
            // Reajuste de Preço de Custo por Índice Percentual
            costPriceOriginal: editingProduct?.costPriceOriginal || editingProduct?.costPrice || 0,
            costPriceMarginIndexPercent: editingProduct?.costPriceMarginIndexPercent || 0,
            costPriceLastAdjustmentDate: editingProduct?.costPriceLastAdjustmentDate || '',
            table: editingProduct?.table || '',
            // Logística Especial por CEP (Fora do Padrão dos Correios e Transportadoras)
            isSpecialDelivery: Boolean(editingProduct?.isSpecialDelivery),
            specialDeliveryCepCode: editingProduct?.specialDeliveryCepCode || '',
            specialDeliveryCepRange: editingProduct?.specialDeliveryCepRange || '',
            specialDeliveryNotes: editingProduct?.specialDeliveryNotes || '',
            productClass: editingProduct?.productClass || 'Material Elétrico',
            department: editingProduct?.department || 'Material Elétrico'
        };
    };

    const [formData, setFormData] = useState<Partial<Product>>(() => getInitialFormData(editingProduct));
    const [validationError, setValidationError] = useState<string | null>(null);

    // Taxonomia Dinâmica: Classes e Departamentos alinhados com a Página Principal
    const [taxonomy, setTaxonomy] = useState<ProductTaxonomySettings>(() => getProductTaxonomy());
    const [newClassInput, setNewClassInput] = useState('');
    const [showNewClassInput, setShowNewClassInput] = useState(false);
    const [newDeptInput, setNewDeptInput] = useState('');
    const [showNewDeptInput, setShowNewDeptInput] = useState(false);
    const [editingClassTarget, setEditingClassTarget] = useState<string | null>(null);
    const [editingClassVal, setEditingClassVal] = useState('');
    const [editingDeptTarget, setEditingDeptTarget] = useState<string | null>(null);
    const [editingDeptVal, setEditingDeptVal] = useState('');

    const handleAddClass = () => {
        const trimmed = newClassInput.trim();
        if (!trimmed) return;
        if (!taxonomy.classes.includes(trimmed)) {
            const updated = { ...taxonomy, classes: [...taxonomy.classes, trimmed] };
            setTaxonomy(updated);
            saveProductTaxonomy(updated);
            setFormData(prev => ({ ...prev, productClass: trimmed }));
        }
        setNewClassInput('');
        setShowNewClassInput(false);
    };

    const handleSaveEditClass = (oldVal: string) => {
        const trimmed = editingClassVal.trim();
        if (!trimmed || trimmed === oldVal) {
            setEditingClassTarget(null);
            return;
        }
        const updatedClasses = taxonomy.classes.map(c => c === oldVal ? trimmed : c);
        const updated = { ...taxonomy, classes: updatedClasses };
        setTaxonomy(updated);
        saveProductTaxonomy(updated);
        if (formData.productClass === oldVal) {
            setFormData(prev => ({ ...prev, productClass: trimmed }));
        }
        setEditingClassTarget(null);
        setEditingClassVal('');
    };

    const handleDeleteClass = (targetClass: string) => {
        if (taxonomy.classes.length <= 1) return;
        if (!confirm(`Deseja excluir a classe "${targetClass}" das opções salvas?`)) return;
        const updatedClasses = taxonomy.classes.filter(c => c !== targetClass);
        const updated = { ...taxonomy, classes: updatedClasses };
        setTaxonomy(updated);
        saveProductTaxonomy(updated);
        if (formData.productClass === targetClass) {
            setFormData(prev => ({ ...prev, productClass: updatedClasses[0] || '' }));
        }
    };

    const handleAddDepartment = () => {
        const trimmed = newDeptInput.trim();
        if (!trimmed) return;
        if (!taxonomy.departments.includes(trimmed)) {
            const updated = { ...taxonomy, departments: [...taxonomy.departments, trimmed] };
            setTaxonomy(updated);
            saveProductTaxonomy(updated);
            setFormData(prev => ({ ...prev, department: trimmed }));
        }
        setNewDeptInput('');
        setShowNewDeptInput(false);
    };

    const handleSaveEditDept = (oldVal: string) => {
        const trimmed = editingDeptVal.trim();
        if (!trimmed || trimmed === oldVal) {
            setEditingDeptTarget(null);
            return;
        }
        const updatedDepts = taxonomy.departments.map(d => d === oldVal ? trimmed : d);
        const updated = { ...taxonomy, departments: updatedDepts };
        setTaxonomy(updated);
        saveProductTaxonomy(updated);
        if (formData.department === oldVal) {
            setFormData(prev => ({ ...prev, department: trimmed }));
        }
        setEditingDeptTarget(null);
        setEditingDeptVal('');
    };

    const handleDeleteDept = (targetDept: string) => {
        if (taxonomy.departments.length <= 1) return;
        if (!confirm(`Deseja excluir o departamento "${targetDept}" das opções salvas?`)) return;
        const updatedDepts = taxonomy.departments.filter(d => d !== targetDept);
        const updated = { ...taxonomy, departments: updatedDepts };
        setTaxonomy(updated);
        saveProductTaxonomy(updated);
        if (formData.department === targetDept) {
            setFormData(prev => ({ ...prev, department: updatedDepts[0] || '' }));
        }
    };

    // Atualiza o formulário quando o produto em edição muda ou ao abrir
    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData(editingProduct));
            setValidationError(null);
            // Se estiver editando um produto completo com dados fiscais/especificações, abre em modo completo por padrão
            if (editingProduct && (editingProduct.technicalSpecs || editingProduct.costPrice || editingProduct.isPromo)) {
                setViewMode('full');
            } else if (!editingProduct) {
                setViewMode('express');
            }
        }
    }, [isOpen, editingProduct]);

    // Garante que a categoria atual (inclusive as extraídas de catálogo/PDF como Materiais Elétricos e Ferramentas) sempre apareça nas opções
    const availableCategories = useMemo(() => {
        const list = [...CATEGORIES];
        if (formData.category && !list.includes(formData.category)) {
            list.unshift(formData.category);
        }
        return list;
    }, [formData.category]);

    // Trata mídias selecionadas vindas do Banco de Mídias
    useEffect(() => {
        if (pendingMediaAsset) {
            setFormData(prev => ({ ...prev, imageUrl: pendingMediaAsset }));
            if (onClearPendingMedia) onClearPendingMedia();
        }
    }, [pendingMediaAsset, onClearPendingMedia]);

    // Cálculo em tempo real dos tributos e margem
    const taxSummary = useMemo(() => {
        return calculateProductPrice({
            costPrice: formData.costPrice,
            icmsPercent: formData.icmsPercent,
            ipiPercent: formData.ipiPercent,
            pisPercent: formData.pisPercent,
            cofinsPercent: formData.cofinsPercent,
            otherTaxesPercent: formData.otherTaxesPercent,
            profitMarginPercent: formData.profitMarginPercent,
        });
    }, [
        formData.costPrice,
        formData.icmsPercent,
        formData.ipiPercent,
        formData.pisPercent,
        formData.cofinsPercent,
        formData.otherTaxesPercent,
        formData.profitMarginPercent
    ]);

    const handleApplySuggestedPrice = () => {
        if (taxSummary.suggestedPrice > 0) {
            setFormData(prev => ({ ...prev, price: taxSummary.suggestedPrice }));
        }
    };

    // Manipuladores de galeria de fotos adicionais
    const handleAddGalleryImage = (url: string = '') => {
        setFormData(prev => {
            const currentGal = Array.isArray(prev.gallery) ? [...prev.gallery] : [];
            return { ...prev, gallery: [...currentGal, url] };
        });
    };

    const handleAddTwoGallerySlots = () => {
        setFormData(prev => {
            const currentGal = Array.isArray(prev.gallery) ? [...prev.gallery] : [];
            return { ...prev, gallery: [...currentGal, '', ''] };
        });
    };

    const handleUpdateGalleryItem = (index: number, url: string) => {
        setFormData(prev => {
            const currentGal = Array.isArray(prev.gallery) ? [...prev.gallery] : [];
            currentGal[index] = url;
            return { ...prev, gallery: currentGal };
        });
    };

    const handleRemoveGalleryItem = (index: number) => {
        setFormData(prev => {
            const currentGal = Array.isArray(prev.gallery) ? [...prev.gallery] : [];
            currentGal.splice(index, 1);
            return { ...prev, gallery: currentGal };
        });
    };

    const handleMoveGalleryItem = (index: number, direction: 'up' | 'down') => {
        setFormData(prev => {
            const currentGal = Array.isArray(prev.gallery) ? [...prev.gallery] : [];
            if (direction === 'up' && index > 0) {
                const temp = currentGal[index];
                currentGal[index] = currentGal[index - 1];
                currentGal[index - 1] = temp;
            } else if (direction === 'down' && index < currentGal.length - 1) {
                const temp = currentGal[index];
                currentGal[index] = currentGal[index + 1];
                currentGal[index + 1] = temp;
            }
            return { ...prev, gallery: currentGal };
        });
    };

    const handleSetGalleryAsMain = (index: number) => {
        setFormData(prev => {
            const currentGal = Array.isArray(prev.gallery) ? [...prev.gallery] : [];
            const oldMain = prev.imageUrl || '';
            const newMain = currentGal[index] || '';
            if (oldMain) {
                currentGal[index] = oldMain;
            } else {
                currentGal.splice(index, 1);
            }
            return { ...prev, imageUrl: newMain, gallery: currentGal };
        });
    };

    // Submissão do Formulário
    const handleSubmit = async (e?: React.FormEvent, saveAndNew: boolean = false) => {
        if (e) e.preventDefault();
        setValidationError(null);

        if (!formData.name?.trim()) {
            setValidationError('Informe o Nome Comercial do produto.');
            return;
        }

        const price = Number(formData.price);
        if (isNaN(price) || price <= 0) {
            setValidationError('Informe um Preço de Venda válido maior que zero.');
            return;
        }

        const stock = Number(formData.stock);
        if (isNaN(stock) || stock < 0) {
            setValidationError('Informe uma quantidade válida de estoque.');
            return;
        }

        const rawPayload: Record<string, any> = {
            code: formData.code?.trim() || '',
            sku: formData.sku?.trim() || '',
            name: formData.name.trim(),
            description: formData.description?.trim() || '',
            price: price,
            costPrice: Number(formData.costPrice || 0),
            icmsPercent: Number(formData.icmsPercent || 0),
            ipiPercent: Number(formData.ipiPercent || 0),
            pisPercent: Number(formData.pisPercent || 0),
            cofinsPercent: Number(formData.cofinsPercent || 0),
            otherTaxesPercent: Number(formData.otherTaxesPercent || 0),
            profitMarginPercent: Number(formData.profitMarginPercent || 0),
            stock: stock,
            minStock: Number(formData.minStock || 3),
            category: formData.category || 'Ferramentas & Máquinas',
            isActive: formData.isActive !== false,
            showInStore: formData.showInStore !== undefined ? Boolean(formData.showInStore) : true,
            isImported: Boolean(formData.isImported || editingProduct?.isImported),
            imageUrl: formData.imageUrl?.trim() || '/ponto_chave_logo.jpg',
            videoUrl: formData.videoUrl?.trim() || '',
            supplierName: formData.supplierName?.trim() || '',
            batchNumber: formData.batchNumber?.trim() || '',
            purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
            invoiceNumber: formData.invoiceNumber?.trim() || '',
            expiryDate: formData.expiryDate || '',
            technicalSpecs: formData.technicalSpecs?.trim() || '',
            gallery: Array.isArray(formData.gallery) ? formData.gallery.map(u => String(u || '').trim()).filter(Boolean) : [],
            dimensionsSize: formData.dimensionsSize?.trim() || '',
            height: formData.height !== undefined && formData.height !== '' ? formData.height : '',
            width: formData.width !== undefined && formData.width !== '' ? formData.width : '',
            length: formData.length !== undefined && formData.length !== '' ? formData.length : '',
            grossWeight: formData.grossWeight !== undefined && !isNaN(Number(formData.grossWeight)) ? Number(formData.grossWeight) : 0,
            netWeight: formData.netWeight !== undefined && !isNaN(Number(formData.netWeight)) ? Number(formData.netWeight) : 0,
            capacityLiters: formData.capacityLiters !== undefined && formData.capacityLiters !== '' ? formData.capacityLiters : '',
            packagingType: formData.packagingType || 'Unidade',
            nature: formData.nature || 'Não-inflamável',
            material: formData.material?.trim() || 'Metal / Inox',
            voltage: formData.voltage?.trim() || 'Bivolt (110V/220V)',
            isPromo: Boolean(formData.isPromo),
            promoPrice: formData.promoPrice ? Number(formData.promoPrice) : 0,
            promoDiscountPercent: formData.promoDiscountPercent ? Number(formData.promoDiscountPercent) : 0,
            promoStartDate: formData.promoStartDate || '',
            promoEndDate: formData.promoEndDate || '',
            isDiscontinued: Boolean(formData.isDiscontinued),
            discontinuedStartDate: formData.discontinuedStartDate || '',
            discontinuedEndDate: formData.discontinuedEndDate || '',
            discontinuedReason: formData.discontinuedReason?.trim() || '',
            isOffMarket: Boolean(formData.isOffMarket),
            offMarketStartDate: formData.offMarketStartDate || '',
            offMarketEndDate: formData.offMarketEndDate || '',
            offMarketReason: formData.offMarketReason?.trim() || '',
            purchaseHistory: formData.purchaseHistory || [],
            // Reajuste de Preço de Custo por Índice Percentual
            costPriceOriginal: Number(formData.costPriceOriginal || formData.costPrice || 0),
            costPriceMarginIndexPercent: Number(formData.costPriceMarginIndexPercent || 0),
            costPriceLastAdjustmentDate: formData.costPriceLastAdjustmentDate || '',
            table: formData.table || '',
            // Logística Especial por CEP e Retirada no Ponto de Apoio
            isSpecialDelivery: Boolean(formData.isSpecialDelivery || formData.pickupOrLocal15kmOnly),
            pickupOrLocal15kmOnly: Boolean(formData.pickupOrLocal15kmOnly || formData.isSpecialDelivery),
            specialDeliveryCepCode: formData.specialDeliveryCepCode?.trim() || '',
            specialDeliveryCepRange: formData.specialDeliveryCepRange?.trim() || '',
            specialDeliveryNotes: formData.specialDeliveryNotes?.trim() || '',
            // Classe e Departamento (Aba Promoção/Status)
            productClass: formData.productClass?.trim() || 'Material Elétrico',
            department: formData.department?.trim() || 'Material Elétrico'
        };

        const payload: Partial<Product> = {};
        Object.keys(rawPayload).forEach(k => {
            if (rawPayload[k] !== undefined) {
                (payload as any)[k] = rawPayload[k];
            }
        });

        await onSave(payload, saveAndNew);

        if (saveAndNew) {
            // Prepara para o próximo cadastro instantâneo
            const nextNumericCode = String(parseInt(formData.code || '1000', 10) + 1);
            setFormData({
                ...getInitialFormData(null),
                code: nextNumericCode,
                sku: `PCL-${nextNumericCode}`,
                category: formData.category || 'Ferramentas & Máquinas'
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto flex items-start justify-center p-3 sm:p-5 md:p-8">
            <motion.div 
                initial={{ opacity: 0, scale: 0.97, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 15 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-5xl w-full my-auto overflow-hidden flex flex-col"
            >
                {/* CABEÇALHO DO MODAL */}
                <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                            {viewMode === 'express' ? <Zap className="text-amber-400 fill-amber-400" size={24} /> : <Package className="text-amber-400" size={24} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold font-serif text-white">
                                    {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                                </h3>
                                {formData.code && (
                                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-mono text-xs font-bold">
                                        #{formData.code}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {viewMode === 'express' 
                                    ? 'Modo Expresso • Preencha os dados essenciais em menos de 10 segundos.'
                                    : 'Modo Completo • Ficha técnica avançada, tributos fiscais, galeria e vigências.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        {/* Seletor de Modo (Expresso vs Completo) */}
                        <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700">
                            <button
                                type="button"
                                onClick={() => setViewMode('express')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    viewMode === 'express' 
                                        ? 'bg-amber-500 text-slate-950 shadow-xs' 
                                        : 'text-slate-300 hover:text-white'
                                }`}
                            >
                                <Zap size={14} className="fill-current" />
                                <span>Rápido (10s)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('full')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    viewMode === 'full' 
                                        ? 'bg-amber-500 text-slate-950 shadow-xs' 
                                        : 'text-slate-300 hover:text-white'
                                }`}
                            >
                                <SlidersHorizontal size={14} />
                                <span>Completo</span>
                            </button>
                        </div>

                        {/* Botão Enriquecer com IA */}
                        <button
                            type="button"
                            onClick={() => onOpenEnrichWithAI(formData as Product)}
                            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                            title="Gerar ficha técnica e padronização com IA"
                        >
                            <Sparkles size={14} />
                            <span className="hidden sm:inline">IA</span>
                        </button>

                        {/* Botão Fechar */}
                        <button 
                            type="button"
                            onClick={onClose} 
                            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
                            title="Fechar"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* ALERTA DE ERRO DE VALIDAÇÃO */}
                {validationError && (
                    <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2 text-xs font-bold">
                        <AlertTriangle size={16} className="shrink-0 text-red-600" />
                        <span>{validationError}</span>
                    </div>
                )}

                {/* CORPO DO FORMULÁRIO */}
                <form onSubmit={e => handleSubmit(e, false)} className="p-5 sm:p-7 space-y-6 max-h-[72vh] overflow-y-auto">
                    
                    {/* ========================================================================= */}
                    {/* MODO EXPRESSO (CADASTRO RÁPIDO EM 10 SEGUNDOS) */}
                    {/* ========================================================================= */}
                    {viewMode === 'express' && (
                        <div className="space-y-5 animate-fade-in">
                            {/* Nome do Produto */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                                    <span>Nome Comercial do Produto *</span>
                                    <span className="text-[11px] text-gray-400 font-normal">Ex: Ducha Higiênica Inox / Furadeira de Impacto</span>
                                </label>
                                <input 
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none text-base font-bold text-slate-900 transition-all"
                                    placeholder="Digite o nome completo do produto..."
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    autoFocus
                                    required
                                />
                            </div>

                            {/* Preços e Custo */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                                        <DollarSign size={14} className="text-emerald-600" />
                                        <span>Preço de Venda (R$) *</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-sm">R$</span>
                                        <input 
                                            type="number"
                                            step="0.01"
                                            className="w-full pl-10 pr-3 py-3.5 bg-emerald-50/50 border border-emerald-300 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-bold text-emerald-950"
                                            placeholder="0.00"
                                            value={formData.price ?? ''}
                                            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                        <span>Preço de Custo (R$)</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                                        <input 
                                            type="number"
                                            step="0.01"
                                            className="w-full pl-10 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none text-base font-semibold text-slate-800"
                                            placeholder="0.00"
                                            value={formData.costPrice ?? ''}
                                            onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                        <span>Quantidade em Estoque *</span>
                                    </label>
                                    <input 
                                        type="number"
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none text-base font-bold text-slate-900 text-center"
                                        placeholder="10"
                                        value={formData.stock ?? ''}
                                        onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Categoria com Chips Rápidos */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Categoria Principal: <span className="text-amber-600 font-bold">{formData.category}</span>
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableCategories.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: cat })}
                                            className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                                                formData.category === cat
                                                    ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Foto Principal & Código */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                <div className="md:col-span-3 flex items-center gap-3">
                                    <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0 p-1 flex items-center justify-center">
                                        <img 
                                            src={formData.imageUrl || '/ponto_chave_logo.jpg'} 
                                            alt="Capa" 
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = '/ponto_chave_logo.jpg';
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-bold text-slate-500 uppercase block">Capa Padrão</span>
                                        <button
                                            type="button"
                                            onClick={() => onOpenMediaBank('main')}
                                            className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1 mt-0.5"
                                        >
                                            <ImageIcon size={12} />
                                            <span>Mudar Foto</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="md:col-span-5 space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 uppercase">URL da Imagem</label>
                                    <input 
                                        type="url"
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-1 focus:ring-amber-500"
                                        placeholder="https://... ou escolha um preset"
                                        value={formData.imageUrl || ''}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 uppercase">Código</label>
                                    <input 
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none text-center"
                                        placeholder="Ex: 1001"
                                        value={formData.code || ''}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 uppercase">SKU</label>
                                    <input 
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none text-center"
                                        placeholder="Ex: PCL-1001"
                                        value={formData.sku || ''}
                                        onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Status no BD: Ativo (Sim/Não) & Publicação na Vitrine & FLAG */}
                            <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/70 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-xs font-bold text-slate-800">Ativo no BD:</span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, isActive: true })}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    formData.isActive !== false ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                                                }`}
                                            >
                                                Sim (Ativo)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, isActive: false })}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    formData.isActive === false ? 'bg-rose-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                                                }`}
                                            >
                                                Não (Inativo)
                                            </button>
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                                        <input 
                                            type="checkbox"
                                            checked={formData.showInStore === true}
                                            onChange={e => setFormData({ ...formData, showInStore: e.target.checked })}
                                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer"
                                        />
                                        <span>
                                            {formData.showInStore === true 
                                                ? 'Ativo na Vitrine Principal' 
                                                : 'Não Ativo na Vitrine (Estoque Interno)'}
                                        </span>
                                    </label>
                                </div>

                                {/* FLAG Retirada no Ponto de Apoio ou Raio 15km */}
                                <label className="flex items-start gap-2.5 pt-2 border-t border-amber-200/60 cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={Boolean(formData.pickupOrLocal15kmOnly)}
                                        onChange={e => setFormData({ 
                                            ...formData, 
                                            pickupOrLocal15kmOnly: e.target.checked,
                                            isSpecialDelivery: e.target.checked ? true : formData.isSpecialDelivery
                                        })}
                                        className="w-4 h-4 mt-0.5 rounded text-amber-600 accent-amber-600 cursor-pointer"
                                    />
                                    <div className="space-y-0.5">
                                        <span className="text-xs font-bold text-amber-950 block">
                                            FLAG: Produto somente com retirada no nosso PONTO DE APOIO ou entrega num raio de até 15 km do nosso domicílio, com frete por conta do cliente.
                                        </span>
                                    </div>
                                </label>

                                <div className="flex justify-end pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('full')}
                                        className="text-xs text-amber-800 font-bold hover:underline flex items-center gap-1"
                                    >
                                        <span>Adicionar mais detalhes (Ficha técnica, NF, Impostos) &rarr;</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* MODO COMPLETO (FICHA TÉCNICA EM ABAS ORGANIZADAS) */}
                    {/* ========================================================================= */}
                    {viewMode === 'full' && (
                        <div className="space-y-5 animate-fade-in">
                            {/* NAVEGAÇÃO DAS ABAS */}
                            <div className="flex border-b border-gray-200 overflow-x-auto gap-1 pb-1">
                                {[
                                    { id: 'basics', label: '1. Comercial & NF', icon: Package },
                                    { id: 'tax', label: '2. Preços & Impostos', icon: Calculator },
                                    { id: 'media', label: '3. Fotos & Mídia', icon: ImageIcon },
                                    { id: 'specs', label: '4. Dimensões & Ficha', icon: Ruler },
                                    { id: 'status', label: '5. Promoção & Status', icon: Tag }
                                ].map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                                                isActive 
                                                    ? 'bg-slate-900 text-white shadow-xs' 
                                                    : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            <Icon size={14} />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* ABA 1: COMERCIAL & NF */}
                            {activeTab === 'basics' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Código / Ref.</label>
                                            <input 
                                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none font-mono font-bold"
                                                placeholder="Ex: 1001"
                                                value={formData.code || ''}
                                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase">SKU / Cód. Barras</label>
                                            <input 
                                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                                                placeholder="Ex: PCL-1001"
                                                value={formData.sku || ''}
                                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Nome Comercial *</label>
                                            <input 
                                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none font-semibold"
                                                placeholder="Ex: Ducha Higiênica Cromada com Gatilho Metálico"
                                                value={formData.name || ''}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Categoria</label>
                                            <select 
                                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                                                value={formData.category || 'Materiais Elétricos e Ferramentas'}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            >
                                                {availableCategories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Descrição Resumida</label>
                                            <input 
                                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                                                placeholder="Breve resumo comercial para o card da vitrine..."
                                                value={formData.description || ''}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Dados Fiscais e Fornecedor */}
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                                                <FileText size={14} /> Dados de Entrada & Fornecedor
                                            </h4>
                                            {editingProduct && onOpenRestock && (
                                                <button
                                                    type="button"
                                                    onClick={() => onOpenRestock(editingProduct)}
                                                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                                                >
                                                    <Truck size={12} />
                                                    <span>Repor Estoque / NF</span>
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-500 uppercase">Fornecedor / Marca</label>
                                                <input 
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                    placeholder="Ex: Tigre, Deca, Tramontina"
                                                    value={formData.supplierName || ''}
                                                    onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-500 uppercase">Nota Fiscal (NF)</label>
                                                <input 
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                    placeholder="Ex: NF-e 004920"
                                                    value={formData.invoiceNumber || ''}
                                                    onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-500 uppercase">Lote</label>
                                                <input 
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                    placeholder="Ex: LOT-2024/08"
                                                    value={formData.batchNumber || ''}
                                                    onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-500 uppercase">Data da Compra</label>
                                                <input 
                                                    type="date"
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                    value={formData.purchaseDate || ''}
                                                    onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ABA 2: PREÇOS & TRIBUTOS */}
                            {activeTab === 'tax' && (
                                <div className="space-y-4">
                                    <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-200/60 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                                                <Calculator size={14} className="text-amber-700" /> Formação de Preço de Venda
                                            </h4>
                                            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                                                Tributos: {taxSummary.totalTaxPercent.toFixed(1)}% (+R$ {taxSummary.totalTaxAmount.toFixed(2)})
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                            <div className="space-y-1 col-span-2 sm:col-span-1">
                                                <label className="text-xs font-bold text-gray-700 uppercase">Preço Custo (R$)</label>
                                                <input 
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-sm"
                                                    placeholder="0.00"
                                                    value={formData.costPrice ?? ''}
                                                    onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-600 uppercase">ICMS %</label>
                                                <input 
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                    value={formData.icmsPercent ?? ''}
                                                    onChange={e => setFormData({ ...formData, icmsPercent: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-600 uppercase">IPI %</label>
                                                <input 
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                    value={formData.ipiPercent ?? ''}
                                                    onChange={e => setFormData({ ...formData, ipiPercent: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-600 uppercase">PIS %</label>
                                                <input 
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                    value={formData.pisPercent ?? ''}
                                                    onChange={e => setFormData({ ...formData, pisPercent: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-600 uppercase">COFINS %</label>
                                                <input 
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                    value={formData.cofinsPercent ?? ''}
                                                    onChange={e => setFormData({ ...formData, cofinsPercent: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-600 uppercase">Outros %</label>
                                                <input 
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                    value={formData.otherTaxesPercent ?? ''}
                                                    onChange={e => setFormData({ ...formData, otherTaxesPercent: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>

                                        {/* Card para Atualizar e Aplicar Alteração do Preço de Custo por Margem de Índice Percentual */}
                                        <div className="bg-white/90 p-3.5 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2 font-bold text-amber-950">
                                                    <Calculator size={14} className="text-amber-700" />
                                                    <span>Atualizar Preço de Custo por Margem de Índice Percentual (%)</span>
                                                    {formData.table && (
                                                        <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                                                            {formData.table}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-500">
                                                    Custo Base Original da Tabela: <strong className="text-gray-800 font-bold">R$ {Number(formData.costPriceOriginal || formData.costPrice || 0).toFixed(2)}</strong>
                                                    {formData.costPriceLastAdjustmentDate && (
                                                        <span className="ml-2 text-[10px] text-gray-400">
                                                            • Última alteração aplicada: {new Date(formData.costPriceLastAdjustmentDate).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-300">
                                                    <span className="font-bold text-amber-900 text-xs">Índice:</span>
                                                    <input 
                                                        type="number"
                                                        step="0.1"
                                                        className="w-16 bg-white border border-amber-300 rounded-lg p-1 text-center font-bold text-amber-950 text-xs"
                                                        placeholder="0.0"
                                                        value={formData.costPriceMarginIndexPercent ?? ''}
                                                        onChange={e => setFormData({ ...formData, costPriceMarginIndexPercent: parseFloat(e.target.value) || 0 })}
                                                    />
                                                    <span className="font-bold text-amber-900 text-xs">%</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const base = Number(formData.costPriceOriginal || formData.costPrice || 0);
                                                        const pct = Number(formData.costPriceMarginIndexPercent || 0);
                                                        const newCost = Number((base * (1 + pct / 100)).toFixed(2));
                                                        setFormData({
                                                            ...formData,
                                                            costPriceOriginal: base,
                                                            costPrice: newCost,
                                                            costPriceLastAdjustmentDate: new Date().toISOString()
                                                        });
                                                    }}
                                                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition-all shadow-xs shrink-0 cursor-pointer"
                                                >
                                                    Aplicar ao Custo
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-4 rounded-xl border border-amber-200">
                                            <div className="md:col-span-4 space-y-1">
                                                <label className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1">
                                                    <TrendingUp size={14} className="text-emerald-600" />
                                                    <span>Margem de Lucro (%)</span>
                                                </label>
                                                <input 
                                                    type="number"
                                                    step="0.1"
                                                    className="w-full p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-sm font-bold text-emerald-950"
                                                    value={formData.profitMarginPercent ?? ''}
                                                    onChange={e => setFormData({ ...formData, profitMarginPercent: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div className="md:col-span-5 text-xs space-y-1">
                                                <div className="flex justify-between text-gray-500">
                                                    <span>Custo c/ Impostos:</span>
                                                    <span className="font-bold text-gray-800">R$ {taxSummary.costWithTaxes.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-emerald-700 font-semibold">
                                                    <span>Preço Sugerido:</span>
                                                    <span className="font-bold text-sm">R$ {taxSummary.suggestedPrice.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <div className="md:col-span-3">
                                                <button
                                                    type="button"
                                                    onClick={handleApplySuggestedPrice}
                                                    className="w-full px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                                                >
                                                    Aplicar Sugerido
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-700 uppercase">Preço de Venda Praticado (R$) *</label>
                                            <input 
                                                type="number"
                                                step="0.01"
                                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-lg font-bold text-slate-900 focus:bg-white"
                                                value={formData.price ?? ''}
                                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Estoque Atual *</label>
                                            <input 
                                                type="number"
                                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-lg font-bold text-slate-900 focus:bg-white"
                                                value={formData.stock ?? ''}
                                                onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Alerta Estoque Mínimo</label>
                                            <input 
                                                type="number"
                                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-lg font-bold text-slate-900 focus:bg-white"
                                                value={formData.minStock ?? ''}
                                                onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value, 10) || 0 })}
                                            />
                                        </div>
                                    </div>

                                    {/* Enquadramento Fiscal Legal */}
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                                            <FileText size={14} className="text-slate-700" /> Enquadramento Fiscal & Tributário Legal
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-600 uppercase">NCM</label>
                                                <input 
                                                    type="text"
                                                    className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                                                    placeholder="ex: 8544.49.00"
                                                    value={formData.ncm || ''}
                                                    onChange={e => setFormData({ ...formData, ncm: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-600 uppercase">CEST</label>
                                                <input 
                                                    type="text"
                                                    className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                                                    placeholder="ex: 10.052.00"
                                                    value={formData.cest || ''}
                                                    onChange={e => setFormData({ ...formData, cest: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-600 uppercase">CFOP</label>
                                                <input 
                                                    type="text"
                                                    className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                                                    placeholder="ex: 5.102"
                                                    value={formData.cfop || ''}
                                                    onChange={e => setFormData({ ...formData, cfop: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-600 uppercase">Origem</label>
                                                <input 
                                                    type="text"
                                                    className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs"
                                                    placeholder="ex: 0 - Nacional"
                                                    value={formData.taxOrigin || ''}
                                                    onChange={e => setFormData({ ...formData, taxOrigin: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ABA 3: FOTOS & MÍDIA */}
                            {activeTab === 'media' && (
                                <div className="space-y-4">
                                    {/* Capa Principal */}
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                                                <ImageIcon size={14} className="text-amber-600" />
                                                <span>Foto 1 • Capa Principal da Vitrine</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => onOpenMediaBank('main')}
                                                className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-xl flex items-center gap-1"
                                            >
                                                <ImageIcon size={12} />
                                                <span>Banco de Mídias</span>
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="url"
                                                className="flex-1 p-3 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                                                placeholder="URL da imagem (https://...)"
                                                value={formData.imageUrl || ''}
                                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                            />
                                            {formData.imageUrl && (
                                                <div className="w-12 h-12 rounded-xl border border-slate-200 bg-white p-1 shrink-0">
                                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Presets Rápidos */}
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {PRESET_IMAGES.map((preset, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                                                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                                                        formData.imageUrl === preset.url 
                                                            ? 'bg-slate-900 text-white border-slate-900 font-bold' 
                                                            : 'bg-white text-gray-700 border-gray-200 hover:border-slate-400'
                                                    }`}
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Galeria em Sequência */}
                                    <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                                                <ImagePlus size={14} className="text-amber-600" />
                                                <span>Fotos Adicionais da Galeria ({Array.isArray(formData.gallery) ? formData.gallery.length : 0})</span>
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={handleAddTwoGallerySlots}
                                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1"
                                                >
                                                    <PlusCircle size={12} />
                                                    <span>+ Foto 2 e 3</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddGalleryImage()}
                                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
                                                >
                                                    <Plus size={12} />
                                                    <span>+ 1 Foto</span>
                                                </button>
                                            </div>
                                        </div>

                                        {Array.isArray(formData.gallery) && formData.gallery.map((imgUrl, gIdx) => (
                                            <div key={gIdx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                                                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                                                    {gIdx + 2}
                                                </span>
                                                <input 
                                                    type="url"
                                                    className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-xs font-mono"
                                                    placeholder="URL da foto adicional..."
                                                    value={imgUrl || ''}
                                                    onChange={e => handleUpdateGalleryItem(gIdx, e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetGalleryAsMain(gIdx)}
                                                    className="px-2 py-1 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold"
                                                    title="Tornar Capa Principal"
                                                >
                                                    Virar Capa
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveGalleryItem(gIdx)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                                                    title="Remover"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Vídeo do YouTube */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Vídeo Demonstrativo (YouTube)</label>
                                        <input 
                                            type="url"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                                            placeholder="https://youtube.com/watch?v=..."
                                            value={formData.videoUrl || ''}
                                            onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ABA 4: DIMENSÕES & FICHA TÉCNICA */}
                            {activeTab === 'specs' && (
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                                            <Ruler size={14} /> Dimensões e Pesos
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-500 uppercase">Tamanho / Calibre</label>
                                                <input 
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                    placeholder="Ex: 3/4 pol, 32mm"
                                                    value={formData.dimensionsSize || ''}
                                                    onChange={e => setFormData({ ...formData, dimensionsSize: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-500 uppercase">Altura</label>
                                                <input 
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                    placeholder="Ex: 85 cm"
                                                    value={formData.height || ''}
                                                    onChange={e => setFormData({ ...formData, height: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-500 uppercase">Largura</label>
                                                <input 
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                    placeholder="Ex: 78 cm"
                                                    value={formData.width || ''}
                                                    onChange={e => setFormData({ ...formData, width: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-500 uppercase">Profundidade</label>
                                                <input 
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                    placeholder="Ex: 80 cm"
                                                    value={formData.length || ''}
                                                    onChange={e => setFormData({ ...formData, length: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-500 uppercase">Peso Bruto (kg)</label>
                                                <input 
                                                    type="number"
                                                    step="0.001"
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                    placeholder="1.250"
                                                    value={formData.grossWeight ?? ''}
                                                    onChange={e => setFormData({ ...formData, grossWeight: parseFloat(e.target.value) || undefined })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-500 uppercase">Peso Líquido (kg)</label>
                                                <input 
                                                    type="number"
                                                    step="0.001"
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                    placeholder="1.100"
                                                    value={formData.netWeight ?? ''}
                                                    onChange={e => setFormData({ ...formData, netWeight: parseFloat(e.target.value) || undefined })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-500 uppercase">Material</label>
                                                <input 
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                    placeholder="Metal / Inox / Plástico"
                                                    value={formData.material || ''}
                                                    onChange={e => setFormData({ ...formData, material: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-500 uppercase">Voltagem / Tensão</label>
                                                <input 
                                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                                                    placeholder="Bivolt / 110V / 220V"
                                                    value={formData.voltage || ''}
                                                    onChange={e => setFormData({ ...formData, voltage: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* FLAG: RETIRADA NO PONTO DE APOIO OU ENTREGA LOCAL 15KM */}
                                    <div className={`p-4 rounded-2xl border transition-all ${
                                        formData.pickupOrLocal15kmOnly 
                                            ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/30' 
                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}>
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                checked={Boolean(formData.pickupOrLocal15kmOnly)}
                                                onChange={e => setFormData({ 
                                                    ...formData, 
                                                    pickupOrLocal15kmOnly: e.target.checked,
                                                    isSpecialDelivery: e.target.checked ? true : formData.isSpecialDelivery
                                                })}
                                                className="w-5 h-5 mt-0.5 rounded text-amber-600 accent-amber-600 cursor-pointer"
                                            />
                                            <div className="space-y-1">
                                                <span className="font-bold text-xs text-slate-900 block leading-snug">
                                                    FLAG: Produto somente com retirada no nosso PONTO DE APOIO ou entrega num raio de até 15 km do nosso domicílio, com frete por conta do cliente.
                                                </span>
                                                <p className="text-[11px] text-slate-500 leading-normal">
                                                    Ao marcar esta opção, o produto terá restrição de frete para transportadoras e correios normais. O cliente poderá retirar presencialmente no ponto de apoio ou solicitar entrega expressa em raio de até 15 km com frete por conta do cliente.
                                                </p>
                                            </div>
                                        </label>
                                    </div>

                                    {/* LOGÍSTICA & ENTREGA ESPECIAL POR CEP (FORA DO PADRÃO DOS CORREIOS / TRANSPORTADORAS) */}
                                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200 space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
                                                <Truck size={15} className="text-indigo-600" /> Logística & Entrega por CEP (Fora do Padrão dos Correios / Transportadoras)
                                            </h4>
                                            <label className="flex items-center gap-2 font-bold text-xs cursor-pointer text-indigo-900 bg-white px-3 py-1.5 rounded-xl border border-indigo-200">
                                                <input 
                                                    type="checkbox"
                                                    checked={Boolean(formData.isSpecialDelivery)}
                                                    onChange={e => setFormData({ ...formData, isSpecialDelivery: e.target.checked })}
                                                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                                                />
                                                <span>Produto Fora do Padrão</span>
                                            </label>
                                        </div>

                                        {formData.isSpecialDelivery && (
                                            <div className="space-y-3 pt-1">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[11px] font-bold text-indigo-950 uppercase">Código / Rota de Entrega por CEP</label>
                                                        <input 
                                                            className="w-full p-2.5 bg-white border border-indigo-300 rounded-xl text-xs font-bold text-indigo-950"
                                                            placeholder="Ex: CEP-ESPECIAL-FORA-PADRAO"
                                                            value={formData.specialDeliveryCepCode || ''}
                                                            onChange={e => setFormData({ ...formData, specialDeliveryCepCode: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[11px] font-bold text-indigo-950 uppercase">Faixas de CEP / Região Atendida</label>
                                                        <input 
                                                            className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-xs"
                                                            placeholder="Ex: 30000-000 a 34999-999 (BH e Região Metropolitana)"
                                                            value={formData.specialDeliveryCepRange || ''}
                                                            onChange={e => setFormData({ ...formData, specialDeliveryCepRange: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-indigo-950 uppercase">Instruções de Transporte & Logística Dedicada</label>
                                                    <textarea 
                                                        className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-xs min-h-[55px] outline-none"
                                                        placeholder="Instruções para frete especial, dimensões acima de 100cm, cargas volumosas, transporte rodoviário dedicado ou carreto local..."
                                                        value={formData.specialDeliveryNotes || ''}
                                                        onChange={e => setFormData({ ...formData, specialDeliveryNotes: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Ficha Técnica Detalhada & Normas ABNT</label>
                                        <textarea 
                                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs min-h-[90px] outline-none focus:bg-white"
                                            placeholder="Descreva materiais, normas técnicas, recomendações de instalação..."
                                            value={formData.technicalSpecs || ''}
                                            onChange={e => setFormData({ ...formData, technicalSpecs: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ABA 5: STATUS, PROMOÇÃO & VIGÊNCIA */}
                            {activeTab === 'status' && (
                                <div className="space-y-4">
                                    {/* Promoção */}
                                    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 font-bold text-xs text-slate-800">
                                                <input 
                                                    type="checkbox"
                                                    checked={Boolean(formData.isPromo)}
                                                    onChange={e => setFormData({ ...formData, isPromo: e.target.checked })}
                                                    className="w-4 h-4 rounded text-red-600 accent-red-600"
                                                />
                                                <span>Ativar Preço Promocional (Sazonal)</span>
                                            </label>
                                        </div>
                                        {formData.isPromo && (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Preço Promo (R$)</label>
                                                    <input 
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700"
                                                        placeholder="0.00"
                                                        value={formData.promoPrice ?? ''}
                                                        onChange={e => setFormData({ ...formData, promoPrice: parseFloat(e.target.value) || 0 })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Data Início</label>
                                                    <input 
                                                        type="date"
                                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                        value={formData.promoStartDate || ''}
                                                        onChange={e => setFormData({ ...formData, promoStartDate: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Data Fim</label>
                                                    <input 
                                                        type="date"
                                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                                                        value={formData.promoEndDate || ''}
                                                        onChange={e => setFormData({ ...formData, promoEndDate: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                     {/* Status no BD: Ativo (Sim / Não) */}
                                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-900">Status no Banco de Dados: Ativo (Sim / Não)</h4>
                                                <p className="text-[11px] text-slate-500">Define se o produto está cadastrado como ativo no sistema para movimentações e vendas.</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, isActive: true })}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                        formData.isActive !== false 
                                                            ? 'bg-emerald-600 text-white shadow-xs' 
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    Sim (Ativo)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, isActive: false })}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                        formData.isActive === false 
                                                            ? 'bg-rose-600 text-white shadow-xs' 
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    Não (Inativo)
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visibilidade da Vitrine e Ativo */}
                                    <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-wide">Exibição na Página Principal</h4>
                                                <p className="text-[11px] text-slate-400">Controle se os clientes podem ver e comprar este produto na página principal.</p>
                                            </div>
                                            <label className="flex items-center gap-2 cursor-pointer bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold">
                                                <input 
                                                    type="checkbox"
                                                    checked={formData.showInStore === true}
                                                    onChange={e => setFormData({ ...formData, showInStore: e.target.checked })}
                                                    className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                                                />
                                                <span>{formData.showInStore === true ? 'Ativo na Principal' : 'Não Ativo'}</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* CLASSE & DEPARTAMENTO (CONFORME SOLICITADO NO PDF - ALTERAR, INCLUIR, EXCLUIR) */}
                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-blue-50/50 border-2 border-amber-300 shadow-sm space-y-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                                                    <LayoutGrid size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                                        Classificação & Departamento do Produto
                                                        <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                                                            Alinhado à Página Principal
                                                        </span>
                                                    </h4>
                                                    <p className="text-[11px] text-slate-600">
                                                        Defina a <strong>Classe</strong> e o <strong>Departamento</strong> deste produto. Você pode preencher livremente, selecionar, incluir novas opções, alterar ou excluir.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* GRID 2 COLUNAS: CLASSE e DEPARTAMENTO */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            
                                            {/* BLOCO 1: CLASSE */}
                                            <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-xs space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                                        <Tag size={14} className="text-amber-600" />
                                                        Classe do Produto
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewClassInput(!showNewClassInput)}
                                                        className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                                                    >
                                                        <Plus size={12} />
                                                        Incluir Nova Classe
                                                    </button>
                                                </div>

                                                {/* Input de inclusão rápida de nova classe */}
                                                {showNewClassInput && (
                                                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 space-y-2">
                                                        <p className="text-[10px] font-bold text-amber-900 uppercase">Nome da nova classe:</p>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={newClassInput}
                                                                onChange={e => setNewClassInput(e.target.value)}
                                                                placeholder="Ex: Cabos & Conduítes..."
                                                                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white focus:ring-1 focus:ring-amber-500 outline-none"
                                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddClass(); } }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={handleAddClass}
                                                                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shrink-0"
                                                            >
                                                                Salvar
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Campo editável: CLASSE [PREENCHER] */}
                                                <div>
                                                    <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center justify-between">
                                                        <span>Classe atual (Preenchimento livre):</span>
                                                        {formData.productClass && (
                                                            <span className="text-amber-700 font-bold">
                                                                {formData.productClass}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <input 
                                                        type="text"
                                                        value={formData.productClass || ''}
                                                        onChange={e => setFormData({ ...formData, productClass: e.target.value })}
                                                        placeholder="Preencha ou selecione uma classe abaixo..."
                                                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl border-2 border-amber-300 focus:border-amber-500 focus:bg-amber-50/30 outline-none transition-all"
                                                    />
                                                </div>

                                                {/* Lista e gerenciador de classes (Selecionar / Alterar / Excluir) */}
                                                <div className="space-y-1.5 pt-1">
                                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                                        Selecionar ou Gerenciar Classes:
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                                                        {taxonomy.classes.map(c => {
                                                            const isSelected = formData.productClass === c;
                                                            const isEditing = editingClassTarget === c;

                                                            if (isEditing) {
                                                                return (
                                                                    <div key={c} className="flex items-center gap-1 bg-white p-1 rounded-md border border-amber-400 shadow-xs">
                                                                        <input
                                                                            type="text"
                                                                            value={editingClassVal}
                                                                            onChange={e => setEditingClassVal(e.target.value)}
                                                                            className="text-[11px] px-1.5 py-0.5 border rounded outline-none w-28"
                                                                            autoFocus
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleSaveEditClass(c)}
                                                                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                                                            title="Salvar alteração"
                                                                        >
                                                                            <Check size={12} />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEditingClassTarget(null)}
                                                                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                                                            title="Cancelar"
                                                                        >
                                                                            <X size={12} />
                                                                        </button>
                                                                    </div>
                                                                );
                                                            }

                                                            return (
                                                                <div 
                                                                    key={c}
                                                                    className={`group inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                                                                        isSelected 
                                                                            ? 'bg-amber-600 text-white font-bold shadow-xs' 
                                                                            : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
                                                                    }`}
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFormData(prev => ({ 
                                                                                ...prev, 
                                                                                productClass: c,
                                                                                category: prev.category || c 
                                                                            }));
                                                                        }}
                                                                        className="text-left"
                                                                    >
                                                                        {c}
                                                                    </button>
                                                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-1 pl-1 border-l border-slate-300">
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setEditingClassTarget(c);
                                                                                setEditingClassVal(c);
                                                                            }}
                                                                            className={`p-0.5 rounded hover:bg-black/10 ${isSelected ? 'text-white' : 'text-slate-500'}`}
                                                                            title="Alterar classe"
                                                                        >
                                                                            <Edit2 size={10} />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteClass(c);
                                                                            }}
                                                                            className={`p-0.5 rounded hover:bg-rose-100 hover:text-rose-700 ${isSelected ? 'text-white' : 'text-slate-500'}`}
                                                                            title="Excluir classe"
                                                                        >
                                                                            <Trash2 size={10} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* BLOCO 2: DEPARTAMENTO */}
                                            <div className="p-4 rounded-xl bg-white border border-blue-200 shadow-xs space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                                        <Boxes size={14} className="text-blue-600" />
                                                        Departamento do Produto
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewDeptInput(!showNewDeptInput)}
                                                        className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                                                    >
                                                        <Plus size={12} />
                                                        Incluir Novo Departamento
                                                    </button>
                                                </div>

                                                {/* Input de inclusão rápida de novo departamento */}
                                                {showNewDeptInput && (
                                                    <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-300 space-y-2">
                                                        <p className="text-[10px] font-bold text-blue-900 uppercase">Nome do novo departamento:</p>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={newDeptInput}
                                                                onChange={e => setNewDeptInput(e.target.value)}
                                                                placeholder="Ex: Instalações & Redes..."
                                                                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-blue-300 bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddDepartment(); } }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={handleAddDepartment}
                                                                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shrink-0"
                                                            >
                                                                Salvar
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Campo editável: DEPARTAMENTO [PREENCHER] */}
                                                <div>
                                                    <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center justify-between">
                                                        <span>Departamento atual (Preenchimento livre):</span>
                                                        {formData.department && (
                                                            <span className="text-blue-700 font-bold">
                                                                {formData.department}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <input 
                                                        type="text"
                                                        value={formData.department || ''}
                                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                                        placeholder="Preencha ou selecione um departamento abaixo..."
                                                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl border-2 border-blue-300 focus:border-blue-500 focus:bg-blue-50/30 outline-none transition-all"
                                                    />
                                                </div>

                                                {/* Lista e gerenciador de departamentos (Selecionar / Alterar / Excluir) */}
                                                <div className="space-y-1.5 pt-1">
                                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                                        Selecionar ou Gerenciar Departamentos:
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                                                        {taxonomy.departments.map(d => {
                                                            const isSelected = formData.department === d;
                                                            const isEditing = editingDeptTarget === d;

                                                            if (isEditing) {
                                                                return (
                                                                    <div key={d} className="flex items-center gap-1 bg-white p-1 rounded-md border border-blue-400 shadow-xs">
                                                                        <input
                                                                            type="text"
                                                                            value={editingDeptVal}
                                                                            onChange={e => setEditingDeptVal(e.target.value)}
                                                                            className="text-[11px] px-1.5 py-0.5 border rounded outline-none w-28"
                                                                            autoFocus
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleSaveEditDept(d)}
                                                                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                                                            title="Salvar alteração"
                                                                        >
                                                                            <Check size={12} />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEditingDeptTarget(null)}
                                                                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                                                            title="Cancelar"
                                                                        >
                                                                            <X size={12} />
                                                                        </button>
                                                                    </div>
                                                                );
                                                            }

                                                            return (
                                                                <div 
                                                                    key={d}
                                                                    className={`group inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                                                                        isSelected 
                                                                            ? 'bg-blue-600 text-white font-bold shadow-xs' 
                                                                            : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
                                                                    }`}
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFormData(prev => ({ 
                                                                                ...prev, 
                                                                                department: d 
                                                                            }));
                                                                        }}
                                                                        className="text-left"
                                                                    >
                                                                        {d}
                                                                    </button>
                                                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-1 pl-1 border-l border-slate-300">
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setEditingDeptTarget(d);
                                                                                setEditingDeptVal(d);
                                                                            }}
                                                                            className={`p-0.5 rounded hover:bg-black/10 ${isSelected ? 'text-white' : 'text-slate-500'}`}
                                                                            title="Alterar departamento"
                                                                        >
                                                                            <Edit2 size={10} />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteDept(d);
                                                                            }}
                                                                            className={`p-0.5 rounded hover:bg-rose-100 hover:text-rose-700 ${isSelected ? 'text-white' : 'text-slate-500'}`}
                                                                            title="Excluir departamento"
                                                                        >
                                                                            <Trash2 size={10} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                        {/* Barra explicativa dos 13 itens oficiais da vitrine */}
                                        <div className="p-3 rounded-xl bg-amber-100/60 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">13 Categorias da Vitrine Principal:</span>
                                                <span className="text-[11px] text-amber-900">
                                                    1) Material Elétrico, 2) Material Hidráulico, 3) Ferramentas, 4) Iluminação, 5) Segurança EPI, 6) Telefonia TI Segurança, 7) Tintas Vernizes Acabamento, 8) Casa Jardim Agrícola, 9) Utilidades Ferragens, 10) Promoção, 11) Kits Combos, 12) Presentes, 13) Todos.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* RODAPÉ DO FORMULÁRIO COM BOTÕES DE AÇÃO RÁPIDA */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-gray-100">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="w-full sm:w-auto px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            {/* Botão de Salvar e Criar Outro (Disponível no cadastro de novo produto) */}
                            {!editingProduct && (
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => handleSubmit(undefined, true)}
                                    className="w-full sm:w-auto px-5 py-3 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-2xl font-bold text-xs transition-all shadow-xs active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                                    title="Salva este produto e limpa os campos para cadastrar o próximo imediatamente"
                                >
                                    <PlusCircle size={15} />
                                    <span>Salvar e Cadastrar Outro</span>
                                </button>
                            )}

                            {/* Botão Principal de Salvar */}
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isSaving ? (
                                    <span>Salvando produto...</span>
                                ) : (
                                    <>
                                        <Check size={16} className="text-amber-400" />
                                        <span>{editingProduct ? 'Atualizar Produto' : 'Cadastrar Produto'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
