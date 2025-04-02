'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { subscribeToCollection, getDocument } from '@/firebase/firebaseServices';
import { collection, doc, onSnapshot, query, limit, getDocs, getFirestore } from 'firebase/firestore';
import { app } from '@/firebase/firebaseConfig';

// Koleksiyon öğesi için genel tip
interface CollectionItem {
  id: string;
  [key: string]: any;
}

// Sık sorulan sorular için arayüz
interface FaqItem {
  question: string;
  answer: string;
}

// İletişim bilgileri için arayüz
interface ContactInfo {
  address: string;
  phone: string;
  secondaryPhone?: string;
  email: string;
  workingHours: string;
  mapEmbedUrl?: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
}

// Sosyal medya ikonları için yardımcı fonksiyon
const SocialIcon = ({ platform, url }: { platform: string, url: string }) => {
  if (!url) return null;
  
  const getIcon = () => {
    switch (platform) {
      case 'facebook':
        return <i className="fab fa-facebook-f"></i>;
      case 'twitter':
        return <i className="fab fa-twitter"></i>;
      case 'instagram':
        return <i className="fab fa-instagram"></i>;
      case 'youtube':
        return <i className="fab fa-youtube"></i>;
      case 'linkedin':
        return <i className="fab fa-linkedin-in"></i>;
      default:
        return null;
    }
  };
  
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="w-10 h-10 rounded-full bg-burgundy-600 text-white flex items-center justify-center hover:bg-burgundy-700 transition-colors"
      aria-label={`${platform} sayfamızı ziyaret edin`}
    >
      {getIcon()}
    </a>
  );
};

