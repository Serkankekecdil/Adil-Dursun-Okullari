'use client';

import { useState } from 'react';
import SiteSettingsManagement from '@/components/admin/SiteSettingsManagement';
import SliderManagement from '@/components/admin/SliderManagement';
import AnnouncementManagement from '@/components/admin/AnnouncementManagement';
import TeacherManagement from '@/components/admin/TeacherManagement';
import EventManagement from '@/components/admin/EventManagement';
import GalleryManagement from '@/components/admin/GalleryManagement';
import MenuManagement from '@/components/admin/MenuManagement';
import PriceManagement from '@/components/admin/PriceManagement';
import WhyUsManagement from '@/components/admin/WhyUsManagement';
import HomeContactManagement from '@/components/admin/HomeContactManagement';

const DashboardPage = () => {
  // Tab ID'lerini tanımlayalım
  const tabIds = {
    siteSettings: 'site-settings',
    slider: 'slider',
    announcements: 'announcements',
    whyUs: 'why-us',
    teachers: 'teachers',
    events: 'events',
    gallery: 'gallery',
    menu: 'menu',
    price: 'price',
    homeContact: 'home-contact'
  };

  const [activeTab, setActiveTab] = useState(tabIds.siteSettings);

  // Tab değiştirme fonksiyonu
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Adil Dursun Okulları Yönetim Paneli</h1>
      
      {/* Özel Tab Navigasyonu */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-1 border-b border-gray-200 min-w-max">
          {[
            { id: tabIds.siteSettings, label: 'Site Ayarları' },
            { id: tabIds.slider, label: 'Slider Yönetimi' },
            { id: tabIds.announcements, label: 'Duyurular' },
            { id: tabIds.whyUs, label: 'Neden Biz?', highlight: true },
            { id: tabIds.teachers, label: 'Öğretmenler' },
            { id: tabIds.events, label: 'Etkinlikler' },
            { id: tabIds.gallery, label: 'Galeri' },
            { id: tabIds.menu, label: 'Yemek Listesi' },
            { id: tabIds.price, label: 'Fiyat Bilgileri' },
            { id: tabIds.homeContact, label: 'Ana Sayfa İletişim' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-3 px-4 font-medium text-sm focus:outline-none whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : tab.highlight 
                    ? 'text-green-600 font-bold border-green-300 border px-6 rounded-t-lg hover:bg-green-50'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* İçerik Bölümü */}
      <div className="bg-white rounded-lg shadow">
        <SiteSettingsManagement isActive={activeTab === tabIds.siteSettings} />
        <SliderManagement isActive={activeTab === tabIds.slider} />
        <AnnouncementManagement isActive={activeTab === tabIds.announcements} />
        <WhyUsManagement isActive={activeTab === tabIds.whyUs} />
        <TeacherManagement isActive={activeTab === tabIds.teachers} />
        <EventManagement isActive={activeTab === tabIds.events} />
        <GalleryManagement isActive={activeTab === tabIds.gallery} />
        <MenuManagement isActive={activeTab === tabIds.menu} />
        <PriceManagement isActive={activeTab === tabIds.price} />
        <HomeContactManagement isActive={activeTab === tabIds.homeContact} />
      </div>
    </div>
  );
};

export default DashboardPage; 