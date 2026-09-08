const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, limit, getDocs } = require('firebase/firestore');
const config = require('../firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function inspect() {
  const qNormal = query(collection(db, 'products'), where('table', '==', 'PAMPULHA CONDUTORES'), limit(2));
  const snapNormal = await getDocs(qNormal);
  console.log('--- AMOSTRA 1: PRODUTOS NORMAIS ---');
  snapNormal.forEach(d => console.log(JSON.stringify(d.data(), null, 2)));

  const qSpecial = query(collection(db, 'products'), where('table', '==', 'PAMPULHA CONDUTORES'), where('isSpecialDelivery', '==', true), limit(1));
  const snapSpecial = await getDocs(qSpecial);
  console.log('\n--- AMOSTRA 2: PRODUTO ESPECIAL (FORA DO PADRÃO CORREIOS / LOGÍSTICA POR CEP) ---');
  snapSpecial.forEach(d => console.log(JSON.stringify(d.data(), null, 2)));
}

inspect().catch(console.error);
