import React, { useState, useMemo, useEffect } from 'react';
import { 
    X, 
    Upload, 
    FileText, 
    Check, 
    Sparkles, 
    Layers, 
    AlertCircle, 
    CheckCircle2, 
    Download, 
    FileSpreadsheet,
    Calendar,
    ArrowRight,
    RefreshCw,
    Wrench,
    Tag,
    Trash2,
    ShieldCheck,
    AlertTriangle,
    CheckSquare,
    Square,
    Eye,
    Archive,
    Search,
    Filter,
    HelpCircle,
    FileUp,
    Edit2,
    Package,
    Zap,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Product } from '../../types';
import { createDocument, deleteDocument, subscribeToCollection, createDocumentsBatch, deleteDocumentsBatch } from '../../services/firebaseService';
import { parseTextToProducts, extractTextFromFile, ParsedProductItem } from '../../lib/pdfProductParser';
import { pampulhaCondutoresProducts } from '../../data/pampulhaCondutoresProducts';
import { pampulhaCatalogFull } from '../../data/pampulhaCatalogFull';

// Catálogo consolidado oficial da Pampulha (Condutores + Tabela Completa 34 Páginas)
const allPampulhaProducts: Product[] = [
    ...pampulhaCondutoresProducts,
    ...pampulhaCatalogFull.filter(p => !pampulhaCondutoresProducts.some(cp => cp.code === p.code))
];


// Definição estruturada de Lote de Importação identificado
export interface DetectedBatch {
    id: string;
    name: string;
    tag: string;
    productCount: number;
    totalStock: number;
    productIds: string[];
    products: Product[];
    colorClass: string;
    badgeBg: string;
    badgeText: string;
    iconType: 'pampulha' | 'sams' | 'tropical' | 'pdf' | 'file' | 'custom' | 'manual';
}

// Identifica a qual lote um produto pertence (por ID explícito ou metadados de origem)
export function getProductBatchInfo(p: Product): { id: string; name: string; tag: string; iconType: DetectedBatch['iconType'] } {
    if (p.importBatchId && p.importBatchName) {
        if (p.importBatchId.includes('pampulha')) {
            return {
                id: p.importBatchId,
                name: p.importBatchName,
                tag: 'Pampulha Condutores',
                iconType: 'pampulha'
            };
        }
        return {
            id: p.importBatchId,
            name: p.importBatchName,
            tag: 'Lote Personalizado',
            iconType: 'custom'
        };
    }
    
    // 0. Lote Pampulha Condutores (Tabela Oficial 53 Itens)
    const isPampulhaCondutores = 
        (p.code && p.code.toUpperCase().startsWith('PAMP-')) ||
        (p.sku && p.sku.toUpperCase().includes('PAMP-')) ||
        (p.supplierName && p.supplierName.toLowerCase().includes('pampulha condutores')) ||
        (p.department && p.department.toLowerCase().includes('pampulha'));

    if (isPampulhaCondutores) {
        return {
            id: 'batch_pampulha_condutores_20260901',
            name: 'Lote Pampulha Condutores (Tabela Oficial)',
            tag: 'Pampulha Condutores',
            iconType: 'pampulha'
        };
    }

    // 1. Lote Sam's Club (Pampulha)
    const isSamsClub = 
        (p.code && p.code.toUpperCase().startsWith('SC-')) || 
        (p.supplierName && (p.supplierName.toLowerCase().includes("sam's club") || p.supplierName.toLowerCase().includes("sams club"))) ||
        (p.name && (
            p.name.toLowerCase().includes("jeep") || 
            p.name.toLowerCase().includes("member's mark") || 
            p.name.toLowerCase().includes("members mark") || 
            p.name.toLowerCase().includes("crystal bohemia")
        ));

    if (isSamsClub) {
        return {
            id: 'batch_sams_club_pampulha',
            name: "Lote Sam's Club (Pampulha)",
            tag: "Sam's Club",
            iconType: 'sams'
        };
    }

    // 2. Lote 10 Campeões (Tropical)
    const strategicCodes = [
        'ORG-360-01', 'ORG-BAM-02', 'COZ-ESP-03', 'COZ-SPR-04', 'COZ-POT-05',
        'ILU-SEN-06', 'BAN-LUX-07', 'BAN-TOA-08', 'DEC-DIF-09', 'DEC-VAS-10',
        'ORG-M-01', 'COZ-G-02', 'ILU-C-03', 'BAN-K-04', 'DEC-E-05',
        'ORG-E-06', 'COZ-M-07', 'ILU-A-08', 'BAN-P-09', 'DEC-P-10'
    ];
    const isTropical = 
        (p.code && strategicCodes.includes(p.code)) ||
        (p.supplierName && p.supplierName.toLowerCase().includes('tropical'));

    if (isTropical) {
        return {
            id: 'batch_tropical_top10',
            name: "Lote 10 Campeões (Tropical)",
            tag: "Tropical",
            iconType: 'tropical'
        };
    }

    // 3. Lote Catálogo PDF Preset (Tabela Oficial 1351 a 1405)
    const presetCodes = ['1351', '1356', '1361', '1366', '1371', '1376', '1381', '1386', '1391', '1396', '1398', '1402', '1405'];
    if (p.code && presetCodes.includes(p.code)) {
        return {
            id: 'batch_pdf_preset_catalog',
            name: "Lote Catálogo PDF (Tabela Oficial)",
            tag: "Catálogo PDF",
            iconType: 'pdf'
        };
    }

    // 4. Outros Itens Importados
    if (p.isImported) {
        if (p.invoiceNumber) {
            return {
                id: `batch_nf_${p.invoiceNumber}`,
                name: `Lote NF #${p.invoiceNumber}${p.purchaseDate ? ` (${p.purchaseDate})` : ''}`,
                tag: 'Nota Fiscal',
                iconType: 'file'
            };
        }
        if (p.supplierName && p.supplierName !== 'Distribuidora Multiluz Ferramentas') {
            return {
                id: `batch_sup_${p.supplierName.replace(/\s+/g, '_')}`,
                name: `Lote ${p.supplierName}${p.purchaseDate ? ` (${p.purchaseDate})` : ''}`,
                tag: 'Fornecedor',
                iconType: 'file'
            };
        }
        if (p.purchaseDate) {
            return {
                id: `batch_date_${p.purchaseDate}`,
                name: `Lote Importação (${p.purchaseDate})`,
                tag: 'Data',
                iconType: 'file'
            };
        }
        return {
            id: 'batch_imported_general',
            name: 'Lote Importações Gerais',
            tag: 'Importado',
            iconType: 'file'
        };
    }

    return {
        id: 'batch_manual_products',
        name: 'Cadastro Manual / Estoque Local',
        tag: 'Estoque Manual',
        iconType: 'manual'
    };
}

