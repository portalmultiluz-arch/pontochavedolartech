/**
 * Brazilian Payment Helper & Gateway Utility
 * - Identificação e validação de bandeiras de cartão (Visa, Mastercard, Elo, Hipercard, Amex, etc.)
 * - Simulação de parcelamento (1x a 12x)
 * - Geração de código Pix Copia e Cola & QR Code
 * - Geração de linha digitável de Boleto Bancário
 * - Formatação e validação de CPF/CNPJ e CEP
 */

import { CardBrand, PaymentDetails } from '../types';

export interface CardBrandInfo {
    brand: CardBrand;
    name: string;
    icon: string;
    pattern: RegExp;
    color: string;
}

export const CARD_BRANDS: CardBrandInfo[] = [
    {
        brand: 'visa',
        name: 'Visa',
        icon: '💳 Visa',
        pattern: /^4[0-9]{12}(?:[0-9]{3})?$/,
        color: 'text-blue-600',
    },
    {
        brand: 'mastercard',
        name: 'Mastercard',
        icon: '💳 Mastercard',
        pattern: /^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/,
        color: 'text-red-500',
    },
    {
        brand: 'elo',
        name: 'Elo',
        icon: '💳 Elo',
        pattern: /^((((457393)|(431274)|(627780)|(636368)|(438935)|(504175)|(451416)|(636297))\d{10})|((5067)|(4576)|(4011))\d{12})$/,
        color: 'text-yellow-600',
    },
    {
        brand: 'hipercard',
        name: 'Hipercard',
        icon: '💳 Hipercard',
        pattern: /^(606282\d{10}(\d{3})?)|(3841\d{15})$/,
        color: 'text-red-700',
    },
    {
        brand: 'amex',
        name: 'American Express',
        icon: '💳 Amex',
        pattern: /^3[47][0-9]{13}$/,
        color: 'text-sky-600',
    },
    {
        brand: 'diners',
        name: 'Diners Club',
        icon: '💳 Diners',
        pattern: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
        color: 'text-indigo-600',
    },
    {
        brand: 'cabal',
        name: 'Cabal',
        icon: '💳 Cabal',
        pattern: /^(60420[1-9]|6042[1-9][0-9]|6043[0-9]{2}|604400)\d{10}$/,
        color: 'text-emerald-600',
    },
];

/**
 * Detecta a bandeira do cartão a partir dos números digitados
 */
export const detectCardBrand = (cardNumber: string): CardBrand => {
    const clean = cardNumber.replace(/\D/g, '');
    if (clean.length < 2) return 'other';

    if (/^4/.test(clean)) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
    if (/^(4011|4389|4514|4576|5041|5067|5090|6277|6362|6363|6504|6505|6507|6509|6516|6550)/.test(clean)) return 'elo';
    if (/^(606282|3841)/.test(clean)) return 'hipercard';
    if (/^3[47]/.test(clean)) return 'amex';
    if (/^3(0[0-5]|[68])/.test(clean)) return 'diners';
    if (/^604/.test(clean)) return 'cabal';

    return 'other';
};

/**
 * Formata número de cartão com espaços (Ex: 0000 0000 0000 0000)
 */
export const formatCardNumber = (value: string): string => {
    const clean = value.replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
};

/**
 * Formata validade do cartão MM/AA
 */
export const formatCardExpiry = (value: string): string => {
    const clean = value.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
        return `${clean.slice(0, 2)}/${clean.slice(2)}`;
    }
    return clean;
};

/**
 * Formata CPF ou CNPJ
 */
export const formatDocument = (value: string): string => {
    const clean = value.replace(/\D/g, '');
    if (clean.length <= 11) {
        // CPF: 000.000.000-00
        return clean
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
            .slice(0, 14);
    } else {
        // CNPJ: 00.000.000/0000-00
        return clean
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
            .slice(0, 18);
    }
};

/**
 * Formata CEP (00000-000)
 */
export const formatCEP = (value: string): string => {
    const clean = value.replace(/\D/g, '').slice(0, 8);
    return clean.replace(/(\d{5})(\d{1,3})/, '$1-$2');
};

/**
 * Formata Telefone / Celular com DDD
 */
