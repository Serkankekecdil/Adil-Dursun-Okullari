'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

// Header bileşeni
const Header = () => {
  const { darkMode, toggleDarkMode, siteSettings } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const [logoSrc, setLogoSrc] = useState(`/images/logo/logo.jpeg?t=${new Date().getTime()}`);
  const [siteTitle, setSiteTitle] = useState('Adil Dursun Okulları');

  // Site ayarlarını izle
  useEffect(() => {
    if (siteSettings?.logo) {
      setLogoSrc(siteSettings.logo);
    }
    if (siteSettings?.siteName) {
      setSiteTitle(siteSettings.siteName);
    }
  }, [siteSettings]);

  // Menü öğeleri
  const menuItems = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Hakkımızda', path: '/hakkimizda' },
    { name: 'Öğretmenlerimiz', path: '/ogretmenlerimiz' },
    { name: 'Etkinlikler', path: '/etkinlikler' },
    { name: 'Yemek Listesi', path: '/yemek-listesi' },
    { name: 'Fiyat Bilgileri', path: '/fiyat-bilgileri' },
    { name: 'İletişim', path: '/iletisim' },
  ];

  // Sayfa kaydırıldığında header'ın arka planını değiştir
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Menüyü aç/kapat
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Menüyü kapat
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-white shadow-sm py-3'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-48 h-16">
              <Image 
                src={logoSrc} 
                alt={`${siteTitle} Logo`} 
                fill
                className="object-contain"
                priority
                key={logoSrc}
              />
            </div>
          </Link>
          
          {/* Masaüstü Navigasyon */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.path
                    ? 'bg-burgundy-700 text-white'
                    : 'text-gray-700 hover:text-burgundy-700 hover:bg-burgundy-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/admin/login"
              className="ml-2 bg-burgundy-700 hover:bg-burgundy-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Yönetim
            </Link>
          </nav>
          
          {/* Mobil Menü Butonu */}
          <button
            className="md:hidden text-gray-700 p-2 rounded-md focus:outline-none"
            onClick={toggleMenu}
            aria-label="Menüyü aç/kapat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobil Menü */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg overflow-hidden">
            <nav className="flex flex-col">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="px-4 py-3 text-gray-700 hover:bg-burgundy-50 hover:text-burgundy-700 font-medium border-b border-gray-100 last:border-b-0"
                  onClick={closeMenu}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/admin/login"
                className="px-4 py-3 bg-burgundy-700 text-white hover:bg-burgundy-800 font-medium"
                onClick={closeMenu}
              >
                Yönetim
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Navigasyon stilleri */}
      <style jsx>{`
        .nav-link {
          position: relative;
          color: ${isScrolled ? 'var(--text-light)' : 'var(--text-light)'};
          font-weight: 500;
          transition: color 0.3s;
          padding: 0.5rem 0;
        }
        
        .dark .nav-link {
          color: ${isScrolled ? 'var(--text-dark)' : 'var(--text-dark)'};
        }

        .nav-link:hover {
          color: var(--primary-color);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: var(--primary-color);
          transition: width 0.3s;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-link-mobile {
          color: var(--text-light);
          font-weight: 500;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          transition: color 0.3s;
        }
        
        .dark .nav-link-mobile {
          color: var(--text-dark);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-link-mobile:hover {
          color: var(--primary-color);
        }
      `}</style>
    </header>
  );
};

export default Header; 