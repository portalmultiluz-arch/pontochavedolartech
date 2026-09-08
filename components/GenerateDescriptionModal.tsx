
import React, { useState, useCallback } from 'react';
import { generateProductDescription } from '../services/geminiService';
import type { Product } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { Ruler, Image as ImageIcon, Sparkles, Wand2, RefreshCw, Check } from 'lucide-react';

interface GenerateDescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProductCreate: (product: Partial<Product>) => void;
}

export const GenerateDescriptionModal: React.FC<GenerateDescriptionModalProps> = ({ isOpen, onClose, onProductCreate }) => {
    const [productName, setProductName] = useState('');
    const [keywords, setKeywords] = useState('');
    const [generatedDescription, setGeneratedDescription] = useState('');
    const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
    const [dimensionsSize, setDimensionsSize] = useState('');
    const [height, setHeight] = useState('');
    const [width, setWidth] = useState('');
    const [length, setLength] = useState('');
    const [grossWeight, setGrossWeight] = useState<number | undefined>(undefined);
    const [imageUrl, setImageUrl] = useState('');
    const [autoGenerateImage, setAutoGenerateImage] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = useCallback(async () => {
        if (!productName || !keywords) {
            setError('Por favor, preencha o nome do produto e as características.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedDescription('');
        setSuggestedPrice(null);
        try {
            const result = await generateProductDescription(productName, keywords, autoGenerateImage);
            setGeneratedDescription(result.description);
            setSuggestedPrice(result.suggestedPrice);
            setDimensionsSize(result.dimensionsSize || '');
            setHeight(result.height || '');
            setWidth(result.width || '');
            setLength(result.length || '');
            setGrossWeight(result.grossWeight);
            if (result.imageUrl) {
                setImageUrl(result.imageUrl);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    }, [productName, keywords, autoGenerateImage]);

    const handleCreateProduct = useCallback(() => {
        if (productName && generatedDescription && suggestedPrice !== null) {
            onProductCreate({
                name: productName,
                description: generatedDescription,
                price: suggestedPrice,
                dimensionsSize: dimensionsSize || undefined,
                height: height || undefined,
                width: width || undefined,
                length: length || undefined,
                grossWeight: grossWeight !== undefined ? grossWeight : undefined,
                imageUrl: imageUrl || undefined,
            });
            // Reset state for next use
            setProductName('');
            setKeywords('');
            setGeneratedDescription('');
            setSuggestedPrice(null);
            setDimensionsSize('');
            setHeight('');
            setWidth('');
            setLength('');
            setGrossWeight(undefined);
            setImageUrl('');
        }
    }, [productName, generatedDescription, suggestedPrice, dimensionsSize, height, width, length, grossWeight, imageUrl, onProductCreate]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-xs" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-serif text-brand-primary">Descrição do Produto & Anúncio por IA</h2>
                            <p className="text-xs text-slate-500">Geração de texto comercial, dimensões reais e foto de estúdio</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-lg text-xs" role="alert"><p>{error}</p></div>}
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="productName" className="block text-xs font-bold text-gray-700 uppercase mb-1">Nome do Produto</label>
                        <input 
                            type="text" 
                            id="productName" 
                            value={productName} 
                            onChange={e => setProductName(e.target.value)} 
                            placeholder="Ex: Luminária de Mesa Articulada" 
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-amber-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label htmlFor="keywords" className="block text-xs font-bold text-gray-700 uppercase mb-1">Características / Palavras-chave</label>
                        <input 
                            type="text" 
                            id="keywords" 
                            value={keywords} 
                            onChange={e => setKeywords(e.target.value)} 
                            placeholder="Ex: design moderno, metal, bivolt, preta, 40W" 
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-amber-500 outline-none" 
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                            <input 
                                type="checkbox"
                                checked={autoGenerateImage}
                                onChange={e => setAutoGenerateImage(e.target.checked)}
                                className="rounded text-amber-600 focus:ring-amber-500"
                            />
                            <span>Gerar automaticamente foto de estúdio do produto por IA</span>
                        </label>
                    </div>
                </div>

                <div className="mt-5">
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading} 
                        className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-amber-600 to-brand-primary text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs"
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner />
                                <span>Gerando Descrição, Dimensões & Imagem...</span>
                            </>
                        ) : (
                            <>
                                <Wand2 size={16} />
                                <span>Gerar Descrição, Dimensões e Imagem com IA</span>
                            </>
                        )}
                    </button>
                </div>
                
                {(generatedDescription || isLoading) && (
                    <div className="mt-6 p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Sparkles size={16} className="text-amber-500" />
                            <span>Resultado Gerado pela IA:</span>
                        </h3>

                        {isLoading ? (
                            <div className="text-center p-6 text-slate-500 text-xs">
                                <p>Nossa IA está gerando o texto comercial, calculando dimensões técnicas e preparando a foto de estúdio...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Descrição Comercial Sugerida</label>
                                        <textarea
                                            rows={3}
                                            value={generatedDescription}
                                            onChange={e => setGeneratedDescription(e.target.value)}
                                            className="w-full text-xs text-slate-800 p-2 mt-1 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Preço Sugerido</label>
                                        <div className="relative mt-1 max-w-[200px]">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                                            <input 
                                                type="number"
                                                step="0.01"
                                                value={suggestedPrice ?? ''}
                                                onChange={e => setSuggestedPrice(parseFloat(e.target.value) || 0)}
                                                className="w-full pl-8 pr-3 py-1.5 text-sm font-bold text-brand-dark border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Dimensões Geradas */}
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                                        <Ruler size={16} />
                                        <span>Dimensões Físicas do Produto (Calculadas pela IA)</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                        <div className="sm:col-span-2">
                                            <label className="text-[10px] font-bold text-amber-900 uppercase">Dimensões Gerais</label>
                                            <input 
                                                value={dimensionsSize} 
                                                onChange={e => setDimensionsSize(e.target.value)} 
                                                placeholder="Ex: 25cm x 15cm x 8cm"
                                                className="w-full p-2 bg-white text-xs border border-amber-200 rounded-lg outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-amber-900 uppercase">Altura</label>
                                            <input 
                                                value={height} 
                                                onChange={e => setHeight(e.target.value)} 
                                                placeholder="25 cm"
                                                className="w-full p-2 bg-white text-xs border border-amber-200 rounded-lg outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-amber-900 uppercase">Largura</label>
                                            <input 
                                                value={width} 
                                                onChange={e => setWidth(e.target.value)} 
                                                placeholder="15 cm"
                                                className="w-full p-2 bg-white text-xs border border-amber-200 rounded-lg outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-amber-900 uppercase">Comprimento</label>
                                            <input 
                                                value={length} 
                                                onChange={e => setLength(e.target.value)} 
                                                placeholder="8 cm"
                                                className="w-full p-2 bg-white text-xs border border-amber-200 rounded-lg outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-amber-900 uppercase">Peso Bruto (kg)</label>
                                            <input 
                                                type="number"
                                                step="0.001"
                                                value={grossWeight ?? ''} 
                                                onChange={e => setGrossWeight(parseFloat(e.target.value) || undefined)} 
                                                placeholder="0.450"
                                                className="w-full p-2 bg-white text-xs border border-amber-200 rounded-lg outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Imagem e Link Gerado */}
                                <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-300">
                                            <ImageIcon size={15} />
                                            <span>Foto de Estúdio & Link da Imagem do Produto</span>
                                        </div>
                                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                            <Check size={12} /> Salva no link do produto
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-20 h-20 bg-slate-950 rounded-lg border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                                            {imageUrl ? (
                                                <img 
                                                    src={imageUrl} 
                                                    alt="Preview do produto" 
                                                    className="w-full h-full object-cover"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <span className="text-[10px] text-slate-500">Sem foto</span>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-300 uppercase">Link da Imagem (Preenchido Automaticamente)</label>
                                            <input 
                                                value={imageUrl}
                                                onChange={e => setImageUrl(e.target.value)}
                                                placeholder="https://... ou link da imagem"
                                                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 outline-none focus:ring-2 focus:ring-amber-500 truncate"
                                            />
                                            <p className="text-[10px] text-slate-400">
                                                Este link é inserido diretamente no cadastro do produto ao salvar.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-slate-100">
                    <button 
                        onClick={handleCreateProduct} 
                        disabled={!generatedDescription || !suggestedPrice}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer text-xs flex items-center justify-center gap-2"
                    >
                        <Check size={16} />
                        <span>Adicionar Produto com Dimensões e Imagem</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
