import React, { useState } from 'react';
import { 
    BookOpen, 
    FileText, 
    Printer, 
    ShieldCheck, 
    CheckCircle2, 
    Server, 
    Database, 
    Users, 
    ShoppingCart, 
    RotateCcw, 
    Clock, 
    DollarSign, 
    Download, 
    HelpCircle,
    ChevronRight,
    Search,
    Ship,
    Globe,
    Smartphone
} from 'lucide-react';
import { ImportRulesTechnicalManual } from './ImportRulesTechnicalManual';
import { ResponsiveDesignCompatibilityManual } from './ResponsiveDesignCompatibilityManual';

export const SystemDocumentationManager: React.FC = () => {
    const [activeDoc, setActiveDoc] = useState<'colaboradores' | 'tecnico' | 'importacao' | 'responsividade'>('colaboradores');
    const [searchTerm, setSearchTerm] = useState('');

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans space-y-8">
            {/* Cabeçalho do Módulo de Documentação */}
            <div className="bg-gradient-to-r from-brand-dark to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/20 text-brand-primary rounded-full text-xs font-bold mb-3 border border-brand-primary/30">
                        <ShieldCheck size={14} />
                        <span>Acesso Restrito • Documentação Oficial Homologada</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                        Manuais de Operação & Documentação Técnica
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        Procedimentos Operacionais Padrão (POP), especificações técnicas da arquitetura do sistema, manual de responsividade/dispositivos e Manual Técnico Exclusivo com regras para importação no CNPJ.
                    </p>
                </div>

                <div className="relative z-10 flex flex-wrap gap-3">
                    <button
                        onClick={handlePrint}
                        className="px-5 py-3 bg-brand-primary hover:bg-brand-secondary text-brand-dark rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center gap-2"
                        title="Imprimir documento selecionado em formato timbrado"
                    >
                        <Printer size={16} />
                        <span>Imprimir / Gerar PDF</span>
                    </button>
                </div>
            </div>

            {/* Abas de Navegação entre os 4 Documentos */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex flex-wrap bg-gray-100 p-1.5 rounded-2xl gap-1">
                    <button
                        onClick={() => setActiveDoc('colaboradores')}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                            activeDoc === 'colaboradores'
                                ? 'bg-white text-brand-dark shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Users size={16} />
                        <span>1. Manual Operacional dos Colaboradores (POP)</span>
                    </button>

                    <button
                        onClick={() => setActiveDoc('tecnico')}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                            activeDoc === 'tecnico'
                                ? 'bg-white text-brand-dark shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Server size={16} />
                        <span>2. Documentação Técnica & Arquitetura</span>
                    </button>

                    <button
                        onClick={() => setActiveDoc('responsividade')}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                            activeDoc === 'responsividade'
                                ? 'bg-cyan-950 text-white shadow-md'
                                : 'text-cyan-950 hover:bg-cyan-50 font-bold'
                        }`}
                    >
                        <Smartphone size={16} className={activeDoc === 'responsividade' ? 'text-cyan-400' : 'text-cyan-700'} />
                        <span>3. Manual de Responsividade & Dispositivos (DOC-RESP-001)</span>
                    </button>

                    <button
                        onClick={() => setActiveDoc('importacao')}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                            activeDoc === 'importacao'
                                ? 'bg-indigo-950 text-white shadow-md'
                                : 'text-indigo-900 hover:bg-indigo-50 font-bold'
                        }`}
                    >
                        <Ship size={16} className={activeDoc === 'importacao' ? 'text-amber-400' : 'text-indigo-600'} />
                        <span>4. Manual Técnico • Regras de Importação</span>
                    </button>
                </div>

                <div className="relative w-full lg:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Filtrar tópicos e regras..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>
            </div>

            {/* ÁREA DE LEITURA DO DOCUMENTO */}
            <div className="bg-white p-6 sm:p-12 rounded-3xl border border-gray-100 shadow-sm space-y-8 print:shadow-none print:border-none print:p-0">

                {/* ========================================================================= */}
                {/* DOCUMENTO 1: MANUAL DOS COLABORADORES (POP) */}
                {/* ========================================================================= */}
                {activeDoc === 'colaboradores' && (
                    <div className="space-y-8">
                        <div className="border-b border-gray-200 pb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-mono text-brand-primary font-bold uppercase tracking-wider">
                                        POP-PC-001 • REVISÃO 2.0
                                    </span>
                                    <h3 className="text-2xl font-serif font-bold text-brand-dark mt-1">
                                        Manual de Procedimentos Operacionais Padrão (POP)
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Destinado a: Operadores de Caixa, Atendentes de Balcão, Vendedores Técnicos e Gerência.
                                    </p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-full uppercase">
                                        Vigência Ativa
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Módulo 1: Vendas PDV */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-dark text-white rounded-xl flex items-center justify-center font-bold text-sm">
                                    1
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-brand-dark">Rotina de Vendas no Caixa Balcão (PDV)</h4>
                                    <p className="text-xs text-gray-500">Fluxo obrigatório para saída de mercadorias e recebimentos.</p>
                                </div>
                            </div>

                            <ul className="space-y-2.5 text-xs text-gray-700 leading-relaxed ml-2 sm:ml-12">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Inclusão dos Produtos:</strong> Busque o item por nome, categoria ou código no catálogo ao lado e clique para adicionar ao carrinho do caixa.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Identificação do Solicitante:</strong> Selecione o cliente cadastrado ou digite o nome no campo livre para emissão do comprovante personalizado.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Forma de Pagamento:</strong> Selecione entre PIX, Cartão de Crédito, Débito ou Dinheiro.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Fechamento:</strong> Clique em <em>"Finalizar Venda (PDV)"</em>. O sistema dará baixa automática no estoque, lançará a receita no caixa e exibirá o cupom.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Módulo 2: Orçamentos */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                                    2
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-brand-dark">Emissão e Conversão de Orçamentos Comerciais</h4>
                                    <p className="text-xs text-gray-500">Propostas formais com prazo de validade sem impacto no estoque imediato.</p>
                                </div>
                            </div>

                            <ul className="space-y-2.5 text-xs text-gray-700 leading-relaxed ml-2 sm:ml-12">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Gerar Proposta:</strong> Com os produtos no carrinho, clique no botão amarelo <em>"Gerar Orçamento PDF"</em>.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Prazo e Descontos:</strong> Defina o prazo de validade (ex: 10 dias) e, caso autorizado, o percentual de desconto comercial.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Conversão no Retorno do Cliente:</strong> Quando o cliente aprovar o orçamento, acesse a aba <em>"Orçamentos Salvos"</em> e clique em <em>"Lançar no PDV"</em> para fechar a venda de forma rápida.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Módulo 3: RMA & Trocas */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                                    3
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-brand-dark">Trocas, Devoluções e Avarias de Mercadorias (RMA)</h4>
                                    <p className="text-xs text-gray-500">Tratamento de produtos quebrados, garantias e devoluções.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-2 sm:ml-12 text-xs">
                                <div className="p-4 bg-white rounded-xl border border-gray-200">
                                    <span className="font-bold text-red-700 block mb-1">Avaria / Sucata</span>
                                    <p className="text-gray-600">Para lâmpadas queimadas ou peças quebradas. Dá baixa imediata do item e lança perda contábil.</p>
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-gray-200">
                                    <span className="font-bold text-blue-700 block mb-1">Devolução de Cliente</span>
                                    <p className="text-gray-600">Produto intacto em perfeitas condições. Retorna ao estoque vendável e gera estorno no caixa.</p>
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-gray-200">
                                    <span className="font-bold text-amber-700 block mb-1">Garantia Fornecedor</span>
                                    <p className="text-gray-600">Fica em quarentena até o fabricante enviar a peça de reposição para reentrada no estoque.</p>
                                </div>
                            </div>
                        </div>

                        {/* Módulo 4: Encerramento do Dia */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-700 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                                    4
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-brand-dark">Fechamento do Caixa & Backup Diário</h4>
                                    <p className="text-xs text-gray-500">Rotina de fim de expediente para proteção e conferência financeira.</p>
                                </div>
                            </div>

                            <ul className="space-y-2.5 text-xs text-gray-700 leading-relaxed ml-2 sm:ml-12">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Conferência do DRE:</strong> Acesse <em>Relatórios Inteligentes</em> para bater o total em dinheiro, PIX e cartões do dia.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Backup de Segurança:</strong> Acesse a aba <em>Backup & Restauração</em> e clique em <em>"Baixar Backup Completo Agora"</em> para salvar o arquivo diário no computador da loja.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Módulo 5: Banco de Imagens & Multiplataforma (Sem Burocracia) */}
                        <div className="bg-blue-50/70 p-6 rounded-2xl border border-blue-200 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                                    5
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-brand-dark">Banco de Imagens & Links Rápidos (Zero Burocracia)</h4>
                                    <p className="text-xs text-gray-500">Fluxo ágil de fotos otimizadas para Estoque, Mercado Livre, Shopee e WhatsApp.</p>
                                </div>
                            </div>

                            <ul className="space-y-2.5 text-xs text-gray-700 leading-relaxed ml-2 sm:ml-12">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                                    <span><strong>Upload Direto do Celular/PC:</strong> Na aba <em>"Banco de Imagens & Mídias"</em>, clique em <em>"Subir Foto"</em>. O sistema comprime e otimiza automaticamente para WebP leve sem estourar a cota.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                                    <span><strong>Inserção em 1-Clique no Estoque:</strong> Ao cadastrar ou editar um produto, clique no botão <em>"Abrir Banco de Imagens"</em> e selecione a foto desejada sem digitar links.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                                    <span><strong>Compartilhamento Multiplataforma:</strong> Clique em <em>"Copiar Link Direto"</em> para colar a foto imediatamente no Mercado Livre, Bling, Tiny, WhatsApp ou catálogo de fornecedores.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Módulo 6: CRM, Remarketing e Gestão de Consentimento */}
                        <div className="bg-purple-50/70 p-6 rounded-2xl border border-purple-200 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-700 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                                    6
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-brand-dark">CRM Comercial, Remarketing & Consentimento de Publicações</h4>
                                    <p className="text-xs text-gray-500">Campos estratégicos para fidelização de clientes, parcerias com fornecedores e conformidade LGPD.</p>
                                </div>
                            </div>

                            <ul className="space-y-2.5 text-xs text-gray-700 leading-relaxed ml-2 sm:ml-12">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-purple-600 shrink-0 mt-0.5" />
                                    <span><strong>Data do Cadastro & Situação (Ativado/Desativado):</strong> Acompanhe a data exata de entrada e alterne o status em 1 clique para pausar contatos inativos sem perder o histórico.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-purple-600 shrink-0 mt-0.5" />
                                    <span><strong>Última Compra / Último Fornecimento:</strong> Registro da data e do valor da última transação para criar réguas de reengajamento e campanhas com clientes inativos.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-purple-600 shrink-0 mt-0.5" />
                                    <span><strong>Autorização de Nossas Publicações (Remarketing / LGPD):</strong> Controle explícito de consentimento para envio de novos lançamentos, ofertas e novidades por WhatsApp e E-mail.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Módulo 7: Governança por Competências, Níveis do Menu & Proteção Antifraude */}
                        <div className="bg-indigo-50/80 p-6 rounded-2xl border border-indigo-200 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-700 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                                    7
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-brand-dark">Hierarquia de Menus em 4 Níveis & Controle de Acessos Restritos (RBAC)</h4>
                                    <p className="text-xs text-gray-500">Diretriz de governança, proteção mútua (colaborador/empresa) e alçadas de decisão.</p>
                                </div>
                            </div>

                            <div className="ml-2 sm:ml-12 space-y-4 text-xs text-gray-700 leading-relaxed">
                                <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-2xs space-y-2">
                                    <h5 className="font-bold text-indigo-900 flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-indigo-600" />
                                        Princípio da Proteção Mútua e Menor Privilégio
                                    </h5>
                                    <p className="text-gray-600">
                                        A restrição de acessos no sistema <strong>não é desconfiança</strong>, e sim uma salvaguarda jurídica e operacional. O colaborador que não possui acesso a contas a pagar, preços de compra de fornecedores ou exclusão de registros fica <strong>isento e blindado contra falsas suspeitas</strong> em eventuais divergências contábeis.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                                        <span className="font-bold text-emerald-800 block mb-1">Nível 1 • Operação & Frente de Loja</span>
                                        <p className="text-[11px] text-gray-600">Dashboard Geral, Caixa PDV, Clientes/CRM e Trocas/Avarias (RMA). Foco em atendimento ágil ao consumidor e finalização de vendas.</p>
                                    </div>
                                    <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                                        <span className="font-bold text-amber-800 block mb-1">Nível 2 • Estoque & Suprimentos</span>
                                        <p className="text-[11px] text-gray-600">Estoque & Fichas Técnicas, Catálogo de Serviços e Fornecedores/Entradas. Foco em contagem física, especificações e recebimento de NFs.</p>
                                    </div>
                                    <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                                        <span className="font-bold text-blue-800 block mb-1">Nível 3 • Comercial & Marketing</span>
                                        <p className="text-[11px] text-gray-600">Capa do Site (Hero), Consultoria Técnica IA, Banco de Mídias e Marketing/SEO. Gestão da vitrine digital e geração de laudos técnicos.</p>
                                    </div>
                                    <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                                        <span className="font-bold text-purple-800 block mb-1">Nível 4 • Controladoria & Governança</span>
                                        <p className="text-[11px] text-gray-600">Financeiro & DRE, Relatórios, Colaboradores & RBAC, Manuais POP e Backup. Restrito à Diretoria e Gestão Executiva.</p>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-1">
                                    <h5 className="font-bold text-gray-900">Alçadas de Desconto e Travas Especiais:</h5>
                                    <ul className="space-y-1.5 list-disc list-inside text-gray-600">
                                        <li><strong>Frente de Caixa:</strong> Desconto máximo de 5% no balcão. Descontos superiores exigem aprovação gerencial.</li>
                                        <li><strong>Sigilo de Custos:</strong> Operadores de balcão visualizam apenas o Preço de Venda ao Consumidor; os valores de custo de fábrica permanecem ocultos.</li>
                                        <li><strong>Exclusão de Registros:</strong> É proibido deletar transações de venda ou cadastros; correções são feitas via estorno rastreado no RMA ou conciliação.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Módulo 8: Checkout Virtual, Formas de Pagamento & Baixa Automática de Estoque */}
                        <div className="bg-emerald-50/70 p-6 rounded-2xl border border-emerald-200 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-700 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                                    8
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-brand-dark">Checkout da Loja Virtual, Formas de Pagamento & Baixa de Estoque</h4>
                                    <p className="text-xs text-gray-500">Fluxo de compra do cliente final, confirmação com QR Code Pix, Boleto, Cartões e conciliação.</p>
                                </div>
                            </div>

                            <ul className="space-y-2.5 text-xs text-gray-700 leading-relaxed ml-2 sm:ml-12">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Pagamento Instantâneo via PIX:</strong> Aplicação automática de 5% de desconto promocional no total. O sistema gera o QR Code dinâmico e o código Pix Copia e Cola para pagamento imediato no app do banco.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Cartões de Crédito (Todas as Bandeiras):</strong> Detecção automática em tempo real de Visa, Mastercard, Elo, Hipercard, American Express e Diners Club, com cálculo de parcelamento em até 12x.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Boleto Bancário:</strong> Emissão da linha digitável de 47 dígitos com botão de cópia e impressão direta do boleto para pagamento em lotéricas ou internet banking.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Baixa Automática no Almoxarifado:</strong> Cada pedido finalizado deduz em tempo real as quantidades dos itens no estoque e gera um registro auditável na coleção <code>stock_movements</code>.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Página de Recibo e Suporte WhatsApp:</strong> O cliente recebe o resumo completo do pedido, dados de envio e botão de direcionamento direto para o canal de atendimento oficial no WhatsApp.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Módulo 9: Marketing Digital, Pixels de Conversão & SEO Orgânico */}
                        <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-200 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                                    9
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-brand-dark">Configuração de Pixels (Meta, GA4, GTM, TikTok) & SEO Orgânico</h4>
                                    <p className="text-xs text-gray-500">Gestão de tráfego pago, remarketing e indexação de produtos no Google.</p>
                                </div>
                            </div>

                            <ul className="space-y-2.5 text-xs text-gray-700 leading-relaxed ml-2 sm:ml-12">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                    <span><strong>Ativação com 1-Clique:</strong> No menu <em>"Marketing, SEO & Tráfego"</em>, insira as IDs de acompanhamento (GTM, GA4, Meta Pixel, TikTok Pixel). O sistema injeta os scripts em runtime de forma segura.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                    <span><strong>Disparo Automático de Eventos de E-commerce:</strong> Rastreamento nativo dos eventos <code>page_view</code>, <code>view_item</code>, <code>add_to_cart</code>, <code>begin_checkout</code> e <code>purchase</code> para campanhas de conversão.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                    <span><strong>SEO Rich Snippets (Schema.org):</strong> O sistema injeta metadados estruturados JSON-LD automaticamente em cada produto para exibição de preço, estoque e avaliações nos resultados do Google.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Módulo 10: Marketplace Carrefour (Mirakl) & Gestão de Feeds */}
                        <div className="bg-sky-50/70 p-6 rounded-2xl border border-sky-200 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-sky-700 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                                    10
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-brand-dark">Integração Marketplace Carrefour (Portal Mirakl) & EAN/GTIN</h4>
                                    <p className="text-xs text-gray-500">Exportação de catálogo em CSV e XML para vendas no e-commerce do Carrefour.</p>
                                </div>
                            </div>

                            <ul className="space-y-2.5 text-xs text-gray-700 leading-relaxed ml-2 sm:ml-12">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-sky-600 shrink-0 mt-0.5" />
                                    <span><strong>Diagnóstico de Catálogo:</strong> Acesse <em>"Carrefour, Cloudflare & Git"</em> para verificar quais itens estão 100% aptos e quais necessitam de código de barras (EAN-13).</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-sky-600 shrink-0 mt-0.5" />
                                    <span><strong>Exportação de Feeds:</strong> Baixe o arquivo <code>carrefour_mirakl_products.csv</code> ou <code>carrefour_mirakl_feed.xml</code> e faça o upload direto no portal Seller Carrefour (Mirakl).</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* DOCUMENTO 2: DOCUMENTAÇÃO TÉCNICA E ARQUITETURA */}
                {/* ========================================================================= */}
                {activeDoc === 'tecnico' && (
                    <div className="space-y-8">
                        <div className="border-b border-gray-200 pb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider">
                                        SYS-TECH-SPEC • VERSÃO 2.0.0
                                    </span>
                                    <h3 className="text-2xl font-serif font-bold text-brand-dark mt-1">
                                        Especificação de Engenharia e Arquitetura do Sistema
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Infraestrutura, Modelo de Dados, Inteligência Artificial e Topologia de Nuvem.
                                    </p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full uppercase">
                                        Enterprise Cloud NoSQL
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Detalhes de Infraestrutura */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                                <h4 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                                    <Database size={16} className="text-brand-primary" />
                                    Banco de Dados Principal
                                </h4>
                                <ul className="text-xs text-gray-600 space-y-2 font-mono">
                                    <li><strong>SGBD:</strong> Google Cloud Firestore (NoSQL Distribuído)</li>
                                    <li><strong>ID do Projeto:</strong> ai-studio-841bfd5e-514d-4422-86f9-2016d76c7153</li>
                                    <li><strong>Replicação:</strong> Multi-zona automática com SLA de 99,999%</li>
                                    <li><strong>Latência Média:</strong> &lt; 45ms</li>
                                </ul>
                            </div>

                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                                <h4 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                                    <Server size={16} className="text-purple-600" />
                                    Camada de Inteligência Artificial
                                </h4>
                                <ul className="text-xs text-gray-600 space-y-2 font-mono">
                                    <li><strong>Modelo:</strong> Google Gemini 2.5 / Flash (@google/genai)</li>
                                    <li><strong>Normas Atendidas:</strong> ABNT NBR 5410 (Instalações) e NBR 5101 (Iluminação)</li>
                                    <li><strong>Cálculo de Iluminância:</strong> Método dos Lúmens / Lux por m²</li>
                                </ul>
                            </div>
                        </div>

                        {/* Topologia de Coleções */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-sm text-brand-dark">Coleções Ativas no Firestore</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left border border-gray-200 rounded-2xl overflow-hidden">
                                    <thead className="bg-gray-100 font-bold text-gray-700">
                                        <tr>
                                            <th className="p-3 border-b">Coleção</th>
                                            <th className="p-3 border-b">Finalidade Operacional</th>
                                            <th className="p-3 border-b">Campos Chave</th>
                                            <th className="p-3 border-b">Integridade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        <tr>
                                            <td className="p-3 font-mono font-bold text-blue-700">products</td>
                                            <td className="p-3">Cadastro de itens, estoque e especificações técnicas</td>
                                            <td className="p-3 font-mono text-[11px]">name, stock, price, voltage, dimensionsSize</td>
                                            <td className="p-3 text-emerald-700 font-bold">Tempo Real</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono font-bold text-blue-700">sales</td>
                                            <td className="p-3">Histórico de vendas realizadas no PDV e faturamento</td>
                                            <td className="p-3 font-mono text-[11px]">items, total, paymentMethod, createdAt</td>
                                            <td className="p-3 text-emerald-700 font-bold">Imutável</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono font-bold text-blue-700">quotes</td>
                                            <td className="p-3">Orçamentos e propostas comerciais</td>
                                            <td className="p-3 font-mono text-[11px]">quoteNumber, validUntil, status, discount</td>
                                            <td className="p-3 text-emerald-700 font-bold">Versionado</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono font-bold text-blue-700">rma_records</td>
                                            <td className="p-3">Trocas, devoluções, garantias e perdas por avaria</td>
                                            <td className="p-3 font-mono text-[11px]">protocolNumber, type, financialImpact</td>
                                            <td className="p-3 text-emerald-700 font-bold">Rastreável</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono font-bold text-blue-700">finance</td>
                                            <td className="p-3">Livro caixa, DRE e controle de receitas/despesas</td>
                                            <td className="p-3 font-mono text-[11px]">description, amount, type, category</td>
                                            <td className="p-3 text-emerald-700 font-bold">Contábil</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono font-bold text-blue-700">media_assets</td>
                                            <td className="p-3">Banco de imagens, links diretos e mídias multiplataforma</td>
                                            <td className="p-3 font-mono text-[11px]">title, category, tags, url, format, fileSizeKb</td>
                                            <td className="p-3 text-emerald-700 font-bold">Otimizado CDN</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono font-bold text-purple-700">collaborators</td>
                                            <td className="p-3">Perfis de equipe, papéis operacionais, alçadas e restrições RBAC</td>
                                            <td className="p-3 font-mono text-[11px]">name, role, email, allowedModules, canViewCostPrice, canGiveDiscountAboveMax</td>
                                            <td className="p-3 text-emerald-700 font-bold">Auditável / RBAC</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono font-bold text-blue-700">orders</td>
                                            <td className="p-3">Pedidos da loja virtual com checkout, frete e dados de pagamento</td>
                                            <td className="p-3 font-mono text-[11px]">orderId, customerInfo, items, subtotal, shipping, discount, total, paymentDetails, status</td>
                                            <td className="p-3 text-emerald-700 font-bold">Imutável / Auditável</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono font-bold text-blue-700">stock_movements</td>
                                            <td className="p-3">Histórico de movimentações de estoque (vendas, entradas, avarias e ajustes)</td>
                                            <td className="p-3 font-mono text-[11px]">productId, type, quantity, previousStock, newStock, orderId, reason</td>
                                            <td className="p-3 text-emerald-700 font-bold">Rastreabilidade Total</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono font-bold text-blue-700">site_marketing_security</td>
                                            <td className="p-3">Parâmetros de tags de conversão (GA4, GTM, Meta, TikTok) e SEO</td>
                                            <td className="p-3 font-mono text-[11px]">googleAnalyticsId, googleAdsTagId, metaPixelId, tiktokPixelId, gtmContainerId</td>
                                            <td className="p-3 text-emerald-700 font-bold">Configuração Dinâmica</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono font-bold text-blue-700">consultancy_requests</td>
                                            <td className="p-3">Submissões de laudos técnicos de engenharia e iluminação com IA</td>
                                            <td className="p-3 font-mono text-[11px]">customerName, projectType, environmentArea, aiReport, orderId</td>
                                            <td className="p-3 text-emerald-700 font-bold">Laudo Técnico ABNT</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Detalhamento Técnico: Checkout, Gateways & SEO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-emerald-950 text-emerald-50 rounded-2xl border border-emerald-800 space-y-3">
                                <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                                    <ShoppingCart size={16} />
                                    Motores de Pagamento & Baixa de Estoque
                                </h4>
                                <ul className="text-xs space-y-2 text-emerald-100/90 leading-relaxed">
                                    <li><strong>PIX Padrão EMV:</strong> Cálculo instantâneo com 5% de desconto automático, payload BRCode e QR Code dinâmico via API nativa.</li>
                                    <li><strong>Cartão de Crédito:</strong> Algoritmo de Luhn para validação de número de cartão e identificação de bandeiras (Visa, Master, Elo, Hiper, Amex, Diners).</li>
                                    <li><strong>Boleto Bancário:</strong> Linha digitável com cálculo de dígitos verificadores padrão Febraban e suporte a impressão.</li>
                                    <li><strong>Baixa Síncrona:</strong> Operação atômica que debita o estoque do produto e grava a movimentação no log de auditoria.</li>
                                </ul>
                            </div>

                            <div className="p-6 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-3">
                                <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                                    <Globe size={16} />
                                    SEO Estruturado & Tags de Conversão
                                </h4>
                                <ul className="text-xs space-y-2 text-slate-300 leading-relaxed">
                                    <li><strong>Schema.org (JSON-LD):</strong> Injeção dinâmica no DOM de <code>Product</code>, <code>Offer</code>, <code>AggregateRating</code> e <code>Brand</code> para rich snippets no Google.</li>
                                    <li><strong>Pixels em Tempo Real:</strong> Injeção assíncrona de scripts Google Tag Manager, Google Analytics 4, Meta Pixel e TikTok Pixel via listener do Firestore.</li>
                                    <li><strong>Arquivos de Indexação:</strong> <code>robots.txt</code> e <code>sitemap.xml</code> estáticos com diretivas amigáveis aos crawlers de busca.</li>
                                    <li><strong>Geocodificação de CEP:</strong> Integração com a API pública do ViaCEP para preenchimento de endereço em &lt; 200ms.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Integração Carrefour Mirakl & CI/CD Cloudflare / GitHub */}
                        <div className="p-6 bg-gradient-to-r from-blue-950 to-indigo-950 text-white rounded-2xl border border-blue-900 space-y-4">
                            <div className="flex items-center gap-3 border-b border-blue-800/80 pb-3">
                                <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl">
                                    <Server size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white">Pipeline de CI/CD GitHub Actions & Hospedagem Edge no Cloudflare Pages</h4>
                                    <p className="text-[11px] text-blue-200">Arquitetura de entrega contínua com validação de build, tipagem estrita e CDN Global.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="p-4 bg-white/10 rounded-xl border border-white/10 space-y-1.5">
                                    <span className="font-bold text-amber-300 block">1. GitHub Actions (deploy.yml)</span>
                                    <p className="text-gray-200 text-[11px]">
                                        Disparo automático a cada push na branch <code>main</code>. Executa <code>npm ci</code>, checagem de tipos estrita (<code>tsc --noEmit</code>), build de produção (<code>vite build</code>) e deploy seguro via token secreto.
                                    </p>
                                </div>
                                <div className="p-4 bg-white/10 rounded-xl border border-white/10 space-y-1.5">
                                    <span className="font-bold text-cyan-300 block">2. Cloudflare Pages & Headers</span>
                                    <p className="text-gray-200 text-[11px]">
                                        Distribuição em mais de 300 data centers no mundo. Arquivo <code>public/_headers</code> aplica HSTS, X-Frame-Options e cache imutável de 1 ano para assets estáticos. Arquivo <code>_redirects</code> garante roteamento SPA sem erro 404.
                                    </p>
                                </div>
                                <div className="p-4 bg-white/10 rounded-xl border border-white/10 space-y-1.5">
                                    <span className="font-bold text-emerald-300 block">3. Feed Mirakl Carrefour</span>
                                    <p className="text-gray-200 text-[11px]">
                                        Mecanismo de transformação de dados para os formatos padrão <code>carrefour_mirakl_products.csv</code> (separador ponto-e-vírgula UTF-8) e <code>carrefour_mirakl_feed.xml</code> compatível com o portal Mirakl.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Arquitetura de Segurança, RBAC & Governança Antifraude */}
                        <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 text-xs space-y-4">
                            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white">Arquitetura de Segurança & Controle de Acesso Baseado em Papéis (RBAC)</h4>
                                    <p className="text-[11px] text-gray-400">Implementação do Princípio do Menor Privilégio (PoLP) e Isolamento por Competências.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
                                    <span className="text-purple-400 font-bold block text-xs">1. Proteção no Frontend & Roteamento</span>
                                    <p className="text-gray-300 text-[11px]">
                                        O componente <code>ModernAdminDashboard</code> e a <code>AdminSidebar</code> validam dinamicamente a lista <code>allowedModules</code> do colaborador autenticado. Tentativas de acesso direto resultam em tela de restrição com redirecionamento assistido.
                                    </p>
                                </div>
                                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
                                    <span className="text-emerald-400 font-bold block text-xs">2. Mascaramento de Dados Comerciais</span>
                                    <p className="text-gray-300 text-[11px]">
                                        Variáveis financeiras de alta sensibilidade (ex: Preço de Custo e Total de Contas a Pagar) são ofuscadas com <code>••••••</code> quando a flag <code>canViewCostPrice</code> for <code>false</code>.
                                    </p>
                                </div>
                                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
                                    <span className="text-blue-400 font-bold block text-xs">3. Trilha de Auditoria & Imutabilidade</span>
                                    <p className="text-gray-300 text-[11px]">
                                        Transações de venda e entradas de RMA gravam o ID do operador. A exclusão destrutiva de histórico contábil é desabilitada no padrão operacional para assegurar conformidade fiscal e jurídica.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Política de Continuidade de Negócios (DRP) */}
                        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
                            <h4 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                                <ShieldCheck size={16} />
                                Plano de Continuidade & RTO/RPO
                            </h4>
                            <p>
                                <strong>RPO (Recovery Point Objective):</strong> 0 segundos — Transações com escrita síncrona na nuvem.
                            </p>
                            <p>
                                <strong>RTO (Recovery Time Objective):</strong> &lt; 2 minutos — Restauração instantânea em caso de desastre através da injeção do arquivo JSON pelo módulo de Backup.
                            </p>
                        </div>

                        {/* Métrica de Dimensionamento & Volumetria (Base de 1.000 Itens) */}
                        <div className="p-6 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs text-gray-700 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                                        <Database size={16} className="text-blue-600" />
                                        Métrica de Volumetria & Capacidade de Armazenamento (1.000 Itens)
                                    </h4>
                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                        Dimensionamento de carga para catálogo com 1.000 produtos cadastrados, histórico de vendas e clientes.
                                    </p>
                                </div>
                                <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold font-mono">
                                    ~1,2 MB a 1,5 MB / 1.000 Itens
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="p-3.5 bg-white rounded-xl border border-blue-100 shadow-2xs">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Tamanho Unitário Médio:</span>
                                    <span className="text-base font-bold text-gray-900 mt-1 block font-mono">~1,2 KB / produto</span>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Campos textuais, voltagem, medidas, preços e metadados.</p>
                                </div>

                                <div className="p-3.5 bg-white rounded-xl border border-blue-100 shadow-2xs">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Tempo de Download / Backup:</span>
                                    <span className="text-base font-bold text-emerald-700 mt-1 block font-mono">&lt; 2 segundos</span>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Exportação instantânea do snapshot JSON pelo painel.</p>
                                </div>

                                <div className="p-3.5 bg-white rounded-xl border border-blue-100 shadow-2xs">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Uso da Cota Google Cloud:</span>
                                    <span className="text-base font-bold text-blue-700 mt-1 block font-mono">&lt; 0,2% do Free Tier</span>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Cota permanente de 1.000 MB (1 GB) no Google Firestore.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* DOCUMENTO 3: MANUAL DE RESPONSIVIDADE E DISPOSITIVOS (DOC-RESP-001) */}
                {/* ========================================================================= */}
                {activeDoc === 'responsividade' && (
                    <ResponsiveDesignCompatibilityManual />
                )}

                {/* ========================================================================= */}
                {/* DOCUMENTO 4: MANUAL TÉCNICO EXCLUSIVO • REGRAS PARA IMPORTAÇÃO */}
                {/* ========================================================================= */}
                {activeDoc === 'importacao' && (
                    <ImportRulesTechnicalManual />
                )}
            </div>
        </div>
    );
};
