import React, { useState, useEffect } from 'react';
import { 
    Sparkles, 
    Layers, 
    ShoppingCart, 
    Users, 
    Briefcase, 
    Bot, 
    CheckCircle2, 
    XCircle, 
    Save, 
    Power, 
    Sliders, 
    Eye, 
    EyeOff, 
    ShieldCheck, 
    Info, 
    Zap, 
    ArrowRight,
    Check,
    RotateCcw,
    ExternalLink
} from 'lucide-react';
import { StoreModulesConfig } from '../../types';
import { DEFAULT_STORE_MODULES_CONFIG, FULL_SERVICES_STORE_MODULES_CONFIG } from '../../data/storeModulesConfig';
import { setDocument, subscribeToDoc } from '../../services/firebaseService';

interface StoreModulesManagerProps {
    onNavigateToMarketplace?: () => void;
}

export const StoreModulesManager: React.FC<StoreModulesManagerProps> = ({ onNavigateToMarketplace }) => {
    const [config, setConfig] = useState<StoreModulesConfig>(DEFAULT_STORE_MODULES_CONFIG);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToDoc('siteSettings', 'storeModules', (data) => {
            if (data) {
                setConfig(data as StoreModulesConfig);
            } else {
                setConfig(DEFAULT_STORE_MODULES_CONFIG);
            }
            setHasUnsavedChanges(false);
        });

        return () => unsubscribe();
    }, []);

    const handleToggle = <K extends keyof StoreModulesConfig>(key: K, value?: boolean) => {
        setConfig(prev => {
            const nextVal = typeof value === 'boolean' ? value : !prev[key];
            const updated = { ...prev, [key]: nextVal };
            
            // Se desativar uma chave mestre, desativa também os filhos para consistência visual
            if (key === 'consultancyEnabled' && !nextVal) {
                updated.consultancyHeaderButton = false;
                updated.consultancyHomeBanner = false;
                updated.consultancyCartCta = false;
            } else if (key === 'consultancyEnabled' && nextVal) {
                updated.consultancyHeaderButton = true;
                updated.consultancyHomeBanner = true;
                updated.consultancyCartCta = true;
            }

            if (key === 'partnersEnabled' && !nextVal) {
                updated.partnersHeaderLink = false;
                updated.partnersHomeSection = false;
                updated.partnersProductDetail = false;
            } else if (key === 'partnersEnabled' && nextVal) {
                updated.partnersHeaderLink = true;
                updated.partnersHomeSection = true;
                updated.partnersProductDetail = true;
            }

            if (key === 'servicesEnabled' && !nextVal) {
                updated.servicesHeaderLink = false;
            } else if (key === 'servicesEnabled' && nextVal) {
                updated.servicesHeaderLink = true;
            }

            // Atualiza status do modo de vendas limpo
            const isAllExtrasOff = !updated.consultancyEnabled && !updated.appletEnabled && !updated.partnersEnabled && !updated.servicesEnabled;
            updated.salesOnlyMode = isAllExtrasOff;

            return updated;
        });
        setHasUnsavedChanges(true);
    };

    const applySalesOnlyPreset = () => {
        setConfig({
            ...DEFAULT_STORE_MODULES_CONFIG,
            updatedAt: new Date().toISOString()
        });
        setHasUnsavedChanges(true);
    };

    const applyFullServicesPreset = () => {
        setConfig({
            ...FULL_SERVICES_STORE_MODULES_CONFIG,
            updatedAt: new Date().toISOString()
        });
        setHasUnsavedChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const dataToSave: StoreModulesConfig = {
                ...config,
                updatedAt: new Date().toISOString()
            };
            await setDocument('siteSettings', 'storeModules', dataToSave);
            setSaveSuccess(true);
            setHasUnsavedChanges(false);
            setTimeout(() => setSaveSuccess(false), 3500);
        } catch (error) {
            console.error("Erro ao salvar configuração de módulos da loja:", error);
            alert("Erro ao salvar as configurações no Firestore.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans space-y-8 animate-in fade-in">
            {/* Header Principal */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Sliders size={13} />
                            <span>Configuração da Vitrine & Acesso Restrito</span>
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                        Gestão de Módulos & Foco em Vendas
                    </h2>
                    <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                        Controle quais serviços e ferramentas estão ativos na loja. Desative serviços secundários para deixar a página <strong>100% limpa e focada em vendas de produtos</strong>, e ative-os gradativamente conforme seu planejamento comercial.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${
                            saveSuccess 
                                ? 'bg-emerald-600 text-white' 
                                : hasUnsavedChanges 
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-4 ring-amber-400/30 animate-pulse' 
                                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                        }`}
                    >
                        {saveSuccess ? (
                            <>
                                <Check size={18} />
                                <span>Configuração Salva na Loja!</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>{isSaving ? 'Gravando...' : hasUnsavedChanges ? 'Salvar Alterações Agora' : 'Salvar Configurações'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Banner de Status Atual & Botões de Preset em 1 Clique */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Status Operacional */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                    config.salesOnlyMode 
                        ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-500/40 text-white shadow-md' 
                        : 'bg-gradient-to-br from-blue-950/80 to-slate-900 border-blue-500/40 text-white shadow-md'
                }`}>
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Modo de Operação Ativo</span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                                config.salesOnlyMode 
                                    ? 'bg-emerald-500 text-slate-950' 
                                    : 'bg-blue-500 text-white'
                            }`}>
                                <Power size={12} />
                                {config.salesOnlyMode ? 'Foco em Vendas' : 'Loja Completa'}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            {config.salesOnlyMode ? (
                                <>
                                    <ShoppingCart className="text-emerald-400 shrink-0" size={24} />
                                    <span>Página Limpa para Vendas</span>
                                </>
                            ) : (
                                <>
                                    <Layers className="text-blue-400 shrink-0" size={24} />
                                    <span>Multi-Serviços Integrados</span>
                                </>
                            )}
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            {config.salesOnlyMode 
                                ? 'Os módulos de consultoria, applet especialista e parceiros estão desativados na vitrine. A página foca 100% no catálogo de produtos e no fluxo de compra.'
                                : 'Todos os módulos de IA, consultoria técnica, applet especialista e guia de instaladores parceiros estão ativos e visíveis para os clientes.'}
                        </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Última atualização:</span>
                        <span className="font-mono text-slate-300">
                            {config.updatedAt ? new Date(config.updatedAt).toLocaleString('pt-BR') : 'Padrão Inicial'}
                        </span>
                    </div>
                </div>

                {/* Preset 1: Foco em Vendas (Loja Limpa) */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-emerald-500/50 transition-all group">
                    <div>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ShoppingCart size={22} />
                        </div>
                        <h4 className="text-base font-bold text-gray-900 mb-1">
                            Preset 1: Foco Exclusivo em Vendas
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Desativa imediatamente botões de IA, Applet e parceiros. Deixa a página inicial limpa, direta e focada exclusivamente no catálogo e no carrinho.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={applySalesOnlyPreset}
                        className={`mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                            config.salesOnlyMode 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                                : 'bg-slate-900 hover:bg-emerald-600 text-white border-slate-900'
                        }`}
                    >
                        {config.salesOnlyMode ? (
                            <>
                                <Check size={15} className="text-emerald-600" />
                                <span>Preset Aplicado (Foco em Vendas)</span>
                            </>
                        ) : (
                            <>
                                <Zap size={15} />
                                <span>Aplicar Foco em Vendas (1 Clique)</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Preset 2: Loja Completa com Serviços */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-blue-500/50 transition-all group">
                    <div>
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Layers size={22} />
                        </div>
                        <h4 className="text-base font-bold text-gray-900 mb-1">
                            Preset 2: Loja Completa & Serviços
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Ativa todos os recursos integrados: Consultoria IA, Applet Especialista, Rede de Instaladores Parceiros e Catálogo de Serviços.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={applyFullServicesPreset}
                        className={`mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                            !config.salesOnlyMode && config.consultancyEnabled && config.partnersEnabled
                                ? 'bg-blue-50 border-blue-300 text-blue-800' 
                                : 'bg-slate-900 hover:bg-blue-600 text-white border-slate-900'
                        }`}
                    >
                        {!config.salesOnlyMode && config.consultancyEnabled && config.partnersEnabled ? (
                            <>
                                <Check size={15} className="text-blue-600" />
                                <span>Preset Aplicado (Loja Completa)</span>
                            </>
                        ) : (
                            <>
                                <Zap size={15} />
                                <span>Ativar Todos os Serviços (1 Clique)</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* GRADE DE CONTROLE INDIVIDUAL DOS MÓDULOS */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold font-serif text-gray-900">
                            Controle Individual de Módulos da Vitrine
                        </h3>
                        <p className="text-xs text-gray-500">
                            Ative ou desative cada serviço individualmente para incorporar novidades no ritmo desejado pelo seu negócio.
                        </p>
                    </div>

                    {hasUnsavedChanges && (
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full flex items-center gap-1.5 animate-bounce">
                            <Info size={14} />
                            <span>Alterações pendentes de gravação</span>
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* ========================================================================= */}
                    {/* MÓDULO 1: CONSULTORIA TÉCNICA COM IA */}
                    {/* ========================================================================= */}
                    <div className={`p-6 rounded-3xl border transition-all ${
                        config.consultancyEnabled 
                            ? 'bg-white border-amber-300 shadow-md ring-1 ring-amber-400/30' 
                            : 'bg-slate-50/80 border-gray-200 opacity-90'
                    }`}>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                    config.consultancyEnabled ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-gray-200 text-gray-500'
                                }`}>
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                        <span>Consultoria Técnica com IA</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                            config.consultancyEnabled 
                                                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                                : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {config.consultancyEnabled ? 'Ativado na Loja' : 'Desativado (Oculto)'}
                                        </span>
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        Análise inteligente de projetos elétricos, NBR 5410 e laudos técnicos para clientes.
                                    </p>
                                </div>
                            </div>

                            {/* Switch Principal */}
                            <button
                                type="button"
                                onClick={() => handleToggle('consultancyEnabled')}
                                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    config.consultancyEnabled ? 'bg-amber-500' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                        config.consultancyEnabled ? 'translate-x-7' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Opções Granulares quando ativado */}
                        <div className={`pt-4 border-t border-gray-100 space-y-2.5 transition-all ${
                            config.consultancyEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
                        }`}>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                Onde exibir a Consultoria IA:
                            </span>

                            <label className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors text-xs font-medium text-gray-700">
                                <span className="flex items-center gap-2">
                                    <Eye size={14} className="text-amber-600" />
                                    <span>Botão "Consultoria IA" no Topo (Header)</span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={config.consultancyHeaderButton}
                                    onChange={(e) => handleToggle('consultancyHeaderButton', e.target.checked)}
                                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                                />
                            </label>

                            <label className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors text-xs font-medium text-gray-700">
                                <span className="flex items-center gap-2">
                                    <Eye size={14} className="text-amber-600" />
                                    <span>Banner Principal de Consultoria na Página Inicial</span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={config.consultancyHomeBanner}
                                    onChange={(e) => handleToggle('consultancyHomeBanner', e.target.checked)}
                                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                                />
                            </label>

                            <label className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors text-xs font-medium text-gray-700">
                                <span className="flex items-center gap-2">
                                    <Eye size={14} className="text-amber-600" />
                                    <span>Chamada de Laudo Gratuito no Carrinho / Checkout</span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={config.consultancyCartCta}
                                    onChange={(e) => handleToggle('consultancyCartCta', e.target.checked)}
                                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                                />
                            </label>
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* MÓDULO 2: APPLET ESPECIALISTA */}
                    {/* ========================================================================= */}
                    <div className={`p-6 rounded-3xl border transition-all ${
                        config.appletEnabled 
                            ? 'bg-white border-amber-300 shadow-md ring-1 ring-amber-400/30' 
                            : 'bg-slate-50/80 border-gray-200 opacity-90'
                    }`}>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                    config.appletEnabled ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-gray-200 text-gray-500'
                                }`}>
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                        <span>APPLET Especialista</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                            config.appletEnabled 
                                                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                                : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {config.appletEnabled ? 'Ativado na Loja' : 'Desativado (Oculto)'}
                                        </span>
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        Botão dourado no cabeçalho e modal integrado com o applet assistente especialista.
                                    </p>
                                </div>
                            </div>

                            {/* Switch Principal */}
                            <button
                                type="button"
                                onClick={() => handleToggle('appletEnabled')}
                                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    config.appletEnabled ? 'bg-amber-500' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                        config.appletEnabled ? 'translate-x-7' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>

                        <div className="pt-4 border-t border-gray-100 text-xs text-gray-600 space-y-2">
                            <p className="leading-relaxed">
                                Quando ativado, exibe o botão <strong className="text-amber-900">"Applet Especialista"</strong> no cabeçalho superior da loja, abrindo o modal com o aplicativo auxiliar.
                            </p>
                            <p className="text-[11px] text-gray-400">
                                Mantenha desativado caso queira direcionar toda a atenção do visitante exclusivamente para a compra de produtos físicos.
                            </p>
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* MÓDULO 3: INSTALADORES E PARCEIROS */}
                    {/* ========================================================================= */}
                    <div className={`p-6 rounded-3xl border transition-all ${
                        config.partnersEnabled 
                            ? 'bg-white border-amber-300 shadow-md ring-1 ring-amber-400/30' 
                            : 'bg-slate-50/80 border-gray-200 opacity-90'
                    }`}>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                    config.partnersEnabled ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-gray-200 text-gray-500'
                                }`}>
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                        <span>Instaladores & Parceiros</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                            config.partnersEnabled 
                                                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                                : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {config.partnersEnabled ? 'Ativado na Loja' : 'Desativado (Oculto)'}
                                        </span>
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        Marketplace e guia de eletricistas, encanadores e instaladores autônomos credenciados.
                                    </p>
                                </div>
                            </div>

                            {/* Switch Principal */}
                            <button
                                type="button"
                                onClick={() => handleToggle('partnersEnabled')}
                                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    config.partnersEnabled ? 'bg-amber-500' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                        config.partnersEnabled ? 'translate-x-7' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Opções Granulares quando ativado */}
                        <div className={`pt-4 border-t border-gray-100 space-y-2.5 transition-all ${
                            config.partnersEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
                        }`}>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                Onde exibir a Rede de Parceiros:
                            </span>

                            <label className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors text-xs font-medium text-gray-700">
                                <span className="flex items-center gap-2">
                                    <Eye size={14} className="text-amber-600" />
                                    <span>Link "Instaladores Parceiros" no Menu Superior</span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={config.partnersHeaderLink}
                                    onChange={(e) => handleToggle('partnersHeaderLink', e.target.checked)}
                                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                                />
                            </label>

                            <label className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors text-xs font-medium text-gray-700">
                                <span className="flex items-center gap-2">
                                    <Eye size={14} className="text-amber-600" />
                                    <span>Vitrine de Profissionais na Página Inicial</span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={config.partnersHomeSection}
                                    onChange={(e) => handleToggle('partnersHomeSection', e.target.checked)}
                                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                                />
                            </label>

                            <label className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors text-xs font-medium text-gray-700">
                                <span className="flex items-center gap-2">
                                    <Eye size={14} className="text-amber-600" />
                                    <span>Indicação de Instalador no Detalhe do Produto</span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={config.partnersProductDetail}
                                    onChange={(e) => handleToggle('partnersProductDetail', e.target.checked)}
                                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                                />
                            </label>
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* MÓDULO 4: CATÁLOGO DE SERVIÇOS TÉCNICOS PRÓPRIOS */}
                    {/* ========================================================================= */}
                    <div className={`p-6 rounded-3xl border transition-all ${
                        config.servicesEnabled 
                            ? 'bg-white border-amber-300 shadow-md ring-1 ring-amber-400/30' 
                            : 'bg-slate-50/80 border-gray-200 opacity-90'
                    }`}>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                    config.servicesEnabled ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-gray-200 text-gray-500'
                                }`}>
                                    <Briefcase size={24} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                        <span>Serviços Próprios da Loja</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                            config.servicesEnabled 
                                                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                                : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {config.servicesEnabled ? 'Ativado na Loja' : 'Desativado (Oculto)'}
                                        </span>
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        Serviços de montagem, reformas, manutenção de estofados e design executados diretamente.
                                    </p>
                                </div>
                            </div>

                            {/* Switch Principal */}
                            <button
                                type="button"
                                onClick={() => handleToggle('servicesEnabled')}
                                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    config.servicesEnabled ? 'bg-amber-500' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                        config.servicesEnabled ? 'translate-x-7' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Opções Granulares */}
                        <div className={`pt-4 border-t border-gray-100 space-y-2.5 transition-all ${
                            config.servicesEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
                        }`}>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                Onde exibir os Serviços Próprios:
                            </span>

                            <label className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors text-xs font-medium text-gray-700">
                                <span className="flex items-center gap-2">
                                    <Eye size={14} className="text-amber-600" />
                                    <span>Link "Serviços" no Menu Superior (Header)</span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={config.servicesHeaderLink}
                                    onChange={(e) => handleToggle('servicesHeaderLink', e.target.checked)}
                                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                                />
                            </label>

                            <p className="text-[11px] text-gray-500 pt-1">
                                Ao desativar, a seção inteira de Serviços Especializados da página inicial é ocultada, mantendo o cliente 100% no catálogo de produtos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dica Estratégica de Conversão */}
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3.5">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl shrink-0 mt-0.5">
                    <ShieldCheck size={18} />
                </div>
                <div className="space-y-1 text-xs text-amber-950">
                    <h5 className="font-bold text-sm text-amber-950">Estratégia de Incorporação Gradual</h5>
                    <p className="text-amber-900 leading-relaxed">
                        Manter o site limpo focado em produtos no início acelera o tempo de carregamento e reduz o atrito de decisão do comprador. Conforme as vendas físicas e digitais se estabilizarem, você pode ativar a <strong>Consultoria IA</strong> e os <strong>Parceiros</strong> individualmente em segundos aqui no Acesso Restrito.
                    </p>
                </div>
            </div>
        </div>
    );
};
