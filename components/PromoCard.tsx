import React from 'react';
import type { PromoContent } from '../types';

interface PromoCardProps {
    content: PromoContent;
}

export const PromoCard: React.FC<PromoCardProps> = ({ content }) => {
    return (
        <a href={content.link} className="bg-brand-primary text-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col group relative">
            {content.type === 'image' && (
                <img src={content.mediaUrl} alt={content.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            )}
            {content.type === 'video' && (
                <video 
                    src={content.mediaUrl} 
                    className="w-full h-full object-cover" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity group-hover:bg-opacity-40" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
                <h3 className="text-xl font-bold font-serif mb-1">{content.title}</h3>
                <p className="text-sm opacity-90">{content.description}</p>
            </div>
        </a>
    );
};
