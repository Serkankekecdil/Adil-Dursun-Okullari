'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Başarıları Firestore'dan çek
    const achievementsQuery = query(
      collection(db, 'achievements'),
      orderBy('date', 'desc'),
      limit(4)
    );

    const unsubscribe = onSnapshot(achievementsQuery, (snapshot) => {
      try {
        const achievementsData = [];
        snapshot.forEach((doc) => {
          achievementsData.push({
            id: doc.id,
            ...doc.data(),
            // Tarih formatını düzelt
            date: doc.data().date?.toDate?.() || new Date(doc.data().date || Date.now()),
          });
        });
        
        setAchievements(achievementsData);
        setLoading(false);
      } catch (error) {
        console.error('Başarılar alınırken hata oluştu:', error);
        setLoading(false);
      }
    }, (error) => {
      console.error('Başarıları dinlerken hata oluştu:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Tarih formatı için yardımcı fonksiyon
  const formatDate = (date) => {
    if (!date) return '';
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(date).toLocaleDateString('tr-TR', options);
  };

  // Örnek başarılar (Firestore boşsa gösterilecek)
  const sampleAchievements = [
    {
      id: '1',
      title: 'TÜBİTAK Bilim Yarışması Birinciliği',
      description: 'Lise öğrencilerimiz, TÜBİTAK Bilim Yarışması\'nda "Yenilenebilir Enerji" projesiyle Türkiye birincisi oldu.',
      category: 'Bilim',
      date: new Date('2023-05-15'),
      image: '/images/logo/logo.jpeg', // varsayılan logo kullanılacak
      fallbackColor: 'bg-burgundy-50'
    },
    {
      id: '2',
      title: 'Ulusal Matematik Olimpiyatı',
      description: 'Ortaokul öğrencimiz Ahmet Yılmaz, Ulusal Matematik Olimpiyatı\'nda altın madalya kazandı.',
      category: 'Akademik',
      date: new Date('2023-04-10'),
      image: '/images/logo/logo.jpeg', // varsayılan logo kullanılacak
      fallbackColor: 'bg-blue-50'
    },
    {
      id: '3',
      title: 'Okul Tiyatro Ekibi Ödülü',
      description: 'Tiyatro kulübümüz, Liselerarası Tiyatro Festivali\'nde "En İyi Performans" ödülünü kazandı.',
      category: 'Sanat',
      date: new Date('2023-03-22'),
      image: '/images/logo/logo.jpeg', // varsayılan logo kullanılacak
      fallbackColor: 'bg-green-50'
    },
    {
      id: '4',
      title: 'Satranç Turnuvası Şampiyonluğu',
      description: 'İlkokul satranç takımımız, İl Satranç Turnuvası\'nda şampiyon oldu ve bölge finallerine katılmaya hak kazandı.',
      category: 'Spor',
      date: new Date('2023-02-18'),
      image: '/images/logo/logo.jpeg', // varsayılan logo kullanılacak
      fallbackColor: 'bg-yellow-50'
    }
  ];

  // Gösterilecek başarılar (Firestore'dan gelen veya örnek veriler)
  const displayAchievements = achievements.length > 0 ? achievements : sampleAchievements;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Başarılarımız ve <span className="text-burgundy-700">Ödüllerimiz</span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Öğrencilerimizin ve okulumuzun akademik, sanatsal ve sportif alanlarda elde ettiği başarılar ve kazandığı ödüller.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-burgundy-700"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayAchievements.map((achievement) => (
              <div key={achievement.id} className={`rounded-lg shadow-md overflow-hidden ${achievement.fallbackColor || 'bg-gray-50'}`}>
                {/* Başarı görsel alanı */}
                <div className="relative h-48 bg-gray-200">
                  <Image 
                    src={achievement.image || '/images/logo/logo.jpeg'} 
                    alt={achievement.title}
                    fill
                    className="object-cover"
                    unoptimized={true} // Cloudinary için optimize etme
                    onError={(e) => {
                      console.error('Görsel yüklenirken hata oluştu:', e);
                      e.target.style.display = 'none'; // hata durumunda görseli gizle
                    }}
                  />
                </div>
                
                {/* Başarı içerik alanı */}
                <div className="p-4">
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-burgundy-700 text-white rounded-full">
                      {achievement.category || 'Genel'}
                    </span>
                    <span className="inline-block ml-2 text-xs text-gray-500">
                      {formatDate(achievement.date)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link 
            href="/basarilarimiz" 
            className="inline-block bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Tüm Başarılarımız
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Achievements; 