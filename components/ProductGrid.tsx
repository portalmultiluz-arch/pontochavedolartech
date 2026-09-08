import React, { useState, useMemo, useEffect } from 'react';
import type { Product, PromoContent } from '../types';
import { ProductCard } from './ProductCard';
import { PromoCard } from './PromoCard';
import { 
    Search, 
    Sparkles, 
    Flame, 
    Tag, 
    Boxes, 
    Layers, 
    Gift, 
    Calendar,
    Zap,
    Droplets,
    Wrench,
    Lightbulb,
    Home,
    Sprout,
    Shield,
    Radio,
    Wifi,
    Paintbrush,
    Filter
} from 'lucide-react';
import { isProductEligibleForStorefront, getProductPromoDetails } from '../lib/productStatusHelper';
import { isKitProduct } from '../lib/catalogHelper';
import { MAIN_PRODUCT_CLASSES, matchProductToClass } from '../lib/productClassesConfig';

interface ProductGridProps {
    products: Product[];
    promoContent: PromoContent[];
    onViewProduct: (product: Product) => void;
    activeCategory?: string;
    onCategoryChange?: (cat: string) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
    products, 
    promoContent, 
    onViewProduct,
    activeCategory,
    onCategoryChange
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [internalCategory, setInternalCategory] = useState<string>('PROMOÇÃO');
    const [selectedOccasion, setSelectedOccasion] = useState<string>('todas');
    const [visibleCount, setVisibleCount] = useState<number>(24);

    const selectedCategory = activeCategory !== undefined ? activeCategory : internalCategory;

    // Sincroniza se activeCategory mudar externamente
    useEffect(() => {
        if (activeCategory && activeCategory !== internalCategory) {
            setInternalCategory(activeCategory);
            setVisibleCount(24);
        }
    }, [activeCategory]);

    // Contagem de produtos por classe/categoria para exibir badges dinâmicos
    const classCounts = useMemo(() => {
        const counts: Record<string, number> = {
            'Material Elétrico': 0,
            'Material Hidráulico': 0,
            'Ferramentas': 0,
            'Iluminação': 0,
            'Segurança - EPI': 0,
            'Telefonia, Informática, Comunicação & Segurança': 0,
            'Tintas, Vernizes e Acabamento': 0,
            'Casa - Jardim - Agrícola': 0,
            'Utilidades, Ferragens e Fixação': 0,
            'PROMOÇÃO': 0,
            'KITS & COMBOS': 0,
            'PRESENTES': 0,
            'Todos': 0
        };

        products.forEach(p => {
            if (!isProductEligibleForStorefront(p)) return;
            counts['Todos']++;

            if (matchProductToClass(p, 'Material Elétrico')) counts['Material Elétrico']++;
            if (matchProductToClass(p, 'Material Hidráulico')) counts['Material Hidráulico']++;
            if (matchProductToClass(p, 'Ferramentas')) counts['Ferramentas']++;
            if (matchProductToClass(p, 'Iluminação')) counts['Iluminação']++;
            if (matchProductToClass(p, 'Segurança - EPI')) counts['Segurança - EPI']++;
            if (matchProductToClass(p, 'Telefonia, Informática, Comunicação & Segurança')) counts['Telefonia, Informática, Comunicação & Segurança']++;
            if (matchProductToClass(p, 'Tintas, Vernizes e Acabamento')) counts['Tintas, Vernizes e Acabamento']++;
            if (matchProductToClass(p, 'Casa - Jardim - Agrícola')) counts['Casa - Jardim - Agrícola']++;
            if (matchProductToClass(p, 'Utilidades, Ferragens e Fixação')) counts['Utilidades, Ferragens e Fixação']++;
            if (matchProductToClass(p, 'PROMOÇÃO')) counts['PROMOÇÃO']++;
            if (matchProductToClass(p, 'KITS & COMBOS')) counts['KITS & COMBOS']++;
            if (matchProductToClass(p, 'PRESENTES')) counts['PRESENTES']++;
        });

        return counts;
    }, [products]);

    // Extrai categorias adicionais que não façam parte das classes principais
    const extraCategories = useMemo(() => {
        const set = new Set<string>();
        const mainClassKeywords = [
            'elétric', 'eletric', 'hidráulic', 'hidraulic', 'tubo', 'ferramenta', 'máquina', 
            'ilumina', 'lâmpada', 'seguran', 'epi', 'proteç', 'utilidade', 'ferragem', 'fixa', 'kit', 'combo', 'presente',
            'telef', 'informát', 'informat', 'comunica', 'cftv', 'tinta', 'verniz', 'pintura', 'acabamento'
        ];

        products.forEach(p => {
            if (isProductEligibleForStorefront(p) && p.category && p.category.trim()) {
                const c = p.category.trim();
                const lower = c.toLowerCase();
                const isMain = mainClassKeywords.some(kw => lower.includes(kw));
                if (!isMain) {
                    set.add(c);
                }
            }
        });
        return Array.from(set);
    }, [products]);

