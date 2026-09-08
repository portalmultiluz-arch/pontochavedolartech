const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, writeBatch, serverTimestamp } = require('firebase/firestore');

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const file1 = JSON.parse(fs.readFileSync('./scripts/data_foxlux_iluminacao_1.json', 'utf8'));
const file2 = JSON.parse(fs.readFileSync('./scripts/data_foxlux_iluminacao_2.json', 'utf8'));
const file3 = JSON.parse(fs.readFileSync('./scripts/data_foxlux_iluminacao_3.json', 'utf8'));
const file4 = JSON.parse(fs.readFileSync('./scripts/data_foxlux_iluminacao_4.json', 'utf8'));

const allItems = [...file1, ...file2, ...file3, ...file4];
console.log('Total items collected from 13 pages:', allItems.length);

async function run() {
  const seenCodes = new Set();
  const uniqueItems = [];

  for (const item of allItems) {
    if (!seenCodes.has(item.code)) {
      seenCodes.add(item.code);
      uniqueItems.push(item);
    } else {
      console.warn('Duplicate code skipped:', item.code);
    }
  }

  console.log('Unique items to insert:', uniqueItems.length);

  const chunkSize = 100;
  for (let i = 0; i < uniqueItems.length; i += chunkSize) {
    const chunk = uniqueItems.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    for (const item of chunk) {
      const cleanCode = item.code.trim().toUpperCase();
      const sanitizedId = 'foxlux_ilum_' + cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const docRef = doc(db, 'products', sanitizedId);

      const unit = item.packaging && item.packaging.toLowerCase().includes('rolo') ? 'RL' : 'UN';

      const docData = {
        name: item.name.trim(),
        code: cleanCode,
        barcode: cleanCode,
        category: 'Iluminação',
        productClass: 'Iluminação',
        department: 'Materiais Elétricos Foxlux',
        supplier: 'Foxlux Materiais Elétricos',
        brand: 'Foxlux',
        unit: unit,
        packaging: item.packaging,
        costPrice: 0.00,
        price: 0.00,
        stock: 0,
        minStock: 5,
        location: 'Setor Iluminação Foxlux',
        showInStore: false,
        isActive: true,
        featured: false,
        rating: 5,
        reviewCount: 0,
        images: ['/ponto_chave_logo.jpg'],
        description: `${item.name}. ${item.type}. Embalagem: ${item.packaging}. Fabricado por Foxlux.`,
        ncm: item.ncm || '9405.40.90',
        cest: item.cest || '21.050.00',
        cfop: '5102',
        csosn: '102',
        icms: 18.0,
        ipi: 5.0,
        pis: 0.65,
        cofins: 3.0,
        notes: `Importado via catálogo PDF Foxlux Iluminação (Agosto/2026). Embalagem: ${item.packaging}`,
        batchId: 'batch_foxlux_iluminacao_20260830',
        invoiceRef: 'PDF-FOXLUX-ILUMINACAO-20260830',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      batch.set(docRef, docData);
    }

    await batch.commit();
    console.log(`Committed chunk ${i + 1} to ${Math.min(i + chunkSize, uniqueItems.length)}`);
  }

  console.log('Importação Foxlux Iluminação concluída com sucesso!');
  process.exit(0);
}

run().catch(err => {
  console.error('Erro na importação:', err);
  process.exit(1);
});
