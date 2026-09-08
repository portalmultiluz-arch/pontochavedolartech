import React, { useState, useEffect } from 'react';
import { 
    Phone, 
    Mail, 
    Clock, 
    MessageCircle, 
    ShieldCheck, 
    Lock, 
    RotateCcw, 
    CheckCircle2, 
    CreditCard, 
    QrCode, 
    FileText, 
    Star, 
    Building2,
    ExternalLink,
    ChevronRight,
    Briefcase
} from 'lucide-react';
import { IconLogo } from './IconLogo';
import { InstitutionalPolicyModal, PolicyType } from './InstitutionalPolicyModal';
import { WorkWithUsModal } from './WorkWithUsModal';
import { InstitutionalFooterConfig } from '../types';
import { 
    DEFAULT_INSTITUTIONAL_FOOTER_CONFIG, 
    formatFullAddress, 
    buildWhatsAppChatUrl 
} from '../lib/institutionalFooterConfig';
import { subscribeToDoc } from '../services/firebaseService';
import { evaluateStoreStatus } from '../lib/storeOperatingHours';

interface FooterProps {
    onAdminClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
    const [config, setConfig] = useState<InstitutionalFooterConfig>(DEFAULT_INSTITUTIONAL_FOOTER_CONFIG);
    const [activePolicyModal, setActivePolicyModal] = useState<PolicyType | null>(null);
    const [isCareersModalOpen, setIsCareersModalOpen] = useState(false);
    const storeStatus = evaluateStoreStatus();

