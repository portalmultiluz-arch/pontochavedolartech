import React, { useState, useMemo, useEffect } from 'react';
import { 
    CheckSquare, 
    ListChecks, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    TrendingUp, 
    Scale, 
    ShoppingCart, 
    Package, 
    Award, 
    RotateCcw, 
    Users, 
    FileCheck2, 
    ArrowRight, 
    Printer, 
    Save, 
    Calendar, 
    Filter, 
    ExternalLink, 
    Check, 
    Info, 
    ShieldCheck, 
    Globe, 
    Percent, 
    RefreshCw,
    SlidersHorizontal,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Collaborator, Sale, FinancialTransaction, AdminModuleId, Product } from '../../types';
import { subscribeToCollection } from '../../services/firebaseService';

export interface ManagerOfficialTasksHubProps {
    currentCollaborator: Collaborator;
    selectedDate: string;
    onDateChange: (date: string) => void;
    sales: Sale[];
    transactions: FinancialTransaction[];
    completedTasks: string[];
    onToggleTask: (taskId: string) => void;
    onSaveChecklist: () => Promise<void>;
    isSavingChecklist?: boolean;
    onSwitchTab: (tab: 'financial_bills' | 'today_eval' | 'market_rates' | 'history' | 'comparison' | 'executive_summary') => void;
    onNavigateModule?: (moduleId: AdminModuleId) => void;
}

export interface TaskDefinition {
    id: string;
    numberBadge: string;
    taskNumber: number;
    title: string;
    frequency: 'Diária (Abertura / Fechamento)' | 'Diária / Contínua' | 'Por Demanda / Tempo Real' | 'Semanal / Contínua' | 'Diária / Mensal';
    frequencyCategory: 'diaria' | 'semanal' | 'mensal' | 'demanda';
    category: 'Finanças' | 'Operação & Caixa' | 'Estoque' | 'Comercial' | 'Garantias' | 'Pessoas' | 'Governança';
    icon: any;
    accentColor: string;
    borderColor: string;
    bgBadge: string;
    description: string;
    systemModule: string;
    actionLabel: string;
    actionType: 'tab' | 'module';
    actionTarget: string;
    secondaryActionLabel?: string;
    secondaryActionType?: 'tab' | 'module';
    secondaryActionTarget?: string;
}