    // Troca de categoria com reset de paginação
    const handleCategoryChange = (cat: string) => {
        setInternalCategory(cat);
        if (onCategoryChange) {
            onCategoryChange(cat);
        }
        setVisibleCount(24);
    };

    const handleSearchChange = (val: string) => {
        setSearchTerm(val);
        setVisibleCount(24);
    };

    // Fast tokenized filtering
    const searchTokens = useMemo(() => {
        return searchTerm.trim().toLowerCase().split(/\s+/).filter(Boolean);
    }, [searchTerm]);

    // Filtragem precisa e resiliente de produtos
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            if (!isProductEligibleForStorefront(p)) return false;

            // Filtro por classe ou categoria selecionada
            if (selectedCategory && selectedCategory !== 'Todos') {
                if (selectedCategory === 'PRESENTES') {
                    if (!matchProductToClass(p, 'PRESENTES')) return false;

                    // Subfiltro por ocasião / data comemorativa
                    if (selectedOccasion !== 'todas') {
                        const text = `${p.name || ''} ${p.description || ''} ${p.category || ''} ${p.department || ''} ${p.brand || ''}`.toLowerCase();
                        if (selectedOccasion === 'pais') {
                            const match = text.includes('ferramenta') || text.includes('alicate') || text.includes('churrasco') || text.includes('maleta') || text.includes('pedreiro') || text.includes('eletricista') || text.includes('marreta') || text.includes('foxlux') || text.includes('martelo') || text.includes('trena') || text.includes('chave');
                            if (!match) return false;
                        } else if (selectedOccasion === 'maes') {
                            const match = text.includes('faqueiro') || text.includes('faca') || text.includes('luminária') || text.includes('jardinagem') || text.includes('jardim') || text.includes('tramontina') || text.includes('utilidade') || text.includes('casa') || text.includes('ducha') || text.includes('torneira') || text.includes('cozinha') || text.includes('pendente');
                            if (!match) return false;
                        } else if (selectedOccasion === 'casanova') {
                            const match = text.includes('maleta') || isKitProduct(p) || text.includes('faqueiro') || text.includes('churrasco') || text.includes('luminária') || text.includes('ducha');
                            if (!match) return false;
                        } else if (selectedOccasion === 'natal') {
                            const match = text.includes('presente') || text.includes('churrasco') || text.includes('faqueiro') || text.includes('luminária') || isKitProduct(p);
                            if (!match) return false;
                        }
                    }
                } else {
                    if (!matchProductToClass(p, selectedCategory)) {
                        return false;
                    }
                }
            }

