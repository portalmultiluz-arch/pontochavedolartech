/**
 * Analytics and Marketing Tracking Service
 * Suporte completo para:
 * - Google Tag Manager (GTM)
 * - Google Analytics 4 (GA4) / Google Ads
 * - Meta Pixel (Facebook & Instagram)
 * - TikTok Pixel (TikTok Ads)
 * - Schema.org E-commerce Structured Data
 */

import { Product, CartItem, ConfirmedOrder } from '../types';

declare global {
    interface Window {
        dataLayer?: any[];
        gtag?: (...args: any[]) => void;
        fbq?: (...args: any[]) => void;
        _fbq?: any;
        ttq?: any;
    }
}

interface PixelConfig {
    googleAnalyticsId?: string;
    googleAdsTagId?: string;
    metaPixelId?: string;
    tiktokPixelId?: string;
}

let isGoogleInitialized = false;
let isMetaInitialized = false;
let isTikTokInitialized = false;
let currentConfig: PixelConfig = {};

/**
 * Inicializa os scripts de rastreamento com os IDs informados
 */
export const initAnalyticsTracking = (config: PixelConfig) => {
    currentConfig = { ...currentConfig, ...config };

    if (typeof window === 'undefined') return;

    // 1. Google Analytics 4 / Google Ads (gtag.js)
    if (config.googleAnalyticsId && !isGoogleInitialized && config.googleAnalyticsId !== 'G-XXXXXXXXXX') {
        try {
            window.dataLayer = window.dataLayer || [];
            window.gtag = function () {
                window.dataLayer?.push(arguments);
            };
            window.gtag('js', new Date());
            window.gtag('config', config.googleAnalyticsId, {
                send_page_view: true,
                currency: 'BRL',
            });

            if (config.googleAdsTagId && config.googleAdsTagId !== 'AW-XXXXXXXXX') {
                window.gtag('config', config.googleAdsTagId);
            }

            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`;
            script.id = 'google-analytics-script';
            if (!document.getElementById('google-analytics-script')) {
                document.head.appendChild(script);
            }
            isGoogleInitialized = true;
        } catch (e) {
            console.warn('Analytics: Erro ao carregar Google Analytics', e);
        }
    }

    // 2. Meta Pixel (Facebook & Instagram)
    if (config.metaPixelId && !isMetaInitialized && config.metaPixelId !== '123456789012345' && config.metaPixelId.trim() !== '') {
        try {
            /* eslint-disable */
            (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
                if (f.fbq) return;
                n = f.fbq = function () {
                    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
                };
                if (!f._fbq) f._fbq = n;
                n.push = n;
                n.loaded = !0;
                n.version = '2.0';
                n.queue = [];
                t = b.createElement(e);
                t.async = !0;
                t.src = v;
                t.id = 'meta-pixel-script';
                s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s);
            })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
            /* eslint-enable */

            if (window.fbq) {
                window.fbq('init', config.metaPixelId);
                window.fbq('track', 'PageView');
                isMetaInitialized = true;
            }
        } catch (e) {
            console.warn('Analytics: Erro ao carregar Meta Pixel', e);
        }
    }

    // 3. TikTok Pixel
    if (config.tiktokPixelId && !isTikTokInitialized && config.tiktokPixelId.trim() !== '') {
        try {
            /* eslint-disable */
            (function (w: any, d: any, t: any) {
                w.TiktokAnalyticsObject = t;
                var ttq = (w[t] = w[t] || []);
                ttq.methods = [
                    'page',
                    'track',
                    'identify',
                    'instances',
                    'debug',
                    'on',
                    'off',
                    'once',
                    'ready',
                    'alias',
                    'group',
                    'enableCookie',
                    'disableCookie',
                ];
                ttq.setAndDefer = function (t: any, e: any) {
                    t[e] = function () {
                        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
                    };
                };
                for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
                ttq.instance = function (t: any) {
                    for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
                    return e;
                };
                ttq.load = function (e: any, n: any) {
                    var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
                    (ttq._i = ttq._i || {}), (ttq._i[e] = []), (ttq._i[e]._u = i);
                    var s = d.createElement('script');
                    (s.type = 'text/javascript'), (s.async = !0), (s.src = i + '?sdkid=' + e + '&lib=' + t);
                    s.id = 'tiktok-pixel-script';
                    var a = d.getElementsByTagName('script')[0];
                    a.parentNode.insertBefore(s, a);
                };
                ttq.load(config.tiktokPixelId);
                ttq.page();
            })(window, document, 'ttq');
            /* eslint-enable */
            isTikTokInitialized = true;
        } catch (e) {
            console.warn('Analytics: Erro ao carregar TikTok Pixel', e);
        }
    }
};

/**
 * Rastrear Visualização de Página (PageView)
 */
export const trackPageView = (pageTitle: string, path: string = window.location.pathname) => {
    if (typeof window === 'undefined') return;

    // Google GA4
    if (window.gtag) {
        window.gtag('event', 'page_view', {
            page_title: pageTitle,
            page_location: window.location.href,
            page_path: path,
        });
    }

    // Meta Pixel
    if (window.fbq) {
        window.fbq('track', 'PageView');
    }

    // TikTok Pixel
    if (window.ttq) {
        window.ttq.page();
    }
};

/**
 * Rastrear Visualização de Produto (ViewContent / select_item)
 */
export const trackViewProduct = (product: Product) => {
    if (typeof window === 'undefined') return;

    // Google GA4
    if (window.gtag) {
        window.gtag('event', 'view_item', {
            currency: 'BRL',
            value: product.price,
            items: [
                {
                    item_id: String(product.id || product.code || product.sku),
                    item_name: product.name,
                    item_category: product.category,
                    price: product.price,
                    quantity: 1,
                },
            ],
        });
    }

    // Meta Pixel
    if (window.fbq) {
        window.fbq('track', 'ViewContent', {
            content_name: product.name,
            content_category: product.category,
            content_ids: [String(product.id || product.code || product.sku)],
            content_type: 'product',
            value: product.price,
            currency: 'BRL',
        });
    }

    // TikTok Pixel
    if (window.ttq) {
        window.ttq.track('ViewContent', {
            content_id: String(product.id || product.code || product.sku),
            content_type: 'product',
            content_name: product.name,
            content_category: product.category,
            price: product.price,
            value: product.price,
            currency: 'BRL',
        });
    }
};

/**
 * Rastrear Adição ao Carrinho (AddToCart / add_to_cart)
 */
export const trackAddToCart = (product: Product, quantity: number = 1) => {
    if (typeof window === 'undefined') return;

    // Google GA4
    if (window.gtag) {
        window.gtag('event', 'add_to_cart', {
            currency: 'BRL',
            value: product.price * quantity,
            items: [
                {
                    item_id: String(product.id || product.code || product.sku),
                    item_name: product.name,
                    item_category: product.category,
                    price: product.price,
                    quantity: quantity,
                },
            ],
        });
    }

    // Meta Pixel
    if (window.fbq) {
        window.fbq('track', 'AddToCart', {
            content_name: product.name,
            content_category: product.category,
            content_ids: [String(product.id || product.code || product.sku)],
            content_type: 'product',
            value: product.price * quantity,
            currency: 'BRL',
        });
    }

    // TikTok Pixel
    if (window.ttq) {
        window.ttq.track('AddToCart', {
            content_id: String(product.id || product.code || product.sku),
            content_type: 'product',
            content_name: product.name,
            quantity: quantity,
            price: product.price,
            value: product.price * quantity,
            currency: 'BRL',
        });
    }
};

/**
 * Rastrear Início de Finalização de Compra (InitiateCheckout / begin_checkout)
 */
export const trackInitiateCheckout = (items: CartItem[], total: number) => {
    if (typeof window === 'undefined') return;

    // Google GA4
    if (window.gtag) {
        window.gtag('event', 'begin_checkout', {
            currency: 'BRL',
            value: total,
            items: items.map(item => ({
                item_id: String(item.id || item.code || item.sku),
                item_name: item.name,
                item_category: item.category,
                price: item.price,
                quantity: item.quantity,
            })),
        });
    }

    // Meta Pixel
    if (window.fbq) {
        window.fbq('track', 'InitiateCheckout', {
            content_ids: items.map(item => String(item.id || item.code || item.sku)),
            content_type: 'product',
            value: total,
            currency: 'BRL',
            num_items: items.reduce((sum, item) => sum + item.quantity, 0),
        });
    }

    // TikTok Pixel
    if (window.ttq) {
        window.ttq.track('InitiateCheckout', {
            contents: items.map(item => ({
                content_id: String(item.id || item.code || item.sku),
                content_name: item.name,
                quantity: item.quantity,
                price: item.price,
            })),
            value: total,
            currency: 'BRL',
        });
    }
};

/**
 * Rastrear Compra Finalizada (Purchase / complete_payment)
 */
export const trackPurchase = (order: ConfirmedOrder) => {
    if (typeof window === 'undefined') return;

    // Google GA4 / Ads Conversion
    if (window.gtag) {
        window.gtag('event', 'purchase', {
            transaction_id: order.id,
            value: order.total,
            currency: 'BRL',
            tax: 0,
            shipping: order.shipping,
            items: order.items.map(item => ({
                item_id: String(item.id || item.code || item.sku),
                item_name: item.name,
                item_category: item.category,
                price: item.price,
                quantity: item.quantity,
            })),
        });
    }

    // Meta Pixel
    if (window.fbq) {
        window.fbq('track', 'Purchase', {
            content_ids: order.items.map(item => String(item.id || item.code || item.sku)),
            content_type: 'product',
            value: order.total,
            currency: 'BRL',
            num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
        });
    }

    // TikTok Pixel
    if (window.ttq) {
        window.ttq.track('CompletePayment', {
            contents: order.items.map(item => ({
                content_id: String(item.id || item.code || item.sku),
                content_name: item.name,
                quantity: item.quantity,
                price: item.price,
            })),
            value: order.total,
            currency: 'BRL',
        });
    }
};
