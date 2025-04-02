'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCollection, subscribeToCollection } from '@/firebase/firebaseServices';

// Fiyat bilgisi tipi
interface PriceInfo {
  id: string;
  category: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  discounts?: string[];
  order: number;
}

interface PaymentOption {
  title: string;
  description: string;
  icon: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

// Sayfa içeriği tipi
interface PageContent {
  id?: string;
  pageId?: string;
  sections?: {
    hero?: {
      title?: string;
      description?: string;
      image?: string;
      content?: string;
    },
    payment?: {
      content?: string;
    },
    faq?: {
      content?: string;
    }
  };
}

// Koleksiyon öğesi için genel tip
interface CollectionItem {
  id: string;
  [key: string]: any;
}

export default function PricingPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [priceInfo, setPriceInfo] = useState<PriceInfo[]>([]);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Firebase veri aboneliklerini yönet
  useEffect(() => {
    console.log("Firebase abonelikleri başlatılıyor...");
    
    // Sayfa içeriğine abone ol
    const pageContentUnsubscribe = subscribeToCollection('pageContents', (data: CollectionItem[]) => {
      try {
        const pricingPageContent = data.find(
          (content: CollectionItem) => content.pageId === 'pricing'
        );
        
        if (pricingPageContent) {
          console.log('Sayfa içeriği gerçek zamanlı olarak güncellendi:', pricingPageContent);
          setPageContent(pricingPageContent as unknown as PageContent);
        } else {
          console.log('Sayfa içeriği bulunamadı');
        }
      } catch (error) {
        console.error('Sayfa içeriği işlenirken hata oluştu:', error);
      }
    });

    // Fiyat bilgilerine abone ol
    const pricingUnsubscribe = subscribeToCollection('pricing', (data: CollectionItem[]) => {
      try {
        // Tür dönüşümü yap
        const typedData = data.map(item => item as unknown as PriceInfo);
        
        // Sıralama yapalım
        const sortedData = [...typedData].sort((a, b) => a.order - b.order);
        
        console.log('Fiyat bilgileri gerçek zamanlı olarak güncellendi:', sortedData);
        setPriceInfo(sortedData);
        setLoading(false);
      } catch (error) {
        console.error('Fiyat bilgileri işlenirken hata oluştu:', error);
        setLoading(false);
      }
    });

    // Temizleme fonksiyonu
    return () => {
      console.log("Firebase abonelikleri temizleniyor...");
      pageContentUnsubscribe();
      pricingUnsubscribe();
    };
  }, []);

  // Kategoriye göre filtreleme
  const filteredPriceInfo = activeCategory === 'all' 
    ? priceInfo 
    : priceInfo.filter(item => item.category === activeCategory);

  // Kategorileri al
  const categories = [
    { id: 'all', name: 'Tümü' },
    { id: 'anaokulu', name: 'Anaokulu' },
    { id: 'ilkokul', name: 'İlkokul' },
    { id: 'ortaokul', name: 'Ortaokul' },
    { id: 'lise', name: 'Lise' },
    { id: 'servis', name: 'Servis' },
    { id: 'yemek', name: 'Yemek' }
  ];

  // Ödeme seçeneklerini parse et
  const parsePaymentOptions = (content: string): PaymentOption[] => {
    try {
      if (!content) return [];
      return JSON.parse(content) as PaymentOption[];
    } catch (error) {
      console.error('Ödeme seçenekleri parse edilirken hata oluştu:', error);
      return [];
    }
  };

  // SSS öğelerini parse et
  const parseFaqItems = (content: string): FaqItem[] => {
    try {
      if (!content) return [];
      return JSON.parse(content) as FaqItem[];
    } catch (error) {
      console.error('SSS öğeleri parse edilirken hata oluştu:', error);
      return [];
    }
  };

  // Ödeme seçenekleri ve SSS öğelerini al
  const paymentOptions = parsePaymentOptions(pageContent?.sections?.payment?.content || '');
  const faqItems = parseFaqItems(pageContent?.sections?.faq?.content || '');

