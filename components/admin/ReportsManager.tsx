import React, { useState, useEffect } from 'react';
import { FileText, Printer, Download, TrendingUp, AlertCircle, Calendar, Briefcase, Package, Users, Database } from 'lucide-react';
import { subscribeToCollection } from '../../services/firebaseService';
import { Sale, Product, FinancialTransaction, Service } from '../../types';
import { BackupRestoreManager } from './BackupRestoreManager';

export const ReportsManager: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [activeReport, setActiveReport] = useState<'sales' | 'inventory' | 'financial' | 'services' | 'backup'>('sales');


    useEffect(() => {
        const unsubSales = subscribeToCollection('sales', (data) => setSales(data as Sale[]), 'createdAt');
        const unsubProducts = subscribeToCollection('products', (data) => setProducts(data as Product[]), 'name');
        const unsubFin = subscribeToCollection('finance', (data) => setTransactions(data as FinancialTransaction[]), 'dueDate');
        const unsubServ = subscribeToCollection('services', (data) => setServices(data as Service[]), 'name');
        return () => { 
            unsubSales(); 
            unsubProducts(); 
            unfin(); 
            unsubServ(); 
        };
        function unfin() { unsubFin(); }
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const totalSalesValue = sales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const lowStockItems = products.filter(p => (p.stock || 0) <= (p.minStock || 3));

    const totalRevenue = transactions
        .filter(t => t.type === 'income' && t.status === 'paid')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense' && t.status === 'paid')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const netResult = totalRevenue - totalExpenses;

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 print:hidden">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-brand-dark">Centro de Inteligência & Relatórios Gerenciais</h2>
                    <p className="text-gray-500 mt-1">Gere relatórios executivos, DRE, status de estoque e auditoria de vendas.</p>
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={handlePrint}
                        className="flex items-center space-x-2 px-6 py-3 bg-brand-dark text-white rounded-2xl font-bold shadow-lg hover:bg-black transition-all active:scale-95"
                    >
                        <Printer size={18} />
                        <span>Imprimir Relatório</span>
                    </button>
                </div>
            </header>

            {/* Menu de Relatórios */}
            <nav className="flex space-x-3 mb-8 print:hidden overflow-x-auto pb-2">
                {[
                    { id: 'sales', label: 'Vendas & Receita', icon: TrendingUp },
                    { id: 'inventory', label: 'Estoque & NFs', icon: AlertCircle },
                    { id: 'financial', label: 'Fluxo Financeiro & DRE', icon: Calendar },
                    { id: 'services', label: 'Catálogo de Serviços', icon: Briefcase },
                    { id: 'backup', label: 'Backup & Restauração', icon: Database },
                ].map((tab) => (

                    <button
                        key={tab.id}
                        onClick={() => setActiveReport(tab.id as any)}
                        className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl font-bold transition-all whitespace-nowrap ${
                            activeReport === tab.id 
                            ? 'bg-brand-primary text-white shadow-lg scale-105' 
                            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        <tab.icon size={18} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>

            {/* Área de Impressão / Conteúdo */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
                <div className="hidden print:block mb-8 border-b-2 border-brand-dark pb-6">
                    <h1 className="text-2xl font-bold uppercase tracking-widest text-brand-dark">Ponto Chave do Lar - Relatório Executivo</h1>
                    <p className="text-sm text-gray-500">Documento gerado em: {new Date().toLocaleString('pt-BR')}</p>
                </div>

                {activeReport === 'sales' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                                <p className="text-xs font-bold text-green-700 uppercase mb-1">Faturamento em Vendas</p>
                                <p className="text-3xl font-serif font-bold text-green-900">R$ {totalSalesValue.toFixed(2)}</p>
                            </div>
                            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                <p className="text-xs font-bold text-blue-700 uppercase mb-1">Total de Pedidos / Vendas</p>
                                <p className="text-3xl font-serif font-bold text-blue-900">{sales.length}</p>
                            </div>
                            <div className="p-6 bg-brand-light rounded-2xl border border-brand-primary/10">
                                <p className="text-xs font-bold text-brand-primary uppercase mb-1">Ticket Médio</p>
                                <p className="text-3xl font-serif font-bold text-brand-dark">
                                    R$ {(sales.length ? totalSalesValue / sales.length : 0).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold font-serif border-b pb-4 text-brand-dark">Histórico Detalhado de Vendas</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 uppercase text-[10px] font-bold tracking-widest text-gray-400">
                                    <tr>
                                        <th className="p-4">Data / Hora</th>
                                        <th className="p-4">Cliente</th>
                                        <th className="p-4">Canal</th>
                                        <th className="p-4">Pagamento</th>
                                        <th className="p-4 text-right">Valor Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {sales.map((sale) => (
                                        <tr key={sale.id}>
                                            <td className="p-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                                                {sale.createdAt ? new Date(sale.createdAt).toLocaleString('pt-BR') : '—'}
                                            </td>
                                            <td className="p-4 font-bold text-gray-900">{sale.customerName || 'Consumidor Final'}</td>
                                            <td className="p-4 uppercase text-xs font-semibold text-gray-500">{sale.type || 'pos'}</td>
                                            <td className="p-4 uppercase text-xs font-bold text-brand-primary">{sale.paymentMethod}</td>
                                            <td className="p-4 text-right font-bold text-brand-dark">R$ {Number(sale.total || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {sales.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-12 text-gray-400">
                                                Nenhuma venda registrada até o momento.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeReport === 'inventory' && (
                    <div className="space-y-8">
                        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-center space-x-4">
                            <AlertCircle className="text-amber-600" size={32} />
                            <div>
                                <h4 className="font-bold text-amber-900">Alerta de Reposição de Estoque</h4>
                                <p className="text-sm text-amber-700">
                                    {lowStockItems.length} produtos estão abaixo ou no limite crítico de estoque.
                                </p>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold font-serif border-b pb-4 text-brand-dark">Inventário Físico & Notas Fiscais</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 uppercase text-[10px] font-bold tracking-widest text-gray-400">
                                    <tr>
                                        <th className="p-4">Produto</th>
                                        <th className="p-4">NF Aquisição</th>
                                        <th className="p-4">Qtd. Estoque</th>
                                        <th className="p-4">Preço Custo</th>
                                        <th className="p-4 text-right">Preço Venda</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {products.map((p) => {
                                        const isLow = (p.stock || 0) <= (p.minStock || 3);
                                        return (
                                            <tr key={p.id} className={isLow ? 'bg-amber-50/50' : ''}>
                                                <td className="p-4">
                                                    <div className="font-bold text-gray-900">{p.name}</div>
                                                    <div className="text-[11px] text-gray-400">{p.category}</div>
                                                </td>
                                                <td className="p-4 text-gray-500 font-mono text-xs">{p.invoiceNumber || 'N/A'}</td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                    }`}>
                                                        {p.stock || 0} un
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-500">R$ {Number(p.costPrice || 0).toFixed(2)}</td>
                                                <td className="p-4 text-right font-bold text-brand-dark">R$ {Number(p.price || 0).toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeReport === 'financial' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                                <p className="text-xs font-bold text-green-700 uppercase mb-1">Receitas Realizadas</p>
                                <p className="text-3xl font-serif font-bold text-green-900">R$ {totalRevenue.toFixed(2)}</p>
                            </div>
                            <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                                <p className="text-xs font-bold text-red-700 uppercase mb-1">Despesas Realizadas</p>
                                <p className="text-3xl font-serif font-bold text-red-900">R$ {totalExpenses.toFixed(2)}</p>
                            </div>
                            <div className="p-6 bg-brand-light rounded-2xl border border-brand-primary/10">
                                <p className="text-xs font-bold text-brand-primary uppercase mb-1">Resultado Líquido</p>
                                <p className={`text-3xl font-serif font-bold ${netResult >= 0 ? 'text-brand-dark' : 'text-red-600'}`}>
                                    R$ {netResult.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold font-serif border-b pb-4 text-brand-dark">Demonstrativo de Movimentações</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 uppercase text-[10px] font-bold tracking-widest text-gray-400">
                                    <tr>
                                        <th className="p-4">Descrição</th>
                                        <th className="p-4">Categoria</th>
                                        <th className="p-4">Data</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {transactions.map((t) => (
                                        <tr key={t.id}>
                                            <td className="p-4 font-bold text-gray-900">{t.description}</td>
                                            <td className="p-4 text-xs text-gray-500">{t.category}</td>
                                            <td className="p-4 text-xs text-gray-500 font-mono">
                                                {t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : '—'}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    t.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {t.status === 'paid' ? 'Liquidado' : 'Pendente'}
                                                </span>
                                            </td>
                                            <td className={`p-4 text-right font-bold ${
                                                t.type === 'income' ? 'text-green-700' : 'text-red-700'
                                            }`}>
                                                {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeReport === 'services' && (
                    <div className="space-y-8">
                        <h3 className="text-xl font-bold font-serif border-b pb-4 text-brand-dark">Catálogo de Serviços Disponíveis</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 uppercase text-[10px] font-bold tracking-widest text-gray-400">
                                    <tr>
                                        <th className="p-4">Serviço</th>
                                        <th className="p-4">Categoria</th>
                                        <th className="p-4">Duração</th>
                                        <th className="p-4 text-right">Preço</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {services.map((s) => (
                                        <tr key={s.id}>
                                            <td className="p-4 font-bold text-gray-900">{s.name}</td>
                                            <td className="p-4 text-gray-600">{s.category}</td>
                                            <td className="p-4 text-gray-500">{s.duration || 'Sob consulta'}</td>
                                            <td className="p-4 text-right font-bold text-brand-primary">R$ {Number(s.price || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeReport === 'backup' && (
                    <div className="space-y-6">
                        <BackupRestoreManager />
                    </div>
                )}
            </div>
        </div>
    );
};

