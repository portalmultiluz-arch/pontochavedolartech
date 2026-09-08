import { AdminModuleId, CollaboratorRole, Collaborator } from '../types';

export interface RoleDefinition {
    role: CollaboratorRole;
    name: string;
    description: string;
    badgeColor: string;
    defaultModules: AdminModuleId[];
    canDeleteRecords: boolean;
    canDiscountAboveLimit: boolean;
    canViewCostPrice: boolean;
    canExportData: boolean;
}

export const ROLE_DEFINITIONS: Record<CollaboratorRole, RoleDefinition> = {
    admin: {
        role: 'admin',
        name: 'Administrador Geral / Diretoria',
        description: 'Acesso total irrestrito a todos os módulos, parametrizações financeiras, exclusões, auditorias e gestão de equipe.',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        defaultModules: [
            'dashboard',
            'manager_control',
            'store_modules',
            'institutional_footer',
            'pos',
            'crm',
            'returns_rma',
            'inventory',
            'services',
            'partner_services',
            'suppliers',
            'hero_cover',
            'technical_consultancy',
            'media_bank',
            'marketing_security',
            'financial',
            'reports',
            'collaborators',
            'carrefour_marketplace',
            'documentation',
            'backup_restore'
        ],
        canDeleteRecords: true,
        canDiscountAboveLimit: true,
        canViewCostPrice: true,
        canExportData: true
    },
    manager: {
        role: 'manager',
        name: 'Gerente de Loja & Operações',
        description: 'Supervisão de vendas, estoque, relacionamento com clientes, aprovação de orçamentos e relatórios operacionais.',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        defaultModules: [
            'dashboard',
            'manager_control',
            'store_modules',
            'institutional_footer',
            'pos',
            'crm',
            'returns_rma',
            'inventory',
            'services',
            'partner_services',
            'suppliers',
            'hero_cover',
            'technical_consultancy',
            'media_bank',
            'marketing_security',
            'reports',
            'documentation'
        ],
        canDeleteRecords: false,
        canDiscountAboveLimit: true,
        canViewCostPrice: true,
        canExportData: true
    },
    cashier_sales: {
        role: 'cashier_sales',
        name: 'Frente de Caixa & Vendedor',
        description: 'Operação de vendas diárias no balcão (PDV), cadastro de clientes, orçamentos rápidos e abertura de trocas/devoluções.',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        defaultModules: [
            'pos',
            'crm',
            'returns_rma',
            'technical_consultancy',
            'documentation'
        ],
        canDeleteRecords: false,
        canDiscountAboveLimit: false,
        canViewCostPrice: false,
        canExportData: false
    },
    inventory_stock: {
        role: 'inventory_stock',
        name: 'Almoxarife & Controle de Estoque',
        description: 'Gestão de entradas e saídas físicas, lançamento de Notas Fiscais de fornecedores, controle de avarias e conferência.',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        defaultModules: [
            'inventory',
            'services',
            'suppliers',
            'returns_rma',
            'documentation'
        ],
        canDeleteRecords: false,
        canDiscountAboveLimit: false,
        canViewCostPrice: true,
        canExportData: false
    },
    marketing: {
        role: 'marketing',
        name: 'Marketing, Vitrine & Conteúdo',
        description: 'Personalização da capa do site, banco de mídias, campanhas comerciais, automações de SEO e apresentação de produtos.',
        badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
        defaultModules: [
            'institutional_footer',
            'hero_cover',
            'media_bank',
            'marketing_security',
            'inventory',
            'technical_consultancy',
            'documentation'
        ],
        canDeleteRecords: false,
        canDiscountAboveLimit: false,
        canViewCostPrice: false,
        canExportData: false
    },
    finance: {
        role: 'finance',
        name: 'Financeiro & Controladoria',
        description: 'Fluxo de caixa, conciliação bancária, contas a pagar e receber, DRE, apuração de tributos e relatórios gerenciais.',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        defaultModules: [
            'dashboard',
            'manager_control',
            'financial',
            'reports',
            'crm',
            'suppliers',
            'pos',
            'documentation'
        ],
        canDeleteRecords: false,
        canDiscountAboveLimit: false,
        canViewCostPrice: true,
        canExportData: true
    }
};

