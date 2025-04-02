'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCollection } from '@/firebase/firebaseServices';

// Varsayılan slider verileri
const defaultSlides = [
  {
    id: 1,
    image: '/images/logo/logo.jpeg', // Varsayılan logo kullanılacak
    fallbackColor: 'bg-burgundy-700', // Görsel olmadığında kullanılacak arka plan rengi
    title: 'Geleceğin Liderleri Burada Yetişiyor',
    subtitle: 'Kaliteli Eğitim, Parlak Gelecek',
    description: 'Adil Dursun Okulları olarak öğrencilerimize en iyi eğitimi sunmak için buradayız.',
    buttonText: 'Bizi Tanıyın',
    buttonLink: '/hakkimizda'
  },
  {
    id: 2,
    image: '/images/logo/logo.jpeg', // Varsayılan logo kullanılacak
    fallbackColor: 'bg-burgundy-800', // Görsel olmadığında kullanılacak arka plan rengi
    title: 'Modern Eğitim Tesislerimiz',
    subtitle: 'Teknoloji ve Eğitim Bir Arada',
    description: 'Öğrencilerimize en iyi eğitim ortamını sunmak için modern tesislerimizle hizmet veriyoruz.',
    buttonText: 'Hakkımızda',
    buttonLink: '/hakkimizda'
  },
  {
    id: 3,
    image: '/images/logo/logo.jpeg', // Varsayılan logo kullanılacak
    fallbackColor: 'bg-burgundy-900', // Görsel olmadığında kullanılacak arka plan rengi
    title: 'Başarıya Giden Yol',
    subtitle: 'Deneyimli Eğitim Kadromuz',
    description: 'Alanında uzman öğretmenlerimizle öğrencilerimizin başarısı için çalışıyoruz.',
    buttonText: 'Öğretmenlerimiz',
    buttonLink: '/ogretmenlerimiz'
  }
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slides, setSlides] = useState(defaultSlides);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Firebase'den slider verilerini çek
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        console.log("Sliderlar yükleniyor...");
        setLoading(true);
        setError(null);
        
        const slidersData = await getCollection('sliders');
        console.log("Slider verisi alındı:", slidersData);
        
        if (!slidersData || slidersData.length === 0) {
          console.log("Slider verisi yok veya boş, varsayılan veri kullanılıyor.");
          setSlides(defaultSlides);
          return;
        }
        
        // Aktif sliderları filtrele ve sıralama numarasına göre sırala
        const activeSliders = slidersData
          .filter(slider => slider.active)
          .sort((a, b) => a.order - b.order);
        
        console.log("Aktif ve sıralanmış sliderlar:", activeSliders);
        
        if (activeSliders && activeSliders.length > 0) {
          // Firebase'den gelen verileri slides formatına dönüştür
          const formattedSliders = activeSliders.map(slider => ({
            id: slider.id,
            image: slider.image || '/images/logo/logo.jpeg', // Görsel yoksa logo kullan
            fallbackColor: 'bg-burgundy-700', // Varsayılan fallback rengi
            title: slider.title || 'Adil Dursun Okulları',
            subtitle: slider.subtitle || '',
            description: slider.description || 'Adil Dursun Okulları kaliteli eğitimin adresi.',
            buttonText: slider.buttonText || 'Daha Fazla',
            buttonLink: slider.buttonLink || '/hakkimizda'
          }));
          
          console.log("Biçimlendirilmiş sliderlar:", formattedSliders);
          setSlides(formattedSliders);
        } else {
          console.log("Filtrelenmiş slider verisi bulunamadı, varsayılanlar kullanılıyor.");
          setSlides(defaultSlides);
        }
      } catch (error) {
        console.error('Slider verileri alınırken hata oluştu:', error);
        setError(error);
        // Hata durumunda varsayılan sliderları kullan
        setSlides(defaultSlides);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSliders();
  }, []);
  
  // Otomatik kaydırma için zamanlayıcı
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(timer);
  }, [currentSlide]);
  
  // Belirli bir slayta git
  const goToSlide = (index) => {
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 500);
  };
  
  // Sonraki slayta git
  const nextSlide = () => {
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };
  
  // Önceki slayta git
  const prevSlide = () => {
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Yükleme durumunda veya slider yoksa
  if (loading || slides.length === 0) {
    return (
      <section className="relative w-full h-[600px] overflow-hidden bg-burgundy-700 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-4xl font-bold mb-4">Adil Dursun Okulları</h2>
          <p className="text-xl">Kaliteli Eğitimin Adresi</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[700px] md:h-[800px] lg:h-[900px] overflow-hidden">
      {/* Slider */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Arka plan görseli veya fallback rengi */}
            <div className={`relative w-full h-full ${slide.fallbackColor} flex items-center justify-center`}>
              {/* Görsel varsa yükle, yoksa sadece renkli arka plan göster */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-4xl font-bold opacity-30">
                  Adil Dursun Okulları
                </span>
              </div>
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  width={1920}
                  height={800}
                  className="max-w-full max-h-full object-contain"
                  priority={index === 0}
                  quality={100}
                  unoptimized={true}
                  onError={(e) => {
                    console.error('Görsel yüklenirken hata oluştu:', e);
                    // Hata durumunda görsel gizlenecek, fallback rengi gösterilecek
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              {/* Karartma katmanı */}
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
            
            {/* Metin içeriği */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="container mx-auto px-4 text-center text-white">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fadeIn">
                  {slide.title}
                </h2>
                <h3 className="text-xl md:text-2xl font-semibold mb-6 animate-fadeIn animation-delay-200">
                  {slide.subtitle}
                </h3>
                <p className="text-lg max-w-3xl mx-auto mb-8 animate-fadeIn animation-delay-400">
                  {slide.description}
                </p>
                <Link 
                  href={slide.buttonLink}
                  className="bg-burgundy-700 hover:bg-burgundy-800 inline-block py-3 px-8 rounded-lg text-lg font-medium transition-all animate-fadeIn animation-delay-600 text-white"
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigasyon kontrolleri */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-10' : 'bg-white/50'
            }`}
            aria-label={`Slayt ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Önceki/Sonraki butonları */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full z-30"
        aria-label="Önceki slayt"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full z-30"
        aria-label="Sonraki slayt"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
};

export default HeroSection; 