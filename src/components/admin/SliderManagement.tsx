'use client';

import { useState, useEffect } from 'react';
import { 
  getCollection, 
  addDocument, 
  updateDocument, 
  deleteDocument, 
  uploadFile, 
  deleteFile 
} from '@/firebase/firebaseServices';

interface Slider {
  id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  image: string;
  imagePublicId: string;
  order: number;
  active: boolean;
}

interface SliderManagementProps {
  isActive: boolean;
}

export default function SliderManagement({ isActive }: SliderManagementProps) {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [selectedSlider, setSelectedSlider] = useState<Slider | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    order: 0,
    active: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (isActive) {
      fetchSliders();
    }
  }, [isActive]);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const slidersData = await getCollection('sliders');
      // Sıralama numarasına göre sırala
      const sortedSliders = slidersData.sort((a, b) => a.order - b.order);
      setSliders(sortedSliders as Slider[]);
    } catch (error) {
      console.error('Slider\'lar alınırken hata oluştu:', error);
      setMessage({ text: 'Slider\'lar alınırken bir hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'order') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      setImageFile(files[0]);
    }
  };

  const resetForm = () => {
    setSelectedSlider(null);
    setFormData({
      title: '',
      subtitle: '',
      buttonText: '',
      buttonLink: '',
      order: sliders.length,
      active: true
    });
    setImageFile(null);
    
    // Form elemanını temizle
    const imageInput = document.getElementById('sliderImage') as HTMLInputElement;
    if (imageInput) imageInput.value = '';
  };

  const handleSelectSlider = (slider: Slider) => {
    setSelectedSlider(slider);
    setFormData({
      title: slider.title || '',
      subtitle: slider.subtitle || '',
      buttonText: slider.buttonText || '',
      buttonLink: slider.buttonLink || '',
      order: slider.order || 0,
      active: slider.active
    });
  };

  const handleAddNew = () => {
    resetForm();
  };

  const saveSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      let imageUrl = selectedSlider?.image || '';
      let imagePublicId = selectedSlider?.imagePublicId || '';

      // Resim yükleme
      if (imageFile) {
        // Eski resmi sil
        if (selectedSlider?.imagePublicId) {
          await deleteFile(selectedSlider.imagePublicId);
        }
        
        // Yeni resmi yükle
        const imageResult = await uploadFile('sliders', imageFile);
        imageUrl = imageResult.downloadURL;
        imagePublicId = imageResult.publicId;
      } else if (!selectedSlider && !imageFile) {
        setMessage({ text: 'Lütfen bir slider görseli seçin.', type: 'error' });
        setLoading(false);
        return;
      }

      const sliderData = {
        title: formData.title,
        subtitle: formData.subtitle,
        buttonText: formData.buttonText,
        buttonLink: formData.buttonLink,
        image: imageUrl,
        imagePublicId: imagePublicId,
        order: formData.order,
        active: formData.active
      };

      if (selectedSlider) {
        // Mevcut slider'ı güncelle
        await updateDocument('sliders', selectedSlider.id, sliderData);
        setMessage({ text: 'Slider başarıyla güncellendi.', type: 'success' });
      } else {
        // Yeni slider oluştur
        await addDocument('sliders', sliderData);
        setMessage({ text: 'Slider başarıyla oluşturuldu.', type: 'success' });
      }

      // Slider'ları yeniden yükle
      fetchSliders();
      
      // Formu sıfırla
      resetForm();
    } catch (error) {
      console.error('Slider kaydedilirken hata oluştu:', error);
      setMessage({ text: 'Slider kaydedilirken bir hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const deleteSlider = async (sliderId: string, imagePublicId: string) => {
    if (!confirm('Bu slider\'ı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      
      // Resmi sil
      if (imagePublicId) {
        await deleteFile(imagePublicId);
      }
      
      // Slider'ı sil
      await deleteDocument('sliders', sliderId);
      
      // Slider'ları yeniden yükle
      fetchSliders();
      
      // Seçili slider silinmişse formu sıfırla
      if (selectedSlider && selectedSlider.id === sliderId) {
        resetForm();
      }
      
      setMessage({ text: 'Slider başarıyla silindi.', type: 'success' });
    } catch (error) {
      console.error('Slider silinirken hata oluştu:', error);
      setMessage({ text: 'Slider silinirken bir hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isActive) return null;

  return (
    <div className={`p-4 ${isActive ? 'block' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-6">Slider Yönetimi</h2>
      
      {/* Bilgi kutusu */}
      <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
        <h3 className="font-bold">Önemli Bilgi:</h3>
        <p className="mb-2">Slider görselleri için ideal boyutlar:</p>
        <ul className="list-disc ml-5 mb-2">
          <li><strong>Önerilen boyut:</strong> 1920x800 piksel (16:9 oranı)</li>
          <li><strong>Minimum genişlik:</strong> 1200 piksel</li>
          <li><strong>Dosya formatı:</strong> JPG veya PNG</li>
          <li><strong>Dosya boyutu:</strong> 2MB'dan küçük olmalı</li>
        </ul>
        <p>Daha iyi görünüm için yatay (landscape) formatta, yüksek kaliteli görseller kullanın.</p>
        <p className="mt-2 text-blue-800 font-medium">Görüntüler çok büyük görünüyorsa:</p>
        <ul className="list-disc ml-5">
          <li>Görüntüleri yüklemeden önce 1920x800 piksel boyutuna getirin</li>
          <li>16:9 oranında kırpın (örn: 1920x1080 yerine 1920x800)</li>
          <li>Görüntü düzenleme programı kullanarak boyutlandırın (Photoshop, GIMP, vb.)</li>
          <li>Online araçlar kullanabilirsiniz: <a href="https://www.iloveimg.com/resize-image" target="_blank" rel="noopener noreferrer" className="underline">iloveimg.com</a> veya <a href="https://www.resizepixel.com/" target="_blank" rel="noopener noreferrer" className="underline">resizepixel.com</a></li>
        </ul>
      </div>
      
      {/* Mevcut içerik devam ediyor */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Form */}
        <div className="w-full md:w-1/2 bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-black">
            {selectedSlider ? 'Slider Düzenle' : 'Yeni Slider Ekle'}
          </h3>
          
          {message.text && (
            <div className={`p-3 rounded mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={saveSlider}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Başlık *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 text-gray-900"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="subtitle" className="block text-gray-700 font-medium mb-2">Alt Başlık</label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 text-gray-900"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="buttonText" className="block text-gray-700 font-medium mb-2">Buton Metni</label>
              <input
                type="text"
                id="buttonText"
                name="buttonText"
                value={formData.buttonText}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 text-gray-900"
                placeholder="Örn: Daha Fazla"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="buttonLink" className="block text-gray-700 font-medium mb-2">Buton Linki</label>
              <input
                type="text"
                id="buttonLink"
                name="buttonLink"
                value={formData.buttonLink}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 text-gray-900"
                placeholder="Örn: /hakkimizda"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="order" className="block text-gray-700 font-medium mb-2">Sıralama</label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 text-gray-900"
                min="0"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="sliderImage" className="block text-gray-700 font-medium mb-2">
                Slider Görseli {!selectedSlider && '*'}
                <span className="text-sm text-gray-500 ml-2">(Önerilen: 1920x800px)</span>
              </label>
              <input
                type="file"
                id="sliderImage"
                name="sliderImage"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 text-gray-900"
                accept="image/*"
                {...(!selectedSlider && { required: true })}
              />
              {selectedSlider && selectedSlider.image && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Mevcut görsel:</p>
                  <img 
                    src={selectedSlider.image} 
                    alt={selectedSlider.title} 
                    className="w-full h-32 object-cover rounded-md" 
                  />
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleFormChange}
                  className="h-4 w-4 text-burgundy-600 focus:ring-burgundy-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Aktif</span>
              </label>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {selectedSlider ? 'İptal' : 'Temizle'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-burgundy-600 text-white rounded-md hover:bg-burgundy-700 focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                disabled={loading}
              >
                {loading ? 'İşleniyor...' : (selectedSlider ? 'Güncelle' : 'Kaydet')}
              </button>
            </div>
          </form>
        </div>
        
        {/* Slider Listesi */}
        <div className="w-full md:w-1/2">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-black">Sliderlar</h3>
              <button
                onClick={handleAddNew}
                className="px-3 py-1 bg-burgundy-600 text-white rounded-md hover:bg-burgundy-700 focus:outline-none focus:ring-2 focus:ring-burgundy-500 text-sm"
              >
                + Yeni Ekle
              </button>
            </div>
            
            {loading ? (
              <p className="text-center py-4">Yükleniyor...</p>
            ) : sliders.length === 0 ? (
              <p className="text-center py-4 text-gray-500">Henüz slider eklenmemiş.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {sliders.map((slider) => (
                  <div 
                    key={slider.id} 
                    className={`border rounded-md p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedSlider?.id === slider.id ? 'border-burgundy-500 bg-burgundy-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleSelectSlider(slider)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{slider.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${slider.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {slider.active ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="mx-2">•</span>
                      <span>Sıra: {slider.order}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlider(slider.id, slider.imagePublicId);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 focus:outline-none"
                      title="Sil"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 