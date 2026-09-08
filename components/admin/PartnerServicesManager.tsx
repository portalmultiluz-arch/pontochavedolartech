import React, { useState, useMemo } from 'react';
import { 
    Users, 
    ShieldCheck, 
    Plus, 
    Search, 
    CheckCircle2, 
    XCircle, 
    AlertTriangle, 
    Phone, 
    Mail, 
    MapPin, 
    Star, 
    Edit, 
    Trash2, 
    ExternalLink, 
    Power, 
    FileText, 
    HelpCircle,
    Sliders,
    Award,
    Eye,
    Save,
    Sparkles,
    Check,
    DollarSign,
    Calendar,
    CreditCard,
    Clock,
    Flame,
    Copy,
    Send
} from 'lucide-react';
import { PartnerProvider, PartnerMarketplaceSettings } from '../../types';
import { SPECIALTY_LABELS, DEFAULT_PARTNER_MARKETPLACE_SETTINGS, INITIAL_PARTNER_PROVIDERS } from '../../data/curatedPartners';
import { setDocument, deleteDocument } from '../../services/firebaseService';

interface PartnerServicesManagerProps {
    partners?: PartnerProvider[];
    settings?: PartnerMarketplaceSettings;
}

export const PartnerServicesManager: React.FC<PartnerServicesManagerProps> = ({ 
    partners = INITIAL_PARTNER_PROVIDERS, 
    settings = DEFAULT_PARTNER_MARKETPLACE_SETTINGS 
}) => {
    const [activeSubTab, setActiveSubTab] = useState<'partners_list' | 'subscriptions' | 'settings_legal' | 'partner_terms'>('partners_list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'in_review' | 'inactive'>('all');
    const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'active' | 'trial' | 'pending_payment' | 'suspended'>('all');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [copiedPixId, setCopiedPixId] = useState<string | null>(null);

    // Estado local para as configurações mestre do marketplace
    const [currentSettings, setCurrentSettings] = useState<PartnerMarketplaceSettings>(settings);

    // Estado para criação / edição de profissional
    const [editingPartner, setEditingPartner] = useState<PartnerProvider | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Métricas financeiras e de assinaturas
    const financialStats = useMemo(() => {
        const totalPartners = partners.length;
        const activeSubscribers = partners.filter(p => p.subscriptionStatus === 'active' || (!p.subscriptionStatus && p.status === 'active')).length;
        const trialPartners = partners.filter(p => p.subscriptionStatus === 'trial').length;
        const pendingPayment = partners.filter(p => p.subscriptionStatus === 'pending_payment').length;
        const suspended = partners.filter(p => p.subscriptionStatus === 'suspended' || p.status === 'inactive').length;
        
        const mrr = partners
            .filter(p => p.status === 'active' && p.subscriptionStatus === 'active')
            .reduce((sum, p) => sum + (p.monthlyFeeAmount || 49.90), 0);

        return {
            totalPartners,
            activeSubscribers,
            trialPartners,
            pendingPayment,
            suspended,
            mrr
        };
    }, [partners]);

    const filteredPartners = useMemo(() => {
        return partners.filter(p => {
            const matchesSearch = 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.tradeName && p.tradeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.coverageAreas.some(area => area.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesSpecialty = selectedSpecialty === 'all' || p.specialty === selectedSpecialty;
            const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
            
            const currentSubStatus = p.subscriptionStatus || (p.status === 'active' ? 'active' : 'suspended');
            const matchesSubscription = subscriptionFilter === 'all' || currentSubStatus === subscriptionFilter;

            return matchesSearch && matchesSpecialty && matchesStatus && matchesSubscription;
        });
    }, [partners, searchQuery, selectedSpecialty, statusFilter, subscriptionFilter]);

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await setDocument('siteSettings', 'partnerMarketplace', currentSettings);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Erro ao salvar configurações do marketplace de parceiros:", error);
            alert("Erro ao salvar configurações no Firestore.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePartner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPartner) return;

        setIsSaving(true);
        try {
            const partnerToSave: PartnerProvider = {
                ...editingPartner,
                id: editingPartner.id || `partner-${Date.now()}`,
                updatedAt: new Date().toISOString(),
                createdAt: editingPartner.createdAt || new Date().toISOString()
            };

            await setDocument('partner_providers', partnerToSave.id, partnerToSave);
            setIsModalOpen(false);
            setEditingPartner(null);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Erro ao salvar parceiro:", error);
            alert("Erro ao salvar parceiro no Firestore.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePartner = async (partnerId: string) => {
        if (!window.confirm("Deseja realmente remover este parceiro do cadastro?")) return;
        try {
            await deleteDocument('partner_providers', partnerId);
        } catch (error) {
            console.error("Erro ao excluir parceiro:", error);
            alert("Erro ao excluir parceiro no Firestore.");
        }
    };

    const handleTogglePartnerStatus = async (partner: PartnerProvider) => {
        const nextStatus = partner.status === 'active' ? 'inactive' : 'active';
        try {
            await setDocument('partner_providers', partner.id, {
                ...partner,
                status: nextStatus,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Erro ao alternar status do parceiro:", error);
        }
    };

    // Ação rápida: Registrar Pagamento / Renovar 30 dias
    const handleQuickRenewSubscription = async (partner: PartnerProvider) => {
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setDate(today.getDate() + 30);
        const expiresAtStr = nextMonth.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];

        try {
            await setDocument('partner_providers', partner.id, {
                ...partner,
                subscriptionStatus: 'active',
                subscriptionExpiresAt: expiresAtStr,
                lastPaymentDate: todayStr,
                status: 'active',
                updatedAt: new Date().toISOString()
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Erro ao renovar assinatura:", error);
            alert("Erro ao registrar renovação.");
        }
    };

    // Ação rápida: Suspender por falta de pagamento
    const handleQuickSuspendSubscription = async (partner: PartnerProvider) => {
        if (!window.confirm(`Deseja suspender a divulgação de ${partner.name}? O perfil ficará oculto na loja.`)) return;
        try {
            await setDocument('partner_providers', partner.id, {
                ...partner,
                subscriptionStatus: 'suspended',
                status: 'inactive',
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Erro ao suspender parceiro:", error);
            alert("Erro ao suspender parceiro.");
        }
    };

    // Gerar mensagem de cobrança WhatsApp
    const getWhatsAppBillingLink = (partner: PartnerProvider) => {
        const phoneDigits = partner.phone.replace(/\D/g, '');
        const pixKey = currentSettings.pixBillingKey || 'financeiro@pontochavedolar.com.br';
        const fee = partner.monthlyFeeAmount || currentSettings.defaultMonthlyFee || 49.90;
        const msg = `Olá ${partner.name}! Tudo bem?\n\nPassando para lembrar sobre a renovação da sua assinatura de divulgação no Guia de Especialistas da Ponto Chave do Lar.\n\n*Plano Mensal:* R$ ${fee.toFixed(2).replace('.', ',')}\n*Chave Pix:* ${pixKey}\n*Favorecido:* ${currentSettings.pixBillingBeneficiary || 'Ponto Chave do Lar'}\n\nAssim que realizar a transferência, por favor nos envie o comprovante para mantermos seu perfil ativo e em destaque! Obrigado pela parceria.`;
        return `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(msg)}`;
    };

    const openNewPartnerModal = () => {
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setDate(today.getDate() + (currentSettings.defaultTrialDays || 30));
        const expiresAtStr = nextMonth.toISOString().split('T')[0];

        setEditingPartner({
            id: '',
            name: '',
            tradeName: '',
            document: '',
            email: '',
            phone: '',
            city: 'São Paulo',
            state: 'SP',
            coverageAreas: ['Grande São Paulo'],
            specialty: 'eletricista',
            rating: 5.0,
            reviewCount: 0,
            bio: '',
            profileImageUrl: '',
            portfolioImages: [],
            // Dados da Assinatura
            subscriptionPlan: 'free_trial',
            subscriptionStatus: 'trial',
            subscriptionExpiresAt: expiresAtStr,
            monthlyFeeAmount: currentSettings.defaultMonthlyFee || 49.90,
            lastPaymentDate: '',
            isFeatured: false,
            status: 'active',
            termsAccepted: true,
            termsAcceptedAt: new Date().toISOString(),
            priceRangeDescription: 'Orçamento sem compromisso via WhatsApp',
            verifiedBadges: ['Período de Teste (30d)', 'MEI Ativo'],
            createdAt: new Date().toISOString()
        });
        setIsModalOpen(true);
    };

    // Helper de dias restantes
    const getDaysRemaining = (expiresAt?: string) => {
        if (!expiresAt) return null;
        const exp = new Date(expiresAt);
        const today = new Date();
        const diffTime = exp.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            {/* Header com Status do Módulo */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                            <Users size={26} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-serif font-bold text-gray-900">
                                    Marketplace de Prestadores Parceiros
                                </h1>
                                <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                                    currentSettings.isEnabled 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                    {currentSettings.isEnabled ? 'Módulo Ativo na Loja' : 'Módulo Desativado'}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm mt-0.5">
                                Monetização com Assinatura de Divulgação (Modelo 1) & Blindagem Jurídica de Mera Aproximação.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={openNewPartnerModal}
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-sm text-sm transition-all"
                    >
                        <Plus size={18} />
                        <span>Novo Prestador Credenciado</span>
                    </button>
                </div>
            </div>

            {/* Aviso de Sucesso ao Salvar */}
            {saveSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span>Alterações salvas com sucesso no banco de dados!</span>
                </div>
            )}

            {/* KPIs de Monetização & Assinaturas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                            Receita Recorrente (MRR)
                        </span>
                        <div className="text-2xl font-black text-gray-900 mt-1">
                            R$ {financialStats.mrr.toFixed(2).replace('.', ',')}
                            <span className="text-xs text-gray-400 font-normal">/mês</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                            {financialStats.activeSubscribers} assinantes pagantes ativos
                        </span>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <DollarSign size={22} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                            Em Teste Grátis (Trial)
                        </span>
                        <div className="text-2xl font-black text-blue-600 mt-1">
                            {financialStats.trialPartners}
                        </div>
                        <span className="text-[10px] text-blue-500 font-semibold block mt-0.5">
                            30 dias de degustação
                        </span>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <Clock size={22} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                            Mensalidades Pendentes
                        </span>
                        <div className="text-2xl font-black text-amber-600 mt-1">
                            {financialStats.pendingPayment}
                        </div>
                        <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                            Aguardando renovação Pix
                        </span>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                        <AlertTriangle size={22} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                            Suspensos / Inativos
                        </span>
                        <div className="text-2xl font-black text-rose-600 mt-1">
                            {financialStats.suspended}
                        </div>
                        <span className="text-[10px] text-rose-500 font-semibold block mt-0.5">
                            Ocultos na loja virtual
                        </span>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                        <XCircle size={22} />
                    </div>
                </div>
            </div>

            {/* Sub-Navegação */}
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 mb-8 pb-1">
                <button
                    type="button"
                    onClick={() => setActiveSubTab('partners_list')}
                    className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                        activeSubTab === 'partners_list'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <Users size={16} />
                    <span>Profissionais ({partners.length})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSubTab('subscriptions')}
                    className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                        activeSubTab === 'subscriptions'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <CreditCard size={16} />
                    <span>Gestão Financeira & Mensalidades</span>
                    {financialStats.pendingPayment > 0 && (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                            {financialStats.pendingPayment}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSubTab('settings_legal')}
                    className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                        activeSubTab === 'settings_legal'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <Sliders size={16} />
                    <span>Configurações & Interruptor Mestre</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSubTab('partner_terms')}
                    className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                        activeSubTab === 'partner_terms'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <ShieldCheck size={16} />
                    <span>Termo Jurídico (CDC / Mera Aproximação)</span>
                </button>
            </div>

            {/* ABA 1: LISTA DE PARCEIROS */}
            {activeSubTab === 'partners_list' && (
                <div>
                    {/* Filtros e Busca */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por nome, bairro, cidade ou especialidade..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                            <select
                                value={selectedSpecialty}
                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-gray-50 focus:outline-none"
                            >
                                <option value="all">Todas Especialidades</option>
                                {Object.entries(SPECIALTY_LABELS).map(([key, item]) => (
                                    <option key={key} value={key}>{item.label}</option>
                                ))}
                            </select>

                            <select
                                value={subscriptionFilter}
                                onChange={(e) => setSubscriptionFilter(e.target.value as any)}
                                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-gray-50 focus:outline-none"
                            >
                                <option value="all">Todos Planos / Status</option>
                                <option value="active">Mensalidade em Dia</option>
                                <option value="trial">Período de Teste (Trial)</option>
                                <option value="pending_payment">Mensalidade Vencida</option>
                                <option value="suspended">Suspensos / Desativados</option>
                            </select>
                        </div>
                    </div>

                    {/* Cards de Parceiros */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPartners.map((partner) => {
                            const spec = SPECIALTY_LABELS[partner.specialty] || SPECIALTY_LABELS.outro;
                            const isActive = partner.status === 'active';
                            const daysRemaining = getDaysRemaining(partner.subscriptionExpiresAt);
                            const isExpired = daysRemaining !== null && daysRemaining <= 0;

                            return (
                                <div 
                                    key={partner.id}
                                    className={`bg-white rounded-3xl p-6 border transition-all shadow-sm flex flex-col justify-between ${
                                        isActive ? 'border-gray-200 hover:border-amber-400 hover:shadow-md' : 'border-gray-200 opacity-60 bg-gray-50'
                                    }`}
                                >
                                    <div>
                                        {/* Topo do Card */}
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={partner.profileImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} 
                                                    alt={partner.name}
                                                    className="w-13 h-13 rounded-2xl object-cover border border-gray-200"
                                                />
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <h3 className="font-bold text-gray-900 text-base leading-tight">
                                                            {partner.name}
                                                        </h3>
                                                        {partner.isFeatured && (
                                                            <span className="p-1 rounded-md bg-amber-100 text-amber-800" title="Destaque VIP">
                                                                <Flame size={13} className="fill-amber-500 text-amber-500" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    {partner.tradeName && (
                                                        <span className="text-xs text-gray-500 font-medium block">
                                                            {partner.tradeName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleTogglePartnerStatus(partner)}
                                                title={isActive ? 'Desativar parceiro' : 'Ativar parceiro'}
                                                className={`p-2 rounded-xl transition-all ${
                                                    isActive 
                                                        ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' 
                                                        : 'text-gray-400 bg-gray-200 hover:bg-gray-300'
                                                }`}
                                            >
                                                <Power size={16} />
                                            </button>
                                        </div>

                                        {/* Selo de Assinatura & Validade */}
                                        <div className="mb-3.5 p-3 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                                                    Assinatura de Divulgação
                                                </span>
                                                <span className="text-xs font-bold text-gray-800">
                                                    R$ {(partner.monthlyFeeAmount || 49.90).toFixed(2).replace('.', ',')}/mês
                                                </span>
                                            </div>

                                            <div className="text-right">
                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block ${
                                                    partner.subscriptionStatus === 'trial'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : partner.subscriptionStatus === 'pending_payment' || isExpired
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-emerald-100 text-emerald-800'
                                                }`}>
                                                    {partner.subscriptionStatus === 'trial' ? 'Teste Grátis' : isExpired ? 'Vencido' : 'Em Dia'}
                                                </span>
                                                {partner.subscriptionExpiresAt && (
                                                    <span className="text-[10px] text-gray-400 block mt-0.5">
                                                        Validade: {new Date(partner.subscriptionExpiresAt).toLocaleDateString('pt-BR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Especialidade & Avaliação */}
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${spec.color}`}>
                                                {spec.label}
                                            </span>
                                            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                                <span>{partner.rating.toFixed(1)}</span>
                                                <span className="text-gray-400 font-normal">({partner.reviewCount})</span>
                                            </div>
                                        </div>

                                        {/* Bio / Apresentação */}
                                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                                            {partner.bio || 'Profissional autônomo qualificado para instalações residenciais e comerciais.'}
                                        </p>

                                        {/* Região e Contatos */}
                                        <div className="space-y-1.5 text-xs text-gray-500 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={13} className="text-gray-400 shrink-0" />
                                                <span className="truncate">{partner.city}/{partner.state} • {partner.coverageAreas.join(', ')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={13} className="text-gray-400 shrink-0" />
                                                <span>WhatsApp: {partner.phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ações do Card */}
                                    <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                                        <a
                                            href={`https://wa.me/55${partner.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${partner.name}, vi seu perfil de prestador parceiro na Ponto Chave do Lar.`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                                        >
                                            <ExternalLink size={13} />
                                            <span>WhatsApp</span>
                                        </a>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingPartner(partner);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="Editar parceiro e assinatura"
                                            >
                                                <Edit size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePartner(partner.id)}
                                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Excluir parceiro"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredPartners.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
                            <Users size={36} className="mx-auto text-gray-300 mb-3" />
                            <h3 className="font-bold text-gray-700 text-base">Nenhum profissional parceiro encontrado</h3>
                            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                                Tente ajustar a busca ou clique no botão acima para credenciar um novo prestador.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ABA 2: GESTÃO FINANCEIRA & ASSINATURAS (MODELO 1) */}
            {activeSubTab === 'subscriptions' && (
                <div className="space-y-6">
                    {/* Orientações Práticas de Cobrança */}
                    <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                                    Modelo 1: Espaço Publicitário & Guia Pago
                                </span>
                                <span className="text-xs text-slate-400 font-mono">CNAE 7319-0/02</span>
                            </div>
                            <h3 className="text-lg font-serif font-bold text-white">
                                Cobrança de Mensalidade Recorrente via Pix
                            </h3>
                            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                                O parceiro paga uma taxa mensal para manter o perfil, WhatsApp e selo de credenciado visíveis para os clientes da sua loja. Você envia a cobrança no WhatsApp com 1 clique e registra a renovação de 30 dias instantaneamente.
                            </p>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs shrink-0 w-full md:w-auto">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Chave Pix de Cobrança da Loja:</span>
                            <div className="flex items-center gap-2 font-mono font-bold text-amber-300">
                                <span>{currentSettings.pixBillingKey || 'financeiro@pontochavedolar.com.br'}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(currentSettings.pixBillingKey || 'financeiro@pontochavedolar.com.br');
                                        setCopiedPixId('master');
                                        setTimeout(() => setCopiedPixId(null), 2000);
                                    }}
                                    className="p-1 text-slate-400 hover:text-white"
                                    title="Copiar chave Pix"
                                >
                                    <Copy size={13} />
                                </button>
                            </div>
                            {copiedPixId === 'master' && (
                                <span className="text-[10px] text-emerald-400 block mt-1">Chave copiada!</span>
                            )}
                        </div>
                    </div>

                    {/* Tabela de Controle de Mensalidades */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="font-bold text-base text-gray-900 font-serif">
                                    Painel de Controle de Mensalidades & Vencimentos
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Monitore as datas de vencimento, envie cobranças no WhatsApp e suspenda prestadores inadimplentes.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={openNewPartnerModal}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2"
                            >
                                <Plus size={15} />
                                <span>Cadastrar com Período de Teste</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold text-[10px]">
                                        <th className="py-3.5 px-6">Profissional / Empresa</th>
                                        <th className="py-3.5 px-4">Plano & Valor</th>
                                        <th className="py-3.5 px-4">Status da Mensalidade</th>
                                        <th className="py-3.5 px-4">Validade / Vencimento</th>
                                        <th className="py-3.5 px-4">Último Pagamento</th>
                                        <th className="py-3.5 px-6 text-right">Ações de Cobrança</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {partners.map((partner) => {
                                        const daysRemaining = getDaysRemaining(partner.subscriptionExpiresAt);
                                        const isExpired = daysRemaining !== null && daysRemaining <= 0;
                                        const waBillingLink = getWhatsAppBillingLink(partner);

                                        return (
                                            <tr key={partner.id} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <img 
                                                            src={partner.profileImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                                                            alt={partner.name}
                                                            className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                                                        />
                                                        <div>
                                                            <span className="font-bold text-gray-900 text-sm block">
                                                                {partner.name}
                                                            </span>
                                                            <span className="text-[11px] text-gray-400">
                                                                {partner.tradeName || partner.document || partner.phone}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4">
                                                    <span className="font-bold text-gray-900 block">
                                                        R$ {(partner.monthlyFeeAmount || 49.90).toFixed(2).replace('.', ',')}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">
                                                        {partner.subscriptionPlan === 'highlight_vip' ? 'VIP Destaque' : partner.subscriptionPlan === 'free_trial' ? 'Teste Grátis' : 'Padrão'}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                                        partner.subscriptionStatus === 'trial'
                                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                            : partner.subscriptionStatus === 'suspended' || partner.status === 'inactive'
                                                            ? 'bg-gray-100 text-gray-700 border border-gray-300'
                                                            : isExpired || partner.subscriptionStatus === 'pending_payment'
                                                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    }`}>
                                                        {partner.subscriptionStatus === 'trial' && <Clock size={11} />}
                                                        {partner.subscriptionStatus === 'trial' 
                                                            ? 'Em Degustação (Trial)' 
                                                            : partner.subscriptionStatus === 'suspended' || partner.status === 'inactive'
                                                            ? 'Suspenso / Oculto'
                                                            : isExpired || partner.subscriptionStatus === 'pending_payment'
                                                            ? 'Vencido / Pendente'
                                                            : 'Em Dia (Ativo)'}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-4">
                                                    {partner.subscriptionExpiresAt ? (
                                                        <div>
                                                            <span className="font-bold text-gray-800 block">
                                                                {new Date(partner.subscriptionExpiresAt).toLocaleDateString('pt-BR')}
                                                            </span>
                                                            <span className={`text-[10px] font-semibold ${
                                                                isExpired ? 'text-rose-600' : daysRemaining !== null && daysRemaining <= 5 ? 'text-amber-600' : 'text-gray-400'
                                                            }`}>
                                                                {isExpired ? `Venceu há ${Math.abs(daysRemaining || 0)} dias` : `Restam ${daysRemaining} dias`}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Não definida</span>
                                                    )}
                                                </td>

                                                <td className="py-4 px-4 text-gray-500">
                                                    {partner.lastPaymentDate ? (
                                                        <span>{new Date(partner.lastPaymentDate).toLocaleDateString('pt-BR')}</span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Nenhum</span>
                                                    )}
                                                </td>

                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <a
                                                            href={waBillingLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors font-bold text-xs flex items-center gap-1"
                                                            title="Enviar lembrete de cobrança Pix no WhatsApp"
                                                        >
                                                            <Send size={13} />
                                                            <span className="hidden sm:inline">Cobrar Pix</span>
                                                        </a>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuickRenewSubscription(partner)}
                                                            className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
                                                            title="Confirmar pagamento e renovar por +30 dias"
                                                        >
                                                            <Check size={13} />
                                                            <span>Renovar +30d</span>
                                                        </button>

                                                        {partner.status === 'active' ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleQuickSuspendSubscription(partner)}
                                                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                                                title="Suspender divulgação (inadimplente)"
                                                            >
                                                                <Power size={14} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleQuickRenewSubscription(partner)}
                                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                                                title="Reativar divulgação"
                                                            >
                                                                <Power size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ABA 3: CONFIGURAÇÕES E INTERRUPTOR MESTRE */}
            {activeSubTab === 'settings_legal' && (
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm max-w-4xl space-y-8">
                    <div>
                        <h2 className="text-xl font-bold font-serif text-gray-900 mb-1">
                            Controle de Exibição & Parâmetros Financeiros
                        </h2>
                        <p className="text-xs text-gray-500">
                            Configure valores padrão de mensalidade, chave Pix para recebimento e interruptor geral da loja.
                        </p>
                    </div>

                    {/* Interruptor Geral (Kill Switch) */}
                    <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="text-sm font-bold text-gray-900 block">
                                Exibir Módulo de Parceiros na Loja Virtual (Página Inicial & Menus)
                            </span>
                            <span className="text-xs text-gray-600 block mt-0.5">
                                Se desmarcado, toda a seção de instaladores e parceiros fica oculta para os clientes.
                            </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={currentSettings.isEnabled}
                                onChange={(e) => setCurrentSettings({ ...currentSettings, isEnabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                    </div>

                    {/* Parâmetros Padrão de Assinatura */}
                    <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                            Parâmetros Financeiros Padrão da Assinatura
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">Valor Padrão da Mensalidade (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={currentSettings.defaultMonthlyFee || 49.90}
                                    onChange={(e) => setCurrentSettings({ ...currentSettings, defaultMonthlyFee: parseFloat(e.target.value) || 49.90 })}
                                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500/50 bg-white"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">Período de Teste Grátis (Dias)</label>
                                <input
                                    type="number"
                                    value={currentSettings.defaultTrialDays || 30}
                                    onChange={(e) => setCurrentSettings({ ...currentSettings, defaultTrialDays: parseInt(e.target.value) || 30 })}
                                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500/50 bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">Chave Pix para Recebimento de Mensalidades</label>
                                <input
                                    type="text"
                                    value={currentSettings.pixBillingKey || ''}
                                    onChange={(e) => setCurrentSettings({ ...currentSettings, pixBillingKey: e.target.value })}
                                    placeholder="CNPJ, E-mail ou Telefone da loja"
                                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500/50 bg-white"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">Nome do Titular / Razão Social Pix</label>
                                <input
                                    type="text"
                                    value={currentSettings.pixBillingBeneficiary || ''}
                                    onChange={(e) => setCurrentSettings({ ...currentSettings, pixBillingBeneficiary: e.target.value })}
                                    placeholder="Ponto Chave do Lar Ltda"
                                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500/50 bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pontos de Inserção na Interface */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                            Onde o Atalho do Módulo Deve Aparecer:
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className="p-4 border rounded-2xl cursor-pointer flex items-start gap-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={currentSettings.showInHeader}
                                    onChange={(e) => setCurrentSettings({ ...currentSettings, showInHeader: e.target.checked })}
                                    className="mt-1 rounded text-amber-600 focus:ring-amber-500"
                                />
                                <div>
                                    <span className="text-xs font-bold text-gray-900 block">No Menu Superior (Header)</span>
                                    <span className="text-[11px] text-gray-500">Botão "Instaladores Parceiros"</span>
                                </div>
                            </label>

                            <label className="p-4 border rounded-2xl cursor-pointer flex items-start gap-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={currentSettings.showInFooter}
                                    onChange={(e) => setCurrentSettings({ ...currentSettings, showInFooter: e.target.checked })}
                                    className="mt-1 rounded text-amber-600 focus:ring-amber-500"
                                />
                                <div>
                                    <span className="text-xs font-bold text-gray-900 block">No Rodapé da Loja</span>
                                    <span className="text-[11px] text-gray-500">Link informativo e termos</span>
                                </div>
                            </label>

                            <label className="p-4 border rounded-2xl cursor-pointer flex items-start gap-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={currentSettings.showInProductDetail}
                                    onChange={(e) => setCurrentSettings({ ...currentSettings, showInProductDetail: e.target.checked })}
                                    className="mt-1 rounded text-amber-600 focus:ring-amber-500"
                                />
                                <div>
                                    <span className="text-xs font-bold text-gray-900 block">Na Página do Produto</span>
                                    <span className="text-[11px] text-gray-500">Aviso "Precisa de instalador parceiro?"</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Disclaimer Jurídico */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                            Texto de Isenção de Responsabilidade (Disclaimer Visual para o Cliente)
                        </label>
                        <textarea
                            rows={4}
                            value={currentSettings.disclaimerText}
                            onChange={(e) => setCurrentSettings({ ...currentSettings, disclaimerText: e.target.value })}
                            className="w-full p-3.5 rounded-xl border border-gray-200 text-xs text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex justify-end">
                        <button
                            type="button"
                            onClick={handleSaveSettings}
                            disabled={isSaving}
                            className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                        >
                            <Save size={16} />
                            <span>{isSaving ? 'Salvando...' : 'Salvar Preferências'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ABA 4: TERMO JURÍDICO DE ADESÃO */}
            {activeSubTab === 'partner_terms' && (
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm max-w-4xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                            <ShieldCheck size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-serif text-gray-900">
                                Diretrizes Jurídicas & Termo de Adesão Autônomo
                            </h2>
                            <p className="text-xs text-gray-500">
                                Modelo contratual de aproximação que afasta vínculo empregatício e responsabilidade solidária.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl space-y-4 text-xs leading-relaxed font-mono">
                        <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                            [RESUMO JURÍDICO OPERACIONAL - STJ / CDC / MODELO 1]
                        </div>
                        <p>
                            1. <strong>Locação de Espaço Publicitário:</strong> A cobrança é estritamente pela veiculação da ficha de contato do profissional em guia eletrônico.
                        </p>
                        <p>
                            2. <strong>Ausência de Participação no Serviço:</strong> A loja não recebe porcentagem sobre o valor da mão de obra nem define os preços cobrados do cliente.
                        </p>
                        <p>
                            3. <strong>Autonomia Técnica & Segurança:</strong> O prestador declara possuir qualificação técnica necessária (como NR-10) e atuar por conta própria.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                            Termo de Adesão Padrão do Parceiro (Assinado no credenciamento)
                        </label>
                        <textarea
                            rows={8}
                            value={currentSettings.termsAndConditionsText}
                            onChange={(e) => setCurrentSettings({ ...currentSettings, termsAndConditionsText: e.target.value })}
                            className="w-full p-3.5 rounded-xl border border-gray-200 text-xs text-gray-800 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex justify-end">
                        <button
                            type="button"
                            onClick={handleSaveSettings}
                            disabled={isSaving}
                            className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                        >
                            <Save size={16} />
                            <span>{isSaving ? 'Salvando...' : 'Salvar Termo Atualizado'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL DE CADASTRO / EDIÇÃO DE PARCEIRO */}
            {isModalOpen && editingPartner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 border border-gray-200 shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
                            <h2 className="text-xl font-bold font-serif text-gray-900">
                                {editingPartner.id ? 'Editar Parceiro & Assinatura' : 'Credenciar Novo Parceiro'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSavePartner} className="space-y-4 text-xs font-sans">
                            {/* Bloco 1: Identificação */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Nome do Profissional / Responsável *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingPartner.name}
                                        onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                                        placeholder="Ex: Carlos Silva"
                                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Nome Fantasia / Empresa (Opcional)</label>
                                    <input
                                        type="text"
                                        value={editingPartner.tradeName || ''}
                                        onChange={(e) => setEditingPartner({ ...editingPartner, tradeName: e.target.value })}
                                        placeholder="Ex: Luz & Arte Instalações"
                                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500/50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">CPF ou CNPJ (MEI) *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingPartner.document}
                                        onChange={(e) => setEditingPartner({ ...editingPartner, document: e.target.value })}
                                        placeholder="00.000.000/0001-00"
                                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">WhatsApp / Telefone Direto *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingPartner.phone}
                                        onChange={(e) => setEditingPartner({ ...editingPartner, phone: e.target.value })}
                                        placeholder="11987654321"
                                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500/50"
                                    />
                                </div>
                            </div>

                            {/* Bloco 2: Gestão da Assinatura (Modelo 1) */}
                            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                                    Configuração da Assinatura & Cobrança (Modelo 1)
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="font-bold text-gray-700 block mb-1">Plano de Divulgação</label>
                                        <select
                                            value={editingPartner.subscriptionPlan || 'standard'}
                                            onChange={(e) => setEditingPartner({ ...editingPartner, subscriptionPlan: e.target.value as any })}
                                            className="w-full p-2 rounded-xl border border-gray-200 text-xs bg-white"
                                        >
                                            <option value="free_trial">Teste Grátis (Trial)</option>
                                            <option value="standard">Padrão (Guia)</option>
                                            <option value="highlight_vip">VIP Destaque (Topo)</option>
                                            <option value="custom">Personalizado</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-bold text-gray-700 block mb-1">Status do Pagamento</label>
                                        <select
                                            value={editingPartner.subscriptionStatus || 'active'}
                                            onChange={(e) => setEditingPartner({ ...editingPartner, subscriptionStatus: e.target.value as any })}
                                            className="w-full p-2 rounded-xl border border-gray-200 text-xs bg-white"
                                        >
                                            <option value="trial">Em Teste (Trial)</option>
                                            <option value="active">Mensalidade em Dia</option>
                                            <option value="pending_payment">Pendente / Vencido</option>
                                            <option value="suspended">Suspenso</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-bold text-gray-700 block mb-1">Valor Mensal (R$)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editingPartner.monthlyFeeAmount || 49.90}
                                            onChange={(e) => setEditingPartner({ ...editingPartner, monthlyFeeAmount: parseFloat(e.target.value) || 49.90 })}
                                            className="w-full p-2 rounded-xl border border-gray-200 text-xs bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <label className="font-bold text-gray-700 block mb-1">Data de Validade / Vencimento</label>
                                        <input
                                            type="date"
                                            value={editingPartner.subscriptionExpiresAt || ''}
                                            onChange={(e) => setEditingPartner({ ...editingPartner, subscriptionExpiresAt: e.target.value })}
                                            className="w-full p-2 rounded-xl border border-gray-200 text-xs bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-bold text-gray-700 block mb-1">Último Pagamento Registrado</label>
                                        <input
                                            type="date"
                                            value={editingPartner.lastPaymentDate || ''}
                                            onChange={(e) => setEditingPartner({ ...editingPartner, lastPaymentDate: e.target.value })}
                                            className="w-full p-2 rounded-xl border border-gray-200 text-xs bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bloco 3: Especialidade e Localização */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Especialidade Principal *</label>
                                    <select
                                        value={editingPartner.specialty}
                                        onChange={(e) => setEditingPartner({ ...editingPartner, specialty: e.target.value as any })}
                                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500/50 bg-white"
                                    >
                                        {Object.entries(SPECIALTY_LABELS).map(([key, item]) => (
                                            <option key={key} value={key}>{item.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Status de Exibição na Loja</label>
                                    <select
                                        value={editingPartner.status}
                                        onChange={(e) => setEditingPartner({ ...editingPartner, status: e.target.value as any })}
                                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500/50 bg-white"
                                    >
                                        <option value="active">Ativo (Visível na loja)</option>
                                        <option value="in_review">Em Análise Cadastral</option>
                                        <option value="inactive">Inativo (Oculto)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Cidade / Estado</label>
                                    <input
                                        type="text"
                                        value={`${editingPartner.city} - ${editingPartner.state}`}
                                        onChange={(e) => {
                                            const parts = e.target.value.split('-');
                                            setEditingPartner({
                                                ...editingPartner,
                                                city: parts[0]?.trim() || 'São Paulo',
                                                state: parts[1]?.trim() || 'SP'
                                            });
                                        }}
                                        placeholder="São Paulo - SP"
                                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Bairros / Regiões Atendidas</label>
                                    <input
                                        type="text"
                                        value={editingPartner.coverageAreas.join(', ')}
                                        onChange={(e) => setEditingPartner({
                                            ...editingPartner,
                                            coverageAreas: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                        })}
                                        placeholder="Zona Leste, Centro, Tatuapé, Mooca"
                                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-gray-700 block mb-1">Foto de Perfil (URL)</label>
                                <input
                                    type="url"
                                    value={editingPartner.profileImageUrl || ''}
                                    onChange={(e) => setEditingPartner({ ...editingPartner, profileImageUrl: e.target.value })}
                                    placeholder="https://exemplo.com/foto.jpg"
                                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-gray-700 block mb-1">Apresentação / Experiência Técnica</label>
                                <textarea
                                    rows={3}
                                    value={editingPartner.bio}
                                    onChange={(e) => setEditingPartner({ ...editingPartner, bio: e.target.value })}
                                    placeholder="Descreva a experiência, qualificações, ferramentas e tipos de serviços que executa..."
                                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs leading-relaxed focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-gray-700 block mb-1">Condições de Preço / Descritivo de Orçamento</label>
                                <input
                                    type="text"
                                    value={editingPartner.priceRangeDescription || ''}
                                    onChange={(e) => setEditingPartner({ ...editingPartner, priceRangeDescription: e.target.value })}
                                    placeholder="Ex: Instalação a partir de R$ 90 • Orçamento gratuito no WhatsApp"
                                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>

                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="partnerTermsCheck"
                                    checked={editingPartner.termsAccepted}
                                    onChange={(e) => setEditingPartner({ ...editingPartner, termsAccepted: e.target.checked })}
                                    className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                                />
                                <label htmlFor="partnerTermsCheck" className="text-[11px] text-purple-900 cursor-pointer">
                                    <strong>Termo de Prestador Autônomo Aceito:</strong> O profissional confirma atuação independente, sem subordinação ou vínculo empregatício com a Ponto Chave do Lar.
                                </label>
                            </div>

                            <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-md"
                                >
                                    {isSaving ? 'Salvando...' : 'Salvar Profissional'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
