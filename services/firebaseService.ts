import { 
  collection, 
  addDoc, 
  updateDoc, 
  setDoc,
  getDoc,
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { products as initialProducts } from '../data/products';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

export async function createDocument(collName: string, data: any) {
  try {
    // Sanitização de dados para evitar campos undefined
    const cleanData: Record<string, any> = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        cleanData[key] = data[key];
      }
    });

    const docRef = await addDoc(collection(db, collName), {
      ...cleanData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collName);
    throw error;
  }
}

export async function updateDocument(collName: string, docId: string, data: any) {
  try {
    const cleanData: Record<string, any> = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && key !== 'id') {
        cleanData[key] = data[key];
      }
    });

    const docRef = doc(db, collName, docId);
    await updateDoc(docRef, {
      ...cleanData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collName}/${docId}`);
    throw error;
  }
}

export async function deleteDocument(collName: string, docId: string) {
  try {
    const docRef = doc(db, collName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collName}/${docId}`);
    throw error;
  }
}

/**
 * Cria documentos em lote usando writeBatch do Firestore (Ultra-Rápido, 1 único roundtrip para até 400 itens)
 * Evita lentidão, timeouts e dezenas de re-renderizações desnecessárias.
 */
export async function createDocumentsBatch(
  collName: string, 
  items: Record<string, any>[],
  onProgress?: (current: number, total: number) => void
): Promise<number> {
  if (!items || items.length === 0) return 0;
  
  const CHUNK_SIZE = 400; // Margem segura abaixo do limite de 500 do Firestore
  let totalCommitted = 0;

  try {
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      const collRef = collection(db, collName);

      for (const item of chunk) {
        const cleanData: Record<string, any> = {};
        Object.keys(item).forEach(key => {
          if (item[key] !== undefined && key !== 'id') {
            cleanData[key] = item[key];
          }
        });
        cleanData.createdAt = serverTimestamp();
        cleanData.updatedAt = serverTimestamp();

        const newDocRef = doc(collRef);
        batch.set(newDocRef, cleanData);
      }

      await batch.commit();
      totalCommitted += chunk.length;
      if (onProgress) {
        onProgress(totalCommitted, items.length);
      }
    }
    return totalCommitted;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collName);
    throw error;
  }
}

/**
 * Remove documentos em lote usando writeBatch do Firestore (Alta Performance)
 */
export async function deleteDocumentsBatch(
  collName: string, 
  docIds: string[],
  onProgress?: (current: number, total: number) => void
): Promise<number> {
  if (!docIds || docIds.length === 0) return 0;
  
  const CHUNK_SIZE = 400;
  let totalDeleted = 0;

  try {
    for (let i = 0; i < docIds.length; i += CHUNK_SIZE) {
      const chunk = docIds.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);

      for (const id of chunk) {
        const docRef = doc(db, collName, id);
        batch.delete(docRef);
      }

      await batch.commit();
      totalDeleted += chunk.length;
      if (onProgress) {
        onProgress(totalDeleted, docIds.length);
      }
    }
    return totalDeleted;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, collName);
    throw error;
  }
}

export function subscribeToCollection(collName: string, callback: (data: any[]) => void, orderField: string = 'createdAt') {
  let unsubFallback: (() => void) | null = null;
  let unsubPrimary: (() => void) | null = null;

  try {
    const q = query(collection(db, collName), orderBy(orderField, 'desc'));
    unsubPrimary = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      callback(data);
    }, (error) => {
      console.warn(`Tentando ordenação sem '${orderField}' para coleção ${collName}:`, error.message);
      // Fallback sem ordenação caso o índice ainda não exista
      try {
        const fallbackQuery = collection(db, collName);
        unsubFallback = onSnapshot(fallbackQuery, (snapshot) => {
          const data = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }));
          callback(data);
        }, (err) => {
          console.warn(`Falha na leitura em tempo real da coleção ${collName}:`, err);
        });
      } catch (fallbackError) {
        console.warn(`Erro ao iniciar fallback para ${collName}:`, fallbackError);
      }
    });

    return () => {
      if (unsubPrimary) unsubPrimary();
      if (unsubFallback) unsubFallback();
    };
  } catch (error) {
    console.warn(`Erro ao inicializar escuta para ${collName}:`, error);
    return () => {};
  }
}

export async function getAllDocuments(collName: string) {
  try {
    const q = collection(db, collName);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collName);
    return [];
  }
}

export async function fetchProducts() {
  try {
    const docs = await getAllDocuments('products');
    if (docs && docs.length > 0) {
      return (docs as any[]);
    }
    return (initialProducts as any[]) || [];
  } catch {
    return (initialProducts as any[]) || [];
  }
}

export async function fetchDailyOffer() {
  try {
    const q = query(collection(db, 'dailyOffers'), where('isActive', '==', true));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
  } catch (e) {
    console.error("Erro ao buscar oferta diária:", e);
    return null;
  }
}

export async function fetchPromoContent() {
  return getAllDocuments('promos');
}

export function subscribeToDoc(collName: string, docId: string, callback: (data: any | null) => void) {
  try {
    const docRef = doc(db, collName, docId);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    }, (err) => {
      console.warn(`Erro ao escutar documento ${collName}/${docId}:`, err);
      callback(null);
    });
  } catch (error) {
    console.error(`Erro ao configurar listener para ${collName}/${docId}:`, error);
    return () => {};
  }
}

export async function fetchHeroCoverConfig() {
  try {
    const docRef = doc(db, 'siteSettings', 'heroCover');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as any;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar configuração de capa do Hero:", error);
    return null;
  }
}

export async function setDocument(collName: string, docId: string, data: any) {
  try {
    const cleanData: Record<string, any> = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && key !== 'id') {
        cleanData[key] = data[key];
      }
    });

    const docRef = doc(db, collName, docId);
    await setDoc(docRef, {
      ...cleanData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collName}/${docId}`);
    throw error;
  }
}

export async function saveHeroCoverConfig(data: any) {
  try {
    const cleanData: Record<string, any> = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && key !== 'id') {
        cleanData[key] = data[key];
      }
    });

    const docRef = doc(db, 'siteSettings', 'heroCover');
    await setDoc(docRef, {
      ...cleanData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'siteSettings/heroCover');
    throw error;
  }
}

