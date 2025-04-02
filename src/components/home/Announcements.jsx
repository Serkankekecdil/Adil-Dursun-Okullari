'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Duyuruları Firestore'dan çek
    const announcementsQuery = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc'),
      limit(4)
    );

    const unsubscribe = onSnapshot(announcementsQuery, (snapshot) => {
      try {
        const announcementsData = [];
        snapshot.forEach((doc) => {
          announcementsData.push({
            id: doc.id,
            ...doc.data(),
            // Tarih formatını düzelt
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          });
        });
        
        setAnnouncements(announcementsData);
        setLoading(false);
      } catch (error) {
        console.error('Duyurular alınırken hata oluştu:', error);
        setLoading(false);
      }
    }, (error) => {
      console.error('Duyuruları dinlerken hata oluştu:', error);
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

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Güncel <span className="text-burgundy-700">Duyurular</span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Okulumuzla ilgili en güncel duyuru ve etkinliklerden haberdar olun.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-burgundy-700"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">Henüz duyuru bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
                <div className="p-6">
                  <div className="text-burgundy-700 text-sm font-medium mb-2">
                    {formatDate(announcement.createdAt)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{announcement.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{announcement.content}</p>
                  
                  {announcement.link && (
                    <a 
                      href={announcement.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-burgundy-700 hover:text-burgundy-900 font-medium inline-flex items-center"
                    >
                      Detaylar
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link 
            href="/duyurular" 
            className="inline-block bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Tüm Duyurular
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Announcements; 