export const INITIAL_COLLABORATORS: Collaborator[] = [
    {
        id: 'collab-dir-01',
        name: 'Diretoria Executiva',
        email: 'portalmultiluz@gmail.com',
        role: 'admin',
        department: 'Diretoria Geral',
        phone: '(11) 98765-4321',
        pin: '9988',
        status: 'active',
        allowedModules: ROLE_DEFINITIONS.admin.defaultModules,
        canDeleteRecords: true,
        canDiscountAboveLimit: true,
        canViewCostPrice: true,
        canExportData: true,
        createdAt: '2026-01-01T08:00:00.000Z',
        notes: 'Conta master com privilégios totais de governança e segurança antifraude.'
    },
    {
        id: 'collab-ger-02',
        name: 'Gerência Operacional',
        email: 'gerencia@pontochavedolar.com.br',
        role: 'manager',
        department: 'Operações & Loja',
        phone: '(11) 97777-1122',
        pin: '1234',
        status: 'active',
        allowedModules: ROLE_DEFINITIONS.manager.defaultModules,
        canDeleteRecords: false,
        canDiscountAboveLimit: true,
        canViewCostPrice: true,
        canExportData: true,
        createdAt: '2026-01-15T09:00:00.000Z',
        notes: 'Coordenação da equipe de vendas e aprovação de pedidos e orçamentos especiais.'
    },
    {
        id: 'collab-balcao-03',
        name: 'Frente de Caixa & Balcão',
        email: 'vendas@pontochavedolar.com.br',
        role: 'cashier_sales',
        department: 'Atendimento & Caixa',
        phone: '(11) 96666-3344',
        pin: '0000',
        status: 'active',
        allowedModules: ROLE_DEFINITIONS.cashier_sales.defaultModules,
        canDeleteRecords: false,
        canDiscountAboveLimit: false,
        canViewCostPrice: false,
        canExportData: false,
        createdAt: '2026-02-01T10:00:00.000Z',
        notes: 'Operação ágil no PDV, emissão de comprovantes de vendas e atendimento aos clientes.'
    },
    {
        id: 'collab-almox-04',
        name: 'Almoxarifado & Estoque',
        email: 'estoque@pontochavedolar.com.br',
        role: 'inventory_stock',
        department: 'Logística & Almoxarifado',
        phone: '(11) 95555-7788',
        pin: '4321',
        status: 'active',
        allowedModules: ROLE_DEFINITIONS.inventory_stock.defaultModules,
        canDeleteRecords: false,
        canDiscountAboveLimit: false,
        canViewCostPrice: true,
        canExportData: false,
        createdAt: '2026-02-10T11:00:00.000Z',
        notes: 'Recebimento de mercadorias, conferência de NF e separação para expedição.'
    }
];

/**
 * Retorna com segurança a lista de módulos permitidos para um colaborador,
 * garantindo que Administradores tenham acesso total irrestrito (incluindo Capa do Site, Gestor, etc.)
 * e que módulos recém-adicionados ao sistema sejam automaticamente herdados.
 */
export function getCollaboratorAllowedModules(collaborator?: Collaborator | null): AdminModuleId[] {
    if (!collaborator) return ROLE_DEFINITIONS.admin.defaultModules;
    
    // Administradores ou e-mail mestre possuem acesso irrestrito a todos os módulos
    if (collaborator.role === 'admin' || collaborator.email === 'portalmultiluz@gmail.com') {
        return ROLE_DEFINITIONS.admin.defaultModules;
    }

    const roleDef = ROLE_DEFINITIONS[collaborator.role] || ROLE_DEFINITIONS.admin;
    const defaultMods = roleDef.defaultModules || [];

    if (Array.isArray(collaborator.allowedModules) && collaborator.allowedModules.length > 0) {
        // Mescla módulos salvos com novos módulos padrão do papel (ex: hero_cover, manager_control)
        return Array.from(new Set([...collaborator.allowedModules, ...defaultMods]));
    }

    return defaultMods;
}
