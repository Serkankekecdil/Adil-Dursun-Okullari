import { v2 as cloudinary } from 'cloudinary';

// Cloudinary yapılandırması
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Cloudinary'ye dosya yükler
 * @param {File} file - Yüklenecek dosya
 * @param {string} folder - Cloudinary'deki klasör yolu
 * @returns {Promise<Object>} - Yükleme sonucu
 */
export const uploadToCloudinary = async (file, folder = 'adil-dursun-okullari') => {
  try {
    // Dosyayı base64 formatına dönüştür
    const fileBuffer = await file.arrayBuffer();
    const base64File = Buffer.from(fileBuffer).toString('base64');
    const base64Data = `data:${file.type};base64,${base64File}`;
    
    // Cloudinary'ye yükle
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64Data,
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        }
      );
    });
    
    return result;
  } catch (error) {
    console.error('Cloudinary yükleme hatası:', error);
    throw new Error('Dosya yüklenirken bir hata oluştu');
  }
};

/**
 * Cloudinary'den görüntü URL'si oluşturur
 * @param {string} publicId - Görüntünün public ID'si
 * @param {Object} options - Dönüştürme seçenekleri
 * @returns {string} - Görüntü URL'si
 */
export const getCloudinaryUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 800,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  return cloudinary.url(publicId, mergedOptions);
};

/**
 * Cloudinary'den görüntü siler
 * @param {string} publicId - Silinecek görüntünün public ID'si
 * @returns {Promise<Object>} - Silme sonucu
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      });
    });
    
    return result;
  } catch (error) {
    console.error('Cloudinary silme hatası:', error);
    throw new Error('Dosya silinirken bir hata oluştu');
  }
};

export default cloudinary; 