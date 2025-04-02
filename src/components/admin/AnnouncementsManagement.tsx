'use client';

import React, { useState, useEffect } from 'react';
import { 
  getCollection, 
  addDocument, 
  updateDocument, 
  deleteDocument 
} from '@/firebase/firebaseServices';

// Duyuru tipi
interface Announcement {
  id: string;
  title: string;
  content: string;
  link?: string;
  createdAt: any;
}

interface AnnouncementsManagementProps {
  isActive: boolean;
}

export default function AnnouncementsManagement({ isActive }: AnnouncementsManagementProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link: ''
  });

  // Duyuruları getir
  useEffect(() => {
    if (isActive) {
      fetchAnnouncements();
    }
  }, [isActive]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getCollection('announcements');
      // Tarihe göre sırala (en yeni en üstte)
      const sortedData = [...data].sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      setAnnouncements(sortedData as Announcement[]);
    } catch (error) {
      console.error('Duyurular getirilirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Form değişikliklerini işle
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Duyuru ekle
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form gönderildi, formData:', formData);
    
    try {
      setLoading(true);
      
      const newAnnouncement = {
        title: formData.title,
        content: formData.content,
        link: formData.link || '',
        createdAt: new Date()
      };
      
      console.log('Eklenecek duyuru:', newAnnouncement);
      
      const result = await addDocument('announcements', newAnnouncement);
      console.log('Duyuru eklendi, sonuç:', result);
      
      // Formu sıfırla
      resetForm();
      
      // Duyuruları yeniden getir
      fetchAnnouncements();
      
      // Başarı mesajı
      alert('Duyuru başarıyla eklendi.');
      
    } catch (error) {
      console.error('Duyuru eklenirken hata oluştu:', error);
      alert(`Duyuru eklenirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  // Duyuru güncelle
  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAnnouncement) return;
    
    try {
      setLoading(true);
      
      const updatedAnnouncement = {
        title: formData.title,
        content: formData.content,
        link: formData.link || '',
        // Oluşturma tarihini koruyoruz, güncelleme tarihi eklenebilir
        updatedAt: new Date()
      };
      
      await updateDocument('announcements', selectedAnnouncement, updatedAnnouncement);
      
      // Formu sıfırla
      resetForm();
      
      // Duyuruları yeniden getir
      fetchAnnouncements();
      
      // Başarı mesajı
      alert('Duyuru başarıyla güncellendi.');
      
    } catch (error) {
      console.error('Duyuru güncellenirken hata oluştu:', error);
      alert(`Duyuru güncellenirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
      setIsEditing(false);
      setSelectedAnnouncement(null);
    }
  };

  // Duyuru sil
  const handleDeleteAnnouncement = async (id: string) => {
    if (window.confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) {
      try {
        setLoading(true);
        await deleteDocument('announcements', id);
        fetchAnnouncements();
        alert('Duyuru başarıyla silindi.');
      } catch (error) {
        console.error('Duyuru silinirken hata oluştu:', error);
        alert(`Duyuru silinirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Düzenleme için duyuruyu yükle
  const handleEditAnnouncement = (announcement: Announcement) => {
    setIsEditing(true);
    setSelectedAnnouncement(announcement.id);
    
    setFormData({
      title: announcement.title,
      content: announcement.content,
      link: announcement.link || ''
    });
  };

  // Formu sıfırla
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      link: ''
    });
    setIsEditing(false);
    setSelectedAnnouncement(null);
  };

  // Tarih formatı için yardımcı fonksiyon
  const formatDate = (date: any) => {
    if (!date) return '';
    
    const dateObj = date?.toDate?.() || new Date(date);
    return dateObj.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isActive) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-black mb-6">Duyurular Yönetimi</h1>
      
      {/* Duyuru Ekleme/Düzenleme Formu */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-black mb-4">
          {isEditing ? 'Duyuru Düzenle' : 'Yeni Duyuru Ekle'}
        </h2>
        
        <form onSubmit={isEditing ? handleUpdateAnnouncement : handleAddAnnouncement} className="space-y-4">
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
              placeholder="Duyuru başlığı"
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              İçerik
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 text-gray-800"
              placeholder="Duyuru içeriği"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
              Bağlantı (Opsiyonel)
            </label>
            <input
              type="url"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 text-gray-800"
              placeholder="https://example.com"
            />
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
      
      {/* Duyurular Listesi */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-black">Duyurular Listesi</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Tüm duyuruların listesi</p>
        </div>
        
        {loading && announcements.length === 0 ? (
          <div className="p-6 text-center">
            <svg className="animate-spin mx-auto h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-500">Duyurular yükleniyor...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Henüz duyuru eklenmemiş.</p>
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
                    İçerik
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {announcements.map((announcement) => (
                  <tr key={announcement.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(announcement.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{announcement.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">{announcement.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => handleEditAnnouncement(announcement)}
                      >
                        Düzenle
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
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