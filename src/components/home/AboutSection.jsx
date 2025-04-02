'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

const WhyUsSection = () => {
  const [whyUsContent, setWhyUsContent] = useState({
    title: "Neden <span>Adil Dursun Okulları</span>?",
    description: "Adil Dursun Okulları olarak, öğrencilerimizin akademik başarılarının yanı sıra kültürel ve sosyal gelişimlerini de destekleyen bir eğitim anlayışını benimsiyoruz. Bizi tercih etmeniz için birçok nedenimiz var:",
    image: "/images/about/school-building.jpg",
    features: [
      {
        title: "Deneyimli Eğitim Kadrosu",
        description: "Alanında uzman ve deneyimli öğretmenlerimizle kaliteli eğitim",
        icon: "teacher"
      },
      {
        title: "Bireysel Gelişim Odaklı",
        description: "Her öğrencinin potansiyelini keşfetmesine yardımcı olan programlar",
        icon: "user"
      },
      {
        title: "Modern Eğitim Ortamı",
        description: "Teknoloji destekli modern eğitim tesisleri",
        icon: "building"
      },
      {
        title: "Değerler Eğitimi",
        description: "Milli ve manevi değerlere bağlı bireyler yetiştirme",
        icon: "heart"
      }
    ],
    experience: {
      year: "2003'den Beri",
      text: "Kaliteli eğitim hizmeti"
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sayfa içeriğini dinle
    const pageContentsQuery = query(collection(db, 'pageContents'));
    const unsubscribe = onSnapshot(pageContentsQuery, (snapshot) => {
      try {
        const pageContentsData = [];
        snapshot.forEach((doc) => {
          pageContentsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        const whyUsPageContent = pageContentsData.find(
          (content) => content.pageId === 'whyUs'
        );
        
        if (whyUsPageContent && whyUsPageContent.sections) {
          console.log('Anasayfa Neden Biz içeriği güncellendi:', whyUsPageContent);
          
          // Mevcut içeriği koru, sadece gelen verileri güncelle
          const updatedContent = { ...whyUsContent };
          
          // Intro bölümü
          if (whyUsPageContent.sections.intro) {
            if (whyUsPageContent.sections.intro.title) {
              updatedContent.title = whyUsPageContent.sections.intro.title;
            }
            
            if (whyUsPageContent.sections.intro.content) {
              updatedContent.description = whyUsPageContent.sections.intro.content;
            }
          }
          
          // Image bölümü
          if (whyUsPageContent.sections.image && whyUsPageContent.sections.image.image) {
            updatedContent.image = whyUsPageContent.sections.image.image;
          }
          
          // Features bölümü
          if (whyUsPageContent.sections.features && whyUsPageContent.sections.features.content) {
            try {
              const featuresData = JSON.parse(whyUsPageContent.sections.features.content);
              if (featuresData && Array.isArray(featuresData.features)) {
                updatedContent.features = featuresData.features;
              }
            } catch (error) {
              console.error('Features içeriği parse edilemedi:', error);
            }
          }
          
          // Experience bölümü
          if (whyUsPageContent.sections.experience && whyUsPageContent.sections.experience.content) {
            try {
              const experienceData = JSON.parse(whyUsPageContent.sections.experience.content);
              if (experienceData && experienceData.year && experienceData.text) {
                updatedContent.experience = {
                  year: experienceData.year,
                  text: experienceData.text
                };
              }
            } catch (error) {
              console.error('Experience içeriği parse edilemedi:', error);
            }
          }
          
          setWhyUsContent(updatedContent);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Anasayfa Neden Biz içeriği işlenirken hata oluştu:', error);
        setLoading(false);
      }
    }, (error) => {
      console.error('Anasayfa Neden Biz içeriğini dinlerken hata oluştu:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // HTML içeriğini güvenli bir şekilde render et
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };

  // İkon bileşeni
  const FeatureIcon = ({ icon }) => {
    switch (icon) {
      case 'teacher':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        );
      case 'building':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'user':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'heart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'check':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Okul görseli */}
          <div className="w-full lg:w-1/2 relative">
            <div className="bg-burgundy-50 rounded-lg overflow-hidden aspect-video relative">
              {/* Görsel yüklenemezse arka plan rengi gösterilir */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-burgundy-800 text-2xl font-bold">Adil Dursun Okulları</span>
              </div>
              {!loading && (
                <Image
                  src={whyUsContent.image}
                  alt="Adil Dursun Okulları"
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              )}
            </div>
            
            {/* Deneyim kutusu */}
            <div className="absolute -bottom-8 -right-8 md:bottom-8 md:right-8 bg-white shadow-xl rounded-lg p-6 max-w-xs">
              <div className="flex items-center gap-4">
                <div className="bg-burgundy-50 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{whyUsContent.experience?.year || "2003'den Beri"}</h3>
                  <p className="text-gray-600">{whyUsContent.experience?.text || "Kaliteli eğitim hizmeti"}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bilgi içeriği */}
          <div className="w-full lg:w-1/2">
            <h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
              dangerouslySetInnerHTML={createMarkup((whyUsContent.title || "Neden <span>Adil Dursun Okulları</span>?").replace('<span>', '<span class="text-burgundy-700">'))}
            />
            
            <p className="text-gray-700 text-lg mb-8">
              {whyUsContent.description || "Adil Dursun Okulları olarak, öğrencilerimizin akademik başarılarının yanı sıra kültürel ve sosyal gelişimlerini de destekleyen bir eğitim anlayışını benimsiyoruz. Bizi tercih etmeniz için birçok nedenimiz var:"}
            </p>
            
            {/* Özellikler grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {(whyUsContent.features || []).map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="bg-burgundy-50 p-2 rounded-full mt-1">
                    <FeatureIcon icon={feature.icon} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Link 
              href="/hakkimizda" 
              className="inline-block bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Daha Fazla Bilgi
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection; 