import React from 'react';
import {
    Smartphone,
    Tablet,
    Monitor,
    Globe,
    CheckCircle2,
    ShieldCheck,
    Layers,
    Sliders,
    Zap,
    Cpu,
    Check,
    AppWindow,
    Touchpad,
    Maximize2
} from 'lucide-react';

export const ResponsiveDesignCompatibilityManual: React.FC = () => {
    return (
        <div className="space-y-8 font-sans">
            {/* Cabeçalho do Manual */}
            <div className="border-b border-gray-200 pb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-cyan-700 font-bold uppercase tracking-wider bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                                DOC-RESP-001 • REVISÃO 2.0
                            </span>
                            <span className="px-3 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase">
                                Homologação Universal
                            </span>
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-brand-dark mt-2">
                            Manual de Engenharia de Interface, Responsividade & Compatibilidade Multiplataforma
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Diretrizes de layout responsivo (Mobile-First), comportamento ergonômico por dispositivo e matriz de suporte aos sistemas operacionais.
                        </p>
                    </div>
                </div>
            </div>

            {/* Sumário Executivo */}
            <div className="bg-gradient-to-r from-slate-900 to-cyan-950 text-white p-6 rounded-2xl shadow-md space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 text-cyan-300 rounded-xl border border-cyan-400/30">
                        <Layers size={22} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-white">Arquitetura Mobile-First & Fluidez Universal</h4>
                        <p className="text-xs text-cyan-200/80">Tailwind CSS v4 + React 19 + Flexbox / CSS Grid com Breakpoints Dinâmicos</p>
                    </div>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                    O ecossistema <strong>Ponto Chave do Lar</strong> foi concebido para entregar uma experiência de compra e gestão sem atritos, adaptando automaticamente layouts, tamanhos de fonte, alvos de toque e formulários para qualquer resolução de tela (desde smartphones de 320px até monitores Ultrawide 4K), sem necessidade de zoom ou barras de rolagem horizontal desnecessárias.
                </p>
            </div>

            {/* SEÇÃO 1: ESTRUTURAÇÃO POR DISPOSITIVO */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Sliders className="text-brand-primary" size={20} />
                    <h4 className="text-base font-bold text-brand-dark">1. Estruturação Ergonômica por Tipo de Dispositivo</h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* CARD 1: CELULAR */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
                                    <Smartphone size={24} />
                                </div>
                                <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                                    320px - 640px (sm)
                                </span>
                            </div>
                            <h5 className="font-bold text-sm text-gray-900">Smartphones & Celulares</h5>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Otimizado para operação com apenas uma mão (polegar), priorizando compra em 1 toque e carregamento ultrarrápido em redes móveis 4G/5G.
                            </p>
                            <div className="border-t border-gray-200 pt-3 space-y-2 text-xs text-gray-700">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Grid da Vitrine:</strong> 1 a 2 colunas com cards compactos e fotos otimizadas em WebP.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Alvos de Toque:</strong> Botões com altura mínima de 44px a 48px para evitar toques acidentais.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Abas de Categorias:</strong> Scroll horizontal suave com toque capacitivo e snap elástico.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Menu Lateral & Modais:</strong> Gavetas deslizantes em tela cheia (bottom-sheets).</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-[11px] text-gray-500 font-medium">
                            📱 <em>Exemplos: iPhone 12/13/14/15/16, Samsung Galaxy S/A/Z, Motorola Edge/G, Xiaomi Redmi/Poco.</em>
                        </div>
                    </div>

                    {/* CARD 2: TABLET */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="p-2.5 bg-purple-100 text-purple-800 rounded-xl">
                                    <Tablet size={24} />
                                </div>
                                <span className="text-[11px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                                    641px - 1024px (md/lg)
                                </span>
                            </div>
                            <h5 className="font-bold text-sm text-gray-900">Tablets & iPads</h5>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Formato ideal para atendimento em balcão de loja, demonstração visual de fichas técnicas para clientes e vendas externas de consultoria.
                            </p>
                            <div className="border-t border-gray-200 pt-3 space-y-2 text-xs text-gray-700">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Grid da Vitrine:</strong> 2 a 3 colunas balanceadas com detalhes expandidos.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Ficha Técnica do Produto:</strong> Visualização dividida (foto e galeria à esquerda, dados e especificações à direita).</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Orientação Dual:</strong> Transição fluida entre modo Retrato (Vertical) e Paisagem (Horizontal).</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Painel PDV / Balcão:</strong> Carrinho lateral visível simultaneamente ao catálogo de busca.</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-[11px] text-gray-500 font-medium">
                            📟 <em>Exemplos: iPad 10.2", iPad Air/Pro, Samsung Galaxy Tab S9/A9, Lenovo Tab, Xiaomi Pad.</em>
                        </div>
                    </div>

                    {/* CARD 3: COMPUTADOR */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                                    <Monitor size={24} />
                                </div>
                                <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                                    ≥ 1025px (xl/2xl)
                                </span>
                            </div>
                            <h5 className="font-bold text-sm text-gray-900">Computadores & Desktops</h5>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Foco em produtividade gerencial, cadastros em lote, visualização de tabelas analíticas DRE, relatórios e controle de estoque de alta densidade.
                            </p>
                            <div className="border-t border-gray-200 pt-3 space-y-2 text-xs text-gray-700">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Grid da Vitrine:</strong> 3 a 4 colunas com microinterações de hover e zoom de fotos.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Container Centralizado:</strong> Uso de <code>max-w-7xl mx-auto</code> para evitar estiramento visual em telas ultrawide.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Tabelas Administrativas:</strong> Visualização panorâmica de NFs, CFOP, NCM, margens e custos de fábrica.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>Atalhos & Teclado:</strong> Foco rápido de digitação (Enter, Esc, Tab) no PDV e na busca.</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-[11px] text-gray-500 font-medium">
                            💻 <em>Exemplos: Notebooks 13"-17", Monitores Full HD (1080p), QHD (1440p), Monitores Ultrawide e 4K.</em>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEÇÃO 2: MATRIZ DE COMPATIBILIDADE DE SISTEMAS OPERACIONAIS */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Globe className="text-brand-primary" size={20} />
                    <h4 className="text-base font-bold text-brand-dark">2. Matriz de Suporte a Sistemas Operacionais & Navegadores</h4>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-gray-100 font-bold text-gray-700">
                            <tr>
                                <th className="p-3.5 border-b">Sistema Operacional</th>
                                <th className="p-3.5 border-b">Ambiente Principal</th>
                                <th className="p-3.5 border-b">Navegadores Homologados</th>
                                <th className="p-3.5 border-b">Recursos Nativos Testados</th>
                                <th className="p-3.5 border-b text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            <tr>
                                <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    Android (Google)
                                </td>
                                <td className="p-3.5 text-gray-600">Smartphones & Tablets (Android 8.0 até 15+)</td>
                                <td className="p-3.5 font-mono text-[11px] text-blue-700">Chrome, Samsung Internet, Edge, Firefox, Opera</td>
                                <td className="p-3.5 text-gray-600">Instalação PWA, teclado numérico nativo, WhatsApp direto, câmera para código de barras</td>
                                <td className="p-3.5 text-center">
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">100% Homologado</span>
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    iOS & iPadOS (Apple)
                                </td>
                                <td className="p-3.5 text-gray-600">iPhone & iPad (iOS 14 até iOS 18+)</td>
                                <td className="p-3.5 font-mono text-[11px] text-blue-700">Safari (WebKit), Chrome para iOS, Edge, Firefox</td>
                                <td className="p-3.5 text-gray-600">Safe Area Inset (Notch / Dynamic Island), rolagem elástica iOS, Share Sheet, PWA "Adicionar à Tela de Início"</td>
                                <td className="p-3.5 text-center">
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">100% Homologado</span>
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    Windows (Microsoft)
                                </td>
                                <td className="p-3.5 text-gray-600">Desktops & Notebooks (Win 10 / Win 11)</td>
                                <td className="p-3.5 font-mono text-[11px] text-blue-700">Google Chrome, Microsoft Edge, Opera, Brave, Firefox</td>
                                <td className="p-3.5 text-gray-600">Impressão direta de cupons/boletos, exportação CSV/XML, cópia de PIX em 1 clique, aceleração GPU</td>
                                <td className="p-3.5 text-center">
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">100% Homologado</span>
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    macOS (Apple)
                                </td>
                                <td className="p-3.5 text-gray-600">MacBook, Mac mini, iMac, Mac Studio</td>
                                <td className="p-3.5 font-mono text-[11px] text-blue-700">Safari Desktop, Chrome, Edge, Firefox, Arc</td>
                                <td className="p-3.5 text-gray-600">Renderização Retina de alta definição, atalhos Cmd+C/Cmd+V, Trackpad multitouch e rolagem suave</td>
                                <td className="p-3.5 text-center">
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">100% Homologado</span>
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    Linux (Open Source)
                                </td>
                                <td className="p-3.5 text-gray-600">Ubuntu, Debian, Fedora, Mint, Arch</td>
                                <td className="p-3.5 font-mono text-[11px] text-blue-700">Chromium, Firefox, Brave, Vivaldi</td>
                                <td className="p-3.5 text-gray-600">Execução sem dependências proprietárias, suporte completo aos módulos administrativos e PDV</td>
                                <td className="p-3.5 text-center">
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">100% Homologado</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SEÇÃO 3: ROTEAMENTO INTELIGENTE DE WHATSAPP E FORMULÁRIOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-950 text-emerald-50 p-6 rounded-2xl border border-emerald-800 space-y-3">
                    <div className="flex items-center gap-2">
                        <Zap size={18} className="text-emerald-400" />
                        <h4 className="font-bold text-sm text-emerald-300">Roteamento Inteligente do WhatsApp</h4>
                    </div>
                    <ul className="text-xs space-y-2 text-emerald-100/90 leading-relaxed">
                        <li>
                            <strong>Detecção de Ambiente Mobile:</strong> No celular ou tablet, o clique em <em>"Comprar via WhatsApp"</em> invoca o protocolo nativo <code>whatsapp://send</code> ou link universal, abrindo o aplicativo instalado no aparelho sem travar a navegação.
                        </li>
                        <li>
                            <strong>Fallback Automático para Desktop:</strong> Em computadores ou navegadores que não possuem o aplicativo de WhatsApp instalado, o sistema redireciona automaticamente para o <code>web.whatsapp.com</code>.
                        </li>
                        <li>
                            <strong>Mensagem Pré-Formatada:</strong> Envio automático com nome do produto, código SKU, valor e endereço de entrega pré-preenchido para o atendente.
                        </li>
                    </ul>
                </div>

                <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                        <AppWindow size={18} className="text-cyan-400" />
                        <h4 className="font-bold text-sm text-cyan-300">Capacidades PWA & Instalação Direta</h4>
                    </div>
                    <ul className="text-xs space-y-2 text-slate-300 leading-relaxed">
                        <li>
                            <strong>Adicionar à Tela Inicial (Web App):</strong> O cliente ou vendedor pode instalar o sistema como um aplicativo no celular (ícone dedicado, sem barra de navegação do navegador).
                        </li>
                        <li>
                            <strong>Cache Inteligente de Recursos:</strong> Imagens em WebP, fontes e scripts compilados permanecem em cache local, reduzindo o consumo do plano de dados móveis.
                        </li>
                        <li>
                            <strong>Recarregamento Suave (SPA):</strong> As trocas de abas e filtros de busca acontecem instantaneamente sem recarregar a página inteira.
                        </li>
                    </ul>
                </div>
            </div>

            {/* SEÇÃO 4: BREAKPOINTS E ESPECIFICAÇÕES TÉCNICAS */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex items-center gap-2">
                    <Cpu size={18} className="text-brand-dark" />
                    <h4 className="font-bold text-sm text-brand-dark">Padrões de Breakpoints do Sistema (CSS / Tailwind)</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
                        <span className="font-mono font-bold text-xs text-blue-700 block">sm</span>
                        <span className="text-sm font-bold text-gray-900 block mt-1">640px</span>
                        <span className="text-[10px] text-gray-500">Celulares Grandes</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
                        <span className="font-mono font-bold text-xs text-purple-700 block">md</span>
                        <span className="text-sm font-bold text-gray-900 block mt-1">768px</span>
                        <span className="text-[10px] text-gray-500">Tablets (Retrato)</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
                        <span className="font-mono font-bold text-xs text-emerald-700 block">lg</span>
                        <span className="text-sm font-bold text-gray-900 block mt-1">1024px</span>
                        <span className="text-[10px] text-gray-500">Tablets (Paisagem)</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
                        <span className="font-mono font-bold text-xs text-amber-700 block">xl</span>
                        <span className="text-sm font-bold text-gray-900 block mt-1">1280px</span>
                        <span className="text-[10px] text-gray-500">Notebooks & Telas HD</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs col-span-2 sm:col-span-1">
                        <span className="font-mono font-bold text-xs text-cyan-700 block">2xl</span>
                        <span className="text-sm font-bold text-gray-900 block mt-1">1536px</span>
                        <span className="text-[10px] text-gray-500">Monitores Full HD+</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
