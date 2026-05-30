'use client';

export interface ProductFormData {
  name: string;
  brand: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  tag: string;
  scentGroup?: string;
  concentration?: string;
  segment?: string;
  categories?: string;
  rating: number;
  reviewsCount: number;
  size: string;
  quantityInStock: number;
  discountPercentage: number;
  discountStartDate?: Date | null | string;
  discountEndDate?: Date | null | string;
  metaTitle: string;
  metaDescription: string;
  keywords?: string[] | string;
  slug?: string;
  priceReport?: string;
  sizeReport?: string;
  discountReport?: string;
}

export interface Brand {
  _id: string;
  name: string;
  status: 'active' | 'inactive';
}

export interface TagItem {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
}

export const SIZE_CATEGORIES = [
  { name: 'Chiết/Sample (dùng thử)', nameEn: 'Decant/Sample (trial)', sizes: ['2ml', '5ml', '10ml'] },
  { name: 'Size nhỏ', nameEn: 'Small Size', sizes: ['30ml'] },
  { name: 'Size tiêu chuẩn', nameEn: 'Standard Size', sizes: ['50ml', '100ml'] },
  { name: 'Size lớn', nameEn: 'Large Size', sizes: ['150ml', '200ml'] }
];

export const EMPTY_FORM: ProductFormData = {
  name: '', brand: '', price: 0, image: '', images: [] as string[],
  description: '', tag: '', scentGroup: '', concentration: '', segment: '',
  categories: '', rating: 5, reviewsCount: 0, size: '', quantityInStock: 0,
  discountPercentage: 0, discountStartDate: null as Date | null,
  discountEndDate: null as Date | null, metaTitle: '', metaDescription: '',
  keywords: '', slug: '', priceReport: '', sizeReport: '', discountReport: '',
};