import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import type { CheckoutForm, CheckoutFormErrors, PaymentMethod, CardBrand } from '../types';
import { 
    CreditCard, 
    QrCode, 
    FileText, 
    ShieldCheck, 
    Lock, 
    Truck, 
    Check, 
    ArrowLeft, 
    Info, 
    Zap, 
    Percent,
    AlertCircle,
    CheckCircle2,
    MapPin,
    AlertTriangle,
    Store,
    Clock,
    Compass
} from 'lucide-react';
import { 
    CARD_BRANDS, 
    detectCardBrand, 
    formatCardNumber, 
    formatCardExpiry, 
    formatDocument, 
    formatCEP, 
    formatPhone, 
    calculateInstallmentOptions 
} from '../lib/paymentHelper';
import { 
    calculateDistanceToStore, 
    evaluateShippingOptions, 
    getStoreDomicile, 
    StoreDomicile, 
    ShippingOption,
    checkProductShippingRestriction 
} from '../lib/shippingHelper';
import { sanitizeCustomerText } from '../lib/textHelper';
import { trackInitiateCheckout } from '../lib/analyticsTracker';
import { evaluateStoreStatus } from '../lib/storeOperatingHours';

interface CheckoutPageProps {
    onBackToMarketplace: () => void;
    onPlaceOrder: (formData: CheckoutForm, shippingCost: number) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBackToMarketplace, onPlaceOrder }) => {
    const { cartItems, totalPrice } = useCart();
    const storeStatus = evaluateStoreStatus();
    const [shippingCost, setShippingCost] = useState<number>(totalPrice >= 300 ? 0 : 19.90);
    const [shippingType, setShippingType] = useState<'standard' | 'express' | 'free'>(totalPrice >= 300 ? 'free' : 'standard');
    const [isLoadingCep, setIsLoadingCep] = useState(false);
    const [cepError, setCepError] = useState('');

    const [distanceResult, setDistanceResult] = useState<{
        distanceKm: number;
        isWithinLocalRadius: boolean;
        domicile: StoreDomicile;
        regionName: string;
    } | null>(null);

    const [selectedShippingOptionId, setSelectedShippingOptionId] = useState<string>('standard_carrier');

    const [formData, setFormData] = useState<CheckoutForm>({
        fullName: '',
        email: '',
        phone: '',
        document: '',
        cep: '',
        address: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        paymentMethod: 'pix',
        cardBrand: 'other',
        cardNumber: '',
        cardHolderName: '',
        cardExpiry: '',
        cardCvv: '',
        cardCpf: '',
        installments: 1,
    });

    const [errors, setErrors] = useState<CheckoutFormErrors>({});

    useEffect(() => {
        if (cartItems.length > 0) {
            trackInitiateCheckout(cartItems, totalPrice);
        }
    }, [cartItems, totalPrice]);

    // Avaliação dinâmica de frete comparando itens e domicílio da loja
    const shippingEvaluation = useMemo(() => {
        return evaluateShippingOptions(
            cartItems,
            distanceResult ? distanceResult.distanceKm : null,
            totalPrice
        );
    }, [cartItems, distanceResult, totalPrice]);

    // Manter sincronizada a opção de frete selecionada com as opções disponíveis
    useEffect(() => {
        const availableOptions = shippingEvaluation.options.filter(o => o.isAvailable);
        const current = shippingEvaluation.options.find(o => o.id === selectedShippingOptionId && o.isAvailable);
        
        if (!current && availableOptions.length > 0) {
            // Prioridade de seleção automática
            const preferred = availableOptions.find(o => o.id === 'local_client_carrier') ||
                              availableOptions.find(o => o.id === 'free_promo') ||
                              availableOptions.find(o => o.id === 'standard_carrier') ||
                              availableOptions[0];
            setSelectedShippingOptionId(preferred.id);
            setShippingCost(preferred.cost);
        } else if (current) {
            setShippingCost(current.cost);
        }
    }, [shippingEvaluation, selectedShippingOptionId]);

    // Cálculo do desconto Pix (5% sobre produtos)
    const pixDiscount = formData.paymentMethod === 'pix' ? totalPrice * 0.05 : 0;
    const finalTotal = Math.max(0, totalPrice - pixDiscount + shippingCost);

    // Opções de parcelamento do cartão
    const installmentOptions = useMemo(() => {
        return calculateInstallmentOptions(totalPrice + shippingCost, 12, 6);
    }, [totalPrice, shippingCost]);

    // Detecção da bandeira em tempo real
    const detectedBrand = useMemo(() => {
        if (!formData.cardNumber) return 'other';
        return detectCardBrand(formData.cardNumber);
    }, [formData.cardNumber]);

    useEffect(() => {
        setFormData(prev => ({ ...prev, cardBrand: detectedBrand }));
    }, [detectedBrand]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'document' || name === 'cardCpf') {
            formattedValue = formatDocument(value);
        } else if (name === 'cep') {
            formattedValue = formatCEP(value);
        } else if (name === 'phone') {
            formattedValue = formatPhone(value);
        } else if (name === 'cardNumber') {
            formattedValue = formatCardNumber(value);
        } else if (name === 'cardExpiry') {
            formattedValue = formatCardExpiry(value);
        } else if (name === 'cardCvv') {
            formattedValue = value.replace(/\D/g, '').slice(0, 4);
        }

        setFormData(prev => ({ ...prev, [name]: formattedValue }));

        // Se o CEP atingiu os 8 dígitos (formato 00000-000), já inicia busca
        if (name === 'cep' && formattedValue.replace(/\D/g, '').length === 8) {
            triggerCepLookup(formattedValue.replace(/\D/g, ''));
        }

        // Limpar erro do campo ao digitar
        if (errors[name as keyof CheckoutFormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // Consulta de CEP e cálculo de distância em relação ao domicílio da loja
    const triggerCepLookup = async (cleanCep: string) => {
        setIsLoadingCep(true);
        setCepError('');
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await res.json();
            if (data.erro) {
                setCepError('CEP não encontrado. Por favor, preencha o endereço manualmente.');
            } else {
                setFormData(prev => ({
                    ...prev,
                    address: data.logradouro || prev.address,
                    neighborhood: data.bairro || prev.neighborhood,
                    city: data.localidade || prev.city,
                    state: data.uf || prev.state,
                }));

                // Comparação do endereço do cliente com o domicílio da nossa loja
                const distRes = await calculateDistanceToStore(cleanCep, {
                    city: data.localidade,
                    state: data.uf,
                    neighborhood: data.bairro,
                });
                setDistanceResult(distRes);
            }
        } catch {
            setCepError('Não foi possível autocompletar o CEP. Preencha manualmente.');
        } finally {
            setIsLoadingCep(false);
        }
    };

    // Consulta automática de CEP via ViaCEP onBlur
    const handleCepBlur = async () => {
        const cleanCep = formData.cep.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            await triggerCepLookup(cleanCep);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: CheckoutFormErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Informe seu nome completo.';
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Informe um e-mail válido.';
        if (!formData.phone || formData.phone.length < 14) newErrors.phone = 'Informe um telefone/WhatsApp válido.';
        if (!formData.document || formData.document.length < 14) newErrors.document = 'Informe um CPF/CNPJ válido.';
        if (!formData.cep || formData.cep.length < 9) newErrors.cep = 'Informe um CEP válido.';
        if (!formData.address.trim()) newErrors.address = 'Informe a rua / logradouro.';
        if (!formData.number.trim()) newErrors.number = 'Número obrigatório (ou S/N).';
        if (!formData.city.trim()) newErrors.city = 'Cidade obrigatória.';
        if (!formData.state.trim()) newErrors.state = 'Estado obrigatório.';

        if (formData.paymentMethod === 'credit_card') {
            if (!formData.cardNumber || formData.cardNumber.replace(/\D/g, '').length < 15) {
                newErrors.cardNumber = 'Número de cartão inválido.';
            }
            if (!formData.cardHolderName || formData.cardHolderName.trim().length < 4) {
                newErrors.cardHolderName = 'Nome impresso no cartão obrigatório.';
            }
            if (!formData.cardExpiry || formData.cardExpiry.length < 5) {
                newErrors.cardExpiry = 'Validade inválida (MM/AA).';
            }
            if (!formData.cardCvv || formData.cardCvv.length < 3) {
                newErrors.cardCvv = 'CVV inválido.';
            }
            if (!formData.cardCpf || formData.cardCpf.length < 14) {
                newErrors.cardCpf = 'CPF do titular obrigatório.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Bloqueio de segurança e proteção operacional fora do horário de funcionamento
        if (!storeStatus.isOpen) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (validateForm()) {
            onPlaceOrder(formData, shippingCost);
        } else {
            const firstErrorEl = document.querySelector('.text-red-500');
            firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <div className="bg-gray-50 py-10 min-h-screen">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Botão Voltar e Cabeçalho */}
                <div className="mb-6 flex items-center justify-between">
                    <button 
                        onClick={onBackToMarketplace} 
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-brand-primary transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Continuar Comprando
                    </button>

                    <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                        <Lock size={14} />
                        <span>Ambiente Seguro SSL 256-bit</span>
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 mb-6 text-center">
                    Finalização de Compra
                </h1>

                {/* AVISO OFICIAL DE HORÁRIO DE FUNCIONAMENTO E BLOQUEIO (QUARTA TAREFA) */}
                {!storeStatus.isOpen && (
                    <div className="mb-8 p-5 md:p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-50 to-orange-50 border-2 border-amber-400 text-amber-950 shadow-md space-y-3">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                                <Clock size={24} />
                            </div>
                            <div className="space-y-2 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="text-base font-extrabold uppercase tracking-wide text-amber-950 flex items-center gap-2">
                                        Loja Fechada no Momento • Atendimento e Expedição
                                    </h3>
                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                                        {storeStatus.currentDayName} • {storeStatus.currentTimeStr}
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed text-amber-900 font-medium">
                                    {storeStatus.noticeMessage}
                                </p>
                                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-800 font-semibold border-t border-amber-300/80">
                                    <span className="flex items-center gap-1.5">
                                        <Lock size={14} className="text-amber-700" />
                                        Finalização de pedidos suspensa fora do expediente para segurança e integridade das entregas.
                                    </span>
                                    <span className="text-amber-950 font-bold bg-white px-3 py-1 rounded-lg border border-amber-300 shadow-xs">
                                        Próxima abertura: {storeStatus.nextOpeningText}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Coluna Esquerda: Formulários de Dados e Pagamento (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* 1. Dados Pessoais */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm">
                                    1
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">Identificação do Cliente</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Nome Completo *</label>
                                    <input 
                                        type="text" 
                                        name="fullName" 
                                        placeholder="Ex: João da Silva" 
                                        value={formData.fullName} 
                                        onChange={handleInputChange} 
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.fullName ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`} 
                                    />
                                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">E-mail para Confirmação *</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        placeholder="seuemail@exemplo.com" 
                                        value={formData.email} 
                                        onChange={handleInputChange} 
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.email ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`} 
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Telefone / WhatsApp *</label>
                                    <input 
                                        type="text" 
                                        name="phone" 
                                        placeholder="(11) 99999-9999" 
                                        value={formData.phone} 
                                        onChange={handleInputChange} 
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.phone ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`} 
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">CPF ou CNPJ (para emissão de Nota Fiscal) *</label>
                                    <input 
                                        type="text" 
                                        name="document" 
                                        placeholder="000.000.000-00" 
                                        value={formData.document} 
                                        onChange={handleInputChange} 
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.document ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`} 
                                    />
                                    {errors.document && <p className="text-red-500 text-xs mt-1">{errors.document}</p>}
                                </div>
                            </div>
                        </div>

                        {/* 2. Endereço de Entrega */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm">
                                    2
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">Endereço de Entrega</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">CEP *</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            name="cep" 
                                            placeholder="00000-000" 
                                            value={formData.cep} 
                                            onChange={handleInputChange} 
                                            onBlur={handleCepBlur}
                                            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.cep ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`} 
                                        />
                                        {isLoadingCep && (
                                            <span className="absolute right-3 top-3 text-xs text-brand-primary animate-pulse">Buscando...</span>
                                        )}
                                    </div>
                                    {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep}</p>}
                                    {cepError && <p className="text-amber-600 text-xs mt-1">{cepError}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Rua / Logradouro *</label>
                                    <input 
                                        type="text" 
                                        name="address" 
                                        placeholder="Ex: Av. Paulista" 
                                        value={formData.address} 
                                        onChange={handleInputChange} 
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.address ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`} 
                                    />
                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Número *</label>
                                    <input 
                                        type="text" 
                                        name="number" 
                                        placeholder="123 ou S/N" 
                                        value={formData.number} 
                                        onChange={handleInputChange} 
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.number ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`} 
                                    />
                                    {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Complemento</label>
                                    <input 
                                        type="text" 
                                        name="complement" 
                                        placeholder="Apto 42, Bloco B" 
                                        value={formData.complement} 
                                        onChange={handleInputChange} 
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Bairro</label>
                                    <input 
                                        type="text" 
                                        name="neighborhood" 
                                        placeholder="Bela Vista" 
                                        value={formData.neighborhood || ''} 
                                        onChange={handleInputChange} 
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary" 
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Cidade *</label>
                                    <input 
                                        type="text" 
                                        name="city" 
                                        placeholder="São Paulo" 
                                        value={formData.city} 
                                        onChange={handleInputChange} 
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.city ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`} 
                                    />
                                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Estado (UF) *</label>
                                    <input 
                                        type="text" 
                                        name="state" 
                                        placeholder="SP" 
                                        maxLength={2}
                                        value={formData.state} 
                                        onChange={handleInputChange} 
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.state ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`} 
                                    />
                                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                </div>
                            </div>

                            {/* Informações de Comparação de Domicílio & Raio Logístico de 15km */}
                            <div className="pt-2 border-t border-gray-100 space-y-3">
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                    <div className="flex items-start gap-2.5">
                                        <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0 mt-0.5">
                                            <Store size={16} />
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-800 block">
                                                Domicílio da Loja (Origem do Envio):
                                            </span>
                                            <span className="text-slate-600">
                                                Ponto Chave do Lar • Av. Paulista, 1000, Bela Vista - São Paulo / SP (CEP: 01310-100)
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shrink-0 self-start sm:self-center">
                                        <Compass size={14} className="text-brand-primary" />
                                        <span className="font-bold text-slate-700">
                                            {distanceResult ? `${distanceResult.distanceKm} km do nosso domicílio` : 'Aguardando CEP'}
                                        </span>
                                    </div>
                                </div>

                                {/* Status de Distância do Raio de 15km */}
                                {distanceResult && (
                                    <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                                        distanceResult.isWithinLocalRadius
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                            : 'bg-amber-50 border-amber-200 text-amber-900'
                                    }`}>
                                        {distanceResult.isWithinLocalRadius ? (
                                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                        )}
                                        <div className="leading-relaxed">
                                            {distanceResult.isWithinLocalRadius ? (
                                                <>
                                                    <strong>Endereço dentro do raio de até 15 km ({distanceResult.distanceKm} km):</strong>{' '}
                                                    Atendimento local ativo para todos os itens, incluindo tubos de 3m/6m, lâmpadas compridas e inflamáveis. O frete é por conta do cliente, com entrega no prazo da transportadora parceira local.
                                                </>
                                            ) : (
                                                <>
                                                    <strong>Endereço fora do raio de 15 km ({distanceResult.distanceKm} km):</strong>{' '}
                                                    Para ferramentas, utilidades e itens de tamanho convencional, o envio ocorre normalmente por transportadora nacional. Produtos de grande porte (tubos 3m/6m) ou inflamáveis necessitam de retirada no balcão da loja.
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Alerta se houver produtos restritos no carrinho */}
                                {shippingEvaluation.hasRestrictedItems && (
                                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
                                        <div className="flex items-center gap-2 font-bold text-rose-900">
                                            <AlertCircle size={16} className="text-rose-600" />
                                            <span>Produtos com Regra Logística Especial Detectados</span>
                                        </div>
                                        <p className="text-rose-800 leading-relaxed">
                                            Seu carrinho possui itens com regra especial: entrega num raio de até 15 km do nosso domicílio com frete por conta do cliente, ou retirada gratuita no nosso PONTO DE APOIO.
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {shippingEvaluation.restrictedProducts.map(rp => (
                                                <span key={rp.product.id} className="bg-white/80 border border-rose-300 px-2 py-0.5 rounded text-[11px] font-semibold text-rose-900">
                                                    {sanitizeCustomerText(rp.product.name)} ({rp.restriction?.warningMessage || 'Restrição logística'})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Forma de Pagamento & Bandeiras */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm">
                                        3
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900">Forma de Pagamento</h2>
                                </div>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Todas as bandeiras aceitas
                                </span>
                            </div>

                            {/* Seletor das Opções de Pagamento */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* PIX */}
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'pix' }))}
                                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                                        formData.paymentMethod === 'pix'
                                            ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                                            <QrCode size={20} />
                                        </div>
                                        <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                                            5% OFF
                                        </span>
                                    </div>
                                    <p className="font-bold text-sm text-slate-900">PIX Instantâneo</p>
                                    <p className="text-[11px] text-emerald-700 font-medium">Aprovação Imediata</p>
                                </button>

                                {/* Cartão de Crédito */}
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'credit_card' }))}
                                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                                        formData.paymentMethod === 'credit_card'
                                            ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-600/20'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                                            <CreditCard size={20} />
                                        </div>
                                        <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                            Até 12x
                                        </span>
                                    </div>
                                    <p className="font-bold text-sm text-slate-900">Cartão de Crédito</p>
                                    <p className="text-[11px] text-slate-500">Até 6x sem juros</p>
                                </button>

                                {/* Boleto Bancário */}
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'boleto' }))}
                                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                                        formData.paymentMethod === 'boleto'
                                            ? 'border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                                            <FileText size={20} />
                                        </div>
                                    </div>
                                    <p className="font-bold text-sm text-slate-900">Boleto Bancário</p>
                                    <p className="text-[11px] text-slate-500">Vencimento em 3 dias</p>
                                </button>
                            </div>

                            {/* Detalhes do Pagamento Selecionado */}

                            {/* CASO 1: PIX */}
                            {formData.paymentMethod === 'pix' && (
                                <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-emerald-600 text-white rounded-xl flex-shrink-0">
                                            <Zap size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-emerald-950">Desconto Especial de 5% Aplicado!</h4>
                                            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                                                Após clicar em finalizar, você receberá o QR Code e a chave Pix Copia e Cola para pagar pelo aplicativo do seu banco. O pedido é liberado instantaneamente.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CASO 2: CARTÃO DE CRÉDITO */}
                            {formData.paymentMethod === 'credit_card' && (
                                <div className="space-y-4 pt-2">
                                    {/* Bandeiras Suportadas */}
                                    <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                        <span className="text-xs font-bold text-gray-600">Bandeiras:</span>
                                        <div className="flex items-center gap-2">
                                            {CARD_BRANDS.map(b => (
                                                <span 
                                                    key={b.brand} 
                                                    className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                                        detectedBrand === b.brand 
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                                            : 'bg-white text-gray-700 border-gray-200'
                                                    }`}
                                                >
                                                    {b.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Número do Cartão *</label>
                                        <input 
                                            type="text" 
                                            name="cardNumber" 
                                            placeholder="0000 0000 0000 0000" 
                                            value={formData.cardNumber} 
                                            onChange={handleInputChange} 
                                            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.cardNumber ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`} 
                                        />
                                        {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Nome Impresso no Cartão *</label>
                                        <input 
                                            type="text" 
                                            name="cardHolderName" 
                                            placeholder="Como está gravado no cartão" 
                                            value={formData.cardHolderName} 
                                            onChange={handleInputChange} 
                                            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.cardHolderName ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`} 
                                        />
                                        {errors.cardHolderName && <p className="text-red-500 text-xs mt-1">{errors.cardHolderName}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Validade *</label>
                                            <input 
                                                type="text" 
                                                name="cardExpiry" 
                                                placeholder="MM/AA" 
                                                value={formData.cardExpiry} 
                                                onChange={handleInputChange} 
                                                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-mono text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.cardExpiry ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`} 
                                            />
                                            {errors.cardExpiry && <p className="text-red-500 text-xs mt-1">{errors.cardExpiry}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">CVV / Cód. Seg. *</label>
                                            <input 
                                                type="password" 
                                                name="cardCvv" 
                                                placeholder="123" 
                                                maxLength={4}
                                                value={formData.cardCvv} 
                                                onChange={handleInputChange} 
                                                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-mono text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.cardCvv ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`} 
                                            />
                                            {errors.cardCvv && <p className="text-red-500 text-xs mt-1">{errors.cardCvv}</p>}
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-xs font-bold text-gray-700 mb-1">CPF do Titular *</label>
                                            <input 
                                                type="text" 
                                                name="cardCpf" 
                                                placeholder="000.000.000-00" 
                                                value={formData.cardCpf} 
                                                onChange={handleInputChange} 
                                                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.cardCpf ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`} 
                                            />
                                            {errors.cardCpf && <p className="text-red-500 text-xs mt-1">{errors.cardCpf}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Opções de Parcelamento *</label>
                                        <select 
                                            name="installments" 
                                            value={formData.installments || 1} 
                                            onChange={(e) => setFormData(prev => ({ ...prev, installments: Number(e.target.value) }))}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                        >
                                            {installmentOptions.map(opt => (
                                                <option key={opt.installments} value={opt.installments}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* CASO 3: BOLETO */}
                            {formData.paymentMethod === 'boleto' && (
                                <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-amber-600 text-white rounded-xl flex-shrink-0">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-amber-950">Pagamento via Boleto Bancário</h4>
                                            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                                                O boleto tem vencimento em 3 dias úteis e pode ser pago em qualquer agência bancária, lotérica ou internet banking. A compensação leva de 1 a 2 dias úteis.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Coluna Direita: Resumo do Pedido, Frete e Finalizar (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm sticky top-24 space-y-6">
                            <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-gray-100 pb-4">
                                Resumo do Pedido
                            </h2>

                            {/* Itens do Carrinho */}
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 text-xs py-2 border-b border-gray-50 last:border-0">
                                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-xl border border-gray-200 flex-shrink-0" />
                                        <div className="flex-grow min-w-0">
                                            <p className="font-bold text-slate-900 truncate">{sanitizeCustomerText(item.name)}</p>
                                            {((item as any).pickupOrLocal15kmOnly || (item as any).isSpecialDelivery) && (
                                                <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-semibold inline-block">
                                                    Ponto de Apoio / 15km
                                                </span>
                                            )}
                                            <span className="text-gray-400 text-[11px] block">Qtd: {item.quantity} x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}</span>
                                        </div>
                                        <span className="font-bold text-slate-900 whitespace-nowrap">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Opções de Frete Dinâmicas (Calculadas com base na distância ao domicílio e produtos) */}
                            <div className="space-y-2 border-t border-gray-100 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-700">Modalidade de Envio:</span>
                                    {distanceResult && (
                                        <span className="text-[11px] font-semibold text-brand-primary">
                                            Distância: {distanceResult.distanceKm} km
                                        </span>
                                    )}
                                </div>

                                {shippingEvaluation.options.map(option => {
                                    const isSelected = selectedShippingOptionId === option.id;
                                    const isDisabled = !option.isAvailable;

                                    return (
                                        <div
                                            key={option.id}
                                            onClick={() => {
                                                if (!isDisabled) {
                                                    setSelectedShippingOptionId(option.id);
                                                    setShippingCost(option.cost);
                                                }
                                            }}
                                            className={`p-3 rounded-xl border transition-all ${
                                                isDisabled
                                                    ? 'opacity-60 bg-gray-50 border-dashed border-gray-200 cursor-not-allowed'
                                                    : isSelected
                                                    ? 'border-brand-primary bg-amber-50/40 ring-1 ring-brand-primary/20 cursor-pointer shadow-xs'
                                                    : 'border-gray-200 hover:border-gray-300 cursor-pointer bg-white'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-start gap-2.5">
                                                    <input
                                                        type="radio"
                                                        name="shipping"
                                                        id={`shipping-${option.id}`}
                                                        checked={isSelected}
                                                        disabled={isDisabled}
                                                        onChange={() => {
                                                            setSelectedShippingOptionId(option.id);
                                                            setShippingCost(option.cost);
                                                        }}
                                                        className="mt-0.5 text-brand-primary focus:ring-brand-primary"
                                                    />
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <span className={`text-xs font-bold ${isDisabled ? 'text-gray-500' : 'text-slate-900'}`}>
                                                                {option.name}
                                                            </span>
                                                            {option.badge && (
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                                    option.id === 'local_client_carrier'
                                                                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                                                        : option.cost === 0
                                                                        ? 'bg-emerald-100 text-emerald-800'
                                                                        : 'bg-slate-100 text-slate-700'
                                                                }`}>
                                                                    {option.badge}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                                            {option.description}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={11} className="text-gray-400" />
                                                                {option.deadline}
                                                            </span>
                                                            {option.isFreightByClient && (
                                                                <span className="font-semibold text-amber-800">
                                                                    • Frete por conta do cliente
                                                                </span>
                                                            )}
                                                        </div>

                                                        {isDisabled && option.unavailableReason && (
                                                            <p className="text-[11px] text-rose-700 bg-rose-50/80 p-1.5 rounded border border-rose-200 mt-1.5 leading-tight">
                                                                {option.unavailableReason}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    {option.cost === 0 ? (
                                                        <span className="text-xs font-bold text-emerald-700">GRÁTIS</span>
                                                    ) : (
                                                        <span className={`text-xs font-bold ${isDisabled ? 'text-gray-400' : 'text-slate-900'}`}>
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(option.cost)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Totais */}
                            <div className="space-y-2 border-t border-gray-100 pt-4 text-xs">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal Produtos:</span>
                                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Frete:</span>
                                    <span>{shippingCost === 0 ? <strong className="text-emerald-600">Grátis</strong> : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shippingCost)}</span>
                                </div>
                                {pixDiscount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>Desconto Pix (5%):</span>
                                        <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pixDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-bold text-slate-900 border-t border-gray-100 pt-3">
                                    <span>Valor Total:</span>
                                    <span className="text-brand-primary text-xl">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalTotal)}
                                    </span>
                                </div>
                            </div>

                            {/* Botão de Finalização com Bloqueio Fora do Expediente */}
                            <button
                                type="submit"
                                disabled={!storeStatus.isOpen}
                                className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
                                    !storeStatus.isOpen
                                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300 shadow-none'
                                        : 'bg-brand-primary hover:bg-brand-dark text-white hover:shadow-xl'
                                }`}
                            >
                                <Lock size={16} />
                                <span>
                                    {!storeStatus.isOpen 
                                        ? `Loja Fechada • Disponível ${storeStatus.nextOpeningText}` 
                                        : 'Concluir Pedido com Segurança'}
                                </span>
                            </button>

                            {!storeStatus.isOpen && (
                                <p className="text-[11px] text-center text-amber-900 font-semibold bg-amber-50 p-2.5 rounded-xl border border-amber-200 leading-snug">
                                    A finalização e o pagamento estarão disponíveis no próximo horário comercial. Seus itens permanecem salvos no carrinho!
                                </p>
                            )}

                            {/* Selos de Confiança */}
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 text-center pt-2">
                                <div className="p-2 bg-gray-50 rounded-lg flex items-center justify-center gap-1">
                                    <ShieldCheck size={14} className="text-emerald-600" />
                                    <span>Garantia de 90 Dias</span>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-lg flex items-center justify-center gap-1">
                                    <CheckCircle2 size={14} className="text-blue-600" />
                                    <span>Nota Fiscal Eletrônica</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
