'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCollection } from '@/firebase/firebaseServices';

const WhyUsSection = () => {
  const [whyUsData, setWhyUsData] = useState({
    title: 'Neden Biz?',
    description: 'Adil Dursun Okulları olarak öğrencilerimize sunduğumuz avantajlar ve değerlerimiz.',
    items: [
      { id: 1, title: 'Kaliteli Eğitim', description: 'Deneyimli öğretmen kadromuz ile kaliteli eğitim sunuyoruz.' },
      { id: 2, title: 'Modern Tesisler', description: 'Modern ve teknolojik altyapıya sahip tesislerimiz ile eğitim veriyoruz.' },
      { id: 3, title: 'Bireysel Gelişim', description: 'Her öğrencimizin bireysel gelişimine önem veriyoruz.' },
      { id: 4, title: 'Sosyal Aktiviteler', description: 'Zengin sosyal aktiviteler ile öğrencilerimizin gelişimini destekliyoruz.' }
    ],
    image: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWhyUsData = async () => {
      try {
        const whyUsCollection = await getCollection('whyUs');
        
        if (whyUsCollection && whyUsCollection.length > 0) {
          const data = whyUsCollection[0];
          console.log('WhyUsSection - Veritabanından veri alındı:', data);
          
          setWhyUsData({
            title: data.title || 'Neden Biz?',
            description: data.description || 'Adil Dursun Okulları olarak öğrencilerimize sunduğumuz avantajlar ve değerlerimiz.',
            items: data.items || [
              { id: 1, title: 'Kaliteli Eğitim', description: 'Deneyimli öğretmen kadromuz ile kaliteli eğitim sunuyoruz.' },
              { id: 2, title: 'Modern Tesisler', description: 'Modern ve teknolojik altyapıya sahip tesislerimiz ile eğitim veriyoruz.' },
              { id: 3, title: 'Bireysel Gelişim', description: 'Her öğrencimizin bireysel gelişimine önem veriyoruz.' },
              { id: 4, title: 'Sosyal Aktiviteler', description: 'Zengin sosyal aktiviteler ile öğrencilerimizin gelişimini destekliyoruz.' }
            ],
            image: data.image || ''
          });
        }
      } catch (error) {
        console.error('WhyUsSection - Veri yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWhyUsData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-12"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="p-6 bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{whyUsData.title}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{whyUsData.description}</p>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          {/* Özellikler Alanı */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {whyUsData.items.map((item) => (
              <div 
                key={item.id} 
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection; 