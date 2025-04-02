'use client';

import { useState } from 'react';

/**
 * Cloudinary'ye görüntü yüklemek için form bileşeni
 * @param {Object} props - Bileşen özellikleri
 * @param {Function} props.onUploadSuccess - Yükleme başarılı olduğunda çağrılacak fonksiyon
 * @param {string} props.folder - Cloudinary'deki klasör yolu
 * @param {boolean} props.useDynamicFolder - Dinamik klasör kullanılsın mı
 */
const ImageUploadForm = ({ 
  onUploadSuccess, 
  folder = 'adil-dursun-okullari',
  useDynamicFolder = true,
  className = '',
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [customFolder, setCustomFolder] = useState('');
  
  // Dosya seçildiğinde
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    
    if (!selectedFile) {
      setFile(null);
      setPreview('');
      return;
    }
    
    // Dosya türünü kontrol et
    if (!selectedFile.type.startsWith('image/')) {
      setError('Lütfen bir görüntü dosyası seçin');
      setFile(null);
      setPreview('');
      return;
    }
    
    // Dosya boyutunu kontrol et (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu 10MB\'dan küçük olmalıdır');
      setFile(null);
      setPreview('');
      return;
    }
    
    setFile(selectedFile);
    
    // Önizleme oluştur
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };
  
  // Form gönderildiğinde
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Lütfen bir dosya seçin');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      // Klasör yolunu belirle
      const uploadFolder = useDynamicFolder && customFolder 
        ? `${folder}/${customFolder}` 
        : folder;
      
      // Cloudinary'nin unsigned upload preset'ini kullanarak doğrudan yükleme yap
      const cloudName = 'dgqgya9ci';
      const uploadPreset = 'adil_dursun_preset'; // Cloudinary'de oluşturduğunuz preset adı
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', uploadFolder);
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Yükleme başarısız oldu');
      }
      
      const result = await response.json();
      
      if (onUploadSuccess) {
        onUploadSuccess({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
      
      // Formu sıfırla
      setFile(null);
      setPreview('');
      setCustomFolder('');
    } catch (error) {
      console.error('Yükleme hatası:', error);
      setError('Dosya yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Görüntü Yükle
        </label>
        
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0 file:text-sm file:font-semibold
                     file:bg-burgundy-50 file:text-burgundy-700 hover:file:bg-burgundy-100
                     dark:file:bg-burgundy-900 dark:file:text-burgundy-200 dark:text-gray-300"
          disabled={isUploading}
        />
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
      
      {useDynamicFolder && (
        <div className="space-y-2">
          <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Alt Klasör (isteğe bağlı)
          </label>
          
          <input
            type="text"
            id="folder-name"
            value={customFolder}
            onChange={(e) => setCustomFolder(e.target.value)}
            placeholder="örn: etkinlikler, öğretmenler, galeri"
            className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                      focus:outline-none focus:ring-2 focus:ring-burgundy-700"
            disabled={isUploading}
          />
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Görüntüyü yüklemek istediğiniz alt klasörü belirtin. Boş bırakırsanız, ana klasöre yüklenecektir.
          </p>
        </div>
      )}
      
      {preview && (
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Önizleme:</p>
          <img
            src={preview}
            alt="Yükleme önizlemesi"
            className="max-w-full h-auto max-h-64 rounded-md"
          />
        </div>
      )}
      
      <button
        type="submit"
        className="px-4 py-2 bg-burgundy-700 text-white rounded-md hover:bg-burgundy-800 focus:outline-none focus:ring-2 focus:ring-burgundy-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!file || isUploading}
      >
        {isUploading ? 'Yükleniyor...' : 'Yükle'}
      </button>
    </form>
  );
};

export default ImageUploadForm; 