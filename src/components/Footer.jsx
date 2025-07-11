'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCollection } from '@/firebase/firebaseServices';

const Footer = () => {
  const [logoSrc, setLogoSrc] = useState(`/images/logo/logo.jpeg?t=${new Date().getTime()}`);
  const [siteTitle, setSiteTitle] = useState('Adil Dursun Okulları');
  const [footerText, setFooterText] = useState('Adil Dursun Okulları, lise seviyesinde eğitim veren özel bir okuldur. Öğrencilere akademik başarı, kişisel gelişim ve sosyal sorumluluk alanlarında güçlü bir eğitim sunmayı hedefler. Misyonu ve vizyonu doğrultusunda öğrencilerini geleceğe hazırlayan ve öğrenme sürecini destekleyen bir eğitim anlayışı benimser.');
  const [contactInfo, setContactInfo] = useState({
    phone: '0546 946 5048',
    email: 'adildursunokullari@gmail.com',
    address: 'Adil Dursun Okulları, İstanbul'
  });
  const [socialMedia, setSocialMedia] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: ''
  });
  
  // Logo için timestamp
  const [logoTimestamp, setLogoTimestamp] = useState(new Date().getTime());
  
  const currentYear = new Date().getFullYear();

  // Doğrudan veritabanından site ayarlarını getir
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log('Footer - Veritabanından site ayarları getiriliyor...');
        const settingsCollection = await getCollection('siteSettings');
        
        if (settingsCollection && settingsCollection.length > 0) {
          const settings = settingsCollection[0];
          console.log('Footer - Veritabanından ayarlar alındı:', settings);
          
          // Logo güncelleme
          if (settings.logo && settings.logo.trim() !== '') {
            const newTimestamp = new Date().getTime();
            setLogoTimestamp(newTimestamp);
            
            // Logo URL'sine timestamp ekle (önbellek sorunlarını önlemek için)
            let newLogoSrc = settings.logo;
            if (newLogoSrc.includes('?')) {
              newLogoSrc = `${newLogoSrc}&t=${newTimestamp}`;
            } else {
              newLogoSrc = `${newLogoSrc}?t=${newTimestamp}`;
            }
            
            console.log('Footer - Logo güncellendi:', newLogoSrc);
            setLogoSrc(newLogoSrc);
          }
          
          // Site adı güncelleme
          if (settings.siteName) {
            console.log('Footer - Site adı güncellendi:', settings.siteName);
            setSiteTitle(settings.siteName);
          }
          
          // Footer metni güncelleme
          if (settings.footerText && settings.footerText.trim() !== '') {
            console.log('Footer - Footer metni güncellendi:', settings.footerText);
            setFooterText(settings.footerText);
          }

          // İletişim bilgilerini güncelle
          const updatedContactInfo = {
            phone: settings.phone && settings.phone.trim() !== '' ? settings.phone : '0546 946 5048',
            email: settings.email && settings.email.trim() !== '' ? settings.email : 'adildursunokullari@gmail.com',
            address: settings.address && settings.address.trim() !== '' ? settings.address : 'Adil Dursun Okulları, İstanbul'
          };
          console.log('Footer - İletişim bilgileri güncellendi:', updatedContactInfo);
          setContactInfo(updatedContactInfo);
          
          // Sosyal medya bilgilerini güncelle
          const updatedSocialMedia = {
            facebook: settings.facebook || '',
            twitter: settings.twitter || '',
            instagram: settings.instagram || '',
            youtube: settings.youtube || ''
          };
          console.log('Footer - Sosyal medya bilgileri güncellendi:', updatedSocialMedia);
          setSocialMedia(updatedSocialMedia);
        } else {
          console.log('Footer - Veritabanında ayar bulunamadı');
        }
      } catch (error) {
        console.error('Footer - Site ayarları yüklenirken hata oluştu:', error);
      }
    };

    fetchSettings();
    
    // Sayfayı her yenilediğimizde veritabanından güncel verileri çekmek için
    // bir interval oluşturalım (her 30 saniyede bir)
    const intervalId = setInterval(fetchSettings, 30000);
    
    // Component unmount olduğunda interval'i temizle
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo ve Açıklama */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex flex-col items-start">
              <div className="relative w-40 h-12 mb-4 bg-white rounded p-1">
                <Image 
                  src={logoSrc} 
                  alt={`${siteTitle} Logo`}
                  fill
                  className="object-contain"
                  key={`logo-${logoTimestamp}`}
                  unoptimized={true}
                />
              </div>
              <p className="text-gray-400 mt-2">
                {footerText}
              </p>
              
              {/* Sosyal Medya İkonları */}
              {(socialMedia.facebook || socialMedia.twitter || socialMedia.instagram || socialMedia.youtube) && (
                <div className="flex space-x-4 mt-4">
                  {socialMedia.facebook && (
                    <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                      </svg>
                    </a>
                  )}
                  {socialMedia.twitter && (
                    <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                  )}
                  {socialMedia.instagram && (
                    <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                      </svg>
                    </a>
                  )}
                  {socialMedia.youtube && (
                    <a href={socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition duration-300">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/hakkimizda" className="text-gray-400 hover:text-white transition duration-300">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/duyurular" className="text-gray-400 hover:text-white transition duration-300">
                  Duyurular
                </Link>
              </li>
              <li>
                <Link href="/etkinlikler" className="text-gray-400 hover:text-white transition duration-300">
                  Etkinlikler
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-gray-400 hover:text-white transition duration-300">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>
          
          {/* İletişim Bilgileri */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">İletişim</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-400">{contactInfo.address}</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-400">{contactInfo.phone}</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-400">{contactInfo.email}</span>
              </li>
            </ul>
          </div>
          
          {/* Logo Alanı (Çalışma Saatleri yerine) */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 bg-white rounded p-2">
              <Image 
                src={logoSrc} 
                alt={`${siteTitle} Logo`}
                fill
                className="object-contain"
                key={`footer-logo-${logoTimestamp}`}
                unoptimized={true}
              />
            </div>
          </div>
        </div>
        
        {/* Telif Hakkı ve Geliştirici */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400 mb-2">
            © 2025 ADİL DURSUN OKULLARI. Tüm hakları saklıdır.
          </p>
          <p className="text-gray-500 text-sm">
            <a href="https://mskcode.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors duration-300">
              mskcode.com
            </a>
            <span> tarafından yapılmıştır.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 