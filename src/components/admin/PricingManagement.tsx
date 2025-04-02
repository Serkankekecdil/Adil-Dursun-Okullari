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

// Fiyat bilgisi tipi
interface PriceInfo {
  id: string;
  category: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  discounts?: string[];
  order: number;
}

interface PricingManagementProps {
  isActive: boolean;
}

export default function PricingManagement({ isActive }: PricingManagementProps) {
  const [priceInfo, setPriceInfo] = useState<PriceInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    price: '',
    description: '',
    features: '',
    discounts: '',
    order: 0
  });

  // Fiyat bilgilerini getir
  useEffect(() => {
    if (isActive) {
      fetchPriceInfo();
    }
  }, [isActive]);

  const fetchPriceInfo = async () => {
    try {
      setLoading(true);
      const data = await getCollection('pricing');
      // Sıralama yapalım
      const sortedData = [...data].sort((a, b) => a.order - b.order);
      setPriceInfo(sortedData as PriceInfo[]);
    } catch (error) {
      console.error('Fiyat bilgileri getirilirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Form değişikliklerini işle
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'order') {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Fiyat bilgisi ekle
  const handleAddPriceInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form gönderildi, formData:', formData);
    
    try {
      setLoading(true);
      
      // Özellikleri ve indirimleri diziye dönüştür
      const featuresArray = formData.features.split('\n').filter(item => item.trim() !== '');
      const discountsArray = formData.discounts ? formData.discounts.split('\n').filter(item => item.trim() !== '') : [];
      
      const newPriceInfo = {
        category: formData.category,
        title: formData.title,
        price: formData.price,
        description: formData.description,
        features: featuresArray,
        discounts: discountsArray.length > 0 ? discountsArray : [],
        order: formData.order
      };
      
      console.log('Eklenecek fiyat bilgisi:', newPriceInfo);
      
      const result = await addDocument('pricing', newPriceInfo);
      console.log('Fiyat bilgisi eklendi, sonuç:', result);
      
      // Formu sıfırla
      resetForm();
      
      // Verileri yeniden getir
      fetchPriceInfo();
      
      // Başarı mesajı
      alert('Fiyat bilgisi başarıyla eklendi.');
      
    } catch (error) {
      console.error('Fiyat bilgisi eklenirken hata oluştu:', error);
      alert(`Fiyat bilgisi eklenirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  // Fiyat bilgisi güncelle
  const handleUpdatePriceInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem) return;
    
    try {
      setLoading(true);
      
      // Özellikleri ve indirimleri diziye dönüştür
      const featuresArray = formData.features.split('\n').filter(item => item.trim() !== '');
      const discountsArray = formData.discounts ? formData.discounts.split('\n').filter(item => item.trim() !== '') : [];
      
      const updatedPriceInfo = {
        category: formData.category,
        title: formData.title,
        price: formData.price,
        description: formData.description,
        features: featuresArray,
        discounts: discountsArray.length > 0 ? discountsArray : [],
        order: formData.order
      };
      
      await updateDocument('pricing', selectedItem, updatedPriceInfo);
      
      // Formu sıfırla
      resetForm();
      
      // Verileri yeniden getir
      fetchPriceInfo();
      
      // Başarı mesajı
      alert('Fiyat bilgisi başarıyla güncellendi.');
      
    } catch (error) {
      console.error('Fiyat bilgisi güncellenirken hata oluştu:', error);
      alert(`Fiyat bilgisi güncellenirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
      setIsEditing(false);
      setSelectedItem(null);
    }
  };

  // Fiyat bilgisi sil
  const handleDeletePriceInfo = async (id: string) => {
    if (window.confirm('Bu fiyat bilgisini silmek istediğinizden emin misiniz?')) {
      try {
        setLoading(true);
        await deleteDocument('pricing', id);
        fetchPriceInfo();
        alert('Fiyat bilgisi başarıyla silindi.');
      } catch (error) {
        console.error('Fiyat bilgisi silinirken hata oluştu:', error);
        alert(`Fiyat bilgisi silinirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Düzenleme için fiyat bilgisini yükle
  const handleEditPriceInfo = (item: PriceInfo) => {
    setIsEditing(true);
    setSelectedItem(item.id);
    
    setFormData({
      category: item.category,
      title: item.title,
      price: item.price,
      description: item.description,
      features: item.features.join('\n'),
      discounts: item.discounts ? item.discounts.join('\n') : '',
      order: item.order
    });
  };

  // Formu sıfırla
  const resetForm = () => {
    setFormData({
      category: '',
      title: '',
      price: '',
      description: '',
      features: '',
      discounts: '',
      order: 0
    });
    setIsEditing(false);
    setSelectedItem(null);
  };

  if (!isActive) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-black mb-6">Fiyat Bilgileri Yönetimi</h1>
      
      {/* Fiyat Bilgisi Ekleme/Düzenleme Formu */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-black mb-4">
          {isEditing ? 'Fiyat Bilgisi Düzenle' : 'Yeni Fiyat Bilgisi Ekle'}
        </h2>
        
        <form onSubmit={isEditing ? handleUpdatePriceInfo : handleAddPriceInfo} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Kategori</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
              >
                <option value="">Kategori Seçin</option>
                <option value="anaokulu">Anaokulu</option>
                <option value="ilkokul">İlkokul</option>
                <option value="ortaokul">Ortaokul</option>
                <option value="lise">Lise</option>
                <option value="servis">Servis</option>
                <option value="yemek">Yemek</option>
                <option value="diger">Diğer</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Başlık</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
              />
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Fiyat</label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                placeholder="Örn: 45.000 ₺"
              />
            </div>
            
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700">Sıralama</label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                required
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Açıklama</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
              placeholder="Örn: 2023-2024 Eğitim Yılı için geçerli ücret"
            />
          </div>
          
          <div>
            <label htmlFor="features" className="block text-sm font-medium text-gray-700">Özellikler (Her satıra bir özellik)</label>
            <textarea
              id="features"
              name="features"
              value={formData.features}
              onChange={handleInputChange}
              required
              rows={5}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
              placeholder="Tam gün eğitim (08:30-16:30)&#10;Öğle yemeği dahil&#10;Eğitim materyalleri dahil"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="discounts" className="block text-sm font-medium text-gray-700">İndirimler (Her satıra bir indirim, opsiyonel)</label>
            <textarea
              id="discounts"
              name="discounts"
              value={formData.discounts}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
              placeholder="Peşin ödemelerde %10 indirim&#10;Kardeş indirimi %15&#10;Erken kayıt indirimi %5"
            ></textarea>
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
      
      {/* Fiyat Bilgileri Listesi */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-black">Fiyat Bilgileri Listesi</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Tüm fiyat bilgilerinin listesi</p>
        </div>
        
        {loading && priceInfo.length === 0 ? (
          <div className="p-6 text-center">
            <svg className="animate-spin mx-auto h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-500">Fiyat bilgileri yükleniyor...</p>
          </div>
        ) : priceInfo.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Henüz fiyat bilgisi eklenmemiş.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Başlık
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sıralama
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {priceInfo.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.category === 'anaokulu' && 'Anaokulu'}
                        {item.category === 'ilkokul' && 'İlkokul'}
                        {item.category === 'ortaokul' && 'Ortaokul'}
                        {item.category === 'lise' && 'Lise'}
                        {item.category === 'servis' && 'Servis'}
                        {item.category === 'yemek' && 'Yemek'}
                        {item.category === 'diger' && 'Diğer'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.order}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => handleEditPriceInfo(item)}
                      >
                        Düzenle
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeletePriceInfo(item.id)}
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