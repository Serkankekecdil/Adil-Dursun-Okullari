'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCollection } from '@/firebase/firebaseServices';

// Varsayılan içerik
const defaultContent = {
  mission: {
    title: 'Misyonumuz',
    content: 'Öğrencilerimizin akademik, sosyal ve kültürel alanlarda tam potansiyellerine ulaşmalarını sağlamak için kaliteli bir eğitim ortamı sunmak. Milli ve manevi değerlere bağlı, evrensel bilgi ve becerilerle donatılmış, yenilikçi, sorgulayan ve çözüm odaklı bireyler yetiştirmek.'
  },
  vision: {
    title: 'Vizyonumuz',
    content: 'Ulusal ve uluslararası alanda tanınan, eğitim kalitesi ve yenilikçi yaklaşımlarıyla örnek gösterilen, öğrencilerinin başarılarıyla gurur duyan, topluma ve çevreye duyarlı, sürekli gelişen bir eğitim kurumu olmak.'
  },
  hero: {
    title: 'Hakkımızda',
    content: '2003 yılından beri kaliteli eğitim hizmeti veriyoruz'
  },
  history: {
    title: 'Tarihçemiz',
    content: '<p class="text-black font-medium mb-4">Adil Dursun Okulları, 2003 yılında eğitim alanında uzun yıllar deneyim sahibi olan Adil Dursun tarafından kurulmuştur. İlk olarak tek bir ilkokul binası ile eğitim hayatına başlayan kurumumuz, yıllar içinde büyüyerek anaokulu, ilkokul, ortaokul ve lise kademelerini bünyesine katmıştır.</p><p class="text-black font-medium mb-4">Kurulduğumuz günden bu yana, öğrencilerimizin akademik başarılarının yanı sıra sosyal ve kültürel gelişimlerini de destekleyen bir eğitim anlayışını benimsedik. Modern eğitim yaklaşımlarını geleneksel değerlerle harmanlayarak, geleceğin liderlerini yetiştirmeyi hedefledik.</p><p class="text-black font-medium">Bugün, 20 yılı aşkın deneyimimizle, 1500\'den fazla öğrencimiz ve 120\'den fazla öğretmenimizle eğitim yolculuğumuza devam ediyoruz.</p>'
  },
  values: {
    title: 'Değerlerimiz',
    content: `{
      "values": [
        {
          "title": "Dürüstlük ve Güven",
          "description": "Tüm ilişkilerimizde dürüstlük ve güven temel değerlerimizdir. Öğrencilerimize, velilerimize ve çalışanlarımıza karşı şeffaf ve güvenilir bir yaklaşım sergileriz.",
          "icon": "handshake"
        },
        {
          "title": "Kalite ve Mükemmellik",
          "description": "Eğitimin her alanında kalite ve mükemmelliği hedefleriz. Sürekli iyileştirme ve gelişim için çalışır, en iyi eğitim deneyimini sunmayı amaçlarız.",
          "icon": "trophy"
        },
        {
          "title": "Saygı ve Hoşgörü",
          "description": "Farklılıklara saygı gösterir ve hoşgörü kültürünü benimseriz. Her öğrencinin biricik olduğuna inanır, bireysel farklılıkları zenginlik olarak görürüz.",
          "icon": "heart"
        },
        {
          "title": "Yenilikçilik",
          "description": "Eğitimde yenilikçi yaklaşımları takip eder ve uygularız. Teknolojik gelişmeleri eğitim süreçlerimize entegre ederek, öğrencilerimizi geleceğe hazırlarız.",
          "icon": "lightbulb"
        },
        {
          "title": "Sosyal Sorumluluk",
          "description": "Topluma ve çevreye karşı sorumluluklarımızın bilincindeyiz. Öğrencilerimize sosyal sorumluluk bilinci kazandırmak için çeşitli projeler geliştiririz.",
          "icon": "globe"
        },
        {
          "title": "İşbirliği",
          "description": "Öğrenci, veli, öğretmen ve yönetim arasında güçlü bir işbirliği kurarız. Eğitim sürecinin tüm paydaşlarının katılımını önemser ve teşvik ederiz.",
          "icon": "users"
        }
      ]
    }`
  },
  team: {
    title: 'Yönetim Ekibimiz',
    content: `{
      "team": [
        {
          "name": "Adil Dursun",
          "title": "Kurucu",
          "description": "40 yıllık eğitim deneyimiyle, okulumuzun kurucusu ve vizyonerin arkasındaki isim.",
          "image": "/images/team/director.jpg",
          "initials": "AD"
        },
        {
          "name": "Mehmet Yılmaz",
          "title": "Okul Müdürü",
          "description": "25 yıllık eğitim ve yönetim tecrübesiyle okulumuzun akademik başarısını yönlendiriyor.",
          "image": "/images/team/principal.jpg",
          "initials": "MY"
        },
        {
          "name": "Ayşe Kaya",
          "title": "Akademik Koordinatör",
          "description": "Eğitim programlarımızın geliştirilmesi ve uygulanmasından sorumlu deneyimli eğitimci.",
          "image": "/images/team/academic.jpg",
          "initials": "AK"
        }
      ]
    }`
  }
};

