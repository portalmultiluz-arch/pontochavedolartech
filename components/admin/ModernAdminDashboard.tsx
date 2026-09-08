import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { InventoryManager } from './InventoryManager';
import { CRMManager } from './CRMManager';
import { FinanceManager } from './FinanceManager';
import { POSManager } from './POSManager';
import { ServicesManager } from './ServicesManager';
import { ReportsManager } from './ReportsManager';
import { TechnicalConsultancyManager } from './TechnicalConsultancyManager';
import { HeroCoverManager } from './HeroCoverManager';
import { ReturnsAndRmaManager } from './ReturnsAndRmaManager';
import { BackupRestoreManager } from './BackupRestoreManager';
import { SystemDocumentationManager } from './SystemDocumentationManager';
import { MediaBankManager } from './MediaBankManager';
import { MarketingSecurityManager } from './MarketingSecurityManager';
import { CarrefourMarketplaceManager } from './CarrefourMarketplaceManager';
import { CollaboratorsManager } from './CollaboratorsManager';
import { PartnerServicesManager } from './PartnerServicesManager';
import { ManagerControlCenter } from './ManagerControlCenter';
import { StoreModulesManager } from './StoreModulesManager';
import { InstitutionalFooterManager } from './InstitutionalFooterManager';
import { 
    LayoutDashboard, 
    TrendingUp, 
    Package, 
    Users, 
    DollarSign, 
    AlertCircle, 
    ShoppingCart, 
    ArrowRight, 
    Sparkles, 
    Image as ImageIcon, 
    RotateCcw, 
    Database, 
    BookOpen,
    ShieldCheck,
    Lock,
    ShieldAlert,
    Briefcase,
    Sliders,
    Building2
} from 'lucide-react';
import { subscribeToCollection, subscribeToDoc } from '../../services/firebaseService';
import { Product, Sale, Customer, FinancialTransaction, AdminModuleId, Collaborator, PartnerProvider, PartnerMarketplaceSettings } from '../../types';
import { INITIAL_COLLABORATORS, ROLE_DEFINITIONS, getCollaboratorAllowedModules } from '../../lib/rbacConfig';
import { INITIAL_PARTNER_PROVIDERS, DEFAULT_PARTNER_MARKETPLACE_SETTINGS } from '../../data/curatedPartners';

interface ModernAdminDashboardProps {
    onLogout: () => void;
}

