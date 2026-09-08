import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
    Image as ImageIcon, 
    Video as VideoIcon, 
    Sparkles, 
    Save, 
    RotateCcw, 
    Check, 
    AlertCircle, 
    Info, 
    Eye, 
    ExternalLink, 
    Layers, 
    Type, 
    MonitorPlay,
    Zap,
    Play,
    Upload,
    Copy,
    Download,
    Trash2,
    Sliders,
    Sun,
    Scissors,
    ShieldCheck,
    CheckCircle2,
    Plus,
    Search,
    Filter,
    Tag,
    Edit3,
    ArrowRight,
    RefreshCw,
    FolderHeart,
    Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HeroCoverConfig, HeroCoverAsset, HeroCategory } from '../../types';
import { 
    fetchHeroCoverConfig, 
    saveHeroCoverConfig, 
    subscribeToDoc,
    subscribeToCollection,
    createDocument,
    updateDocument,
    deleteDocument 
} from '../../services/firebaseService';
import { CURATED_HERO_COVERS } from '../../data/curatedHeroCovers';

const DEFAULT_COVER: HeroCoverConfig = {
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1616489953149-80980ca8675c?auto=format&fit=crop&q=80&w=1200',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-42352-large.mp4',
    badgeText: 'Design Autoral & Exclusivo',
    headlinePrefix: 'O ',
    headlineHighlight: 'ponto chave',
    headlineSuffix: ' do seu ambiente.',
    subheadline: 'Curadoria especializada em utilidades domésticas e design que transformam casas em lares com alma. Tecnologia e estilo em cada detalhe.',
    primaryButtonText: 'Explorar Coleção',
    secondaryButtonText: 'Nossa História',
    ratingScore: '4.9/5',
    ratingLabel: 'Avaliações',
    trustLabel: 'Compra Segura',
    floatingCardTitle: 'Entrega Expressa',
    floatingCardSubtext: 'Capitais em 24h',
};

