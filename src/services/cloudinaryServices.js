import { v2 as cloudinary } from 'cloudinary';

// Cloudinary yapılandırması
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Dosyayı Cloudinary'ye yükler
 * @param {File} file - Yüklenecek dosya
 * @param {string} folder - Cloudinary klasör yolu
 * @param {string} resourceType - Kaynak tipi (image, video, raw, auto)
 * @returns {Promise<Object>} - Yükleme sonucu
 */
export const uploadToCloudinary = async (file, folder = 'okul-tanitim', resourceType = 'image') => {
  try {
    // Dosyayı base64 formatına dönüştür
    const base64Data = await fileToBase64(file);
    
    // Cloudinary'ye yükle
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64Data,
        {
          folder,
          resource_type: resourceType,
          public_id: `${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}`, // Benzersiz isim oluştur
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    return {
      success: true,
      downloadURL: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type
    };
  } catch (error) {
    console.error('Cloudinary yükleme hatası:', error);
    throw error;
  }
};

/**
 * Cloudinary'den dosya siler
 * @param {string} publicId - Silinecek dosyanın public ID'si
 * @param {string} resourceType - Kaynak tipi (image, video, raw)
 * @returns {Promise<Object>} - Silme sonucu
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: resourceType },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    return {
      success: result.result === 'ok',
      result: result.result
    };
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