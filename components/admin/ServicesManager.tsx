import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Trash2, Edit2, Video, Image as ImageIcon, Clock, Check, X, Briefcase, AlertTriangle, Calculator, TrendingUp, Sparkles, DollarSign, Ruler, Weight, Droplets, Flame, Layers, Zap } from 'lucide-react';
import { subscribeToCollection, createDocument, updateDocument, deleteDocument } from '../../services/firebaseService';
import { Service } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { calculateServicePrice } from '../../lib/taxCalculator';

const PRESET_SERVICE_IMAGES = [
    { label: 'Consultoria de Interiores', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800' },
    { label: 'Projeto de Iluminação', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800' },
    { label: 'Manutenção Elétrica & Hidráulica', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800' },
    { label: 'Jardins & Paisagismo', url: 'https://images.unsplash.com/photo-1558904541-efa8c4a08931?auto=format&fit=crop&q=80&w=800' },
    { label: 'Higienização de Estofados', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800' },
    { label: 'Instalação Técnica & Montagem', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800' },
    { label: 'Ambientação & Decoração', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800' },
];

export const SERVICE_CATEGORIES = [
    'Todos',
    'Consultoria',
    'Projetos & Design',
    'Manutenção Elétrica / Hidráulica',
    'Jardins & Paisagismo',
    'Higienização de Estofados',
    'Instalação & Montagem',
    'Manutenção & Reparo',
    'Ambientação'
];

const INITIAL_SERVICE: Partial<Service> = {
    name: '',
    description: '',
    price: 0,
    costPrice: 0,
    issPercent: 5.0,
    pisPercent: 0.65,
    cofinsPercent: 3.00,
    inssPercent: 0,
    otherTaxesPercent: 0,
    profitMarginPercent: 50,
    duration: '2 a 4 horas',
    category: 'Consultoria',
    imageUrl: PRESET_SERVICE_IMAGES[0].url,
    videoUrl: '',
    requirements: '',
    // Atributos operacionais e técnicos do serviço
    scopeDimensions: '',
    estimatedWeight: '',
    capacityLiters: '',
    nature: 'Não-inflamável',
    material: 'Plástico / PVC',
    voltage: ''
};

export const ServicesManager: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [formData, setFormData] = useState<Partial<Service>>(INITIAL_SERVICE);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToCollection('services', (data) => {
            setServices(data as Service[]);
        }, 'name');
        return () => unsubscribe();
    }, []);

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4000);
    };

    const handleOpenCreate = () => {
        setEditingService(null);
        setFormData(INITIAL_SERVICE);
        setIsAdding(true);
    };

    const handleOpenEdit = (service: Service) => {
        setEditingService(service);
        setFormData({
            ...service,
            price: Number(service.price || 0),
            costPrice: Number(service.costPrice || 0),
            issPercent: service.issPercent !== undefined ? Number(service.issPercent) : 5.0,
            pisPercent: service.pisPercent !== undefined ? Number(service.pisPercent) : 0.65,
            cofinsPercent: service.cofinsPercent !== undefined ? Number(service.cofinsPercent) : 3.00,
            inssPercent: service.inssPercent !== undefined ? Number(service.inssPercent) : 0,
            otherTaxesPercent: service.otherTaxesPercent !== undefined ? Number(service.otherTaxesPercent) : 0,
            profitMarginPercent: service.profitMarginPercent !== undefined ? Number(service.profitMarginPercent) : 50,
            scopeDimensions: service.scopeDimensions || '',
            estimatedWeight: service.estimatedWeight || '',
            capacityLiters: service.capacityLiters !== undefined ? service.capacityLiters : '',
            nature: service.nature || 'Não-inflamável',
            material: service.material || 'Plástico / PVC',
            voltage: service.voltage || ''
        });
        setIsAdding(true);
    };

    const handleCloseForm = () => {
        setIsAdding(false);
        setEditingService(null);
        setFormData(INITIAL_SERVICE);
    };

    // Apuração em tempo real dos tributos de serviços (ISS, PIS, COFINS, INSS) e margem
    const taxSummary = useMemo(() => {
        return calculateServicePrice({
            costPrice: formData.costPrice,
            issPercent: formData.issPercent,
            pisPercent: formData.pisPercent,
            cofinsPercent: formData.cofinsPercent,
            inssPercent: formData.inssPercent,
            otherTaxesPercent: formData.otherTaxesPercent,
            profitMarginPercent: formData.profitMarginPercent,
        });
    }, [
        formData.costPrice,
        formData.issPercent,
        formData.pisPercent,
        formData.cofinsPercent,
        formData.inssPercent,
        formData.otherTaxesPercent,
        formData.profitMarginPercent,
    ]);

    const handleApplySuggestedPrice = () => {
        if (taxSummary.suggestedPrice > 0) {
            setFormData(prev => ({ ...prev, price: taxSummary.suggestedPrice }));
            showFeedback('success', `Valor do serviço atualizado para R$ ${taxSummary.suggestedPrice.toFixed(2)}.`);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name?.trim()) {
            showFeedback('error', 'O nome do serviço é obrigatório.');
            return;
        }

        const price = Number(formData.price);
        if (isNaN(price) || price <= 0) {
            showFeedback('error', 'Informe um valor válido maior que zero.');
            return;
        }

        setIsSaving(true);
        try {
            const payload: Partial<Service> = {
                name: formData.name.trim(),
                description: formData.description?.trim() || '',
                price: price,
                costPrice: Number(formData.costPrice || 0),
                issPercent: Number(formData.issPercent || 0),
                pisPercent: Number(formData.pisPercent || 0),
                cofinsPercent: Number(formData.cofinsPercent || 0),
                inssPercent: Number(formData.inssPercent || 0),
                otherTaxesPercent: Number(formData.otherTaxesPercent || 0),
                profitMarginPercent: Number(formData.profitMarginPercent || 0),
                duration: formData.duration?.trim() || 'A combinar',
                category: formData.category || 'Consultoria',
                imageUrl: formData.imageUrl?.trim() || PRESET_SERVICE_IMAGES[0].url,
                videoUrl: formData.videoUrl?.trim() || '',
                requirements: formData.requirements?.trim() || '',
                // Atributos operacionais e técnicos
                scopeDimensions: formData.scopeDimensions?.trim() || '',
                estimatedWeight: formData.estimatedWeight?.trim() || '',
                capacityLiters: formData.capacityLiters !== undefined && formData.capacityLiters !== '' ? formData.capacityLiters : '',
                nature: formData.nature || 'Não-inflamável',
                material: formData.material?.trim() || 'Plástico / PVC',
                voltage: formData.voltage?.trim() || ''
            };

            if (editingService?.id) {
                await updateDocument('services', editingService.id, payload);
                showFeedback('success', `Serviço "${payload.name}" atualizado com sucesso!`);
            } else {
                await createDocument('services', payload);
                showFeedback('success', `Serviço "${payload.name}" cadastrado com sucesso!`);
            }

            handleCloseForm();
        } catch (err: any) {
            console.error('Erro ao salvar serviço:', err);
            showFeedback('error', `Falha ao salvar serviço: ${err.message || 'Verifique as permissões de acesso.'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        try {
            await deleteDocument('services', id);
            setDeleteConfirmId(null);
            showFeedback('success', `Serviço "${name}" removido com sucesso.`);
        } catch (err: any) {
            console.error('Erro ao remover serviço:', err);
            showFeedback('error', `Erro ao excluir: ${err.message || 'Permissão negada'}`);
        }
    };

    const filteredServices = services.filter(s => {
        const matchesSearch = 
            (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || s.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            {/* Cabeçalho */}
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-brand-dark flex items-center gap-3">
                        <Briefcase className="text-brand-primary" size={32} />
                        Catálogo de Serviços Especializados
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Gerencie ofertas de consultoria, instalação, projetos de iluminação e design.
                    </p>
                </div>
                <button 
                    onClick={handleOpenCreate}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center space-x-2 font-bold transition-all shadow-md active:scale-95"
                >
                    <Plus size={20} className="text-amber-400" />
                    <span>Novo Serviço</span>
                </button>
            </header>

            {/* Banner de Feedback */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mb-6 p-4 rounded-2xl flex items-center justify-between border ${
                            feedback.type === 'success' 
                                ? 'bg-green-50 text-green-800 border-green-200' 
                                : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            {feedback.type === 'success' ? <Check size={20} className="text-green-600" /> : <AlertTriangle size={20} className="text-red-600" />}
                            <span className="font-medium text-sm">{feedback.message}</span>
                        </div>
                        <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Formulário de Cadastro / Edição */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        className="mb-10 bg-white p-8 rounded-3xl shadow-2xl border border-brand-primary/20"
                    >
                        <div className="flex justify-between items-center pb-6 border-b border-gray-100 mb-6">
                            <div>
                                <h3 className="text-2xl font-bold font-serif text-brand-dark">
                                    {editingService ? 'Editar Serviço' : 'Cadastrar Nova Oferta de Serviço'}
                                </h3>
                                <p className="text-sm text-gray-500">Defina o escopo, valores, tempo de execução e mídias.</p>
                            </div>
                            <button 
                                onClick={handleCloseForm} 
                                className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-gray-100 transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Nome do Serviço *</label>
                                    <input 
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                        placeholder="Ex: Consultoria de Design de Interiores & Iluminação"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Categoria</label>
                                    <select 
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none transition-all font-medium"
                                        value={formData.category || 'Consultoria'}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Consultoria">Consultoria</option>
                                        <option value="Projetos & Design">Projetos & Design</option>
                                        <option value="Manutenção Elétrica / Hidráulica">Manutenção Elétrica / Hidráulica</option>
                                        <option value="Jardins & Paisagismo">Jardins & Paisagismo</option>
                                        <option value="Higienização de Estofados">Higienização de Estofados</option>
                                        <option value="Instalação & Montagem">Instalação & Montagem</option>
                                        <option value="Manutenção & Reparo">Manutenção & Reparo</option>
                                        <option value="Ambientação">Ambientação</option>
                                    </select>
                                </div>
                            </div>

                            {/* Seção de Formação de Preço e Tributos sobre Serviços */}
                            <div className="bg-sky-50/40 p-6 rounded-2xl border border-sky-200/60">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-bold text-sky-950 uppercase tracking-widest flex items-center gap-2">
                                        <Calculator size={16} className="text-sky-700" /> Formação de Preço: Tributos sobre Serviços (ISS/PIS/COFINS/INSS) & Margem
                                    </h4>
                                    <span className="text-[11px] font-bold text-sky-900 bg-sky-100 px-2.5 py-1 rounded-lg">
                                        Total Tributos: {taxSummary.totalTaxPercent.toFixed(2)}% (+R$ {taxSummary.totalTaxAmount.toFixed(2)})
                                    </span>
                                </div>

                                {/* Linha 1: Custo Operacional e Tributos de Serviços */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                                    <div className="space-y-1 col-span-2 sm:col-span-1">
                                        <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1">
                                            <span>Custo Base / Hora (R$)</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">R$</span>
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-sky-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm font-bold text-gray-900"
                                                placeholder="0.00"
                                                value={formData.costPrice ?? ''}
                                                onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-600 uppercase flex items-center justify-between">
                                            <span>ISS / ISSQN</span>
                                            <span className="text-[10px] text-gray-400 font-normal">%</span>
                                        </label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm font-medium"
                                            placeholder="5.00"
                                            value={formData.issPercent ?? ''}
                                            onChange={e => setFormData({ ...formData, issPercent: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-600 uppercase flex items-center justify-between">
                                            <span>PIS</span>
                                            <span className="text-[10px] text-gray-400 font-normal">%</span>
                                        </label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm font-medium"
                                            placeholder="0.65"
                                            value={formData.pisPercent ?? ''}
                                            onChange={e => setFormData({ ...formData, pisPercent: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-600 uppercase flex items-center justify-between">
                                            <span>COFINS</span>
                                            <span className="text-[10px] text-gray-400 font-normal">%</span>
                                        </label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm font-medium"
                                            placeholder="3.00"
                                            value={formData.cofinsPercent ?? ''}
                                            onChange={e => setFormData({ ...formData, cofinsPercent: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-600 uppercase flex items-center justify-between">
                                            <span>INSS Retido</span>
                                            <span className="text-[10px] text-gray-400 font-normal">%</span>
                                        </label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm font-medium"
                                            placeholder="0.00"
                                            value={formData.inssPercent ?? ''}
                                            onChange={e => setFormData({ ...formData, inssPercent: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-600 uppercase flex items-center justify-between">
                                            <span>Outros</span>
                                            <span className="text-[10px] text-gray-400 font-normal">%</span>
                                        </label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm font-medium"
                                            placeholder="0.00"
                                            value={formData.otherTaxesPercent ?? ''}
                                            onChange={e => setFormData({ ...formData, otherTaxesPercent: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                {/* Linha 2: Margem de Lucro e Resumo Totalizador */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-white p-4 rounded-xl border border-sky-200 shadow-sm">
                                    <div className="lg:col-span-4 space-y-1">
                                        <label className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1">
                                            <TrendingUp size={14} className="text-emerald-600" />
                                            <span>Margem de Lucro Desejada (%)</span>
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                step="0.1"
                                                className="w-full pl-3 pr-8 py-2.5 bg-emerald-50/50 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-base font-bold text-emerald-900"
                                                placeholder="50.0"
                                                value={formData.profitMarginPercent ?? ''}
                                                onChange={e => setFormData({ ...formData, profitMarginPercent: parseFloat(e.target.value) || 0 })}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-sm">%</span>
                                        </div>
                                    </div>

                                    {/* Breakdown Totalizador */}
                                    <div className="lg:col-span-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 border-t lg:border-t-0 lg:border-l border-gray-100 pt-2 lg:pt-0 lg:pl-4">
                                        <div>
                                            <span className="text-gray-400 block text-[10px] uppercase">Custo c/ Tributos:</span>
                                            <span className="font-bold text-gray-800">R$ {taxSummary.costWithTaxes.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block text-[10px] uppercase">Lucro Projetado:</span>
                                            <span className="font-bold text-emerald-700">+ R$ {taxSummary.profitAmount.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block text-[10px] uppercase">Valor Calculado:</span>
                                            <span className="font-bold text-brand-primary text-sm">R$ {taxSummary.suggestedPrice.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Botão de Aplicação Rápida */}
                                    <div className="lg:col-span-3 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleApplySuggestedPrice}
                                            className="w-full lg:w-auto px-3.5 py-2.5 bg-brand-primary hover:bg-brand-dark text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all"
                                        >
                                            <Sparkles size={14} />
                                            <span>Aplicar Valor Calculado</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Seção de Especificações Técnicas e Operacionais do Serviço */}
                            <div className="bg-slate-50/90 p-6 rounded-2xl border border-slate-200">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Ruler size={16} className="text-brand-primary" /> Dimensões de Escopo, Capacidade & Atributos de Execução
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1">
                                            <Ruler size={13} className="text-gray-400" />
                                            <span>Dimensões / Área Atendida</span>
                                        </label>
                                        <input 
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                            placeholder="Ex: Até 50m², 10m de altura, 2x3m"
                                            value={formData.scopeDimensions || ''}
                                            onChange={e => setFormData({ ...formData, scopeDimensions: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1">
                                            <Weight size={13} className="text-gray-400" />
                                            <span>Peso / Carga Estimada</span>
                                        </label>
                                        <input 
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                            placeholder="Ex: Até 500kg, Carga pesada"
                                            value={formData.estimatedWeight || ''}
                                            onChange={e => setFormData({ ...formData, estimatedWeight: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1">
                                            <Droplets size={13} className="text-blue-500" />
                                            <span>Capacidade em Litros / Volume</span>
                                        </label>
                                        <input 
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                            placeholder="Ex: Reservatórios de 500L a 5.000L"
                                            value={formData.capacityLiters ?? ''}
                                            onChange={e => setFormData({ ...formData, capacityLiters: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/80">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                                            <Flame size={14} className={formData.nature === 'Inflamável / Risco NR-20' ? 'text-red-500' : 'text-emerald-500'} />
                                            <span>Natureza / Risco do Ambiente</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, nature: 'Não-inflamável' })}
                                                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                                    formData.nature === 'Não-inflamável' || !formData.nature
                                                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                <Check size={14} className={formData.nature === 'Não-inflamável' || !formData.nature ? 'text-emerald-600' : 'opacity-0'} />
                                                <span>Ambiente Padrão</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, nature: 'Inflamável / Risco NR-20' })}
                                                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                                    formData.nature === 'Inflamável / Risco NR-20'
                                                        ? 'bg-red-50 border-red-400 text-red-800 shadow-sm'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                <Flame size={14} className={formData.nature === 'Inflamável / Risco NR-20' ? 'text-red-600' : 'text-gray-400'} />
                                                <span>Inflamável / Risco</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                                            <Layers size={14} className="text-brand-primary" />
                                            <span>Material / Superfície Atendida</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <select 
                                                className="w-1/2 p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm font-medium"
                                                value={['Plástico / PVC', 'Madeira', 'Metal / Inox', 'Alvenaria', 'Vidro'].includes(formData.material || '') ? formData.material : 'Outro'}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setFormData({ ...formData, material: val === 'Outro' ? '' : val });
                                                }}
                                            >
                                                <option value="Plástico / PVC">Plástico / PVC</option>
                                                <option value="Madeira">Madeira</option>
                                                <option value="Metal / Inox">Metal / Inox</option>
                                                <option value="Alvenaria">Alvenaria</option>
                                                <option value="Vidro">Vidro</option>
                                                <option value="Outro">Outro...</option>
                                            </select>
                                            <input 
                                                className="w-1/2 p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                                placeholder="Descreva o material..."
                                                value={formData.material || ''}
                                                onChange={e => setFormData({ ...formData, material: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Voltagem / Tensão do Serviço de Instalação ou Manutenção */}
                                <div className="pt-3 border-t border-slate-200/80">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                        <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                                            <Zap size={14} className="text-amber-500 fill-amber-400" />
                                            <span>Voltagem / Tensão de Operação</span>
                                        </label>
                                        <span className="text-[11px] text-gray-500 font-medium">
                                            Especifique se o serviço envolve rede elétrica (110V, 220V, Bivolt, Trifásico, 12V/24V)
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                                        {[
                                            { label: '110V / 127V', val: '110V' },
                                            { label: '220V', val: '220V' },
                                            { label: 'Bivolt (110V/220V)', val: 'Bivolt' },
                                            { label: 'Trifásico (220V/380V)', val: 'Trifásico (220V/380V)' },
                                            { label: '12V / 24V (Solar/DC)', val: '12V / 24V' },
                                            { label: 'Não se aplica', val: 'Não se aplica' }
                                        ].map(preset => {
                                            const isSelected = formData.voltage === preset.val;
                                            return (
                                                <button
                                                    key={preset.val}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, voltage: preset.val })}
                                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                        isSelected
                                                            ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50 hover:border-amber-300'
                                                    }`}
                                                >
                                                    {preset.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-500">
                                                <Zap size={14} />
                                            </div>
                                            <input 
                                                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm font-medium"
                                                placeholder="Ou digite outra especificação de tensão..."
                                                value={formData.voltage || ''}
                                                onChange={e => setFormData({ ...formData, voltage: e.target.value })}
                                            />
                                        </div>
                                        {formData.voltage && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, voltage: '' })}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-semibold"
                                                title="Limpar voltagem"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 uppercase">Valor do Investimento Final (R$) *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">R$</span>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-lg font-bold text-brand-dark"
                                            placeholder="0.00"
                                            value={formData.price ?? ''}
                                            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Duração Estimada</label>
                                    <input 
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                        placeholder="Ex: 2 a 4 horas / 3 dias"
                                        value={formData.duration || ''}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Link Vídeo Showcase (Opcional)</label>
                                    <input 
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                        placeholder="Link YouTube/Vimeo..."
                                        value={formData.videoUrl || ''}
                                        onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Imagem do Serviço com presets */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">URL da Imagem de Apresentação</label>
                                <input 
                                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                                    placeholder="https://..."
                                    value={formData.imageUrl || ''}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                />
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {PRESET_SERVICE_IMAGES.map((preset, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                                            className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                                                formData.imageUrl === preset.url 
                                                    ? 'bg-brand-primary text-white border-brand-primary' 
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-primary'
                                            }`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Descrição Completa dos Serviços</label>
                                    <textarea 
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none min-h-[100px] text-sm"
                                        placeholder="Descreva o que o cliente receberá ao contratar..."
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Requisitos do Cliente (Opcional)</label>
                                    <textarea 
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none min-h-[100px] text-sm"
                                        placeholder="Ex: Planta baixa do imóvel, fotos do espaço ou ponto de energia pronto..."
                                        value={formData.requirements || ''}
                                        onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                                <button 
                                    type="button" 
                                    onClick={handleCloseForm} 
                                    className="px-6 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="px-10 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl font-bold shadow-md transition-all transform active:scale-95 disabled:opacity-50 flex items-center space-x-2"
                                >
                                    {isSaving ? (
                                        <span>Salvando...</span>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            <span>{editingService ? 'Atualizar Serviço' : 'Salvar Serviço'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Barra de Busca e Filtros por Departamento de Serviço */}
            <div className="mb-8 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar serviços por título ou descrição..." 
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none text-sm shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                        Exibindo <strong>{filteredServices.length}</strong> de {services.length} serviços cadastrados
                    </span>
                </div>

                {/* Filtros em Pílulas por Departamento de Serviço */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {SERVICE_CATEGORIES.map((cat) => {
                        const count = cat === 'Todos' 
                            ? services.length 
                            : services.filter(s => s.category === cat).length;

                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                                    selectedCategory === cat
                                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                                        : 'bg-white text-slate-700 border-gray-200 hover:border-amber-500/40 hover:bg-gray-50'
                                }`}
                            >
                                <span>{cat}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                    selectedCategory === cat 
                                        ? 'bg-slate-950/15 text-slate-950' 
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Grid de Serviços */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((s) => (
                    <motion.div 
                        key={s.id}
                        whileHover={{ y: -4 }}
                        className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-all"
                    >
                        <div>
                            {s.imageUrl && (
                                <img src={s.imageUrl} alt={s.name} className="w-full h-40 rounded-2xl object-cover mb-4 border border-gray-100" />
                            )}
                            <div className="flex justify-between items-start mb-3">
                                <span className="px-3 py-1 bg-brand-secondary/20 text-brand-dark text-xs font-bold rounded-full uppercase tracking-wider">
                                    {s.category || 'Consultoria'}
                                </span>
                                <div className="flex items-center space-x-1">
                                    <button 
                                        onClick={() => handleOpenEdit(s)}
                                        className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-light rounded-xl transition-colors"
                                        title="Editar Serviço"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    
                                    {deleteConfirmId === s.id ? (
                                        <div className="flex items-center space-x-1 bg-red-50 p-1 rounded-xl">
                                            <button 
                                                onClick={() => handleDelete(s.id, s.name)}
                                                className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-lg"
                                            >
                                                Excluir
                                            </button>
                                            <button 
                                                onClick={() => setDeleteConfirmId(null)}
                                                className="p-1 text-gray-400 hover:text-gray-600"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setDeleteConfirmId(s.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Excluir Serviço"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-brand-dark mb-1">{s.name}</h3>

                            {/* Tags de Atributos do Serviço */}
                            <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-[11px]">
                                {s.material && (
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                                        {s.material}
                                    </span>
                                )}
                                {s.scopeDimensions && (
                                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium border border-blue-100">
                                        {s.scopeDimensions}
                                    </span>
                                )}
                                {s.voltage && s.voltage !== 'Não se aplica' && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                                        <Zap size={11} className="mr-0.5 text-amber-600 fill-amber-500" /> {s.voltage}
                                    </span>
                                )}
                                {s.capacityLiters && (
                                    <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-medium border border-sky-100">
                                        {s.capacityLiters}
                                    </span>
                                )}
                                {s.estimatedWeight && (
                                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                                        {s.estimatedWeight}
                                    </span>
                                )}
                                {s.nature === 'Inflamável / Risco NR-20' && (
                                    <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold border border-red-200">
                                        Risco / Inflamável
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-gray-500 line-clamp-3 mb-4">{s.description}</p>
                        </div>
                        
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-gray-400">
                                    <Clock size={16} className="mr-1.5" />
                                    <span className="text-xs font-medium">{s.duration || 'A combinar'}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-brand-primary">R$ {Number(s.price || 0).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                {s.costPrice ? (
                                    <span className="text-gray-500 font-medium">
                                        Custo: R$ {Number(s.costPrice).toFixed(2)}
                                    </span>
                                ) : null}
                                {((s.issPercent || 0) + (s.pisPercent || 0) + (s.cofinsPercent || 0) + (s.inssPercent || 0) + (s.otherTaxesPercent || 0)) > 0 && (
                                    <span className="bg-sky-50 text-sky-800 px-1.5 py-0.5 rounded font-bold border border-sky-200">
                                        Trib: {((s.issPercent || 0) + (s.pisPercent || 0) + (s.cofinsPercent || 0) + (s.inssPercent || 0) + (s.otherTaxesPercent || 0)).toFixed(1)}%
                                    </span>
                                )}
                                {(s.profitMarginPercent || 0) > 0 && (
                                    <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                                        Margem: {s.profitMarginPercent}%
                                    </span>
                                )}
                            </div>
                            
                            {s.videoUrl && (
                                <div className="flex items-center text-xs font-bold text-brand-secondary pt-1">
                                    <Video size={14} className="mr-1" /> VÍDEO SHOWCASE DISPONÍVEL
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {filteredServices.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-100">
                        <Briefcase size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Nenhum serviço cadastrado.</p>
                        <button 
                            onClick={handleOpenCreate}
                            className="mt-4 inline-flex items-center space-x-2 text-sm font-bold text-brand-primary hover:underline"
                        >
                            <Plus size={16} />
                            <span>Cadastrar o primeiro serviço</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
