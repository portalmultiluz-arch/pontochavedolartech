
import React, { useState } from 'react';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import { getProductDisplayImage, parseMediaUrl } from '../lib/mediaHelper';
import { getProductPromoDetails, getProductDiscontinuedDetails, getProductOffMarketDetails } from '../lib/productStatusHelper';
import { isKitProduct } from '../lib/catalogHelper';
import { Play, Video as VideoIcon, ShoppingBag, Eye, Tag, AlertOctagon, Archive, Boxes, Gift, MapPin } from 'lucide-react';
import { sanitizeProductForCustomer, sanitizeCustomerText } from '../lib/textHelper';

interface ProductCardProps {
    product: Product;
    onViewProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product: rawProduct, onViewProduct }) => {
    const product = sanitizeProductForCustomer(rawProduct);
    const { addToCart } = useCart();
    const { showNotification } = useNotification();
    const [imgSrc, setImgSrc] = useState<string>(() => getProductDisplayImage(product.imageUrl, product.videoUrl));
    
    // Status especiais
    const promo = getProductPromoDetails(product);
    const discontinued = getProductDiscontinuedDetails(product);
    const offMarket = getProductOffMarketDetails(product);
    const isKit = isKitProduct(product);
    const isGift = Boolean(
        product.category?.toLowerCase().includes('presente') || 
        product.department?.toLowerCase().includes('presente') ||
        product.productClass?.toLowerCase().includes('presente')
    );

    const formattedOriginalPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(product.price || 0);

    const formattedPromoPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(promo.promoPrice);

    const hasVideo = Boolean(product.videoUrl && product.videoUrl.trim() !== '');
    const isAvailableForSale = !offMarket.isOffMarket && (product.stock || 0) > 0;

    const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (offMarket.isOffMarket) {
            showNotification(`Produto fora de comercialização no momento.`);
            return;
        }
        addToCart(product);
        showNotification(`${product.name} adicionado ao carrinho!`);
    };

    return (
        <div 
            className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transform hover:-translate-y-1.5 transition-all duration-300 flex flex-col group cursor-pointer"
            onClick={() => onViewProduct(product)}
        >
            {/* Image / Video Container */}
            <div className="relative overflow-hidden bg-slate-50 aspect-[4/3] flex items-center justify-center p-3">
                <img 
                    src={imgSrc} 
                    alt={product.name} 
                    onError={() => {
                        setImgSrc('/ponto_chave_logo.jpg');
                    }}
                    className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ${offMarket.isOffMarket ? 'grayscale opacity-75' : ''}`} 
                />

                {/* Badge Overlay Top-Left: Exibe apenas 1 badge prioritário e elegante */}
                <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                    {offMarket.isOffMarket ? (
                        <span className="bg-slate-900/90 text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 backdrop-blur-xs">
                            <AlertOctagon size={10} />
                            <span>Indisponível</span>
                        </span>
                    ) : promo.isPromoActive ? (
                        <span className="bg-red-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                            <Tag size={10} className="fill-current" />
                            <span>{promo.discountPercent > 0 ? `-${promo.discountPercent}%` : 'OFERTA'}</span>
                        </span>
                    ) : isKit ? (
                        <span className="bg-purple-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                            <Boxes size={10} className="text-yellow-300" />
                            <span>KIT</span>
                        </span>
                    ) : isGift ? (
                        <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                            <Gift size={10} />
                            <span>PRESENTE</span>
                        </span>
                    ) : discontinued.isDiscontinued ? (
                        <span className="bg-amber-800/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                            <Archive size={10} />
                            <span>Últimas Unidades</span>
                        </span>
                    ) : null}
                </div>

                {hasVideo && (
                    <div className="absolute bottom-3 right-3 bg-brand-dark/85 backdrop-blur-md text-amber-400 text-xs font-bold px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1.5 border border-white/10 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                        <Play size={13} className="fill-current" />
                        <span>Vídeo</span>
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className="p-4 flex flex-col flex-grow justify-between">
                <div>
                    {product.category && (
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1 block truncate">
                            {product.category}
                        </span>
                    )}
                    <h3 
                        className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug mb-1.5 min-h-[2.6rem]" 
                        title={product.name}
                    >
                        {product.name}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-2.5">
                        {product.description || 'Design exclusivo e alta durabilidade para transformar seu espaço.'}
                    </p>

                    {(product.pickupOrLocal15kmOnly || product.isSpecialDelivery) && (
                        <div 
                            className="flex items-center gap-1 text-[11px] text-amber-800 font-medium mb-2.5 bg-amber-50/70 px-2 py-0.5 rounded-md border border-amber-200/60"
                            title="Retirada no Ponto de Apoio ou entrega em raio de até 15km."
                        >
                            <MapPin size={11} className="text-amber-600 shrink-0" />
                            <span className="truncate">Retirada Ponto de Apoio / raio 15km</span>
                        </div>
                    )}
                </div>

                <div className="pt-2 border-t border-gray-100 mt-auto">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                                {promo.isPromoActive ? 'Preço Promocional' : 'Preço'}
                            </span>
                            {promo.isPromoActive ? (
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-black text-red-600">{formattedPromoPrice}</span>
                                    <span className="text-xs text-gray-400 line-through">{formattedOriginalPrice}</span>
                                </div>
                            ) : (
                                <span className="text-xl font-bold text-brand-dark">{formattedOriginalPrice}</span>
                            )}
                        </div>

                        {offMarket.isOffMarket ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                Indisponível
                            </span>
                        ) : product.stock !== undefined && (
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                                {product.stock > 0 ? `${product.stock} un` : 'Esgotado'}
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => onViewProduct(product)}
                            className="py-2.5 px-3 bg-white hover:bg-gray-100 text-slate-700 border border-gray-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                            <Eye size={14} />
                            <span>Ver Detalhes</span>
                        </button>
                        <button 
                            type="button"
                            onClick={handleAddToCart}
                            disabled={!isAvailableForSale}
                            className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            <ShoppingBag size={14} />
                            <span>{offMarket.isOffMarket ? 'Suspenso' : 'Comprar'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

