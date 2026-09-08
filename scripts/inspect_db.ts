import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

async function check() {
  const snap = await getDocs(collection(db, 'products'));
  console.log('Total products in firestore:', snap.size);
  
  const batches = new Map<string, number>();
  let corruptedCount = 0;
  let pampulhaCount = 0;
  const samplesCorrupted: any[] = [];
  const pampulhaIds: string[] = [];

  snap.docs.forEach(d => {
    const data = d.data();
    const name = String(data.name || '');
    const batch = String(data.importBatchName || data.importBatchId || 'sem_lote');
    batches.set(batch, (batches.get(batch) || 0) + 1);

    const isCorrupted = /[\x00-\x08\x0E-\x1F\x7F-\x9F\uFFFD]/.test(name) || name.includes('') || name.includes('Google Sheets') || name.startsWith('1351.') || /^[^\w\sÀ-ÿ]{3,}/.test(name.trim());
    if (isCorrupted) {
      corruptedCount++;
      if (samplesCorrupted.length < 5) {
        samplesCorrupted.push({ id: d.id, code: data.code, name: data.name, batch });
      }
    }

    const brand = String(data.brand || '').toLowerCase();
    const supplier = String(data.supplierName || '').toLowerCase();
    const dept = String(data.department || '').toLowerCase();
    const code = String(data.code || '').toLowerCase();
    const tableField = String((data as any).table || '').toLowerCase();
    const batchStr = (String(data.importBatchId || '') + ' ' + String(data.importBatchName || '')).toLowerCase();

    if (
      tableField.includes('pampulha') ||
      brand.includes('pampulha') ||
      supplier.includes('pampulha') ||
      dept.includes('pampulha') ||
      batchStr.includes('pampulha') ||
      code.startsWith('pamp-') ||
      code.startsWith('sc-')
    ) {
      pampulhaCount++;
      pampulhaIds.push(d.id);
    }
  });

  console.log('Corrupted count:', corruptedCount);
  console.log('Samples corrupted:', samplesCorrupted);
  console.log('Pampulha total items:', pampulhaCount);
  console.log('Batches summary:');
  for (const [b, count] of batches.entries()) {
    console.log(` - ${b}: ${count}`);
  }

  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
