import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Plus, CheckCircle, Clock, Search, Trash2, Edit2, X, Check, AlertTriangle, Calendar, Scale, FileText } from 'lucide-react';
import { subscribeToCollection, createDocument, updateDocument, deleteDocument } from '../../services/firebaseService';
import { FinancialTransaction } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { FinancialBillsAndCashflowManager } from './FinancialBillsAndCashflowManager';

const INITIAL_TRANSACTION: Partial<FinancialTransaction> = {
    description: '',
    amount: 0,
    type: 'income',
    category: 'Venda de Produtos',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'paid',
};

export const FinanceManager: React.FC = () => {
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
    const [formData, setFormData] = useState<Partial<FinancialTransaction>>(INITIAL_TRANSACTION);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<'bills_and_cashflow' | 'quick_ledger'>('bills_and_cashflow');

    useEffect(() => {
        const unsubscribe = subscribeToCollection('finance', (data) => {
            setTransactions(data as FinancialTransaction[]);
        }, 'dueDate');
        return () => unsubscribe();
    }, []);

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4000);
    };

    const handleOpenCreate = () => {
        setEditingTransaction(null);
        setFormData(INITIAL_TRANSACTION);
        setIsAdding(true);
    };

    const handleOpenEdit = (t: FinancialTransaction) => {
        setEditingTransaction(t);
        setFormData({
            ...t,
            amount: Number(t.amount || 0)
        });
        setIsAdding(true);
    };

    const handleCloseForm = () => {
        setIsAdding(false);
        setEditingTransaction(null);
        setFormData(INITIAL_TRANSACTION);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.description?.trim()) {
            showFeedback('error', 'A descrição do lançamento é obrigatória.');
            return;
        }

        const amount = Number(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            showFeedback('error', 'Informe um valor financeiro válido maior que zero.');
            return;
        }

        setIsSaving(true);
        try {
            const payload: Partial<FinancialTransaction> = {
                description: formData.description.trim(),
                amount: amount,
                type: formData.type || 'income',
                category: formData.category || 'Geral',
                dueDate: formData.dueDate || new Date().toISOString().split('T')[0],
                status: formData.status || 'paid',
            };

            if (editingTransaction?.id) {
                await updateDocument('finance', editingTransaction.id, payload);
                showFeedback('success', `Lançamento "${payload.description}" atualizado com sucesso!`);
            } else {
                await createDocument('finance', payload);
                showFeedback('success', `Lançamento "${payload.description}" registrado com sucesso!`);
            }

            handleCloseForm();
        } catch (err: any) {
            console.error('Erro ao salvar transação:', err);
            showFeedback('error', `Falha ao registrar transação: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async (t: FinancialTransaction) => {
        try {
            const newStatus = t.status === 'paid' ? 'pending' : 'paid';
            await updateDocument('finance', t.id, { status: newStatus });
            showFeedback('success', `Status de "${t.description}" alterado para ${newStatus === 'paid' ? 'Liquidado' : 'Pendente'}.`);
        } catch (err: any) {
            showFeedback('error', `Erro ao atualizar status: ${err.message}`);
        }
    };

    const handleDelete = async (id: string, desc: string) => {
        try {
            await deleteDocument('finance', id);
            setDeleteConfirmId(null);
            showFeedback('success', `Lançamento "${desc}" removido com sucesso.`);
        } catch (err: any) {
            showFeedback('error', `Erro ao excluir: ${err.message}`);
        }
    };

    // Cálculos
    const totalIncome = transactions
        .filter(t => t.type === 'income' && t.status === 'paid')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense' && t.status === 'paid')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const balance = totalIncome - totalExpense;

    const pendingPayables = transactions
        .filter(t => t.type === 'expense' && t.status === 'pending')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (t.category || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            {/* Cabeçalho */}
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-brand-dark flex items-center gap-3">
                        <DollarSign className="text-brand-primary" size={32} />
                        Gestão Financeira & DRE
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Controle de contas a pagar, contas a receber, fluxo de caixa e lucros.
                    </p>
                </div>
                <button 
                    onClick={handleOpenCreate}
                    className="bg-brand-primary hover:bg-brand-dark text-white px-6 py-3.5 rounded-2xl flex items-center justify-center space-x-2 font-bold shadow-lg transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span>Lançar Transação</span>
                </button>
            </header>

            {/* Navegador de Sub-módulos Financeiros */}
            <div className="flex flex-wrap items-center gap-2 mb-8 bg-gray-100 p-1.5 rounded-2xl">
                <button
                    type="button"
                    onClick={() => setActiveSection('bills_and_cashflow')}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                        activeSection === 'bills_and_cashflow'
                            ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <Scale size={16} />
                    <span>Contas a Pagar, Receber & Fluxo de Caixa (Gestor)</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveSection('quick_ledger')}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                        activeSection === 'quick_ledger'
                            ? 'bg-white text-brand-dark shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <FileText size={16} />
                    <span>Lançamentos Rápidos / DRE Geral</span>
                </button>
            </div>

            {activeSection === 'bills_and_cashflow' ? (
                <FinancialBillsAndCashflowManager />
            ) : (
                <>
            {/* Banner de Feedback */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mb-6 p-4 rounded-2xl flex items-center justify-between border ${
                            feedback.type === 'success' 
                                ? 'bg-green-50 text-green-800 border-green-200' 
                                : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            {feedback.type === 'success' ? <Check size={20} className="text-green-600" /> : <AlertTriangle size={20} className="text-red-600" />}
                            <span className="font-medium text-sm">{feedback.message}</span>
                        </div>
                        <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cards de Métricas Financeiras */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center text-green-600 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Entradas Realizadas</span>
                        <ArrowUpRight size={24} className="bg-green-50 p-1 rounded-xl" />
                    </div>
                    <div className="text-2xl font-bold font-serif text-brand-dark">R$ {totalIncome.toFixed(2)}</div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center text-red-600 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Saídas Realizadas</span>
                        <ArrowDownLeft size={24} className="bg-red-50 p-1 rounded-xl" />
                    </div>
                    <div className="text-2xl font-bold font-serif text-brand-dark">R$ {totalExpense.toFixed(2)}</div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center text-brand-primary mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Saldo em Caixa</span>
                        <DollarSign size={24} className="bg-brand-light p-1 rounded-xl" />
                    </div>
                    <div className={`text-2xl font-bold font-serif ${balance >= 0 ? 'text-brand-dark' : 'text-red-600'}`}>
                        R$ {balance.toFixed(2)}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center text-amber-600 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Contas a Pagar (Pendente)</span>
                        <Clock size={24} className="bg-amber-50 p-1 rounded-xl" />
                    </div>
                    <div className="text-2xl font-bold font-serif text-amber-700">R$ {pendingPayables.toFixed(2)}</div>
                </div>
            </div>

            {/* Modal / Formulário de Lançamento */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        className="mb-10 bg-white p-8 rounded-3xl shadow-2xl border border-brand-primary/20"
                    >
                        <div className="flex justify-between items-center pb-6 border-b border-gray-100 mb-6">
                            <div>
                                <h3 className="text-2xl font-bold font-serif text-brand-dark">
                                    {editingTransaction ? 'Editar Lançamento Financeiro' : 'Lançar Nova Movimentação Financeira'}
                                </h3>
                                <p className="text-sm text-gray-500">Registre receitas, custos de mercadoria, despesas operacionais ou impostos.</p>
                            </div>
                            <button onClick={handleCloseForm} className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-gray-100">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Movimentação *</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'income' })}
                                            className={`p-3.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 border transition-all ${
                                                formData.type === 'income' 
                                                    ? 'bg-green-600 text-white border-green-600 shadow-md' 
                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <ArrowUpRight size={18} />
                                            <span>Receita (+)</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'expense' })}
                                            className={`p-3.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 border transition-all ${
                                                formData.type === 'expense' 
                                                    ? 'bg-red-600 text-white border-red-600 shadow-md' 
                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <ArrowDownLeft size={18} />
                                            <span>Despesa (-)</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Valor do Lançamento (R$) *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">R$</span>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none font-bold text-lg"
                                            placeholder="0.00"
                                            value={formData.amount ?? ''}
                                            onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Status de Pagamento</label>
                                    <select 
                                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none font-medium"
                                        value={formData.status || 'paid'}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="paid">Liquidado / Pago (Efetivado)</option>
                                        <option value="pending">Pendente (A Pagar / A Receber)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Descrição da Operação *</label>
                                    <input 
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none"
                                        placeholder="Ex: Aquisição de Lote de Poltronas - NF-e 4920"
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Categoria</label>
                                    <input 
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none"
                                        placeholder="Ex: Estoque, Impostos, Vendas, Frete..."
                                        value={formData.category || ''}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Data de Competência / Vencimento</label>
                                    <input 
                                        type="date"
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                        value={formData.dueDate || ''}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                                <button type="button" onClick={handleCloseForm} className="px-6 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200">
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="px-10 py-3.5 bg-brand-primary text-white rounded-2xl font-bold shadow-xl hover:bg-brand-dark disabled:opacity-50 flex items-center space-x-2"
                                >
                                    <Check size={18} />
                                    <span>{isSaving ? 'Salvando...' : (editingTransaction ? 'Atualizar Lançamento' : 'Confirmar Lançamento')}</span>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filtros e Busca */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar lançamentos por descrição ou categoria..." 
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                filterType === 'all' ? 'bg-brand-dark text-white' : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFilterType('income')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                filterType === 'income' ? 'bg-green-600 text-white' : 'bg-white text-green-700 border border-gray-200'
                            }`}
                        >
                            Receitas (+)
                        </button>
                        <button
                            onClick={() => setFilterType('expense')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                filterType === 'expense' ? 'bg-red-600 text-white' : 'bg-white text-red-700 border border-gray-200'
                            }`}
                        >
                            Despesas (-)
                        </button>
                    </div>
                </div>

                {/* Tabela de Lançamentos */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-400 uppercase text-[11px] font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Descrição da Operação</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4">Data Venc./Efet.</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Valor</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            {t.type === 'income' ? (
                                                <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                                                    <ArrowUpRight size={18} />
                                                </div>
                                            ) : (
                                                <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                                                    <ArrowDownLeft size={18} />
                                                </div>
                                            )}
                                            <span className="font-bold text-gray-900">{t.description}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                                            {t.category || 'Geral'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-xs font-mono">
                                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(t)}
                                            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all hover:opacity-80 ${
                                                t.status === 'paid' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}
                                            title="Clique para alternar o status"
                                        >
                                            {t.status === 'paid' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                            <span>{t.status === 'paid' ? 'Liquidado' : 'Pendente'}</span>
                                        </button>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold font-serif ${
                                        t.type === 'income' ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                        {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount || 0).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center space-x-2">
                                            <button 
                                                onClick={() => handleOpenEdit(t)}
                                                className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-light rounded-xl transition-colors"
                                                title="Editar Lançamento"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            {deleteConfirmId === t.id ? (
                                                <div className="flex items-center space-x-1 bg-red-50 p-1 rounded-xl">
                                                    <button 
                                                        onClick={() => handleDelete(t.id, t.description)}
                                                        className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-lg"
                                                    >
                                                        Confirmar
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
                                                    onClick={() => setDeleteConfirmId(t.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                    title="Excluir Lançamento"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-gray-400">
                                        <DollarSign size={48} className="mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">Nenhuma transação encontrada.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            </>
            )}
        </div>
    );
};
