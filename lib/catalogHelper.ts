import { Product } from '../types';
import { pampulhaCondutoresProducts } from '../data/pampulhaCondutoresProducts';
import { pampulhaCatalogFull } from '../data/pampulhaCatalogFull';
import { famastilCatalog } from '../data/famastilCatalog';
import { foxluxCatalog } from '../data/foxluxCatalog';
import { tramontinaCatalog } from '../data/tramontinaCatalog';

export type ProductTableKey = 'all' | 'promo' | 'kits' | 'pampulha' | 'famastil' | 'foxlux' | 'tramontina' | 'other';

export interface CatalogTableMeta {
    key: ProductTableKey;
    label: string;
    shortLabel: string;
    description: string;
    badgeClass: string;
    activeClass: string;
    borderClass: string;
    textColor: string;
    bgLight: string;
}

export const CATALOG_TABLES: Record<ProductTableKey, CatalogTableMeta> = {
    all: {
        key: 'all',
        label: 'Todas as Tabelas',
        shortLabel: 'Todas',
        description: 'Todos os produtos e tabelas cadastradas no acervo',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
        activeClass: 'bg-slate-900 text-white shadow-sm border-slate-900',
        borderClass: 'border-slate-300',
        textColor: 'text-slate-900',
        bgLight: 'bg-slate-50'
    },
    promo: {
        key: 'promo',
        label: 'Aba Promoção',
        shortLabel: 'Promoção',
        description: 'Itens em oferta com preço especial, data de início e fim',
        badgeClass: 'bg-red-100 text-red-950 border-red-300 font-extrabold',
        activeClass: 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-md border-red-500',
        borderClass: 'border-red-400',
        textColor: 'text-red-900',
        bgLight: 'bg-red-50'
    },
    kits: {
        key: 'kits',
        label: 'Aba Kits & Combos',
        shortLabel: 'Kits & Combos',
        description: 'Kits montados (Pedreiro, Dona de Casa, Eletricista, Utilidades, Pintor, etc.)',
        badgeClass: 'bg-purple-100 text-purple-950 border-purple-300 font-extrabold',
        activeClass: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 text-white shadow-md border-purple-500',
        borderClass: 'border-purple-400',
        textColor: 'text-purple-900',
        bgLight: 'bg-purple-50'
    },
    pampulha: {
        key: 'pampulha',
        label: 'Tabela Pampulha Condutores',
        shortLabel: 'Pampulha Condutores',
        description: 'Tabela Oficial Pampulha Condutores (Materiais Elétricos, Hidráulica & Telefonia)',
        badgeClass: 'bg-orange-100 text-orange-950 border-orange-200',
        activeClass: 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm border-orange-600',
        borderClass: 'border-orange-300',
        textColor: 'text-orange-900',
        bgLight: 'bg-orange-50'
    },
    famastil: {
        key: 'famastil',
        label: 'Tabela Famastil',
        shortLabel: 'Famastil',
        description: 'Ferramentas Manuais, Jardinagem, Construção & Medição',
        badgeClass: 'bg-amber-100 text-amber-950 border-amber-200',
        activeClass: 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-sm border-amber-600',
        borderClass: 'border-amber-300',
        textColor: 'text-amber-900',
        bgLight: 'bg-amber-50'
    },
    foxlux: {
        key: 'foxlux',
        label: 'Tabela Foxlux',
        shortLabel: 'Foxlux',
        description: 'Iluminação LED, Fitas Isolantes, Sensores, Extensões & Testes',
        badgeClass: 'bg-yellow-100 text-yellow-950 border-yellow-300',
        activeClass: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-bold shadow-sm border-yellow-500',
        borderClass: 'border-yellow-300',
        textColor: 'text-yellow-950',
        bgLight: 'bg-yellow-50'
    },
    tramontina: {
        key: 'tramontina',
        label: 'Tabela Tramontina',
        shortLabel: 'Tramontina',
        description: 'Linha Liz (Interruptores/Tomadas), Disjuntores & Ferramentas Master',
        badgeClass: 'bg-blue-100 text-blue-950 border-blue-200',
        activeClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm border-blue-600',
        borderClass: 'border-blue-300',
        textColor: 'text-blue-900',
        bgLight: 'bg-blue-50'
    },
    other: {
        key: 'other',
        label: 'Outras Tabelas / Lotes',
        shortLabel: 'Outros',
        description: 'Produtos de importação avulsa ou marcas diversas',
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
        activeClass: 'bg-gray-700 text-white shadow-sm border-gray-700',
        borderClass: 'border-gray-300',
        textColor: 'text-gray-900',
        bgLight: 'bg-gray-50'
    }
};

/**
 * Identifica a tabela/fabricante de origem de qualquer produto cadastrado
 */