  return (
    <div className="min-h-screen">
      <main>
        {/* Hero Section */}
        <div 
          className="bg-burgundy-800 text-white py-20 relative"
          style={{
            backgroundImage: pageContent?.sections?.hero?.image ? `url(${pageContent.sections.hero.image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay for better text readability if there's a background image */}
          {pageContent?.sections?.hero?.image && (
            <div className="absolute inset-0 bg-black bg-opacity-50" />
          )}
          
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-5xl font-bold mb-6 text-center">
              {"Fiyat Bilgileri"}
            </h1>
            <p className="text-xl text-center max-w-3xl mx-auto">
              {pageContent?.sections?.hero?.content || ""}
            </p>
          </div>
        </div>

        {/* Kategori Filtreleme */}
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 ${
                  activeCategory === category.id
                    ? 'bg-burgundy-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Fiyat Bilgileri */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-burgundy-700"></div>
            </div>
          ) : filteredPriceInfo.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl text-gray-600">Bu kategoride henüz fiyat bilgisi bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPriceInfo.map(item => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
                >
                  <div className="bg-burgundy-700 text-white p-8">
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                    <p className="text-4xl font-bold mt-3">{item.price}</p>
                    <p className="text-sm mt-2 opacity-90">{item.description}</p>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3">
                      {item.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-gray-800">
                          <svg className="h-5 w-5 text-burgundy-600 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {item.discounts && item.discounts.length > 0 && (
                      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-burgundy-800 mb-3">İndirimler:</h4>
                        <ul className="space-y-2">
                          {item.discounts.map((discount, index) => (
                            <li key={index} className="flex items-start text-sm text-gray-800">
                              <svg className="h-4 w-4 text-burgundy-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                              </svg>
                              <span>{discount}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="px-6 pb-6">
                    <Link href="/iletisim" className="block w-full bg-burgundy-700 hover:bg-burgundy-800 text-white text-center py-3 px-4 rounded-lg transition-colors duration-300 font-medium">
                      Detaylı Bilgi İçin İletişime Geçin
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ödeme Seçenekleri */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-burgundy-800">Ödeme Seçenekleri</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {paymentOptions.length > 0 ? (
                paymentOptions.map((option, index) => (
                  <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="text-burgundy-600 mb-6">
                      {option.icon === 'cash' && (
                        <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                      )}
                      {option.icon === 'card' && (
                        <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                        </svg>
                      )}
                      {option.icon === 'scholarship' && (
                        <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-3 text-burgundy-800">{option.title}</h3>
                    <p className="text-gray-700 text-center">{option.description}</p>
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="text-burgundy-600 mb-6">
                      <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-3 text-burgundy-800">Peşin Ödeme</h3>
                    <p className="text-gray-700 text-center">Peşin ödemelerde %10 indirim uygulanmaktadır.</p>
                  </div>
                  
                  <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="text-burgundy-600 mb-6">
                      <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-3 text-burgundy-800">Taksitli Ödeme</h3>
                    <p className="text-gray-700 text-center">9 aya kadar taksit imkanı sunulmaktadır.</p>
                  </div>
                  
                  <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="text-burgundy-600 mb-6">
                      <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-3 text-burgundy-800">Burs İmkanları</h3>
                    <p className="text-gray-700 text-center">Başarı durumuna göre burs imkanları sunulmaktadır.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SSS Bölümü */}
        <div className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-burgundy-800">Sık Sorulan Sorular</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqItems.length > 0 ? (
              faqItems.map((item, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <button className="w-full px-8 py-5 text-left font-semibold flex justify-between items-center text-burgundy-800">
                    <span>{item.question}</span>
                    <svg className="h-5 w-5 text-burgundy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  <div className="px-8 pb-5">
                    <p className="text-gray-700">{item.answer}</p>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <button className="w-full px-8 py-5 text-left font-semibold flex justify-between items-center text-burgundy-800">
                    <span>Ücretlere neler dahildir?</span>
                    <svg className="h-5 w-5 text-burgundy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  <div className="px-8 pb-5">
                    <p className="text-gray-700">
                      Eğitim ücretlerimize öğle yemeği, eğitim materyalleri, etkinlikler ve geziler dahildir. 
                      Servis ücretleri ayrıca belirtilmiştir ve mesafeye göre değişiklik göstermektedir.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <button className="w-full px-8 py-5 text-left font-semibold flex justify-between items-center text-burgundy-800">
                    <span>Ödeme planı nasıl oluşturulur?</span>
                    <svg className="h-5 w-5 text-burgundy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  <div className="px-8 pb-5">
                    <p className="text-gray-700">
                      Ödeme planı, veli tercihine göre peşin veya taksitli olarak düzenlenebilir. 
                      Taksitli ödemelerde 9 aya kadar vade imkanı sunulmaktadır. 
                      Detaylı bilgi için kayıt ofisimizle iletişime geçebilirsiniz.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <button className="w-full px-8 py-5 text-left font-semibold flex justify-between items-center text-burgundy-800">
                    <span>İndirim koşulları nelerdir?</span>
                    <svg className="h-5 w-5 text-burgundy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  <div className="px-8 pb-5">
                    <p className="text-gray-700">
                      Okulumuzda peşin ödemelerde %10, kardeş kayıtlarında %15 ve erken kayıt döneminde %5 indirim uygulanmaktadır. 
                      Ayrıca başarı durumuna göre burs imkanları da sunulmaktadır. 
                      İndirimler birleştirilemez, en yüksek indirim oranı uygulanır.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <button className="w-full px-8 py-5 text-left font-semibold flex justify-between items-center text-burgundy-800">
                    <span>Kayıt için hangi belgeler gereklidir?</span>
                    <svg className="h-5 w-5 text-burgundy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  <div className="px-8 pb-5">
                    <p className="text-gray-700">
                      Kayıt için öğrenci kimlik fotokopisi, veli kimlik fotokopisi, 4 adet fotoğraf, 
                      önceki okul karnesi (nakil durumunda) ve sağlık raporu gerekmektedir. 
                      Detaylı bilgi için kayıt ofisimizle iletişime geçebilirsiniz.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* İletişim CTA */}
        <div className="bg-burgundy-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Daha Fazla Bilgi İçin</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto">
              Detaylı fiyat bilgisi ve kayıt koşulları için lütfen bizimle iletişime geçin.
              Sizleri okulumuza bekliyor, sorularınızı yanıtlamaktan memnuniyet duyacağız.
            </p>
            <Link href="/iletisim" className="inline-block bg-white text-burgundy-700 font-bold py-4 px-10 rounded-full hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              İletişime Geçin
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 