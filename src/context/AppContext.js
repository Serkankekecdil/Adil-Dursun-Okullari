'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

// Context oluştur
const AppContext = createContext();

// Context Provider bileşeni
export function AppProvider({ children }) {
  // Kullanıcı durumu
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Tema durumu (açık/koyu)
  const [darkMode, setDarkMode] = useState(false);
  
  // Kullanıcı oturumunu izle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    // Temayı localStorage'dan al
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setDarkMode(JSON.parse(savedTheme));
    } else {
      // Sistem temasını kontrol et
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
    }
    
    // Cleanup
    return () => unsubscribe();
  }, []);
  
  // Tema değiştirme fonksiyonu
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    
    // HTML elementine dark class ekle/çıkar
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Tema değişikliğini uygula
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Context değerleri
  const value = {
    user,
    loading,
    darkMode,
    toggleDarkMode
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Context hook'u
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export default AppContext; 