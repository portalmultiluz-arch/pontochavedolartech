import { Product } from '../types';
import { samplePromoProducts, sampleKits, sampleGiftProducts, sampleSpecialLogisticsProducts, sampleHomeGardenAgriProducts, sampleSafetyEpiProducts } from './sampleFeaturedItems';
import { famastilCatalog } from './famastilCatalog';
import { foxluxCatalog } from './foxluxCatalog';
import { tramontinaCatalog } from './tramontinaCatalog';

// Unifica os catálogos oficiais com produtos promocionais, kits, presentes, itens de casa-jardim-agrícola, segurança-EPI e logística especial
export const products: Product[] = [
  ...samplePromoProducts,
  ...sampleGiftProducts,
  ...sampleKits,
  ...sampleSafetyEpiProducts,
  ...sampleHomeGardenAgriProducts,
  ...sampleSpecialLogisticsProducts,
  ...famastilCatalog,
  ...foxluxCatalog,
  ...tramontinaCatalog
];



