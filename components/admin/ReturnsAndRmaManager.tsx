import React, { useState, useEffect } from 'react';
import { 
    RotateCcw, 
    AlertTriangle, 
    ShieldAlert, 
    Trash2, 
    Plus, 
    Search, 
    Filter, 
    CheckCircle2, 
    Clock, 
    Truck, 
    DollarSign, 
    FileText, 
    Printer, 
    X, 
    AlertOctagon, 
    Package, 
    ArrowRightLeft,
    RefreshCw,
    Building2,
    Calendar,
    Eye
} from 'lucide-react';
import { subscribeToCollection, createDocument, updateDocument } from '../../services/firebaseService';
import { Product, RMARecord, Customer, Sale } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export const ReturnsAndRmaManager: React.FC = () => {
    const [rmaRecords, setRmaRecords] = useState<RMARecord[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    
    // Filtros e busca
    const [activeFilter, setActiveFilter] = useState<'all' | 'defect_scrap' | 'return_refund' | 'rma_supplier' | 'exchange'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal de Novo Registro
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRecordForView, setSelectedRecordForView] = useState<RMARecord | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        type: 'defect_scrap' as 'defect_scrap' | 'return_refund' | 'rma_supplier' | 'exchange',
        productId: '',
        quantity: 1,
        reason: '',
        customerName: '',
        customerDocument: '',
        customerPhone: '',
        supplierName: '',
        invoiceNumber: '',
        batchNumber: '',
        saleId: '',
        financialAction: 'loss_writeoff' as 'refund_cash_pix' | 'refund_card' | 'store_credit' | 'loss_writeoff' | 'supplier_credit' | 'none',
        deductFromStock: true, // Para avarias: dar baixa no estoque
        restockItem: true,     // Para devoluções: voltar para estoque
        operatorNotes: ''
    });

    useEffect(() => {
        const unsubRMA = subscribeToCollection('rma_records', (data) => setRmaRecords(data as RMARecord[]), 'createdAt');
        const unsubProducts = subscribeToCollection('products', (data) => setProducts(data as Product[]), 'name');
        const unsubCustomers = subscribeToCollection('customers', (data) => setCustomers(data as Customer[]), 'name');
        const unsubSales = subscribeToCollection('sales', (data) => setSales(data as Sale[]), 'createdAt');

        return () => {
            unsubRMA();
            unsubProducts();
            unsubCustomers();
            unsubSales();
        };
    }, []);

    const selectedProduct = products.find(p => p.id === formData.productId);

    // Quando troca o produto, auto-preenche fornecedor, lote, etc.
    const handleProductChange = (prodId: string) => {
        const prod = products.find(p => p.id === prodId);
        setFormData(prev => ({
            ...prev,
            productId: prodId,
            supplierName: prod?.supplierName || prev.supplierName,
            batchNumber: prod?.batchNumber || prev.batchNumber,
            invoiceNumber: prod?.invoiceNumber || prev.invoiceNumber
        }));
    };

    // Ajusta o padrão de ação financeira conforme o tipo
    const handleTypeChange = (newType: 'defect_scrap' | 'return_refund' | 'rma_supplier' | 'exchange') => {
        let defaultFin: any = 'none';
        if (newType === 'defect_scrap') defaultFin = 'loss_writeoff';
        else if (newType === 'return_refund') defaultFin = 'refund_cash_pix';
        else if (newType === 'rma_supplier') defaultFin = 'supplier_credit';
        else if (newType === 'exchange') defaultFin = 'store_credit';

        setFormData(prev => ({
            ...prev,
            type: newType,
            financialAction: defaultFin
        }));
    };

    const handleCreateRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productId) {
            alert('Por favor, selecione o produto envolvido.');
            return;
        }

        const prod = products.find(p => p.id === formData.productId);
        if (!prod) return;

        const qty = Number(formData.quantity) || 1;
        const unitPrice = Number(prod.price) || 0;
        const costPrice = Number(prod.costPrice) || (unitPrice * 0.6);
        const totalAmount = unitPrice * qty;
        const lossAmount = costPrice * qty;
        const protocol = `RMA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        setIsSubmitting(true);

        try {
            let condition: 'intact' | 'broken_scrap' | 'defect_warranty' = 'broken_scrap';
            let stockDestination: 'restocked' | 'scrapped' | 'quarantine_rma' = 'scrapped';
            let status: 'completed' | 'pending_supplier' | 'in_analysis' | 'resolved' = 'completed';

            if (formData.type === 'defect_scrap') {
                condition = 'broken_scrap';
                stockDestination = 'scrapped';
                status = 'completed';

                // 1. Dar baixa no estoque se o item estava no inventário físico
                if (formData.deductFromStock) {
                    const newStock = Math.max(0, (prod.stock || 0) - qty);
                    await updateDocument('products', prod.id, { stock: newStock });
                }

                // 2. Lançar perda financeira se configurado
                if (formData.financialAction === 'loss_writeoff') {
                    await createDocument('finance', {
                        description: `[PERDA/AVARIA] ${qty}x ${prod.name} (${protocol}) - ${formData.reason || 'Sucata/Quebra'}`,
                        amount: lossAmount,
                        type: 'expense',
                        category: 'Perdas e Avarias de Estoque',
                        dueDate: new Date().toISOString().split('T')[0],
                        status: 'paid'
                    });
                }
            } else if (formData.type === 'return_refund') {
                condition = 'intact';
                stockDestination = formData.restockItem ? 'restocked' : 'scrapped';
                status = 'completed';

                // 1. Retornar item ao estoque vendável
                if (formData.restockItem) {
                    const newStock = (prod.stock || 0) + qty;
                    await updateDocument('products', prod.id, { stock: newStock });
                }

                // 2. Lançar estorno de valor no Financeiro
                if (formData.financialAction === 'refund_cash_pix' || formData.financialAction === 'refund_card') {
                    await createDocument('finance', {
                        description: `[ESTORNO DEVOLUÇÃO] ${qty}x ${prod.name} (${protocol}) - Cliente: ${formData.customerName || 'Balcão'}`,
                        amount: totalAmount,
                        type: 'expense',
                        category: 'Estorno e Devolução de Venda',
                        dueDate: new Date().toISOString().split('T')[0],
                        status: 'paid'
                    });
                }
            } else if (formData.type === 'rma_supplier') {
                condition = 'defect_warranty';
                stockDestination = 'quarantine_rma';
                status = 'pending_supplier';

                // Se o item quebrado ainda estava no estoque ativo, retira para quarentena
                if (formData.deductFromStock) {
                    const newStock = Math.max(0, (prod.stock || 0) - qty);
                    await updateDocument('products', prod.id, { stock: newStock });
                }
            } else if (formData.type === 'exchange') {
                condition = 'intact';
                stockDestination = formData.restockItem ? 'restocked' : 'scrapped';
                status = 'completed';

                if (formData.restockItem) {
                    const newStock = (prod.stock || 0) + qty;
                    await updateDocument('products', prod.id, { stock: newStock });
                }
            }

            const rmaPayload: Omit<RMARecord, 'id'> = {
                protocol,
                type: formData.type,
                productId: prod.id,
                productName: prod.name,
                productImageUrl: prod.imageUrl || '',
                quantity: qty,
                unitPrice,
                costPrice,
                totalAmount,
                lossAmount,
                reason: formData.reason || 'Não informado',
                condition,
                stockDestination,
                financialAction: formData.financialAction,
                customerName: formData.customerName || undefined,
                customerDocument: formData.customerDocument || undefined,
                customerPhone: formData.customerPhone || undefined,
                supplierName: formData.supplierName || prod.supplierName || undefined,
                invoiceNumber: formData.invoiceNumber || prod.invoiceNumber || undefined,
                batchNumber: formData.batchNumber || prod.batchNumber || undefined,
                saleId: formData.saleId || undefined,
                status,
                resolutionNotes: formData.operatorNotes || undefined,
                createdAt: new Date().toISOString()
            };

            const docId = await createDocument('rma_records', rmaPayload);
            setIsModalOpen(false);
            setFeedback({ type: 'success', message: `Ocorrência ${protocol} registrada e processada com sucesso!` });
            setTimeout(() => setFeedback(null), 5000);

            // Abre o comprovante
            setSelectedRecordForView({ id: docId, ...rmaPayload });

            // Reset form
            setFormData({
                type: 'defect_scrap',
                productId: '',
                quantity: 1,
                reason: '',
                customerName: '',
                customerDocument: '',
                customerPhone: '',
                supplierName: '',
                invoiceNumber: '',
                batchNumber: '',
                saleId: '',
                financialAction: 'loss_writeoff',
                deductFromStock: true,
                restockItem: true,
                operatorNotes: ''
            });

        } catch (error: any) {
            console.error('Erro ao processar RMA:', error);
            setFeedback({ type: 'error', message: `Erro ao registrar ocorrência: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Confirmar que o fornecedor repôs o item do RMA
    const handleResolveSupplierRMA = async (record: RMARecord) => {
        if (!confirm(`Confirmar que o fornecedor (${record.supplierName || 'Fabricante'}) enviou a reposição de ${record.quantity} un de "${record.productName}" para o estoque vendável?`)) {
            return;
        }

        try {
            const prod = products.find(p => p.id === record.productId);
            if (prod) {
                const updatedStock = (prod.stock || 0) + record.quantity;
                await updateDocument('products', prod.id, { stock: updatedStock });
            }

            await updateDocument('rma_records', record.id, {
                status: 'resolved',
                stockDestination: 'restocked',
                resolutionNotes: `Reposição entregue pelo fornecedor em ${new Date().toLocaleDateString('pt-BR')}. Estoque reposto.`,
                updatedAt: new Date().toISOString()
            });

            setFeedback({ type: 'success', message: `RMA ${record.protocol} concluído! Estoque reposto (+${record.quantity} un).` });
            setTimeout(() => setFeedback(null), 4000);
        } catch (e: any) {
            alert(`Erro ao atualizar RMA: ${e.message}`);
        }
    };

    // Métricas
    const totalScrapLoss = rmaRecords
        .filter(r => r.type === 'defect_scrap')
        .reduce((sum, r) => sum + (Number(r.lossAmount || r.totalAmount || 0)), 0);

    const totalRefunds = rmaRecords
        .filter(r => r.type === 'return_refund')
        .reduce((sum, r) => sum + (Number(r.totalAmount || 0)), 0);

    const pendingSupplierRmaCount = rmaRecords
        .filter(r => r.type === 'rma_supplier' && r.status === 'pending_supplier')
        .reduce((sum, r) => sum + Number(r.quantity || 1), 0);

    const totalExchanges = rmaRecords.filter(r => r.type === 'exchange').length;

    // Filtros
    const filteredRecords = rmaRecords.filter(r => {
        if (activeFilter !== 'all' && r.type !== activeFilter) return false;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesProt = (r.protocol || '').toLowerCase().includes(term);
            const matchesProd = (r.productName || '').toLowerCase().includes(term);
            const matchesCust = (r.customerName || '').toLowerCase().includes(term);
            const matchesSupp = (r.supplierName || '').toLowerCase().includes(term);
            const matchesReason = (r.reason || '').toLowerCase().includes(term);
            return matchesProt || matchesProd || matchesCust || matchesSupp || matchesReason;
        }
        return true;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            {/* Feedback Message */}
            <AnimatePresence>
                {feedback && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mb-6 p-4 rounded-2xl flex items-center justify-between shadow-sm border ${
                            feedback.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                    >
                        <div className="flex items-center gap-2 font-medium text-sm">
                            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                            <span>{feedback.message}</span>
                        </div>
                        <button onClick={() => setFeedback(null)} className="text-xs font-bold underline opacity-70 hover:opacity-100">
                            Fechar
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-brand-dark flex items-center gap-3">
                        <RotateCcw className="text-brand-primary" size={32} />
                        Trocas, Devoluções & Gestão de Avarias (RMA)
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Controle de perdas operacionais por avarias/quebra, estornos ao cliente e garantias com fornecedores.
                    </p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3.5 bg-brand-primary text-white rounded-2xl font-bold shadow-lg hover:bg-brand-dark transition-all flex items-center gap-2 self-start md:self-auto"
                >
                    <Plus size={20} />
                    <span>Lançar Ocorrência / RMA</span>
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-red-100 flex items-start space-x-4">
                    <div className="p-3.5 bg-red-500 text-white rounded-2xl shadow-md">
                        <AlertOctagon size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Perdas por Avaria / Quebra</p>
                        <p className="text-2xl font-bold font-serif text-red-600 mt-0.5">R$ {totalScrapLoss.toFixed(2)}</p>
                        <p className="text-[11px] text-gray-500 mt-1">Custo de mercadoria avariada</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-amber-100 flex items-start space-x-4">
                    <div className="p-3.5 bg-amber-500 text-white rounded-2xl shadow-md">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estornos & Devoluções</p>
                        <p className="text-2xl font-bold font-serif text-amber-600 mt-0.5">R$ {totalRefunds.toFixed(2)}</p>
                        <p className="text-[11px] text-gray-500 mt-1">Valores restituídos a clientes</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 flex items-start space-x-4">
                    <div className="p-3.5 bg-blue-600 text-white rounded-2xl shadow-md">
                        <Truck size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Garantia c/ Fornecedor (RMA)</p>
                        <p className="text-2xl font-bold font-serif text-blue-600 mt-0.5">{pendingSupplierRmaCount} un</p>
                        <p className="text-[11px] text-gray-500 mt-1">Aguardando reposição/troca</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start space-x-4">
                    <div className="p-3.5 bg-emerald-600 text-white rounded-2xl shadow-md">
                        <ArrowRightLeft size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trocas no Balcão</p>
                        <p className="text-2xl font-bold font-serif text-gray-900 mt-0.5">{totalExchanges}</p>
                        <p className="text-[11px] text-gray-500 mt-1">Itens substituídos</p>
                    </div>
                </div>
            </div>

            {/* Barra de Filtros e Busca */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {[
                        { id: 'all', label: 'Todas as Ocorrências' },
                        { id: 'defect_scrap', label: '💥 Avarias / Quebras (Sucata)' },
                        { id: 'return_refund', label: '↩️ Devoluções & Estornos' },
                        { id: 'rma_supplier', label: '🏭 Garantias c/ Fabricante (RMA)' },
                        { id: 'exchange', label: '🔄 Trocas no Balcão' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFilter(tab.id as any)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeFilter === tab.id
                                    ? 'bg-brand-primary text-white shadow-sm'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text"
                        placeholder="Buscar por protocolo, produto, cliente..."
                        className="w-full pl-10 pr-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Listagem de Ocorrências */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                <th className="px-6 py-4">Protocolo / Data</th>
                                <th className="px-6 py-4">Tipo & Destino</th>
                                <th className="px-6 py-4">Produto Envolvido</th>
                                <th className="px-6 py-4">Qtd / Valores</th>
                                <th className="px-6 py-4">Cliente / Fornecedor</th>
                                <th className="px-6 py-4">Status & Ação</th>
                                <th className="px-6 py-4 text-right">Comprovante</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredRecords.map((rec) => {
                                return (
                                    <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-brand-dark text-xs block">{rec.protocol}</span>
                                            <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                <Calendar size={11} />
                                                {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString('pt-BR') : ''}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {rec.type === 'defect_scrap' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                                    <AlertOctagon size={12} /> Avaria / Sucata (Perda)
                                                </span>
                                            )}
                                            {rec.type === 'return_refund' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                                    <RotateCcw size={12} /> Devolução / Estorno
                                                </span>
                                            )}
                                            {rec.type === 'rma_supplier' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                                    <Truck size={12} /> Garantia Fornecedor (RMA)
                                                </span>
                                            )}
                                            {rec.type === 'exchange' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                                    <ArrowRightLeft size={12} /> Troca de Balcão
                                                </span>
                                            )}

                                            <span className="text-[11px] text-gray-500 block mt-1 font-medium">
                                                Estoque: {rec.stockDestination === 'scrapped' ? '❌ Baixa / Descarte' : rec.stockDestination === 'restocked' ? '✅ Retornou p/ Venda' : '⏳ Quarentena RMA'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {rec.productImageUrl && (
                                                    <img src={rec.productImageUrl} alt={rec.productName} className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0" />
                                                )}
                                                <div>
                                                    <span className="font-bold text-gray-900 block text-xs line-clamp-1">{rec.productName}</span>
                                                    <span className="text-[11px] text-gray-500 line-clamp-1 italic">
                                                        Motivo: {rec.reason || 'Não informado'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 text-xs">
                                                {rec.quantity} un • R$ {Number(rec.totalAmount || 0).toFixed(2)}
                                            </div>
                                            {rec.type === 'defect_scrap' && rec.lossAmount && (
                                                <span className="text-[11px] text-red-600 font-bold block mt-0.5">
                                                    Prejuízo: R$ {Number(rec.lossAmount).toFixed(2)}
                                                </span>
                                            )}
                                            <span className="text-[10px] text-gray-400 block">
                                                Fin: {rec.financialAction === 'loss_writeoff' ? 'Perda Lançada' : rec.financialAction === 'refund_cash_pix' ? 'Estorno PIX/Dinheiro' : rec.financialAction === 'store_credit' ? 'Vale-Crédito' : 'Sem impacto'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {rec.customerName && (
                                                <span className="text-xs font-bold text-gray-800 block">
                                                    Cli: {rec.customerName}
                                                </span>
                                            )}
                                            {rec.supplierName && (
                                                <span className="text-[11px] text-gray-500 block">
                                                    Forn: {rec.supplierName} {rec.batchNumber ? `(Lote: ${rec.batchNumber})` : ''}
                                                </span>
                                            )}
                                            {!rec.customerName && !rec.supplierName && (
                                                <span className="text-xs text-gray-400">Interno / Balcão</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {rec.type === 'rma_supplier' && rec.status === 'pending_supplier' ? (
                                                <button
                                                    onClick={() => handleResolveSupplierRMA(rec)}
                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
                                                >
                                                    <RefreshCw size={13} />
                                                    <span>Receber Nova Peça</span>
                                                </button>
                                            ) : (
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block ${
                                                    rec.status === 'resolved' || rec.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {rec.status === 'resolved' ? 'Resolvido' : rec.status === 'completed' ? 'Concluído' : 'Pendente'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => setSelectedRecordForView(rec)}
                                                className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-light rounded-xl transition-all"
                                                title="Ver e Imprimir Comprovante / Laudo"
                                            >
                                                <Eye size={17} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredRecords.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                        <RotateCcw size={36} className="mx-auto mb-2 opacity-30" />
                                        <p className="font-bold text-sm">Nenhuma ocorrência encontrada.</p>
                                        <p className="text-xs mt-0.5">Use o botão acima para lançar devoluções, trocas ou perdas por avarias.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Lançamento de Ocorrência */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative my-8"
                        >
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-3 mb-6 border-b pb-4">
                                <div className="p-3 bg-brand-light text-brand-primary rounded-2xl">
                                    <RotateCcw size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-serif font-bold text-brand-dark">Lançar Troca / Avaria / Devolução</h3>
                                    <p className="text-xs text-gray-500">Tratamento de produtos quebrados, sem condições de revenda ou devoluções de clientes.</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateRecord} className="space-y-6">
                                {/* Tipo de Ocorrência */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Selecione o Tipo de Ocorrência *</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { 
                                                id: 'defect_scrap', 
                                                label: '💥 Avaria / Quebra (Sem Revenda)', 
                                                desc: 'Produto quebrado, trincado ou danificado. Gera baixa definitiva e registro de perda contábil.' 
                                            },
                                            { 
                                                id: 'return_refund', 
                                                label: '↩️ Devolução com Estorno ao Cliente', 
                                                desc: 'Cliente devolveu o produto intacto. Retorna ao estoque vendável e gera estorno financeiro.' 
                                            },
                                            { 
                                                id: 'rma_supplier', 
                                                label: '🏭 Defeito de Fábrica / Garantia Fornecedor', 
                                                desc: 'Item com vício ou defeito de fábrica para envio e troca junto ao fornecedor/fabricante.' 
                                            },
                                            { 
                                                id: 'exchange', 
                                                label: '🔄 Troca Direta no Balcão', 
                                                desc: 'Substituição imediata por outro modelo ou vale-compras.' 
                                            },
                                        ].map((t) => (
                                            <div 
                                                key={t.id}
                                                onClick={() => handleTypeChange(t.id as any)}
                                                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                                                    formData.type === t.id 
                                                        ? 'bg-brand-primary/5 border-brand-primary ring-1 ring-brand-primary' 
                                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                }`}
                                            >
                                                <p className="font-bold text-xs text-brand-dark">{t.label}</p>
                                                <p className="text-[11px] text-gray-500 mt-1 leading-snug">{t.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Seleção do Produto */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Produto Envolvido *</label>
                                    <select
                                        required
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                                        value={formData.productId}
                                        onChange={(e) => handleProductChange(e.target.value)}
                                    >
                                        <option value="">Selecione o produto do catálogo...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} (Estoque atual: {p.stock || 0} un | R$ {Number(p.price || 0).toFixed(2)})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedProduct && (
                                    <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-3">
                                            <img src={selectedProduct.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
                                            <div>
                                                <span className="font-bold text-amber-950 block">{selectedProduct.name}</span>
                                                <span className="text-[11px] text-amber-800">
                                                    Preço de Venda: R$ {Number(selectedProduct.price).toFixed(2)} | Custo de Compra: R$ {Number(selectedProduct.costPrice || selectedProduct.price * 0.6).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="font-bold px-2.5 py-1 bg-amber-100 text-amber-900 rounded-xl">
                                            Estoque: {selectedProduct.stock || 0} un
                                        </span>
                                    </div>
                                )}

                                {/* Quantidade e Motivo */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Quantidade Afetada *</label>
                                        <input 
                                            type="number"
                                            min="1"
                                            required
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary outline-none font-bold"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>

                                    <div className="sm:col-span-2 space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Motivo Detalhado da Ocorrência *</label>
                                        <input 
                                            type="text"
                                            required
                                            placeholder="Ex: Quebrou no transporte, lâmpada não acende, cliente comprou voltagem errada..."
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Dados do Cliente e Fornecedor */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Cliente (se houver)</label>
                                        <input 
                                            placeholder="Nome do cliente ou Consumidor Balcão"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-primary outline-none"
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Fornecedor / Fabricante</label>
                                        <input 
                                            placeholder="Ex: Tigre, Deca, Tramontina"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-primary outline-none"
                                            value={formData.supplierName}
                                            onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Tratamento de Estoque & Financeiro Automático */}
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <DollarSign size={15} /> Impacto Automático em Estoque e Caixa
                                    </h4>

                                    {formData.type === 'defect_scrap' && (
                                        <div className="space-y-2 text-xs text-slate-600">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.deductFromStock}
                                                    onChange={e => setFormData({ ...formData, deductFromStock: e.target.checked })}
                                                    className="w-4 h-4 text-brand-primary rounded"
                                                />
                                                <span>Dar baixa imediata de <strong>{formData.quantity} unidade(s)</strong> do estoque vendável</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.financialAction === 'loss_writeoff'}
                                                    onChange={e => setFormData({ ...formData, financialAction: e.target.checked ? 'loss_writeoff' : 'none' })}
                                                    className="w-4 h-4 text-brand-primary rounded"
                                                />
                                                <span>Lançar <strong>Perda Operacional</strong> de <strong>R$ {((selectedProduct?.costPrice || (selectedProduct?.price || 0) * 0.6) * formData.quantity).toFixed(2)}</strong> no Módulo Financeiro</span>
                                            </label>
                                        </div>
                                    )}

                                    {formData.type === 'return_refund' && (
                                        <div className="space-y-2 text-xs text-slate-600">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.restockItem}
                                                    onChange={e => setFormData({ ...formData, restockItem: e.target.checked })}
                                                    className="w-4 h-4 text-brand-primary rounded"
                                                />
                                                <span>Retornar <strong>+{formData.quantity} unidade(s)</strong> de volta ao estoque vendável (peça em perfeito estado)</span>
                                            </label>
                                            <div className="pt-2">
                                                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Forma de Restituição Financeira ao Cliente:</label>
                                                <select 
                                                    className="p-2 bg-white border border-gray-200 rounded-xl text-xs w-full"
                                                    value={formData.financialAction}
                                                    onChange={e => setFormData({ ...formData, financialAction: e.target.value as any })}
                                                >
                                                    <option value="refund_cash_pix">Estorno via PIX ou Dinheiro (Lança saída financeira imediata)</option>
                                                    <option value="refund_card">Estorno na Operadora de Cartão (Lança saída financeira)</option>
                                                    <option value="store_credit">Gerar Vale-Crédito / Troca no Balcão</option>
                                                    <option value="none">Não movimentar financeiro</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {formData.type === 'rma_supplier' && (
                                        <p className="text-xs text-slate-600">
                                            O produto ficará registrado como <strong>"Pendente de Garantia"</strong> com o fornecedor. Quando a peça nova for entregue, você poderá dar entrada com um único clique.
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-3 bg-brand-primary hover:bg-brand-dark text-white rounded-2xl font-bold text-sm shadow-xl transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Processando...' : 'Confirmar e Processar'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Visualização / Impressão do Comprovante de RMA / Laudo */}
            <AnimatePresence>
                {selectedRecordForView && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative"
                        >
                            <button 
                                onClick={() => setSelectedRecordForView(null)}
                                className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center mb-6">
                                <div className="w-14 h-14 bg-brand-light text-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <FileText size={28} />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-brand-dark">Termo de Ocorrência & RMA</h3>
                                <p className="text-xs font-mono font-bold text-brand-primary">{selectedRecordForView.protocol}</p>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-2xl mb-6 font-mono text-xs space-y-2.5 border border-gray-200">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Data de Registro:</span>
                                    <span className="font-bold">
                                        {selectedRecordForView.createdAt ? new Date(selectedRecordForView.createdAt).toLocaleString('pt-BR') : ''}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Classificação:</span>
                                    <span className="font-bold uppercase">
                                        {selectedRecordForView.type === 'defect_scrap' ? 'Avaria / Perda Total' : selectedRecordForView.type === 'return_refund' ? 'Devolução / Estorno' : selectedRecordForView.type === 'rma_supplier' ? 'Garantia Fornecedor' : 'Troca'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Produto:</span>
                                    <span className="font-bold truncate max-w-[220px]">{selectedRecordForView.productName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Quantidade:</span>
                                    <span className="font-bold">{selectedRecordForView.quantity} un</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Valor Total:</span>
                                    <span className="font-bold">R$ {Number(selectedRecordForView.totalAmount || 0).toFixed(2)}</span>
                                </div>
                                {selectedRecordForView.customerName && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Cliente:</span>
                                        <span className="font-bold">{selectedRecordForView.customerName}</span>
                                    </div>
                                )}
                                {selectedRecordForView.supplierName && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Fornecedor:</span>
                                        <span className="font-bold">{selectedRecordForView.supplierName}</span>
                                    </div>
                                )}
                                <div className="border-t pt-2">
                                    <span className="text-gray-500 block mb-1">Motivo Registrado:</span>
                                    <p className="font-sans text-xs bg-white p-2.5 rounded-xl border border-gray-200 text-gray-700">
                                        {selectedRecordForView.reason}
                                    </p>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button 
                                    onClick={() => window.print()}
                                    className="flex-1 py-3.5 bg-brand-dark text-white rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 hover:bg-black transition-all"
                                >
                                    <Printer size={18} />
                                    <span>Imprimir Comprovante</span>
                                </button>
                                <button 
                                    onClick={() => setSelectedRecordForView(null)}
                                    className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-200"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
