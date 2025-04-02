'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Örnek öğretmen verileri
const teachers = [
  {
    id: 1,
    name: 'Ayşe Yılmaz',
    position: 'Matematik Öğretmeni',
    image: '/images/teachers/teacher1.jpg',
    fallbackColor: 'bg-burgundy-50',
    socialMedia: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      email: 'mailto:ayse.yilmaz@adildursunokullari.com',
    },
  },
  {
    id: 2,
    name: 'Mehmet Kaya',
    position: 'Fizik Öğretmeni',
    image: '/images/teachers/teacher2.jpg',
    fallbackColor: 'bg-burgundy-50',
    socialMedia: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      email: 'mailto:mehmet.kaya@adildursunokullari.com',
    },
  },
  {
    id: 3,
    name: 'Zeynep Demir',
    position: 'İngilizce Öğretmeni',
    image: '/images/teachers/teacher3.jpg',
    fallbackColor: 'bg-burgundy-50',
    socialMedia: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      email: 'mailto:zeynep.demir@adildursunokullari.com',
    },
  },
  {
    id: 4,
    name: 'Ahmet Şahin',
    position: 'Tarih Öğretmeni',
    image: '/images/teachers/teacher4.jpg',
    fallbackColor: 'bg-burgundy-50',
    socialMedia: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      email: 'mailto:ahmet.sahin@adildursunokullari.com',
    },
  },
];

const FeaturedTeachers = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Deneyimli <span className="text-burgundy-700">Öğretmen Kadromuz</span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Alanında uzman, deneyimli ve öğrencilerimizin gelişimini her zaman ön planda tutan değerli öğretmenlerimizle tanışın.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
              <div className={`relative h-64 ${teacher.fallbackColor}`}>
                {/* Görsel yükleme hatası olsa bile arka plan rengi gösterilecek */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-burgundy-800 text-4xl font-bold">
                    {teacher.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <Image
                  src={teacher.image}
                  alt={teacher.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{teacher.name}</h3>
                <p className="text-burgundy-700 mb-4">{teacher.position}</p>
                
                <div className="flex justify-center space-x-4">
                  <a 
                    href={teacher.socialMedia.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-burgundy-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a 
                    href={teacher.socialMedia.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-burgundy-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a 
                    href={teacher.socialMedia.email}
                    className="text-gray-500 hover:text-burgundy-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link 
            href="/ogretmenlerimiz" 
            className="inline-block bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Tüm Öğretmenlerimiz
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTeachers; 