'use client';

import { useState, useEffect } from 'react';
import { 
  getCollection, 
  getDocument, 
  addDocument, 
  updateDocument, 
  uploadFile, 
  deleteFile
} from '@/firebase/firebaseServices';
import { useAppContext } from '@/context/AppContext';

interface SiteSettings {
  id: string;
  siteName: string;
  logo?: string;
  logoPublicId?: string;
  favicon?: string;
  faviconPublicId?: string;
  email: string;
  phone: string;
  address: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  footerText: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  workingHours?: string; // JSON formatında çalışma saatleri
}

interface SiteSettingsManagementProps {
  isActive: boolean;
}

export default function SiteSettingsManagement({ isActive }: SiteSettingsManagementProps) {
  const { refreshSiteSettings } = useAppContext();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [formData, setFormData] = useState<Partial<SiteSettings>>({
    siteName: '',
    email: '',
    phone: '',
    address: '',
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    footerText: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    workingHours: JSON.stringify({
      weekdays: '08:00 - 17:00',
      saturday: '09:00 - 13:00',
      sunday: 'Kapalı'
    })
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
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
        const siteSettings = settingsData[0] as SiteSettings;
        console.log('SiteSettingsManagement - siteSettings:', siteSettings);
        setSettings(siteSettings);
        setFormData({
          siteName: siteSettings.siteName || '',
          email: siteSettings.email || '',
          phone: siteSettings.phone || '',
          address: siteSettings.address || '',
          facebook: siteSettings.facebook || '',
          twitter: siteSettings.twitter || '',
          instagram: siteSettings.instagram || '',
          youtube: siteSettings.youtube || '',
          footerText: siteSettings.footerText || '',
          metaTitle: siteSettings.metaTitle || '',
          metaDescription: siteSettings.metaDescription || '',
          metaKeywords: siteSettings.metaKeywords || '',
          workingHours: siteSettings.workingHours || JSON.stringify({
            weekdays: '08:00 - 17:00',
            saturday: '09:00 - 13:00',
            sunday: 'Kapalı'
          })
        });
      } else {
        // Eğer ayarlar yoksa varsayılan değerleri kullan
        setSettings(null);
      }
    } catch (error) {
      console.error('Site ayarları yüklenirken hata oluştu:', error);
      setMessage({ text: 'Site ayarları yüklenirken bir hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      if (name === 'logo') {
        setLogoFile(files[0]);
      } else if (name === 'favicon') {
        setFaviconFile(files[0]);
      }
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      let logoUrl = settings?.logo || '';
      let logoPublicId = settings?.logoPublicId || '';
      let faviconUrl = settings?.favicon || '';
      let faviconPublicId = settings?.faviconPublicId || '';

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

      // Favicon yükleme
      if (faviconFile) {
        // Eski favicon'u sil
        if (settings?.faviconPublicId) {
          await deleteFile(settings.faviconPublicId);
        }
        
        // Yeni favicon'u yükle
        const faviconResult = await uploadFile('site-settings', faviconFile);
        faviconUrl = faviconResult.downloadURL;
        faviconPublicId = faviconResult.publicId;
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
        logoPublicId: logoPublicId,
        favicon: faviconUrl,
        faviconPublicId: faviconPublicId
      };
      
      console.log('SiteSettingsManagement - updatedSettings:', updatedSettings);

      if (settings) {
        // Mevcut ayarları güncelle
        await updateDocument('siteSettings', settings.id, updatedSettings);
        console.log('SiteSettingsManagement - Ayarlar güncellendi');
      } else {
        // Yeni ayarlar oluştur
        await addDocument('siteSettings', updatedSettings);
        console.log('SiteSettingsManagement - Yeni ayarlar oluşturuldu');
      }

      // Ayarları yeniden yükle
      fetchSettings();
      
      // AppContext'teki site ayarlarını yenile
      try {
        console.log('SiteSettingsManagement - AppContext refreshSiteSettings fonksiyonu çağrılıyor');
        refreshSiteSettings();
        console.log('SiteSettingsManagement - AppContext refreshSiteSettings fonksiyonu başarıyla çağrıldı');
      } catch (refreshError) {
        console.error('SiteSettingsManagement - AppContext refreshSiteSettings fonksiyonu çağrılırken hata oluştu:', refreshError);
      }
      
      // Başarı mesajı göster
      setMessage({ 
        text: 'Site ayarları başarıyla güncellendi. Değişikliklerin görünmesi için sayfayı yenileyebilirsiniz. Birkaç saniye içinde otomatik olarak yenilenecektir.', 
        type: 'success' 
      });
      
      // 3 saniye sonra sayfayı yenile
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 3000);
      
      // Dosya seçimlerini temizle
      setLogoFile(null);
      setFaviconFile(null);
      
      // Form elemanlarını temizle
      const logoInput = document.getElementById('logo') as HTMLInputElement;
      const faviconInput = document.getElementById('favicon') as HTMLInputElement;
      if (logoInput) logoInput.value = '';
      if (faviconInput) faviconInput.value = '';
    } catch (error) {
      console.error('Site ayarları kaydedilirken hata oluştu:', error);
      setMessage({ text: 'Site ayarları kaydedilirken bir hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isActive) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Site Ayarları</h2>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
              {settings?.logo && (
                <div className="mt-2">
                  <img src={settings.logo} alt="Logo" className="h-12 object-contain" />
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="favicon" className="block text-sm font-medium text-gray-700 mb-1">
                Favicon
              </label>
              <input
                type="file"
                id="favicon"
                name="favicon"
                onChange={handleFileChange}
                accept="image/x-icon,image/png"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
              {settings?.favicon && (
                <div className="mt-2">
                  <img src={settings.favicon} alt="Favicon" className="h-8 object-contain" />
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
              <p className="mt-1 text-sm text-gray-500">
                Bu metin, sitenin alt kısmında (footer) sol tarafta görünecektir. Okulunuz hakkında kısa bir açıklama yazabilirsiniz.
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">İletişim Bilgileri</h3>
            
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
              <p className="mt-1 text-sm text-gray-500">
                Bu telefon numarası, sitenin alt kısmında (footer) iletişim bilgilerinde görünecektir.
              </p>
            </div>
            
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
              <p className="mt-1 text-sm text-gray-500">
                Bu e-posta adresi, sitenin alt kısmında (footer) iletişim bilgilerinde görünecektir.
              </p>
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
            
            {(() => {
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
              
              // Çalışma saatlerini güncellemek için yardımcı fonksiyon
              const updateWorkingHours = (key: string, value: string) => {
                try {
                  const currentHours = formData.workingHours ? JSON.parse(formData.workingHours) : workingHoursObj;
                  const updatedHours = { ...currentHours, [key]: value };
                  setFormData(prev => ({ ...prev, workingHours: JSON.stringify(updatedHours) }));
                } catch (error) {
                  console.error('Çalışma saatleri güncellenirken hata oluştu:', error);
                }
              };
              
              return (
                <>
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
                </>
              );
            })()}
            
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
        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kaydediliyor...
              </>
            ) : (
              'Ayarları Kaydet'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 