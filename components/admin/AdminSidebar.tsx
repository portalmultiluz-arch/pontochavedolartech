import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Truck, 
  ShoppingCart, 
  DollarSign, 
  LogOut,
  Briefcase,
  FileText,
  Sparkles,
  Image as ImageIcon,
  RotateCcw,
  Database,
  BookOpen,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  Lock,
  Building2,
  Store,
  Layers,
  ShieldAlert,
  Gauge,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminModuleId, Collaborator, CollaboratorRole } from '../../types';
import { ROLE_DEFINITIONS, INITIAL_COLLABORATORS, getCollaboratorAllowedModules } from '../../lib/rbacConfig';

interface SidebarProps {
  activeTab: AdminModuleId;
  setActiveTab: (tab: AdminModuleId) => void;
  onLogout: () => void;
  currentCollaborator?: Collaborator;
  allCollaborators?: Collaborator[];
  onSwitchCollaborator?: (collaborator: Collaborator) => void;
}

interface MenuSection {
  title: string;
  badge?: string;
  badgeColor?: string;
  items: {
    id: AdminModuleId;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    description?: string;
    restrictedTo?: CollaboratorRole[];
  }[];
}

export const AdminSidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onLogout,
  currentCollaborator,
  allCollaborators = INITIAL_COLLABORATORS,
  onSwitchCollaborator
}) => {
  const [isCollabDropdownOpen, setIsCollabDropdownOpen] = useState(false);

  // Fallback para admin caso não haja colaborador passado
  const activeCollab: Collaborator = currentCollaborator || INITIAL_COLLABORATORS[0];
  const activeRoleDef = ROLE_DEFINITIONS[activeCollab.role] || ROLE_DEFINITIONS.admin;
  const allowedList = getCollaboratorAllowedModules(activeCollab);

  // Organização em 4 Níveis Hierárquicos de Operação
  const menuSections: MenuSection[] = [
    {
      title: '1. Operação & Frente de Loja',
      badge: 'Diário / Balcão',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      items: [
        { id: 'dashboard', label: 'Dashboard Geral', icon: LayoutDashboard, description: 'Visão executiva em tempo real' },
        { id: 'manager_control', label: 'Controle do Gestor', icon: Gauge, description: 'Indicadores diários e avaliação do gestor' },
        { id: 'pos', label: 'PDV / Caixa & Vendas', icon: ShoppingCart, description: 'Vendas rápidas e emissão de cupons' },
        { id: 'crm', label: 'Clientes & CRM', icon: Users, description: 'Histórico, cadastro e LGPD' },
        { id: 'returns_rma', label: 'Trocas & Avarias (RMA)', icon: RotateCcw, description: 'Garantias, trocas e sucatas' },
      ]
    },
    {
      title: '2. Estoque & Suprimentos',
      badge: 'Logística',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      items: [
        { id: 'inventory', label: 'Estoque & Fichas Técnicas', icon: Package, description: 'Produtos, Importar PDF, NF e tributação' },
        { id: 'services', label: 'Catálogo de Serviços', icon: Briefcase, description: 'Mão de obra e serviços técnicos' },
        { id: 'partner_services', label: 'Marketplace de Parceiros', icon: Users, description: 'Instaladores, contratos e isenção CDC' },
        { id: 'suppliers', label: 'Fornecedores & Entradas', icon: Truck, description: 'Compras, cotações e NF' },
      ]
    },
    {
      title: '3. Comercial, Vitrine & Marketing',
      badge: 'Expansão',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      items: [
        { id: 'store_modules', label: 'Módulos & Foco Vendas', icon: Sliders, description: 'Ativar/desativar IA, Applet e parceiros' },
        { id: 'institutional_footer', label: 'Rodapé & Compliance Legal', icon: Building2, description: 'CNPJ, endereço, WhatsApp, SSL e CDC' },
        { id: 'hero_cover', label: 'Capa do Site & Campanhas', icon: ImageIcon, description: 'Banco de capas, campanhas e otimizador' },
        { id: 'technical_consultancy', label: 'Consultoria Técnica IA', icon: Sparkles, description: 'Projetos e laudos técnicos' },
        { id: 'media_bank', label: 'Banco de Imagens & Otimizador', icon: ImageIcon, description: 'Compressor WebP e fotos' },
        { id: 'marketing_security', label: 'Marketing, SEO & Tráfego', icon: Sparkles, description: 'Remarketing e presença digital' },
        { id: 'carrefour_marketplace', label: 'Carrefour, Cloudflare & Git', icon: ShoppingCart, description: 'Feed Mirakl, Edge e repositório' },
      ]
    },
    {
      title: '4. Controladoria & Governança',
      badge: 'Restrito',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      items: [
        { id: 'financial', label: 'Financeiro & Fluxo de Caixa', icon: DollarSign, description: 'DRE, contas e conciliação' },
        { id: 'reports', label: 'Relatórios Inteligentes', icon: FileText, description: 'Auditoria, margens e vendas' },
        { id: 'collaborators', label: 'Colaboradores & Acessos', icon: ShieldCheck, description: 'Perfis de segurança e RBAC' },
        { id: 'documentation', label: 'Manuais & POPs', icon: BookOpen, description: 'Procedimentos e normas' },
        { id: 'backup_restore', label: 'Backup & Restauração', icon: Database, description: 'Cópia de segurança antifraude' },
      ]
    }
  ];

  return (
    <aside className="w-72 bg-gradient-to-b from-slate-950 via-brand-dark to-slate-950 text-white min-h-screen flex flex-col shadow-2xl border-r border-white/10 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 bg-black/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-secondary font-bold text-xl shadow-inner">
            P
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold tracking-tight text-white flex items-center gap-1.5">
              Ponto Chave <span className="text-brand-secondary text-xs px-2 py-0.5 rounded-md bg-brand-primary/30 border border-brand-primary/40 font-sans uppercase">Admin</span>
            </h1>
            <p className="text-[11px] text-gray-400 font-medium">Gestão Comercial & Governança</p>
          </div>
        </div>
      </div>

      {/* Box do Colaborador Conectado / RBAC Switcher */}
      <div className="p-4 border-b border-white/10 bg-white/5">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCollabDropdownOpen(!isCollabDropdownOpen)}
            className="w-full text-left p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                {activeCollab.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-white block truncate group-hover:text-brand-secondary transition-colors">
                  {activeCollab.name}
                </span>
                <span className="text-[10px] text-brand-secondary/90 font-medium block truncate">
                  {activeRoleDef.name.split('/')[0]}
                </span>
              </div>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isCollabDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown de Troca de Perfil de Colaborador */}
          <AnimatePresence>
            {isCollabDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 space-y-1"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-white/10">
                  Alternar Perfil Operacional (RBAC)
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {allCollaborators.map((collab) => {
                    const isSelected = collab.id === activeCollab.id || collab.email === activeCollab.email;
                    const rDef = ROLE_DEFINITIONS[collab.role] || ROLE_DEFINITIONS.cashier_sales;
                    return (
                      <button
                        key={collab.id}
                        type="button"
                        onClick={() => {
                          if (onSwitchCollaborator) onSwitchCollaborator(collab);
                          setIsCollabDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                          isSelected ? 'bg-brand-primary text-white font-bold' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <span className="block truncate font-semibold">{collab.name}</span>
                          <span className="text-[10px] text-gray-400 block truncate">{rDef.name.split('/')[0]}</span>
                        </div>
                        {isSelected && <UserCheck size={14} className="text-emerald-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navegação Hierárquica */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        {menuSections.map((section, idx) => {
          // Filtrar itens permitidos para o colaborador atual
          const visibleItems = section.items.filter(item => allowedList.includes(item.id));

          // Se o colaborador não tem acesso a nenhum item desta seção, ocultamos a seção para evitar ruído
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1.5">
              {/* Header da Seção Hierárquica */}
              <div className="px-3 py-1 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </span>
                {section.badge && (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${section.badgeColor || 'bg-white/10 text-gray-300 border-white/20'}`}>
                    {section.badge}
                  </span>
                )}
              </div>

              {/* Itens da Seção */}
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left group ${
                          isActive 
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-md scale-[1.02]' 
                            : 'text-slate-300 hover:bg-white/10 hover:text-white hover:translate-x-1'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                          isActive ? 'bg-slate-950/10 text-slate-950' : 'text-slate-400 group-hover:text-amber-400 group-hover:bg-white/5'
                        }`}>
                          <Icon size={17} />
                        </div>
                        <div className="overflow-hidden flex-1">
                          <span className="text-xs font-semibold block leading-tight truncate">
                            {item.label}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer com Status de Segurança e Logout */}
      <div className="p-4 border-t border-white/10 bg-black/30 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-gray-400 px-2 py-1 bg-white/5 rounded-xl border border-white/5">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Acessos Seguros (RBAC)
          </span>
          <span className="font-mono text-[10px] text-gray-400">PCL v2.8</span>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-all text-xs font-bold"
        >
          <LogOut size={16} />
          <span>Encerrar Sessão Segura</span>
        </button>
      </div>
    </aside>
  );
};
