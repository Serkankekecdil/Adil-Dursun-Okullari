import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import cloudinaryConfig from '@/lib/cloudinaryConfig';

// Cloudinary yapılandırması
cloudinary.config({
  cloud_name: cloudinaryConfig.cloudName,
  api_key: cloudinaryConfig.apiKey,
  api_secret: cloudinaryConfig.apiSecret,
  secure: true
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || cloudinaryConfig.folder;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Dosya gereklidir' },
        { status: 400 }
      );
    }
    
    // Dosyayı buffer'a dönüştür
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Base64'e dönüştür
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    // Cloudinary'ye yükle
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64String,
        { folder },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Cloudinary yükleme hatası:', error);
    return NextResponse.json(
      { error: 'Dosya yüklenirken bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
} 