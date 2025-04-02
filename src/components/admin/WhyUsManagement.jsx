'use client';

import { useState, useEffect } from 'react';
import { 
  getCollection, 
  addDocument, 
  updateDocument, 
  uploadFile, 
  deleteFile 
} from '@/firebase/firebaseServices';

export default function WhyUsManagement({ isActive }) {
  const [whyUsData, setWhyUsData] = useState(null);
  const [formData, setFormData] = useState({
    title: 'Neden Biz?',
    description: 'Adil Dursun Okulları olarak öğrencilerimize sunduğumuz avantajlar ve değerlerimiz.',
    items: [
      { id: 1, title: 'Kaliteli Eğitim', description: 'Deneyimli öğretmen kadromuz ile kaliteli eğitim sunuyoruz.' },
      { id: 2, title: 'Modern Tesisler', description: 'Modern ve teknolojik altyapıya sahip tesislerimiz ile eğitim veriyoruz.' },
      { id: 3, title: 'Bireysel Gelişim', description: 'Her öğrencimizin bireysel gelişimine önem veriyoruz.' },
      { id: 4, title: 'Sosyal Aktiviteler', description: 'Zengin sosyal aktiviteler ile öğrencilerimizin gelişimini destekliyoruz.' }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (isActive) {
      fetchWhyUsData();
    }
  }, [isActive]);

  const fetchWhyUsData = async () => {
    try {
      setLoading(true);
      const whyUsCollection = await getCollection('whyUs');
      
      if (whyUsCollection && whyUsCollection.length > 0) {
        const data = whyUsCollection[0];
        console.log('WhyUsManagement - Veritabanından veri alındı:', data);
        setWhyUsData(data);
        setFormData({
          title: data.title || 'Neden Biz?',
          description: data.description || 'Adil Dursun Okulları olarak öğrencilerimize sunduğumuz avantajlar ve değerlerimiz.',
          items: data.items || [
            { id: 1, title: 'Kaliteli Eğitim', description: 'Deneyimli öğretmen kadromuz ile kaliteli eğitim sunuyoruz.' },
            { id: 2, title: 'Modern Tesisler', description: 'Modern ve teknolojik altyapıya sahip tesislerimiz ile eğitim veriyoruz.' },
            { id: 3, title: 'Bireysel Gelişim', description: 'Her öğrencimizin bireysel gelişimine önem veriyoruz.' },
            { id: 4, title: 'Sosyal Aktiviteler', description: 'Zengin sosyal aktiviteler ile öğrencilerimizin gelişimini destekliyoruz.' }
          ]
        });
      }
    } catch (error) {
      console.error('WhyUsManagement - Veri yüklenirken hata oluştu:', error);
      setMessage({ text: 'Veriler yüklenirken bir hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleAddItem = () => {
    const newId = formData.items.length > 0 
      ? Math.max(...formData.items.map(item => item.id)) + 1 
      : 1;
    
    const newItem = { 
      id: newId, 
      title: 'Yeni Özellik', 
      description: 'Bu özelliğin açıklaması.' 
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleRemoveItem = (id) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const saveWhyUsData = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const updatedData = {
        ...formData,
        updatedAt: new Date()
      };
      
      if (whyUsData) {
        // Mevcut veriyi güncelle
        await updateDocument('whyUs', whyUsData.id, updatedData);
        console.log('WhyUsManagement - Veri güncellendi');
      } else {
        // Yeni veri oluştur
        await addDocument('whyUs', {
          ...updatedData,
          createdAt: new Date()
        });
        console.log('WhyUsManagement - Yeni veri oluşturuldu');
      }

      // Verileri yeniden yükle
      fetchWhyUsData();
      
      // Başarı mesajı göster
      setMessage({ 
        text: '"Neden Biz?" bölümü başarıyla güncellendi.', 
        type: 'success' 
      });
    } catch (error) {
      console.error('WhyUsManagement - Veri kaydedilirken hata oluştu:', error);
      setMessage({ text: 'Veriler kaydedilirken bir hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isActive) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">"Neden Biz?" Bölümü Yönetimi</h2>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={saveWhyUsData}>
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Başlık
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Özellikler
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Özellik Ekle
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={item.id} className="p-4 border border-gray-300 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-800">Özellik {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Kaldır
                    </button>
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Başlık
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Açıklama
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 text-white font-medium rounded-md ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
} 