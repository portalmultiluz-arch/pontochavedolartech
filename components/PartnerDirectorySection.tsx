import React, { useState, useMemo } from 'react';
import { 
    Users, 
    ShieldCheck, 
    Star, 
    MapPin, 
    Phone, 
    ExternalLink, 
    Search, 
    CheckCircle2, 
    Info, 
    Sparkles, 
    ArrowRight,
    Filter,
    FileText,
    MessageCircle
} from 'lucide-react';
import { PartnerProvider, PartnerMarketplaceSettings } from '../types';
import { SPECIALTY_LABELS, DEFAULT_PARTNER_MARKETPLACE_SETTINGS, INITIAL_PARTNER_PROVIDERS } from '../data/curatedPartners';
import { motion, AnimatePresence } from 'motion/react';

interface PartnerDirectorySectionProps {
    partners?: PartnerProvider[];
    settings?: PartnerMarketplaceSettings;
    onSelectPartnerForDirectContact?: (partner: PartnerProvider) => void;
}

export const PartnerDirectorySection: React.FC<PartnerDirectorySectionProps> = ({
    partners = INITIAL_PARTNER_PROVIDERS,
    settings = DEFAULT_PARTNER_MARKETPLACE_SETTINGS,
    onSelectPartnerForDirectContact
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
    const [selectedPartnerDetails, setSelectedPartnerDetails] = useState<PartnerProvider | null>(null);
    const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(false);

    // Se o módulo estiver desativado pelo administrador, retorna null (Kill Switch)
    if (!settings.isEnabled) {
        return null;
    }

    const activePartners = useMemo(() => {
        return partners
            .filter(p => {
                // Apenas exibe se o status for ativo e não estiver explicitamente suspenso
                const isExplicitlySuspended = p.subscriptionStatus === 'suspended';
                return (p.status === 'active' || p.status === undefined) && !isExplicitlySuspended;
            })
            .sort((a, b) => {
                // Prioriza parceiros com Destaque VIP / isFeatured no topo da vitrine
                if (a.isFeatured && !b.isFeatured) return -1;
                if (!a.isFeatured && b.isFeatured) return 1;
                return (b.rating || 0) - (a.rating || 0);
            });
    }, [partners]);

    const filteredPartners = useMemo(() => {
        return activePartners.filter(p => {
            const query = searchQuery.toLowerCase();
            const matchesSearch = 
                p.name.toLowerCase().includes(query) ||
                (p.tradeName && p.tradeName.toLowerCase().includes(query)) ||
                p.city.toLowerCase().includes(query) ||
                p.coverageAreas.some(area => area.toLowerCase().includes(query)) ||
                (p.bio && p.bio.toLowerCase().includes(query));

            const matchesSpecialty = selectedSpecialty === 'all' || p.specialty === selectedSpecialty;

            return matchesSearch && matchesSpecialty;
        });
    }, [activePartners, searchQuery, selectedSpecialty]);

    const specialtyCategories = useMemo(() => {
        const counts: Record<string, number> = { all: activePartners.length };
        activePartners.forEach(p => {
            counts[p.specialty] = (counts[p.specialty] || 0) + 1;
        });
        return counts;
    }, [activePartners]);

    const generateWhatsAppLink = (partner: PartnerProvider) => {
        const phoneDigits = partner.phone.replace(/\D/g, '');
        const message = `Olá ${partner.name}! Vi seu perfil credenciado no Guia de Especialistas da Ponto Chave do Lar e gostaria de solicitar um orçamento para serviço.`;
        return `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(message)}`;
    };

    return (
        <section id="partner-installers" className="py-20 bg-slate-900 text-white relative overflow-hidden font-sans border-t border-b border-amber-500/20">
            {/* Elementos visuais decorativos sutis */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Header da Seção */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                                <Sparkles size={12} className="text-amber-400" />
                                <span>Guia de Especialistas & Instaladores</span>
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">
                                Contato Direto & Sem Taxas
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight">
                            Compre o material na loja e <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200">
                                contrate instaladores autônomos
                            </span>
                        </h2>
                    </div>

                    <p className="text-slate-300 text-xs md:text-sm max-w-md leading-relaxed">
                        Conectamos você diretamente aos melhores eletricistas, pedreiros, vidraceiros, serralheiros, instaladores e montadores credenciados da sua região.
                    </p>
                </div>

                {/* Filtros e Busca de Profissionais */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 md:p-6 mb-10 shadow-2xl backdrop-blur-sm">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Campo de Busca */}
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por bairro, cidade, especialidade..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700/80 rounded-2xl text-xs md:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                            />
                        </div>

                        {/* Filtros por Especialidade */}
                        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-thin">
                            <button
                                type="button"
                                onClick={() => setSelectedSpecialty('all')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                    selectedSpecialty === 'all'
                                        ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                                }`}
                            >
                                <span>Todos ({specialtyCategories['all'] || 0})</span>
                            </button>

                            {Object.entries(SPECIALTY_LABELS).map(([key, item]) => {
                                const count = specialtyCategories[key];
                                if (!count && count !== 0) return null;

                                const isSelected = selectedSpecialty === key;

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setSelectedSpecialty(key)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                            isSelected
                                                ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                                                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        <span className="text-[10px] opacity-70">({count || 0})</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Grade de Cards de Profissionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {filteredPartners.map((partner, index) => {
                        const spec = SPECIALTY_LABELS[partner.specialty] || SPECIALTY_LABELS.outro;
                        const waLink = generateWhatsAppLink(partner);

                        return (
                            <motion.div
                                key={partner.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-slate-950 border border-slate-800 hover:border-amber-400/50 rounded-3xl p-6 transition-all hover:shadow-2xl flex flex-col justify-between group"
                            >
                                <div>
                                    {/* Topo do Card */}
                                    <div className="flex items-start gap-3.5 mb-4">
                                        <img
                                            src={partner.profileImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                                            alt={partner.name}
                                            className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0 group-hover:scale-105 transition-transform"
                                        />
                                        <div className="overflow-hidden">
                                            <h3 className="font-bold text-white text-base leading-tight truncate">
                                                {partner.name}
                                            </h3>
                                            {partner.tradeName && (
                                                <span className="text-[11px] text-amber-400/90 font-medium block truncate">
                                                    {partner.tradeName}
                                                </span>
                                            )}
                                            <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-amber-300">
                                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                                <span>{partner.rating.toFixed(1)}</span>
                                                <span className="text-slate-500 font-normal">({partner.reviewCount} avaliações)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Especialidade Tag */}
                                    <div className="mb-3.5">
                                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-200 inline-block">
                                            {spec.label}
                                        </span>
                                    </div>

                                    {/* Resumo de Atuação / Bio */}
                                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                                        {partner.bio}
                                    </p>

                                    {/* Badges de Verificação */}
                                    {partner.verifiedBadges && partner.verifiedBadges.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {partner.verifiedBadges.map((badge, bIdx) => (
                                                <span key={bIdx} className="text-[10px] font-semibold bg-slate-900 text-emerald-400 border border-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                    <ShieldCheck size={11} className="text-emerald-400 shrink-0" />
                                                    {badge}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Regiões Atendidas */}
                                    <div className="text-[11px] text-slate-400 space-y-1.5 pt-3 border-t border-slate-800/80">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={12} className="text-amber-400 shrink-0" />
                                            <span className="truncate">{partner.city}/{partner.state} • {partner.coverageAreas.slice(0, 2).join(', ')}</span>
                                        </div>
                                        {partner.priceRangeDescription && (
                                            <div className="text-[10px] text-slate-400 italic truncate">
                                                {partner.priceRangeDescription}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Botão WhatsApp Direto */}
                                <div className="mt-5 pt-4 border-t border-slate-800">
                                    <a
                                        href={waLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-600/30 transition-all"
                                    >
                                        <MessageCircle size={15} />
                                        <span>Orçamento no WhatsApp</span>
                                    </a>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {filteredPartners.length === 0 && (
                    <div className="text-center py-16 bg-slate-950 rounded-3xl border border-slate-800 max-w-lg mx-auto">
                        <Users size={32} className="mx-auto text-slate-500 mb-3" />
                        <h4 className="font-bold text-white text-base">Nenhum profissional encontrado</h4>
                        <p className="text-xs text-slate-400 mt-1">
                            Tente buscar com outro termo ou selecionar outra especialidade.
                        </p>
                    </div>
                )}

                {/* Box de Blindagem Jurídica e Isenção de Responsabilidade (CDC / STJ) */}
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0 mt-0.5">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                                    Aviso de Transparência & Isenção de Responsabilidade Técnica
                                </h4>
                                <p className="text-[11px] text-slate-400 mt-1 max-w-3xl leading-relaxed">
                                    {settings.disclaimerText || DEFAULT_PARTNER_MARKETPLACE_SETTINGS.disclaimerText}
                                </p>
                            </div>
                        </div>

                        <a
                            href="#contact"
                            className="text-xs font-bold text-amber-400 hover:text-amber-300 whitespace-nowrap flex items-center gap-1 underline underline-offset-4"
                        >
                            <span>Deseja se cadastrar como parceiro?</span>
                            <ArrowRight size={13} />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
