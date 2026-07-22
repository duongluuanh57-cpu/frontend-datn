'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { fetchNavbarData } from '@/lib/graphql';

export interface ProductSuggestion {
  _id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
}

export interface BrandSuggestion {
  _id: string;
  name: string;
  logo: string;
}

export interface UseSearchSuggestionsReturn {
  suggestions: ProductSuggestion[];
  brandResults: BrandSuggestion[];
  isLoading: boolean;
  isOpen: boolean;
  query: string;
  setQuery: (q: string) => void;
  open: () => void;
  close: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function extractArray(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.products)) return data.products;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

export function useSearchSuggestions(): UseSearchSuggestionsReturn {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // ═══ GraphQL: 1 query thay thế 2 REST (trending + brands) ═══
  const { data: navbarData, isLoading: isLoadingNavbar } = useQuery({
    queryKey: ['navbar'],
    queryFn: async () => {
      try {
        return await fetchNavbarData();
      } catch {
        return { trending: [], brandNames: [] };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const trendingList = navbarData?.trending || [];
  const brandNames = navbarData?.brandNames || [];

  // Sync brand names when navbar data loads
  useEffect(() => {
    if (brandNames.length > 0) {
      setBrands(brandNames);
    }
  }, [brandNames]);

  // Fetch suggestions based on query (vẫn dùng REST vì cần auth + params động)
  const { data: searchData, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['searchSuggestions', query],
    queryFn: async () => {
      const trimmed = query.trim();
      if (!trimmed) return null;
      const { data } = await api.get('/products/suggest', { params: { q: trimmed, limit: 8 } });
      return data;
    },
    enabled: isOpen && query.trim().length > 0,
    staleTime: 30 * 1000,
  });

  const searchList = extractArray(searchData);

  const suggestions: ProductSuggestion[] = query.trim().length > 0
    ? (Array.isArray(searchData) ? searchData : (searchData?.data?.products || searchData?.products || [])).map((p: any) => ({
        _id: p._id || p.id,
        name: p.name,
        brand: p.brand || (p.brandId?.name) || '',
        price: typeof p.price === 'number' ? p.price : Number(p.price) || 0,
        originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
        discount: p.discount ? Number(p.discount) : 0,
        image: p.image || p.images?.[0] || '',
      }))
    : trendingList.map((p: any) => ({
        _id: p._id || p.id,
        name: p.name,
        brand: p.brand || (p.brandId?.name) || '',
        price: typeof p.price === 'number' ? p.price : Number(p.price) || 0,
        originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
        discount: p.discount ? Number(p.discount) : 0,
        image: p.image || p.images?.[0] || '',
      }));

  const brandResults: BrandSuggestion[] = query.trim().length > 0
    ? (searchData?.data?.brands || searchData?.brands || []).map((b: any) => ({
        _id: b._id,
        name: b.name,
        logo: b.logo || '',
      }))
    : [];

  const isLoading = query.trim().length > 0 ? isLoadingSearch : isLoadingNavbar;

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, close]);

  return {
    suggestions,
    brandResults,
    isLoading,
    isOpen,
    query,
    setQuery,
    open,
    close,
    containerRef,
  };
}