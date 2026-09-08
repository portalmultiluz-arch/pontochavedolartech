const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const config = require('../firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function checkCount() {
  const snapshot = await getDocs(collection(db, 'products'));
  let pampulhaCount = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (
      (data.supplierName && data.supplierName.toLowerCase().includes('pampulha')) ||
      (data.department && data.department.toLowerCase().includes('pampulha')) ||
      (data.importBatchName && data.importBatchName.toLowerCase().includes('pampulha')) ||
      (data.code && data.code.startsWith('PAMP-'))
    ) {
      pampulhaCount++;
    }
  });
  console.log(`Current total products in Firestore: ${snapshot.size}`);
  console.log(`Current Pampulha products in Firestore: ${pampulhaCount}`);
}

checkCount().catch(console.error);
