import React, { useState } from 'react';
import { 
    X, 
    Printer, 
    CheckCircle, 
    FileText, 
    Calendar, 
    DollarSign, 
    User, 
    Phone, 
    Mail, 
    Building, 
    Percent, 
    Sparkles, 
    Send, 
    Download, 
    MessageCircle, 
    Copy, 
    Check 
} from 'lucide-react';
import { motion } from 'motion/react';
import { CartItem, Customer, QuoteRecord } from '../../types';
import { createDocument, updateDocument } from '../../services/firebaseService';
import { generateQuotePDF, generateWhatsAppQuoteMessage, formatSafeDate } from '../../lib/pdfQuoteGenerator';

interface QuoteProposalModalProps {
    cartItems: CartItem[];
    customer?: Customer | null;
    initialCustomerName?: string;
    existingQuote?: QuoteRecord | null;
    onClose: () => void;
    onSaved?: (quote: QuoteRecord) => void;
}

export const QuoteProposalModal: React.FC<QuoteProposalModalProps> = ({
    cartItems,
    customer,
    initialCustomerName = '',
    existingQuote,
    onClose,
    onSaved,
}) => {
    const [customerName, setCustomerName] = useState(existingQuote?.customerName || customer?.name || initialCustomerName || 'Consumidor Balcão');
    const [customerDocument, setCustomerDocument] = useState(existingQuote?.customerDocument || customer?.document || '');
    const [customerPhone, setCustomerPhone] = useState(existingQuote?.customerPhone || customer?.phone || '');
    const [customerEmail, setCustomerEmail] = useState(existingQuote?.customerEmail || customer?.email || '');
    const [sellerName, setSellerName] = useState(existingQuote?.sellerName || 'Balcão / Atendimento');
    
    const [validityDays, setValidityDays] = useState<number>(existingQuote?.validityDays || 10);
    const [discountPercent, setDiscountPercent] = useState<number>(existingQuote?.discountPercent || 0);
    const [paymentTerms, setPaymentTerms] = useState<string>(
        existingQuote?.paymentTerms || 'À vista via PIX (5% desc.) ou Cartão em até 6x sem juros'
    );
    const [notes, setNotes] = useState<string>(
        existingQuote?.notes || 'Preços válidos durante o prazo da proposta. Materiais sujeitos à confirmação de lote/estoque no fechamento.'
    );

    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
    const [savedQuoteNumber, setSavedQuoteNumber] = useState(existingQuote?.quoteNumber || '');

    // Calculations
    const items = existingQuote?.items || cartItems;
    const subtotal = items.reduce((sum, it) => sum + ((it.price || 0) * (it.quantity || 1)), 0);
    const discountAmount = (subtotal * discountPercent) / 100;
    const total = Math.max(0, subtotal - discountAmount);

    const calculateValidUntil = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
    };

    const getQuoteCurrentObject = (): QuoteRecord => {
        const quoteNum = savedQuoteNumber || existingQuote?.quoteNumber || `ORC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
            id: existingQuote?.id || 'temp-id',
            quoteNumber: quoteNum,
            customerId: customer?.id || existingQuote?.customerId || undefined,
            customerName: customerName.trim() || 'Consumidor Balcão',
            customerDocument: customerDocument.trim() || undefined,
            customerPhone: customerPhone.trim() || undefined,
            customerEmail: customerEmail.trim() || undefined,
            items: items,
            subtotal,
            discountPercent,
            discountAmount,
            total,
            validityDays,
            validUntil: calculateValidUntil(validityDays),
            paymentTerms,
            notes,
            sellerName,
            status: existingQuote?.status || 'open',
            createdAt: existingQuote?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    };

    const handleSaveQuote = async (): Promise<QuoteRecord | null> => {
        if (items.length === 0) return null;
        setIsSaving(true);

        const quoteNumber = existingQuote?.quoteNumber || savedQuoteNumber || `ORC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const validUntil = calculateValidUntil(validityDays);

        const payload: Omit<QuoteRecord, 'id'> = {
            quoteNumber,
            customerId: customer?.id || existingQuote?.customerId || undefined,
            customerName: customerName.trim() || 'Consumidor Balcão',
            customerDocument: customerDocument.trim() || undefined,
            customerPhone: customerPhone.trim() || undefined,
            customerEmail: customerEmail.trim() || undefined,
            items: items,
            subtotal,
            discountPercent,
            discountAmount,
            total,
            validityDays,
            validUntil,
            paymentTerms,
            notes,
            sellerName,
            status: existingQuote?.status || 'open',
            createdAt: existingQuote?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            let record: QuoteRecord;
            if (existingQuote?.id) {
                await updateDocument('quotes', existingQuote.id, payload);
                record = { id: existingQuote.id, ...payload };
            } else {
                const docId = await createDocument('quotes', payload);
                record = { id: docId, ...payload };
            }
            setSavedQuoteNumber(quoteNumber);
            setSavedSuccess(true);
            if (onSaved) onSaved(record);
            return record;
        } catch (err: any) {
            console.error("Erro ao salvar orçamento:", err);
            alert("Erro ao gravar orçamento no banco de dados: " + (err.message || 'Tente novamente'));
            return null;
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadPDF = async () => {
        setIsGeneratingPdf(true);
        try {
            // Se ainda não salvou, grava primeiro
            let currentRecord = getQuoteCurrentObject();
            if (!savedSuccess && !existingQuote?.id) {
                const saved = await handleSaveQuote();
                if (saved) currentRecord = saved;
            }
            generateQuotePDF(currentRecord);
        } catch (err: any) {
            console.error("Erro ao gerar PDF:", err);
            alert("Erro ao gerar arquivo PDF: " + (err.message || 'Tente novamente'));
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleSendWhatsApp = async () => {
        let currentRecord = getQuoteCurrentObject();
        if (!savedSuccess && !existingQuote?.id) {
            const saved = await handleSaveQuote();
            if (saved) currentRecord = saved;
        }

        const encodedMsg = generateWhatsAppQuoteMessage(currentRecord);
        const cleanPhone = (customerPhone || '').replace(/\D/g, '');
        const url = cleanPhone.length >= 10 
            ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodedMsg}`
            : `https://api.whatsapp.com/send?text=${encodedMsg}`;
        
        window.open(url, '_blank');
    };

    const handlePrintWindow = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            >
                {/* Cabeçalho do Modal */}
                <div className="bg-slate-900 text-white p-5 px-6 flex justify-between items-center border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
                            <FileText size={22} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                                Emissão de Orçamento & Proposta Comercial
                            </h3>
                            <p className="text-xs text-amber-400 font-medium">
                                {savedQuoteNumber ? `Protocolo Salvo: ${savedQuoteNumber}` : 'Documento formal e prévia de proposta comercial'}
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Alerta de salvamento com sucesso */}
                    {savedSuccess && (
                        <div className="p-4 bg-green-50 border border-green-200 text-green-900 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={24} className="text-green-600 shrink-0" />
                                <div>
                                    <p className="font-bold text-sm text-green-900">Orçamento Gravado no Sistema com Sucesso!</p>
                                    <p className="text-xs text-green-700">Protocolo: <span className="font-mono font-bold bg-green-100 px-1.5 py-0.5 rounded">{savedQuoteNumber}</span>. Já disponível na aba de Orçamentos e pronto para download em PDF ou WhatsApp.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleDownloadPDF}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 shrink-0"
                            >
                                <Download size={14} />
                                <span>Baixar PDF Agora</span>
                            </button>
                        </div>
                    )}

                    {/* Formulário de Parâmetros da Proposta */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-200 text-xs">
                        <div className="space-y-1">
                            <label className="font-bold text-gray-700 flex items-center gap-1">
                                <User size={13} /> Nome do Cliente
                            </label>
                            <input 
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Nome completo ou Razão Social"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-bold text-gray-700 flex items-center gap-1">
                                <Phone size={13} /> Telefone / WhatsApp
                            </label>
                            <input 
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="(00) 00000-0000"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-bold text-gray-700 flex items-center gap-1">
                                <Building size={13} /> CPF / CNPJ
                            </label>
                            <input 
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                                value={customerDocument}
                                onChange={(e) => setCustomerDocument(e.target.value)}
                                placeholder="000.000.000-00"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-bold text-gray-700 flex items-center gap-1">
                                <Calendar size={13} /> Validade da Proposta (Dias)
                            </label>
                            <select 
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                                value={validityDays}
                                onChange={(e) => setValidityDays(Number(e.target.value))}
                            >
                                <option value={3}>3 dias corridos</option>
                                <option value={5}>5 dias corridos</option>
                                <option value={7}>7 dias corridos</option>
                                <option value={10}>10 dias corridos (Recomendado)</option>
                                <option value={15}>15 dias corridos</option>
                                <option value={30}>30 dias corridos</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="font-bold text-gray-700 flex items-center gap-1">
                                <Percent size={13} /> Desconto Comercial (%)
                            </label>
                            <input 
                                type="number"
                                min="0"
                                max="100"
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                                value={discountPercent}
                                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-bold text-gray-700 flex items-center gap-1">
                                <User size={13} /> Vendedor / Atendente
                            </label>
                            <input 
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                                value={sellerName}
                                onChange={(e) => setSellerName(e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-3 space-y-1">
                            <label className="font-bold text-gray-700">Condições de Pagamento da Proposta</label>
                            <input 
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                                value={paymentTerms}
                                onChange={(e) => setPaymentTerms(e.target.value)}
                                placeholder="Ex: À vista no PIX com 5% de desc. ou 3x sem juros"
                            />
                        </div>

                        <div className="md:col-span-3 space-y-1">
                            <label className="font-bold text-gray-700">Observações Gerais / Prazos de Entrega / Garantia</label>
                            <textarea 
                                rows={2}
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 resize-none font-medium"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* PRÉVIA DA PROPOSTA TIMBRADA (FORMATO IMPRESSÃO / PDF) */}
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-gray-200 shadow-sm font-sans print:shadow-none print:border-none">
                        {/* Cabeçalho da Empresa */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-900 gap-4">
                            <div>
                                <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
                                    Ponto Chave <span className="text-amber-600">do Lar</span>
                                </h1>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">
                                    Materiais de Construção, Iluminação, Elétrica & Design
                                </p>
                                <p className="text-[11px] text-gray-400 mt-1">
                                    CNPJ: 00.000.000/0001-00 • Telefone: (11) 99999-9999 • Atendimento Balcão
                                </p>
                            </div>
                            <div className="sm:text-right bg-amber-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-none border-amber-200 w-full sm:w-auto">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-md">
                                    Orçamento Comercial
                                </span>
                                <p className="text-lg font-mono font-bold text-slate-900 mt-1">
                                    {savedQuoteNumber || existingQuote?.quoteNumber || 'ORC-2026-NOVO'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Emissão: {formatSafeDate(existingQuote?.createdAt || new Date())}
                                </p>
                                <p className="text-xs font-bold text-amber-700">
                                    Válido até: {formatSafeDate(calculateValidUntil(validityDays))} ({validityDays} dias)
                                </p>
                            </div>
                        </div>

                        {/* Dados do Cliente */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-gray-200 text-xs">
                            <div>
                                <span className="text-gray-400 block font-semibold uppercase text-[10px]">Cliente / Solicitante:</span>
                                <span className="font-bold text-gray-900 text-sm">{customerName}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-semibold uppercase text-[10px]">CPF / CNPJ:</span>
                                <span className="font-bold text-gray-800">{customerDocument || 'Não informado'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-semibold uppercase text-[10px]">Telefone / WhatsApp:</span>
                                <span className="font-bold text-gray-800">{customerPhone || 'Não informado'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-semibold uppercase text-[10px]">Vendedor Responsável:</span>
                                <span className="font-bold text-gray-800">{sellerName}</span>
                            </div>
                        </div>

                        {/* Tabela de Itens */}
                        <div className="py-4">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                                        <th className="pb-2">Item / Descrição do Produto</th>
                                        <th className="pb-2 text-center">Qtd</th>
                                        <th className="pb-2 text-right">Preço Unit.</th>
                                        <th className="pb-2 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/60">
                                            <td className="py-2.5 pr-2">
                                                <div className="font-bold text-gray-900">
                                                    {item.code ? `[${item.code}] ` : ''}{item.name}
                                                </div>
                                                {item.voltage && (
                                                    <span className="text-[10px] text-gray-400">Tensão: {item.voltage} • </span>
                                                )}
                                                {item.dimensionsSize && (
                                                    <span className="text-[10px] text-gray-400">Dimensões: {item.dimensionsSize}</span>
                                                )}
                                            </td>
                                            <td className="py-2.5 text-center font-bold text-gray-800">{item.quantity || 1}</td>
                                            <td className="py-2.5 text-right text-gray-600">R$ {Number(item.price || 0).toFixed(2)}</td>
                                            <td className="py-2.5 text-right font-bold text-slate-900">
                                                R$ {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Resumo Financeiro da Proposta */}
                        <div className="border-t-2 border-slate-900 pt-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="space-y-2 text-xs max-w-md">
                                <div>
                                    <span className="font-bold text-gray-700">Forma de Pagamento Proposta:</span>
                                    <p className="text-gray-600">{paymentTerms}</p>
                                </div>
                                {notes && (
                                    <div>
                                        <span className="font-bold text-gray-700">Termos & Garantia:</span>
                                        <p className="text-gray-500 text-[11px] leading-relaxed">{notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="w-full sm:w-64 space-y-1.5 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-200">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal dos Produtos:</span>
                                    <span>R$ {subtotal.toFixed(2)}</span>
                                </div>
                                {discountPercent > 0 && (
                                    <div className="flex justify-between text-red-700 font-bold">
                                        <span>Desconto Comercial ({discountPercent}%):</span>
                                        <span>- R$ {discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-bold text-slate-900 border-t border-gray-200 pt-2">
                                    <span>Total Geral:</span>
                                    <span className="text-amber-800 font-serif text-lg">R$ {total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Termo de Aceite e Assinaturas */}
                        <div className="mt-8 pt-6 border-t border-dashed border-gray-300 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
                            <div className="space-y-2">
                                <div className="border-b border-gray-400 w-3/4 mx-auto pt-6"></div>
                                <p className="font-bold text-gray-800">{sellerName}</p>
                                <p className="text-[10px] text-gray-400 uppercase">Ponto Chave do Lar</p>
                            </div>
                            <div className="space-y-2">
                                <div className="border-b border-gray-400 w-3/4 mx-auto pt-6"></div>
                                <p className="font-bold text-gray-800">{customerName}</p>
                                <p className="text-[10px] text-gray-400 uppercase">De Acordo / Assinatura do Cliente</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rodapé de Ações */}
                <div className="bg-gray-50 p-4 px-6 border-t border-gray-200 flex flex-wrap justify-between items-center gap-3 shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-5 py-3 bg-white border border-gray-300 text-gray-700 rounded-2xl font-bold text-xs hover:bg-gray-100"
                    >
                        Fechar
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Enviar WhatsApp */}
                        <button 
                            onClick={handleSendWhatsApp}
                            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                            title="Enviar orçamento formatado no WhatsApp do cliente"
                        >
                            <MessageCircle size={16} />
                            <span>WhatsApp</span>
                        </button>

                        {/* Gravar no Banco */}
                        <button 
                            onClick={handleSaveQuote}
                            disabled={isSaving}
                            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <CheckCircle size={16} />
                            <span>{isSaving ? 'Gravando...' : 'Salvar no Histórico'}</span>
                        </button>

                        {/* Baixar PDF Oficial */}
                        <button 
                            onClick={handleDownloadPDF}
                            disabled={isGeneratingPdf}
                            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-bold text-xs shadow-xl transition-all flex items-center gap-2"
                            title="Baixar arquivo .PDF formal timbrado no computador"
                        >
                            <Download size={16} />
                            <span>{isGeneratingPdf ? 'Gerando PDF...' : 'Baixar PDF Oficial'}</span>
                        </button>

                        {/* Imprimir */}
                        <button 
                            onClick={handlePrintWindow}
                            className="px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                        >
                            <Printer size={16} />
                            <span>Imprimir</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