    useEffect(() => {
        // Escuta configurações do Firestore
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
                    careers: { ...DEFAULT_INSTITUTIONAL_FOOTER_CONFIG.careers, ...(data as any)?.careers },
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

    const formattedAddress = formatFullAddress(config.company);
    const whatsAppUrl = buildWhatsAppChatUrl(
        config.contact.whatsappRaw || config.contact.whatsapp,
        config.contact.whatsappDefaultMessage
    );

    const activeTestimonials = config.testimonials.filter(t => t.active);

    return (
        <footer className="bg-gradient-to-b from-brand-dark via-slate-950 to-slate-950 text-brand-light border-t border-white/10 font-sans">
            {/* 1. Barra Superior de Pilares de Confiança & Garantias */}
            {config.displayOptions.showTrustPillars && (
                <div className="border-b border-white/10 bg-black/30 py-5">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-white tracking-wide">Entrega Segura</h5>
                                    <p className="text-[11px] text-gray-400">Rastreamento e agilidade</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setActivePolicyModal('returns')}
                                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <RotateCcw size={20} />
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-white tracking-wide flex items-center gap-1 group-hover:text-brand-secondary transition-colors">
                                        Troca Fácil em 7 Dias
                                        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h5>
                                    <p className="text-[11px] text-gray-400">Direito do consumidor (CDC Art. 49)</p>
                                </div>
                            </button>

                            {whatsAppUrl !== '#' ? (
                                <a
                                    href={whatsAppUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                        <MessageCircle size={20} />
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-bold text-emerald-400 tracking-wide flex items-center gap-1">
                                            Suporte no WhatsApp
                                            <ExternalLink size={11} />
                                        </h5>
                                        <p className="text-[11px] text-gray-300 font-semibold">{config.contact.whatsapp}</p>
                                    </div>
                                </a>
                            ) : (
                                <div className="flex items-center space-x-3 p-2 rounded-xl">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                                        <MessageCircle size={20} />
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-bold text-emerald-400">Atendimento WhatsApp</h5>
                                        <p className="text-[11px] text-gray-400">{config.contact.whatsapp}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-white tracking-wide">SSL 256-Bit Ativo</h5>
                                    <p className="text-[11px] text-gray-400">Ambiente 100% Criptografado</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Faixa Opcional de Depoimentos & Prova Social */}
            {config.displayOptions.showTestimonials && activeTestimonials.length > 0 && (
                <div className="border-b border-white/10 bg-white/[0.02] py-8">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Star className="text-amber-400 fill-amber-400" size={16} />
                                <h4 className="text-xs uppercase tracking-wider font-extrabold text-brand-secondary">
                                    O que nossos clientes dizem
                                </h4>
                            </div>
                            <span className="text-[11px] text-gray-400">
                                Avaliações verificadas de compras reais
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {activeTestimonials.slice(0, 3).map((item) => (
                                <div 
                                    key={item.id}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1 text-amber-400">
                                            {Array.from({ length: item.rating }).map((_, idx) => (
                                                <Star key={idx} size={13} className="fill-amber-400" />
                                            ))}
                                        </div>
                                        {item.verifiedPurchase && (
                                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                                Compra Verificada
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-300 italic mb-2 leading-relaxed">
                                        "{item.comment}"
                                    </p>
                                    <div className="text-[11px] text-gray-400">
                                        <strong className="text-white font-medium">{item.authorName}</strong> • {item.cityState}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Grade Principal de Conteúdo do Rodapé (4 Colunas) */}
            <div className="container mx-auto px-4 md:px-6 py-10 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
                    {/* Coluna 1: Identidade da Loja */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <IconLogo className="h-8 w-8 text-brand-accent" />
                            <span className="text-xl font-bold font-serif text-white tracking-tight">
                                {config.company.tradeName}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Materiais elétricos, condutores de alta performance, ferramentas, iluminação, conexões hidráulicas e soluções em design. Qualidade assegurada com atendimento técnico especializado.
                        </p>

                        {/* Horário de Atendimento e Expedição Oficial */}
                        <div className="pt-2">
                            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1.5 text-xs font-bold text-white uppercase tracking-wider">
                                        <Clock size={14} className="text-brand-accent" />
                                        <span>Horário de Funcionamento</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                        storeStatus.isOpen 
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${storeStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                                        {storeStatus.isOpen ? 'Aberto Agora' : 'Fechado no Momento'}
                                    </span>
                                </div>
                                <div className="text-[11px] text-gray-300 space-y-1">
                                    <div className="flex items-center justify-between text-gray-200">
                                        <span className="font-semibold text-white">Segunda a Sexta-feira:</span>
                                        <span className="font-mono text-brand-secondary font-bold">08h00 às 18h00</span>
                                    </div>
                                    <div className="flex items-center justify-between text-gray-200">
                                        <span className="font-semibold text-white">Sábados:</span>
                                        <span className="font-mono text-brand-secondary font-bold">08h00 às 13h00</span>
                                    </div>
                                    <div className="flex items-center justify-between text-gray-400">
                                        <span>Domingos e Feriados:</span>
                                        <span className="text-rose-400/90 font-medium">Fechado</span>
                                    </div>
                                </div>
                                <div className="text-[10px] text-gray-400 border-t border-white/10 pt-1.5">
                                    {storeStatus.isOpen 
                                        ? `Atendimento online, balcão e expedição ativos hoje.` 
                                        : `Próxima abertura: ${storeStatus.nextOpeningText}. Pedidos finalizáveis no horário comercial.`}
                                </div>
                            </div>
                        </div>

                        {/* Redes Sociais */}
                        {config.displayOptions.showSocialLinks && (
                            <div className="pt-2">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-2">
                                    Redes Sociais Oficiais:
                                </span>
                                <div className="flex items-center space-x-3">
                                    {config.social.instagramUrl && (
                                        <a
                                            href={config.social.instagramUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Instagram da Ponto Chave do Lar"
                                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-brand-secondary hover:text-white flex items-center justify-center transition-all"
                                        >
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.316 1.363.364 2.427.048 1.067.06 1.407.06 4.156 0 2.75-.012 3.09-.06 4.156-.048 1.064-.217 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.316-2.427.364-1.067.048-1.407.06-4.156.06-2.75 0-3.09-.012-4.156-.06-1.064-.048-1.791-.217-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.316-1.363-.364-2.427C2.013 15.09 2 14.75 2 12s.013-3.09.06-4.156c.048-1.064.217-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.316 2.427-.364C8.93 2.013 9.27 2 12 2h.315zM12 7.158c-2.673 0-4.842 2.169-4.842 4.842s2.169 4.842 4.842 4.842 4.842-2.169 4.842-4.842S14.673 7.158 12 7.158zM12 15a3 3 0 110-6 3 3 0 010 6zm6.302-8.12a1.32 1.32 0 11-2.64 0 1.32 1.32 0 012.64 0z" clipRule="evenodd" />
                                            </svg>
                                        </a>
                                    )}
                                    {config.social.facebookUrl && (
                                        <a
                                            href={config.social.facebookUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Facebook da Ponto Chave do Lar"
                                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-brand-secondary hover:text-white flex items-center justify-center transition-all"
                                        >
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Coluna 2: Atendimento & Canais Diretos */}
                    <div className="space-y-4">
                        <h4 className="text-xs uppercase tracking-wider font-extrabold text-brand-secondary border-b border-white/10 pb-2">
                            Atendimento & SAC
                        </h4>
                        
                        <div className="space-y-3 text-xs text-gray-300">
                            {/* WhatsApp */}
                            {whatsAppUrl !== '#' ? (
                                <a
                                    href={whatsAppUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500 text-white flex items-center justify-between group transition-all"
                                >
                                    <div className="flex items-center space-x-2.5">
                                        <MessageCircle size={18} className="text-emerald-400" />
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                                                WhatsApp Vendas & SAC
                                            </span>
                                            <span className="font-bold text-sm text-white">
                                                {config.contact.whatsapp}
                                            </span>
                                        </div>
                                    </div>
                                    <ExternalLink size={14} className="text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                                </a>
                            ) : (
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <span className="text-[10px] text-gray-400 block">WhatsApp Oficial</span>
                                    <span className="font-bold text-white text-sm">{config.contact.whatsapp}</span>
                                </div>
                            )}

                            {/* Telefone Fixo */}
                            <div className="flex items-center space-x-2.5 text-gray-300">
                                <Phone size={15} className="text-brand-accent shrink-0" />
                                <div>
                                    <span className="text-[10px] text-gray-400 block">Central Telefônica:</span>
                                    <span className="font-medium text-white">{config.contact.phone}</span>
                                </div>
                            </div>

                            {/* E-mail */}
                            <div className="flex items-center space-x-2.5 text-gray-300">
                                <Mail size={15} className="text-brand-accent shrink-0" />
                                <div className="overflow-hidden">
                                    <span className="text-[10px] text-gray-400 block">E-mail para Atendimento:</span>
                                    <span className="font-medium text-white break-all">{config.contact.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coluna 3: Políticas Oficiais & Direitos do Consumidor */}
                    <div className="space-y-4">
                        <h4 className="text-xs uppercase tracking-wider font-extrabold text-brand-secondary border-b border-white/10 pb-2">
                            Políticas & Direitos CDC
                        </h4>

                        <ul className="space-y-2 text-xs text-gray-300">
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setActivePolicyModal('returns')}
                                    className="hover:text-white text-left transition-colors flex items-center space-x-2 py-1 group"
                                >
                                    <RotateCcw size={13} className="text-brand-accent group-hover:rotate-45 transition-transform" />
                                    <span className="group-hover:underline">
                                        {config.policies.returnsPolicyTitle}
                                    </span>
                                </button>
                            </li>

                            <li>
                                <button
                                    type="button"
                                    onClick={() => setActivePolicyModal('privacy')}
                                    className="hover:text-white text-left transition-colors flex items-center space-x-2 py-1 group"
                                >
                                    <Lock size={13} className="text-brand-accent" />
                                    <span className="group-hover:underline">
                                        {config.policies.privacyPolicyTitle}
                                    </span>
                                </button>
                            </li>

                            <li>
                                <button
                                    type="button"
                                    onClick={() => setActivePolicyModal('terms')}
                                    className="hover:text-white text-left transition-colors flex items-center space-x-2 py-1 group"
                                >
                                    <FileText size={13} className="text-brand-accent" />
                                    <span className="group-hover:underline">
                                        {config.policies.termsOfUseTitle}
                                    </span>
                                </button>
                            </li>

                            <li>
                                <button
                                    type="button"
                                    onClick={() => setActivePolicyModal('about')}
                                    className="hover:text-white text-left transition-colors flex items-center space-x-2 py-1 group"
                                >
                                    <Building2 size={13} className="text-brand-accent" />
                                    <span className="group-hover:underline">
                                        {config.policies.aboutUsTitle}
                                    </span>
                                </button>
                            </li>

                            {config.careers?.enabled !== false && config.careers?.showInFooter !== false && (
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => setIsCareersModalOpen(true)}
                                        className="hover:text-white text-left transition-colors flex items-center space-x-2 py-1 group"
                                    >
                                        <Briefcase size={13} className="text-brand-accent group-hover:scale-110 transition-transform" />
                                        <span className="group-hover:underline">
                                            {config.careers?.title || 'Trabalhe Conosco'}
                                        </span>
                                        <span className="text-[9px] bg-brand-accent/20 text-brand-secondary font-bold px-1.5 py-0.5 rounded border border-brand-accent/30 ml-1">
                                            Vagas
                                        </span>
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Coluna 4: Segurança & Meios de Pagamento */}
                    <div className="space-y-4">
                        <h4 className="text-xs uppercase tracking-wider font-extrabold text-brand-secondary border-b border-white/10 pb-2">
                            Segurança & Pagamentos
                        </h4>

                        {/* Selos de Segurança */}
                        <div className="space-y-2">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                                Certificados de Segurança:
                            </span>

                            <div className="flex flex-wrap gap-2">
                                {config.securityBadges.sslEnabled && (
                                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                                        <Lock size={12} className="text-emerald-400" />
                                        <span>SSL 256-Bit</span>
                                    </div>
                                )}

                                {config.securityBadges.googleSafeEnabled && (
                                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-blue-950/60 border border-blue-500/40 text-blue-300 text-[11px] font-bold">
                                        <ShieldCheck size={12} className="text-blue-400" />
                                        <span>Site Seguro</span>
                                    </div>
                                )}

                                {config.securityBadges.lgpdEnabled && (
                                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[11px] font-bold">
                                        <CheckCircle2 size={12} className="text-purple-400" />
                                        <span>LGPD Conforme</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Formas de Pagamento & Bandeiras */}
                        <div className="space-y-2 pt-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                                Formas de Recebimento Aceitas:
                            </span>

                            {/* Badge Pix */}
                            {config.paymentMethods.pixEnabled && (
                                <div className="flex items-center space-x-2 bg-teal-950/50 border border-teal-500/40 px-3 py-1.5 rounded-lg text-teal-300 text-xs font-bold">
                                    <QrCode size={14} className="text-teal-400" />
                                    <span>Pix ({config.paymentMethods.pixBadgeText})</span>
                                </div>
                            )}

                            {/* Bandeiras de Cartão */}
                            {config.paymentMethods.creditCardsEnabled && (
                                <div>
                                    <p className="text-[11px] text-gray-400 mb-1.5">
                                        {config.paymentMethods.installmentsNote}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                                        <span className="px-2 py-1 bg-white/10 rounded border border-white/10 text-white">VISA</span>
                                        <span className="px-2 py-1 bg-white/10 rounded border border-white/10 text-white">MASTERCARD</span>
                                        <span className="px-2 py-1 bg-white/10 rounded border border-white/10 text-white">ELO</span>
                                        <span className="px-2 py-1 bg-white/10 rounded border border-white/10 text-white">HIPERCARD</span>
                                        <span className="px-2 py-1 bg-white/10 rounded border border-white/10 text-white">AMEX</span>
                                        {config.paymentMethods.boletoEnabled && (
                                            <span className="px-2 py-1 bg-white/10 rounded border border-white/10 text-white">BOLETO</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {config.paymentMethods.mercadoPagoEnabled && (
                                <div className="text-[10px] text-sky-400 flex items-center gap-1 pt-0.5">
                                    <ShieldCheck size={12} />
                                    <span>Processamento seguro certificado Mercado Pago / PCI-DSS</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Assinatura Legal Obrigatória (Decreto Federal nº 7.962/2013) */}
            {config.displayOptions.showLegalText && (
                <div className="border-t border-white/10 bg-black/40 py-6">
                    <div className="container mx-auto px-4 md:px-6 text-center space-y-2">
                        <p className="text-xs text-gray-300 leading-relaxed font-sans max-w-4xl mx-auto">
                            <strong>{config.company.legalName}</strong> • CNPJ: <span className="font-mono text-white">{config.company.cnpj}</span> • Inscrição Estadual: {config.company.stateRegistration}
                        </p>
                        <p className="text-xs text-gray-400 max-w-4xl mx-auto">
                            Endereço da Sede: {formattedAddress}
                        </p>
                        <p className="text-[11px] text-gray-500 pt-1">
                            © {new Date().getFullYear()} {config.company.tradeName}. Todos os direitos reservados. Os preços e condições de pagamento são válidos exclusivamente para compras via internet e podem diferir da loja física.
                        </p>

                        {/* Botão Seguro de Acesso Restrito ao Painel */}
                        <div className="pt-3">
                            <button 
                                onClick={onAdminClick} 
                                className="inline-flex items-center space-x-1.5 text-xs text-gray-500 hover:text-brand-secondary transition-colors duration-300 px-3 py-1 rounded-full hover:bg-white/5"
                            >
                                <Lock size={12} />
                                <span>Acesso Restrito / Gestão</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Políticas Institucionais Interativo */}
            {activePolicyModal && (
                <InstitutionalPolicyModal
                    isOpen={Boolean(activePolicyModal)}
                    onClose={() => setActivePolicyModal(null)}
                    policyType={activePolicyModal}
                    config={config}
                />
            )}

            {/* Modal Trabalhe Conosco & Envio de Currículos */}
            {isCareersModalOpen && (
                <WorkWithUsModal
                    isOpen={isCareersModalOpen}
                    onClose={() => setIsCareersModalOpen(false)}
                    config={config}
                />
            )}
        </footer>
    );
};
