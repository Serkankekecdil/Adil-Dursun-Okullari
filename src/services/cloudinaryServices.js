import { v2 as cloudinary } from 'cloudinary';

// Cloudinary yapılandırması - artık sadece silme işlemleri için kullanılacak
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgqgya9ci',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '376746841873317',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'qZduIfb5UVKJLBtoiKCK3QFC5AM',
  secure: true
});

/**
 * Cloudinary'ye dosya yüklemek için fonksiyon
 * @param {File} file - Yüklenecek dosya
 * @param {string} folder - Cloudinary'deki klasör adı
 * @param {string} resourceType - Kaynak tipi (image, video, raw, auto)
 * @returns {Promise<Object>} - Yükleme sonucu (url ve publicId içerir)
 */
export const uploadToCloudinary = async (file, folder = 'okul-tanitim', resourceType = 'image') => {
  try {
    // Dosyayı base64 formatına dönüştür
    const base64Data = await fileToBase64(file);
    
    // API rotasını kullanarak yükleme yap
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image: base64Data,
        folder,
        resourceType
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Yükleme başarısız oldu');
    }

    const result = await response.json();
    return {
      url: result.url,
      publicId: result.publicId
    };
  } catch (error) {
    console.error('Cloudinary yükleme hatası:', error);
    throw error;
  }
};

/**
 * Cloudinary'den dosya silmek için fonksiyon
 * @param {string} publicId - Silinecek dosyanın public ID'si
 * @param {string} resourceType - Kaynak tipi (image, video, raw, auto)
 * @returns {Promise<Object>} - Silme sonucu
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    // API rotasını kullanarak silme işlemi yap
    const response = await fetch('/api/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicId,
        resourceType
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Silme işlemi başarısız oldu');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Cloudinary silme hatası:', error);
    throw error;
  }
};

/**
 * Dosyayı base64 formatına dönüştürür
 * @param {File} file - Dönüştürülecek dosya
 * @returns {Promise<string>} - Base64 formatında dosya
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary
}; 