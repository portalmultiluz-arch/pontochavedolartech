import React, { useState, useEffect, useMemo } from 'react';
import { 
    DollarSign, 
    Calendar, 
    TrendingUp, 
    TrendingDown, 
    Clock, 
    CheckCircle2, 
    AlertTriangle, 
    Save, 
    RefreshCw, 
    Plus, 
    Trash2, 
    FileText, 
    Download, 
    Search, 
    Filter, 
    ShieldCheck, 
    ArrowUpRight, 
    ArrowDownLeft, 
    BarChart3, 
    History, 
    Sparkles, 
    Layers, 
    Check, 
    Info, 
    Target,
    Printer,
    Eye,
    Globe,
    Coins,
    Percent,
    Scale,
    ListChecks
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MarketEconomicIndicatorsManager } from './MarketEconomicIndicatorsManager';
import { FinancialBillsAndCashflowManager } from './FinancialBillsAndCashflowManager';
import { ManagerOfficialTasksHub } from './ManagerOfficialTasksHub';
import { 
    subscribeToCollection, 
    createDocument, 
    updateDocument, 
    deleteDocument 
} from '../../services/firebaseService';
import { 
    DailyFinancialKPIRecord, 
    CustomFinancialIndicator, 
    Collaborator, 
    Sale, 
    FinancialTransaction, 
    PartnerProvider,
    AdminModuleId
} from '../../types';
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    Tooltip, 
    CartesianGrid, 
    BarChart, 
    Bar, 
    Legend 
} from 'recharts';

interface ManagerControlCenterProps {
    currentCollaborator: Collaborator;
    onNavigateModule?: (moduleId: AdminModuleId) => void;
}

