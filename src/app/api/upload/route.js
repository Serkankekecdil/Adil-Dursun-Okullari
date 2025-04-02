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
    const { base64Image, folder = 'okul-tanitim', resourceType = 'image' } = data;

    if (!base64Image) {
      return NextResponse.json(
        { error: 'Base64 formatında resim gereklidir' },
        { status: 400 }
      );
    }

    // Cloudinary'ye yükle
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64Image,
        { folder, resource_type: resourceType },
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