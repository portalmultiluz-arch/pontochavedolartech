import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Image as ImageIcon, 
    Upload, 
    Sparkles, 
    Copy, 
    Check, 
    Trash2, 
    Search, 
    Filter, 
    ExternalLink, 
    Plus, 
    Layers, 
    Share2, 
    CheckCircle2, 
    AlertCircle,
    Maximize2,
    RefreshCw,
    Download,
    Eye,
    Tag,
    ShoppingBag,
    Globe,
    Sliders,
    Zap,
    Square,
    Sun,
    FileImage,
    ArrowRight,
    Scissors,
    ShieldCheck
} from 'lucide-react';
import { subscribeToCollection, createDocument, deleteDocument, updateDocument } from '../../services/firebaseService';
import { MediaAsset } from '../../types';

// Acervo Curado de Alta Performance
const INITIAL_CURATED_MEDIA: Omit<MediaAsset, 'id'>[] = [
    {
        title: 'Logo Oficial & Emblema Ponto Chave do Lar',
        category: 'geral',
        tags: ['logo', 'oficial', 'emblema', 'ponto chave do lar', 'padrao', 'marca'],
        url: '/ponto_chave_logo.jpg',
        thumbnailUrl: '/ponto_chave_logo.jpg',
        aspectRatio: '1:1',
        format: 'webp',
        fileSizeKb: 45,
        source: 'curated',
        createdAt: new Date().toISOString()
    },
    {
        title: 'Pendente Tubular LED Dourado Minimalista',
        category: 'iluminacao',
        tags: ['pendente', 'led', 'dourado', 'iluminacao', 'sala de jantar'],
        url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1000',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=60&w=300',
        aspectRatio: '1:1',
        format: 'webp',
        fileSizeKb: 65,
        source: 'curated',
        createdAt: new Date().toISOString()
    },
    {
        title: 'Torneira Monocomando Gourmet Preta Fosca',
        category: 'hidraulica',
        tags: ['torneira', 'monocomando', 'preto fosco', 'gourmet', 'cozinha'],
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000',
        thumbnailUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=60&w=300',
        aspectRatio: '1:1',
        format: 'webp',
        fileSizeKb: 72,
        source: 'curated',
        createdAt: new Date().toISOString()
    },
    {
        title: 'Chuveiro Ducha Alta Pressão Inox 304',
        category: 'hidraulica',
        tags: ['chuveiro', 'ducha', 'inox', 'banheiro', 'alta pressao'],
        url: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80&w=1000',
        thumbnailUrl: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=60&w=300',
        aspectRatio: '1:1',
        format: 'webp',
        fileSizeKb: 58,
        source: 'curated',
        createdAt: new Date().toISOString()
    },
    {
        title: 'Interruptor Touch Inteligente Wi-Fi 3 Teclas',
        category: 'eletrica',
        tags: ['interruptor', 'smart', 'touch', 'automacao', 'wifi'],
        url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=1000',
        thumbnailUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=60&w=300',
        aspectRatio: '1:1',
        format: 'webp',
        fileSizeKb: 60,
        source: 'curated',
        createdAt: new Date().toISOString()
    },
    {
        title: 'Spot Embutir Recuado Anti-Ofuscamento GU10',
        category: 'iluminacao',
        tags: ['spot', 'embutir', 'recuado', 'gu10', 'teto'],
        url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=1000',
        thumbnailUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=60&w=300',
        aspectRatio: '1:1',
        format: 'webp',
        fileSizeKb: 52,
        source: 'curated',
        createdAt: new Date().toISOString()
    },
    {
        title: 'Fita LED COB 2700K Luz Quente Contínua',
        category: 'iluminacao',
        tags: ['fita led', 'cob', '2700k', 'luz quente', 'gesso'],
        url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1000',
        thumbnailUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=60&w=300',
        aspectRatio: '1:1',
        format: 'webp',
        fileSizeKb: 78,
        source: 'curated',
        createdAt: new Date().toISOString()
    }
];

export type PresetType = 'ecommerce_1_1' | 'banner_16_9' | 'story_9_16' | 'thumbnail' | 'free';

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

interface MediaBankManagerProps {
    onSelectImageForProduct?: (imageUrl: string) => void;
    isModalMode?: boolean;
    initialTab?: 'optimizer' | 'gallery';
}

