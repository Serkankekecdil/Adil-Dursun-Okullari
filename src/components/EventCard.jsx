'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const EventCard = ({ event }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Etkinlik bilgisi yoksa boş bir kart göster
  if (!event) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden h-full animate-pulse">
        <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-full mb-1"></div>
          <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-full mb-1"></div>
          <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-4/5 mb-4"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const { id, title, date, image, description, location, time, category } = event;

  // Tarihi formatlama
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  // Detay modalını aç/kapat
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <div className="relative h-48 w-full">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          />
          <div className="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 text-sm font-medium">
            {date}
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{description}</p>
          
          <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {location}
          </div>
          
          <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {time}
          </div>
          
          <Link 
            href={`/etkinlikler/${id}`}
            className="inline-block bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Detayları Gör
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Detay Modalı */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {/* Modal Başlık ve Kapat Butonu */}
              <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                <button
                  onClick={toggleModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Etkinlik Resmi */}
              <div className="relative h-64 w-full">
                {image ? (
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Kategori Etiketi */}
                {category && (
                  <div className="absolute top-4 right-4 bg-primary-800 text-white px-3 py-1 rounded-full text-sm">
                    {category}
                  </div>
                )}
              </div>

              {/* Etkinlik Detayları */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center mb-6 text-gray-600 dark:text-gray-400">
                  {/* Tarih ve Saat */}
                  <div className="flex items-center mb-2 md:mb-0 md:mr-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-burgundy-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(date)}</span>
                    {time && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{time}</span>
                      </>
                    )}
                  </div>
                  
                  {/* Konum */}
                  {location && (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-burgundy-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{location}</span>
                    </div>
                  )}
                </div>
                
                {/* Açıklama */}
                <div className="prose dark:prose-invert max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Etkinlik Açıklaması</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {description}
                  </p>
                </div>
                
                {/* Paylaş Butonları */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bu etkinliği paylaş</h3>
                  <div className="flex space-x-4">
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`${title} - ${window.location.href}`)}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M21.35 4.508a9.987 9.987 0 0 0-7.11-2.947 10.007 10.007 0 0 0-8.525 14.95L3 22l5.589-1.463A10.003 10.003 0 0 0 14.25 22c5.523 0 10-4.477 10-10a9.956 9.956 0 0 0-2.9-7.492zm-7.1 15.012h-.003a8.333 8.333 0 0 1-4.244-1.162l-.305-.18-3.16.827.844-3.075-.198-.313a8.32 8.32 0 0 1-1.277-4.427c0-4.61 3.754-8.364 8.364-8.364 2.235 0 4.335.87 5.915 2.452a8.332 8.332 0 0 1 2.45 5.913c0 4.61-3.754 8.362-8.365 8.362zm4.908-6.258c-.251-.126-1.488-.735-1.718-.818-.23-.084-.398-.126-.566.126-.168.252-.65.818-.796.985-.146.167-.293.188-.544.063-.251-.126-1.059-.39-2.016-1.244-.745-.664-1.248-1.484-1.394-1.735-.146-.251-.016-.387.11-.512.112-.112.25-.293.376-.44.125-.146.167-.25.25-.418.084-.167.042-.313-.02-.44-.063-.125-.566-1.364-.776-1.868-.204-.49-.41-.423-.566-.43-.146-.008-.314-.01-.482-.01-.167 0-.44.063-.67.314-.23.252-.879.858-.879 2.094 0 1.236.9 2.43.999 2.598.104.167 1.476 2.25 3.578 3.155.5.215.89.344 1.194.44.502.159.958.136 1.32.082.402-.06 1.238-.506 1.412-1.003.172-.495.172-.92.12-1.008-.052-.087-.22-.138-.47-.263z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventCard; 