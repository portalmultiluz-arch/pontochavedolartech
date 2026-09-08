import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

// Matriz dos 37 produtos do PDF Famastil Linha Agrícola
// [code, name, tipo, embalagem, ncm, cest, price, costPrice, packagingType, material]
const items = [
  // --- PÁGINA 1 (21 itens: Pás, Cavadeiras, Enxadas, Enxadões, Alvião, Picareta, Chibanca, Forcados e Dobradiça Porteira) ---
  [
    'F91.40',
    'Pá Ajuntadeira Bico Nº3 Cabo Reto 1,20 m',
    'Modelo Bico Nº3; Tamanho 28,5 x 24 cm; Cabo Reto - 1,20 m; Fabricação própria; Lâminas estampadas; Aço carbono temperado; Pintura eletrostática (epóxi) laranja',
    'Master 3 UN',
    '8201.10.00',
    '08.012.00',
    54.90,
    26.90,
    'Unidade',
    'Aço Carbono Temperado / Madeira'
  ],
  [
    'F91.41',
    'Pá Ajuntadeira Bico Nº3 Cabo em Y 75 cm',
    'Modelo Bico Nº3; Tamanho 28,5 x 24 cm; Cabo Em Y - 75 cm; Fabricação própria; Lâminas estampadas; Aço carbono temperado; Pintura eletrostática (epóxi) laranja',
    'Master 3 UN',
    '8201.10.00',
    '08.012.00',
    58.90,
    28.90,
    'Unidade',
    'Aço Carbono Temperado / Madeira'
  ],
  [
    'F91.42',
    'Pá Ajuntadeira Quadrada Nº3 Cabo Reto 1,20 m',
    'Modelo Quadrada Nº3; Tamanho 27,5 x 26 cm; Cabo Reto - 1,20 m; Fabricação própria; Lâminas estampadas; Aço carbono temperado; Pintura eletrostática (epóxi) laranja',
    'Master 3 UN',
    '8201.10.00',
    '08.012.00',
    54.90,
    26.90,
    'Unidade',
    'Aço Carbono Temperado / Madeira'
  ],
  [
    'F91.43',
    'Pá Ajuntadeira Quadrada Nº3 Cabo em Y 75 cm',
    'Modelo Quadrada Nº3; Tamanho 27,5 x 26 cm; Cabo Em Y - 75 cm; Fabricação própria; Lâminas estampadas; Aço carbono temperado; Pintura eletrostática (epóxi) laranja',
    'Master 3 UN',
    '8201.10.00',
    '08.012.00',
    58.90,
    28.90,
    'Unidade',
    'Aço Carbono Temperado / Madeira'
  ],
  [
    'F91.44',
    'Pá Cortadeira/Vanga Bico Nº4 Cabo Reto 1,20 m',
    'Modelo Bico Nº4; Tamanho 26 x 19,5 cm; Cabo Reto - 1,20 m; Fabricação própria; Ponta com tratamento; Proteção contra ferrugem',
    'Master 3 UN',
    '8201.10.00',
    '08.012.00',
    52.90,
    25.90,
    'Unidade',
    'Aço Carbono / Madeira'
  ],
  [
    'F91.45',
    'Pá Cortadeira/Vanga Quadrada Nº4 Cabo Reto 1,20 m',
    'Modelo Quadrada Nº4; Tamanho 26 x 19,5 cm; Cabo Reto - 1,20 m; Fabricação própria; Ponta com tratamento; Proteção contra ferrugem',
    'Master 3 UN',
    '8201.10.00',
    '08.012.00',
    52.90,
    25.90,
    'Unidade',
    'Aço Carbono / Madeira'
  ],
  [
    'F91.10',
    'Cavadeira Articulada Cabo 1,20 m',
    'Cabo de madeira 1,20 m; Fabricação própria; Batente especial para proteger as mãos; Fixação com 4 parafusos; Pintura epóxi',
    'Master 2 UN',
    '8201.90.00',
    '08.012.00',
    79.90,
    39.10,
    'Unidade',
    'Aço Carbono / Madeira'
  ],
  [
    'F91.13',
    'Cavadeira Articulada Robusta Cabo 1,40 m',
    'Cabo de madeira 1,40 m; Fabricação própria; Batente especial para proteger as mãos; Fixação com 4 parafusos; Pintura epóxi',
    'Master 2 UN',
    '8201.90.00',
    '08.012.00',
    94.90,
    46.50,
    'Unidade',
    'Aço Carbono / Madeira'
  ],
  [
    'F91.11',
    'Cavadeira Articulada Light Cabo 1,80 m',
    'Cabo de madeira 1,80 m; Fabricação própria; Batente especial para proteger as mãos; Fixação com 4 parafusos; Pintura epóxi',
    'Master 2 UN',
    '8201.90.00',
    '08.012.00',
    89.90,
    44.00,
    'Unidade',
    'Aço Carbono / Madeira'
  ],
  [
    'F91.90',
    'Cavadeira Reta Cabo 1,20 m',
    'Cabo de madeira 1,20 m; Fabricação própria; Batente especial para proteger as mãos; Fixação com 4 parafusos; Pintura epóxi',
    'Master 3 UN',
    '8201.90.00',
    '08.012.00',
    69.90,
    34.20,
    'Unidade',
    'Aço Carbono / Madeira'
  ],
  [
    'F91.20',
    'Enxada de Aço Estreita 2,5 Libras Cabo 150 cm',
    'Enx. de Aço Estreita - 2,5 Libras; Cabo de madeira - 150 cm; Fabricação própria; Cabo lixado e encerado; Pintura epóxi',
    'Master 3 UN',
    '8201.30.00',
    '08.012.00',
    56.90,
    27.90,
    'Unidade',
    'Aço Carbono / Madeira'
  ],
  [
    'F91.21',
    'Enxada de Aço Larga 2,5 Libras Cabo 150 cm',
    'Enx. de Aço Larga - 2,5 Libras; Cabo de madeira - 150 cm; Fabricação própria; Cabo lixado e encerado; Pintura epóxi',
    'Master 3 UN',
    '8201.30.00',
    '08.012.00',
    58.90,
    28.90,
    'Unidade',
    'Aço Carbono / Madeira'
  ],
  [
    'F91.22',
    'Enxadão Estreito Reforçado Cabo 1,50 m',
    'Cabo de madeira - 1,50 m (conectado, pronto para uso); Peso 1,05 KG; Tamanho 100 X 270 MM; Matéria prima nobre; Lâminas em aço 1070 forjado; Bucha plástica',
    'Master 3 UN',
    '8201.30.00',
    '08.012.00',
    62.90,
    30.80,
    'Unidade',
    'Aço 1070 Forjado / Madeira'
  ],
  [
    'F91.23',
    'Enxadão Largo Reforçado Cabo 1,50 m',
    'Cabo de madeira - 1,50 m (conectado, pronto para uso); Peso 2,15 KG; Tamanho 140 X 280 MM; Matéria prima nobre; Lâminas em aço 1070 forjado; Bucha plástica',
    'Master 3 UN',
    '8201.30.00',
    '08.012.00',
    69.90,
    34.20,
    'Unidade',
    'Aço 1070 Forjado / Madeira'
  ],
  [
    'F91.26',
    'Enxada Reforçada Norte/Bahia Cabo 1,50 m',
    'Cabo de madeira - 1,50 m (conectado, pronto para uso); Peso 1,85 KG; Tamanho 200 X 260 MM; Matéria prima nobre; Lâminas em aço 1070 forjado; Bucha plástica',
    'Master 3 UN',
    '8201.30.00',
    '08.012.00',
    67.90,
    33.20,
    'Unidade',
    'Aço 1070 Forjado / Madeira'
  ],
  [
    'F91.02',
    'Alvião Cabo Reto 95 cm',
    'Cabo reto - 95 cm; Fabricação própria; Aço carbono 1070; Pintura epóxi; Para abertura de perfuração, quebra de paredes e cortes em rochas',
    'Master 2 UN',
    '8201.30.00',
    '08.012.00',
    74.90,
    36.70,
    'Unidade',
    'Aço Carbono 1070 / Madeira'
  ],
  [
    'F91.04',
    'Picareta Cabo Reto 95 cm',
    'Cabo reto - 95 cm; Fabricação própria; Aço carbono 1070; Pintura epóxi; Para abertura de perfuração, quebra de paredes e cortes em rochas',
    'Master 2 UN',
    '8201.30.00',
    '08.012.00',
    78.90,
    38.60,
    'Unidade',
    'Aço Carbono 1070 / Madeira'
  ],
  [
    'F91.06',
    'Chibanca Cabo Reto 95 cm',
    'Cabo reto - 95 cm; Fabricação própria; Aço carbono 1070; Pintura epóxi; Para abertura de perfuração, quebra de paredes e cortes em rochas',
    'Master 2 UN',
    '8201.30.00',
    '08.012.00',
    76.90,
    37.60,
    'Unidade',
    'Aço Carbono 1070 / Madeira'
  ],
  [
    'F91.100',
    'Forcado Reto 4 Dentes Cabo 1,2 m',
    'Cabo - 1,2 m; Aço SAE 1020; 4 dentes soldados; Pintura epóxi',
    'Master 3 UN',
    '8201.20.00',
    '08.012.00',
    68.90,
    33.70,
    'Unidade',
    'Aço SAE 1020 / Madeira'
  ],
  [
    'F91.101',
    'Forcado Curvo 4 Dentes Cabo 1,2 m',
    'Cabo - 1,2 m; Aço SAE 1020; 4 dentes soldados; Pintura epóxi',
    'Master 3 UN',
    '8201.20.00',
    '08.012.00',
    69.90,
    34.20,
    'Unidade',
    'Aço SAE 1020 / Madeira'
  ],
  [
    'F97.01',
    'Dobradiça para Porteira Nº1 (210 x 100 mm)',
    'Tamanho (largura x altura) 210 X 100 MM; Aço carbono SAE 1008; Espessura 3mm; Pintura epóxi',
    'Master 6 UN',
    '8302.10.00',
    '10.058.00',
    26.90,
    13.10,
    'Unidade',
    'Aço Carbono SAE 1008'
  ],

  // --- PÁGINA 2 (16 itens: Dobradiças Porteira, Bainhas de Couro, Facões para Mato e Cana) ---
  [
    'F97.02',
    'Dobradiça para Porteira Nº2 (230 x 100 mm)',
    'Tamanho (largura x altura) 230 X 100 MM; Aço carbono SAE 1008; Espessura 3mm; Pintura epóxi',
    'Master 6 UN',
    '8302.10.00',
    '10.058.00',
    29.90,
    14.60,
    'Unidade',
    'Aço Carbono SAE 1008'
  ],
  [
    'F97.03',
    'Dobradiça para Porteira Nº3 (280 x 100 mm)',
    'Tamanho (largura x altura) 280 X 100 MM; Aço carbono SAE 1008; Espessura 3mm; Pintura epóxi',
    'Master 6 UN',
    '8302.10.00',
    '10.058.00',
    34.90,
    17.10,
    'Unidade',
    'Aço Carbono SAE 1008'
  ],
  [
    'F97.04',
    'Dobradiça para Porteira Nº4 (330 x 100 mm)',
    'Tamanho (largura x altura) 330 X 100 MM; Aço carbono SAE 1008; Espessura 3mm; Pintura epóxi',
    'Master 6 UN',
    '8302.10.00',
    '10.058.00',
    39.90,
    19.50,
    'Unidade',
    'Aço Carbono SAE 1008'
  ],
  [
    'F64.50',
    'Bainha de Couro para Facão 10" (10 x 25 cm)',
    'Para facão 10"; Tamanho 10 X 25 CM; Couro legítimo de alta espessura; Acabamento em verniz; Furo de drenagem para líquidos; Costurado à mão',
    'Master 6 UN',
    '4205.00.00',
    '28.061.00',
    28.90,
    14.10,
    'Unidade',
    'Couro Legítimo'
  ],
  [
    'F64.51',
    'Bainha de Couro para Facão 12" (10 x 30 cm)',
    'Para facão 12"; Tamanho 10 X 30 CM; Couro legítimo de alta espessura; Acabamento em verniz; Furo de drenagem para líquidos; Costurado à mão',
    'Master 6 UN',
    '4205.00.00',
    '28.061.00',
    32.90,
    16.10,
    'Unidade',
    'Couro Legítimo'
  ],
  [
    'F64.52',
    'Bainha de Couro para Facão 14" (10 x 35 cm)',
    'Para facão 14"; Tamanho 10 X 35 CM; Couro legítimo de alta espessura; Acabamento em verniz; Furo de drenagem para líquidos; Costurado à mão',
    'Master 6 UN',
    '4205.00.00',
    '28.061.00',
    36.90,
    18.00,
    'Unidade',
    'Couro Legítimo'
  ],
  [
    'F64.53',
    'Bainha de Couro para Facão 16" (10 x 40 cm)',
    'Para facão 16"; Tamanho 10 X 40 CM; Couro legítimo de alta espessura; Acabamento em verniz; Furo de drenagem para líquidos; Costurado à mão',
    'Master 6 UN',
    '4205.00.00',
    '28.061.00',
    41.90,
    20.50,
    'Unidade',
    'Couro Legítimo'
  ],
  [
    'F64.54',
    'Bainha de Couro para Facão 18" (10 x 45 cm)',
    'Para facão 18"; Tamanho 10 X 45 CM; Couro legítimo de alta espessura; Acabamento em verniz; Furo de drenagem para líquidos; Costurado à mão',
    'Master 6 UN',
    '4205.00.00',
    '28.061.00',
    45.90,
    22.50,
    'Unidade',
    'Couro Legítimo'
  ],
  [
    'F64.55',
    'Bainha de Couro para Facão 20" (10 x 50 cm)',
    'Para facão 20"; Tamanho 10 X 50 CM; Couro legítimo de alta espessura; Acabamento em verniz; Furo de drenagem para líquidos; Costurado à mão',
    'Master 6 UN',
    '4205.00.00',
    '28.061.00',
    49.90,
    24.50,
    'Unidade',
    'Couro Legítimo'
  ],
  [
    'F64.10',
    'Facão para Mato 10" Cabo Plástico',
    'Tamanho 10"; Cabo plástico; Lâmina polida e temperada; Lâmina até o 3º ponto de fixação; Cabo com desenho ergonômico',
    'Middle 6 UN / Master 36 UN',
    '8201.90.00',
    '08.012.00',
    29.90,
    14.60,
    'Unidade',
    'Aço Temperado / Plástico'
  ],
  [
    'F64.11',
    'Facão para Mato 12" Cabo Plástico',
    'Tamanho 12"; Cabo plástico; Lâmina polida e temperada; Lâmina até o 3º ponto de fixação; Cabo com desenho ergonômico',
    'Middle 6 UN / Master 36 UN',
    '8201.90.00',
    '08.012.00',
    33.90,
    16.60,
    'Unidade',
    'Aço Temperado / Plástico'
  ],
  [
    'F64.12',
    'Facão para Mato 14" Cabo Plástico',
    'Tamanho 14"; Cabo plástico; Lâmina polida e temperada; Lâmina até o 3º ponto de fixação; Cabo com desenho ergonômico',
    'Middle 6 UN / Master 36 UN',
    '8201.90.00',
    '08.012.00',
    37.90,
    18.50,
    'Unidade',
    'Aço Temperado / Plástico'
  ],
  [
    'F64.13',
    'Facão para Mato 16" Cabo Plástico',
    'Tamanho 16"; Cabo plástico; Lâmina polida e temperada; Lâmina até o 3º ponto de fixação; Cabo com desenho ergonômico',
    'Middle 6 UN / Master 36 UN',
    '8201.90.00',
    '08.012.00',
    41.90,
    20.50,
    'Unidade',
    'Aço Temperado / Plástico'
  ],
  [
    'F64.14',
    'Facão para Mato 18" Cabo Plástico',
    'Tamanho 18"; Cabo plástico; Lâmina polida e temperada; Lâmina até o 3º ponto de fixação; Cabo com desenho ergonômico',
    'Middle 6 UN / Master 36 UN',
    '8201.90.00',
    '08.012.00',
    46.90,
    23.00,
    'Unidade',
    'Aço Temperado / Plástico'
  ],
  [
    'F64.15',
    'Facão para Mato 20" Cabo Plástico',
    'Tamanho 20"; Cabo plástico; Lâmina polida e temperada; Lâmina até o 3º ponto de fixação; Cabo com desenho ergonômico',
    'Middle 6 UN / Master 36 UN',
    '8201.90.00',
    '08.012.00',
    51.90,
    25.40,
    'Unidade',
    'Aço Temperado / Plástico'
  ],
  [
    'F64.16',
    'Facão para Cana 13" Cabo em Madeira',
    '13"; Cabo em madeira; Lâmina polida e temperada; 4 parafusos de fixação; Lâmina até o 4º ponto de fixação',
    'Middle 6 UN / Master 36 UN',
    '8201.90.00',
    '08.012.00',
    44.90,
    22.00,
    'Unidade',
    'Aço Temperado / Madeira'
  ]
];