// Sayfa içeriği için tip tanımı
type ContentSection = {
  title: string;
  content: string;
  image?: string;
  imagePublicId?: string;
};

type PageContent = {
  mission: ContentSection;
  vision: ContentSection;
  hero: ContentSection;
  history: ContentSection;
  values: ContentSection;
  team: ContentSection;
  [key: string]: ContentSection; // İndeks imzası ekleyerek string anahtarlarla erişime izin ver
};

// Firebase'den gelen içerik tipi
interface FirebaseSection {
  title: string;
  content: string;
  image?: string;
  imagePublicId?: string;
}

interface FirebasePageContent {
  id: string;
  pageId: string;
  sections: {
    [key: string]: FirebaseSection;
  };
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  lastUpdated: any;
}

export default function AboutPage() {
  const [pageContent, setPageContent] = useState<PageContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        setLoading(true);
        console.log('Hakkımızda sayfası içeriği yükleniyor...');
        
        const pageContentsRef = await getCollection('pageContents');
        const aboutPageContent = pageContentsRef.find((doc: any) => doc.pageId === 'about') as FirebasePageContent | undefined;
        
        console.log('Bulunan içerik:', aboutPageContent);
        
        if (aboutPageContent && aboutPageContent.sections) {
          // Firebase'den gelen içeriği kullan
          const sections = aboutPageContent.sections;
          
          // Varsayılan içerikle birleştir (eksik bölümler için varsayılan içerik kullanılır)
          const updatedContent = { ...defaultContent } as PageContent;
          
          // Her bölüm için kontrol et
          (Object.keys(defaultContent) as Array<keyof typeof defaultContent>).forEach((sectionKey) => {
            if (sections[sectionKey]) {
              updatedContent[sectionKey] = {
                ...updatedContent[sectionKey],
                ...(sections[sectionKey].content && { content: sections[sectionKey].content }),
                ...(sections[sectionKey].image && { image: sections[sectionKey].image }),
                ...(sections[sectionKey].imagePublicId && { imagePublicId: sections[sectionKey].imagePublicId })
              };
              console.log(`${sectionKey} bölümü güncellendi:`, sections[sectionKey]);
            }
          });
          
          setPageContent(updatedContent);
        } else {
          console.log('Sayfa içeriği bulunamadı, varsayılan içerik kullanılıyor.');
        }
      } catch (error) {
        console.error('Sayfa içeriği yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPageContent();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <p className="text-xl text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Bölümü */}
      <div className="relative h-[300px] md:h-[400px] mb-12 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-burgundy-800 flex items-center justify-center">
          <span className="text-white text-3xl font-bold opacity-30">Adil Dursun Okulları</span>
        </div>
        {pageContent.hero.image ? (
          <Image
            src={pageContent.hero.image}
            alt="Adil Dursun Okulları Hakkında"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <Image
            src="/images/logo/logo.jpeg"
            alt="Adil Dursun Okulları Hakkında"
            fill
            className="object-contain"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Hakkımızda</h1>
            <p className="text-xl max-w-2xl mx-auto">
              {pageContent.hero.content}
            </p>
          </div>
        </div>
      </div>

      {/* Tarihçe Bölümü */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          <span className="text-burgundy-700">Tarihçemiz</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="bg-white p-6 rounded-xl shadow-sm prose prose-strong:text-burgundy-700 prose-headings:text-burgundy-800">
            <div className="text-black font-medium" dangerouslySetInnerHTML={{ __html: pageContent.history.content }} />
          </div>
          <div className="relative h-[300px] rounded-xl overflow-hidden shadow-md">
            {pageContent.history.image ? (
              <Image
                src={pageContent.history.image}
                alt="Adil Dursun Okulları Tarihçe"
                fill
                className="object-cover rounded-xl"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-4 text-center">
                <Image
                  src="/images/logo/logo.jpeg"
                  alt="Adil Dursun Okulları Logo"
                  width={200}
                  height={200}
                  className="mb-4"
                />
                <p className="text-burgundy-700 text-lg font-medium">2003'ten Bugüne Eğitimde Kalite</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Misyon ve Vizyon */}
      <div className="mb-16 bg-burgundy-50 p-8 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
              <div className="bg-burgundy-100 p-3 rounded-full w-16 h-16 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Misyonumuz</h3>
            </div>
            <p className="text-burgundy-700 mb-4" dangerouslySetInnerHTML={{ __html: pageContent.mission.content }} />
            {pageContent.mission.image && (
              <div className="relative h-[200px] rounded-xl overflow-hidden mt-4">
                <Image
                  src={pageContent.mission.image}
                  alt="Adil Dursun Okulları Misyon"
                  fill
                  className="object-cover rounded-xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
              <div className="bg-burgundy-100 p-3 rounded-full w-16 h-16 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Vizyonumuz</h3>
            </div>
            <p className="text-burgundy-700 mb-4" dangerouslySetInnerHTML={{ __html: pageContent.vision.content }} />
            {pageContent.vision.image && (
              <div className="relative h-[200px] rounded-xl overflow-hidden mt-4">
                <Image
                  src={pageContent.vision.image}
                  alt="Adil Dursun Okulları Vizyon"
                  fill
                  className="object-cover rounded-xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Değerlerimiz Bölümü */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {pageContent.values?.title || defaultContent.values.title}
          </h2>
          
          {/* Değerlerimiz Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(() => {
              try {
                // JSON içeriğini parse et
                const valuesData = JSON.parse(pageContent.values?.content || defaultContent.values.content);
                
                // values dizisini kontrol et
                if (!valuesData.values || !Array.isArray(valuesData.values)) {
                  throw new Error('Geçersiz değerler formatı');
                }
                
                // Her değer için bir kart oluştur
                return valuesData.values.map((value: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-burgundy-100 rounded-full mb-4">
                      <i className={`fas fa-${value.icon} text-burgundy-700`}></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-700">{value.description}</p>
                  </div>
                ));
              } catch (error) {
                // JSON parse hatası durumunda varsayılan içeriği göster
                console.error("Değerlerimiz içeriği parse edilemedi:", error);
                return (
                  <div className="col-span-full text-center">
                    <p className="text-red-500">İçerik yüklenirken bir hata oluştu.</p>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      </section>

      {/* Yönetim Ekibi */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          <span className="text-burgundy-700">{pageContent.team?.title || defaultContent.team.title}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(() => {
            try {
              // JSON içeriğini parse et
              const teamData = JSON.parse(pageContent.team?.content || defaultContent.team.content);
              
              // team dizisini kontrol et
              if (!teamData.team || !Array.isArray(teamData.team)) {
                throw new Error('Geçersiz ekip formatı');
              }
              
              // Her ekip üyesi için bir kart oluştur
              return teamData.team.map((member: any, index: number) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="relative h-64 bg-burgundy-50 flex items-center justify-center">
                    <span className="text-burgundy-800 text-4xl font-bold">{member.initials}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-burgundy-700 mb-4">{member.title}</p>
                    <p className="text-burgundy-700 mb-4">{member.description}</p>
                  </div>
                </div>
              ));
            } catch (error) {
              // JSON parse hatası durumunda varsayılan içeriği göster
              console.error("Yönetim ekibi içeriği parse edilemedi:", error);
              return (
                <div className="col-span-full text-center">
                  <p className="text-red-500">İçerik yüklenirken bir hata oluştu.</p>
                </div>
              );
            }
          })()}
        </div>
      </div>

      {/* Çağrı */}
      <div className="bg-burgundy-700 text-white py-16">
        <h2 className="text-3xl font-bold mb-4">Okulumuzu Keşfedin</h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Adil Dursun Okulları&apos;nı daha yakından tanımak ve eğitim programlarımız hakkında detaylı bilgi almak için sizi okulumuza bekliyoruz.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link 
            href="/iletisim" 
            className="inline-block bg-white text-burgundy-700 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors"
          >
            Bize Ulaşın
          </Link>
        </div>
      </div>
    </div>
  );
} 