/**
 * Brazilian Shipping & Logistics Rule Engine
 * Ponto Chave do Lar
 * 
 * Regras implementadas:
 * 1. Comparação do endereço/CEP do cliente com o domicílio da loja.
 * 2. Raio máximo de 15 km do domicílio para produtos com restrição logística
 *    (tubos de 6m/3m, lâmpadas fluorescentes tubulares compridas, inflamáveis como querosene/solventes).
 * 3. Frete por conta do cliente dentro do prazo da transportadora.
 * 4. Alerta claro e opção de Retirada no Balcão da Loja para clientes além de 15 km.
 */

import { Product, CartItem, SupportPoint } from '../types';

export interface StoreDomicile {
    name: string;
    tradeName: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    lat: number;
    lng: number;
    maxLocalRadiusKm: number; // 15 km
}

export const DEFAULT_STORE_DOMICILE: StoreDomicile = {
    name: 'Ponto Chave do Lar Ltda.',
    tradeName: 'Ponto Chave do Lar',
    street: 'Av. Paulista',
    number: '1000',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    cep: '01310-100',
    lat: -23.5651,
    lng: -46.6524,
    maxLocalRadiusKm: 15,
};

export const DEFAULT_SUPPORT_POINTS: SupportPoint[] = [
    {
        id: 'ponto_apoio_matriz',
        name: 'Ponto de Apoio Principal (Matriz)',
        tradeName: 'Ponto Chave do Lar - Matriz',
        street: 'Av. Paulista',
        number: '1000',
        complement: 'Loja / Galpão de Apoio',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        cep: '01310-100',
        phone: '(11) 99999-9999',
        whatsapp: '5511999999999',
        lat: -23.5651,
        lng: -46.6524,
        maxLocalRadiusKm: 15,
        active: true,
        isMain: true,
        operatingHours: 'Segunda a Sexta: 08h às 18h • Sábado: 08h às 13h',
        notes: 'Ponto de apoio central para retirada e expedição em raio de até 15 km.',
    }
];

