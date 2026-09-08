import React, { useState, useEffect, useMemo } from 'react';
import { 
    X, 
    Check, 
    Sparkles, 
    Plus, 
    Trash2, 
    DollarSign, 
    Package, 
    Boxes, 
    Layers, 
    Hammer, 
    Home, 
    Zap, 
    Wrench, 
    Paintbrush, 
    KeyRound, 
    Image as ImageIcon,
    Tag,
    Calculator,
    Info,
    Search
} from 'lucide-react';
import { Product } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface KitItemEntry {
    name: string;
    quantity: number;
    code?: string;
    unitPrice?: number;
}

interface KitTemplate {
    id: string;
    title: string;
    icon: any;
    color: string;
    defaultName: string;
    defaultCategory: string;
    defaultPrice: number;
    defaultCostPrice: number;
    defaultImageUrl: string;
    items: KitItemEntry[];
    description: string;
}

const KIT_TEMPLATES: KitTemplate[] = [
    {
        id: 'pedreiro',
        title: 'Kit Pedreiro Profissional',
        icon: Hammer,
        color: 'from-amber-600 to-yellow-600 text-white border-amber-500',
        defaultName: 'Kit Pedreiro Profissional Completo - 7 Itens',
        defaultCategory: 'Kits & Combos',
        defaultPrice: 189.90,
        defaultCostPrice: 110.00,
        defaultImageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800',
        items: [
            { name: 'Desempenadeira de Aço Dentada 12x29cm Famastil', quantity: 1, unitPrice: 32.50 },
            { name: 'Colher de Pedreiro Canto Reto 8" Famastil', quantity: 1, unitPrice: 28.90 },
            { name: 'Nível de Alumínio 30cm (12") com 3 Bolhas', quantity: 1, unitPrice: 24.90 },
            { name: 'Martelo de Unha 27mm Cabo Fibra Emborrachado', quantity: 1, unitPrice: 42.00 },
            { name: 'Linha de Pedreiro Trançada 100 Metros', quantity: 1, unitPrice: 9.90 },
            { name: 'Trena Métrica Emborrachada 5 Metros c/ Trava', quantity: 1, unitPrice: 18.50 },
            { name: 'Par de Luvas de Proteção Pigmentada Antiderrapante', quantity: 2, unitPrice: 8.00 }
        ],
        description: 'Kit completo de ferramentas manuais para alvenaria, reboco e assentamento de pisos. Itens reforçados com alta durabilidade e acabamento profissional.'
    },
    {
        id: 'dona_de_casa',
        title: 'Kit Dona de Casa & Praticidade',
        icon: Home,
        color: 'from-rose-500 to-pink-600 text-white border-rose-400',
        defaultName: 'Kit Dona de Casa Praticidade & Organização do Lar',
        defaultCategory: 'Kits & Combos',
        defaultPrice: 149.90,
        defaultCostPrice: 85.00,
        defaultImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
        items: [
            { name: 'Mop Giratório com Balde Centrifugador de Inox', quantity: 1, unitPrice: 89.90 },
            { name: 'Jogo de 5 Panos de Microfibra Multiuso Absorventes', quantity: 1, unitPrice: 22.00 },
            { name: 'Pulverizador / Borrifador Graduado Multiuso 500ml', quantity: 1, unitPrice: 12.50 },
            { name: 'Fita Dupla Face Fixa Forte Transparente 2m', quantity: 1, unitPrice: 15.00 },
            { name: 'Escova Multiuso Anatômica para Cantos e Rejuntes', quantity: 1, unitPrice: 10.50 }
        ],
        description: 'Conjunto essencial para facilidade na limpeza diária e organização doméstica. Prático, eficiente e com alta durabilidade.'
    },
    {
        id: 'utilidades_lar',
        title: 'Kit Utilidades & Reparos do Lar',
        icon: Wrench,
        color: 'from-emerald-600 to-teal-700 text-white border-emerald-500',
        defaultName: 'Kit Utilidades do Lar & Pequenos Reparos',
        defaultCategory: 'Kits & Combos',
        defaultPrice: 119.90,
        defaultCostPrice: 65.00,
        defaultImageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=800',
        items: [
            { name: 'Jogo de Chaves de Precisão e Fenda/Phillips (6 peças)', quantity: 1, unitPrice: 28.00 },
            { name: 'Martelo Pequeno Multiuso 20mm', quantity: 1, unitPrice: 25.00 },
            { name: 'Caixa Organizadora com Buchas e Parafusos (6mm, 8mm)', quantity: 1, unitPrice: 19.90 },
            { name: 'Trena Métrica Compacta 3 Metros', quantity: 1, unitPrice: 12.00 },
            { name: 'Fita Veda Rosca 18mm x 10m Foxlux', quantity: 2, unitPrice: 4.50 },
            { name: 'Cola Instantânea Multiuso Alta Fixação 20g', quantity: 1, unitPrice: 9.90 }
        ],
        description: 'Kit de socorro para qualquer residência: ideal para fixar quadros, trocar chuveiro, apertar parafusos e resolver reparos rápidos sem precisar de técnico.'
    },
    {
        id: 'eletricista',
        title: 'Kit Eletricista Instalador',
        icon: Zap,
        color: 'from-yellow-500 to-amber-600 text-slate-950 border-yellow-400 font-bold',
        defaultName: 'Kit Eletricista Instalador Profissional 1000V',
        defaultCategory: 'Kits & Combos',
        defaultPrice: 219.90,
        defaultCostPrice: 130.00,
        defaultImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
        items: [
            { name: 'Alicate Universal 8" Isolado 1000V Foxlux/Tramontina', quantity: 1, unitPrice: 48.00 },
            { name: 'Jogo de Chaves Fenda e Phillips Isoladas 1000V (6 peças)', quantity: 1, unitPrice: 55.00 },
            { name: 'Chave de Teste de Tensão Digital / Polaridade', quantity: 1, unitPrice: 18.00 },
            { name: 'Fita Isolante Foxlux Antichama 19mm x 20m', quantity: 3, unitPrice: 7.50 },
            { name: 'Passa Fio com Alma de Aço e Ponta Metálica 15 Metros', quantity: 1, unitPrice: 29.90 },
            { name: 'Estilete Profissional Emborrachado com Trava 18mm', quantity: 1, unitPrice: 14.50 }
        ],
        description: 'Equipamento técnico de segurança com certificação de isolação para instalações elétricas residenciais e prediais.'
    },
    {
        id: 'pintor',
        title: 'Kit Pintor Imobiliário',
        icon: Paintbrush,
        color: 'from-blue-600 to-indigo-700 text-white border-blue-500',
        defaultName: 'Kit Pintura & Acabamento Imobiliário Completo',
        defaultCategory: 'Kits & Combos',
        defaultPrice: 139.90,
        defaultCostPrice: 78.00,
        defaultImageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800',
        items: [
            { name: 'Rolo de Pintura Lã Antirrespingo 23cm com Cabo', quantity: 1, unitPrice: 32.00 },
            { name: 'Trincha / Pincel Cerdas Gris 2" Famastil', quantity: 1, unitPrice: 14.50 },
            { name: 'Trincha / Pincel Cerdas Gris 1" Famastil', quantity: 1, unitPrice: 9.50 },
            { name: 'Bandeja de Pintura Plástica Reforçada 23cm', quantity: 1, unitPrice: 16.00 },
            { name: 'Espátula de Aço Inox para Massa 8cm', quantity: 1, unitPrice: 18.00 },
            { name: 'Fita Crepe Automotiva / Pintura 24mm x 50m', quantity: 2, unitPrice: 11.00 },
            { name: 'Jogo de Lixas para Parede e Massa (Sortidas)', quantity: 5, unitPrice: 2.00 }
        ],
        description: 'Conjunto completo para pintura de paredes, tetos e esquadrias. Proporciona acabamento liso e sem marcas de respingos.'
    },
    {
        id: 'chaveiro',
        title: 'Kit Chaveiro & Fechaduras',
        icon: KeyRound,
        color: 'from-purple-600 to-violet-700 text-white border-purple-500',
        defaultName: 'Kit Chaveiro & Segurança Residencial',
        defaultCategory: 'Kits & Combos',
        defaultPrice: 169.90,
        defaultCostPrice: 95.00,
        defaultImageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800',
        items: [
            { name: 'Lubrificante de Grafite em Pó Especial 25g', quantity: 2, unitPrice: 9.00 },
            { name: 'Cadeado de Latão Maciço 30mm com 2 Chaves', quantity: 1, unitPrice: 32.00 },
            { name: 'Cadeado de Latão Maciço 40mm com 2 Chaves', quantity: 1, unitPrice: 46.00 },
            { name: 'Fecho / Trinco de Sobrepor Redondo com Porta Cadeado', quantity: 1, unitPrice: 24.00 },
            { name: 'Mola Aérea Hidráulica para Porta de Alumínio / Madeira', quantity: 1, unitPrice: 89.00 }
        ],
        description: 'Kit de manutenção de fechaduras, proteção de portões e reforço de segurança patrimonial para casas e empresas.'
    }
];

