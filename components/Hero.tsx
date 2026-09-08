import React from 'react';
import { ArrowRight, Star, Shield, Zap, Play, Gift } from 'lucide-react';
import { motion } from 'motion/react';
import { HeroCoverConfig } from '../types';

interface HeroProps {
    onNavigate: (sectionId?: string) => void;
    heroConfig?: HeroCoverConfig | null;
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1616489953149-80980ca8675c?auto=format&fit=crop&q=80&w=1200";

export const Hero: React.FC<HeroProps> = ({ onNavigate, heroConfig }) => {
    const mediaType = heroConfig?.mediaType || 'image';
    const imageUrl = heroConfig?.imageUrl || DEFAULT_IMAGE;
    const videoUrl = heroConfig?.videoUrl || '';

    const badgeText = heroConfig?.badgeText || 'Design Autoral & Exclusivo';
    const headlinePrefix = heroConfig?.headlinePrefix ?? 'O ';
    const headlineHighlight = heroConfig?.headlineHighlight ?? 'ponto chave';
    const headlineSuffix = heroConfig?.headlineSuffix ?? ' do seu ambiente.';
    const subheadline = heroConfig?.subheadline || 'Curadoria especializada em utilidades domésticas e design que transformam casas em lares com alma. Tecnologia e estilo em cada detalhe.';
    const primaryButtonText = heroConfig?.primaryButtonText || 'Explorar Coleção';
    const secondaryButtonText = heroConfig?.secondaryButtonText || 'Nossa História';
    const ratingScore = heroConfig?.ratingScore || '4.9/5';
    const ratingLabel = heroConfig?.ratingLabel || 'Avaliações';
    const trustLabel = heroConfig?.trustLabel || 'Compra Segura';
    const floatingCardTitle = heroConfig?.floatingCardTitle || 'Entrega Expressa';
    const floatingCardSubtext = heroConfig?.floatingCardSubtext || 'Capitais em 24h';

    // Helper para converter URLs de YouTube/Vimeo em iframe embed se necessário
    const getEmbedUrl = (url: string) => {
        if (!url) return null;
        
        // YouTube
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (ytMatch && ytMatch[1]) {
            const videoId = ytMatch[1];
            return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;
        }

        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (vimeoMatch && vimeoMatch[1]) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1&background=1&playsinline=1`;
        }

        return null;
    };

    const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;
    const isDirectVideo = videoUrl && !embedUrl;

    return (
        <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-brand-light pt-12 pb-12 lg:pt-16 lg:pb-16">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-secondary/10 -skew-x-12 translate-x-1/4 z-0" />
            <motion.div 
                animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0] 
                }}
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl z-0" 
            />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
                    <div className="flex-1 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-block px-4 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-bold uppercase tracking-widest mb-6">
                                {badgeText}
                            </span>
                            <h1 className="text-5xl lg:text-7xl font-serif font-bold text-brand-dark leading-[1.1] mb-6">
                                {headlinePrefix}<span className="text-brand-accent italic">{headlineHighlight}</span>{headlineSuffix}
                            </h1>
                            <p className="text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
                                {subheadline}
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <button 
                                    onClick={() => onNavigate('products')}
                                    className="group px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold text-lg hover:bg-brand-dark transition-all shadow-xl hover:shadow-brand-primary/20 flex items-center"
                                >
                                    {primaryButtonText}
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button 
                                    onClick={() => onNavigate('about')}
                                    className="px-8 py-4 bg-white text-brand-dark border-2 border-gray-100 rounded-2xl font-bold text-lg hover:border-brand-primary transition-all"
                                >
                                    {secondaryButtonText}
                                </button>
                            </div>

                            {/* Sugestão de PRESENTES para Dias e Datas Comemorativas */}
                            <div className="mt-5 flex items-center justify-center lg:justify-start">
                                <button
                                    onClick={() => onNavigate('gifts')}
                                    className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-pink-500/15 hover:from-amber-500/25 hover:to-rose-500/25 border border-amber-300/80 rounded-2xl text-xs sm:text-sm font-bold text-amber-950 transition-all cursor-pointer shadow-xs group"
                                >
                                    <span className="p-1 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                                        <Gift size={15} className="animate-pulse" />
                                    </span>
                                    <span>Dia dos Pais, Dia das Mães é todo dia... Veja nossas sugestões de <span className="text-rose-700 font-extrabold uppercase">PRESENTES</span>!</span>
                                    <ArrowRight size={14} className="text-amber-800 group-hover:translate-x-1 transition-transform ml-0.5" />
                                </button>
                            </div>

                            <div className="mt-12 flex items-center justify-center lg:justify-start space-x-8 text-gray-400">
                                <div className="flex items-center">
                                    <Star className="text-brand-accent mr-2" size={20} fill="currentColor" />
                                    <span className="text-sm font-bold">{ratingScore} {ratingLabel}</span>
                                </div>
                                <div className="flex items-center">
                                    <Shield className="text-brand-primary mr-2" size={20} />
                                    <span className="text-sm font-bold">{trustLabel}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex-1 relative w-full max-w-xl lg:max-w-none mx-auto"
                    >
                        <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/50 flex items-center justify-center h-[300px] sm:h-[380px] lg:h-[450px]">
                            {/* Ambient background blur for seamless filled edges without cropping */}
                            <img 
                                src={imageUrl} 
                                alt="" 
                                aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110 pointer-events-none"
                            />

                            {mediaType === 'video' && videoUrl ? (
                                embedUrl ? (
                                    <div className="w-full h-full relative overflow-hidden flex items-center justify-center z-10">
                                        <iframe
                                            src={embedUrl}
                                            title="Vídeo de Capa"
                                            className="w-full h-full object-contain pointer-events-none"
                                            allow="autoplay; encrypted-media; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : isDirectVideo ? (
                                    <video
                                        src={videoUrl}
                                        poster={imageUrl}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-contain relative z-10 p-2 sm:p-4"
                                    />
                                ) : (
                                    <img 
                                        src={imageUrl} 
                                        alt="Destaque Principal" 
                                        className="w-full h-full object-contain relative z-10 p-3 sm:p-6 drop-shadow-2xl transition-transform hover:scale-105 duration-500"
                                    />
                                )
                            ) : (
                                <img 
                                    src={imageUrl} 
                                    alt="Destaque Principal" 
                                    className="w-full h-full object-contain relative z-10 p-3 sm:p-6 drop-shadow-2xl transition-transform hover:scale-105 duration-500"
                                    onError={(e) => {
                                        // Fallback se a imagem der erro
                                        (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                                    }}
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none z-10" />
                        </div>
                        
                        {/* Floating Card */}
                        <motion.div 
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -left-12 top-1/4 z-20 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 hidden xl:block"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-brand-light rounded-xl text-brand-primary">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">{floatingCardTitle}</p>
                                    <p className="font-bold text-brand-dark text-sm">{floatingCardSubtext}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

