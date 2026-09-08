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
  'SIL', 'COBRECOM', 'MEIKON', 'MIXPLAST./L&C', 'PLASTIFLUOR', 'SACRAMENTO', 'ATLAS', 'FOXLUX',
  'FAMASTIL', 'VONDER', 'STARRETT', 'GERDAU', 'TIGRE', 'AMANCO', 'SIEMENS', 'SCHNEIDER'
];

/**
 * Determina a codificação tributária legal (NCM, CEST, CFOP, CSOSN, CST, etc.) com base no produto.
 */
function getLegalTaxCoding(desc, category) {
  const text = desc.toLowerCase();

  // 1. Cabos e condutores elétricos (cobre/alumínio)
  if (text.includes('cabo') || text.includes('fio') || text.includes('cordão') || text.includes('condutor')) {
    return {
      ncm: '8544.49.00',
      cest: '10.052.00',
      cfop: '5.405',
      csosn: '500',
      cst: '060',
      taxOrigin: '0',
      icmsPercent: 18.0,
      ipiPercent: 0.0,
      pisPercent: 0.65,
      cofinsPercent: 3.0
    };
  }

  // 2. Disjuntores e proteção elétrica
  if (text.includes('disjuntor') || text.includes('dps') || text.includes('dr ') || text.includes('diferencial residual')) {
    return {
      ncm: '8536.20.00',
      cest: '10.046.00',
      cfop: '5.405',
      csosn: '500',
      cst: '060',
      taxOrigin: '0',
      icmsPercent: 18.0,
      ipiPercent: 0.0,
      pisPercent: 0.65,
      cofinsPercent: 3.0
    };
  }

  // 3. Fita Isolante
  if (text.includes('fita isolante')) {
    return {
      ncm: '3919.10.20',
      cest: '10.038.00',
      cfop: '5.405',
      csosn: '500',
      cst: '060',
      taxOrigin: '0',
      icmsPercent: 18.0,
      ipiPercent: 0.0,
      pisPercent: 0.65,
      cofinsPercent: 3.0
    };
  }

  // 4. Interruptores, tomadas, plugues, adaptadores elétricos, sensores de presença
  if (text.includes('interruptor') || text.includes('tomada') || text.includes('pulsador') || text.includes('plugue') || text.includes('pino') || text.includes('adaptador 2p') || text.includes('sensor')) {
    return {
      ncm: '8536.69.10',
      cest: '10.050.00',
      cfop: '5.405',
      csosn: '500',
      cst: '060',
      taxOrigin: '0',
      icmsPercent: 18.0,
      ipiPercent: 0.0,
      pisPercent: 0.65,
      cofinsPercent: 3.0
    };
  }

  // 5. Quadros de distribuição, caixas de passagem e conduletes
  if (text.includes('quadro') || text.includes('caixa de luz') || text.includes('caixa de passagem') || text.includes('condulete')) {
    return {
      ncm: '8537.10.20',
      cest: '10.051.00',
      cfop: '5.405',
      csosn: '500',
      cst: '060',
      taxOrigin: '0',
      icmsPercent: 18.0,
      ipiPercent: 0.0,
      pisPercent: 0.65,
      cofinsPercent: 3.0
    };
  }

  // 6. Iluminação: Lâmpadas LED, refletores, plafons, luminárias
  if (text.includes('lâmpada') || text.includes('lampada') || text.includes('led') || text.includes('refletor') || text.includes('plafon') || text.includes('spot') || text.includes('painel')) {
    return {
      ncm: '8539.52.00',
      cest: '09.001.00',
      cfop: '5.405',
      csosn: '500',
      cst: '060',
      taxOrigin: '0',
      icmsPercent: 18.0,
      ipiPercent: 0.0,
      pisPercent: 0.65,
      cofinsPercent: 3.0
    };
  }

  // 7. Chuveiros, duchas elétricas e torneiras elétricas
  if (text.includes('chuveiro') || text.includes('ducha') || text.includes('loren shower') || text.includes('bella ducha') || text.includes('acqua')) {
    return {
      ncm: '8516.10.00',
      cest: '10.070.00',
      cfop: '5.405',
      csosn: '500',
      cst: '060',
      taxOrigin: '0',
      icmsPercent: 18.0,
      ipiPercent: 0.0,
      pisPercent: 0.65,
      cofinsPercent: 3.0
    };
  }

  // 8. Resistências elétricas
  if (text.includes('resistência') || text.includes('resistencia')) {
    return {
      ncm: '8516.90.00',
      cest: '10.071.00',
      cfop: '5.405',
      csosn: '500',
      cst: '060',
      taxOrigin: '0',
      icmsPercent: 18.0,
      ipiPercent: 0.0,
      pisPercent: 0.65,
      cofinsPercent: 3.0
    };
  }

  // 9. Torneiras, registros, válvulas hidráulicas de esfera/pressão/gaveta
  if (text.includes('torneira') || text.includes('registro') || text.includes('válvula') || text.includes('valvula')) {
    return {
      ncm: '8481.80.19',
      cest: '10.076.00',
      cfop: '5.405',
      csosn: '500',
      cst: '060',
      taxOrigin: '0',
      icmsPercent: 18.0,
      ipiPercent: 0.0,
      pisPercent: 0.65,
      cofinsPercent: 3.0
    };
  }

  // 10. Tubos e canos de PVC (esgoto e soldável)
  if (text.includes('tubo') || text.includes('cano') || text.includes('eletroduto')) {
    return {
      ncm: '3917.23.00',
      cest: '10.005.00',
      cfop: '5.405',
      csosn: '500',
      cst: '060',
      taxOrigin: '0',
      icmsPercent: 18.0,
      ipiPercent: 0.0,
      pisPercent: 0.65,
      cofinsPercent: 3.0
    };
  }

  // 11. Conexões de PVC (joelhos, luvas, curvas, tês, reduções, adaptadores)
  if (text.includes('joelho') || text.includes('luva') || text.includes('curva') || text.includes('tê ') || text.includes('te ') || text.includes('redução') || text.includes('adaptador') || text.includes('caps') || text.includes('niple') || text.includes('plug') || text.includes('união') || text.includes('bucha')) {
    return {
      ncm: '3917.40.90',
      cest: '10.007.00',
      cfop: '5.405',
      csosn: '500',
      cst: '060',
      taxOrigin: '0',
      icmsPercent: 18.0,
      ipiPercent: 0.0,
      pisPercent: 0.65,
      cofinsPercent: 3.0
    };
  }

  // 12. Caixas sifonadas, ralos, sifões, assentos sanitários, bacias
  if (text.includes('caixa sifonada') || text.includes('ralo') || text.includes('sifão') || text.includes('sifao') || text.includes('assento') || text.includes('bacia') || text.includes('porta grelha')) {
    return {
      ncm: '3922.90.00',
      cest: '10.016.00',
      cfop: '5.405',
      csosn: '500',
      cst: '060',
      taxOrigin: '0',
      icmsPercent: 18.0,
      ipiPercent: 0.0,
      pisPercent: 0.65,
      cofinsPercent: 3.0
    };
  }

  // 13. Mangueiras (jardim, nível, gás, máquina de lavar)
  if (text.includes('mangueira')) {
    return {
      ncm: '3917.39.00',
      cest: '10.009.00',
      cfop: '5.405',
      csosn: '500',
      cst: '060',
      taxOrigin: '0',
      icmsPercent: 18.0,
      ipiPercent: 0.0,
      pisPercent: 0.65,
      cofinsPercent: 3.0
    };
  }

  // 14. Varais de chão, teto ou muro
  if (text.includes('varal')) {
    return {
      ncm: '7326.90.90',
      cest: '10.037.00',
      cfop: '5.102',
      csosn: '102',
      cst: '000',
      taxOrigin: '0',
      icmsPercent: 18.0,
      ipiPercent: 0.0,
      pisPercent: 0.65,
      cofinsPercent: 3.0
    };
  }

  // 15. Ferramentas manuais e abrasivos
  if (text.includes('alicate') || text.includes('chave') || text.includes('martelo') || text.includes('serrote') || text.includes('trena') || text.includes('disco') || text.includes('broca') || text.includes('arco de serra')) {
    return {
      ncm: '8203.20.90',
      cest: '08.001.00',
      cfop: '5.102',
      csosn: '102',
      cst: '000',
      taxOrigin: '0',
      icmsPercent: 18.0,
      ipiPercent: 0.0,
      pisPercent: 0.65,
      cofinsPercent: 3.0
    };
  }

  // Padrão genérico de material de construção / elétrico / hidráulico
  return {
    ncm: '8544.49.00',
    cest: '10.052.00',
    cfop: '5.405',
    csosn: '500',
    cst: '060',
    taxOrigin: '0',
    icmsPercent: 18.0,
    ipiPercent: 0.0,
    pisPercent: 0.65,
    cofinsPercent: 3.0
  };
}