export const MANAGER_TASKS_DEFINITIONS: TaskDefinition[] = [
    {
        id: 'task_1_kpi_macro',
        numberBadge: '1ª TAREFA OFICIAL',
        taskNumber: 1,
        title: 'Apuração Diária de Indicadores & Macroeconomia (KPIs & Câmbio)',
        frequency: 'Diária (Abertura / Fechamento)',
        frequencyCategory: 'diaria',
        category: 'Finanças',
        icon: TrendingUp,
        accentColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        bgBadge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        description: 'Apuração do faturamento real consolidado (Balcão PDV, Loja Virtual, WhatsApp, Serviços Técnicos e MRR de Parceiros), ticket médio, margem bruta estimada, atingimento de metas e validação dos índices econômicos (Dólar, Euro, Selic, CDI e IPCA) para precificação segura.',
        systemModule: 'Controle do Gestor > Aba Agora & Mercado',
        actionLabel: 'Avaliar Indicadores de Hoje',
        actionType: 'tab',
        actionTarget: 'today_eval',
        secondaryActionLabel: 'Câmbio & Mercado',
        secondaryActionType: 'tab',
        secondaryActionTarget: 'market_rates'
    },
    {
        id: 'task_2_bills_cashflow',
        numberBadge: '2ª TAREFA OFICIAL',
        taskNumber: 2,
        title: 'Contas a Pagar, Contas a Receber & Fluxo de Caixa (Gestor)',
        frequency: 'Diária / Contínua',
        frequencyCategory: 'diaria',
        category: 'Finanças',
        icon: Scale,
        accentColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        bgBadge: 'bg-amber-50 text-amber-800 border-amber-300',
        description: 'Gestão rigorosa de títulos a pagar (fornecedores de materiais elétricos/iluminação, NF, parcelas e vencimentos) e contas a receber de clientes/convênios. Conciliação com visões Diária, Mensal e Anual, e emissão de extratos em PDF executivos.',
        systemModule: 'Controle do Gestor > Contas a Pagar, Receber & Caixa',
        actionLabel: 'Abrir Contas & Caixa',
        actionType: 'tab',
        actionTarget: 'financial_bills',
        secondaryActionLabel: 'DRE & Geral',
        secondaryActionType: 'module',
        secondaryActionTarget: 'financial'
    },
    {
        id: 'task_3_pos_cashier_audit',
        numberBadge: '3ª TAREFA OFICIAL',
        taskNumber: 3,
        title: 'Auditoria de Caixa & Fechamento de Frente de Loja (PDV)',
        frequency: 'Diária (Abertura / Fechamento)',
        frequencyCategory: 'diaria',
        category: 'Operação & Caixa',
        icon: ShoppingCart,
        accentColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        bgBadge: 'bg-blue-50 text-blue-800 border-blue-300',
        description: 'Conferência do fundo de troco fixo, validação de sangrias e suprimentos durante o expediente, e conferência física de gaveta (dinheiro em espécie vs. comprovantes de PIX e maquininhas de cartão débito/crédito). Emissão do termo de fechamento sem quebras.',
        systemModule: 'Operação > PDV / Caixa & Vendas',
        actionLabel: 'Abrir PDV / Caixa',
        actionType: 'module',
        actionTarget: 'pos',
        secondaryActionLabel: 'Auditar Vendas',
        secondaryActionType: 'module',
        secondaryActionTarget: 'reports'
    },
    {
        id: 'task_4_inventory_restock',
        numberBadge: '4ª TAREFA OFICIAL',
        taskNumber: 4,
        title: 'Gestão de Reposição & Níveis Críticos de Estoque',
        frequency: 'Semanal / Contínua',
        frequencyCategory: 'semanal',
        category: 'Estoque',
        icon: Package,
        accentColor: 'text-orange-700',
        borderColor: 'border-orange-200',
        bgBadge: 'bg-orange-50 text-orange-800 border-orange-300',
        description: 'Auditoria contínua de itens zerados ou abaixo do ponto de reposição de segurança (Curva ABC: cabos de cobre, disjuntores DIN, lâmpadas LED, tubos). Geração de ordens de compra e cotações para reposição com fornecedores (Foxlux, Tramontina, Pampulha Condutores, Famastil).',
        systemModule: 'Estoque & Suprimentos > Estoque & Fichas Técnicas',
        actionLabel: 'Abrir Estoque & Compras',
        actionType: 'module',
        actionTarget: 'inventory',
        secondaryActionLabel: 'Ver Fornecedores',
        secondaryActionType: 'module',
        secondaryActionTarget: 'suppliers'
    },
    {
        id: 'task_5_discount_authorizations',
        numberBadge: '5ª TAREFA OFICIAL',
        taskNumber: 5,
        title: 'Alçadas de Desconto, Liberações Comerciais & Margens Mínimas',
        frequency: 'Por Demanda / Tempo Real',
        frequencyCategory: 'demanda',
        category: 'Comercial',
        icon: Award,
        accentColor: 'text-purple-700',
        borderColor: 'border-purple-200',
        bgBadge: 'bg-purple-50 text-purple-800 border-purple-300',
        description: 'Auditoria e autorização sob senha/PIN gerencial de orçamentos e pedidos com desconto superior a 5% (teto dos operadores de caixa). Blindagem do markup e garantia de que nenhum produto saia da loja abaixo do custo fiscal de reposição mais encargos.',
        systemModule: 'Operação > PDV / Orçamentos & Relatórios',
        actionLabel: 'Auditar Orçamentos / PDV',
        actionType: 'module',
        actionTarget: 'pos',
        secondaryActionLabel: 'Ajustar Custos/Preços',
        secondaryActionType: 'module',
        secondaryActionTarget: 'inventory'
    },
    {
        id: 'task_6_rma_returns_audit',
        numberBadge: '6ª TAREFA OFICIAL',
        taskNumber: 6,
        title: 'Auditoria de Trocas, Devoluções & Avarias de Mercadorias (RMA)',
        frequency: 'Diária / Contínua',
        frequencyCategory: 'diaria',
        category: 'Garantias',
        icon: RotateCcw,
        accentColor: 'text-rose-700',
        borderColor: 'border-rose-200',
        bgBadge: 'bg-rose-50 text-rose-800 border-rose-300',
        description: 'Perícia técnica e parecer conclusivo em produtos com defeito ou devolvidos. Destinação apropriada: Reentrada em estoque vendável, Envio para garantia do fabricante ou Baixa definitiva em Sucata/Perda para manter o inventário fiscal sem divergências contábeis.',
        systemModule: 'Operação > Trocas & Avarias (RMA)',
        actionLabel: 'Abrir Módulo RMA',
        actionType: 'module',
        actionTarget: 'returns_rma'
    },
    {
        id: 'task_7_team_productivity',
        numberBadge: '7ª TAREFA OFICIAL',
        taskNumber: 7,
        title: 'Gestão de Metas & Produtividade da Equipe de Atendimento',
        frequency: 'Diária / Mensal',
        frequencyCategory: 'diaria',
        category: 'Pessoas',
        icon: Users,
        accentColor: 'text-teal-700',
        borderColor: 'border-teal-200',
        bgBadge: 'bg-teal-50 text-teal-800 border-teal-300',
        description: 'Acompanhamento do atingimento de metas individuais e coletivas de vendedores e operadores, cálculo do ticket médio individual, organização de escalas de folgas e plantões na loja, e alinhamento contínuo de atendimento consultivo ao cliente.',
        systemModule: 'Controladoria > Colaboradores & Relatórios',
        actionLabel: 'Abrir Colaboradores (RBAC)',
        actionType: 'module',
        actionTarget: 'collaborators',
        secondaryActionLabel: 'Metas em Relatórios',
        secondaryActionType: 'module',
        secondaryActionTarget: 'reports'
    },
    {
        id: 'task_8_executive_minutes_governance',
        numberBadge: '8ª TAREFA OFICIAL',
        taskNumber: 8,
        title: 'Ata Executiva de Governança, DRE Consolidado & Prestação de Contas',
        frequency: 'Diária / Mensal',
        frequencyCategory: 'mensal',
        category: 'Governança',
        icon: FileCheck2,
        accentColor: 'text-slate-800',
        borderColor: 'border-slate-300',
        bgBadge: 'bg-slate-100 text-slate-900 border-slate-300',
        description: 'Emissão da Ata Executiva Oficial do Gestor (documento timbrado contendo os indicadores apurados, saldo disponível em contas, despesas quitadas e parecer circunstanciado assinado), prestação de contas à Diretoria/Sócios e execução do backup diário do sistema.',
        systemModule: 'Controle do Gestor > Ata & Impressão',
        actionLabel: 'Gerar Ata Executiva',
        actionType: 'tab',
        actionTarget: 'executive_summary',
        secondaryActionLabel: 'Backup de Segurança',
        secondaryActionType: 'module',
        secondaryActionTarget: 'backup_restore'
    }
];