export function getProductTableKey(product: Product): ProductTableKey {
    if (!product) return 'other';

    const tableField = String((product as any).table || '').toLowerCase();
    const batchId = String(product.importBatchId || '').toLowerCase();
    const batchName = String(product.importBatchName || '').toLowerCase();
    const supplier = String(product.supplierName || '').toLowerCase();
    const dept = String(product.department || '').toLowerCase();
    const brand = String(product.brand || '').toLowerCase();
    const name = String(product.name || '').toLowerCase();
    const code = String(product.code || '').toLowerCase();
    const sku = String(product.sku || '').toLowerCase();
    const desc = String(product.description || '').toLowerCase();

    // 0. Explicit table assignment
    if (tableField === 'pampulha' || tableField === 'famastil' || tableField === 'foxlux' || tableField === 'tramontina') {
        return tableField as ProductTableKey;
    }

    // 1. PAMPULHA CONDUTORES (Materiais Elétricos, Hidráulica & Telefonia)
    if (
        tableField.includes('pampulha') ||
        batchId.includes('pampulha') ||
        batchName.includes('pampulha') ||
        dept.includes('pampulha') ||
        supplier.includes('pampulha') ||
        brand.includes('pampulha') ||
        code.startsWith('pamp-') ||
        sku.includes('pamp-') ||
        name.includes('pampulha')
    ) {
        return 'pampulha';
    }

    // 2. FAMASTIL
    if (
        brand.includes('famastil') ||
        supplier.includes('famastil') ||
        dept.includes('famastil') ||
        batchId.includes('famastil') ||
        batchName.includes('famastil') ||
        code.startsWith('fama-') ||
        sku.includes('fama-') ||
        name.includes('famastil')
    ) {
        return 'famastil';
    }

    // 3. FOXLUX
    if (
        brand.includes('foxlux') ||
        supplier.includes('foxlux') ||
        dept.includes('foxlux') ||
        batchId.includes('foxlux') ||
        batchName.includes('foxlux') ||
        code.startsWith('fox-') ||
        sku.includes('fox-') ||
        name.includes('foxlux')
    ) {
        return 'foxlux';
    }

    // 4. TRAMONTINA
    if (
        brand.includes('tramontina') ||
        supplier.includes('tramontina') ||
        dept.includes('tramontina') ||
        batchId.includes('tramontina') ||
        batchName.includes('tramontina') ||
        code.startsWith('tram-') ||
        sku.includes('tram-') ||
        name.includes('tramontina') ||
        name.includes('linha liz')
    ) {
        return 'tramontina';
    }

    // 5. Outros códigos conhecidos da Pampulha
    if (
        code.startsWith('sc-') ||
        code.startsWith('loren-') ||
        code.startsWith('deca-') ||
        code.startsWith('krona-') ||
        code.startsWith('hdl-')
    ) {
        return 'pampulha';
    }

    return 'other';
}

/**
 * Retorna o badge formatado da tabela para exibição na UI
 */
export function getProductTableBadge(product: Product): { label: string; bgClass: string; textClass: string; borderClass: string } {
    const key = getProductTableKey(product);
    switch (key) {
        case 'famastil':
            return { label: 'Famastil', bgClass: 'bg-amber-100', textClass: 'text-amber-950', borderClass: 'border-amber-300' };
        case 'foxlux':
            return { label: 'Foxlux', bgClass: 'bg-yellow-100', textClass: 'text-yellow-950', borderClass: 'border-yellow-300' };
        case 'tramontina':
            return { label: 'Tramontina', bgClass: 'bg-blue-100', textClass: 'text-blue-950', borderClass: 'border-blue-300' };
        case 'pampulha':
            return { label: 'Pampulha', bgClass: 'bg-orange-100', textClass: 'text-orange-950', borderClass: 'border-orange-300' };
        default:
            return { label: product.supplierName || 'Geral', bgClass: 'bg-slate-100', textClass: 'text-slate-800', borderClass: 'border-slate-200' };
    }
}

/**
 * Consolidação de todos os catálogos oficiais padrão do sistema
 */
export const allReferenceCatalogs: {
    pampulha: Product[];
    famastil: Product[];
    foxlux: Product[];
    tramontina: Product[];
    all: Product[];
} = {
    pampulha: [
        ...pampulhaCondutoresProducts,
        ...pampulhaCatalogFull.filter(p => !pampulhaCondutoresProducts.some(cp => cp.code === p.code))
    ],
    famastil: famastilCatalog,
    foxlux: foxluxCatalog,
    tramontina: tramontinaCatalog,
    get all() {
        return [
            ...this.pampulha,
            ...this.famastil,
            ...this.foxlux,
            ...this.tramontina
        ];
    }
};

/**
 * Identifica se um produto é um Kit ou Combo montado
 */
export function isKitProduct(product: Product): boolean {
    if (!product) return false;
    if (product.isKit) return true;
    if (product.packagingType === 'Kit' || product.packagingType === 'Combo' || product.packagingType === 'Pacote') return true;
    
    const cat = String(product.category || '').toLowerCase();
    if (cat.includes('kit') || cat.includes('combo') || cat.includes('conjunto')) return true;
    
    const dept = String(product.department || '').toLowerCase();
    if (dept.includes('kit') || dept.includes('combo')) return true;
    
    const name = String(product.name || '').toLowerCase();
    if (
        name.startsWith('kit ') || 
        name.startsWith('kit-') || 
        name.startsWith('kit:') || 
        name.includes(' kit ') || 
        name.includes('combo ') || 
        name.includes('conjunto ')
    ) {
        return true;
    }
    
    return false;
}

/**
 * Pesquisa ultra-rápida indexada por tokens para evitar travamento de renderização
 */
export function fastSearchProduct(product: Product, searchTokens: string[]): boolean {
    if (searchTokens.length === 0) return true;

    // Constrói uma string combinada de busca em minúsculo
    const searchable = `${product.name} ${product.code || ''} ${product.sku || ''} ${product.category || ''} ${product.department || ''} ${product.supplierName || ''} ${product.brand || ''} ${product.ncm || ''} ${product.invoiceNumber || ''}`.toLowerCase();

    // Todos os tokens digitados precisam casar (ex: "foxlux fita" ou "famastil 5m")
    for (let i = 0; i < searchTokens.length; i++) {
        if (!searchable.includes(searchTokens[i])) {
            return false;
        }
    }
    return true;
}
