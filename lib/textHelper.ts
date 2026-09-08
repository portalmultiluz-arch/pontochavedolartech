/**
 * Utilitários de Tratamento de Texto e Sanitização para Exibição ao Cliente
 * Ponto Chave do Lar
 * 
 * Regra do Negócio:
 * - A palavra "Pampulha" (e variações como "Pampulha Condutores", "PAMPULHA") NUNCA deve
 *   ser exibida em nenhuma tela, recibo, orçamento, comprovante ou informação visível ao cliente.
 */

import { Product } from '../types';

/**
 * Remove qualquer ocorrência da palavra "Pampulha" ou termos relacionados de textos exibidos ao cliente.
 */
export function sanitizeCustomerText(text?: string | null): string {
    if (!text) return '';

    let cleaned = String(text)
        // Remove prefixos longos de catálogo importados
        .replace(/Materiais para Pintura PAMPULHA Tintas e Acessórios para Pintura\s*/gi, '')
        .replace(/PAMPULHA Cabos de Cobre e Alumínio\s*/gi, '')
        .replace(/Tabela Oficial Pampulha Condutores/gi, '')
        .replace(/Pampulha Condutores/gi, '')
        .replace(/PAMPULHA/g, '')
        .replace(/pampulha/gi, '')
        // Remove sobras de traços soltos deixados por substituições (ex: " - Marca: - ")
        .replace(/-\s*Marca:\s*-\s*/gi, '')
        .replace(/-\s*Marca:\s*\(\s*/gi, '(')
        .replace(/\s+-\s*-\s+/g, ' - ')
        .replace(/\s+-\s*$/g, '')
        .replace(/^\s*-\s+/g, '')
        // Normaliza múltiplos espaços em branco
        .replace(/\s{2,}/g, ' ')
        .trim();

    return cleaned;
}

/**
 * Retorna uma versão sanitizada do produto para exibição segura em componentes voltados ao cliente
 * (Cards de produto, Detalhes, Carrinho, Checkout, Comprovante de Venda, Orçamentos e WhatsApp).
 */
export function sanitizeProductForCustomer<T extends Partial<Product>>(product: T): T {
    if (!product) return product;

    const brand = (product.brand || '').toLowerCase().includes('pampulha')
        ? 'Ponto Chave do Lar'
        : product.brand;

    const department = (product.department || '').toLowerCase().includes('pampulha')
        ? 'Materiais Elétricos e Hidráulicos'
        : product.department;

    return {
        ...product,
        name: sanitizeCustomerText(product.name),
        description: sanitizeCustomerText(product.description),
        brand: brand ? sanitizeCustomerText(brand) : brand,
        department: department ? sanitizeCustomerText(department) : department,
        specialDeliveryCepCode: sanitizeCustomerText(product.specialDeliveryCepCode),
        specialDeliveryNotes: sanitizeCustomerText(product.specialDeliveryNotes)
    };
}
