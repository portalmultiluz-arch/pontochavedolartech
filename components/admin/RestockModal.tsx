import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, PurchaseRecord } from '../../types';
import { calculateProductPrice } from '../../lib/taxCalculator';
import { updateDocument } from '../../services/firebaseService';
import { 
    Package, 
    FileText, 
    Truck, 
    Calendar, 
    DollarSign, 
    Percent, 
    Calculator, 
    TrendingUp, 
    Check, 
    X, 
    Plus, 
    History, 
    Zap, 
    Ruler, 
    Clock, 
    AlertCircle 
} from 'lucide-react';

interface RestockModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (updatedProduct: Product, message: string) => void;
    onSaved?: () => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
    product,
    isOpen,
    onClose,
    onSuccess,
    onSaved
}) => {
    if (!isOpen || !product) return null;

    return <RestockModalContent product={product} isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} onSaved={onSaved} />;
};

const RestockModalContent: React.FC<RestockModalProps & { product: Product }> = ({
    product,
    isOpen,
    onClose,
    onSuccess,
    onSaved
}) => {
    // Form da Nova Compra / Reposição de Estoque
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [invoiceKey, setInvoiceKey] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [supplierName, setSupplierName] = useState(product?.supplierName || '');
    const [quantityAdded, setQuantityAdded] = useState<number | string>('');
    const [costPrice, setCostPrice] = useState<number | string>(product?.costPrice || '');
    const [icmsPercent, setIcmsPercent] = useState<number>(product?.icmsPercent !== undefined ? product.icmsPercent : 18);
    const [ipiPercent, setIpiPercent] = useState<number>(product?.ipiPercent !== undefined ? product.ipiPercent : 0);
    const [pisPercent, setPisPercent] = useState<number>(product?.pisPercent !== undefined ? product.pisPercent : 1.65);
    const [cofinsPercent, setCofinsPercent] = useState<number>(product?.cofinsPercent !== undefined ? product.cofinsPercent : 7.60);
    const [otherTaxesPercent, setOtherTaxesPercent] = useState<number>(product?.otherTaxesPercent || 0);
    const [profitMarginPercent, setProfitMarginPercent] = useState<number>(product?.profitMarginPercent !== undefined ? product.profitMarginPercent : 40);
    const [sellingPrice, setSellingPrice] = useState<number | string>(product?.price || '');
    const [batchNumber, setBatchNumber] = useState(product?.batchNumber || '');
    const [expiryDate, setExpiryDate] = useState(product?.expiryDate || '');
    const [voltage, setVoltage] = useState(product?.voltage || '');
    const [dimensionsSize, setDimensionsSize] = useState(product?.dimensionsSize || '');
    const [notes, setNotes] = useState('');

    const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Cálculos tributários automáticos da nova compra
    const taxSummary = useMemo(() => {
        const costNum = Number(costPrice) || 0;
        return calculateProductPrice({
            costPrice: costNum,
            icmsPercent: Number(icmsPercent) || 0,
            ipiPercent: Number(ipiPercent) || 0,
            pisPercent: Number(pisPercent) || 0,
            cofinsPercent: Number(cofinsPercent) || 0,
            otherTaxesPercent: Number(otherTaxesPercent) || 0,
            profitMarginPercent: Number(profitMarginPercent) || 0,
        });
    }, [costPrice, icmsPercent, ipiPercent, pisPercent, cofinsPercent, otherTaxesPercent, profitMarginPercent]);

    const handleApplySuggestedPrice = () => {
        if (taxSummary.suggestedPrice > 0) {
            setSellingPrice(taxSummary.suggestedPrice);
        }
    };

    const currentStock = Number(product.stock || 0);
    const addedNum = Number(quantityAdded) || 0;
    const projectedNewStock = currentStock + (addedNum > 0 ? addedNum : 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!invoiceNumber.trim()) {
            setErrorMsg('Informe o número da Nova Nota Fiscal (NF).');
            return;
        }

        if (isNaN(addedNum) || addedNum <= 0) {
            setErrorMsg('Informe a quantidade de produtos comprados que dará entrada no estoque.');
            return;
        }

        const costNum = Number(costPrice);
        if (isNaN(costNum) || costNum < 0) {
            setErrorMsg('Informe um preço de custo válido.');
            return;
        }

        const sellNum = Number(sellingPrice);
        if (isNaN(sellNum) || sellNum <= 0) {
            setErrorMsg('Informe um preço de venda válido maior que zero.');
            return;
        }

        setIsSaving(true);
        try {
            const newRecord: PurchaseRecord = {
                id: 'PUR-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
                invoiceNumber: invoiceNumber.trim(),
                invoiceKey: invoiceKey.trim() || undefined,
                purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
                supplierName: supplierName.trim() || undefined,
                quantityAdded: addedNum,
                costPrice: costNum,
                sellingPrice: sellNum,
                icmsPercent: Number(icmsPercent) || 0,
                ipiPercent: Number(ipiPercent) || 0,
                pisPercent: Number(pisPercent) || 0,
                cofinsPercent: Number(cofinsPercent) || 0,
                otherTaxesPercent: Number(otherTaxesPercent) || 0,
                profitMarginPercent: Number(profitMarginPercent) || 0,
                batchNumber: batchNumber.trim() || undefined,
                expiryDate: expiryDate || undefined,
                voltage: voltage.trim() || undefined,
                dimensionsSize: dimensionsSize.trim() || undefined,
                notes: notes.trim() || undefined,
                createdAt: new Date().toISOString()
            };

            const existingHistory: PurchaseRecord[] = Array.isArray(product.purchaseHistory) 
                ? [...product.purchaseHistory] 
                : [];

            const updatedHistory = [newRecord, ...existingHistory];

            const updatedFields: Partial<Product> = {
                stock: projectedNewStock,
                invoiceNumber: newRecord.invoiceNumber,
                purchaseDate: newRecord.purchaseDate,
                supplierName: newRecord.supplierName || product.supplierName || '',
                costPrice: newRecord.costPrice,
                price: newRecord.sellingPrice,
                icmsPercent: newRecord.icmsPercent,
                ipiPercent: newRecord.ipiPercent,
                pisPercent: newRecord.pisPercent,
                cofinsPercent: newRecord.cofinsPercent,
                otherTaxesPercent: newRecord.otherTaxesPercent,
                profitMarginPercent: newRecord.profitMarginPercent,
                batchNumber: newRecord.batchNumber || product.batchNumber || '',
                expiryDate: newRecord.expiryDate || product.expiryDate || '',
                voltage: newRecord.voltage || product.voltage || '',
                dimensionsSize: newRecord.dimensionsSize || product.dimensionsSize || '',
                purchaseHistory: updatedHistory,
                isActive: true // Reativa caso estivesse sem estoque
            };

            await updateDocument('products', product.id, updatedFields);

            const mergedProduct: Product = {
                ...product,
                ...updatedFields
            };

            if (onSuccess) {
                onSuccess(
                    mergedProduct,
                    `Entrada da NF ${newRecord.invoiceNumber} realizada! +${addedNum} un adicionadas. Novo estoque: ${projectedNewStock} un.`
                );
            } else if (onSaved) {
                onSaved();
            }
            onClose();
        } catch (err: any) {
            console.error('Erro ao registrar nova compra:', err);
            setErrorMsg(err.message || 'Falha ao processar entrada de estoque.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 via-brand-dark to-slate-900 text-white p-6 flex items-start justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                                <Truck size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                                        Reposição de Estoque & Nova Compra
                                    </span>
                                    <span className="text-xs text-slate-400">Lançamento de Nova NF sem recadastrar</span>
                                </div>
                                <h3 className="text-xl font-bold font-serif text-white mt-1 line-clamp-1">
                                    {product.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                                    <span>Estoque atual: <strong className="text-white">{currentStock} un</strong></span>
                                    <span>•</span>
                                    <span>Última NF: <strong className="text-slate-200 font-mono">{product.invoiceNumber || 'Não informada'}</strong></span>
                                    {product.supplierName && (
                                        <>
                                            <span>•</span>
                                            <span>Fornecedor: <strong className="text-slate-200">{product.supplierName}</strong></span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-all"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    {/* Abas: Formulário de Entrada vs Histórico de NFs */}
                    <div className="flex border-b border-gray-100 bg-gray-50/80 px-6">
                        <button
                            type="button"
                            onClick={() => setActiveTab('form')}
                            className={`py-3.5 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
                                activeTab === 'form'
                                    ? 'border-brand-primary text-brand-primary bg-white'
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <Plus size={16} />
                            <span>Lançar Nova Nota Fiscal & Repor Estoque</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('history')}
                            className={`py-3.5 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
                                activeTab === 'history'
                                    ? 'border-brand-primary text-brand-primary bg-white'
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <History size={16} />
                            <span>Histórico de Entradas / Compras ({product.purchaseHistory?.length || (product.invoiceNumber ? 1 : 0)})</span>
                        </button>
                    </div>

                    {errorMsg && (
                        <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                            <AlertCircle size={16} className="shrink-0 text-red-600" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {activeTab === 'form' ? (
                        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Bloco 1: Dados da Nova Nota Fiscal e Fornecedor */}
                            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <FileText size={15} className="text-brand-primary" />
                                    <span>Identificação da Nova Nota Fiscal (NF) & Fornecedor</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase">
                                            Nova Nota Fiscal (NF) *
                                        </label>
                                        <input
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm font-semibold"
                                            placeholder="Ex: NF-e 005920"
                                            value={invoiceNumber}
                                            onChange={e => setInvoiceNumber(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase">
                                            Data de Emissão / Entrada
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                            value={purchaseDate}
                                            onChange={e => setPurchaseDate(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase">
                                            Novo Fornecedor / Fabricante
                                        </label>
                                        <input
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                            placeholder="Ex: Multiluz Distribuidora Ltda ou Fabricante X"
                                            value={supplierName}
                                            onChange={e => setSupplierName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase">
                                            Chave de Acesso / Série NF (Opcional)
                                        </label>
                                        <input
                                            className="w-full p-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-xs font-mono"
                                            placeholder="44 dígitos da NF-e..."
                                            value={invoiceKey}
                                            onChange={e => setInvoiceKey(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase">
                                            Lote da Remessa (Opcional)
                                        </label>
                                        <input
                                            className="w-full p-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-xs"
                                            placeholder="Ex: LOTE-2026-B8"
                                            value={batchNumber}
                                            onChange={e => setBatchNumber(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bloco 2: Quantidade Comprada & Projeção de Estoque */}
                            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-emerald-950 uppercase flex items-center gap-1.5">
                                            <Package size={16} className="text-emerald-700" />
                                            <span>Quantidade Comprada nesta Remessa *</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                className="w-36 p-2.5 bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-base font-bold text-emerald-900"
                                                placeholder="Ex: 20"
                                                value={quantityAdded}
                                                onChange={e => setQuantityAdded(e.target.value)}
                                                required
                                            />
                                            <span className="text-xs text-emerald-800 font-bold">unidades</span>
                                        </div>
                                    </div>

                                    {/* Preview do Estoque Resultante */}
                                    <div className="bg-white border border-emerald-200 rounded-xl p-3 flex items-center gap-4 text-xs">
                                        <div>
                                            <span className="text-gray-400 block font-medium">Estoque Atual</span>
                                            <span className="font-bold text-gray-700 text-sm">{currentStock} un</span>
                                        </div>
                                        <span className="text-emerald-600 font-black text-base">+</span>
                                        <div>
                                            <span className="text-gray-400 block font-medium">Nova Entrada</span>
                                            <span className="font-bold text-emerald-600 text-sm">+{addedNum} un</span>
                                        </div>
                                        <span className="text-gray-300 font-black text-base">=</span>
                                        <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-center shadow-sm">
                                            <span className="text-[10px] uppercase font-bold block opacity-90">Novo Estoque</span>
                                            <span className="font-black text-sm">{projectedNewStock} un</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bloco 3: Formação de Custo, Tributos & Novo Preço de Venda */}
                            <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                                        <DollarSign size={15} className="text-amber-600" />
                                        <span>Custos, Alíquotas Fiscais & Novo Preço de Venda</span>
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={handleApplySuggestedPrice}
                                        className="text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-sm"
                                    >
                                        <Sparkles size={13} className="text-amber-600" />
                                        <span>Aplicar Preço Sugerido (R$ {taxSummary.suggestedPrice.toFixed(2)})</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase">
                                            Novo Custo Unitário (R$) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm font-semibold"
                                            placeholder="0.00"
                                            value={costPrice}
                                            onChange={e => setCostPrice(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase">
                                            Margem de Lucro (%)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm font-semibold"
                                            placeholder="40"
                                            value={profitMarginPercent}
                                            onChange={e => setProfitMarginPercent(parseFloat(e.target.value) || 0)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase">
                                            Preço Sugerido (Tributado)
                                        </label>
                                        <div className="p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700">
                                            R$ {taxSummary.suggestedPrice.toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-brand-dark uppercase">
                                            Novo Preço de Venda (R$) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            className="w-full p-2.5 bg-white border-2 border-brand-primary rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm font-bold text-brand-dark"
                                            placeholder="0.00"
                                            value={sellingPrice}
                                            onChange={e => setSellingPrice(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Tributos Agregados da Nova NF */}
                                <div className="pt-2 border-t border-amber-200/60">
                                    <span className="text-[11px] font-bold text-gray-600 uppercase block mb-2">
                                        Alíquotas e Impostos destacados na Nova Nota Fiscal:
                                    </span>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                        <div className="space-y-0.5">
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase">ICMS (%)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="w-full p-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                                                value={icmsPercent}
                                                onChange={e => setIcmsPercent(parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-0.5">
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase">IPI (%)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="w-full p-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                                                value={ipiPercent}
                                                onChange={e => setIpiPercent(parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-0.5">
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase">PIS (%)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full p-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                                                value={pisPercent}
                                                onChange={e => setPisPercent(parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-0.5">
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase">COFINS (%)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full p-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                                                value={cofinsPercent}
                                                onChange={e => setCofinsPercent(parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-0.5">
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase">Outros (%)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="w-full p-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                                                value={otherTaxesPercent}
                                                onChange={e => setOtherTaxesPercent(parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bloco 4: Atualização Opcional de Atributos da Remessa (Voltagem, Medidas, Validade) */}
                            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <Zap size={14} className="text-amber-500 fill-amber-400" />
                                    <span>Atualização de Atributos da Nova Remessa (Sem recadastro)</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-gray-600 uppercase">
                                            Voltagem da Remessa
                                        </label>
                                        <select
                                            className="w-full p-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-xs font-semibold"
                                            value={voltage}
                                            onChange={e => setVoltage(e.target.value)}
                                        >
                                            <option value="">Manter atual ({product.voltage || 'Sem voltagem'})</option>
                                            <option value="110V">110V / 127V</option>
                                            <option value="220V">220V</option>
                                            <option value="Bivolt (110V/220V)">Bivolt (110V/220V)</option>
                                            <option value="Bivolt Automático">Bivolt Automático</option>
                                            <option value="6V">6V</option>
                                            <option value="12V">12V</option>
                                            <option value="24V">24V</option>
                                            <option value="48V">48V</option>
                                            <option value="Não se aplica">Não se aplica</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-gray-600 uppercase">
                                            Dimensões / Calibre
                                        </label>
                                        <input
                                            className="w-full p-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-xs font-medium"
                                            placeholder={product.dimensionsSize || 'Ex: 1/2", P, M...'}
                                            value={dimensionsSize}
                                            onChange={e => setDimensionsSize(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-gray-600 uppercase">
                                            Data de Validade do Lote
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full p-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-xs"
                                            value={expiryDate}
                                            onChange={e => setExpiryDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1 pt-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">
                                        Observações da Compra / Reposição
                                    </label>
                                    <input
                                        className="w-full p-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-xs"
                                        placeholder="Ex: Compra de emergência para atender pedido de obra; frete por conta do fornecedor."
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Footer do Modal */}
                            <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <span>Processando Entrada...</span>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            <span>Confirmar Entrada da NF (+{addedNum || 0} un)</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* Aba de Histórico de Entradas / Compras */
                        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                            {product.purchaseHistory && product.purchaseHistory.length > 0 ? (
                                <div className="space-y-3">
                                    {product.purchaseHistory.map((rec, idx) => (
                                        <div key={rec.id || idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-sm text-brand-dark">
                                                            NF: {rec.invoiceNumber}
                                                        </span>
                                                        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                                                            +{rec.quantityAdded} un
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        Data da Compra: {rec.purchaseDate ? new Date(rec.purchaseDate).toLocaleDateString('pt-BR') : '—'}
                                                        {rec.supplierName ? ` • Fornecedor: ${rec.supplierName}` : ''}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-bold text-gray-800 block">
                                                        Venda: R$ {Number(rec.sellingPrice || 0).toFixed(2)}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 block">
                                                        Custo: R$ {Number(rec.costPrice || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 text-[11px] pt-2 border-t border-slate-200/80">
                                                {rec.batchNumber && (
                                                    <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600">
                                                        Lote: {rec.batchNumber}
                                                    </span>
                                                )}
                                                {rec.voltage && (
                                                    <span className="bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded font-medium">
                                                        {rec.voltage}
                                                    </span>
                                                )}
                                                {rec.expiryDate && (
                                                    <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600">
                                                        Validade: {new Date(rec.expiryDate).toLocaleDateString('pt-BR')}
                                                    </span>
                                                )}
                                                {rec.notes && (
                                                    <span className="text-gray-500 italic">
                                                        "{rec.notes}"
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <History size={40} className="mx-auto mb-2 opacity-40" />
                                    <p className="text-sm font-medium text-gray-600">Nenhum histórico de reposição adicional registrado ainda.</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Última Nota Fiscal cadastrada na ficha do produto: <strong>{product.invoiceNumber || 'Não informada'}</strong>
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('form')}
                                        className="mt-4 px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl shadow hover:bg-brand-dark transition-all"
                                    >
                                        Lançar Primeira Nova Compra
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

function Sparkles(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        </svg>
    );
}