export function getSupportPoints(): SupportPoint[] {
    try {
        const stored = localStorage.getItem('ponto_chave_support_points');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch {
        // Fallback para padrão
    }
    return DEFAULT_SUPPORT_POINTS;
}

export function saveSupportPoints(points: SupportPoint[]): void {
    try {
        localStorage.setItem('ponto_chave_support_points', JSON.stringify(points));
    } catch (e) {
        console.error('Erro ao salvar pontos de apoio:', e);
    }
}

export function addOrUpdateSupportPoint(point: SupportPoint): void {
    const current = getSupportPoints();
    const idx = current.findIndex(p => p.id === point.id);
    if (idx >= 0) {
        current[idx] = { ...current[idx], ...point, updatedAt: new Date().toISOString() };
    } else {
        current.push({ ...point, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    saveSupportPoints(current);
}

export function deleteSupportPoint(id: string): void {
    const current = getSupportPoints().filter(p => p.id !== id);
    if (current.length === 0) {
        // Garantir que sempre haja ao menos o ponto matriz
        saveSupportPoints(DEFAULT_SUPPORT_POINTS);
    } else {
        saveSupportPoints(current);
    }
}

export function getStoreDomicile(): StoreDomicile {
    try {
        const points = getSupportPoints();
        const mainPoint = points.find(p => p.isMain && p.active) || points.find(p => p.active) || points[0];
        if (mainPoint) {
            return {
                name: mainPoint.name,
                tradeName: mainPoint.tradeName || mainPoint.name,
                street: mainPoint.street,
                number: mainPoint.number,
                neighborhood: mainPoint.neighborhood,
                city: mainPoint.city,
                state: mainPoint.state,
                cep: mainPoint.cep,
                lat: mainPoint.lat,
                lng: mainPoint.lng,
                maxLocalRadiusKm: mainPoint.maxLocalRadiusKm || 15,
            };
        }
        const stored = localStorage.getItem('ponto_chave_store_domicile');
        if (stored) {
            return { ...DEFAULT_STORE_DOMICILE, ...JSON.parse(stored) };
        }
    } catch {
        // Fallback para padrão
    }
    return DEFAULT_STORE_DOMICILE;
}

export function saveStoreDomicile(domicile: Partial<StoreDomicile>): void {
    try {
        const current = getStoreDomicile();
        const updated = { ...current, ...domicile };
        localStorage.setItem('ponto_chave_store_domicile', JSON.stringify(updated));
    } catch (e) {
        console.error('Erro ao salvar domicílio da loja:', e);
    }
}

export type RestrictionReason = 
    | 'LONG_PIPE'          // Tubos de 6m, 3m, barras ou perfis
    | 'FLAMMABLE'          // Querosene, solventes, tíner, produtos inflamáveis
    | 'TUBULAR_LAMP'       // Lâmpadas fluorescentes tubulares compridas / frágeis
    | 'OVERSIZED_HEAVY';   // Cargas especiais muito volumosas

export interface ShippingRestrictionResult {
    isRestricted: boolean;
    reason?: RestrictionReason;
    badgeLabel?: string;
    warningMessage?: string;
}

/**
 * Avalia se um produto individual possui restrição de transporte para correios convencionais
 */
export function checkProductShippingRestriction(product: Partial<Product>): ShippingRestrictionResult {
    // 0. FLAG explícita no BD: Produto somente com retirada no nosso PONTO DE APOIO ou entrega num raio de até 15 km do nosso domicílio, com frete por conta do cliente
    if (product.pickupOrLocal15kmOnly || product.isSpecialDelivery) {
        return {
            isRestricted: true,
            reason: 'OVERSIZED_HEAVY',
            badgeLabel: 'Ponto de Apoio ou Raio 15km',
            warningMessage: 'Produto somente com retirada no nosso PONTO DE APOIO ou entrega num raio de até 15 km do nosso domicílio, com frete por conta do cliente.',
        };
    }

    const text = `${product.name || ''} ${product.description || ''} ${product.dimensionsSize || ''} ${product.packagingType || ''} ${product.category || ''}`.toLowerCase();
    
    // 1. Querosene, solventes e inflamáveis
    const isFlammable = 
        product.nature === 'Inflamável' || 
        text.includes('querosene') || 
        text.includes('solvente') || 
        text.includes('aguarrás') || 
        text.includes('thinner') || 
        text.includes('tíner') || 
        text.includes('tiner') || 
        text.includes('inflamável') ||
        text.includes('inflamavel');

    if (isFlammable) {
        return {
            isRestricted: true,
            reason: 'FLAMMABLE',
            badgeLabel: 'Carga Inflamável / Raio 15km ou Retirada',
            warningMessage: 'Produto inflamável (querosene/solvente). Transporte restrito por normas de segurança: entregue apenas no raio de até 15 km ou retirada no balcão.',
        };
    }

    // 2. Tubos de 6m, 3m, barras longas ou comprimento >= 150cm
    const lengthNum = typeof product.length === 'number' ? product.length : parseFloat(String(product.length || '0'));
    const isLongItem = 
        lengthNum >= 150 || 
        text.includes('tubo') && (text.includes('6m') || text.includes('6 m') || text.includes('6 metros') || text.includes('3m') || text.includes('3 m') || text.includes('3 metros')) ||
        text.includes('tubo de 6') ||
        text.includes('tubo de 3') ||
        text.includes('barra de 6') ||
        text.includes('barra de 3') ||
        text.includes('vergalhão 6m') ||
        text.includes('eletroduto 3m') ||
        text.includes('calha 3m');

    if (isLongItem) {
        return {
            isRestricted: true,
            reason: 'LONG_PIPE',
            badgeLabel: 'Grande Porte / Tubos 3m/6m (Raio 15km)',
            warningMessage: 'Item de grande extensão (tubo 3m/6m). Ultrapassa o limite de encomendas convencionais: frete por conta do cliente até 15 km do nosso domicílio ou retirada grátis.',
        };
    }

    // 3. Lâmpadas fluorescentes tubulares compridas
    const isTubularLamp = 
        (text.includes('fluorescente') && (text.includes('tubular') || text.includes('tubo') || text.includes('t8') || text.includes('t10') || text.includes('t5') || text.includes('40w') || text.includes('20w') || text.includes('1,20') || text.includes('1.20'))) ||
        (text.includes('lâmpada') && text.includes('tubular') && (text.includes('120') || text.includes('1.2') || text.includes('240') || text.includes('vidro')));

    if (isTubularLamp) {
        return {
            isRestricted: true,
            reason: 'TUBULAR_LAMP',
            badgeLabel: 'Vidro Frágil / Tubular (Raio 15km)',
            warningMessage: 'Lâmpada tubular comprida de vidro frágil. Para evitar quebras em esteiras convencionais, disponível apenas no raio de 15 km ou retirada no balcão.',
        };
    }

    return {
        isRestricted: false,
    };
}

/**
 * Fórmula de Haversine para cálculo da distância geodésica em quilômetros
 */
export function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // 1 casa decimal
}

/**
 * Tabela de referência de coordenadas e estimativa rápida de distâncias
 * para CEPs de São Paulo e principais regiões do Brasil em relação à base da loja (Bela Vista/Paulista).
 */
export function estimateCoordinatesByCep(cepClean: string): { lat: number; lng: number; estimatedKm?: number; regionName: string } {
    const prefix5 = parseInt(cepClean.substring(0, 5), 10);
    const prefix2 = parseInt(cepClean.substring(0, 2), 10);

    // São Paulo Capital - Regiões com alta precisão
    // Centro / Bela Vista / Liberdade / Consolação (01000 - 01599)
    if (prefix5 >= 1000 && prefix5 <= 1599) {
        return { lat: -23.555, lng: -46.645, estimatedKm: 2.2, regionName: 'Centro / Bela Vista (SP)' };
    }
    // Vila Mariana / Saúde / Moema (04000 - 04199)
    if (prefix5 >= 4000 && prefix5 <= 4199) {
        return { lat: -23.595, lng: -46.640, estimatedKm: 3.8, regionName: 'Vila Mariana / Moema (SP)' };
    }
    // Pinheiros / Perdizes / Jardins / Lapa (05400 - 05499 / 05000 - 05099)
    if ((prefix5 >= 5400 && prefix5 <= 5499) || (prefix5 >= 5000 && prefix5 <= 5099)) {
        return { lat: -23.561, lng: -46.685, estimatedKm: 4.5, regionName: 'Pinheiros / Jardins / Perdizes (SP)' };
    }
    // Morumbi / Butantã (05500 - 05799)
    if (prefix5 >= 5500 && prefix5 <= 5799) {
        return { lat: -23.598, lng: -46.720, estimatedKm: 8.5, regionName: 'Morumbi / Butantã (SP)' };
    }
    // Santana / Tucuruvi / Casa Verde (02000 - 02499)
    if (prefix5 >= 2000 && prefix5 <= 2499) {
        return { lat: -23.501, lng: -46.628, estimatedKm: 7.9, regionName: 'Santana / Zona Norte (SP)' };
    }
    // Mooca / Tatuapé / Belém (03000 - 03399)
    if (prefix5 >= 3000 && prefix5 <= 3399) {
        return { lat: -23.545, lng: -46.585, estimatedKm: 7.2, regionName: 'Mooca / Tatuapé (SP)' };
    }
    // Ipiranga / Sacomã (04200 - 04299)
    if (prefix5 >= 4200 && prefix5 <= 4299) {
        return { lat: -23.592, lng: -46.605, estimatedKm: 6.0, regionName: 'Ipiranga (SP)' };
    }
    // Santo Amaro / Campo Belo (04600 - 04799)
    if (prefix5 >= 4600 && prefix5 <= 4799) {
        return { lat: -23.645, lng: -46.695, estimatedKm: 10.5, regionName: 'Santo Amaro (SP)' };
    }
    // São Caetano do Sul (09500 - 09599) -> Dentro do raio!
    if (prefix5 >= 9500 && prefix5 <= 9599) {
        return { lat: -23.623, lng: -46.555, estimatedKm: 12.0, regionName: 'São Caetano do Sul (SP)' };
    }
    // Diadema (09900 - 09999) -> Limite do raio
    if (prefix5 >= 9900 && prefix5 <= 9999) {
        return { lat: -23.686, lng: -46.623, estimatedKm: 14.5, regionName: 'Diadema (SP)' };
    }
    // Santo André (09000 - 09299) -> Fora do raio (> 15km)
    if (prefix5 >= 9000 && prefix5 <= 9299) {
        return { lat: -23.663, lng: -46.538, estimatedKm: 17.5, regionName: 'Santo André (SP)' };
    }
    // São Bernardo do Campo (09700 - 09899) -> Fora do raio (> 15km)
    if (prefix5 >= 9700 && prefix5 <= 9899) {
        return { lat: -23.691, lng: -46.565, estimatedKm: 18.5, regionName: 'São Bernardo do Campo (SP)' };
    }
    // Osasco (06000 - 06299) -> Limite/fora
    if (prefix5 >= 6000 && prefix5 <= 6299) {
        return { lat: -23.532, lng: -46.792, estimatedKm: 16.0, regionName: 'Osasco (SP)' };
    }
    // Guarulhos (07000 - 07299) -> Fora (> 15km)
    if (prefix5 >= 7000 && prefix5 <= 7299) {
        return { lat: -23.454, lng: -46.533, estimatedKm: 19.5, regionName: 'Guarulhos (SP)' };
    }
    // Zona Leste Extrema - Itaquera / Guaianases (08200 - 08499) -> Fora (> 15km)
    if (prefix5 >= 8200 && prefix5 <= 8499) {
        return { lat: -23.541, lng: -46.452, estimatedKm: 21.0, regionName: 'Itaquera / Zona Leste (SP)' };
    }
    // Zona Sul Extrema - Grajaú / Parelheiros (04800 - 04899) -> Fora (> 15km)
    if (prefix5 >= 4800 && prefix5 <= 4899) {
        return { lat: -23.750, lng: -46.685, estimatedKm: 23.0, regionName: 'Grajaú / Extremo Sul (SP)' };
    }

    // Demais CEPs de SP Capital (01000 - 05999)
    if (prefix2 <= 5) {
        return { lat: -23.550, lng: -46.633, estimatedKm: 9.0, regionName: 'São Paulo (Capital)' };
    }
    // Demais cidades da Grande São Paulo (06000 - 09999)
    if (prefix2 <= 9) {
        return { lat: -23.600, lng: -46.750, estimatedKm: 22.0, regionName: 'Região Metropolitana de SP' };
    }
    // Interior de São Paulo (11000 - 19999)
    if (prefix2 >= 11 && prefix2 <= 19) {
        return { lat: -22.905, lng: -47.060, estimatedKm: 95.0, regionName: 'Interior / Litoral de SP' };
    }
    // Rio de Janeiro
    if (prefix2 >= 20 && prefix2 <= 28) {
        return { lat: -22.906, lng: -43.172, estimatedKm: 430.0, regionName: 'Rio de Janeiro' };
    }
    // Minas Gerais
    if (prefix2 >= 30 && prefix2 <= 39) {
        return { lat: -19.921, lng: -43.937, estimatedKm: 580.0, regionName: 'Minas Gerais' };
    }
    // Paraná
    if (prefix2 >= 80 && prefix2 <= 87) {
        return { lat: -25.429, lng: -49.271, estimatedKm: 410.0, regionName: 'Paraná' };
    }

    // Outros estados do Brasil
    return { lat: -15.797, lng: -47.868, estimatedKm: 850.0, regionName: 'Outras Regiões do Brasil' };
}

/**
 * Calcula a distância precisa entre o endereço do cliente e o domicílio da loja.
 */
export async function calculateDistanceToStore(
    clientCep: string, 
    clientAddressInfo?: { city?: string; state?: string; neighborhood?: string }
): Promise<{
    distanceKm: number;
    isWithinLocalRadius: boolean;
    domicile: StoreDomicile;
    regionName: string;
}> {
    const domicile = getStoreDomicile();
    const cleanCep = clientCep.replace(/\D/g, '');

    // 1. Obter estimativa rápida calibrada por CEP
    const est = estimateCoordinatesByCep(cleanCep);
    let targetLat = est.lat;
    let targetLng = est.lng;
    let regionName = est.regionName;

    // Se temos dados do ViaCEP mais específicos
    if (clientAddressInfo?.city && clientAddressInfo.city.toLowerCase() !== 'são paulo' && cleanCep.length === 8) {
        regionName = `${clientAddressInfo.neighborhood ? clientAddressInfo.neighborhood + ', ' : ''}${clientAddressInfo.city}/${clientAddressInfo.state || 'BR'}`;
    }

    // 2. Calcular distância via Haversine
    let calculatedKm = est.estimatedKm !== undefined 
        ? est.estimatedKm 
        : calculateHaversineDistanceKm(domicile.lat, domicile.lng, targetLat, targetLng);

    const isWithin = calculatedKm <= domicile.maxLocalRadiusKm;

    return {
        distanceKm: calculatedKm,
        isWithinLocalRadius: isWithin,
        domicile,
        regionName,
    };
}

export interface ShippingOption {
    id: 'local_client_carrier' | 'store_pickup' | 'standard_carrier' | 'express_sedex' | 'free_promo';
    name: string;
    description: string;
    deadline: string;
    cost: number;
    isFreightByClient: boolean; // Frete por conta do cliente
    isAvailable: boolean;
    unavailableReason?: string;
    badge?: string;
}

/**
 * Gera as opções de frete disponíveis com base na lista de itens e na distância calculada
 */
export function evaluateShippingOptions(
    cartItems: (CartItem | Product)[], 
    distanceKm: number | null, 
    totalPrice: number
): {
    options: ShippingOption[];
    hasRestrictedItems: boolean;
    restrictedProducts: { product: Product; restriction: ShippingRestrictionResult }[];
    isWithinRadius: boolean;
} {
    const domicile = getStoreDomicile();
    
    // Identificar itens com restrição logística no carrinho
    const restrictedProducts: { product: Product; restriction: ShippingRestrictionResult }[] = [];
    for (const item of cartItems) {
        const check = checkProductShippingRestriction(item);
        if (check.isRestricted) {
            restrictedProducts.push({ product: item, restriction: check });
        }
    }

    const hasRestrictedItems = restrictedProducts.length > 0;
    const isWithinRadius = distanceKm !== null ? distanceKm <= domicile.maxLocalRadiusKm : true;

    const options: ShippingOption[] = [];

    // 1. Retirada no nosso PONTO DE APOIO (Sempre disponível e gratuita)
    options.push({
        id: 'store_pickup',
        name: 'Retirada no nosso PONTO DE APOIO (Sem Custo)',
        description: `Retire diretamente em nosso domicílio / ponto de apoio (${domicile.street}, ${domicile.number} - ${domicile.neighborhood}, ${domicile.city}/${domicile.state}).`,
        deadline: 'Pronto em até 1 hora útil após aprovação',
        cost: 0,
        isFreightByClient: false,
        isAvailable: true,
        badge: 'PONTO DE APOIO',
    });

    // 2. Frete Local por Conta do Cliente (Raio de até 15 km)
    // Especialmente calibrado para tubos 3m/6m, inflamáveis e utilidades
    if (distanceKm !== null && isWithinRadius) {
        // Custo estimado do carreto / transportadora parceira local proporcional à distância
        // Base R$ 22,00 + R$ 1,20/km
        const calculatedLocalCost = Math.round((22 + (distanceKm * 1.20)) * 10) / 10;

        options.push({
            id: 'local_client_carrier',
            name: `Entrega Local (Raio de até 15 km) • Frete por Conta do Cliente`,
            description: `Transporte dedicado para o seu endereço (${distanceKm} km do nosso domicílio). Atende cargas especiais, tubos de 3m/6m e inflamáveis. Dentro do prazo da transportadora local.`,
            deadline: '1 a 2 dias úteis (Prazo da Transportadora)',
            cost: calculatedLocalCost,
            isFreightByClient: true,
            isAvailable: true,
            badge: `${distanceKm} km • Dentro do Raio`,
        });
    } else if (distanceKm !== null && !isWithinRadius && hasRestrictedItems) {
        // Fora do raio com itens restritos
        options.push({
            id: 'local_client_carrier',
            name: `Entrega Local (Restrita ao Raio de 15 km)`,
            description: `Seu endereço está a ${distanceKm} km do nosso domicílio. O limite máximo de entrega local para tubos/inflamáveis é de 15 km.`,
            deadline: 'Indisponível para o seu endereço',
            cost: 0,
            isFreightByClient: true,
            isAvailable: false,
            unavailableReason: `Endereço a ${distanceKm} km (excede o raio máximo de 15 km da loja).`,
        });
    }

    // 3. Frete Grátis Promocional (Apenas para produtos sem restrição e carrinho >= R$ 300)
    if (totalPrice >= 300 && !hasRestrictedItems) {
        options.push({
            id: 'free_promo',
            name: 'Frete Grátis Promocional (Compras acima de R$ 300)',
            description: 'Envio convencional bonificado para ferramentas, torneiras e utilidades de porte regular.',
            deadline: '3 a 6 dias úteis',
            cost: 0,
            isFreightByClient: false,
            isAvailable: true,
            badge: 'PROMOÇÃO',
        });
    }

    // 4. Transportadora Padrão Convencional (Correios / Jadlog / Rodoviário)
    // BLOQUEADA se o carrinho tiver itens restritos (tubos 3m/6m, lâmpadas fluorescentes compridas, querosene)
    if (hasRestrictedItems) {
        options.push({
            id: 'standard_carrier',
            name: 'Transportadora Padrão / Encomenda Comum',
            description: 'Bloqueado devido a itens com restrição logística no carrinho (tubos 3m/6m, lâmpadas compridas ou inflamáveis não aceitos por correios convencionais).',
            deadline: 'Indisponível para itens longos/inflamáveis',
            cost: 19.90,
            isFreightByClient: false,
            isAvailable: false,
            unavailableReason: 'Correios e transportadoras convencionais não transportam tubos de 3m/6m ou produtos inflamáveis.',
        });
    } else {
        options.push({
            id: 'standard_carrier',
            name: 'Transportadora Padrão Nacional',
            description: 'Envio rodoviário seguro com código de rastreamento para todo o Brasil.',
            deadline: '3 a 5 dias úteis',
            cost: 19.90,
            isFreightByClient: false,
            isAvailable: true,
        });
    }

    // 5. Sedex / Entrega Expressa Convencional
    // Também BLOQUEADA se tiver itens restritos
    if (hasRestrictedItems) {
        options.push({
            id: 'express_sedex',
            name: 'Sedex / Entrega Aérea Expressa',
            description: 'Bloqueado: limite dimensional dos Correios é de 100 cm e inflamáveis são expressamente proibidos em transporte aéreo.',
            deadline: 'Indisponível',
            cost: 34.90,
            isFreightByClient: false,
            isAvailable: false,
            unavailableReason: 'Itens restritos excedem dimensões e normas de carga perigosa.',
        });
    } else {
        options.push({
            id: 'express_sedex',
            name: 'Sedex Express / Urgente',
            description: 'Entrega rápida prioritária na porta da sua casa ou empresa.',
            deadline: '1 a 2 dias úteis',
            cost: 34.90,
            isFreightByClient: false,
            isAvailable: true,
        });
    }

    return {
        options,
        hasRestrictedItems,
        restrictedProducts,
        isWithinRadius,
    };
}