// Acervo e itens extraídos diretamente do documento / PDF anexo e catálogo estratégico
export const PDF_PRESET_PRODUCTS: Array<{
    code: string;
    category: string;
    name: string;
    packagingType: 'Unidade' | 'Caixa' | 'Pacote' | 'Lote';
    price: number;
    costPrice: number;
    stock: number;
    imageUrl: string;
    description: string;
}> = [
    // 10 Itens Coleção Utilidades Domésticas - Sam's Club (Pampulha)
    {
        code: 'SC-JEEP-1200',
        category: 'Cozinha Contemporânea & Mesa Posta',
        name: 'Copo Térmico Jeep com Canudo e Alça Ergonômica 1200ml',
        packagingType: 'Unidade',
        price: 149.90,
        costPrice: 89.98,
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
        description: 'Copo térmico em aço inoxidável com parede dupla e isolamento a vácuo oficial Jeep 1200ml com canudo.'
    },
    {
        code: 'SC-GAR-JEEP',
        category: 'Cozinha Contemporânea & Mesa Posta',
        name: 'Garrafa Térmica Jeep Adventure 1000ml Aço Inox Vácuo',
        packagingType: 'Unidade',
        price: 299.90,
        costPrice: 199.98,
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800',
        description: 'Garrafa térmica em aço inox 18/8 com isolamento a vácuo licenciada Jeep 1000ml.'
    },
    {
        code: 'SC-MM-FRP3',
        category: 'Cozinha Contemporânea & Mesa Posta',
        name: 'Conjunto Café French Press Prensa Francesa Member\'s Mark 3 Peças',
        packagingType: 'Caixa',
        price: 239.90,
        costPrice: 149.98,
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800',
        description: 'Kit de café com Prensa Francesa em vidro borossilicato e inox + 2 copos parede dupla Member\'s Mark.'
    },
    {
        code: 'SC-MM-TERM2',
        category: 'Cozinha Contemporânea & Mesa Posta',
        name: 'Conjunto Térmico para Café com Garrafa e Bule de Mesa 2 Peças',
        packagingType: 'Caixa',
        price: 229.90,
        costPrice: 139.99,
        stock: 14,
        imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=800',
        description: 'Conjunto térmico contemporâneo com garrafa térmica e bule de mesa acabamento acetinado 2 Peças.'
    },
    {
        code: 'SC-TOG-TAL30',
        category: 'Cozinha Contemporânea & Mesa Posta',
        name: 'Conjunto de Faqueiro / Talheres Drop Tognana em Aço Inox 30 Peças',
        packagingType: 'Caixa',
        price: 219.90,
        costPrice: 129.98,
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800',
        description: 'Faqueiro italiano Tognana Drop 30 peças em aço inox polido com acabamento espelhado.'
    },
    {
        code: 'SC-MM-LIX60',
        category: 'Organização & Praticidade',
        name: 'Lixeira Seletiva Dupla Dual Korb 60L em Aço Inox Anti-Digital Member\'s Mark',
        packagingType: 'Caixa',
        price: 799.90,
        costPrice: 539.98,
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
        description: 'Lixeira dupla de pedal 60L (2x30L) em aço inox escovado anti-marcas e fechamento Soft-Close.'
    },
    {
        code: 'SC-MM-CEST3',
        category: 'Organização & Praticidade',
        name: 'Conjunto de Cestos Decorativos e Organizadores em Palha Natural Member\'s Mark',
        packagingType: 'Caixa',
        price: 399.90,
        costPrice: 269.98,
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800',
        description: 'Kit de cestos organizadores tecidos à mão em fibra natural de palha e folhas trançadas com alças.'
    },
    {
        code: 'SC-OU-LUM-PR',
        category: 'Organização & Praticidade',
        name: 'Kit de Cestos Organizadores Multiuso Lume Preto Fosco - Ou',
        packagingType: 'Caixa',
        price: 139.90,
        costPrice: 79.97,
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=800',
        description: 'Conjunto de cestos organizadores Lume na cor preto fosco com design vazado contemporâneo.'
    },
    {
        code: 'SC-OU-LUM-VD',
        category: 'Organização & Praticidade',
        name: 'Kit de Cestos Organizadores Multiuso Lume Verde Musgo Botanical - Ou',
        packagingType: 'Caixa',
        price: 139.90,
        costPrice: 79.97,
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
        description: 'Conjunto de cestos organizadores Lume na elegante cor Verde Musgo Botanical fosco.'
    },
    {
        code: 'SC-BOH-WHS6',
        category: 'Cozinha Contemporânea & Mesa Posta',
        name: 'Conjunto de Copos para Whisky Lauros Crystal Bohemia 320ml 6 Peças',
        packagingType: 'Caixa',
        price: 179.90,
        costPrice: 99.98,
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&q=80&w=800',
        description: 'Jogo com 6 copos de whisky 320ml lapidados em puro Cristal de Titânio Bohemia República Tcheca.'
    },
    // 10 Itens Campeões de Venda (Tropical / Importação Estratégica)
    {
        code: 'ORG-360-01',
        category: 'Organização & Praticidade',
        name: 'Organizador Giratório Multiuso 360° com Divisórias Acrílicas',
        packagingType: 'Unidade',
        price: 64.90,
        costPrice: 24.00,
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=800',
        description: 'Organizador giratório 360° com divisórias transparentes em acrílico cristal de alta resistência. Rolamento suave em esferas de aço.'
    },
    {
        code: 'ORG-BAM-02',
        category: 'Organização & Praticidade',
        name: 'Caixa Organizadora com Tampa em Bambu Natural & Corpo Fosco',
        packagingType: 'Unidade',
        price: 79.90,
        costPrice: 28.00,
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800',
        description: 'Caixa organizadora modular com tampa em bambu natural ecológico e corpo em polipropileno fosco resistente.'
    },
    {
        code: 'COZ-ESP-03',
        category: 'Cozinha Contemporânea & Mesa Posta',
        name: 'Porta-Temperos Giratório Inox com 12 Frascos de Vidro Herméticos',
        packagingType: 'Unidade',
        price: 129.90,
        costPrice: 48.00,
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&q=80&w=800',
        description: 'Suporte giratório em aço inoxidável escovado com 12 frascos de vidro herméticos com dosadores duplos.'
    },
    {
        code: 'COZ-SPR-04',
        category: 'Cozinha Contemporânea & Mesa Posta',
        name: 'Pulverizador / Spray Dosador para Azeite e Vinagre em Vidro com Bico Inox',
        packagingType: 'Unidade',
        price: 39.90,
        costPrice: 14.00,
        stock: 45,
        imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800',
        description: 'Borrifador dosador gourmet em vidro borossilicato com gatilho e tampa em aço inox para Air Fryer e saladas.'
    },
    {
        code: 'ILU-TCH-05',
        category: 'Iluminação Decorativa & Smart Light',
        name: 'Luminária de Mesa Touch Sem Fio Recarregável Minimalista',
        packagingType: 'Unidade',
        price: 109.90,
        costPrice: 38.00,
        stock: 22,
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800',
        description: 'Luminária portátil contemporânea de mesa em corpo de alumínio usinado. Bateria recarregável USB-C, acionamento touch e 3 tons de cor.'
    },
    {
        code: 'ILU-BAR-06',
        category: 'Iluminação Decorativa & Smart Light',
        name: 'Barra de Luz LED com Sensor de Presença e Fixação Magnética USB',
        packagingType: 'Unidade',
        price: 49.90,
        costPrice: 18.00,
        stock: 35,
        imageUrl: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&q=80&w=800',
        description: 'Barra ultrafina de iluminação LED com sensor infravermelho e fotocélula. Fixação magnética sem fios e bateria USB.'
    },
    {
        code: 'BAN-LUX-07',
        category: 'Banheiro, Lavabo & Spa Residencial',
        name: 'Kit Lavabo Luxo em Vidro Canelado com Válvula Pump Matte',
        packagingType: 'Caixa',
        price: 119.90,
        costPrice: 44.00,
        stock: 16,
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
        description: 'Conjunto premium em vidro canelado texturizado com válvula pump preta fosca, porta-escovas e bandeja de apoio.'
    },
    {
        code: 'BAN-TOA-08',
        category: 'Banheiro, Lavabo & Spa Residencial',
        name: 'Porta-Toalhas e Suportes de Box em Alumínio Espacial Autoadesivo',
        packagingType: 'Unidade',
        price: 54.90,
        costPrice: 20.00,
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=800',
        description: 'Porta-toalhas e prateleira de box em alumínio espacial anticorrosivo preto fosco com fixação autoadesiva ultra resistente.'
    },
    {
        code: 'DEC-DIF-09',
        category: 'Decoração, Aromas & Estilo de Vida',
        name: 'Difusor & Umidificador Ultrassônico de Aromas Efeito Chama de Fogo',
        packagingType: 'Unidade',
        price: 129.90,
        costPrice: 45.00,
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800',
        description: 'Aromatizador e umidificador ultrassônico com LED que projeta efeito de fogo suave de lareira. Compatível com óleos essenciais.'
    },
    {
        code: 'DEC-VAS-10',
        category: 'Decoração, Aromas & Estilo de Vida',
        name: 'Vaso Decorativo em Cerâmica com Textura Orgânica & Design Nórdico',
        packagingType: 'Unidade',
        price: 79.90,
        costPrice: 28.00,
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=800',
        description: 'Vaso decorativo contemporâneo em cerâmica artesanal fosca com textura orgânica e curvas nórdicas/japandi.'
    },
    // Acervo de Ferramentas & Máquinas
    { 
        code: '1351', 
        category: 'Ferramentas & Máquinas', 
        name: 'Furadeira de impacto', 
        packagingType: 'Unidade', 
        price: 289.90, 
        costPrice: 160.00, 
        stock: 12, 
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800',
        description: 'Furadeira de impacto profissional de alta potência para alvenaria, concreto e madeira.'
    },
    { 
        code: '1352', 
        category: 'Ferramentas & Máquinas', 
        name: 'Furadeira de impacto — unidade', 
        packagingType: 'Unidade', 
        price: 289.90, 
        costPrice: 160.00, 
        stock: 10, 
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800',
        description: 'Furadeira de impacto individual com empunhadura ergonômica e chave de mandril.'
    },
    { 
        code: '1353', 
        category: 'Ferramentas & Máquinas', 
        name: 'Furadeira de impacto — caixa', 
        packagingType: 'Caixa', 
        price: 1650.00, 
        costPrice: 900.00, 
        stock: 5, 
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800',
        description: 'Caixa atacado com 6 unidades de furadeira de impacto para obras e revenda.'
    },
    { 
        code: '1354', 
        category: 'Ferramentas & Máquinas', 
        name: 'Furadeira de impacto — Pacote', 
        packagingType: 'Pacote', 
        price: 1100.00, 
        costPrice: 620.00, 
        stock: 4, 
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800',
        description: 'Pacote promocional com 4 furadeiras de impacto e kit de brocas multimateriais.'
    },
    { 
        code: '1355', 
        category: 'Ferramentas & Máquinas', 
        name: 'Furadeira de impacto — lote', 
        packagingType: 'Lote', 
        price: 2990.00, 
        costPrice: 1750.00, 
        stock: 3, 
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800',
        description: 'Lote comercial fechado de furadeiras de impacto para construtoras e atacado.'
    },
    { 
        code: '1356', 
        category: 'Ferramentas & Máquinas', 
        name: 'Parafusadeira', 
        packagingType: 'Unidade', 
        price: 249.90, 
        costPrice: 135.00, 
        stock: 15, 
        imageUrl: 'https://images.unsplash.com/photo-1622675363311-3e1904dc1885?auto=format&fit=crop&q=80&w=800',
        description: 'Parafusadeira à bateria com controle de torque variável e luz LED de trabalho.'
    },
    { 
        code: '1357', 
        category: 'Ferramentas & Máquinas', 
        name: 'Parafusadeira — unidade', 
        packagingType: 'Unidade', 
        price: 249.90, 
        costPrice: 135.00, 
        stock: 12, 
        imageUrl: 'https://images.unsplash.com/photo-1622675363311-3e1904dc1885?auto=format&fit=crop&q=80&w=800',
        description: 'Parafusadeira unidade avulsa com carregador bivolt automático e 2 baterias de lítio.'
    },
    { 
        code: '1358', 
        category: 'Ferramentas & Máquinas', 
        name: 'Parafusadeira — caixa', 
        packagingType: 'Caixa', 
        price: 1420.00, 
        costPrice: 780.00, 
        stock: 6, 
        imageUrl: 'https://images.unsplash.com/photo-1622675363311-3e1904dc1885?auto=format&fit=crop&q=80&w=800',
        description: 'Caixa master com 6 parafusadeiras completas com maleta de transporte.'
    },
    { 
        code: '1359', 
        category: 'Ferramentas & Máquinas', 
        name: 'Parafusadeira — Pacote', 
        packagingType: 'Pacote', 
        price: 950.00, 
        costPrice: 510.00, 
        stock: 5, 
        imageUrl: 'https://images.unsplash.com/photo-1622675363311-3e1904dc1885?auto=format&fit=crop&q=80&w=800',
        description: 'Pacote com 4 parafusadeiras e kit completo com 32 bits e pontas magnéticas.'
    },
    { 
        code: '1360', 
        category: 'Ferramentas & Máquinas', 
        name: 'Parafusadeira — lote', 
        packagingType: 'Lote', 
        price: 2650.00, 
        costPrice: 1450.00, 
        stock: 3, 
        imageUrl: 'https://images.unsplash.com/photo-1622675363311-3e1904dc1885?auto=format&fit=crop&q=80&w=800',
        description: 'Lote corporativo de parafusadeiras elétricas de alta durabilidade.'
    },
    { 
        code: '1361', 
        category: 'Ferramentas & Máquinas', 
        name: 'Esmerilhadeira', 
        packagingType: 'Unidade', 
        price: 319.90, 
        costPrice: 180.00, 
        stock: 8, 
        imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=800',
        description: 'Esmerilhadeira angular robusta para cortes e desbastes metálicos e alvenaria.'
    },
    { 
        code: '1362', 
        category: 'Ferramentas & Máquinas', 
        name: 'Esmerilhadeira — disco 4"', 
        packagingType: 'Unidade', 
        price: 339.90, 
        costPrice: 195.00, 
        stock: 14, 
        imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=800',
        description: 'Esmerilhadeira angular compatível com disco 4.1/2" (115mm) com capa de proteção.'
    },
    { 
        code: '1363', 
        category: 'Ferramentas & Máquinas', 
        name: 'Esmerilhadeira — disco 7"', 
        packagingType: 'Unidade', 
        price: 389.90, 
        costPrice: 220.00, 
        stock: 10, 
        imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=800',
        description: 'Esmerilhadeira angular de alto rendimento para disco 7" (180mm) pesada industrial.'
    }
];

interface ProductImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (count: number) => void;
    onEditProduct?: (product: Product) => void;
}

