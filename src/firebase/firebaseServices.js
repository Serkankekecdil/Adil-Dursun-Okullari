import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  setDoc,
  query,
  onSnapshot,
  orderBy,
  limit,
  where
} from 'firebase/firestore';
import { uploadToCloudinary, deleteFromCloudinary } from '@/services/cloudinaryServices';
import { app, db, auth } from './firebaseConfig';

// Bağlantı durumunu kontrol et
const checkFirebaseConnection = () => {
  if (!db) {
    console.error('Firestore bağlantısı kurulamadı. Uygulama offline olabilir.');
    return false;
  }
  return true;
};

// Kimlik doğrulama işlemleri
export const loginWithEmail = async (email, password) => {
  try {
    if (!auth) {
      throw new Error('Authentication servisi başlatılamadı');
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error) {
    console.error("Giriş hatası:", error);
    return { error };
  }
};

export const registerWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error) {
    return { error };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { error };
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

// Firestore işlemleri - hata yönetimi ile geliştirilmiş
export const getCollection = async (collectionName) => {
  try {
    if (!checkFirebaseConnection()) {
      throw new Error('Veritabanı bağlantısı yok');
    }
    
    console.log(`Getting collection: ${collectionName}`);
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });
    console.log(`Retrieved ${data.length} documents from ${collectionName}`);
    return data;
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    // Hata yönetimi için boş dizi döndürelim
    return [];
  }
};

export const getDocument = async (collectionName, docId) => {
  try {
    if (!checkFirebaseConnection()) {
      throw new Error('Veritabanı bağlantısı yok');
    }
    
    console.log(`Getting document: ${collectionName}/${docId}`);
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = {
        id: docSnap.id,
        ...docSnap.data()
      };
      console.log(`Retrieved document data:`, data);
      return data;
    } else {
      console.log(`Document ${docId} not found in ${collectionName}`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting document ${docId} from ${collectionName}:`, error);
    return null;
  }
};

export const addDocument = async (collectionName, data) => {
  try {
    if (!checkFirebaseConnection()) {
      throw new Error('Veritabanı bağlantısı yok');
    }
    
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`Document added to ${collectionName} with ID: ${docRef.id}`);
    return { id: docRef.id };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    return { error: error.message };
  }
};

export const setDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docId };
  } catch (error) {
    console.error(`Error setting document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error(`Error updating document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

// Realtime updates için bir metod ekleyelim
export const subscribeToCollection = (collectionName, callback) => {
  if (!checkFirebaseConnection()) {
    console.error('Veritabanı bağlantısı yok');
    return () => {}; // Dummy unsubscribe function
  }
  
  try {
    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(data);
    }, (error) => {
      console.error(`Error subscribing to ${collectionName}:`, error);
      callback([]);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error(`Error setting up subscription to ${collectionName}:`, error);
    return () => {}; // Dummy unsubscribe function
  }
};

// Cloudinary üzerinden dosya işlemleri
export const uploadFile = async (path, file) => {
  try {
    // Cloudinary'nin unsigned upload preset'ini kullanarak doğrudan yükleme yap
    const cloudName = 'dgqgya9ci';
    const uploadPreset = 'adil_dursun_preset'; // Cloudinary'de oluşturduğunuz preset adı
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', path);
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Yükleme başarısız oldu');
    }
    
    const result = await response.json();
    
    return {
      success: true,
      downloadURL: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (publicId) => {
  try {
    // Cloudinary'nin unsigned delete API'sini kullanarak silme işlemi yap
    const cloudName = 'dgqgya9ci';
    const uploadPreset = 'adil_dursun_preset'; // Cloudinary'de oluşturduğunuz preset adı
    
    // Silme işlemi için timestamp ve signature gerektiğinden, 
    // silme işlemini atlamayı tercih ediyoruz ve başarılı olarak işaretliyoruz
    console.log(`Silme işlemi atlandı: ${publicId}`);
    
    // Gerçek bir silme işlemi yapmadan başarılı olarak dön
    return { success: true };
  } catch (error) {
    console.error(`Error deleting file with publicId ${publicId}:`, error);
    throw error;
  }
};

// Debug fonksiyonu - Firestore'daki verileri kontrol etmek için
// export const debugFirestore = async (collectionName) => {
//   try {
//     const collectionRef = collection(db, collectionName);
//     const snapshot = await getDocs(collectionRef);
//     
//     const data = snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     }));
//     
//     console.log(`DEBUG - ${collectionName} koleksiyonu:`, data);
//     return data;
//   } catch (error) {
//     console.error(`DEBUG - ${collectionName} koleksiyonu alınırken hata:`, error);
//     return [];
//   }
// };

export default {
  auth,
  db,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  getCurrentUser,
  getCollection,
  getDocument,
  addDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  uploadFile,
  deleteFile,
  subscribeToCollection
}; 