            if (searchTokens.length > 0) {
                const text = `${p.name || ''} ${p.description || ''} ${p.category || ''} ${p.code || ''} ${p.supplierName || ''} ${p.productClass || ''} ${p.department || ''}`.toLowerCase();
                if (!searchTokens.every(tok => text.includes(tok))) return false;
            }
            return true;
        });
    }, [products, searchTokens, selectedCategory, selectedOccasion]);

    const activePromo = promoContent || [];
    const combinedItems: (Product | PromoContent)[] = useMemo(() => {
        if (selectedCategory === 'PROMOÇÃO' || selectedCategory === 'KITS & COMBOS' || selectedCategory === 'PRESENTES') {
            return filteredProducts;
        }
        return [...filteredProducts, ...activePromo];
    }, [filteredProducts, activePromo, selectedCategory]);

    const displayedItems = useMemo(() => {
        return combinedItems.slice(0, visibleCount);
    }, [combinedItems, visibleCount]);

    // Mapeamento de ícone para as abas
    const renderClassIcon = (iconName: string, isSelected: boolean) => {
        const size = 16;
        switch (iconName) {
            case 'Zap':
                return <Zap size={size} className={isSelected ? 'text-amber-200 fill-amber-300' : 'text-amber-600'} />;
            case 'Droplets':
                return <Droplets size={size} className={isSelected ? 'text-sky-200 fill-sky-300' : 'text-sky-600'} />;
            case 'Wrench':
                return <Wrench size={size} className={isSelected ? 'text-slate-200' : 'text-slate-700'} />;
            case 'Lightbulb':
                return <Lightbulb size={size} className={isSelected ? 'text-yellow-200 fill-yellow-300' : 'text-yellow-600'} />;
            case 'Home':
                return <Home size={size} className={isSelected ? 'text-emerald-200 fill-emerald-300' : 'text-emerald-600'} />;
            case 'Sprout':
                return <Sprout size={size} className={isSelected ? 'text-emerald-100 fill-emerald-200' : 'text-emerald-600'} />;
            case 'Flame':
                return <Flame size={size} className={isSelected ? 'text-amber-200 fill-amber-300 animate-pulse' : 'text-red-600 fill-red-600'} />;
            case 'Boxes':
                return <Boxes size={size} className={isSelected ? 'text-yellow-200' : 'text-purple-700'} />;
            case 'Gift':
                return <Gift size={size} className={isSelected ? 'text-amber-200 animate-bounce' : 'text-rose-600'} />;
            case 'Shield':
                return <Shield size={size} className={isSelected ? 'text-amber-200 fill-amber-300' : 'text-amber-600'} />;
            case 'Radio':
                return <Radio size={size} className={isSelected ? 'text-cyan-200 fill-cyan-300' : 'text-blue-600'} />;
            case 'Wifi':
                return <Wifi size={size} className={isSelected ? 'text-cyan-200 fill-cyan-300' : 'text-blue-600'} />;
            case 'Paintbrush':
                return <Paintbrush size={size} className={isSelected ? 'text-rose-200' : 'text-rose-600'} />;
            case 'Layers':
            default:
                return <Layers size={size} className={isSelected ? 'text-white' : 'text-gray-600'} />;
        }
    };

    // Classes comerciais fundamentais solicitadas pelo lojista (9 abas com banner específico)
    const coreStoreClasses = MAIN_PRODUCT_CLASSES.filter(c => 
        [
            'Material Elétrico', 
            'Material Hidráulico', 
            'Ferramentas', 
            'Iluminação', 
            'Segurança - EPI', 
            'Telefonia, Informática, Comunicação & Segurança',
            'Tintas, Vernizes e Acabamento',
            'Casa - Jardim - Agrícola', 
            'Utilidades, Ferragens e Fixação'
        ].includes(c.id)
    );

    // 4 Abas especiais de destaque da loja
    const specialShowcaseClasses = MAIN_PRODUCT_CLASSES.filter(c => 
        ['PROMOÇÃO', 'PRESENTES', 'KITS & COMBOS', 'Todos'].includes(c.id)
    );

    return (
        <section className="py-12 sm:py-20 bg-gradient-to-b from-white via-brand-light to-white">
            <div className="container mx-auto px-4 sm:px-6">
                
                {/* Cabeçalho Oficial do Catálogo */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary text-xs font-bold px-4 py-1.5 rounded-full mb-3 shadow-xs">
                        <Sparkles size={14} className="animate-spin-slow" />
                        <span>Catálogo & Departamentos Oficiais</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-brand-dark tracking-tight">
                        Classes de Produtos & Departamentos
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-2xl mx-auto leading-relaxed">
                        Navegue com agilidade entre materiais elétricos, hidráulicos, ferramentas, iluminação, segurança & EPIs, utilidades do lar e ofertas especiais com garantia de fábrica.
                    </p>
                </div>

                {/* Barra de Busca Ágil */}
                <div className="max-w-xl mx-auto mb-6 sm:mb-8 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por produto, marca, código ou especificação (ex: Alicate, Cabo, Foxlux, Deca)..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-11 pr-24 py-3 bg-white border border-gray-200 rounded-2xl text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary transition-all placeholder:text-gray-400"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        >
                            Limpar
                        </button>
                    )}
                </div>

                {/* ========================================================================= */}
                {/* 1. ABAS DAS CLASSES PRINCIPAIS DOS PRODUTOS (SOLICITADO PELO USUÁRIO) */}
                {/* ========================================================================= */}
                <div className="max-w-6xl mx-auto mb-4">
                    <div className="flex items-center justify-between gap-2 mb-2 px-1">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                            <Filter size={13} className="text-brand-primary" />
                            <span>Classes de Produtos:</span>
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium">
                            {classCounts['Todos']} produtos cadastrados
                        </span>
                    </div>

                    {/* Grade Responsiva das 9 Classes Comerciais com Banner Específico */}
                    <div className="bg-slate-100/95 p-1.5 sm:p-2 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-1.5 sm:gap-2 items-center">
                        {coreStoreClasses.map((item) => {
                            const isSelected = selectedCategory === item.id;
                            const count = classCounts[item.id] || 0;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleCategoryChange(item.id)}
                                    title={`${item.label} — ${item.description}`}
                                    className={`min-h-[52px] sm:min-h-[54px] py-1.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer relative ${
                                        isSelected
                                            ? `${item.accentBg} shadow-md scale-[1.02] ring-2 ring-white/40`
                                            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 shadow-2xs'
                                    }`}
                                >
                                    <span className="shrink-0">
                                        {renderClassIcon(item.iconName, isSelected)}
                                    </span>
                                    {item.id === 'Telefonia, Informática, Comunicação & Segurança' ? (
                                        <div className="flex flex-col items-center justify-center text-center leading-[1.12]">
                                            <span className="tracking-tight font-extrabold text-[10px] sm:text-[11px] whitespace-nowrap">
                                                Telefonia & TI
                                            </span>
                                            <span className="tracking-tight font-bold text-[9px] sm:text-[10px] whitespace-nowrap opacity-95">
                                                & Segurança
                                            </span>
                                        </div>
                                    ) : item.id === 'Tintas, Vernizes e Acabamento' ? (
                                        <div className="flex flex-col items-center justify-center text-center leading-[1.12]">
                                            <span className="tracking-tight font-extrabold text-[10px] sm:text-[11px] whitespace-nowrap">
                                                Tintas, Vernizes
                                            </span>
                                            <span className="tracking-tight font-bold text-[9px] sm:text-[10px] whitespace-nowrap opacity-95">
                                                e Acabamento
                                            </span>
                                        </div>
                                    ) : item.id === 'Casa - Jardim - Agrícola' ? (
                                        <div className="flex flex-col items-center justify-center text-center leading-[1.12]">
                                            <span className="tracking-tight font-extrabold text-[10px] sm:text-[11px] whitespace-nowrap">
                                                Casa, Jardim
                                            </span>
                                            <span className="tracking-tight font-bold text-[9px] sm:text-[10px] whitespace-nowrap opacity-95">
                                                e Agrícola
                                            </span>
                                        </div>
                                    ) : item.id === 'Utilidades, Ferragens e Fixação' ? (
                                        <div className="flex flex-col items-center justify-center text-center leading-[1.12]">
                                            <span className="tracking-tight font-extrabold text-[10px] sm:text-[11px] whitespace-nowrap">
                                                Utilidades
                                            </span>
                                            <span className="tracking-tight font-bold text-[9px] sm:text-[10px] whitespace-nowrap opacity-95">
                                                & Ferragens
                                            </span>
                                        </div>
                                    ) : item.id === 'Segurança - EPI' ? (
                                        <div className="flex flex-col items-center justify-center text-center leading-[1.12]">
                                            <span className="tracking-tight font-extrabold text-[10px] sm:text-[11px] whitespace-nowrap">
                                                Segurança
                                            </span>
                                            <span className="tracking-tight font-bold text-[9px] sm:text-[10px] whitespace-nowrap opacity-95">
                                                & EPI
                                            </span>
                                        </div>
                                    ) : item.id === 'Material Elétrico' ? (
                                        <div className="flex flex-col items-center justify-center text-center leading-[1.12]">
                                            <span className="tracking-tight font-extrabold text-[10px] sm:text-[11px] whitespace-nowrap">
                                                Material
                                            </span>
                                            <span className="tracking-tight font-bold text-[9px] sm:text-[10px] whitespace-nowrap opacity-95">
                                                Elétrico
                                            </span>
                                        </div>
                                    ) : item.id === 'Material Hidráulico' ? (
                                        <div className="flex flex-col items-center justify-center text-center leading-[1.12]">
                                            <span className="tracking-tight font-extrabold text-[10px] sm:text-[11px] whitespace-nowrap">
                                                Material
                                            </span>
                                            <span className="tracking-tight font-bold text-[9px] sm:text-[10px] whitespace-nowrap opacity-95">
                                                Hidráulico
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="tracking-tight font-extrabold text-[11px] sm:text-xs text-center leading-tight">
                                            {item.label}
                                        </span>
                                    )}
                                    {count > 0 && (
                                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold leading-none shrink-0 ${
                                            isSelected 
                                                ? 'bg-black/20 text-white' 
                                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* 2. ABAS ESPECIAIS: PROMOÇÃO, PRESENTES, KITS & TODOS OS PRODUTOS */}
                {/* ========================================================================= */}
                <div className="max-w-4xl mx-auto mb-6">
                    <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-1.5 items-center">
                        {specialShowcaseClasses.map((item) => {
                            const isSelected = selectedCategory === item.id;
                            const count = classCounts[item.id] || 0;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleCategoryChange(item.id)}
                                    title={item.description}
                                    className={`h-10 px-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                        isSelected
                                            ? `${item.accentBg} shadow-sm ring-1 ring-white/30`
                                            : 'bg-white/90 text-slate-700 hover:bg-white border border-slate-200/60 shadow-2xs'
                                    }`}
                                >
                                    <span className="shrink-0">
                                        {renderClassIcon(item.iconName, isSelected)}
                                    </span>
                                    <span className="truncate">
                                        {item.label}
                                    </span>
                                    {count > 0 && (
                                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold leading-none shrink-0 ${
                                            isSelected 
                                                ? 'bg-black/20 text-white' 
                                                : 'bg-slate-200 text-slate-700'
                                        }`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Sub-abas de Categorias Específicas Dinâmicas (quando houver no catálogo) */}
                {extraCategories.length > 0 && (
                    <div className="max-w-5xl mx-auto mb-6 flex flex-wrap items-center justify-center gap-1.5 px-2">
                        <span className="text-[11px] font-semibold text-gray-500 mr-1 flex items-center gap-1">
                            <span>Outros Segmentos:</span>
                        </span>
                        {extraCategories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleCategoryChange(cat)}
                                className={`h-7 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center ${
                                    selectedCategory === cat
                                        ? 'bg-brand-primary text-white shadow-xs'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-primary/50 hover:text-brand-primary hover:bg-gray-50'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* ========================================================================= */}
                {/* BANNERS CONTEXTUAIS EXPLICATIVOS CONFORME A CLASSE/ABA ATIVA */}
                {/* ========================================================================= */}

                {/* Banner: Material Elétrico */}
                {selectedCategory === 'Material Elétrico' && (
                    <div className="max-w-4xl mx-auto mb-8 p-4 sm:p-5 bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700 rounded-3xl text-white shadow-md flex items-center justify-between gap-4 animate-fade-in">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                <Zap size={22} className="text-amber-200 fill-amber-300" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
                                    <span>⚡ Materiais Elétricos & Instalações</span>
                                </h3>
                                <p className="text-xs text-amber-100 mt-0.5">
                                    Fios, cabos condutores com cobre puro, disjuntores DIN, tomadas, interruptores, canaletas e fita isolante antichama com certificação INMETRO.
                                </p>
                            </div>
                        </div>
                        <span className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-white text-amber-900 text-xs font-black shadow-xs shrink-0">
                            {filteredProducts.length} itens elétricos
                        </span>
                    </div>
                )}

                {/* Banner: Material Hidráulico */}
                {selectedCategory === 'Material Hidráulico' && (
                    <div className="max-w-4xl mx-auto mb-8 p-4 sm:p-5 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-700 rounded-3xl text-white shadow-md flex items-center justify-between gap-4 animate-fade-in">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                <Droplets size={22} className="text-sky-200 fill-sky-300" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
                                    <span>💧 Materiais Hidráulicos & Conexões</span>
                                </h3>
                                <p className="text-xs text-sky-100 mt-0.5">
                                    Tubos e conexões para água fria soldável, linha de esgoto, registros de pressão e gaveta, torneiras, duchas e reparos hidráulicos.
                                </p>
                            </div>
                        </div>
                        <span className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-white text-sky-900 text-xs font-black shadow-xs shrink-0">
                            {filteredProducts.length} itens hidráulicos
                        </span>
                    </div>
                )}

                {/* Banner: Ferramentas */}
                {selectedCategory === 'Ferramentas' && (
                    <div className="max-w-4xl mx-auto mb-8 p-4 sm:p-5 bg-gradient-to-r from-slate-800 via-slate-900 to-zinc-900 rounded-3xl text-white shadow-md flex items-center justify-between gap-4 animate-fade-in">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                <Wrench size={22} className="text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
                                    <span>🔧 Ferramentas Profissionais & Manuais</span>
                                </h3>
                                <p className="text-xs text-slate-200 mt-0.5">
                                    Alicates universais e bico isolados 1000V, martelos forjados, jogos de chaves, trenas emborrachadas, arcos de serra e maletas completas.
                                </p>
                            </div>
                        </div>
                        <span className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-black shadow-xs shrink-0">
                            {filteredProducts.length} ferramentas
                        </span>
                    </div>
                )}

                {/* Banner: Iluminação */}
                {selectedCategory === 'Iluminação' && (
                    <div className="max-w-4xl mx-auto mb-8 p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-700 rounded-3xl text-slate-950 shadow-md flex items-center justify-between gap-4 animate-fade-in">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-black/10 backdrop-blur-md flex items-center justify-center shrink-0">
                                <Lightbulb size={22} className="text-yellow-200 fill-yellow-300" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
                                    <span>💡 Iluminação & Tecnologia LED</span>
                                </h3>
                                <p className="text-xs text-slate-900 mt-0.5 font-medium">
                                    Lâmpadas LED bulbo, refletores microled IP65 para áreas externas, painéis plafon e luminárias com alta economia de energia e vida útil estendida.
                                </p>
                            </div>
                        </div>
                        <span className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-slate-950 text-amber-400 text-xs font-black shadow-xs shrink-0">
                            {filteredProducts.length} itens de iluminação
                        </span>
                    </div>
                )}

                {/* Banner: Segurança - EPI */}
                {(selectedCategory === 'Segurança - EPI' || selectedCategory === 'Segurança' || selectedCategory === 'EPI') && (
                    <div className="max-w-4xl mx-auto mb-8 p-4 sm:p-5 bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 rounded-3xl text-white shadow-md flex items-center justify-between gap-4 animate-fade-in">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                <Shield size={22} className="text-amber-200 fill-amber-300" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
                                    <span>🛡️ Segurança do Trabalho & Equipamentos de Proteção (EPI)</span>
                                </h3>
                                <p className="text-xs text-amber-100 mt-0.5 leading-relaxed">
                                    Proteção individual e coletiva com Certificado de Aprovação (C.A.): luvas de vaqueta e raspa, óculos antiembaçantes UV400, capacetes Classe B com jugular, respiradores PFF2 N95, protetores auriculares tipo concha e botinas de segurança em couro.
                                </p>
                            </div>
                        </div>
                        <span className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-white text-orange-950 text-xs font-black shadow-xs shrink-0">
                            {filteredProducts.length} itens de proteção
                        </span>
                    </div>
                )}

                {/* Banner: Telefonia, Informática, Comunicação & Segurança Eletrônica */}
                {(selectedCategory === 'Telefonia, Informática, Comunicação & Segurança' ||
                  selectedCategory.toLowerCase().includes('telefonia') ||
                  selectedCategory.toLowerCase().includes('informática') ||
                  selectedCategory.toLowerCase().includes('informatica') ||
                  selectedCategory.toLowerCase().includes('comunicação') ||
                  selectedCategory.toLowerCase().includes('comunicacao') ||
                  selectedCategory.toLowerCase().includes('segurança eletrônica') ||
                  selectedCategory.toLowerCase().includes('seguranca eletronica')) && (
                    <div className="max-w-4xl mx-auto mb-8 p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-800 rounded-3xl text-white shadow-md flex items-center justify-between gap-4 animate-fade-in border border-blue-400/20">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                                <Radio size={22} className="text-cyan-200 fill-cyan-300" />
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                                    <span>📡 Conectividade, Redes & Proteção Eletrônica</span>
                                </div>
                                <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
                                    <span>Telefonia, Informática, Comunicação & Segurança Eletrônica</span>
                                </h3>
                                <p className="text-xs text-blue-100 mt-0.5 leading-relaxed max-w-2xl">
                                    Cabos de rede homologados Cat5e e Cat6, conectores RJ45 e RJ11, extensões telefônicas, interfonia residencial e predial, antenas digitais, cabos coaxiais, campainhas, sensores infravermelhos e equipamentos de CFTV e segurança eletrônica.
                                </p>
                            </div>
                        </div>
                        <span className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-white text-blue-950 text-xs font-black shadow-xs shrink-0 self-center">
                            {filteredProducts.length} itens disponíveis
                        </span>
                    </div>
                )}

                {/* Banner: Tintas, Vernizes e Acabamento */}
                {(selectedCategory === 'Tintas, Vernizes e Acabamento' ||
                  selectedCategory.toLowerCase().includes('tinta') ||
                  selectedCategory.toLowerCase().includes('verniz') ||
                  selectedCategory.toLowerCase().includes('pintura') ||
                  selectedCategory.toLowerCase().includes('acabamento')) && (
                    <div className="max-w-4xl mx-auto mb-8 p-4 sm:p-5 bg-gradient-to-r from-rose-700 via-pink-700 to-amber-800 rounded-3xl text-white shadow-md flex items-center justify-between gap-4 animate-fade-in border border-rose-400/20">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                                <Paintbrush size={22} className="text-rose-200 fill-rose-300" />
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-400/20 text-rose-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                                    <span>🎨 Pintura, Proteção de Superfícies & Acabamento Profissional</span>
                                </div>
                                <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
                                    <span>Tintas, Vernizes e Acabamento</span>
                                </h3>
                                <p className="text-xs text-rose-100 mt-0.5 leading-relaxed max-w-2xl">
                                    Linha completa de tintas acrílicas e látex antimofo para alvenaria interna e externa, esmaltes sintéticos brilhantes e acetinados, vernizes marítimos e para madeira, impermeabilizantes, seladores, massas corridas, solventes, lixas d'água e massa, trinchas e rolos para acabamento perfeito.
                                </p>
                            </div>
                        </div>
                        <span className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-white text-rose-950 text-xs font-black shadow-xs shrink-0 self-center">
                            {filteredProducts.length} itens de pintura
                        </span>
                    </div>
                )}

                {/* Banner: Casa - Jardim - Agrícola */}
                {(selectedCategory === 'Casa - Jardim - Agrícola' || selectedCategory === 'Casa - Jardim - Agricola') && (
                    <div className="max-w-4xl mx-auto mb-8 p-4 sm:p-5 bg-gradient-to-r from-emerald-700 via-teal-700 to-green-800 rounded-3xl text-white shadow-md flex items-center justify-between gap-4 animate-fade-in">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                <Sprout size={22} className="text-emerald-200 fill-emerald-300" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
                                    <span>🌱 Casa, Jardim & Linha Agrícola</span>
                                </h3>
                                <p className="text-xs text-emerald-100 mt-0.5">
                                    Aba unificada: Mangueiras trançadas, esguichos, tesouras de poda, regadores, enxadas forjadas, pás, pulverizadores e utilidades práticas para o campo, jardim e o seu lar.
                                </p>
                            </div>
                        </div>
                        <span className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-white text-emerald-900 text-xs font-black shadow-xs shrink-0">
                            {filteredProducts.length} itens disponíveis
                        </span>
                    </div>
                )}

                {/* Banner: Utilidades, Ferragens e Fixação */}
                {(selectedCategory === 'Utilidades, Ferragens e Fixação' || 
                  selectedCategory === 'Utilidades' || 
                  selectedCategory.toLowerCase().includes('ferragem') ||
                  selectedCategory.toLowerCase().includes('fixa')) && (
                    <div className="max-w-4xl mx-auto mb-8 p-4 sm:p-5 bg-gradient-to-r from-teal-700 via-emerald-800 to-slate-900 rounded-3xl text-white shadow-md flex items-center justify-between gap-4 animate-fade-in border border-teal-400/20">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                                <Home size={22} className="text-teal-200 fill-teal-300" />
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                                    <span>🔩 Soluções para o Lar, Ferragens Técnicas & Fixação Segura</span>
                                </div>
                                <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
                                    <span>Utilidades, Ferragens e Fixação</span>
                                </h3>
                                <p className="text-xs text-teal-100 mt-0.5 leading-relaxed max-w-2xl">
                                    Tudo para montagens, organização e reparos: parafusos para madeira, metal e drywall, buchas de nylon e gesso, pregos, dobradiças, trincos, cadeados, rodízios, suportes reforçados, além de faqueiros, organizadores e utilidades domésticas essenciais com máxima durabilidade.
                                </p>
                            </div>
                        </div>
                        <span className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-white text-teal-950 text-xs font-black shadow-xs shrink-0 self-center">
                            {filteredProducts.length} itens disponíveis
                        </span>
                    </div>
                )}

                {/* Banner de destaque quando a aba PROMOÇÃO está ativa */}
                {selectedCategory === 'PROMOÇÃO' && (
                    <div className="max-w-4xl mx-auto mb-8 p-4 sm:p-5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-3xl text-white shadow-md flex items-center justify-between gap-4 animate-fade-in">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                <Tag size={22} className="text-amber-200" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
                                    <span>🔥 Ofertas & Promoções em Destaque</span>
                                </h3>
                                <p className="text-xs text-red-100 mt-0.5">
                                    Itens com descontos exclusivos e vigência limitada. Garanta o melhor preço antes que encerre o período promocional!
                                </p>
                            </div>
                        </div>
                        <span className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-white text-red-700 text-xs font-black shadow-xs shrink-0">
                            {filteredProducts.length} em oferta
                        </span>
                    </div>
                )}

                {/* Banner de destaque quando a aba PRESENTES está ativa */}
                {selectedCategory === 'PRESENTES' && (
                    <div className="max-w-4xl mx-auto mb-8 p-4 sm:p-6 bg-gradient-to-r from-amber-600 via-rose-600 to-pink-700 rounded-3xl text-white shadow-md space-y-4 animate-fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                    <Gift size={26} className="text-amber-100" />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                                        <span>💝 Dia dos Pais, Dia das Mães é todo dia... Veja nossas sugestões!</span>
                                    </h3>
                                    <p className="text-xs sm:text-sm text-rose-100 mt-0.5">
                                        Demonstre carinho em qualquer época do ano. Selecionamos kits montados, utilidades de primeira linha, faqueiros e ferramentas com durabilidade para quem você ama.
                                    </p>
                                </div>
                            </div>
                            <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white text-rose-800 text-xs font-black shadow-xs shrink-0">
                                {filteredProducts.length} sugestões
                            </span>
                        </div>

                        {/* Sub-chips de Ocasiões & Datas Comemorativas */}
                        <div className="pt-3 border-t border-white/20 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-amber-100 flex items-center gap-1.5 mr-1">
                                <Calendar size={14} />
                                <span>Ocasiões:</span>
                            </span>
                            {[
                                { id: 'todas', label: '🌟 Todas as Sugestões' },
                                { id: 'pais', label: '👨 Dia dos Pais & Ferramentas' },
                                { id: 'maes', label: '👩 Dia das Mães & Casa' },
                                { id: 'casanova', label: '🏡 Chá de Casa Nova & Reforma' },
                                { id: 'natal', label: '🎄 Natal & Celebrações' },
                            ].map((occ) => (
                                <button
                                    key={occ.id}
                                    type="button"
                                    onClick={() => setSelectedOccasion(occ.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        selectedOccasion === occ.id
                                            ? 'bg-white text-rose-800 shadow-md ring-2 ring-amber-300'
                                            : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                                    }`}
                                >
                                    {occ.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Banner de destaque quando a aba KITS & COMBOS está ativa */}
                {selectedCategory === 'KITS & COMBOS' && (
                    <div className="max-w-4xl mx-auto mb-8 p-4 sm:p-5 bg-gradient-to-r from-purple-700 via-indigo-700 to-violet-800 rounded-3xl text-white shadow-md flex items-center justify-between gap-4 animate-fade-in">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                <Boxes size={22} className="text-yellow-300" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
                                    <span>📦 Kits Prontos & Combos Econômicos</span>
                                </h3>
                                <p className="text-xs text-purple-100 mt-0.5">
                                    Soluções completas com ferramentas e materiais essenciais para pedreiros, eletricistas, pintura, utilidades do lar e organização!
                                </p>
                            </div>
                        </div>
                        <span className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-white text-purple-800 text-xs font-black shadow-xs shrink-0">
                            {filteredProducts.length} kits disponíveis
                        </span>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* GRADE DE PRODUTOS / ITENS */}
                {/* ========================================================================= */}
                {displayedItems.length > 0 ? (
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                            {displayedItems.map((item) => {
                                if ('price' in item) { // É um Product
                                    return <ProductCard key={`prod-${item.id}`} product={item} onViewProduct={onViewProduct} />;
                                } else { // É um PromoContent
                                    return <PromoCard key={`promo-${item.id}`} content={item} />;
                                }
                            })}
                        </div>

                        {/* Botão Carregar Mais Produtos */}
                        {visibleCount < combinedItems.length && (
                            <div className="text-center mt-12">
                                <button
                                    type="button"
                                    onClick={() => setVisibleCount(prev => prev + 24)}
                                    className="px-8 py-3.5 bg-white border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-bold text-sm rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                                >
                                    Carregar mais produtos ({combinedItems.length - visibleCount} restantes)
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-xl mx-auto p-8">
                        {selectedCategory === 'PROMOÇÃO' ? (
                            <>
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Tag size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Nenhum produto em promoção ativa no momento</h3>
                                <p className="text-gray-500 text-sm mt-1 mb-6">
                                    Fique atento às nossas ofertas sazonais ou explore o catálogo completo de produtos.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleCategoryChange('Todos')}
                                    className="px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-brand-dark transition-all cursor-pointer"
                                >
                                    Ver Todos os Produtos
                                </button>
                            </>
                        ) : selectedCategory === 'PRESENTES' ? (
                            <>
                                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Gift size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Nenhuma sugestão encontrada para este filtro</h3>
                                <p className="text-gray-500 text-sm mt-1 mb-6">
                                    Lembre-se: Dia dos Pais e Dia das Mães é todo dia! Explore outras ocasiões ou confira todas as nossas sugestões de presentes.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSelectedOccasion('todas')}
                                    className="px-6 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-amber-700 transition-all cursor-pointer"
                                >
                                    Ver Todas as Sugestões
                                </button>
                            </>
                        ) : selectedCategory === 'KITS & COMBOS' ? (
                            <>
                                <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Boxes size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Nenhum Kit cadastrado no momento</h3>
                                <p className="text-gray-500 text-sm mt-1 mb-6">
                                    Cadastre seus Kits de Pedreiro, Dona de Casa, Eletricista ou Utilidades no painel administrativo.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleCategoryChange('Todos')}
                                    className="px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-brand-dark transition-all cursor-pointer"
                                >
                                    Ver Todos os Produtos
                                </button>
                            </>
                        ) : (selectedCategory === 'Segurança - EPI' || selectedCategory === 'Segurança' || selectedCategory === 'EPI') ? (
                            <>
                                <div className="w-16 h-16 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Shield size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Equipamentos de Proteção Individual (EPI)</h3>
                                <p className="text-gray-500 text-sm mt-1 mb-6 max-w-md mx-auto">
                                    Proteção individual e coletiva com Certificado de Aprovação (C.A.). Luvas, óculos UV400, capacetes e botinas com garantia técnica. Explore o catálogo completo abaixo.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleCategoryChange('Todos')}
                                    className="px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-brand-dark transition-all cursor-pointer"
                                >
                                    Ver Todos os Produtos
                                </button>
                            </>
                        ) : (selectedCategory === 'Telefonia, Informática, Comunicação & Segurança' || selectedCategory.toLowerCase().includes('telefonia') || selectedCategory.toLowerCase().includes('comunicação')) ? (
                            <>
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Radio size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Telefonia, Informática, Comunicação & Segurança Eletrônica</h3>
                                <p className="text-gray-500 text-sm mt-1 mb-6 max-w-md mx-auto">
                                    Nenhum produto encontrado para os termos pesquisados nesta classe de conectividade e segurança. Tente outro filtro ou veja todo o catálogo.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleCategoryChange('Todos')}
                                    className="px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-brand-dark transition-all cursor-pointer"
                                >
                                    Ver Todos os Produtos
                                </button>
                            </>
                        ) : (selectedCategory === 'Casa - Jardim - Agrícola' || selectedCategory === 'Casa - Jardim - Agricola') ? (
                            <>
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Sprout size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Nenhum produto cadastrado nesta classe</h3>
                                <p className="text-gray-500 text-sm mt-1 mb-6">
                                    Cadastre mangueiras, itens de jardinagem, ferramentas agrícolas ou utilidades para o lar no painel administrativo.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleCategoryChange('Todos')}
                                    className="px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-brand-dark transition-all cursor-pointer"
                                >
                                    Ver Todos os Produtos
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Nenhum produto encontrado nesta classe</h3>
                                <p className="text-gray-500 text-sm mt-1 mb-6">
                                    Não encontramos produtos com visibilidade ativa para esta classe no momento.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleCategoryChange('Todos')}
                                    className="px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-brand-dark transition-all cursor-pointer"
                                >
                                    Ver Todos os Produtos
                                </button>
                            </>
                        )}
                    </div>
                )}

            </div>
        </section>
    );
};