async function runImport() {
  console.log(`Iniciando importação de ${items.length} produtos Agrícolas Famastil...`);

  // Carrega produtos existentes de data/products.ts para complementar
  let existingProducts = [];
  try {
    const rawTs = fs.readFileSync('./data/products.ts', 'utf8');
    const jsonMatch = rawTs.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
    if (jsonMatch) {
      existingProducts = JSON.parse(jsonMatch[1]);
    }
  } catch (err) {
    console.warn('Não foi possível ler produtos existentes, iniciando lista nova:', err.message);
  }

  const existingMap = new Map();
  existingProducts.forEach(p => existingMap.set(p.id, p));

  const importedAgricolas = [];

  for (const item of items) {
    const [code, name, tipo, embalagemInfo, ncm, cest, price, costPrice, packagingType, material] = item;
    const docId = `prod_famastil_agricola_${code.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    
    const payload = {
      id: docId,
      code,
      sku: `SKU-${code}`,
      name: `${name} Famastil`,
      category: 'Agrícolas',
      description: `${name}. Especificações: ${tipo}. Embalagem: ${embalagemInfo}. Codificação tributária legal: NCM ${ncm}, CEST ${cest}, CFOP 5102, CST 102, ICMS 18%, IPI 5%, PIS 0.65%, COFINS 3.00%.`,
      price,
      costPrice,
      stock: 36,
      minStock: 4,
      packagingType,
      material: material || 'Aço Carbono / Madeira',
      imageUrl: '/ponto_chave_logo.jpg',
      gallery: ['/ponto_chave_logo.jpg'],
      isActive: true,
      showInStore: false, // CRÍTICO: Não ativo para exibição na página principal
      isImported: true,
      importBatchId: 'batch_famastil_agricola_20260829',
      importBatchName: 'Importação PDF Linha Agrícola Famastil (29/08/2026)',
      importedAt: '2026-08-29T12:00:00.000Z',
      purchaseDate: '2026-08-29',
      invoiceNumber: 'PDF-AGRICOLA-20260829',
      supplierName: 'Famastil Linha Agrícola & Ferramentas',
      icmsPercent: 18,
      ipiPercent: 5,
      pisPercent: 0.65,
      cofinsPercent: 3.00,
      otherTaxesPercent: 0,
      profitMarginPercent: 45,
      technicalSpecs: `NCM: ${ncm} | CEST: ${cest} | CFOP: 5102 | CST: 102 | ICMS: 18% | IPI: 5% | PIS: 0.65% | COFINS: 3.00% | Embalagem: ${embalagemInfo} | Linha: Agrícola Famastil | Fornecedor: Famastil Linha Agrícola & Ferramentas`
    };

    importedAgricolas.push(payload);
    existingMap.set(docId, payload);

    // Salva no Firestore
    await setDoc(doc(db, 'products', docId), payload);
  }

  console.log(`Firestore atualizado com sucesso com os ${importedAgricolas.length} produtos Agrícolas!`);

  // Salva no data/products.ts reunindo todos os produtos
  const allProducts = Array.from(existingMap.values());
  const tsContent = `import type { Product } from '../types';\n\nexport const products: Product[] = ${JSON.stringify(allProducts, null, 2)};\n`;
  fs.writeFileSync('./data/products.ts', tsContent, 'utf8');
  console.log(`Arquivo data/products.ts atualizado com ${allProducts.length} produtos no total!`);

  process.exit(0);
}

runImport().catch(err => {
  console.error('Erro na importação:', err);
  process.exit(1);
});
