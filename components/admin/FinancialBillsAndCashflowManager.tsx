import React, { useState, useEffect, useMemo } from 'react';
import { 
    DollarSign, 
    Plus, 
    Edit2, 
    Trash2, 
    Printer, 
    Calendar, 
    Search, 
    Filter, 
    ArrowUpCircle, 
    ArrowDownCircle, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    FileText, 
    Download, 
    TrendingUp, 
    Scale, 
    Building2,
    X,
    Save,
    RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { subscribeToCollection, setDocument, deleteDocument } from '../../services/firebaseService';

export interface BillItem {
    id: string;
    type: 'payable' | 'receivable'; // 'payable' = Contas a Pagar | 'receivable' = Contas a Receber
    entityName: string; // Fornecedor (a pagar) ou Cliente (a receber)
    description: string;
    documentNumber: string; // Documento - NF
    installment: string; // Número de parcelas (ex: 1/1, 1/3, 2/3)
    amount: number; // Valor em R$
    originDate: string; // Data Origem (YYYY-MM-DD)
    dueDate: string; // Data Vencimento (YYYY-MM-DD)
    paymentDate?: string; // Data Efetiva (se quitado)
    status: 'pending' | 'completed' | 'cancelled' | 'overdue';
    category: string;
    notes?: string;
}

const INITIAL_SEED_BILLS: BillItem[] = [
    // Contas a Pagar (Fornecedores)
    {
        id: 'bill-pay-1',
        type: 'payable',
        entityName: 'Prysmian Cabos e Sistemas Brasil',
        description: 'Aquisição de cabos flexíveis antichama 2.5mm² e 4mm²',
        documentNumber: 'NF-e 048.912',
        installment: '1/3',
        amount: 3450.00,
        originDate: '2026-08-25',
        dueDate: '2026-09-10',
        status: 'pending',
        category: 'Matéria-prima & Estoque',
        notes: 'Boleto bancário Itaú'
    },
    {
        id: 'bill-pay-2',
        type: 'payable',
        entityName: 'Tigre Tubos e Conexões',
        description: 'Lote conexões PVC soldável e esgoto primário',
        documentNumber: 'NF-e 119.340',
        installment: '2/2',
        amount: 1890.50,
        originDate: '2026-08-15',
        dueDate: '2026-09-08',
        status: 'pending',
        category: 'Estoque Hidráulica',
        notes: 'Desconto pontualidade aplicado'
    },
    {
        id: 'bill-pay-3',
        type: 'payable',
        entityName: 'CEMIG Distribuição S.A.',
        description: 'Energia elétrica salão comercial e estoque',
        documentNumber: 'FAT-789012',
        installment: '1/1',
        amount: 684.20,
        originDate: '2026-09-01',
        dueDate: '2026-09-15',
        status: 'pending',
        category: 'Utilidades & Operação'
    },
    {
        id: 'bill-pay-4',
        type: 'payable',
        entityName: 'Schneider Electric Brasil',
        description: 'Disjuntores monopolares e bipolares DIN curva C',
        documentNumber: 'NF-e 089.112',
        installment: '1/2',
        amount: 2150.00,
        originDate: '2026-08-20',
        dueDate: '2026-09-05',
        paymentDate: '2026-09-05',
        status: 'completed',
        category: 'Estoque Elétrica',
        notes: 'Pago via Pix com comprovante arquivado'
    },
    // Contas a Receber (Clientes)
    {
        id: 'bill-rec-1',
        type: 'receivable',
        entityName: 'Construtora Horizonte Belo LTDA',
        description: 'Fornecimento de infraestrutura elétrica residencial',
        documentNumber: 'NFS-e 2026/089',
        installment: '1/3',
        amount: 4890.00,
        originDate: '2026-08-28',
        dueDate: '2026-09-12',
        status: 'pending',
        category: 'Venda Corporativa / Obras',
        notes: 'Boleto bancário faturado 15 dias'
    },
    {
        id: 'bill-rec-2',
        type: 'receivable',
        entityName: 'Carlos Eduardo Menezes (Arquiteto)',
        description: 'Luminárias embutidas e fitas LED dimerizáveis',
        documentNumber: 'NF-e 001.442',
        installment: '1/2',
        amount: 1420.00,
        originDate: '2026-08-30',
        dueDate: '2026-09-08',
        status: 'pending',
        category: 'Venda a Prazo',
        notes: 'Promissória assinada'
    },
    {
        id: 'bill-rec-3',
        type: 'receivable',
        entityName: 'Condomínio Residencial Parque das Flores',
        description: 'Troca de fiação barramento e iluminação de emergência',
        documentNumber: 'NFS-e 2026/077',
        installment: '1/1',
        amount: 2750.00,
        originDate: '2026-08-10',
        dueDate: '2026-09-02',
        paymentDate: '2026-09-02',
        status: 'completed',
        category: 'Serviços & Materiais',
        notes: 'Recebido via transferência Pix banco Bradesco'
    }
];

const STORAGE_KEY = 'financial_bills_data';

export const FinancialBillsAndCashflowManager: React.FC = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM
    const currentYearStr = todayStr.substring(0, 4); // YYYY

    const [activeSection, setActiveSection] = useState<'payable' | 'receivable' | 'cashflow'>('payable');
    const [periodMode, setPeriodMode] = useState<'daily' | 'monthly' | 'yearly' | 'all'>('monthly');
    const [selectedDate, setSelectedDate] = useState<string>(todayStr);
    const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
    const [selectedYear, setSelectedYear] = useState<string>(currentYearStr);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');

    const [bills, setBills] = useState<BillItem[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<BillItem | null>(null);

    // Formulário
    const [formData, setFormData] = useState<{
        type: 'payable' | 'receivable';
        entityName: string;
        description: string;
        documentNumber: string;
        installment: string;
        amount: string;
        originDate: string;
        dueDate: string;
        status: 'pending' | 'completed' | 'cancelled' | 'overdue';
        category: string;
        notes: string;
    }>({
        type: 'payable',
        entityName: '',
        description: '',
        documentNumber: '',
        installment: '1/1',
        amount: '',
        originDate: todayStr,
        dueDate: todayStr,
        status: 'pending',
        category: '',
        notes: ''
    });

    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4000);
    };

    // Carregamento dos dados com Firestore e fallback LocalStorage
    useEffect(() => {
        const unsub = subscribeToCollection('financial_bills', (data) => {
            if (data && data.length > 0) {
                setBills(data as BillItem[]);
            } else {
                const local = localStorage.getItem(STORAGE_KEY);
                if (local) {
                    try {
                        setBills(JSON.parse(local));
                    } catch {
                        setBills(INITIAL_SEED_BILLS);
                    }
                } else {
                    setBills(INITIAL_SEED_BILLS);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_BILLS));
                }
            }
        });

        return () => unsub();
    }, []);

    const saveBillsToStorage = (updatedBills: BillItem[]) => {
        setBills(updatedBills);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBills));
        } catch (e) {
            console.warn('Erro localStorage:', e);
        }
    };

    // Filtragem por período
    const filteredBills = useMemo(() => {
        return bills.filter(item => {
            // Filtro de Seção (se for contas a pagar ou receber; se for cashflow considera ambos)
            if (activeSection === 'payable' && item.type !== 'payable') return false;
            if (activeSection === 'receivable' && item.type !== 'receivable') return false;

            // Filtro de Status
            if (statusFilter !== 'all') {
                if (statusFilter === 'overdue') {
                    if (item.status !== 'pending' || item.dueDate >= todayStr) return false;
                } else if (item.status !== statusFilter) {
                    return false;
                }
            }

            // Filtro de Período
            const targetDate = item.dueDate || item.originDate;
            if (periodMode === 'daily') {
                if (targetDate !== selectedDate) return false;
            } else if (periodMode === 'monthly') {
                if (!targetDate.startsWith(selectedMonth)) return false;
            } else if (periodMode === 'yearly') {
                if (!targetDate.startsWith(selectedYear)) return false;
            }

            // Busca textual
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchName = item.entityName.toLowerCase().includes(query);
                const matchDesc = item.description.toLowerCase().includes(query);
                const matchDoc = item.documentNumber.toLowerCase().includes(query);
                const matchCat = (item.category || '').toLowerCase().includes(query);
                if (!matchName && !matchDesc && !matchDoc && !matchCat) return false;
            }

            return true;
        });
    }, [bills, activeSection, periodMode, selectedDate, selectedMonth, selectedYear, statusFilter, searchQuery, todayStr]);

    // Métricas
    const metrics = useMemo(() => {
        let totalPayablePending = 0;
        let totalPayableCompleted = 0;
        let totalReceivablePending = 0;
        let totalReceivableCompleted = 0;

        filteredBills.forEach(b => {
            const val = Number(b.amount) || 0;
            if (b.type === 'payable') {
                if (b.status === 'completed') totalPayableCompleted += val;
                else totalPayablePending += val;
            } else {
                if (b.status === 'completed') totalReceivableCompleted += val;
                else totalReceivablePending += val;
            }
        });

        const totalPayableAll = totalPayablePending + totalPayableCompleted;
        const totalReceivableAll = totalReceivablePending + totalReceivableCompleted;
        const netCashflowProjected = totalReceivableAll - totalPayableAll;
        const netCashflowRealized = totalReceivableCompleted - totalPayableCompleted;

        return {
            totalPayablePending,
            totalPayableCompleted,
            totalPayableAll,
            totalReceivablePending,
            totalReceivableCompleted,
            totalReceivableAll,
            netCashflowProjected,
            netCashflowRealized
        };
    }, [filteredBills]);

    // Abertura do formulário
    const handleOpenModal = (item?: BillItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                type: item.type,
                entityName: item.entityName,
                description: item.description,
                documentNumber: item.documentNumber,
                installment: item.installment,
                amount: item.amount.toString(),
                originDate: item.originDate,
                dueDate: item.dueDate,
                status: item.status,
                category: item.category || '',
                notes: item.notes || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                type: activeSection === 'receivable' ? 'receivable' : 'payable',
                entityName: '',
                description: '',
                documentNumber: '',
                installment: '1/1',
                amount: '',
                originDate: todayStr,
                dueDate: todayStr,
                status: 'pending',
                category: activeSection === 'receivable' ? 'Venda a Prazo' : 'Mercadorias & Estoque',
                notes: ''
            });
        }
        setModalOpen(true);
    };

    // Salvar Lançamento (Inserir / Alterar)
    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(formData.amount.replace(',', '.'));
        if (isNaN(numAmount) || numAmount <= 0) {
            showFeedback('error', 'Por favor, informe um valor numérico válido.');
            return;
        }

        if (!formData.entityName.trim()) {
            showFeedback('error', formData.type === 'payable' ? 'Informe o nome do fornecedor.' : 'Informe o nome do cliente.');
            return;
        }

        const id = editingItem ? editingItem.id : `bill-${Date.now()}`;
        const itemToSave: BillItem = {
            id,
            type: formData.type,
            entityName: formData.entityName.trim(),
            description: formData.description.trim(),
            documentNumber: formData.documentNumber.trim() || 'S/N',
            installment: formData.installment.trim() || '1/1',
            amount: numAmount,
            originDate: formData.originDate,
            dueDate: formData.dueDate,
            status: formData.status,
            category: formData.category.trim() || 'Geral',
            notes: formData.notes.trim()
        };

        try {
            await setDocument('financial_bills', id, itemToSave);
        } catch (err) {
            console.warn('Erro ao salvar no Firestore, salvando local:', err);
        }

        let updatedList: BillItem[];
        if (editingItem) {
            updatedList = bills.map(b => b.id === id ? itemToSave : b);
            showFeedback('success', 'Lançamento alterado com sucesso!');
        } else {
            updatedList = [itemToSave, ...bills];
            showFeedback('success', 'Novo lançamento incluído com sucesso!');
        }

        saveBillsToStorage(updatedList);
        setModalOpen(false);
    };

    // Excluir
    const handleDeleteItem = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este lançamento financeiro?')) return;
        try {
            await deleteDocument('financial_bills', id);
        } catch (err) {
            console.warn('Erro ao deletar do Firestore:', err);
        }
        const updatedList = bills.filter(b => b.id !== id);
        saveBillsToStorage(updatedList);
        showFeedback('success', 'Lançamento excluído.');
    };

    // Alternar status (Quitar / Pendente)
    const handleToggleStatus = async (item: BillItem) => {
        const newStatus = item.status === 'completed' ? 'pending' : 'completed';
        const updated: BillItem = {
            ...item,
            status: newStatus,
            paymentDate: newStatus === 'completed' ? todayStr : undefined
        };
        try {
            await setDocument('financial_bills', item.id, updated);
        } catch (err) {
            console.warn('Erro Firestore:', err);
        }
        const updatedList = bills.map(b => b.id === item.id ? updated : b);
        saveBillsToStorage(updatedList);
        showFeedback('success', `Status alterado para ${newStatus === 'completed' ? 'Quitado' : 'Pendente'}.`);
    };

    // Formatação BRL
    const formatBRL = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const formatDateBR = (isoDate: string) => {
        if (!isoDate) return '-';
        const [y, m, d] = isoDate.split('-');
        return `${d}/${m}/${y}`;
    };

    // Rótulo do período atual
    const getPeriodLabel = () => {
        if (periodMode === 'daily') return `Diário: ${formatDateBR(selectedDate)}`;
        if (periodMode === 'monthly') {
            const [y, m] = selectedMonth.split('-');
            const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            return `Mensal: ${months[parseInt(m, 10) - 1]} de ${y}`;
        }
        if (periodMode === 'yearly') return `Anual: Exercício ${selectedYear}`;
        return 'Histórico Completo';
    };

    // ==========================================
    // GERAÇÃO E IMPRESSÃO DE PDF PROFISSIONAL
    // ==========================================
    const generatePDF = (reportType: 'payable' | 'receivable' | 'cashflow') => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const periodTitle = getPeriodLabel();
        let reportTitle = '';
        if (reportType === 'payable') reportTitle = 'RELATÓRIO DE CONTAS A PAGAR';
        else if (reportType === 'receivable') reportTitle = 'RELATÓRIO DE CONTAS A RECEBER';
        else reportTitle = 'EXTRATO CONCILIADO DE CONTAS A PAGAR & RECEBER (FLUXO DE CAIXA)';

        // 1. Cabeçalho Timbrado
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 210, 32, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('PONTO CHAVE DO LAR - CONTROLE DO GESTOR', 14, 12);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(203, 213, 225);
        doc.text('Comércio de Materiais Elétricos, Hidráulicos, Ferramentas & Soluções em Design', 14, 18);
        doc.text('CNPJ: 00.000.000/0001-00 | Av. Afonso Pena, 1500 - Centro - Belo Horizonte/MG', 14, 23);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(251, 191, 36); // amber-400
        doc.text(`EMISSÃO: ${formatDateBR(todayStr)} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, 14, 28);

        // 2. Título do Relatório & Período
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(reportTitle, 14, 42);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text(`PERÍODO: ${periodTitle.toUpperCase()}`, 14, 48);

        // 3. Bloco de Resumo Executivo
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 52, 182, 22, 2, 2, 'FD');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);

        if (reportType === 'payable') {
            doc.text('TOTAL A PAGAR (TODOS)', 20, 58);
            doc.text('TOTAL PENDENTE', 80, 58);
            doc.text('TOTAL JÁ QUITADO', 140, 58);

            doc.setFontSize(12);
            doc.setTextColor(225, 29, 72); // rose-600
            doc.text(formatBRL(metrics.totalPayableAll), 20, 66);
            doc.setTextColor(217, 119, 6); // amber-600
            doc.text(formatBRL(metrics.totalPayablePending), 80, 66);
            doc.setTextColor(16, 185, 129); // emerald-600
            doc.text(formatBRL(metrics.totalPayableCompleted), 140, 66);
        } else if (reportType === 'receivable') {
            doc.text('TOTAL A RECEBER (TODOS)', 20, 58);
            doc.text('TOTAL PENDENTE', 80, 58);
            doc.text('TOTAL JÁ RECEBIDO', 140, 58);

            doc.setFontSize(12);
            doc.setTextColor(16, 185, 129); // emerald-600
            doc.text(formatBRL(metrics.totalReceivableAll), 20, 66);
            doc.setTextColor(59, 130, 246); // blue-600
            doc.text(formatBRL(metrics.totalReceivablePending), 80, 66);
            doc.setTextColor(5, 150, 105);
            doc.text(formatBRL(metrics.totalReceivableCompleted), 140, 66);
        } else {
            doc.text('TOTAL RECEITAS (A RECEBER)', 20, 58);
            doc.text('TOTAL DESPESAS (A PAGAR)', 80, 58);
            doc.text('SALDO PROJETADO LÍQUIDO', 140, 58);

            doc.setFontSize(12);
            doc.setTextColor(16, 185, 129);
            doc.text(formatBRL(metrics.totalReceivableAll), 20, 66);
            doc.setTextColor(225, 29, 72);
            doc.text(formatBRL(metrics.totalPayableAll), 80, 66);
            doc.setTextColor(metrics.netCashflowProjected >= 0 ? 16 : 225, metrics.netCashflowProjected >= 0 ? 185 : 29, metrics.netCashflowProjected >= 0 ? 129 : 72);
            doc.text(formatBRL(metrics.netCashflowProjected), 140, 66);
        }

        // 4. Preparação da Tabela com campos requisitados no PDF do usuário:
        // Fornecedor/Cliente, Descrição, Documento – NF, Número de Parcelas, Valor, Data Origem – Data Vencimento, Status
        const itemsToPrint = filteredBills.filter(b => {
            if (reportType === 'payable') return b.type === 'payable';
            if (reportType === 'receivable') return b.type === 'receivable';
            return true; // cashflow includes both
        });

        const tableRows = itemsToPrint.map(item => {
            const isPay = item.type === 'payable';
            const statusLabel = item.status === 'completed' 
                ? (isPay ? 'PAGO' : 'RECEBIDO') 
                : (item.dueDate < todayStr ? 'ATRASADO' : 'PENDENTE');

            return [
                isPay ? `[PAGAR] ${item.entityName}` : `[RECEBER] ${item.entityName}`,
                item.description,
                item.documentNumber || 'S/N',
                item.installment || '1/1',
                formatBRL(item.amount),
                formatDateBR(item.originDate),
                formatDateBR(item.dueDate),
                statusLabel
            ];
        });

        autoTable(doc, {
            startY: 80,
            head: [['Favorecido / Entidade', 'Descrição', 'Doc / NF', 'Parc.', 'Valor', 'Origem', 'Vencimento', 'Status']],
            body: tableRows,
            theme: 'grid',
            headStyles: {
                fillColor: reportType === 'payable' ? [190, 18, 60] : reportType === 'receivable' ? [15, 118, 110] : [30, 41, 59],
                textColor: [255, 255, 255],
                fontSize: 8,
                fontStyle: 'bold',
                halign: 'left'
            },
            styles: {
                fontSize: 7.5,
                cellPadding: 2,
                overflow: 'linebreak'
            },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 45 },
                2: { cellWidth: 20 },
                3: { cellWidth: 12, halign: 'center' },
                4: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
                5: { cellWidth: 17, halign: 'center' },
                6: { cellWidth: 17, halign: 'center' },
                7: { cellWidth: 17, halign: 'center' }
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            }
        });

        // 5. Rodapé de Assinatura do Gestor
        const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : 220;
        if (finalY < 270) {
            doc.setDrawColor(148, 163, 184);
            doc.line(20, finalY, 90, finalY);
            doc.line(120, finalY, 190, finalY);

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            doc.text('Responsável Financeiro / Gestor', 30, finalY + 4);
            doc.text('Diretoria Executiva / Conferência', 130, finalY + 4);
        }

        // Salvar / Download do PDF
        const safePeriodName = periodMode === 'daily' ? selectedDate : periodMode === 'monthly' ? selectedMonth : selectedYear;
        const fileName = `${reportType.toUpperCase()}_${safePeriodName}_PONTO_CHAVE.pdf`;
        doc.save(fileName);
        showFeedback('success', `PDF gerado com sucesso: ${fileName}`);
    };

    return (
        <div className="space-y-6 font-sans">
            {/* Notificação Flutuante */}
            {feedback && (
                <div className={`p-4 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 ${
                    feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}>
                    {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{feedback.message}</span>
                </div>
            )}

            {/* Cabeçalho do Módulo Financeiro */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider">
                            Módulo Financeiro do Gestor
                        </span>
                        <span className="text-xs text-slate-400">• Emissão Oficial em PDF</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Scale size={24} className="text-amber-400" />
                        Contas a Pagar, Contas a Receber & Fluxo de Caixa
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                        Gerenciamento completo de obrigações com fornecedores, recebíveis de clientes, fechamento diário, mensal e anual com conciliação e impressão de relatórios.
                    </p>
                </div>

                {/* Botões de Ação de Alto Nível */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => handleOpenModal()}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        <span>Novo Lançamento</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => generatePDF(activeSection)}
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-2 transition-all active:scale-95"
                        title="Exportar PDF de acordo com o período e seção selecionada"
                    >
                        <Printer size={16} className="text-amber-400" />
                        <span>Imprimir PDF {periodMode === 'daily' ? 'Diário' : periodMode === 'monthly' ? 'Mensal' : periodMode === 'yearly' ? 'Anual' : 'Geral'}</span>
                    </button>
                </div>
            </div>

            {/* SELETOR DAS 3 SUB-ABAS: CONTAS A PAGAR, CONTAS A RECEBER, FLUXO DE CAIXA */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setActiveSection('payable')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            activeSection === 'payable' 
                                ? 'bg-rose-600 text-white shadow-md' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                    >
                        <ArrowDownCircle size={16} />
                        <span>Contas a Pagar</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeSection === 'payable' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'}`}>
                            {bills.filter(b => b.type === 'payable').length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection('receivable')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            activeSection === 'receivable' 
                                ? 'bg-emerald-600 text-white shadow-md' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                    >
                        <ArrowUpCircle size={16} />
                        <span>Contas a Receber</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeSection === 'receivable' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                            {bills.filter(b => b.type === 'receivable').length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection('cashflow')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            activeSection === 'cashflow' 
                                ? 'bg-slate-900 text-white shadow-md' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                    >
                        <TrendingUp size={16} className="text-amber-400" />
                        <span>Fechamento & Fluxo de Caixa</span>
                    </button>
                </div>

                {/* BOTÕES DE IMPRESSÃO RÁPIDA (DIÁRIO / MENSAL / ANUAL) */}
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 hidden sm:inline">PDF Rápido:</span>
                    <button
                        type="button"
                        onClick={() => { setPeriodMode('daily'); generatePDF(activeSection); }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1"
                        title="Imprimir PDF do dia selecionado"
                    >
                        <Printer size={12} /> Diário
                    </button>
                    <button
                        type="button"
                        onClick={() => { setPeriodMode('monthly'); generatePDF(activeSection); }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1"
                        title="Imprimir PDF do mês selecionado"
                    >
                        <Printer size={12} /> Mensal
                    </button>
                    <button
                        type="button"
                        onClick={() => { setPeriodMode('yearly'); generatePDF(activeSection); }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1"
                        title="Imprimir PDF do ano selecionado"
                    >
                        <Printer size={12} /> Anual
                    </button>
                    <button
                        type="button"
                        onClick={() => generatePDF('cashflow')}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1"
                        title="Imprimir PDF do Extrato Geral com Conciliação"
                    >
                        <FileText size={12} /> Extrato Conciliado
                    </button>
                </div>
            </div>

            {/* BARRA DE FILTROS TEMPORAIS & BUSCA */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Seletor de Período (Diário, Mensal, Anual, Todos) */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setPeriodMode('daily')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                periodMode === 'daily' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Diário
                        </button>
                        <button
                            type="button"
                            onClick={() => setPeriodMode('monthly')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                periodMode === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Mensal
                        </button>
                        <button
                            type="button"
                            onClick={() => setPeriodMode('yearly')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                periodMode === 'yearly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Anual
                        </button>
                        <button
                            type="button"
                            onClick={() => setPeriodMode('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                periodMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Todos
                        </button>
                    </div>

                    {/* Inputs de Data específicos conforme o período */}
                    <div className="flex items-center gap-2">
                        {periodMode === 'daily' && (
                            <div className="flex items-center gap-1.5 text-xs">
                                <Calendar size={14} className="text-slate-500" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-amber-500"
                                />
                            </div>
                        )}

                        {periodMode === 'monthly' && (
                            <div className="flex items-center gap-1.5 text-xs">
                                <Calendar size={14} className="text-slate-500" />
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={e => setSelectedMonth(e.target.value)}
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-amber-500"
                                />
                            </div>
                        )}

                        {periodMode === 'yearly' && (
                            <div className="flex items-center gap-1.5 text-xs">
                                <Calendar size={14} className="text-slate-500" />
                                <select
                                    value={selectedYear}
                                    onChange={e => setSelectedYear(e.target.value)}
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-amber-500"
                                >
                                    <option value="2024">Exercício 2024</option>
                                    <option value="2025">Exercício 2025</option>
                                    <option value="2026">Exercício 2026</option>
                                    <option value="2027">Exercício 2027</option>
                                </select>
                            </div>
                        )}

                        {/* Filtro de Status */}
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as any)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 outline-none"
                        >
                            <option value="all">Todos os Status</option>
                            <option value="pending">Apenas Pendentes</option>
                            <option value="completed">Apenas Quitados / Pagos</option>
                            <option value="overdue">Apenas Vencidos</option>
                        </select>
                    </div>

                    {/* Busca textual */}
                    <div className="relative flex-1 max-w-xs">
                        <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Buscar fornecedor, cliente, NF..."
                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 outline-none focus:ring-1 focus:ring-amber-500"
                        />
                    </div>
                </div>

                {/* Sub-faixa de exibição do período selecionado */}
                <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                    <span>Visualizando: <strong>{getPeriodLabel()}</strong></span>
                    <span>Total de lançamentos encontrados: <strong>{filteredBills.length}</strong></span>
                </div>
            </div>

            {/* CARDS DE RESUMO FINANCEIRO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-between">
                        Contas a Pagar
                        <ArrowDownCircle size={14} className="text-rose-600" />
                    </span>
                    <div className="text-xl font-extrabold text-rose-600">
                        {formatBRL(metrics.totalPayableAll)}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>Pendente: {formatBRL(metrics.totalPayablePending)}</span>
                        <span>Pago: {formatBRL(metrics.totalPayableCompleted)}</span>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-between">
                        Contas a Receber
                        <ArrowUpCircle size={14} className="text-emerald-600" />
                    </span>
                    <div className="text-xl font-extrabold text-emerald-600">
                        {formatBRL(metrics.totalReceivableAll)}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>Pendente: {formatBRL(metrics.totalReceivablePending)}</span>
                        <span>Recebido: {formatBRL(metrics.totalReceivableCompleted)}</span>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-between">
                        Saldo Projetado do Período
                        <Scale size={14} className="text-blue-600" />
                    </span>
                    <div className={`text-xl font-extrabold ${metrics.netCashflowProjected >= 0 ? 'text-blue-700' : 'text-rose-600'}`}>
                        {formatBRL(metrics.netCashflowProjected)}
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                        (Receber Total - Pagar Total)
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-between">
                        Saldo Realizado (Caixa Efetivo)
                        <TrendingUp size={14} className="text-amber-500" />
                    </span>
                    <div className={`text-xl font-extrabold ${metrics.netCashflowRealized >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {formatBRL(metrics.netCashflowRealized)}
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                        (Recebido Quitado - Pago Quitado)
                    </div>
                </div>
            </div>

            {/* TABELA DE LANÇAMENTOS COM CAMPOS OFICIAIS:
                Fornecedor/Cliente, Descrição, Documento – NF, Número de Parcelas, Valor, Data Origem – Data Vencimento, Ações */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                            {activeSection === 'payable' ? 'Tabela de Contas a Pagar (Fornecedores)' : activeSection === 'receivable' ? 'Tabela de Contas a Receber (Clientes)' : 'Extrato Integrado de Fechamento & Conciliação'}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                            Campos oficiais exigidos: Favorecido, Descrição, Documento NF, Parcela, Valor, Data Origem e Data Vencimento.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => generatePDF(activeSection)}
                        className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
                    >
                        <Printer size={14} />
                        <span>Imprimir este Relatório em PDF</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Tipo / Favorecido</th>
                                <th className="px-4 py-3">Descrição & Categoria</th>
                                <th className="px-4 py-3">Doc / NF</th>
                                <th className="px-4 py-3 text-center">Parcela</th>
                                <th className="px-4 py-3 text-right">Valor</th>
                                <th className="px-4 py-3 text-center">Data Origem</th>
                                <th className="px-4 py-3 text-center">Data Vencimento</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBills.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                                        Nenhum lançamento encontrado para os filtros selecionados.
                                    </td>
                                </tr>
                            ) : (
                                filteredBills.map(item => {
                                    const isPayable = item.type === 'payable';
                                    const isOverdue = item.status === 'pending' && item.dueDate < todayStr;

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                            {/* Favorecido */}
                                            <td className="px-4 py-3 font-semibold text-slate-900">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${isPayable ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                                    <div>
                                                        <span className="block font-bold">{item.entityName}</span>
                                                        <span className="text-[10px] font-normal text-slate-500 uppercase">
                                                            {isPayable ? 'Fornecedor' : 'Cliente'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Descrição */}
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-800 line-clamp-1">{item.description}</p>
                                                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    {item.category || 'Geral'}
                                                </span>
                                            </td>

                                            {/* Doc / NF */}
                                            <td className="px-4 py-3 font-mono font-medium text-slate-700">
                                                {item.documentNumber}
                                            </td>

                                            {/* Parcela */}
                                            <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                                                {item.installment}
                                            </td>

                                            {/* Valor */}
                                            <td className="px-4 py-3 text-right font-bold text-sm">
                                                <span className={isPayable ? 'text-rose-600' : 'text-emerald-600'}>
                                                    {isPayable ? '- ' : '+ '}
                                                    {formatBRL(item.amount)}
                                                </span>
                                            </td>

                                            {/* Data Origem */}
                                            <td className="px-4 py-3 text-center font-mono text-slate-600">
                                                {formatDateBR(item.originDate)}
                                            </td>

                                            {/* Data Vencimento */}
                                            <td className="px-4 py-3 text-center font-mono">
                                                <span className={`px-2 py-0.5 rounded font-semibold ${
                                                    isOverdue ? 'bg-rose-100 text-rose-800 font-bold' : 'text-slate-800'
                                                }`}>
                                                    {formatDateBR(item.dueDate)}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(item)}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                                        item.status === 'completed'
                                                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                            : isOverdue
                                                            ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                                    }`}
                                                    title="Clique para alternar entre Quitado e Pendente"
                                                >
                                                    {item.status === 'completed' ? (
                                                        <>
                                                            <CheckCircle2 size={11} />
                                                            <span>{isPayable ? 'PAGO' : 'RECEBIDO'}</span>
                                                        </>
                                                    ) : isOverdue ? (
                                                        <>
                                                            <AlertCircle size={11} />
                                                            <span>ATRASADO</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock size={11} />
                                                            <span>PENDENTE</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>

                                            {/* Ações: Alterar / Excluir */}
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenModal(item)}
                                                        className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                                                        title="Alterar lançamento"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                                        title="Excluir lançamento"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL PARA INCLUIR / ALTERAR LANÇAMENTO */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
                        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm">
                                    <Scale size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-wider">
                                        {editingItem ? 'Alterar Lançamento Financeiro' : 'Novo Lançamento (Incluir)'}
                                    </h4>
                                    <p className="text-[11px] text-slate-300">
                                        Controle rigoroso de obrigações e recebíveis
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveItem} className="p-6 space-y-4">
                            {/* Tipo: A Pagar vs A Receber */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Tipo de Lançamento *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'payable' })}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                                            formData.type === 'payable' 
                                                ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs' 
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <ArrowDownCircle size={16} />
                                        <span>Conta a Pagar (Fornecedor)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'receivable' })}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                                            formData.type === 'receivable' 
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs' 
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <ArrowUpCircle size={16} />
                                        <span>Conta a Receber (Cliente)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Fornecedor / Cliente */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    {formData.type === 'payable' ? 'Fornecedor *' : 'Cliente *'}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.entityName}
                                    onChange={e => setFormData({ ...formData, entityName: e.target.value })}
                                    placeholder={formData.type === 'payable' ? 'Ex: Prysmian, Tigre, CEMIG...' : 'Ex: Construtora Horizonte, João Silva...'}
                                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            {/* Descrição */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Descrição do Lançamento *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Ex: Aquisição de condutores 2.5mm²..."
                                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            {/* Grid: Documento - NF, Número de Parcelas, Valor */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Documento – NF *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.documentNumber}
                                        onChange={e => setFormData({ ...formData, documentNumber: e.target.value })}
                                        placeholder="Ex: NF-e 048.912"
                                        className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Nº de Parcelas *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.installment}
                                        onChange={e => setFormData({ ...formData, installment: e.target.value })}
                                        placeholder="Ex: 1/3 ou 1/1"
                                        className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Valor (R$) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="Ex: 3450,00"
                                        className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            {/* Grid: Data Origem – Data Vencimento */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Data Origem (Emissão) *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.originDate}
                                        onChange={e => setFormData({ ...formData, originDate: e.target.value })}
                                        className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Data Vencimento *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            {/* Status e Categoria */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Status Atual
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        <option value="pending">Pendente</option>
                                        <option value="completed">{formData.type === 'payable' ? 'Pago (Quitado)' : 'Recebido (Quitado)'}</option>
                                        <option value="cancelled">Cancelado</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Categoria Contábil
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="Ex: Mercadorias, Energia, Aluguel..."
                                        className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            {/* Botões do Rodapé */}
                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
                                >
                                    <Save size={15} />
                                    <span>{editingItem ? 'Salvar Alterações' : 'Gravar Lançamento'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
