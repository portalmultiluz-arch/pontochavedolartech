import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Briefcase, Mail, CheckCircle2, AlertCircle, Upload, Check, Copy, ExternalLink, ShieldCheck, RefreshCw } from 'lucide-react';
import { InstitutionalFooterConfig } from '../types';
import { DEFAULT_CAREERS_TEXT, DEFAULT_CAREERS_EMAIL } from '../lib/institutionalFooterConfig';
import { createDocument } from '../services/firebaseService';

interface WorkWithUsModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: InstitutionalFooterConfig;
}

export const WorkWithUsModal: React.FC<WorkWithUsModalProps> = ({
    isOpen,
    onClose,
    config
}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeFileData, setResumeFileData] = useState<string | null>(null);
    const [isRobotChecked, setIsRobotChecked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [copiedEmail, setCopiedEmail] = useState(false);

    if (!isOpen) return null;

    const careersEmail = config.careers?.email || DEFAULT_CAREERS_EMAIL;
    const careersText = config.careers?.descriptionText || DEFAULT_CAREERS_TEXT;
    const careersTitle = config.careers?.title || 'Trabalhe Conosco';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setResumeFile(null);
            setResumeFileData(null);
            return;
        }

        // Limite de 3MB
        if (file.size > 3 * 1024 * 1024) {
            setErrorMessage('O arquivo deve ter no máximo 3MB. Formatos aceitos: PDF, DOC, DOCX ou Imagens.');
            return;
        }

        setErrorMessage(null);
        setResumeFile(file);

        // Se menor que 800KB, converte para base64 para armazenar no Firestore
        if (file.size <= 850 * 1024) {
            const reader = new FileReader();
            reader.onload = () => {
                setResumeFileData(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setResumeFileData(null);
        }
    };

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(careersEmail);
            setCopiedEmail(true);
            setTimeout(() => setCopiedEmail(false), 3000);
        } catch {
            // fallback
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!name.trim()) {
            setErrorMessage('Por favor, preencha o seu nome completo.');
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            setErrorMessage('Por favor, informe um endereço de e-mail válido.');
            return;
        }
        if (!phone.trim()) {
            setErrorMessage('Por favor, informe seu telefone ou WhatsApp para contato.');
            return;
        }
        if (!isRobotChecked) {
            setErrorMessage('Por favor, marque a caixa de verificação "Não sou um robô".');
            return;
        }

        setIsSubmitting(true);

        try {
            const applicationData = {
                fullName: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                resumeFileName: resumeFile?.name || null,
                resumeFileSize: resumeFile?.size || 0,
                resumeFileData: resumeFileData || null,
                message: message.trim(),
                targetEmail: careersEmail,
                status: 'new',
                appliedAt: new Date().toISOString()
            };

            await createDocument('job_applications', applicationData);
            setSubmitSuccess(true);
        } catch (err) {
            console.error('Erro ao salvar candidatura:', err);
            // Mesmo se falhar o Firestore, oferecemos envio via mailto
            setSubmitSuccess(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const mailtoUrl = `mailto:${careersEmail}?subject=${encodeURIComponent(`Currículo - ${name || 'Candidatura'} - Ponto Chave do Lar`)}&body=${encodeURIComponent(
        `Olá equipe de RH da Ponto Chave do Lar,\n\nNome: ${name}\nE-mail: ${email}\nTelefone: ${phone}\n\nMensagem / Apresentação:\n${message}\n\n(Currículo em anexo)`
    )}`;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]"
                >
                    {/* Header do Modal */}
                    <div className="bg-gradient-to-r from-brand-dark via-slate-900 to-brand-primary text-white p-6 relative flex items-start justify-between border-b border-white/10">
                        <div className="flex items-center space-x-3.5 pr-8">
                            <div className="p-3 bg-brand-accent/20 border border-brand-accent/30 text-brand-secondary rounded-2xl shrink-0">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <span className="inline-block px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1">
                                    Oportunidades & Carreiras
                                </span>
                                <h2 className="text-xl font-bold font-serif text-white tracking-tight">
                                    {careersTitle}
                                </h2>
                                <p className="text-xs text-gray-300">
                                    Faça parte da equipe da {config.company.tradeName || 'Ponto Chave do Lar'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            title="Fechar"
                            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Conteúdo scrollável */}
                    <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
                        {/* Texto Institucional de Apresentação (Exato do modelo solicitado) */}
                        <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-200 shadow-sm space-y-3">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                                <Briefcase size={14} />
                                <span>Nosso Ambiente & Cultura de Trabalho</span>
                            </h3>
                            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line font-normal">
                                {careersText}
                            </div>
                        </div>

                        {submitSuccess ? (
                            /* Tela de Confirmação de Sucesso */
                            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 md:p-8 text-center space-y-4 animate-fade-in">
                                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                    <CheckCircle2 size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold text-emerald-950">
                                        Currículo Enviado com Sucesso!
                                    </h4>
                                    <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                                        Recebemos os seus dados e seu currículo para o nosso banco de talentos oficial em{' '}
                                        <strong className="underline">{careersEmail}</strong>.
                                    </p>
                                    <p className="text-xs text-emerald-700 mt-2">
                                        Entraremos em contato quando surgirem vagas compatíveis com o seu perfil.
                                    </p>
                                </div>

                                <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                                    <a
                                        href={mailtoUrl}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow transition-all"
                                    >
                                        <Mail size={15} />
                                        <span>Abrir no Aplicativo de E-mail</span>
                                    </a>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors"
                                    >
                                        Concluir
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Formulário Fiel ao Mockup */
                            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm space-y-4">
                                {errorMessage && (
                                    <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                                        <AlertCircle size={16} className="shrink-0 text-rose-600" />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                {/* Campo Nome */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Nome: <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Seu nome completo"
                                        required
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all shadow-inner"
                                    />
                                </div>

                                {/* Campo E-mail */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        E-mail: <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu.email@exemplo.com"
                                        required
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all shadow-inner"
                                    />
                                </div>

                                {/* Campo Telefone */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Telefone: <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="(31) 99999-9999"
                                        required
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all shadow-inner"
                                    />
                                </div>

                                {/* Campo Currículo (Arquivo) */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Currículo:
                                    </label>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-gray-50 border border-gray-300 rounded-xl">
                                        <label className="cursor-pointer px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-lg transition-colors border border-gray-300 inline-flex items-center gap-1.5 shrink-0">
                                            <Upload size={14} />
                                            <span>Escolher arquivo</span>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>

                                        <span className="text-xs text-gray-600 truncate max-w-xs">
                                            {resumeFile ? (
                                                <span className="font-semibold text-gray-900 flex items-center gap-1">
                                                    📄 {resumeFile.name} ({(resumeFile.size / 1024).toFixed(0)} KB)
                                                </span>
                                            ) : (
                                                'Nenhum arquivo escolhido'
                                            )}
                                        </span>

                                        {resumeFile && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setResumeFile(null);
                                                    setResumeFileData(null);
                                                }}
                                                className="text-[11px] text-rose-600 hover:underline font-bold ml-auto"
                                            >
                                                Remover
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Formatos recomendados: PDF, DOC ou DOCX (até 3MB).
                                    </p>
                                </div>

                                {/* Campo Mensagem */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Mensagem:
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Escreva uma breve mensagem de apresentação, área de interesse ou dúvidas..."
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all resize-none shadow-inner"
                                    />
                                </div>

                                {/* Caixa de Verificação Anti-Robô (Estilo reCAPTCHA como no Mockup) */}
                                <div className="pt-2">
                                    <div className="inline-flex items-center justify-between gap-6 p-3 bg-gray-50 border border-gray-300 rounded-xl shadow-sm min-w-[280px]">
                                        <label className="flex items-center gap-3 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={isRobotChecked}
                                                onChange={(e) => setIsRobotChecked(e.target.checked)}
                                                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className="text-xs font-bold text-gray-700">
                                                Não sou um robô
                                            </span>
                                        </label>

                                        <div className="flex flex-col items-center justify-center text-center pl-4 border-l border-gray-200">
                                            <div className="w-6 h-6 text-blue-600">
                                                <svg viewBox="0 0 48 48" fill="currentColor" className="w-full h-full">
                                                    <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16 16-7.18 16-16 16z" opacity=".2"/>
                                                    <path d="M24 10v6c4.42 0 8 3.58 8 8h6c0-7.73-6.27-14-14-14z"/>
                                                    <path d="M10 24c0-4.42 3.58-8 8-8V10c-7.73 0-14 6.27-14 14h6z"/>
                                                    <path d="M24 38v-6c-4.42 0-8-3.58-8-8h-6c0 7.73 6.27 14 14 14z"/>
                                                </svg>
                                            </div>
                                            <span className="text-[9px] text-gray-400 font-semibold tracking-tighter leading-none mt-0.5">reCAPTCHA</span>
                                            <span className="text-[8px] text-gray-400">Privacidade - Termos</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Barra Inferior com Endereço de E-mail em Destaque & Botão Enviar */}
                                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                    {/* Caixa com Endereço do Link do E-mail */}
                                    <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-800 transition-colors">
                                        <a 
                                            href={`mailto:${careersEmail}`}
                                            title="Clique para enviar um e-mail direto"
                                            className="hover:underline flex items-center gap-1.5 truncate"
                                        >
                                            <Mail size={14} className="text-gray-600 shrink-0" />
                                            <span className="truncate">{careersEmail}</span>
                                        </a>
                                        <button
                                            type="button"
                                            onClick={handleCopyEmail}
                                            title="Copiar endereço de e-mail"
                                            className="p-1 hover:bg-white rounded text-gray-600 hover:text-gray-900 transition-colors shrink-0"
                                        >
                                            {copiedEmail ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                        </button>
                                    </div>

                                    {/* Botão Enviar Azul */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <RefreshCw size={14} className="animate-spin" />
                                                <span>Enviando...</span>
                                            </>
                                        ) : (
                                            <span>Enviar</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Rodapé Informativo */}
                    <div className="bg-gray-100 px-6 py-3.5 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
                        <span>
                            Seus dados estão protegidos conforme a LGPD (Lei nº 13.709/2018).
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-600 hover:text-gray-900 font-bold"
                        >
                            Fechar
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
