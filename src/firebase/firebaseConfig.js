// Firebase yapılandırması
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase yapılandırma bilgileri
// Doğrudan değerleri kullanıyoruz
const firebaseConfig = {
  apiKey: "AIzaSyAkn8AWEpGTpKBRdR0A641bq5wWXlTyYQY",
  authDomain: "adil-dursun-okullari.firebaseapp.com",
  projectId: "adil-dursun-okullari",
  storageBucket: "adil-dursun-okullari.appspot.com", 
  messagingSenderId: "191473532056",
  appId: "1:191473532056:web:a6d601ab74afd85a82e4ed",
  measurementId: "G-BLF1JCMLMX"
};

// Firebase uygulamasını başlat
let app;
let db;
let auth;
let analytics = null;

// Firebase'i sadece client tarafında başlat - SSR sorunlarını önler
if (typeof window !== 'undefined') {
  try {
    // Eğer app zaten tanımlanmışsa tekrar başlatma
    if (!app) {
      app = initializeApp(firebaseConfig);
    }
    
    // Firestore veritabanı referansı
    db = getFirestore(app);
    
    // Firebase Authentication referansı
    auth = getAuth(app);
    
    // Geliştirme ortamında hata ayıklama için konsol uyarıları ekle
    if (process.env.NODE_ENV === 'development') {
      console.log('Firebase initialized in development mode');
    }
    
    // Firebase Analytics referansı (tarayıcı ortamında çalışıyorsa)
    isSupported().then(supported => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    }).catch(error => {
      console.error('Analytics error:', error);
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export { app, db, auth, analytics }; 