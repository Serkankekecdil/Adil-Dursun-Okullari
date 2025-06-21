'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  logoutUser, 
  getCurrentUser, 
  getCollection,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
  uploadFile,
  deleteFile
} from '@/firebase/firebaseServices';
import { User } from 'firebase/auth';
import PageContentManagement from '@/components/admin/PageContentManagement';
import SliderManagement from '@/components/admin/SliderManagement';
import ContactInfoManagement from '@/components/admin/ContactInfoManagement';
import PricingManagement from '@/components/admin/PricingManagement';
import ContactMessagesManagement from '@/components/admin/ContactMessagesManagement';
import MenuManagement from '@/components/admin/MenuManagement';
import { auth, db } from '@/firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import AnnouncementsManagement from '@/components/admin/AnnouncementsManagement';
import AchievementsManagement from '@/components/admin/AchievementsManagement';
import SiteSettingsManagement from '@/components/admin/SiteSettingsManagement';
import WhyUsManagement from '@/components/admin/WhyUsManagement';



// Öğretmen tipi tanımı
interface Teacher {
  id: string;
  name: string;
  position: string;
  department: string;
  email?: string;
  phone?: string;
  bio: string;
  image?: string;
  imagePublicId?: string;
  experience?: string;
  order?: number;
}

// Etkinlik tipi tanımı
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  imageUrl?: string;
  imagePublicId?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

// Galeri tipi tanımı
interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image: string;
  imagePublicId?: string;
  category: string;
  date: string;
}

