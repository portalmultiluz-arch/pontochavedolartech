import { Product } from '../types';

/**
 * Normaliza uma data ISO/string (YYYY-MM-DD) para timestamp às 00:00:00 ou 23:59:59
 */
function parseDateBoundary(dateStr?: string, isEnd = false): number | null {
    if (!dateStr || dateStr.trim() === '') return null;
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        if (isEnd) {
            d.setHours(23, 59, 59, 999);
        } else {
            d.setHours(0, 0, 0, 0);
        }
        return d.getTime();
    } catch {
        return null;
    }
}

/**
 * 1) Verifica se o produto está em promoção ativa considerando o período (Data A a Data B)
 */
export function getProductPromoDetails(product?: Product | null): {
    isPromoActive: boolean;
    promoPrice: number;
    originalPrice: number;
    discountPercent: number;
    periodLabel: string;
    isScheduledFuture: boolean;
    isExpired: boolean;
} {
    if (!product) {
        return { isPromoActive: false, promoPrice: 0, originalPrice: 0, discountPercent: 0, periodLabel: '', isScheduledFuture: false, isExpired: false };
    }

    const originalPrice = Number(product.price || 0);
    const promoPrice = Number(product.promoPrice || 0);
    const isPromoFlag = Boolean(product.isPromo);

    if (!isPromoFlag && promoPrice <= 0) {
        return { isPromoActive: false, promoPrice: originalPrice, originalPrice, discountPercent: 0, periodLabel: '', isScheduledFuture: false, isExpired: false };
    }

    const now = Date.now();
    const startTimestamp = parseDateBoundary(product.promoStartDate, false);
    const endTimestamp = parseDateBoundary(product.promoEndDate, true);

    let isScheduledFuture = false;
    let isExpired = false;
    let inDateRange = true;

    if (startTimestamp && now < startTimestamp) {
        inDateRange = false;
        isScheduledFuture = true;
    }

    if (endTimestamp && now > endTimestamp) {
        inDateRange = false;
        isExpired = true;
    }

    const isPromoActive = isPromoFlag && inDateRange && promoPrice > 0 && promoPrice < originalPrice;

    // Cálculo do percentual de desconto
    let discountPercent = product.promoDiscountPercent || 0;
    if (isPromoActive && originalPrice > 0 && promoPrice > 0) {
        discountPercent = Math.round(((originalPrice - promoPrice) / originalPrice) * 100);
    }

    let periodLabel = '';
    if (product.promoStartDate && product.promoEndDate) {
        periodLabel = `${formatDateBr(product.promoStartDate)} até ${formatDateBr(product.promoEndDate)}`;
    } else if (product.promoStartDate) {
        periodLabel = `A partir de ${formatDateBr(product.promoStartDate)}`;
    } else if (product.promoEndDate) {
        periodLabel = `Até ${formatDateBr(product.promoEndDate)}`;
    }

    return {
        isPromoActive,
        promoPrice: isPromoActive ? promoPrice : originalPrice,
        originalPrice,
        discountPercent: isPromoActive ? discountPercent : 0,
        periodLabel,
        isScheduledFuture,
        isExpired
    };
}

/**
 * 2) Verifica se o produto está descontinuado considerando o período (Data A a Data B)
 */
export function getProductDiscontinuedDetails(product?: Product | null): {
    isDiscontinued: boolean;
    periodLabel: string;
    reason?: string;
    isScheduledFuture: boolean;
} {
    if (!product || !product.isDiscontinued) {
        return { isDiscontinued: false, periodLabel: '', isScheduledFuture: false };
    }

    const now = Date.now();
    const startTimestamp = parseDateBoundary(product.discontinuedStartDate, false);
    const endTimestamp = parseDateBoundary(product.discontinuedEndDate, true);

    let isScheduledFuture = false;
    let inDateRange = true;

    if (startTimestamp && now < startTimestamp) {
        inDateRange = false;
        isScheduledFuture = true;
    }

    if (endTimestamp && now > endTimestamp) {
        inDateRange = false;
    }

    let periodLabel = '';
    if (product.discontinuedStartDate && product.discontinuedEndDate) {
        periodLabel = `${formatDateBr(product.discontinuedStartDate)} a ${formatDateBr(product.discontinuedEndDate)}`;
    } else if (product.discontinuedStartDate) {
        periodLabel = `Desde ${formatDateBr(product.discontinuedStartDate)}`;
    } else if (product.discontinuedEndDate) {
        periodLabel = `Até ${formatDateBr(product.discontinuedEndDate)}`;
    }

    return {
        isDiscontinued: inDateRange,
        periodLabel,
        reason: product.discontinuedReason,
        isScheduledFuture
    };
}

/**
 * 3) Verifica se o produto está fora de comercialização considerando o período (Data A a Data B)
 */
