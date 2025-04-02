import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary yapılandırması - sunucu tarafında güvenli bir şekilde yapılandırılır
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dgqgya9ci',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '376746841873317',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'qZduIfb5UVKJLBtoiKCK3QFC5AM',
  secure: true
});

export async function POST(request) {
  try {
    const data = await request.json();
    const { publicId, resourceType = 'image' } = data;

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID gereklidir' },
        { status: 400 }
      );
    }

    // Cloudinary'den sil
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

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Cloudinary silme hatası:', error);
    return NextResponse.json(
      { error: 'Dosya silinirken bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
} 