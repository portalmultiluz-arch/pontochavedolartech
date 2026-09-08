import React, { useState, useEffect } from 'react';
import type { ConfirmedOrder } from '../types';
import { 
    Sparkles, 
    ArrowRight, 
    ShieldCheck, 
    CheckCircle2, 
    QrCode, 
    Copy, 
    Check, 
    Printer, 
    Share2, 
    FileText, 
    CreditCard, 
    Clock, 
    PackageCheck,
    MessageCircle,
    ArrowLeft
} from 'lucide-react';
import { trackPurchase } from '../lib/analyticsTracker';
import { sanitizeCustomerText } from '../lib/textHelper';

interface OrderConfirmationPageProps {
    order: ConfirmedOrder;
    onBackToMarketplace: () => void;
    onOpenConsultancy?: (order: ConfirmedOrder) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ order, onBackToMarketplace, onOpenConsultancy }) => {
    const [copied, setCopied] = useState<string | null>(null);
    const isEligible = order.total >= 250;

    useEffect(() => {
        if (order) {
            trackPurchase(order);
        }
    }, [order]);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2500);
    };

    const handleShareWhatsApp = () => {
        const text = `Olá! Gostaria de acompanhar meu pedido #${order.id} no valor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}. Nome: ${order.customerInfo.fullName}`;
        window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(text)}`, '_blank');
    };

    const paymentDetails = order.paymentDetails;
    const isPix = order.customerInfo.paymentMethod === 'pix';
    const isBoleto = order.customerInfo.paymentMethod === 'boleto';
    const isCard = order.customerInfo.paymentMethod === 'credit_card' || order.customerInfo.paymentMethod === 'debit_card';

    return (
        <div className="bg-gray-50 py-12 min-h-screen">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 space-y-8">
                    {/* Header de Sucesso */}
                    <div className="text-center space-y-3">
                        <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
                            <CheckCircle2 size={44} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-900">
                            Pedido Realizado com Sucesso!
                        </h1>
                        <p className="text-slate-600 text-sm max-w-lg mx-auto">
                            Enviamos todos os detalhes da compra e atualizações de entrega para{' '}
                            <span className="font-semibold text-slate-900">{order.customerInfo.email}</span>.
                        </p>
                        <div className="inline-block bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-xl text-sm font-bold mt-2">
                            Pedido #{order.id}
                        </div>
                    </div>

                    {/* ÁREA DE PAGAMENTO ESPECÍFICA */}

                    {/* 1. SE PIX */}
                    {isPix && paymentDetails && (
                        <div className="p-6 md:p-8 bg-emerald-50/50 rounded-3xl border border-emerald-200/80 space-y-6">
                            <div className="flex items-center justify-between border-b border-emerald-200/60 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-600 text-white rounded-xl">
                                        <QrCode size={22} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base">Pague com PIX para Liberação Instantânea</h3>
                                        <p className="text-xs text-emerald-800">Abra o app do seu banco e escaneie o código abaixo</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold bg-emerald-600 text-white px-3 py-1 rounded-full animate-pulse">
                                    Aguardando Pagamento
                                </span>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
                                {paymentDetails.pixQrCodeUrl && (
                                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-emerald-200 flex-shrink-0 text-center">
                                        <img 
                                            src={paymentDetails.pixQrCodeUrl} 
                                            alt="QR Code Pix" 
                                            className="w-48 h-48 mx-auto"
                                        />
                                        <span className="text-[11px] text-gray-500 mt-2 block font-medium">QR Code Dinâmico</span>
                                    </div>
                                )}

                                <div className="flex-grow space-y-3 w-full">
                                    <label className="block text-xs font-bold text-slate-700">Código Pix Copia e Cola:</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={paymentDetails.pixCode || ''} 
                                            className="w-full px-4 py-3 bg-white border border-emerald-300 rounded-xl text-xs font-mono text-slate-700 focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleCopy(paymentDetails.pixCode || '', 'pix')}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
                                    >
                                        {copied === 'pix' ? <Check size={16} /> : <Copy size={16} />}
                                        <span>{copied === 'pix' ? 'Código Pix Copiado com Sucesso!' : 'Copiar Código Pix'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. SE BOLETO */}
                    {isBoleto && paymentDetails && (
                        <div className="p-6 md:p-8 bg-amber-50/50 rounded-3xl border border-amber-200/80 space-y-6">
                            <div className="flex items-center justify-between border-b border-amber-200/60 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-600 text-white rounded-xl">
                                        <FileText size={22} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base">Boleto Bancário Gerado</h3>
                                        <p className="text-xs text-amber-800">Vencimento em: {paymentDetails.boletoDueDate || '3 dias úteis'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-slate-700">Linha Digitável:</label>
                                <div className="p-3 bg-white rounded-xl border border-amber-200 font-mono text-xs text-slate-800 select-all">
                                    {paymentDetails.boletoDigitableLine}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => handleCopy(paymentDetails.boletoDigitableLine || '', 'boleto')}
                                        className="flex-grow py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
                                    >
                                        {copied === 'boleto' ? <Check size={16} /> : <Copy size={16} />}
                                        <span>{copied === 'boleto' ? 'Linha Digitável Copiada!' : 'Copiar Linha Digitável'}</span>
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="px-6 py-3 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
                                    >
                                        <Printer size={16} />
                                        <span>Imprimir Boleto</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. SE CARTÃO */}
                    {isCard && (
                        <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-200/80 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-600 text-white rounded-xl">
                                        <CreditCard size={22} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base">Pagamento Aprovado no Cartão</h3>
                                        <p className="text-xs text-blue-800">
                                            Bandeira: <strong className="uppercase">{order.customerInfo.cardBrand || 'Crédito'}</strong> • Em {order.customerInfo.installments || 1}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total / (order.customerInfo.installments || 1))}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold bg-emerald-600 text-white px-3 py-1 rounded-full">
                                    Pago & Aprovado
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Benefício Exclusivo Desbloqueado: Consultoria Técnica IA */}
                    {isEligible && onOpenConsultancy && (
                        <div className="p-6 md:p-8 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/5 rounded-3xl border border-amber-300 text-left">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-md flex-shrink-0">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <div className="space-y-2 flex-grow">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-base font-bold text-slate-900">
                                            🎉 Parabéns! Sua compra desbloqueou a Consultoria Técnica Especializada com IA
                                        </h3>
                                        <span className="text-xs bg-amber-500 text-slate-950 font-bold px-2.5 py-0.5 rounded-full">
                                            100% Gratuita
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Envie a descrição do seu projeto elétrico, iluminação, fechaduras digitais ou reforma. Nossa IA Especialista emitirá um laudo técnico completo baseado nas normas ABNT (NBR 5410 / NR-10).
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => onOpenConsultancy(order)}
                                        className="mt-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all inline-flex items-center gap-2"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        <span>Submeter Meu Projeto para Análise IA Agora</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resumo Detalhado dos Produtos e Endereço */}
                    <div className="border-t border-b border-gray-100 py-6 space-y-4">
                        <h2 className="text-lg font-bold font-serif text-slate-900">Itens Comprados</h2>
                        <div className="divide-y divide-gray-100">
                            {order.items.map(item => (
                                <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-3">
                                        <img src={item.imageUrl} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                                        <div>
                                            <p className="font-bold text-slate-900">{sanitizeCustomerText(item.name)}</p>
                                            <span className="text-gray-400">Quantidade: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <span className="font-bold text-slate-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Frete:</span>
                                <span>{order.shipping === 0 ? 'Grátis' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.shipping)}</span>
                            </div>
                            {order.discount ? (
                                <div className="flex justify-between text-emerald-600 font-bold">
                                    <span>Desconto:</span>
                                    <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.discount)}</span>
                                </div>
                            ) : null}
                            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-gray-100">
                                <span>Total Pago:</span>
                                <span className="text-brand-primary text-xl">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                                </span>
                            </div>
                        </div>

                        {/* Endereço de Entrega Cadastrado */}
                        <div className="pt-4 border-t border-gray-100 text-xs text-gray-600">
                            <p className="font-bold text-slate-800 mb-1">Endereço de Envio:</p>
                            <p>{order.customerInfo.address}, nº {order.customerInfo.number} {order.customerInfo.complement ? `(${order.customerInfo.complement})` : ''}</p>
                            <p>{order.customerInfo.neighborhood ? `${order.customerInfo.neighborhood} - ` : ''}{order.customerInfo.city}/{order.customerInfo.state} - CEP: {order.customerInfo.cep}</p>
                        </div>
                    </div>

                    {/* Ações Finais */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                        <button
                            onClick={onBackToMarketplace}
                            className="w-full sm:w-auto px-8 py-3.5 bg-brand-primary hover:bg-brand-dark text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            <span>Voltar à Loja</span>
                        </button>

                        <button
                            onClick={handleShareWhatsApp}
                            className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
                        >
                            <MessageCircle size={16} />
                            <span>Acompanhar via WhatsApp</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
