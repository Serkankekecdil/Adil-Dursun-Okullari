'use client';

import { useEffect, useState } from 'react';
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

// Etkinlik tipi tanımı
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  imagePublicId?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  imageUrl?: string;
}

export default function EventsPage() {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Sayfa içeriğini çek
        const pageContentsRef = await getCollection('pageContents');
        const eventsPageContent = pageContentsRef.find(
          (content: any) => content.pageId === 'events'
        );
        
        if (eventsPageContent) {
          setPageContent(eventsPageContent as PageContent);
        }

        // Etkinlikleri çek
        const eventsData = await getCollection('events');
        setEvents(eventsData as Event[]);
      } catch (error) {
        console.error('Veri getirilirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sayfa içeriği için değişkenler
  const heroContent = pageContent?.sections?.hero?.content || 'Okulumuzda düzenlenen etkinlikler ve duyurular';
  const heroImage = pageContent?.sections?.hero?.image || '/images/events/events-hero.jpg';
  
  // Giriş metni için içerik
  const introContent = pageContent?.sections?.intro?.content || '';

  // CTA bölümü için içerik
  const ctaTitle = pageContent?.sections?.cta?.title || 'Etkinliklerimizden Haberdar Olun';
  const ctaContent = pageContent?.sections?.cta?.content || 'Okulumuzda düzenlenen etkinliklerden ve duyurulardan haberdar olmak için iletişim bilgilerinizi bırakabilirsiniz.';
  const ctaButtonText = pageContent?.sections?.cta?.buttonText || 'İletişime Geçin';
  const ctaButtonUrl = pageContent?.sections?.cta?.buttonUrl || '/iletisim';
  const ctaImage = pageContent?.sections?.cta?.image || '';

  // Etkinlikleri duruma göre sırala (önce yaklaşan etkinlikler)
  const sortedEvents = [...events].sort((a, b) => {
    // Önce duruma göre sırala (upcoming > completed > cancelled)
    if (a.status !== b.status) {
      if (a.status === 'upcoming') return -1;
      if (b.status === 'upcoming') return 1;
      if (a.status === 'completed') return -1;
      if (b.status === 'completed') return 1;
    }
    
    // Aynı durumdaki etkinlikleri tarihe göre sırala
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  // Etkinlik durumunu Türkçe'ye çevir
  const getStatusText = (status: string) => {
    switch(status) {
      case 'upcoming': return 'Yaklaşan';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return 'Yaklaşan';
    }
  };

  // Etkinlik durumuna göre renk sınıfı
  const getStatusColorClass = (status: string) => {
    switch(status) {
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Bölümü */}
      <div className="relative h-[300px] md:h-[400px] mb-12 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-burgundy-800 flex items-center justify-center">
          <span className="text-white text-3xl font-bold opacity-30">Adil Dursun Okulları</span>
        </div>
        <Image
          src={heroImage}
          alt="Adil Dursun Okulları Etkinlikler"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Etkinliklerimiz</h1>
            <p className="text-xl max-w-2xl mx-auto">
              {heroContent}
            </p>
          </div>
        </div>
      </div>

      {/* Giriş Metni (Eğer varsa) */}
      {introContent && (
        <div className="mb-12">
          <div className="prose prose-lg max-w-none prose-headings:text-black prose-p:text-black prose-strong:text-black prose-li:text-black prose-a:text-burgundy-700 text-black" style={{color: 'black'}} dangerouslySetInnerHTML={{ __html: introContent }} />
        </div>
      )}

      {/* Etkinlikler Listesi */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          <span className="text-burgundy-700">Etkinliklerimiz</span>
        </h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-burgundy-700"></div>
            <p className="mt-2 text-gray-600">Etkinlikler yükleniyor...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-600">Henüz etkinlik bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative h-48">
                  {event.image || event.imageUrl ? (
                    <Image
                      src={event.image || event.imageUrl || ''}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-burgundy-100 flex items-center justify-center">
                      <span className="text-burgundy-700 text-xl font-semibold">{event.title.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColorClass(event.status)}`}>
                      {getStatusText(event.status)}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-burgundy-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600">{event.date} {event.time && `- ${event.time}`}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-700 mb-4">{event.description.length > 100 ? `${event.description.substring(0, 100)}...` : event.description}</p>
                  <div className="flex items-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-burgundy-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">{event.location}</span>
                  </div>
                  <button 
                    className="w-full bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    onClick={() => alert(`${event.title} etkinliği hakkında detaylı bilgi: ${event.description}`)}
                  >
                    Detaylı Bilgi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Bölümü */}
      <div className="bg-burgundy-700 text-white p-8 rounded-xl text-center my-16">
        {ctaImage && (
          <div className="relative w-full h-64 md:h-80 mb-8 rounded-lg overflow-hidden">
            <Image
              src={ctaImage}
              alt={ctaTitle}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        <h2 className="text-2xl font-bold mb-4">{ctaTitle}</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          {ctaContent}
        </p>
        <Link 
          href={ctaButtonUrl}
          className="inline-block bg-white text-burgundy-700 hover:bg-gray-100 font-medium py-3 px-6 rounded-lg transition-colors"
        >
          {ctaButtonText}
        </Link>
      </div>
    </div>
  );
} 