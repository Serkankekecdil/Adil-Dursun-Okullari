// Cloudinary entegrasyonu için yardımcı fonksiyonlar
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary yapılandırması
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Cloudinary'ye resim yüklemek için fonksiyon
 * @param {File} file - Yüklenecek dosya
 * @param {string} folder - Cloudinary'deki klasör adı
 * @returns {Promise<string>} - Yüklenen resmin URL'si
 */
export const uploadImage = async (file, folder = 'adil-dursun-okullari') => {
  try {
    // Dosyayı base64 formatına dönüştür
    const base64Data = await convertToBase64(file);
    
    // Cloudinary'ye yükle
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64Data,
        { folder },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Resim yükleme hatası:', error);
    throw new Error('Resim yüklenirken bir hata oluştu');
  }
};

/**
 * Dosyayı base64 formatına dönüştürmek için yardımcı fonksiyon
 * @param {File} file - Dönüştürülecek dosya
 * @returns {Promise<string>} - Base64 formatında dosya
 */
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Cloudinary'den resim almak için URL oluşturucu
 * @param {string} publicId - Resmin public ID'si
 * @param {Object} options - Dönüşüm seçenekleri
 * @returns {string} - Dönüştürülmüş resim URL'si
 */
export const getImageUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, options);
};

export default cloudinary; 