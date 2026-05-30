import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import api from '@/lib/api';
import { Brand, Category } from '@/types/admin';
import { useProductFilterStore } from '@/store/useProductFilterStore';

export interface ProductFilterTag {
  _id: string;
  name: string;
  slug: string;
}

export function useProductFilters() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const isVi = locale === 'vi';

  const searchQuery = useProductFilterStore((s) => s.searchQuery);
  const setSearchQuery = useProductFilterStore((s) => s.setSearchQuery);
  const selectedBrand = useProductFilterStore((s) => s.selectedBrand);
  const setSelectedBrand = useProductFilterStore((s) => s.setSelectedBrand);
  const stockFilter = useProductFilterStore((s) => s.stockFilter);
  const setStockFilter = useProductFilterStore((s) => s.setStockFilter);
  const selectedTag = useProductFilterStore((s) => s.selectedTag);
  const setSelectedTag = useProductFilterStore((s) => s.setSelectedTag);
  const selectedCategory = useProductFilterStore((s) => s.selectedCategory);
  const setSelectedCategory = useProductFilterStore((s) => s.setSelectedCategory);
  const sortBy = useProductFilterStore((s) => s.sortBy);
  const setSortBy = useProductFilterStore((s) => s.setSortBy);
  const storeClearFilters = useProductFilterStore((s) => s.handleClearFilters);
  const handleClearFilters = () => {
    storeClearFilters();
    setBrandSearchQuery('');
  };

  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  const { data: allBrands } = useQuery({
    queryKey: ['admin-brands-list'],
    queryFn: async () => {
      const { data } = await api.get('/brands');
      return data.data as Brand[];
    },
    staleTime: 300_000,
  });

  const { data: brandCounts = {} } = useQuery({
    queryKey: ['admin-products-brand-counts'],
    queryFn: async () => {
      const { data } = await api.get('/products', {
        params: { page: 1, limit: 9999, fields: 'brand' }
      });
      const items = data?.data?.items ?? data?.data ?? [];
      if (!Array.isArray(items)) return {};
      const counts: Record<string, number> = {};
      for (const p of items) {
        const name = p.brand || 'Unknown';
        counts[name] = (counts[name] || 0) + 1;
      }
      return counts;
    },
    staleTime: 60_000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-product-categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return (data.data || []) as Category[];
    },
    staleTime: 300_000,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['admin-product-tags'],
    queryFn: async () => {
      const { data } = await api.get('/tags');
      return (data.data || []) as ProductFilterTag[];
    },
    staleTime: 60_000,
  });

  const brands = useMemo(() => {
    if (!allBrands) return [];
    return Array.from(new Set(allBrands.map(b => b.name).filter(Boolean)));
  }, [allBrands]);

  const filteredBrands = useMemo(() => {
    return brands.filter(brand =>
      brand.toLowerCase().includes(brandSearchQuery.toLowerCase())
    );
  }, [brands, brandSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    t, locale, isVi,
    searchQuery, setSearchQuery,
    selectedBrand, setSelectedBrand,
    stockFilter, setStockFilter,
    selectedTag, setSelectedTag,
    selectedCategory, setSelectedCategory,
    sortBy, setSortBy,
    isBrandDropdownOpen, setIsBrandDropdownOpen,
    brandSearchQuery, setBrandSearchQuery,
    brandDropdownRef,
    brands, filteredBrands,
    brandCounts,
    categories,
    tags,
    handleClearFilters,
  };
}

export type UseProductFiltersReturn = ReturnType<typeof useProductFilters>;
