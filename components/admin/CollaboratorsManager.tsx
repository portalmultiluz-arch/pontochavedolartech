import React, { useState, useEffect } from 'react';
import { 
    Users, 
    ShieldCheck, 
    Plus, 
    Edit2, 
    Trash2, 
    Check, 
    X, 
    Lock, 
    Key, 
    AlertTriangle, 
    UserCheck, 
    UserX, 
    Eye, 
    EyeOff, 
    Search, 
    Layers, 
    FileText, 
    DollarSign, 
    Sparkles, 
    Database, 
    Clock, 
    CheckCircle2, 
    ShieldAlert,
    Briefcase,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Collaborator, CollaboratorRole, AdminModuleId, AuditLogRecord } from '../../types';
import { ROLE_DEFINITIONS, INITIAL_COLLABORATORS } from '../../lib/rbacConfig';
import { subscribeToCollection, createDocument, updateDocument, deleteDocument } from '../../services/firebaseService';

interface CollaboratorsManagerProps {
    currentCollaborator: Collaborator;
    onSwitchCollaborator: (collaborator: Collaborator) => void;
}

const ALL_MODULES: { id: AdminModuleId; label: string; group: string; icon: string }[] = [
    // Grupo 1
    { id: 'dashboard', label: 'Dashboard Executivo', group: 'Operação & Vendas', icon: '📊' },
    { id: 'pos', label: 'PDV / Caixa & Vendas', group: 'Operação & Vendas', icon: '🛒' },
    { id: 'crm', label: 'Clientes & CRM', group: 'Operação & Vendas', icon: '👥' },
    { id: 'returns_rma', label: 'Trocas & Avarias (RMA)', group: 'Operação & Vendas', icon: '🔄' },
    // Grupo 2
    { id: 'inventory', label: 'Estoque & Fichas Técnicas', group: 'Estoque & Suprimentos', icon: '📦' },
    { id: 'services', label: 'Catálogo de Serviços', group: 'Estoque & Suprimentos', icon: '💼' },
    { id: 'suppliers', label: 'Fornecedores & Entradas', group: 'Estoque & Suprimentos', icon: '🚚' },
    // Grupo 3
    { id: 'hero_cover', label: 'Capa do Site (Hero)', group: 'Comercial & Marketing', icon: '🖼️' },
    { id: 'technical_consultancy', label: 'Consultoria Técnica IA', group: 'Comercial & Marketing', icon: '✨' },
    { id: 'media_bank', label: 'Banco de Imagens & Mídias', group: 'Comercial & Marketing', icon: '📸' },
    { id: 'marketing_security', label: 'Marketing, SEO & Tráfego', group: 'Comercial & Marketing', icon: '🚀' },
    // Grupo 4
    { id: 'financial', label: 'Financeiro & Fluxo de Caixa', group: 'Controladoria & Governança', icon: '💰' },
    { id: 'reports', label: 'Relatórios Inteligentes', group: 'Controladoria & Governança', icon: '📈' },
    { id: 'collaborators', label: 'Colaboradores & Acessos', group: 'Controladoria & Governança', icon: '🛡️' },
    { id: 'documentation', label: 'Manuais & POPs', group: 'Controladoria & Governança', icon: '📖' },
    { id: 'backup_restore', label: 'Backup & Restauração', group: 'Controladoria & Governança', icon: '🗄️' }
];

