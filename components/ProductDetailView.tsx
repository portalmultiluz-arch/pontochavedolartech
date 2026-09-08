import React, { useState } from 'react';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import { parseMediaUrl, getProductDisplayImage } from '../lib/mediaHelper';
import { getProductPromoDetails, getProductDiscontinuedDetails, getProductOffMarketDetails } from '../lib/productStatusHelper';
import { Play, Image as ImageIcon, ArrowLeft, CheckCircle2, ShieldCheck, Truck, RefreshCw, ShoppingBag, Zap, Ruler, Weight, Droplets, Flame, Layers, Package, Tag, Archive, AlertOctagon, Clock, Wrench, Boxes, MapPin, AlertTriangle, Store, Compass, Search } from 'lucide-react';
import { isKitProduct } from '../lib/catalogHelper';
import { checkProductShippingRestriction, calculateDistanceToStore, getStoreDomicile, StoreDomicile } from '../lib/shippingHelper';
import { formatCEP } from '../lib/paymentHelper';
import { sanitizeProductForCustomer, sanitizeCustomerText } from '../lib/textHelper';

interface ProductDetailViewProps {
    product: Product;
    onBack: () => void;
    showPartnerBanner?: boolean;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product: rawProduct, onBack, showPartnerBanner = false }) => {
    const product = sanitizeProductForCustomer(rawProduct);
    const defaultImage = getProductDisplayImage(product.imageUrl, product.videoUrl);
    const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video'; url: string }>({
        type: 'image',
        url: defaultImage
    });
    
    const { addToCart } = useCart();
    const { showNotification } = useNotification();

    // Detalhes de status especiais
    const promo = getProductPromoDetails(product);
    const discontinued = getProductDiscontinuedDetails(product);
    const offMarket = getProductOffMarketDetails(product);

    const formattedOriginalPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(product.price || 0);

    const formattedPromoPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(promo.promoPrice);

    const formattedSavings = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(promo.originalPrice - promo.promoPrice);

    const hasVideo = Boolean(product.videoUrl && product.videoUrl.trim() !== '');
    const videoMedia = hasVideo ? parseMediaUrl(product.videoUrl) : null;

    const isAvailableForSale = !offMarket.isOffMarket && product.stock > 0;

    // Collect all valid gallery images
    const allImages = [
        defaultImage,
        ...(Array.isArray(product.gallery) ? product.gallery : [])
    ].filter((img, idx, arr) => img && arr.indexOf(img) === idx);

    const handleAddToCart = () => {
        if (offMarket.isOffMarket) {
            showNotification('Produto fora de comercialização no momento.');
            return;
        }
        addToCart(product);
        showNotification(`${product.name} adicionado ao carrinho!`);
    };

    // Verificação de regras logísticas para este item específico
    const shippingRestriction = checkProductShippingRestriction(product);
    const [simCep, setSimCep] = useState('');
    const [isSimulating, setIsSimulating] = useState(false);
    const [simResult, setSimResult] = useState<{
        distanceKm: number;
        isWithinLocalRadius: boolean;
        domicile: StoreDomicile;
        regionName: string;
    } | null>(null);
    const [simError, setSimError] = useState('');

    const handleSimulateShipping = async (e: React.FormEvent) => {
        e.preventDefault();
        const clean = simCep.replace(/\D/g, '');
        if (clean.length !== 8) {
            setSimError('Digite um CEP válido com 8 dígitos.');
            return;
        }
        setIsSimulating(true);
        setSimError('');
        try {
            const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
            const data = await res.json();
            if (data.erro) {
                setSimError('CEP não encontrado nos Correios.');
            } else {
                const distRes = await calculateDistanceToStore(clean, {
                    city: data.localidade,
                    state: data.uf,
                    neighborhood: data.bairro,
                });
                setSimResult(distRes);
            }
        } catch {
            setSimError('Erro ao consultar CEP.');
        } finally {
            setIsSimulating(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen py-10">
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
                {/* Back Button */}
                <button 
                    onClick={onBack} 
                    className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white rounded-xl text-slate-700 font-semibold text-sm shadow-sm hover:bg-slate-100 transition-colors border border-slate-200"
                >
                    <ArrowLeft size={16} />
                    <span>Voltar para o catálogo</span>
                </button>

                {/* Banners Informativos de Status no Topo */}
                <div className="space-y-3 mb-6">
                    {promo.isPromoActive && (
                        <div className="p-4 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Tag size={22} className="fill-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs uppercase tracking-wider font-extrabold bg-white text-red-600 px-2 py-0.5 rounded-md shadow-sm">
                                            Promoção Especial {promo.discountPercent > 0 ? `(-${promo.discountPercent}%)` : ''}
                                        </span>
                                        {promo.periodLabel && (
                                            <span className="text-xs font-medium text-amber-100 flex items-center gap-1">
                                                <Clock size={12} /> Válida: {promo.periodLabel}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm font-semibold text-white/95 mt-1">
                                        Preço com desconto por tempo limitado!
                                    </p>
                                </div>
                            </div>
                            <div className="text-right shrink-0 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/20">
                                <span className="text-[10px] block text-amber-100 uppercase font-bold">Você economiza</span>
                                <span className="text-sm sm:text-base font-black text-white">{formattedSavings}</span>
                            </div>
                        </div>
                    )}

                    {discontinued.isDiscontinued && (
                        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 flex items-start gap-3 shadow-sm">
                            <Archive size={20} className="text-amber-600 shrink-0 mt-0.5" />
                            <div className="text-xs space-y-1">
                                <span className="font-bold uppercase tracking-wider text-amber-800 block">
                                    Produto Descontinuado pelo Fabricante {discontinued.periodLabel ? `(Período: ${discontinued.periodLabel})` : ''}
                                </span>
                                <p className="text-amber-800 leading-relaxed">
                                    {discontinued.reason || 'Este item está em processo de descontinuação. Últimas unidades disponíveis para pronta entrega.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {offMarket.isOffMarket && (
                        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 flex items-start gap-3 shadow-sm">
                            <AlertOctagon size={20} className="text-rose-600 shrink-0 mt-0.5" />
                            <div className="text-xs space-y-1">
                                <span className="font-bold uppercase tracking-wider text-rose-800 block">
                                    Produto Temporariamente Fora de Comercialização {offMarket.periodLabel ? `(Período: ${offMarket.periodLabel})` : ''}
                                </span>
                                <p className="text-rose-700 leading-relaxed">
                                    {offMarket.reason || 'As vendas deste produto estão temporariamente suspensas para revisão de estoque/homologação.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10">
                        
                        {/* Media Section (Left 7 cols) */}
                        <div className="lg:col-span-7 flex flex-col gap-4">
                            {/* Main Stage */}
                            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner flex items-center justify-center">
                                {selectedMedia.type === 'video' && videoMedia ? (
                                    videoMedia.type === 'youtube' && videoMedia.embedUrl ? (
                                        <iframe
                                            src={videoMedia.embedUrl}
                                            title={`Vídeo demonstrativo - ${product.name}`}
                                            className="w-full h-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        />
                                    ) : videoMedia.type === 'vimeo' && videoMedia.embedUrl ? (
                                        <iframe
                                            src={videoMedia.embedUrl}
                                            title={`Vídeo demonstrativo - ${product.name}`}
                                            className="w-full h-full border-0"
                                            allow="autoplay; fullscreen; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video
                                            src={videoMedia.rawUrl}
                                            controls
                                            autoPlay
                                            playsInline
                                            className="w-full h-full object-contain"
                                        />
                                    )
                                ) : (
                                    <img 
                                        src={selectedMedia.url} 
                                        alt={product.name} 
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = '/ponto_chave_logo.jpg';
                                        }}
                                        className={`w-full h-full object-contain p-3 sm:p-5 drop-shadow-md transition-all duration-300 ${offMarket.isOffMarket ? 'grayscale opacity-75' : ''}`} 
                                    />
                                )}
                            </div>

                            {/* Thumbnails & Video Selector */}
                            <div className="flex flex-wrap gap-3 items-center">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={`thumb-img-${idx}`}
                                        type="button"
                                        onClick={() => setSelectedMedia({ type: 'image', url: img })}
                                        className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                                            selectedMedia.type === 'image' && selectedMedia.url === img
                                                ? 'border-brand-primary ring-2 ring-brand-primary/20 scale-105'
                                                : 'border-slate-200 opacity-75 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}

                                {hasVideo && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMedia({ type: 'video', url: product.videoUrl! })}
                                        className={`relative w-28 h-16 rounded-xl overflow-hidden border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                                            selectedMedia.type === 'video'
                                                ? 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-500/30 scale-105'
                                                : 'border-slate-300 bg-slate-900 text-white hover:bg-slate-800'
                                        }`}
                                    >
                                        <Play size={18} className="fill-current text-amber-400" />
                                        <span className="text-[11px] font-bold">Ver Vídeo</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Product Information (Right 5 cols) */}
                        <div className="lg:col-span-5 flex flex-col justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    {product.category && (
                                        <span className="bg-brand-primary/10 text-brand-primary font-bold text-xs px-3 py-1 rounded-lg">
                                            {product.category}
                                        </span>
                                    )}
                                    {promo.isPromoActive && (
                                        <span className="bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                                            <Tag size={11} className="fill-white" /> Promoção
                                        </span>
                                    )}
                                    {hasVideo && (
                                        <span className="bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                                            <Play size={10} className="fill-current" /> Vídeo Disponível
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-3 leading-tight">
                                    {product.name}
                                </h1>

                                <div className="flex flex-wrap items-baseline gap-3 mb-6">
                                    {promo.isPromoActive ? (
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-3xl sm:text-4xl font-black text-red-600">
                                                {formattedPromoPrice}
                                            </span>
                                            <span className="text-base sm:text-lg font-bold text-slate-400 line-through">
                                                {formattedOriginalPrice}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-3xl sm:text-4xl font-extrabold text-brand-dark">
                                            {formattedOriginalPrice}
                                        </span>
                                    )}
                                </div>

                                {/* Stock Status */}
                                <div className="mb-6">
                                    {offMarket.isOffMarket ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                                            <AlertOctagon size={14} className="text-slate-600" />
                                            Vendas suspensas temporariamente
                                        </span>
                                    ) : (
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                                            product.stock > 0 
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                                        }`}>
                                            <CheckCircle2 size={14} />
                                            {product.stock > 0 ? `${product.stock} unidades disponíveis em estoque` : 'Produto temporariamente esgotado'}
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descrição do Produto</h2>
                                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        {product.description || 'Produto de alta qualidade com acabamento requintado, pronto para transformar sua obra ou decoração.'}
                                    </p>
                                </div>

                                {/* Seção Especial: Composição do Kit */}
                                {Array.isArray(product.kitItems) && product.kitItems.length > 0 && (
                                    <div className="mb-6 bg-gradient-to-br from-purple-50 via-indigo-50/50 to-purple-50 border border-purple-200 rounded-3xl p-5 shadow-xs">
                                        <div className="flex items-center justify-between mb-3">
                                            <h2 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
                                                <Boxes size={18} className="text-purple-600" />
                                                <span>Itens Inclusos neste Kit ({product.kitItems.length} peças)</span>
                                            </h2>
                                            <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                                                Combo Completo
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            {product.kitItems.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-purple-100 text-xs shadow-2xs">
                                                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="font-bold text-slate-800 truncate">{item.name}</span>
                                                    </div>
                                                    <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-lg shrink-0 text-[11px]">
                                                        {item.quantity}x un
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Ficha de Especificações Físicas e Voltagem */}
                                {(product.dimensionsSize || product.height || product.width || product.length || product.voltage || product.material || product.grossWeight || product.netWeight || product.capacityLiters) && (
                                    <div className="mb-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                                        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <Ruler size={14} className="text-brand-primary" />
                                            <span>Dimensões & Especificações Técnicas</span>
                                        </h2>
                                        <div className="grid grid-cols-2 gap-2.5 text-xs">
                                            {product.voltage && product.voltage !== 'Não se aplica' && (
                                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2 col-span-2 sm:col-span-1">
                                                    <Zap size={16} className="text-amber-600 fill-amber-500 shrink-0" />
                                                    <div>
                                                        <span className="text-[10px] text-amber-800 uppercase font-bold block">Voltagem</span>
                                                        <span className="font-bold text-amber-950">{product.voltage}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {(product.dimensionsSize || product.height || product.width || product.length) && (
                                                <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center gap-2">
                                                    <Ruler size={15} className="text-slate-500 shrink-0" />
                                                    <div>
                                                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Dimensões / Medidas</span>
                                                        <span className="font-semibold text-slate-800">
                                                            {product.dimensionsSize || `${product.height || '—'} x ${product.width || '—'}${product.length ? ` x ${product.length}` : ''} cm`}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {product.material && (
                                                <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center gap-2">
                                                    <Layers size={15} className="text-slate-500 shrink-0" />
                                                    <div>
                                                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Material</span>
                                                        <span className="font-semibold text-slate-800">{product.material}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {product.capacityLiters && (
                                                <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center gap-2">
                                                    <Droplets size={15} className="text-blue-500 shrink-0" />
                                                    <div>
                                                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Capacidade</span>
                                                        <span className="font-semibold text-slate-800">
                                                            {product.capacityLiters} {product.packagingType && product.packagingType !== 'Unidade' ? `(${product.packagingType})` : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {(product.grossWeight || product.netWeight) && (
                                                <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center gap-2">
                                                    <Weight size={15} className="text-slate-500 shrink-0" />
                                                    <div>
                                                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Peso</span>
                                                        <span className="font-semibold text-slate-800">
                                                            {product.netWeight ? `${product.netWeight} kg líq.` : `${product.grossWeight} kg bruto`}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {product.nature === 'Inflamável' && (
                                                <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-center gap-2">
                                                    <Flame size={15} className="text-red-600 shrink-0" />
                                                    <div>
                                                        <span className="text-[10px] text-red-700 uppercase font-bold block">Classificação</span>
                                                        <span className="font-bold text-red-900">Produto Inflamável</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Technical Specs (if present) */}
                                {product.technicalSpecs && (
                                    <div className="mb-6">
                                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Especificações Técnicas Complementares</h2>
                                        <div className="text-slate-700 text-xs sm:text-sm bg-amber-50/50 border border-amber-100 p-3 rounded-xl whitespace-pre-line">
                                            {product.technicalSpecs}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action CTA and Value Props */}
                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                {/* Alerta de Regra Logística Especial (Tubos 3m/6m, Lâmpadas compridas, Inflamáveis) */}
                                {shippingRestriction.isRestricted && (
                                    <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 font-bold text-amber-950">
                                                <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                                                <span>Logística Especial: Raio de até 15 km</span>
                                            </div>
                                            <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">
                                                Frete por conta do cliente
                                            </span>
                                        </div>
                                        <p className="text-amber-900 leading-relaxed">
                                            {product.pickupOrLocal15kmOnly ? (
                                                <>
                                                    Produto somente com retirada no nosso <strong>PONTO DE APOIO</strong> ou entrega num raio de <strong>até 15 km do nosso domicílio</strong>, com frete por conta do cliente.
                                                </>
                                            ) : (
                                                <>
                                                    Devido às normas de transporte de cargas especiais (<strong>{shippingRestriction.warningMessage || shippingRestriction.badgeLabel || 'Cargas especiais'}</strong>), este item é entregue em um raio de <strong>até 15 km do nosso domicílio</strong> com frete por conta do cliente, ou disponível para <strong>retirada no nosso PONTO DE APOIO</strong>.
                                                </>
                                            )}
                                        </p>
                                    </div>
                                )}

                                <button 
                                    onClick={handleAddToCart}
                                    disabled={!isAvailableForSale}
                                    className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-4 px-6 rounded-2xl text-base sm:text-lg shadow-xl hover:shadow-brand-primary/30 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                                >
                                    <ShoppingBag size={20} />
                                    <span>
                                        {offMarket.isOffMarket ? 'Produto Fora de Comercialização' : product.stock === 0 ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
                                    </span>
                                </button>

                                <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 pt-1">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-brand-primary" />
                                        <span>Garantia & Procedência</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Truck size={16} className="text-brand-primary" />
                                        <span>Entrega Segura</span>
                                    </div>
                                </div>

                                {/* Simulador de Frete e Comparação com Domicílio da Loja */}
                                <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                            <Compass size={15} className="text-brand-primary" />
                                            Simular Frete & Distância do Domicílio:
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            Origem: Bela Vista / SP
                                        </span>
                                    </div>

                                    <form onSubmit={handleSimulateShipping} className="flex gap-2">
                                        <input 
                                            type="text"
                                            placeholder="Digite seu CEP (00000-000)"
                                            value={simCep}
                                            onChange={(e) => setSimCep(formatCEP(e.target.value))}
                                            maxLength={9}
                                            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSimulating}
                                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shrink-0 disabled:opacity-50"
                                        >
                                            {isSimulating ? 'Calculando...' : 'Calcular'}
                                        </button>
                                    </form>

                                    {simError && (
                                        <p className="text-red-500 text-[11px]">{simError}</p>
                                    )}

                                    {simResult && (
                                        <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 mt-2">
                                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                                <span className="font-bold text-slate-800">
                                                    Distância Calculada:
                                                </span>
                                                <span className="font-bold text-brand-primary">
                                                    {simResult.distanceKm} km do nosso domicílio
                                                </span>
                                            </div>

                                            {shippingRestriction.isRestricted ? (
                                                simResult.isWithinLocalRadius ? (
                                                    <div className="space-y-1.5 text-[11px]">
                                                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                                                            <CheckCircle2 size={14} className="text-emerald-600" />
                                                            <span>Dentro do raio de 15 km (Atendimento Local Habilitado)</span>
                                                        </div>
                                                        <div className="flex justify-between text-slate-700">
                                                            <span>• Entrega Local (Prazo da Transportadora: 1 a 2 dias úteis):</span>
                                                            <span className="font-bold text-amber-900">Frete por conta do cliente (est. R$ 25,00)</span>
                                                        </div>
                                                        <div className="flex justify-between text-slate-700">
                                                            <span>• Retirada no Balcão da Loja:</span>
                                                            <span className="font-bold text-emerald-700">GRÁTIS (em 1h útil)</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1.5 text-[11px]">
                                                        <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                                                            <AlertTriangle size={14} className="text-amber-600" />
                                                            <span>Acima de 15 km ({simResult.distanceKm} km)</span>
                                                        </div>
                                                        <p className="text-amber-900 leading-snug">
                                                            Itens como tubos 3m/6m, lâmpadas fluorescentes e inflamáveis não são aceitos pelas transportadoras convencionais para esta distância.
                                                        </p>
                                                        <div className="flex justify-between text-slate-700 pt-1">
                                                            <span>• Retirada no Balcão da Loja:</span>
                                                            <span className="font-bold text-emerald-700">GRÁTIS</span>
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="space-y-1.5 text-[11px] text-slate-700">
                                                    <div className="flex justify-between">
                                                        <span>• Transportadora Padrão (3 a 5 dias úteis):</span>
                                                        <span className="font-bold text-slate-900">R$ 19,90</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>• Sedex / Expressa (1 a 2 dias úteis):</span>
                                                        <span className="font-bold text-slate-900">R$ 34,90</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>• Retirada no Balcão da Loja:</span>
                                                        <span className="font-bold text-emerald-700">GRÁTIS</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                 {/* Banner Informativo de Instalador Parceiro (Exibido somente se habilitado nas configurações) */}
                                {showPartnerBanner && (
                                    <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                                                <Wrench size={16} />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-gray-900 block">Precisa de Instalador Parceiro?</span>
                                                <span className="text-[11px] text-gray-600">Consulte eletricistas e técnicos autônomos sem taxas.</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onBack();
                                                setTimeout(() => {
                                                    document.getElementById('partner-installers')?.scrollIntoView({ behavior: 'smooth' });
                                                }, 100);
                                            }}
                                            className="text-xs font-bold text-amber-800 hover:text-amber-900 underline whitespace-nowrap"
                                        >
                                            Ver Especialistas
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
