'use client';

import { useState, useEffect } from 'react';
import CloudinaryImage from '@/components/CloudinaryImage';
import ImageUploadForm from '@/components/ImageUploadForm';

const MediaPage = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Yükleme başarılı olduğunda
  const handleUploadSuccess = (result) => {
    setUploadedImages((prev) => [result, ...prev]);
    setSelectedImage(result);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Medya Yönetimi</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Yeni Görüntü Yükle</h2>
            <ImageUploadForm 
              onUploadSuccess={handleUploadSuccess} 
              folder="adil-dursun-okullari"
              useDynamicFolder={true}
            />
          </div>
          
          {selectedImage && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Seçili Görüntü Bilgileri</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dosya Adı</h3>
                  <p className="mt-1">{selectedImage.original_filename}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Public ID</h3>
                  <div className="mt-1 flex items-center">
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm flex-1 overflow-x-auto">
                      {selectedImage.public_id}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedImage.public_id)}
                      className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Kopyala
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">URL</h3>
                  <div className="mt-1 flex items-center">
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm flex-1 overflow-x-auto">
                      {selectedImage.secure_url}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedImage.secure_url)}
                      className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Kopyala
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Boyut</h3>
                  <p className="mt-1">{Math.round(selectedImage.bytes / 1024)} KB</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Boyutlar</h3>
                  <p className="mt-1">{selectedImage.width} x {selectedImage.height} piksel</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Yüklenen Görüntüler</h2>
            
            {uploadedImages.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                Henüz yüklenen görüntü yok. Yeni bir görüntü yükleyin.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedImages.map((image) => (
                  <div 
                    key={image.public_id} 
                    className={`relative group cursor-pointer rounded-md overflow-hidden border-2 ${
                      selectedImage && selectedImage.public_id === image.public_id 
                        ? 'border-blue-500' 
                        : 'border-transparent'
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <CloudinaryImage
                      publicId={image.public_id}
                      width={300}
                      height={200}
                      alt={image.original_filename}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="p-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(image.public_id);
                          }}
                          className="bg-white text-gray-800 px-3 py-1 rounded-md text-sm mr-2 hover:bg-gray-100"
                        >
                          ID Kopyala
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate p-2">
                      {image.original_filename}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 dark:bg-blue-900 p-4 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Cloudinary Kullanımı</h3>
        <p className="mb-2">Görüntüleri sayfalarınızda göstermek için:</p>
        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-sm">
          {`import CloudinaryImage from '@/components/CloudinaryImage';
          
<CloudinaryImage
  publicId="${selectedImage ? selectedImage.public_id : 'görüntü_public_id'}"
  width={800}
  height={600}
  alt="Görüntü açıklaması"
/>`}
        </pre>
      </div>
    </div>
  );
};

export default MediaPage; 