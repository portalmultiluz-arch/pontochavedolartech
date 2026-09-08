import React, { useState, useEffect } from 'react';
import { 
    Building2, 
    MessageCircle, 
    ShieldCheck, 
    CreditCard, 
    FileText, 
    Star, 
    Eye, 
    Save, 
    RotateCcw, 
    Check, 
    AlertCircle, 
    ExternalLink, 
    Plus, 
    Trash2, 
    Lock,
    QrCode,
    CheckCircle2,
    Clock,
    Phone,
    Mail,
    Copy,
    Sparkles,
    MapPin,
    Calendar,
    ArrowRight,
    CheckSquare,
    Share2,
    HelpCircle
} from 'lucide-react';
import { InstitutionalFooterConfig, CustomerTestimonial } from '../../types';
import { DEFAULT_INSTITUTIONAL_FOOTER_CONFIG, formatFullAddress, buildWhatsAppChatUrl } from '../../lib/institutionalFooterConfig';
import { setDocument, subscribeToDoc } from '../../services/firebaseService';

export const InstitutionalFooterManager: React.FC = () => {
    const [config, setConfig] = useState<InstitutionalFooterConfig>(DEFAULT_INSTITUTIONAL_FOOTER_CONFIG);
    const [activeSubTab, setActiveSubTab] = useState<
        'copy_suggestions' | 'company' | 'contact' | 'security' | 'payments' | 'policies' | 'testimonials' | 'preview'
    >('copy_suggestions');
    const [activePolicyTab, setActivePolicyTab] = useState<'returns' | 'privacy' | 'terms' | 'about'>('returns');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [useRealDataInSuggestions, setUseRealDataInSuggestions] = useState<boolean>(false);
    const [applyNotification, setApplyNotification] = useState<string | null>(null);
    const [newTestimonial, setNewTestimonial] = useState<Partial<CustomerTestimonial>>({
        authorName: '',
        cityState: '',
        rating: 5,
        comment: '',
        productPurchased: '',
        verifiedPurchase: true,
        active: true,
    });

    useEffect(() => {
        // Carrega configuração salva no Firestore ou localStorage
        const unsub = subscribeToDoc('siteSettings', 'institutionalFooter', (data) => {
            if (data) {
                setConfig({
                    ...DEFAULT_INSTITUTIONAL_FOOTER_CONFIG,
                    ...(data as InstitutionalFooterConfig),
                    company: { ...DEFAULT_INSTITUTIONAL_FOOTER_CONFIG.company, ...(data as any)?.company },
                    contact: { ...DEFAULT_INSTITUTIONAL_FOOTER_CONFIG.contact, ...(data as any)?.contact },
                    social: { ...DEFAULT_INSTITUTIONAL_FOOTER_CONFIG.social, ...(data as any)?.social },
                    securityBadges: { ...DEFAULT_INSTITUTIONAL_FOOTER_CONFIG.securityBadges, ...(data as any)?.securityBadges },
                    paymentMethods: { ...DEFAULT_INSTITUTIONAL_FOOTER_CONFIG.paymentMethods, ...(data as any)?.paymentMethods },
                    policies: { ...DEFAULT_INSTITUTIONAL_FOOTER_CONFIG.policies, ...(data as any)?.policies },
                    displayOptions: { ...DEFAULT_INSTITUTIONAL_FOOTER_CONFIG.displayOptions, ...(data as any)?.displayOptions },
                    testimonials: (data as any)?.testimonials || DEFAULT_INSTITUTIONAL_FOOTER_CONFIG.testimonials
                });
            } else {
                const local = localStorage.getItem('siteSettings_institutionalFooter');
                if (local) {
                    try {
                        setConfig(JSON.parse(local));
                    } catch {
                        // mantém default
                    }
                }
            }
        });

        return () => unsub();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const dataToSave = {
                ...config,
                updatedAt: new Date().toISOString(),
                updatedBy: 'admin',
            };

            // Salva no Firestore
            await setDocument('siteSettings', 'institutionalFooter', dataToSave);
            // Salva no localStorage como redundância imediata
            localStorage.setItem('siteSettings_institutionalFooter', JSON.stringify(dataToSave));

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 4000);
        } catch (error) {
            console.error("Erro ao salvar configuração do rodapé:", error);
            // Salva localmente se falhar Firestore
            localStorage.setItem('siteSettings_institutionalFooter', JSON.stringify(config));
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 4000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRestoreDefaults = () => {
        if (window.confirm("Deseja restaurar as configurações institucionais para o padrão do sistema?")) {
            setConfig(DEFAULT_INSTITUTIONAL_FOOTER_CONFIG);
        }
    };

    // Adicionar depoimento
    const handleAddTestimonial = () => {
        if (!newTestimonial.authorName || !newTestimonial.comment) {
            alert("Por favor, preencha o nome do cliente e o comentário do depoimento.");
            return;
        }

        const testimonial: CustomerTestimonial = {
            id: `test-${Date.now()}`,
            authorName: newTestimonial.authorName,
            cityState: newTestimonial.cityState || 'Belo Horizonte / MG',
            rating: Number(newTestimonial.rating) || 5,
            comment: newTestimonial.comment,
            productPurchased: newTestimonial.productPurchased || '',
            verifiedPurchase: newTestimonial.verifiedPurchase ?? true,
            date: 'Recente',
            active: true,
        };

        setConfig(prev => ({
            ...prev,
            testimonials: [testimonial, ...prev.testimonials]
        }));

        setNewTestimonial({
            authorName: '',
            cityState: '',
            rating: 5,
            comment: '',
            productPurchased: '',
            verifiedPurchase: true,
            active: true,
        });
    };

    const handleRemoveTestimonial = (id: string) => {
        setConfig(prev => ({
            ...prev,
            testimonials: prev.testimonials.filter(t => t.id !== id)
        }));
    };

    const handleToggleTestimonialActive = (id: string) => {
        setConfig(prev => ({
            ...prev,
            testimonials: prev.testimonials.map(t => t.id === id ? { ...t, active: !t.active } : t)
        }));
    };

    const formattedAddress = formatFullAddress(config.company);
    const testWhatsAppUrl = buildWhatsAppChatUrl(
        config.contact.whatsappRaw || config.contact.whatsapp,
        config.contact.whatsappDefaultMessage
    );

    const handleCopyText = (text: string, key: string) => {
        try {
            navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 3000);
        } catch (err) {
            console.error("Falha ao copiar:", err);
        }
    };

    // Textos sugeridos parametrizados
    const addressPlaceholder = useRealDataInSuggestions ? (formattedAddress || '[meu endereço completo]') : '[meu endereço completo]';
    const whatsappPlaceholder = useRealDataInSuggestions ? (config.contact.whatsapp || '[número]') : '[número]';

    const consolidatedSuggestedCopy = `Atendimento Online: Segunda a sexta, das 8h às 18h | Sábados, das 8h às 12h
Via WhatsApp, e-mail ou chat do site.
Endereço: ${addressPlaceholder} — ponto de apoio para logística, entregas e devoluções. Não realizamos atendimento presencial sem agendamento prévio.
Trocas e devoluções presenciais: mediante agendamento, de segunda a sexta, das 9h às 17h. Agende pelo WhatsApp ${whatsappPlaceholder}.`;

    const handleApplySuggestedCopy = () => {
        const addr = formattedAddress || '[endereço cadastrado]';
        const zap = config.contact.whatsapp || '(WhatsApp Oficial)';

        setConfig(prev => {
            const currentAbout = prev.policies.aboutUsContent || '';
            const currentReturns = prev.policies.returnsPolicyContent || '';

            const appendAbout = currentAbout.includes('ponto de apoio para logística')
                ? currentAbout
                : `${currentAbout}\n\n---\n\n### Atendimento e Ponto de Apoio Logístico\n* **Atendimento Online:** Segunda a sexta, das 8h às 18h | Sábados, das 8h às 12h (via WhatsApp, e-mail ou chat do site).\n* **Endereço:** ${addr} — ponto de apoio para logística, entregas e devoluções. Não realizamos atendimento presencial sem agendamento prévio.\n* **Trocas e Devoluções Presenciais:** Mediante agendamento, de segunda a sexta, das 9h às 17h. Agende pelo WhatsApp ${zap}.`;

            const appendReturns = currentReturns.includes('Trocas e devoluções presenciais: mediante agendamento')
                ? currentReturns
                : `${currentReturns}\n\n---\n\n### Trocas e Devoluções Presenciais no Ponto de Apoio\n* **Horário:** Segunda a sexta, das 9h às 17h (exclusivamente mediante agendamento prévio).\n* **Como agendar:** Entre em contato pelo WhatsApp oficial ${zap} informando o número do pedido.\n* **Local:** ${addr} (ponto de apoio para logística e devoluções).`;

            return {
                ...prev,
                contact: {
                    ...prev.contact,
                    businessHours: 'Segunda a sexta, das 8h às 18h | Sábados, das 8h às 12h',
                },
                policies: {
                    ...prev.policies,
                    aboutUsContent: appendAbout,
                    returnsPolicyContent: appendReturns
                }
            };
        });

        setApplyNotification('✅ Sugestão aplicada aos campos do sistema (Horário de Atendimento e Políticas). Clique em "Salvar Alterações" no topo para gravar no Firestore!');
        setTimeout(() => setApplyNotification(null), 7000);
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans space-y-8">
            {/* Header com Ações Rápidas */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center font-bold">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold font-serif text-gray-900 tracking-tight">
                                    Rodapé Institucional & Compliance Legal
                                </h1>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Decreto 7.962/2013
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Gerencie CNPJ, endereço completo, canais de atendimento, WhatsApp, selos SSL, formas de pagamento e políticas CDC/LGPD.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleRestoreDefaults}
                        type="button"
                        className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={15} />
                        <span>Restaurar Padrões</span>
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        type="button"
                        className={`flex-1 md:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                            saveSuccess 
                                ? 'bg-emerald-600 hover:bg-emerald-700' 
                                : 'bg-brand-primary hover:bg-brand-dark'
                        }`}
                    >
                        {isSaving ? (
                            <span>Gravando...</span>
                        ) : saveSuccess ? (
                            <>
                                <Check size={16} />
                                <span>Salvo com Sucesso!</span>
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                <span>Salvar Alterações</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Abas de Navegação */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
                {[
                    { id: 'copy_suggestions', label: '✍️ Sugestões de Redação', badge: 'Oficial CDC' },
                    { id: 'company', label: '🏢 Dados da Empresa & Endereço', badge: 'Legal Obrigatório' },
                    { id: 'contact', label: '📱 WhatsApp & Atendimento', badge: 'SAC' },
                    { id: 'security', label: '🛡️ Selos de Segurança & SSL', badge: 'Confiança' },
                    { id: 'payments', label: '💳 Pagamentos & Bandeiras', badge: 'Pix/Cartão' },
                    { id: 'policies', label: '📜 Políticas & Trocas (CDC)', badge: 'Garantias' },
                    { id: 'testimonials', label: '⭐ Depoimentos & Prova Social', badge: `${config.testimonials.length}` },
                    { id: 'preview', label: '👁️ Pré-Visualização do Rodapé', badge: 'Tempo Real' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveSubTab(tab.id as any)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            activeSubTab === tab.id
                                ? 'bg-brand-primary text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        <span>{tab.label}</span>
                        {tab.badge && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                activeSubTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Notificação de Aplicação de Sugestão */}
            {applyNotification && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold leading-relaxed">{applyNotification}</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all shrink-0 flex items-center gap-1.5"
                    >
                        <Save size={14} />
                        <span>Salvar no Banco Agora</span>
                    </button>
                </div>
            )}

            {/* Conteúdo da Aba 0: Sugestões de Redação para Contato & Sobre */}
            {activeSubTab === 'copy_suggestions' && (
                <div className="space-y-6">
                    {/* Header Informativo com Propósito Operacional */}
                    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-dark text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden">
                        <div className="max-w-3xl space-y-3 relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-bold">
                                <Sparkles size={14} />
                                <span>Modelos Oficiais Homologados • CDC & Ponto de Apoio</span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold font-serif tracking-tight">
                                Sugestões de Redação para Contato, Sobre Nós & Logística
                            </h2>
                            <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                                Textos pré-estruturados para delimitar com precisão o modelo operacional da <strong>Ponto Chave do Lar</strong>: atendimento prioritário online, endereço físico operando como <em>ponto de apoio logístico para entregas e devoluções</em> (evitando clientes avulsos sem agendamento) e rotina clara de trocas presenciais.
                            </p>
                        </div>
                    </div>

                    {/* Barra de Controles: Alternador de Marcadores vs. Dados Reais */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-700">Formato de Exibição das Sugestões:</span>
                            <div className="inline-flex bg-gray-100 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setUseRealDataInSuggestions(false)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        !useRealDataInSuggestions
                                            ? 'bg-white text-brand-dark shadow-sm'
                                            : 'text-gray-500 hover:text-gray-900'
                                    }`}
                                >
                                    Marcadores Padrão ([endereço], [número])
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUseRealDataInSuggestions(true)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        useRealDataInSuggestions
                                            ? 'bg-brand-primary text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-900'
                                    }`}
                                >
                                    Preencher com Meus Dados Cadastrados
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleApplySuggestedCopy}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-2"
                                title="Aplica automaticamente o horário de atendimento e os termos nas políticas do sistema"
                            >
                                <CheckSquare size={14} />
                                <span>Aplicar Diretamente aos Campos do Sistema</span>
                            </button>
                        </div>
                    </div>

                    {/* BLOCO PRINCIPAL: Redação Oficial Solicitada */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">
                                        Texto Consolidado (Sugestão Oficial de Redação)
                                    </h3>
                                    <p className="text-[11px] text-gray-500">
                                        Ideal para a seção "Fale Conosco", rodapé, confirmação de pedido e canal de suporte.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleCopyText(consolidatedSuggestedCopy, 'consolidated')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                                    copiedKey === 'consolidated'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                }`}
                            >
                                {copiedKey === 'consolidated' ? (
                                    <>
                                        <Check size={14} />
                                        <span>Copiado com Sucesso!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={14} />
                                        <span>Copiar Texto Completo</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Caixa de Texto do Modelo com Destaque Visual */}
                        <div className="bg-slate-950 text-gray-100 p-5 md:p-6 rounded-2xl font-sans text-xs sm:text-sm leading-relaxed border border-slate-800 space-y-3 selection:bg-brand-primary selection:text-white">
                            <div className="space-y-2">
                                <p>
                                    <span className="text-amber-400 font-bold">Atendimento Online:</span> Segunda a sexta, das 8h às 18h | Sábados, das 8h às 12h
                                </p>
                                <p className="text-emerald-400 font-medium">
                                    Via WhatsApp, e-mail ou chat do site.
                                </p>
                                <p>
                                    <span className="text-sky-400 font-bold">Endereço:</span>{' '}
                                    <span className={useRealDataInSuggestions ? 'text-white underline font-semibold' : 'text-amber-300 font-mono'}>
                                        {addressPlaceholder}
                                    </span>{' '}
                                    — ponto de apoio para logística, entregas e devoluções. Não realizamos atendimento presencial sem agendamento prévio.
                                </p>
                                <p>
                                    <span className="text-purple-400 font-bold">Trocas e devoluções presenciais:</span> mediante agendamento, de segunda a sexta, das 9h às 17h. Agende pelo WhatsApp{' '}
                                    <span className={useRealDataInSuggestions ? 'text-white underline font-semibold' : 'text-amber-300 font-mono'}>
                                        {whatsappPlaceholder}
                                    </span>.
                                </p>
                            </div>
                        </div>

                        {/* Guia de Utilização do Texto */}
                        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900 leading-relaxed">
                            <HelpCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-bold">Por que esta redação protege sua empresa?</strong>
                                <p className="mt-1 text-blue-800 text-[11px]">
                                    A expressão <em>"ponto de apoio para logística, entregas e devoluções"</em> cumpre o Decreto do E-commerce (que exige informar o endereço físico), mas afasta a presunção do cliente de que haverá balcão de vendas aberto e estoque imediato para pronta entrega. Já a regra de <em>"mediante agendamento de segunda a sexta das 9h às 17h"</em> organiza o fluxo interno e previne deslocamentos frustrados.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* BLOCOS MODULARES DESMEMBRADOS PARA CÓPIA RÁPIDA */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Módulo 1: Atendimento Online & Canais */}
                        <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        Módulo 1 • SAC Online
                                    </span>
                                    <Clock size={16} className="text-emerald-600" />
                                </div>
                                <h4 className="text-xs font-bold text-gray-900">
                                    Horários & Canais de Atendimento
                                </h4>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-800 font-mono space-y-1">
                                    <p><strong>Atendimento Online:</strong> Segunda a sexta, das 8h às 18h | Sábados, das 8h às 12h</p>
                                    <p className="text-gray-600">Via WhatsApp, e-mail ou chat do site.</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => handleCopyText(
                                        `Atendimento Online: Segunda a sexta, das 8h às 18h | Sábados, das 8h às 12h\nVia WhatsApp, e-mail ou chat do site.`,
                                        'module1'
                                    )}
                                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                >
                                    {copiedKey === 'module1' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                    <span>{copiedKey === 'module1' ? 'Copiado!' : 'Copiar Bloco'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setConfig(prev => ({
                                            ...prev,
                                            contact: {
                                                ...prev.contact,
                                                businessHours: 'Segunda a sexta, das 8h às 18h | Sábados, das 8h às 12h'
                                            }
                                        }));
                                        setActiveSubTab('contact');
                                    }}
                                    className="w-full py-1.5 text-[11px] font-semibold text-brand-primary hover:underline flex items-center justify-center gap-1"
                                >
                                    <span>Preencher na aba Contato</span>
                                    <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>

                        {/* Módulo 2: Endereço & Ponto de Apoio */}
                        <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                                        Módulo 2 • Logística
                                    </span>
                                    <MapPin size={16} className="text-sky-600" />
                                </div>
                                <h4 className="text-xs font-bold text-gray-900">
                                    Endereço do Ponto de Apoio
                                </h4>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-800 font-mono space-y-1">
                                    <p><strong>Endereço:</strong> {addressPlaceholder} — ponto de apoio para logística, entregas e devoluções.</p>
                                    <p className="text-rose-600 font-sans text-[11px] font-semibold">Não realizamos atendimento presencial sem agendamento prévio.</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => handleCopyText(
                                        `Endereço: ${addressPlaceholder} — ponto de apoio para logística, entregas e devoluções. Não realizamos atendimento presencial sem agendamento prévio.`,
                                        'module2'
                                    )}
                                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                >
                                    {copiedKey === 'module2' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                    <span>{copiedKey === 'module2' ? 'Copiado!' : 'Copiar Bloco'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveSubTab('company')}
                                    className="w-full py-1.5 text-[11px] font-semibold text-brand-primary hover:underline flex items-center justify-center gap-1"
                                >
                                    <span>Conferir Endereço na aba Empresa</span>
                                    <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>

                        {/* Módulo 3: Trocas e Devoluções Presenciais */}
                        <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                        Módulo 3 • RMA & Trocas
                                    </span>
                                    <RotateCcw size={16} className="text-purple-600" />
                                </div>
                                <h4 className="text-xs font-bold text-gray-900">
                                    Trocas Presenciais Agendadas
                                </h4>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-800 font-mono space-y-1">
                                    <p><strong>Trocas e devoluções presenciais:</strong> mediante agendamento, de segunda a sexta, das 9h às 17h.</p>
                                    <p className="text-brand-primary font-sans text-[11px] font-semibold">Agende pelo WhatsApp {whatsappPlaceholder}.</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => handleCopyText(
                                        `Trocas e devoluções presenciais: mediante agendamento, de segunda a sexta, das 9h às 17h. Agende pelo WhatsApp ${whatsappPlaceholder}.`,
                                        'module3'
                                    )}
                                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                >
                                    {copiedKey === 'module3' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                    <span>{copiedKey === 'module3' ? 'Copiado!' : 'Copiar Bloco'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveSubTab('policies');
                                        setActivePolicyTab('returns');
                                    }}
                                    className="w-full py-1.5 text-[11px] font-semibold text-brand-primary hover:underline flex items-center justify-center gap-1"
                                >
                                    <span>Ver Política de Trocas (CDC)</span>
                                    <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TEXTO INSTITUCIONAL COMPLETO PARA "SOBRE A PONTO CHAVE DO LAR" */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">
                                    Sugestão de Redação Expandida para a Seção "Sobre Nós"
                                </h3>
                                <p className="text-[11px] text-gray-500">
                                    Apresentação institucional completa da empresa para uso no modal oficial e na página institucional.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleCopyText(
`## Sobre a Ponto Chave do Lar - Soluções em Design e Materiais

A **Ponto Chave do Lar** nasceu com a missão de unir a tradição do comércio de materiais técnicos de alta performance com a inovação em design de interiores e soluções práticas para o lar.

Oferecemos uma linha completa e rigorosamente selecionada de:
* **Condutores e Materiais Elétricos** de alta segurança e conformidade Inmetro;
* **Conexões e Soluções Hidráulicas** duráveis e eficientes;
* **Ferramentas Manuais e Elétricas** profissionais e para o dia a dia;
* **Iluminação LED e Acabamentos** que transformam qualquer ambiente;
* **Ferragens, Fixações e Utilidades** essenciais para manutenção e construção civil.

Trabalhamos em parceria direta com as maiores indústrias nacionais, garantindo procedência 100% comprovada, nota fiscal em todas as vendas e consultoria especializada com inteligência técnica.

---

### Atendimento e Logística
* **Atendimento Online:** Segunda a sexta, das 8h às 18h | Sábados, das 8h às 12h (via WhatsApp, e-mail ou chat do site).
* **Endereço:** ${addressPlaceholder} — ponto de apoio para logística, entregas e devoluções. Não realizamos atendimento presencial sem agendamento prévio.
* **Trocas e Devoluções Presenciais:** Mediante agendamento, de segunda a sexta, das 9h às 17h. Agende pelo WhatsApp ${whatsappPlaceholder}.`,
                                    'aboutExpanded'
                                )}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                                {copiedKey === 'aboutExpanded' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                <span>{copiedKey === 'aboutExpanded' ? 'Copiado!' : 'Copiar Texto Completo "Sobre Nós"'}</span>
                            </button>
                        </div>

                        <div className="bg-slate-50 border border-gray-200 rounded-2xl p-5 text-xs text-gray-800 font-mono leading-relaxed space-y-3 whitespace-pre-wrap max-h-72 overflow-y-auto">
{`A Ponto Chave do Lar nasceu com a missão de unir a tradição do comércio de materiais técnicos de alta performance com a inovação em design de interiores e soluções práticas para o lar.

Oferecemos uma linha completa e rigorosamente selecionada de:
• Condutores e Materiais Elétricos de alta segurança e conformidade Inmetro;
• Conexões e Soluções Hidráulicas duráveis e eficientes;
• Ferramentas Manuais e Elétricas profissionais e para o dia a dia;
• Iluminação LED e Acabamentos que transformam qualquer ambiente;
• Ferragens, Fixações e Utilidades essenciais para manutenção e construção civil.

---
Atendimento Online: Segunda a sexta, das 8h às 18h | Sábados, das 8h às 12h
Via WhatsApp, e-mail ou chat do site.
Endereço: ${addressPlaceholder} — ponto de apoio para logística, entregas e devoluções. Não realizamos atendimento presencial sem agendamento prévio.
Trocas e devoluções presenciais: mediante agendamento, de segunda a sexta, das 9h às 17h. Agende pelo WhatsApp ${whatsappPlaceholder}.`}
                        </div>
                    </div>
                </div>
            )}

            {/* Conteúdo da Aba 1: Dados da Empresa & Endereço (Decreto 7.962/2013) */}
            {activeSubTab === 'company' && (
                <div className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                        <AlertCircle className="text-amber-700 shrink-0 mt-0.5" size={22} />
                        <div className="text-xs text-amber-900 leading-relaxed">
                            <p className="font-bold text-sm mb-1">Exigência do Decreto Federal do E-commerce (Decreto nº 7.962/2013):</p>
                            O comércio eletrônico no Brasil é obrigado por lei a exibir em local visível (destaque no rodapé de todas as páginas): a <strong>Razão Social</strong>, o <strong>CNPJ</strong>, o <strong>Endereço Físico completo da sede</strong> e os canais de contato direto. Mantenha esses dados sempre preenchidos e atualizados.
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm space-y-6">
                        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                            <Building2 size={18} className="text-brand-primary" />
                            Identificação Jurídica
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Nome Fantasia
                                </label>
                                <input
                                    type="text"
                                    value={config.company.tradeName}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        company: { ...config.company, tradeName: e.target.value }
                                    })}
                                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary outline-none"
                                    placeholder="Ex: Ponto Chave do Lar"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Razão Social Completa
                                </label>
                                <input
                                    type="text"
                                    value={config.company.legalName}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        company: { ...config.company, legalName: e.target.value }
                                    })}
                                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary outline-none"
                                    placeholder="Ex: Ponto Chave do Lar Comércio e Soluções em Design LTDA"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    CNPJ
                                </label>
                                <input
                                    type="text"
                                    value={config.company.cnpj}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        company: { ...config.company, cnpj: e.target.value }
                                    })}
                                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary outline-none font-mono"
                                    placeholder="00.000.000/0001-00"
                                />
                                <span className="text-[11px] text-gray-400 mt-1 block">
                                    Você poderá alterar a qualquer momento assim que o registro definitivo for emitido.
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Inscrição Estadual (IE)
                                </label>
                                <input
                                    type="text"
                                    value={config.company.stateRegistration}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        company: { ...config.company, stateRegistration: e.target.value }
                                    })}
                                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary outline-none"
                                    placeholder="Ex: ISENTO ou 001.234.567.890"
                                />
                            </div>
                        </div>

                        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 pt-4 flex items-center gap-2">
                            Endereço Físico Completo da Sede
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Logradouro (Rua, Avenida, Praça)
                                </label>
                                <input
                                    type="text"
                                    value={config.company.addressStreet}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        company: { ...config.company, addressStreet: e.target.value }
                                    })}
                                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary outline-none"
                                    placeholder="Ex: Av. Afonso Pena"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Número
                                </label>
                                <input
                                    type="text"
                                    value={config.company.addressNumber}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        company: { ...config.company, addressNumber: e.target.value }
                                    })}
                                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary outline-none"
                                    placeholder="Ex: 1500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Complemento / Sala / Galpão
                                </label>
                                <input
                                    type="text"
                                    value={config.company.addressComplement}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        company: { ...config.company, addressComplement: e.target.value }
                                    })}
                                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary outline-none"
                                    placeholder="Ex: Loja 02 / Salão Comercial"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Bairro
                                </label>
                                <input
                                    type="text"
                                    value={config.company.addressNeighborhood}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        company: { ...config.company, addressNeighborhood: e.target.value }
                                    })}
                                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary outline-none"
                                    placeholder="Ex: Centro"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Cidade
                                </label>
                                <input
                                    type="text"
                                    value={config.company.addressCity}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        company: { ...config.company, addressCity: e.target.value }
                                    })}
                                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary outline-none"
                                    placeholder="Ex: Belo Horizonte"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Estado (UF)
                                </label>
                                <input
                                    type="text"
                                    maxLength={2}
                                    value={config.company.addressState}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        company: { ...config.company, addressState: e.target.value.toUpperCase() }
                                    })}
                                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary outline-none uppercase font-mono"
                                    placeholder="MG"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    CEP
                                </label>
                                <input
                                    type="text"
                                    value={config.company.addressZip}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        company: { ...config.company, addressZip: e.target.value }
                                    })}
                                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary outline-none font-mono"
                                    placeholder="30130-005"
                                />
                            </div>
                        </div>

                        {/* Prévia em Tempo Real da Linha de Rodapé */}
                        <div className="bg-slate-900 text-white rounded-2xl p-5 mt-4 space-y-2">
                            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                                Prévia da Assinatura Legal Obrigatória no Rodapé:
                            </span>
                            <p className="text-xs text-gray-300 leading-relaxed font-sans">
                                <strong>{config.company.legalName || 'Razão Social'}</strong> • CNPJ: {config.company.cnpj || '00.000.000/0001-00'} • {formattedAddress}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Conteúdo da Aba 2: WhatsApp & Canais de Atendimento */}
            {activeSubTab === 'contact' && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm space-y-6">
                    {/* Banner de Sugestão Oficial para o Atendimento */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950">
                        <div className="flex items-start gap-3">
                            <Clock size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-sm text-emerald-900">Horário Sugerido Homologado:</p>
                                <p className="text-emerald-800 text-xs mt-0.5 font-medium">
                                    <strong>Atendimento Online:</strong> Segunda a sexta, das 8h às 18h | Sábados, das 8h às 12h (via WhatsApp, e-mail ou chat do site).
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setConfig(prev => ({
                                    ...prev,
                                    contact: {
                                        ...prev.contact,
                                        businessHours: 'Segunda a sexta, das 8h às 18h | Sábados, das 8h às 12h'
                                    }
                                }));
                                setApplyNotification('Horário de atendimento preenchido com a sugestão oficial!');
                                setTimeout(() => setApplyNotification(null), 4000);
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all text-xs shrink-0 flex items-center gap-1.5"
                        >
                            <CheckSquare size={14} />
                            <span>Preencher com Sugestão</span>
                        </button>
                    </div>

                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                        <MessageCircle size={18} className="text-emerald-600" />
                        WhatsApp Oficial de Vendas & Atendimento
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                Número do WhatsApp (Exibição Formatada)
                            </label>
                            <input
                                type="text"
                                value={config.contact.whatsapp}
                                onChange={(e) => setConfig({
                                    ...config,
                                    contact: { ...config.contact, whatsapp: e.target.value }
                                })}
                                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="(31) 99999-9999"
                            />
                            <span className="text-[11px] text-gray-400 mt-1 block">
                                Como o número aparece visivelmente para o cliente no rodapé e nos modais.
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                Número Numérico Internacional (DDI + DDD + Número sem símbolos)
                            </label>
                            <input
                                type="text"
                                value={config.contact.whatsappRaw}
                                onChange={(e) => setConfig({
                                    ...config,
                                    contact: { ...config.contact, whatsappRaw: e.target.value }
                                })}
                                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                                placeholder="5531999999999"
                            />
                            <span className="text-[11px] text-gray-400 mt-1 block">
                                Utilizado no link automático wa.me para abrir a conversa com um clique.
                            </span>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                Mensagem Padrão Inicial ao Clicar no WhatsApp
                            </label>
                            <input
                                type="text"
                                value={config.contact.whatsappDefaultMessage}
                                onChange={(e) => setConfig({
                                    ...config,
                                    contact: { ...config.contact, whatsappDefaultMessage: e.target.value }
                                })}
                                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Olá! Gostaria de informações sobre produtos da Ponto Chave do Lar."
                            />
                        </div>
                    </div>

                    {/* Testador do Link WhatsApp */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                                <MessageCircle size={20} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-emerald-950">Link Direto do WhatsApp Gerado:</h4>
                                <p className="text-[11px] text-emerald-800 font-mono truncate max-w-lg">
                                    {testWhatsAppUrl}
                                </p>
                            </div>
                        </div>

                        <a
                            href={testWhatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-colors shrink-0"
                        >
                            <span>Testar Conversa</span>
                            <ExternalLink size={14} />
                        </a>
                    </div>

                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 pt-4 flex items-center gap-2">
                        Telefone Fixo, E-mail & Horário de Funcionamento
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                Telefone SAC / Loja Física
                            </label>
                            <input
                                type="text"
                                value={config.contact.phone}
                                onChange={(e) => setConfig({
                                    ...config,
                                    contact: { ...config.contact, phone: e.target.value }
                                })}
                                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary outline-none"
                                placeholder="(31) 3200-0000"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                E-mail Oficial de Suporte
                            </label>
                            <input
                                type="email"
                                value={config.contact.email}
                                onChange={(e) => setConfig({
                                    ...config,
                                    contact: { ...config.contact, email: e.target.value }
                                })}
                                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary outline-none"
                                placeholder="portalmultiluz@gmail.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                Horário de Funcionamento / Atendimento
                            </label>
                            <input
                                type="text"
                                value={config.contact.businessHours}
                                onChange={(e) => setConfig({
                                    ...config,
                                    contact: { ...config.contact, businessHours: e.target.value }
                                })}
                                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary outline-none"
                                placeholder="Seg a Sex: 08h às 18h | Sáb: 08h às 13h"
                            />
                        </div>
                    </div>

                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 pt-4 flex items-center gap-2">
                        Redes Sociais Oficiais
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                Instagram (URL Completa)
                            </label>
                            <input
                                type="url"
                                value={config.social.instagramUrl}
                                onChange={(e) => setConfig({
                                    ...config,
                                    social: { ...config.social, instagramUrl: e.target.value }
                                })}
                                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary outline-none"
                                placeholder="https://instagram.com/pontochavedolar"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                Facebook (URL Completa)
                            </label>
                            <input
                                type="url"
                                value={config.social.facebookUrl}
                                onChange={(e) => setConfig({
                                    ...config,
                                    social: { ...config.social, facebookUrl: e.target.value }
                                })}
                                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary outline-none"
                                placeholder="https://facebook.com/pontochavedolar"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Conteúdo da Aba 3: Selos de Segurança & SSL */}
            {activeSubTab === 'security' && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm space-y-6">
                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-emerald-600" />
                        Parametrização de Selos de Confiança & Criptografia
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Selo SSL */}
                        <div className="p-5 rounded-2xl border border-gray-200 bg-slate-50 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">Selo SSL 256-Bit (TLS 1.3)</h4>
                                        <p className="text-[11px] text-gray-500">Conexão criptografada ponta a ponta</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={config.securityBadges.sslEnabled}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        securityBadges: { ...config.securityBadges, sslEnabled: e.target.checked }
                                    })}
                                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                    Texto do Selo SSL
                                </label>
                                <input
                                    type="text"
                                    value={config.securityBadges.sslLabel}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        securityBadges: { ...config.securityBadges, sslLabel: e.target.value }
                                    })}
                                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                                />
                            </div>
                        </div>

                        {/* Selo Google Safe Browsing */}
                        <div className="p-5 rounded-2xl border border-gray-200 bg-slate-50 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">Google Safe Browsing</h4>
                                        <p className="text-[11px] text-gray-500">Ambiente protegido contra malware e phishing</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={config.securityBadges.googleSafeEnabled}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        securityBadges: { ...config.securityBadges, googleSafeEnabled: e.target.checked }
                                    })}
                                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Selo LGPD */}
                        <div className="p-5 rounded-2xl border border-gray-200 bg-slate-50 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">Conformidade LGPD (Lei 13.709/18)</h4>
                                        <p className="text-[11px] text-gray-500">Privacidade de dados e direitos do titular</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={config.securityBadges.lgpdEnabled}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        securityBadges: { ...config.securityBadges, lgpdEnabled: e.target.checked }
                                    })}
                                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Selo Empresa Verificada */}
                        <div className="p-5 rounded-2xl border border-gray-200 bg-slate-50 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                                        <Star size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">Loja Verificada & Confiável</h4>
                                        <p className="text-[11px] text-gray-500">Avaliações positivas e suporte garantido</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={config.securityBadges.verifiedStoreEnabled}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        securityBadges: { ...config.securityBadges, verifiedStoreEnabled: e.target.checked }
                                    })}
                                    className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Prévia dos Selos */}
                    <div className="bg-slate-900 text-white rounded-2xl p-6 mt-4">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-3">
                            Prévia dos Selos no Rodapé:
                        </span>
                        <div className="flex flex-wrap items-center gap-3">
                            {config.securityBadges.sslEnabled && (
                                <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                    <Lock size={14} className="text-emerald-400" />
                                    <span>{config.securityBadges.sslLabel}</span>
                                </div>
                            )}
                            {config.securityBadges.googleSafeEnabled && (
                                <div className="flex items-center space-x-2 bg-blue-950/80 border border-blue-600/50 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                    <ShieldCheck size={14} className="text-blue-400" />
                                    <span>Google Navegação Segura</span>
                                </div>
                            )}
                            {config.securityBadges.lgpdEnabled && (
                                <div className="flex items-center space-x-2 bg-purple-950/80 border border-purple-600/50 text-purple-300 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                    <CheckCircle2 size={14} className="text-purple-400" />
                                    <span>Proteção de Dados LGPD</span>
                                </div>
                            )}
                            {config.securityBadges.verifiedStoreEnabled && (
                                <div className="flex items-center space-x-2 bg-amber-950/80 border border-amber-600/50 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                    <span>Loja 100% Verificada</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Conteúdo da Aba 4: Pagamentos & Bandeiras */}
            {activeSubTab === 'payments' && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm space-y-6">
                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                        <CreditCard size={18} className="text-brand-primary" />
                        Métodos de Pagamento & Bandeiras Aceitas
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Pix */}
                        <div className="p-5 rounded-2xl border border-gray-200 bg-slate-50 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800">
                                        <QrCode size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">Pix Instantâneo</h4>
                                        <p className="text-[11px] text-gray-500">Aprovação imediata do pedido</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={config.paymentMethods.pixEnabled}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        paymentMethods: { ...config.paymentMethods, pixEnabled: e.target.checked }
                                    })}
                                    className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                    Texto do Pix
                                </label>
                                <input
                                    type="text"
                                    value={config.paymentMethods.pixBadgeText}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        paymentMethods: { ...config.paymentMethods, pixBadgeText: e.target.value }
                                    })}
                                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                                />
                            </div>
                        </div>

                        {/* Cartões de Crédito */}
                        <div className="p-5 rounded-2xl border border-gray-200 bg-slate-50 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">Cartões de Crédito</h4>
                                        <p className="text-[11px] text-gray-500">Visa, Mastercard, Elo, Hipercard, Amex</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={config.paymentMethods.creditCardsEnabled}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        paymentMethods: { ...config.paymentMethods, creditCardsEnabled: e.target.checked }
                                    })}
                                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                    Condições de Parcelamento
                                </label>
                                <input
                                    type="text"
                                    value={config.paymentMethods.installmentsNote}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        paymentMethods: { ...config.paymentMethods, installmentsNote: e.target.value }
                                    })}
                                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                                />
                            </div>
                        </div>

                        {/* Boleto Bancário */}
                        <div className="p-5 rounded-2xl border border-gray-200 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-orange-100 text-orange-800">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-900">Boleto Bancário</h4>
                                    <p className="text-[11px] text-gray-500">Pagável em qualquer agência ou internet banking</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={config.paymentMethods.boletoEnabled}
                                onChange={(e) => setConfig({
                                    ...config,
                                    paymentMethods: { ...config.paymentMethods, boletoEnabled: e.target.checked }
                                })}
                                className="w-5 h-5 accent-orange-600 rounded cursor-pointer"
                            />
                        </div>

                        {/* Mercado Pago */}
                        <div className="p-5 rounded-2xl border border-gray-200 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-sky-100 text-sky-800">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-900">Intermediador Homologado</h4>
                                    <p className="text-[11px] text-gray-500">Mercado Pago / Gateways Certificados</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={config.paymentMethods.mercadoPagoEnabled}
                                onChange={(e) => setConfig({
                                    ...config,
                                    paymentMethods: { ...config.paymentMethods, mercadoPagoEnabled: e.target.checked }
                                })}
                                className="w-5 h-5 accent-sky-600 rounded cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Conteúdo da Aba 5: Políticas & Trocas (CDC) */}
            {activeSubTab === 'policies' && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                        <div>
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <FileText size={18} className="text-brand-primary" />
                                Gestão das Políticas Oficiais & Termos Legais
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Edite os textos que os clientes lêem nos modais ao clicar no rodapé.
                            </p>
                        </div>
                    </div>

                    {/* Sub-abas de políticas */}
                    <div className="flex gap-2 border-b border-gray-200 pb-2">
                        {[
                            { id: 'returns', label: 'Trocas & Devoluções (CDC Art. 49)' },
                            { id: 'privacy', label: 'Privacidade & Dados (LGPD)' },
                            { id: 'terms', label: 'Termos de Uso do Site' },
                            { id: 'about', label: 'Sobre a Ponto Chave do Lar' },
                        ].map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setActivePolicyTab(p.id as any)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                    activePolicyTab === p.id
                                        ? 'bg-slate-900 text-white shadow'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {activePolicyTab === 'returns' && (
                        <div className="space-y-4">
                            {/* Banner de Sugestão de Trocas Presenciais */}
                            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-purple-950">
                                <div className="flex items-start gap-3">
                                    <RotateCcw size={20} className="text-purple-700 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-sm text-purple-900">Regra Homologada para Trocas Presenciais:</p>
                                        <p className="text-purple-800 text-xs mt-0.5 font-medium">
                                            <strong>Trocas e devoluções presenciais:</strong> mediante agendamento, de segunda a sexta, das 9h às 17h. Agende pelo WhatsApp {config.contact.whatsapp || '[número]'}.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const clause = `\n\n---\n\n### Trocas e Devoluções Presenciais no Ponto de Apoio\n* **Horário:** Segunda a sexta, das 9h às 17h (exclusivamente mediante agendamento prévio).\n* **Como agendar:** Entre em contato pelo WhatsApp oficial ${config.contact.whatsapp || '[número]'} informando o número do pedido.\n* **Local:** ${formattedAddress || '[endereço completo]'} (ponto de apoio para logística e devoluções).`;
                                        if (!config.policies.returnsPolicyContent.includes('Trocas e Devoluções Presenciais')) {
                                            setConfig(prev => ({
                                                ...prev,
                                                policies: {
                                                    ...prev.policies,
                                                    returnsPolicyContent: `${prev.policies.returnsPolicyContent}${clause}`
                                                }
                                            }));
                                            setApplyNotification('Cláusula de trocas presenciais agendadas adicionada à política!');
                                            setTimeout(() => setApplyNotification(null), 4000);
                                        }
                                    }}
                                    className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-sm transition-all text-xs shrink-0 flex items-center gap-1.5"
                                >
                                    <Plus size={14} />
                                    <span>Anexar ao Texto da Política</span>
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Título da Política de Trocas e Devoluções
                                </label>
                                <input
                                    type="text"
                                    value={config.policies.returnsPolicyTitle}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        policies: { ...config.policies, returnsPolicyTitle: e.target.value }
                                    })}
                                    className="w-full text-xs p-3 rounded-xl border border-gray-300"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Texto Completo da Política (Suporta formatação Markdown: ## títulos, * listas)
                                </label>
                                <textarea
                                    rows={12}
                                    value={config.policies.returnsPolicyContent}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        policies: { ...config.policies, returnsPolicyContent: e.target.value }
                                    })}
                                    className="w-full text-xs font-mono p-4 rounded-xl border border-gray-300 leading-relaxed"
                                />
                            </div>
                        </div>
                    )}

                    {activePolicyTab === 'privacy' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Título da Política de Privacidade
                                </label>
                                <input
                                    type="text"
                                    value={config.policies.privacyPolicyTitle}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        policies: { ...config.policies, privacyPolicyTitle: e.target.value }
                                    })}
                                    className="w-full text-xs p-3 rounded-xl border border-gray-300"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Texto da Política LGPD
                                </label>
                                <textarea
                                    rows={12}
                                    value={config.policies.privacyPolicyContent}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        policies: { ...config.policies, privacyPolicyContent: e.target.value }
                                    })}
                                    className="w-full text-xs font-mono p-4 rounded-xl border border-gray-300 leading-relaxed"
                                />
                            </div>
                        </div>
                    )}

                    {activePolicyTab === 'terms' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Título dos Termos de Uso
                                </label>
                                <input
                                    type="text"
                                    value={config.policies.termsOfUseTitle}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        policies: { ...config.policies, termsOfUseTitle: e.target.value }
                                    })}
                                    className="w-full text-xs p-3 rounded-xl border border-gray-300"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Texto dos Termos de Uso
                                </label>
                                <textarea
                                    rows={12}
                                    value={config.policies.termsOfUseContent}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        policies: { ...config.policies, termsOfUseContent: e.target.value }
                                    })}
                                    className="w-full text-xs font-mono p-4 rounded-xl border border-gray-300 leading-relaxed"
                                />
                            </div>
                        </div>
                    )}

                    {activePolicyTab === 'about' && (
                        <div className="space-y-4">
                            {/* Banner de Sugestão para Sobre Nós & Ponto de Apoio */}
                            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-sky-950">
                                <div className="flex items-start gap-3">
                                    <MapPin size={20} className="text-sky-700 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-sm text-sky-900">Cláusula Sugerida de Atendimento & Ponto de Apoio:</p>
                                        <p className="text-sky-800 text-xs mt-0.5 font-medium">
                                            <strong>Endereço:</strong> {formattedAddress || '[meu endereço completo]'} — ponto de apoio para logística, entregas e devoluções. Não realizamos atendimento presencial sem agendamento prévio.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const clause = `\n\n---\n\n### Atendimento e Ponto de Apoio Logístico\n* **Atendimento Online:** Segunda a sexta, das 8h às 18h | Sábados, das 8h às 12h (via WhatsApp, e-mail ou chat do site).\n* **Endereço:** ${formattedAddress || '[endereço completo]'} — ponto de apoio para logística, entregas e devoluções. Não realizamos atendimento presencial sem agendamento prévio.\n* **Trocas e Devoluções Presenciais:** Mediante agendamento, de segunda a sexta, das 9h às 17h. Agende pelo WhatsApp ${config.contact.whatsapp || '[número]'}.`;
                                        if (!config.policies.aboutUsContent.includes('ponto de apoio para logística')) {
                                            setConfig(prev => ({
                                                ...prev,
                                                policies: {
                                                    ...prev.policies,
                                                    aboutUsContent: `${prev.policies.aboutUsContent}${clause}`
                                                }
                                            }));
                                            setApplyNotification('Cláusula de atendimento online e ponto de apoio anexada ao Sobre Nós!');
                                            setTimeout(() => setApplyNotification(null), 4000);
                                        }
                                    }}
                                    className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-bold shadow-sm transition-all text-xs shrink-0 flex items-center gap-1.5"
                                >
                                    <Plus size={14} />
                                    <span>Anexar ao Sobre Nós</span>
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Título da Seção Sobre Nós
                                </label>
                                <input
                                    type="text"
                                    value={config.policies.aboutUsTitle}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        policies: { ...config.policies, aboutUsTitle: e.target.value }
                                    })}
                                    className="w-full text-xs p-3 rounded-xl border border-gray-300"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Texto Institucional
                                </label>
                                <textarea
                                    rows={12}
                                    value={config.policies.aboutUsContent}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        policies: { ...config.policies, aboutUsContent: e.target.value }
                                    })}
                                    className="w-full text-xs font-mono p-4 rounded-xl border border-gray-300 leading-relaxed"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Conteúdo da Aba 6: Depoimentos & Prova Social */}
            {activeSubTab === 'testimonials' && (
                <div className="space-y-6">
                    {/* Formulário de Novo Depoimento */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm space-y-5">
                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Plus size={18} className="text-emerald-600" />
                            Cadastrar Novo Depoimento de Cliente
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Nome do Cliente
                                </label>
                                <input
                                    type="text"
                                    value={newTestimonial.authorName}
                                    onChange={(e) => setNewTestimonial({ ...newTestimonial, authorName: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300"
                                    placeholder="Ex: Carlos Eduardo Silveira"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Cidade / Estado (UF)
                                </label>
                                <input
                                    type="text"
                                    value={newTestimonial.cityState}
                                    onChange={(e) => setNewTestimonial({ ...newTestimonial, cityState: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300"
                                    placeholder="Ex: Belo Horizonte / MG"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Avaliação (Estrelas)
                                </label>
                                <select
                                    value={newTestimonial.rating}
                                    onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: Number(e.target.value) })}
                                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300"
                                >
                                    <option value={5}>⭐⭐⭐⭐⭐ (5 estrelas - Excelente)</option>
                                    <option value={4}>⭐⭐⭐⭐ (4 estrelas - Muito bom)</option>
                                    <option value={3}>⭐⭐⭐ (3 estrelas - Regular)</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Comentário / Relato da Compra
                                </label>
                                <textarea
                                    rows={3}
                                    value={newTestimonial.comment}
                                    onChange={(e) => setNewTestimonial({ ...newTestimonial, comment: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300"
                                    placeholder="Descreva a experiência do cliente com o atendimento, entrega e qualidade dos materiais."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Produto Comprado (Opcional)
                                </label>
                                <input
                                    type="text"
                                    value={newTestimonial.productPurchased}
                                    onChange={(e) => setNewTestimonial({ ...newTestimonial, productPurchased: e.target.value })}
                                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300"
                                    placeholder="Ex: Cabo Flexível 2.5mm²"
                                />

                                <div className="mt-3 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="verifiedCheck"
                                        checked={newTestimonial.verifiedPurchase}
                                        onChange={(e) => setNewTestimonial({ ...newTestimonial, verifiedPurchase: e.target.checked })}
                                        className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                                    />
                                    <label htmlFor="verifiedCheck" className="text-xs text-gray-700 font-bold cursor-pointer">
                                        Compra Verificada
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={handleAddTestimonial}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} />
                                <span>Adicionar à Lista</span>
                            </button>
                        </div>
                    </div>

                    {/* Lista dos Depoimentos Existentes */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900">
                                Depoimentos Cadastrados ({config.testimonials.length})
                            </h3>
                            <span className="text-xs text-gray-500">
                                Ative ou desative depoimentos que aparecem na loja.
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {config.testimonials.map((t) => (
                                <div
                                    key={t.id}
                                    className={`p-4 rounded-2xl border transition-all ${
                                        t.active ? 'bg-slate-50 border-gray-200' : 'bg-gray-100 border-gray-300 opacity-60'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs font-bold text-gray-900">{t.authorName}</h4>
                                                {t.verifiedPurchase && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                                        Compra Verificada
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-500">{t.cityState}</p>
                                        </div>

                                        <div className="flex items-center gap-1 text-amber-500">
                                            {Array.from({ length: t.rating }).map((_, idx) => (
                                                <Star key={idx} size={13} className="fill-amber-400" />
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-700 mt-2 italic leading-relaxed">
                                        "{t.comment}"
                                    </p>

                                    {t.productPurchased && (
                                        <p className="text-[11px] text-brand-primary font-medium mt-2">
                                            Produto: {t.productPurchased}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200 text-xs">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={t.active}
                                                onChange={() => handleToggleTestimonialActive(t.id)}
                                                className="w-4 h-4 accent-brand-primary rounded"
                                            />
                                            <span className="text-[11px] font-bold text-gray-600">
                                                {t.active ? 'Exibido no Site' : 'Oculto'}
                                            </span>
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTestimonial(t.id)}
                                            className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                            title="Excluir depoimento"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Conteúdo da Aba 7: Pré-Visualização em Tempo Real */}
            {activeSubTab === 'preview' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">
                                Prévia do Rodapé com os Dados Atuais
                            </h2>
                            <p className="text-xs text-gray-500">
                                Veja como os clientes verão as informações no rodapé da página.
                            </p>
                        </div>

                        <button
                            onClick={handleSave}
                            type="button"
                            className="px-5 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl shadow hover:bg-brand-dark transition-all flex items-center gap-2"
                        >
                            <Save size={15} />
                            <span>Salvar Dados Agora</span>
                        </button>
                    </div>

                    {/* Preview renderizado simulado */}
                    <div className="rounded-3xl overflow-hidden border border-gray-800 shadow-2xl bg-brand-dark text-brand-light">
                        {/* Faixa de Pilares */}
                        <div className="bg-slate-900/90 border-b border-white/10 px-6 py-4">
                            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div className="flex items-center justify-center space-x-2 text-xs text-gray-200">
                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                    <span>Entrega Rápida e Segura</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2 text-xs text-gray-200">
                                    <RotateCcw size={16} className="text-blue-400" />
                                    <span>Troca Fácil em 7 Dias (CDC)</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2 text-xs text-gray-200">
                                    <MessageCircle size={16} className="text-emerald-400" />
                                    <span>Atendimento WhatsApp</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2 text-xs text-gray-200">
                                    <Lock size={16} className="text-amber-400" />
                                    <span>Pagamento Criptografado SSL</span>
                                </div>
                            </div>
                        </div>

                        {/* Corpo do Rodapé */}
                        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                <h4 className="text-white font-serif font-bold text-lg mb-2">
                                    {config.company.tradeName}
                                </h4>
                                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                                    Soluções completas em materiais elétricos, condutores, ferramentas, hidráulica e design para o seu lar.
                                </p>
                                <div className="text-xs text-gray-400 space-y-1">
                                    <p className="flex items-center gap-1.5">
                                        <Clock size={13} className="text-brand-accent" />
                                        <span>{config.contact.businessHours}</span>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 text-brand-secondary">
                                    Atendimento & Contato
                                </h4>
                                <div className="space-y-2 text-xs text-gray-300">
                                    <p className="flex items-center gap-2">
                                        <MessageCircle size={14} className="text-emerald-400" />
                                        <span className="font-bold text-white">{config.contact.whatsapp}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Phone size={14} className="text-gray-400" />
                                        <span>{config.contact.phone}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Mail size={14} className="text-gray-400" />
                                        <span className="truncate">{config.contact.email}</span>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 text-brand-secondary">
                                    Políticas & Ajuda
                                </h4>
                                <ul className="space-y-1.5 text-xs text-gray-300">
                                    <li className="hover:text-white cursor-pointer transition-colors">
                                        • {config.policies.returnsPolicyTitle}
                                    </li>
                                    <li className="hover:text-white cursor-pointer transition-colors">
                                        • {config.policies.privacyPolicyTitle}
                                    </li>
                                    <li className="hover:text-white cursor-pointer transition-colors">
                                        • {config.policies.termsOfUseTitle}
                                    </li>
                                    <li className="hover:text-white cursor-pointer transition-colors">
                                        • {config.policies.aboutUsTitle}
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 text-brand-secondary">
                                    Segurança & Pagamentos
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        {config.securityBadges.sslEnabled && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950 border border-emerald-500/50 text-[10px] font-bold text-emerald-300">
                                                <Lock size={12} />
                                                <span>SSL 256-Bit</span>
                                            </span>
                                        )}
                                        {config.securityBadges.googleSafeEnabled && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-950 border border-blue-500/50 text-[10px] font-bold text-blue-300">
                                                <ShieldCheck size={12} />
                                                <span>Site Seguro</span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="pt-2">
                                        <span className="text-[10px] text-gray-400 block mb-1">
                                            {config.paymentMethods.installmentsNote}
                                        </span>
                                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-gray-300">
                                            <span className="px-2 py-0.5 rounded bg-white/10">Pix</span>
                                            <span className="px-2 py-0.5 rounded bg-white/10">Visa</span>
                                            <span className="px-2 py-0.5 rounded bg-white/10">Mastercard</span>
                                            <span className="px-2 py-0.5 rounded bg-white/10">Elo</span>
                                            <span className="px-2 py-0.5 rounded bg-white/10">Boleto</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Assinatura Legal */}
                        <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-gray-400 space-y-1">
                            <p>
                                <strong>{config.company.legalName}</strong> • CNPJ: {config.company.cnpj}
                            </p>
                            <p>{formattedAddress}</p>
                            <p className="text-[11px] text-gray-500 pt-1">
                                © {new Date().getFullYear()} {config.company.tradeName}. Todos os direitos reservados.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
