'use client';

import { usePublicProducts } from '@/hooks/usePublicProducts';

export function useNewProducts(filterTag: string = 'new') {
  return usePublicProducts('new', 'NewProducts', filterTag);
}
