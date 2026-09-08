/**
 * Carrefour Marketplace (Mirakl) Feed Generator & Catalog Exporter
 * Gera arquivos no padrão oficial do Carrefour Brasil / Mirakl para produtos e ofertas.
 */

import { Product } from '../types';

export interface CarrefourProductRow {
    sku: string;
    ean: string;
    title: string;
    description: string;
    category: string;
    brand: string;
    price: number;
    discountPrice?: number;
    stock: number;
    leadTimeDays: number;
    weightKg: number;
    heightCm: number;
    widthCm: number;
    depthCm: number;
    imageUrl: string;
    additionalImages?: string;
    status: 'ready' | 'missing_ean' | 'missing_weight' | 'missing_image';
    validationErrors: string[];
}

/**
 * Mapeia categorias internas da loja para a taxonomia oficial do Carrefour Brasil
 */
export const mapToCarrefourCategory = (internalCategory: string): string => {
    const map: Record<string, string> = {
        'Iluminação & Pendentes': 'Casa e Construção > Iluminação > Lustres e Pendentes',
        'Iluminação Técnica LED': 'Casa e Construção > Iluminação > Lâmpadas e Painéis LED',
        'Fita LED & Perfil': 'Casa e Construção > Iluminação > Fitas LED e Perfis',
        'Materiais Elétricos': 'Casa e Construção > Material Elétrico > Tomadas e Interruptores',
        'Fios & Cabos': 'Casa e Construção > Material Elétrico > Cabos e Fios',
        'Disjuntores & Quadros': 'Casa e Construção > Material Elétrico > Disjuntores',
        'Metais Sanitários & Banheiro': 'Casa e Construção > Hidráulica e Banheiro > Torneiras e Duchas',
        'Torneiras de Luxo': 'Casa e Construção > Hidráulica e Banheiro > Torneiras Monocomando',
        'Fechaduras & Segurança': 'Casa e Construção > Segurança > Fechaduras Digitais',
        'Ferramentas & Máquinas': 'Ferramentas > Ferramentas Manuais e Elétricas',
        'Utilidades Domésticas': 'Utilidades Domésticas > Organização e Decoração',
    };

    return map[internalCategory] || 'Casa e Construção > Utilidades e Decoração';
};

/**
 * Transforma a lista de produtos no formato estruturado para o Carrefour
 */
export const buildCarrefourCatalog = (products: Product[]): CarrefourProductRow[] => {
    return products.map(p => {
        const errors: string[] = [];
        
        const sku = p.sku || p.code || `PCL-${p.id}`;
        const ean = p.ean || p.code?.replace(/\D/g, '') || '';
        
        if (!ean || ean.length < 8) {
            errors.push('EAN/GTIN ausente ou inválido');
        }

        const brand = p.supplierName || 'Ponto Chave do Lar';
        const title = `${p.name} ${brand ? `- ${brand}` : ''}`.trim();
        const description = p.description || `${p.name}. Produto com garantia e procedência Ponto Chave do Lar.`;
        const category = mapToCarrefourCategory(p.category);
        const price = Number(p.price) || 0;
        const discountPrice = p.promoPrice ? Number(p.promoPrice) : undefined;
        const stock = Number(p.stock) || 0;
        const leadTimeDays = 2; // 2 dias para despacho

        // Dimensões e peso
        const weightKg = Number(p.weightKg) || 0.8;
        const heightCm = Number(p.heightCm) || 15;
        const widthCm = Number(p.widthCm) || 20;
        const depthCm = Number(p.depthCm) || 25;
        const imageUrl = p.imageUrl || 'https://pontochavedolar.com.br/ponto_chave_logo.jpg';

        let status: CarrefourProductRow['status'] = 'ready';
        if (errors.length > 0) {
            status = 'missing_ean';
        }

        return {
            sku,
            ean,
            title,
            description,
            category,
            brand,
            price,
            discountPrice,
            stock,
            leadTimeDays,
            weightKg,
            heightCm,
            widthCm,
            depthCm,
            imageUrl,
            additionalImages: p.gallery && p.gallery.length > 0 ? p.gallery.join('|') : '',
            status,
            validationErrors: errors,
        };
    });
};

/**
 * Exporta o catálogo no formato CSV Carrefour Mirakl
 */
export const exportCarrefourCSV = (rows: CarrefourProductRow[]): string => {
    const headers = [
        'seller-sku',
        'ean',
        'title',
        'description',
        'category',
        'brand',
        'price',
        'discount-price',
        'quantity',
        'leadtime-to-ship',
        'weight-kg',
        'height-cm',
        'width-cm',
        'depth-cm',
        'image-url',
        'additional-images',
    ];

    const escapeCsv = (val: any) => {
        if (val === undefined || val === null) return '';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
    };

    const csvLines = [headers.join(';')];

    rows.forEach(r => {
        csvLines.push([
            escapeCsv(r.sku),
            escapeCsv(r.ean),
            escapeCsv(r.title),
            escapeCsv(r.description),
            escapeCsv(r.category),
            escapeCsv(r.brand),
            escapeCsv(r.price.toFixed(2)),
            escapeCsv(r.discountPrice ? r.discountPrice.toFixed(2) : ''),
            escapeCsv(r.stock),
            escapeCsv(r.leadTimeDays),
            escapeCsv(r.weightKg.toFixed(2)),
            escapeCsv(r.heightCm),
            escapeCsv(r.widthCm),
            escapeCsv(r.depthCm),
            escapeCsv(r.imageUrl),
            escapeCsv(r.additionalImages || ''),
        ].join(';'));
    });

    return csvLines.join('\n');
};

/**
 * Exporta o catálogo no formato XML Feed Mirakl / Carrefour
 */
export const exportCarrefourXML = (rows: CarrefourProductRow[]): string => {
    const escapeXml = (unsafe: string) => {
        return unsafe.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });
    };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<products xmlns="http://www.mirakl.com/products/carrefour">\n`;

    rows.forEach(r => {
        xml += `  <product>\n`;
        xml += `    <sku>${escapeXml(r.sku)}</sku>\n`;
        xml += `    <ean>${escapeXml(r.ean)}</ean>\n`;
        xml += `    <title>${escapeXml(r.title)}</title>\n`;
        xml += `    <description><![CDATA[${r.description}]]></description>\n`;
        xml += `    <category>${escapeXml(r.category)}</category>\n`;
        xml += `    <brand>${escapeXml(r.brand)}</brand>\n`;
        xml += `    <price>${r.price.toFixed(2)}</price>\n`;
        if (r.discountPrice) {
            xml += `    <discount-price>${r.discountPrice.toFixed(2)}</discount-price>\n`;
        }
        xml += `    <quantity>${r.stock}</quantity>\n`;
        xml += `    <leadtime-to-ship>${r.leadTimeDays}</leadtime-to-ship>\n`;
        xml += `    <weight>${r.weightKg.toFixed(2)}</weight>\n`;
        xml += `    <dimensions>\n`;
        xml += `      <height>${r.heightCm}</height>\n`;
        xml += `      <width>${r.widthCm}</width>\n`;
        xml += `      <depth>${r.depthCm}</depth>\n`;
        xml += `    </dimensions>\n`;
        xml += `    <image-url>${escapeXml(r.imageUrl)}</image-url>\n`;
        xml += `  </product>\n`;
    });

    xml += `</products>`;
    return xml;
};
