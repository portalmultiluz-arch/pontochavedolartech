import React, { useState, useEffect } from 'react';
import { 
    ShoppingBag, 
    Search, 
    Plus, 
    Minus, 
    Trash2, 
    CreditCard, 
    Banknote, 
    QrCode, 
    CheckCircle, 
    Printer, 
    X, 
    User, 
    FileText, 
    RotateCcw, 
    Calendar, 
    Building2, 
    Phone, 
    ArrowRight,
    Tag,
    Clock,
    Check,
    AlertCircle,
    Download,
    MessageCircle,
    MapPin
} from 'lucide-react';
import { subscribeToCollection, createDocument, updateDocument, deleteDocument } from '../../services/firebaseService';
import { Product, CartItem, Sale, Customer, QuoteRecord } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { sanitizeCustomerText, sanitizeProductForCustomer } from '../../lib/textHelper';
import { QuoteProposalModal } from './QuoteProposalModal';
import { generateQuotePDF, generateWhatsAppQuoteMessage, formatSafeDate } from '../../lib/pdfQuoteGenerator';

export const POSManager: React.FC = () => {
    const [activeSection, setActiveSection] = useState<'pos' | 'quotes'>('pos');

    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
    
    // POS State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [customCustomerName, setCustomCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'debit_card' | 'pix' | 'cash'>('pix');
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);
    const [convertedFromQuoteId, setConvertedFromQuoteId] = useState<string | null>(null);

    // Quote Modal State
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [selectedQuoteForView, setSelectedQuoteForView] = useState<QuoteRecord | null>(null);
    const [quoteSearchTerm, setQuoteSearchTerm] = useState('');
    const [quoteStatusFilter, setQuoteStatusFilter] = useState<'all' | 'open' | 'converted' | 'expired'>('all');
    const [quoteToDelete, setQuoteToDelete] = useState<QuoteRecord | null>(null);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const unsubProducts = subscribeToCollection('products', (data) => setProducts(data as Product[]), 'name');
        const unsubCustomers = subscribeToCollection('customers', (data) => setCustomers(data as Customer[]), 'name');
        const unsubQuotes = subscribeToCollection('quotes', (data) => setQuotes(data as QuoteRecord[]), 'createdAt');
        return () => {
            unsubProducts();
            unsubCustomers();
            unsubQuotes();
        };
    }, []);

    const addToCart = (product: Product) => {
        const cleanProd = sanitizeProductForCustomer(product);
        if ((cleanProd.stock || 0) <= 0) {
            setErrorMessage(`Produto "${cleanProd.name}" sem estoque disponível.`);
            setTimeout(() => setErrorMessage(null), 3000);
            return;
        }

        const existing = cart.find(item => item.id === cleanProd.id);
        if (existing) {
            if (existing.quantity >= (cleanProd.stock || 0)) {
                setErrorMessage(`Estoque máximo atingido para "${cleanProd.name}".`);
                setTimeout(() => setErrorMessage(null), 3000);
                return;
            }
            setCart(cart.map(item => item.id === cleanProd.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...cleanProd, quantity: 1 }]);
        }
    };

    const updateQuantity = (id: string, delta: number) => {
        const productInDb = products.find(p => p.id === id);
        const maxStock = productInDb?.stock || 999;

        setCart(cart.map(item => {
            if (item.id === id) {
                const newQtd = item.quantity + delta;
                if (newQtd > maxStock) {
                    setErrorMessage(`Estoque máximo disponível: ${maxStock}`);
                    setTimeout(() => setErrorMessage(null), 3000);
                    return item;
                }
                return newQtd > 0 ? { ...item, quantity: newQtd } : null;
            }
            return item;
        }).filter(Boolean) as CartItem[]);
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const total = cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);
        setErrorMessage(null);

        const customerObj = customers.find(c => c.id === selectedCustomerId);
        const resolvedCustomerName = customerObj ? customerObj.name : (customCustomerName.trim() || 'Consumidor Final');

        const salePayload = {
            customerId: selectedCustomerId || undefined,
            customerName: resolvedCustomerName,
            items: cart,
            total: total,
            paymentMethod: paymentMethod,
            status: 'completed' as const,
            type: 'pos' as const,
            createdAt: new Date().toISOString(),
        };

        try {
            // 1. Gravar Venda no Firestore
            const saleId = await createDocument('sales', salePayload);

            // 2. Abater Estoque dos Produtos
            for (const item of cart) {
                const productInDb = products.find(p => p.id === item.id);
                if (productInDb) {
                    const updatedStock = Math.max(0, (productInDb.stock || 0) - item.quantity);
                    await updateDocument('products', item.id, { stock: updatedStock });
                }
            }

            // 3. Criar Lançamento Financeiro Automático
            await createDocument('finance', {
                description: `Venda Balcão PDV #${saleId.slice(0, 6)} - ${resolvedCustomerName}`,
                amount: total,
                type: 'income',
                category: 'Venda de Balcão (PDV)',
                dueDate: new Date().toISOString().split('T')[0],
                status: 'paid'
            });

            // 4. Se a venda originou de um orçamento, atualizar o status da proposta
            if (convertedFromQuoteId) {
                await updateDocument('quotes', convertedFromQuoteId, {
                    status: 'converted',
                    convertedSaleId: saleId,
                    updatedAt: new Date().toISOString()
                });
                setConvertedFromQuoteId(null);
            }

            setLastCompletedSale({ id: saleId, ...salePayload });
            setCart([]);
            setSelectedCustomerId('');
            setCustomCustomerName('');
        } catch (error: any) {
            console.error("Erro ao registrar venda:", error);
            setErrorMessage(`Erro ao finalizar venda: ${error.message || 'Verifique as permissões'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleLoadQuoteIntoPOS = (quote: QuoteRecord) => {
        // Validação de estoque dos itens
        const itemsWithUpdatedDetails: CartItem[] = [];
        let stockWarning = false;

        for (const it of quote.items) {
            const currentProd = products.find(p => p.id === it.id);
            if (currentProd) {
                const maxAvailable = Math.min(it.quantity, currentProd.stock || 0);
                if (maxAvailable < it.quantity) {
                    stockWarning = true;
                }
                itemsWithUpdatedDetails.push({
                    ...currentProd,
                    quantity: maxAvailable > 0 ? maxAvailable : 1
                });
            } else {
                itemsWithUpdatedDetails.push(it);
            }
        }

        setCart(itemsWithUpdatedDetails);
        if (quote.customerId) {
            setSelectedCustomerId(quote.customerId);
        } else {
            setSelectedCustomerId('');
            setCustomCustomerName(quote.customerName);
        }
        setConvertedFromQuoteId(quote.id);
        setActiveSection('pos');

        if (stockWarning) {
            setErrorMessage("Alguns itens do orçamento tiveram a quantidade ajustada ao estoque atual disponível.");
            setTimeout(() => setErrorMessage(null), 5000);
        } else {
            setSuccessMessage(`Orçamento ${quote.quoteNumber} carregado no caixa para fechamento!`);
            setTimeout(() => setSuccessMessage(null), 4000);
        }
    };

    const handleDownloadQuotePDF = (quote: QuoteRecord) => {
        try {
            generateQuotePDF(quote);
            setSuccessMessage(`Download do PDF ${quote.quoteNumber} iniciado!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            console.error("Erro ao gerar PDF:", err);
            setErrorMessage("Erro ao baixar PDF: " + (err.message || 'Tente novamente'));
            setTimeout(() => setErrorMessage(null), 4000);
        }
    };

    const handleSendQuoteWhatsApp = (quote: QuoteRecord) => {
        const encodedMsg = generateWhatsAppQuoteMessage(quote);
        const cleanPhone = (quote.customerPhone || '').replace(/\D/g, '');
        const url = cleanPhone.length >= 10 
            ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodedMsg}`
            : `https://api.whatsapp.com/send?text=${encodedMsg}`;
        window.open(url, '_blank');
    };

    const handleExecuteDeleteQuote = async () => {
        if (!quoteToDelete) return;
        try {
            await deleteDocument('quotes', quoteToDelete.id);
            setSuccessMessage(`Orçamento ${quoteToDelete.quoteNumber} excluído.`);
            setQuoteToDelete(null);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            alert("Erro ao excluir orçamento: " + err.message);
        }
    };

    const searchTokens = React.useMemo(() => {
        return searchTerm.trim().toLowerCase().split(/\s+/).filter(Boolean);
    }, [searchTerm]);

    const filteredProducts = React.useMemo(() => {
        if (searchTokens.length === 0) return products;
        return products.filter(p => {
            const target = `${p.name || ''} ${p.category || ''} ${p.code || ''} ${p.sku || ''} ${p.brand || ''}`.toLowerCase();
            return searchTokens.every(tok => target.includes(tok));
        });
    }, [products, searchTokens]);

    // Renderiza até 48 itens de cada vez para o PDV responder instantaneamente sem lag
    const displayedProducts = React.useMemo(() => {
        return filteredProducts.slice(0, 48);
    }, [filteredProducts]);

    const filteredQuotes = React.useMemo(() => {
        const qTokens = quoteSearchTerm.trim().toLowerCase().split(/\s+/).filter(Boolean);
        return quotes.filter(q => {
            if (quoteStatusFilter !== 'all' && q.status !== quoteStatusFilter) return false;
            if (qTokens.length === 0) return true;
            const target = `${q.quoteNumber || ''} ${q.customerName || ''} ${q.customerPhone || ''}`.toLowerCase();
            return qTokens.every(tok => target.includes(tok));
        });
    }, [quotes, quoteSearchTerm, quoteStatusFilter]);

    const activeQuotesCount = quotes.filter(q => q.status === 'open').length;

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans">
            {/* Modal de Sucesso / Cupom não-fiscal */}
            <AnimatePresence>
                {lastCompletedSale && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative"
                        >
                            <button 
                                onClick={() => setLastCompletedSale(null)}
                                className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle size={36} />
                                </div>
                                <h3 className="text-2xl font-bold font-serif text-brand-dark">Venda Concluída!</h3>
                                <p className="text-xs text-gray-400 mt-1">Estoque atualizado e valor lançado no caixa.</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-2xl mb-6 font-mono text-xs space-y-2 border border-gray-100">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Comprovante PDV</span>
                                    <span className="font-bold">#{lastCompletedSale.id.slice(0, 8)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Cliente:</span>
                                    <span className="font-bold">{lastCompletedSale.customerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Forma:</span>
                                    <span className="font-bold uppercase">{lastCompletedSale.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 text-sm">
                                    <span className="font-bold text-gray-700">Total Pago:</span>
                                    <span className="font-bold text-green-700">R$ {lastCompletedSale.total.toFixed(2)}</span>
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
                                    onClick={() => setLastCompletedSale(null)}
                                    className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-200"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Cabeçalho & Abas de Navegação */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-brand-dark flex items-center gap-3">
                        <ShoppingBag className="text-brand-primary" size={32} />
                        Frente de Caixa & Propostas Comerciais
                    </h2>
                    <p className="text-gray-500 mt-1">Realize vendas no balcão e emita orçamentos personalizados para clientes.</p>
                </div>

                {/* Abas PDV / Orçamentos */}
                <div className="flex bg-gray-200/80 p-1.5 rounded-2xl shrink-0 self-start md:self-auto">
                    <button
                        onClick={() => setActiveSection('pos')}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                            activeSection === 'pos'
                                ? 'bg-white text-brand-dark shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <ShoppingBag size={16} />
                        <span>Caixa PDV / Balcão</span>
                        {cart.length > 0 && (
                            <span className="bg-brand-primary text-white text-[10px] px-1.5 py-0.2 rounded-full">
                                {cart.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveSection('quotes')}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                            activeSection === 'quotes'
                                ? 'bg-white text-brand-dark shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <FileText size={16} />
                        <span>Orçamentos Salvos</span>
                        {activeQuotesCount > 0 && (
                            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                                {activeQuotesCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Mensagens de Alerta */}
            {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-2xl text-sm font-medium flex items-center gap-2">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 text-green-800 border border-green-200 rounded-2xl text-sm font-medium flex items-center gap-2">
                    <CheckCircle size={18} className="shrink-0 text-green-600" />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* ABA 1: FRENTE DE CAIXA (PDV) */}
            {activeSection === 'pos' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Catálogo de Produtos para o PDV */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Buscar produtos pelo nome ou categoria para incluir na venda..." 
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">
                                {filteredProducts.length > displayedProducts.length 
                                    ? `Exibindo primeiros ${displayedProducts.length} de ${filteredProducts.length} produtos (digite para filtrar)`
                                    : `${filteredProducts.length} produtos encontrados`}
                            </span>
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="text-xs text-brand-primary font-bold hover:underline"
                                >
                                    Limpar busca
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
                            {displayedProducts.map((p) => {
                                const isOutOfStock = (p.stock || 0) <= 0;
                                return (
                                    <div 
                                        key={p.id}
                                        onClick={() => !isOutOfStock && addToCart(p)}
                                        className={`p-4 bg-white rounded-2xl border transition-all text-left flex flex-col justify-between select-none ${
                                            isOutOfStock 
                                                ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' 
                                                : 'cursor-pointer hover:border-brand-primary hover:shadow-md border-gray-100 active:scale-[0.98]'
                                        }`}
                                    >
                                        <div>
                                            <img 
                                                src={p.imageUrl || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800'} 
                                                alt={p.name} 
                                                loading="lazy"
                                                className="w-full h-28 rounded-xl object-cover mb-2.5 bg-slate-100" 
                                            />
                                            <h4 className="font-bold text-brand-dark text-xs line-clamp-2">{sanitizeCustomerText(p.name)}</h4>
                                            {(p.pickupOrLocal15kmOnly || p.isSpecialDelivery) && (
                                                <span 
                                                    className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.5 rounded mt-1"
                                                    title="Produto somente com retirada no nosso PONTO DE APOIO ou entrega num raio de até 15 km do nosso domicílio, com frete por conta do cliente"
                                                >
                                                    <MapPin size={10} className="text-amber-700" /> Ponto de Apoio / 15km
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-3 flex justify-between items-end">
                                            <span className="text-sm font-bold text-brand-primary">R$ {Number(p.price || 0).toFixed(2)}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                isOutOfStock ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {p.stock || 0} un
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Cupom / Carrinho do PDV */}
                    <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[700px]">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                            <div>
                                <span className="font-bold text-lg text-brand-dark">Carrinho do Caixa</span>
                                {convertedFromQuoteId && (
                                    <span className="block text-[10px] text-amber-700 font-bold">
                                        ⚡ Importado de Orçamento Comercial
                                    </span>
                                )}
                            </div>
                            <span className="text-xs px-2.5 py-1 bg-brand-light text-brand-primary font-bold rounded-lg">
                                {cart.length} itens
                            </span>
                        </div>

                        {/* Identificação do Cliente */}
                        <div className="mb-4 space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                                <User size={14} /> Cliente da Venda / Orçamento
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <select 
                                    className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-brand-primary"
                                    value={selectedCustomerId}
                                    onChange={(e) => {
                                        setSelectedCustomerId(e.target.value);
                                        if (e.target.value) setCustomCustomerName('');
                                    }}
                                >
                                    <option value="">Selecionar Cliente Cadastrado</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <input 
                                    className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-brand-primary"
                                    placeholder="Ou digite o nome..."
                                    value={customCustomerName}
                                    disabled={!!selectedCustomerId}
                                    onChange={(e) => setCustomCustomerName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Lista de Itens no Caixa */}
                        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 pr-2">
                            {cart.map((item) => (
                                <div key={item.id} className="py-3 flex justify-between items-center">
                                    <div className="flex-1 mr-2">
                                        <h5 className="font-bold text-xs text-brand-dark truncate">{sanitizeCustomerText(item.name)}</h5>
                                        {((item as any).pickupOrLocal15kmOnly || (item as any).isSpecialDelivery) && (
                                            <span className="text-[9px] bg-amber-50 text-amber-900 border border-amber-300 px-1 py-0.5 rounded font-bold inline-flex items-center gap-0.5 mt-0.5">
                                                <MapPin size={9} className="text-amber-700" /> Ponto de Apoio / 15km
                                            </span>
                                        )}
                                        <div className="text-xs text-gray-400">R$ {Number(item.price || 0).toFixed(2)} un</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200">
                                            <Minus size={14} />
                                        </button>
                                        <span className="font-bold text-xs w-5 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200">
                                            <Plus size={14} />
                                        </button>
                                        <span className="font-bold text-xs text-brand-dark w-16 text-right">
                                            R$ {((item.price || 0) * item.quantity).toFixed(2)}
                                        </span>
                                        <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 pl-1">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {cart.length === 0 && (
                                <div className="h-48 flex flex-col items-center justify-center text-gray-400 text-xs">
                                    <ShoppingBag size={32} className="mb-2 opacity-30" />
                                    <span>Clique nos produtos ao lado para incluir no caixa ou orçamento.</span>
                                </div>
                            )}
                        </div>

                        {/* Métodos de Pagamento e Finalização */}
                        <div className="pt-4 border-t border-gray-100 space-y-4">
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: 'pix', label: 'PIX', icon: QrCode },
                                    { id: 'credit_card', label: 'Crédito', icon: CreditCard },
                                    { id: 'debit_card', label: 'Débito', icon: CreditCard },
                                    { id: 'cash', label: 'Dinheiro', icon: Banknote },
                                ].map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setPaymentMethod(m.id as any)}
                                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                                            paymentMethod === m.id 
                                                ? 'bg-brand-primary text-white border-brand-primary font-bold shadow-md' 
                                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 text-xs'
                                        }`}
                                    >
                                        <m.icon size={16} className="mb-1" />
                                        <span className="text-[10px]">{m.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-between items-baseline">
                                <span className="text-gray-500 text-sm font-semibold">Total da Operação</span>
                                <span className="text-3xl font-serif font-bold text-brand-dark">R$ {total.toFixed(2)}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <button 
                                    type="button"
                                    disabled={cart.length === 0}
                                    onClick={() => {
                                        setSelectedQuoteForView(null);
                                        setIsQuoteModalOpen(true);
                                    }}
                                    className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                                    title="Emitir proposta de orçamento em PDF/Impressão com validade personalizável"
                                >
                                    <FileText size={16} />
                                    <span>Gerar Orçamento / PDF</span>
                                </button>

                                <button 
                                    disabled={cart.length === 0 || isProcessing}
                                    onClick={handleCheckout}
                                    className="flex-[2] py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                                >
                                    <CheckCircle size={16} />
                                    <span>{isProcessing ? 'Gravando...' : 'Finalizar Venda (PDV)'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ABA 2: ORÇAMENTOS SALVOS & PROPOSTAS COMERCIAIS */}
            {activeSection === 'quotes' && (
                <div className="space-y-6">
                    {/* Filtros e Busca */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4 items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Buscar por cliente, telefone ou protocolo..."
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                                value={quoteSearchTerm}
                                onChange={(e) => setQuoteSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                            {(['all', 'open', 'converted', 'expired'] as const).map((st) => (
                                <button
                                    key={st}
                                    onClick={() => setQuoteStatusFilter(st)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                        quoteStatusFilter === st
                                            ? 'bg-slate-900 text-amber-400 shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {st === 'all' && `Todos (${quotes.length})`}
                                    {st === 'open' && `Em Aberto (${quotes.filter(q => q.status === 'open').length})`}
                                    {st === 'converted' && `Convertidos (${quotes.filter(q => q.status === 'converted').length})`}
                                    {st === 'expired' && `Expirados (${quotes.filter(q => q.status === 'expired').length})`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lista de Orçamentos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuotes.map((q) => {
                            const isExpired = new Date(q.validUntil) < new Date() && q.status === 'open';
                            return (
                                <div 
                                    key={q.id}
                                    className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="font-mono text-xs font-bold text-amber-950 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                                                    {q.quoteNumber}
                                                </span>
                                                <h3 className="font-bold text-base text-gray-950 mt-2">{q.customerName}</h3>
                                                {q.customerPhone && (
                                                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5 font-medium">
                                                        <Phone size={12} className="text-amber-600" /> {q.customerPhone}
                                                    </p>
                                                )}
                                            </div>

                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                                q.status === 'converted'
                                                    ? 'bg-green-100 text-green-900 border border-green-200'
                                                    : isExpired
                                                    ? 'bg-red-100 text-red-900 border border-red-200'
                                                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                                            }`}>
                                                {q.status === 'converted' ? 'Convertido em Venda' : isExpired ? 'Expirado' : 'Em Aberto'}
                                            </span>
                                        </div>

                                        {/* Prévia de Produtos */}
                                        <div className="bg-gray-50 p-3.5 rounded-2xl my-3 space-y-1.5 text-xs text-gray-700 border border-gray-100">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Itens orçados:</span>
                                                <span className="font-bold text-gray-900">{q.items?.length || 0} produto(s)</span>
                                            </div>
                                            
                                            {/* Amostra dos 2 primeiros itens */}
                                            <div className="space-y-1 py-1 border-t border-b border-gray-200/60 my-1">
                                                {(q.items || []).slice(0, 2).map((item, idx) => (
                                                    <p key={idx} className="text-[11px] text-gray-600 truncate">
                                                        • {item.quantity}x {sanitizeCustomerText(item.name)}
                                                    </p>
                                                ))}
                                                {(q.items || []).length > 2 && (
                                                    <p className="text-[10px] text-gray-400 italic">
                                                        + outros {(q.items || []).length - 2} item(ns)...
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-gray-500">Emissão:</span>
                                                <span>{formatSafeDate(q.createdAt)}</span>
                                            </div>
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-gray-500">Válido até:</span>
                                                <span className="font-bold text-amber-800">{formatSafeDate(q.validUntil)}</span>
                                            </div>
                                            <div className="flex justify-between pt-1 border-t border-gray-200 font-bold text-sm text-gray-950">
                                                <span>Total:</span>
                                                <span className="text-amber-700 font-serif text-base">R$ {Number(q.total || 0).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botões de Ação */}
                                    <div className="pt-3 border-t border-gray-100 space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            {/* Baixar PDF Oficial */}
                                            <button
                                                onClick={() => handleDownloadQuotePDF(q)}
                                                className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-sm"
                                                title="Baixar arquivo PDF timbrado para imprimir ou enviar"
                                            >
                                                <Download size={14} />
                                                <span>Baixar PDF</span>
                                            </button>

                                            {/* WhatsApp */}
                                            <button
                                                onClick={() => handleSendQuoteWhatsApp(q)}
                                                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-sm"
                                                title="Enviar dados do orçamento para o WhatsApp do cliente"
                                            >
                                                <MessageCircle size={14} />
                                                <span>WhatsApp</span>
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedQuoteForView(q);
                                                    setIsQuoteModalOpen(true);
                                                }}
                                                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1"
                                                title="Visualizar proposta completa na tela e editar"
                                            >
                                                <Printer size={13} />
                                                <span>Ver / Editar</span>
                                            </button>

                                            {q.status !== 'converted' && (
                                                <button
                                                    onClick={() => handleLoadQuoteIntoPOS(q)}
                                                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                                                    title="Carregar itens no carrinho e ir para o caixa"
                                                >
                                                    <ShoppingBag size={13} />
                                                    <span>Lançar no PDV</span>
                                                </button>
                                            )}

                                            <button
                                                onClick={() => setQuoteToDelete(q)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                title="Excluir orçamento"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredQuotes.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                            <FileText size={48} className="mx-auto text-amber-500/50 mb-3" />
                            <h3 className="text-base font-bold text-gray-800">Nenhum orçamento encontrado</h3>
                            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                Crie novas propostas comerciais adicionando produtos no carrinho do PDV e clicando em "Gerar Orçamento / PDF".
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Confirmação de Exclusão de Orçamento */}
            <AnimatePresence>
                {quoteToDelete && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
                        >
                            <div className="flex items-center gap-3 text-red-600">
                                <div className="p-3 bg-red-50 rounded-2xl">
                                    <Trash2 size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-gray-900">Excluir Orçamento?</h3>
                                    <p className="text-xs text-gray-500">Protocolo: <span className="font-mono font-bold text-gray-800">{quoteToDelete.quoteNumber}</span></p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-600">
                                Esta ação removerá a proposta comercial do cliente <strong className="text-gray-900">{quoteToDelete.customerName}</strong> no valor de <strong className="text-gray-900">R$ {Number(quoteToDelete.total || 0).toFixed(2)}</strong>. Esta operação não pode ser desfeita.
                            </p>
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                <button
                                    onClick={() => setQuoteToDelete(null)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleExecuteDeleteQuote}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md"
                                >
                                    Sim, Excluir
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Emissão & Impressão de Proposta Comercial */}
            <AnimatePresence>
                {isQuoteModalOpen && (
                    <QuoteProposalModal
                        cartItems={selectedQuoteForView ? selectedQuoteForView.items : cart}
                        customer={customers.find(c => c.id === selectedCustomerId)}
                        initialCustomerName={customCustomerName}
                        existingQuote={selectedQuoteForView}
                        onClose={() => {
                            setIsQuoteModalOpen(false);
                            setSelectedQuoteForView(null);
                        }}
                        onSaved={(savedQuote) => {
                            setSuccessMessage(`Orçamento ${savedQuote.quoteNumber} salvo com sucesso!`);
                            setTimeout(() => setSuccessMessage(null), 4000);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