export const ProductImportModal: React.FC<ProductImportModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    onEditProduct
}) => {
    const [activeTab, setActiveTab] = useState<'upload_file' | 'pampulha_preset' | 'pdf_preset' | 'text' | 'delete_imported'>('upload_file');
    
    // Opção para limpar produtos antigos da Pampulha antes de importar
    const [deletePreviousPampulhaBeforeImport, setDeletePreviousPampulhaBeforeImport] = useState<boolean>(true);

    // Itens do preset Pampulha (Condutores + Materiais Elétricos, Hidráulicos e Telefonia)
    const [selectedPampulhaItems, setSelectedPampulhaItems] = useState<Record<string, boolean>>(() => {
        const init: Record<string, boolean> = {};
        allPampulhaProducts.forEach(p => { init[p.code] = true; });
        return init;
    });

    // Paginação e busca de alta performance para o Catálogo Pampulha
    const [pampulhaPage, setPampulhaPage] = useState<number>(1);
    const [pampulhaSearch, setPampulhaSearch] = useState<string>('');
    const PAMPULHA_PER_PAGE = 25;

    const filteredPampulhaProducts = useMemo(() => {
        if (!pampulhaSearch.trim()) return allPampulhaProducts;
        const q = pampulhaSearch.toLowerCase().trim();
        return allPampulhaProducts.filter(p => 
            p.name?.toLowerCase().includes(q) ||
            p.code?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.ncm?.toLowerCase().includes(q)
        );
    }, [pampulhaSearch]);

    const totalPampulhaPages = Math.max(1, Math.ceil(filteredPampulhaProducts.length / PAMPULHA_PER_PAGE));
    const paginatedPampulhaProducts = useMemo(() => {
        const start = (pampulhaPage - 1) * PAMPULHA_PER_PAGE;
        return filteredPampulhaProducts.slice(start, start + PAMPULHA_PER_PAGE);
    }, [filteredPampulhaProducts, pampulhaPage]);

    // Itens do preset do PDF Ferramentas
    const [selectedPdfItems, setSelectedPdfItems] = useState<Record<string, boolean>>(() => {
        const init: Record<string, boolean> = {};
        PDF_PRESET_PRODUCTS.forEach(p => { init[p.code] = true; });
        return init;
    });

    // Itens parseados de upload / texto
    const [parsedProducts, setParsedProducts] = useState<ParsedProductItem[]>([]);
    const [selectedParsedItems, setSelectedParsedItems] = useState<Record<number, boolean>>({});
    const [uploadedFileName, setUploadedFileName] = useState<string>('');
    const [isParsingFile, setIsParsingFile] = useState<boolean>(false);

    const [isImporting, setIsImporting] = useState(false);
    const [publishDirectlyToStore, setPublishDirectlyToStore] = useState(false);
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
    const [rawText, setRawText] = useState('');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Estado para produtos já existentes no banco de dados e controle de exclusão por lote
    const [savedProducts, setSavedProducts] = useState<Product[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string>('all');
    const [selectedForDeletion, setSelectedForDeletion] = useState<Record<string, boolean>>({});
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteProgress, setDeleteProgress] = useState<{ current: number; total: number } | null>(null);
    const [searchDeletionTerm, setSearchDeletionTerm] = useState('');
    const [deletionCategoryFilter, setDeletionCategoryFilter] = useState<string>('all');
    
    // Modal de confirmação seguro embutido no componente (substitui window.confirm que falha em iframes)
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        actionLabel: string;
        isDanger: boolean;
        onConfirm: () => Promise<void> | void;
    } | null>(null);

    // Data do dia atual formatada (YYYY-MM-DD)
    const todayDate = useMemo(() => {
        return new Date().toISOString().split('T')[0];
    }, []);

    // Sincroniza produtos já cadastrados no Firestore em tempo real
    useEffect(() => {
        if (!isOpen) return;
        const unsub = subscribeToCollection('products', (data) => {
            if (data) {
                setSavedProducts(data as Product[]);
            }
        });
        return () => unsub();
    }, [isOpen]);

    // Identifica e agrupa dinamicamente todos os lotes cadastrados no sistema
    const detectedBatches = useMemo<DetectedBatch[]>(() => {
        const map: Record<string, {
            id: string;
            name: string;
            tag: string;
            iconType: DetectedBatch['iconType'];
            products: Product[];
        }> = {};

        savedProducts.forEach(p => {
            const info = getProductBatchInfo(p);
            if (!map[info.id]) {
                map[info.id] = {
                    id: info.id,
                    name: info.name,
                    tag: info.tag,
                    iconType: info.iconType,
                    products: []
                };
            }
            map[info.id].products.push(p);
        });

        const colorMap: Record<string, { colorClass: string; badgeBg: string; badgeText: string }> = {
            batch_pampulha_condutores_20260901: { 
                colorClass: 'border-orange-500 bg-orange-50/70 text-orange-950', 
                badgeBg: 'bg-orange-100', 
                badgeText: 'text-orange-900' 
            },
            batch_sams_club_pampulha: { 
                colorClass: 'border-blue-500 bg-blue-50/70 text-blue-950', 
                badgeBg: 'bg-blue-100', 
                badgeText: 'text-blue-800' 
            },
            batch_tropical_top10: { 
                colorClass: 'border-emerald-500 bg-emerald-50/70 text-emerald-950', 
                badgeBg: 'bg-emerald-100', 
                badgeText: 'text-emerald-800' 
            },
            batch_pdf_preset_catalog: { 
                colorClass: 'border-amber-500 bg-amber-50/70 text-amber-950', 
                badgeBg: 'bg-amber-100', 
                badgeText: 'text-amber-900' 
            },
            batch_manual_products: { 
                colorClass: 'border-slate-300 bg-slate-50 text-slate-800', 
                badgeBg: 'bg-slate-100', 
                badgeText: 'text-slate-700' 
            }
        };

        const defaultStyle = { 
            colorClass: 'border-purple-400 bg-purple-50/70 text-purple-950', 
            badgeBg: 'bg-purple-100', 
            badgeText: 'text-purple-900' 
        };

        return Object.values(map).map(item => {
            const style = colorMap[item.id] || defaultStyle;
            return {
                id: item.id,
                name: item.name,
                tag: item.tag,
                productCount: item.products.length,
                totalStock: item.products.reduce((acc, p) => acc + (p.stock || 0), 0),
                productIds: item.products.map(p => p.id).filter(Boolean) as string[],
                products: item.products,
                colorClass: style.colorClass,
                badgeBg: style.badgeBg,
                badgeText: style.badgeText,
                iconType: item.iconType
            };
        }).sort((a, b) => {
            const order = ['batch_pampulha_condutores_20260901', 'batch_sams_club_pampulha', 'batch_tropical_top10', 'batch_pdf_preset_catalog'];
            const idxA = order.indexOf(a.id);
            const idxB = order.indexOf(b.id);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return b.productCount - a.productCount;
        });
    }, [savedProducts]);

    // Lote ativo selecionado pelo usuário para filtro/exclusão
    const activeSelectedBatch = useMemo(() => {
        if (selectedBatchId === 'all') return null;
        return detectedBatches.find(b => b.id === selectedBatchId) || null;
    }, [selectedBatchId, detectedBatches]);

    // Filtra produtos que foram importados ou cujos códigos pertencem ao acervo de importação
    const importedSavedProducts = useMemo(() => {
        const presetCodes = PDF_PRESET_PRODUCTS.map(p => p.code);
        const pampulhaCodes = pampulhaCondutoresProducts.map(p => p.code);
        return savedProducts.filter(p => 
            p.isImported === true || 
            (p.code && (presetCodes.includes(p.code) || pampulhaCodes.includes(p.code)))
        );
    }, [savedProducts]);

    // Lista filtrada para a tela de exclusão com suporte a Lote, Categoria e Termo de Busca
    const filteredForDeletion = useMemo(() => {
        return savedProducts.filter(p => {
            // 1. Filtro por Lote Específico
            if (selectedBatchId !== 'all') {
                const batchInfo = getProductBatchInfo(p);
                if (batchInfo.id !== selectedBatchId) return false;
            }

            // 2. Filtro por Categoria / Apenas Importados
            if (deletionCategoryFilter === 'imported') {
                const presetCodes = PDF_PRESET_PRODUCTS.map(x => x.code);
                const isImp = p.isImported === true || (p.code && presetCodes.includes(p.code));
                if (!isImp) return false;
            } else if (deletionCategoryFilter !== 'all') {
                if (p.category !== deletionCategoryFilter) return false;
            }

            // 3. Busca por texto (Código, Nome, Categoria, Nome do Lote)
            if (searchDeletionTerm.trim()) {
                const q = searchDeletionTerm.toLowerCase();
                const matchName = (p.name || '').toLowerCase().includes(q);
                const matchCode = (p.code || '').toLowerCase().includes(q);
                const matchCat = (p.category || '').toLowerCase().includes(q);
                const batchInfo = getProductBatchInfo(p);
                const matchBatch = batchInfo.name.toLowerCase().includes(q) || batchInfo.tag.toLowerCase().includes(q);
                return matchName || matchCode || matchCat || matchBatch;
            }

            return true;
        });
    }, [savedProducts, selectedBatchId, deletionCategoryFilter, searchDeletionTerm]);

    // Paginação para a aba de exclusão e gestão de lotes (evita travar a UI ao renderizar milhares de itens)
    const [deletionPage, setDeletionPage] = useState<number>(1);
    const DELETION_PER_PAGE = 25;

    useEffect(() => {
        setDeletionPage(1);
    }, [selectedBatchId, deletionCategoryFilter, searchDeletionTerm]);

    const totalDeletionPages = Math.max(1, Math.ceil(filteredForDeletion.length / DELETION_PER_PAGE));
    const paginatedForDeletion = useMemo(() => {
        const start = (deletionPage - 1) * DELETION_PER_PAGE;
        return filteredForDeletion.slice(start, start + DELETION_PER_PAGE);
    }, [filteredForDeletion, deletionPage]);

    // --- CONTROLES DA ABA PAMPULHA (TABELA OFICIAL 34 PÁGINAS) ---
    const toggleAllPampulha = (val: boolean) => {
        const updated: Record<string, boolean> = {};
        allPampulhaProducts.forEach(p => { updated[p.code] = val; });
        setSelectedPampulhaItems(updated);
    };

    const togglePampulhaItem = (code: string) => {
        setSelectedPampulhaItems(prev => ({ ...prev, [code]: !prev[code] }));
    };

    const selectedPampulhaCount = useMemo(() => {
        let count = 0;
        for (const code in selectedPampulhaItems) {
            if (selectedPampulhaItems[code]) count++;
        }
        return count;
    }, [selectedPampulhaItems]);

    // --- CONTROLES DA ABA PDF PRESET ---
    const toggleAllPdf = (val: boolean) => {
        const updated: Record<string, boolean> = {};
        PDF_PRESET_PRODUCTS.forEach(p => { updated[p.code] = val; });
        setSelectedPdfItems(updated);
    };

    const togglePdfItem = (code: string) => {
        setSelectedPdfItems(prev => ({ ...prev, [code]: !prev[code] }));
    };

    const selectedPdfCount = useMemo(() => {
        let count = 0;
        for (const code in selectedPdfItems) {
            if (selectedPdfItems[code]) count++;
        }
        return count;
    }, [selectedPdfItems]);

    // --- CONTROLES DE PARSE DE ARQUIVO (PDF, CSV, TXT) ---
    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadedFileName(file.name);
        setIsParsingFile(true);
        setFeedback(null);

        try {
            const content = await extractTextFromFile(file);
            if (!content || !content.trim()) {
                // Se não extraiu texto do PDF (ex: PDF escaneado em imagem), sugere o catálogo anexo ou texto
                setFeedback({
                    type: 'error',
                    message: `Não foi possível extrair texto legível de "${file.name}". Se for um PDF de imagens escaneadas, utilize a aba "Catálogo Anexo" ou copie e cole o texto na aba "Colar Texto".`
                });
                setIsParsingFile(false);
                return;
            }

            const parsed = parseTextToProducts(content);
            if (parsed.length === 0) {
                setFeedback({
                    type: 'error',
                    message: `Nenhum produto formatado foi reconhecido no arquivo "${file.name}". Verifique o formato ou use o modelo CSV.`
                });
            } else {
                setParsedProducts(parsed);
                const initSelection: Record<number, boolean> = {};
                parsed.forEach((_, idx) => { initSelection[idx] = true; });
                setSelectedParsedItems(initSelection);
                setFeedback({
                    type: 'success',
                    message: `Sucesso! ${parsed.length} produtos identificados e prontos para conferência no arquivo "${file.name}".`
                });
            }
        } catch (err: any) {
            console.error('Erro ao ler arquivo:', err);
            setFeedback({ type: 'error', message: 'Erro ao processar arquivo: ' + err.message });
        } finally {
            setIsParsingFile(false);
        }
    };

    const toggleAllParsed = (val: boolean) => {
        const updated: Record<number, boolean> = {};
        parsedProducts.forEach((_, idx) => { updated[idx] = val; });
        setSelectedParsedItems(updated);
    };

    const toggleParsedItem = (idx: number) => {
        setSelectedParsedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const selectedParsedCount = Object.values(selectedParsedItems).filter(Boolean).length;

    // --- CONTROLES DA ABA TEXTO ---
    const handleParseTextManual = () => {
        if (!rawText.trim()) {
            setFeedback({ type: 'error', message: 'Cole ao menos uma linha de produto no campo abaixo.' });
            return;
        }

        const parsed = parseTextToProducts(rawText);
        if (parsed.length === 0) {
            setFeedback({ type: 'error', message: 'Não foi possível identificar produtos nas linhas informadas.' });
            return;
        }

        setParsedProducts(parsed);
        const initSelection: Record<number, boolean> = {};
        parsed.forEach((_, idx) => { initSelection[idx] = true; });
        setSelectedParsedItems(initSelection);
        setFeedback({
            type: 'success',
            message: `${parsed.length} produtos identificados! Revise na tabela e clique em "Salvar no Banco".`
        });
    };

    // --- EXECUÇÃO DE IMPORTAÇÃO (BANCO DE DADOS) ---
    const handleImportSelectedPampulha = async () => {
        const itemsToImport = allPampulhaProducts.filter(p => selectedPampulhaItems[p.code]);
        if (itemsToImport.length === 0) {
            setFeedback({ type: 'error', message: 'Selecione ao menos um produto do catálogo Pampulha para importar.' });
            return;
        }

        setIsImporting(true);
        setProgress({ current: 0, total: itemsToImport.length });

        try {
            // 1. Se solicitado, limpa produtos antigos da tabela Pampulha antes de importar os novos
            if (deletePreviousPampulhaBeforeImport) {
                const oldPampulhaIds = savedProducts
                    .filter(p => {
                        const b = String(p.importBatchName || p.importBatchId || '').toLowerCase();
                        const d = String(p.department || '').toLowerCase();
                        const t = String((p as any).table || '').toLowerCase();
                        const s = String(p.supplierName || '').toLowerCase();
                        return b.includes('pampulha') || d.includes('pampulha') || t === 'pampulha' || s.includes('pampulha');
                    })
                    .map(p => p.id)
                    .filter(Boolean);

                if (oldPampulhaIds.length > 0) {
                    await deleteDocumentsBatch('products', oldPampulhaIds);
                }
            }

            const productPayloads: Omit<Product, 'id'>[] = itemsToImport.map(item => ({
                ...item,
                stock: 0,
                isActive: true,
                showInStore: publishDirectlyToStore, // Não ativo para exibição na página principal por padrão
                costPrice: item.costPrice, // Preço da tabela como preço de custo
                imageUrl: item.imageUrl || '/ponto_chave_logo.jpg', // Imagem padrão Ponto Chave do Lar
                purchaseDate: todayDate,
                importBatchId: item.importBatchId || 'batch_pampulha_geral_20260901',
                importBatchName: item.importBatchName || 'Catálogo Geral Pampulha (Tabela Oficial)',
                importedAt: new Date().toISOString()
            }));

            const importedCount = await createDocumentsBatch('products', productPayloads, (current, total) => {
                setProgress({ current, total });
            });

            onSuccess(importedCount);
            onClose();
        } catch (err: any) {
            console.error('Erro ao importar itens do catálogo Pampulha:', err);
            setFeedback({ type: 'error', message: 'Falha na importação: ' + (err.message || 'Erro de conexão') });
        } finally {
            setIsImporting(false);
            setProgress(null);
        }
    };

    const handleDeleteOnlyPampulhaDirectly = () => {
        const pampulhaProducts = savedProducts.filter(p => {
            const b = String(p.importBatchName || p.importBatchId || '').toLowerCase();
            const d = String(p.department || '').toLowerCase();
            const t = String((p as any).table || '').toLowerCase();
            const s = String(p.supplierName || '').toLowerCase();
            return b.includes('pampulha') || d.includes('pampulha') || t === 'pampulha' || s.includes('pampulha');
        });

        if (pampulhaProducts.length === 0) {
            setFeedback({ type: 'error', message: 'Nenhum produto da tabela Pampulha cadastrado para excluir.' });
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: `Excluir Produtos da Pampulha?`,
            description: `Deseja realmente apagar todos os ${pampulhaProducts.length} produtos cadastrados da Tabela Pampulha do banco de dados Firestore? Esta ação deixará a tabela limpa para uma nova importação.`,
            actionLabel: `Sim, Excluir ${pampulhaProducts.length} Produtos`,
            isDanger: true,
            onConfirm: async () => {
                setConfirmModal(null);
                setIsDeleting(true);
                try {
                    const ids = pampulhaProducts.map(p => p.id).filter(Boolean);
                    await deleteDocumentsBatch('products', ids, (current, total) => {
                        setDeleteProgress({ current, total });
                    });
                    setFeedback({ type: 'success', message: `${ids.length} produtos da Tabela Pampulha foram excluídos com sucesso!` });
                } catch (err: any) {
                    setFeedback({ type: 'error', message: 'Erro ao excluir: ' + err.message });
                } finally {
                    setIsDeleting(false);
                    setDeleteProgress(null);
                }
            }
        });
    };

    const handleImportSelectedPdf = async () => {
        const itemsToImport = PDF_PRESET_PRODUCTS.filter(p => selectedPdfItems[p.code]);
        if (itemsToImport.length === 0) {
            setFeedback({ type: 'error', message: 'Selecione ao menos um produto da lista para importar.' });
            return;
        }

        setIsImporting(true);
        setProgress({ current: 0, total: itemsToImport.length });

        try {
            const productPayloads: Omit<Product, 'id'>[] = itemsToImport.map(item => ({
                code: item.code,
                sku: `SKU-${item.code}`,
                name: item.name,
                category: item.category,
                description: item.description,
                packagingType: item.packagingType as any,
                price: item.price,
                costPrice: item.costPrice,
                stock: item.stock,
                minStock: 3,
                isActive: true,
                showInStore: publishDirectlyToStore,
                isImported: true,
                imageUrl: item.imageUrl,
                gallery: [],
                purchaseDate: todayDate,
                supplierName: 'Distribuidora Multiluz Ferramentas',
                icmsPercent: 18,
                ipiPercent: 5,
                pisPercent: 1.65,
                cofinsPercent: 7.60,
                otherTaxesPercent: 0,
                profitMarginPercent: 40,
                voltage: 'Bivolt (110V/220V)',
                nature: 'Não-inflamável',
                material: 'Metal / Inox',
                importBatchId: 'batch_pdf_preset_catalog',
                importBatchName: 'Lote Catálogo PDF (Tabela Oficial)',
                importedAt: new Date().toISOString()
            }));

            const importedCount = await createDocumentsBatch('products', productPayloads, (current, total) => {
                setProgress({ current, total });
            });

            onSuccess(importedCount);
            onClose();
        } catch (err: any) {
            console.error('Erro ao importar itens do PDF:', err);
            setFeedback({ type: 'error', message: 'Falha na importação: ' + (err.message || 'Erro de conexão') });
        } finally {
            setIsImporting(false);
            setProgress(null);
        }
    };

    const handleImportParsedItems = async () => {
        const itemsToImport = parsedProducts.filter((_, idx) => selectedParsedItems[idx]);
        if (itemsToImport.length === 0) {
            setFeedback({ type: 'error', message: 'Selecione ao menos um item da lista para importar.' });
            return;
        }

        setIsImporting(true);
        setProgress({ current: 0, total: itemsToImport.length });
        const batchTimestamp = Date.now();
        const batchName = uploadedFileName 
            ? `Lote Arquivo: ${uploadedFileName}` 
            : `Lote Importação (${todayDate})`;

        try {
            const productPayloads: Partial<Product>[] = itemsToImport.map(item => {
                const isPampulha = 
                    (item.department && item.department.toLowerCase().includes('pampulha')) ||
                    (item.name && item.name.toLowerCase().includes('pampulha')) ||
                    (uploadedFileName && uploadedFileName.toLowerCase().includes('pampulha'));

                return {
                    code: item.code,
                    sku: `SKU-${item.code}`,
                    name: item.name,
                    category: item.category || 'Materiais Elétricos e Ferramentas',
                    department: item.department || (isPampulha ? 'Materiais Elétricos PAMPULHA' : undefined),
                    table: isPampulha ? 'Pampulha' : undefined,
                    packagingType: item.packagingType,
                    packagingDetail: item.packagingDetail || '1 un.',
                    description: item.description || `${item.name}. Fabricante: ${item.brand || 'Diversos'}. Embalagem: ${item.packagingDetail || '1 un.'}. Fornecido via Catálogo Oficial.`,
                    price: item.price,
                    costPrice: item.costPrice,
                    stock: item.stock || 0,
                    minStock: 2,
                    isActive: true,
                    showInStore: publishDirectlyToStore,
                    isImported: true,
                    imageUrl: item.imageUrl || '/ponto_chave_logo.jpg',
                    purchaseDate: todayDate,
                    supplierName: (item.brand && item.brand !== 'Pampulha / Diversos') 
                        ? item.brand 
                        : (isPampulha ? 'Distribuidora Multiluz Ferramentas' : (uploadedFileName ? `Importação ${uploadedFileName}` : 'Importação em Lote / Catálogo')),
                    voltage: item.voltage || 'Bivolt (110V/220V)',
                    nature: (item.nature && item.nature.includes('Inflamável') && !item.nature.includes('Não')) ? 'Inflamável' : 'Não-inflamável',
                    material: item.material || 'Termoplástico / Metal',
                    importBatchId: isPampulha ? 'batch_pampulha_geral_20260901' : `batch_custom_${batchTimestamp}`,
                    importBatchName: isPampulha ? 'Catálogo Geral Pampulha (Tabela Oficial)' : batchName,
                    importedAt: new Date().toISOString()
                };
            });

            const count = await createDocumentsBatch('products', productPayloads, (current, total) => {
                setProgress({ current, total });
            });

            onSuccess(count);
            onClose();
        } catch (err: any) {
            console.error('Erro na importação personalizada:', err);
            setFeedback({ type: 'error', message: 'Erro na importação: ' + err.message });
        } finally {
            setIsImporting(false);
            setProgress(null);
        }
    };

    // --- CONTROLES DE EXCLUSÃO E LIMPEZA ---
    const toggleSelectAllDeletion = (val: boolean) => {
        const updated: Record<string, boolean> = {};
        filteredForDeletion.forEach(p => {
            if (p.id) updated[p.id] = val;
        });
        setSelectedForDeletion(updated);
    };

    const toggleSelectDeletionItem = (id: string) => {
        setSelectedForDeletion(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const selectedDeletionCount = Object.keys(selectedForDeletion).filter(k => selectedForDeletion[k]).length;

    // Executa exclusão cirúrgica de SOMENTE UM LOTE ESPECÍFICO
    const requestDeleteBatch = (batch: DetectedBatch) => {
        if (!batch || batch.productIds.length === 0) {
            setFeedback({ type: 'error', message: 'Nenhum produto encontrado neste lote para exclusão.' });
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: `Excluir SOMENTE o Lote "${batch.name}" (${batch.productCount} produtos)?`,
            description: `Atenção: Apenas os ${batch.productCount} produtos pertencentes a este lote serão excluídos permanentemente do Firestore. Todos os demais lotes e produtos do seu estoque permanecerão 100% intactos e seguros.`,
            actionLabel: `Sim, Excluir Somente Este Lote (${batch.productCount})`,
            isDanger: true,
            onConfirm: async () => {
                setConfirmModal(null);
                setIsDeleting(true);
                setDeleteProgress({ current: 0, total: batch.productIds.length });
                let deletedCount = 0;

                try {
                    const deletedCount = await deleteDocumentsBatch('products', batch.productIds, (current, total) => {
                        setDeleteProgress({ current, total });
                    });

                    // Remove das seleções ativas
                    setSelectedForDeletion(prev => {
                        const copy = { ...prev };
                        batch.productIds.forEach(id => { delete copy[id]; });
                        return copy;
                    });
                    
                    setSelectedBatchId('all');
                    setFeedback({ 
                        type: 'success', 
                        message: `Sucesso! O lote "${batch.name}" com ${deletedCount} produto(s) foi excluído. Os outros lotes e produtos do sistema continuam preservados!` 
                    });
                } catch (err: any) {
                    console.error('Erro ao excluir lote:', err);
                    setFeedback({ type: 'error', message: 'Erro ao excluir lote: ' + (err.message || 'Falha de conexão') });
                } finally {
                    setIsDeleting(false);
                    setDeleteProgress(null);
                }
            }
        });
    };

    // Executa exclusão dos itens marcados
    const requestDeleteSelected = () => {
        const idsToDelete = Object.keys(selectedForDeletion).filter(k => selectedForDeletion[k]);
        if (idsToDelete.length === 0) {
            setFeedback({ type: 'error', message: 'Marque as caixas de seleção dos produtos que deseja excluir.' });
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: `Excluir ${idsToDelete.length} produto(s) selecionado(s)?`,
            description: `Você está prestes a remover permanentemente ${idsToDelete.length} produto(s) do banco de dados Firestore. Esta ação não poderá ser desfeita.`,
            actionLabel: `Sim, Excluir ${idsToDelete.length} Produtos`,
            isDanger: true,
            onConfirm: async () => {
                setConfirmModal(null);
                setIsDeleting(true);
                setDeleteProgress({ current: 0, total: idsToDelete.length });

                try {
                    const deletedCount = await deleteDocumentsBatch('products', idsToDelete, (current, total) => {
                        setDeleteProgress({ current, total });
                    });

                    setSelectedForDeletion({});
                    setFeedback({ 
                        type: 'success', 
                        message: `${deletedCount} produto(s) excluído(s) com sucesso do banco de dados!` 
                    });
                } catch (err: any) {
                    console.error('Erro ao excluir produtos:', err);
                    setFeedback({ type: 'error', message: 'Erro ao excluir produtos: ' + (err.message || 'Falha de conexão') });
                } finally {
                    setIsDeleting(false);
                    setDeleteProgress(null);
                }
            }
        });
    };

    // Executa exclusão de TODOS os importados
    const requestDeleteAllImported = () => {
        if (importedSavedProducts.length === 0) {
            setFeedback({ type: 'error', message: 'Não há produtos importados cadastrados no banco de dados.' });
            return;
        }

        const idsToDelete = importedSavedProducts.map(p => p.id).filter((id): id is string => Boolean(id));

        setConfirmModal({
            isOpen: true,
            title: `Limpar TODOS os ${importedSavedProducts.length} produtos importados?`,
            description: `Atenção: Todos os ${importedSavedProducts.length} produtos oriundos de importações serão excluídos do banco de dados Firestore para que você possa re-importar sem duplicações ou erros.`,
            actionLabel: `Sim, Limpar Todos (${importedSavedProducts.length})`,
            isDanger: true,
            onConfirm: async () => {
                setConfirmModal(null);
                setIsDeleting(true);
                setDeleteProgress({ current: 0, total: idsToDelete.length });

                try {
                    const deletedCount = await deleteDocumentsBatch('products', idsToDelete, (current, total) => {
                        setDeleteProgress({ current, total });
                    });

                    setSelectedForDeletion({});
                    setFeedback({ 
                        type: 'success', 
                        message: `Limpeza concluída! Todos os ${deletedCount} produtos importados foram removidos do banco.` 
                    });
                } catch (err: any) {
                    console.error('Erro ao excluir todos os produtos:', err);
                    setFeedback({ type: 'error', message: 'Erro ao excluir produtos: ' + (err.message || 'Falha de conexão') });
                } finally {
                    setIsDeleting(false);
                    setDeleteProgress(null);
                }
            }
        });
    };

    // Executa exclusão de 1 único item
    const requestDeleteSingle = (id: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: `Excluir produto "${name}"?`,
            description: `O produto será removido permanentemente do catálogo e do estoque no Firestore.`,
            actionLabel: 'Excluir Produto',
            isDanger: true,
            onConfirm: async () => {
                setConfirmModal(null);
                try {
                    await deleteDocument('products', id);
                    setSelectedForDeletion(prev => {
                        const copy = { ...prev };
                        delete copy[id];
                        return copy;
                    });
                    setFeedback({ type: 'success', message: `Produto "${name}" excluído com sucesso!` });
                } catch (err: any) {
                    setFeedback({ type: 'error', message: 'Erro ao excluir produto: ' + err.message });
                }
            }
        });
    };

    // Baixar Modelo CSV Oficial (conforme Cadastro de Material Elétrico Pampulha)
    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8," + 
            "codigo,departamento,classe,produto,tipo_marca,embalagem,preco\n" +
            "2394,Materiais Elétricos PAMPULHA,Materiais Elétricos e Ferramentas,CAIXA DE LUZ - PVC - FUNDO MÓVEL DUPLO ( FMD ) VERDE,RIB. FABRIL,45 un.,4.20\n" +
            "2392/7227,Materiais Elétricos PAMPULHA,Materiais Elétricos e Ferramentas,CONDULETE 3/4 FIXO TIPO C COM TAMPA,TRAMONTINA,1 un.,14.90\n" +
            "2397,Materiais Elétricos PAMPULHA,Materiais Elétricos e Ferramentas,INTERRUPTOR 1 TECLA SIMPLES 10A 250V,PERLEX,20 un.,6.50\n";
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "modelo_cadastro_material_eletrico_pampulha.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Baixar Catálogo Oficial Pampulha Completo em CSV
    const handleDownloadPampulhaCSV = () => {
        const link = document.createElement("a");
        link.setAttribute("href", "/modelos/material_eletrico_pampulha.csv");
        link.setAttribute("download", "material_eletrico_pampulha.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Baixar Catálogo Oficial Pampulha em PDF Oficial Formatado
    const handleDownloadPampulhaPDF = async () => {
        try {
            const { jsPDF } = await import('jspdf');
            const autoTableModule = await import('jspdf-autotable');
            const autoTable = (autoTableModule as any).default || autoTableModule;

            const doc = new jsPDF('landscape', 'pt', 'a4');
            
            // Header do PDF
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.text('Catálogo de Materiais Elétricos - PAMPULHA', 40, 35);
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(`Tabela Oficial Completa com ${allPampulhaProducts.length} itens formatados • Emitido em ${new Date().toLocaleDateString('pt-BR')}`, 40, 50);

            const tableRows = allPampulhaProducts.map(p => [
                p.code,
                p.department || 'Materiais Elétricos PAMPULHA',
                p.category || 'Materiais Elétricos e Ferramentas',
                p.name,
                p.supplierName || 'PAMPULHA',
                p.packagingDetail || p.packagingType || '1 un.',
                `R$ ${Number(p.costPrice || 0).toFixed(2).replace('.', ',')}`
            ]);

            autoTable(doc, {
                head: [['Código', 'Departamento', 'Classe', 'Produto', 'Tipo', 'Embalagem', 'Preço (R$)']],
                body: tableRows,
                startY: 60,
                theme: 'striped',
                styles: { fontSize: 7, cellPadding: 3 },
                headStyles: { fillColor: [245, 158, 11], textColor: [15, 23, 42], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { left: 30, right: 30 }
            });

            doc.save('catalogo_material_eletrico_pampulha.pdf');
        } catch (err: any) {
            console.error('Erro ao gerar PDF:', err);
            setFeedback({ type: 'error', message: 'Erro ao gerar PDF: ' + err.message });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col my-auto border border-gray-100 animate-in zoom-in-95 duration-200">
                
                {/* Header do Modal */}
                <div className="p-5 sm:p-6 border-b border-gray-100 bg-slate-950 text-white flex justify-between items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold mb-1.5 border border-amber-500/30">
                            <Sparkles size={13} className="text-amber-400" />
                            <span>Central de Importação & Gestão de Catálogo em Lote</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2.5">
                            <Upload size={24} className="text-amber-400" />
                            <span>Importador de Produtos & Gerenciador de Exclusão</span>
                        </h3>
                        <p className="text-xs text-gray-300 mt-0.5">
                            Data de inclusão/compra automática: <strong className="text-amber-400">{new Date().toLocaleDateString('pt-BR')}</strong> • Banco Firestore Sincronizado {allPampulhaProducts.length === 0 && <span className="text-emerald-300 font-semibold">• Tabela Pampulha: 0 itens (Zerada)</span>}
                        </p>
                    </div>

                    <button 
                        onClick={onClose}
                        disabled={isImporting || isDeleting}
                        className="p-2.5 text-gray-300 hover:text-white rounded-2xl hover:bg-white/10 transition-colors"
                        title="Fechar janela"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Feedback Toast */}
                {feedback && (
                    <div className={`p-4 mx-6 mt-4 rounded-2xl flex items-center justify-between text-xs font-bold ${
                        feedback.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-red-50 text-red-900 border border-red-300'
                    }`}>
                        <div className="flex items-center gap-2.5">
                            {feedback.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> : <AlertCircle size={18} className="text-red-600 shrink-0" />}
                            <span>{feedback.message}</span>
                        </div>
                        <button onClick={() => setFeedback(null)} className="text-gray-500 hover:text-gray-800 text-sm font-bold">✕</button>
                    </div>
                )}

                {/* Navegação por Abas */}
                <div className="px-6 pt-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 bg-gray-50">
                    <div className="flex flex-wrap gap-2">
                        {/* Se houver itens na tabela Pampulha */}
                        {allPampulhaProducts.length > 0 && (
                            <button
                                onClick={() => setActiveTab('pampulha_preset')}
                                className={`px-4 py-2.5 font-bold text-xs rounded-xl flex items-center gap-2 transition-all ${
                                    activeTab === 'pampulha_preset'
                                        ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-600/30'
                                        : 'bg-white hover:bg-gray-100 text-slate-700 border border-gray-300'
                                }`}
                            >
                                <Zap size={16} className={activeTab === 'pampulha_preset' ? 'text-slate-950' : 'text-amber-600'} />
                                <span>1. Catálogo Oficial Pampulha</span>
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400/50 text-slate-950 font-extrabold">
                                    {allPampulhaProducts.length} itens
                                </span>
                            </button>
                        )}

                        {/* Aba: Upload de Arquivo (PDF / CSV / TXT) */}
                        <button
                            onClick={() => setActiveTab('upload_file')}
                            className={`px-4 py-2.5 font-bold text-xs rounded-xl flex items-center gap-2 transition-all ${
                                activeTab === 'upload_file'
                                    ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-600/30'
                                    : 'bg-white hover:bg-gray-100 text-slate-700 border border-gray-300'
                            }`}
                        >
                            <FileUp size={16} className={activeTab === 'upload_file' ? 'text-slate-950' : 'text-amber-600'} />
                            <span>{allPampulhaProducts.length > 0 ? '2.' : '1.'} Upload de Arquivo (PDF, CSV, TXT)</span>
                        </button>

                        {/* Aba: Catálogo do PDF Anexo Preset */}
                        <button
                            onClick={() => setActiveTab('pdf_preset')}
                            className={`px-4 py-2.5 font-bold text-xs rounded-xl flex items-center gap-2 transition-all ${
                                activeTab === 'pdf_preset'
                                    ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-600/30'
                                    : 'bg-white hover:bg-gray-100 text-slate-700 border border-gray-300'
                            }`}
                        >
                            <Wrench size={16} className={activeTab === 'pdf_preset' ? 'text-slate-950' : 'text-amber-600'} />
                            <span>{allPampulhaProducts.length > 0 ? '3.' : '2.'} Catálogo Ferramentas (13 Itens)</span>
                        </button>

                        {/* Aba: Colar Texto */}
                        <button
                            onClick={() => setActiveTab('text')}
                            className={`px-4 py-2.5 font-bold text-xs rounded-xl flex items-center gap-2 transition-all ${
                                activeTab === 'text'
                                    ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-600/30'
                                    : 'bg-white hover:bg-gray-100 text-slate-700 border border-gray-300'
                            }`}
                        >
                            <Layers size={16} className={activeTab === 'text' ? 'text-slate-950' : 'text-amber-600'} />
                            <span>{allPampulhaProducts.length > 0 ? '4.' : '3.'} Colar Linhas / Texto</span>
                        </button>

                        {/* Aba: Excluir / Limpar / Editar Produtos */}
                        <button
                            onClick={() => setActiveTab('delete_imported')}
                            className={`px-4 py-2.5 font-bold text-xs rounded-xl flex items-center gap-2 transition-all ${
                                activeTab === 'delete_imported'
                                    ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-700'
                                    : 'bg-white text-red-700 hover:bg-red-50 border border-red-300'
                            }`}
                        >
                            <Trash2 size={16} />
                            <span>{allPampulhaProducts.length > 0 ? '5.' : '4.'} Gerenciar, Editar & Excluir ({savedProducts.length})</span>
                            {importedSavedProducts.length > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    activeTab === 'delete_imported' ? 'bg-red-900 text-white' : 'bg-red-100 text-red-800'
                                }`}>
                                    {importedSavedProducts.length} importados
                                </span>
                            )}
                        </button>
                    </div>

                    {activeTab !== 'delete_imported' && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {allPampulhaProducts.length > 0 && (
                                <>
                                    <button
                                        onClick={handleDownloadPampulhaCSV}
                                        className="text-xs text-orange-950 hover:bg-orange-100 font-bold flex items-center gap-1.5 py-1 px-3 bg-orange-50 border border-orange-300 rounded-lg transition-colors shadow-xs cursor-pointer"
                                        title="Baixar Arquivo Completo CSV da Pampulha"
                                    >
                                        <Download size={13} className="text-orange-600" />
                                        <span>Baixar CSV Pampulha</span>
                                    </button>
                                    <button
                                        onClick={handleDownloadPampulhaPDF}
                                        className="text-xs text-red-950 hover:bg-red-100 font-bold flex items-center gap-1.5 py-1 px-3 bg-red-50 border border-red-300 rounded-lg transition-colors shadow-xs cursor-pointer"
                                        title="Baixar Arquivo Oficial em PDF"
                                    >
                                        <Download size={13} className="text-red-600" />
                                        <span>Baixar PDF Oficial</span>
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleDownloadTemplate}
                                className="text-xs text-slate-800 hover:text-slate-950 font-bold flex items-center gap-1.5 py-1 px-3 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors shadow-xs cursor-pointer"
                                title="Baixar Modelo de Planilha CSV (7 Colunas Padrão)"
                            >
                                <Download size={13} className="text-amber-600" />
                                <span>Modelo CSV</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Conteúdo Principal do Modal */}
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    
                    {/* Alerta de Produtos Importados Existentes (apenas nas abas de importação) */}
                    {activeTab !== 'delete_imported' && importedSavedProducts.length > 0 && (
                        <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5 text-amber-950">
                                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                                <span>
                                    Existem <strong>{importedSavedProducts.length} produtos importados</strong> no banco de dados. Caso deseje corrigir erros ou limpar itens duplicados antes de importar:
                                </span>
                            </div>
                            <button
                                onClick={() => setActiveTab('delete_imported')}
                                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold whitespace-nowrap text-xs transition-colors shrink-0 shadow-sm flex items-center gap-1.5"
                            >
                                <Trash2 size={14} />
                                <span>Abrir Painel de Exclusão</span>
                            </button>
                        </div>
                    )}

                    {/* Controle de Publicação na Vitrine (Destino) */}
                    {activeTab !== 'delete_imported' && (
                        <div className="bg-slate-950 text-white p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="flex items-start gap-3">
                                <div className={`p-2.5 rounded-xl ${publishDirectlyToStore ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                                    <ShieldCheck size={22} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold flex items-center gap-2">
                                        <span>Status de Exibição no Ato da Importação:</span>
                                        {publishDirectlyToStore ? (
                                            <span className="bg-emerald-500/20 text-emerald-400 text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                                                Ativo na Página Principal (Vitrine)
                                            </span>
                                        ) : (
                                            <span className="bg-amber-500/20 text-amber-300 text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
                                                Não Ativo na Página Principal (Apenas Estoque Interno)
                                            </span>
                                        )}
                                    </h4>
                                    <p className="text-[11px] text-gray-300 mt-0.5">
                                        {publishDirectlyToStore 
                                            ? 'Os produtos importados serão ativados para exibição imediata na página principal do site.' 
                                            : 'Conforme configurado, os produtos importados NÃO estarão ativos para exibição na página principal. Eles serão guardados com segurança no Estoque Interno para você revisar preços e imagens antes de ativar.'}
                                    </p>
                                </div>
                            </div>

                            <label className="flex items-center gap-2.5 cursor-pointer bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-xl transition-colors shrink-0 border border-white/10">
                                <input 
                                    type="checkbox" 
                                    checked={publishDirectlyToStore} 
                                    onChange={(e) => setPublishDirectlyToStore(e.target.checked)}
                                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                                />
                                <span className="text-xs font-bold text-gray-100">
                                    Ativar na Página Principal
                                </span>
                            </label>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* ABA 1: CATÁLOGO OFICIAL PAMPULHA (TABELA COMPLETA 34 PÁGINAS) */}
                    {/* ========================================================================= */}
                    {activeTab === 'pampulha_preset' && (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-2xl border border-orange-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <h4 className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                                        <Zap size={16} className="text-orange-600" />
                                        <span>Catálogo Oficial Pampulha ({allPampulhaProducts.length} Itens - Elétricos, Hidráulicos, Telefonia)</span>
                                    </h4>
                                    <p className="text-[11px] text-orange-900 mt-0.5">
                                        • Imagem padrão: <strong>Ponto Chave do Lar</strong> • Estoque inicial: <strong>0</strong> • Preço da tabela como <strong>Preço de Custo</strong> • Tributação Legal (NCM, CEST, CFOP) • Data: <strong>{todayDate}</strong>
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => toggleAllPampulha(true)}
                                        className="px-3.5 py-1.5 bg-white hover:bg-orange-100 text-orange-950 border border-orange-300 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                                    >
                                        Marcar Todos ({allPampulhaProducts.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleAllPampulha(false)}
                                        className="px-3.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                                    >
                                        Desmarcar
                                    </button>
                                </div>
                            </div>

                            {/* Opções de Limpeza e Substituição de Itens Anteriores da Pampulha */}
                            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                                <label className="flex items-center gap-2.5 text-amber-950 font-bold cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={deletePreviousPampulhaBeforeImport}
                                        onChange={(e) => setDeletePreviousPampulhaBeforeImport(e.target.checked)}
                                        className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                                    />
                                    <span>
                                        Apagar cadastro antigo de produtos da Tabela Pampulha antes de importar (Recomendado para evitar duplicatas)
                                    </span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleDeleteOnlyPampulhaDirectly}
                                    disabled={isDeleting}
                                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap transition-colors"
                                    title="Excluir do banco de dados Firestore apenas os produtos cadastrados da Tabela Pampulha"
                                >
                                    <Trash2 size={13} />
                                    <span>Apagar Somente Tabela Pampulha Agora</span>
                                </button>
                            </div>

                            {/* Barra de Busca e Status de Paginação */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-gray-200 shadow-xs">
                                <div className="relative w-full sm:w-80">
                                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={pampulhaSearch}
                                        onChange={(e) => {
                                            setPampulhaSearch(e.target.value);
                                            setPampulhaPage(1);
                                        }}
                                        placeholder="Buscar por código, produto ou NCM..."
                                        className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none transition-all"
                                    />
                                    {pampulhaSearch && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPampulhaSearch('');
                                                setPampulhaPage(1);
                                            }}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-600 w-full sm:w-auto justify-between sm:justify-end">
                                    <span className="font-medium text-[11px]">
                                        Selecionados: <strong className="text-orange-950 font-bold">{selectedPampulhaCount}</strong> de {allPampulhaProducts.length}
                                    </span>
                                    {filteredPampulhaProducts.length > 0 && (
                                        <span className="text-[11px] bg-orange-50 text-orange-900 px-2.5 py-1 rounded-lg font-bold border border-orange-200">
                                            Página {pampulhaPage} de {totalPampulhaPages}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Tabela dos Itens da Pampulha Pagina com Alta Performance */}
                            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] tracking-wider sticky top-0 bg-gray-100 z-10">
                                        <tr>
                                            <th className="px-4 py-3 w-10 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPampulhaCount === allPampulhaProducts.length}
                                                    onChange={(e) => toggleAllPampulha(e.target.checked)}
                                                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                                                />
                                            </th>
                                            <th className="px-4 py-3">Código</th>
                                            <th className="px-4 py-3">Produto</th>
                                            <th className="px-4 py-3">Enquadramento Fiscal</th>
                                            <th className="px-4 py-3 text-right">Preço de Custo</th>
                                            <th className="px-4 py-3 text-right">Preço Venda Sug.</th>
                                            <th className="px-4 py-3 text-center">Estoque</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paginatedPampulhaProducts.map((item) => {
                                            const isSelected = Boolean(selectedPampulhaItems[item.code]);
                                            return (
                                                <tr 
                                                    key={item.code} 
                                                    onClick={() => togglePampulhaItem(item.code)}
                                                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-orange-50/50 hover:bg-orange-50/80' : 'hover:bg-gray-50 opacity-60'}`}
                                                >
                                                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => togglePampulhaItem(item.code)}
                                                            className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 font-mono font-bold text-orange-950">
                                                        {item.code}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <img 
                                                                src={item.imageUrl || '/ponto_chave_logo.jpg'} 
                                                                alt={item.name} 
                                                                className="w-9 h-9 object-contain rounded-lg border border-gray-200 bg-white p-0.5 shrink-0" 
                                                            />
                                                            <div>
                                                                <span className="font-bold text-gray-900 block">{item.name}</span>
                                                                <span className="text-[10px] text-gray-500">{item.supplierName} • {item.packagingType}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="space-y-0.5 text-[10px]">
                                                            <div className="font-mono text-slate-700">NCM: <span className="font-bold text-slate-900">{item.ncm}</span></div>
                                                            <div className="font-mono text-slate-500">CEST: {item.cest} • CFOP: {item.cfop}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-slate-700">
                                                        R$ {Number(item.costPrice || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-emerald-800">
                                                        R$ {Number(item.price || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-bold text-slate-500">
                                                        {item.stock || 0} un
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredPampulhaProducts.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="text-center py-10 text-gray-500">
                                                    Nenhum produto Pampulha encontrado com o termo "{pampulhaSearch}".
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Barra de Controles de Paginação */}
                            {totalPampulhaPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                                    <span className="text-xs text-slate-500 font-medium">
                                        Exibindo {Math.min(filteredPampulhaProducts.length, (pampulhaPage - 1) * PAMPULHA_PER_PAGE + 1)} - {Math.min(filteredPampulhaProducts.length, pampulhaPage * PAMPULHA_PER_PAGE)} de {filteredPampulhaProducts.length} itens
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setPampulhaPage(1)}
                                            disabled={pampulhaPage === 1}
                                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-slate-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            Primeira
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPampulhaPage(prev => Math.max(1, prev - 1))}
                                            disabled={pampulhaPage === 1}
                                            className="p-1.5 rounded-lg border border-gray-200 text-xs font-bold text-slate-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                            title="Página anterior"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="px-3 py-1 bg-orange-50 text-orange-950 font-bold text-xs rounded-lg border border-orange-200">
                                            {pampulhaPage} / {totalPampulhaPages}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setPampulhaPage(prev => Math.min(totalPampulhaPages, prev + 1))}
                                            disabled={pampulhaPage >= totalPampulhaPages}
                                            className="p-1.5 rounded-lg border border-gray-200 text-xs font-bold text-slate-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                            title="Próxima página"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPampulhaPage(totalPampulhaPages)}
                                            disabled={pampulhaPage >= totalPampulhaPages}
                                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-slate-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            Última
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* ABA 2: UPLOAD DE ARQUIVO (PDF, CSV, TXT) COM LEITOR AUTOMÁTICO */}
                    {/* ========================================================================= */}
                    {activeTab === 'upload_file' && (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 hover:border-amber-500 bg-gray-50/70 hover:bg-amber-50/20 rounded-3xl p-8 text-center transition-all">
                                <div className="max-w-md mx-auto space-y-3">
                                    <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                                        <FileUp size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-slate-900">
                                            Selecione seu Arquivo PDF, Planilha CSV ou Texto
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            O sistema analisa automaticamente os códigos, nomes, categorias, preços e embalagens (Unidade, Caixa, Pacote, Lote).
                                        </p>
                                    </div>

                                    <div className="pt-2">
                                        <label className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-2xl shadow-md inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95 text-xs">
                                            <Upload size={16} />
                                            <span>Escolher Arquivo (.pdf, .csv, .txt)</span>
                                            <input 
                                                type="file" 
                                                accept=".pdf,.csv,.txt,.tsv" 
                                                className="hidden" 
                                                onChange={handleFileSelected} 
                                            />
                                        </label>
                                    </div>

                                    {uploadedFileName && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-mono font-bold">
                                            <FileText size={14} className="text-amber-400" />
                                            <span>Arquivo selecionado: {uploadedFileName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Loading do Arquivo */}
                            {isParsingFile && (
                                <div className="p-6 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3">
                                    <RefreshCw size={20} className="animate-spin text-amber-400" />
                                    <span className="text-xs font-bold">Extraindo e analisando linhas do arquivo...</span>
                                </div>
                            )}

                            {/* Pré-visualização e Seleção dos Produtos Parseados */}
                            {parsedProducts.length > 0 && !isParsingFile && (
                                <div className="space-y-3 pt-2">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-100 p-3.5 rounded-2xl">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                                <CheckCircle2 size={16} className="text-emerald-600" />
                                                <span>Produtos Reconhecidos ({selectedParsedCount} de {parsedProducts.length} selecionados)</span>
                                            </h4>
                                            <p className="text-[11px] text-gray-600 mt-0.5">
                                                Desmarque itens que não deseja cadastrar ou altere antes de gravar.
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => toggleAllParsed(true)}
                                                className="px-3 py-1.5 bg-white hover:bg-gray-200 text-slate-900 border border-gray-300 rounded-xl text-xs font-bold"
                                            >
                                                Marcar Todos
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleAllParsed(false)}
                                                className="px-3 py-1.5 bg-white hover:bg-gray-200 text-slate-700 border border-gray-300 rounded-xl text-xs font-bold"
                                            >
                                                Desmarcar
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tabela de Produtos Parseados */}
                                    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm max-h-72 overflow-y-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] tracking-wider sticky top-0 bg-gray-100 z-10">
                                                <tr>
                                                    <th className="px-4 py-3 w-10 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedParsedCount === parsedProducts.length && parsedProducts.length > 0}
                                                            onChange={(e) => toggleAllParsed(e.target.checked)}
                                                            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                                                        />
                                                    </th>
                                                    <th className="px-4 py-3">Código</th>
                                                    <th className="px-4 py-3">Produto</th>
                                                    <th className="px-4 py-3">Categoria</th>
                                                    <th className="px-4 py-3">Embalagem</th>
                                                    <th className="px-4 py-3 text-right">Preço</th>
                                                    <th className="px-4 py-3 text-center">Estoque</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {parsedProducts.map((p, idx) => {
                                                    const isChecked = Boolean(selectedParsedItems[idx]);
                                                    return (
                                                        <tr 
                                                            key={idx}
                                                            onClick={() => toggleParsedItem(idx)}
                                                            className={`cursor-pointer transition-colors ${
                                                                isChecked ? 'bg-amber-50/40 hover:bg-amber-50/80' : 'hover:bg-gray-50 opacity-60'
                                                            }`}
                                                        >
                                                            <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => toggleParsedItem(idx)}
                                                                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 font-mono font-bold text-gray-800">
                                                                #{p.code}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-2.5">
                                                                    <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0" />
                                                                    <div>
                                                                        <span className="font-bold text-gray-900 block">{p.name}</span>
                                                                        <span className="text-[10px] text-gray-400 font-mono">Data: {todayDate}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md font-semibold text-[10px]">
                                                                    {p.category}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-700 font-medium">
                                                                {p.packagingType}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-bold text-slate-950">
                                                                R$ {Number(p.price || 0).toFixed(2)}
                                                            </td>
                                                            <td className="px-4 py-3 text-center font-bold text-emerald-700">
                                                                {p.stock} un
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* ABA 2: CATÁLOGO DO PDF ANEXO (PRESET COM 13 ITENS 1351 A 1363) */}
                    {/* ========================================================================= */}
                    {activeTab === 'pdf_preset' && (
                        <div className="space-y-4">
                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                                        <Wrench size={16} className="text-amber-700" />
                                        <span>Catálogo Oficial de Ferramentas & Máquinas do PDF Anexo (13 Itens Pré-configurados)</span>
                                    </h4>
                                    <p className="text-[11px] text-amber-900 mt-0.5">
                                        Todos os produtos serão cadastrados no banco Firestore com a data de compra e inclusão fixada em <strong>{todayDate}</strong>.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => toggleAllPdf(true)}
                                        className="px-3.5 py-1.5 bg-white hover:bg-amber-100 text-amber-950 border border-amber-400 rounded-xl text-xs font-bold shadow-xs"
                                    >
                                        Marcar Todos
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleAllPdf(false)}
                                        className="px-3.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-xs font-bold shadow-xs"
                                    >
                                        Desmarcar
                                    </button>
                                </div>
                            </div>

                            {/* Tabela dos Itens do PDF Preset */}
                            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm max-h-80 overflow-y-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] tracking-wider sticky top-0 bg-gray-100 z-10">
                                        <tr>
                                            <th className="px-4 py-3 w-10 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPdfCount === PDF_PRESET_PRODUCTS.length}
                                                    onChange={(e) => toggleAllPdf(e.target.checked)}
                                                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                                                />
                                            </th>
                                            <th className="px-4 py-3">Código</th>
                                            <th className="px-4 py-3">Produto</th>
                                            <th className="px-4 py-3">Categoria</th>
                                            <th className="px-4 py-3">Embalagem</th>
                                            <th className="px-4 py-3 text-right">Preço Sugerido</th>
                                            <th className="px-4 py-3 text-center">Estoque</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {PDF_PRESET_PRODUCTS.map((item) => {
                                            const isSelected = Boolean(selectedPdfItems[item.code]);
                                            return (
                                                <tr 
                                                    key={item.code} 
                                                    onClick={() => togglePdfItem(item.code)}
                                                    className={`cursor-pointer transition-colors ${
                                                        isSelected ? 'bg-amber-50/50 hover:bg-amber-50/80' : 'hover:bg-gray-50 opacity-60'
                                                    }`}
                                                >
                                                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => togglePdfItem(item.code)}
                                                            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 font-mono font-bold text-gray-800">
                                                        #{item.code}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0" />
                                                            <div>
                                                                <span className="font-bold text-gray-900 block">{item.name}</span>
                                                                <span className="text-[10px] text-gray-500 line-clamp-1">{item.description}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md font-semibold text-[10px]">
                                                            {item.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700 font-medium">
                                                        {item.packagingType}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-slate-950">
                                                        R$ {item.price.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-bold text-emerald-700">
                                                        {item.stock} un
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* ABA 3: COLAR TEXTO */}
                    {/* ========================================================================= */}
                    {activeTab === 'text' && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                                <label className="text-xs font-bold text-gray-800 block">
                                    Cole as linhas de texto da sua tabela ou catálogo:
                                </label>
                                <textarea
                                    rows={6}
                                    value={rawText}
                                    onChange={(e) => setRawText(e.target.value)}
                                    placeholder={`1351. [Ferramentas & Máquinas] Furadeira de impacto\n1352. [Ferramentas & Máquinas] Furadeira de impacto — unidade\n1353; Furadeira de impacto - caixa; Ferramentas; 1650.00; 900.00; 5`}
                                    className="w-full p-3.5 bg-white border border-gray-300 rounded-2xl text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
                                />
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-[11px] text-gray-500">
                                        Aceita separadores: ponto e vírgula (;), tabulação, traço (-) ou colchetes [Categoria].
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleParseTextManual}
                                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
                                    >
                                        <Sparkles size={15} />
                                        <span>Processar e Pré-visualizar Linhas</span>
                                    </button>
                                </div>
                            </div>

                            {/* Preview de Produtos Parseados */}
                            {parsedProducts.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    <h4 className="text-xs font-bold text-gray-800 flex items-center justify-between">
                                        <span>Pré-visualização dos Produtos Identificados ({selectedParsedCount} de {parsedProducts.length} selecionados):</span>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => toggleAllParsed(true)} 
                                                className="text-xs font-bold text-amber-700 hover:underline"
                                            >
                                                Marcar Todos
                                            </button>
                                            <span className="text-gray-300">|</span>
                                            <button 
                                                onClick={() => toggleAllParsed(false)} 
                                                className="text-xs font-bold text-gray-600 hover:underline"
                                            >
                                                Desmarcar
                                            </button>
                                        </div>
                                    </h4>
                                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-2xl divide-y divide-gray-100 text-xs">
                                        {parsedProducts.map((p, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => toggleParsedItem(idx)}
                                                className={`p-3 flex justify-between items-center cursor-pointer transition-colors ${
                                                    selectedParsedItems[idx] ? 'bg-amber-50/50 hover:bg-amber-50' : 'opacity-60 bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={Boolean(selectedParsedItems[idx])} 
                                                        onChange={() => toggleParsedItem(idx)}
                                                        className="w-4 h-4 accent-amber-500 rounded"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <div>
                                                        <span className="font-mono font-bold text-gray-700 mr-2">#{p.code}</span>
                                                        <strong className="text-gray-900">{p.name}</strong>
                                                        <span className="text-[11px] text-gray-500 block">{p.category} • {p.packagingType}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-slate-950 block">R$ {Number(p.price || 0).toFixed(2)}</span>
                                                    <span className="text-[11px] text-gray-500">Estoque: {p.stock} un</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* ABA 4: GERENCIAR E EXCLUIR PRODUTOS IMPORTADOS / CORREÇÃO DE ERROS */}
                    {/* ========================================================================= */}
                    {activeTab === 'delete_imported' && (
                        <div className="space-y-4">
                            {/* Card de Controle Principal */}
                            <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 shadow-sm">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div>
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                            <Layers size={18} className="text-amber-400" />
                                            <span>Central de Gestão, Edição & Exclusão por Lote</span>
                                        </h4>
                                        <p className="text-xs text-slate-300 mt-1">
                                            Selecione um <strong>lote específico</strong> abaixo para isolar e excluir apenas os itens daquela importação, ou edite diretamente com 1 clique.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => toggleSelectAllDeletion(true)}
                                            disabled={filteredForDeletion.length === 0 || isDeleting}
                                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shadow-xs"
                                        >
                                            Marcar Todos ({filteredForDeletion.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleSelectAllDeletion(false)}
                                            disabled={filteredForDeletion.length === 0 || isDeleting}
                                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shadow-xs"
                                        >
                                            Desmarcar
                                        </button>
                                    </div>
                                </div>

                                {/* SELETOR DINÂMICO DE LOTES DE IMPORTAÇÃO */}
                                <div className="space-y-2 pt-2 border-t border-slate-800">
                                    <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                                        <span className="flex items-center gap-1.5 text-amber-400">
                                            <Filter size={14} />
                                            <span>Filtrar e Selecionar por Lote de Origem:</span>
                                        </span>
                                        <span className="text-[11px] text-slate-400">
                                            {detectedBatches.length} lote(s) detectado(s)
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                        {/* Card: Todos os Lotes / Produtos */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedBatchId('all')}
                                            className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                                                selectedBatchId === 'all'
                                                    ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/40 shadow-sm'
                                                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-1 w-full">
                                                <span className="text-xs font-bold flex items-center gap-1.5">
                                                    <Package size={14} className={selectedBatchId === 'all' ? 'text-amber-400' : 'text-slate-400'} />
                                                    Todos os Produtos
                                                </span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-200 font-mono font-bold">
                                                    {savedProducts.length}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 mt-1 block">
                                                Visão geral de todo o catálogo
                                            </span>
                                        </button>

                                        {/* Cards para cada lote identificado */}
                                        {detectedBatches.map((batch) => {
                                            const isSelected = selectedBatchId === batch.id;
                                            return (
                                                <button
                                                    key={batch.id}
                                                    type="button"
                                                    onClick={() => setSelectedBatchId(batch.id)}
                                                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                                                        isSelected
                                                            ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/50 shadow-sm'
                                                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-1 w-full">
                                                        <span className="text-xs font-bold truncate flex items-center gap-1.5" title={batch.name}>
                                                            <Layers size={14} className={isSelected ? 'text-amber-400' : 'text-slate-400'} />
                                                            <span className="truncate">{batch.name}</span>
                                                        </span>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700 text-amber-300 font-mono font-bold shrink-0">
                                                            {batch.productCount}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                                                        <span>Estoque: {batch.totalStock} un</span>
                                                        <span className="font-semibold text-slate-300">{batch.tag}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* PAINEL DE CONTROLE ESPECÍFICO DO LOTE ATIVO */}
                                {activeSelectedBatch && (
                                    <div className="p-3.5 bg-red-950/60 border border-red-500/50 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-red-500/30 text-red-200 border border-red-500/40 rounded-md text-[10px] font-bold uppercase">
                                                    Lote Filtrado
                                                </span>
                                                <h5 className="text-xs font-bold text-white">
                                                    {activeSelectedBatch.name}
                                                </h5>
                                            </div>
                                            <p className="text-[11px] text-red-200">
                                                Contém <strong>{activeSelectedBatch.productCount} produtos</strong> ({activeSelectedBatch.totalStock} unidades). A exclusão deste lote manterá os outros produtos 100% preservados.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                            <button
                                                type="button"
                                                onClick={() => requestDeleteBatch(activeSelectedBatch)}
                                                disabled={isDeleting}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                                            >
                                                <Trash2 size={15} />
                                                <span>Excluir Somente Este Lote ({activeSelectedBatch.productCount})</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setSelectedBatchId('all')}
                                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                                            >
                                                Limpar Filtro
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Barra de Busca e Filtros Rápidos */}
                                <div className="pt-2 border-t border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
                                    <div className="relative w-full md:w-72">
                                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="text"
                                            value={searchDeletionTerm}
                                            onChange={(e) => setSearchDeletionTerm(e.target.value)}
                                            placeholder="Buscar por código ou nome..."
                                            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-slate-400"
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                        <button
                                            type="button"
                                            onClick={() => setDeletionCategoryFilter('imported')}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                                deletionCategoryFilter === 'imported'
                                                    ? 'bg-amber-500 text-slate-950'
                                                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                                            }`}
                                        >
                                            Apenas Importados ({importedSavedProducts.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeletionCategoryFilter('all')}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                                deletionCategoryFilter === 'all'
                                                    ? 'bg-white text-slate-950 font-bold'
                                                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                                            }`}
                                        >
                                            Todos os Produtos ({savedProducts.length})
                                        </button>
                                    </div>
                                </div>

                                {/* Ações de Exclusão de Selecionados */}
                                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                                    <div className="text-xs font-bold text-slate-300">
                                        <strong className="text-amber-400">{selectedDeletionCount}</strong> de {filteredForDeletion.length} itens marcados na lista
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={requestDeleteSelected}
                                            disabled={selectedDeletionCount === 0 || isDeleting}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-40 active:scale-95"
                                        >
                                            <Trash2 size={15} />
                                            <span>Excluir {selectedDeletionCount} Marcados</span>
                                        </button>

                                        {selectedBatchId === 'all' && (
                                            <button
                                                type="button"
                                                onClick={requestDeleteAllImported}
                                                disabled={importedSavedProducts.length === 0 || isDeleting}
                                                className="px-4 py-2 bg-slate-800 hover:bg-red-950 hover:border-red-600 border border-slate-700 text-red-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40"
                                                title="Limpa todos os produtos importados para permitir nova importação do zero"
                                            >
                                                <AlertTriangle size={15} className="text-amber-400" />
                                                <span>Limpar Todos os Importados ({importedSavedProducts.length})</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Barra de Progresso de Exclusão */}
                            {isDeleting && deleteProgress && (
                                <div className="bg-slate-950 text-white p-4 rounded-2xl space-y-2 animate-in fade-in">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="flex items-center gap-2">
                                            <RefreshCw size={15} className="animate-spin text-red-400" />
                                            <span>Excluindo produtos do Banco Firestore...</span>
                                        </span>
                                        <span>{deleteProgress.current} de {deleteProgress.total} itens</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className="bg-red-500 h-full transition-all duration-200" 
                                            style={{ width: `${(deleteProgress.current / deleteProgress.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tabela dos Produtos Salvos */}
                            {filteredForDeletion.length === 0 ? (
                                <div className="p-10 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-center space-y-2">
                                    <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
                                    <h4 className="text-sm font-bold text-gray-800">Nenhum produto correspondente encontrado</h4>
                                    <p className="text-xs text-gray-500">
                                        Não há itens cadastrados neste lote ou com os critérios de busca selecionados.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm max-h-96 overflow-y-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] tracking-wider sticky top-0 bg-gray-100 z-10">
                                            <tr>
                                                <th className="px-4 py-3 w-10 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDeletionCount === filteredForDeletion.length && filteredForDeletion.length > 0}
                                                        onChange={(e) => toggleSelectAllDeletion(e.target.checked)}
                                                        className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                                                    />
                                                </th>
                                                <th className="px-4 py-3">Código</th>
                                                <th className="px-4 py-3">Produto</th>
                                                <th className="px-4 py-3">Lote / Origem</th>
                                                <th className="px-4 py-3">Categoria</th>
                                                <th className="px-4 py-3 text-right">Preço Venda</th>
                                                <th className="px-4 py-3 text-center">Estoque</th>
                                                <th className="px-4 py-3 text-center">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {paginatedForDeletion.map((p) => {
                                                const isSelected = Boolean(selectedForDeletion[p.id]);
                                                const batchInfo = getProductBatchInfo(p);
                                                return (
                                                    <tr 
                                                        key={p.id}
                                                        onClick={() => toggleSelectDeletionItem(p.id)}
                                                        className={`cursor-pointer transition-colors ${
                                                            isSelected ? 'bg-red-50/80 hover:bg-red-50' : 'hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleSelectDeletionItem(p.id)}
                                                                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 font-mono font-bold text-gray-800">
                                                            #{p.code || 'S/C'}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2.5">
                                                                {p.imageUrl && (
                                                                    <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0" />
                                                                )}
                                                                <div>
                                                                    <span className="font-bold text-gray-900 block">{p.name}</span>
                                                                    <span className="text-[10px] text-gray-400 font-mono">Data: {p.purchaseDate || todayDate}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                                                                batchInfo.id === 'batch_sams_club_pampulha' 
                                                                    ? 'bg-blue-100 text-blue-800' 
                                                                    : batchInfo.id === 'batch_tropical_top10' 
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : batchInfo.id === 'batch_pdf_preset_catalog'
                                                                    ? 'bg-amber-100 text-amber-900'
                                                                    : p.isImported
                                                                    ? 'bg-purple-100 text-purple-900'
                                                                    : 'bg-slate-100 text-slate-700'
                                                            }`}>
                                                                {batchInfo.tag}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md font-semibold text-[10px]">
                                                                {p.category || 'Geral'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-bold text-slate-950">
                                                            R$ {Number(p.price || 0).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-bold text-emerald-700">
                                                            {p.stock || 0} un
                                                        </td>
                                                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex items-center justify-center gap-1">
                                                                {onEditProduct && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            onClose();
                                                                            onEditProduct(p);
                                                                        }}
                                                                        className="p-1.5 text-brand-primary hover:bg-brand-light rounded-xl transition-colors font-medium flex items-center gap-1 text-xs border border-brand-primary/20"
                                                                        title="Editar este produto (imagens, preços, dados técnicos)"
                                                                    >
                                                                        <Edit2 size={13} />
                                                                        <span className="hidden sm:inline">Editar</span>
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => requestDeleteSingle(p.id, p.name)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                                                                    title="Excluir este item permanentemente"
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Controles de Paginação da Aba de Exclusão */}
                                {totalDeletionPages > 1 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                                        <span className="text-xs text-slate-500 font-medium">
                                            Exibindo {Math.min(filteredForDeletion.length, (deletionPage - 1) * DELETION_PER_PAGE + 1)} - {Math.min(filteredForDeletion.length, deletionPage * DELETION_PER_PAGE)} de {filteredForDeletion.length} itens salvos
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setDeletionPage(1)}
                                                disabled={deletionPage === 1}
                                                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-slate-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                Primeira
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeletionPage(prev => Math.max(1, prev - 1))}
                                                disabled={deletionPage === 1}
                                                className="p-1.5 rounded-lg border border-gray-200 text-xs font-bold text-slate-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                title="Página anterior"
                                            >
                                                <ChevronLeft size={16} />
                                            </button>
                                            <span className="px-3 py-1 bg-red-50 text-red-950 font-bold text-xs rounded-lg border border-red-200">
                                                {deletionPage} / {totalDeletionPages}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setDeletionPage(prev => Math.min(totalDeletionPages, prev + 1))}
                                                disabled={deletionPage >= totalDeletionPages}
                                                className="p-1.5 rounded-lg border border-gray-200 text-xs font-bold text-slate-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                title="Próxima página"
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeletionPage(totalDeletionPages)}
                                                disabled={deletionPage >= totalDeletionPages}
                                                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-slate-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                Última
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                    {/* Barra de Progresso de Importação */}
                    {isImporting && progress && (
                        <div className="bg-slate-950 text-white p-4 rounded-2xl space-y-2 animate-in fade-in">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="flex items-center gap-2 text-white">
                                    <RefreshCw size={15} className="animate-spin text-amber-400" />
                                    <span>Gravando produtos no Banco Firestore...</span>
                                </span>
                                <span className="text-amber-400">{progress.current} de {progress.total} itens cadastrados</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className="bg-amber-400 h-full transition-all duration-200" 
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Rodapé com Botões de Ação Principais */}
                <div className="p-5 sm:p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="text-xs text-slate-700 font-medium">
                        {activeTab === 'delete_imported' ? (
                            <span>
                                <strong className="text-slate-950 font-bold">{selectedDeletionCount}</strong> de {filteredForDeletion.length} itens marcados para exclusão
                            </span>
                        ) : activeTab === 'pampulha_preset' ? (
                            <span>
                                <strong className="text-slate-950 font-bold">{selectedPampulhaCount}</strong> de {allPampulhaProducts.length} produtos do catálogo Pampulha selecionados
                            </span>
                        ) : activeTab === 'pdf_preset' ? (
                            <span>
                                <strong className="text-slate-950 font-bold">{selectedPdfCount}</strong> de {PDF_PRESET_PRODUCTS.length} produtos do PDF selecionados para importar
                            </span>
                        ) : activeTab === 'upload_file' || activeTab === 'text' ? (
                            <span>
                                <strong className="text-slate-950 font-bold">{selectedParsedCount}</strong> de {parsedProducts.length} produtos prontos para inserção
                            </span>
                        ) : null}
                    </div>

                    <div className="flex gap-2.5 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isImporting || isDeleting}
                            className="px-5 py-3 bg-white border border-gray-300 hover:bg-gray-100 text-slate-800 font-bold text-xs rounded-xl transition-colors grow sm:grow-0 shadow-xs"
                        >
                            {activeTab === 'delete_imported' ? 'Fechar' : 'Cancelar'}
                        </button>

                        {activeTab === 'delete_imported' ? (
                            <button
                                type="button"
                                disabled={isDeleting || selectedDeletionCount === 0}
                                onClick={requestDeleteSelected}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 grow sm:grow-0 disabled:opacity-40 active:scale-95"
                            >
                                <Trash2 size={16} />
                                <span>Excluir {selectedDeletionCount} Produtos Selecionados</span>
                            </button>
                        ) : activeTab === 'pampulha_preset' ? (
                            <button
                                type="button"
                                disabled={isImporting || selectedPampulhaCount === 0}
                                onClick={handleImportSelectedPampulha}
                                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 grow sm:grow-0 disabled:opacity-50 active:scale-95 border border-orange-400"
                            >
                                <Zap size={18} className="fill-slate-950" />
                                <span>Importar {selectedPampulhaCount} Produtos Pampulha</span>
                            </button>
                        ) : activeTab === 'pdf_preset' ? (
                            <button
                                type="button"
                                disabled={isImporting || selectedPdfCount === 0}
                                onClick={handleImportSelectedPdf}
                                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 grow sm:grow-0 disabled:opacity-50 active:scale-95 border border-amber-400"
                            >
                                <Check size={18} />
                                <span>Importar {selectedPdfCount} Produtos do PDF para o Banco</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={isImporting || selectedParsedCount === 0}
                                onClick={handleImportParsedItems}
                                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 grow sm:grow-0 disabled:opacity-50 active:scale-95 border border-amber-400"
                            >
                                <Check size={18} />
                                <span>Salvar {selectedParsedCount} Produtos Reconhecidos no Banco</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* MODAL DE CONFIRMAÇÃO SEGURO (Nativo React, substitui window.confirm) */}
                {confirmModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-60 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-4 animate-in zoom-in-95">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                    confirmModal.isDanger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-950">
                                        {confirmModal.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Confirmação de segurança
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-700 leading-relaxed">
                                {confirmModal.description}
                            </p>

                            <div className="flex gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirmModal(null)}
                                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmModal.onConfirm}
                                    className={`flex-1 px-4 py-2.5 font-bold text-xs rounded-xl shadow-md transition-all ${
                                        confirmModal.isDanger 
                                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                                            : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                                    }`}
                                >
                                    {confirmModal.actionLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