export const MediaBankManager: React.FC<MediaBankManagerProps> = ({ 
    onSelectImageForProduct,
    isModalMode = false,
    initialTab = 'gallery'
}) => {
    const [currentView, setCurrentView] = useState<'gallery' | 'optimizer'>(initialTab);
    const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isOptimizerCopied, setIsOptimizerCopied] = useState(false);
    const [showDirectLinkBox, setShowDirectLinkBox] = useState(false);
    const [savedAssetId, setSavedAssetId] = useState<string | null>(null);
    const [savedShortUrl, setSavedShortUrl] = useState<string | null>(null);
    const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
    const [assetToDelete, setAssetToDelete] = useState<MediaAsset | null>(null);
    const [isDeletingAsset, setIsDeletingAsset] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Estado do Otimizador
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [rawImageDataUrl, setRawImageDataUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSavingOptimized, setIsSavingOptimized] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);

    // Controles do Otimizador
    const [preset, setPreset] = useState<PresetType>('ecommerce_1_1');
    const [outputFormat, setOutputFormat] = useState<'webp' | 'jpeg' | 'png'>('webp');
    const [quality, setQuality] = useState<number>(82);
    const [maxDimension, setMaxDimension] = useState<number>(1000);
    const [fillBackground, setFillBackground] = useState<boolean>(true);
    const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
    const [enhanceStudio, setEnhanceStudio] = useState<boolean>(true);
    const [assetCategory, setAssetCategory] = useState<string>('iluminacao');
    const [assetTitle, setAssetTitle] = useState<string>('');
    const [isDragOver, setIsDragOver] = useState(false);

    // Modal de Novo Link Direto
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState('iluminacao');
    const [newUrl, setNewUrl] = useState('');
    const [newTags, setNewTags] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const optimizerInputRef = useRef<HTMLInputElement>(null);

    const showToast = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4000);
    };

    // Assinatura do Firestore com tratamento de erros
    useEffect(() => {
        let isMounted = true;
        const unsubscribe = subscribeToCollection('media_assets', (data) => {
            if (isMounted) {
                const list = data as MediaAsset[];
                setMediaList(list || []);
                setLoading(false);
            }
        }, 'createdAt');

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    // Função Central de Otimização e Compressão
    const processImageOptimization = useCallback(async (
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
            if (!ctx) throw new Error('Falha ao inicializar contexto gráfico Canvas 2D');

            let targetWidth = img.width;
            let targetHeight = img.height;

            // Ajuste por Preset
            if (preset === 'ecommerce_1_1') {
                const size = Math.min(maxDimension, 1000);
                targetWidth = size;
                targetHeight = size;
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                if (fillBackground) {
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, targetWidth, targetHeight);
                }

                // Ajusta proporção contida no quadrado
                const hRatio = targetWidth / img.width;
                const vRatio = targetHeight / img.height;
                const ratio = Math.min(hRatio, vRatio) * 0.92; // Margem de respiro de 8% de estúdio
                const centerShiftX = (targetWidth - img.width * ratio) / 2;
                const centerShiftY = (targetHeight - img.height * ratio) / 2;

                if (enhanceStudio) {
                    ctx.filter = 'contrast(1.05) brightness(1.02) saturate(1.03)';
                }

                ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);
            } else if (preset === 'banner_16_9') {
                const width = Math.min(maxDimension, 1920);
                targetWidth = width;
                targetHeight = Math.round((width * 9) / 16);
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                if (fillBackground) {
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, targetWidth, targetHeight);
                }

                // Enquadramento de capa
                const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
                const x = (targetWidth - img.width * scale) / 2;
                const y = (targetHeight - img.height * scale) / 2;

                if (enhanceStudio) {
                    ctx.filter = 'contrast(1.04) brightness(1.01)';
                }
                ctx.drawImage(img, 0, 0, img.width, img.height, x, y, img.width * scale, img.height * scale);
            } else if (preset === 'story_9_16') {
                const height = Math.min(maxDimension, 1920);
                targetHeight = height;
                targetWidth = Math.round((height * 9) / 16);
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                if (fillBackground) {
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, targetWidth, targetHeight);
                }

                const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
                const x = (targetWidth - img.width * scale) / 2;
                const y = (targetHeight - img.height * scale) / 2;

                if (enhanceStudio) {
                    ctx.filter = 'contrast(1.04) brightness(1.01)';
                }
                ctx.drawImage(img, 0, 0, img.width, img.height, x, y, img.width * scale, img.height * scale);
            } else if (preset === 'thumbnail') {
                targetWidth = 400;
                targetHeight = 400;
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                if (fillBackground) {
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, targetWidth, targetHeight);
                }

                const ratio = Math.min(targetWidth / img.width, targetHeight / img.height) * 0.94;
                const shiftX = (targetWidth - img.width * ratio) / 2;
                const shiftY = (targetHeight - img.height * ratio) / 2;

                ctx.drawImage(img, 0, 0, img.width, img.height, shiftX, shiftY, img.width * ratio, img.height * ratio);
            } else {
                // Free Proporcional
                let w = img.width;
                let h = img.height;
                if (w > maxDimension || h > maxDimension) {
                    if (w > h) {
                        h = Math.round((h * maxDimension) / w);
                        w = maxDimension;
                    } else {
                        w = Math.round((w * maxDimension) / h);
                        h = maxDimension;
                    }
                }
                targetWidth = w;
                targetHeight = h;
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                if (enhanceStudio) {
                    ctx.filter = 'contrast(1.03) brightness(1.01)';
                }
                ctx.drawImage(img, 0, 0, w, h);
            }

            // Exportação
            const mimeType = outputFormat === 'webp' ? 'image/webp' : outputFormat === 'png' ? 'image/png' : 'image/jpeg';
            let optimizedDataUrl = canvas.toDataURL(mimeType, quality / 100);

            // Se for PNG e não precisar de transparência, ou se exceder 400KB, comprimir de forma inteligente
            let currentSizeKb = Math.round((optimizedDataUrl.length * 3) / 4 / 1024);
            if (currentSizeKb > 400 && outputFormat !== 'png') {
                optimizedDataUrl = canvas.toDataURL('image/webp', Math.max(0.65, (quality / 100) * 0.8));
                currentSizeKb = Math.round((optimizedDataUrl.length * 3) / 4 / 1024);
            }

            const reduction = originalSizeKb > 0 
                ? Math.max(0, Math.round(((originalSizeKb - currentSizeKb) / originalSizeKb) * 1000) / 10)
                : 0;

            setOptimizationResult({
                dataUrl: optimizedDataUrl,
                width: targetWidth,
                height: targetHeight,
                originalSizeKb,
                optimizedSizeKb: currentSizeKb,
                reductionPercent: reduction,
                format: outputFormat,
                fileName: fileName.replace(/\.[^/.]+$/, "") + `.${outputFormat}`,
                originalDataUrl: sourceDataUrl
            });

            if (!assetTitle) {
                const clean = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
                setAssetTitle(clean.charAt(0).toUpperCase() + clean.slice(1));
            }
        } catch (err: any) {
            console.error('Erro no processamento da imagem:', err);
            showToast('error', 'Não foi possível processar a imagem. Verifique se o arquivo está corrompido.');
        } finally {
            setIsProcessing(false);
        }
    }, [preset, maxDimension, fillBackground, backgroundColor, enhanceStudio, outputFormat, quality, assetTitle]);

    // Recalcular quando os controles mudam se já houver imagem carregada
    useEffect(() => {
        if (rawImageDataUrl && selectedFile) {
            const origSizeKb = Math.round(selectedFile.size / 1024);
            processImageOptimization(rawImageDataUrl, selectedFile.name, origSizeKb);
        }
    }, [preset, outputFormat, quality, maxDimension, fillBackground, backgroundColor, enhanceStudio, processImageOptimization]);

    // Manipulador de Arquivo Selecionado (Upload ou Drag & Drop)
    const handleFileChosen = (file: File) => {
        if (!file.type.startsWith('image/')) {
            showToast('error', 'Selecione um arquivo de imagem válido (JPG, PNG, WEBP, etc).');
            return;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setRawImageDataUrl(dataUrl);
            const origSizeKb = Math.round(file.size / 1024);
            processImageOptimization(dataUrl, file.name, origSizeKb);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileChosen(file);
        }
    };

    // Salvar Imagem Otimizada no Banco do Firestore e gerar Link Curto
    const handleSaveOptimizedToBank = async (): Promise<string | null> => {
        if (!optimizationResult) return null;
        setIsSavingOptimized(true);

        try {
            const newAsset: Omit<MediaAsset, 'id'> = {
                title: assetTitle.trim() || 'Foto de Produto Otimizada',
                category: assetCategory,
                tags: [assetCategory, 'otimizada', 'produto', preset],
                url: optimizationResult.dataUrl,
                aspectRatio: `${optimizationResult.width}:${optimizationResult.height}`,
                width: optimizationResult.width,
                height: optimizationResult.height,
                fileSizeKb: optimizationResult.optimizedSizeKb,
                format: optimizationResult.format,
                source: 'upload',
                createdAt: new Date().toISOString()
            };

            const docId = await createDocument('media_assets', newAsset);
            const shortUrl = `${window.location.origin}/?media=${docId}`;
            setSavedAssetId(docId);
            setSavedShortUrl(shortUrl);
            showToast('success', 'Imagem salva no sistema com sucesso! Link curto gerado.');

            if (onSelectImageForProduct) {
                onSelectImageForProduct(optimizationResult.dataUrl);
            }
            return shortUrl;
        } catch (err: any) {
            console.error('Erro ao salvar mídia otimizada:', err);
            showToast('error', 'Erro ao salvar no Firestore: ' + (err.message || 'Verifique as permissões'));
            return null;
        } finally {
            setIsSavingOptimized(false);
        }
    };

    // Download Direto para o Computador / Celular
    const handleDownloadOptimized = () => {
        if (!optimizationResult) return;
        const link = document.createElement('a');
        link.href = optimizationResult.dataUrl;
        link.download = optimizationResult.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('success', `Download de "${optimizationResult.fileName}" iniciado!`);
    };

    // Função Universal e Robusta para Copiar para a Área de Transferência (com Fallback)
    const copyToClipboard = async (text: string): Promise<boolean> => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (err) {
            console.warn('navigator.clipboard.writeText não disponível ou bloqueado, acionando fallback textarea...', err);
        }

        // Fallback robusto usando elemento textarea temporário
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            textArea.setAttribute('readonly', '');
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        } catch (err) {
            console.error('Fallback execCommand falhou:', err);
            return false;
        }
    };

    // Copiar Link Curto Oficial do Sistema
    const handleCopyShortLink = async (urlToCopy?: string) => {
        let targetUrl = urlToCopy || savedShortUrl;
        
        // Se ainda não foi salvo no sistema, salva automaticamente para registrar e gerar o link curto
        if (!targetUrl && optimizationResult) {
            targetUrl = await handleSaveOptimizedToBank();
        }

        if (!targetUrl) return;

        const success = await copyToClipboard(targetUrl);
        if (success) {
            setIsOptimizerCopied(true);
            setTimeout(() => setIsOptimizerCopied(false), 3000);
            showToast('success', 'Link curto copiado para a área de transferência!');
        } else {
            showToast('success', 'Link gerado! Copie o endereço no campo abaixo.');
        }
    };

    // Copiar Código Raw / DataURL Base64
    const handleCopyDataUrl = async () => {
        if (!optimizationResult) return;
        const success = await copyToClipboard(optimizationResult.dataUrl);
        if (success) {
            showToast('success', 'Código completo da imagem copiado!');
        }
    };

    // Inicialização da galeria se estiver vazia
    const handleSeedDefaults = async () => {
        try {
            setLoading(true);
            for (const item of INITIAL_CURATED_MEDIA) {
                await createDocument('media_assets', item);
            }
            showToast('success', 'Acervo de produtos carregado com sucesso!');
        } catch (err: any) {
            console.error('Erro ao popular mídia:', err);
            showToast('error', 'Falha ao inicializar acervo: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Copiar link de item da galeria (gera link curto ou usa link web direto)
    const handleCopyLink = async (url: string, id: string) => {
        const shortUrl = `${window.location.origin}/?media=${id}`;
        const targetToCopy = url.startsWith('http') && !url.includes('base64') ? url : shortUrl;
        await copyToClipboard(targetToCopy);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
        showToast('success', 'Link copiado para a área de transferência!');
    };

    // Adicionar por Link Direto
    const handleAddDirectUrl = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUrl.trim() || !newTitle.trim()) return;

        try {
            const tagsArray = newTags
                .split(',')
                .map(t => t.trim().toLowerCase())
                .filter(t => t.length > 0);

            const newAsset: Omit<MediaAsset, 'id'> = {
                title: newTitle.trim(),
                category: newCategory,
                tags: tagsArray.length > 0 ? tagsArray : [newCategory],
                url: newUrl.trim(),
                format: 'webp',
                source: 'curated',
                createdAt: new Date().toISOString()
            };

            await createDocument('media_assets', newAsset);
            setNewTitle('');
            setNewUrl('');
            setNewTags('');
            setIsAddModalOpen(false);
            showToast('success', 'Imagem externa vinculada com sucesso!');
        } catch (err: any) {
            console.error("Erro ao salvar link:", err);
            showToast('error', 'Erro ao vincular imagem: ' + err.message);
        }
    };

    // Iniciar Exclusão de Imagem (Abre Modal de Confirmação In-App)
    const handleRequestDeleteAsset = (asset: MediaAsset, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setAssetToDelete(asset);
    };

    // Executar Exclusão Definitiva no Firestore
    const executeDeleteAsset = async () => {
        if (!assetToDelete) return;
        setIsDeletingAsset(true);

        try {
            await deleteDocument('media_assets', assetToDelete.id);
            setMediaList(prev => prev.filter(item => item.id !== assetToDelete.id));
            if (previewAsset?.id === assetToDelete.id) {
                setPreviewAsset(null);
            }
            showToast('success', 'Imagem excluída do banco com sucesso!');
            setAssetToDelete(null);
        } catch (err: any) {
            console.error("Erro ao deletar imagem:", err);
            showToast('error', 'Erro ao deletar imagem: ' + (err.message || 'Verifique as permissões'));
        } finally {
            setIsDeletingAsset(false);
        }
    };

    // Filtros da Galeria
    const filteredAssets = mediaList.filter(asset => {
        const matchesCategory = selectedCategory === 'todos' || asset.category === selectedCategory;
        const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className={`font-sans space-y-6 ${isModalMode ? 'p-2' : 'p-4 sm:p-8 max-w-7xl mx-auto'}`}>
            
            {/* Feedback Toast */}
            {feedback && (
                <div className={`p-4 rounded-2xl flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-4 duration-200 ${
                    feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    <div className="flex items-center gap-2 text-sm font-bold">
                        {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{feedback.message}</span>
                    </div>
                    <button onClick={() => setFeedback(null)} className="text-white/80 hover:text-white text-xs">✕</button>
                </div>
            )}

            {/* Header com Navegação em Abas */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold mb-3 border border-amber-500/40">
                        <Zap size={14} className="text-amber-400" />
                        <span>Estúdio de Mídias & Otimização de Alta Performance</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                        Otimizador de Imagens & Banco Central
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                        Comprima fotos pesadas em até <strong>95%</strong> com tecnologia WebP, padronize enquadramentos de produtos para e-commerce e gere links instantâneos para Mercado Livre, Shopee e Redes Sociais.
                    </p>
                </div>

                {/* Alternador de Modos */}
                <div className="flex flex-wrap gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-700 w-full md:w-auto shadow-inner">
                    <button
                        onClick={() => setCurrentView('optimizer')}
                        className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all grow md:grow-0 ${
                            currentView === 'optimizer'
                                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                                : 'text-slate-200 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <Sparkles size={16} className={currentView === 'optimizer' ? 'text-slate-950' : 'text-amber-400'} />
                        <span>⚡ Otimizador & Compressor</span>
                    </button>

                    <button
                        onClick={() => setCurrentView('gallery')}
                        className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all grow md:grow-0 ${
                            currentView === 'gallery'
                                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                                : 'text-slate-200 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <ImageIcon size={16} className={currentView === 'gallery' ? 'text-slate-950' : 'text-amber-400'} />
                        <span>🖼️ Banco de Mídias ({mediaList.length})</span>
                    </button>
                </div>
            </div>

            {/* VIEW 1: OTIMIZADOR & COMPRESSOR STUDIO */}
            {currentView === 'optimizer' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    
                    {/* Área de Seleção / Drop Zone */}
                    {!rawImageDataUrl ? (
                        <div 
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => optimizerInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-3xl p-12 sm:p-16 text-center cursor-pointer transition-all ${
                                isDragOver 
                                    ? 'border-amber-500 bg-amber-500/10 scale-[1.01]' 
                                    : 'border-slate-300 bg-white hover:border-amber-500 hover:bg-amber-50/40 shadow-sm'
                            }`}
                        >
                            <input 
                                ref={optimizerInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileChosen(file);
                                }}
                            />

                            <div className="w-20 h-20 bg-amber-100 text-amber-800 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-sm border border-amber-200">
                                <Upload size={36} className="text-amber-700 animate-bounce" />
                            </div>

                            <h3 className="text-xl font-serif font-bold text-slate-950 mb-2">
                                Arraste ou Selecione a Foto para Otimizar
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6">
                                Suporta fotos tiradas do celular, câmeras profissionais ou downloads da web (JPG, PNG, WEBP, AVIF, HEIC até 25MB).
                            </p>

                            <div className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-2xl shadow-md transition-all">
                                <FileImage size={16} />
                                <span>Escolher Imagem do Computador ou Celular</span>
                            </div>

                            {/* Destaques do Compressor */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-10 text-left">
                                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                                    <span className="text-xs font-bold text-emerald-950 block mb-1">⚡ Compressão 95%</span>
                                    <p className="text-[11px] text-emerald-800">Converte fotos de 5MB para menos de 70KB sem perda visível de nitidez.</p>
                                </div>
                                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
                                    <span className="text-xs font-bold text-amber-950 block mb-1">🛍️ Padrão E-Commerce</span>
                                    <p className="text-[11px] text-amber-800">Enquadra perfeitamente no formato 1:1 quadrado com fundo branco limpo.</p>
                                </div>
                                <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200">
                                    <span className="text-xs font-bold text-purple-950 block mb-1">📱 Compatível 100%</span>
                                    <p className="text-[11px] text-purple-800">Pronto para carregar na loja, Mercado Livre, Shopee e WhatsApp.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Studio de Ajustes e Comparador */
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            
                            {/* Coluna de Controles e Configurações (5 Colunas) */}
                            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                    <h3 className="font-serif font-bold text-lg text-slate-950 flex items-center gap-2">
                                        <Sliders size={18} className="text-amber-600" />
                                        <span>Painel de Otimização</span>
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setRawImageDataUrl(null);
                                            setSelectedFile(null);
                                            setOptimizationResult(null);
                                        }}
                                        className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 transition-all flex items-center gap-1"
                                    >
                                        <RefreshCw size={12} />
                                        <span>Trocar Foto</span>
                                    </button>
                                </div>

                                {/* Presets Rápidos de Proporção */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                                        1. Formato & Enquadramento
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'ecommerce_1_1', label: '🛍️ Produto (1:1)', desc: 'Quadrado 1000px' },
                                            { id: 'banner_16_9', label: '🖼️ Capa Hero (16:9)', desc: 'Banner Widescreen' },
                                            { id: 'thumbnail', label: '⚡ Miniatura', desc: 'Leve (400x400)' },
                                            { id: 'free', label: '📐 Proporção Original', desc: 'Sem corte de bordas' },
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => setPreset(item.id as PresetType)}
                                                className={`p-3 rounded-2xl border text-left transition-all ${
                                                    preset === item.id 
                                                        ? 'bg-amber-50 border-2 border-amber-500 text-slate-950 shadow-sm font-bold' 
                                                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:text-slate-950 font-medium'
                                                }`}
                                            >
                                                <span className="text-xs block font-bold text-slate-950">{item.label}</span>
                                                <span className={`text-[10px] block ${preset === item.id ? 'text-amber-900 font-semibold' : 'text-slate-500'}`}>{item.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Formato de Saída */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                                        2. Formato de Arquivo
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'webp', label: 'WebP', badge: 'Recomendado' },
                                            { id: 'jpeg', label: 'JPEG', badge: 'Universal' },
                                            { id: 'png', label: 'PNG', badge: 'Sem Perdas' },
                                        ].map(fmt => (
                                            <button
                                                key={fmt.id}
                                                type="button"
                                                onClick={() => setOutputFormat(fmt.id as any)}
                                                className={`p-3 rounded-2xl border text-center transition-all ${
                                                    outputFormat === fmt.id
                                                        ? 'bg-slate-900 text-amber-400 border-2 border-slate-900 font-bold shadow-md'
                                                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 font-medium'
                                                }`}
                                            >
                                                <span className="text-xs block font-bold">{fmt.label}</span>
                                                <span className={`text-[9px] block font-semibold ${outputFormat === fmt.id ? 'text-amber-300' : 'text-slate-500'}`}>
                                                    {fmt.badge}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Slider de Qualidade */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <label className="font-bold text-slate-800 uppercase tracking-wider">
                                            3. Nível de Compressão
                                        </label>
                                        <span className="font-mono font-bold text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-lg text-xs">
                                            {quality}%
                                        </span>
                                    </div>
                                    <input 
                                        type="range"
                                        min="40"
                                        max="95"
                                        value={quality}
                                        onChange={(e) => setQuality(Number(e.target.value))}
                                        className="w-full accent-amber-500 h-2.5 bg-slate-200 rounded-lg cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[11px] font-medium text-slate-600">
                                        <span>Mais Leve (Maior economia)</span>
                                        <span>Máxima Fidelidade</span>
                                    </div>
                                </div>

                                {/* Ajustes de Estúdio e Fundo */}
                                <div className="space-y-3 pt-2 border-t border-slate-100">
                                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                                        4. Ajustes de Estúdio de Produto
                                    </label>

                                    <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                        <input 
                                            type="checkbox"
                                            checked={enhanceStudio}
                                            onChange={(e) => setEnhanceStudio(e.target.checked)}
                                            className="w-4 h-4 accent-amber-500 rounded"
                                        />
                                        <div>
                                            <span className="text-xs font-bold text-slate-900 block">Realce Suave de Contraste & Nitidez</span>
                                            <span className="text-[11px] text-slate-600 font-medium">Destaca os detalhes e reflexos de materiais (inox, vidro, dourado)</span>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                        <input 
                                            type="checkbox"
                                            checked={fillBackground}
                                            onChange={(e) => setFillBackground(e.target.checked)}
                                            className="w-4 h-4 accent-amber-500 rounded"
                                        />
                                        <div>
                                            <span className="text-xs font-bold text-slate-900 block">Fundo Branco de Estúdio E-Commerce</span>
                                            <span className="text-[11px] text-slate-600 font-medium">Elimina bordas cinzas e centraliza o produto</span>
                                        </div>
                                    </label>
                                </div>

                                {/* Dados para Salvar no Banco */}
                                <div className="space-y-3 pt-2 border-t border-slate-100">
                                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                                        5. Identificação no Catálogo
                                    </label>
                                    
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Título do Produto</label>
                                        <input 
                                            type="text"
                                            placeholder="Ex: Torneira Gourmet Preta Fosca"
                                            value={assetTitle}
                                            onChange={(e) => setAssetTitle(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Categoria</label>
                                        <select
                                            value={assetCategory}
                                            onChange={(e) => setAssetCategory(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 font-bold"
                                        >
                                            <option value="iluminacao">Iluminação & LED</option>
                                            <option value="hidraulica">Hidráulica</option>
                                            <option value="eletrica">Elétrica & Smart</option>
                                            <option value="ferramentas">Ferramentas</option>
                                            <option value="decoracao">Decoração & Casa</option>
                                            <option value="outros">Outros</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Coluna de Visualização & Ações Rápidas (7 Colunas) */}
                            <div className="lg:col-span-7 space-y-6">
                                
                                {/* Card de Estatísticas de Redução */}
                                {optimizationResult && (
                                    <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-900 text-white p-6 rounded-3xl shadow-lg border border-emerald-500/30">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold border border-emerald-500/40">
                                                    <Zap size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white">Resultado da Compressão</h4>
                                                    <p className="text-[11px] text-emerald-300 font-medium">Processado via Canvas WebP 2D</p>
                                                </div>
                                            </div>

                                            <span className="px-3.5 py-1.5 bg-emerald-500 text-slate-950 font-mono text-xs font-extrabold rounded-full shadow-sm">
                                                Economia de {optimizationResult.reductionPercent}%
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15">
                                                <span className="text-[10px] uppercase font-bold text-slate-300 block">Tamanho Original</span>
                                                <span className="text-base font-bold text-red-300 font-mono">
                                                    {optimizationResult.originalSizeKb} KB
                                                </span>
                                            </div>

                                            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15">
                                                <span className="text-[10px] uppercase font-bold text-slate-300 block">Tamanho Otimizado</span>
                                                <span className="text-base font-bold text-emerald-400 font-mono">
                                                    {optimizationResult.optimizedSizeKb} KB
                                                </span>
                                            </div>

                                            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15">
                                                <span className="text-[10px] uppercase font-bold text-slate-300 block">Dimensões Finais</span>
                                                <span className="text-base font-bold text-amber-300 font-mono">
                                                    {optimizationResult.width}×{optimizationResult.height}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Preview da Imagem Otimizada */}
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-bold font-serif text-slate-950 flex items-center gap-2">
                                            <Eye size={16} className="text-amber-600" />
                                            <span>Visualização do Enquadramento Final</span>
                                        </h4>
                                        <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                            Formato: {outputFormat.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="relative aspect-square max-h-[460px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-300 shadow-inner">
                                        {isProcessing ? (
                                            <div className="text-center text-white space-y-2">
                                                <RefreshCw size={32} className="animate-spin text-amber-400 mx-auto" />
                                                <p className="text-xs font-bold">Otimizando e gerando WebP...</p>
                                            </div>
                                        ) : optimizationResult ? (
                                            <img 
                                                src={optimizationResult.dataUrl} 
                                                alt="Otimizada" 
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        ) : null}

                                        {/* Tag com dimensões no canto */}
                                        {optimizationResult && !isProcessing && (
                                            <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur-md text-white text-[10px] font-mono font-bold rounded-lg border border-white/20">
                                                {optimizationResult.width} × {optimizationResult.height} px
                                            </span>
                                        )}
                                    </div>

                                    {/* Botões de Ação Principal */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                        
                                        {/* 1. Salvar no Banco de Mídias */}
                                        <button
                                            type="button"
                                            disabled={isSavingOptimized || isProcessing}
                                            onClick={handleSaveOptimizedToBank}
                                            className="p-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isSavingOptimized ? (
                                                <>
                                                    <RefreshCw size={16} className="animate-spin" />
                                                    <span>Salvando no Sistema...</span>
                                                </>
                                            ) : savedAssetId ? (
                                                <>
                                                    <CheckCircle2 size={16} className="text-emerald-900" />
                                                    <span>Salvo no Sistema ✓</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Check size={16} />
                                                    <span>Salvar no Sistema</span>
                                                </>
                                            )}
                                        </button>

                                        {/* 2. Baixar Arquivo */}
                                        <button
                                            type="button"
                                            disabled={isProcessing}
                                            onClick={handleDownloadOptimized}
                                            className="p-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-slate-800"
                                        >
                                            <Download size={16} />
                                            <span>Baixar .{outputFormat}</span>
                                        </button>

                                        {/* 3. Salvar & Copiar Link Curto */}
                                        <button
                                            type="button"
                                            disabled={isProcessing || isSavingOptimized}
                                            onClick={() => handleCopyShortLink()}
                                            className={`p-3.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 border shadow-sm ${
                                                isOptimizerCopied
                                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-md scale-[1.02]'
                                                    : 'bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-900 border-slate-300'
                                            }`}
                                        >
                                            {isOptimizerCopied ? (
                                                <>
                                                    <Check size={16} className="text-white" />
                                                    <span>Link Curto Copiado!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={16} />
                                                    <span>Copiar Link Curto</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Card de Link Curto Gerado no Sistema */}
                                    {savedShortUrl && (
                                        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2 animate-in fade-in duration-200">
                                            <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                                                <span className="flex items-center gap-1.5">
                                                    <CheckCircle2 size={16} className="text-emerald-600" />
                                                    Imagem salva no sistema!
                                                </span>
                                                <span className="text-[11px] font-mono bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md">
                                                    ID: {savedAssetId}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    readOnly 
                                                    value={savedShortUrl} 
                                                    onClick={(e) => (e.target as HTMLInputElement).select()} 
                                                    className="flex-1 p-2 bg-white border border-emerald-300 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none select-all shadow-inner"
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleCopyShortLink(savedShortUrl)}
                                                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                                                >
                                                    <Copy size={14} />
                                                    <span>Copiar</span>
                                                </button>
                                                {onSelectImageForProduct && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => onSelectImageForProduct(optimizationResult?.dataUrl || savedShortUrl)}
                                                        className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                                                    >
                                                        <ShoppingBag size={14} />
                                                        <span>Usar no Produto</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Opção para alternar visualização do link direto / código avançado */}
                                    {optimizationResult && (
                                        <div className="pt-2 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => setShowDirectLinkBox(!showDirectLinkBox)}
                                                className="text-[11px] font-bold text-slate-600 hover:text-slate-950 flex items-center gap-1 transition-colors"
                                            >
                                                <span>{showDirectLinkBox ? '▼ Ocultar código Base64 completo' : '▶ Ver / Copiar código Base64 completo da imagem'}</span>
                                            </button>

                                            {showDirectLinkBox && (
                                                <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-300 space-y-2 animate-in fade-in duration-200">
                                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-700 uppercase">
                                                        <span>Código Base64 Direto da Imagem:</span>
                                                        <button
                                                            type="button"
                                                            onClick={handleCopyDataUrl}
                                                            className="text-amber-700 hover:text-amber-800 font-extrabold text-xs underline"
                                                        >
                                                            Copiar Base64
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        readOnly
                                                        rows={2}
                                                        value={optimizationResult.dataUrl}
                                                        onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                                                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-[11px] font-mono text-slate-800 select-all outline-none resize-none"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* VIEW 2: GALERIA E ACERVO DO BANCO DE MÍDIAS */}
            {currentView === 'gallery' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    
                    {/* Barra de Filtros e Categorias */}
                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                        {/* Categorias */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                            {[
                                { id: 'todos', label: 'Todas as Mídias' },
                                { id: 'iluminacao', label: '💡 Iluminação & LED' },
                                { id: 'hidraulica', label: '🚿 Hidráulica' },
                                { id: 'eletrica', label: '⚡ Elétrica & Smart' },
                                { id: 'ferramentas', label: '🔧 Ferramentas' },
                                { id: 'decoracao', label: '🏠 Decoração & Casa' },
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                        selectedCategory === cat.id
                                            ? 'bg-slate-900 text-amber-400 shadow-md border border-slate-800'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Busca Rápida & Ações */}
                        <div className="flex items-center gap-3">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar imagem..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                                />
                            </div>

                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all whitespace-nowrap"
                            >
                                <Plus size={15} />
                                <span>+ URL Externa</span>
                            </button>
                        </div>
                    </div>

                    {/* Mensagem se o Banco estiver Vazio */}
                    {mediaList.length === 0 && !loading && (
                        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4 shadow-sm">
                            <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl mx-auto flex items-center justify-center border border-amber-200">
                                <ImageIcon size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-serif font-bold text-slate-950">Seu Banco de Imagens está pronto</h3>
                                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 font-medium">
                                    Você pode carregar o catálogo de imagens de alta fidelidade pré-otimizado ou subir suas próprias fotos no Otimizador.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                                <button
                                    onClick={handleSeedDefaults}
                                    className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-bold text-xs shadow-md inline-flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={16} />
                                    <span>Carregar Acervo Inicial de Produtos</span>
                                </button>
                                <button
                                    onClick={() => setCurrentView('optimizer')}
                                    className="px-6 py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-xs shadow-md inline-flex items-center justify-center gap-2 border border-slate-800"
                                >
                                    <Upload size={16} />
                                    <span>Ir para o Otimizador</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Grid de Imagens */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredAssets.map(asset => (
                            <div 
                                key={asset.id} 
                                className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-amber-400 transition-all"
                            >
                                <div className="relative aspect-square bg-slate-100 overflow-hidden cursor-pointer">
                                    <img 
                                        src={asset.url} 
                                        alt={asset.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                    
                                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md text-white text-[9px] font-bold rounded-lg uppercase tracking-wider border border-white/10">
                                        {asset.category}
                                    </span>

                                    {asset.fileSizeKb && (
                                        <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-mono font-bold rounded-md shadow-sm">
                                            {asset.fileSizeKb} KB
                                        </span>
                                    )}

                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewAsset(asset)}
                                            className="p-2.5 bg-white hover:bg-amber-400 text-slate-950 rounded-xl shadow-lg transition-all font-bold"
                                            title="Visualizar em tamanho grande"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        
                                        <button
                                            type="button"
                                            onClick={(e) => handleRequestDeleteAsset(asset, e)}
                                            className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-all font-bold"
                                            title="Excluir do banco"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-3 space-y-2">
                                    <h4 className="text-xs font-bold text-slate-950 line-clamp-1" title={asset.title}>
                                        {asset.title}
                                    </h4>

                                    {onSelectImageForProduct ? (
                                        <button
                                            onClick={() => onSelectImageForProduct(asset.url)}
                                            className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm"
                                        >
                                            <Check size={14} />
                                            <span>Usar neste Produto</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleCopyLink(asset.url, asset.id)}
                                            className={`w-full py-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                                                copiedId === asset.id
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-900 border border-slate-300'
                                            }`}
                                        >
                                            {copiedId === asset.id ? (
                                                <>
                                                    <Check size={13} />
                                                    <span>Link Copiado!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={13} />
                                                    <span>Copiar Link Direto</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal de Adicionar URL Externa */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 border border-slate-200">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-serif font-bold text-slate-950 flex items-center gap-2">
                                <Globe size={18} className="text-amber-600" />
                                Vincular Imagem Externa
                            </h3>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-700 font-bold text-base p-1"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddDirectUrl} className="space-y-4 text-xs">
                            <div>
                                <label className="font-bold text-slate-800 block mb-1">Título do Produto / Imagem</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Pendente Jabuticaba 6 Globos Dourado"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-800 block mb-1">Categoria</label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                                >
                                    <option value="iluminacao">Iluminação & LED</option>
                                    <option value="hidraulica">Hidráulica</option>
                                    <option value="eletrica">Elétrica & Automação</option>
                                    <option value="ferramentas">Ferramentas</option>
                                    <option value="decoracao">Decoração & Casa</option>
                                    <option value="outros">Outros</option>
                                </select>
                            </div>

                            <div>
                                <label className="font-bold text-slate-800 block mb-1">URL Direta da Imagem</label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://sua-imagem.com/foto.jpg"
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono text-[11px] text-slate-900"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-800 block mb-1">Tags de Busca</label>
                                <input
                                    type="text"
                                    placeholder="pendente, led, dourado"
                                    value={newTags}
                                    onChange={(e) => setNewTags(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
                                />
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="w-1/2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md transition-all"
                                >
                                    Salvar no Banco
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Preview Grande */}
            {previewAsset && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 border border-slate-200">
                        <div className="relative aspect-video bg-black flex items-center justify-center">
                            <img 
                                src={previewAsset.url} 
                                alt={previewAsset.title} 
                                className="max-h-full max-w-full object-contain"
                            />
                            <button
                                onClick={() => setPreviewAsset(null)}
                                className="absolute top-4 right-4 w-9 h-9 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black font-bold border border-white/20"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md tracking-wider inline-block mb-1">
                                        {previewAsset.category}
                                    </span>
                                    <h3 className="text-lg font-serif font-bold text-slate-950">
                                        {previewAsset.title}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => handleRequestDeleteAsset(previewAsset, e)}
                                        className="px-3.5 py-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
                                        title="Excluir imagem do banco"
                                    >
                                        <Trash2 size={14} />
                                        <span>Excluir</span>
                                    </button>
                                    <button
                                        onClick={() => handleCopyLink(previewAsset.url, previewAsset.id)}
                                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                                    >
                                        <Copy size={14} />
                                        <span>{copiedId === previewAsset.id ? 'Link Copiado!' : 'Copiar Link'}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-300">
                                <span className="text-[10px] text-slate-700 font-bold block uppercase mb-1">URL Direta / Link Curto:</span>
                                <input
                                    type="text"
                                    readOnly
                                    value={previewAsset.url.startsWith('http') && !previewAsset.url.includes('base64') ? previewAsset.url : `${window.location.origin}/?media=${previewAsset.id}`}
                                    className="w-full bg-transparent font-mono text-xs text-slate-900 outline-none select-all font-semibold"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão (In-App) */}
            {assetToDelete && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 border border-slate-200">
                        <div className="w-12 h-12 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center mx-auto border border-red-200 shadow-sm">
                            <Trash2 size={24} />
                        </div>

                        <div className="text-center space-y-1.5">
                            <h3 className="text-lg font-serif font-bold text-slate-950">Excluir Imagem do Banco?</h3>
                            <p className="text-xs text-slate-600 font-medium">
                                Tem certeza de que deseja remover permanentemente esta imagem do seu banco de mídias?
                            </p>
                        </div>

                        {/* Prévia da Imagem Selecionada */}
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                            <div className="w-14 h-14 bg-slate-200 rounded-xl overflow-hidden flex-shrink-0 border border-slate-300">
                                <img 
                                    src={assetToDelete.url} 
                                    alt={assetToDelete.title} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-slate-950 truncate">{assetToDelete.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-slate-700 uppercase bg-slate-200 px-2 py-0.5 rounded">
                                        {assetToDelete.category}
                                    </span>
                                    {assetToDelete.fileSizeKb && (
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            {assetToDelete.fileSizeKb} KB
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                disabled={isDeletingAsset}
                                onClick={() => setAssetToDelete(null)}
                                className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 transition-colors text-xs"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={isDeletingAsset}
                                onClick={executeDeleteAsset}
                                className="w-1/2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                {isDeletingAsset ? (
                                    <>
                                        <RefreshCw size={14} className="animate-spin" />
                                        <span>Excluindo...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={14} />
                                        <span>Confirmar Exclusão</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