export const ModernAdminDashboard: React.FC<ModernAdminDashboardProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<AdminModuleId>('dashboard');
    const [products, setProducts] = useState<Product[]>([]);
    const [collaborators, setCollaborators] = useState<Collaborator[]>(INITIAL_COLLABORATORS);
    const [currentCollaborator, setCurrentCollaborator] = useState<Collaborator>(INITIAL_COLLABORATORS[0]);
    const [partners, setPartners] = useState<PartnerProvider[]>(INITIAL_PARTNER_PROVIDERS);
    const [partnerSettings, setPartnerSettings] = useState<PartnerMarketplaceSettings>(DEFAULT_PARTNER_MARKETPLACE_SETTINGS);

    useEffect(() => {
        const unsubProducts = subscribeToCollection('products', (data) => setProducts(data as Product[]), 'name');
        const unsubCollabs = subscribeToCollection('collaborators', (data) => {
            if (data && data.length > 0) {
                setCollaborators(data as Collaborator[]);
                // Manter o colaborador atual atualizado
                setCurrentCollaborator(prev => {
                    const found = (data as Collaborator[]).find(c => c.id === prev.id || c.email === prev.email);
                    return found || prev;
                });
            }
        }, 'name');

        const unsubPartners = subscribeToCollection('partner_providers', (data) => {
            if (data && data.length > 0) {
                setPartners(data as PartnerProvider[]);
            }
        }, 'name');

        const unsubPartnerSettings = subscribeToDoc('siteSettings', 'partnerMarketplace', (data) => {
            if (data) {
                setPartnerSettings(data as PartnerMarketplaceSettings);
            }
        });

        return () => {
            unsubProducts();
            unsubCollabs();
            unsubPartners();
            unsubPartnerSettings();
        };
    }, []);

    const allowedModules = getCollaboratorAllowedModules(currentCollaborator);

    // Se o usuário atual não tem acesso à aba ativa, redirecionar para a primeira aba permitida
    const hasAccessToActiveTab = allowedModules.includes(activeTab);

    const renderContent = () => {
        if (!hasAccessToActiveTab) {
            return (
                <div className="p-12 max-w-4xl mx-auto text-center font-sans">
                    <div className="bg-white rounded-3xl p-10 shadow-xl border border-red-100 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-6">
                            <ShieldAlert size={40} />
                        </div>
                        <h2 className="text-2xl font-bold font-serif text-gray-900 mb-2">
                            Acesso Restrito a Competências Autorizadas
                        </h2>
                        <p className="text-gray-500 text-sm max-w-md mb-6 leading-relaxed">
                            O perfil do colaborador <strong>{currentCollaborator.name}</strong> ({ROLE_DEFINITIONS[currentCollaborator.role]?.name}) não possui permissão para acessar este módulo. Essa diretriz protege a empresa e os colaboradores contra fraudes e erros acidentais.
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {allowedModules.map(modId => (
                                <button
                                    key={modId}
                                    onClick={() => setActiveTab(modId)}
                                    className="px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl shadow hover:bg-brand-dark transition-all"
                                >
                                    Ir para {modId}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case 'manager_control': return <ManagerControlCenter currentCollaborator={currentCollaborator} onNavigateModule={setActiveTab} />;
            case 'store_modules': return <StoreModulesManager />;
            case 'institutional_footer': return <InstitutionalFooterManager />;
            case 'hero_cover': return <HeroCoverManager />;
            case 'technical_consultancy': return <TechnicalConsultancyManager products={products} />;
            case 'inventory': return <InventoryManager initialProducts={products} />;
            case 'services': return <ServicesManager />;
            case 'partner_services': return <PartnerServicesManager partners={partners} settings={partnerSettings} />;
            case 'crm': return <CRMManager initialTab="customers" />;
            case 'suppliers': return <CRMManager initialTab="suppliers" />;
            case 'financial': return <FinanceManager />;
            case 'media_bank': return <MediaBankManager />;
            case 'marketing_security': return <MarketingSecurityManager />;
            case 'pos': return <POSManager />;
            case 'returns_rma': return <ReturnsAndRmaManager />;
            case 'reports': return <ReportsManager />;
            case 'collaborators': return <CollaboratorsManager currentCollaborator={currentCollaborator} onSwitchCollaborator={setCurrentCollaborator} />;
            case 'carrefour_marketplace': return <CarrefourMarketplaceManager />;
            case 'backup_restore': return <div className="p-8 max-w-7xl mx-auto"><BackupRestoreManager /></div>;
            case 'documentation': return <SystemDocumentationManager />;
            case 'dashboard':
            default:
                return (
                    <AdminHome 
                        onNavigateTab={setActiveTab} 
                        currentCollaborator={currentCollaborator}
                        allowedModules={allowedModules}
                    />
                );
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <AdminSidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onLogout={onLogout}
                currentCollaborator={currentCollaborator}
                allCollaborators={collaborators}
                onSwitchCollaborator={(collab) => {
                    setCurrentCollaborator(collab);
                    const newAllowed = collab.allowedModules || ROLE_DEFINITIONS[collab.role]?.defaultModules || [];
                    if (!newAllowed.includes(activeTab)) {
                        setActiveTab(newAllowed[0] || 'pos');
                    }
                }}
            />
            <main className="flex-1 overflow-y-auto max-h-screen">
                {renderContent()}
            </main>
        </div>
    );
};

interface AdminHomeProps {
    onNavigateTab: (tab: AdminModuleId) => void;
    currentCollaborator: Collaborator;
    allowedModules: AdminModuleId[];
}

const AdminHome: React.FC<AdminHomeProps> = ({ onNavigateTab, currentCollaborator, allowedModules }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);

    useEffect(() => {
        const unsubProducts = subscribeToCollection('products', (data) => setProducts(data as Product[]), 'name');
        const unsubSales = subscribeToCollection('sales', (data) => setSales(data as Sale[]), 'createdAt');
        const unsubCustomers = subscribeToCollection('customers', (data) => setCustomers(data as Customer[]), 'name');
        const unsubFin = subscribeToCollection('finance', (data) => setTransactions(data as FinancialTransaction[]), 'dueDate');

        return () => {
            unsubProducts();
            unsubSales();
            unsubCustomers();
            unsubFin();
        };
    }, []);

    const totalSalesValue = sales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const lowStockCount = products.filter(p => (p.stock || 0) <= (p.minStock || 3)).length;
    
    const pendingPayables = transactions
        .filter(t => t.type === 'expense' && t.status === 'pending')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const isAuthorized = (mod: AdminModuleId) => allowedModules.includes(mod);

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-serif font-bold text-brand-dark mb-2">Painel de Controle Executivo</h2>
                    <p className="text-gray-500 text-base">Visão em tempo real da operação do Ponto Chave do Lar.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Perfil Operacional</span>
                        <span className="text-xs font-bold text-gray-800">{currentCollaborator.name} ({ROLE_DEFINITIONS[currentCollaborator.role]?.name.split('/')[0]})</span>
                    </div>
                </div>
            </header>

            {/* Cards com Dados Reais do Firestore */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard 
                    icon={<TrendingUp size={24} />} 
                    label="Vendas Realizadas" 
                    value={`R$ ${totalSalesValue.toFixed(2)}`} 
                    color="bg-blue-600" 
                    subtext={`${sales.length} pedidos no total`}
                    onClick={() => isAuthorized('pos') && onNavigateTab('pos')}
                />
                <StatCard 
                    icon={<Package size={24} />} 
                    label="Estoque Crítico" 
                    value={`${lowStockCount}`} 
                    color="bg-red-500" 
                    subtext={`${products.length} itens cadastrados`}
                    onClick={() => isAuthorized('inventory') && onNavigateTab('inventory')}
                />
                <StatCard 
                    icon={<Users size={24} />} 
                    label="Carteira de Clientes" 
                    value={`${customers.length}`} 
                    color="bg-green-600" 
                    subtext="Cadastrados no CRM"
                    onClick={() => isAuthorized('crm') && onNavigateTab('crm')}
                />
                <StatCard 
                    icon={<DollarSign size={24} />} 
                    label="Contas a Pagar (Pendentes)" 
                    value={currentCollaborator.canViewCostPrice !== false ? `R$ ${pendingPayables.toFixed(2)}` : 'R$ ••••••'} 
                    color="bg-amber-500" 
                    subtext="Previsão financeira"
                    onClick={() => isAuthorized('financial') && onNavigateTab('financial')}
                />
            </div>

            {/* Ações Rápidas & Últimas Vendas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Últimas Vendas */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold font-serif flex items-center text-brand-dark">
                            <ShoppingCart className="mr-3 text-brand-primary" size={22} /> Últimas Vendas Realizadas
                        </h3>
                        {isAuthorized('reports') && (
                            <button 
                                onClick={() => onNavigateTab('reports')} 
                                className="text-xs font-bold text-brand-primary hover:underline flex items-center"
                            >
                                Ver Todas <ArrowRight size={14} className="ml-1" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {sales.slice(0, 5).map((sale) => (
                            <div key={sale.id} className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors">
                                <div>
                                    <p className="font-bold text-sm text-gray-900">{sale.customerName || 'Consumidor Final'}</p>
                                    <p className="text-xs text-gray-400">
                                        {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('pt-BR') : ''} • {sale.items?.length || 1} item(ns)
                                    </p>
                                </div>
                                <span className="text-sm font-bold text-brand-primary">
                                    R$ {Number(sale.total || 0).toFixed(2)}
                                </span>
                            </div>
                        ))}
                        {sales.length === 0 && (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                Nenhuma venda realizada ainda.
                            </div>
                        )}
                    </div>
                </div>

                {/* Acesso Rápido a Módulos Organizados por Competência */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold font-serif mb-6 text-brand-dark">
                        Acesso Rápido aos Módulos Autorizados
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {isAuthorized('store_modules') && (
                            <button 
                                onClick={() => onNavigateTab('store_modules')}
                                className="p-4 text-left rounded-2xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 hover:from-amber-100 hover:to-orange-100 transition-all group sm:col-span-2 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                                            <Sliders size={22} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                                <span>Módulos da Vitrine & Foco em Vendas</span>
                                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">Ativar / Desativar</span>
                                            </h4>
                                            <p className="text-xs text-gray-600 mt-0.5">Definir modo loja limpa (apenas produtos) ou ativar Consultoria IA, Applet e Rede de Parceiros.</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={18} className="text-amber-800 group-hover:translate-x-1 transition-all" />
                                </div>
                            </button>
                        )}

                        {isAuthorized('institutional_footer') && (
                            <button 
                                onClick={() => onNavigateTab('institutional_footer')}
                                className="p-4 text-left rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-r from-indigo-50 via-slate-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all group sm:col-span-2 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white font-bold flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                                            <Building2 size={22} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                                <span>Configuração do Rodapé Institucional & Compliance Legal</span>
                                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white">CDC & Decreto 7.962</span>
                                            </h4>
                                            <p className="text-xs text-gray-600 mt-0.5">CNPJ, endereço físico, WhatsApp oficial, sugestões de redação (Contato/Sobre Nós), trocas e agendamentos presenciais, selos SSL e pagamentos.</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={18} className="text-indigo-800 group-hover:translate-x-1 transition-all" />
                                </div>
                            </button>
                        )}

                        {isAuthorized('manager_control') && (
                            <button 
                                onClick={() => onNavigateTab('manager_control')}
                                className="p-4 text-left rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-all group sm:col-span-2 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                                            <TrendingUp size={22} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                                <span>Controle do Gestor (Indicadores Diários)</span>
                                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">Módulo do Gestor</span>
                                            </h4>
                                            <p className="text-xs text-gray-600 mt-0.5">Avaliação e registro diário de faturamento, metas, liquidez e diário de bordo com histórico.</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={18} className="text-emerald-700 group-hover:translate-x-1 transition-all" />
                                </div>
                            </button>
                        )}

                        {isAuthorized('hero_cover') && (
                            <button 
                                onClick={() => onNavigateTab('hero_cover')}
                                className="p-4 text-left rounded-2xl border border-pink-200 bg-pink-50/60 hover:bg-pink-100 transition-all group sm:col-span-2"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <ImageIcon size={22} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                                <span>Capa do Site & Campanhas</span>
                                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">12 Temas Ativos</span>
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-0.5">Banco de capas, promoções do dia, jornal de ofertas e otimizador de fotos.</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={18} className="text-pink-400 group-hover:text-pink-700 group-hover:translate-x-1 transition-all" />
                                </div>
                            </button>
                        )}

                        {isAuthorized('pos') && (
                            <button 
                                onClick={() => onNavigateTab('pos')}
                                className="p-4 text-left rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 transition-all group"
                            >
                                <ShoppingCart className="text-emerald-600 mb-2 group-hover:scale-110 transition-transform" size={24} />
                                <h4 className="font-bold text-sm text-gray-900">Frente de Caixa (PDV)</h4>
                                <p className="text-xs text-gray-500 mt-1">Realize vendas no balcão e orçamentos.</p>
                            </button>
                        )}

                        {isAuthorized('inventory') && (
                            <button 
                                onClick={() => onNavigateTab('inventory')}
                                className="p-4 text-left rounded-2xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 transition-all group"
                            >
                                <Package className="text-amber-600 mb-2 group-hover:scale-110 transition-transform" size={24} />
                                <h4 className="font-bold text-sm text-gray-900">Estoque & Fichas</h4>
                                <p className="text-xs text-gray-500 mt-1">Produtos, fotos, NFs e tributos.</p>
                            </button>
                        )}

                        {isAuthorized('returns_rma') && (
                            <button 
                                onClick={() => onNavigateTab('returns_rma')}
                                className="p-4 text-left rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 transition-all group"
                            >
                                <RotateCcw className="text-rose-600 mb-2 group-hover:scale-110 transition-transform" size={24} />
                                <h4 className="font-bold text-sm text-gray-900">Trocas & Avarias (RMA)</h4>
                                <p className="text-xs text-gray-500 mt-1">Garantias, quebras e sucatas.</p>
                            </button>
                        )}

                        {isAuthorized('services') && (
                            <button 
                                onClick={() => onNavigateTab('services')}
                                className="p-4 text-left rounded-2xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 transition-all group"
                            >
                                <Briefcase className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" size={24} />
                                <h4 className="font-bold text-sm text-gray-900">Serviços Próprios</h4>
                                <p className="text-xs text-gray-500 mt-1">Catálogo de serviços da loja.</p>
                            </button>
                        )}

                        {isAuthorized('partner_services') && (
                            <button 
                                onClick={() => onNavigateTab('partner_services')}
                                className="p-4 text-left rounded-2xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 transition-all group"
                            >
                                <Users className="text-amber-600 mb-2 group-hover:scale-110 transition-transform" size={24} />
                                <h4 className="font-bold text-sm text-gray-900">Parceiros & Instaladores</h4>
                                <p className="text-xs text-gray-500 mt-1">Guia de autônomos e isenção CDC.</p>
                            </button>
                        )}

                        {isAuthorized('crm') && (
                            <button 
                                onClick={() => onNavigateTab('crm')}
                                className="p-4 text-left rounded-2xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 transition-all group"
                            >
                                <Users className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" size={24} />
                                <h4 className="font-bold text-sm text-gray-900">Clientes & Fornecedores</h4>
                                <p className="text-xs text-gray-500 mt-1">Base unificada de contatos.</p>
                            </button>
                        )}

                        {isAuthorized('financial') && (
                            <button 
                                onClick={() => onNavigateTab('financial')}
                                className="p-4 text-left rounded-2xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 transition-all group"
                            >
                                <DollarSign className="text-indigo-600 mb-2 group-hover:scale-110 transition-transform" size={24} />
                                <h4 className="font-bold text-sm text-gray-900">Financeiro & DRE</h4>
                                <p className="text-xs text-gray-500 mt-1">Fluxo de caixa e conciliação.</p>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtext: string;
    color: string;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtext, color, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start space-x-4 cursor-pointer hover:shadow-md hover:border-brand-primary/40 transition-all"
    >
        <div className={`p-4 ${color} text-white rounded-2xl shadow-lg shrink-0`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold font-serif text-gray-900 mt-0.5">{value}</p>
            <p className="text-[11px] text-gray-500 mt-1">{subtext}</p>
        </div>
    </div>
);
