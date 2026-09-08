import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

// Matriz dos 4 produtos do PDF FOXLUX SMART
// [code, name, tipo, embalagem, ncm, cest, price, costPrice, packagingType, material, voltage, wattage, amperage]
const items = [
  {
    code: '98.40',
    name: 'Lâmpada Inteligente Foxlux Smart Wi-Fi 9W Bivolt RGB',
    shortName: 'Lâmpada Inteligente',
    tipo: 'Potência 9W; Bivolt; Fluxo 806lm; RGB|3000K|6500K; IP20; Conexão Wi-Fi (2,4Ghz+BLE); Controle via app Tuya; Compatível Google Assistant e Amazon Alexa; Modo cena e música; Timer programável',
    embalagem: 'Unidade de venda CX / Master 50 UN',
    ncm: '8539.52.00',
    cest: '21.114.00',
    price: 54.90,
    costPrice: 26.90,
    packagingType: 'Caixa',
    material: 'Termoplástico / Alumínio / LED',
    voltage: 'Bivolt (100-240V)',
    wattage: '9W'
  },
  {
    code: '98.30',
    name: 'Bocal Inteligente Foxlux Smart Wi-Fi E-27 Bivolt 100W',
    shortName: 'Bocal Inteligente',
    tipo: 'Potência 100W; Bivolt; Base E-27; IP20; Conexão Wi-Fi (2,4Ghz+BLE); Design compacto rosca padrão; Controle via app Tuya; Compatível Google Assistant e Amazon Alexa; Vida útil 400 mil cliques',
    embalagem: 'Unidade de venda CX / Master 50 UN',
    ncm: '8536.61.00',
    cest: '21.049.00',
    price: 59.90,
    costPrice: 29.50,
    packagingType: 'Caixa',
    material: 'Termoplástico / Latão',
    voltage: 'Bivolt (100-240V)',
    wattage: '100W'
  },
  {
    code: '98.20',
    name: 'Interruptor Inteligente Touch 2 Teclas Foxlux Smart Wi-Fi Bivolt 10A',
    shortName: 'Interruptor Inteligente',
    tipo: 'Potência 1800W; Bivolt; Corrente 10A; IP20; Conexão Wi-Fi (2,4Ghz+BLE); Painel frontal em vidro; Duas teclas sensíveis ao toque; App Tuya; Compatível Google Assistant e Amazon Alexa; Indicador LED azul',
    embalagem: 'Unidade de venda CX / Master 40 UN',
    ncm: '8536.50.90',
    cest: '21.047.00',
    price: 98.90,
    costPrice: 48.50,
    packagingType: 'Caixa',
    material: 'Vidro Temperado / Termoplástico ABS',
    voltage: 'Bivolt (100-240V)',
    wattage: '1800W',
    amperage: '10A'
  },
  {
    code: '98.10',
    name: 'Plugue/Tomada Inteligente Foxlux Smart Wi-Fi 16A Bivolt',
    shortName: 'Plugue/Tomada Inteligente',
    tipo: 'Tensão Bivolt; Potência máx. 2032W(127V)/3520W(220V); Corrente 16A; IP20; Conexão Wi-Fi (2,4Ghz+BLE); App Tuya; Compatível Google Assistant e Amazon Alexa; Timer programável; Botão ON/OFF',
    embalagem: 'Unidade de venda CX / Master 100 UN',
    ncm: '8536.69.10',
    cest: '21.050.00',
    price: 69.90,
    costPrice: 34.50,
    packagingType: 'Caixa',
    material: 'Termoplástico Antichama / Latão Niquelado',
    voltage: 'Bivolt (127V/220V)',
    wattage: '2032W(127V) / 3520W(220V)',
    amperage: '16A'
  }
];

async function runImport() {
  console.log(`Iniciando importação de ${items.length} produtos Foxlux Smart...`);

  // Carrega produtos existentes de data/products.ts
  let existingProducts = [];
  try {
    const rawTs = fs.readFileSync('./data/products.ts', 'utf8');
    const jsonMatch = rawTs.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
    if (jsonMatch) {
      existingProducts = JSON.parse(jsonMatch[1]);
    }
  } catch (err) {
    console.warn('Não foi possível ler produtos existentes de data/products.ts:', err.message);
  }

  const existingMap = new Map();
  existingProducts.forEach(p => existingMap.set(p.id, p));

  const importedFoxlux = [];

  for (const item of items) {
    const docId = `prod_foxlux_smart_${item.code.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    
    const payload = {
      id: docId,
      code: item.code,
      sku: `SKU-FOXLUX-${item.code}`,
      name: item.name,
      category: 'Smart',
      department: 'Materiais Elétricos Foxlux',
      productClass: 'Smart',
      description: `${item.name}. Especificações: ${item.tipo}. Embalagem: ${item.embalagem}. Codificação tributária legal: NCM ${item.ncm}, CEST ${item.cest}, CFOP 5102, CST 102, ICMS 18%, IPI 5%, PIS 0.65%, COFINS 3.00%.`,
      price: item.price,
      costPrice: item.costPrice,
      stock: 0, // CRÍTICO: Quantidade no estoque igual a zero conforme solicitado
      minStock: 5,
      packagingType: item.packagingType,
      material: item.material,
      voltage: item.voltage || 'Bivolt',
      wattage: item.wattage || '',
      imageUrl: '/ponto_chave_logo.jpg', // CRÍTICO: Imagem padrão Ponto Chave do Lar
      gallery: ['/ponto_chave_logo.jpg'],
      isActive: true,
      showInStore: false, // CRÍTICO: Não ativo para exibição na página principal
      isImported: true,
      importBatchId: 'batch_foxlux_smart_20260830',
      importBatchName: 'Importação PDF Foxlux Smart (30/08/2026)',
      importedAt: '2026-08-30T12:00:00.000Z',
      purchaseDate: '2026-08-30', // CRÍTICO: Data de cadastro de hoje
      invoiceNumber: 'PDF-FOXLUX-SMART-20260830',
      supplierName: 'Foxlux Materiais Elétricos & Smart',
      icmsPercent: 18,
      ipiPercent: 5,
      pisPercent: 0.65,
      cofinsPercent: 3.00,
      otherTaxesPercent: 0,
      profitMarginPercent: 45,
      technicalSpecs: `NCM: ${item.ncm} | CEST: ${item.cest} | CFOP: 5102 | CST: 102 | ICMS: 18% | IPI: 5% | PIS: 0.65% | COFINS: 3.00% | Embalagem: ${item.embalagem} | Linha: Foxlux Smart | Departamento: Materiais Elétricos Foxlux | Fornecedor: Foxlux Materiais Elétricos & Smart`
    };

    importedFoxlux.push(payload);
    existingMap.set(docId, payload);

    // Salva no Firestore
    await setDoc(doc(db, 'products', docId), payload);
    console.log(`Produto gravado no Firestore: [${item.code}] ${item.name}`);
  }

  console.log(`Firestore atualizado com sucesso com os ${importedFoxlux.length} produtos Foxlux Smart!`);

  // Salva no data/products.ts reunindo todos os produtos
  const allProducts = Array.from(existingMap.values());
  const tsContent = `import type { Product } from '../types';\n\nexport const products: Product[] = ${JSON.stringify(allProducts, null, 2)};\n`;
  fs.writeFileSync('./data/products.ts', tsContent, 'utf8');
  console.log(`Arquivo data/products.ts atualizado com ${allProducts.length} produtos no total!`);

  process.exit(0);
}

runImport().catch(err => {
  console.error('Erro na importação Foxlux Smart:', err);
  process.exit(1);
});
