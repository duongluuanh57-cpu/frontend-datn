import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import api from '@/lib/api';
import { Brand } from '@/types/admin';

export interface ProductFilterTag {
  _id: string;
  name: string;
  slug: string;
}

const FILTERS_STORAGE_KEY = 'adminProductFilters';

function loadSavedFilters(): { searchQuery: string; selectedBrand: string; stockFilter: string; selectedTag: string; sortBy: string } {
  if (typeof window === 'undefined') return { searchQuery: '', selectedBrand: '', stockFilter: 'all', selectedTag: 'all', sortBy: 'bestSeller' };
  try {
    const raw = sessionStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return { searchQuery: '', selectedBrand: '', stockFilter: 'all', selectedTag: 'all', sortBy: 'bestSeller' };
    const parsed = JSON.parse(raw);
    return {
      searchQuery: typeof parsed.searchQuery === 'string' ? parsed.searchQuery : '',
      selectedBrand: typeof parsed.selectedBrand === 'string' ? parsed.selectedBrand : '',
      stockFilter: typeof parsed.stockFilter === 'string' ? parsed.stockFilter : 'all',
      selectedTag: typeof parsed.selectedTag === 'string' ? parsed.selectedTag : 'all',
      sortBy: typeof parsed.sortBy === 'string' ? parsed.sortBy : 'bestSeller',
    };
  } catch {
    return { searchQuery: '', selectedBrand: '', stockFilter: 'all', selectedTag: 'all', sortBy: 'bestSeller' };
  }
}

export function useProductFilters() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const isVi = locale === 'vi';

  const saved = loadSavedFilters();

  const [searchQuery, setSearchQuery] = useState(saved.searchQuery);
  const [selectedBrand, setSelectedBrand] = useState(saved.selectedBrand);
  const [stockFilter, setStockFilter] = useState(saved.stockFilter);
  const [selectedTag, setSelectedTag] = useState(saved.selectedTag);
  const [sortBy, setSortBy] = useState(saved.sortBy);
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
    const state = { searchQuery, selectedBrand, stockFilter, selectedTag, sortBy };
    try {
      sessionStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(state));
    } catch { /* storage full or unavailable */ }
  }, [searchQuery, selectedBrand, stockFilter, selectedTag, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedBrand('');
    setBrandSearchQuery('');
    setStockFilter('all');
    setSelectedTag('all');
    setSortBy('bestSeller');
    try {
      sessionStorage.removeItem(FILTERS_STORAGE_KEY);
    } catch { /* ignore */ }
  };

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
    sortBy, setSortBy,
    isBrandDropdownOpen, setIsBrandDropdownOpen,
    brandSearchQuery, setBrandSearchQuery,
    brandDropdownRef,
    brands, filteredBrands,
    brandCounts,
    tags,
    handleClearFilters,
  };
}

export type UseProductFiltersReturn = ReturnType<typeof useProductFilters>;
