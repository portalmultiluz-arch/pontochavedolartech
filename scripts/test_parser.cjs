const p1 = require('./raw_pampulha_part1.cjs');
const p2 = require('./raw_pampulha_part2.cjs');
const p3 = require('./raw_pampulha_part3.cjs');
const p4 = require('./raw_pampulha_part4.cjs');
const p5 = require('./raw_pampulha_part5.cjs');

const allLines = [...p1, ...p2, ...p3, ...p4, ...p5];

console.log('Total raw lines collected:', allLines.length);

function parseLine(line, idx) {
  line = line.trim();
  if (!line) return null;

  // Extract Price at the end: R$ 14,80 or R$ 1.115,00
  const priceMatch = line.match(/R\$\s*([0-9.,]+)$/i);
  if (!priceMatch) {
    console.warn(`[Line ${idx}] Price not found: "${line}"`);
    return null;
  }
  const priceStr = priceMatch[1].replace(/\./g, '').replace(',', '.');
  const costPrice = parseFloat(priceStr);
  const withoutPrice = line.substring(0, priceMatch.index).trim();

  // Extract Pack/Unit at end of withoutPrice (e.g. 10 un., 100 un., 1 un., 12 un., 50 un., PAR, JG, etc.)
  const packMatch = withoutPrice.match(/\s+(\d+\s*(?:un\.|unids\.|unid\.|un|MTS|METROS|PAR|JG|PÇS|RL)|PAR|JG|1\s*un\.?)$/i);
  let pack = '1 un.';
  let withoutPack = withoutPrice;
  if (packMatch) {
    pack = packMatch[1].trim();
    withoutPack = withoutPrice.substring(0, packMatch.index).trim();
  }

  // Extract SKU/Code at the beginning: e.g. "7314", "4451/4058", "PAMP-123", "27", etc.
  const skuMatch = withoutPack.match(/^([A-Z0-9\-\/]+)\s+/i);
  let code = `PAMP-${idx + 1}`;
  let rest = withoutPack;
  if (skuMatch) {
    code = skuMatch[1];
    rest = withoutPack.substring(skuMatch[0].length).trim();
  }

  // Remove common headers from OCR: "Materiais Elétricos PAMPULHAMateriais Elétricos e Ferramentas", "Materiais Hidráulicos PAMPULHA Materiais Hidráulicos e Ferramentas", etc.
  rest = rest.replace(/^(?:Materiais\s+Elétricos|Materiais\s+Hidráulicos|Iluminação|Ferramentas)\s*(?:PAMPULHA)?\s*(?:Materiais\s+Elétricos\s+e\s+Ferramentas|Materiais\s+Hidráulicos\s+e\s+Ferramentas)?\s*/i, '').trim();

  // Try to extract brand at the end of `rest`
  const knownBrands = [
    'MARGIRIUS', 'MAR-GIRIUS', 'KRONA', 'DECA', 'PIAL', 'LORENZETTI', 'ENERBRÁS', 'ENERBRAS', 
    'BIKI', 'TAF', 'PERLEX', 'AJAX', 'FERTAK', 'SECALUX', 'APLACEL', 'MEGA', 'METALKIT', 'BLUKIT',
    'ROCO', 'VINIGÁS', 'VINIGAS', 'JMA', 'G20', 'CONIMEL', 'ELETROKIT', 'DECORLUX', 'KIAN',
    'REDY', 'LALUX', 'UTRON', 'BRASFORMA', 'GARAPLAS', 'CLARINOX', 'ALBACETE', 'CENSI', 'INTERNEED',
    'MASTER', 'GARDEN', 'OVD', 'PALOMAR', 'J S A', 'J S A', 'J A', 'RIB. FABRIL', 'RIBEIRO FABRIL',
    'BLUMENAU', 'TRAMONTINA', 'IMPORTADO', 'DIVERSOS', 'FABRIL', 'FAME', 'ALUMBRA', 'CORFIO',
    'SIL', 'COBRECOM', 'MEIKON', 'MIXPLAST./L&C', 'PLASTIFLUOR', 'SACRAMENTO', 'ATLAS'
  ];

  let brand = 'PAMPULHA';
  let description = rest;

  for (const b of knownBrands) {
    const regex = new RegExp(`\\b${b.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
    if (regex.test(rest)) {
      brand = b;
      description = rest.replace(regex, '').trim();
      break;
    }
  }

  // Determine category
  let category = 'Material Elétrico';
  const lowerDesc = (description + ' ' + rest).toLowerCase();
  if (lowerDesc.includes('hidrául') || lowerDesc.includes('tubo') || lowerDesc.includes('joelho') || lowerDesc.includes('torneira') || lowerDesc.includes('chuveiro') || lowerDesc.includes('sifão') || lowerDesc.includes('registro') || lowerDesc.includes('válvula') || lowerDesc.includes('esgoto') || lowerDesc.includes('engate') || lowerDesc.includes('bóia') || lowerDesc.includes('caixa sifonada') || lowerDesc.includes('ralo') || lowerDesc.includes('adaptador cola') || lowerDesc.includes('bucha de redução') || lowerDesc.includes('gás')) {
    category = 'Material Hidráulico';
  } else if (lowerDesc.includes('serrote') || lowerDesc.includes('alicate') || lowerDesc.includes('tesoura') || lowerDesc.includes('chave fenda') || lowerDesc.includes('trena') || lowerDesc.includes('disco') || lowerDesc.includes('martelo') || lowerDesc.includes('broca') || lowerDesc.includes('ferramenta') || lowerDesc.includes('vassoura') || lowerDesc.includes('rodo') || lowerDesc.includes('rolo')) {
    category = 'Ferramentas e Utilidades';
  } else if (lowerDesc.includes('lâmpada') || lowerDesc.includes('led') || lowerDesc.includes('plafon') || lowerDesc.includes('refletor') || lowerDesc.includes('spot') || lowerDesc.includes('luminária') || lowerDesc.includes('painel')) {
    category = 'Iluminação';
  }

  // Calculate default sale price (markup 40%)
  const marginPercent = 40;
  const salePrice = Math.round(costPrice * (1 + marginPercent / 100) * 100) / 100;

  return {
    code: code.trim(),
    name: description.replace(/\s+/g, ' ').trim(),
    brand: brand.trim(),
    category,
    pack,
    costPrice,
    salePrice,
    table: 'PAMPULHA',
    supplier: 'PAMPULHA',
    stock: 100,
    minStock: 5,
    unit: pack.includes('un') ? 'UN' : (pack.includes('MTS') ? 'M' : (pack.includes('PAR') ? 'PAR' : (pack.includes('JG') ? 'JG' : 'UN'))),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

const parsed = [];
for (let i = 0; i < allLines.length; i++) {
  const item = parseLine(allLines[i], i);
  if (item) parsed.push(item);
}

console.log(`Parsed ${parsed.length} products successfully out of ${allLines.length} raw lines.`);
console.log('Sample item 0:', parsed[0]);
console.log('Sample item 100:', parsed[100]);
console.log('Sample item last:', parsed[parsed.length - 1]);

module.exports = { parsed };
