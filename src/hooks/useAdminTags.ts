'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useLocale } from 'next-intl';
import React, { useState, useMemo, useEffect } from 'react';
import { TaxonomyItem } from '@/types/admin';

export interface UseAdminTagsReturn {
  locale: string;
  isVi: boolean;
  tags: TaxonomyItem[] | undefined;
  isLoading: boolean;
  error: any;
  deleteMutation: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  ITEMS_PER_PAGE: number;
  total: number;
  totalPages: number;
}

export function useAdminTags(): UseAdminTagsReturn {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };
    if (searchTerm) params.search = searchTerm;
    return params;
  }, [currentPage, searchTerm]);

  const { data: pageData, isLoading, error } = useQuery({
    queryKey: ['admin-tags', queryParams],
    queryFn: async () => {
      const { data } = await api.get('/tags', { params: queryParams });
      return data.data as { items: TaxonomyItem[]; total: number; page: number; totalPages: number };
    },
    staleTime: 15_000,
  });

  const tags = pageData?.items;
  const total = pageData?.total || 0;
  const totalPages = pageData?.totalPages || 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/tags/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized') || err.response?.data?.message?.includes('đăng nhập');
      if (isAuth) {
        alert(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        alert(isVi ? 'Không thể xóa tag này.' : 'Failed to delete tag.');
      }
    }
  });

  return {
    locale,
    isVi,
    tags,
    isLoading,
    error,
    deleteMutation,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    ITEMS_PER_PAGE,
    total,
    totalPages,
  };
}
