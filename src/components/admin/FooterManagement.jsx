'use client';

import { useState, useEffect } from 'react';
import { 
  getCollection, 
  addDocument, 
  updateDocument, 
  uploadFile, 
  deleteFile 
} from '@/firebase/firebaseServices';

export default function FooterManagement({ isActive }) {
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    siteName: 'Adil Dursun Okulları',
    logo: '/images/logo/logo.jpeg',
    address: 'Adil Dursun Okulları, Örnek Mahallesi, Eğitim Caddesi No: 123, İstanbul',
    phone: '+90 212 123 45 67',
    email: 'info@adildursunokullari.com',
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    footerText: 'Adil Dursun Okulları olarak, çocuklarınızın geleceğini şekillendirmek için buradayız. Kaliteli eğitim, güvenli ortam ve modern imkanlarla öğrencilerimizin potansiyellerini en üst düzeye çıkarmayı hedefliyoruz.',
    workingHours: JSON.stringify({
      weekdays: '08:00 - 17:00',
      saturday: '09:00 - 13:00',
      sunday: 'Kapalı'
    })
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (isActive) {
      fetchSettings();
    }
  }, [isActive]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const settingsData = await getCollection('siteSettings');
      
      if (settingsData && settingsData.length > 0) {
        const siteSettings = settingsData[0];
        setSettings(siteSettings);
        setFormData({
          siteName: siteSettings.siteName || 'Adil Dursun Okulları',
          logo: siteSettings.logo || '/images/logo/logo.jpeg',
          address: siteSettings.address || 'Adil Dursun Okulları, Örnek Mahallesi, Eğitim Caddesi No: 123, İstanbul',
          phone: siteSettings.phone || '+90 212 123 45 67',
          email: siteSettings.email || 'info@adildursunokullari.com',
          facebook: siteSettings.facebook || '',
          twitter: siteSettings.twitter || '',
          instagram: siteSettings.instagram || '',
          youtube: siteSettings.youtube || '',
          footerText: siteSettings.footerText || 'Adil Dursun Okulları olarak, çocuklarınızın geleceğini şekillendirmek için buradayız. Kaliteli eğitim, güvenli ortam ve modern imkanlarla öğrencilerimizin potansiyellerini en üst düzeye çıkarmayı hedefliyoruz.',
          workingHours: siteSettings.workingHours || JSON.stringify({
            weekdays: '08:00 - 17:00',
            saturday: '09:00 - 13:00',
            sunday: 'Kapalı'
          })
        });
      }
    } catch (error) {
      console.error('Alt menü ayarları alınırken hata oluştu:', error);
      setMessage({ text: 'Alt menü ayarları alınırken bir hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      if (name === 'logo') {
        setLogoFile(files[0]);
      }
    }
  };

  const updateWorkingHours = (key, value) => {
    try {
      // Çalışma saatlerini JSON'dan parse et
      let workingHoursObj = {
        weekdays: '08:00 - 17:00',
        saturday: '09:00 - 13:00',
        sunday: 'Kapalı'
      };
      
      if (formData.workingHours) {
        try {
          workingHoursObj = JSON.parse(formData.workingHours);
        } catch (error) {
          console.error('Çalışma saatleri ayrıştırılırken hata oluştu:', error);
        }
      }
      
      // Belirtilen anahtarı güncelle
      const updatedHours = { ...workingHoursObj, [key]: value };
      
      // Güncellenmiş saatleri JSON'a dönüştür ve formData'ya kaydet
      setFormData(prev => ({ ...prev, workingHours: JSON.stringify(updatedHours) }));
    } catch (error) {
      console.error('Çalışma saatleri güncellenirken hata oluştu:', error);
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      let logoUrl = settings?.logo || '';
      let logoPublicId = settings?.logoPublicId || '';

      // Logo yükleme
      if (logoFile) {
        // Eski logoyu sil
        if (settings?.logoPublicId) {
          await deleteFile(settings.logoPublicId);
        }
        
        // Yeni logoyu yükle
        const logoResult = await uploadFile('site-settings', logoFile);
        logoUrl = logoResult.downloadURL;
        logoPublicId = logoResult.publicId;
      }

      // Çalışma saatlerini kontrol et
      if (formData.workingHours) {
        try {
          // JSON formatını doğrula
          JSON.parse(formData.workingHours);
        } catch (error) {
          console.error('Çalışma saatleri geçerli bir JSON formatında değil:', error);
          // Varsayılan değeri kullan
          formData.workingHours = JSON.stringify({
            weekdays: '08:00 - 17:00',
            saturday: '09:00 - 13:00',
            sunday: 'Kapalı'
          });
        }
      } else {
        // Çalışma saatleri tanımlanmamışsa varsayılan değeri kullan
        formData.workingHours = JSON.stringify({
          weekdays: '08:00 - 17:00',
          saturday: '09:00 - 13:00',
          sunday: 'Kapalı'
        });
      }

      const updatedSettings = {
        ...formData,
        logo: logoUrl,
        logoPublicId: logoPublicId
      };

      if (settings) {
        // Mevcut ayarları güncelle
        await updateDocument('siteSettings', settings.id, updatedSettings);
        setMessage({ text: 'Alt menü ayarları başarıyla güncellendi.', type: 'success' });
      } else {
        // Yeni ayarlar oluştur
        await addDocument('siteSettings', updatedSettings);
        setMessage({ text: 'Alt menü ayarları başarıyla oluşturuldu.', type: 'success' });
      }

      // Ayarları yeniden yükle
      fetchSettings();
      
      // Dosya seçimlerini temizle
      setLogoFile(null);
      
      // Form elemanlarını temizle
      const logoInput = document.getElementById('logo');
      if (logoInput) logoInput.value = '';
    } catch (error) {
      console.error('Alt menü ayarları kaydedilirken hata oluştu:', error);
      setMessage({ text: 'Alt menü ayarları kaydedilirken bir hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isActive) return null;

  // Çalışma saatlerini JSON'dan parse et
  let workingHoursObj = {
    weekdays: '08:00 - 17:00',
    saturday: '09:00 - 13:00',
    sunday: 'Kapalı'
  };
  
  try {
    if (formData.workingHours) {
      workingHoursObj = JSON.parse(formData.workingHours);
    }
  } catch (error) {
    console.error('Çalışma saatleri ayrıştırılırken hata oluştu:', error);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-black">Alt Menü Düzenleme</h2>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={saveSettings}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">Genel Ayarlar</h3>
            
            <div className="mb-4">
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                Site Adı
              </label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={formData.siteName}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                Logo
              </label>
              <input
                type="file"
                id="logo"
                name="logo"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                accept="image/*"
              />
              {settings?.logo && (
                <div className="mt-2">
                  <img src={settings.logo} alt="Logo" className="h-12 object-contain" />
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="footerText" className="block text-sm font-medium text-gray-700 mb-1">
                Alt Bilgi Metni
              </label>
              <textarea
                id="footerText"
                name="footerText"
                value={formData.footerText}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-24 bg-white text-gray-800"
                required
              ></textarea>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">İletişim Bilgileri</h3>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Adres
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-24 bg-white text-gray-800"
                required
              ></textarea>
            </div>
            
            <h3 className="text-lg font-semibold mb-4 mt-6">Çalışma Saatleri</h3>
            
            <div className="mb-4">
              <label htmlFor="weekdays" className="block text-sm font-medium text-gray-700 mb-1">
                Pazartesi - Cuma
              </label>
              <input
                type="text"
                id="weekdays"
                value={workingHoursObj.weekdays}
                onChange={(e) => updateWorkingHours('weekdays', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="saturday" className="block text-sm font-medium text-gray-700 mb-1">
                Cumartesi
              </label>
              <input
                type="text"
                id="saturday"
                value={workingHoursObj.saturday}
                onChange={(e) => updateWorkingHours('saturday', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="sunday" className="block text-sm font-medium text-gray-700 mb-1">
                Pazar
              </label>
              <input
                type="text"
                id="sunday"
                value={workingHoursObj.sunday}
                onChange={(e) => updateWorkingHours('sunday', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
              />
            </div>
            
            <h3 className="text-lg font-semibold mb-4 mt-6">Sosyal Medya</h3>
            
            <div className="mb-4">
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                Facebook
              </label>
              <input
                type="text"
                id="facebook"
                name="facebook"
                value={formData.facebook}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                Twitter
              </label>
              <input
                type="text"
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                type="text"
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 mb-1">
                YouTube
              </label>
              <input
                type="text"
                id="youtube"
                name="youtube"
                value={formData.youtube}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
} 