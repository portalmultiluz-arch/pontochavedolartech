import React, { useState } from 'react';
import { 
    Ship, 
    Plane, 
    FileCheck, 
    Scale, 
    DollarSign, 
    Globe, 
    Building2, 
    AlertTriangle, 
    CheckCircle2, 
    Calculator, 
    HelpCircle, 
    Info, 
    ShieldCheck, 
    BookOpen, 
    Download, 
    Printer, 
    ExternalLink, 
    FileText, 
    Layers, 
    ArrowRight, 
    Search, 
    Receipt, 
    CheckSquare,
    Clock,
    AlertCircle,
    UserCheck,
    Truck,
    BadgeCheck,
    Coins,
    ChevronDown,
    ChevronUp,
    Package,
    MailCheck,
    Send,
    Tag,
    ShoppingBag,
    Percent
} from 'lucide-react';

export const ImportRulesTechnicalManual: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // ==========================================
    // 1. SIMULADOR CORREIOS / COURIER AÉREO PJ (RTS)
    // ==========================================
    const [simPostalProductBRL, setSimPostalProductBRL] = useState<number>(5000); // R$ 5.000
    const [simPostalFreightBRL, setSimPostalFreightBRL] = useState<number>(800); // Frete aéreo postal
    const [simPostalIcmsPercent, setSimPostalIcmsPercent] = useState<number>(18); // ICMS %
    const [simPostalFeeBRL, setSimPostalFeeBRL] = useState<number>(250); // Despacho postal PJ

    // Cálculos Correios Simplificado (RTS)
    const postalAduaneiroBRL = simPostalProductBRL + simPostalFreightBRL;
    const postalIiBRL = postalAduaneiroBRL * 0.60; // 60% Imposto de Importação Simplificado
    // Cálculo ICMS por dentro: (Base + II) / (1 - ICMS%) * ICMS%
    const postalIcmsBaseBRL = (postalAduaneiroBRL + postalIiBRL) / (1 - (simPostalIcmsPercent / 100));
    const postalIcmsBRL = postalIcmsBaseBRL * (simPostalIcmsPercent / 100);
    const postalTributosTotaisBRL = postalIiBRL + postalIcmsBRL + simPostalFeeBRL;
    const postalCustoTotalFinalBRL = postalAduaneiroBRL + postalTributosTotaisBRL;
    const postalFatorMultiplicador = simPostalProductBRL > 0 ? (postalCustoTotalFinalBRL / simPostalProductBRL) : 1;

    // ==========================================
    // 2. SIMULADOR MARÍTIMO LCL COMPARTILHADO
    // ==========================================
    const [simFobUSD, setSimFobUSD] = useState<number>(5000); // US$ 5.000 (~ R$ 28.500)
    const [simFreightUSD, setSimFreightUSD] = useState<number>(450); // Frete LCL CBM
    const [simInsuranceUSD, setSimInsuranceUSD] = useState<number>(50); // Seguro
    const [simExchangeRate, setSimExchangeRate] = useState<number>(5.72); // Câmbio PTAX
    const [simIiPercent, setSimIiPercent] = useState<number>(14); // Alíquota II %
    const [simIpiPercent, setSimIpiPercent] = useState<number>(6.5); // Alíquota IPI %
    const [simPisPercent, setSimPisPercent] = useState<number>(2.1); // PIS Importação %
    const [simCofinsPercent, setSimCofinsPercent] = useState<number>(9.65); // COFINS Importação %
    const [simIcmsPercent, setSimIcmsPercent] = useState<number>(18); // ICMS Estadual %
    const [simCustomsBrokerBRL, setSimCustomsBrokerBRL] = useState<number>(1200); // Despachante BRL
    const [simPortStorageBRL, setSimPortStorageBRL] = useState<number>(1800); // Armazenagem + THC BRL
    const [simSiscomexFeeBRL, setSimSiscomexFeeBRL] = useState<number>(150); // Taxa Siscomex BRL

    // Cálculos Marítimo Formal
    const cifUSD = simFobUSD + simFreightUSD + simInsuranceUSD;
    const valorAduaneiroBRL = cifUSD * simExchangeRate; // V.A. (BRL)
    const impostoImportacaoBRL = valorAduaneiroBRL * (simIiPercent / 100);
    const ipiBaseBRL = valorAduaneiroBRL + impostoImportacaoBRL;
    const ipiBRL = ipiBaseBRL * (simIpiPercent / 100);
    const pisBRL = valorAduaneiroBRL * (simPisPercent / 100);
    const cofinsBRL = valorAduaneiroBRL * (simCofinsPercent / 100);
    
    // Cálculo ICMS por dentro: (V.A. + II + IPI + PIS + COFINS + Taxa Siscomex + Despesas) / (1 - ICMS%) * ICMS%
    const baseSemIcms = valorAduaneiroBRL + impostoImportacaoBRL + ipiBRL + pisBRL + cofinsBRL + simSiscomexFeeBRL;
    const icmsBaseBRL = baseSemIcms / (1 - (simIcmsPercent / 100));
    const icmsBRL = icmsBaseBRL * (simIcmsPercent / 100);

    const totalTributosBRL = impostoImportacaoBRL + ipiBRL + pisBRL + cofinsBRL + icmsBRL + simSiscomexFeeBRL;
    const totalDespesasOperacionaisBRL = simCustomsBrokerBRL + simPortStorageBRL;
    const custoTotalNacionalizadoBRL = valorAduaneiroBRL + totalTributosBRL + totalDespesasOperacionaisBRL;
    const fatorMultiplicador = valorAduaneiroBRL > 0 ? (custoTotalNacionalizadoBRL / valorAduaneiroBRL) : 1;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8 font-sans">
            {/* CABEÇALHO TIMBRADO DO MANUAL TÉCNICO */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-3 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-amber-400" />
                                MT-IMP-001 • REVISÃO 2.0
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
                                Conformidade com a Legislação RFB, Siscomex & Correios
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                            Manual Técnico Exclusivo • Regras & Procedimentos Legais de Importação
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            Guia definitivo de conformidade jurídica, tributária, cambial e operacional para importação empresarial de produtos no CNPJ da empresa, desmistificando pisos de valores mínimos, operando por Correios Importa Fácil / Courier PJ (lotes de teste) e por contêiner compartilhado LCL com emissão regular de Nota Fiscal de Entrada.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handlePrint}
                            className="px-5 py-3 bg-brand-primary hover:bg-brand-secondary text-brand-dark rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center gap-2"
                        >
                            <Printer size={16} />
                            <span>Imprimir Manual Técnico</span>
                        </button>
                    </div>
                </div>

                {/* Metadados Técnicos */}
                <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-4">
                        <span>Autoridade: <strong>Comitê de Comércio Exterior & Gestão Fiscal</strong></span>
                        <span className="hidden sm:inline">•</span>
                        <span>Destinatários: <strong>Diretoria, Gestores, Contabilidade e Compras</strong></span>
                    </div>
                    <div className="text-emerald-400 font-sans font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        Documento Registrado no Sistema ERP
                    </div>
                </div>
            </div>

            {/* BARRA DE FILTRO E PESQUISA RÁPIDA */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setSelectedSection('all')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            selectedSection === 'all' 
                                ? 'bg-brand-dark text-white shadow-sm' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Todas as Seções
                    </button>
                    <button
                        onClick={() => setSelectedSection('correios')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            selectedSection === 'correios' 
                                ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold'
                        }`}
                    >
                        ⭐ Correios Importa Fácil (Testes R$ 5k)
                    </button>
                    <button
                        onClick={() => setSelectedSection('legal')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            selectedSection === 'legal' 
                                ? 'bg-brand-dark text-white shadow-sm' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        1. Legislação & Não-Piso
                    </button>
                    <button
                        onClick={() => setSelectedSection('vias')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            selectedSection === 'vias' 
                                ? 'bg-brand-dark text-white shadow-sm' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        2. Vias de Importação
                    </button>
                    <button
                        onClick={() => setSelectedSection('fluxo')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            selectedSection === 'fluxo' 
                                ? 'bg-brand-dark text-white shadow-sm' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        3. Fluxo em 7 Passos
                    </button>
                    <button
                        onClick={() => setSelectedSection('simulador')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            selectedSection === 'simulador' 
                                ? 'bg-brand-dark text-white shadow-sm' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        4. Calculadoras de Custo
                    </button>
                    <button
                        onClick={() => setSelectedSection('mercado')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            selectedSection === 'mercado' 
                                ? 'bg-brand-dark text-white shadow-sm' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        5. Assessorias & Riscos
                    </button>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Pesquisar termo no manual..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>
            </div>

            {/* SEÇÃO DESTACADA: IMPORTAÇÃO VIA CORREIOS / COURIER PJ PARA LOTES DE TESTE (R$ 5.000) */}
            {(selectedSection === 'all' || selectedSection === 'correios') && (
                <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-50/50 p-6 sm:p-10 rounded-3xl border-2 border-amber-300 shadow-md space-y-8 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-200/80 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-sm">
                                <Package size={26} />
                            </div>
                            <div>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md inline-block mb-1">
                                    Módulo Especial • Estratégia Recomendada para 1º Lote de Teste
                                </span>
                                <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                                    Importação via Correios (Importa Fácil / EMS / China Post) & Courier PJ
                                </h3>
                            </div>
                        </div>
                        <span className="px-3.5 py-1.5 bg-amber-400/30 text-amber-950 border border-amber-400/50 rounded-full text-xs font-black flex items-center gap-1.5">
                            <Clock size={14} className="text-amber-700" />
                            Prazo: 7 a 15 Dias Corridos
                        </span>
                    </div>

                    {/* Por que esta é a melhor via para o momento atual */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-2">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                                <DollarSign size={18} />
                            </div>
                            <h4 className="font-bold text-sm text-gray-900">Zero Custos Fixos Portuários</h4>
                            <p className="text-gray-600 leading-relaxed">
                                No contêiner marítimo, taxas de porto, armazenagem mínima e despachante custam de R$ 3.500 a R$ 5.000 fixos. Nos Correios, <strong>não há taxa de porto nem honorários de despachante avulso</strong>.
                            </p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-2">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                                <Clock size={18} />
                            </div>
                            <h4 className="font-bold text-sm text-gray-900">Velocidade no Giro de Caixa</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Em vez de esperar de 45 a 70 dias do navio, o aéreo chega em <strong>7 a 15 dias</strong>. Você testa fornecedor, qualidade, velocidade de venda e recupera o capital rapidamente.
                            </p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-2">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                                <FileCheck size={18} />
                            </div>
                            <h4 className="font-bold text-sm text-gray-900">100% Legalizado com NF-e</h4>
                            <p className="text-gray-600 leading-relaxed">
                                A importação gera a <strong>DSI (Declaração Simplificada de Importação)</strong> vinculada ao seu CNPJ, permitindo a emissão normal da <strong>Nota Fiscal de Entrada</strong> para venda regular.
                            </p>
                        </div>
                    </div>

                    {/* ROTEIRO PRÁTICO: COMO COMPRAR NO ALIBABA E PEDIR O ENVIO POSTAL */}
                    <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <Send size={18} className="text-amber-600" />
                            <h4 className="font-bold text-base text-gray-900">
                                Como Comprar no Alibaba e Instruir o Fornecedor Chinês (Passo a Passo)
                            </h4>
                        </div>

                        <div className="space-y-4 text-xs text-gray-700">
                            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                                <div className="flex items-center justify-between text-amber-400 font-bold">
                                    <span>Texto Pronto para Enviar no Chat do Alibaba (Inglês):</span>
                                    <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-gray-300">Copiar & Colar</span>
                                </div>
                                <code className="block text-xs font-mono text-emerald-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                                    "Please quote the shipping via EMS (China Post Express) or Postal Air Parcel to Brazil. The shipment is for a Brazilian Company (B2B commercial import), so the Commercial Invoice and parcel label MUST contain our Company Name and Brazilian Tax ID (CNPJ)."
                                </code>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-1.5">
                                    <strong className="text-amber-950 font-bold block">1. Dados Obrigatórios na Caixa</strong>
                                    <p className="text-gray-600">
                                        Exija que o fornecedor coloque na etiqueta externa da caixa: <strong>Razão Social, CNPJ completo da sua empresa, Endereço fiscal e NCM (HS Code)</strong>.
                                    </p>
                                </div>

                                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-1.5">
                                    <strong className="text-amber-950 font-bold block">2. Portal "Minhas Importações"</strong>
                                    <p className="text-gray-600">
                                        Ao receber o código de rastreio (ex: <code>EE123456789CN</code>), entre no portal dos Correios e vincule o código diretamente ao seu <strong>CNPJ</strong>.
                                    </p>
                                </div>

                                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-1.5">
                                    <strong className="text-amber-950 font-bold block">3. Pagamento e Emissão da NF-e</strong>
                                    <p className="text-gray-600">
                                        Pague os tributos (II + ICMS + taxa postal) no ambiente dos Correios via boleto/PIX. Baixe o comprovante da DSI e emita a NF-e de Entrada no sistema.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MEMÓRIA DE CÁLCULO REAL: LOTE DE R$ 5.000 (FATOR MULTIPLICADOR 2,34x) */}
                    <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                            <div>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                                    Memória de Cálculo Financeiro & Tributário
                                </span>
                                <h4 className="text-lg sm:text-xl font-bold text-white mt-1">
                                    Exemplo Real: Lote Piloto de R$ 5.000,00 de Mercadorias (Alibaba / Correios)
                                </h4>
                            </div>
                            <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold font-mono">
                                Fator Multiplicador Final: {postalFatorMultiplicador.toFixed(2)}x
                            </div>
                        </div>

                        {/* Comparativo de Desembolso em 2 Momentos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* MOMENTO 1 */}
                            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                                        Momento 1: Pago na China (Alibaba)
                                    </span>
                                    <span className="text-sm font-mono font-black text-white">
                                        R$ {postalAduaneiroBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="space-y-1.5 text-xs text-slate-300">
                                    <div className="flex justify-between">
                                        <span>Mercadorias FOB (Produtos):</span>
                                        <span className="font-mono text-white">R$ {simPostalProductBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Frete Aéreo Internacional (EMS/Postal):</span>
                                        <span className="font-mono text-white">R$ {simPostalFreightBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* MOMENTO 2 */}
                            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                        Momento 2: Pago no Brasil (Alfândega / Correios)
                                    </span>
                                    <span className="text-sm font-mono font-black text-white">
                                        R$ {postalTributosTotaisBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="space-y-1.5 text-xs text-slate-300">
                                    <div className="flex justify-between">
                                        <span>Imposto de Importação (60% da RFB):</span>
                                        <span className="font-mono text-white">R$ {postalIiBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>ICMS Estadual ("por dentro" {simPostalIcmsPercent}%):</span>
                                        <span className="font-mono text-white">R$ {postalIcmsBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Taxa de Despacho Postal dos Correios PJ:</span>
                                        <span className="font-mono text-white">R$ {simPostalFeeBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-400">
                                        <span>Armazenagem de Porto & Despachante Avulso:</span>
                                        <span className="font-mono font-bold">R$ 0,00 (Incluso)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TOTAL GERAL E REGRA DE MARGEM DE REVENDA */}
                        <div className="p-6 bg-gradient-to-r from-amber-500/20 via-emerald-500/10 to-indigo-500/20 rounded-2xl border border-amber-400/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <span className="text-xs font-bold uppercase text-amber-300">
                                    Custo Total Nacionalizado Final no Estoque da Loja
                                </span>
                                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                                    R$ {postalCustoTotalFinalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                <p className="text-xs text-slate-300">
                                    Uma peça comprada por <strong>R$ 50,00</strong> na China entra no estoque custando exatamente <strong>R$ {(50 * postalFatorMultiplicador).toFixed(2)}</strong>.
                                </p>
                            </div>

                            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 text-xs space-y-1 max-w-sm">
                                <span className="font-bold text-amber-400 block flex items-center gap-1.5">
                                    <Tag size={14} />
                                    Regra de Ouro para Revenda:
                                </span>
                                <p className="text-slate-300 leading-relaxed">
                                    Para o teste ser lucrativo, venda a peça no Brasil por <strong>3x a 4x o custo em dólar</strong> (ex: comprada por R$ 50, revendida por R$ 199 a R$ 249). Margem bruta líquida de mais de R$ 80 a R$ 130 por unidade!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SEÇÃO 1: FUNDAMENTAÇÃO JURÍDICA E DESMISTIFICAÇÃO DO PISO DE VALOR MÍNIMO */}
            {(selectedSection === 'all' || selectedSection === 'legal') && (
                <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg">
                            <Scale size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 block">
                                Seção 1 • Princípios do Regulamento Aduaneiro
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Fundamentação Jurídica: Inexistência de Valor Mínimo para Importação no CNPJ
                            </h3>
                        </div>
                    </div>

                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
                        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3">
                            <CheckCircle2 size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                            <div className="text-xs text-emerald-950 space-y-1">
                                <strong className="text-emerald-900 block text-sm font-bold">
                                    Norma Legal Expressa (Decreto Federal nº 6.759/2009 - Regulamento Aduaneiro & IN RFB nº 1.984/2020)
                                </strong>
                                <p>
                                    A legislação brasileira, a Receita Federal do Brasil (RFB) e o Banco Central do Brasil (BACEN) <strong>NÃO exigem nenhum valor monetário mínimo</strong> (seja R$ 30 mil, R$ 50 mil ou US$ 10 mil) para que uma pessoa jurídica devidamente constituída realize importações comerciais formais.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-2">
                                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                    <AlertTriangle size={16} className="text-amber-600" />
                                    Por que algumas empresas exigem pisos de R$ 50.000?
                                </h4>
                                <p className="text-gray-600">
                                    Exigências de R$ 50k ou US$ 10k são <strong>políticas comerciais privadas</strong> de determinadas tradings e consultorias com o intuito de maximizar suas próprias margens e comissões por volume de carga. Não representam qualquer imposição governamental ou aduaneira.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-2">
                                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-emerald-600" />
                                    Autonomia Operacional do Importador
                                </h4>
                                <p className="text-gray-600">
                                    A empresa tem total amparo legal para importar lotes de <strong>R$ 5 mil, R$ 10 mil, R$ 20 mil ou R$ 30 mil</strong>, contratando um despachante aduaneiro autônomo e agentes de carga independentes com cobrança exclusiva por serviço prestado.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SEÇÃO 2: AS VIAS DE IMPORTAÇÃO EMPRESARIAL NO BRASIL */}
            {(selectedSection === 'all' || selectedSection === 'vias') && (
                <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg">
                            <Layers size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 block">
                                Seção 2 • Modalidades Oficiais de Envio
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                As 2 Vias Legais para Importar Valores Menores no CNPJ
                            </h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* VIA A: COURIER / IMPORTA FÁCIL */}
                        <div className="p-6 rounded-3xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-white space-y-4 relative overflow-hidden">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                                        <Plane size={20} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-indigo-700 px-2 py-0.5 bg-indigo-100 rounded-md">
                                            Aéreo Rápido
                                        </span>
                                        <h4 className="text-base font-extrabold text-gray-900 mt-1">
                                            Via 1: Courier Aéreo / Importa Fácil dos Correios
                                        </h4>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-indigo-900 bg-indigo-100 px-3 py-1 rounded-full">
                                    Até US$ 3.000 / remessa
                                </span>
                            </div>

                            <p className="text-xs text-gray-600 leading-relaxed">
                                Regime de Tributação Simplificada (RTS) regulamentado para pessoas jurídicas. A própria transportadora internacional (DHL Express, FedEx, UPS ou Correios) atua como despachante aduaneiro habilitado.
                            </p>

                            <div className="space-y-2 text-xs text-gray-700 bg-white p-4 rounded-2xl border border-indigo-50">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                                    <span><strong>Desembaraço Automático:</strong> Registro de DSI (Declaração Simplificada de Importação) sem necessidade de procuração a despachante.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                                    <span><strong>Prazo de Entrega:</strong> Entre 7 a 15 dias corridos da fábrica chinesa até a porta da loja.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                                    <span><strong>Emissão de NF-e:</strong> Emitida normalmente com base no Comprovante da DSI e guias de DARF/GNR recolhidas.</span>
                                </div>
                            </div>
                        </div>

                        {/* VIA B: MARÍTIMO LCL COMPARTILHADO */}
                        <div className="p-6 rounded-3xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-white to-white space-y-4 relative overflow-hidden">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                                        <Ship size={20} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-emerald-700 px-2 py-0.5 bg-emerald-100 rounded-md">
                                            Marítimo Econômico
                                        </span>
                                        <h4 className="text-base font-extrabold text-gray-900 mt-1">
                                            Via 2: Marítimo Formal LCL (Contêiner Compartilhado)
                                        </h4>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full">
                                    Sem Limite Mínimo
                                </span>
                            </div>

                            <p className="text-xs text-gray-600 leading-relaxed">
                                Indicado para volumes maiores em peso/cubagem (CBM). Você aluga apenas o espaço cúbico que suas caixas ocupam dentro de um contêiner marítimo de 20 ou 40 pés.
                            </p>

                            <div className="space-y-2 text-xs text-gray-700 bg-white p-4 rounded-2xl border border-emerald-50">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                                    <span><strong>Habilitação do RADAR:</strong> Requer RADAR Expresso (100% gratuito e liberado via Portal Único Siscomex).</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                                    <span><strong>Despachante Autônomo:</strong> Contratação de despachante registrado com taxa fixa por processo (R$ 800 - R$ 1.500).</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                                    <span><strong>Frete por CBM:</strong> Custo de frete marítimo diluído (média US$ 80 a US$ 250 por metro cúbico dependendo do porto).</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SEÇÃO 3: O FLUXO OPERACIONAL EM 7 PASSOS HOMOLOGADOS */}
            {(selectedSection === 'all' || selectedSection === 'fluxo') && (
                <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 block">
                                Seção 3 • Roteiro Passo a Passo
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Fluxo Operacional de Importação Empresarial em 7 Etapas
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* PASSO 1 */}
                        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-indigo-300 transition-all flex flex-col sm:flex-row items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                1
                            </div>
                            <div className="space-y-1.5 flex-1 text-xs">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-gray-900">Habilitação do RADAR Siscomex (Gratuita)</h4>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-bold text-[10px]">Custo: R$ 0,00</span>
                                </div>
                                <p className="text-gray-600">
                                    Acesse o Portal Único Siscomex (<code>portalunico.siscomex.gov.br</code>) utilizando o Certificado Digital <strong>e-CNPJ</strong> da empresa e solicite a habilitação no <strong>RADAR Expresso</strong> (limite de até US$ 50.000 semestrais). A liberação é imediata e automática.
                                </p>
                            </div>
                        </div>

                        {/* PASSO 2 */}
                        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-indigo-300 transition-all flex flex-col sm:flex-row items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                2
                            </div>
                            <div className="space-y-1.5 flex-1 text-xs">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-gray-900">Estudo de Classificação Fiscal (NCM) & Licenciamento</h4>
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">Auditoria Prévia</span>
                                </div>
                                <p className="text-gray-600">
                                    Antes de transferir dinheiro para a China, envie a ficha técnica do produto ao Despachante Aduaneiro ou contador para fixar o <strong>código NCM</strong> de 8 dígitos. Verifique se o produto exige Licença de Importação (L.I.) ou homologação compulsória de órgãos anuentes (INMETRO, ANATEL, MAPA, ANVISA).
                                </p>
                            </div>
                        </div>

                        {/* PASSO 3 */}
                        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-indigo-300 transition-all flex flex-col sm:flex-row items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                3
                            </div>
                            <div className="space-y-1.5 flex-1 text-xs">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-gray-900">Negociação Formal com o Fabricante (Proforma Invoice + Packing List)</h4>
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">Documentação de Origem</span>
                                </div>
                                <p className="text-gray-600">
                                    Exija que o fornecedor emita a <strong>Proforma Invoice</strong> e o <strong>Packing List</strong> exclusivamente em nome do seu CNPJ, Razão Social e endereço fiscal completo, contendo NCM, descrição minuciosa dos itens em inglês, valor unitário em USD, peso líquido/bruto e cubagem (CBM).
                                </p>
                            </div>
                        </div>

                        {/* PASSO 4 */}
                        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-indigo-300 transition-all flex flex-col sm:flex-row items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                4
                            </div>
                            <div className="space-y-1.5 flex-1 text-xs">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-gray-900">Fechamento de Câmbio Formal PJ (BACEN / Siscomex)</h4>
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">Obrigatório Legal</span>
                                </div>
                                <p className="text-gray-600">
                                    <strong>Atenção:</strong> Jamais pague mercadorias para revenda via cartão de crédito pessoal ou doleiros. O pagamento deve ser feito por <strong>Contrato de Câmbio PJ</strong> via banco comercial (Inter PJ, Remessa Online PJ, Travelex, Itaú, etc.) vinculado à Proforma Invoice.
                                </p>
                            </div>
                        </div>

                        {/* PASSO 5 */}
                        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-indigo-300 transition-all flex flex-col sm:flex-row items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                5
                            </div>
                            <div className="space-y-1.5 flex-1 text-xs">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-gray-900">Embarque Internacional & Emissão do Conhecimento de Transporte</h4>
                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[10px]">BL / AWB</span>
                                </div>
                                <p className="text-gray-600">
                                    A carga é consolidada no armazém do agente de carga (Ningbo, Shenzhen, Yiwu, etc.) e embarcada. É emitido o <strong>Bill of Lading (B/L)</strong> marítimo ou <strong>Air Waybill (AWB)</strong> aéreo, com o CNPJ da empresa figurando como <em>Consignee</em> (destinatário legal).
                                </p>
                            </div>
                        </div>

                        {/* PASSO 6 */}
                        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-indigo-300 transition-all flex flex-col sm:flex-row items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                6
                            </div>
                            <div className="space-y-1.5 flex-1 text-xs">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-gray-900">Registro da DUIMP/DI & Desembaraço Aduaneiro na Alfândega</h4>
                                    <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded font-bold text-[10px]">Recolhimento de Tributos</span>
                                </div>
                                <p className="text-gray-600">
                                    Ao atracar no porto/aeroporto brasileiro, o despachante registra a <strong>Declaração Única de Importação (DUIMP/DI)</strong>. Os tributos (II, IPI, PIS, COFINS, Taxa Siscomex e ICMS) são debitados na conta corrente bancária da sua empresa. Após parametrização no Canal Verde, é emitido o <strong>Comprovante de Importação (C.I.)</strong>.
                                </p>
                            </div>
                        </div>

                        {/* PASSO 7 */}
                        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 hover:border-emerald-400 transition-all flex flex-col sm:flex-row items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                7
                            </div>
                            <div className="space-y-1.5 flex-1 text-xs">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-emerald-950 font-extrabold">Emissão da NF-e de Entrada & Internalização no Estoque</h4>
                                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-bold text-[10px]">CFOP 3.101 / 3.102</span>
                                </div>
                                <p className="text-emerald-900">
                                    Com o Comprovante de Importação (C.I.) em mãos, a empresa emite a <strong>Nota Fiscal Eletrônica de Entrada (CFOP 3.101/3.102)</strong> somando o valor dos produtos convertidos pelo dólar PTAX da data de registro + frete + seguro + todos os impostos recolhidos. Os itens entram formalmente no inventário contábil e no PDV da loja para venda aos clientes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SEÇÃO 4: SIMULADOR DE TRIBUTOS E PLANILHA DE CUSTO NACIONALIZADO (LANDED COST) */}
            {(selectedSection === 'all' || selectedSection === 'simulador') && (
                <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
                                <Calculator size={24} />
                            </div>
                            <div>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 block">
                                    Seção 4 • Ferramenta Interativa de Precisão
                                </span>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    Simulador Oficial de Tributos & Custo Nacionalizado (Landed Cost) - Marítimo LCL
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Formulário de Parâmetros do Lote */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-200 text-xs">
                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Valor dos Produtos FOB (USD)</label>
                            <input 
                                type="number" 
                                value={simFobUSD} 
                                onChange={(e) => setSimFobUSD(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Frete Internacional LCL (USD)</label>
                            <input 
                                type="number" 
                                value={simFreightUSD} 
                                onChange={(e) => setSimFreightUSD(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Cotação Dólar PTAX (R$)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={simExchangeRate} 
                                onChange={(e) => setSimExchangeRate(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Alíquota II - Imp. Importação (%)</label>
                            <input 
                                type="number" 
                                step="0.5"
                                value={simIiPercent} 
                                onChange={(e) => setSimIiPercent(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Alíquota IPI (%)</label>
                            <input 
                                type="number" 
                                step="0.5"
                                value={simIpiPercent} 
                                onChange={(e) => setSimIpiPercent(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">PIS (2,1%) + COFINS (9,65%)</label>
                            <div className="px-3 py-2 bg-gray-200 border border-gray-300 rounded-xl font-bold text-gray-700">
                                11,75% (Alíquota Padrão)
                            </div>
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Alíquota ICMS Estado (%)</label>
                            <input 
                                type="number" 
                                step="0.5"
                                value={simIcmsPercent} 
                                onChange={(e) => setSimIcmsPercent(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Despachante Aduaneiro (R$)</label>
                            <input 
                                type="number" 
                                value={simCustomsBrokerBRL} 
                                onChange={(e) => setSimCustomsBrokerBRL(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Resumo da Memória de Cálculo Tributário */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                            <span className="text-[10px] font-bold uppercase text-gray-500">Valor Aduaneiro CIF (Base)</span>
                            <div className="text-lg font-black text-gray-900 font-mono">
                                R$ {valorAduaneiroBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-[10px] text-gray-500">US$ {cifUSD.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} x R$ {simExchangeRate.toFixed(2)}</p>
                        </div>

                        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1">
                            <span className="text-[10px] font-bold uppercase text-amber-800">Total de Tributos Federais & Estaduais</span>
                            <div className="text-lg font-black text-amber-900 font-mono">
                                R$ {totalTributosBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-[10px] text-amber-700">II + IPI + PIS + COFINS + ICMS + Siscomex</p>
                        </div>

                        <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-1">
                            <span className="text-[10px] font-bold uppercase text-blue-800">Despesas Portuárias & Despachante</span>
                            <div className="text-lg font-black text-blue-900 font-mono">
                                R$ {totalDespesasOperacionaisBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-[10px] text-blue-700">Armazenagem LCL + THC + Honorários</p>
                        </div>

                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-1">
                            <span className="text-[10px] font-bold uppercase text-emerald-800">Custo Total Nacionalizado (Landed Cost)</span>
                            <div className="text-xl font-black text-emerald-700 font-mono">
                                R$ {custoTotalNacionalizadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-[10px] text-emerald-800 font-bold">Fator Multiplicador: {fatorMultiplicador.toFixed(2)}x sobre o CIF</p>
                        </div>
                    </div>
                </div>
            )}

            {/* SEÇÃO 5: ANÁLISE DE MERCADO, QUEIXAS NO RECLAME AQUI E ALTERNATIVAS SEGURAS */}
            {(selectedSection === 'all' || selectedSection === 'mercado') && (
                <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-lg">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 block">
                                Seção 5 • Inteligência de Mercado & Gestão de Riscos
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Diagnóstico Crítico: Assessorias Massificadas vs. Tradings Tradicionais
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
                        <div className="p-5 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3">
                            <h4 className="font-bold text-sm text-rose-900 flex items-center gap-2">
                                <AlertCircle size={16} className="text-rose-700" />
                                Mapeamento de Queixas Comuns em Modelos de Assinatura (Ex: China Gate / Importação Digital)
                            </h4>
                            <p className="text-rose-950">
                                As reclamações registradas no Reclame Aqui evidenciam riscos operacionais que devem ser evitados pela governança da empresa:
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-rose-900 list-disc list-inside">
                                <li><strong>Cobrança Prévia de Anuidade:</strong> Pagamento antecipado de R$ 3.000 a R$ 6.000 antes mesmo de confirmar se o produto possui viabilidade.</li>
                                <li><strong>Gargalo de Lotação do Contêiner:</strong> Retenção de caixas no armazém da China por semanas aguardando outros alunos/clientes completarem o contêiner.</li>
                                <li><strong>Custos Ocultos de Armazenagem:</strong> Cobranças imprevistas de demurrage e armazenagem extraordinária nos portos nacionais.</li>
                                <li><strong>Atendimento Impessoal:</strong> Suporte por chamados lentos em momentos críticos de conferência física aduaneira.</li>
                            </ul>
                        </div>

                        {/* MATRIZ COMPARATIVA DE MODELOS */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border border-gray-200 rounded-2xl overflow-hidden">
                                <thead className="bg-gray-100 font-bold text-gray-700">
                                    <tr>
                                        <th className="p-3 border-b">Critério de Avaliação</th>
                                        <th className="p-3 border-b text-rose-800">Modelo Massificado / Assinatura</th>
                                        <th className="p-3 border-b text-emerald-800 bg-emerald-50">Modelo Recomendado: Trading / Despachante Autônomo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <tr>
                                        <td className="p-3 font-bold">Taxa de Adesão / Anuidade</td>
                                        <td className="p-3 text-rose-700 font-semibold">Exige pagamento prévio (R$ 3k - R$ 6k)</td>
                                        <td className="p-3 text-emerald-700 font-bold bg-emerald-50/50">R$ 0,00 (Cobrança estritamente por processo executado)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold">Autonomia de Embarque</td>
                                        <td className="p-3 text-gray-600">Depende do fechamento do contêiner do grupo</td>
                                        <td className="p-3 text-emerald-700 font-bold bg-emerald-50/50">Imediata (Embarque em navios regulares semanais via NVOCC)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold">Atendimento Aduaneiro</td>
                                        <td className="p-3 text-gray-600">Plataforma web e suporte por tickets</td>
                                        <td className="p-3 text-emerald-700 font-bold bg-emerald-50/50">Despachante aduaneiro dedicado com canal direto</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold">Controle Tributário</td>
                                        <td className="p-3 text-gray-600">Intermediado</td>
                                        <td className="p-3 text-emerald-700 font-bold bg-emerald-50/50">Débito direto e transparente na conta da empresa via Siscomex</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* SEÇÃO 6: CHECKLIST DE AUDITORIA PRÉ-EMBARQUE & PREVENÇÃO DE MULTAS */}
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
                        <CheckSquare size={24} />
                    </div>
                    <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 block">
                            Seção 6 • Checklist Oficial de Compliance
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                            Checklist Obrigatório Pré-Pagamento e Pré-Embarque
                        </h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5">
                        <span className="font-bold text-sm text-gray-900 block border-b border-gray-200 pb-1">
                            1. Verificações Documentais na Origem (China)
                        </span>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Razão Social & CNPJ:</strong> Constar com exatidão na Proforma Invoice e Packing List.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Descrição em Inglês:</strong> Sem abreviações genéricas (ex: "Led lamp with aluminum frame, 12W, 110-220V").</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Marcação de Caixas (*Shipping Marks*):</strong> Cada caixa deve conter etiqueta visível com nome do importador e número de ordem.</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5">
                        <span className="font-bold text-sm text-gray-900 block border-b border-gray-200 pb-1">
                            2. Verificações Aduaneiras no Destino (Brasil)
                        </span>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Validação da NCM pelo Despachante:</strong> Evita multa de 1% sobre o valor aduaneiro por enquadramento incorreto.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Contrato de Câmbio Registrado:</strong> Vinculação bancária no BACEN antes da chegada do navio.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Saldo em Conta Vinculada:</strong> Garantir saldo bancário para débito automático dos DARFs no momento do registro da DUIMP.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
