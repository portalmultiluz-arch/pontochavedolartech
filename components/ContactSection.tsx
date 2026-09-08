import React, { useState, useEffect } from 'react';
import { Clock, MessageCircle, MapPin, RotateCcw, Mail, AlertCircle, ExternalLink, Calendar } from 'lucide-react';
import { InstitutionalFooterConfig } from '../types';
import { DEFAULT_INSTITUTIONAL_FOOTER_CONFIG, formatFullAddress, buildWhatsAppChatUrl } from '../lib/institutionalFooterConfig';
import { subscribeToDoc } from '../services/firebaseService';

export const ContactSection: React.FC = () => {
    const [config, setConfig] = useState<InstitutionalFooterConfig>(DEFAULT_INSTITUTIONAL_FOOTER_CONFIG);

    useEffect(() => {
        const unsub = subscribeToDoc('siteSettings', 'institutionalFooter', (data) => {
            if (data) {
                setConfig({
                    ...DEFAULT_INSTITUTIONAL_FOOTER_CONFIG,
                    ...(data as InstitutionalFooterConfig),
                    company: { ...DEFAULT_INSTITUTIONAL_FOOTER_CONFIG.company, ...(data as any)?.company },
                    contact: { ...DEFAULT_INSTITUTIONAL_FOOTER_CONFIG.contact, ...(data as any)?.contact },
                });
            }
        });

        return () => unsub();
    }, []);

    const formattedAddress = formatFullAddress(config.company);
    const whatsAppUrl = buildWhatsAppChatUrl(
        config.contact.whatsappRaw || config.contact.whatsapp,
        config.contact.whatsappDefaultMessage || 'Olá! Gostaria de atendimento da Ponto Chave do Lar.'
    );

    return (
        <section id="contact" className="bg-gradient-to-b from-brand-primary to-brand-dark text-white py-16 sm:py-20 font-sans">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto space-y-10">
                    {/* Cabeçalho */}
                    <div className="text-center space-y-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/15 text-xs font-bold uppercase tracking-wider">
                            <Clock size={14} />
                            <span>Atendimento & Suporte ao Cliente</span>
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight">
                            Fale Conosco
                        </h2>
                        <p className="text-sm sm:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed">
                            Canais oficiais de atendimento, informações de logística e agendamento de serviços.
                        </p>
                    </div>

                    {/* Card Principal de Contato & Políticas Operacionais */}
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Bloco 1: Atendimento Online */}
                            <div className="bg-black/25 rounded-2xl p-5 border border-white/10 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Atendimento Online</h3>
                                        <p className="text-xs text-amber-300 font-semibold">
                                            {config.contact.businessHours || 'Segunda a sexta, das 8h às 18h | Sábados, das 8h às 12h'}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                    Atendimento ágil e consultoria especializada via <strong>WhatsApp</strong>, <strong>e-mail</strong> ou <strong>chat do site</strong>.
                                </p>
                                <div className="pt-2 flex flex-wrap gap-2">
                                    <a
                                        href={whatsAppUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                                    >
                                        <MessageCircle size={15} />
                                        <span>Conversar no WhatsApp</span>
                                    </a>
                                    <a
                                        href={`mailto:${config.contact.email || 'portalmultiluz@gmail.com'}`}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all"
                                    >
                                        <Mail size={15} />
                                        <span>E-mail</span>
                                    </a>
                                </div>
                            </div>

                            {/* Bloco 2: Trocas e Devoluções Presenciais */}
                            <div className="bg-black/25 rounded-2xl p-5 border border-white/10 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-400/20 text-purple-300 flex items-center justify-center font-bold">
                                        <RotateCcw size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Trocas e Devoluções Presenciais</h3>
                                        <p className="text-xs text-purple-300 font-semibold">
                                            Mediante agendamento: Seg a Sex, das 9h às 17h
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                    Para sua comodidade e segurança, devoluções presenciais devem ser agendadas previamente através do nosso WhatsApp oficial:
                                </p>
                                <div className="pt-2">
                                    <a
                                        href={whatsAppUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
                                    >
                                        <Calendar size={15} />
                                        <span>Agendar pelo WhatsApp {config.contact.whatsapp}</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Bloco de Endereço & Ponto de Apoio Logístico */}
                        <div className="bg-black/30 rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-sky-400/20 text-sky-300 flex items-center justify-center font-bold shrink-0 mt-0.5">
                                    <MapPin size={20} />
                                </div>
                                <div className="space-y-1 text-xs">
                                    <h4 className="font-bold text-white text-sm">
                                        Ponto de Apoio para Logística, Entregas e Devoluções
                                    </h4>
                                    <p className="text-gray-200 font-medium">
                                        {formattedAddress || 'Av. Afonso Pena, 1500, Loja 02, Centro - Belo Horizonte / MG'}
                                    </p>
                                    <p className="text-amber-300 text-[11px] font-semibold flex items-center gap-1 pt-1">
                                        <AlertCircle size={13} className="shrink-0" />
                                        <span>Importante: Não realizamos atendimento presencial sem agendamento prévio.</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};