interface KitBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveKit: (payload: Partial<Product>) => Promise<void>;
    allProducts?: Product[];
    editingKit?: Product | null;
}

export const KitBuilderModal: React.FC<KitBuilderModalProps> = ({
    isOpen,
    onClose,
    onSaveKit,
    allProducts = [],
    editingKit
}) => {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('pedreiro');
    const [kitName, setKitName] = useState<string>('');
    const [kitCode, setKitCode] = useState<string>('');
    const [kitPrice, setKitPrice] = useState<number | string>('');
    const [kitCostPrice, setKitCostPrice] = useState<number | string>('');
    const [kitStock, setKitStock] = useState<number | string>(10);
    const [kitImageUrl, setKitImageUrl] = useState<string>('');
    const [kitDescription, setKitDescription] = useState<string>('');
    const [itemsList, setItemsList] = useState<KitItemEntry[]>([]);
    
    // Novo item avulso
    const [newItemName, setNewItemName] = useState('');
    const [newItemQty, setNewItemQty] = useState(1);
    const [newItemPrice, setNewItemPrice] = useState<string>('');
    const [catalogSearch, setCatalogSearch] = useState('');

    const [isSaving, setIsSaving] = useState(false);

    // Carrega template ou kit existente
    useEffect(() => {
        if (!isOpen) return;

        if (editingKit) {
            setKitName(editingKit.name || '');
            setKitCode(editingKit.code || `KIT-${Date.now().toString().slice(-4)}`);
            setKitPrice(editingKit.price || '');
            setKitCostPrice(editingKit.costPrice || '');
            setKitStock(editingKit.stock ?? 10);
            setKitImageUrl(editingKit.imageUrl || '/ponto_chave_logo.jpg');
            setKitDescription(editingKit.description || '');
            setItemsList(editingKit.kitItems || []);
        } else {
            // Seleciona template default 'pedreiro'
            applyTemplate('pedreiro');
        }
    }, [isOpen, editingKit]);

    const applyTemplate = (templateId: string) => {
        setSelectedTemplateId(templateId);
        const tpl = KIT_TEMPLATES.find(t => t.id === templateId);
        if (!tpl) return;

        setKitName(tpl.defaultName);
        setKitCode(`KIT-${tpl.id.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`);
        setKitPrice(tpl.defaultPrice);
        setKitCostPrice(tpl.defaultCostPrice);
        setKitStock(10);
        setKitImageUrl(tpl.defaultImageUrl);
        setItemsList([...tpl.items]);
        setKitDescription(tpl.description);
    };

    // Atualiza descrição com a lista de itens
    const generateFormattedDescription = (desc: string, items: KitItemEntry[]) => {
        let base = desc || 'Kit de ferramentas e utilidades montado.';
        if (items.length > 0) {
            base += '\n\n📦 Itens Inclusos no Kit:';
            items.forEach((it, idx) => {
                base += `\n${idx + 1}. (${it.quantity}x) ${it.name}`;
            });
        }
        return base;
    };

    // Adiciona item avulso na lista
    const handleAddItem = () => {
        if (!newItemName.trim()) return;
        const entry: KitItemEntry = {
            name: newItemName.trim(),
            quantity: Number(newItemQty) || 1,
            unitPrice: parseFloat(newItemPrice) || undefined
        };
        setItemsList(prev => [...prev, entry]);
        setNewItemName('');
        setNewItemQty(1);
        setNewItemPrice('');
    };

    // Adiciona produto do catálogo existente ao kit
    const handleAddFromCatalog = (product: Product) => {
        const entry: KitItemEntry = {
            name: product.name,
            quantity: 1,
            code: product.code,
            unitPrice: product.price
        };
        setItemsList(prev => [...prev, entry]);
        setCatalogSearch('');
    };

    // Remove item da lista
    const handleRemoveItem = (index: number) => {
        setItemsList(prev => prev.filter((_, i) => i !== index));
    };

    // Altera quantidade de um item
    const handleUpdateQty = (index: number, qty: number) => {
        if (qty < 1) return;
        setItemsList(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], quantity: qty };
            return copy;
        });
    };

    // Sugestão de soma dos itens
    const itemsTotalEstimate = useMemo(() => {
        return itemsList.reduce((sum, it) => sum + (it.unitPrice || 0) * it.quantity, 0);
    }, [itemsList]);

    // Busca rápida no catálogo para puxar peças
    const filteredCatalog = useMemo(() => {
        if (!catalogSearch.trim()) return [];
        const term = catalogSearch.toLowerCase().trim();
        return allProducts
            .filter(p => (p.name && p.name.toLowerCase().includes(term)) || (p.code && p.code.toLowerCase().includes(term)))
            .slice(0, 6);
    }, [allProducts, catalogSearch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!kitName.trim()) {
            alert('Por favor, informe o nome do Kit.');
            return;
        }

        const priceNum = parseFloat(String(kitPrice)) || 0;
        if (priceNum <= 0) {
            alert('Por favor, informe um preço de venda válido para o Kit.');
            return;
        }

        setIsSaving(true);
        try {
            const finalDesc = generateFormattedDescription(kitDescription, itemsList);
            const payload: Partial<Product> = {
                ...(editingKit ? { id: editingKit.id } : {}),
                name: kitName.trim(),
                code: kitCode.trim() || `KIT-${Date.now().toString().slice(-4)}`,
                sku: kitCode.trim() || `KIT-${Date.now().toString().slice(-4)}`,
                price: priceNum,
                costPrice: parseFloat(String(kitCostPrice)) || 0,
                stock: parseInt(String(kitStock), 10) || 0,
                category: 'Kits & Combos',
                department: 'Kits & Utilidades',
                packagingType: 'Kit',
                isKit: true,
                kitItems: itemsList,
                imageUrl: kitImageUrl.trim() || '/ponto_chave_logo.jpg',
                description: finalDesc,
                showInStore: true,
                isActive: true
            };

            await onSaveKit(payload);
            onClose();
        } catch (err: any) {
            console.error('Erro ao salvar kit:', err);
            alert('Erro ao salvar Kit: ' + (err.message || 'Verifique sua conexão.'));
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-violet-800 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                                <Boxes size={26} className="text-yellow-300" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 bg-yellow-400 text-purple-950 text-[10px] font-black rounded-full uppercase tracking-wider">
                                        Central de Kits & Combos
                                    </span>
                                    <span className="text-purple-200 text-xs font-semibold">
                                        Ponto Chave do Lar
                                    </span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black font-serif mt-0.5">
                                    {editingKit ? 'Editar Kit Cadastrado' : 'Montar & Cadastrar Novo Kit'}
                                </h2>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Scrollable */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                        {/* Seção 1: Modelos Prontos de Kits (Templates 1-clique) */}
                        {!editingKit && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                                        <Sparkles size={15} className="text-purple-600" />
                                        <span>1. Escolha um Modelo Pronto ou Monte Personalizado</span>
                                    </label>
                                    <span className="text-[11px] text-slate-500">Clique para preencher tudo em 1 segundo</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                                    {KIT_TEMPLATES.map((tpl) => {
                                        const IconComp = tpl.icon;
                                        const isSelected = selectedTemplateId === tpl.id;
                                        return (
                                            <button
                                                key={tpl.id}
                                                type="button"
                                                onClick={() => applyTemplate(tpl.id)}
                                                className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between cursor-pointer ${
                                                    isSelected
                                                        ? `bg-gradient-to-br ${tpl.color} shadow-lg ring-2 ring-purple-500 scale-[1.02]`
                                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50/50 hover:border-purple-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <IconComp size={18} className={isSelected ? 'text-yellow-300' : 'text-purple-600'} />
                                                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                                                        isSelected ? 'bg-black/30 text-white' : 'bg-slate-200 text-slate-700'
                                                    }`}>
                                                        {tpl.items.length} itens
                                                    </span>
                                                </div>
                                                <span className={`text-xs font-black line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                                    {tpl.title}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Seção 2: Dados Básicos do Kit */}
                        <div className="bg-purple-50/50 border border-purple-200 rounded-3xl p-5 space-y-4">
                            <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Package size={15} className="text-purple-600" />
                                <span>2. Identificação do Kit</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-8 space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Nome Comercial do Kit *</label>
                                    <input
                                        type="text"
                                        value={kitName}
                                        onChange={(e) => setKitName(e.target.value)}
                                        placeholder="Ex: Kit Pedreiro Profissional - 7 Peças"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-4 space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Código / SKU do Kit</label>
                                    <input
                                        type="text"
                                        value={kitCode}
                                        onChange={(e) => setKitCode(e.target.value)}
                                        placeholder="Ex: KIT-PED-01"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none uppercase"
                                    />
                                </div>
                            </div>

                            {/* Preços e Estoque */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                                        <DollarSign size={14} className="text-emerald-600" />
                                        <span>Preço de Venda do Kit (R$) *</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-sm">R$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={kitPrice}
                                            onChange={(e) => setKitPrice(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-10 pr-3 py-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-base font-bold text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                            required
                                        />
                                    </div>
                                    {itemsTotalEstimate > 0 && (
                                        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                                            <span>Soma avulsa dos itens:</span>
                                            <span className="font-mono font-bold text-slate-700">R$ {itemsTotalEstimate.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                        <span>Preço de Custo Total (R$)</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={kitCostPrice}
                                            onChange={(e) => setKitCostPrice(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                        <span>Quantidade em Estoque (Kits) *</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={kitStock}
                                        onChange={(e) => setKitStock(e.target.value)}
                                        placeholder="10"
                                        className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 text-center focus:ring-2 focus:ring-purple-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Seção 3: Composição dos Itens do Kit */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <Layers size={15} className="text-purple-600" />
                                    <span>3. Itens Inclusos na Composição ({itemsList.length})</span>
                                </h3>
                                <span className="text-[11px] text-slate-500">Estes itens aparecerão na descrição e ficha do produto</span>
                            </div>

                            {/* Lista de Itens */}
                            {itemsList.length === 0 ? (
                                <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs">
                                    Nenhum item adicionado ainda. Adicione abaixo os produtos que compõem este Kit.
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {itemsList.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                                            <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                                                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-mono font-bold flex items-center justify-center shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                                                    {item.unitPrice && (
                                                        <span className="text-[11px] text-slate-500">
                                                            Preço Ref: R$ {item.unitPrice.toFixed(2)} cada
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200">
                                                    <span className="text-[10px] text-slate-500 font-bold">Qtd:</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateQty(idx, item.quantity - 1)}
                                                        className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-mono font-bold w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateQty(idx, item.quantity + 1)}
                                                        className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(idx)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Remover item do kit"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Form de Adicionar Novo Item Manual */}
                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                                <span className="text-[11px] font-bold text-slate-700 uppercase block">
                                    + Adicionar Item ao Kit (Manual ou Catálogo)
                                </span>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nome da peça (ex: Alicate Universal 8 polegadas)..."
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        className="sm:col-span-7 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Qtd"
                                        value={newItemQty}
                                        onChange={(e) => setNewItemQty(parseInt(e.target.value, 10) || 1)}
                                        className="sm:col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-center font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="R$ Ref"
                                        value={newItemPrice}
                                        onChange={(e) => setNewItemPrice(e.target.value)}
                                        className="sm:col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-center focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="sm:col-span-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center justify-center py-2 transition-all cursor-pointer font-bold"
                                        title="Adicionar"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                {/* Busca rápida no estoque existente */}
                                <div className="relative pt-1">
                                    <Search size={14} className="absolute left-3 top-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Ou pesquise um produto do seu acervo para incluir no kit..."
                                        value={catalogSearch}
                                        onChange={(e) => setCatalogSearch(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                                    />

                                    {filteredCatalog.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-slate-100">
                                            {filteredCatalog.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => handleAddFromCatalog(p)}
                                                    className="w-full p-2.5 text-left hover:bg-purple-50 flex items-center justify-between text-xs transition-all cursor-pointer"
                                                >
                                                    <span className="font-semibold text-slate-900 truncate pr-2">{p.name}</span>
                                                    <span className="font-mono text-emerald-700 font-bold shrink-0">R$ {p.price?.toFixed(2)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Seção 4: Foto e Descrição */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-200">
                            <div className="md:col-span-4 space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase">Foto do Kit</label>
                                <div className="w-full h-32 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-2">
                                    <img
                                        src={kitImageUrl || '/ponto_chave_logo.jpg'}
                                        alt="Foto do Kit"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = '/ponto_chave_logo.jpg';
                                        }}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="URL da imagem..."
                                    value={kitImageUrl}
                                    onChange={(e) => setKitImageUrl(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            <div className="md:col-span-8 space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase">Descrição & Apresentação</label>
                                <textarea
                                    rows={5}
                                    value={kitDescription}
                                    onChange={(e) => setKitDescription(e.target.value)}
                                    placeholder="Descreva as vantagens, garantia e uso indicado do Kit..."
                                    className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Info size={15} className="text-purple-600 shrink-0" />
                            <span>O Kit será publicado na categoria <strong>Kits & Combos</strong> com a lista completa de peças.</span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSaving}
                                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-2xl text-xs transition-all cursor-pointer flex-1 sm:flex-none"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black rounded-2xl text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 flex-1 sm:flex-none"
                            >
                                <Check size={16} />
                                <span>{isSaving ? 'Salvando Kit...' : editingKit ? 'Salvar Alterações' : 'Salvar & Publicar Kit'}</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