export const CollaboratorsManager: React.FC<CollaboratorsManagerProps> = ({
    currentCollaborator,
    onSwitchCollaborator
}) => {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
    const [activeTab, setActiveTab] = useState<'team' | 'roles_matrix' | 'audit_logs'>('team');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCollab, setEditingCollab] = useState<Collaborator | null>(null);
    const [formData, setFormData] = useState<Partial<Collaborator>>({
        name: '',
        email: '',
        role: 'cashier_sales',
        department: 'Operações',
        phone: '',
        pin: '',
        status: 'active',
        allowedModules: ROLE_DEFINITIONS.cashier_sales.defaultModules,
        canDeleteRecords: false,
        canDiscountAboveLimit: false,
        canViewCostPrice: false,
        canExportData: false,
        notes: ''
    });
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Carregamento de colaboradores do Firestore ou Fallback local
    useEffect(() => {
        const unsubCollabs = subscribeToCollection('collaborators', (data) => {
            if (data && data.length > 0) {
                setCollaborators(data as Collaborator[]);
            } else {
                setCollaborators(INITIAL_COLLABORATORS);
            }
        }, 'name');

        const unsubLogs = subscribeToCollection('audit_logs', (data) => {
            if (data && data.length > 0) {
                setAuditLogs(data as AuditLogRecord[]);
            } else {
                // Logs iniciais de demonstração
                setAuditLogs([
                    {
                        id: 'log-1',
                        timestamp: new Date().toISOString(),
                        collaboratorName: currentCollaborator.name,
                        collaboratorRole: currentCollaborator.role,
                        action: 'Acesso ao Módulo de Governança',
                        module: 'Colaboradores & Acessos',
                        details: 'Conferência de permissões e matriz de controle de acessos (RBAC).',
                        severity: 'info'
                    },
                    {
                        id: 'log-2',
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        collaboratorName: 'Sistema de Segurança',
                        collaboratorRole: 'Security Core',
                        action: 'Verificação de Integridade',
                        module: 'Proteção Antifraude',
                        details: 'Políticas de proteção de margens de lucro e dados fiscais ativas.',
                        severity: 'info'
                    }
                ]);
            }
        }, 'timestamp');

        return () => {
            unsubCollabs();
            unsubLogs();
        };
    }, [currentCollaborator]);

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4000);
    };

    const handleOpenCreate = () => {
        setEditingCollab(null);
        setFormData({
            name: '',
            email: '',
            role: 'cashier_sales',
            department: 'Atendimento & Caixa',
            phone: '',
            pin: '1234',
            status: 'active',
            allowedModules: [...ROLE_DEFINITIONS.cashier_sales.defaultModules],
            canDeleteRecords: false,
            canDiscountAboveLimit: false,
            canViewCostPrice: false,
            canExportData: false,
            notes: ''
        });
        setIsFormOpen(true);
    };

    const handleOpenEdit = (collab: Collaborator) => {
        setEditingCollab(collab);
        setFormData({
            ...collab,
            allowedModules: [...(collab.allowedModules || ROLE_DEFINITIONS[collab.role]?.defaultModules || [])]
        });
        setIsFormOpen(true);
    };

    const handleRoleChange = (newRole: CollaboratorRole) => {
        const roleDef = ROLE_DEFINITIONS[newRole];
        setFormData(prev => ({
            ...prev,
            role: newRole,
            allowedModules: [...roleDef.defaultModules],
            canDeleteRecords: roleDef.canDeleteRecords,
            canDiscountAboveLimit: roleDef.canDiscountAboveLimit,
            canViewCostPrice: roleDef.canViewCostPrice,
            canExportData: roleDef.canExportData
        }));
    };

    const toggleModule = (moduleId: AdminModuleId) => {
        setFormData(prev => {
            const current = prev.allowedModules || [];
            if (current.includes(moduleId)) {
                return { ...prev, allowedModules: current.filter(id => id !== moduleId) };
            } else {
                return { ...prev, allowedModules: [...current, moduleId] };
            }
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim() || !formData.email?.trim()) {
            showFeedback('error', 'Nome completo e e-mail são obrigatórios.');
            return;
        }

        setIsSaving(true);
        try {
            const payload: Partial<Collaborator> = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                role: formData.role || 'cashier_sales',
                department: formData.department?.trim() || 'Operações',
                phone: formData.phone?.trim() || '',
                document: formData.document?.trim() || '',
                pin: formData.pin?.trim() || '1234',
                status: formData.status || 'active',
                allowedModules: formData.allowedModules || ROLE_DEFINITIONS[formData.role || 'cashier_sales'].defaultModules,
                canDeleteRecords: Boolean(formData.canDeleteRecords),
                canDiscountAboveLimit: Boolean(formData.canDiscountAboveLimit),
                canViewCostPrice: Boolean(formData.canViewCostPrice),
                canExportData: Boolean(formData.canExportData),
                notes: formData.notes?.trim() || '',
                createdAt: editingCollab?.createdAt || new Date().toISOString()
            };

            if (editingCollab?.id) {
                await updateDocument('collaborators', editingCollab.id, payload);
                showFeedback('success', `Colaborador "${payload.name}" atualizado com sucesso!`);
            } else {
                await createDocument('collaborators', payload);
                showFeedback('success', `Novo colaborador "${payload.name}" cadastrado com sucesso!`);
            }

            // Registrar Log de Auditoria
            await createDocument('audit_logs', {
                timestamp: new Date().toISOString(),
                collaboratorName: currentCollaborator.name,
                collaboratorRole: currentCollaborator.role,
                action: editingCollab ? 'Atualização de Perfil de Colaborador' : 'Cadastro de Novo Colaborador',
                module: 'Colaboradores & Acessos',
                details: `Colaborador: ${payload.name} (${payload.email}) | Cargo: ${ROLE_DEFINITIONS[payload.role || 'cashier_sales'].name} | Módulos: ${payload.allowedModules?.length}`,
                severity: 'info'
            });

            setIsFormOpen(false);
            setEditingCollab(null);
        } catch (err: any) {
            console.error('Erro ao salvar colaborador:', err);
            showFeedback('error', `Falha ao salvar: ${err.message || 'Erro de conexão'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        try {
            await deleteDocument('collaborators', id);
            setDeleteConfirmId(null);
            showFeedback('success', `Colaborador "${name}" removido com sucesso.`);

            // Log
            await createDocument('audit_logs', {
                timestamp: new Date().toISOString(),
                collaboratorName: currentCollaborator.name,
                collaboratorRole: currentCollaborator.role,
                action: 'Exclusão de Colaborador',
                module: 'Colaboradores & Acessos',
                details: `Remoção do colaborador: ${name}`,
                severity: 'warning'
            });
        } catch (err: any) {
            console.error('Erro ao excluir:', err);
            showFeedback('error', `Erro ao excluir: ${err.message}`);
        }
    };

    const filteredCollabs = collaborators.filter(c => 
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ROLE_DEFINITIONS[c.role]?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            {/* Header com Contexto de Governança */}
            <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-brand-dark flex items-center gap-3">
                                Controle de Acessos & Governança de Equipe
                            </h2>
                            <p className="text-gray-500 text-sm mt-0.5">
                                Gestão de competências, permissões restritas (RBAC) e proteção antifraude para salvaguardar a empresa e seus colaboradores.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        onClick={handleOpenCreate}
                        className="bg-brand-primary hover:bg-brand-dark text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus size={18} />
                        <span>Novo Colaborador</span>
                    </button>
                </div>
            </header>

            {/* Banner de Feedback */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mb-6 p-4 rounded-2xl flex items-center justify-between border ${
                            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            {feedback.type === 'success' ? <Check size={20} className="text-emerald-600" /> : <AlertTriangle size={20} className="text-red-600" />}
                            <span className="font-medium text-sm">{feedback.message}</span>
                        </div>
                        <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Perfil Ativo Atual & Modo de Simulação */}
            <div className="mb-8 p-6 bg-gradient-to-r from-slate-900 via-brand-dark to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-brand-secondary text-2xl font-bold">
                        {currentCollaborator.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs uppercase font-bold tracking-widest text-brand-accent">Sessão Ativa</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                                Autenticado
                            </span>
                        </div>
                        <h3 className="text-xl font-bold font-serif text-white">{currentCollaborator.name}</h3>
                        <p className="text-xs text-gray-300">
                            Cargo: <strong>{ROLE_DEFINITIONS[currentCollaborator.role]?.name || currentCollaborator.role}</strong> • Setor: {currentCollaborator.department}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right hidden lg:block">
                        <span className="text-[11px] text-gray-400 block">Módulos Autorizados</span>
                        <span className="text-sm font-bold text-brand-secondary">{currentCollaborator.allowedModules?.length || 16} de {ALL_MODULES.length} áreas</span>
                    </div>
                </div>
            </div>

            {/* Abas de Visualização */}
            <div className="flex items-center space-x-3 mb-6 border-b border-gray-200 pb-3">
                <button
                    onClick={() => setActiveTab('team')}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        activeTab === 'team'
                            ? 'bg-brand-primary text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <Users size={18} />
                    <span>Equipe & Colaboradores ({collaborators.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('roles_matrix')}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        activeTab === 'roles_matrix'
                            ? 'bg-brand-primary text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <Layers size={18} />
                    <span>Matriz de Competências & Cargos</span>
                </button>

                <button
                    onClick={() => setActiveTab('audit_logs')}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        activeTab === 'audit_logs'
                            ? 'bg-brand-primary text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <Clock size={18} />
                    <span>Trilha de Auditoria & Segurança</span>
                </button>
            </div>

            {/* TAB 1: Lista de Colaboradores */}
            {activeTab === 'team' && (
                <div className="space-y-6">
                    {/* Barra de Busca */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Buscar por nome, e-mail, cargo ou departamento..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                            />
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                            Total de {filteredCollabs.length} colaborador(es) cadastrado(s)
                        </div>
                    </div>

                    {/* Cards de Colaboradores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCollabs.map(collab => {
                            const roleDef = ROLE_DEFINITIONS[collab.role] || ROLE_DEFINITIONS.cashier_sales;
                            const isCurrent = currentCollaborator.id === collab.id || currentCollaborator.email === collab.email;

                            return (
                                <div 
                                    key={collab.id} 
                                    className={`bg-white rounded-3xl p-6 border shadow-sm transition-all flex flex-col justify-between ${
                                        isCurrent ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-gray-200 hover:shadow-md'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-lg font-serif">
                                                    {collab.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 leading-tight">{collab.name}</h4>
                                                    <span className="text-xs text-gray-400 block">{collab.department || 'Operações'}</span>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleDef.badgeColor}`}>
                                                {roleDef.name.split('/')[0]}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-xs text-gray-600 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 mb-4">
                                            <p className="truncate"><strong>E-mail:</strong> {collab.email}</p>
                                            {collab.phone && <p><strong>Telefone:</strong> {collab.phone}</p>}
                                            <p className="flex items-center gap-1.5">
                                                <Key size={13} className="text-gray-400" />
                                                <span><strong>PIN de Autorização:</strong> •••• (Protegido)</span>
                                            </p>
                                        </div>

                                        {/* Módulos com Acesso */}
                                        <div className="mb-4">
                                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                                Módulos Autorizados ({collab.allowedModules?.length || 0})
                                            </span>
                                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                                                {collab.allowedModules?.map(modId => {
                                                    const mod = ALL_MODULES.find(m => m.id === modId);
                                                    return (
                                                        <span key={modId} className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                                                            <span className="mr-1">{mod?.icon || '🔹'}</span>
                                                            <span className="truncate max-w-[120px]">{mod?.label || modId}</span>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Trava de Segurança e Permissões Especiais */}
                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 pt-3 border-t border-gray-100 mb-4">
                                            <div className="flex items-center gap-1">
                                                {collab.canViewCostPrice ? <Check size={14} className="text-emerald-500" /> : <X size={14} className="text-red-400" />}
                                                <span>Preços de Custo</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {collab.canDiscountAboveLimit ? <Check size={14} className="text-emerald-500" /> : <X size={14} className="text-red-400" />}
                                                <span>Descontos Livres</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {collab.canDeleteRecords ? <Check size={14} className="text-emerald-500" /> : <X size={14} className="text-red-400" />}
                                                <span>Exclusão de Registros</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {collab.canExportData ? <Check size={14} className="text-emerald-500" /> : <X size={14} className="text-red-400" />}
                                                <span>Exportação de Dados</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ações do Card */}
                                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onSwitchCollaborator(collab)}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                isCurrent 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-brand-secondary/40 text-brand-dark hover:bg-brand-secondary font-bold'
                                            }`}
                                        >
                                            <UserCheck size={14} />
                                            <span>{isCurrent ? 'Perfil Ativo' : 'Alternar para este Perfil'}</span>
                                        </button>

                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handleOpenEdit(collab)}
                                                className="p-2 text-gray-400 hover:text-brand-primary hover:bg-gray-100 rounded-xl"
                                                title="Editar Competências"
                                            >
                                                <Edit2 size={16} />
                                            </button>

                                            {collab.role !== 'admin' && (
                                                deleteConfirmId === collab.id ? (
                                                    <div className="flex items-center space-x-1 bg-red-50 p-1 rounded-xl">
                                                        <button 
                                                            onClick={() => handleDelete(collab.id, collab.name)}
                                                            className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
                                                        >
                                                            Sim
                                                        </button>
                                                        <button 
                                                            onClick={() => setDeleteConfirmId(null)}
                                                            className="p-1 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirmId(collab.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                                        title="Remover Colaborador"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 2: Matriz de Cargos e Competências */}
            {activeTab === 'roles_matrix' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(Object.keys(ROLE_DEFINITIONS) as CollaboratorRole[]).map(roleKey => {
                            const def = ROLE_DEFINITIONS[roleKey];
                            return (
                                <div key={roleKey} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${def.badgeColor}`}>
                                                {def.name}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-4 leading-relaxed">{def.description}</p>
                                        
                                        <div className="space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
                                            <div className="flex justify-between items-center py-1 border-b border-gray-200/50">
                                                <span className="text-gray-600">Visualizar Preço de Custo & Margens:</span>
                                                <span className={`font-bold ${def.canViewCostPrice ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {def.canViewCostPrice ? 'Autorizado' : 'Bloqueado'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center py-1 border-b border-gray-200/50">
                                                <span className="text-gray-600">Conceder Descontos Especiais:</span>
                                                <span className={`font-bold ${def.canDiscountAboveLimit ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {def.canDiscountAboveLimit ? 'Autorizado' : 'Bloqueado'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-gray-600">Excluir Registros Definitivos:</span>
                                                <span className={`font-bold ${def.canDeleteRecords ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {def.canDeleteRecords ? 'Autorizado' : 'Bloqueado'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                                        <span>Módulos no Perfil: <strong>{def.defaultModules.length}</strong></span>
                                        <span className="text-emerald-600 font-bold">Padrão Corporativo</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 3: Trilha de Auditoria Antifraude */}
            {activeTab === 'audit_logs' && (
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                        <div>
                            <h3 className="text-xl font-bold font-serif text-brand-dark flex items-center gap-2">
                                <Clock className="text-brand-primary" size={22} />
                                Registro Imutável de Atividades & Ações Operacionais
                            </h3>
                            <p className="text-xs text-gray-500">
                                Trilha de auditoria em conformidade com as boas práticas de governança e segurança corporativa.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 text-gray-400 uppercase text-[11px] font-bold">
                                <tr>
                                    <th className="px-4 py-3">Data / Hora</th>
                                    <th className="px-4 py-3">Colaborador / Cargo</th>
                                    <th className="px-4 py-3">Módulo</th>
                                    <th className="px-4 py-3">Ação Executada</th>
                                    <th className="px-4 py-3">Detalhes / Transparência</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {auditLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-bold text-gray-900 block">{log.collaboratorName}</span>
                                            <span className="text-[10px] text-gray-400">{log.collaboratorRole}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                                                {log.module}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-800">
                                            {log.action}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 max-w-md">
                                            {log.details}
                                        </td>
                                    </tr>
                                ))}
                                {auditLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-gray-400">
                                            Nenhum log de auditoria registrado no momento.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de Cadastro / Edição de Colaborador */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-gray-200 my-8 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold font-serif text-brand-dark">
                                        {editingCollab ? 'Editar Colaborador & Permissões' : 'Cadastrar Novo Colaborador'}
                                    </h3>
                                    <p className="text-xs text-gray-500">Defina o perfil de competência e os módulos autorizados.</p>
                                </div>
                                <button 
                                    onClick={() => setIsFormOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase">Nome Completo *</label>
                                        <input 
                                            required
                                            value={formData.name || ''}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ex: Carlos Eduardo Silva"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase">E-mail Corporativo *</label>
                                        <input 
                                            required
                                            type="email"
                                            value={formData.email || ''}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="Ex: carlos@pontochavedolar.com.br"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase">Cargo / Perfil RBAC *</label>
                                        <select
                                            value={formData.role || 'cashier_sales'}
                                            onChange={e => handleRoleChange(e.target.value as CollaboratorRole)}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-brand-dark focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                        >
                                            <option value="admin">Administrador Geral / Diretoria</option>
                                            <option value="manager">Gerente de Loja & Operações</option>
                                            <option value="cashier_sales">Frente de Caixa & Vendedor</option>
                                            <option value="inventory_stock">Almoxarife & Controle de Estoque</option>
                                            <option value="marketing">Marketing, Vitrine & Conteúdo</option>
                                            <option value="finance">Financeiro & Controladoria</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase">Departamento / Setor</label>
                                        <input 
                                            value={formData.department || ''}
                                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            placeholder="Ex: Vendas / Balcão"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase flex items-center justify-between">
                                            <span>PIN de Autorização (4 dígitos)</span>
                                            <Lock size={12} className="text-gray-400" />
                                        </label>
                                        <input 
                                            type="password"
                                            maxLength={6}
                                            value={formData.pin || ''}
                                            onChange={e => setFormData({ ...formData, pin: e.target.value })}
                                            placeholder="Ex: 1234"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm font-mono text-center tracking-widest"
                                        />
                                    </div>
                                </div>

                                {/* Módulos Customizados */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Módulos Permitidos para este Colaborador ({formData.allowedModules?.length || 0})
                                        </label>
                                        <span className="text-[11px] text-gray-400">Clique para marcar ou desmarcar</span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-52 overflow-y-auto p-3 bg-gray-50 rounded-2xl border border-gray-200">
                                        {ALL_MODULES.map(mod => {
                                            const isSelected = (formData.allowedModules || []).includes(mod.id);
                                            return (
                                                <button
                                                    key={mod.id}
                                                    type="button"
                                                    onClick={() => toggleModule(mod.id)}
                                                    className={`p-2.5 rounded-xl text-xs font-bold text-left flex items-center space-x-2 transition-all border ${
                                                        isSelected
                                                            ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    <span className="text-sm">{mod.icon}</span>
                                                    <span className="truncate">{mod.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Permissões Críticas Antifraude */}
                                <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200/80 space-y-3">
                                    <h4 className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5">
                                        <ShieldAlert size={15} className="text-amber-600" />
                                        Travas de Segurança & Auditoria Antifraude
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <label className="flex items-center space-x-2.5 text-gray-700 cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                checked={Boolean(formData.canViewCostPrice)}
                                                onChange={e => setFormData({ ...formData, canViewCostPrice: e.target.checked })}
                                                className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                                            />
                                            <span>Visualizar Preço de Custo & Margem</span>
                                        </label>

                                        <label className="flex items-center space-x-2.5 text-gray-700 cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                checked={Boolean(formData.canDiscountAboveLimit)}
                                                onChange={e => setFormData({ ...formData, canDiscountAboveLimit: e.target.checked })}
                                                className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                                            />
                                            <span>Autorizar Descontos Especiais no PDV</span>
                                        </label>

                                        <label className="flex items-center space-x-2.5 text-gray-700 cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                checked={Boolean(formData.canDeleteRecords)}
                                                onChange={e => setFormData({ ...formData, canDeleteRecords: e.target.checked })}
                                                className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                                            />
                                            <span>Permitir Exclusão de Registros / NFs</span>
                                        </label>

                                        <label className="flex items-center space-x-2.5 text-gray-700 cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                checked={Boolean(formData.canExportData)}
                                                onChange={e => setFormData({ ...formData, canExportData: e.target.checked })}
                                                className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                                            />
                                            <span>Permitir Exportação Geral de Relatórios</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-8 py-3 bg-brand-primary hover:bg-brand-dark text-white rounded-xl font-bold shadow-lg transition-all text-sm flex items-center space-x-2"
                                    >
                                        <Check size={16} />
                                        <span>{isSaving ? 'Salvando...' : editingCollab ? 'Salvar Alterações' : 'Cadastrar Colaborador'}</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
