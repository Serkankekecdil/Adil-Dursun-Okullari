'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCollection } from '@/firebase/firebaseServices';

// Öğretmen tipi tanımı
interface Teacher {
  id: string | number;
  name: string;
  position: string;
  department: string;
  image?: string;
  fallbackColor?: string;
  email?: string;
  phone?: string;
  bio?: string;
  order?: number;
}

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

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Öğretmen verilerini çek
        const teachersCollection = await getCollection('teachers');
        if (teachersCollection && teachersCollection.length > 0) {
          // Öğretmenleri order alanına göre sırala
          const sortedTeachers = [...teachersCollection].sort((a, b) => {
            const orderA = a.order || Number.MAX_SAFE_INTEGER;
            const orderB = b.order || Number.MAX_SAFE_INTEGER;
            return orderA - orderB;
          });
          setTeachers(sortedTeachers as Teacher[]);
        } else {
          // Eğer veri yoksa örnek verileri kullan
          setTeachers(defaultTeachers);
        }
        
        // Sayfa içeriğini çek
        const pageContentsRef = await getCollection('pageContents');
        const teachersPageContent = pageContentsRef.find(
          (content: any) => content.pageId === 'teachers'
        );
        
        if (teachersPageContent) {
          setPageContent(teachersPageContent as PageContent);
        }
      } catch (error) {
        console.error('Veriler getirilirken hata oluştu:', error);
        setTeachers(defaultTeachers);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Örnek öğretmen verileri (Firebase'den veri gelmezse kullanılacak)
  const defaultTeachers: Teacher[] = [
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      position: 'Matematik Öğretmeni',
      department: 'Matematik Bölümü',
      image: '/images/teachers/teacher1.jpg',
      fallbackColor: 'bg-blue-100',
      email: 'ahmet.yilmaz@adildursunokullari.com',
      phone: '0212 XXX XX XX',
      bio: 'Ahmet Bey, 12 yıllık deneyimiyle öğrencilere matematiği sevdiren, sabırlı ve özverili bir eğitimcidir.',
      order: 1
    },
    {
      id: 2,
      name: 'Ayşe Kaya',
      position: 'Türkçe Öğretmeni',
      department: 'Türkçe Bölümü',
      image: '/images/teachers/teacher2.jpg',
      fallbackColor: 'bg-green-100',
      email: 'ayse.kaya@adildursunokullari.com',
      bio: 'Ayşe Hanım, öğrencilerin dil becerilerini geliştirmede uzmanlaşmış, yaratıcı öğretim teknikleri kullanan bir eğitimcidir.',
      order: 2
    },
    {
      id: 3,
      name: 'Mehmet Demir',
      position: 'Fen Bilgisi Öğretmeni',
      department: 'Fen Bilimleri Bölümü',
      image: '/images/teachers/teacher3.jpg',
      fallbackColor: 'bg-yellow-100',
      email: 'mehmet.demir@adildursunokullari.com',
      bio: 'Mehmet Bey, laboratuvar çalışmalarıyla öğrencilere bilimi uygulamalı olarak öğreten deneyimli bir eğitimcidir.',
      order: 3
    },
    {
      id: 4,
      name: 'Zeynep Şahin',
      position: 'İngilizce Öğretmeni',
      department: 'Yabancı Diller Bölümü',
      image: '/images/teachers/teacher4.jpg',
      fallbackColor: 'bg-red-100',
      email: 'zeynep.sahin@adildursunokullari.com',
      bio: 'Zeynep Hanım, yurtdışı deneyimiyle öğrencilere İngilizceyi pratik ve eğlenceli bir şekilde öğreten bir eğitimcidir.',
      order: 4
    },
    {
      id: 5,
      name: 'Ali Yıldız',
      position: 'Tarih Öğretmeni',
      department: 'Sosyal Bilimler Bölümü',
      image: '/images/teachers/teacher5.jpg',
      fallbackColor: 'bg-purple-100',
      email: 'ali.yildiz@adildursunokullari.com',
      bio: 'Ali Bey, tarih derslerini interaktif anlatımıyla öğrencilerin ilgisini çeken, alanında uzman bir eğitimcidir.',
      order: 5
    },
    {
      id: 6,
      name: 'Fatma Çelik',
      position: 'Müzik Öğretmeni',
      department: 'Sanat Bölümü',
      image: '/images/teachers/teacher6.jpg',
      fallbackColor: 'bg-pink-100',
      email: 'fatma.celik@adildursunokullari.com',
      bio: 'Fatma Hanım, öğrencilerin müzikal yeteneklerini keşfetmelerine yardımcı olan, enerjik ve yaratıcı bir eğitimcidir.',
      order: 6
    },
    {
      id: 7,
      name: 'Mustafa Kara',
      position: 'Beden Eğitimi Öğretmeni',
      department: 'Spor Bölümü',
      image: '/images/teachers/teacher7.jpg',
      fallbackColor: 'bg-blue-200',
      email: 'mustafa.kara@adildursunokullari.com',
      bio: 'Mustafa Bey, öğrencilerin fiziksel gelişimlerini destekleyen, takım ruhunu aşılayan dinamik bir eğitimcidir.',
      order: 7
    },
    {
      id: 8,
      name: 'Seda Arslan',
      position: 'Rehber Öğretmen',
      department: 'Rehberlik Bölümü',
      image: '/images/teachers/teacher8.jpg',
      fallbackColor: 'bg-green-200',
      email: 'seda.arslan@adildursunokullari.com',
      bio: 'Seda Hanım, öğrencilerin akademik ve sosyal gelişimlerini destekleyen, empati yeteneği yüksek bir eğitimcidir.',
      order: 8
    }
  ];

  // Sayfa içeriği için değişkenler
  const heroContent = pageContent?.sections?.hero?.content || '';
  const heroImage = pageContent?.sections?.hero?.image || '/images/teachers/teachers-hero.jpg';
  
  // Giriş metni için içerik
  const introContent = pageContent?.sections?.intro?.content || '';
  
  // Eğitim yaklaşımı için içerik
  const approachContent = pageContent?.sections?.approach?.content || '';
  
  // Öğretmen alımı için içerik
  const hiringContent = pageContent?.sections?.hiring?.content || '';
  
  // Öğretmen alımı buton metni ve URL'si
  const hiringButtonText = pageContent?.sections?.hiring?.buttonText || 'İletişime Geçin';
  const hiringButtonUrl = pageContent?.sections?.hiring?.buttonUrl || '/iletisim';

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Bölümü */}
      <div className="relative h-[400px] md:h-[500px] mb-12 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-burgundy-800 flex items-center justify-center">
          <span className="text-white text-3xl font-bold opacity-30">Adil Dursun Okulları</span>
        </div>
        <Image
          src={heroImage}
          alt="Adil Dursun Okulları Öğretmenlerimiz"
          fill
          className="object-cover object-top md:object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Öğretmenlerimiz</h1>
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

      {/* Öğretmenler Bölümü */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          <span className="text-burgundy-700">Akademik Kadromuz</span>
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-burgundy-700"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
                <div className={`relative h-72 ${teacher.fallbackColor || 'bg-burgundy-100'}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-burgundy-800 text-2xl font-bold opacity-50">{teacher.name}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                  <Image
                    src={teacher.image || '/images/teachers/default-teacher.jpg'}
                    alt={teacher.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    priority
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{teacher.name}</h3>
                  <p className="text-burgundy-700 font-medium mb-3">{teacher.position}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-burgundy-700 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Bölüm</p>
                        <p className="text-sm text-gray-800">{teacher.department}</p>
                      </div>
                    </div>
                    
                    {teacher.email && (
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-burgundy-700 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">E-posta</p>
                          <a href={`mailto:${teacher.email}`} className="text-sm text-burgundy-700 hover:underline">{teacher.email}</a>
                        </div>
                      </div>
                    )}
                    
                    {teacher.phone && (
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-burgundy-700 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Telefon</p>
                          <p className="text-sm text-gray-800">{teacher.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-4">{teacher.bio}</p>
                  
                  <button 
                    className="inline-block bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium py-2 px-4 rounded-lg transition-colors w-full text-center"
                    onClick={() => alert(`${teacher.name} hakkında daha fazla bilgi için lütfen iletişime geçin.`)}
                  >
                    Detaylı Bilgi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Eğitim Yaklaşımımız */}
      <div className="mb-16 bg-gray-50 p-8 rounded-xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          <span className="text-burgundy-700">Eğitim Yaklaşımımız</span>
        </h2>
        
        {approachContent ? (
          approachContent.startsWith('[') && approachContent.endsWith(']') ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {JSON.parse(approachContent).map((card: any, index: number) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="bg-burgundy-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                    <i className={`fas fa-${card.icon} text-burgundy-700 text-2xl`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                  <p className="text-gray-700">{card.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="prose prose-lg max-w-none prose-headings:text-black prose-p:text-black prose-strong:text-black prose-li:text-black prose-a:text-burgundy-700 text-black" style={{color: 'black'}} dangerouslySetInnerHTML={{ __html: approachContent }} />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-burgundy-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Yenilikçi Eğitim</h3>
              <p className="text-gray-700">
                Öğretmenlerimiz, modern eğitim teknolojilerini ve yenilikçi öğretim yöntemlerini kullanarak öğrencilerimizin potansiyellerini en üst düzeye çıkarmalarına yardımcı olurlar.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-burgundy-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bireysel Yaklaşım</h3>
              <p className="text-gray-700">
                Her öğrencinin öğrenme stilini ve hızını dikkate alarak bireysel farklılıklara saygı duyan, öğrenci merkezli bir eğitim anlayışı benimsiyoruz.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-burgundy-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sürekli Gelişim</h3>
              <p className="text-gray-700">
                Öğretmenlerimiz, alanlarındaki en son gelişmeleri takip ederek kendilerini sürekli geliştirirler ve bu bilgileri öğrencilerimizle paylaşırlar.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Öğretmen Alımı */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          <span className="text-burgundy-700">Öğretmen Alımı</span>
        </h2>
        
        {hiringContent ? (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Aramıza Katılın</h3>
                <div className="prose prose-lg max-w-none prose-headings:text-black prose-p:text-black prose-strong:text-black prose-li:text-black prose-a:text-burgundy-700 text-black" style={{color: 'black'}} dangerouslySetInnerHTML={{ __html: hiringContent }} />
                <div className="mt-6">
                  <Link 
                    href={hiringButtonUrl}
                    className="inline-block bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    {hiringButtonText}
                  </Link>
                </div>
              </div>
              <div className="relative h-64 md:h-auto rounded-xl overflow-hidden">
                <Image
                  src={pageContent?.sections?.hiring?.image || "/images/teachers/teacher-hiring.jpg"}
                  alt="Öğretmen Alımı"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Aramıza Katılın</h3>
                <p className="text-gray-700 mb-4">
                  Adil Dursun Okulları olarak, eğitim kadromuzu sürekli genişletiyoruz. Alanında uzman, yenilikçi ve öğrenci odaklı çalışan öğretmenlerle çalışmaktan mutluluk duyarız.
                </p>
                <p className="text-gray-700 mb-6">
                  Eğer siz de ailemize katılmak isterseniz, özgeçmişinizi gönderebilir veya açık pozisyonlarımız hakkında bilgi alabilirsiniz.
                </p>
                <Link 
                  href="/iletisim"
                  className="inline-block bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  İletişime Geçin
                </Link>
              </div>
              <div className="relative h-64 md:h-auto rounded-xl overflow-hidden">
                <Image
                  src="/images/teachers/teacher-hiring.jpg"
                  alt="Öğretmen Alımı"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 