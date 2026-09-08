/**
 * Migration Script:
 * 1. Remove a palavra "Pampulha" / "PAMPULHA" de nomes, descrições, marcas, departamentos e códigos CEP
 *    para que nunca seja exibida ao cliente.
 * 2. Atualiza campos do BD:
 *    - Ativo (sim/não): `isActive: boolean`
 *    - FLAG: `pickupOrLocal15kmOnly: boolean`
 *      "Produto somente com retirada no nosso PONTO DE APOIO ou entrega num raio de até 15 km do nosso domicílio, com frete por conta do cliente"
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, writeBatch, doc } = require('firebase/firestore');
const config = require('../firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

function cleanText(text) {
  if (!text) return '';
  return String(text)
    .replace(/Materiais para Pintura PAMPULHA Tintas e Acessórios para Pintura\s*/gi, '')
    .replace(/PAMPULHA Cabos de Cobre e Alumínio\s*/gi, '')
    .replace(/Tabela Oficial Pampulha Condutores/gi, '')
    .replace(/Pampulha Condutores/gi, '')
    .replace(/PAMPULHA/g, '')
    .replace(/pampulha/gi, '')
    .replace(/-\s*Marca:\s*-\s*/gi, '')
    .replace(/-\s*Marca:\s*\(\s*/gi, '(')
    .replace(/\s+-\s*-\s+/g, ' - ')
    .replace(/\s+-\s*$/g, '')
    .replace(/^\s*-\s+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function run() {
  console.log('Iniciando sanitização e atualização dos campos do BD...');
  const colRef = collection(db, 'products');
  const snap = await getDocs(colRef);
  console.log(`Total de produtos encontrados no Firestore: ${snap.size}`);

  let updatedCount = 0;
  let batch = writeBatch(db);
  let batchOps = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    let changed = false;
    const updateData = {};

    // 1. Limpeza do Nome
    const oldName = data.name || '';
    const newName = cleanText(oldName);
    if (newName !== oldName) {
      updateData.name = newName;
      changed = true;
    }

    // 2. Limpeza da Descrição
    const oldDesc = data.description || '';
    const newDesc = cleanText(oldDesc);
    if (newDesc !== oldDesc) {
      updateData.description = newDesc;
      changed = true;
    }

    // 3. Marca
    const oldBrand = data.brand || '';
    if (oldBrand.toLowerCase().includes('pampulha')) {
      updateData.brand = 'Ponto Chave do Lar';
      changed = true;
    }

    // 4. Departamento
    const oldDept = data.department || '';
    if (oldDept.toLowerCase().includes('pampulha')) {
      updateData.department = 'Materiais Elétricos e Hidráulicos';
      changed = true;
    }

    // 5. Código de Entrega Especial por CEP
    const oldCepCode = data.specialDeliveryCepCode || '';
    if (oldCepCode.toLowerCase().includes('pampulha')) {
      updateData.specialDeliveryCepCode = 'CEP-ESPECIAL-FORA-PADRAO';
      changed = true;
    }

    // 6. Campo Ativo (sim/não)
    const currentIsActive = data.isActive !== undefined ? Boolean(data.isActive) : false;
    if (data.isActive === undefined) {
      updateData.isActive = currentIsActive;
      changed = true;
    }

    // 7. FLAG: Produto somente com retirada no nosso PONTO DE APOIO ou entrega num raio de até 15 km do nosso domicílio, com frete por conta do cliente
    const isSpecial = Boolean(data.isSpecialDelivery);
    const targetPickupFlag = isSpecial;
    if (data.pickupOrLocal15kmOnly !== targetPickupFlag) {
      updateData.pickupOrLocal15kmOnly = targetPickupFlag;
      changed = true;
    }

    if (changed) {
      batch.update(doc(db, 'products', docSnap.id), updateData);
      batchOps++;
      updatedCount++;

      if (batchOps >= 450) {
        await batch.commit();
        console.log(`Commit de lote efetuado (${updatedCount} produtos atualizados até agora)...`);
        batch = writeBatch(db);
        batchOps = 0;
      }
    }
  }

  if (batchOps > 0) {
    await batch.commit();
  }

  console.log(`\n Migração finalizada com sucesso!`);
  console.log(`Total de produtos sanitizados e com novos campos no BD: ${updatedCount}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Erro na migração:', err);
  process.exit(1);
});
