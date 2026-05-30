'use client';

import { usePublicProducts } from '@/hooks/usePublicProducts';

export function useTrendingProducts(filterTag: string = 'trending') {
  return usePublicProducts('trending', 'TrendingProducts', filterTag);
}