// Duyurular için yeni bir tip tanımı
interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
  status: 'active' | 'archived';
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    bio: '',
    image: null as File | null,
    order: 0
  });
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    status: 'upcoming' as 'upcoming' | 'completed' | 'cancelled',
    image: null as File | null
  });
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEventEditing, setIsEventEditing] = useState<boolean>(false);
  const [galleryFormData, setGalleryFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    image: null as File | null
  });
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<string | null>(null);
  const [isGalleryEditing, setIsGalleryEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('teachers');
  
  // Aktif menü öğesi
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  
  // Kullanıcı durumunu kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/admin');
        } else {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Kimlik doğrulama hatası:', error);
        router.push('/admin');
      }
    };
    
    checkAuth();
  }, [router]);

  // Çıkış yapma işlevi
  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/admin');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  // Öğretmenleri getir
  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const teachersCollection = await getCollection('teachers');
      setTeachers(teachersCollection as Teacher[]);
    } catch (error) {
      console.error('Öğretmenler getirilirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Öğretmen ekle
  const addTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      let imageUrl = '';
      let imagePublicId = '';
      
      // Eğer resim yüklendiyse
      if (formData.image) {
        const uploadResult = await uploadFile('teachers', formData.image);
        imageUrl = uploadResult.downloadURL;
        imagePublicId = uploadResult.publicId;
      }
      
      // Firestore'a öğretmen bilgilerini ekle
      const teacherData = {
        name: formData.name,
        position: formData.position,
        department: formData.department,
        bio: formData.bio,
        image: imageUrl,
        imagePublicId: imagePublicId,
        order: formData.order || 0
      };
      
      await addDocument('teachers', teacherData);
      
      // Formu sıfırla
      setFormData({
        name: '',
        position: '',
        department: '',
        email: '',
        phone: '',
        bio: '',
        image: null,
        order: 0
      });
      
      // Öğretmenleri yeniden getir
      fetchTeachers();
      
    } catch (error) {
      console.error('Öğretmen eklenirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Öğretmen güncelle
  const updateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeacher) return;
    
    try {
      setIsLoading(true);
      
      let imageUrl = '';
      let imagePublicId = '';
      
      // Eğer yeni resim yüklendiyse
      if (formData.image) {
        const uploadResult = await uploadFile('teachers', formData.image);
        imageUrl = uploadResult.downloadURL;
        imagePublicId = uploadResult.publicId;
      }
      
      // Firestore'daki öğretmen bilgilerini güncelle
      const teacherData: any = {
        name: formData.name,
        position: formData.position,
        department: formData.department,
        bio: formData.bio,
        order: formData.order
      };
      
      // Eğer yeni resim yüklendiyse, resim URL'sini güncelle
      if (imageUrl) {
        teacherData.image = imageUrl;
        teacherData.imagePublicId = imagePublicId;
        
        // Eski resmi sil
        const teacher = await getDocument('teachers', selectedTeacher) as Teacher | null;
        if (teacher && teacher.image && teacher.imagePublicId) {
          await deleteFile(teacher.imagePublicId);
        }
      }
      
      await updateDocument('teachers', selectedTeacher, teacherData);
      
      // Formu sıfırla
      setFormData({
        name: '',
        position: '',
        department: '',
        email: '',
        phone: '',
        bio: '',
        image: null,
        order: 0
      });
      
      setSelectedTeacher(null);
      setIsEditing(false);
      
      // Öğretmenleri yeniden getir
      fetchTeachers();
      
    } catch (error) {
      console.error('Öğretmen güncellenirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Öğretmen sil
  const deleteTeacher = async (teacherId: string) => {
    if (!confirm('Bu öğretmeni silmek istediğinizden emin misiniz?')) return;
    
    try {
      setIsLoading(true);
      
      // Önce öğretmen bilgilerini al (resim URL'sini almak için)
      const teacher = await getDocument('teachers', teacherId) as Teacher | null;
      
      // Eğer öğretmenin resmi varsa, Cloudinary'den sil
      if (teacher && teacher.image && teacher.imagePublicId) {
        await deleteFile(teacher.imagePublicId);
      }
      
      // Firestore'dan öğretmeni sil
      await deleteDocument('teachers', teacherId);
      
      // Öğretmenleri yeniden getir
      fetchTeachers();
      
    } catch (error) {
      console.error('Öğretmen silinirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Öğretmen düzenleme modunu aç
  const editTeacher = async (teacherId: string) => {
    try {
      setIsLoading(true);
      
      // Öğretmen bilgilerini getir
      const teacher = await getDocument('teachers', teacherId) as Teacher | null;
      
      if (teacher) {
        // Form verilerini doldur
        setFormData({
          name: teacher.name || '',
          position: teacher.position || '',
          department: teacher.department || '',
          email: teacher.email || '',
          phone: teacher.phone || '',
          bio: teacher.bio || '',
          image: null, // Mevcut resmi dosya olarak tutamayız, sadece URL olarak tutabiliriz
          order: teacher.order || 0
        });
        
        setSelectedTeacher(teacherId);
        setIsEditing(true);
      }
      
    } catch (error) {
      console.error('Öğretmen bilgileri getirilirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Form değişikliklerini işle
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Dosya yükleme işlemini işle
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        image: e.target.files![0]
      }));
    }
  };

  // Öğretmenleri sayfa yüklendiğinde getir
  useEffect(() => {
    if (activeMenuItem === 'teachers') {
      fetchTeachers();
    }
  }, [activeMenuItem]);

  // Etkinlikleri getir
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const eventsCollection = await getCollection('events');
      setEvents(eventsCollection as Event[]);
    } catch (error) {
      console.error('Etkinlikler getirilirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Duyuruları getir
  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const announcementsCollection = await getCollection('announcements');
      setAnnouncements(announcementsCollection as Announcement[]);
    } catch (error) {
      console.error('Duyurular getirilirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Galeri öğelerini getir
  const fetchGalleryItems = async () => {
    try {
      setIsLoading(true);
      const galleryCollection = await getCollection('gallery');
      setGalleryItems(galleryCollection as GalleryItem[]);
    } catch (error) {
      console.error('Galeri öğeleri getirilirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    fetchTeachers();
    fetchEvents();
    fetchAnnouncements();
    fetchGalleryItems();
  }, []);

  // Etkinlik ekle
  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      let imageUrl = '';
      let imagePublicId = '';
      
      // Eğer resim yüklendiyse
      if (eventFormData.image) {
        const uploadResult = await uploadFile('events', eventFormData.image);
        imageUrl = uploadResult.downloadURL;
        imagePublicId = uploadResult.publicId;
      }
      
      // Firestore'a etkinlik bilgilerini ekle
      const eventData = {
        title: eventFormData.title,
        description: eventFormData.description,
        date: eventFormData.date,
        imageUrl: imageUrl,
        status: eventFormData.status
      };
      
      await addDocument('events', eventData);
      
      // Formu sıfırla
      setEventFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        status: 'upcoming',
        image: null
      });
      
      // Etkinlikleri yeniden getir
      fetchEvents();
      
    } catch (error) {
      console.error('Etkinlik eklenirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Etkinlik güncelle
  const updateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvent) return;
    
    try {
      setIsLoading(true);
      
      let imageUrl = '';
      let imagePublicId = '';
      
      // Eğer yeni resim yüklendiyse
      if (eventFormData.image) {
        const uploadResult = await uploadFile('events', eventFormData.image);
        imageUrl = uploadResult.downloadURL;
        imagePublicId = uploadResult.publicId;
      }
      
      // Firestore'daki etkinlik bilgilerini güncelle
      const eventData: any = {
        title: eventFormData.title,
        description: eventFormData.description,
        date: eventFormData.date,
        imageUrl: imageUrl,
        status: eventFormData.status
      };
      
      // Eğer yeni resim yüklendiyse, resim URL'sini güncelle
      if (imageUrl) {
        eventData.imageUrl = imageUrl;
        eventData.imagePublicId = imagePublicId;
        
        // Eski resmi sil
        const event = await getDocument('events', selectedEvent) as Event | null;
        if (event && event.imageUrl && event.imagePublicId) {
          await deleteFile(event.imagePublicId);
        }
      }
      
      await updateDocument('events', selectedEvent, eventData);
      
      // Formu sıfırla
      setEventFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        status: 'upcoming',
        image: null
      });
      
      setSelectedEvent(null);
      setIsEventEditing(false);
      
      // Etkinlikleri yeniden getir
      fetchEvents();
      
    } catch (error) {
      console.error('Etkinlik güncellenirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Etkinlik sil
  const deleteEvent = async (eventId: string) => {
    if (!confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) return;
    
    try {
      setIsLoading(true);
      
      // Önce etkinlik bilgilerini al (resim URL'sini almak için)
      const event = await getDocument('events', eventId) as Event | null;
      
      // Eğer etkinliğin resmi varsa, Cloudinary'den sil
      if (event && event.imageUrl && event.imagePublicId) {
        await deleteFile(event.imagePublicId);
      }
      
      // Firestore'dan etkinliği sil
      await deleteDocument('events', eventId);
      
      // Etkinlikleri yeniden getir
      fetchEvents();
      
    } catch (error) {
      console.error('Etkinlik silinirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Etkinlik düzenleme modunu aç
  const editEvent = async (eventId: string) => {
    try {
      setIsLoading(true);
      
      // Etkinlik bilgilerini getir
      const event = await getDocument('events', eventId) as Event | null;
      
      if (event) {
        // Form verilerini doldur
        setEventFormData({
          title: event.title || '',
          description: event.description || '',
          date: event.date || '',
          time: event.time || '',
          location: event.location || '',
          status: event.status || 'upcoming',
          image: null // Mevcut resmi dosya olarak tutamayız, sadece URL olarak tutabiliriz
        });
        
        setSelectedEvent(eventId);
        setIsEventEditing(true);
      }
      
    } catch (error) {
      console.error('Etkinlik bilgileri getirilirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Etkinlik form değişikliklerini işle
  const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Etkinlik dosya yükleme işlemini işle
  const handleEventFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEventFormData(prev => ({
        ...prev,
        image: e.target.files![0]
      }));
    }
  };

  // Etkinlikleri sayfa yüklendiğinde getir
  useEffect(() => {
    if (activeMenuItem === 'events') {
      fetchEvents();
    }
  }, [activeMenuItem]);

  // Galeri öğesi ekle
  const addGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      let imageUrl = '';
      let imagePublicId = '';
      
      // Eğer resim yüklendiyse
      if (galleryFormData.image) {
        const uploadResult = await uploadFile('gallery', galleryFormData.image);
        imageUrl = uploadResult.downloadURL;
        imagePublicId = uploadResult.publicId;
      }
      
      // Firestore'a galeri bilgilerini ekle
      const galleryData = {
        title: galleryFormData.title,
        description: galleryFormData.description,
        category: galleryFormData.category,
        date: galleryFormData.date,
        image: imageUrl,
        imagePublicId: imagePublicId
      };
      
      await addDocument('gallery', galleryData);
      
      // Formu sıfırla
      setGalleryFormData({
        title: '',
        description: '',
        category: '',
        date: '',
        image: null
      });
      
      // Galeri öğelerini yeniden getir
      fetchGalleryItems();
      
    } catch (error) {
      console.error('Galeri öğesi eklenirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Galeri öğesi güncelle
  const updateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGalleryItem) return;
    
    try {
      setIsLoading(true);
      
      let imageUrl = '';
      let imagePublicId = '';
      
      // Eğer yeni resim yüklendiyse
      if (galleryFormData.image) {
        const uploadResult = await uploadFile('gallery', galleryFormData.image);
        imageUrl = uploadResult.downloadURL;
        imagePublicId = uploadResult.publicId;
      }
      
      // Firestore'daki galeri bilgilerini güncelle
      const galleryData: any = {
        title: galleryFormData.title,
        description: galleryFormData.description,
        category: galleryFormData.category,
        date: galleryFormData.date
      };
      
      // Eğer yeni resim yüklendiyse, resim URL'sini güncelle
      if (imageUrl) {
        galleryData.image = imageUrl;
        galleryData.imagePublicId = imagePublicId;
        
        // Eski resmi sil
        const galleryItem = await getDocument('gallery', selectedGalleryItem) as GalleryItem | null;
        if (galleryItem && galleryItem.image && galleryItem.imagePublicId) {
          await deleteFile(galleryItem.imagePublicId);
        }
      }
      
      await updateDocument('gallery', selectedGalleryItem, galleryData);
      
      // Formu sıfırla
      setGalleryFormData({
        title: '',
        description: '',
        category: '',
        date: '',
        image: null
      });
      
      setSelectedGalleryItem(null);
      setIsGalleryEditing(false);
      
      // Galeri öğelerini yeniden getir
      fetchGalleryItems();
      
    } catch (error) {
      console.error('Galeri öğesi güncellenirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Galeri öğesi sil
  const deleteGalleryItem = async (galleryId: string) => {
    if (!confirm('Bu galeri öğesini silmek istediğinizden emin misiniz?')) return;
    
    try {
      setIsLoading(true);
      
      // Önce galeri bilgilerini al (resim URL'sini almak için)
      const galleryItem = await getDocument('gallery', galleryId) as GalleryItem | null;
      
      // Eğer galeri öğesinin resmi varsa, Cloudinary'den sil
      if (galleryItem && galleryItem.image && galleryItem.imagePublicId) {
        await deleteFile(galleryItem.imagePublicId);
      }
      
      // Firestore'dan galeri öğesini sil
      await deleteDocument('gallery', galleryId);
      
      // Galeri öğelerini yeniden getir
      fetchGalleryItems();
      
    } catch (error) {
      console.error('Galeri öğesi silinirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Galeri öğesi düzenleme modunu aç
  const editGalleryItem = async (galleryId: string) => {
    try {
      setIsLoading(true);
      
      // Galeri bilgilerini getir
      const galleryItem = await getDocument('gallery', galleryId) as GalleryItem | null;
      
      if (galleryItem) {
        // Form verilerini doldur
        setGalleryFormData({
          title: galleryItem.title || '',
          description: galleryItem.description || '',
          category: galleryItem.category || '',
          date: galleryItem.date || '',
          image: null // Mevcut resmi dosya olarak tutamayız, sadece URL olarak tutabiliriz
        });
        
        setSelectedGalleryItem(galleryId);
        setIsGalleryEditing(true);
      }
      
    } catch (error) {
      console.error('Galeri bilgileri getirilirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Galeri form değişikliklerini işle
  const handleGalleryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGalleryFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Galeri dosya yükleme işlemini işle
  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGalleryFormData(prev => ({
        ...prev,
        image: e.target.files![0]
      }));
    }
  };

  // Galeri öğelerini sayfa yüklendiğinde getir
  useEffect(() => {
    if (activeMenuItem === 'gallery') {
      fetchGalleryItems();
    }
  }, [activeMenuItem]);

  // Örnek istatistikler
  const stats = [
    { id: 1, name: 'Toplam Öğrenci', value: '1,523', change: '+12%', changeType: 'increase' },
    { id: 2, name: 'Öğretmen Sayısı', value: '87', change: '+5%', changeType: 'increase' },
    { id: 3, name: 'Etkinlikler', value: '24', change: '+8%', changeType: 'increase' },
    { id: 4, name: 'Başarı Oranı', value: '%92', change: '+3%', changeType: 'increase' },
  ];

  // Örnek son etkinlikler
  const recentEvents = [
    { id: 1, name: 'Bilim Şenliği', date: '15 Mayıs 2023', status: 'Tamamlandı' },
    { id: 2, name: 'Mezuniyet Töreni', date: '20 Haziran 2023', status: 'Planlandı' },
    { id: 3, name: 'Veli Toplantısı', date: '10 Nisan 2023', status: 'Tamamlandı' },
    { id: 4, name: 'Kültür Gezisi', date: '5 Mayıs 2023', status: 'Tamamlandı' },
    { id: 5, name: 'Spor Şenliği', date: '25 Mayıs 2023', status: 'Planlandı' },
  ];

  // Örnek son duyurular
  const recentAnnouncements = [
    { id: 1, title: 'Yaz Okulu Kayıtları Başladı', date: '1 Nisan 2023' },
    { id: 2, title: 'Yeni Eğitim Yılı Hazırlıkları', date: '15 Mart 2023' },
    { id: 3, title: 'Burs Sınavı Sonuçları Açıklandı', date: '10 Mart 2023' },
    { id: 4, title: 'Okul Aile Birliği Toplantısı', date: '5 Mart 2023' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Üst Menü */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-blue-100 mr-2">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-blue-800 text-xs font-bold">ADO</span>
                  </div>
                  <Image
                    src="/images/logo.png"
                    alt="Adil Dursun Okulları Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-bold text-gray-900">Adil Dursun Okulları Yönetim Paneli</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-gray-600 text-xs font-bold">{user?.email?.charAt(0).toUpperCase() || 'A'}</span>
                    </div>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">{user?.email || 'Admin'}</span>
                  <button 
                    onClick={handleLogout}
                    className="ml-4 text-sm text-red-600 hover:text-red-800"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Yan Menü */}
        <div className="w-64 bg-white shadow-md h-screen">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Menü</h2>
            <ul className="space-y-2">
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveMenuItem('dashboard')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveMenuItem('events')}
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'events' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Etkinlikler
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'sliders'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveMenuItem('sliders')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                  Ana Sayfa Slider
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'announcements'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveMenuItem('announcements')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  Duyurular
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'teachers'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveMenuItem('teachers')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Öğretmenler
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'menu'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveMenuItem('menu')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Yemek Listesi
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'contact'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveMenuItem('contact')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  İletişim Bilgileri
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'messages'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveMenuItem('messages')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Mesajlar
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'pricing'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveMenuItem('pricing')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Fiyat Bilgileri
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'achievements'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveMenuItem('achievements')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Başarılarımız
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'site-settings'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveMenuItem('site-settings')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Site Ayarları
                </button>
              </li>
              <li className="mt-4">
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sayfa İçerikleri
                </h3>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'page-home'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-black hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setActiveMenuItem('page-home');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Ana Sayfa İçeriği
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'page-about'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-black hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setActiveMenuItem('page-about');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Hakkımızda İçeriği
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'why-us'
                      ? 'bg-green-100 text-green-700 font-bold'
                      : 'text-black hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setActiveMenuItem('why-us');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Neden Biz?
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'page-teachers'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-black hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setActiveMenuItem('page-teachers');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Öğretmenler İçeriği
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'page-events'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-black hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setActiveMenuItem('page-events');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Etkinlikler İçeriği
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'page-menu'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-black hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setActiveMenuItem('page-menu');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Yemek Listesi İçeriği
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'page-contact'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-black hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setActiveMenuItem('page-contact');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  İletişim Sayfası İçeriği
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveMenuItem('page-pricing')}
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'page-pricing'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Fiyat Bilgileri Sayfası İçeriği
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    activeMenuItem === 'home-contact'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveMenuItem('home-contact')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Ana Sayfa İletişim
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="flex-1 p-8">
          {activeMenuItem === 'dashboard' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Toplam Öğrenci</h3>
                      <p className="text-2xl font-bold text-gray-900">-</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Toplam Öğretmen</h3>
                      <p className="text-2xl font-bold text-gray-900">-</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Aktif Etkinlikler</h3>
                      <p className="text-2xl font-bold text-gray-900">-</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Aktif Duyurular</h3>
                      <p className="text-2xl font-bold text-gray-900">-</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Son Etkinlikler */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Son Etkinlikler</h3>
                  </div>
                  <div className="p-6">
                    {events.length > 0 ? (
                      <div className="space-y-4">
                        {events.map((event) => (
                          <div key={event.id} className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                {event.imageUrl && (
                                  <Image
                                    src={event.imageUrl}
                                    alt={event.title}
                                    width={48}
                                    height={48}
                                    className="object-cover"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {event.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(event.date).toLocaleDateString('tr-TR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center">Henüz etkinlik eklenmemiş.</p>
                    )}
                  </div>
                </div>

                {/* Son Duyurular */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Son Duyurular</h3>
                  </div>
                  <div className="p-6">
                    {announcements.length > 0 ? (
                      <div className="space-y-4">
                        {announcements.map((announcement) => (
                          <div key={announcement.id} className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                {announcement.imageUrl && (
                                  <Image
                                    src={announcement.imageUrl}
                                    alt={announcement.title}
                                    width={48}
                                    height={48}
                                    className="object-cover"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {announcement.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(announcement.date).toLocaleDateString('tr-TR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center">Henüz duyuru eklenmemiş.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenuItem === 'teachers' && (
            <>
              <h1 className="text-2xl font-bold text-black mb-6">Öğretmenler Yönetimi</h1>
              
              {/* Öğretmen Ekleme/Düzenleme Formu */}
              <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-black mb-4">
                  {isEditing ? 'Öğretmen Düzenle' : 'Yeni Öğretmen Ekle'}
                </h2>
                
                <form onSubmit={isEditing ? updateTeacher : addTeacher} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700">Pozisyon</label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleFormChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700">Bölüm</label>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleFormChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-posta (İsteğe Bağlı)</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleFormChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefon (İsteğe Bağlı)</label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleFormChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700">Fotoğraf</label>
                      <input
                        type="file"
                        id="image"
                        name="image"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="order" className="block text-sm font-medium text-gray-700">Sıra</label>
                      <input
                        type="number"
                        id="order"
                        name="order"
                        value={formData.order}
                        onChange={handleFormChange}
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                      />
                      <p className="mt-1 text-sm text-gray-500">Öğretmenin görüntülenme sırası. Sayı ne kadar küçükse o kadar üstte görünür.</p>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Biyografi</label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            name: '',
                            position: '',
                            department: '',
                            email: '',
                            phone: '',
                            bio: '',
                            image: null,
                            order: 0
                          });
                          setSelectedTeacher(null);
                          setIsEditing(false);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        İptal
                      </button>
                    )}
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : null}
                      {isEditing ? 'Güncelle' : 'Ekle'}
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Öğretmenler Listesi */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-black">Öğretmenler Listesi</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Tüm öğretmenlerin listesi</p>
                </div>
                
                {isLoading && teachers.length === 0 ? (
                  <div className="p-6 text-center">
                    <svg className="animate-spin mx-auto h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-gray-500">Öğretmenler yükleniyor...</p>
                  </div>
                ) : teachers.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-500">Henüz öğretmen eklenmemiş.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Öğretmen
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bölüm
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pozisyon
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {teachers.map((teacher) => (
                          <tr key={teacher.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 relative">
                                  {teacher.image ? (
                                    <Image
                                      src={teacher.image}
                                      alt={teacher.name}
                                      width={40}
                                      height={40}
                                      className="rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="absolute inset-0 rounded-full bg-gray-200 flex items-center justify-center">
                                      <span className="text-gray-600 font-medium">{teacher.name.charAt(0)}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{teacher.department}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{teacher.position}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                className="text-blue-600 hover:text-blue-900 mr-3"
                                onClick={() => editTeacher(teacher.id)}
                              >
                                Düzenle
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => deleteTeacher(teacher.id)}
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
            </>
          )}

          {activeMenuItem === 'events' && (
            <>
              <h1 className="text-2xl font-bold text-black mb-6">Etkinlik Yönetimi</h1>
              
              {/* Etkinlik Ekleme/Düzenleme Formu */}
              {(isEventEditing || selectedEvent) && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-lg font-medium text-black mb-4">
                    {isEventEditing ? 'Etkinlik Düzenle' : 'Yeni Etkinlik Ekle'}
                  </h2>
                  <form onSubmit={isEventEditing ? updateEvent : addEvent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="event-title" className="block text-sm font-medium text-gray-700">Etkinlik Adı</label>
                        <input
                          type="text"
                          id="event-title"
                          name="title"
                          value={eventFormData.title}
                          onChange={handleEventFormChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                          placeholder="Etkinlik adı"
                        />
                      </div>
                      <div>
                        <label htmlFor="event-date" className="block text-sm font-medium text-gray-700">Tarih</label>
                        <input
                          type="date"
                          id="event-date"
                          name="date"
                          value={eventFormData.date}
                          onChange={handleEventFormChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                        />
                      </div>
                      <div>
                        <label htmlFor="event-time" className="block text-sm font-medium text-gray-700">Saat</label>
                        <input
                          type="time"
                          id="event-time"
                          name="time"
                          value={eventFormData.time}
                          onChange={handleEventFormChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                        />
                      </div>
                      <div>
                        <label htmlFor="event-location" className="block text-sm font-medium text-gray-700">Konum</label>
                        <input
                          type="text"
                          id="event-location"
                          name="location"
                          value={eventFormData.location}
                          onChange={handleEventFormChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                          placeholder="Etkinlik konumu"
                        />
                      </div>
                      <div>
                        <label htmlFor="event-status" className="block text-sm font-medium text-gray-700">Durum</label>
                        <select
                          id="event-status"
                          name="status"
                          value={eventFormData.status}
                          onChange={handleEventFormChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                        >
                          <option value="upcoming" className="text-black bg-white">Yaklaşan</option>
                          <option value="completed" className="text-black bg-white">Tamamlandı</option>
                          <option value="cancelled" className="text-black bg-white">İptal Edildi</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="event-image" className="block text-sm font-medium text-gray-700">Görsel</label>
                        <input
                          type="file"
                          id="event-image"
                          name="image"
                          onChange={handleEventFileChange}
                          accept="image/*"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="event-description" className="block text-sm font-medium text-gray-700">Açıklama</label>
                      <textarea
                        id="event-description"
                        name="description"
                        value={eventFormData.description}
                        onChange={handleEventFormChange}
                        required
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                        placeholder="Etkinlik açıklaması"
                      ></textarea>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEventFormData({
                            title: '',
                            description: '',
                            date: '',
                            time: '',
                            location: '',
                            status: 'upcoming',
                            image: null
                          });
                          setSelectedEvent(null);
                          setIsEventEditing(false);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {isEventEditing ? 'Güncelle' : 'Ekle'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-black">Etkinlik Listesi</h2>
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    onClick={() => {
                      setEventFormData({
                        title: '',
                        description: '',
                        date: '',
                        time: '',
                        location: '',
                        status: 'upcoming',
                        image: null
                      });
                      setSelectedEvent('new');
                      setIsEventEditing(false);
                    }}
                  >
                    Yeni Etkinlik Ekle
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Etkinlik Adı
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tarih
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durum
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {events.map((event) => (
                        <tr key={event.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{event.date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              event.status === 'completed' ? 'bg-green-100 text-green-800' : event.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {event.status === 'completed' ? 'Tamamlandı' : event.status === 'cancelled' ? 'İptal' : 'Planlandı'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3" onClick={() => editEvent(event.id)}>Düzenle</button>
                            <button className="text-red-600 hover:text-red-900" onClick={() => deleteEvent(event.id)}>Sil</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeMenuItem === 'gallery' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-black">Galeri Yönetimi</h2>
              
              {/* Galeri Listesi */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-black">Galeri Öğeleri</h3>
                
                {isLoading && galleryItems.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="spinner"></div>
                    <p className="mt-2 text-gray-600">Galeri öğeleri yükleniyor...</p>
                  </div>
                ) : galleryItems.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">Henüz galeri öğesi bulunmuyor.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {galleryItems.map((item) => (
                      <div key={item.id} className="border rounded-lg overflow-hidden bg-white">
                        <div className="relative h-48">
                          <Image
                            src={item.image || '/images/placeholder.jpg'}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-black">{item.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{item.category} - {item.date}</p>
                          <p className="text-sm text-gray-700 mb-4 line-clamp-2">{item.description}</p>
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => editGalleryItem(item.id)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => deleteGalleryItem(item.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Galeri Öğesi Ekleme/Düzenleme Formu */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-black">
                  {isGalleryEditing ? 'Galeri Öğesi Düzenle' : 'Yeni Galeri Öğesi Ekle'}
                </h3>
                <div className="mb-4">
                  <form onSubmit={isGalleryEditing ? updateGalleryItem : addGalleryItem}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label htmlFor="gallery-title" className="block text-sm font-medium text-gray-700">Başlık</label>
                        <input
                          type="text"
                          id="gallery-title"
                          name="title"
                          value={galleryFormData.title}
                          onChange={handleGalleryFormChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                          placeholder="Galeri öğesi başlığı"
                        />
                      </div>
                      <div>
                        <label htmlFor="gallery-category" className="block text-sm font-medium text-gray-700">Kategori</label>
                        <select
                          id="gallery-category"
                          name="category"
                          value={galleryFormData.category}
                          onChange={handleGalleryFormChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                          required
                        >
                          <option value="" className="text-black bg-white">Kategori Seçin</option>
                          <option value="etkinlik" className="text-black bg-white">Etkinlik</option>
                          <option value="okul" className="text-black bg-white">Okul</option>
                          <option value="öğrenci" className="text-black bg-white">Öğrenci</option>
                          <option value="spor" className="text-black bg-white">Spor</option>
                          <option value="sanat" className="text-black bg-white">Sanat</option>
                          <option value="diğer" className="text-black bg-white">Diğer</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="gallery-date" className="block text-sm font-medium text-gray-700">Tarih</label>
                        <input
                          type="date"
                          id="gallery-date"
                          name="date"
                          value={galleryFormData.date}
                          onChange={handleGalleryFormChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                        />
                      </div>
                      <div>
                        <label htmlFor="gallery-image" className="block text-sm font-medium text-gray-700">Görsel</label>
                        <input
                          type="file"
                          id="gallery-image"
                          name="image"
                          onChange={handleGalleryFileChange}
                          accept="image/*"
                          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          required={!isGalleryEditing}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="gallery-description" className="block text-sm font-medium text-gray-700">Açıklama</label>
                      <textarea
                        id="gallery-description"
                        name="description"
                        value={galleryFormData.description}
                        onChange={handleGalleryFormChange}
                        rows={4}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-black"
                        placeholder="Galeri öğesi açıklaması"
                      ></textarea>
                    </div>
                    <div className="flex justify-end space-x-3">
                      {isGalleryEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            setGalleryFormData({
                              title: '',
                              description: '',
                              category: '',
                              date: '',
                              image: null
                            });
                            setSelectedGalleryItem(null);
                            setIsGalleryEditing(false);
                          }}
                          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          İptal
                        </button>
                      )}
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {isGalleryEditing ? 'Güncelle' : 'Ekle'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
          
          {activeMenuItem === 'page-home' && (
            <PageContentManagement isActive={activeMenuItem === 'page-home'} initialPage="home" />
          )}
          
          {activeMenuItem === 'page-about' && (
            <PageContentManagement isActive={activeMenuItem === 'page-about'} initialPage="about" />
          )}
          
          {activeMenuItem === 'why-us' && (
            <WhyUsManagement isActive={activeMenuItem === 'why-us'} />
          )}
          
          {activeMenuItem === 'page-teachers' && (
            <PageContentManagement isActive={activeMenuItem === 'page-teachers'} initialPage="teachers" />
          )}
          
          {activeMenuItem === 'page-events' && (
            <PageContentManagement isActive={activeMenuItem === 'page-events'} initialPage="events" />
          )}
          
          {activeMenuItem === 'page-gallery' && (
            <PageContentManagement isActive={activeMenuItem === 'page-gallery'} initialPage="gallery" />
          )}
          
          {activeMenuItem === 'page-menu' && (
            <PageContentManagement isActive={activeMenuItem === 'page-menu'} initialPage="menu" />
          )}
          
          {activeMenuItem === 'page-contact' && (
            <PageContentManagement isActive={activeMenuItem === 'page-contact'} initialPage="contact" />
          )}
          
          {activeMenuItem === 'page-pricing' && (
            <PageContentManagement isActive={activeMenuItem === 'page-pricing'} initialPage="pricing" />
          )}
          
          {activeMenuItem === 'menu' && (
            <MenuManagement isActive={activeMenuItem === 'menu'} />
          )}
          
          {activeMenuItem === 'sliders' && (
            <SliderManagement isActive={activeMenuItem === 'sliders'} />
          )}
          
          {activeMenuItem === 'contact' && (
            <ContactInfoManagement isActive={activeMenuItem === 'contact'} />
          )}
          
          {activeMenuItem === 'messages' && (
            <ContactMessagesManagement isActive={activeMenuItem === 'messages'} />
          )}

          {activeMenuItem === 'announcements' && (
            <AnnouncementsManagement isActive={activeMenuItem === 'announcements'} />
          )}

          {activeMenuItem === 'pricing' && (
            <PricingManagement isActive={activeMenuItem === 'pricing'} />
          )}

          {activeMenuItem === 'achievements' && (
            <AchievementsManagement isActive={activeMenuItem === 'achievements'} />
          )}
          
          {activeMenuItem === 'site-settings' && (
            <SiteSettingsManagement isActive={activeMenuItem === 'site-settings'} />
          )}

          
        </div>
      </div>
    </div>
  );
} 