// Firebase'den veri çekmek için yardımcı fonksiyonlar
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Belirtilen koleksiyondan tüm belgeleri getirir
 * @param {string} collectionName - Koleksiyon adı
 * @returns {Promise<Array>} - Belgelerin dizisi
 */
export const getAllDocuments = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`${collectionName} verileri alınırken hata:`, error);
    throw new Error(`${collectionName} verileri alınamadı`);
  }
};

/**
 * Belirtilen koleksiyondan belirli bir belgeyi getirir
 * @param {string} collectionName - Koleksiyon adı
 * @param {string} documentId - Belge ID'si
 * @returns {Promise<Object>} - Belge verisi
 */
export const getDocumentById = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error(`${documentId} ID'li belge bulunamadı`);
    }
  } catch (error) {
    console.error(`Belge alınırken hata:`, error);
    throw error;
  }
};

/**
 * Belirtilen koleksiyona yeni bir belge ekler
 * @param {string} collectionName - Koleksiyon adı
 * @param {Object} data - Eklenecek veri
 * @returns {Promise<string>} - Eklenen belgenin ID'si
 */
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error(`Belge eklenirken hata:`, error);
    throw new Error('Belge eklenemedi');
  }
};

/**
 * Belirtilen belgeyi günceller
 * @param {string} collectionName - Koleksiyon adı
 * @param {string} documentId - Belge ID'si
 * @param {Object} data - Güncellenecek veri
 * @returns {Promise<void>}
 */
export const updateDocument = async (collectionName, documentId, data) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Belge güncellenirken hata:`, error);
    throw new Error('Belge güncellenemedi');
  }
};

/**
 * Belirtilen belgeyi siler
 * @param {string} collectionName - Koleksiyon adı
 * @param {string} documentId - Belge ID'si
 * @returns {Promise<void>}
 */
export const deleteDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Belge silinirken hata:`, error);
    throw new Error('Belge silinemedi');
  }
};

/**
 * Belirtilen koleksiyondan filtrelenmiş belgeleri getirir
 * @param {string} collectionName - Koleksiyon adı
 * @param {string} field - Filtrelenecek alan
 * @param {*} value - Filtreleme değeri
 * @param {string} orderByField - Sıralama alanı (isteğe bağlı)
 * @param {string} orderDirection - Sıralama yönü ('asc' veya 'desc', isteğe bağlı)
 * @param {number} limitCount - Maksimum belge sayısı (isteğe bağlı)
 * @returns {Promise<Array>} - Filtrelenmiş belgelerin dizisi
 */
export const getFilteredDocuments = async (
  collectionName, 
  field, 
  value, 
  orderByField = null, 
  orderDirection = 'desc', 
  limitCount = null
) => {
  try {
    let q = query(collection(db, collectionName), where(field, '==', value));
    
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Filtrelenmiş veriler alınırken hata:`, error);
    throw new Error('Filtrelenmiş veriler alınamadı');
  }
}; 