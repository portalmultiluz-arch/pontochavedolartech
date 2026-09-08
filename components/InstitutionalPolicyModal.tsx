import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, RotateCcw, Lock, FileText, Building2, MessageCircle, Printer } from 'lucide-react';
import { InstitutionalFooterConfig } from '../types';
import { buildWhatsAppChatUrl } from '../lib/institutionalFooterConfig';

export type PolicyType = 'returns' | 'privacy' | 'terms' | 'about';

interface InstitutionalPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    policyType: PolicyType;
    config: InstitutionalFooterConfig;
}

export const InstitutionalPolicyModal: React.FC<InstitutionalPolicyModalProps> = ({
    isOpen,
    onClose,
    policyType,
    config
}) => {
    if (!isOpen) return null;

    const getPolicyData = () => {
        switch (policyType) {
            case 'returns':
                return {
                    title: config.policies.returnsPolicyTitle || 'Política de Trocas e Devoluções (CDC Art. 49)',
                    icon: RotateCcw,
                    badge: 'Direito do Consumidor • CDC 8.078/90',
                    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                    content: config.policies.returnsPolicyContent,
                    actionText: 'Iniciar Troca ou Devolução via WhatsApp',
                    actionMessage: 'Olá! Gostaria de orientações sobre a Política de Trocas e Devoluções da Ponto Chave do Lar para o meu pedido.',
                };
            case 'privacy':
                return {
                    title: config.policies.privacyPolicyTitle || 'Política de Privacidade e Proteção de Dados (LGPD)',
                    icon: Lock,
                    badge: 'Conformidade LGPD • Lei 13.709/2018',
                    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
                    content: config.policies.privacyPolicyContent,
                    actionText: 'Dúvidas sobre Privacidade (DPO)',
                    actionMessage: 'Olá! Gostaria de informações sobre o tratamento de dados pessoais (LGPD) na Ponto Chave do Lar.',
                };
            case 'terms':
                return {
                    title: config.policies.termsOfUseTitle || 'Termos e Condições Gerais de Uso',
                    icon: FileText,
                    badge: 'Termos de Contratação e Compra',
                    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
                    content: config.policies.termsOfUseContent,
                    actionText: 'Dúvidas sobre Termos de Uso',
                    actionMessage: 'Olá! Tenho uma dúvida sobre as condições e termos do site da Ponto Chave do Lar.',
                };
            case 'about':
            default:
                return {
                    title: config.policies.aboutUsTitle || 'Sobre a Ponto Chave do Lar',
                    icon: Building2,
                    badge: 'Nossa História & Compromisso',
                    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
                    content: config.policies.aboutUsContent,
                    actionText: 'Falar com Nossa Equipe',
                    actionMessage: 'Olá! Gostaria de saber mais sobre a Ponto Chave do Lar e parcerias.',
                };
        }
    };

    const policy = getPolicyData();
    const IconComponent = policy.icon;

    const handlePrint = () => {
        window.print();
    };

    const whatsAppUrl = buildWhatsAppChatUrl(
        config.contact.whatsappRaw || config.contact.whatsapp,
        policy.actionMessage
    );

    // Converte títulos em Markdown básicos (## e ###) para blocos visuais nítidos
    const renderMarkdownContent = (rawText: string) => {
        if (!rawText) return null;
        const paragraphs = rawText.split('\n\n');

        return (
            <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
                {paragraphs.map((para, idx) => {
                    const trimmed = para.trim();
                    if (!trimmed) return null;

                    if (trimmed.startsWith('### ')) {
                        return (
                            <h4 key={idx} className="text-base font-bold text-gray-900 mt-5 mb-2 flex items-center gap-2 border-b border-gray-100 pb-1.5">
                                <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                                {trimmed.replace('### ', '')}
                            </h4>
                        );
                    }
                    if (trimmed.startsWith('## ')) {
                        return (
                            <h3 key={idx} className="text-lg font-bold font-serif text-brand-dark mt-6 mb-3 border-l-4 border-brand-primary pl-3">
                                {trimmed.replace('## ', '')}
                            </h3>
                        );
                    }
                    if (trimmed === '---') {
                        return <hr key={idx} className="my-4 border-gray-200" />;
                    }

                    // Renderização de listas ou parágrafos normais
                    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\./.test(trimmed)) {
                        const items = trimmed.split('\n');
                        return (
                            <ul key={idx} className="space-y-1.5 pl-4 list-disc text-gray-700">
                                {items.map((it, itemIdx) => {
                                    const clean = it.replace(/^[\*\-]\s+|\d+\.\s+/, '');
                                    return (
                                        <li key={itemIdx} className="pl-1">
                                            {clean}
                                        </li>
                                    );
                                })}
                            </ul>
                        );
                    }

                    return (
                        <p key={idx} className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {trimmed}
                        </p>
                    );
                })}
            </div>
        );
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
                >
                    {/* Header do Modal */}
                    <div className="bg-gradient-to-r from-brand-dark to-slate-900 text-white p-6 relative flex items-start justify-between border-b border-white/10">
                        <div className="flex items-start space-x-3.5 pr-8">
                            <div className="p-3 bg-brand-primary/20 border border-brand-primary/30 text-brand-secondary rounded-xl shrink-0 mt-0.5">
                                <IconComponent size={24} />
                            </div>
                            <div>
                                <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full border mb-1.5 ${policy.badgeColor}`}>
                                    {policy.badge}
                                </span>
                                <h2 className="text-xl font-bold font-serif text-white tracking-tight">
                                    {policy.title}
                                </h2>
                                <p className="text-xs text-gray-300 mt-1">
                                    {config.company.tradeName} • CNPJ {config.company.cnpj || 'Em validação oficial'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                            <button
                                onClick={handlePrint}
                                title="Imprimir documento"
                                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Printer size={18} />
                            </button>
                            <button
                                onClick={onClose}
                                title="Fechar"
                                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Conteúdo scrollável com texto completo */}
                    <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            {renderMarkdownContent(policy.content)}
                        </div>

                        {/* Box de Segurança Jurídica e Atendimento */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-3">
                                <ShieldCheck className="text-amber-700 shrink-0" size={22} />
                                <div>
                                    <h5 className="text-xs font-bold text-amber-900">
                                        Atendimento e Garantia Oficial
                                    </h5>
                                    <p className="text-[11px] text-amber-800">
                                        Horário: {config.contact.businessHours || 'Segunda a Sexta das 08h às 18h'}
                                    </p>
                                </div>
                            </div>

                            {whatsAppUrl !== '#' && (
                                <a
                                    href={whatsAppUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition-all shrink-0"
                                >
                                    <MessageCircle size={15} />
                                    <span>{policy.actionText}</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Rodapé do Modal */}
                    <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                        <span>
                            Atualizado conforme Decreto Federal nº 7.962/2013 e CDC.
                        </span>
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-colors"
                        >
                            Fechar Documento
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
