import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, getFirestore, Firestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';

// Typescript için doğru şekilde içe aktarıyoruz
import { db as firebaseDB } from '@/firebase/firebaseConfig';

// Firestore veritabanı referansı
const getDB = (): Firestore | null => {
  if (typeof window === 'undefined') {
    return null; // server tarafında null döndür
  }
  
  // Tipi kontrol edilebilen bir db referansı döndür
  return firebaseDB as Firestore || null;
};

export const getDocument = async (collectionName: string, documentId: string) => {
  try {
    console.log(`firebaseServices: ${collectionName}/${documentId} dokümanı çekiliyor...`);
    
    // Sadece client tarafında çalışacak şekilde Firestore'a erişiyoruz
    if (typeof window === 'undefined') {
      console.log('Server-side: Firebase operations not supported');
      return null;
    }
    
    const db = getDB();
    if (!db) {
      console.error('Firestore bağlantısı kurulamadı');
      return null;
    }
    
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = { ...docSnap.data(), id: docSnap.id };
      console.log(`firebaseServices: ${collectionName}/${documentId} dokümanı başarıyla çekildi:`, data);
      return data;
    } else {
      console.log(`firebaseServices: ${collectionName}/${documentId} dokümanı bulunamadı`);
      return null;
    }
  } catch (error) {
    console.error(`firebaseServices: ${collectionName}/${documentId} dokümanı çekilirken hata oluştu:`, error);
    return null;
  }
};

export const getCollection = async (collectionName: string, queryConstraints?: any[]) => {
  try {
    console.log(`firebaseServices: ${collectionName} koleksiyonu çekiliyor...`);
    
    // Sadece client tarafında çalışacak şekilde Firestore'a erişiyoruz
    if (typeof window === 'undefined') {
      console.log('Server-side: Firebase operations not supported');
      return [];
    }
    
    const db = getDB();
    if (!db) {
      console.error('Firestore bağlantısı kurulamadı');
      return [];
    }
    
    let queryRef;
    if (queryConstraints && queryConstraints.length > 0) {
      queryRef = query(collection(db, collectionName), ...queryConstraints);
    } else {
      queryRef = collection(db, collectionName);
    }
    
    const querySnapshot = await getDocs(queryRef);
    
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      console.log(`firebaseServices: ${collectionName} koleksiyonu başarıyla çekildi (${data.length} doküman)`);
      return data;
    } else {
      console.log(`firebaseServices: ${collectionName} koleksiyonunda doküman bulunamadı`);
      return [];
    }
  } catch (error) {
    console.error(`firebaseServices: ${collectionName} koleksiyonu çekilirken hata oluştu:`, error);
    return [];
  }
}; 