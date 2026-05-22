export interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  description: string;
  tag?: string;
  rating: number;
  reviewsCount: number;
  size: string;
  quantityInStock: number;
  discountPercentage: number;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  keywords?: string[] | string;
  soldCount?: number;
  priceReport?: string;
  sizeReport?: string;
  discountReport?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export interface Brand {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  origin?: string;
  status: 'active' | 'inactive';
  featured: boolean;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  passwordHash?: string;
  role: 'USER' | 'ADMIN' | 'SUBADMIN';
  memberTier: 'MEMBER' | 'Bac' | 'Vang' | 'KimCuong';
  totalSpent: number;
  tenantId?: string;
  status: 'active' | 'inactive' | 'suspended';
  twoFactorEnabled: boolean;
  fullName?: string;
  phoneNumber?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | '';
  address?: string;
  province?: string;
  district?: string;
  oauthProvider?: 'google' | 'github';
  oauthId?: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export type RoleFilter = 'ALL' | 'USER' | 'ADMIN' | 'SUBADMIN';

export interface UserFormData {
  username: string;
  email: string;
  password?: string;
  role: 'USER' | 'ADMIN' | 'SUBADMIN';
}

export interface TaxonomyItem {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  description?: string;
}

export type TabType = 'tags' | 'notes' | 'concentrations' | 'segments';


