const fs = require('fs');
const p1 = require('./raw_pampulha_part1.cjs');
const p2 = require('./raw_pampulha_part2.cjs');
const p3 = require('./raw_pampulha_part3.cjs');
const p4 = require('./raw_pampulha_part4.cjs');
const p5 = require('./raw_pampulha_part5.cjs');

const allLines = [...p1, ...p2, ...p3, ...p4, ...p5];

const knownBrands = [
  'MARGIRIUS', 'MAR-GIRIUS', 'KRONA', 'DECA', 'PIAL', 'LORENZETTI', 'ENERBRÁS', 'ENERBRAS', 
  'BIKI', 'TAF', 'PERLEX', 'AJAX', 'FERTAK', 'SECALUX', 'APLACEL', 'MEGA', 'METALKIT', 'BLUKIT',
  'ROCO', 'VINIGÁS', 'VINIGAS', 'JMA', 'G20', 'CONIMEL', 'ELETROKIT', 'DECORLUX', 'KIAN',
  'REDY', 'LALUX', 'UTRON', 'BRASFORMA', 'GARAPLAS', 'CLARINOX', 'ALBACETE', 'CENSI', 'INTERNEED',
  'MASTER', 'GARDEN', 'OVD', 'PALOMAR', 'J S A', 'J A', 'RIB. FABRIL', 'RIBEIRO FABRIL',
  'BLUMENAU', 'TRAMONTINA', 'IMPORTADO', 'DIVERSOS', 'FABRIL', 'FAME', 'ALUMBRA', 'CORFIO',
  'SIL', 'COBRECOM', 'MEIKON', 'MIXPLAST./L&C', 'PLASTIFLUOR', 'SACRAMENTO', 'ATLAS'
];

function parseLine(line, idx) {
  line = line.trim();
  if (!line) return null;

  const priceMatch = line.match(/R\$\s*([0-9.,]+)$/i);
  if (!priceMatch) return null;
  const priceStr = priceMatch[1].replace(/\./g, '').replace(',', '.');
  const costPrice = parseFloat(priceStr);
  const withoutPrice = line.substring(0, priceMatch.index).trim();

  const packMatch = withoutPrice.match(/\s+(\d+\s*(?:un\.|unids\.|unid\.|un|MTS|METROS|PAR|JG|PÇS|RL)|PAR|JG|1\s*un\.?)$/i);
  let pack = '1 un.';
  let withoutPack = withoutPrice;
  if (packMatch) {
    pack = packMatch[1].trim();
    withoutPack = withoutPrice.substring(0, packMatch.index).trim();
  }

  const skuMatch = withoutPack.match(/^([A-Z0-9\-\/]+)\s+/i);
  let code = `PAMP-${idx + 1}`;
  let rest = withoutPack;
  if (skuMatch) {
    code = skuMatch[1];
    rest = withoutPack.substring(skuMatch[0].length).trim();
  }

  rest = rest.replace(/^(?:Materiais\s+Elétricos|Materiais\s+Hidráulicos|Iluminação|Ferramentas)\s*(?:PAMPULHA)?\s*(?:Materiais\s+Elétricos\s+e\s+Ferramentas|Materiais\s+Hidráulicos\s+e\s+Ferramentas)?\s*/i, '').trim();

  let brand = 'Pampulha';
  let description = rest;

  for (const b of knownBrands) {
    const regex = new RegExp(`\\b${b.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
    if (regex.test(rest)) {
      brand = b;
      description = rest.replace(regex, '').trim();
      break;
    }
  }

  let category = 'Materiais Elétricos';
  const lowerDesc = (description + ' ' + rest).toLowerCase();
  if (lowerDesc.includes('hidrául') || lowerDesc.includes('tubo') || lowerDesc.includes('joelho') || lowerDesc.includes('torneira') || lowerDesc.includes('chuveiro') || lowerDesc.includes('sifão') || lowerDesc.includes('registro') || lowerDesc.includes('válvula') || lowerDesc.includes('esgoto') || lowerDesc.includes('engate') || lowerDesc.includes('bóia') || lowerDesc.includes('caixa sifonada') || lowerDesc.includes('ralo') || lowerDesc.includes('adaptador cola') || lowerDesc.includes('bucha de redução') || lowerDesc.includes('gás')) {
    category = 'Materiais Hidráulicos';
  } else if (lowerDesc.includes('serrote') || lowerDesc.includes('alicate') || lowerDesc.includes('tesoura') || lowerDesc.includes('chave fenda') || lowerDesc.includes('trena') || lowerDesc.includes('disco') || lowerDesc.includes('martelo') || lowerDesc.includes('broca') || lowerDesc.includes('ferramenta') || lowerDesc.includes('vassoura') || lowerDesc.includes('rodo') || lowerDesc.includes('rolo')) {
    category = 'Ferramentas e Utilidades';
  } else if (lowerDesc.includes('lâmpada') || lowerDesc.includes('led') || lowerDesc.includes('plafon') || lowerDesc.includes('refletor') || lowerDesc.includes('spot') || lowerDesc.includes('luminária') || lowerDesc.includes('painel')) {
    category = 'Iluminação';
  }

  const marginPercent = 40;
  const salePrice = Math.round(costPrice * (1 + marginPercent / 100) * 100) / 100;
  const unit = pack.includes('un') ? 'UN' : (pack.includes('MTS') ? 'M' : (pack.includes('PAR') ? 'PAR' : (pack.includes('JG') ? 'JG' : 'UN')));

  const id = `pamp_${code.replace(/[^a-zA-Z0-9]/g, '_')}_${idx + 1}`;

  return {
    id,
    code: `PAMP-${code}`,
    sku: `PAMP-${code}`,
    name: description.replace(/\s+/g, ' ').trim(),
    description: `${description.replace(/\s+/g, ' ').trim()} - Marca: ${brand} (${pack}) - Tabela Pampulha`,
    brand,
    category,
    department: 'Pampulha',
    productClass: 'Materiais Elétricos e Hidráulicos',
    supplierName: 'PAMPULHA Materiais',
    importBatchId: 'pampulha-full-catalog',
    importBatchName: 'Tabela Pampulha Oficial',
    importedAt: '2026-09-02T11:00:00.000Z',
    isImported: true,
    price: salePrice,
    costPrice: costPrice,
    profitMarginPercent: marginPercent,
    stock: 100,
    minStock: 5,
    showInStore: true,
    isActive: true,
    packagingType: unit === 'M' ? 'Metro' : (unit === 'PAR' ? 'Par' : (unit === 'JG' ? 'Jogo' : 'Unidade')),
    dimensionsSize: pack,
    imageUrl: '/ponto_chave_logo.jpg',
    gallery: ['/ponto_chave_logo.jpg']
  };
}

const products = [];
for (let i = 0; i < allLines.length; i++) {
  const p = parseLine(allLines[i], i);
  if (p) products.push(p);
}

const tsContent = `import { Product } from '../types';

/**
 * Catálogo Geral Completo: PAMPULHA (Elétricos, Hidráulicos, Telefonia, Iluminação e Ferramentas)
 * Total de Itens: ${products.length} produtos cadastrados
 * Tabela Oficial Completa
 */
export const pampulhaCatalogFull: Product[] = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync('./data/pampulhaCatalogFull.ts', tsContent, 'utf-8');
console.log(`Successfully generated data/pampulhaCatalogFull.ts with ${products.length} products.`);
