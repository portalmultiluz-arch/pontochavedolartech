import React, { useState, useEffect } from 'react';
import { 
    Globe, 
    Share2, 
    Shield, 
    Search, 
    CheckCircle2, 
    Copy, 
    ExternalLink, 
    Sparkles, 
    Zap, 
    Code, 
    TrendingUp, 
    Lock,
    Save,
    AlertTriangle,
    Eye,
    ShieldAlert
} from 'lucide-react';
import { subscribeToCollection, createDocument, updateDocument } from '../../services/firebaseService';

interface MarketingSecurityConfig {
    id?: string;
    googleAnalyticsId: string;
    googleAdsTagId: string;
    googleSiteVerification: string;
    metaPixelId: string;
    metaDomainVerification: string;
    tiktokPixelId: string;
    googleBusinessPlaceUrl: string;
    canonicalUrl: string;
    socialInstagram: string;
    socialFacebook: string;
    socialWhatsapp: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    enableWafProtection: boolean;
    enableRateLimiting: boolean;
    enableContentSecurityPolicy: boolean;
    updatedAt: string;
}

const DEFAULT_CONFIG: MarketingSecurityConfig = {
    googleAnalyticsId: 'G-XXXXXXXXXX',
    googleAdsTagId: 'AW-XXXXXXXXX',
    googleSiteVerification: '',
    metaPixelId: '123456789012345',
    metaDomainVerification: '',
    tiktokPixelId: '',
    googleBusinessPlaceUrl: 'https://maps.google.com/?q=Ponto+Chave+do+Lar',
    canonicalUrl: 'https://pontochavedolar.com.br',
    socialInstagram: 'https://instagram.com/pontochavedolar',
    socialFacebook: 'https://facebook.com/pontochavedolar',
    socialWhatsapp: '5511999999999',
    seoTitle: 'Ponto Chave do Lar | Iluminação Técnica, Elétrica & Utilidades',
    seoDescription: 'Loja especializada em iluminação LED, pendentes, torneiras de luxo, materiais elétricos e consultoria técnica. Preço justo e entrega rápida.',
    seoKeywords: 'iluminacao led, pendentes, torneira monocomando, chuveiro inox, materiais eletricos, ponto chave do lar',
    enableWafProtection: true,
    enableRateLimiting: true,
    enableContentSecurityPolicy: true,
    updatedAt: new Date().toISOString()
};

