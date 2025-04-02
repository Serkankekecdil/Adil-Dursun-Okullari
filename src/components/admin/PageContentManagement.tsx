'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  getCollection, 
  getDocument, 
  addDocument, 
  updateDocument, 
  uploadFile, 
  deleteFile 
} from '@/firebase/firebaseServices';

// Sayfa içeriği için arayüz
interface PageContent {
  id: string;
  pageId: string;
  sections: {
    [key: string]: {
      title: string;
      content: string;
      image?: string;
      imagePublicId?: string;
      buttonText?: string;
      buttonUrl?: string;
    }
  };
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  lastUpdated: any;
}

interface PageContentManagementProps {
  isActive: boolean;
  initialPage?: string;
}

// Değerler kartı için özel düzenleme arayüzü
const ValuesCardEditor = ({ 
  values, 
  onChange 
}: { 
  values: Array<{title: string, description: string, icon: string}>, 
  onChange: (newValues: Array<{title: string, description: string, icon: string}>) => void 
}) => {
  const handleValueChange = (index: number, field: string, value: string) => {
    const newValues = [...values];
    newValues[index] = { ...newValues[index], [field]: value };
    onChange(newValues);
  };

  const addValue = () => {
    onChange([...values, { title: 'Yeni Değer', description: 'Açıklama', icon: 'graduation-cap' }]);
  };

  const removeValue = (index: number) => {
    const newValues = [...values];
    newValues.splice(index, 1);
    onChange(newValues);
  };

  const iconOptions = [
    'graduation-cap', 'book', 'users', 'lightbulb', 'heart', 'star', 
    'trophy', 'certificate', 'globe', 'pencil', 'bullseye', 'handshake',
    'school', 'university', 'child', 'chalkboard-teacher', 'apple-alt',
    'atom', 'brain', 'microscope', 'flask', 'calculator', 'music',
    'palette', 'theater-masks', 'basketball-ball', 'futbol', 'medal'
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Değerlerimiz Kartları</h3>
        <button
          type="button"
          onClick={addValue}
          className="px-3 py-1 bg-burgundy-600 hover:bg-burgundy-700 text-white rounded text-sm"
        >
          Yeni Değer Ekle
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {values.map((value, index) => (
          <div key={index} className="border rounded-md p-4 bg-white shadow-sm relative">
            <button
              type="button"
              onClick={() => removeValue(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              title="Sil"
            >
              ✕
            </button>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
              <input
                type="text"
                value={value.title}
                onChange={(e) => handleValueChange(index, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-md text-gray-900 bg-white font-medium"
                style={{ fontSize: '16px' }}
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea
                value={value.description}
                onChange={(e) => handleValueChange(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-md text-gray-900 bg-white font-medium h-24"
                style={{ fontSize: '16px' }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İkon</label>
              <div className="mb-2">
                <select
                  value={value.icon}
                  onChange={(e) => handleValueChange(index, 'icon', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-400 rounded-md text-gray-900 bg-white font-medium"
                  style={{ fontSize: '16px' }}
                >
                  {iconOptions.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-6 gap-2 mt-2 p-2 border border-gray-200 rounded-md bg-gray-50">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => handleValueChange(index, 'icon', icon)}
                    className={`p-2 rounded-md flex items-center justify-center ${value.icon === icon ? 'bg-burgundy-100 border-2 border-burgundy-500' : 'bg-white border border-gray-200 hover:bg-gray-100'}`}
                    title={icon}
                  >
                    <i className={`fas fa-${icon} ${value.icon === icon ? 'text-burgundy-700' : 'text-gray-700'}`}></i>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-4 border rounded-md bg-gray-50">
        <h4 className="font-medium mb-2 text-black">Önizleme</h4>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
          {values.map((value, index) => (
            <div key={index} className="mb-3 pb-3 border-b border-gray-200 last:border-0">
              <h5 className="font-medium text-black">{value.title}</h5>
              <p className="text-sm text-black">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Yönetim ekibi kartı için özel düzenleme arayüzü
const TeamCardEditor = ({ 
  team, 
  onChange 
}: { 
  team: Array<{name: string, title: string, description: string, image: string, initials: string}>, 
  onChange: (newTeam: Array<{name: string, title: string, description: string, image: string, initials: string}>) => void 
}) => {
  const handleTeamMemberChange = (index: number, field: string, value: string) => {
    const newTeam = [...team];
    newTeam[index] = { ...newTeam[index], [field]: value };
    
    // İsim değiştiğinde baş harfleri otomatik güncelle
    if (field === 'name') {
      const nameParts = value.split(' ');
      let initials = '';
      
      // İsmin her kelimesinin baş harfini al
      nameParts.forEach(part => {
        if (part.length > 0) {
          initials += part[0].toUpperCase();
        }
      });
      
      newTeam[index].initials = initials;
    }
    
    onChange(newTeam);
  };

  const addTeamMember = () => {
    onChange([...team, { 
      name: 'Yeni Üye', 
      title: 'Pozisyon', 
      description: 'Açıklama', 
      image: '', 
      initials: 'YÜ' 
    }]);
  };

  const removeTeamMember = (index: number) => {
    const newTeam = [...team];
    newTeam.splice(index, 1);
    onChange(newTeam);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Yönetim Ekibi Üyeleri</h3>
        <button
          type="button"
          onClick={addTeamMember}
          className="px-3 py-1 bg-burgundy-600 hover:bg-burgundy-700 text-white rounded text-sm"
        >
          Yeni Üye Ekle
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {team.map((member, index) => (
          <div key={index} className="border rounded-md p-4 bg-white shadow-sm relative">
            <button
              type="button"
              onClick={() => removeTeamMember(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              title="Sil"
            >
              ✕
            </button>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">İsim</label>
              <input
                type="text"
                value={member.name}
                onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pozisyon</label>
              <input
                type="text"
                value={member.title}
                onChange={(e) => handleTeamMemberChange(index, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea
                value={member.description}
                onChange={(e) => handleTeamMemberChange(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black h-24"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Baş Harfler (Otomatik)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={member.initials}
                  onChange={(e) => handleTeamMemberChange(index, 'initials', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  maxLength={4}
                />
                <div className="w-12 h-12 flex items-center justify-center bg-burgundy-50 rounded-md">
                  <span className="text-burgundy-800 text-xl font-bold">{member.initials}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">İsim değiştiğinde otomatik olarak güncellenir, manuel olarak da değiştirebilirsiniz.</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-4 border rounded-md bg-gray-50">
        <h4 className="font-medium mb-2 text-black">Önizleme</h4>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
          {team.map((member, index) => (
            <div key={index} className="mb-3 pb-3 border-b border-gray-200 last:border-0">
              <h5 className="font-medium text-black">{member.name}</h5>
              <p className="text-sm text-black">{member.title}</p>
              <p className="text-xs text-black mt-1">{member.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Eğitim yaklaşımı kartları için özel düzenleme arayüzü
const ApproachCardEditor = ({ 
  cards, 
  onChange 
}: { 
  cards: Array<{title: string, description: string, icon: string}>, 
  onChange: (newCards: Array<{title: string, description: string, icon: string}>) => void 
}) => {
  const iconOptions = [
    'lightbulb', 'users', 'building', 'graduation-cap', 'book', 'chart-line', 
    'brain', 'chalkboard-teacher', 'school', 'atom', 'microscope', 'flask',
    'laptop-code', 'palette', 'music', 'theater-masks', 'basketball-ball', 'running'
  ];

  const handleCardChange = (index: number, field: string, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    onChange(newCards);
  };

  const addCard = () => {
    onChange([...cards, { title: 'Yeni Başlık', description: 'Açıklama metni', icon: 'lightbulb' }]);
  };

  const removeCard = (index: number) => {
    const newCards = [...cards];
    newCards.splice(index, 1);
    onChange(newCards);
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h4 className="font-medium text-gray-800">Eğitim Yaklaşımı Kartları</h4>
        <button
          type="button"
          onClick={addCard}
          className="px-3 py-1 bg-burgundy-600 hover:bg-burgundy-700 text-white rounded-md text-sm"
        >
          Kart Ekle
        </button>
      </div>
      
      <div className="space-y-6 mb-6">
        {cards.map((card, index) => (
          <div key={index} className="p-4 border border-gray-300 rounded-md bg-white relative">
            <button
              type="button"
              onClick={() => removeCard(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              title="Kartı Sil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
              <input
                type="text"
                value={card.title}
                onChange={(e) => handleCardChange(index, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea
                value={card.description}
                onChange={(e) => handleCardChange(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black h-24"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İkon</label>
              <div className="mb-2">
                <select
                  value={card.icon}
                  onChange={(e) => handleCardChange(index, 'icon', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                >
                  {iconOptions.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-6 gap-2 mt-2 p-2 border border-gray-200 rounded-md bg-gray-50">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => handleCardChange(index, 'icon', icon)}
                    className={`p-2 rounded-md flex items-center justify-center ${card.icon === icon ? 'bg-burgundy-100 border-2 border-burgundy-500' : 'bg-white border border-gray-200 hover:bg-gray-100'}`}
                    title={icon}
                  >
                    <i className={`fas fa-${icon} ${card.icon === icon ? 'text-burgundy-700' : 'text-gray-700'}`}></i>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-4 border rounded-md bg-gray-50">
        <h4 className="font-medium mb-2 text-black">Önizleme</h4>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
          <ul className="list-disc pl-5 space-y-1">
            {cards.map((card, index) => (
              <li key={index} className="text-black">{card.title}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Beslenme Önerileri Düzenleyici
const NutritionItemsEditor = ({ 
  items, 
  onChange 
}: { 
  items: string[], 
  onChange: (newItems: string[]) => void 
}) => {
  // Yerel state kullanarak maddeleri yönet
  const [localItems, setLocalItems] = useState<string[]>(items || []);

  // Yerel state değiştiğinde parent'a bildir
  useEffect(() => {
    onChange(localItems);
  }, [localItems, onChange]);

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...localItems];
    newItems[index] = value;
    setLocalItems(newItems);
  };

  const addItem = () => {
    console.log('Yeni madde ekleniyor', [...localItems, '']);
    setLocalItems([...localItems, '']);
  };

  const removeItem = (index: number) => {
    const newItems = [...localItems];
    newItems.splice(index, 1);
    setLocalItems(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Sağlıklı Beslenme Önerileri</h3>
        <button 
          type="button"
          onClick={addItem}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Madde Ekle
        </button>
      </div>
      
      {localItems && localItems.length > 0 ? (
        localItems.map((item, index) => (
          <div key={index} className="flex items-start gap-2 mb-3">
            <div className="flex-grow">
              <textarea
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                className="w-full p-2 border border-gray-400 rounded focus:ring-2 focus:ring-burgundy-500 bg-white text-gray-900 font-medium"
                rows={2}
                placeholder="Beslenme önerisi maddesi..."
                style={{ color: '#333', fontSize: '16px' }}
              />
            </div>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              aria-label="Maddeyi sil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))
      ) : (
        <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">Henüz beslenme önerisi eklenmemiş. "Madde Ekle" butonuna tıklayarak yeni öneriler ekleyebilirsiniz.</p>
        </div>
      )}
    </div>
  );
};

// Ödeme Seçenekleri Editörü
const PaymentOptionsEditor = ({ 
  options, 
  onChange 
}: { 
  options: Array<{title: string, description: string, icon: string}>, 
  onChange: (newOptions: Array<{title: string, description: string, icon: string}>) => void 
}) => {
  const handleOptionChange = (index: number, field: string, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onChange(newOptions);
  };

  const addOption = () => {
    onChange([...options, { title: 'Yeni Seçenek', description: 'Açıklama', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' }]);
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    onChange(newOptions);
  };

  // SVG ikon seçenekleri
  const iconOptions = [
    { name: 'Peşin Ödeme', path: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Taksitli Ödeme', path: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { name: 'Burs İmkanları', path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Eğitim', path: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z M12 14l-6.16-3.422a12.083 12.083 0 00-.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 016.824-2.998 12.078 12.078 0 00-.665-6.479L12 14z' },
    { name: 'Takvim', path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((option, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="text-burgundy-600 mb-4 flex justify-center">
              <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={option.icon}></path>
              </svg>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
              <input
                type="text"
                value={option.title}
                onChange={(e) => handleOptionChange(index, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 bg-white text-black"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea
                value={option.description}
                onChange={(e) => handleOptionChange(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 bg-white text-black"
                rows={3}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">İkon</label>
              <select
                value={option.icon}
                onChange={(e) => handleOptionChange(index, 'icon', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 bg-white text-black"
              >
                {iconOptions.map((icon, i) => (
                  <option key={i} value={icon.path}>{icon.name}</option>
                ))}
              </select>
            </div>
            
            <button
              type="button"
              onClick={() => removeOption(index)}
              className="w-full mt-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Seçeneği Sil
            </button>
          </div>
        ))}
      </div>
      
      <button
        type="button"
        onClick={addOption}
        className="bg-burgundy-600 text-white py-2 px-4 rounded-md hover:bg-burgundy-700 focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:ring-offset-2"
      >
        Yeni Ödeme Seçeneği Ekle
      </button>
    </div>
  );
};

// Sık Sorulan Sorular Editörü
const FaqItemsEditor = ({ 
  items, 
  onChange 
}: { 
  items: Array<{question: string, answer: string}>, 
  onChange: (newItems: Array<{question: string, answer: string}>) => void 
}) => {
  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, { question: 'Yeni Soru?', answer: 'Cevap' }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Soru</label>
              <input
                type="text"
                value={item.question}
                onChange={(e) => handleItemChange(index, 'question', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 bg-white text-black"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cevap</label>
              <textarea
                value={item.answer}
                onChange={(e) => handleItemChange(index, 'answer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 bg-white text-black"
                rows={4}
              />
            </div>
            
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="w-full mt-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Soruyu Sil
            </button>
          </div>
        </div>
      ))}
      
      <button
        type="button"
        onClick={addItem}
        className="bg-burgundy-600 text-white py-2 px-4 rounded-md hover:bg-burgundy-700 focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:ring-offset-2"
      >
        Yeni Soru Ekle
      </button>
    </div>
  );
};

export default function PageContentManagement({ isActive, initialPage }: PageContentManagementProps) {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>(initialPage || 'home');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [currentContent, setCurrentContent] = useState<PageContent | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    buttonText: '',
    buttonUrl: '',
    title: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPreview, setShowPreview] = useState(false);
  const [showHtmlHelper, setShowHtmlHelper] = useState(false);
  const [valuesCards, setValuesCards] = useState<Array<{title: string, description: string, icon: string}>>([]);
  const [teamMembers, setTeamMembers] = useState<Array<{name: string, title: string, description: string, image: string, initials: string}>>([]);
  const [approachCards, setApproachCards] = useState<Array<{title: string, description: string, icon: string}>>([]);

  // Textarea referansı ekle
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const contentTextAreaRef = useRef<HTMLTextAreaElement>(null);

  // Sayfa seçenekleri
  const pageOptions = [
    { id: 'home', name: 'Ana Sayfa' },
    { id: 'about', name: 'Hakkımızda' },
    { id: 'teachers', name: 'Öğretmenlerimiz' },
    { id: 'events', name: 'Etkinlikler' },
    { id: 'menu', name: 'Yemek Listesi' },
    { id: 'contact', name: 'İletişim' },
    { id: 'pricing', name: 'Fiyat Bilgileri' }
  ];

  // Sayfa bölümleri tanımları
  const pageSections: Record<string, { id: string, title: string, description: string }[]> = {
    'home': [
      { id: 'hero', title: 'Sayfa Başlık Bölümü', description: 'Ana sayfanın en üstünde yer alan büyük başlık ve alt başlık bölümü' },
      { id: 'contact', title: 'İletişim Bölümü', description: 'Ana sayfadaki iletişim bölümü' }
    ],
    'about': [
      { id: 'hero', title: 'Sayfa Başlık Bölümü', description: 'Hakkımızda sayfasının en üstünde yer alan başlık ve tanıtım bölümü' },
      { id: 'history', title: 'Tarihçemiz', description: 'Okulun kuruluş hikayesi ve gelişim süreci' },
      { id: 'mission', title: 'Misyonumuz', description: 'Okulun misyon ifadesi' },
      { id: 'vision', title: 'Vizyonumuz', description: 'Okulun vizyon ifadesi' },
      { id: 'values', title: 'Değerlerimiz', description: 'Okulun temel değerleri' },
      { id: 'team', title: 'Yönetim Ekibimiz', description: 'Okul yönetim kadrosu' },
      { id: 'cta', title: 'Çağrı Bölümü', description: 'Sayfanın altındaki çağrı bölümü' }
    ],
    'teachers': [
      { id: 'hero', title: 'Sayfa Başlık Bölümü', description: 'Öğretmenlerimiz sayfasının en üstündeki başlık ve tanıtım yazısı' },
      { id: 'intro', title: 'Giriş Metni', description: 'Öğretmenler sayfasının açıklama metni' },
      { id: 'approach', title: 'Eğitim Yaklaşımımız', description: 'Öğretmenlerimizin eğitim yaklaşımı bölümü' },
      { id: 'hiring', title: 'Öğretmen Alımı', description: 'Öğretmen alımı ile ilgili bilgiler bölümü' }
    ],
    'events': [
      { id: 'hero', title: 'Sayfa Başlık Bölümü', description: 'Etkinlikler sayfasının en üstündeki başlık ve tanıtım yazısı' },
      { id: 'intro', title: 'Giriş Metni', description: 'Etkinlikler sayfasının açıklama metni' },
      { id: 'cta', title: 'Etkinliklerimizden Haberdar Olun', description: 'Etkinlikler sayfasının altındaki iletişim çağrısı bölümü' }
    ],
    'menu': [
      { id: 'hero', title: 'Sayfa Başlık Bölümü', description: 'Yemek Listesi sayfasının en üstündeki başlık ve tanıtım yazısı' },
      { id: 'intro', title: 'Giriş Metni', description: 'Yemek listesi sayfasının açıklama metni' },
      { id: 'nutrition', title: 'Sağlıklı Beslenme Önerileri', description: 'Yemek listesi sayfasındaki sağlıklı beslenme önerileri bölümü' }
    ],
    'contact': [
      { id: 'hero', title: 'Sayfa Başlık Bölümü', description: 'İletişim sayfasının en üstündeki başlık ve tanıtım yazısı' },
      { id: 'form', title: 'Form Metni', description: 'İletişim formunun açıklama metni' },
      { id: 'faq', title: 'Sık Sorulan Sorular', description: 'İletişim sayfasındaki sık sorulan sorular bölümü' }
    ],
    'pricing': [
      { id: 'hero', title: 'Sayfa Başlık Bölümü', description: 'Fiyat Bilgileri sayfasının en üstündeki başlık ve tanıtım yazısı' },
      { id: 'intro', title: 'Giriş Metni', description: 'Fiyat bilgileri sayfasının açıklama metni' },
      { id: 'payment', title: 'Ödeme Seçenekleri', description: 'Ödeme seçenekleri bölümünün açıklama metni' },
      { id: 'faq', title: 'Sık Sorulan Sorular', description: 'Fiyatlarla ilgili sık sorulan sorular bölümü' }
    ]
  };

  // HTML yardımcıları
  const htmlHelpers = [
    {
      description: 'Kalın metin',
      tag: '<strong>Kalın metin</strong>',
    },
    {
      description: 'İtalik metin',
      tag: '<em>İtalik metin</em>',
    },
    {
      description: 'Paragraf',
      tag: '<p class="text-black font-medium mb-4">Paragraf metni</p>',
    },
    {
      description: 'Liste',
      tag: '<ul class="space-y-2 list-disc pl-5 mb-4">\n  <li>Liste öğesi 1</li>\n  <li>Liste öğesi 2</li>\n  <li>Liste öğesi 3</li>\n</ul>',
    },
    {
      description: 'Başlık',
      tag: '<h3 class="text-xl font-bold mb-2">Alt Başlık</h3>',
    },
    {
      description: 'Bağlantı',
      tag: '<a href="https://example.com" class="text-burgundy-700 hover:underline" target="_blank">Bağlantı metni</a>',
    },
    {
      description: 'Ödeme Seçenekleri Kartları',
      tag: `[
    {
      "title": "Peşin Ödeme",
      "description": "Peşin ödemelerde %10 indirim uygulanmaktadır.",
      "icon": "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
    },
    {
      "title": "Taksitli Ödeme",
      "description": "9 aya kadar taksit imkanı sunulmaktadır.",
      "icon": "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    },
    {
      "title": "Burs İmkanları",
      "description": "Başarı durumuna göre burs imkanları sunulmaktadır.",
      "icon": "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    }
  ]`,
    },
    {
      description: 'Sık Sorulan Sorular Akordiyon',
      tag: `[
    {
      "question": "Ücretlere neler dahildir?",
      "answer": "Eğitim ücretlerimize öğle yemeği, eğitim materyalleri, etkinlikler ve geziler dahildir. Servis ücretleri ayrıca belirtilmiştir ve mesafeye göre değişiklik göstermektedir."
    },
    {
      "question": "Ödeme planı nasıl oluşturulur?",
      "answer": "Ödeme planı, veli tercihine göre peşin veya taksitli olarak düzenlenebilir. Taksitli ödemelerde 9 aya kadar vade imkanı sunulmaktadır. Detaylı bilgi için kayıt ofisimizle iletişime geçebilirsiniz."
    },
    {
      "question": "İndirim koşulları nelerdir?",
      "answer": "Okulumuzda peşin ödemelerde %10, kardeş kayıtlarında %15 ve erken kayıt döneminde %5 indirim uygulanmaktadır. Ayrıca başarı durumuna göre burs imkanları da sunulmaktadır. İndirimler birleştirilemez, en yüksek indirim oranı uygulanır."
    }
  ]`,
    },
    {
      description: 'Değerlerimiz Kartları',
      tag: `[
    {
      "title": "Değer Başlığı 1",
      "description": "Değer açıklaması burada yer alacak.",
      "icon": "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    },
    {
      "title": "Değer Başlığı 2",
      "description": "Değer açıklaması burada yer alacak.",
      "icon": "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
    }
  ]`,
    },
    {
      description: 'SVG İkonlar',
      tag: `Kalkan: M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z

Belge: M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10

Kişiler: M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z

Ayarlar: M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z

Dünya: M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9

Ekip: M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z`,
    },
  ];

  // initialPage değiştiğinde selectedPage'i güncelle
  useEffect(() => {
    if (initialPage) {
      console.log(`initialPage değişti: ${initialPage}`);
      setSelectedPage(initialPage);
      // Sayfa değiştiğinde seçili bölümü sıfırla
      setSelectedSection('');
    }
  }, [initialPage]);

  useEffect(() => {
    if (isActive) {
      console.log('Bileşen aktif, sayfalar yükleniyor');
      fetchPages();
    }
  }, [isActive]);

  useEffect(() => {
    if (selectedPage) {
      console.log(`Seçili sayfa değişti: ${selectedPage}`);
      fetchPageContent(selectedPage);
    }
  }, [selectedPage]);

  useEffect(() => {
    console.log(`useEffect: selectedSection veya currentContent değişti. selectedSection: ${selectedSection}`);
    if (currentContent && selectedSection) {
      console.log('updateFormDataForSection çağrılıyor');
      updateFormDataForSection();
    }
  }, [selectedSection, currentContent]);

  // formData değiştiğinde konsola yazdır
  useEffect(() => {
    console.log('Form verileri güncellendi:', formData);
  }, [formData]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const pagesData = await getCollection('pageContents');
      setPages(pagesData as PageContent[]);
    } catch (error) {
      console.error('Sayfalar alınırken hata oluştu:', error);
      setMessage({ text: 'Sayfalar alınırken bir hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPageContent = async (pageId: string) => {
    setLoading(true);
    try {
      console.log(`Sayfa içeriği yükleniyor: ${pageId}`);
      
      const pageContentsRef = await getCollection('pageContents');
      const filteredContents = pageContentsRef.filter(doc => doc.pageId === pageId);
      
      console.log(`Bulunan içerikler:`, filteredContents);

      if (filteredContents.length > 0) {
        const pageContent = filteredContents[0];
        console.log(`Sayfa içeriği bulundu:`, pageContent);
        
        // Önce currentContent'i güncelle
        setCurrentContent(pageContent);
        
        // Sayfa içeriği bulundu, meta bilgilerini yükle
        const updatedFormData = {
          content: '',  // Bölüm seçildiğinde güncellenecek
          metaTitle: pageContent.metaTitle || '',
          metaDescription: pageContent.metaDescription || '',
          metaKeywords: pageContent.metaKeywords || '',
          buttonText: '',
          buttonUrl: '',
          title: ''
        };
        
        // Eğer seçili bir bölüm varsa ve bu bölüm sayfa içeriğinde mevcutsa
        if (selectedSection && pageContent.sections && pageContent.sections[selectedSection]) {
          console.log(`Seçili bölüm (${selectedSection}) içeriği bulundu:`, pageContent.sections[selectedSection]);
          updatedFormData.content = pageContent.sections[selectedSection].content || '';
          updatedFormData.buttonText = pageContent.sections[selectedSection].buttonText || '';
          updatedFormData.buttonUrl = pageContent.sections[selectedSection].buttonUrl || '';
          updatedFormData.title = pageContent.sections[selectedSection].title || '';
        } else if (pageContent.sections) {
          // Seçili bölüm yoksa veya geçerli değilse, ilk bölümü seç
          const sectionKeys = Object.keys(pageContent.sections);
          if (sectionKeys.length > 0) {
            const firstSectionKey = sectionKeys[0];
            console.log(`İlk bölüm seçiliyor: ${firstSectionKey}`, pageContent.sections[firstSectionKey]);
            
            // Önce form verilerini güncelle, sonra bölümü seç
            updatedFormData.content = pageContent.sections[firstSectionKey].content || '';
            updatedFormData.buttonText = pageContent.sections[firstSectionKey].buttonText || '';
            updatedFormData.buttonUrl = pageContent.sections[firstSectionKey].buttonUrl || '';
            updatedFormData.title = pageContent.sections[firstSectionKey].title || '';
            
            // Bölümü güncelle (bu useEffect ile updateFormDataForSection'ı tetikleyecek)
            setTimeout(() => {
              setSelectedSection(firstSectionKey);
            }, 0);
          }
        }
        
        // Form verilerini güncelle
        console.log('Form verileri güncelleniyor:', updatedFormData);
        setFormData(updatedFormData);
        
      } else {
        console.log(`Sayfa içeriği bulunamadı: ${pageId}`);
        setCurrentContent(null);
        // Yeni sayfa içeriği oluşturulacak, form verilerini temizle
        setFormData({
          content: '',
          metaTitle: '',
          metaDescription: '',
          metaKeywords: '',
          buttonText: '',
          buttonUrl: '',
          title: ''
        });
      }
    } catch (error) {
      console.error('Sayfa içeriği getirilirken hata oluştu:', error);
      setMessage({ text: 'Sayfa içeriği getirilirken bir hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const updateFormDataForSection = () => {
    console.log(`updateFormDataForSection çağrıldı. Bölüm: ${selectedSection}`);
    console.log('Mevcut içerik:', currentContent);
    
    if (!currentContent || !selectedSection) {
      console.log('Güncellenecek içerik veya bölüm yok');
      return;
    }
    
    if (currentContent.sections && currentContent.sections[selectedSection]) {
      const section = currentContent.sections[selectedSection];
      console.log(`Bölüm içeriği bulundu:`, section);
      
      const updatedFormData = {
        ...formData,
        content: section.content || '',
        buttonText: section.buttonText || '',
        buttonUrl: section.buttonUrl || '',
        title: section.title || '',
        metaTitle: currentContent.metaTitle || '',
        metaDescription: currentContent.metaDescription || '',
        metaKeywords: currentContent.metaKeywords || ''
      };
      
      console.log('Form verileri güncelleniyor:', updatedFormData);
      setFormData(updatedFormData);
    } else {
      console.log(`Bölüm bulunamadı: ${selectedSection}`);
      
      // Eğer bölüm yoksa, içeriği temizle ama meta bilgilerini koru
      const updatedFormData = {
        ...formData,
        content: '',
        buttonText: '',
        buttonUrl: '',
        title: '',
        metaTitle: currentContent?.metaTitle || '',
        metaDescription: currentContent?.metaDescription || '',
        metaKeywords: currentContent?.metaKeywords || ''
      };
      
      console.log('Form verileri güncelleniyor (bölüm yok):', updatedFormData);
      setFormData(updatedFormData);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSection = e.target.value;
    console.log(`Bölüm değişti: ${newSection}`);
    
    setSelectedSection(newSection);
    
    // Bölüm değiştiğinde hemen içeriği güncelle
    if (currentContent && currentContent.sections && currentContent.sections[newSection]) {
      const section = currentContent.sections[newSection];
      console.log(`Yeni bölüm içeriği:`, section);
      
      const updatedFormData = {
        ...formData,
        content: section.content || '',
        buttonText: section.buttonText || '',
        buttonUrl: section.buttonUrl || '',
        title: section.title || '',
        metaTitle: currentContent.metaTitle || '',
        metaDescription: currentContent.metaDescription || '',
        metaKeywords: currentContent.metaKeywords || ''
      };
      
      console.log('Form verileri güncelleniyor (bölüm değişikliği):', updatedFormData);
      setFormData(updatedFormData);
    } else {
      console.log(`Yeni bölüm için içerik bulunamadı: ${newSection}`);
      
      // Eğer bölüm yoksa veya içeriği yoksa, içeriği temizle
      const updatedFormData = {
        ...formData,
        content: '',
        buttonText: '',
        buttonUrl: '',
        title: '',
        metaTitle: currentContent?.metaTitle || '',
        metaDescription: currentContent?.metaDescription || '',
        metaKeywords: currentContent?.metaKeywords || ''
      };
      
      console.log('Form verileri güncelleniyor (içerik yok):', updatedFormData);
      setFormData(updatedFormData);
    }
  };

  const savePageContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      let imageUrl = '';
      let imagePublicId = '';

      // Eğer mevcut içerik ve seçili bölüm varsa, görsel bilgilerini al
      if (currentContent && currentContent.sections && currentContent.sections[selectedSection]) {
        imageUrl = currentContent.sections[selectedSection].image || '';
        imagePublicId = currentContent.sections[selectedSection].imagePublicId || '';
      }

      // Resim yükleme
      if (imageFile) {
        // Eski resmi sil
        if (imagePublicId) {
          await deleteFile(imagePublicId);
        }
        
        // Yeni resmi yükle
        const imageResult = await uploadFile(`page-contents/${selectedPage}/${selectedSection}`, imageFile);
        imageUrl = imageResult.downloadURL;
        imagePublicId = imageResult.publicId;
      }

      // Sayfa içeriği oluştur veya güncelle
      let updatedSections = {};
      
      if (currentContent && currentContent.sections) {
        // Mevcut bölümleri kopyala
        updatedSections = { ...currentContent.sections };
      }
      
      // Bölüm başlığını sabit tut, pageSections'dan al
      const sectionDefinition = pageSections[selectedPage]?.find(s => s.id === selectedSection);
      const sectionTitle = sectionDefinition?.title || '';
      
      // Seçili bölümü güncelle
      updatedSections = {
        ...updatedSections,
        [selectedSection]: {
          title: sectionTitle, // Bölüm başlığını sabit tut
          content: formData.content || '',
          image: imageUrl || '',
          imagePublicId: imagePublicId || '',
          buttonText: formData.buttonText || '',
          buttonUrl: formData.buttonUrl || ''
        }
      };

      const pageContentData = {
        pageId: selectedPage,
        sections: updatedSections,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        metaKeywords: formData.metaKeywords,
        lastUpdated: new Date()
      };

      if (currentContent) {
        // Mevcut içeriği güncelle
        await updateDocument('pageContents', currentContent.id, pageContentData);
        setMessage({ text: 'Sayfa içeriği başarıyla güncellendi.', type: 'success' });
      } else {
        // Yeni içerik oluştur
        await addDocument('pageContents', pageContentData);
        setMessage({ text: 'Sayfa içeriği başarıyla oluşturuldu.', type: 'success' });
      }

      // Sayfaları yeniden yükle
      fetchPages();
      
      // Dosya seçimini temizle
      setImageFile(null);
      
      // Form elemanını temizle
      const imageInput = document.getElementById('sectionImage') as HTMLInputElement;
      if (imageInput) imageInput.value = '';
    } catch (error) {
      console.error('Sayfa içeriği kaydedilirken hata oluştu:', error);
      setMessage({ text: 'Sayfa içeriği kaydedilirken bir hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // HTML düzenleme araçları için yardımcı fonksiyonlar
  const applyFormatting = (format: string, selection: string, textAreaRef: React.RefObject<HTMLTextAreaElement | null>) => {
    if (!textAreaRef.current) return;
    
    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    let cursorPosition = 0;
    
    switch(format) {
      case 'bold':
        formattedText = `<strong>${selectedText || 'Kalın Metin'}</strong>`;
        cursorPosition = start + formattedText.length;
        break;
      case 'italic':
        formattedText = `<em>${selectedText || 'İtalik Metin'}</em>`;
        cursorPosition = start + formattedText.length;
        break;
      case 'underline':
        formattedText = `<u>${selectedText || 'Altı Çizili Metin'}</u>`;
        cursorPosition = start + formattedText.length;
        break;
      case 'h1':
        formattedText = `<h1>${selectedText || 'Başlık 1'}</h1>`;
        cursorPosition = start + formattedText.length;
        break;
      case 'h2':
        formattedText = `<h2>${selectedText || 'Başlık 2'}</h2>`;
        cursorPosition = start + formattedText.length;
        break;
      case 'h3':
        formattedText = `<h3>${selectedText || 'Başlık 3'}</h3>`;
        cursorPosition = start + formattedText.length;
        break;
      case 'link':
        formattedText = `<a href="https://ornek.com" target="_blank">${selectedText || 'Bağlantı Metni'}</a>`;
        cursorPosition = start + formattedText.length;
        break;
      case 'list':
        formattedText = `<ul>\n  <li>${selectedText || 'Liste Öğesi 1'}</li>\n  <li>Liste Öğesi 2</li>\n  <li>Liste Öğesi 3</li>\n</ul>`;
        cursorPosition = start + formattedText.length;
        break;
      case 'valueCard':
        const valueCardTemplate = `{
  "values": [
    {
      "title": "Değer 1",
      "description": "Değer 1 açıklaması burada yer alacak.",
      "icon": "graduation-cap"
    },
    {
      "title": "Değer 2",
      "description": "Değer 2 açıklaması burada yer alacak.",
      "icon": "book"
    },
    {
      "title": "Değer 3",
      "description": "Değer 3 açıklaması burada yer alacak.",
      "icon": "users"
    }
  ]
}`;
        formattedText = valueCardTemplate;
        cursorPosition = start + formattedText.length;
        break;
      default:
        return;
    }
    
    const newValue = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    
    // Form verisini güncelle
    const e = {
      target: {
        name: 'content',
        value: newValue
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    handleFormChange(e);
    
    // Textarea'yı güncelle ve odakla
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  // Değerler içeriğini parse etme fonksiyonu
  const parseValuesContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed && parsed.values && Array.isArray(parsed.values)) {
        return parsed.values;
      }
    } catch (e) {
      console.error('Değerler içeriği parse edilemedi:', e);
    }
    return [];
  };
  
  // Değerler içeriğini güncelleme
  const updateValuesContent = (newValues: Array<{title: string, description: string, icon: string}>) => {
    const valuesJson = JSON.stringify({ values: newValues }, null, 2);
    const e = {
      target: {
        name: 'content',
        value: valuesJson
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    handleFormChange(e);
    setValuesCards(newValues);
  };
  
  // Yönetim ekibi içeriğini parse etme fonksiyonu
  const parseTeamContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed && parsed.team && Array.isArray(parsed.team)) {
        return parsed.team;
      }
    } catch (e) {
      console.error('Yönetim ekibi içeriği parse edilemedi:', e);
    }
    return [];
  };
  
  // Yönetim ekibi içeriğini güncelleme
  const updateTeamContent = (newTeam: Array<{name: string, title: string, description: string, image: string, initials: string}>) => {
    const teamJson = JSON.stringify({ team: newTeam }, null, 2);
    const e = {
      target: {
        name: 'content',
        value: teamJson
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    handleFormChange(e);
    setTeamMembers(newTeam);
  };
  
  // Eğitim yaklaşımı kartlarını parse et
  const parseApproachContent = (content: string) => {
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Yaklaşım kartları içeriği ayrıştırılamadı:', e);
      return [];
    }
  };

  const parseNutritionContent = (content: string) => {
    try {
      // Eğer içerik boş veya tanımsız ise boş dizi döndür
      if (!content) {
        console.log('Beslenme içeriği boş, boş dizi döndürülüyor');
        return [];
      }
      
      // Eğer içerik | ile ayrılmış maddeler ise
      if (content.includes('|')) {
        const items = content.split('|').map(item => item.trim()).filter(item => item);
        console.log('Beslenme içeriği | ile ayrılmış:', items);
        return items;
      }
      // Eğer içerik HTML ise ve <li> etiketleri içeriyorsa
      else if (content.includes('<li>')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const items = Array.from(tempDiv.querySelectorAll('li')).map(li => li.textContent || '');
        console.log('Beslenme içeriği HTML:', items);
        return items.filter(item => item);
      }
      // Eğer içerik JSON formatında ise
      else if (content.startsWith('[') && content.endsWith(']')) {
        const items = JSON.parse(content);
        console.log('Beslenme içeriği JSON:', items);
        return items;
      }
      // Hiçbiri değilse içeriği tek bir madde olarak kabul et
      console.log('Beslenme içeriği tek madde:', content);
      return content ? [content] : [];
    } catch (e) {
      console.error('Beslenme önerileri içeriği ayrıştırılamadı:', e);
      return [];
    }
  };

  // Beslenme önerileri içeriğini güncelle
  const updateNutritionContent = (newItems: string[]) => {
    // Boş maddeleri filtrele
    const filteredItems = newItems.filter(item => item.trim());
    console.log('Beslenme önerileri güncelleniyor. Filtrelenmiş maddeler:', filteredItems);
    
    // Maddeleri | karakteri ile birleştir
    const content = filteredItems.join('|');
    console.log('Birleştirilmiş içerik:', content);
    
    // Form verilerini güncelle
    setFormData(prevState => {
      const newState = { ...prevState, content };
      console.log('Yeni form durumu:', newState);
      return newState;
    });
  };

  // Ödeme seçenekleri içeriğini ayrıştır
  const parsePaymentOptions = (content: string): Array<{title: string, description: string, icon: string}> => {
    if (!content) return [];
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Ödeme seçenekleri JSON parse hatası:', error);
      return [
        { title: 'Peşin Ödeme', description: 'Peşin ödemelerde %10 indirim uygulanmaktadır.', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
        { title: 'Taksitli Ödeme', description: '9 aya kadar taksit imkanı sunulmaktadır.', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
        { title: 'Burs İmkanları', description: 'Başarı durumuna göre burs imkanları sunulmaktadır.', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
      ];
    }
  };

  // Ödeme seçenekleri içeriğini güncelle
  const updatePaymentOptions = (options: Array<{title: string, description: string, icon: string}>) => {
    setFormData({
      ...formData,
      content: JSON.stringify(options)
    });
  };

  // SSS içeriğini ayrıştır
  const parseFaqItems = (content: string): Array<{question: string, answer: string}> => {
    if (!content) return [];
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('SSS JSON parse hatası:', error);
      return [
        { question: 'Ücretlere neler dahildir?', answer: 'Eğitim ücretlerimize öğle yemeği, eğitim materyalleri, etkinlikler ve geziler dahildir. Servis ücretleri ayrıca belirtilmiştir ve mesafeye göre değişiklik göstermektedir.' },
        { question: 'Ödeme planı nasıl oluşturulur?', answer: 'Ödeme planı, veli tercihine göre peşin veya taksitli olarak düzenlenebilir. Taksitli ödemelerde 9 aya kadar vade imkanı sunulmaktadır. Detaylı bilgi için kayıt ofisimizle iletişime geçebilirsiniz.' },
        { question: 'İndirim koşulları nelerdir?', answer: 'Okulumuzda peşin ödemelerde %10, kardeş kayıtlarında %15 ve erken kayıt döneminde %5 indirim uygulanmaktadır. Ayrıca başarı durumuna göre burs imkanları da sunulmaktadır. İndirimler birleştirilemez, en yüksek indirim oranı uygulanır.' }
      ];
    }
  };

  // SSS içeriğini güncelle
  const updateFaqItems = (items: Array<{question: string, answer: string}>) => {
    setFormData({
      ...formData,
      content: JSON.stringify(items)
    });
  };

  // Eğitim yaklaşımı kartlarını güncelle
  const updateApproachContent = (newCards: Array<{title: string, description: string, icon: string}>) => {
    // Kartları JSON formatına dönüştür
    const jsonContent = JSON.stringify(newCards);
    
    // Form verilerini güncelle
    const updatedFormData = {
      ...formData,
      content: jsonContent
    };
    
    console.log('Eğitim yaklaşımı içeriği güncellendi:', updatedFormData);
    setFormData(updatedFormData);
  };

  // Seçilen bölüm değiştiğinde yönetim ekibi üyelerini güncelle
  useEffect(() => {
    if (selectedSection === 'team' && formData.content) {
      setTeamMembers(parseTeamContent(formData.content));
    }
    
    // Eğitim yaklaşımı bölümü için
    if (selectedPage === 'teachers' && selectedSection === 'approach' && formData.content) {
      setApproachCards(parseApproachContent(formData.content));
    }
  }, [selectedSection, formData.content, selectedPage]);

  if (!isActive) return null;

  const currentPageName = pageOptions.find(p => p.id === selectedPage)?.name || '';

  return (
    <div className={`${isActive ? 'block' : 'hidden'} p-6 bg-white rounded-lg shadow-md`}>
      {loading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md shadow-lg">
            <p className="text-gray-800">Yükleniyor...</p>
          </div>
        </div>
      )}
      
      <h2 className="text-xl font-bold mb-6 text-black">{currentPageName} Sayfa İçeriği</h2>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      <div className="mb-6">
        <label htmlFor="sectionSelect" className="block text-sm font-medium text-black mb-1">
          Düzenlenecek Bölümü Seçin
        </label>
        <select
          id="sectionSelect"
          value={selectedSection}
          onChange={handleSectionChange}
          className="w-full px-3 py-2 border border-gray-400 rounded-md bg-white text-gray-900 font-medium"
          style={{ fontSize: '16px' }}
        >
          <option value="" className="text-gray-900">-- Bölüm Seçin --</option>
          {pageSections[selectedPage]?.map((section) => (
            <option key={section.id} value={section.id} className="text-gray-900">
              {section.title}
            </option>
          ))}
        </select>
      </div>
      
      {selectedSection && pageSections[selectedPage]?.find(s => s.id === selectedSection) && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-lg font-medium text-black mb-2">Bölüm Bilgisi</h3>
          <p className="text-sm text-black">
            <span className="font-medium text-black">Başlık:</span> {pageSections[selectedPage]?.find(s => s.id === selectedSection)?.title}
          </p>
          <p className="text-sm text-black mt-1">
            <span className="font-medium text-black">Açıklama:</span> {pageSections[selectedPage]?.find(s => s.id === selectedSection)?.description}
          </p>
        </div>
      )}
      
      {selectedSection && (
        <form onSubmit={savePageContent}>
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              İçerik
            </label>
            
            {selectedSection === 'values' ? (
              <ValuesCardEditor 
                values={parseValuesContent(formData.content)} 
                onChange={updateValuesContent} 
              />
            ) : selectedSection === 'team' ? (
              <TeamCardEditor 
                team={teamMembers} 
                onChange={updateTeamContent} 
              />
            ) : selectedPage === 'teachers' && selectedSection === 'approach' ? (
              <ApproachCardEditor 
                cards={parseApproachContent(formData.content)} 
                onChange={updateApproachContent} 
              />
            ) : selectedPage === 'menu' && selectedSection === 'nutrition' ? (
              <NutritionItemsEditor 
                items={parseNutritionContent(formData.content)} 
                onChange={updateNutritionContent} 
              />
            ) : selectedPage === 'pricing' && selectedSection === 'payment' ? (
              <PaymentOptionsEditor 
                options={parsePaymentOptions(formData.content)} 
                onChange={updatePaymentOptions} 
              />
            ) : selectedPage === 'pricing' && selectedSection === 'faq' ? (
              <FaqItemsEditor 
                items={parseFaqItems(formData.content)} 
                onChange={updateFaqItems} 
              />
            ) : selectedPage === 'contact' && selectedSection === 'faq' ? (
              <FaqItemsEditor 
                items={parseFaqItems(formData.content)} 
                onChange={updateFaqItems} 
              />
            ) : (
              <>
                {/* Düzenleme araçları */}
                <div className="mb-2 flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md bg-gray-50">
                  <button
                    type="button"
                    onClick={() => applyFormatting('bold', '', textAreaRef)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold"
                    title="Kalın"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('italic', '', textAreaRef)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm italic"
                    title="İtalik"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('underline', '', textAreaRef)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm underline"
                    title="Altı Çizili"
                  >
                    U
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('h1', '', textAreaRef)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold"
                    title="Başlık 1"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('h2', '', textAreaRef)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold"
                    title="Başlık 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('h3', '', textAreaRef)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold"
                    title="Başlık 3"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('link', '', textAreaRef)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    title="Bağlantı"
                  >
                    Link
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('list', '', textAreaRef)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    title="Liste"
                  >
                    Liste
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="ml-auto px-3 py-1 bg-burgundy-600 hover:bg-burgundy-700 text-white rounded text-sm"
                  >
                    {showPreview ? 'Düzenleme Moduna Dön' : 'Önizleme Göster'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!showPreview && (
                    <div>
                      <textarea
                        id="content"
                        name="content"
                        ref={textAreaRef}
                        value={formData.content}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-400 rounded-md h-64 font-mono bg-white text-gray-900"
                        required
                        placeholder={selectedSection ? `${pageSections[selectedPage]?.find(s => s.id === selectedSection)?.title} içeriğini buraya girin...` : 'Lütfen önce bir bölüm seçin'}
                        style={{ color: '#333', fontSize: '16px', lineHeight: '1.5' }}
                      />
                    </div>
                  )}
                  
                  <div className={`${showPreview ? 'col-span-2' : ''}`}>
                    <div className="border p-4 rounded-md bg-white h-64 overflow-auto">
                      <h3 className="text-xl font-bold mb-4 text-black">{pageSections[selectedPage]?.find(s => s.id === selectedSection)?.title}</h3>
                      <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="sectionImage" className="block text-sm font-medium text-gray-700 mb-1">
              Bölüm Görseli <span className="text-gray-500 text-xs">(İsteğe bağlı)</span>
            </label>
            <input
              type="file"
              id="sectionImage"
              name="sectionImage"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              accept="image/*"
            />
            {currentContent && 
             currentContent.sections && 
             currentContent.sections[selectedSection] && 
             currentContent.sections[selectedSection].image && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Mevcut görsel:</p>
                <img 
                  src={currentContent.sections[selectedSection].image} 
                  alt="Mevcut bölüm görseli" 
                  className="max-h-40 border rounded-md"
                />
              </div>
            )}
          </div>
          
          {/* Buton ayarları - Sadece öğretmen alımı bölümü için göster */}
          {(selectedSection === 'hiring' && selectedPage === 'teachers') || 
           (selectedSection === 'cta' && selectedPage === 'events') ? (
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <div className="mb-4">
                <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700 mb-1">
                  Buton Metni
                </label>
                <input
                  type="text"
                  id="buttonText"
                  name="buttonText"
                  value={formData.buttonText || ''}
                  onChange={handleFormChange}
                  placeholder="Örn: İletişime Geçin"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>
              
              <div className="mb-1">
                <label htmlFor="buttonUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Buton URL
                </label>
                <input
                  type="text"
                  id="buttonUrl"
                  name="buttonUrl"
                  value={formData.buttonUrl || ''}
                  onChange={handleFormChange}
                  placeholder="Örn: /iletisim"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Site içi bağlantılar için "/sayfa-adi" formatını kullanın. Dış bağlantılar için "https://" ile başlayan tam URL girin.
                </p>
              </div>
            </div>
          ) : null}
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-medium text-black mb-4">SEO Ayarları</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Başlık
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 bg-white text-black"
                />
              </div>
              
              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Açıklama
                </label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleFormChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 bg-white text-black"
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Anahtar Kelimeler
                </label>
                <input
                  type="text"
                  id="metaKeywords"
                  name="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-burgundy-500 focus:border-burgundy-500 bg-white text-black"
                  placeholder="anahtar,kelime,virgülle,ayırın"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Kaydediliyor...' : 'Bölüm İçeriğini Kaydet'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 