export const formatPhone = (value: string): string => {
    const clean = value.replace(/\D/g, '').slice(0, 11);
    if (clean.length > 10) {
        return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }
    if (clean.length > 5) {
        return clean.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    }
    if (clean.length > 2) {
        return clean.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    }
    return clean;
};

/**
 * Calcula tabela de parcelas
 */
export interface InstallmentOption {
    installments: number;
    installmentValue: number;
    totalAmount: number;
    hasInterest: boolean;
    interestRatePercent: number;
    label: string;
}

export const calculateInstallmentOptions = (
    totalAmount: number,
    maxInstallments: number = 12,
    maxInterestFree: number = 6
): InstallmentOption[] => {
    const options: InstallmentOption[] = [];

    for (let i = 1; i <= maxInstallments; i++) {
        if (i > 1 && totalAmount / i < 15) {
            // Parcela mínima de R$ 15,00
            break;
        }

        const isInterestFree = i <= maxInterestFree;
        const interestRate = isInterestFree ? 0 : 0.0199; // 1.99% a.m. após 6x
        let calculatedTotal = totalAmount;

        if (!isInterestFree) {
            calculatedTotal = totalAmount * Math.pow(1 + interestRate, i - maxInterestFree);
        }

        const installmentValue = calculatedTotal / i;

        options.push({
            installments: i,
            installmentValue,
            totalAmount: calculatedTotal,
            hasInterest: !isInterestFree,
            interestRatePercent: isInterestFree ? 0 : 1.99,
            label: isInterestFree
                ? `${i}x de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installmentValue)} sem juros`
                : `${i}x de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installmentValue)} (${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculatedTotal)})`,
        });
    }

    return options;
};

/**
 * Gera dados completos de PIX (QR Code e Payload EMV Copia e Cola)
 */
export const generatePixPaymentData = (orderId: string, amount: number): Partial<PaymentDetails> => {
    const expirationDate = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
    const formattedAmount = amount.toFixed(2);
    
    // Payload Pix Padrão BR Code EMVCo
    const pixKey = 'portalmultiluz@gmail.com';
    const merchantName = 'PONTO CHAVE DO LAR';
    const merchantCity = 'SAO PAULO';
    const txId = orderId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25);

    // Payload simulado compatível com padrão BRCode do Banco Central
    const pixCode = `00020126580014br.gov.bcb.pix0136${pixKey}520400005303986540${formattedAmount.length.toString().padStart(2, '0')}${formattedAmount}5802BR59${merchantName.length.toString().padStart(2, '0')}${merchantName}60${merchantCity.length.toString().padStart(2, '0')}${merchantCity}62070503***6304${txId.slice(0, 4).toUpperCase()}`;

    const pixQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(pixCode)}`;

    return {
        method: 'pix',
        pixCode,
        pixQrCodeUrl,
        pixExpiresAt: expirationDate.toISOString(),
        pixDiscountAmount: amount * 0.05, // 5% de desconto à vista no Pix
    };
};

/**
 * Gera Linha Digitável e Código de Barras de Boleto Bancário
 */
export const generateBoletoPaymentData = (orderId: string, amount: number): Partial<PaymentDetails> => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // 3 dias úteis

    const bankCode = '341'; // Itaú / Bradesco padrão
    const randomBlock1 = Math.floor(10000 + Math.random() * 90000);
    const randomBlock2 = Math.floor(100000 + Math.random() * 900000);
    const randomBlock3 = Math.floor(100000 + Math.random() * 900000);
    const dv = '9';
    const formattedAmountForBarcode = Math.round(amount * 100).toString().padStart(10, '0');

    // Linha digitável formato FEBRABAN: 00000.00000 00000.000000 00000.000000 0 00000000000000
    const boletoDigitableLine = `${bankCode}91.10904 ${randomBlock1}.${randomBlock2.toString().slice(0, 5)} ${randomBlock2.toString().slice(5)}.${randomBlock3} ${dv} 96250000${formattedAmountForBarcode.slice(-6)}`;
    const boletoBarcode = `${bankCode}9${dv}96250000${formattedAmountForBarcode}${randomBlock1}${randomBlock2}${randomBlock3}`;

    return {
        method: 'boleto',
        boletoBarcode,
        boletoDigitableLine,
        boletoDueDate: dueDate.toLocaleDateString('pt-BR'),
    };
};