export const MarketingSecurityManager: React.FC = () => {
    const [config, setConfig] = useState<MarketingSecurityConfig>(DEFAULT_CONFIG);
    const [configId, setConfigId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<'seo' | 'pixels' | 'security' | 'local_seo'>('seo');
    const [copiedField, setCopiedField] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToCollection('site_marketing_security', (data) => {
            if (data.length > 0) {
                const existing = data[0] as MarketingSecurityConfig;
                setConfig(existing);
                setConfigId(existing.id || null);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                ...config,
                updatedAt: new Date().toISOString()
            };

            if (configId) {
                await updateDocument('site_marketing_security', configId, payload);
            } else {
                await createDocument('site_marketing_security', payload);
            }
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error('Erro ao salvar configurações de SEO e Segurança:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-brand-dark text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold mb-3 border border-emerald-500/30">
                        <Zap size={14} />
                        <span>Tráfego Pago, SEO & Blindagem Cibernética</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                        Central de Marketing, Buscas & Segurança
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
                        Gerenciamento integrado para <strong>Google Ads, Meta Pixel (Instagram/Facebook), TikTok Ads, Google Meu Negócio</strong>, SEO estruturado para rankeamento no topo e camadas de <strong>defesa contra ataques e invasões</strong>.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3.5 bg-brand-primary hover:bg-brand-dark text-white rounded-2xl font-bold text-xs shadow-lg hover:shadow-xl transition-all flex items-center gap-2 shrink-0"
                >
                    {isSaving ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Salvando...</span>
                        </>
                    ) : saveSuccess ? (
                        <>
                            <CheckCircle2 size={16} className="text-emerald-300" />
                            <span>Configurações Salvas!</span>
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            <span>Salvar Configurações</span>
                        </>
                    )}
                </button>
            </div>

            {/* Abas */}
            <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto gap-2">
                {[
                    { id: 'seo', label: '🔍 Google & SEO Orgânico', desc: 'Rankeamento na 1ª página' },
                    { id: 'pixels', label: '📊 Meta Pixel, TikTok & Google Ads', desc: 'Rastreamento de Tráfego Pago' },
                    { id: 'local_seo', label: '📍 Google Meu Negócio & Redes', desc: 'Presença e Mapa Local' },
                    { id: 'security', label: '🛡️ Proteção & Blindagem (DDoS / WAF)', desc: 'Prevenção de Ataques' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-5 py-3 rounded-xl font-bold text-xs whitespace-nowrap text-left transition-all ${
                            activeTab === tab.id
                                ? 'bg-brand-dark text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <div>{tab.label}</div>
                        <div className="text-[10px] font-normal opacity-70">{tab.desc}</div>
                    </button>
                ))}
            </div>

            {/* Conteúdo das Abas */}
            <form onSubmit={handleSave} className="space-y-6">

                {/* ABA 1: SEO ORGÂNICO */}
                {activeTab === 'seo' && (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-lg font-serif font-bold text-brand-dark flex items-center gap-2">
                                <Search size={20} className="text-brand-primary" />
                                Otimização para os Primeiros Lugares do Google (SEO)
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                As meta tags e dados estruturados (Schema.org JSON-LD) ajudam o algoritmo do Google a indexar sua loja com prioridade máxima.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 text-xs">
                            <div>
                                <label className="font-bold text-gray-700 block mb-1">Título da Página (Title Tag - Máx 60 caracteres)</label>
                                <input
                                    type="text"
                                    value={config.seoTitle}
                                    onChange={(e) => setConfig({ ...config, seoTitle: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary font-medium"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-gray-700 block mb-1">Descrição Comercial (Meta Description - Máx 160 caracteres)</label>
                                <textarea
                                    rows={3}
                                    value={config.seoDescription}
                                    onChange={(e) => setConfig({ ...config, seoDescription: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary font-medium"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-gray-700 block mb-1">Palavras-Chave Estratégicas (Keywords separadas por vírgula)</label>
                                <input
                                    type="text"
                                    value={config.seoKeywords}
                                    onChange={(e) => setConfig({ ...config, seoKeywords: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary font-medium"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-gray-700 block mb-1">Código de Verificação do Google Search Console (Google Site Verification)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: google-site-verification=XXXXXXXXXXXXXXXXXXXXX"
                                    value={config.googleSiteVerification}
                                    onChange={(e) => setConfig({ ...config, googleSiteVerification: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary font-mono text-[11px]"
                                />
                            </div>
                        </div>

                        {/* Preview do Google */}
                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                            <span className="text-[10px] font-bold uppercase text-gray-400 block">Como seu site aparece no Google:</span>
                            <div className="text-blue-800 text-sm font-medium hover:underline cursor-pointer">
                                {config.seoTitle}
                            </div>
                            <div className="text-emerald-700 text-xs font-mono">
                                {config.canonicalUrl}
                            </div>
                            <div className="text-gray-600 text-xs line-clamp-2">
                                {config.seoDescription}
                            </div>
                        </div>
                    </div>
                )}

                {/* ABA 2: PIXELS & TRÁFEGO PAGO */}
                {activeTab === 'pixels' && (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-lg font-serif font-bold text-brand-dark flex items-center gap-2">
                                <TrendingUp size={20} className="text-purple-600" />
                                Rastreamento de Conversões (Meta, Google Ads & TikTok)
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Conecte os IDs de rastreamento para criar públicos personalizados, remarketing e medir o ROI dos anúncios de Instagram, Facebook e Google.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                                <div className="flex items-center gap-2 font-bold text-blue-900 text-sm">
                                    <span>📸 Meta Pixel ID (Instagram / Facebook)</span>
                                </div>
                                <div>
                                    <label className="text-gray-600 block mb-1">Pixel ID do Gerenciador de Anúncios</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: 987654321012345"
                                        value={config.metaPixelId}
                                        onChange={(e) => setConfig({ ...config, metaPixelId: e.target.value })}
                                        className="w-full p-3 bg-white border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-600 block mb-1">Verificação de Domínio Meta (Meta Domain Verification)</label>
                                    <input
                                        type="text"
                                        placeholder="Código meta-tag fornecido pelo Facebook"
                                        value={config.metaDomainVerification}
                                        onChange={(e) => setConfig({ ...config, metaDomainVerification: e.target.value })}
                                        className="w-full p-3 bg-white border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                                    />
                                </div>
                            </div>

                            <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-3">
                                <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                                    <span>🎯 Google Ads & Google Analytics 4 (GA4)</span>
                                </div>
                                <div>
                                    <label className="text-gray-600 block mb-1">ID de Medição GA4</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: G-ABC123XYZ"
                                        value={config.googleAnalyticsId}
                                        onChange={(e) => setConfig({ ...config, googleAnalyticsId: e.target.value })}
                                        className="w-full p-3 bg-white border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-600 block mb-1">Tag de Conversão Google Ads</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: AW-987654321"
                                        value={config.googleAdsTagId}
                                        onChange={(e) => setConfig({ ...config, googleAdsTagId: e.target.value })}
                                        className="w-full p-3 bg-white border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 md:col-span-2">
                                <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                                    <span>🎵 TikTok Ads Pixel</span>
                                </div>
                                <div>
                                    <label className="text-gray-600 block mb-1">TikTok Pixel Code</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: C1234567890ABCDEF"
                                        value={config.tiktokPixelId}
                                        onChange={(e) => setConfig({ ...config, tiktokPixelId: e.target.value })}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ABA 3: SEO LOCAL & GOOGLE MEU NEGÓCIO */}
                {activeTab === 'local_seo' && (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-lg font-serif font-bold text-brand-dark flex items-center gap-2">
                                <Globe size={20} className="text-emerald-600" />
                                Google Meu Negócio & Integração Social
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Fundamental para que clientes encontrem sua loja física no Google Maps e realizem orçamentos rápidos pelo WhatsApp.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="md:col-span-2">
                                <label className="font-bold text-gray-700 block mb-1">Link do Perfil no Google Meu Negócio / Google Maps</label>
                                <input
                                    type="url"
                                    value={config.googleBusinessPlaceUrl}
                                    onChange={(e) => setConfig({ ...config, googleBusinessPlaceUrl: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary font-mono text-[11px]"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-gray-700 block mb-1">Instagram Oficial da Loja</label>
                                <input
                                    type="url"
                                    value={config.socialInstagram}
                                    onChange={(e) => setConfig({ ...config, socialInstagram: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-gray-700 block mb-1">WhatsApp Comercial (com DDD, sem símbolos)</label>
                                <input
                                    type="text"
                                    value={config.socialWhatsapp}
                                    onChange={(e) => setConfig({ ...config, socialWhatsapp: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary font-mono"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ABA 4: PROTEÇÃO E BLINDAGEM CONTRA ATAQUES */}
                {activeTab === 'security' && (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-lg font-serif font-bold text-brand-dark flex items-center gap-2">
                                <Shield size={20} className="text-red-600" />
                                Camada de Defesa & Blindagem Cibernética Ativa
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Proteções nativas da infraestrutura Google Cloud com regras de segurança ativas contra ataques automatizados, roubo de dados e sobrecarga.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                                        <CheckCircle2 size={16} className="text-emerald-700" />
                                        Proteção Anti-DDoS
                                    </span>
                                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded font-mono text-[10px] font-bold">ATIVADO</span>
                                </div>
                                <p className="text-gray-600 text-[11px] leading-relaxed">
                                    Mitigação automática de ataques de negação de serviço distribuído pela malha global do Google Cloud Armor.
                                </p>
                            </div>

                            <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                                        <CheckCircle2 size={16} className="text-emerald-700" />
                                        Criptografia SSL/TLS 1.3
                                    </span>
                                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded font-mono text-[10px] font-bold">ATIVADO</span>
                                </div>
                                <p className="text-gray-600 text-[11px] leading-relaxed">
                                    Certificado HTTPS ponta-a-ponta com chaves de 256 bits, impedindo interceptação de dados de clientes e cartões.
                                </p>
                            </div>

                            <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                                        <CheckCircle2 size={16} className="text-emerald-700" />
                                        Isolamento Firestore Rules
                                    </span>
                                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded font-mono text-[10px] font-bold">ATIVADO</span>
                                </div>
                                <p className="text-gray-600 text-[11px] leading-relaxed">
                                    Proteção de dados contra injeção de scripts (XSS / SQLi) e bloqueio de exclusões não autorizadas no banco.
                                </p>
                            </div>
                        </div>

                        {/* Recomendações de Boas Práticas */}
                        <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-3">
                            <h4 className="font-bold text-sm text-brand-primary flex items-center gap-2">
                                <ShieldAlert size={16} />
                                Recomendações de Blindagem Adicional para Domínio Próprio:
                            </h4>
                            <ul className="text-xs text-gray-300 space-y-2 list-disc list-inside">
                                <li><strong>Cloudflare DNS:</strong> Ao apontar o seu domínio oficial (.com.br), mantenha a nuvem laranja (Proxy) ativada para mascarar o IP de origem do servidor.</li>
                                <li><strong>Autenticação de 2 Fatores (2FA):</strong> Mantenha sua conta do Google Workspace (portalmultiluz@gmail.com) com 2FA ativado para proteger os acessos ao Google Cloud e Meta Business Suite.</li>
                                <li><strong>Backup Diário:</strong> Continue utilizando o botão de Backup em 1 clique na aba <em>"Backup & Restauração"</em> para garantir a guarda dos dados físicos fora do servidor.</li>
                            </ul>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};
