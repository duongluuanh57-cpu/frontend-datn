'use client';

import api from '@/lib/api';
import type { ProductFormData } from './productFormTypes';
import { SIZE_CATEGORIES } from './productFormTypes';

export function toFormState(data?: ProductFormData): ProductFormData {
  if (!data) {
    return {
      name: '', brand: '', price: 0, image: '', images: [] as string[],
      description: '', tag: '', scentGroup: '', concentration: '', segment: '',
      categories: '', rating: 5, reviewsCount: 0, size: '', quantityInStock: 0,
      discountPercentage: 0, discountStartDate: null as Date | null,
      discountEndDate: null as Date | null, metaTitle: '', metaDescription: '',
      keywords: '', slug: '', priceReport: '', sizeReport: '', discountReport: '',
    };
  }
  return {
    name: data.name ?? '', brand: data.brand ?? '', price: data.price ?? 0,
    image: data.image ?? '', images: data.images ?? [],
    description: data.description ?? '', tag: data.tag ?? '',
    scentGroup: data.scentGroup ?? '', concentration: data.concentration ?? '',
    segment: data.segment ?? '', categories: data.categories ?? '',
    rating: data.rating ?? 5, reviewsCount: data.reviewsCount ?? 0,
    size: data.size ?? '', quantityInStock: data.quantityInStock ?? 0,
    discountPercentage: data.discountPercentage ?? 0,
    discountStartDate: data.discountStartDate ? new Date(data.discountStartDate) : null,
    discountEndDate: data.discountEndDate ? new Date(data.discountEndDate) : null,
    metaTitle: data.metaTitle ?? '', metaDescription: data.metaDescription ?? '',
    keywords: Array.isArray(data.keywords) ? data.keywords.join(', ') : (data.keywords ?? ''),
    slug: data.slug ?? '',
    priceReport: data.priceReport ?? '', sizeReport: data.sizeReport ?? '',
    discountReport: data.discountReport ?? '',
  };
}

export const formatSizeString = (sizeStr: string) => {
  if (!sizeStr) return '';
  return sizeStr.split(',').map(item => {
    const parts = item.trim().split(':');
    const sz = parts[0];
    const pr = parts[1];
    if (pr) {
      const num = parseInt(pr);
      if (!isNaN(num)) return `${sz} (${num.toLocaleString('vi-VN')}đ)`;
    }
    return sz;
  }).join(', ');
};

export const parseExplanation = (text: string) => {
  if (!text) return [];
  const sections = text.split(/\*\*(?=\d\.)/);
  return sections.map((sec) => sec.trim()).filter(Boolean).filter((sec) => /^\d\./.test(sec)).map((sec) => {
    const lines = sec.split('\n');
    let titleLine = lines[0].replace(/\*\*/g, '').trim();
    let content = lines.slice(1).join('\n').trim();
    if (titleLine.length > 80 && titleLine.includes(':')) {
      const colonIndex = titleLine.indexOf(':');
      const realTitle = titleLine.substring(0, colonIndex + 1).trim();
      const firstBullet = titleLine.substring(colonIndex + 1).trim();
      titleLine = realTitle;
      content = firstBullet + (content ? '\n' + content : '');
    }
    return { title: titleLine, content };
  });
};

export const slugify = (text: string): string => {
  const vietnameseMap: Record<string, string> = {
    à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a', ă: 'a', ắ: 'a', ằ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a',
    â: 'a', ấ: 'a', ầ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a', è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
    ê: 'e', ế: 'e', ề: 'e', ể: 'e', ễ: 'e', ệ: 'e', ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
    ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o', ô: 'o', ố: 'o', ổ: 'o', ỗ: 'o', ộ: 'o',
    ơ: 'o', ớ: 'o', ờ: 'o', ở: 'o', ỡ: 'o', ợ: 'o', ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
    ư: 'u', ứ: 'u', ừ: 'u', ử: 'u', ữ: 'u', ự: 'u', ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y', đ: 'd',
  };
  return text.toString().toLowerCase().trim()
    .replace(/[^\u0000-\u007E]/g, (char) => vietnameseMap[char] ?? '')
    .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '') || `product-${Date.now()}`;
};

/**
 * Helper function để upload base64 strings lên R2
 * Chỉ upload các string bắt đầu bằng "data:image" (chưa upload)
 */
export async function uploadBase64ImagesToR2(
  images: string[],
  folder: string
): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (const image of images) {
    // Nếu là URL từ R2 rồi thì giữ nguyên
    if (!image.startsWith('data:image')) {
      uploadedUrls.push(image);
      continue;
    }

    try {
      // Convert base64 to blob
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });

      // Upload lên R2
      const formData = new FormData();
      formData.append('image', file);
      formData.append('maxWidth', '1920');
      formData.append('quality', '100');
      formData.append('folder', folder);

      const { data } = await api.post('/media/upload-r2', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success && data.data.url) {
        uploadedUrls.push(data.data.url);
      } else {
        uploadedUrls.push(image);
      }
    } catch (err) {
      console.error('Failed to upload base64 image:', err);
      uploadedUrls.push(image);
    }
  }

  return uploadedUrls;
}