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
  role: 'USER' | 'ADMIN';
  avatar?: string;
  createdAt: string;
  twoFactorEnabled: boolean;
}

export type RoleFilter = 'ALL' | 'USER' | 'ADMIN';

export interface UserFormData {
  username: string;
  email: string;
  password?: string;
  role: 'USER' | 'ADMIN';
}

export interface TaxonomyItem {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  description?: string;
}

export type TabType = 'tags' | 'notes' | 'concentrations' | 'segments';