export const ManagerOfficialTasksHub: React.FC<ManagerOfficialTasksHubProps> = ({
    currentCollaborator,
    selectedDate,
    onDateChange,
    sales,
    transactions,
    completedTasks,
    onToggleTask,
    onSaveChecklist,
    isSavingChecklist = false,
    onSwitchTab,
    onNavigateModule
}) => {
    const [filterCategory, setFilterCategory] = useState<'todas' | 'diaria' | 'semanal' | 'mensal' | 'demanda'>('todas');
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [rmaRecords, setRmaRecords] = useState<any[]>([]);

    // Carregar dados auxiliares do Firestore em tempo real
    useEffect(() => {
        const unsubProducts = subscribeToCollection('products', (data) => {
            if (data) setProducts(data as Product[]);
        });
        const unsubRma = subscribeToCollection('returns_rma', (data) => {
            if (data) setRmaRecords(data as any[]);
        });
        return () => {
            unsubProducts();
            unsubRma();
        };
    }, []);

    // Estatísticas calculadas em tempo real para enriquecer os cards
    const liveStats = useMemo(() => {
        // Vendas da data selecionada
        const daySales = sales.filter(s => {
            const d = s.createdAt ? s.createdAt.substring(0, 10) : '';
            return d === selectedDate;
        });
        const dayRevenue = daySales.reduce((acc, s) => acc + (Number(s.total) || 0), 0);
        const dayPosSalesCount = daySales.filter(s => (s.paymentMethod as string) !== 'online').length;

        // Contas do dia selecionado
        const dayBills = transactions.filter(t => t.dueDate === selectedDate);
        const dayPayable = dayBills.filter(t => t.type === 'expense').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
        const dayReceivable = dayBills.filter(t => t.type === 'income').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

        // Itens de estoque zerados ou com estoque <= 5
        const lowStockCount = products.filter(p => Number(p.stock || 0) <= 5).length;

        // Casos de RMA pendentes
        const pendingRmaCount = rmaRecords.filter(r => r.status === 'pending_analysis' || r.status === 'in_quarantine').length;

        return {
            daySalesCount: daySales.length,
            dayRevenue,
            dayPosSalesCount,
            dayPayable,
            dayReceivable,
            lowStockCount,
            pendingRmaCount
        };
    }, [sales, transactions, products, rmaRecords, selectedDate]);

    // Cálculo do percentual de conformidade
    const totalTasksCount = MANAGER_TASKS_DEFINITIONS.length;
    const completedCount = completedTasks.length;
    const completionRate = Math.round((completedCount / totalTasksCount) * 100);

    // Filtragem de tarefas
    const filteredTasks = useMemo(() => {
        return MANAGER_TASKS_DEFINITIONS.filter(task => {
            const matchesCategory = filterCategory === 'todas' || task.frequencyCategory === filterCategory;
            const matchesSearch = searchTerm.trim() === '' || 
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.numberBadge.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [filterCategory, searchTerm]);

    // Ação de navegação inteligente
    const handleActionClick = (type: 'tab' | 'module', target: string) => {
        if (type === 'tab') {
            onSwitchTab(target as any);
        } else if (type === 'module' && onNavigateModule) {
            onNavigateModule(target as AdminModuleId);
        }
    };

    // Formatação de data
    const formatDisplayDate = (dStr: string) => {
        if (!dStr) return '';
        const parts = dStr.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return dStr;
    };

    // Emissão de PDF Timbrado do Roteiro das 8 Tarefas do Gestor
    const handleExportTasksPDF = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();

        // Cabeçalho institucional
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 28, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('PONTO CHAVE DO LAR - SOLUÇÕES EM DESIGN', 14, 11);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('ROTEIRO OFICIAL & CHECKLIST OPERACIONAL DO GESTOR', 14, 18);
        doc.text(`Data da Apuração: ${formatDisplayDate(selectedDate)} | Emissão: ${new Date().toLocaleTimeString('pt-BR')}`, 14, 23);

        // Bloco resumo do Gestor e Índice de Conformidade
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 34, pageWidth - 28, 24, 3, 3, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, 34, pageWidth - 28, 24, 3, 3, 'S');

        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`Gestor Responsável: ${currentCollaborator.name || 'Gestão da Loja'} (${currentCollaborator.role})`, 18, 41);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Índice de Cumprimento no Dia: ${completedCount} de ${totalTasksCount} tarefas concluídas (${completionRate}%)`, 18, 48);
        doc.text(`Status do Protocolo: ${completionRate === 100 ? 'ROTINA 100% CUMPRIDA' : 'ROTINA EM ANDAMENTO / AVALIAÇÃO'}`, 18, 54);

        // Tabela das 8 Tarefas
        const tableBody = MANAGER_TASKS_DEFINITIONS.map(task => {
            const isDone = completedTasks.includes(task.id);
            return [
                task.numberBadge,
                task.title,
                task.frequency,
                task.category,
                isDone ? 'CONCLUÍDA' : 'PENDENTE'
            ];
        });

        autoTable(doc, {
            startY: 64,
            head: [['Nº', 'Descrição da Tarefa Operacional / Governança', 'Frequência', 'Área', 'Status']],
            body: tableBody,
            theme: 'grid',
            headStyles: {
                fillColor: [30, 41, 59],
                textColor: [255, 255, 255],
                fontSize: 8,
                fontStyle: 'bold',
                halign: 'center'
            },
            styles: {
                fontSize: 8,
                cellPadding: 3.5,
                lineColor: [226, 232, 240]
            },
            columnStyles: {
                0: { cellWidth: 26, fontStyle: 'bold', halign: 'center' },
                1: { cellWidth: 86 },
                2: { cellWidth: 32, fontSize: 7 },
                3: { cellWidth: 22, halign: 'center' },
                4: { cellWidth: 22, fontStyle: 'bold', halign: 'center' }
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 4) {
                    if (data.cell.raw === 'CONCLUÍDA') {
                        data.cell.styles.textColor = [16, 185, 129]; // emerald-500
                    } else {
                        data.cell.styles.textColor = [239, 68, 68]; // red-500
                    }
                }
            }
        });

        const finalY = (doc as any).lastAutoTable.finalY || 200;

        // Campo para assinaturas formais
        if (finalY < 240) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);

            const sigY = finalY + 22;
            doc.line(20, sigY, 90, sigY);
            doc.text(`${currentCollaborator.name} - Gestor Responsável`, 22, sigY + 5);

            doc.line(pageWidth - 90, sigY, pageWidth - 20, sigY);
            doc.text('Diretoria Executiva / Conselho Fiscal', pageWidth - 85, sigY + 5);
        }

        // Rodapé do documento
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text('Documento gerado automaticamente pelo Sistema Administrativo Ponto Chave do Lar • Auditoria e Governança Corporativa.', 14, 290);

        doc.save(`Roteiro_Tarefas_Gestor_PontoChave_${selectedDate}.pdf`);
    };

    return (
        <div className="space-y-8 font-sans">
            {/* Banner Superior: Roteiro & Índice de Conformidade Diária */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-white/10 relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold mb-3 border border-indigo-500/30">
                            <ListChecks size={14} />
                            <span>Governança do Gestor • 8 Tarefas Oficiais Homologadas</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                            Painel Integrado de Todas as Tarefas do Gestor
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                            Acompanhe, execute e ateste o cumprimento das <strong>8 rotinas prioritárias</strong> de gestão comercial, financeira, controle de estoque, auditoria de caixa e governança corporativa da loja.
                        </p>
                    </div>

                    {/* Bloco de Progresso / Conformidade do Dia */}
                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 flex items-center gap-5 min-w-[280px]">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <svg className="w-16 h-16 transform -rotate-90">
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="26"
                                    stroke="currentColor"
                                    strokeWidth="5"
                                    className="text-white/20"
                                    fill="transparent"
                                />
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="26"
                                    stroke="currentColor"
                                    strokeWidth="5"
                                    className={completionRate === 100 ? 'text-emerald-400' : 'text-amber-400'}
                                    fill="transparent"
                                    strokeDasharray={163.36}
                                    strokeDashoffset={163.36 - (163.36 * completionRate) / 100}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute text-sm font-extrabold text-white">
                                {completionRate}%
                            </span>
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block">
                                Conformidade Hoje
                            </span>
                            <span className="text-xl font-serif font-bold text-white block">
                                {completedCount} de {totalTasksCount}
                            </span>
                            <span className="text-[10px] text-gray-300 block">
                                {completedCount === totalTasksCount ? 'Todas as tarefas concluídas!' : 'Tarefas pendentes de conferência'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Barra de Ações Rápidas: Salvar e Gerar PDF do Roteiro */}
                <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-amber-400" />
                        <span className="text-xs font-bold text-gray-200">Data Ativa:</span>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="text-xs font-mono font-bold text-white bg-slate-800/80 border border-white/20 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-amber-400 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleExportTasksPDF}
                            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/15"
                            title="Exportar checklist oficial em PDF timbrado"
                        >
                            <Printer size={15} />
                            <span>Imprimir / Gerar PDF do Roteiro</span>
                        </button>
                        <button
                            type="button"
                            onClick={onSaveChecklist}
                            disabled={isSavingChecklist}
                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            <Save size={15} />
                            <span>{isSavingChecklist ? 'Gravando...' : 'Gravar Checklist no Firestore'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filtros de Frequência e Busca de Tarefas */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto bg-gray-100 p-1.5 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setFilterCategory('todas')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            filterCategory === 'todas' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Todas as 8 Tarefas ({totalTasksCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterCategory('diaria')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            filterCategory === 'diaria' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Rotina Diária
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterCategory('semanal')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            filterCategory === 'semanal' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Semanal
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterCategory('mensal')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            filterCategory === 'mensal' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Mensal / Fechamento
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterCategory('demanda')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            filterCategory === 'demanda' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Sob Demanda
                    </button>
                </div>

                <div className="w-full md:w-72">
                    <input
                        type="text"
                        placeholder="Buscar tarefa ou rotina..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>
            </div>

            {/* Grid dos 8 Cards Oficiais das Tarefas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTasks.map((task) => {
                    const isDone = completedTasks.includes(task.id);
                    const TaskIcon = task.icon;

                    return (
                        <div
                            key={task.id}
                            className={`p-6 rounded-3xl border transition-all relative flex flex-col justify-between ${
                                isDone 
                                    ? 'bg-emerald-50/40 border-emerald-300 shadow-sm' 
                                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                            }`}
                        >
                            <div>
                                {/* Header do Card da Tarefa */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-sm ${
                                            isDone ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            <TaskIcon size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${task.bgBadge}`}>
                                                    {task.numberBadge}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-semibold">
                                                    {task.category}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-bold text-gray-900 mt-1 leading-snug">
                                                {task.title}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Checkbox Interativo do Gestor */}
                                    <button
                                        type="button"
                                        onClick={() => onToggleTask(task.id)}
                                        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                            isDone
                                                ? 'bg-emerald-600 text-white shadow-md'
                                                : 'border-2 border-gray-300 hover:border-gray-500 text-transparent hover:text-gray-300'
                                        }`}
                                        title={isDone ? 'Tarefa concluída no dia (clique para desmarcar)' : 'Marcar tarefa como realizada hoje'}
                                    >
                                        <Check size={18} strokeWidth={3} />
                                    </button>
                                </div>

                                {/* Descrição Operacional da Tarefa */}
                                <p className="text-xs text-gray-600 leading-relaxed mt-2">
                                    {task.description}
                                </p>

                                {/* Indicador Dinâmico em Tempo Real Conforme a Tarefa */}
                                <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-700 flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5">
                                        <Info size={13} className="text-brand-primary" />
                                        Módulo no Sistema: <code className="bg-gray-200/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-800">{task.systemModule}</code>
                                    </span>

                                    {/* Métricas ao vivo específicas */}
                                    {task.id === 'task_1_kpi_macro' && (
                                        <span className="text-[11px] font-bold text-emerald-700">
                                            Vendas Hoje: R$ {liveStats.dayRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({liveStats.daySalesCount} vendas)
                                        </span>
                                    )}
                                    {task.id === 'task_2_bills_cashflow' && (
                                        <span className="text-[11px] font-bold text-amber-800">
                                            Contas Hoje: Pagar R$ {liveStats.dayPayable.toFixed(2)} | Receber R$ {liveStats.dayReceivable.toFixed(2)}
                                        </span>
                                    )}
                                    {task.id === 'task_3_pos_cashier_audit' && (
                                        <span className="text-[11px] font-bold text-blue-800">
                                            Movimento Balcão: {liveStats.dayPosSalesCount} cupons emitidos
                                        </span>
                                    )}
                                    {task.id === 'task_4_inventory_restock' && (
                                        <span className={`text-[11px] font-bold ${liveStats.lowStockCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                                            {liveStats.lowStockCount > 0 ? `⚠️ ${liveStats.lowStockCount} itens em nível crítico` : 'Estoque regular'}
                                        </span>
                                    )}
                                    {task.id === 'task_6_rma_returns_audit' && (
                                        <span className={`text-[11px] font-bold ${liveStats.pendingRmaCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                                            {liveStats.pendingRmaCount > 0 ? `⚠️ ${liveStats.pendingRmaCount} casos aguardando laudo` : 'Nenhuma pendência'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Rodapé com Status e Botões de Ação Imediata */}
                            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${isDone ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                                    <span className="text-[11px] font-bold text-gray-700">
                                        {isDone ? 'Concluída na Data' : 'Pendente de Execução'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {task.secondaryActionLabel && task.secondaryActionTarget && (
                                        <button
                                            type="button"
                                            onClick={() => handleActionClick(task.secondaryActionType || 'tab', task.secondaryActionTarget!)}
                                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                                        >
                                            <span>{task.secondaryActionLabel}</span>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleActionClick(task.actionType, task.actionTarget)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                                            isDone
                                                ? 'bg-gray-900 text-white hover:bg-gray-800'
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                        }`}
                                    >
                                        <span>{task.actionLabel}</span>
                                        <ArrowRight size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
