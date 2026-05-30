'use client';

import { usePublicProducts } from '@/hooks/usePublicProducts';

export function useLimitedProducts(filterTag: string = 'limited') {
  return usePublicProducts('limited', undefined, filterTag);
}
