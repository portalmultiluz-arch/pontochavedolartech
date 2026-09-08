const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, writeBatch } = require('firebase/firestore');
const config = require('../firebase-applet-config.json');

const p1 = require('./raw_pampulha_part1.cjs');
const p2 = require('./raw_pampulha_part2.cjs');
const p3 = require('./raw_pampulha_part3.cjs');
const p4 = require('./raw_pampulha_part4.cjs');
const p5 = require('./raw_pampulha_part5.cjs');

const allLines = [...p1, ...p2, ...p3, ...p4, ...p5];

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

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
  if (!priceMatch) {
    console.warn(`[Line ${idx}] Price not found: "${line}"`);
    return null;
  }
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
    importedAt: new Date().toISOString(),
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
    gallery: ['/ponto_chave_logo.jpg'],
    purchaseHistory: [
      {
        id: `pur_pamp_${idx + 1}`,
        invoiceNumber: 'TABELA-PAMPULHA-2025',
        purchaseDate: new Date().toISOString().split('T')[0],
        supplierName: 'PAMPULHA Materiais',
        quantityAdded: 100,
        costPrice: costPrice,
        sellingPrice: salePrice,
        createdAt: new Date().toISOString()
      }
    ]
  };
}

async function runImport() {
  console.log(`Starting parse of ${allLines.length} lines...`);
  const products = [];
  for (let i = 0; i < allLines.length; i++) {
    const p = parseLine(allLines[i], i);
    if (p) products.push(p);
  }
  console.log(`Successfully prepared ${products.length} products to import.`);

  // Write in chunks of 450 (Firestore limit is 500 operations per batch)
  const chunkSize = 450;
  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    console.log(`Writing batch ${Math.floor(i / chunkSize) + 1} (${chunk.length} items)...`);
    const batch = writeBatch(db);
    for (const prod of chunk) {
      const docRef = doc(db, 'products', prod.id);
      batch.set(docRef, prod);
    }
    await batch.commit();
    console.log(`Batch ${Math.floor(i / chunkSize) + 1} committed successfully!`);
  }

  console.log(`\n🎉 IMPORT COMPLETED SUCCESSFULLY! Total of ${products.length} Pampulha products imported into Firestore.`);
}

runImport().catch(err => {
  console.error('Import error:', err);
  process.exit(1);
});
