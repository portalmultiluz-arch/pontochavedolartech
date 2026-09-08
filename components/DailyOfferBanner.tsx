import React from 'react';
import type { DailyOffer } from '../types';

interface DailyOfferBannerProps {
    offer: DailyOffer;
}

export const DailyOfferBanner: React.FC<DailyOfferBannerProps> = ({ offer }) => {
    return (
        <section className="relative bg-cover bg-center text-white my-12" style={{ backgroundImage: `url('${offer.imageUrl}')` }}>
            <div className="absolute inset-0 bg-brand-dark bg-opacity-60" />
            <div className="relative container mx-auto px-6 py-16 text-center">
                <h2 className="text-3xl md:text-5xl font-bold font-serif leading-tight mb-3">
                    {offer.title}
                </h2>
                <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto font-light">
                    {offer.description}
                </p>
                <a
                    href={offer.buttonLink}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3.5 px-10 rounded-2xl text-base shadow-xl transform hover:-translate-y-1 transition-all duration-300 inline-block"
                >
                    {offer.buttonText}
                </a>
            </div>
        </section>
    );
};