export default function ContactPage() {
  // İletişim bilgileri state'i
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: '',
    phone: '',
    email: '',
    workingHours: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      linkedin: ''
    }
  });
  
  // Sayfa içeriği state'i
  const [pageContent, setPageContent] = useState<any>({
    sections: {
      hero: {
        title: 'İletişim',
        content: 'Sorularınız, görüşleriniz veya kayıt işlemleri için bizimle iletişime geçebilirsiniz.',
        image: ''
      },
      faq: {
        content: ''
      }
    }
  });
  
  // Form state'i
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  // Form gönderim durumu
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(true);

  // Sayfa içeriğini ve iletişim bilgilerini gerçek zamanlı olarak dinle
  useEffect(() => {
    console.log('İletişim sayfası: Gerçek zamanlı dinleme başlatılıyor...');
    setLoading(true);
    
    // Sayfa içeriğini gerçek zamanlı olarak dinle
    const pageContentUnsubscribe = subscribeToCollection('pageContents', (data: CollectionItem[]) => {
      try {
        const contactPageContent = data.find(
          (content: CollectionItem) => content.id === 'iletisim'
        );
        
        if (contactPageContent) {
          console.log('İletişim sayfası: Sayfa içeriği gerçek zamanlı olarak güncellendi:', contactPageContent);
          setPageContent(contactPageContent as unknown as PageContent);
        } else {
          console.log('İletişim sayfası: Sayfa içeriği bulunamadı');
        }
      } catch (error) {
        console.error('İletişim sayfası: Sayfa içeriği işlenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    });
    
    // İletişim bilgilerini getir
    const fetchContactInfo = async () => {
      try {
        const info = await getDocument('contactInfo', 'main');
        if (info) {
          setContactInfo({
            address: info.address || '',
            phone: info.phone || '',
            email: info.email || '',
            workingHours: info.workingHours || '',
            socialMedia: info.socialMedia || {
              facebook: '',
              twitter: '',
              instagram: '',
              youtube: '',
              linkedin: ''
            }
          });
        }
      } catch (error) {
        console.error('İletişim bilgileri alınırken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    // Site ayarlarını getir
    const fetchSiteSettings = async () => {
      try {
        const settings = await getDocument('siteSettings', 'main');
        if (settings) {
          setSiteSettings({
            workingHours: settings.workingHours || '',
            // ... diğer site ayarları
          });
        }
      } catch (error) {
        console.error('Site ayarları alınırken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
    fetchSiteSettings();
    
    // Temizleme fonksiyonu
    return () => {
      console.log('İletişim sayfası: Gerçek zamanlı dinleme durduruldu');
      pageContentUnsubscribe();
    };
  }, []);

  // Form değişikliklerini işleme
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Firestore modüllerini dinamik olarak import et
      const { collection, addDoc } = await import('firebase/firestore');
      const { addDocument } = await import('@/firebase/firebaseServices');
      
      // Mesajı Firestore'a kaydet
      await addDocument('contactMessages', {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'new' // Yeni mesaj durumu
      });
      
      // Başarılı gönderim
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      // Hata durumu
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sık sorulan soruları ayrıştır
  const parseFaqItems = (content: string): FaqItem[] => {
    if (!content) return [];
    try {
      return JSON.parse(content) as FaqItem[];
    } catch (error) {
      // Hata durumunda varsayılan sorular
      return [
        { 
          question: 'Kayıt işlemleri için hangi belgeler gereklidir?', 
          answer: 'Öğrenci kimlik fotokopisi, veli kimlik fotokopisi, 4 adet fotoğraf ve önceki okul karnesi (varsa) gerekmektedir.' 
        },
        { 
          question: 'Okul ücretleri neyi kapsar?', 
          answer: 'Okul ücretlerimiz eğitim, yemek, kitap ve kırtasiye malzemelerini kapsamaktadır. Servis ve özel etkinlikler için ek ücret talep edilebilir.' 
        },
        { 
          question: 'Yabancı dil eğitimi nasıl verilmektedir?', 
          answer: 'Okulumuzda yabancı dil eğitimi, anadili İngilizce olan öğretmenler tarafından, haftada en az 10 saat olarak verilmektedir.' 
        },
        { 
          question: 'Servis hizmeti var mı?', 
          answer: 'Evet, okulumuz güvenli servis hizmeti sunmaktadır. Servis güzergahları ve ücretleri hakkında detaylı bilgiyi iletişim ofisimizden alabilirsiniz.' 
        }
      ];
    }
  };

  // Yükleme durumunda gösterilecek içerik
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-burgundy-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section - Modern Tasarım */}
      <div className="relative bg-gradient-to-r from-burgundy-900 to-burgundy-700 text-white py-24">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {pageContent.sections?.hero?.image ? (
            <Image
              src={pageContent.sections.hero.image}
              alt="İletişim"
              fill
              style={{ objectFit: 'cover' }}
              className="opacity-30 mix-blend-overlay"
            />
          ) : (
            <Image
              src="/images/logo/logo.jpeg"
              alt="İletişim"
              fill
              style={{ objectFit: 'cover' }}
              className="opacity-20 mix-blend-overlay"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-burgundy-900/70"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-md">
              İletişim
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto text-white/90">
              {pageContent.sections?.hero?.content || 
                "Sorularınız için bizimle iletişime geçebilirsiniz. Size en kısa sürede dönüş yapacağız."}
            </p>
          </div>
        </div>
      </div>

      {/* İletişim Bilgileri Kartları */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 -mt-16 relative z-20">
            {/* Adres Kartı */}
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center transform transition-transform hover:-translate-y-2 hover:shadow-xl">
              <div className="w-16 h-16 rounded-full bg-burgundy-100 flex items-center justify-center mb-4">
                <i className="fas fa-map-marker-alt text-2xl text-burgundy-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Adres</h3>
              <p className="text-gray-600">{contactInfo.address || "Örnek Mahallesi, Eğitim Caddesi No: 123, İstanbul"}</p>
            </div>
            
            {/* Telefon Kartı */}
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center transform transition-transform hover:-translate-y-2 hover:shadow-xl">
              <div className="w-16 h-16 rounded-full bg-burgundy-100 flex items-center justify-center mb-4">
                <i className="fas fa-phone-alt text-2xl text-burgundy-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Telefon</h3>
              <p className="text-gray-600">{contactInfo.phone || "+90 212 123 45 67"}</p>
              {contactInfo.secondaryPhone && (
                <p className="text-gray-600 mt-1">{contactInfo.secondaryPhone}</p>
              )}
            </div>
            
            {/* E-posta Kartı */}
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center transform transition-transform hover:-translate-y-2 hover:shadow-xl">
              <div className="w-16 h-16 rounded-full bg-burgundy-100 flex items-center justify-center mb-4">
                <i className="fas fa-envelope text-2xl text-burgundy-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">E-posta</h3>
              <p className="text-gray-600">{contactInfo.email || "info@adildursunokullari.com"}</p>
            </div>
            
            {/* Çalışma Saatleri Kartı */}
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center transform transition-transform hover:-translate-y-2 hover:shadow-xl">
              <div className="w-16 h-16 rounded-full bg-burgundy-100 flex items-center justify-center mb-4">
                <i className="fas fa-clock text-2xl text-burgundy-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Çalışma Saatleri</h3>
              <p className="text-gray-600">{contactInfo.workingHours || "Pazartesi - Cuma: 08:00 - 17:00"}</p>
            </div>
          </div>
          
          {/* Ana İletişim Bölümü */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* İletişim Formu */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold text-burgundy-800 mb-6">Bize Ulaşın</h2>
              <p className="text-gray-700 mb-8">
                {pageContent.sections?.form?.content || 
                  "Aşağıdaki formu doldurarak bize mesaj gönderebilirsiniz. En kısa sürede size dönüş yapacağız."}
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Adınız Soyadınız
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-burgundy-500 focus:border-burgundy-500 shadow-sm text-gray-900 bg-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-posta Adresiniz
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-burgundy-500 focus:border-burgundy-500 shadow-sm text-gray-900 bg-white"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon Numaranız
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-burgundy-500 focus:border-burgundy-500 shadow-sm text-gray-900 bg-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Konu
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-burgundy-500 focus:border-burgundy-500 shadow-sm text-gray-900 bg-white"
                      required
                    >
                      <option value="">Seçiniz</option>
                      <option value="Kayıt">Kayıt İşlemleri</option>
                      <option value="Bilgi">Bilgi Talebi</option>
                      <option value="Öneri">Öneri/Şikayet</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Mesajınız
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-burgundy-500 focus:border-burgundy-500 shadow-sm text-gray-900 bg-white"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-4 bg-burgundy-600 text-white font-medium rounded-md hover:bg-burgundy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-burgundy-500 transition-colors shadow-md ${
                      isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Gönderiliyor...' : 'Mesajı Gönder'}
                  </button>
                </div>
                
                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-50 text-green-800 rounded-md border border-green-200">
                    <div className="flex items-center">
                      <i className="fas fa-check-circle text-green-500 mr-2"></i>
                      <span>Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.</span>
                    </div>
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-200">
                    <div className="flex items-center">
                      <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
                      <span>Mesajınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.</span>
                    </div>
                  </div>
                )}
              </form>
            </div>
            
            {/* İletişim Bilgileri ve Sosyal Medya */}
            <div className="lg:col-span-2 space-y-8">
              {/* Detaylı İletişim Bilgileri */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-burgundy-800 mb-6">İletişim Bilgileri</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-burgundy-100 flex items-center justify-center mr-4">
                      <i className="fas fa-map-marker-alt text-burgundy-600"></i>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">Adres</h4>
                      <p className="text-gray-600">{contactInfo.address || "Örnek Mahallesi, Eğitim Caddesi No: 123, İstanbul"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-burgundy-100 flex items-center justify-center mr-4">
                      <i className="fas fa-phone-alt text-burgundy-600"></i>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">Telefon</h4>
                      <p className="text-gray-600">{contactInfo.phone || "+90 212 123 45 67"}</p>
                      {contactInfo.secondaryPhone && (
                        <p className="text-gray-600 mt-1">{contactInfo.secondaryPhone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-burgundy-100 flex items-center justify-center mr-4">
                      <i className="fas fa-envelope text-burgundy-600"></i>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">E-posta</h4>
                      <p className="text-gray-600">{contactInfo.email || "info@adildursunokullari.com"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-burgundy-100 flex items-center justify-center mr-4">
                      <i className="fas fa-clock text-burgundy-600"></i>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">Çalışma Saatleri</h4>
                      <p className="text-gray-600">{contactInfo.workingHours || "Pazartesi - Cuma: 08:00 - 17:00"}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sosyal Medya */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-burgundy-800 mb-6">Sosyal Medya</h3>
                <p className="text-gray-700 mb-6">Sosyal medya hesaplarımızı takip ederek güncel duyuru ve etkinliklerimizden haberdar olabilirsiniz.</p>
                
                <div className="flex space-x-4">
                  <SocialIcon platform="facebook" url={contactInfo.socialMedia?.facebook || ''} />
                  <SocialIcon platform="twitter" url={contactInfo.socialMedia?.twitter || ''} />
                  <SocialIcon platform="instagram" url={contactInfo.socialMedia?.instagram || ''} />
                  <SocialIcon platform="youtube" url={contactInfo.socialMedia?.youtube || ''} />
                  <SocialIcon platform="linkedin" url={contactInfo.socialMedia?.linkedin || ''} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-burgundy-800 mb-4">Sık Sorulan Sorular</h2>
            <p className="text-gray-600">Aşağıda en çok sorulan soruları ve cevaplarını bulabilirsiniz. Başka sorularınız varsa bizimle iletişime geçmekten çekinmeyin.</p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {parseFaqItems(pageContent.sections?.faq?.content || '').map((item: FaqItem, index: number) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="px-8 py-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-burgundy-100 flex items-center justify-center mr-4 mt-1">
                      <i className="fas fa-question text-sm text-burgundy-600"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-burgundy-800 text-lg mb-3">{item.question}</h3>
                      <p className="text-gray-700">{item.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 