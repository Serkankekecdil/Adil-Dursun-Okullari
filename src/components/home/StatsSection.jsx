'use client';

import { useState, useEffect } from 'react';

// İstatistik verileri
const stats = [
  {
    id: 1,
    value: 2003,
    label: 'Kuruluş Yılı',
    prefix: '',
    suffix: '',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 2,
    value: 1500,
    label: 'Öğrenci Sayısı',
    prefix: '',
    suffix: '+',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 3,
    value: 120,
    label: 'Öğretmen Sayısı',
    prefix: '',
    suffix: '+',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: 4,
    value: 98,
    label: 'Başarı Oranı',
    prefix: '',
    suffix: '%',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const StatsSection = () => {
  const [animatedStats, setAnimatedStats] = useState(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Sayaç animasyonu
  useEffect(() => {
    const handleScroll = () => {
      if (hasAnimated) return;
      
      const element = document.getElementById('stats-section');
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
      
      if (isVisible) {
        setHasAnimated(true);
        
        stats.forEach((stat, index) => {
          const duration = 2000; // Animasyon süresi (ms)
          const steps = 50; // Adım sayısı
          const stepValue = stat.value / steps;
          let currentStep = 0;
          
          const interval = setInterval(() => {
            if (currentStep < steps) {
              setAnimatedStats(prev => {
                const newValues = [...prev];
                newValues[index] = Math.round(stepValue * currentStep);
                return newValues;
              });
              currentStep++;
            } else {
              setAnimatedStats(prev => {
                const newValues = [...prev];
                newValues[index] = stat.value;
                return newValues;
              });
              clearInterval(interval);
            }
          }, duration / steps);
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // İlk yükleme kontrolü
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasAnimated]);

  return (
    <section id="stats-section" className="py-16 bg-burgundy-700 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Rakamlarla Adil Dursun Okulları
          </h2>
          <p className="text-burgundy-100 max-w-3xl mx-auto">
            Yılların deneyimi ve başarısıyla öğrencilerimize kaliteli eğitim sunmaya devam ediyoruz.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={stat.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                {stat.icon}
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stat.prefix}{animatedStats[index].toLocaleString()}{stat.suffix}
              </div>
              <div className="text-xl text-burgundy-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection; 