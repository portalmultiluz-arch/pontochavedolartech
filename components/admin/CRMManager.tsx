import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Truck, 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Mail, 
    Phone, 
    MapPin, 
    Building, 
    Check, 
    X, 
    AlertTriangle,
    Calendar,
    Send,
    CheckCircle2,
    XCircle,
    MessageSquare,
    Sparkles,
    Megaphone,
    Filter,
    DollarSign
} from 'lucide-react';
import { subscribeToCollection, createDocument, updateDocument, deleteDocument } from '../../services/firebaseService';
import { Customer, Supplier } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface CRMManagerProps {
    initialTab?: 'customers' | 'suppliers';
}

export const CRMManager: React.FC<CRMManagerProps> = ({ initialTab = 'customers' }) => {
    const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>(initialTab);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState<Customer | Supplier | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [remarketingFilter, setRemarketingFilter] = useState<'all' | 'authorized' | 'not_authorized'>('all');
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Form state com os novos campos de cadastro, situação, última compra/fornecimento e autorização de remarketing
    const [custForm, setCustForm] = useState<Partial<Customer>>({
        name: '',
        email: '',
        phone: '',
        document: '',
        address: '',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        lastPurchaseDate: '',
        lastPurchaseAmount: 0,
        allowMarketingCampaigns: true,
        marketingChannels: {
            whatsapp: true,
            email: true,
            sms: false,
        },
        notes: '',
    });

    const [supForm, setSupForm] = useState<Partial<Supplier>>({
        companyName: '',
        tradeName: '',
        document: '',
        email: '',
        phone: '',
        contactPerson: '',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        lastSupplyDate: '',
        lastSupplyAmount: 0,
        allowMarketingCampaigns: true,
        marketingChannels: {
            whatsapp: true,
            email: true,
        },
        categorySupply: '',
        notes: '',
    });

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        const unsubCustomers = subscribeToCollection('customers', (data) => setCustomers(data as Customer[]), 'name');
        const unsubSuppliers = subscribeToCollection('suppliers', (data) => setSuppliers(data as Supplier[]), 'companyName');
        return () => {
            unsubCustomers();
            unsubSuppliers();
        };
    }, []);

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4000);
    };

    const handleOpenCreate = () => {
        setEditingItem(null);
        const today = new Date().toISOString().split('T')[0];
        setCustForm({ 
            name: '', 
            email: '', 
            phone: '', 
            document: '', 
            address: '',
            status: 'active',
            createdAt: today,
            lastPurchaseDate: '',
            lastPurchaseAmount: 0,
            allowMarketingCampaigns: true,
            marketingChannels: {
                whatsapp: true,
                email: true,
                sms: false,
            },
            notes: '',
        });
        setSupForm({ 
            companyName: '', 
            tradeName: '', 
            document: '', 
            email: '', 
            phone: '', 
            contactPerson: '',
            status: 'active',
            createdAt: today,
            lastSupplyDate: '',
            lastSupplyAmount: 0,
            allowMarketingCampaigns: true,
            marketingChannels: {
                whatsapp: true,
                email: true,
            },
            categorySupply: '',
            notes: '',
        });
        setIsAdding(true);
    };

    const handleOpenEdit = (item: Customer | Supplier) => {
        setEditingItem(item);
        if (activeTab === 'customers') {
            const cust = item as Customer;
            setCustForm({
                ...cust,
                status: cust.status || 'active',
                createdAt: cust.createdAt ? cust.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
                allowMarketingCampaigns: cust.allowMarketingCampaigns !== undefined ? cust.allowMarketingCampaigns : true,
                marketingChannels: cust.marketingChannels || { whatsapp: true, email: true, sms: false },
            });
        } else {
            const sup = item as Supplier;
            setSupForm({
                ...sup,
                status: sup.status || 'active',
                createdAt: sup.createdAt ? sup.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
                allowMarketingCampaigns: sup.allowMarketingCampaigns !== undefined ? sup.allowMarketingCampaigns : true,
                marketingChannels: sup.marketingChannels || { whatsapp: true, email: true },
            });
        }
        setIsAdding(true);
    };

    const handleCloseForm = () => {
        setIsAdding(false);
        setEditingItem(null);
    };

    const handleSaveCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!custForm.name?.trim() || !custForm.email?.trim()) {
            showFeedback('error', 'Nome e e-mail do cliente são obrigatórios.');
            return;
        }

        setIsSaving(true);
        try {
            const payload: Partial<Customer> = {
                name: custForm.name.trim(),
                email: custForm.email.trim(),
                phone: custForm.phone?.trim() || '',
                document: custForm.document?.trim() || '',
                address: custForm.address?.trim() || '',
                status: custForm.status || 'active',
                createdAt: custForm.createdAt || new Date().toISOString(),
                lastPurchaseDate: custForm.lastPurchaseDate || '',
                lastPurchaseAmount: Number(custForm.lastPurchaseAmount || 0),
                allowMarketingCampaigns: custForm.allowMarketingCampaigns ?? true,
                marketingChannels: custForm.marketingChannels || { whatsapp: true, email: true, sms: false },
                notes: custForm.notes?.trim() || '',
            };

            if (editingItem?.id) {
                await updateDocument('customers', editingItem.id, payload);
                showFeedback('success', `Cliente "${payload.name}" atualizado com sucesso!`);
            } else {
                await createDocument('customers', payload);
                showFeedback('success', `Cliente "${payload.name}" cadastrado com sucesso!`);
            }

            handleCloseForm();
        } catch (err: any) {
            console.error('Erro ao salvar cliente:', err);
            showFeedback('error', `Falha ao salvar cliente: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supForm.companyName?.trim() || !supForm.document?.trim()) {
            showFeedback('error', 'Razão Social e CNPJ do fornecedor são obrigatórios.');
            return;
        }

        setIsSaving(true);
        try {
            const payload: Partial<Supplier> = {
                companyName: supForm.companyName.trim(),
                tradeName: supForm.tradeName?.trim() || supForm.companyName.trim(),
                document: supForm.document.trim(),
                email: supForm.email?.trim() || '',
                phone: supForm.phone?.trim() || '',
                contactPerson: supForm.contactPerson?.trim() || '',
                status: supForm.status || 'active',
                createdAt: supForm.createdAt || new Date().toISOString(),
                lastSupplyDate: supForm.lastSupplyDate || '',
                lastSupplyAmount: Number(supForm.lastSupplyAmount || 0),
                allowMarketingCampaigns: supForm.allowMarketingCampaigns ?? true,
                marketingChannels: supForm.marketingChannels || { whatsapp: true, email: true },
                categorySupply: supForm.categorySupply?.trim() || '',
                notes: supForm.notes?.trim() || '',
            };

            if (editingItem?.id) {
                await updateDocument('suppliers', editingItem.id, payload);
                showFeedback('success', `Fornecedor "${payload.companyName}" atualizado com sucesso!`);
            } else {
                await createDocument('suppliers', payload);
                showFeedback('success', `Fornecedor "${payload.companyName}" cadastrado com sucesso!`);
            }

            handleCloseForm();
        } catch (err: any) {
            console.error('Erro ao salvar fornecedor:', err);
            showFeedback('error', `Falha ao salvar fornecedor: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatusQuick = async (item: Customer | Supplier, type: 'customer' | 'supplier') => {
        const newStatus = (item.status === 'inactive' ? 'active' : 'inactive');
        try {
            if (type === 'customer') {
                await updateDocument('customers', item.id, { status: newStatus });
                showFeedback('success', `Status do cliente alterado para ${newStatus === 'active' ? 'ATIVADO' : 'DESATIVADO'}.`);
            } else {
                await updateDocument('suppliers', item.id, { status: newStatus });
                showFeedback('success', `Status do fornecedor alterado para ${newStatus === 'active' ? 'ATIVADO' : 'DESATIVADO'}.`);
            }
        } catch (err: any) {
            showFeedback('error', `Erro ao alternar status: ${err.message}`);
        }
    };

    const handleToggleMarketingQuick = async (item: Customer | Supplier, type: 'customer' | 'supplier') => {
        const current = item.allowMarketingCampaigns !== undefined ? item.allowMarketingCampaigns : true;
        const newAuth = !current;
        try {
            if (type === 'customer') {
                await updateDocument('customers', item.id, { allowMarketingCampaigns: newAuth });
                showFeedback('success', `Autorização de remarketing do cliente: ${newAuth ? 'AUTORIZADO' : 'BLOQUEADO'}.`);
            } else {
                await updateDocument('suppliers', item.id, { allowMarketingCampaigns: newAuth });
                showFeedback('success', `Autorização de comunicados do fornecedor: ${newAuth ? 'AUTORIZADO' : 'BLOQUEADO'}.`);
            }
        } catch (err: any) {
            showFeedback('error', `Erro ao alternar autorização de marketing: ${err.message}`);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const coll = activeTab === 'customers' ? 'customers' : 'suppliers';
        try {
            await deleteDocument(coll, id);
            setDeleteConfirmId(null);
            showFeedback('success', `Registro "${name}" removido com sucesso.`);
        } catch (err: any) {
            console.error('Erro ao remover:', err);
            showFeedback('error', `Erro ao excluir: ${err.message}`);
        }
    };

    const filteredCustomers = customers.filter(c => {
        const matchesSearch = 
            (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.document || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

        const custStatus = c.status || 'active';
        const matchesStatus = statusFilter === 'all' || custStatus === statusFilter;

        const isAuth = c.allowMarketingCampaigns !== undefined ? c.allowMarketingCampaigns : true;
        const matchesRemarketing = 
            remarketingFilter === 'all' || 
            (remarketingFilter === 'authorized' && isAuth) ||
            (remarketingFilter === 'not_authorized' && !isAuth);

        return matchesSearch && matchesStatus && matchesRemarketing;
    });

    const filteredSuppliers = suppliers.filter(s => {
        const matchesSearch = 
            (s.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.tradeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.document || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.categorySupply || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

        const supStatus = s.status || 'active';
        const matchesStatus = statusFilter === 'all' || supStatus === statusFilter;

        const isAuth = s.allowMarketingCampaigns !== undefined ? s.allowMarketingCampaigns : true;
        const matchesRemarketing = 
            remarketingFilter === 'all' || 
            (remarketingFilter === 'authorized' && isAuth) ||
            (remarketingFilter === 'not_authorized' && !isAuth);

        return matchesSearch && matchesStatus && matchesRemarketing;
    });

    const totalActiveCustomers = customers.filter(c => (c.status || 'active') === 'active').length;
    const totalMarketingCustomers = customers.filter(c => (c.allowMarketingCampaigns !== undefined ? c.allowMarketingCampaigns : true)).length;

    const totalActiveSuppliers = suppliers.filter(s => (s.status || 'active') === 'active').length;
    const totalMarketingSuppliers = suppliers.filter(s => (s.allowMarketingCampaigns !== undefined ? s.allowMarketingCampaigns : true)).length;

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans space-y-6">
            {/* Cabeçalho */}
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/20 text-brand-dark rounded-full text-xs font-bold mb-2 border border-brand-primary/30">
                        <Megaphone size={14} className="text-brand-dark" />
                        <span>Gestão Comercial, Remarketing & LGPD</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark">CRM de Clientes & Fornecedores</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Controle de <strong>Situação (Ativado/Desativado)</strong>, <strong>Data de Cadastro</strong>, <strong>Última Compra/Fornecimento</strong> e <strong>Consentimento de Remarketing / Campanhas</strong>.
                    </p>
                </div>
                <button 
                    onClick={handleOpenCreate}
                    className="bg-brand-primary hover:bg-brand-dark text-white px-6 py-3.5 rounded-2xl flex items-center justify-center space-x-2 font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 text-xs sm:text-sm shrink-0"
                >
                    <Plus size={18} />
                    <span>{activeTab === 'customers' ? 'Cadastrar Novo Cliente' : 'Cadastrar Novo Fornecedor'}</span>
                </button>
            </header>

            {/* Métricas Rápidas de Remarketing & Ativação */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
                    <span className="text-[11px] font-bold text-gray-400 uppercase block">Total Cadastrados</span>
                    <span className="text-2xl font-bold font-serif text-brand-dark">
                        {activeTab === 'customers' ? customers.length : suppliers.length}
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">Base no banco de dados</span>
                </div>
                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 shadow-2xs">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase block">Situação: Ativados</span>
                    <span className="text-2xl font-bold font-serif text-emerald-900">
                        {activeTab === 'customers' ? totalActiveCustomers : totalActiveSuppliers}
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">Contatos ativos e operantes</span>
                </div>
                <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 shadow-2xs">
                    <span className="text-[11px] font-bold text-purple-800 uppercase block">Autorizam Remarketing</span>
                    <span className="text-2xl font-bold font-serif text-purple-900">
                        {activeTab === 'customers' ? totalMarketingCustomers : totalMarketingSuppliers}
                    </span>
                    <span className="text-[10px] text-purple-700 block mt-0.5">Opt-in para envios e promoções</span>
                </div>
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100 shadow-2xs">
                    <span className="text-[11px] font-bold text-amber-800 uppercase block">Taxa de Consentimento</span>
                    <span className="text-2xl font-bold font-serif text-amber-900">
                        {activeTab === 'customers' 
                            ? (customers.length > 0 ? `${Math.round((totalMarketingCustomers / customers.length) * 100)}%` : '100%')
                            : (suppliers.length > 0 ? `${Math.round((totalMarketingSuppliers / suppliers.length) * 100)}%` : '100%')}
                    </span>
                    <span className="text-[10px] text-amber-700 block mt-0.5">Aderência a novas ofertas</span>
                </div>
            </div>

            {/* Banner de Feedback */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-2xl flex items-center justify-between border ${
                            feedback.type === 'success' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                    >
                        <div className="flex items-center space-x-3 text-xs sm:text-sm">
                            {feedback.type === 'success' ? <Check size={18} className="text-emerald-600" /> : <AlertTriangle size={18} className="text-red-600" />}
                            <span className="font-medium">{feedback.message}</span>
                        </div>
                        <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Alternância de Abas */}
            <div className="flex space-x-3">
                <button
                    onClick={() => { setActiveTab('customers'); setIsAdding(false); setEditingItem(null); }}
                    className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
                        activeTab === 'customers'
                            ? 'bg-brand-dark text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                    <Users size={18} />
                    <span>Clientes ({customers.length})</span>
                </button>
                <button
                    onClick={() => { setActiveTab('suppliers'); setIsAdding(false); setEditingItem(null); }}
                    className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
                        activeTab === 'suppliers'
                            ? 'bg-brand-dark text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                    <Truck size={18} />
                    <span>Fornecedores ({suppliers.length})</span>
                </button>
            </div>

            {/* Formulário de Cadastro / Edição */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-brand-primary/30"
                    >
                        <div className="flex justify-between items-center pb-5 border-b border-gray-100 mb-6">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold font-serif text-brand-dark">
                                    {activeTab === 'customers' 
                                        ? (editingItem ? 'Editar Cadastro do Cliente & Remarketing' : 'Cadastrar Novo Cliente')
                                        : (editingItem ? 'Editar Cadastro do Fornecedor' : 'Cadastrar Novo Fornecedor')}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500">Preencha os dados de contato, datas de operação e permissões de campanhas.</p>
                            </div>
                            <button onClick={handleCloseForm} className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-gray-100">
                                <X size={22} />
                            </button>
                        </div>

                        {activeTab === 'customers' ? (
                            <form onSubmit={handleSaveCustomer} className="space-y-6">
                                {/* Linha 1: Dados Primários */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase">Nome Completo do Cliente *</label>
                                        <input 
                                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                            placeholder="Ex: Dra. Mariana Vasconcelos"
                                            value={custForm.name || ''}
                                            onChange={e => setCustForm({ ...custForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase">CPF ou CNPJ</label>
                                        <input 
                                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none font-mono text-sm"
                                            placeholder="000.000.000-00"
                                            value={custForm.document || ''}
                                            onChange={e => setCustForm({ ...custForm, document: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Linha 2: Contatos */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase">E-mail para Campanhas & NF *</label>
                                        <input 
                                            type="email"
                                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                            placeholder="mariana@exemplo.com.br"
                                            value={custForm.email || ''}
                                            onChange={e => setCustForm({ ...custForm, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase">WhatsApp / Telefone Celular</label>
                                        <input 
                                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                            placeholder="(11) 98765-4321"
                                            value={custForm.phone || ''}
                                            onChange={e => setCustForm({ ...custForm, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Linha 3: Situação, Data de Cadastro e Última Compra */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                                            <span>Situação Cadastral</span>
                                        </label>
                                        <select
                                            value={custForm.status || 'active'}
                                            onChange={e => setCustForm({ ...custForm, status: e.target.value as 'active' | 'inactive' })}
                                            className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${
                                                custForm.status === 'active' 
                                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                                    : 'bg-red-50 text-red-800 border-red-300'
                                            }`}
                                        >
                                            <option value="active">🟢 Ativado (Operante)</option>
                                            <option value="inactive">🔴 Desativado (Inativo)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                                            <Calendar size={14} className="text-brand-primary" />
                                            <span>Data do Cadastro</span>
                                        </label>
                                        <input 
                                            type="date"
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none"
                                            value={custForm.createdAt ? custForm.createdAt.split('T')[0] : ''}
                                            onChange={e => setCustForm({ ...custForm, createdAt: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                                            <Calendar size={14} className="text-purple-600" />
                                            <span>Última Compra (Data)</span>
                                        </label>
                                        <input 
                                            type="date"
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none"
                                            value={custForm.lastPurchaseDate ? custForm.lastPurchaseDate.split('T')[0] : ''}
                                            onChange={e => setCustForm({ ...custForm, lastPurchaseDate: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                                            <DollarSign size={14} className="text-emerald-600" />
                                            <span>Valor da Última Compra (R$)</span>
                                        </label>
                                        <input 
                                            type="number"
                                            step="0.01"
                                            placeholder="0,00"
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none"
                                            value={custForm.lastPurchaseAmount ?? ''}
                                            onChange={e => setCustForm({ ...custForm, lastPurchaseAmount: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                {/* Linha 4: Seção de Remarketing & Publicações */}
                                <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <h4 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                                                <Megaphone size={16} className="text-purple-600" />
                                                Autorização de Envio de Nossas Publicações & Remarketing
                                            </h4>
                                            <p className="text-xs text-purple-800">
                                                Permite envio de promoções, cupons de desconto, novos lançamentos e consultoria técnica pelo WhatsApp e E-mail.
                                            </p>
                                        </div>

                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={custForm.allowMarketingCampaigns ?? true}
                                                onChange={e => setCustForm({ ...custForm, allowMarketingCampaigns: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            <span className="ml-3 text-xs font-bold text-purple-950">
                                                {custForm.allowMarketingCampaigns ? 'AUTORIZADO' : 'NÃO AUTORIZA'}
                                            </span>
                                        </label>
                                    </div>

                                    {custForm.allowMarketingCampaigns && (
                                        <div className="flex flex-wrap gap-4 pt-2 border-t border-purple-200/60 text-xs">
                                            <label className="flex items-center gap-2 cursor-pointer text-purple-900 font-medium">
                                                <input 
                                                    type="checkbox" 
                                                    checked={custForm.marketingChannels?.whatsapp ?? true}
                                                    onChange={e => setCustForm({
                                                        ...custForm,
                                                        marketingChannels: { ...custForm.marketingChannels, whatsapp: e.target.checked }
                                                    })}
                                                    className="rounded text-purple-600 focus:ring-purple-500"
                                                />
                                                <span>Disparos por WhatsApp</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer text-purple-900 font-medium">
                                                <input 
                                                    type="checkbox" 
                                                    checked={custForm.marketingChannels?.email ?? true}
                                                    onChange={e => setCustForm({
                                                        ...custForm,
                                                        marketingChannels: { ...custForm.marketingChannels, email: e.target.checked }
                                                    })}
                                                    className="rounded text-purple-600 focus:ring-purple-500"
                                                />
                                                <span>E-mail Marketing & Catálogos</span>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-600 uppercase">Endereço de Entrega / Residencial</label>
                                    <input 
                                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                        placeholder="Av. Paulista, 1000, Apto 42 - Bela Vista, São Paulo - SP"
                                        value={custForm.address || ''}
                                        onChange={e => setCustForm({ ...custForm, address: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-600 uppercase">Interesses de Compra / Observações para Remarketing</label>
                                    <input 
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-xs"
                                        placeholder="Ex: Interessada em pendentes pretos foscos e trilhos de iluminação para cozinha..."
                                        value={custForm.notes || ''}
                                        onChange={e => setCustForm({ ...custForm, notes: e.target.value })}
                                    />
                                </div>

                                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={handleCloseForm} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 text-xs">
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="px-8 py-3 bg-brand-primary text-white hover:bg-brand-dark rounded-2xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center space-x-2 text-xs transition-all"
                                    >
                                        <Check size={16} />
                                        <span>{isSaving ? 'Salvando...' : (editingItem ? 'Atualizar Cliente' : 'Salvar Cliente')}</span>
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleSaveSupplier} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase">Razão Social *</label>
                                        <input 
                                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                            placeholder="Ex: Lumina Iluminação & Design Ltda"
                                            value={supForm.companyName || ''}
                                            onChange={e => setSupForm({ ...supForm, companyName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase">CNPJ *</label>
                                        <input 
                                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none font-mono text-sm"
                                            placeholder="00.000.000/0001-00"
                                            value={supForm.document || ''}
                                            onChange={e => setSupForm({ ...supForm, document: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase">Nome Fantasia</label>
                                        <input 
                                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                            placeholder="Ex: Lumina Design"
                                            value={supForm.tradeName || ''}
                                            onChange={e => setSupForm({ ...supForm, tradeName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase">Pessoa de Contato / Representante</label>
                                        <input 
                                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                            placeholder="Ex: Carlos Eduardo (Gerente Comercial)"
                                            value={supForm.contactPerson || ''}
                                            onChange={e => setSupForm({ ...supForm, contactPerson: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase">Linha / Categoria de Fornecimento</label>
                                        <input 
                                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                            placeholder="Ex: Iluminação LED, Torneiras, Disjuntores"
                                            value={supForm.categorySupply || ''}
                                            onChange={e => setSupForm({ ...supForm, categorySupply: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase">E-mail Comercial</label>
                                        <input 
                                            type="email"
                                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                            placeholder="pedidos@lumina.com.br"
                                            value={supForm.email || ''}
                                            onChange={e => setSupForm({ ...supForm, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase">Telefone / WhatsApp Comercial</label>
                                        <input 
                                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                            placeholder="(11) 3456-7890"
                                            value={supForm.phone || ''}
                                            onChange={e => setSupForm({ ...supForm, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Situação, Data de Cadastro e Último Fornecimento */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700 uppercase">Situação Cadastral</label>
                                        <select
                                            value={supForm.status || 'active'}
                                            onChange={e => setSupForm({ ...supForm, status: e.target.value as 'active' | 'inactive' })}
                                            className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${
                                                supForm.status === 'active' 
                                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                                    : 'bg-red-50 text-red-800 border-red-300'
                                            }`}
                                        >
                                            <option value="active">🟢 Ativado (Parceiro Ativo)</option>
                                            <option value="inactive">🔴 Desativado (Inativo)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                                            <Calendar size={14} className="text-brand-primary" />
                                            <span>Data do Cadastro</span>
                                        </label>
                                        <input 
                                            type="date"
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none"
                                            value={supForm.createdAt ? supForm.createdAt.split('T')[0] : ''}
                                            onChange={e => setSupForm({ ...supForm, createdAt: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                                            <Calendar size={14} className="text-purple-600" />
                                            <span>Último Fornecimento (Data)</span>
                                        </label>
                                        <input 
                                            type="date"
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none"
                                            value={supForm.lastSupplyDate ? supForm.lastSupplyDate.split('T')[0] : ''}
                                            onChange={e => setSupForm({ ...supForm, lastSupplyDate: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                                            <DollarSign size={14} className="text-emerald-600" />
                                            <span>Valor da Última Compra (R$)</span>
                                        </label>
                                        <input 
                                            type="number"
                                            step="0.01"
                                            placeholder="0,00"
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none"
                                            value={supForm.lastSupplyAmount ?? ''}
                                            onChange={e => setSupForm({ ...supForm, lastSupplyAmount: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h4 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                                            <Megaphone size={16} className="text-purple-600" />
                                            Autorização para Envio de Nossas Publicações & Catálogos
                                        </h4>
                                        <p className="text-xs text-purple-800">
                                            Permite enviar comunicados institucionais, lançamentos de novos produtos e parcerias.
                                        </p>
                                    </div>

                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={supForm.allowMarketingCampaigns ?? true}
                                            onChange={e => setSupForm({ ...supForm, allowMarketingCampaigns: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        <span className="ml-3 text-xs font-bold text-purple-950">
                                            {supForm.allowMarketingCampaigns ? 'AUTORIZADO' : 'NÃO AUTORIZA'}
                                        </span>
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={handleCloseForm} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 text-xs">
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="px-8 py-3 bg-brand-primary text-white hover:bg-brand-dark rounded-2xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center space-x-2 text-xs transition-all"
                                    >
                                        <Check size={16} />
                                        <span>{isSaving ? 'Salvando...' : (editingItem ? 'Atualizar Fornecedor' : 'Salvar Fornecedor')}</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Barra de Filtros e Busca */}
            <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder={activeTab === 'customers' ? 'Buscar cliente por nome, e-mail, CPF, observações...' : 'Buscar fornecedor por razão social, CNPJ, contato...'} 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none text-gray-700"
                    >
                        <option value="all">Situação: Todos</option>
                        <option value="active">🟢 Apenas Ativados</option>
                        <option value="inactive">🔴 Apenas Desativados</option>
                    </select>

                    <select
                        value={remarketingFilter}
                        onChange={(e) => setRemarketingFilter(e.target.value as any)}
                        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none text-gray-700"
                    >
                        <option value="all">Remarketing: Todos</option>
                        <option value="authorized">📢 Autorizados (Opt-in)</option>
                        <option value="not_authorized">⛔ Não Autorizados</option>
                    </select>
                </div>
            </div>

            {/* Tabela de Clientes ou Fornecedores */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {activeTab === 'customers' ? (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-5 py-3.5">Cliente</th>
                                    <th className="px-5 py-3.5">Situação</th>
                                    <th className="px-5 py-3.5">Data Cadastro</th>
                                    <th className="px-5 py-3.5">Última Compra</th>
                                    <th className="px-5 py-3.5">Remarketing / Publicações</th>
                                    <th className="px-5 py-3.5">Contato</th>
                                    <th className="px-5 py-3.5 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {filteredCustomers.map((c) => {
                                    const isActive = (c.status || 'active') === 'active';
                                    const isMarketingAllowed = c.allowMarketingCampaigns !== undefined ? c.allowMarketingCampaigns : true;
                                    const formattedCreated = c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : '—';
                                    const formattedLastPurchase = c.lastPurchaseDate ? new Date(c.lastPurchaseDate).toLocaleDateString('pt-BR') : 'Sem compras';

                                    return (
                                        <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-gray-900">{c.name}</div>
                                                <div className="font-mono text-[11px] text-gray-400">{c.document || 'Sem CPF/CNPJ'}</div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => handleToggleStatusQuick(c, 'customer')}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                                        isActive 
                                                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                                    title="Clique para alternar situação"
                                                >
                                                    {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                    <span>{isActive ? 'Ativado' : 'Desativado'}</span>
                                                </button>
                                            </td>

                                            <td className="px-5 py-4 text-gray-600 font-medium">
                                                {formattedCreated}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="font-medium text-gray-800">{formattedLastPurchase}</div>
                                                {c.lastPurchaseAmount ? (
                                                    <div className="text-[10px] text-emerald-700 font-bold">
                                                        R$ {c.lastPurchaseAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </div>
                                                ) : null}
                                            </td>

                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => handleToggleMarketingQuick(c, 'customer')}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold transition-all border ${
                                                        isMarketingAllowed 
                                                            ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100' 
                                                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                                    }`}
                                                    title="Clique para alternar permissão de remarketing"
                                                >
                                                    <Megaphone size={12} className={isMarketingAllowed ? 'text-purple-600' : 'text-gray-400'} />
                                                    <span>{isMarketingAllowed ? 'Autoriza Publicações' : 'Não Autoriza'}</span>
                                                </button>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center space-x-1.5 text-gray-600 text-[11px] mb-0.5">
                                                    <Mail size={12} className="text-gray-400" />
                                                    <span className="truncate max-w-[150px]">{c.email}</span>
                                                </div>
                                                {c.phone && (
                                                    <div className="flex items-center space-x-1.5 text-gray-600 text-[11px]">
                                                        <Phone size={12} className="text-gray-400" />
                                                        <span>{c.phone}</span>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end items-center space-x-1">
                                                    <button 
                                                        onClick={() => handleOpenEdit(c)}
                                                        className="p-2 text-gray-400 hover:text-brand-dark hover:bg-brand-primary/20 rounded-xl transition-colors"
                                                        title="Editar Cliente"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    {deleteConfirmId === c.id ? (
                                                        <div className="flex items-center space-x-1 bg-red-50 p-1 rounded-xl">
                                                            <button 
                                                                onClick={() => handleDelete(c.id, c.name)}
                                                                className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg"
                                                            >
                                                                Excluir
                                                            </button>
                                                            <button 
                                                                onClick={() => setDeleteConfirmId(null)}
                                                                className="p-1 text-gray-400 hover:text-gray-600"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setDeleteConfirmId(c.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                            title="Excluir Cliente"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredCustomers.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-400">
                                            <Users size={36} className="mx-auto mb-2 opacity-30" />
                                            <p className="font-medium">Nenhum cliente encontrado com os filtros aplicados.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-5 py-3.5">Fornecedor / Razão Social</th>
                                    <th className="px-5 py-3.5">Situação</th>
                                    <th className="px-5 py-3.5">Data Cadastro</th>
                                    <th className="px-5 py-3.5">Último Fornecimento</th>
                                    <th className="px-5 py-3.5">Linha / Remarketing</th>
                                    <th className="px-5 py-3.5">Contato</th>
                                    <th className="px-5 py-3.5 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {filteredSuppliers.map((s) => {
                                    const isActive = (s.status || 'active') === 'active';
                                    const isMarketingAllowed = s.allowMarketingCampaigns !== undefined ? s.allowMarketingCampaigns : true;
                                    const formattedCreated = s.createdAt ? new Date(s.createdAt).toLocaleDateString('pt-BR') : '—';
                                    const formattedLastSupply = s.lastSupplyDate ? new Date(s.lastSupplyDate).toLocaleDateString('pt-BR') : 'Sem registros';

                                    return (
                                        <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-gray-900">{s.companyName}</div>
                                                <div className="text-[11px] text-gray-400 font-mono">{s.document}</div>
                                                {s.tradeName && <div className="text-[10px] text-gray-500 italic">{s.tradeName}</div>}
                                            </td>

                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => handleToggleStatusQuick(s, 'supplier')}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                                        isActive 
                                                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                                    title="Clique para alternar situação"
                                                >
                                                    {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                    <span>{isActive ? 'Ativado' : 'Desativado'}</span>
                                                </button>
                                            </td>

                                            <td className="px-5 py-4 text-gray-600 font-medium">
                                                {formattedCreated}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="font-medium text-gray-800">{formattedLastSupply}</div>
                                                {s.lastSupplyAmount ? (
                                                    <div className="text-[10px] text-emerald-700 font-bold">
                                                        R$ {s.lastSupplyAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </div>
                                                ) : null}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="text-[11px] font-medium text-gray-700 mb-1">
                                                    {s.categorySupply || 'Geral'}
                                                </div>
                                                <button
                                                    onClick={() => handleToggleMarketingQuick(s, 'supplier')}
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold border ${
                                                        isMarketingAllowed 
                                                            ? 'bg-purple-50 text-purple-800 border-purple-200' 
                                                            : 'bg-gray-100 text-gray-500 border-gray-200'
                                                    }`}
                                                    title="Clique para alternar autorização de comunicados"
                                                >
                                                    <Megaphone size={10} />
                                                    <span>{isMarketingAllowed ? 'Aceita Publicações' : 'Recusa'}</span>
                                                </button>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="font-medium text-gray-800 text-[11px]">{s.contactPerson || '—'}</div>
                                                <div className="text-[10px] text-gray-500">{s.email || s.phone || 'Sem contato'}</div>
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end items-center space-x-1">
                                                    <button 
                                                        onClick={() => handleOpenEdit(s)}
                                                        className="p-2 text-gray-400 hover:text-brand-dark hover:bg-brand-primary/20 rounded-xl transition-colors"
                                                        title="Editar Fornecedor"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    {deleteConfirmId === s.id ? (
                                                        <div className="flex items-center space-x-1 bg-red-50 p-1 rounded-xl">
                                                            <button 
                                                                onClick={() => handleDelete(s.id, s.companyName)}
                                                                className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg"
                                                            >
                                                                Excluir
                                                            </button>
                                                            <button 
                                                                onClick={() => setDeleteConfirmId(null)}
                                                                className="p-1 text-gray-400 hover:text-gray-600"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setDeleteConfirmId(s.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                            title="Excluir Fornecedor"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredSuppliers.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-400">
                                            <Truck size={36} className="mx-auto mb-2 opacity-30" />
                                            <p className="font-medium">Nenhum fornecedor encontrado com os filtros aplicados.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

