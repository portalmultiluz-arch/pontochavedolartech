import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

async function deleteCorruptedPampulha() {
  console.log('Buscando produtos corrompidos da Pampulha...');
  const snap = await getDocs(collection(db, 'products'));
  const toDelete: string[] = [];

  snap.docs.forEach(d => {
    const data = d.data();
    const batch = String(data.importBatchName || data.importBatchId || '');
    const name = String(data.name || '');
    
    // Corrompidos do lote MATERIAL ELÉTRICO PAMPULHA.pdf ou com caracteres ilegíveis
    if (
      batch.includes('MATERIAL ELÉTRICO PAMPULHA.pdf') ||
      batch.includes('pampulha') ||
      /[\x00-\x08\x0E-\x1F\x7F-\x9F\uFFFD]/.test(name) ||
      name.includes('') ||
      name.includes('Google Sheets')
    ) {
      toDelete.push(d.id);
    }
  });

  console.log(`Encontrados ${toDelete.length} produtos para exclusão.`);

  // Deleta em lotes de 400 (limite do Firestore é 500)
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

  console.log('Limpeza concluída com sucesso!');
  process.exit(0);
}

deleteCorruptedPampulha().catch(err => {
  console.error('Erro na exclusão:', err);
  process.exit(1);
});