export function getProductOffMarketDetails(product?: Product | null): {
    isOffMarket: boolean;
    periodLabel: string;
    reason?: string;
    isScheduledFuture: boolean;
} {
    if (!product || !product.isOffMarket) {
        return { isOffMarket: false, periodLabel: '', isScheduledFuture: false };
    }

    const now = Date.now();
    const startTimestamp = parseDateBoundary(product.offMarketStartDate, false);
    const endTimestamp = parseDateBoundary(product.offMarketEndDate, true);

    let isScheduledFuture = false;
    let inDateRange = true;

    if (startTimestamp && now < startTimestamp) {
        inDateRange = false;
        isScheduledFuture = true;
    }

    if (endTimestamp && now > endTimestamp) {
        inDateRange = false;
    }

    let periodLabel = '';
    if (product.offMarketStartDate && product.offMarketEndDate) {
        periodLabel = `${formatDateBr(product.offMarketStartDate)} a ${formatDateBr(product.offMarketEndDate)}`;
    } else if (product.offMarketStartDate) {
        periodLabel = `Desde ${formatDateBr(product.offMarketStartDate)}`;
    } else if (product.offMarketEndDate) {
        periodLabel = `Até ${formatDateBr(product.offMarketEndDate)}`;
    }

    return {
        isOffMarket: inDateRange,
        periodLabel,
        reason: product.offMarketReason,
        isScheduledFuture
    };
}

/**
 * Retorna o preço de venda efetivo (com promoção ativa aplicada se houver)
 */
export function getEffectiveProductPrice(product: Product): number {
    const promo = getProductPromoDetails(product);
    return promo.isPromoActive ? promo.promoPrice : Number(product.price || 0);
}

export interface ProductSalesEligibility {
    isEligible: boolean;
    isStoreVisible: boolean;
    hasValidPrice: boolean;
    hasStock: boolean;
    isOffMarket: boolean;
    isActive: boolean;
    reasons: string[];
    badgeText: string;
    badgeVariant: 'ready' | 'hidden' | 'blocked' | 'draft';
}

/**
 * Avalia se o produto atende às condições comerciais configuradas para venda
 */
export function getProductSalesEligibility(product?: Product | null): ProductSalesEligibility {
    if (!product) {
        return {
            isEligible: false,
            isStoreVisible: false,
            hasValidPrice: false,
            hasStock: false,
            isOffMarket: false,
            isActive: false,
            reasons: ['Produto não encontrado'],
            badgeText: 'Indisponível',
            badgeVariant: 'blocked'
        };
    }

    const isActive = product.isActive !== false;
    const price = Number(product.price || 0);
    const hasValidPrice = price > 0;
    const stock = Number(product.stock || 0);
    const hasStock = stock > 0;
    const offMarket = getProductOffMarketDetails(product);
    const isOffMarket = offMarket.isOffMarket;

    // Determina se o produto está configurado para exibição na vitrine da loja
    let isStoreVisible = false;
    if (product.showInStore === true) {
        isStoreVisible = true;
    } else if (product.showInStore === false) {
        isStoreVisible = false;
    } else {
        // Compatibilidade: itens importados ou com códigos da planilha/PDF padrão iniciam ocultos até liberação
        const isPdfPresetCode = product.code && ['1351','1352','1353','1354','1355','1356','1357','1358','1359','1360','1361','1362','1363'].includes(String(product.code).trim());
        if (product.isImported || isPdfPresetCode || product.supplierName === 'Distribuidora Multiluz Ferramentas') {
            isStoreVisible = false;
        } else {
            isStoreVisible = isActive && hasValidPrice;
        }
    }

    const reasons: string[] = [];

    if (!isActive) {
        reasons.push('Produto Desativado no Sistema');
    }
    if (!isStoreVisible) {
        reasons.push('Não ativo para exibição na página principal (Apenas Estoque Interno)');
    }
    if (!hasValidPrice) {
        reasons.push('Preço de venda não configurado (R$ 0,00)');
    }
    if (!hasStock) {
        reasons.push('Sem estoque disponível (0 unidades)');
    }
    if (isOffMarket) {
        reasons.push(`Fora de Comercialização ${offMarket.periodLabel ? `(${offMarket.periodLabel})` : ''}`);
    }

    // Se o lojista configurou explicitamente para exibir na vitrine (showInStore === true), permite exibição mesmo com estoque sob consulta/zero
    const isEligible = isActive && isStoreVisible && hasValidPrice && !isOffMarket && (product.showInStore === true || hasStock);

    let badgeText = 'Apto para Venda';
    let badgeVariant: 'ready' | 'hidden' | 'blocked' | 'draft' = 'ready';

    if (isEligible) {
        badgeText = 'Na Vitrine (Apto p/ Venda)';
        badgeVariant = 'ready';
    } else if (!isStoreVisible && isActive && hasValidPrice && hasStock && !isOffMarket) {
        badgeText = 'Não Ativo na Página Principal';
        badgeVariant = 'hidden';
    } else if (isOffMarket || !isActive) {
        badgeText = isOffMarket ? 'Fora de Comercialização' : 'Desativado';
        badgeVariant = 'blocked';
    } else {
        badgeText = !hasValidPrice ? 'Pendente Preço' : (!hasStock ? 'Estoque Zerado' : 'Pendente Revisão');
        badgeVariant = 'draft';
    }

    return {
        isEligible,
        isStoreVisible,
        hasValidPrice,
        hasStock,
        isOffMarket,
        isActive,
        reasons,
        badgeText,
        badgeVariant
    };
}

/**
 * Validação para exibição na Vitrine / Página Principal da Loja
 */
export function isProductEligibleForStorefront(product?: Product | null): boolean {
    if (!product) return false;
    const eligibility = getProductSalesEligibility(product);
    return eligibility.isEligible;
}

function formatDateBr(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const [year, month, day] = dateStr.split('-');
        if (year && month && day) {
            return `${day}/${month}/${year}`;
        }
        return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
        return dateStr;
    }
}