/**
 * Avalia se o produto ultrapassa o limite padrão de correios/transportadoras normais
 * (ex: comprimento > 100cm, mangueiras de 50m+, varais, tubos de 3m/6m, etc.)
 */
function getSpecialDeliveryCepConfig(desc, pack) {
  const text = (desc + ' ' + pack).toLowerCase();
  const isOutOfStandard = 
    text.includes('tubo') || 
    text.includes('eletroduto') || 
    text.includes('varal') || 
    text.includes('50metros') || 
    text.includes('100metros') || 
    text.includes('50mts') || 
    text.includes('100mts') || 
    text.includes('barra') || 
    text.includes('escada') || 
    text.includes('cabo') && (text.includes('100m') || text.includes('rl') || text.includes('rolo'));

  if (isOutOfStandard) {
    return {
      isSpecialDelivery: true,
      specialDeliveryCepCode: 'CEP-ESPECIAL-PAMPULHA-FORA-PADRAO',
      specialDeliveryCepRange: '30000-000 a 34999-999 (Belo Horizonte e Região Metropolitana)',
      specialDeliveryNotes: 'Produto fora do padrão dos correios e transportadoras convencionais (dimensão > 100cm ou peso/volume elevado). Logística dedicada por CEP regional.'
    };
  }

  return {
    isSpecialDelivery: false,
    specialDeliveryCepCode: 'PADRAO-CORREIOS-NACIONAL',
    specialDeliveryCepRange: 'Atendimento Nacional (Correios / Transportadoras)',
    specialDeliveryNotes: 'Atende às dimensões e peso regulamentares dos Correios e transportadoras padrão.'
  };
}

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

  // Preço de custo é exatamente o preço da tabela
  const marginPercent = 40;
  const initialSalePrice = Math.round(costPrice * (1 + marginPercent / 100) * 100) / 100;
  const unit = pack.includes('un') ? 'UN' : (pack.includes('MTS') ? 'M' : (pack.includes('PAR') ? 'PAR' : (pack.includes('JG') ? 'JG' : 'UN')));

  const taxData = getLegalTaxCoding(description, category);
  const deliveryData = getSpecialDeliveryCepConfig(description, pack);

  const id = `pamp_${code.replace(/[^a-zA-Z0-9]/g, '_')}_${idx + 1}`;
  const now = new Date().toISOString();
  const todayDate = now.split('T')[0];

  const cleanDesc = description.replace(/\s+/g, ' ').trim();
  const safeBrand = (brand || '').toLowerCase().includes('pampulha') ? 'Ponto Chave do Lar' : brand;
  const clientDescription = safeBrand && safeBrand !== 'DIVERSOS' 
    ? `${cleanDesc} - Marca: ${safeBrand} (${pack})` 
    : `${cleanDesc} (${pack})`;

  return {
    id,
    code: `PAMP-${code}`,
    sku: `PAMP-${code}`,
    name: cleanDesc,
    description: clientDescription,
    brand: safeBrand,
    category,
    department: 'Materiais Elétricos e Hidráulicos',
    productClass: 'Materiais Elétricos e Hidráulicos',
    supplierName: 'PAMPULHA CONDUTORES',
    table: 'PAMPULHA CONDUTORES',
    importBatchId: 'pampulha-condutores-oficial',
    importBatchName: 'Pampulha Condutores Oficial',
    importedAt: now,
    createdAt: now,
    purchaseDate: todayDate,
    isImported: true,
    
    // Preço e Custo
    costPrice: costPrice,
    costPriceOriginal: costPrice,
    costPriceMarginIndexPercent: 0, // Índice percentual de margem para atualizar preço de custo no BD
    costPriceLastAdjustmentDate: now,
    price: initialSalePrice, // Preço de venda configurado
    profitMarginPercent: marginPercent,

    // Status: NÃO ATIVO PARA EXIBIÇÃO NA PÁGINA PRINCIPAL
    isActive: false,
    showInStore: false,

    // Estoque: IGUAL A ZERO
    stock: 0,
    minStock: 0,

    // Imagem: PADRÃO PONTO CHAVE DO LAR
    imageUrl: '/ponto_chave_logo.jpg',
    gallery: ['/ponto_chave_logo.jpg'],

    // Embalagem e unidade
    packagingType: unit === 'M' ? 'Metro' : (unit === 'PAR' ? 'Par' : (unit === 'JG' ? 'Jogo' : 'Unidade')),
    dimensionsSize: pack,

    // Codificação Tributária Legal
    ncm: taxData.ncm,
    cest: taxData.cest,
    cfop: taxData.cfop,
    csosn: taxData.csosn,
    cst: taxData.cst,
    taxOrigin: taxData.taxOrigin,
    icmsPercent: taxData.icmsPercent,
    ipiPercent: taxData.ipiPercent,
    pisPercent: taxData.pisPercent,
    cofinsPercent: taxData.cofinsPercent,

    // Codificação POR CEP para entrega de produtos fora do padrão
    isSpecialDelivery: deliveryData.isSpecialDelivery,
    pickupOrLocal15kmOnly: deliveryData.isSpecialDelivery,
    specialDeliveryCepCode: deliveryData.specialDeliveryCepCode.replace(/PAMPULHA-/g, ''),
    specialDeliveryCepRange: deliveryData.specialDeliveryCepRange,
    specialDeliveryNotes: deliveryData.specialDeliveryNotes,

    purchaseHistory: [
      {
        id: `pur_pamp_${idx + 1}`,
        invoiceNumber: 'TABELA-PAMPULHA-CONDUTORES-2026',
        purchaseDate: todayDate,
        supplierName: 'PAMPULHA CONDUTORES',
        quantityAdded: 0,
        costPrice: costPrice,
        sellingPrice: initialSalePrice,
        createdAt: now
      }
    ]
  };
}

