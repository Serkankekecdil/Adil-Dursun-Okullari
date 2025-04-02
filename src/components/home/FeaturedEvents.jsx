import Image from 'next/image';
import Link from 'next/link';

// Örnek etkinlik verileri
const events = [
  {
    id: 1,
    title: 'Bilim Şenliği',
    date: '15 Mayıs 2023',
    image: '/images/events/event1.jpg',
    fallbackColor: 'bg-burgundy-50',
    excerpt: 'Öğrencilerimizin hazırladığı bilimsel projelerin sergileneceği yıllık bilim şenliğimize davetlisiniz.',
    location: 'Okul Bahçesi',
  },
  {
    id: 2,
    title: 'Mezuniyet Töreni',
    date: '20 Haziran 2023',
    image: '/images/events/event2.jpg',
    fallbackColor: 'bg-burgundy-50',
    excerpt: '2023 yılı mezunlarımızı uğurlayacağımız mezuniyet törenimiz için hazırlıklar tamamlandı.',
    location: 'Konferans Salonu',
  },
  {
    id: 3,
    title: 'Veli Toplantısı',
    date: '10 Nisan 2023',
    image: '/images/events/event3.jpg',
    fallbackColor: 'bg-burgundy-50',
    excerpt: 'Dönem sonu veli toplantımızda öğrencilerimizin gelişimini değerlendireceğiz.',
    location: 'Sınıf Derslikleri',
  },
];

const FeaturedEvents = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Yaklaşan <span className="text-burgundy-700">Etkinliklerimiz</span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Okulumuzda düzenlenen etkinlikler, öğrencilerimizin sosyal ve kültürel gelişimlerine katkı sağlamaktadır.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
              <div className={`relative h-48 ${event.fallbackColor}`}>
                {/* Görsel yükleme hatası olsa bile arka plan rengi gösterilecek */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-burgundy-800 text-2xl font-bold">Etkinlik</span>
                </div>
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-burgundy-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">{event.date}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                
                <div className="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-burgundy-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600">{event.location}</span>
                </div>
                
                <p className="text-gray-600 mb-4">{event.excerpt}</p>
                
                <Link 
                  href={`/etkinlikler/${event.id}`} 
                  className="inline-block bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Detaylar
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link 
            href="/etkinlikler" 
            className="inline-block bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            Tüm Etkinlikler
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents; 