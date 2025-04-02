'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getCollection } from '@/firebase/firebaseServices';

// Context oluşturma
const AppContext = createContext();

// Context hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext hook, AppProvider içinde kullanılmalıdır');
  }
  return context;
};

// Provider bileşeni
export const AppProvider = ({ children }) => {
  // Karanlık mod durumu
  const [darkMode, setDarkMode] = useState(false);
  // Site ayarları
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Adil Dursun Okulları',
    logo: `/images/logo/logo.jpeg?t=${new Date().getTime()}`,
    favicon: '',
    email: '',
    phone: '',
    address: '',
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    footerText: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    workingHours: JSON.stringify({
      weekdays: '08:00 - 17:00',
      saturday: '09:00 - 13:00',
      sunday: 'Kapalı'
    })
  });
  
  // Site ayarlarının yüklenip yüklenmediğini takip et
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Site ayarlarını getir
  const fetchSiteSettings = async (forceRefresh = false) => {
    try {
      console.log('AppContext - fetchSiteSettings çağrıldı, forceRefresh:', forceRefresh);
      
      // Önbellek sorununu önlemek için timestamp ekleyerek getir
      const timestamp = new Date().getTime();
      const settingsData = await getCollection('siteSettings');
      
      if (settingsData && settingsData.length > 0) {
        const settings = settingsData[0];
        console.log('AppContext - Firestore\'dan alınan ayarlar:', settings);
        
        // Logo URL'sine önbellek kırıcı parametre ekle
        if (settings.logo) {
          settings.logo = `${settings.logo}?t=${timestamp}`;
        }
        
        // Eğer workingHours yoksa, varsayılan değeri ekle
        if (!settings.workingHours) {
          settings.workingHours = JSON.stringify({
            weekdays: '08:00 - 17:00',
            saturday: '09:00 - 13:00',
            sunday: 'Kapalı'
          });
        }
        
        // Ayarları güncelle
        setSiteSettings(prevSettings => {
          const newSettings = {
            ...prevSettings,
            ...settings
          };
          console.log('AppContext - Güncellenmiş ayarlar:', newSettings);
          return newSettings;
        });
        
        setSettingsLoaded(true);
        console.log('AppContext - Site ayarları güncellendi');
        
        // Sayfayı yenile (sadece forceRefresh true ise)
        if (forceRefresh && typeof window !== 'undefined') {
          console.log('AppContext - Sayfa yenileniyor...');
          window.location.reload();
        }
        
        return true;
      } else {
        console.log('AppContext - Firestore\'da ayar bulunamadı');
        return false;
      }
    } catch (error) {
      console.error('Site ayarları yüklenirken hata oluştu:', error);
      return false;
    }
  };

  // Sayfa yüklendiğinde site ayarlarını getir
  useEffect(() => {
    // Sadece tarayıcı ortamında çalıştır
    if (typeof window !== 'undefined' && !settingsLoaded) {
      console.log('AppContext - İlk yükleme, site ayarları getiriliyor...');
      fetchSiteSettings();
    }
  }, [settingsLoaded]);

  // Sayfa yüklendiğinde localStorage'dan karanlık mod tercihini al
  useEffect(() => {
    // Sadece tarayıcı ortamında çalıştır
    if (typeof window === 'undefined') return;
    
    // Tarayıcı tercihini kontrol et
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // localStorage'dan kaydedilmiş tercihi al veya tarayıcı tercihini kullan
    const savedDarkMode = localStorage.getItem('darkMode');
    const initialDarkMode = savedDarkMode !== null ? JSON.parse(savedDarkMode) : prefersDarkMode;
    
    setDarkMode(initialDarkMode);
    
    // HTML elementine dark class'ını ekle veya kaldır
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Karanlık modu değiştir
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      
      // localStorage'a kaydet
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      
      // HTML elementine dark class'ını ekle veya kaldır
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return newMode;
    });
  };

  // Context değerleri
  const value = {
    darkMode,
    toggleDarkMode,
    siteSettings,
    refreshSiteSettings: () => fetchSiteSettings(true)
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}; 