async function runImport() {
  console.log(`=== INÍCIO DA IMPORTAÇÃO PAMPULHA CONDUTORES ===`);
  console.log(`Linhas totais fornecidas: ${allLines.length}`);

  const products = [];
  for (let i = 0; i < allLines.length; i++) {
    const p = parseLine(allLines[i], i);
    if (p) products.push(p);
  }

  console.log(`Produtos estruturados prontos: ${products.length}`);
  console.log(`Exemplo de produto 1:`, JSON.stringify(products[0], null, 2));
  console.log(`Exemplo de produto especial (fora do padrão correios):`, JSON.stringify(products.find(p => p.isSpecialDelivery), null, 2));

  // Escrever em lotes de 400 no Firestore
  const chunkSize = 400;
  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    const batchNumber = Math.floor(i / chunkSize) + 1;
    const totalBatches = Math.ceil(products.length / chunkSize);
    console.log(`Gravando lote ${batchNumber}/${totalBatches} (${chunk.length} itens)...`);
    
    const batch = writeBatch(db);
    for (const prod of chunk) {
      const docRef = doc(db, 'products', prod.id);
      batch.set(docRef, prod);
    }
    await batch.commit();
    console.log(`Lote ${batchNumber}/${totalBatches} gravado com sucesso no Firestore!`);
  }

  console.log(`\n🎉 SUCESSO ABSOLUTO! ${products.length} produtos de PAMPULHA CONDUTORES cadastrados.`);
}

runImport().catch(err => {
  console.error('Erro na importação:', err);
  process.exit(1);
});
