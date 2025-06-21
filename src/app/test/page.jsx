'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { debugFirestore } from '@/firebase/firebaseServices';

export default function TestPage() {
  const { siteSettings } = useAppContext();
  const [debugData, setDebugData] = useState(null);

  useEffect(() => {
    const fetchDebugData = async () => {
      const data = await debugFirestore('siteSettings');
      setDebugData(data);
    };

    fetchDebugData();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Test Sayfası</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">AppContext - siteSettings</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
          {JSON.stringify(siteSettings, null, 2)}
        </pre>
      </div>
      
      {debugData && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Firestore - siteSettings</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Footer Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-medium mb-2">İletişim Bilgileri</h3>
            <ul className="space-y-2">
              <li><strong>Adres:</strong> {siteSettings?.address || 'Tanımlanmamış'}</li>
              <li><strong>Telefon:</strong> {siteSettings?.phone || 'Tanımlanmamış'}</li>
              <li><strong>E-posta:</strong> {siteSettings?.email || 'Tanımlanmamış'}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-medium mb-2">Çalışma Saatleri</h3>
            {siteSettings?.workingHours ? (
              <div>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-40">
                  {siteSettings.workingHours}
                </pre>
                
                {(() => {
                  try {
                    const hours = JSON.parse(siteSettings.workingHours);
                    return (
                      <ul className="mt-4 space-y-2">
                        <li><strong>Pazartesi - Cuma:</strong> {hours.weekdays || 'Tanımlanmamış'}</li>
                        <li><strong>Cumartesi:</strong> {hours.saturday || 'Tanımlanmamış'}</li>
                        <li><strong>Pazar:</strong> {hours.sunday || 'Tanımlanmamış'}</li>
                      </ul>
                    );
                  } catch (error) {
                    return <p className="mt-4 text-red-500">Çalışma saatleri ayrıştırılamadı: {error.message}</p>;
                  }
                })()}
              </div>
            ) : (
              <p>Çalışma saatleri tanımlanmamış</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 