// Indicadores pré-configurados padrão
const DEFAULT_INDICATOR_CONFIGS = [
    { key: 'totalDailyRevenue', name: 'Faturamento Total do Dia', category: 'Receita', unit: 'BRL', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { key: 'posSalesRevenue', name: 'Vendas Balcão / Loja Física (PDV)', category: 'Receita', unit: 'BRL', icon: DollarSign, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { key: 'onlineSalesRevenue', name: 'Vendas Loja Virtual & WhatsApp', category: 'Receita', unit: 'BRL', icon: ArrowUpRight, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { key: 'servicesRevenue', name: 'Receita de Mão de Obra / Serviços', category: 'Receita', unit: 'BRL', icon: Layers, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { key: 'partnersMRR', name: 'Mensalidades Parceiros (MRR)', category: 'Receita', unit: 'BRL', icon: Sparkles, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { key: 'averageTicket', name: 'Ticket Médio por Venda', category: 'Eficiência', unit: 'BRL', icon: BarChart3, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { key: 'cashBalance', name: 'Saldo Disponível em Caixa / Bancos', category: 'Liquidez', unit: 'BRL', icon: ShieldCheck, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    { key: 'accountsPayableDay', name: 'Contas a Pagar do Dia (Saídas)', category: 'Despesas', unit: 'BRL', icon: ArrowDownLeft, color: 'text-red-600 bg-red-50 border-red-200' },
    { key: 'accountsReceivableDay', name: 'Contas a Receber do Dia (Entradas)', category: 'Crédito', unit: 'BRL', icon: Clock, color: 'text-sky-600 bg-sky-50 border-sky-200' },
    { key: 'estimatedGrossMargin', name: 'Margem Bruta Estimada', category: 'Rentabilidade', unit: 'PERCENT', icon: TrendingUp, color: 'text-emerald-700 bg-emerald-100 border-emerald-300' },
    { key: 'salesTarget', name: 'Meta Diária de Vendas', category: 'Metas', unit: 'BRL', icon: Target, color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { key: 'totalDefaulters', name: 'Inadimplência / Pendências', category: 'Risco', unit: 'BRL', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200' }
];

export const ManagerControlCenter: React.FC<ManagerControlCenterProps> = ({ currentCollaborator, onNavigateModule }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState<string>(todayStr);
    const [activeTab, setActiveTab] = useState<'all_tasks_hub' | 'financial_bills' | 'today_eval' | 'market_rates' | 'history' | 'comparison' | 'executive_summary'>('all_tasks_hub');
    
    // Dados do Firestore
    const [kpiRecords, setKpiRecords] = useState<DailyFinancialKPIRecord[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [partners, setPartners] = useState<PartnerProvider[]>([]);
    const [completedTasks, setCompletedTasks] = useState<string[]>([]);
    
    // Estado do formulário de avaliação do dia selecionado
    const [formValues, setFormValues] = useState<{
        totalDailyRevenue: number;
        posSalesRevenue: number;
        onlineSalesRevenue: number;
        servicesRevenue: number;
        partnersMRR: number;
        averageTicket: number;
        cashBalance: number;
        accountsPayableDay: number;
        accountsReceivableDay: number;
        estimatedGrossMargin: number;
        salesTarget: number;
        totalDefaulters: number;
        status: 'approved' | 'in_review' | 'flagged';
        managerNotes: string;
        customIndicators: CustomFinancialIndicator[];
    }>({
        totalDailyRevenue: 0,
        posSalesRevenue: 0,
        onlineSalesRevenue: 0,
        servicesRevenue: 0,
        partnersMRR: 0,
        averageTicket: 0,
        cashBalance: 0,
        accountsPayableDay: 0,
        accountsReceivableDay: 0,
        estimatedGrossMargin: 35,
        salesTarget: 2500,
        totalDefaulters: 0,
        status: 'approved',
        managerNotes: '',
        customIndicators: []
    });

    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [periodFilter, setPeriodFilter] = useState<'7days' | '30days' | 'all'>('30days');
    const [newIndicatorModalOpen, setNewIndicatorModalOpen] = useState(false);
    const [newIndicatorData, setNewIndicatorData] = useState<{ name: string; value: number; unit: 'BRL' | 'PERCENT' | 'COUNT'; target: number }>({
        name: '',
        value: 0,
        unit: 'BRL',
        target: 0
    });

    // Inscrição em tempo real no Firestore
    useEffect(() => {
        const unsubKPI = subscribeToCollection('daily_financial_kpis', (data) => {
            if (data) {
                // Ordenar por data decrescente
                const sorted = (data as DailyFinancialKPIRecord[]).sort((a, b) => b.date.localeCompare(a.date));
                setKpiRecords(sorted);
            }
        }, 'date');

        const unsubSales = subscribeToCollection('sales', (data) => {
            if (data) setSales(data as Sale[]);
        }, 'createdAt');

        const unsubFinance = subscribeToCollection('finance', (data) => {
            if (data) setTransactions(data as FinancialTransaction[]);
        }, 'dueDate');

        const unsubPartners = subscribeToCollection('partner_providers', (data) => {
            if (data) setPartners(data as PartnerProvider[]);
        }, 'name');

        return () => {
            unsubKPI();
            unsubSales();
            unsubFinance();
            unsubPartners();
        };
    }, []);

    // Quando muda a data selecionada ou chegam os dados do Firestore, carrega os dados existentes daquele dia
    useEffect(() => {
        const existingRecord = kpiRecords.find(k => k.date === selectedDate);
        if (existingRecord) {
            setFormValues({
                totalDailyRevenue: existingRecord.totalDailyRevenue || 0,
                posSalesRevenue: existingRecord.posSalesRevenue || 0,
                onlineSalesRevenue: existingRecord.onlineSalesRevenue || 0,
                servicesRevenue: existingRecord.servicesRevenue || 0,
                partnersMRR: existingRecord.partnersMRR || 0,
                averageTicket: existingRecord.averageTicket || 0,
                cashBalance: existingRecord.cashBalance || 0,
                accountsPayableDay: existingRecord.accountsPayableDay || 0,
                accountsReceivableDay: existingRecord.accountsReceivableDay || 0,
                estimatedGrossMargin: existingRecord.estimatedGrossMargin || 35,
                salesTarget: existingRecord.salesTarget || 2500,
                totalDefaulters: existingRecord.totalDefaulters || 0,
                status: existingRecord.status || 'approved',
                managerNotes: existingRecord.managerNotes || '',
                customIndicators: existingRecord.customIndicators || []
            });
            setCompletedTasks(existingRecord.completedTasks || []);
        } else {
            // Se não houver registro prévio daquele dia, calcular automaticamente com base nos dados do sistema
            handleAutoCalculateFromSystem(selectedDate);
            setCompletedTasks([]);
        }
    }, [selectedDate, kpiRecords]);

    const handleToggleTask = (taskId: string) => {
        setCompletedTasks(prev => {
            if (prev.includes(taskId)) {
                return prev.filter(id => id !== taskId);
            } else {
                return [...prev, taskId];
            }
        });
    };

    // Função de preenchimento inteligente a partir das vendas e lançamentos do Firestore do dia
    const handleAutoCalculateFromSystem = (dateToCalculate: string) => {
        // Filtrar vendas da data (comparando os primeiros 10 caracteres da data ISO)
        const daySales = sales.filter(s => {
            const saleDate = s.createdAt ? s.createdAt.substring(0, 10) : '';
            return saleDate === dateToCalculate;
        });

        const totalRevenue = daySales.reduce((acc, s) => acc + (Number(s.total) || 0), 0);
        const countSales = daySales.length;
        const avgTicket = countSales > 0 ? totalRevenue / countSales : 0;

        // Vendas balcão vs online
        const posTotal = daySales
            .filter(s => (s.paymentMethod as string) !== 'online' && !(s as any).notes?.includes('WhatsApp'))
            .reduce((acc, s) => acc + (Number(s.total) || 0), 0);
        const onlineTotal = totalRevenue - posTotal;

        // Contas a pagar e receber do dia
        const dayTransactions = transactions.filter(t => t.dueDate === dateToCalculate);
        const toPay = dayTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
        const toReceive = dayTransactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

        // Mensalidades de parceiros ativas divididas por 30 (ou receita diária proporcional de MRR)
        const activePartners = partners.filter(p => p.subscriptionStatus === 'active');
        const totalMRR = activePartners.reduce((acc, p) => acc + (Number(p.monthlyFeeAmount) || 49.90), 0);

        setFormValues(prev => ({
            ...prev,
            totalDailyRevenue: totalRevenue > 0 ? totalRevenue : prev.totalDailyRevenue,
            posSalesRevenue: posTotal > 0 ? posTotal : prev.posSalesRevenue,
            onlineSalesRevenue: onlineTotal > 0 ? onlineTotal : prev.onlineSalesRevenue,
            averageTicket: avgTicket > 0 ? avgTicket : prev.averageTicket,
            accountsPayableDay: toPay > 0 ? toPay : prev.accountsPayableDay,
            accountsReceivableDay: toReceive > 0 ? toReceive : prev.accountsReceivableDay,
            partnersMRR: totalMRR > 0 ? totalMRR : prev.partnersMRR
        }));
    };

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4000);
    };

    // Botão Principal: Salvar / Atualizar Indicadores no Firestore
    const handleSaveOrUpdateKPI = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSaving(true);

        try {
            const targetRate = formValues.salesTarget > 0 
                ? (formValues.totalDailyRevenue / formValues.salesTarget) * 100 
                : 100;

            const recordId = `kpi-${selectedDate}`;
            const existingRecord = kpiRecords.find(k => k.date === selectedDate || k.id === recordId);

            const payload: DailyFinancialKPIRecord = {
                id: recordId,
                date: selectedDate,
                timestamp: new Date().toISOString(),
                managerName: currentCollaborator.name || 'Diretoria Executiva',
                managerId: currentCollaborator.id || 'collab-dir-01',
                managerRole: currentCollaborator.role || 'admin',
                status: formValues.status,
                totalDailyRevenue: Number(formValues.totalDailyRevenue) || 0,
                posSalesRevenue: Number(formValues.posSalesRevenue) || 0,
                onlineSalesRevenue: Number(formValues.onlineSalesRevenue) || 0,
                servicesRevenue: Number(formValues.servicesRevenue) || 0,
                partnersMRR: Number(formValues.partnersMRR) || 0,
                averageTicket: Number(formValues.averageTicket) || 0,
                cashBalance: Number(formValues.cashBalance) || 0,
                accountsPayableDay: Number(formValues.accountsPayableDay) || 0,
                accountsReceivableDay: Number(formValues.accountsReceivableDay) || 0,
                estimatedGrossMargin: Number(formValues.estimatedGrossMargin) || 35,
                salesTarget: Number(formValues.salesTarget) || 2500,
                targetAchievementRate: Number(targetRate.toFixed(1)),
                totalDefaulters: Number(formValues.totalDefaulters) || 0,
                customIndicators: formValues.customIndicators || [],
                completedTasks: completedTasks,
                managerNotes: formValues.managerNotes.trim(),
                updatedAt: new Date().toISOString()
            };

            if (existingRecord) {
                await updateDocument('daily_financial_kpis', existingRecord.id, payload);
                showFeedback('success', `Indicadores do dia ${formatDisplayDate(selectedDate)} ATUALIZADOS com sucesso pelo Gestor!`);
            } else {
                await createDocument('daily_financial_kpis', payload);
                showFeedback('success', `Indicadores do dia ${formatDisplayDate(selectedDate)} REGISTRADOS com sucesso pelo Gestor!`);
            }
        } catch (err: any) {
            console.error("Erro ao salvar indicadores do gestor:", err);
            showFeedback('error', `Falha ao registrar indicadores: ${err.message || 'Erro de conexão'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddCustomIndicator = () => {
        if (!newIndicatorData.name.trim()) {
            showFeedback('error', 'Informe o nome do indicador customizado.');
            return;
        }
        const newInd: CustomFinancialIndicator = {
            id: `ind-${Date.now()}`,
            name: newIndicatorData.name.trim(),
            value: Number(newIndicatorData.value) || 0,
            unit: newIndicatorData.unit,
            target: Number(newIndicatorData.target) || undefined
        };
        setFormValues(prev => ({
            ...prev,
            customIndicators: [...prev.customIndicators, newInd]
        }));
        setNewIndicatorData({ name: '', value: 0, unit: 'BRL', target: 0 });
        setNewIndicatorModalOpen(false);
        showFeedback('success', `Indicador "${newInd.name}" adicionado à apuração.`);
    };

    const handleRemoveCustomIndicator = (indId: string) => {
        setFormValues(prev => ({
            ...prev,
            customIndicators: prev.customIndicators.filter(i => i.id !== indId)
        }));
    };

    // Formatação de Datas
    const formatDisplayDate = (dStr: string) => {
        if (!dStr) return '';
        const parts = dStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dStr;
    };

    // Formatação de Moeda
    const formatBRL = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
    };

    // Dados filtrados para o Histórico / Gráficos
    const filteredHistory = useMemo(() => {
        let list = [...kpiRecords];

        if (periodFilter === '7days') {
            list = list.slice(0, 7);
        } else if (periodFilter === '30days') {
            list = list.slice(0, 30);
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            list = list.filter(k => 
                k.date.includes(term) || 
                k.managerName?.toLowerCase().includes(term) || 
                k.managerNotes?.toLowerCase().includes(term)
            );
        }

        return list;
    }, [kpiRecords, periodFilter, searchTerm]);

    // Dados preparados para os gráficos Recharts (invertidos para cronologia crescente)
    const chartData = useMemo(() => {
        return [...filteredHistory].reverse().map(item => ({
            date: formatDisplayDate(item.date),
            faturamento: item.totalDailyRevenue || 0,
            meta: item.salesTarget || 2500,
            saldoCaixa: item.cashBalance || 0,
            contasPagar: item.accountsPayableDay || 0,
            ticketMedio: item.averageTicket || 0
        }));
    }, [filteredHistory]);

    // Registro ativo do dia selecionado
    const isCurrentDayRegistered = kpiRecords.some(k => k.date === selectedDate);
    const activeDateRecord = kpiRecords.find(k => k.date === selectedDate);

    // Cálculos de comparação (Hoje vs Ontem)
    const previousDateRecord = useMemo(() => {
        const sorted = [...kpiRecords].sort((a, b) => b.date.localeCompare(a.date));
        const currIndex = sorted.findIndex(k => k.date === selectedDate);
        if (currIndex !== -1 && currIndex + 1 < sorted.length) {
            return sorted[currIndex + 1];
        }
        return null;
    }, [kpiRecords, selectedDate]);

    // Exportação em CSV
    const exportCSV = () => {
        if (kpiRecords.length === 0) {
            showFeedback('error', 'Nenhum registro histórico para exportar.');
            return;
        }

        const headers = ['Data', 'Gestor', 'Status', 'Faturamento Total (R$)', 'Vendas PDV (R$)', 'Vendas Online (R$)', 'Ticket Médio (R$)', 'Saldo Caixa (R$)', 'Contas a Pagar (R$)', 'Meta (R$)', '% Meta', 'Parecer Executivo'];
        const rows = kpiRecords.map(r => [
            r.date,
            `"${r.managerName || ''}"`,
            r.status,
            r.totalDailyRevenue || 0,
            r.posSalesRevenue || 0,
            r.onlineSalesRevenue || 0,
            r.averageTicket || 0,
            r.cashBalance || 0,
            r.accountsPayableDay || 0,
            r.salesTarget || 0,
            `${r.targetAchievementRate || 0}%`,
            `"${(r.managerNotes || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Indicadores_Financeiros_PontoChave_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showFeedback('success', 'Relatório CSV exportado com sucesso!');
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans space-y-8">
            {/* Notificação Flutuante de Feedback */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center space-x-3 text-white text-sm font-semibold border ${
                            feedback.type === 'success' ? 'bg-emerald-600 border-emerald-400' : 'bg-red-600 border-red-400'
                        }`}
                    >
                        {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                        <span>{feedback.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cabeçalho Executivo do Gestor */}
            <header className="bg-gradient-to-r from-slate-900 via-brand-dark to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-white/10 relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-brand-primary/40 border border-brand-primary/60 text-brand-secondary text-[11px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                                <ShieldCheck size={14} /> Módulo Exclusivo da Diretoria & Gestão
                            </span>
                            <span className="text-xs text-gray-400 font-mono">
                                Auditoria Diária
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
                            Controle do Gestor & Indicadores Financeiros
                        </h1>
                        <p className="text-gray-300 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
                            Avaliação executiva, conferência diária de receitas, metas e histórico temporal de liquidez e faturamento.
                        </p>
                    </div>

                    {/* Identificação do Gestor Conectado e Botão de Ação Rápida */}
                    <div className="flex flex-wrap items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold text-base shadow">
                            {currentCollaborator?.name?.charAt(0) || 'G'}
                        </div>
                        <div className="text-left pr-2">
                            <span className="text-[10px] text-brand-secondary uppercase font-bold tracking-wider block">Gestor Responsável</span>
                            <span className="text-xs font-bold text-white block">{currentCollaborator?.name || 'Diretor'}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleSaveOrUpdateKPI()}
                            disabled={isSaving}
                            className="ml-auto px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            <Save size={16} />
                            <span>{isSaving ? 'Gravando...' : 'Atualizar Indicadores'}</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Barra de Navegação das Dimensões do Gestor */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setActiveTab('all_tasks_hub')}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                            activeTab === 'all_tasks_hub' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-700 hover:text-gray-950 font-bold'
                        }`}
                    >
                        <ListChecks size={16} className={activeTab === 'all_tasks_hub' ? 'text-white' : 'text-indigo-600'} />
                        <span>Roteiro das 8 Tarefas Oficiais</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('financial_bills')}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                            activeTab === 'financial_bills' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-gray-700 hover:text-gray-950 font-extrabold'
                        }`}
                    >
                        <Scale size={16} className={activeTab === 'financial_bills' ? 'text-slate-950' : 'text-amber-600'} />
                        <span>Contas a Pagar, Receber & Caixa (2ª Tarefa)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('today_eval')}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                            activeTab === 'today_eval' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <Clock size={16} className="text-brand-primary" />
                        <span>Agora (1ª Tarefa: Indicadores)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('market_rates')}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                            activeTab === 'market_rates' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <Globe size={16} className="text-blue-600" />
                        <span>Câmbio & Mercado</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                            activeTab === 'history' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <History size={16} className="text-indigo-600" />
                        <span>Passado (Histórico)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('comparison')}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                            activeTab === 'comparison' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <BarChart3 size={16} className="text-emerald-600" />
                        <span>Tendências</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('executive_summary')}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                            activeTab === 'executive_summary' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <FileText size={16} className="text-purple-600" />
                        <span>Ata & DRE (8ª Tarefa)</span>
                    </button>
                </div>

                {/* Seletor de Data Ativa */}
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-sm">
                    <Calendar size={18} className="text-brand-primary" />
                    <label className="text-xs font-bold text-gray-700">Data da Apuração:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="text-xs font-mono font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-brand-primary outline-none"
                    />
                    <button
                        type="button"
                        title="Preencher automaticamente com dados reais de vendas do Firestore"
                        onClick={() => handleAutoCalculateFromSystem(selectedDate)}
                        className="p-1.5 text-gray-500 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {/* ABA ROTEIRO DAS 8 TAREFAS OFICIAIS DO GESTOR */}
            {activeTab === 'all_tasks_hub' && (
                <ManagerOfficialTasksHub
                    currentCollaborator={currentCollaborator}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    sales={sales}
                    transactions={transactions}
                    completedTasks={completedTasks}
                    onToggleTask={handleToggleTask}
                    onSaveChecklist={handleSaveOrUpdateKPI}
                    isSavingChecklist={isSaving}
                    onSwitchTab={(tab) => setActiveTab(tab)}
                    onNavigateModule={onNavigateModule}
                />
            )}

            {/* ABA CONTAS A PAGAR, RECEBER & FLUXO DE CAIXA (SEGUNDA TAREFA OFICIAL DO GESTOR) */}
            {activeTab === 'financial_bills' && (
                <FinancialBillsAndCashflowManager />
            )}

            {/* ABA 1: AVALIAR & ATUALIZAR HOJE / AGORA */}
            {activeTab === 'today_eval' && (
                <div className="space-y-8">
                    {/* Status Card do Dia Selecionado */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${
                                isCurrentDayRegistered ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}>
                                {isCurrentDayRegistered ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-bold text-gray-900">
                                        Apuração do Dia: {formatDisplayDate(selectedDate)}
                                    </h3>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                                        isCurrentDayRegistered ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                        {isCurrentDayRegistered ? 'Indicadores Salvos no Firestore' : 'Aguardando Fechamento do Gestor'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {isCurrentDayRegistered && activeDateRecord ? (
                                        <>Última atualização por <strong>{activeDateRecord.managerName}</strong> às {new Date(activeDateRecord.timestamp).toLocaleTimeString('pt-BR')}</>
                                    ) : (
                                        'Preencha os valores abaixo ou clique no ícone de sincronização para carregar as vendas do PDV e Loja Virtual.'
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setNewIndicatorModalOpen(true)}
                                className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                            >
                                <Plus size={14} />
                                <span>+ Criar Indicador Customizado</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSaveOrUpdateKPI()}
                                disabled={isSaving}
                                className="px-5 py-2.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-2 active:scale-95"
                            >
                                <Save size={16} />
                                <span>Atualizar</span>
                            </button>
                        </div>
                    </div>

                    {/* Resumo Rápido de Cards do Dia */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Faturamento Total do Dia</span>
                            <div className="text-2xl font-bold text-emerald-600">{formatBRL(formValues.totalDailyRevenue)}</div>
                            <span className="text-[11px] text-gray-500 mt-1 block">Meta: {formatBRL(formValues.salesTarget)}</span>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Atingimento da Meta</span>
                            <div className={`text-2xl font-bold ${
                                (formValues.totalDailyRevenue >= formValues.salesTarget) ? 'text-emerald-600' : 'text-amber-600'
                            }`}>
                                {formValues.salesTarget > 0 ? ((formValues.totalDailyRevenue / formValues.salesTarget) * 100).toFixed(1) : 100}%
                            </div>
                            <span className="text-[11px] text-gray-500 mt-1 block">
                                {formValues.totalDailyRevenue >= formValues.salesTarget ? '🎯 Meta do dia superada!' : '⚠️ Abaixo da meta'}
                            </span>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Saldo em Caixa & Bancos</span>
                            <div className="text-2xl font-bold text-cyan-600">{formatBRL(formValues.cashBalance)}</div>
                            <span className="text-[11px] text-gray-500 mt-1 block">Disponibilidade imediata</span>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Contas a Pagar do Dia</span>
                            <div className="text-2xl font-bold text-red-600">{formatBRL(formValues.accountsPayableDay)}</div>
                            <span className="text-[11px] text-gray-500 mt-1 block">Vencimentos programados</span>
                        </div>
                    </div>

                    {/* Faixa Executiva de Câmbio & Indicadores Econômicos */}
                    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm border border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                                <Globe size={18} />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">
                                    Câmbio & Mercado Financeiro (Tempo Real)
                                </span>
                                <div className="text-xs text-gray-300 flex flex-wrap items-center gap-3 mt-0.5">
                                    <span>USD: <strong className="text-white font-mono">R$ 5,72</strong></span>
                                    <span className="text-gray-600">|</span>
                                    <span>EUR: <strong className="text-white font-mono">R$ 6,24</strong></span>
                                    <span className="text-gray-600">|</span>
                                    <span>GBP: <strong className="text-white font-mono">R$ 7,31</strong></span>
                                    <span className="text-gray-600">|</span>
                                    <span>Selic: <strong className="text-emerald-400 font-mono">13,25% a.a.</strong></span>
                                    <span className="text-gray-600">|</span>
                                    <span>Sal. Mínimo: <strong className="text-amber-300 font-mono">R$ 1.518,00</strong></span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setActiveTab('market_rates')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 shrink-0"
                        >
                            <Coins size={14} />
                            <span>Abrir Câmbio & Conversor</span>
                        </button>
                    </div>

                    {/* Formulário Interativo com os Indicadores Financeiros */}
                    <form onSubmit={handleSaveOrUpdateKPI} className="space-y-6">
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200 space-y-6">
                            <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Indicadores Financeiros Avaliados (Data: {formatDisplayDate(selectedDate)})
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        O gestor pode editar e calibrar cada indicador antes de clicar em Atualizar.
                                    </p>
                                </div>
                                <span className="text-xs font-mono bg-gray-100 text-gray-700 px-3 py-1 rounded-lg">
                                    {DEFAULT_INDICATOR_CONFIGS.length + formValues.customIndicators.length} Indicadores
                                </span>
                            </div>

                            {/* Grid de Inputs dos Indicadores Principais */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {DEFAULT_INDICATOR_CONFIGS.map((ind) => {
                                    const IconComponent = ind.icon;
                                    const val = (formValues as any)[ind.key];

                                    return (
                                        <div key={ind.key} className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200 hover:border-brand-primary/40 transition-all space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <div className={`p-1.5 rounded-lg ${ind.color}`}>
                                                        <IconComponent size={16} />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-800">{ind.name}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{ind.category}</span>
                                            </div>

                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step={ind.unit === 'PERCENT' ? '0.1' : '0.01'}
                                                    value={val || 0}
                                                    onChange={(e) => {
                                                        const numVal = parseFloat(e.target.value) || 0;
                                                        setFormValues(prev => ({
                                                            ...prev,
                                                            [ind.key]: numVal
                                                        }));
                                                    }}
                                                    className="w-full text-base font-bold text-gray-900 bg-white border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand-primary outline-none"
                                                />
                                                <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">
                                                    {ind.unit === 'PERCENT' ? '%' : 'R$'}
                                                </span>
                                            </div>

                                            {previousDateRecord && (
                                                <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1">
                                                    <span>Anterior: {ind.unit === 'PERCENT' ? `${(previousDateRecord as any)[ind.key]}%` : formatBRL((previousDateRecord as any)[ind.key])}</span>
                                                    {val > ((previousDateRecord as any)[ind.key] || 0) ? (
                                                        <span className="text-emerald-600 font-bold flex items-center">▲ Alta</span>
                                                    ) : (
                                                        <span className="text-red-500 font-bold flex items-center">▼ Queda</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Indicadores Customizados Adicionados pelo Gestor */}
                            {formValues.customIndicators.length > 0 && (
                                <div className="pt-6 border-t border-gray-100 space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Indicadores Customizados Adicionais
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {formValues.customIndicators.map((cInd) => (
                                            <div key={cInd.id} className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 space-y-2 relative group">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCustomIndicator(cInd.id)}
                                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 rounded-lg"
                                                    title="Remover indicador"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <span className="text-xs font-bold text-purple-900 block pr-6">{cInd.name}</span>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={cInd.value || 0}
                                                        onChange={(e) => {
                                                            const nVal = parseFloat(e.target.value) || 0;
                                                            setFormValues(prev => ({
                                                                ...prev,
                                                                customIndicators: prev.customIndicators.map(i => i.id === cInd.id ? { ...i, value: nVal } : i)
                                                            }));
                                                        }}
                                                        className="w-full text-base font-bold text-gray-900 bg-white border border-purple-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand-primary outline-none"
                                                    />
                                                    <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">
                                                        {cInd.unit === 'PERCENT' ? '%' : cInd.unit === 'COUNT' ? 'Qtd' : 'R$'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Parecer / Diário de Bordo do Gestor */}
                            <div className="pt-6 border-t border-gray-100 space-y-3">
                                <label className="block text-sm font-bold text-gray-900">
                                    Parecer Executivo & Diário de Bordo do Gestor ({formatDisplayDate(selectedDate)})
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Escreva as observações do dia (ex: Meta batida graças a projeto de iluminação comercial no atacado. Contas de luz e aluguel pagas. Estoque de perfil de LED reposto com desconto)."
                                    value={formValues.managerNotes}
                                    onChange={(e) => setFormValues(prev => ({ ...prev, managerNotes: e.target.value }))}
                                    className="w-full text-xs text-gray-800 bg-gray-50 border border-gray-300 rounded-2xl p-4 focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none leading-relaxed"
                                />
                            </div>

                            {/* Status da Avaliação e Botão Atualizar */}
                            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center space-x-3">
                                    <label className="text-xs font-bold text-gray-700">Status da Apuração:</label>
                                    <select
                                        value={formValues.status}
                                        onChange={(e: any) => setFormValues(prev => ({ ...prev, status: e.target.value }))}
                                        className="text-xs font-bold bg-white border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand-primary outline-none"
                                    >
                                        <option value="approved">✅ Aprovado & Validado pelo Gestor</option>
                                        <option value="in_review">⏳ Em Revisão Financeira</option>
                                        <option value="flagged">⚠️ Alerta / Divergência Identificada</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-bold rounded-2xl shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    <span>{isSaving ? 'Gravando Alterações...' : 'Atualizar e Gravar Indicadores do Dia'}</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* ABA 2: PASSADO (Histórico & Linha do Tempo de Indicadores) */}
            {activeTab === 'history' && (
                <div className="space-y-6">
                    {/* Filtros de Histórico */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por data, gestor ou parecer..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="text-xs bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 w-64 focus:ring-2 focus:ring-brand-primary outline-none"
                                />
                            </div>

                            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setPeriodFilter('7days')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        periodFilter === '7days' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500'
                                    }`}
                                >
                                    Últimos 7 dias
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPeriodFilter('30days')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        periodFilter === '30days' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500'
                                    }`}
                                >
                                    Últimos 30 dias
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPeriodFilter('all')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        periodFilter === 'all' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500'
                                    }`}
                                >
                                    Todo o Histórico
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={exportCSV}
                                className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow"
                            >
                                <Download size={14} />
                                <span>Exportar Planilha (CSV)</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabela do Histórico Diário */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900">
                                Registro Temporal de Indicadores ({filteredHistory.length} registros encontrados)
                            </h3>
                            <span className="text-xs text-gray-400 font-mono">Ordenação: Do mais recente para o mais antigo</span>
                        </div>

                        {filteredHistory.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                <History size={36} className="mx-auto mb-3 opacity-40 text-brand-primary" />
                                <p className="text-sm font-bold text-gray-700">Nenhum registro diário encontrado para este período.</p>
                                <p className="text-xs text-gray-500 mt-1">Acesse a aba "Agora" para registrar os indicadores do dia.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                                        <tr>
                                            <th className="py-3.5 px-4">Data</th>
                                            <th className="py-3.5 px-4">Faturamento Total</th>
                                            <th className="py-3.5 px-4">Meta do Dia</th>
                                            <th className="py-3.5 px-4">% Atingido</th>
                                            <th className="py-3.5 px-4">Saldo Caixa</th>
                                            <th className="py-3.5 px-4">Contas a Pagar</th>
                                            <th className="py-3.5 px-4">Gestor</th>
                                            <th className="py-3.5 px-4">Parecer do Dia</th>
                                            <th className="py-3.5 px-4 text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredHistory.map((rec) => (
                                            <tr key={rec.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="py-3.5 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                                                    {formatDisplayDate(rec.date)}
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-emerald-600 whitespace-nowrap">
                                                    {formatBRL(rec.totalDailyRevenue)}
                                                </td>
                                                <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                                                    {formatBRL(rec.salesTarget)}
                                                </td>
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                                        (rec.targetAchievementRate || 0) >= 100 
                                                            ? 'bg-emerald-100 text-emerald-800' 
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {rec.targetAchievementRate || 0}%
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 font-semibold text-cyan-700 whitespace-nowrap">
                                                    {formatBRL(rec.cashBalance)}
                                                </td>
                                                <td className="py-3.5 px-4 font-semibold text-red-600 whitespace-nowrap">
                                                    {formatBRL(rec.accountsPayableDay)}
                                                </td>
                                                <td className="py-3.5 px-4 text-gray-700 whitespace-nowrap">
                                                    <span className="font-semibold">{rec.managerName}</span>
                                                </td>
                                                <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate">
                                                    {rec.managerNotes || '—'}
                                                </td>
                                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedDate(rec.date);
                                                            setActiveTab('today_eval');
                                                        }}
                                                        className="px-2.5 py-1.5 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white rounded-lg text-[11px] font-bold transition-all"
                                                        title="Abrir e editar indicadores desta data"
                                                    >
                                                        Abrir / Editar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ABA 3: GRÁFICOS DE TENDÊNCIA & COMPARAÇÃO TEMPORAL */}
            {activeTab === 'comparison' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Gráfico 1: Faturamento Diário vs Meta */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Evolução do Faturamento Diário vs Meta</h3>
                                <p className="text-xs text-gray-500">Acompanhamento da receita diária ao longo do tempo.</p>
                            </div>
                            <div className="h-72 w-full">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="date" fontSize={10} />
                                            <YAxis fontSize={10} />
                                            <Tooltip formatter={(val: any) => formatBRL(Number(val))} />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                            <Area type="monotone" dataKey="faturamento" name="Faturamento (R$)" stroke="#10b981" fillOpacity={1} fill="url(#colorFat)" />
                                            <Area type="monotone" dataKey="meta" name="Meta (R$)" stroke="#f59e0b" strokeDasharray="5 5" fill="transparent" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                                        Dados insuficientes para gerar o gráfico. Registre pelo menos 1 dia na aba "Agora".
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Gráfico 2: Saldo de Caixa vs Contas a Pagar */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Liquidez: Saldo de Caixa vs Contas a Pagar</h3>
                                <p className="text-xs text-gray-500">Margem de segurança entre saldo disponível e saídas do dia.</p>
                            </div>
                            <div className="h-72 w-full">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="date" fontSize={10} />
                                            <YAxis fontSize={10} />
                                            <Tooltip formatter={(val: any) => formatBRL(Number(val))} />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                            <Bar dataKey="saldoCaixa" name="Saldo Caixa (R$)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="contasPagar" name="Contas a Pagar (R$)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                                        Dados insuficientes para gerar o gráfico.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ABA 4: ATA & IMPRESSÃO EXECUTIVA */}
            {activeTab === 'executive_summary' && (
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-gray-200 space-y-6 print:shadow-none print:border-none">
                    <div className="flex justify-between items-start border-b border-gray-200 pb-6">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary block">Documento Oficial de Governança</span>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mt-1">
                                Ata Diária de Indicadores Financeiros
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Empresa: <strong>Ponto Chave do Lar</strong> | Data de Apuração: <strong>{formatDisplayDate(selectedDate)}</strong>
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-4 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow print:hidden"
                        >
                            <Printer size={16} />
                            <span>Imprimir Relatório</span>
                        </button>
                    </div>

                    {/* Resumo Consolidado */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
                        <div>
                            <span className="text-gray-400 block font-semibold">Faturamento Total:</span>
                            <span className="text-base font-bold text-gray-900">{formatBRL(formValues.totalDailyRevenue)}</span>
                        </div>
                        <div>
                            <span className="text-gray-400 block font-semibold">Meta de Vendas:</span>
                            <span className="text-base font-bold text-gray-900">{formatBRL(formValues.salesTarget)}</span>
                        </div>
                        <div>
                            <span className="text-gray-400 block font-semibold">Saldo de Caixa:</span>
                            <span className="text-base font-bold text-gray-900">{formatBRL(formValues.cashBalance)}</span>
                        </div>
                        <div>
                            <span className="text-gray-400 block font-semibold">Status da Ata:</span>
                            <span className="text-base font-bold text-emerald-700 uppercase">{formValues.status}</span>
                        </div>
                    </div>

                    {/* Tabela de Todos os Indicadores */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Tabela de Indicadores Apurados</h4>
                        <table className="w-full text-xs border border-gray-200">
                            <thead className="bg-gray-100 text-gray-700 font-bold">
                                <tr>
                                    <th className="p-2.5 border border-gray-200">Nome do Indicador</th>
                                    <th className="p-2.5 border border-gray-200">Categoria</th>
                                    <th className="p-2.5 border border-gray-200">Valor Informado</th>
                                    <th className="p-2.5 border border-gray-200">Unidade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DEFAULT_INDICATOR_CONFIGS.map(ind => (
                                    <tr key={ind.key} className="border-b border-gray-100">
                                        <td className="p-2.5 border border-gray-200 font-semibold">{ind.name}</td>
                                        <td className="p-2.5 border border-gray-200 text-gray-500">{ind.category}</td>
                                        <td className="p-2.5 border border-gray-200 font-bold">
                                            {ind.unit === 'PERCENT' ? `${(formValues as any)[ind.key]}%` : formatBRL((formValues as any)[ind.key])}
                                        </td>
                                        <td className="p-2.5 border border-gray-200 text-gray-400">{ind.unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Parecer do Gestor */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                        <span className="text-xs font-bold text-gray-800 block">Parecer & Despacho do Gestor:</span>
                        <p className="text-xs text-gray-700 italic leading-relaxed whitespace-pre-wrap">
                            {formValues.managerNotes || 'Nenhuma ressalva registrada para esta data.'}
                        </p>
                    </div>

                    {/* Assinatura */}
                    <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs text-gray-600">
                        <div className="border-t border-gray-400 pt-2">
                            <span className="font-bold block text-gray-900">{currentCollaborator?.name || 'Diretoria Geral'}</span>
                            <span className="text-[10px] text-gray-500">Gestor Responsável pela Apuração</span>
                        </div>
                        <div className="border-t border-gray-400 pt-2">
                            <span className="font-bold block text-gray-900">Controladoria & Compliance</span>
                            <span className="text-[10px] text-gray-500">Ponto Chave do Lar</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ABA 5: CÂMBIO & INDICADORES DE MERCADO */}
            {activeTab === 'market_rates' && (
                <MarketEconomicIndicatorsManager currentCollaborator={currentCollaborator} />
            )}

            {/* Modal: Criar Indicador Customizado */}
            {newIndicatorModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Plus size={18} className="text-brand-primary" />
                                <span>Novo Indicador Financeiro</span>
                            </h3>
                            <button onClick={() => setNewIndicatorModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold text-gray-700 block mb-1">Nome do Indicador:</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Despesa com Combustível, Frete, Horas Extras..."
                                    value={newIndicatorData.name}
                                    onChange={(e) => setNewIndicatorData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Valor Atual:</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newIndicatorData.value}
                                        onChange={(e) => setNewIndicatorData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-gray-700 block mb-1">Unidade de Medida:</label>
                                    <select
                                        value={newIndicatorData.unit}
                                        onChange={(e: any) => setNewIndicatorData(prev => ({ ...prev, unit: e.target.value }))}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none"
                                    >
                                        <option value="BRL">Reais (R$)</option>
                                        <option value="PERCENT">Percentual (%)</option>
                                        <option value="COUNT">Quantidade (Qtd)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setNewIndicatorModalOpen(false)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleAddCustomIndicator}
                                className="px-5 py-2 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold rounded-xl shadow"
                            >
                                Adicionar Indicador
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
