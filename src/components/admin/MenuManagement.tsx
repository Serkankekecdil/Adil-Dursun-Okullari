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

// Menü öğesi için tip tanımlaması
interface MenuItem {
  id: string;
  title: string;
  date: string;
  image: string;
  imagePublicId?: string;
  pdf: string;
  pdfPublicId?: string;
  fallbackColor: string;
  createdAt: any;
}

export default function MenuManagement({ isActive }: { isActive: boolean }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
  });

  // Renk seçenekleri
  const colorOptions = [
    { id: 'bg-burgundy-50', name: 'Bordo Açık', class: 'bg-burgundy-50' },
    { id: 'bg-burgundy-100', name: 'Bordo Orta', class: 'bg-burgundy-100' },
    { id: 'bg-burgundy-200', name: 'Bordo Koyu', class: 'bg-burgundy-200' },
    { id: 'bg-blue-50', name: 'Mavi Açık', class: 'bg-blue-50' },
    { id: 'bg-blue-100', name: 'Mavi Orta', class: 'bg-blue-100' },
    { id: 'bg-green-50', name: 'Yeşil Açık', class: 'bg-green-50' },
    { id: 'bg-green-100', name: 'Yeşil Orta', class: 'bg-green-100' },
    { id: 'bg-yellow-50', name: 'Sarı Açık', class: 'bg-yellow-50' },
    { id: 'bg-yellow-100', name: 'Sarı Orta', class: 'bg-yellow-100' },
    { id: 'bg-gray-50', name: 'Gri Açık', class: 'bg-gray-50' },
    { id: 'bg-gray-100', name: 'Gri Orta', class: 'bg-gray-100' }
  ];

  // Yemek listelerini getir
  useEffect(() => {
    if (isActive) {
      fetchMenuItems();
    }
  }, [isActive]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const menus = await getCollection('menus');
      
      if (menus && menus.length > 0) {
        // Tarihe göre sırala (en yeni en üstte)
        const sortedMenus = menus.sort((a: any, b: any) => {
          return new Date(b.createdAt?.toDate() || b.createdAt || 0).getTime() - 
                 new Date(a.createdAt?.toDate() || a.createdAt || 0).getTime();
        });
        
        setMenuItems(sortedMenus as MenuItem[]);
      } else {
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Yemek listeleri getirilirken hata oluştu:', error);
      setMessage({ text: 'Yemek listeleri getirilirken bir hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleEditClick = (menuId: string) => {
    const menuToEdit = menuItems.find(menu => menu.id === menuId);
    if (menuToEdit) {
      setFormData({
        title: menuToEdit.title,
        date: menuToEdit.date,
      });
      setSelectedMenu(menuId);
      setIsEditing(true);
    }
  };

  const handleDeleteClick = async (menuId: string) => {
    if (window.confirm('Bu yemek listesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        setLoading(true);
        
        // Menü öğesini bul
        const menuToDelete = menuItems.find(menu => menu.id === menuId);
        
        if (menuToDelete) {
          // Görsel ve PDF dosyalarını sil
          if (menuToDelete.imagePublicId) {
            await deleteFile(menuToDelete.imagePublicId);
          }
          
          if (menuToDelete.pdfPublicId) {
            await deleteFile(menuToDelete.pdfPublicId);
          }
          
          // Menü belgesini sil
          await deleteDocument('menus', menuId);
          
          // Listeyi güncelle
          setMenuItems(menuItems.filter(menu => menu.id !== menuId));
          setMessage({ text: 'Yemek listesi başarıyla silindi.', type: 'success' });
        }
      } catch (error) {
        console.error('Yemek listesi silinirken hata oluştu:', error);
        setMessage({ text: 'Yemek listesi silinirken bir hata oluştu.', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      let imageUrl = '';
      let imagePublicId = '';
      let pdfUrl = '';
      let pdfPublicId = '';

      // Eğer düzenleme modundaysa ve bir menü seçiliyse
      if (isEditing && selectedMenu) {
        const menuToEdit = menuItems.find(menu => menu.id === selectedMenu);
        
        if (menuToEdit) {
          imageUrl = menuToEdit.image || '';
          imagePublicId = menuToEdit.imagePublicId || '';
          pdfUrl = menuToEdit.pdf || '';
          pdfPublicId = menuToEdit.pdfPublicId || '';
        }
      }

      // Görsel yükleme
      if (imageFile) {
        // Eski görseli sil
        if (imagePublicId) {
          await deleteFile(imagePublicId);
        }
        
        // Yeni görseli yükle
        const imageResult = await uploadFile(`menus/images/${Date.now()}_${imageFile.name}`, imageFile);
        imageUrl = imageResult.downloadURL;
        imagePublicId = imageResult.publicId;
      }

      // PDF yükleme
      if (pdfFile) {
        // Eski PDF'i sil
        if (pdfPublicId) {
          await deleteFile(pdfPublicId);
        }
        
        // Yeni PDF'i yükle
        const pdfResult = await uploadFile(`menus/pdfs/${Date.now()}_${pdfFile.name}`, pdfFile);
        pdfUrl = pdfResult.downloadURL;
        pdfPublicId = pdfResult.publicId;
      }

      // Menü verisi oluştur
      const menuData = {
        title: formData.title,
        date: formData.date,
        image: imageUrl,
        imagePublicId: imagePublicId,
        pdf: pdfUrl,
        pdfPublicId: pdfPublicId,
        fallbackColor: 'bg-burgundy-50', // Varsayılan değer
        createdAt: new Date()
      };

      if (isEditing && selectedMenu) {
        // Mevcut menüyü güncelle
        await updateDocument('menus', selectedMenu, menuData);
        setMessage({ text: 'Yemek listesi başarıyla güncellendi.', type: 'success' });
      } else {
        // Yeni menü oluştur
        await addDocument('menus', menuData);
        setMessage({ text: 'Yemek listesi başarıyla oluşturuldu.', type: 'success' });
      }

      // Formu sıfırla
      setFormData({
        title: '',
        date: '',
      });
      setImageFile(null);
      setPdfFile(null);
      setIsEditing(false);
      setSelectedMenu(null);

      // Dosya seçimini temizle
      const imageInput = document.getElementById('menuImage') as HTMLInputElement;
      const pdfInput = document.getElementById('menuPdf') as HTMLInputElement;
      if (imageInput) imageInput.value = '';
      if (pdfInput) pdfInput.value = '';

      // Menü listesini yenile
      fetchMenuItems();
    } catch (error) {
      console.error('Yemek listesi kaydedilirken hata oluştu:', error);
      setMessage({ text: 'Yemek listesi kaydedilirken bir hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      title: '',
      date: '',
    });
    setImageFile(null);
    setPdfFile(null);
    setIsEditing(false);
    setSelectedMenu(null);

    // Dosya seçimini temizle
    const imageInput = document.getElementById('menuImage') as HTMLInputElement;
    const pdfInput = document.getElementById('menuPdf') as HTMLInputElement;
    if (imageInput) imageInput.value = '';
    if (pdfInput) pdfInput.value = '';
  };

  if (!isActive) return null;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold text-black mb-6">Yemek Listeleri Yönetimi</h1>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Yemek Listesi Düzenle' : 'Yeni Yemek Listesi Ekle'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 text-gray-800"
                  required
                  placeholder="Örn: Nisan 2024 - 1. Hafta Yemek Listesi"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tarih
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 text-gray-800"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="menuImage" className="block text-sm font-medium text-gray-700 mb-1">
                  Yemek Listesi Görseli
                </label>
                <input
                  type="file"
                  id="menuImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isEditing ? 'Yeni bir görsel yüklemezseniz mevcut görsel korunacaktır.' : 'Yemek listesinin görsel halini yükleyin.'}
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="menuPdf" className="block text-sm font-medium text-gray-700 mb-1">
                  Yemek Listesi PDF
                </label>
                <input
                  type="file"
                  id="menuPdf"
                  accept="application/pdf"
                  onChange={handlePdfChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isEditing ? 'Yeni bir PDF yüklemezseniz mevcut PDF korunacaktır.' : 'Yemek listesinin PDF halini yükleyin.'}
                </p>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 bg-burgundy-600 text-white rounded-md hover:bg-burgundy-700 focus:outline-none focus:ring-2 focus:ring-burgundy-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'İşleniyor...' : isEditing ? 'Güncelle' : 'Kaydet'}
                </button>
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    İptal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        
        {/* Yemek Listeleri */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Mevcut Yemek Listeleri</h2>
          
          {loading && menuItems.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-burgundy-600"></div>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-600">Henüz yemek listesi eklenmemiş.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map(menu => (
                <div key={menu.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                  <div className={`relative h-40 ${menu.fallbackColor}`}>
                    {menu.image ? (
                      <img 
                        src={menu.image} 
                        alt={menu.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-burgundy-800 text-xl font-bold opacity-50">{menu.title}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1">{menu.title}</h3>
                    <p className="text-burgundy-600 text-sm mb-4">{menu.date}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {menu.pdf && (
                        <a 
                          href={menu.pdf} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          PDF Görüntüle
                        </a>
                      )}
                      
                      <button
                        onClick={() => handleEditClick(menu.id)}
                        className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Düzenle
                      </button>
                      
                      <button
                        onClick={() => handleDeleteClick(menu.id)}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 