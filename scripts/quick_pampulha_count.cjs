const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getCountFromServer } = require('firebase/firestore');
const config = require('../firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  const q = query(collection(db, 'products'), where('table', '==', 'PAMPULHA CONDUTORES'));
  const snapshot = await getCountFromServer(q);
  console.log('Total PAMPULHA CONDUTORES importados até agora:', snapshot.data().count);
}

check().catch(console.error);