export const HERO_CATEGORIES: { id: HeroCategory | 'todos'; label: string; icon: string; color: string; badgeBg: string }[] = [
    { id: 'todos', label: 'Todas as Categorias', icon: '📁', color: 'text-gray-700', badgeBg: 'bg-gray-100 text-gray-800' },
    { id: 'geral_capa', label: 'Imagem da Capa (Geral)', icon: '🌟', color: 'text-amber-600', badgeBg: 'bg-amber-100 text-amber-900 border-amber-300' },
    { id: 'promocoes_dia', label: 'Promoções do Dia', icon: '🔥', color: 'text-orange-600', badgeBg: 'bg-orange-100 text-orange-900 border-orange-300' },
    { id: 'jornal_ofertas', label: 'Jornal de Ofertas', icon: '📰', color: 'text-blue-600', badgeBg: 'bg-blue-100 text-blue-900 border-blue-300' },
    { id: 'dia_dos_pais', label: 'Dia dos Pais', icon: '👔', color: 'text-indigo-600', badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
    { id: 'dia_das_maes', label: 'Dia das Mães', icon: '🌸', color: 'text-pink-600', badgeBg: 'bg-pink-100 text-pink-900 border-pink-300' },
    { id: 'natal', label: 'Natal & Fim de Ano', icon: '🎄', color: 'text-emerald-700', badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    { id: 'black_friday', label: 'Black Friday', icon: '🏷️', color: 'text-purple-700', badgeBg: 'bg-purple-900 text-purple-100 border-purple-700' },
    { id: 'dia_dos_namorados', label: 'Dia dos Namorados', icon: '❤️', color: 'text-rose-600', badgeBg: 'bg-rose-100 text-rose-900 border-rose-300' },
    { id: 'pascoa_festas', label: 'Páscoa & Festividades', icon: '🐰', color: 'text-teal-600', badgeBg: 'bg-teal-100 text-teal-900 border-teal-300' },
    { id: 'queima_estoque', label: 'Queima de Estoque / Saldão', icon: '⚡', color: 'text-red-600', badgeBg: 'bg-red-100 text-red-900 border-red-300' },
    { id: 'lancamentos', label: 'Lançamentos & Novidades', icon: '💡', color: 'text-cyan-600', badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300' },
    { id: 'outros', label: 'Outras Campanhas', icon: '✨', color: 'text-slate-600', badgeBg: 'bg-slate-100 text-slate-900 border-slate-300' },
];

export type HeroAspectRatioPreset = '16_9_widescreen' | '3_2_classic' | '21_9_ultrawide' | '4_3_compact' | 'free';

interface OptimizationResult {
    dataUrl: string;
    width: number;
    height: number;
    originalSizeKb: number;
    optimizedSizeKb: number;
    reductionPercent: number;
    format: 'webp' | 'jpeg' | 'png';
    fileName: string;
    originalDataUrl: string;
}

export const HeroCoverManager: React.FC = () => {
    // Aba Principal: 'cover_bank' (Banco de Capas & Campanhas) | 'optimizer' (Otimizador & Tratamento) | 'active_cover' (Capa Ativa no Site)
    const [mainTab, setMainTab] = useState<'cover_bank' | 'optimizer' | 'active_cover'>('cover_bank');
    
    // Estado da Capa Atualmente Publicada no Site
    const [activeCoverConfig, setActiveCoverConfig] = useState<HeroCoverConfig>(DEFAULT_COVER);
    const [isSavingActive, setIsSavingActive] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Banco de Capas & Campanhas - Inicializa imediatamente com o acervo modelo para exibição instantânea
    const initialCurated = useMemo<HeroCoverAsset[]>(() => {
        return CURATED_HERO_COVERS.map((c, i) => ({
            ...c,
            id: `curated-${i + 1}`,
        })) as HeroCoverAsset[];
    }, []);

    const [bankList, setBankList] = useState<HeroCoverAsset[]>(() => {
        return CURATED_HERO_COVERS.map((c, i) => ({
            ...c,
            id: `curated-${i + 1}`,
        })) as HeroCoverAsset[];
    });
    const [selectedCategory, setSelectedCategory] = useState<string>('todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [coverToDelete, setCoverToDelete] = useState<HeroCoverAsset | null>(null);

    // Modal de Edição / Criação no Banco
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCover, setEditingCover] = useState<Partial<HeroCoverAsset> | null>(null);
    const [isSavingCoverAsset, setIsSavingCoverAsset] = useState(false);

    // --- ESTADO DO OTIMIZADOR DE IMAGEM DA CAPA ---
    const [optFile, setOptFile] = useState<File | null>(null);
    const [optRawDataUrl, setOptRawDataUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isApplyingDirectly, setIsApplyingDirectly] = useState(false);
    const [isSavingToBankFromOpt, setIsSavingToBankFromOpt] = useState(false);
    const [optResult, setOptResult] = useState<OptimizationResult | null>(null);

    // Controles do Otimizador
    const [aspectPreset, setAspectPreset] = useState<HeroAspectRatioPreset>('16_9_widescreen');
    const [optQuality, setOptQuality] = useState<number>(85);
    const [optFormat, setOptFormat] = useState<'webp' | 'jpeg' | 'png'>('webp');
    const [optMaxDimension, setOptMaxDimension] = useState<number>(1920);
    const [optBrightness, setOptBrightness] = useState<number>(100);
    const [optContrast, setOptContrast] = useState<number>(100);
    const [optSaturation, setOptSaturation] = useState<number>(100);
    const [optEnhanceStudio, setOptEnhanceStudio] = useState<boolean>(true);
    const [optNoCropFit, setOptNoCropFit] = useState<boolean>(true);
    const [optBgBlur, setOptBgBlur] = useState<boolean>(true);
    const [optBgColor, setOptBgColor] = useState<string>('#0f172a');
    
    // Metadados para salvar do Otimizador para o Banco
    const [optSaveTitle, setOptSaveTitle] = useState<string>('Nova Capa Otimizada');
    const [optSaveCategory, setOptSaveCategory] = useState<HeroCategory>('geral_capa');
    const [optSaveBadge, setOptSaveBadge] = useState<string>('Design Autoral & Exclusivo');
    const [optSaveHeadline, setOptSaveHeadline] = useState<string>('O ponto chave do seu ambiente.');
    const [optSaveSubheadline, setOptSaveSubheadline] = useState<string>('Curadoria especializada em utilidades domésticas e design que transformam casas em lares com alma.');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropAreaRef = useRef<HTMLDivElement>(null);

    // Escuta em tempo real a capa ativa no Firestore
    useEffect(() => {
        const unsubscribe = subscribeToDoc('siteSettings', 'heroCover', (data) => {
            if (data) {
                setActiveCoverConfig(prev => ({
                    ...prev,
                    ...data
                }));
            }
        });
        return () => unsubscribe();
    }, []);

    // Escuta a coleção do banco de capas no Firestore e mescla com os modelos pré-definidos
    useEffect(() => {
        const unsubscribe = subscribeToCollection('hero_covers', (data) => {
            if (data && data.length > 0) {
                const firestoreList = data as HeroCoverAsset[];
                // Unifica itens salvos no banco com modelos de campanhas curados
                const firestoreTitles = new Set(firestoreList.map(item => item.title.toLowerCase().trim()));
                const missingCurated = initialCurated.filter(
                    c => !firestoreTitles.has(c.title.toLowerCase().trim())
                );
                setBankList([...firestoreList, ...missingCurated]);
            } else {
                setBankList(initialCurated);
            }
        }, 'createdAt');

        return () => unsubscribe();
    }, [initialCurated]);

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4500);
    };

    // Salvar Capa Ativa Diretamente no Site
    const handleSaveActiveCover = async (configToSave?: HeroCoverConfig) => {
        const payload = configToSave || activeCoverConfig;
        if (payload.mediaType === 'image' && !payload.imageUrl?.trim()) {
            showFeedback('error', 'Informe a URL da imagem da capa.');
            return;
        }

        setIsSavingActive(true);
        try {
            await saveHeroCoverConfig(payload);
            setActiveCoverConfig(payload);
            showFeedback('success', 'Capa principal atualizada com sucesso no site!');
        } catch (error) {
            console.error('Erro ao salvar capa ativa:', error);
            showFeedback('error', 'Erro ao salvar capa no banco de dados.');
        } finally {
            setIsSavingActive(false);
        }
    };

    // Ativar uma capa do banco diretamente no site
    const handleActivateFromBank = async (cover: HeroCoverAsset) => {
        setIsSavingActive(true);
        try {
            const newConfig: HeroCoverConfig = {
                mediaType: cover.mediaType || 'image',
                imageUrl: cover.imageUrl,
                videoUrl: cover.videoUrl || '',
                badgeText: cover.badgeText || 'Design Autoral & Exclusivo',
                headlinePrefix: cover.headlinePrefix || '',
                headlineHighlight: cover.headlineHighlight || '',
                headlineSuffix: cover.headlineSuffix || '',
                subheadline: cover.subheadline || '',
                primaryButtonText: cover.primaryButtonText || 'Explorar Coleção',
                secondaryButtonText: cover.secondaryButtonText || 'Nossa História',
                ratingScore: cover.ratingScore || '4.9/5',
                ratingLabel: cover.ratingLabel || 'Avaliações',
                trustLabel: cover.trustLabel || 'Compra Segura',
                floatingCardTitle: cover.floatingCardTitle || 'Destaque Ponto Chave',
                floatingCardSubtext: cover.floatingCardSubtext || 'Frete Rápido',
                updatedAt: new Date().toISOString()
            };

            await saveHeroCoverConfig(newConfig);
            setActiveCoverConfig(newConfig);
            showFeedback('success', `Campanha "${cover.title}" ativada como Capa Principal no site!`);
        } catch (error) {
            console.error('Erro ao ativar capa:', error);
            showFeedback('error', 'Erro ao ativar campanha no site.');
        } finally {
            setIsSavingActive(false);
        }
    };

    // Excluir capa do banco
    const handleDeleteCover = async () => {
        if (!coverToDelete) return;
        setIsDeleting(true);
        try {
            if (coverToDelete.id.startsWith('curated-')) {
                // Item local/curado
                setBankList(prev => prev.filter(c => c.id !== coverToDelete.id));
            } else {
                await deleteDocument('hero_covers', coverToDelete.id);
            }
            showFeedback('success', 'Capa removida do banco com sucesso.');
            setCoverToDelete(null);
        } catch (error) {
            console.error('Erro ao excluir capa:', error);
            showFeedback('error', 'Erro ao excluir capa do banco de dados.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Salvar / Editar item no banco
    const handleSaveCoverAssetModal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCover?.title?.trim() || !editingCover?.imageUrl?.trim()) {
            showFeedback('error', 'Título e Link da Imagem são obrigatórios.');
            return;
        }

        setIsSavingCoverAsset(true);
        try {
            const dataToSave: Partial<HeroCoverAsset> = {
                title: editingCover.title,
                category: (editingCover.category as HeroCategory) || 'geral_capa',
                mediaType: editingCover.mediaType || 'image',
                imageUrl: editingCover.imageUrl,
                videoUrl: editingCover.videoUrl || '',
                badgeText: editingCover.badgeText || '',
                headlinePrefix: editingCover.headlinePrefix || '',
                headlineHighlight: editingCover.headlineHighlight || '',
                headlineSuffix: editingCover.headlineSuffix || '',
                subheadline: editingCover.subheadline || '',
                primaryButtonText: editingCover.primaryButtonText || 'Explorar Coleção',
                secondaryButtonText: editingCover.secondaryButtonText || 'Falar com Consultor',
                ratingScore: editingCover.ratingScore || '5.0/5',
                ratingLabel: editingCover.ratingLabel || 'Garantia Ponto Chave',
                trustLabel: editingCover.trustLabel || 'Compra Segura',
                floatingCardTitle: editingCover.floatingCardTitle || 'Campanha Especial',
                floatingCardSubtext: editingCover.floatingCardSubtext || 'Estoque Limitado',
                aspectRatio: editingCover.aspectRatio || '16:9',
                format: editingCover.format || 'webp',
                tags: editingCover.tags || [editingCover.category || 'capa'],
                updatedAt: new Date().toISOString()
            };

            if (editingCover.id && !editingCover.id.startsWith('curated-')) {
                await updateDocument('hero_covers', editingCover.id, dataToSave);
            } else {
                await createDocument('hero_covers', {
                    ...dataToSave,
                    createdAt: new Date().toISOString()
                });
            }

            showFeedback('success', 'Capa salva com sucesso no Banco de Campanhas!');
            setIsEditModalOpen(false);
            setEditingCover(null);
        } catch (error) {
            console.error('Erro ao salvar no banco:', error);
            showFeedback('error', 'Erro ao salvar no banco de dados.');
        } finally {
            setIsSavingCoverAsset(false);
        }
    };

    // Semear todas as capas curadas no Firestore se o usuário desejar
    const handleSeedCuratedCovers = async () => {
        if (!window.confirm('Deseja salvar todas as capas modelos (Dia dos Pais, Mães, Natal, Black Friday, Promoções, etc.) no seu banco de dados Firestore?')) {
            return;
        }

        setIsSavingActive(true);
        try {
            for (const cover of CURATED_HERO_COVERS) {
                await createDocument('hero_covers', cover);
            }
            showFeedback('success', 'Acervo de capas temáticas importado com sucesso para o banco!');
        } catch (error) {
            console.error('Erro ao importar acervo:', error);
            showFeedback('error', 'Erro ao importar acervo.');
        } finally {
            setIsSavingActive(false);
        }
    };

    // --- PROCESSAMENTO DO OTIMIZADOR DE IMAGEM DA CAPA (CANVAS) ---
    const processCoverOptimization = useCallback(async (
        sourceDataUrl: string,
        fileName: string,
        originalSizeKb: number
    ) => {
        setIsProcessing(true);

        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = (err) => reject(err);
                img.src = sourceDataUrl;
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Falha ao inicializar o Canvas 2D');

            let targetWidth = 1920;
            let targetHeight = 1080;

            if (aspectPreset === '16_9_widescreen') {
                targetWidth = Math.min(optMaxDimension, 1920);
                targetHeight = Math.round((targetWidth * 9) / 16);
            } else if (aspectPreset === '3_2_classic') {
                targetWidth = Math.min(optMaxDimension, 1200);
                targetHeight = Math.round((targetWidth * 2) / 3);
            } else if (aspectPreset === '21_9_ultrawide') {
                targetWidth = Math.min(optMaxDimension, 1920);
                targetHeight = Math.round((targetWidth * 9) / 21);
            } else if (aspectPreset === '4_3_compact') {
                targetWidth = Math.min(optMaxDimension, 1200);
                targetHeight = Math.round((targetWidth * 3) / 4);
            } else {
                // Free
                let w = img.width;
                let h = img.height;
                if (w > optMaxDimension || h > optMaxDimension) {
                    if (w > h) {
                        h = Math.round((h * optMaxDimension) / w);
                        w = optMaxDimension;
                    } else {
                        w = Math.round((w * optMaxDimension) / h);
                        h = optMaxDimension;
                    }
                }
                targetWidth = w;
                targetHeight = h;
            }

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            // Fundo base
            ctx.fillStyle = optBgColor;
            ctx.fillRect(0, 0, targetWidth, targetHeight);

            // Se optBgBlur estiver ativo e a imagem não cobrir 100%, desenha fundo desfocado
            if (optNoCropFit && optBgBlur) {
                ctx.save();
                ctx.filter = 'blur(30px) brightness(0.6)';
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                ctx.restore();
            }

            // Filtros de ajuste
            const filterStrings: string[] = [];
            if (optBrightness !== 100) filterStrings.push(`brightness(${optBrightness / 100})`);
            if (optContrast !== 100) filterStrings.push(`contrast(${optContrast / 100})`);
            if (optSaturation !== 100) filterStrings.push(`saturate(${optSaturation / 100})`);
            if (optEnhanceStudio) filterStrings.push('contrast(1.05) brightness(1.02) saturate(1.04)');

            ctx.filter = filterStrings.length > 0 ? filterStrings.join(' ') : 'none';

            if (optNoCropFit) {
                // Sem cortes (contain proporcional)
                const hRatio = targetWidth / img.width;
                const vRatio = targetHeight / img.height;
                const ratio = Math.min(hRatio, vRatio) * 0.94; // respiro estético de 6%
                const shiftX = (targetWidth - img.width * ratio) / 2;
                const shiftY = (targetHeight - img.height * ratio) / 2;
                ctx.drawImage(img, 0, 0, img.width, img.height, shiftX, shiftY, img.width * ratio, img.height * ratio);
            } else {
                // Preenchimento completo (cover)
                const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
                const x = (targetWidth - img.width * scale) / 2;
                const y = (targetHeight - img.height * scale) / 2;
                ctx.drawImage(img, 0, 0, img.width, img.height, x, y, img.width * scale, img.height * scale);
            }

            // Exportação otimizada
            const mimeType = optFormat === 'webp' ? 'image/webp' : optFormat === 'png' ? 'image/png' : 'image/jpeg';
            let optimizedDataUrl = canvas.toDataURL(mimeType, optQuality / 100);

            // Cálculo do tamanho
            let currentSizeKb = Math.round((optimizedDataUrl.length * 3) / 4 / 1024);

            // Compressão inteligente se ultrapassar 500KB
            if (currentSizeKb > 500 && optFormat !== 'png') {
                optimizedDataUrl = canvas.toDataURL('image/webp', Math.max(0.65, (optQuality / 100) * 0.8));
                currentSizeKb = Math.round((optimizedDataUrl.length * 3) / 4 / 1024);
            }

            const reduction = originalSizeKb > 0
                ? Math.max(0, Math.round(((originalSizeKb - currentSizeKb) / originalSizeKb) * 1000) / 10)
                : 0;

            setOptResult({
                dataUrl: optimizedDataUrl,
                width: targetWidth,
                height: targetHeight,
                originalSizeKb: originalSizeKb || Math.round(currentSizeKb * 1.8),
                optimizedSizeKb: currentSizeKb,
                reductionPercent: reduction,
                format: optFormat,
                fileName: fileName.replace(/\.[^/.]+$/, "") + `_hero_optimized.${optFormat}`,
                originalDataUrl: sourceDataUrl
            });
        } catch (err) {
            console.error('Erro no processamento da imagem:', err);
            showFeedback('error', 'Falha ao tratar e otimizar imagem da capa.');
        } finally {
            setIsProcessing(false);
        }
    }, [aspectPreset, optQuality, optFormat, optMaxDimension, optBrightness, optContrast, optSaturation, optEnhanceStudio, optNoCropFit, optBgBlur, optBgColor]);

    // Recalcular quando parâmetros do otimizador mudam
    useEffect(() => {
        if (optRawDataUrl) {
            const originalKb = optFile ? Math.round(optFile.size / 1024) : 250;
            const name = optFile ? optFile.name : 'capa-hero.jpg';
            processCoverOptimization(optRawDataUrl, name, originalKb);
        }
    }, [optRawDataUrl, aspectPreset, optQuality, optFormat, optMaxDimension, optBrightness, optContrast, optSaturation, optEnhanceStudio, optNoCropFit, optBgBlur, optBgColor, processCoverOptimization]);

    // Manipular carregamento de arquivo
    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            showFeedback('error', 'Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
            return;
        }

        setOptFile(file);
        setOptSaveTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '));
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setOptRawDataUrl(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    // Carregar imagem de URL externa no otimizador
    const handleLoadUrlInOptimizer = (url: string, title?: string, category?: HeroCategory) => {
        setMainTab('optimizer');
        if (title) setOptSaveTitle(title);
        if (category) setOptSaveCategory(category);
        setOptFile(null);
        setOptRawDataUrl(url);
    };

    // Aplicar a imagem otimizada diretamente como Capa Ativa no Site
    const handleApplyOptimizedAsActiveCover = async () => {
        if (!optResult?.dataUrl) return;
        setIsApplyingDirectly(true);
        try {
            const newConfig: HeroCoverConfig = {
                ...activeCoverConfig,
                mediaType: 'image',
                imageUrl: optResult.dataUrl,
                badgeText: optSaveBadge || activeCoverConfig.badgeText,
                headlineHighlight: optSaveHeadline || activeCoverConfig.headlineHighlight,
                subheadline: optSaveSubheadline || activeCoverConfig.subheadline,
                updatedAt: new Date().toISOString()
            };

            await saveHeroCoverConfig(newConfig);
            setActiveCoverConfig(newConfig);
            showFeedback('success', 'Imagem tratada aplicada DIRETAMENTE como Capa Principal do site!');
        } catch (error) {
            console.error('Erro ao aplicar capa:', error);
            showFeedback('error', 'Erro ao salvar capa ativa.');
        } finally {
            setIsApplyingDirectly(false);
        }
    };

    // Salvar do otimizador no Banco de Capas
    const handleSaveOptimizedToBank = async () => {
        if (!optResult?.dataUrl) return;
        setIsSavingToBankFromOpt(true);
        try {
            const newAsset: Omit<HeroCoverAsset, 'id'> = {
                title: optSaveTitle || 'Nova Capa de Campanha',
                category: optSaveCategory || 'geral_capa',
                mediaType: 'image',
                imageUrl: optResult.dataUrl,
                badgeText: optSaveBadge,
                headlineHighlight: optSaveHeadline,
                subheadline: optSaveSubheadline,
                primaryButtonText: 'Explorar Ofertas',
                secondaryButtonText: 'Falar com Consultor',
                ratingScore: '5.0/5',
                ratingLabel: 'Destaque Ponto Chave',
                trustLabel: 'Qualidade Garantida',
                floatingCardTitle: 'Oferta Especial',
                floatingCardSubtext: 'Aproveite Agora',
                aspectRatio: aspectPreset === '16_9_widescreen' ? '16:9' : aspectPreset === '3_2_classic' ? '3:2' : 'custom',
                format: optFormat,
                fileSizeKb: optResult.optimizedSizeKb,
                tags: [optSaveCategory, 'otimizado', 'hero'],
                createdAt: new Date().toISOString()
            };

            await createDocument('hero_covers', newAsset);
            showFeedback('success', `Capa "${optSaveTitle}" salva no Banco na categoria selecionada!`);
        } catch (error) {
            console.error('Erro ao salvar no banco:', error);
            showFeedback('error', 'Erro ao salvar no Banco de Capas.');
        } finally {
            setIsSavingToBankFromOpt(false);
        }
    };

    // Copiar URL / DataUrl
    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        showFeedback('success', 'Link direto da capa copiado para a área de transferência!');
        setTimeout(() => setCopiedUrl(null), 3000);
    };

    // Baixar imagem tratada
    const handleDownloadOptimized = () => {
        if (!optResult?.dataUrl) return;
        const link = document.createElement('a');
        link.download = optResult.fileName;
        link.href = optResult.dataUrl;
        link.click();
    };

    // Filtros do banco
    const filteredCovers = bankList.filter(cover => {
        const matchesCategory = selectedCategory === 'todos' || cover.category === selectedCategory;
        const matchesSearch = searchQuery === '' || 
            cover.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (cover.headlineHighlight && cover.headlineHighlight.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (cover.badgeText && cover.badgeText.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (cover.tags && cover.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesCategory && matchesSearch;
    });

    const activeCategoryObj = HERO_CATEGORIES.find(c => c.id === selectedCategory) || HERO_CATEGORIES[0];

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 font-sans">
            {/* Header Executivo com Indicador da Capa Atual */}
            <div className="bg-gradient-to-r from-slate-900 via-brand-dark to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        <span>Acesso Restrito • Central Visual & Marketing</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                        Capa do Site (Hero) & Otimizador
                    </h2>
                    <p className="text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                        Tratamento profissional de fotos, redimensionamento sem cortes e banco de dados temático por campanhas (Promoções do Dia, Jornal de Ofertas, Pais, Mães, Natal, Black Friday e mais).
                    </p>
                </div>

                {/* Card Resumo da Capa Ativa */}
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex items-center gap-4 shrink-0">
                    <div className="w-20 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/20 relative shrink-0">
                        {activeCoverConfig.mediaType === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-purple-950 text-purple-200">
                                <VideoIcon size={20} />
                            </div>
                        ) : (
                            <img 
                                src={activeCoverConfig.imageUrl} 
                                alt="Capa Ativa" 
                                className="w-full h-full object-cover"
                            />
                        )}
                        <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                                Capa no Ar
                            </span>
                        </div>
                        <p className="text-xs font-bold text-white mt-1 truncate max-w-[180px]">
                            {activeCoverConfig.headlineHighlight || 'Capa Principal'}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[180px]">
                            {activeCoverConfig.badgeText || 'Design & Decoração'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Feedback Alert */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-sm ${
                            feedback.type === 'success' 
                                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                                : 'bg-rose-50 text-rose-900 border border-rose-200'
                        }`}
                    >
                        {feedback.type === 'success' ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
                        )}
                        <span>{feedback.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navegação por Abas Principais */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setMainTab('cover_bank')}
                        className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 ${
                            mainTab === 'cover_bank'
                                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        <FolderHeart className="h-4 w-4" />
                        <span>Banco de Capas & Campanhas ({bankList.length})</span>
                    </button>

                    <button
                        onClick={() => setMainTab('optimizer')}
                        className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 ${
                            mainTab === 'optimizer'
                                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        <Sliders className="h-4 w-4 text-amber-300" />
                        <span>Otimizador & Tratamento de Capas</span>
                    </button>

                    <button
                        onClick={() => setMainTab('active_cover')}
                        className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 ${
                            mainTab === 'active_cover'
                                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        <MonitorPlay className="h-4 w-4" />
                        <span>Capa Ativa & Personalização</span>
                    </button>
                </div>

                {mainTab === 'cover_bank' && (
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={handleSeedCuratedCovers}
                            className="px-3.5 py-2.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all flex items-center gap-1.5 shadow-sm"
                            title="Semear modelos de campanhas temáticas"
                        >
                            <Sparkles className="h-4 w-4 text-amber-600" />
                            <span className="hidden sm:inline">Restaurar Acervo Modelo</span>
                        </button>

                        <button
                            onClick={() => {
                                setEditingCover({
                                    category: 'geral_capa',
                                    mediaType: 'image',
                                    imageUrl: 'https://images.unsplash.com/photo-1616489953149-80980ca8675c?auto=format&fit=crop&q=80&w=1200',
                                    title: 'Nova Capa de Campanha',
                                    badgeText: 'Design Autoral',
                                    headlineHighlight: 'O ponto chave do seu ambiente.',
                                    subheadline: 'Soluções em iluminação e design.',
                                    primaryButtonText: 'Explorar Coleção',
                                    secondaryButtonText: 'Falar com Consultor'
                                });
                                setIsEditModalOpen(true);
                            }}
                            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-md"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Adicionar Capa ao Banco</span>
                        </button>
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* ABA 1: BANCO DE CAPAS & CAMPANHAS TEMÁTICAS (BD ESPECÍFICO) */}
            {/* ======================================================== */}
            {mainTab === 'cover_bank' && (
                <div className="space-y-6">
                    {/* Barra de Filtros por Categorias Temáticas */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar por campanha, tema, badge ou palavra-chave..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                <Filter className="h-4 w-4" />
                                <span>{filteredCovers.length} {filteredCovers.length === 1 ? 'campanha encontrada' : 'campanhas encontradas'}</span>
                            </div>
                        </div>

                        {/* Pills de Categorias Solicitadas */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {HERO_CATEGORIES.map(cat => {
                                const count = cat.id === 'todos' 
                                    ? bankList.length 
                                    : bankList.filter(c => c.category === cat.id).length;

                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 border ${
                                            selectedCategory === cat.id
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                        }`}
                                    >
                                        <span>{cat.icon}</span>
                                        <span>{cat.label}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Grade de Capas do Banco */}
                    {filteredCovers.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                                <FolderHeart size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Nenhuma capa encontrada nesta categoria</h3>
                            <p className="text-gray-500 text-sm max-w-md mx-auto">
                                Você pode adicionar uma nova capa personalizada ou restaurar o acervo de campanhas pré-formatadas.
                            </p>
                            <div className="flex items-center justify-center gap-3 pt-2">
                                <button
                                    onClick={handleSeedCuratedCovers}
                                    className="px-4 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-xl shadow hover:bg-amber-700 transition-all"
                                >
                                    Restaurar Modelos de Campanhas
                                </button>
                                <button
                                    onClick={() => setSelectedCategory('todos')}
                                    className="px-4 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    Ver Todas as Categorias
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCovers.map((cover) => {
                                const isCurrentActive = activeCoverConfig.imageUrl === cover.imageUrl;
                                const catInfo = HERO_CATEGORIES.find(c => c.id === cover.category) || HERO_CATEGORIES[1];

                                return (
                                    <div 
                                        key={cover.id}
                                        className={`bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col ${
                                            isCurrentActive 
                                                ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                                                : 'border-gray-200'
                                        }`}
                                    >
                                        {/* Preview Container com proporção de Hero e sem cortes */}
                                        <div className="relative aspect-[16/9] bg-slate-950 flex items-center justify-center overflow-hidden group">
                                            {/* Imagem de Fundo Desfocada para Preenchimento Elegante */}
                                            <img 
                                                src={cover.imageUrl} 
                                                alt="" 
                                                aria-hidden="true" 
                                                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110 pointer-events-none"
                                            />

                                            {/* Imagem Principal Enquadrada Perfeitamente Sem Cortes */}
                                            <img 
                                                src={cover.imageUrl} 
                                                alt={cover.title}
                                                className="w-full h-full object-contain relative z-10 p-3 drop-shadow-lg transition-transform duration-500 group-hover:scale-105"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1616489953149-80980ca8675c?auto=format&fit=crop&q=80&w=1200';
                                                }}
                                            />

                                            {/* Badge da Categoria */}
                                            <div className="absolute top-3 left-3 z-20">
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm flex items-center gap-1 ${catInfo.badgeBg}`}>
                                                    <span>{catInfo.icon}</span>
                                                    <span>{catInfo.label}</span>
                                                </span>
                                            </div>

                                            {/* Badge de Ativa no Site */}
                                            {isCurrentActive && (
                                                <div className="absolute top-3 right-3 z-20">
                                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-md flex items-center gap-1">
                                                        <CheckCircle2 size={12} />
                                                        <span>ATIVA NO SITE</span>
                                                    </span>
                                                </div>
                                            )}

                                            {/* Dimensão / Formato */}
                                            <div className="absolute bottom-2 right-2 z-20">
                                                <span className="text-[9px] font-mono font-bold bg-black/60 text-gray-200 px-2 py-0.5 rounded-md backdrop-blur-md">
                                                    16:9 • {cover.format || 'webp'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Conteúdo Textual da Capa */}
                                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="font-bold text-sm text-gray-900 line-clamp-1" title={cover.title}>
                                                        {cover.title}
                                                    </h4>
                                                </div>

                                                {cover.badgeText && (
                                                    <span className="inline-block text-[11px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-md">
                                                        {cover.badgeText}
                                                    </span>
                                                )}

                                                <p className="text-xs font-semibold text-gray-800 line-clamp-2">
                                                    "{cover.headlineHighlight || cover.title}"
                                                </p>

                                                {cover.subheadline && (
                                                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                                                        {cover.subheadline}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Ações da Capa */}
                                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                                {/* Botão de Ativar no Site */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleActivateFromBank(cover)}
                                                    disabled={isSavingActive || isCurrentActive}
                                                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                                                        isCurrentActive
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                                                            : 'bg-brand-primary hover:bg-brand-dark text-white shadow-brand-primary/20'
                                                    }`}
                                                >
                                                    {isCurrentActive ? (
                                                        <>
                                                            <Check size={14} className="text-emerald-600" />
                                                            <span>Capa Principal Ativa</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Zap size={14} className="text-amber-300" />
                                                            <span>Ativar no Site Agora</span>
                                                        </>
                                                    )}
                                                </button>

                                                {/* Linha de Ações Secundárias */}
                                                <div className="flex items-center gap-1.5">
                                                    {/* Tratar no Otimizador */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleLoadUrlInOptimizer(cover.imageUrl, cover.title, cover.category)}
                                                        className="flex-1 py-1.5 bg-gray-50 hover:bg-amber-50 hover:text-amber-900 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700 transition-colors flex items-center justify-center gap-1"
                                                        title="Editar imagem no estúdio do otimizador"
                                                    >
                                                        <Sliders size={12} className="text-amber-600" />
                                                        <span>Tratar</span>
                                                    </button>

                                                    {/* Editar Textos */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingCover(cover);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="flex-1 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-900 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700 transition-colors flex items-center justify-center gap-1"
                                                        title="Editar dados da campanha"
                                                    >
                                                        <Edit3 size={12} className="text-blue-600" />
                                                        <span>Editar</span>
                                                    </button>

                                                    {/* Copiar Link */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyUrl(cover.imageUrl)}
                                                        className="p-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 transition-colors"
                                                        title="Copiar link direto da imagem"
                                                    >
                                                        {copiedUrl === cover.imageUrl ? (
                                                            <Check size={14} className="text-emerald-600" />
                                                        ) : (
                                                            <Copy size={14} />
                                                        )}
                                                    </button>

                                                    {/* Excluir */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setCoverToDelete(cover)}
                                                        className="p-1.5 bg-gray-50 hover:bg-red-50 hover:text-red-600 border border-gray-200 rounded-lg text-gray-500 transition-colors"
                                                        title="Excluir capa do banco"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ======================================================== */}
            {/* ABA 2: OTIMIZADOR & TRATAMENTO DE IMAGENS DA CAPA */}
            {/* ======================================================== */}
            {mainTab === 'optimizer' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Controles de Tratamento (5 Colunas) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Box de Upload / Seleção de Imagem */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Upload className="h-4 w-4 text-brand-primary" />
                                    <span>Carregar Imagem da Capa</span>
                                </label>
                                {optFile && (
                                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                        {Math.round(optFile.size / 1024)} KB Original
                                    </span>
                                )}
                            </div>

                            {/* Drop Zone */}
                            <div 
                                ref={dropAreaRef}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                        handleFileSelect(e.dataTransfer.files[0]);
                                    }
                                }}
                                className="border-2 border-dashed border-gray-300 hover:border-brand-primary hover:bg-brand-light/30 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
                            >
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleFileSelect(e.target.files[0]);
                                        }
                                    }}
                                />
                                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                    <ImageIcon size={24} />
                                </div>
                                <p className="text-xs font-bold text-gray-800">
                                    Arraste sua foto aqui ou <span className="text-brand-primary underline">clique para selecionar</span>
                                </p>
                                <p className="text-[11px] text-gray-400">
                                    JPG, PNG ou WebP em alta resolução (até 20 MB)
                                </p>
                            </div>

                            {/* Entrada de URL Externa */}
                            <div className="pt-2">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                                    Ou cole uma URL direta de imagem:
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="url"
                                        placeholder="https://exemplo.com/sua-foto-de-capa.jpg"
                                        value={optRawDataUrl?.startsWith('data:') ? '' : (optRawDataUrl || '')}
                                        onChange={(e) => {
                                            if (e.target.value.trim()) {
                                                setOptFile(null);
                                                setOptRawDataUrl(e.target.value.trim());
                                            }
                                        }}
                                        className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Parâmetros de Enquadramento & Formato */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Scissors className="h-4 w-4 text-purple-600" />
                                <span>Enquadramento & Proporção da Capa</span>
                            </h3>

                            {/* Presets de Proporção */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setAspectPreset('16_9_widescreen')}
                                    className={`p-3 rounded-xl border text-left transition-all ${
                                        aspectPreset === '16_9_widescreen'
                                            ? 'bg-purple-50 border-purple-500 text-purple-950 ring-1 ring-purple-400'
                                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <p className="text-xs font-bold">16:9 Widescreen (Padrão)</p>
                                    <p className="text-[10px] text-gray-500">1920 × 1080 px • Ideal para Desktop & Mobile</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setAspectPreset('3_2_classic')}
                                    className={`p-3 rounded-xl border text-left transition-all ${
                                        aspectPreset === '3_2_classic'
                                            ? 'bg-purple-50 border-purple-500 text-purple-950 ring-1 ring-purple-400'
                                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <p className="text-xs font-bold">3:2 Banner Clássico</p>
                                    <p className="text-[10px] text-gray-500">1200 × 800 px • Proporção Fotográfica</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setAspectPreset('21_9_ultrawide')}
                                    className={`p-3 rounded-xl border text-left transition-all ${
                                        aspectPreset === '21_9_ultrawide'
                                            ? 'bg-purple-50 border-purple-500 text-purple-950 ring-1 ring-purple-400'
                                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <p className="text-xs font-bold">21:9 Ultra-Wide</p>
                                    <p className="text-[10px] text-gray-500">1920 × 820 px • Faixa Panorâmica</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setAspectPreset('free')}
                                    className={`p-3 rounded-xl border text-left transition-all ${
                                        aspectPreset === 'free'
                                            ? 'bg-purple-50 border-purple-500 text-purple-950 ring-1 ring-purple-400'
                                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <p className="text-xs font-bold">Livre Proporcional</p>
                                    <p className="text-[10px] text-gray-500">Mantém dimensões originais</p>
                                </button>
                            </div>

                            {/* Toggles de Sem Cortes */}
                            <div className="space-y-3 pt-2">
                                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">Modo Sem Cortes (Fit)</p>
                                        <p className="text-[10px] text-gray-500">Exibe 100% da imagem sem cortar partes vitais</p>
                                    </div>
                                    <input 
                                        type="checkbox"
                                        checked={optNoCropFit}
                                        onChange={(e) => setOptNoCropFit(e.target.checked)}
                                        className="w-4 h-4 text-brand-primary rounded"
                                    />
                                </label>

                                {optNoCropFit && (
                                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">Fundo Desfocado Ambiente</p>
                                            <p className="text-[10px] text-gray-500">Preenche as laterais com desfoque harmônico</p>
                                        </div>
                                        <input 
                                            type="checkbox"
                                            checked={optBgBlur}
                                            onChange={(e) => setOptBgBlur(e.target.checked)}
                                            className="w-4 h-4 text-brand-primary rounded"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Ajustes de Imagem (Brilho, Contraste, Saturação, Nitidez) */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Sun className="h-4 w-4 text-amber-500" />
                                    <span>Tratamento Visual em Tempo Real</span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOptBrightness(100);
                                        setOptContrast(100);
                                        setOptSaturation(100);
                                        setOptEnhanceStudio(true);
                                    }}
                                    className="text-[10px] text-brand-primary font-bold hover:underline flex items-center gap-1"
                                >
                                    <RotateCcw size={10} /> Resetar
                                </button>
                            </div>

                            {/* Brilho */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold text-gray-700">
                                    <span>Brilho</span>
                                    <span>{optBrightness}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="70" 
                                    max="130" 
                                    value={optBrightness}
                                    onChange={(e) => setOptBrightness(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                />
                            </div>

                            {/* Contraste */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold text-gray-700">
                                    <span>Contraste</span>
                                    <span>{optContrast}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="70" 
                                    max="130" 
                                    value={optContrast}
                                    onChange={(e) => setOptContrast(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                />
                            </div>

                            {/* Saturação */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold text-gray-700">
                                    <span>Saturação de Cores</span>
                                    <span>{optSaturation}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="60" 
                                    max="140" 
                                    value={optSaturation}
                                    onChange={(e) => setOptSaturation(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                />
                            </div>

                            {/* Qualidade e Formato WebP */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Formato
                                    </label>
                                    <select
                                        value={optFormat}
                                        onChange={(e) => setOptFormat(e.target.value as any)}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                                    >
                                        <option value="webp">WebP (Mais Leve)</option>
                                        <option value="jpeg">JPEG (Padrão)</option>
                                        <option value="png">PNG (Sem Perdas)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Qualidade ({optQuality}%)
                                    </label>
                                    <input 
                                        type="range" 
                                        min="60" 
                                        max="100" 
                                        value={optQuality}
                                        onChange={(e) => setOptQuality(Number(e.target.value))}
                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary mt-2"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Prévia ao Vivo & Ações (7 Colunas) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Card do Resultado da Otimização */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Pré-visualização do Hero Banner</h3>
                                    <p className="text-xs text-gray-500">Exatamente como será renderizado na abertura do site</p>
                                </div>

                                {optResult && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
                                            {optResult.reductionPercent > 0 ? `-${optResult.reductionPercent}% Redução` : 'Otimizado'}
                                        </span>
                                        <span className="text-xs font-mono text-gray-500">
                                            {optResult.optimizedSizeKb} KB ({optResult.width}×{optResult.height}px)
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Canvas / Container de Prévia do Hero */}
                            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 aspect-[16/9] flex items-center justify-center shadow-2xl">
                                {isProcessing ? (
                                    <div className="flex flex-col items-center gap-3 text-white">
                                        <div className="w-8 h-8 border-3 border-white/20 border-t-brand-secondary rounded-full animate-spin" />
                                        <span className="text-xs font-bold text-gray-300">Tratando e otimizando imagem...</span>
                                    </div>
                                ) : optResult?.dataUrl ? (
                                    <div className="w-full h-full relative flex items-center justify-center">
                                        {/* Fundo Desfocado */}
                                        <img 
                                            src={optResult.dataUrl} 
                                            alt="" 
                                            aria-hidden="true" 
                                            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110 pointer-events-none"
                                        />

                                        {/* Imagem Otimizada */}
                                        <img 
                                            src={optResult.dataUrl} 
                                            alt="Prévia da Capa" 
                                            className="w-full h-full object-contain relative z-10 p-4 drop-shadow-2xl"
                                        />

                                        {/* Simulação de Textos do Hero (Overlay) */}
                                        <div className="absolute inset-0 z-20 pointer-events-none p-6 flex flex-col justify-between bg-gradient-to-t from-slate-950/60 via-transparent to-black/20">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/30 border border-amber-400/40 px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                                                    {optSaveBadge || 'Design & Decoração'}
                                                </span>
                                            </div>

                                            <div className="space-y-1 max-w-sm">
                                                <p className="text-sm sm:text-base font-serif font-bold text-white drop-shadow-md">
                                                    {optSaveHeadline || 'O ponto chave do seu ambiente.'}
                                                </p>
                                                <p className="text-[10px] sm:text-xs text-gray-200 line-clamp-2 drop-shadow">
                                                    {optSaveSubheadline || 'Curadoria especializada em design e utilidades.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-400 space-y-2">
                                        <ImageIcon size={40} className="mx-auto text-gray-600" />
                                        <p className="text-xs font-bold text-gray-300">Nenhuma imagem carregada no estúdio</p>
                                        <p className="text-[11px] text-gray-500">Selecione uma foto ao lado para iniciar o tratamento</p>
                                    </div>
                                )}
                            </div>

                            {/* Metadados para Destino da Capa */}
                            {optResult && (
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
                                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                        <Tag size={14} className="text-brand-primary" />
                                        <span>Destino & Identificação da Campanha</span>
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                                Título da Campanha
                                            </label>
                                            <input 
                                                type="text"
                                                value={optSaveTitle}
                                                onChange={(e) => setOptSaveTitle(e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                                Categoria Temática (BD)
                                            </label>
                                            <select
                                                value={optSaveCategory}
                                                onChange={(e) => setOptSaveCategory(e.target.value as HeroCategory)}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
                                            >
                                                {HERO_CATEGORIES.filter(c => c.id !== 'todos').map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.icon} {c.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                                Badge / Etiqueta da Capa
                                            </label>
                                            <input 
                                                type="text"
                                                value={optSaveBadge}
                                                onChange={(e) => setOptSaveBadge(e.target.value)}
                                                placeholder="Ex: ⚡ Oferta Relâmpago"
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                                Frase em Destaque
                                            </label>
                                            <input 
                                                type="text"
                                                value={optSaveHeadline}
                                                onChange={(e) => setOptSaveHeadline(e.target.value)}
                                                placeholder="Ex: O ponto chave do seu lar"
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* BOTÕES DE AÇÃO COM 1 CLIQUE */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                        {/* Aplicar Diretamente como Capa Ativa */}
                                        <button
                                            type="button"
                                            onClick={handleApplyOptimizedAsActiveCover}
                                            disabled={isApplyingDirectly}
                                            className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                                        >
                                            {isApplyingDirectly ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Aplicando no Site...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Zap size={16} className="text-amber-300" />
                                                    <span>Aplicar como Capa Ativa do Site</span>
                                                </>
                                            )}
                                        </button>

                                        {/* Salvar no Banco de Capas */}
                                        <button
                                            type="button"
                                            onClick={handleSaveOptimizedToBank}
                                            disabled={isSavingToBankFromOpt}
                                            className="py-3 px-4 bg-brand-primary hover:bg-brand-dark text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                                        >
                                            {isSavingToBankFromOpt ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Salvando no Banco...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} />
                                                    <span>Salvar no Banco de Capas</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Ações Auxiliares: Copiar Link & Baixar */}
                                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => handleCopyUrl(optResult.dataUrl)}
                                            className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5"
                                        >
                                            <Copy size={13} />
                                            <span>Copiar Link Direto</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleDownloadOptimized}
                                            className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5"
                                        >
                                            <Download size={13} />
                                            <span>Baixar Imagem ({optFormat.toUpperCase()})</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* ABA 3: CAPA ATIVA & PERSONALIZAÇÃO (EDITOR MANUAL) */}
            {/* ======================================================== */}
            {mainTab === 'active_cover' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Formulário de Configuração (7 Colunas) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Tipo de Mídia */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                            <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                <span>Formato de Mídia da Capa</span>
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setActiveCoverConfig({ ...activeCoverConfig, mediaType: 'image' })}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 ${
                                        activeCoverConfig.mediaType === 'image'
                                            ? 'border-brand-primary bg-brand-light/50 text-brand-primary ring-2 ring-brand-primary/20'
                                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`p-2.5 rounded-xl ${activeCoverConfig.mediaType === 'image' ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                                        <ImageIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">Imagem Otimizada</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Fotografia de alto impacto</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveCoverConfig({ ...activeCoverConfig, mediaType: 'video' })}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 ${
                                        activeCoverConfig.mediaType === 'video'
                                            ? 'border-brand-primary bg-brand-light/50 text-brand-primary ring-2 ring-brand-primary/20'
                                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`p-2.5 rounded-xl ${activeCoverConfig.mediaType === 'video' ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                                        <VideoIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">Vídeo em Loop</p>
                                        <p className="text-xs text-gray-500 mt-0.5">MP4 direto ou YouTube embed</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* URLs e Fontes de Mídia */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-blue-600" />
                                <span>Link da Imagem da Capa</span>
                            </h3>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    URL da Imagem
                                </label>
                                <input 
                                    type="url"
                                    value={activeCoverConfig.imageUrl}
                                    onChange={(e) => setActiveCoverConfig({ ...activeCoverConfig, imageUrl: e.target.value })}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none"
                                />
                            </div>

                            {activeCoverConfig.mediaType === 'video' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        URL do Vídeo (MP4 ou YouTube)
                                    </label>
                                    <input 
                                        type="url"
                                        value={activeCoverConfig.videoUrl || ''}
                                        onChange={(e) => setActiveCoverConfig({ ...activeCoverConfig, videoUrl: e.target.value })}
                                        placeholder="https://assets.mixkit.co/... ou https://youtube.com/watch?v=..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Textos & Títulos */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Type className="h-4 w-4 text-emerald-600" />
                                <span>Textos, Títulos e Chamadas</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Etiqueta Superior (Badge)
                                    </label>
                                    <input 
                                        type="text"
                                        value={activeCoverConfig.badgeText || ''}
                                        onChange={(e) => setActiveCoverConfig({ ...activeCoverConfig, badgeText: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Prefixo do Título
                                    </label>
                                    <input 
                                        type="text"
                                        value={activeCoverConfig.headlinePrefix || ''}
                                        onChange={(e) => setActiveCoverConfig({ ...activeCoverConfig, headlinePrefix: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Termo em Destaque (Dourado/Marca)
                                    </label>
                                    <input 
                                        type="text"
                                        value={activeCoverConfig.headlineHighlight || ''}
                                        onChange={(e) => setActiveCoverConfig({ ...activeCoverConfig, headlineHighlight: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Sufixo do Título
                                    </label>
                                    <input 
                                        type="text"
                                        value={activeCoverConfig.headlineSuffix || ''}
                                        onChange={(e) => setActiveCoverConfig({ ...activeCoverConfig, headlineSuffix: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Subtítulo Explicativo
                                    </label>
                                    <textarea 
                                        rows={3}
                                        value={activeCoverConfig.subheadline || ''}
                                        onChange={(e) => setActiveCoverConfig({ ...activeCoverConfig, subheadline: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Texto Botão Principal (CTA)
                                    </label>
                                    <input 
                                        type="text"
                                        value={activeCoverConfig.primaryButtonText || ''}
                                        onChange={(e) => setActiveCoverConfig({ ...activeCoverConfig, primaryButtonText: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Texto Botão Secundário
                                    </label>
                                    <input 
                                        type="text"
                                        value={activeCoverConfig.secondaryButtonText || ''}
                                        onChange={(e) => setActiveCoverConfig({ ...activeCoverConfig, secondaryButtonText: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botão de Salvar */}
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => handleSaveActiveCover()}
                                disabled={isSavingActive}
                                className="px-8 py-3.5 bg-brand-primary hover:bg-brand-dark text-white rounded-2xl text-sm font-bold shadow-xl shadow-brand-primary/25 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSavingActive ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Salvando no Site...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>Salvar & Publicar no Site</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Pré-visualização Idêntica ao Site (5 Colunas) */}
                    <div className="lg:col-span-5 sticky top-8 space-y-4">
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Eye className="h-4 w-4 text-brand-primary" />
                                <span>Visualização no Site em Tempo Real</span>
                            </h3>

                            {/* Card Hero Preview */}
                            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 relative aspect-[16/9] flex items-center justify-center">
                                <img 
                                    src={activeCoverConfig.imageUrl} 
                                    alt="" 
                                    aria-hidden="true" 
                                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110 pointer-events-none"
                                />

                                <img 
                                    src={activeCoverConfig.imageUrl} 
                                    alt="Capa Ativa" 
                                    className="w-full h-full object-contain relative z-10 p-3 drop-shadow-2xl"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = DEFAULT_COVER.imageUrl;
                                    }}
                                />

                                <div className="absolute inset-0 z-20 pointer-events-none p-4 flex flex-col justify-between bg-gradient-to-t from-slate-950/60 via-transparent to-black/20">
                                    <span className="self-start text-[9px] font-bold text-amber-300 bg-amber-500/30 px-2 py-0.5 rounded-full border border-amber-400/30 uppercase">
                                        {activeCoverConfig.badgeText || 'Design & Decoração'}
                                    </span>

                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-white drop-shadow">
                                            {activeCoverConfig.headlinePrefix}{' '}
                                            <span className="text-amber-400">{activeCoverConfig.headlineHighlight}</span>{' '}
                                            {activeCoverConfig.headlineSuffix}
                                        </p>
                                        <p className="text-[9px] text-gray-300 line-clamp-2">
                                            {activeCoverConfig.subheadline}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL DE EDIÇÃO / CRIAÇÃO DE CAPA NO BANCO */}
            {/* ======================================================== */}
            {isEditModalOpen && editingCover && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 space-y-6"
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-xl font-bold font-serif text-gray-900">
                                    {editingCover.id ? 'Editar Campanha de Capa' : 'Nova Capa para o Banco'}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Configure as mídias e textos que compõem este modelo temático.
                                </p>
                            </div>
                            <button
                                onClick={() => { setIsEditModalOpen(false); setEditingCover(null); }}
                                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveCoverAssetModal} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Título Identificador da Campanha *
                                    </label>
                                    <input 
                                        type="text" 
                                        required
                                        value={editingCover.title || ''}
                                        onChange={(e) => setEditingCover({ ...editingCover, title: e.target.value })}
                                        placeholder="Ex: Especial Dia dos Pais • Kit Gourmet"
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Categoria Temática (Banco de Dados) *
                                    </label>
                                    <select
                                        value={editingCover.category || 'geral_capa'}
                                        onChange={(e) => setEditingCover({ ...editingCover, category: e.target.value as HeroCategory })}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
                                    >
                                        {HERO_CATEGORIES.filter(c => c.id !== 'todos').map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.icon} {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Badge Superior
                                    </label>
                                    <input 
                                        type="text" 
                                        value={editingCover.badgeText || ''}
                                        onChange={(e) => setEditingCover({ ...editingCover, badgeText: e.target.value })}
                                        placeholder="Ex: 👔 Especial Dia dos Pais"
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Link Direto da Imagem da Capa *
                                    </label>
                                    <input 
                                        type="url" 
                                        required
                                        value={editingCover.imageUrl || ''}
                                        onChange={(e) => setEditingCover({ ...editingCover, imageUrl: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Frase / Headline em Destaque
                                    </label>
                                    <input 
                                        type="text" 
                                        value={editingCover.headlineHighlight || ''}
                                        onChange={(e) => setEditingCover({ ...editingCover, headlineHighlight: e.target.value })}
                                        placeholder="Ex: O ponto chave do seu ambiente."
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Subtítulo da Campanha
                                    </label>
                                    <textarea 
                                        rows={2}
                                        value={editingCover.subheadline || ''}
                                        onChange={(e) => setEditingCover({ ...editingCover, subheadline: e.target.value })}
                                        placeholder="Texto descritivo com detalhes da campanha..."
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => { setIsEditModalOpen(false); setEditingCover(null); }}
                                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingCoverAsset}
                                    className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2"
                                >
                                    {isSavingCoverAsset ? 'Salvando...' : 'Salvar no Banco'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
            {/* ======================================================== */}
            {coverToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-red-100 text-center space-y-4"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                            <Trash2 size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                            Excluir Capa do Banco?
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Tem certeza de que deseja remover a capa <strong>"{coverToDelete.title}"</strong> do banco de dados? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setCoverToDelete(null)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteCover}
                                disabled={isDeleting}
                                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow"
                            >
                                {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
