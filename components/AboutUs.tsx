import React from 'react';

export const AboutUs: React.FC = () => {
    return (
        <section id="about-us" className="py-16 sm:py-20 bg-brand-light">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold font-serif text-brand-primary mb-4">O Ponto Chave que Define seu Lar</h2>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        No Ponto Chave do Lar, acreditamos que um único objeto pode ser o 'ponto chave' que transforma e define um ambiente. Nossa missão é fazer a curadoria de produtos de design inteligente e utilidades que servem como a peça central do seu espaço, trazendo funcionalidade, estilo e personalidade.
                    </p>
                </div>
            </div>
        </section>
    );
};