'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCloudinaryUrl } from '@/lib/cloudinary';

/**
 * Cloudinary görüntülerini göstermek için bileşen
 * @param {Object} props - Bileşen özellikleri
 * @param {string} props.publicId - Görüntünün Cloudinary public ID'si
 * @param {number} props.width - Görüntü genişliği
 * @param {number} props.height - Görüntü yüksekliği
 * @param {string} props.alt - Görüntü alternatif metni
 * @param {Object} props.options - Cloudinary dönüştürme seçenekleri
 * @param {Object} props.imgProps - Next.js Image bileşenine geçirilecek ek özellikler
 */
const CloudinaryImage = ({
  publicId,
  width = 800,
  height = 600,
  alt = '',
  options = {},
  imgProps = {},
  className = '',
}) => {
  const [imageUrl, setImageUrl] = useState('');
  
  useEffect(() => {
    if (publicId) {
      const url = getCloudinaryUrl(publicId, {
        width,
        height,
        crop: 'fill',
        ...options,
      });
      setImageUrl(url);
    }
  }, [publicId, width, height, options]);
  
  if (!imageUrl) {
    return <div className={`bg-gray-200 animate-pulse ${className}`} style={{ width, height }} />;
  }
  
  return (
    <Image
      src={imageUrl}
      width={width}
      height={height}
      alt={alt}
      className={className}
      {...imgProps}
    />
  );
};

export default CloudinaryImage; 