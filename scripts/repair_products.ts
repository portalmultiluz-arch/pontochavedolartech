import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';

function parseCurrency(str: any): number {
  if (!str) return 0;
  const cleaned = String(str)
    .replace(/[R$\s]/g, '')
    .replace(/\.(?=\d{3})/g, '')
    .replace(',', '.');
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

export function cleanProductData(docData: any) {
  let code = String(docData.code || '').trim();
  let name = String(docData.name || '').trim();
  let department = String(docData.department || 'Materiais Elétricos PAMPULHA').trim();
  let category = String(docData.category || 'Materiais Elétricos e Ferramentas').trim();
  let supplierName = String(docData.supplierName || 'Pampulha').trim();
  let packagingDetail = String(docData.packagingDetail || '1 un.').trim();
  let costPrice = docData.costPrice || 0;
  let price = docData.price || 0;

  // Case C: name contains entire raw row separated by semicolons (e.g. ;Materiais Elétricos PAMPULHA Materiais Elétricos e Ferramentas;PRODUTO;MARCA;EMBALAGEM;PREÇO)
  if (name.includes(';') || code.includes(';')) {
    const raw = (code + ';' + name).replace(/^;+/, '');
    const tokens = raw.split(';').map(s => s.trim()).filter(Boolean);

    const codeMatch = tokens[0].match(/^(\d+(?:[/-]\d+)*|SC-\d+)/i);
    if (codeMatch) {
      code = codeMatch[1].trim();
    }

    department = 'Materiais Elétricos PAMPULHA';
    category = 'Materiais Elétricos e Ferramentas';

    // Find packaging token (e.g. 50 un., 1 un., 10 un.)
    const packIdx = tokens.findIndex((t, i) => i >= 2 && /\d+\s*(un|cx|pct|mt|m|kg)/i.test(t));
    const priceIdx = tokens.findIndex((t, i) => i >= 3 && /R?\$\s*\d+[,.]\d{2}|\b\d+,\d{2}\b/.test(t));

    if (packIdx >= 3) {
      packagingDetail = tokens[packIdx];
      supplierName = tokens[packIdx - 1]; // Brand
      name = tokens[packIdx - 2]; // Product Name
    } else if (tokens.length >= 6) {
      name = tokens[tokens.length - 4];
      supplierName = tokens[tokens.length - 3];
      packagingDetail = tokens[tokens.length - 2];
    }

    if (priceIdx > 0) {
      const cp = parseCurrency(tokens[priceIdx]);
      if (cp > 0) costPrice = cp;
    }
  }
  // Case A: code merged with Department & Classe (e.g. "5069/5157 Materiais Elétricos PAMPULHA Materiais Elétricos e Ferramentas")
  else if (code.includes('Materiais') || code.includes('PAMPULHA')) {
    const match = code.match(/^(\d+(?:[/-]\d+)*|SC-\d+)/i);
    if (match) {
      code = match[1].trim();
    }
    department = 'Materiais Elétricos PAMPULHA';
    // in this case, category had the brand (e.g. "PIAL")
    if (category && category !== 'Materiais Elétricos e Ferramentas' && !category.toLowerCase().includes('materiais')) {
      supplierName = category;
    }
    category = 'Materiais Elétricos e Ferramentas';
  }
  // Case B: department has Department and Classe merged ("Materiais Elétricos PAMPULHA Materiais Elétricos e Ferramentas")
  // and columns are shifted by 1: category = product name, name = brand, supplierName = packaging, packagingDetail = price
  else if (department.includes('Materiais Elétricos e Ferramentas') || department.includes('PAMPULHA Materiais')) {
    department = 'Materiais Elétricos PAMPULHA';
    const realProductName = category;
    const realBrand = name;
    const realPack = supplierName;
    const realPriceStr = packagingDetail;

    category = 'Materiais Elétricos e Ferramentas';
    name = realProductName;
    supplierName = realBrand && realBrand !== 'Pampulha / Diversos' ? realBrand : 'Pampulha';
    packagingDetail = (realPack && /\d+\s*(un|cx|pct|mt|m|kg)/i.test(realPack)) ? realPack : '1 un.';
    
    const cp = parseCurrency(realPriceStr);
    if (cp > 0) costPrice = cp;
  }

  // General normalizations
  department = 'Materiais Elétricos PAMPULHA';
  if (!category || category === 'PIAL' || category === 'PERLEX' || category === '3M' || category === 'DIVERSOS' || category.length > 50) {
    category = 'Materiais Elétricos e Ferramentas';
  }
  if (category === 'Segurança - EPI') {
    // If it was wrongfully defaulted to Segurança - EPI, restore to electrical class
    category = 'Materiais Elétricos e Ferramentas';
  }

  // Clean code of any lingering artifacts
  code = code.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
  const cleanCodeMatch = code.match(/^(\d+(?:[/-]\d+)*|SC-\d+)/i);
  if (cleanCodeMatch) {
    code = cleanCodeMatch[1].trim();
  }

  const sku = `SKU-${code}`;

  // Fix price calculation
  if (costPrice > 0 && (price <= 0 || price < costPrice)) {
    price = Math.round(costPrice * 1.45 * 100) / 100;
  } else if (costPrice <= 0 && price > 0) {
    costPrice = Math.round(price * 0.65 * 100) / 100;
  }

  const description = `${name}. Fabricante: ${supplierName}. Embalagem de fábrica: ${packagingDetail}. Fornecido via Catálogo Oficial Pampulha.`;

  return {
    code,
    sku,
    name,
    category,
    department,
    supplierName,
    packagingDetail,
    costPrice,
    price,
    description
  };
}

async function runRepair() {
  console.log('Iniciando reparo de produtos no Firestore...');
  const snap = await getDocs(collection(db, 'products'));
  console.log(`Total de documentos recuperados: ${snap.size}`);

  let updatedCount = 0;
  let batch = writeBatch(db);
  let batchSize = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const cleaned = cleanProductData(data);

    const docRef = doc(db, 'products', docSnap.id);
    batch.update(docRef, {
      code: cleaned.code,
      sku: cleaned.sku,
      name: cleaned.name,
      category: cleaned.category,
      department: cleaned.department,
      supplierName: cleaned.supplierName,
      packagingDetail: cleaned.packagingDetail,
      costPrice: cleaned.costPrice,
      price: cleaned.price,
      description: cleaned.description,
      table: 'Pampulha'
    });

    batchSize++;
    updatedCount++;

    if (batchSize >= 400) {
      console.log(`Gravando lote com ${batchSize} atualizações...`);
      await batch.commit();
      batch = writeBatch(db);
      batchSize = 0;
    }
  }

  if (batchSize > 0) {
    console.log(`Gravando lote final com ${batchSize} atualizações...`);
    await batch.commit();
  }

  console.log(`Reparo concluído com sucesso! ${updatedCount} produtos foram higienizados.`);
}

runRepair()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Erro no reparo:', err);
    process.exit(1);
  });
