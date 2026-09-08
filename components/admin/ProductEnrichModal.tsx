import React, { useState, useEffect } from 'react';
import { 
    Sparkles, 
    Check, 
    X, 
    Tag, 
    Zap, 
    Layers, 
    FileText, 
    DollarSign, 
    Eye, 
    AlertCircle, 
    Copy, 
    RefreshCw,
    Image as ImageIcon,
    ExternalLink,
    CheckCircle2,
    ArrowRight,
    Ruler,
    Scale,
    Wand2
} from 'lucide-react';
import { Product } from '../../types';
import { 
    enrichProductDataWithAI, 
    generateProductImageWithAI, 
    ProductEnrichmentResult 
} from '../../services/productEnrichmentService';
import { updateDocument } from '../../services/firebaseService';

interface ProductEnrichModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onEnrichComplete?: (updatedProduct: Partial<Product>) => void;
    onOpenMediaBank?: (target: 'main') => void;
}

export const ProductEnrichModal: React.FC<ProductEnrichModalProps> = ({
    isOpen,
    onClose,
    product,
    onEnrichComplete,
    onOpenMediaBank
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [enrichmentResult, setEnrichmentResult] = useState<ProductEnrichmentResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isApplying, setIsApplying] = useState(false);
    const [activateInStore, setActivateInStore] = useState(true);
    const [autoGenerateImage, setAutoGenerateImage] = useState(true);

    // Campos editáveis da prévia da IA
    const [editedName, setEditedName] = useState('');
    const [editedCategory, setEditedCategory] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedTechnicalSpecs, setEditedTechnicalSpecs] = useState('');
    const [editedSuggestedPrice, setEditedSuggestedPrice] = useState<number>(0);
    const [editedVoltage, setEditedVoltage] = useState('');
    const [editedMaterial, setEditedMaterial] = useState('');
    const [editedDimensions, setEditedDimensions] = useState('');
    const [editedHeight, setEditedHeight] = useState('');
    const [editedWidth, setEditedWidth] = useState('');
    const [editedLength, setEditedLength] = useState('');
    const [editedGrossWeight, setEditedGrossWeight] = useState<number | undefined>(undefined);
    const [editedNetWeight, setEditedNetWeight] = useState<number | undefined>(undefined);
    const [editedImageUrl, setEditedImageUrl] = useState('');

    useEffect(() => {
        if (product) {
            setEditedImageUrl(product.imageUrl || '');
            setEditedDimensions(product.dimensionsSize || '');
            setEditedHeight(product.height !== undefined && product.height !== null ? String(product.height) : '');
            setEditedWidth(product.width !== undefined && product.width !== null ? String(product.width) : '');
            setEditedLength(product.length !== undefined && product.length !== null ? String(product.length) : '');
            setEditedGrossWeight(product.grossWeight);
            setEditedNetWeight(product.netWeight);
            setEditedName(product.name || '');
            setEditedCategory(product.category || '');
            setEditedSuggestedPrice(product.price || 0);
        }
    }, [product]);

    if (!isOpen || !product) return null;

    const handleRunEnrichment = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await enrichProductDataWithAI(product, { generateImage: autoGenerateImage });
            setEnrichmentResult(res);
            setEditedName(res.name);
            setEditedCategory(res.category);
            setEditedDescription(res.description);
            setEditedTechnicalSpecs(res.technicalSpecs);
            setEditedSuggestedPrice(res.suggestedPrice);
            setEditedVoltage(res.voltage || 'Não se aplica');
            setEditedMaterial(res.material || 'Metal / Inox');
            setEditedDimensions(res.dimensionsSize || '');
            setEditedHeight(res.height || '');
            setEditedWidth(res.width || '');
            setEditedLength(res.length || '');
            setEditedGrossWeight(res.grossWeight);
            setEditedNetWeight(res.netWeight);
            if (res.imageUrl) {
                setEditedImageUrl(res.imageUrl);
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao gerar enriquecimento via IA.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateImageOnly = async () => {
        setIsGeneratingImage(true);
        setError(null);
        try {
            const targetName = editedName || product.name;
            const targetCat = editedCategory || product.category;
            const keywords = enrichmentResult?.searchImageKeywords || targetName;
            const newImg = await generateProductImageWithAI(targetName, targetCat, keywords);
            setEditedImageUrl(newImg);
        } catch (err: any) {
            setError(err.message || 'Erro ao gerar imagem por IA.');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleApplyAndSave = async () => {
        if (!product.id) return;
        setIsApplying(true);
        setError(null);

        try {
            const updatedFields: Partial<Product> = {
                name: editedName || product.name,
                category: editedCategory || product.category,
                description: editedDescription || product.description,
                technicalSpecs: editedTechnicalSpecs || product.technicalSpecs,
                voltage: editedVoltage || product.voltage,
                material: editedMaterial || product.material,
                dimensionsSize: editedDimensions || product.dimensionsSize,
                height: editedHeight || product.height,
                width: editedWidth || product.width,
                length: editedLength || product.length,
                grossWeight: editedGrossWeight !== undefined ? editedGrossWeight : product.grossWeight,
                netWeight: editedNetWeight !== undefined ? editedNetWeight : product.netWeight,
                imageUrl: editedImageUrl || product.imageUrl,
                showInStore: activateInStore ? true : (product.showInStore ?? false),
            };

            // Se o produto não tinha preço ou se o usuário deseja atualizar o preço
            if (editedSuggestedPrice > 0 && (!product.price || product.price === 0)) {
                updatedFields.price = editedSuggestedPrice;
            }

            await updateDocument('products', product.id, updatedFields);

            if (onEnrichComplete) {
                onEnrichComplete(updatedFields);
            }
            onClose();
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar alterações no banco.');
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
            <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col max-h-[90vh]">
                {/* Cabeçalho do Modal */}
                <div className="bg-gradient-to-r from-amber-600 via-brand-primary to-slate-900 p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                            <Sparkles size={24} className="text-amber-300 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-400/20 text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                                    Enriquecimento Inteligente
                                </span>
                                {product.code && (
                                    <span className="text-[11px] font-mono bg-white/20 text-white px-2 py-0.5 rounded-lg">
                                        Cód #{product.code}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-lg font-bold mt-1 text-white leading-tight">
                                Ativação & Ficha Técnica com IA
                            </h3>
                            <p className="text-xs text-amber-100/80">
                                Gera descrição técnica, SEO, padronização e orientações de imagem para a vitrine
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Corpo do Modal */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
                    {/* Resumo do Produto Atual */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Produto Selecionado do Catálogo
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">
                                {product.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span>Categoria: <strong>{product.category || 'Geral'}</strong></span>
                                <span>•</span>
                                <span>Preço Atual: <strong>R$ {Number(product.price || 0).toFixed(2)}</strong></span>
                                <span>•</span>
                                <span>Estoque: <strong>{product.stock || 0} un</strong></span>
                            </div>
                        </div>

                        {!enrichmentResult && (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={autoGenerateImage}
                                        onChange={(e) => setAutoGenerateImage(e.target.checked)}
                                        className="rounded text-amber-600 focus:ring-amber-500"
                                    />
                                    <span>Gerar Foto de Estúdio</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleRunEnrichment}
                                    disabled={isLoading}
                                    className="px-5 py-3 bg-gradient-to-r from-amber-600 to-brand-primary text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 justify-center active:scale-95 cursor-pointer"
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCw size={15} className="animate-spin" />
                                            <span>Analisando Produto & Dimensões...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={15} />
                                            <span>Gerar Ficha, Dimensões & Imagem</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
                            <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
                            <div>
                                <span className="font-bold">Ocorreu um erro:</span> {error}
                            </div>
                        </div>
                    )}

                    {/* Resultados do Enriquecimento */}
                    {enrichmentResult && (
                        <div className="space-y-5 animate-fade-in">
                            {/* Card de Informações Geradas */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wide">
                                        <CheckCircle2 size={16} />
                                        <span>Ficha Técnica, Dimensões e Imagem Geradas</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRunEnrichment}
                                        disabled={isLoading}
                                        className="text-xs text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1 transition-colors"
                                    >
                                        <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                                        <span>Regenerar Dados com IA</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Nome Padronizado */}
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">
                                            Título Padronizado para Vitrine
                                        </label>
                                        <input
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                                        />
                                    </div>

                                    {/* Categoria Adequada */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-600 uppercase">
                                            Categoria Recomendada
                                        </label>
                                        <select
                                            value={editedCategory}
                                            onChange={(e) => setEditedCategory(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                                        >
                                            <option value="Ferramentas & Máquinas">Ferramentas & Máquinas</option>
                                            <option value="Banheiro">Banheiro</option>
                                            <option value="Metais & Hidráulica">Metais & Hidráulica</option>
                                            <option value="Iluminação">Iluminação</option>
                                            <option value="Móveis">Móveis</option>
                                            <option value="Decoração">Decoração</option>
                                            <option value="Cozinha">Cozinha</option>
                                            <option value="Livros / E-books">Livros / E-books</option>
                                            <option value="Geral">Geral</option>
                                        </select>
                                    </div>

                                    {/* Preço Sugerido */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-600 uppercase flex items-center justify-between">
                                            <span>Preço Sugerido (R$)</span>
                                            {product.price && product.price > 0 ? (
                                                <span className="text-[10px] text-slate-400 font-normal">Atual: R$ {product.price.toFixed(2)}</span>
                                            ) : null}
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editedSuggestedPrice || ''}
                                                onChange={(e) => setEditedSuggestedPrice(parseFloat(e.target.value) || 0)}
                                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Atributos: Voltagem e Material */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1">
                                            <Zap size={13} className="text-amber-500" />
                                            <span>Voltagem / Tensão</span>
                                        </label>
                                        <input
                                            value={editedVoltage}
                                            onChange={(e) => setEditedVoltage(e.target.value)}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                                            placeholder="Ex: 110V, 220V, Bivolt ou Não se aplica"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1">
                                            <Layers size={13} className="text-blue-500" />
                                            <span>Material</span>
                                        </label>
                                        <input
                                            value={editedMaterial}
                                            onChange={(e) => setEditedMaterial(e.target.value)}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                                            placeholder="Ex: Metal / Inox, Plástico, etc."
                                        />
                                    </div>
                                </div>

                                {/* SEÇÃO EXCLUSIVA: DIMENSÕES & MEDIDAS GERADAS POR IA */}
                                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Ruler size={16} className="text-amber-700" />
                                            <span className="text-xs font-bold text-amber-900 uppercase">
                                                Dimensões & Medidas Físicas (Geradas por IA)
                                            </span>
                                        </div>
                                        <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                                            Calculadas para Frete e Ficha
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="space-y-1 sm:col-span-2">
                                            <label className="text-[10px] font-bold text-amber-900 uppercase">Dimensões / Tamanho Geral</label>
                                            <input 
                                                value={editedDimensions}
                                                onChange={(e) => setEditedDimensions(e.target.value)}
                                                placeholder="Ex: 25cm x 15cm x 8cm"
                                                className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-amber-900 uppercase">Altura</label>
                                            <input 
                                                value={editedHeight}
                                                onChange={(e) => setEditedHeight(e.target.value)}
                                                placeholder="Ex: 25 cm"
                                                className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-amber-900 uppercase">Largura</label>
                                            <input 
                                                value={editedWidth}
                                                onChange={(e) => setEditedWidth(e.target.value)}
                                                placeholder="Ex: 15 cm"
                                                className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-amber-900 uppercase">Profundidade / Comp.</label>
                                            <input 
                                                value={editedLength}
                                                onChange={(e) => setEditedLength(e.target.value)}
                                                placeholder="Ex: 8 cm"
                                                className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-amber-900 uppercase flex items-center gap-1">
                                                <Scale size={11} /> Peso Bruto (kg)
                                            </label>
                                            <input 
                                                type="number"
                                                step="0.001"
                                                value={editedGrossWeight !== undefined ? editedGrossWeight : ''}
                                                onChange={(e) => setEditedGrossWeight(parseFloat(e.target.value) || undefined)}
                                                placeholder="Ex: 0.450"
                                                className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-amber-900 uppercase flex items-center gap-1">
                                                <Scale size={11} /> Peso Líquido (kg)
                                            </label>
                                            <input 
                                                type="number"
                                                step="0.001"
                                                value={editedNetWeight !== undefined ? editedNetWeight : ''}
                                                onChange={(e) => setEditedNetWeight(parseFloat(e.target.value) || undefined)}
                                                placeholder="Ex: 0.400"
                                                className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SEÇÃO EXCLUSIVA: IMAGEM DO PRODUTO POR IA & LINK DA VITRINE */}
                                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon size={16} className="text-amber-400" />
                                            <span className="text-xs font-bold uppercase tracking-wide">
                                                Foto de Estúdio por IA & Link da Imagem
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {onOpenMediaBank && (
                                                <button
                                                    type="button"
                                                    onClick={() => onOpenMediaBank('main')}
                                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                                >
                                                    <ImageIcon size={13} />
                                                    <span>Banco de Mídias</span>
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={handleGenerateImageOnly}
                                                disabled={isGeneratingImage}
                                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                {isGeneratingImage ? (
                                                    <>
                                                        <RefreshCw size={13} className="animate-spin" />
                                                        <span>Gerando Foto...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Wand2 size={13} />
                                                        <span>Gerar Imagem com IA</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                                        {/* Preview da Imagem */}
                                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 shrink-0 flex items-center justify-center relative group">
                                            {editedImageUrl ? (
                                                <img 
                                                    src={editedImageUrl} 
                                                    alt="Foto gerada para o produto"
                                                    className="w-full h-full object-cover"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <div className="text-center p-2 text-slate-500 text-[10px]">
                                                    <ImageIcon size={20} className="mx-auto mb-1 opacity-50" />
                                                    Sem foto
                                                </div>
                                            )}
                                        </div>

                                        {/* Input do Link da Imagem */}
                                        <div className="flex-1 space-y-1.5 w-full">
                                            <div className="flex items-center justify-between text-[11px] text-slate-300">
                                                <label className="font-bold uppercase text-amber-300">Link da Imagem do Produto (Vitrine)</label>
                                                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                                    <Check size={12} /> Salva no Produto
                                                </span>
                                            </div>
                                            <input 
                                                value={editedImageUrl}
                                                onChange={(e) => setEditedImageUrl(e.target.value)}
                                                placeholder="https://... ou data:image/..."
                                                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none truncate"
                                            />
                                            <p className="text-[10px] text-slate-400">
                                                A imagem gerada pela IA é vinculada diretamente ao campo <code className="text-amber-200">imageUrl</code> do produto ao clicar em salvar.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Descrição Comercial Persuasiva */}
                                <div className="space-y-1 pt-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase">
                                        Descrição Comercial (Vitrine)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={editedDescription}
                                        onChange={(e) => setEditedDescription(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed"
                                    />
                                </div>

                                {/* Ficha Técnica Estruturada */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1">
                                        <FileText size={13} className="text-slate-500" />
                                        <span>Ficha Técnica Estruturada & Cuidados</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={editedTechnicalSpecs}
                                        onChange={(e) => setEditedTechnicalSpecs(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed font-mono"
                                    />
                                </div>

                                {/* Palavras-chave SEO */}
                                {enrichmentResult.seoKeywords && enrichmentResult.seoKeywords.length > 0 && (
                                    <div className="pt-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1">
                                            <Tag size={12} /> Tags de Busca & SEO Geradas:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {enrichmentResult.seoKeywords.map((kw, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-medium"
                                                >
                                                    #{kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Opção de Ativar na Vitrine */}
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-600 text-white rounded-xl">
                                        <Eye size={18} />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-emerald-950 block">
                                            Publicar na Vitrine da Loja Principal
                                        </span>
                                        <span className="text-[11px] text-emerald-700">
                                            Tornar este produto imediatamente visível para os clientes na página principal
                                        </span>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={activateInStore}
                                        onChange={(e) => setActivateInStore(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Rodapé com Ações */}
                <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
                    >
                        Cancelar
                    </button>

                    {enrichmentResult && (
                        <button
                            type="button"
                            onClick={handleApplyAndSave}
                            disabled={isApplying}
                            className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl text-xs hover:bg-brand-dark transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
                        >
                            {isApplying ? (
                                <>
                                    <RefreshCw size={14} className="animate-spin" />
                                    <span>Salvando Produto...</span>
                                </>
                            ) : (
                                <>
                                    <Check size={16} />
                                    <span>{activateInStore ? 'Aplicar & Ativar na Vitrine' : 'Salvar Ficha Técnica'}</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
