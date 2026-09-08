import React, { useState, useEffect, useMemo } from 'react';
import { 
    Tag, 
    Calendar, 
    DollarSign, 
    Percent, 
    X, 
    Check, 
    Trash2, 
    Search, 
    Sparkles, 
    Clock, 
    AlertTriangle,
    ArrowRight,
    TrendingDown,
    Flame
} from 'lucide-react';
import { Product } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { getProductDisplayImage } from '../../lib/mediaHelper';
import { getProductPromoDetails } from '../../lib/productStatusHelper';

interface PromoActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSavePromo: (productId: string, promoData: {
        isPromo: boolean;
        promoPrice: number;
        promoDiscountPercent: number;
        promoStartDate: string;
        promoEndDate: string;
    }) => Promise<void>;
    onRemovePromo: (productId: string) => Promise<void>;
    targetProduct?: Product | null;
    allProducts?: Product[];
    products?: Product[];
}

export const PromoActionModal: React.FC<PromoActionModalProps> = ({
    isOpen,
    onClose,
    onSavePromo,
    onRemovePromo,
    targetProduct,
    allProducts = [],
    products = []
}) => {
    const rawProducts = useMemo(() => {
        if (allProducts && allProducts.length > 0) return allProducts;
        if (products && products.length > 0) return products;
        return [];
    }, [allProducts, products]);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(targetProduct || null);
    const [productSearch, setProductSearch] = useState('');
    const [promoPrice, setPromoPrice] = useState<number | string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Helpers de formatação de data
    const getTodayIso = () => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    };

    const getFutureIso = (daysAhead: number) => {
        const d = new Date();
        d.setDate(d.getDate() + daysAhead);
        return d.toISOString().split('T')[0];
    };

    const getEndOfMonthIso = () => {
        const d = new Date();
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        return end.toISOString().split('T')[0];
    };

    // Inicialização quando o modal abre ou targetProduct muda
    useEffect(() => {
        if (isOpen) {
            setErrorMsg(null);
            const current = targetProduct || null;
            setSelectedProduct(current);
            setProductSearch('');

            if (current) {
                setPromoPrice(current.promoPrice && current.promoPrice > 0 ? current.promoPrice : (current.price ? (current.price * 0.85).toFixed(2) : ''));
                setStartDate(current.promoStartDate || getTodayIso());
                setEndDate(current.promoEndDate || getFutureIso(15));
            } else {
                setPromoPrice('');
                setStartDate(getTodayIso());
                setEndDate(getFutureIso(15));
            }
        }
    }, [isOpen, targetProduct]);

    // Quando o usuário seleciona outro produto na lista de pesquisa
    const handleSelectProduct = (prod: Product) => {
        setSelectedProduct(prod);
        setProductSearch('');
        setErrorMsg(null);
        if (prod.promoPrice && prod.promoPrice > 0) {
            setPromoPrice(prod.promoPrice);
            setStartDate(prod.promoStartDate || getTodayIso());
            setEndDate(prod.promoEndDate || getFutureIso(15));
        } else {
            // Sugestão de 15% de desconto automático
            const suggested = prod.price > 0 ? (prod.price * 0.85).toFixed(2) : '';
            setPromoPrice(suggested);
            setStartDate(getTodayIso());
            setEndDate(getFutureIso(15));
        }
    };

    // Filtro de pesquisa de produtos
    const filteredSearchProducts = useMemo(() => {
        if (!productSearch.trim()) return [];
        const term = productSearch.toLowerCase().trim();
        return (rawProducts || [])
            .filter(p => 
                (p && p.name && p.name.toLowerCase().includes(term)) ||
                (p && p.code && p.code.toLowerCase().includes(term)) ||
                (p && p.sku && p.sku.toLowerCase().includes(term)) ||
                (p && p.supplierName && p.supplierName.toLowerCase().includes(term)) ||
                (p && p.category && p.category.toLowerCase().includes(term))
            )
            .slice(0, 15);
    }, [rawProducts, productSearch]);

    // Cálculos de desconto e margem
    const originalPrice = selectedProduct?.price || 0;
    const costPrice = selectedProduct?.costPrice || 0;
    const numericPromoPrice = typeof promoPrice === 'number' ? promoPrice : parseFloat(promoPrice) || 0;

    const discountCalculations = useMemo(() => {
        if (originalPrice <= 0 || numericPromoPrice <= 0) {
            return { discountPercent: 0, savings: 0, isValid: false, warning: null };
        }
        if (numericPromoPrice >= originalPrice) {
            return {
                discountPercent: 0,
                savings: 0,
                isValid: false,
                warning: 'O preço promocional deve ser menor que o preço original praticado.'
            };
        }
        const savings = originalPrice - numericPromoPrice;
        const discountPercent = Math.round((savings / originalPrice) * 100);
        let warning = null;
        if (costPrice > 0 && numericPromoPrice < costPrice) {
            warning = `Atenção: O preço promocional (R$ ${numericPromoPrice.toFixed(2)}) está abaixo do preço de custo (R$ ${costPrice.toFixed(2)}).`;
        }
        return { discountPercent, savings, isValid: true, warning };
    }, [originalPrice, numericPromoPrice, costPrice]);

    // Aplicar desconto por porcentagem rápida
    const handleApplyPercentDiscount = (percent: number) => {
        if (originalPrice > 0) {
            const newPrice = originalPrice * (1 - percent / 100);
            setPromoPrice(newPrice.toFixed(2));
        }
    };

    // Salvar promoção
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) {
            setErrorMsg('Selecione um produto para colocar em promoção.');
            return;
        }
        if (numericPromoPrice <= 0) {
            setErrorMsg('Informe um valor promocional válido.');
            return;
        }
        if (numericPromoPrice >= originalPrice) {
            setErrorMsg('O preço promocional deve ser inferior ao preço normal de venda.');
            return;
        }
        if (!startDate || !endDate) {
            setErrorMsg('Defina a data inicial e a data final da promoção.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            setErrorMsg('A data final da promoção não pode ser anterior à data inicial.');
            return;
        }

        setIsSaving(true);
        setErrorMsg(null);
        try {
            await onSavePromo(selectedProduct.id, {
                isPromo: true,
                promoPrice: numericPromoPrice,
                promoDiscountPercent: discountCalculations.discountPercent,
                promoStartDate: startDate,
                promoEndDate: endDate
            });
            onClose();
        } catch (err: any) {
            setErrorMsg(err.message || 'Erro ao salvar a promoção.');
        } finally {
            setIsSaving(false);
        }
    };

    // Excluir / Remover promoção
    const handleRemove = async () => {
        if (!selectedProduct) return;
        setIsSaving(true);
        setErrorMsg(null);
        try {
            await onRemovePromo(selectedProduct.id);
            onClose();
        } catch (err: any) {
            setErrorMsg(err.message || 'Erro ao remover a promoção.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden my-6"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-6 text-white relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                                <Flame size={26} className="text-amber-200 fill-amber-300 animate-pulse" />
                            </div>
                            <div>
                                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-200 block">
                                    Central de Ofertas & Descontos
                                </span>
                                <h3 className="text-xl font-bold font-serif">
                                    {selectedProduct?.isPromo ? 'Alterar Item em Promoção' : 'Incluir Item em Promoção'}
                                </h3>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Alerta de Erro */}
                    {errorMsg && (
                        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
                            <AlertTriangle size={16} className="shrink-0 text-red-500" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* SELEÇÃO DO PRODUTO */}
                    <div>
                        <label className="text-xs font-bold text-gray-700 uppercase block mb-1.5">
                            Produto para Promoção *
                        </label>

                        {selectedProduct ? (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <img 
                                        src={getProductDisplayImage(selectedProduct.imageUrl, selectedProduct.videoUrl)} 
                                        alt={selectedProduct.name}
                                        className="w-14 h-14 rounded-xl object-contain bg-white p-1 border border-gray-200 shrink-0"
                                        onError={(e) => { (e.target as HTMLElement).setAttribute('src', '/ponto_chave_logo.jpg'); }}
                                    />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono">
                                                {selectedProduct.code || 'S/CÓD'}
                                            </span>
                                            {selectedProduct.supplierName && (
                                                <span className="text-[10px] font-semibold text-gray-500 truncate">
                                                    {selectedProduct.supplierName}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                                            {selectedProduct.name}
                                        </h4>
                                        <div className="flex items-center gap-3 text-xs mt-1">
                                            <span className="text-gray-500">
                                                Preço Praticado: <strong className="text-slate-900">R$ {Number(selectedProduct.price || 0).toFixed(2)}</strong>
                                            </span>
                                            {selectedProduct.costPrice ? (
                                                <span className="text-gray-400 text-[11px]">
                                                    (Custo: R$ {Number(selectedProduct.costPrice).toFixed(2)})
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedProduct(null)}
                                    className="text-xs text-amber-700 hover:text-amber-800 font-bold px-3 py-1.5 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors shrink-0"
                                >
                                    Trocar Produto
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="text"
                                        placeholder="Digite o nome, código ou fornecedor do produto..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (filteredSearchProducts.length > 0) {
                                                    handleSelectProduct(filteredSearchProducts[0]);
                                                }
                                            }
                                        }}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                                        autoFocus
                                    />
                                </div>

                                {/* Lista de resultados da busca */}
                                {filteredSearchProducts.length > 0 && (
                                    <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-2xl divide-y divide-gray-100 bg-white shadow-lg">
                                        {filteredSearchProducts.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => handleSelectProduct(p)}
                                                className="w-full p-3 text-left hover:bg-red-50/50 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                                                            {p.code || p.sku || 'S/CÓD'}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-900 truncate">
                                                            {p.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] text-gray-500 block truncate mt-0.5">
                                                        {p.category || 'Geral'} • {p.supplierName || 'Ponto Chave'}
                                                    </span>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-xs font-bold text-slate-900 block">
                                                        R$ {Number(p.price || 0).toFixed(2)}
                                                    </span>
                                                    {p.isPromo && (
                                                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                                                            Já em Promo
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* VALORES E DESCONTOS */}
                    {selectedProduct && (
                        <div className="bg-red-50/40 p-5 rounded-3xl border border-red-200/80 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-red-950 uppercase tracking-wider flex items-center gap-1.5">
                                    <Tag size={15} className="text-red-600" />
                                    <span>Definição do Preço Promocional</span>
                                </h4>
                                {discountCalculations.isValid && (
                                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-extrabold flex items-center gap-1 shadow-sm">
                                        <Percent size={12} />
                                        <span>{discountCalculations.discountPercent}% OFF</span>
                                    </span>
                                )}
                            </div>

                            {/* Botões de Desconto Rápido */}
                            <div>
                                <label className="text-[11px] font-bold text-gray-600 uppercase block mb-1.5">
                                    Aplicar Desconto Rápido (%):
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                                        <button
                                            key={pct}
                                            type="button"
                                            onClick={() => handleApplyPercentDiscount(pct)}
                                            className="px-3 py-1.5 bg-white hover:bg-red-600 hover:text-white text-slate-800 border border-red-200 text-xs font-bold rounded-xl transition-colors shadow-xs active:scale-95"
                                        >
                                            -{pct}%
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Input do Preço Promocional */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 uppercase block mb-1">
                                        Preço Promocional de Venda (R$) *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                                            R$
                                        </span>
                                        <input 
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={promoPrice}
                                            onChange={(e) => setPromoPrice(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-red-300 rounded-2xl text-lg font-black text-red-600 focus:ring-2 focus:ring-red-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="p-3 bg-white rounded-2xl border border-red-100 text-xs space-y-1">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Preço De (Normal):</span>
                                        <span className="font-semibold line-through">R$ {originalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-red-700 font-bold">
                                        <span>Preço Por (Promo):</span>
                                        <span>R$ {numericPromoPrice > 0 ? numericPromoPrice.toFixed(2) : '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-gray-100">
                                        <span>Economia do Cliente:</span>
                                        <span>R$ {discountCalculations.savings > 0 ? discountCalculations.savings.toFixed(2) : '0.00'}</span>
                                    </div>
                                </div>
                            </div>

                            {discountCalculations.warning && (
                                <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                                    {discountCalculations.warning}
                                </p>
                            )}
                        </div>
                    )}

                    {/* PERÍODO DA PROMOÇÃO (DATA INICIAL E DATA FINAL) */}
                    {selectedProduct && (
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar size={15} className="text-slate-700" />
                                    <span>Vigência & Período da Promoção</span>
                                </h4>
                                <span className="text-[11px] font-semibold text-slate-500">
                                    Data Inicial e Data Final
                                </span>
                            </div>

                            {/* Atalhos Rápidos de Vigência */}
                            <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                                    Atalhos Rápidos de Duração:
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStartDate(getTodayIso());
                                            setEndDate(getFutureIso(7));
                                        }}
                                        className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg"
                                    >
                                        7 Dias (1 Semana)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStartDate(getTodayIso());
                                            setEndDate(getFutureIso(15));
                                        }}
                                        className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg"
                                    >
                                        15 Dias (Quinzena)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStartDate(getTodayIso());
                                            setEndDate(getFutureIso(30));
                                        }}
                                        className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg"
                                    >
                                        30 Dias (1 Mês)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStartDate(getTodayIso());
                                            setEndDate(getEndOfMonthIso());
                                        }}
                                        className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg"
                                    >
                                        Até Fim do Mês
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 uppercase block mb-1">
                                        Data de Início *
                                    </label>
                                    <input 
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-700 uppercase block mb-1">
                                        Data de Término (Fim) *
                                    </label>
                                    <input 
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BOTÕES DE AÇÃO NO RODAPÉ */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
                        {selectedProduct?.isPromo ? (
                            <button
                                type="button"
                                onClick={handleRemove}
                                disabled={isSaving}
                                className="w-full sm:w-auto px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                                title="Excluir promoção e retornar ao preço normal de venda"
                            >
                                <Trash2 size={15} />
                                <span>Excluir / Encerrar Promoção</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:w-auto px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition-colors"
                            >
                                Cancelar
                            </button>
                        )}

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            {selectedProduct?.isPromo && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition-colors"
                                >
                                    Fechar
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSaving || !selectedProduct || !discountCalculations.isValid}
                                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-2xl text-xs font-extrabold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Check size={16} />
                                <span>{isSaving ? 'Gravando...' : (selectedProduct?.isPromo ? 'Salvar Alterações da Promoção' : 'Ativar Promoção no Catálogo')}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
