export interface ProductData {
  _id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  description: string;
  tag?: string;
  rating?: number;
  reviewsCount?: number;
  quantityInStock?: number;
  discountPercentage?: number;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  keywords?: string[];
  size?: string;
  scentGroup?: string;
  concentration?: string;
  segment?: string;
}