'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDocument, getCollection, addDocument } from '@/firebase/firebaseServices';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  
  const [contactInfo, setContactInfo] = useState({
    address: 'Adil Dursun Okulları, Örnek Mahallesi, Eğitim Caddesi No: 123, İstanbul',
    phone: '+90 212 123 45 67',
    email: 'info@adildursunokullari.com',
    workingHours: '',
  });

  const [siteSettings, setSiteSettings] = useState({
    workingHours: '',
  });

  const [sectionContent, setSectionContent] = useState({
    title: 'Bizimle İletişime Geçin',
    description: 'Sorularınız, kayıt işlemleri veya daha fazla bilgi için bizimle iletişime geçebilirsiniz.',
    formTitle: 'Bize Mesaj Gönderin',
    infoTitle: 'İletişim Bilgilerimiz',
    buttonText: 'Detaylı İletişim Bilgileri'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    // İletişim bilgilerini getir
    const fetchContactInfo = async () => {
      try {
        const info = await getDocument('contactInfo', 'main');
        if (info) {
          setContactInfo({
            address: info.address || contactInfo.address,
            phone: info.phone || contactInfo.phone,
            email: info.email || contactInfo.email,
            workingHours: info.workingHours || contactInfo.workingHours,
          });
        }
      } catch (error) {
        console.error('İletişim bilgileri alınırken hata oluştu:', error);
      }
    };

    // Site ayarlarını getir
    const fetchSiteSettings = async () => {
      try {
        const settings = await getDocument('siteSettings', 'main');
        if (settings) {
          setSiteSettings({
            workingHours: settings.workingHours || '',
          });
        }
      } catch (error) {
        console.error('Site ayarları alınırken hata oluştu:', error);
      }
    };

    // Ana sayfa iletişim bölümü içeriğini getir
    const fetchSectionContent = async () => {
      try {
        const content = await getDocument('homeContact', 'main');
        if (content) {
          setSectionContent({
            title: content.title || sectionContent.title,
            description: content.description || sectionContent.description,
            formTitle: content.formTitle || sectionContent.formTitle,
            infoTitle: content.infoTitle || sectionContent.infoTitle,
            buttonText: content.buttonText || sectionContent.buttonText
          });
        }
      } catch (error) {
        console.error('Ana sayfa iletişim bölümü içeriği alınırken hata oluştu:', error);
      }
    };

    fetchContactInfo();
    fetchSiteSettings();
    fetchSectionContent();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Form verilerini Firestore'a kaydet
      const messageData = {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'new', // Yeni mesaj durumu
        read: false // Okunmadı olarak işaretle
      };
      
      // contactMessages koleksiyonuna ekle
      await addDocument('contactMessages', messageData);
      
      // Başarılı durumu göster
      setSubmitStatus('success');
      
      // Formu sıfırla
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
      
      // Başarı mesajını 5 saniye sonra kaldır
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } catch (error) {
      console.error('Mesaj gönderilirken hata oluştu:', error);
      setSubmitStatus('error');
      
      // Hata mesajını 5 saniye sonra kaldır
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {sectionContent.title.split(' ').map((word, index, array) => 
              index === array.length - 1 ? 
                <span key={index} className="text-burgundy-700">{word}</span> : 
                <span key={index}>{word} </span>
            )}
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {sectionContent.description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* İletişim Bilgileri */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{sectionContent.infoTitle}</h3>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-burgundy-50 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Adres</h4>
                  <p className="text-gray-600">
                    {contactInfo.address}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-burgundy-50 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Telefon</h4>
                  <p className="text-gray-600">{contactInfo.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-burgundy-50 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">E-posta</h4>
                  <p className="text-gray-600">{contactInfo.email}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-burgundy-50 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-burgundy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Çalışma Saatleri</h4>
                  <p className="text-gray-600">{siteSettings.workingHours || contactInfo.workingHours || 'Pazartesi - Cuma: 08:00 - 17:00'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Link 
                href="/iletisim" 
                className="inline-block bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {sectionContent.buttonText}
              </Link>
            </div>
          </div>
          
          {/* İletişim Formu */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{sectionContent.formTitle}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Adınız Soyadınız
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-burgundy-700 transition-colors text-gray-900"
                  placeholder="Adınız Soyadınız"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  E-posta Adresiniz
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-burgundy-700 transition-colors text-gray-900"
                  placeholder="ornek@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                  Telefon Numaranız
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-burgundy-700 transition-colors text-gray-900"
                  placeholder="0555 123 4567"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                  Mesajınız
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-burgundy-700 transition-colors text-gray-900"
                  placeholder="Mesajınızı buraya yazabilirsiniz..."
                ></textarea>
              </div>
              
              {submitStatus === 'success' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                  Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  Mesajınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-colors ${
                    isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-burgundy-700 hover:bg-burgundy-800'
                  }`}
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection; 