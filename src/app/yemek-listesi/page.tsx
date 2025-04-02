'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCollection } from '@/firebase/firebaseServices';

// Sayfa içeriği tipi tanımı
interface PageContent {
  id: string;
  pageId: string;
  sections: {
    [key: string]: {
      title: string;
      content: string;
      image?: string;
      buttonText?: string;
      buttonUrl?: string;
    }
  };
}

// Menü öğesi için tip tanımlaması
interface MenuItem {
  id: number;
  title: string;
  date: string;
  image: string;
  pdf: string;
  fallbackColor: string;
}

export default function YemekListesiPage() {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Sayfa içeriğini çek
        const pageContentsRef = await getCollection('pageContents');
        const menuPageContent = pageContentsRef.find(
          (content: any) => content.pageId === 'menu'
        );
        
        if (menuPageContent) {
          setPageContent(menuPageContent as PageContent);
        }

        // Yemek listelerini çek
        const menusCollection = await getCollection('menus');
        if (menusCollection && menusCollection.length > 0) {
          // Firebase'den gelen verileri MenuItem formatına dönüştür
          const formattedMenus = menusCollection.map((menu: any) => ({
            id: menu.id,
            title: menu.title,
            date: menu.date,
            image: menu.image || '/images/menu/menu-default.jpg',
            pdf: menu.pdf || '',
            fallbackColor: menu.fallbackColor || 'bg-burgundy-50',
          }));
          
          // Tarihe göre sırala (en yeni en üstte)
          formattedMenus.sort((a: any, b: any) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          
          setMenuItems(formattedMenus);
        } else {
          // Eğer Firebase'de yemek listesi yoksa varsayılan örnekleri kullan
          setMenuItems([
            {
              id: 1,
              title: 'Mart 2024 - 1. Hafta Yemek Listesi',
              date: '4-8 Mart 2024',
              image: '/images/menu/menu-mart-1.jpg',
              pdf: '/pdfs/menu/menu-mart-1.pdf',
              fallbackColor: 'bg-burgundy-50',
            },
            {
              id: 2,
              title: 'Mart 2024 - 2. Hafta Yemek Listesi',
              date: '11-15 Mart 2024',
              image: '/images/menu/menu-mart-2.jpg',
              pdf: '/pdfs/menu/menu-mart-2.pdf',
              fallbackColor: 'bg-burgundy-100',
            },
            {
              id: 3,
              title: 'Mart 2024 - 3. Hafta Yemek Listesi',
              date: '18-22 Mart 2024',
              image: '/images/menu/menu-mart-3.jpg',
              pdf: '/pdfs/menu/menu-mart-3.pdf',
              fallbackColor: 'bg-burgundy-50',
            },
            {
              id: 4,
              title: 'Mart 2024 - 4. Hafta Yemek Listesi',
              date: '25-29 Mart 2024',
              image: '/images/menu/menu-mart-4.jpg',
              pdf: '/pdfs/menu/menu-mart-4.pdf',
              fallbackColor: 'bg-burgundy-100',
            }
          ]);
        }
      } catch (error) {
        console.error('Veri getirilirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sayfa içeriği için değişkenler
  const heroTitle = 'Yemek Listesi';
  const heroContent = pageContent?.sections?.hero?.content || 'Öğrencilerimiz için özenle hazırlanan besleyici ve lezzetli menülerimiz';
  const heroImage = pageContent?.sections?.hero?.image || '/images/menu/menu-hero.jpg';
  
  // Giriş metni için içerik
  const introContent = pageContent?.sections?.intro?.content || '';
  
  // Sağlıklı beslenme önerileri için içerik
  const nutritionContent = pageContent?.sections?.nutrition?.content || '';

  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);

  return (
    <div className="min-h-screen">
      <main>
        {/* Hero Bölümü */}
        <div className="relative h-[350px] md:h-[450px] mb-16">
          <div className="absolute inset-0 bg-burgundy-800 flex items-center justify-center">
            <span className="text-white text-3xl font-bold opacity-30">Adil Dursun Okulları</span>
          </div>
          {heroImage ? (
            <Image
              src={heroImage}
              alt="Adil Dursun Okulları Yemek Listesi"
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-burgundy-700"></div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">{heroTitle}</h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto px-4">
                {heroContent}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          {/* Bilgilendirme Bölümü */}
          {introContent && (
            <div className="mb-16 bg-burgundy-50 p-8 md:p-12 rounded-2xl shadow-lg">
              <h2 className="text-3xl md:text-4xl font-bold text-burgundy-800 mb-10 text-center">
                Beslenme Politikamız
              </h2>
              <div className="prose prose-burgundy max-w-none" dangerouslySetInnerHTML={{ __html: introContent }} />
            </div>
          )}

          {/* Yemek Listeleri Bölümü */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-burgundy-800 mb-10 text-center">
              Haftalık Yemek Listeleri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {menuItems.map((menu) => (
                <div 
                  key={menu.id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
                  onClick={() => setSelectedMenu(menu)}
                >
                  <div className={`relative h-64 ${menu.fallbackColor}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-burgundy-800 text-2xl font-bold opacity-50">{menu.title}</span>
                    </div>
                    <Image
                      src={menu.image}
                      alt={menu.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-burgundy-800 mb-2">{menu.title}</h3>
                    <p className="text-burgundy-600 font-medium mb-5">{menu.date}</p>
                    
                    <div className="flex space-x-3">
                      <button 
                        className="flex-1 bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(menu.image, '_blank');
                        }}
                      >
                        Görüntüle
                      </button>
                      <button 
                        className="flex-1 bg-gray-700 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(menu.pdf, '_blank');
                        }}
                      >
                        PDF İndir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal */}
          {selectedMenu && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMenu(null)}>
              <div className="bg-white rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 bg-burgundy-700 text-white flex justify-between items-center">
                  <h3 className="text-xl font-bold">{selectedMenu.title}</h3>
                  <button 
                    className="text-white hover:text-gray-200 transition-colors"
                    onClick={() => setSelectedMenu(null)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="overflow-auto flex-1 p-1">
                  <div className="relative h-[70vh] w-full">
                    <Image
                      src={selectedMenu.image}
                      alt={selectedMenu.title}
                      fill
                      className="object-contain"
                      sizes="100vw"
                    />
                  </div>
                </div>
                <div className="p-4 bg-gray-100 flex justify-end space-x-3">
                  <button 
                    className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-md"
                    onClick={() => window.open(selectedMenu.image, '_blank')}
                  >
                    Yeni Sekmede Aç
                  </button>
                  <button 
                    className="bg-gray-700 hover:bg-gray-800 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-md"
                    onClick={() => window.open(selectedMenu.pdf, '_blank')}
                  >
                    PDF İndir
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Beslenme Önerileri */}
          {nutritionContent && (
            <div className="mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-burgundy-800 mb-10 text-center">
                Sağlıklı Beslenme Önerileri
              </h2>
              <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg">
                <ul className="list-disc pl-6 space-y-4 text-lg text-gray-800">
                  {nutritionContent.split('|').map((item, index) => (
                    <li key={index} className="font-medium">{item.trim()}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 