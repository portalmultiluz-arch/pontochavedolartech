import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function zeroStock() {
  console.log('Iniciando processo para zerar estoque de todos os produtos...');
  
  // 1. Atualizar arquivo data/products.ts
  try {
    const rawTs = fs.readFileSync('./data/products.ts', 'utf8');
    const jsonMatch = rawTs.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
    if (jsonMatch) {
      const localProducts = JSON.parse(jsonMatch[1]);
      let updatedLocalCount = 0;
      const updatedLocal = localProducts.map(p => {
        if (p.stock !== 0) {
          updatedLocalCount++;
          return { ...p, stock: 0 };
        }
        return p;
      });
      const newTs = `import type { Product } from '../types';\n\nexport const products: Product[] = ${JSON.stringify(updatedLocal, null, 2)};\n`;
      fs.writeFileSync('./data/products.ts', newTs, 'utf8');
      console.log(`data/products.ts atualizado: ${updatedLocalCount} produtos alterados para stock: 0 de um total de ${localProducts.length}.`);
    }
  } catch (err) {
    console.error('Erro ao atualizar data/products.ts:', err.message);
  }

  // 2. Atualizar no Firestore todos os produtos com stock > 0
  const snap = await getDocs(collection(db, 'products'));
  console.log(`Total de documentos em Firestore/products: ${snap.size}`);

  const docsToUpdate = [];
  snap.forEach(d => {
    const data = d.data();
    if (data.stock !== 0) {
      docsToUpdate.push({ id: d.id, previousStock: data.stock });
    }
  });

  console.log(`Documentos no Firestore que precisam ser zerados (stock !== 0): ${docsToUpdate.length}`);

  // Gravação em lotes (máximo 500 por lote do Firestore)
  const batchSize = 400;
  for (let i = 0; i < docsToUpdate.length; i += batchSize) {
    const chunk = docsToUpdate.slice(i, i + batchSize);
    const batch = writeBatch(db);
    for (const item of chunk) {
      const ref = doc(db, 'products', item.id);
      batch.update(ref, { stock: 0 });
    }
    await batch.commit();
    console.log(`Lote gravado: ${Math.min(i + batchSize, docsToUpdate.length)} / ${docsToUpdate.length}`);
  }

  console.log('Todos os produtos no Firestore e em data/products.ts tiveram seus quantitativos zerados com sucesso (stock: 0)!');
  process.exit(0);
}

zeroStock().catch(err => {
  console.error('Erro ao zerar estoque:', err);
  process.exit(1);
});
