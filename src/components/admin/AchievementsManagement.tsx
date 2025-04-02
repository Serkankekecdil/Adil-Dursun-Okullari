'use client';

import React, { useState, useEffect } from 'react';
import { 
  getCollection, 
  addDocument, 
  updateDocument, 
  deleteDocument,
  uploadFile,
  deleteFile
} from '@/firebase/firebaseServices';

// Başarı tipi
interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  date: any;
  image?: string;
  imagePublicId?: string;
  fallbackColor?: string;
}

interface AchievementsManagementProps {
  isActive: boolean;
}

export default function AchievementsManagement({ isActive }: AchievementsManagementProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    fallbackColor: 'bg-burgundy-50'
  });

  // Renk seçenekleri
  const colorOptions = [
    { id: 'bg-burgundy-50', name: 'Bordo Açık', class: 'bg-burgundy-50' },
    { id: 'bg-blue-50', name: 'Mavi Açık', class: 'bg-blue-50' },
    { id: 'bg-green-50', name: 'Yeşil Açık', class: 'bg-green-50' },
    { id: 'bg-yellow-50', name: 'Sarı Açık', class: 'bg-yellow-50' },
    { id: 'bg-purple-50', name: 'Mor Açık', class: 'bg-purple-50' },
    { id: 'bg-gray-50', name: 'Gri Açık', class: 'bg-gray-50' }
  ];

  // Kategori seçenekleri
  const categoryOptions = [
    { id: 'Akademik', name: 'Akademik' },
    { id: 'Bilim', name: 'Bilim' },
    { id: 'Sanat', name: 'Sanat' },
    { id: 'Spor', name: 'Spor' },
    { id: 'Sosyal', name: 'Sosyal' },
    { id: 'Diğer', name: 'Diğer' }
  ];

  // Başarıları getir
  useEffect(() => {
    if (isActive) {
      fetchAchievements();
    }
  }, [isActive]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const data = await getCollection('achievements');
      // Tarihe göre sırala (en yeni en üstte)
      const sortedData = [...data].sort((a, b) => {
        const dateA = a.date?.toDate?.() || new Date(a.date || 0);
        const dateB = b.date?.toDate?.() || new Date(b.date || 0);
        return dateB.getTime() - dateA.getTime();
      });
      setAchievements(sortedData as Achievement[]);
    } catch (error) {
      console.error('Başarılar getirilirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Form değişikliklerini işle
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Dosya değişikliklerini işle
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Başarı ekle
  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form gönderildi, formData:', formData);
    
    try {
      setLoading(true);
      
      let imageUrl = '';
      let imagePublicId = '';
      
      // Görsel yükleme
      if (imageFile) {
        const imageResult = await uploadFile(`achievements/images/${Date.now()}_${imageFile.name}`, imageFile);
        imageUrl = imageResult.downloadURL;
        imagePublicId = imageResult.publicId;
      }
      
      const newAchievement = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: new Date(formData.date),
        fallbackColor: formData.fallbackColor,
        image: imageUrl,
        imagePublicId: imagePublicId,
        createdAt: new Date()
      };
      
      console.log('Eklenecek başarı:', newAchievement);
      
      const result = await addDocument('achievements', newAchievement);
      console.log('Başarı eklendi, sonuç:', result);
      
      // Formu sıfırla
      resetForm();
      
      // Başarıları yeniden getir
      fetchAchievements();
      
      // Başarı mesajı
      alert('Başarı başarıyla eklendi.');
      
    } catch (error) {
      console.error('Başarı eklenirken hata oluştu:', error);
      alert(`Başarı eklenirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  // Başarı güncelle
  const handleUpdateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAchievement) return;
    
    try {
      setLoading(true);
      
      const achievementToUpdate = achievements.find(a => a.id === selectedAchievement);
      if (!achievementToUpdate) throw new Error('Güncellenecek başarı bulunamadı');
      
      let imageUrl = achievementToUpdate.image || '';
      let imagePublicId = achievementToUpdate.imagePublicId || '';
      
      // Yeni görsel yükleme
      if (imageFile) {
        // Eski görseli sil
        if (imagePublicId) {
          await deleteFile(imagePublicId);
        }
        
        // Yeni görseli yükle
        const imageResult = await uploadFile(`achievements/images/${Date.now()}_${imageFile.name}`, imageFile);
        imageUrl = imageResult.downloadURL;
        imagePublicId = imageResult.publicId;
      }
      
      const updatedAchievement = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: new Date(formData.date),
        fallbackColor: formData.fallbackColor,
        image: imageUrl,
        imagePublicId: imagePublicId,
        updatedAt: new Date()
      };
      
      await updateDocument('achievements', selectedAchievement, updatedAchievement);
      
      // Formu sıfırla
      resetForm();
      
      // Başarıları yeniden getir
      fetchAchievements();
      
      // Başarı mesajı
      alert('Başarı başarıyla güncellendi.');
      
    } catch (error) {
      console.error('Başarı güncellenirken hata oluştu:', error);
      alert(`Başarı güncellenirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
      setIsEditing(false);
      setSelectedAchievement(null);
    }
  };

  // Başarı sil
  const handleDeleteAchievement = async (id: string) => {
    if (window.confirm('Bu başarıyı silmek istediğinizden emin misiniz?')) {
      try {
        setLoading(true);
        
        // Başarıyı bul
        const achievementToDelete = achievements.find(a => a.id === id);
        
        if (achievementToDelete && achievementToDelete.imagePublicId) {
          // Görseli sil
          await deleteFile(achievementToDelete.imagePublicId);
        }
        
        // Başarıyı sil
        await deleteDocument('achievements', id);
        
        // Başarıları yeniden getir
        fetchAchievements();
        
        alert('Başarı başarıyla silindi.');
      } catch (error) {
        console.error('Başarı silinirken hata oluştu:', error);
        alert(`Başarı silinirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Düzenleme için başarıyı yükle
  const handleEditAchievement = (achievement: Achievement) => {
    setIsEditing(true);
    setSelectedAchievement(achievement.id);
    
    // Tarih formatını düzelt
    const date = achievement.date?.toDate?.() || new Date(achievement.date);
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD formatı
    
    setFormData({
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      date: formattedDate,
      fallbackColor: achievement.fallbackColor || 'bg-burgundy-50'
    });
  };

  // Formu sıfırla
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      date: '',
      fallbackColor: 'bg-burgundy-50'
    });
    setImageFile(null);
    setIsEditing(false);
    setSelectedAchievement(null);
    
    // Dosya seçimini temizle
    const imageInput = document.getElementById('achievementImage') as HTMLInputElement;
    if (imageInput) imageInput.value = '';
  };

  // Tarih formatı için yardımcı fonksiyon
  const formatDate = (date: any) => {
    if (!date) return '';
    
    const dateObj = date?.toDate?.() || new Date(date);
    return dateObj.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!isActive) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-black mb-6">Başarılar ve Ödüller Yönetimi</h1>
      
      {/* Başarı Ekleme/Düzenleme Formu */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-black mb-4">
          {isEditing ? 'Başarı Düzenle' : 'Yeni Başarı Ekle'}
        </h2>
        
        <form onSubmit={isEditing ? handleUpdateAchievement : handleAddAchievement} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Başlık
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 text-gray-800"
                placeholder="Başarı başlığı"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 text-gray-800"
              >
                <option value="">Kategori Seçin</option>
                {categoryOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Tarih
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 text-gray-800"
              />
            </div>
            
            <div>
              <label htmlFor="fallbackColor" className="block text-sm font-medium text-gray-700 mb-1">
                Arkaplan Rengi
              </label>
              <select
                id="fallbackColor"
                name="fallbackColor"
                value={formData.fallbackColor}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 text-gray-800"
              >
                {colorOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <div className={`mt-2 h-8 w-full rounded-md ${formData.fallbackColor}`}></div>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 text-gray-800"
              placeholder="Başarı açıklaması"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="achievementImage" className="block text-sm font-medium text-gray-700 mb-1">
              Görsel
            </label>
            <input
              type="file"
              id="achievementImage"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
            />
            <p className="text-xs text-gray-500 mt-1">
              {isEditing ? 'Yeni bir görsel yüklemezseniz mevcut görsel korunacaktır.' : 'Başarıyı temsil eden bir görsel yükleyin.'}
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                İptal
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Yükleniyor...
                </span>
              ) : isEditing ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Başarılar Listesi */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-black">Başarılar Listesi</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Tüm başarıların listesi</p>
        </div>
        
        {loading && achievements.length === 0 ? (
          <div className="p-6 text-center">
            <svg className="animate-spin mx-auto h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-500">Başarılar yükleniyor...</p>
          </div>
        ) : achievements.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Henüz başarı eklenmemiş.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Başlık
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Açıklama
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {achievements.map((achievement) => (
                  <tr key={achievement.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(achievement.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{achievement.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-burgundy-100 text-burgundy-800">
                        {achievement.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">{achievement.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => handleEditAchievement(achievement)}
                      >
                        Düzenle
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteAchievement(achievement.id)}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 