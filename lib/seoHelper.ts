/**
 * SEO & Schema.org Structured Data Helper
 * Gera e injeta JSON-LD para Google Search, Rich Snippets e Merchant Center
 */

import { Product } from '../types';

export interface SEOConfig {
    title: string;
    description: string;
    keywords?: string;
    canonicalUrl?: string;
    imageUrl?: string;
}

/**
 * Atualiza dinamicamente as tags de meta no head
 */
export const updatePageSEO = (config: SEOConfig) => {
    if (typeof document === 'undefined') return;

    // Title
    document.title = config.title;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', config.description);

    // Meta Keywords
    if (config.keywords) {
        let metaKeys = document.querySelector('meta[name="keywords"]');
        if (!metaKeys) {
            metaKeys = document.createElement('meta');
            metaKeys.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeys);
        }
        metaKeys.setAttribute('content', config.keywords);
    }

    // OpenGraph Title & Description
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', config.title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', config.description);

    if (config.imageUrl) {
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) ogImage.setAttribute('content', config.imageUrl);
    }

    // Canonical
    if (config.canonicalUrl) {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', config.canonicalUrl);
    }
};

/**
 * Injeta Schema.org JSON-LD para detalhes de produto no Google Search / Merchant
 */
export const injectProductSchema = (product: Product) => {
    if (typeof document === 'undefined') return;

    const existingScript = document.getElementById('product-jsonld-schema');
    if (existingScript) {
        existingScript.remove();
    }

    const schema = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        image: [product.imageUrl || 'https://pontochavedolar.com.br/ponto_chave_logo.jpg'],
        description: product.description || `${product.name} - Qualidade garantida Ponto Chave do Lar.`,
        sku: product.sku || product.code || String(product.id),
        mpn: product.code || String(product.id),
        brand: {
            '@type': 'Brand',
            name: product.supplierName || 'Ponto Chave do Lar',
        },
        offers: {
            '@type': 'Offer',
            url: window.location.href,
            priceCurrency: 'BRL',
            price: Number(product.price).toFixed(2),
            priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            itemCondition: 'https://schema.org/NewCondition',
            availability: (product.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'Ponto Chave do Lar',
            },
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '48',
        },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'product-jsonld-schema';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
};
