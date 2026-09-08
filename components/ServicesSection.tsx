import React, { useState, useMemo } from 'react';
import { Briefcase, Clock, ArrowRight, Video, Sparkles, Tag } from 'lucide-react';
import { Service } from '../types';
import { motion } from 'motion/react';

interface ServicesSectionProps {
    services: Service[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services }) => {
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    // Categorias dinâmicas baseadas nos serviços cadastrados
    const categories = useMemo(() => {
        const set = new Set<string>();
        set.add('Todos');
        services.forEach(s => {
            if (s.category && s.category.trim()) {
                set.add(s.category.trim());
            }
        });
        return Array.from(set);
    }, [services]);

    const filteredServices = useMemo(() => {
        if (selectedCategory === 'Todos') return services;
        return services.filter(s => s.category === selectedCategory);
    }, [services, selectedCategory]);

    if (services.length === 0) return null;

    return (
        <section id="services" className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                    <div className="max-w-2xl">
                        <span className="text-brand-primary font-bold uppercase tracking-widest text-sm mb-4 block">Nossa Expertise & Soluções</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark">
                            Serviços Especializados <span className="text-brand-accent italic">Design & Manutenção</span>
                        </h2>
                    </div>
                    <p className="text-gray-500 max-w-sm">
                        Muito além de objetos e materiais, entregamos soluções completas de consultoria, jardins, estofados, hidráulica e elétrica.
                    </p>
                </div>

                {/* Filtro por Departamento de Serviços se houver mais de uma categoria */}
                {categories.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                    selectedCategory === cat
                                        ? 'bg-brand-dark text-white shadow-md'
                                        : 'bg-brand-light text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {cat === 'Todos' && <Sparkles size={12} />}
                                <span>{cat}</span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredServices.map((service, index) => (
                        <motion.div 
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-brand-light p-8 rounded-[2rem] border border-transparent hover:border-brand-primary/20 transition-all hover:shadow-2xl flex flex-col justify-between"
                        >
                            <div>
                                <div className="mb-6 flex justify-between items-start">
                                    <div className="p-4 bg-white text-brand-primary rounded-2xl shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                        <Briefcase size={28} />
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        {service.category && (
                                            <span className="text-[11px] font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">
                                                {service.category}
                                            </span>
                                        )}
                                        {service.duration && (
                                            <div className="flex items-center text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">
                                                <Clock size={13} className="mr-1" />
                                                {service.duration}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {service.imageUrl && (
                                    <div className="mb-5 overflow-hidden rounded-2xl h-44 bg-white border border-gray-100">
                                        <img 
                                            src={service.imageUrl} 
                                            alt={service.name} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        />
                                    </div>
                                )}
                                
                                <h3 className="text-2xl font-serif font-bold text-brand-dark mb-3">{service.name}</h3>
                                <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed text-sm">
                                    {service.description}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-brand-primary/10">
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-brand-primary">
                                        R$ {service.price.toFixed(2)}
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const el = document.getElementById('contact');
                                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="flex items-center text-brand-dark font-bold hover:text-brand-primary transition-colors text-sm"
                                    >
                                        Solicitar Orçamento
                                        <ArrowRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>

                                {service.videoUrl && (
                                    <div className="mt-3 flex items-center text-xs font-bold text-brand-secondary opacity-60 group-hover:opacity-100 transition-opacity">
                                        <Video size={14} className="mr-1" /> VÍDEO DISPONÍVEL
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
