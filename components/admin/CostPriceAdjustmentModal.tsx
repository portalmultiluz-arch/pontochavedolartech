import React, { useState, useMemo } from 'react';
import { 
    X, 
    Check, 
    Calculator, 
    TrendingUp, 
    Percent, 
    ArrowRight, 
    AlertCircle, 
    RefreshCw, 
    Sparkles, 
    CheckCircle2,
    Layers,
    SlidersHorizontal
} from 'lucide-react';
import { Product } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { updateDocument } from '../../services/firebaseService';
import { CATALOG_TABLES, ProductTableKey, getProductTableKey } from '../../lib/catalogHelper';

interface CostPriceAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
    defaultTableKey?: ProductTableKey;
    onSuccess: (updatedCount: number, indexPercent: number) => void;
}

export const CostPriceAdjustmentModal: React.FC<CostPriceAdjustmentModalProps> = ({
    isOpen,
    onClose,
    products,
    defaultTableKey = 'pampulha',
    onSuccess
}) => {
    const [selectedTable, setSelectedTable] = useState<ProductTableKey>(
        defaultTableKey !== 'all' && defaultTableKey !== 'promo' && defaultTableKey !== 'kits' 
            ? defaultTableKey 
            : 'pampulha'
    );
    const [indexPercent, setIndexPercent] = useState<number>(5); // padrão +5%
    const [baseMode, setBaseMode] = useState<'original' | 'current'>('original');
    const [recalculateSellingPrice, setRecalculateSellingPrice] = useState<boolean>(true);
    const [isApplying, setIsApplying] = useState<boolean>(false);
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Produtos alvo baseados na tabela selecionada
    const targetProducts = useMemo(() => {
        if (selectedTable === 'all') return products;
        return products.filter(p => getProductTableKey(p) === selectedTable);
    }, [products, selectedTable]);

    // Amostra para preview instantâneo
    const previewSample = useMemo(() => {
        return targetProducts.slice(0, 5).map(p => {
            const baseCost = baseMode === 'original' 
                ? Number(p.costPriceOriginal || p.costPrice || 0)
                : Number(p.costPrice || 0);
            
            const newCost = Number((baseCost * (1 + (indexPercent || 0) / 100)).toFixed(2));
            const margin = Number(p.profitMarginPercent || 40);
            const newSellingPrice = recalculateSellingPrice 
                ? Number((newCost * (1 + margin / 100)).toFixed(2))
                : Number(p.price || 0);

            return {
                id: p.id,
                code: p.code || p.sku || 'S/C',
                name: p.name,
                currentCost: Number(p.costPrice || 0),
                originalCost: Number(p.costPriceOriginal || p.costPrice || 0),
                newCost,
                currentPrice: Number(p.price || 0),
                newSellingPrice,
                diffCost: newCost - Number(p.costPrice || 0)
            };
        });
    }, [targetProducts, baseMode, indexPercent, recalculateSellingPrice]);

    if (!isOpen) return null;

    const handleApplyAdjustment = async () => {
        if (targetProducts.length === 0) {
            setFeedback({ type: 'error', message: 'Nenhum produto encontrado para a tabela selecionada.' });
            return;
        }

        const confirmMsg = `Deseja aplicar o reajuste de ${indexPercent >= 0 ? '+' : ''}${indexPercent}% no preço de custo para os ${targetProducts.length} produtos da tabela ${CATALOG_TABLES[selectedTable]?.label || selectedTable}?\n\nBase: ${baseMode === 'original' ? 'Preço de Custo Original de Importação' : 'Preço de Custo Atual'}\nRecalcular Preço de Venda: ${recalculateSellingPrice ? 'Sim' : 'Não'}`;
        
        if (!window.confirm(confirmMsg)) return;

        setIsApplying(true);
        setFeedback(null);
        setProgress({ current: 0, total: targetProducts.length });

        try {
            const now = new Date().toISOString();
            const chunkSize = 25; // processamento em lotes paralelos seguros
            let processed = 0;

            for (let i = 0; i < targetProducts.length; i += chunkSize) {
                const chunk = targetProducts.slice(i, i + chunkSize);
                
                await Promise.all(chunk.map(async p => {
                    const baseCost = baseMode === 'original' 
                        ? Number(p.costPriceOriginal || p.costPrice || 0)
                        : Number(p.costPrice || 0);
                    
                    const newCost = Number((baseCost * (1 + (indexPercent || 0) / 100)).toFixed(2));
                    const margin = Number(p.profitMarginPercent || 40);
                    
                    const updates: Partial<Product> = {
                        costPrice: newCost,
                        costPriceOriginal: Number(p.costPriceOriginal || baseCost),
                        costPriceMarginIndexPercent: Number(indexPercent || 0),
                        costPriceLastAdjustmentDate: now
                    };

                    if (recalculateSellingPrice) {
                        updates.price = Number((newCost * (1 + margin / 100)).toFixed(2));
                    }

                    // Registrar no histórico de compras do produto
                    const existingHistory = Array.isArray(p.purchaseHistory) ? p.purchaseHistory : [];
                    const newEntry = {
                        id: `adj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                        invoiceNumber: `REAJUSTE-TABELA-${indexPercent}%`,
                        purchaseDate: now.split('T')[0],
                        supplierName: p.supplierName || 'PAMPULHA CONDUTORES',
                        quantityAdded: 0,
                        costPrice: newCost,
                        sellingPrice: updates.price !== undefined ? updates.price : (p.price || 0),
                        createdAt: now
                    };
                    updates.purchaseHistory = [newEntry, ...existingHistory];

                    return updateDocument('products', p.id, updates);
                }));

                processed += chunk.length;
                setProgress({ current: Math.min(processed, targetProducts.length), total: targetProducts.length });
            }

            setFeedback({ 
                type: 'success', 
                message: `Sucesso! Preço de custo reajustado em ${indexPercent}% para ${targetProducts.length} produtos.` 
            });

            setTimeout(() => {
                onSuccess(targetProducts.length, indexPercent);
                onClose();
            }, 1200);

        } catch (err: any) {
            console.error('Erro ao aplicar reajuste de preço de custo:', err);
            setFeedback({ 
                type: 'error', 
                message: 'Falha ao atualizar produtos no banco de dados: ' + (err.message || 'Erro desconhecido') 
            });
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20 shadow-inner">
                            <Calculator size={22} className="text-yellow-200" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                                Reajuste de Preço de Custo por Margem de Índice (%)
                            </h3>
                            <p className="text-xs text-amber-100 font-medium">
                                Atualize e aplique alterações no custo por índice percentual no banco de dados
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        disabled={isApplying}
                        className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-5">
                    {/* Alerta / Feedback */}
                    {feedback && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${
                            feedback.type === 'success' 
                                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                                : 'bg-red-50 text-red-900 border border-red-200'
                        }`}>
                            {feedback.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> : <AlertCircle size={18} className="text-red-600 shrink-0" />}
                            <span>{feedback.message}</span>
                        </div>
                    )}

                    {/* Seleção de Tabela / Escopo */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                            <Layers size={14} className="text-amber-600" /> Tabela Fornecedora Alvo
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(['pampulha', 'famastil', 'foxlux', 'tramontina'] as ProductTableKey[]).map(tKey => {
                                const meta = CATALOG_TABLES[tKey];
                                const isSelected = selectedTable === tKey;
                                const count = products.filter(p => getProductTableKey(p) === tKey).length;
                                return (
                                    <button
                                        key={tKey}
                                        type="button"
                                        onClick={() => setSelectedTable(tKey)}
                                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                                            isSelected 
                                                ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs' 
                                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                                        }`}
                                    >
                                        <div className="text-xs font-bold text-slate-900 line-clamp-1">{meta.shortLabel}</div>
                                        <div className="text-[11px] font-bold text-amber-700 mt-0.5">{count} produtos</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Configuração de Índice e Parâmetros */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            {/* Input do Índice Percentual */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1">
                                    <Percent size={14} className="text-amber-600" />
                                    <span>Índice Percentual de Margem / Reajuste (%)</span>
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        step="0.1"
                                        value={indexPercent}
                                        onChange={e => setIndexPercent(parseFloat(e.target.value) || 0)}
                                        className="w-full p-3 pl-4 pr-12 bg-white border border-amber-300 rounded-xl font-black text-xl text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                                        placeholder="Ex: 5.0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                                        %
                                    </span>
                                </div>
                                <div className="flex gap-1.5 pt-1">
                                    {[-5, 2.5, 5, 8, 10, 15].map(val => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setIndexPercent(val)}
                                            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                                indexPercent === val 
                                                    ? 'bg-amber-600 text-white' 
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            {val > 0 ? `+${val}%` : `${val}%`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Base de Cálculo */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-800 uppercase">Base de Cálculo do Reajuste</label>
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-amber-50/40 text-xs">
                                        <input 
                                            type="radio"
                                            name="baseMode"
                                            checked={baseMode === 'original'}
                                            onChange={() => setBaseMode('original')}
                                            className="text-amber-600 accent-amber-600"
                                        />
                                        <span className="font-semibold text-slate-800">
                                            Preço de Custo Original de Importação
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-amber-50/40 text-xs">
                                        <input 
                                            type="radio"
                                            name="baseMode"
                                            checked={baseMode === 'current'}
                                            onChange={() => setBaseMode('current')}
                                            className="text-amber-600 accent-amber-600"
                                        />
                                        <span className="font-semibold text-slate-800">
                                            Preço de Custo Atual Cadastrado
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Checkbox Recalcular Preço de Venda */}
                        <div className="pt-2 border-t border-slate-200">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={recalculateSellingPrice}
                                    onChange={e => setRecalculateSellingPrice(e.target.checked)}
                                    className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
                                />
                                <span className="text-xs font-bold text-slate-800">
                                    Recalcular também o Preço de Venda com base na Margem de Lucro (% individual de cada produto)
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Pré-visualização de Amostra */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-1.5">
                                <Sparkles size={14} className="text-amber-600" />
                                Prévia do Cálculo (Amostra de 5 produtos)
                            </span>
                            <span className="text-[11px] text-slate-500 font-normal">
                                Total no lote: <strong className="text-slate-800">{targetProducts.length} itens</strong>
                            </span>
                        </div>

                        <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs bg-white">
                            <div className="grid grid-cols-12 bg-slate-100 p-2.5 font-bold text-slate-700 text-[11px] border-b border-slate-200">
                                <div className="col-span-5">Produto / Código</div>
                                <div className="col-span-2 text-right">Custo Atual</div>
                                <div className="col-span-2 text-right text-amber-800">Novo Custo</div>
                                <div className="col-span-3 text-right text-emerald-800">Novo Preço Venda</div>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                                {previewSample.map(item => (
                                    <div key={item.id} className="grid grid-cols-12 p-2.5 items-center hover:bg-amber-50/30">
                                        <div className="col-span-5 pr-2">
                                            <div className="font-semibold text-slate-800 line-clamp-1">{item.name}</div>
                                            <div className="text-[10px] text-slate-400">{item.code}</div>
                                        </div>
                                        <div className="col-span-2 text-right font-medium text-slate-500">
                                            R$ {item.currentCost.toFixed(2)}
                                        </div>
                                        <div className="col-span-2 text-right font-bold text-amber-900">
                                            R$ {item.newCost.toFixed(2)}
                                            <span className="block text-[9px] text-amber-600">
                                                {item.diffCost >= 0 ? `+R$ ${item.diffCost.toFixed(2)}` : `-R$ ${Math.abs(item.diffCost).toFixed(2)}`}
                                            </span>
                                        </div>
                                        <div className="col-span-3 text-right font-bold text-emerald-700">
                                            R$ {item.newSellingPrice.toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Barra de Progresso durante aplicação */}
                    {isApplying && progress && (
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                            <div className="flex justify-between text-xs font-bold text-amber-900">
                                <span>Gravando atualização no Firestore...</span>
                                <span>{progress.current} de {progress.total} itens ({Math.round((progress.current / progress.total) * 100)}%)</span>
                            </div>
                            <div className="w-full bg-amber-200/60 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className="bg-amber-600 h-full transition-all duration-200"
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isApplying}
                        className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={handleApplyAdjustment}
                        disabled={isApplying || targetProducts.length === 0}
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {isApplying ? (
                            <>
                                <RefreshCw size={14} className="animate-spin" />
                                <span>Aplicando Reajuste...</span>
                            </>
                        ) : (
                            <>
                                <Check size={14} />
                                <span>Aplicar Reajuste ({targetProducts.length} Produtos)</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
