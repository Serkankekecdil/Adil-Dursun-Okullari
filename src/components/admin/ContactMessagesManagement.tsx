'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  getCollection, 
  updateDocument, 
  deleteDocument 
} from '@/firebase/firebaseServices';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
  createdAt: any; // Firebase Timestamp veya string
  status: 'new' | 'read' | 'replied' | 'archived';
  read?: boolean;
}

export default function ContactMessagesManagement({ isActive }: { isActive: boolean }) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied' | 'archived'>('all');

  useEffect(() => {
    if (isActive) {
      fetchMessages();
    }
  }, [isActive]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const messagesData = await getCollection('contactMessages');
      
      // Mesajları tarih sırasına göre sırala
      const sortedMessages = messagesData
        .sort((a, b) => {
          // Tarih karşılaştırması - en yeni en üstte
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt).getTime();
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt).getTime();
          return dateB - dateA;
        })
        .map(data => ({
          id: data.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          subject: data.subject || '',
          message: data.message || '',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          status: data.status || 'new',
          read: data.read || false
        }));
      
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Mesajlar alınırken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await updateDocument('contactMessages', messageId, {
        status: 'read'
      });
      
      // Yerel state'i güncelle
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ));
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: 'read' });
      }
    } catch (error) {
      console.error('Mesaj durumu güncelleme hatası:', error);
    }
  };

  const markAsReplied = async (messageId: string) => {
    try {
      await updateDocument('contactMessages', messageId, {
        status: 'replied'
      });
      
      // Yerel state'i güncelle
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'replied' } : msg
      ));
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: 'replied' });
      }
    } catch (error) {
      console.error('Mesaj durumu güncelleme hatası:', error);
    }
  };

  const archiveMessage = async (messageId: string) => {
    try {
      await updateDocument('contactMessages', messageId, {
        status: 'archived'
      });
      
      // Yerel state'i güncelle
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'archived' } : msg
      ));
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: 'archived' });
      }
    } catch (error) {
      console.error('Mesaj arşivleme hatası:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (window.confirm('Bu mesajı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        await deleteDocument('contactMessages', messageId);
        
        // Yerel state'i güncelle
        setMessages(messages.filter(msg => msg.id !== messageId));
        
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
      } catch (error) {
        console.error('Mesaj silme hatası:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy HH:mm', { locale: tr });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Yeni</span>;
      case 'read':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Okundu</span>;
      case 'replied':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Yanıtlandı</span>;
      case 'archived':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Arşivlendi</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const filteredMessages = filter === 'all' 
    ? messages 
    : messages.filter(msg => msg.status === filter);

  if (!isActive) return null;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold text-black mb-6">İletişim Mesajları</h1>
      
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('all')}
          >
            Tümü ({messages.length})
          </button>
          <button
            className={`px-3 py-1 rounded-md ${filter === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('new')}
          >
            Yeni ({messages.filter(m => m.status === 'new').length})
          </button>
          <button
            className={`px-3 py-1 rounded-md ${filter === 'read' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('read')}
          >
            Okundu ({messages.filter(m => m.status === 'read').length})
          </button>
          <button
            className={`px-3 py-1 rounded-md ${filter === 'replied' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('replied')}
          >
            Yanıtlandı ({messages.filter(m => m.status === 'replied').length})
          </button>
          <button
            className={`px-3 py-1 rounded-md ${filter === 'archived' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('archived')}
          >
            Arşiv ({messages.filter(m => m.status === 'archived').length})
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Mesaj Listesi */}
        <div className="w-full md:w-1/2 overflow-auto max-h-[600px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Mesaj bulunamadı
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((message) => (
                <div 
                  key={message.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedMessage?.id === message.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (message.status === 'new') {
                      markAsRead(message.id);
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{message.name}</h3>
                    {getStatusBadge(message.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {message.subject ? message.subject : 'Ana Sayfa İletişim Formu'}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(message.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mesaj Detayı */}
        <div className="w-full md:w-1/2 bg-gray-50 p-4 rounded-lg">
          {selectedMessage ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedMessage.subject ? selectedMessage.subject : 'Ana Sayfa İletişim Formu'}
                </h2>
                <div className="flex space-x-2">
                  {selectedMessage.status === 'new' && (
                    <button
                      className="p-1 text-blue-600 hover:text-blue-800"
                      onClick={() => markAsRead(selectedMessage.id)}
                      title="Okundu olarak işaretle"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </button>
                  )}
                  {(selectedMessage.status === 'new' || selectedMessage.status === 'read') && (
                    <button
                      className="p-1 text-green-600 hover:text-green-800"
                      onClick={() => markAsReplied(selectedMessage.id)}
                      title="Yanıtlandı olarak işaretle"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </button>
                  )}
                  {selectedMessage.status !== 'archived' && (
                    <button
                      className="p-1 text-yellow-600 hover:text-yellow-800"
                      onClick={() => archiveMessage(selectedMessage.id)}
                      title="Arşivle"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </button>
                  )}
                  <button
                    className="p-1 text-red-600 hover:text-red-800"
                    onClick={() => deleteMessage(selectedMessage.id)}
                    title="Sil"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700 w-20">Gönderen:</span>
                  <span className="text-sm text-gray-900">{selectedMessage.name}</span>
                </div>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700 w-20">E-posta:</span>
                  <a href={`mailto:${selectedMessage.email}`} className="text-sm text-blue-600 hover:underline">{selectedMessage.email}</a>
                </div>
                {selectedMessage.phone && (
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700 w-20">Telefon:</span>
                    <a href={`tel:${selectedMessage.phone}`} className="text-sm text-blue-600 hover:underline">{selectedMessage.phone}</a>
                  </div>
                )}
                <div className="flex items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700 w-20">Tarih:</span>
                  <span className="text-sm text-gray-900">{formatDate(selectedMessage.createdAt)}</span>
                </div>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700 w-20">Durum:</span>
                  {getStatusBadge(selectedMessage.status)}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Mesaj:</h3>
                <div className="p-3 bg-white border border-gray-200 rounded-md text-sm text-gray-800 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`)}
                >
                  E-posta ile Yanıtla
                </button>
                {selectedMessage.phone && (
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    onClick={() => window.open(`tel:${selectedMessage.phone}`)}
                  >
                    Ara
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p>Detayları görüntülemek için bir mesaj seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 