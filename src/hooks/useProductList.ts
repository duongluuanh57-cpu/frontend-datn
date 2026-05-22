import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Product } from '@/types/admin';

const ITEMS_PER_PAGE = 25;

export interface ProductListFilters {
  searchQuery: string;
  selectedBrand: string;
  stockFilter: string;
  selectedTag: string;
  sortBy: string;
}

export function useProductList(filters: ProductListFilters) {
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const saved = sessionStorage.getItem('adminProductListPage');
    const parsed = saved ? parseInt(saved, 10) : 1;
    sessionStorage.removeItem('adminProductListPage');
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [filters.searchQuery, filters.selectedBrand, filters.stockFilter, filters.selectedTag, filters.sortBy]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('adminProductListCurrentPage', String(currentPage));
    }
  }, [currentPage]);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };
    if (filters.searchQuery) params.search = filters.searchQuery;
    if (filters.selectedBrand) params.brand = filters.selectedBrand;
    if (filters.stockFilter !== 'all') params.stock = filters.stockFilter;
    if (filters.selectedTag !== 'all') params.tag = filters.selectedTag;
    if (filters.sortBy !== 'bestSeller') params.sortBy = filters.sortBy;
    return params;
  }, [currentPage, filters.searchQuery, filters.selectedBrand, filters.stockFilter, filters.selectedTag, filters.sortBy]);

  const { data: pageData, isLoading, error } = useQuery({
    queryKey: ['admin-products', queryParams],
    queryFn: async () => {
      const { data } = await api.get('/products', { params: queryParams });
      return data.data as { items: Product[]; total: number; page: number; totalPages: number };
    },
    staleTime: 15_000,
  });

  const products = pageData?.items || [];
  const total = pageData?.total || 0;
  const totalPages = pageData?.totalPages || 0;

  return { products, isLoading, error, currentPage, setCurrentPage, totalPages, total };
}
