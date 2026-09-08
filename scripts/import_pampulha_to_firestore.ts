import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { pampulhaCatalogFull } from '../data/pampulhaCatalogFull';

async function importCleanPampulha() {
  console.log('1. Verificando produtos existentes no Firestore...');
  const snap = await getDocs(collection(db, 'products'));
  const toDelete: string[] = [];

  snap.docs.forEach(d => {
    const data = d.data();
    const batch = String(data.importBatchName || data.importBatchId || '').toLowerCase();
    const dept = String(data.department || '').toLowerCase();
    const table = String(data.table || '').toLowerCase();
    const name = String(data.name || '');

    // Se pertencer à tabela Pampulha ou tiver caracteres binários
    if (
      batch.includes('pampulha') ||
      dept.includes('pampulha') ||
      table === 'pampulha' ||
      /[\x00-\x08\x0E-\x1F\x7F-\x9F\uFFFD]/.test(name)
    ) {
      toDelete.push(d.id);
    }
  });

  if (toDelete.length > 0) {
    console.log(`Excluindo ${toDelete.length} produtos antigos da Pampulha...`);
    const chunkSize = 400;
    for (let i = 0; i < toDelete.length; i += chunkSize) {
      const chunk = toDelete.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach(id => {
        batch.delete(doc(db, 'products', id));
      });
      await batch.commit();
      console.log(`Excluídos ${Math.min(i + chunkSize, toDelete.length)} de ${toDelete.length}...`);
    }
  } else {
    console.log('Nenhum produto antigo para excluir.');
  }

  console.log(`2. Importando ${pampulhaCatalogFull.length} produtos limpos e formatados da Pampulha...`);
  const chunkSize = 400;
  for (let i = 0; i < pampulhaCatalogFull.length; i += chunkSize) {
    const chunk = pampulhaCatalogFull.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach(product => {
      const ref = doc(collection(db, 'products'));
      const { id, ...payload } = product;
      batch.set(ref, {
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
    await batch.commit();
    console.log(`Gravados ${Math.min(i + chunkSize, pampulhaCatalogFull.length)} de ${pampulhaCatalogFull.length}...`);
  }

  console.log('Importação concluída com sucesso no Firestore!');
  process.exit(0);
}

importCleanPampulha().catch(err => {
  console.error('Erro na importação:', err);
  process.exit(1);
});
