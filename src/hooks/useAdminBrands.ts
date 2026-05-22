'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useLocale } from 'next-intl';
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Brand } from '@/types/admin';

export interface UseAdminBrandsReturn {
  locale: string;
  isVi: boolean;
  brandToDelete: Brand | null;
  setBrandToDelete: (brand: Brand | null) => void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  showBulkDeleteModal: boolean;
  setShowBulkDeleteModal: (show: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedOrigin: string;
  setSelectedOrigin: (origin: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  ITEMS_PER_PAGE: number;
  brands: Brand[] | undefined;
  isLoading: boolean;
  error: any;
  origins: string[] | undefined;
  total: number;
  totalPages: number;
  updateMutation: any;
  deleteMutation: any;
  bulkDeleteMutation: any;
  handleToggleFeatured: (brand: Brand) => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  handleSelectAll: () => void;
  handleSelectRow: (id: string) => void;
  selectedBrandNames: Map<string, string>;
}

export function useAdminBrands(): UseAdminBrandsReturn {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedBrandNames, setSelectedBrandNames] = useState<Map<string, string>>(new Map());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  // Build query params
  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };
    if (searchTerm) params.search = searchTerm;
    if (selectedOrigin) params.origin = selectedOrigin;
    return params;
  }, [currentPage, searchTerm, selectedOrigin]);

  // Fetch brands with server-side pagination
  const { data: pageData, isLoading, error } = useQuery({
    queryKey: ['admin-brands', queryParams],
    queryFn: async () => {
      const { data } = await api.get('/brands', { params: queryParams });
      return data.data as { items: Brand[]; total: number; page: number; totalPages: number };
    },
    staleTime: 15_000,
  });

  const brands = pageData?.items;
  const total = pageData?.total || 0;
  const totalPages = pageData?.totalPages || 0;

  // Fetch origins (still full list, small dataset)
  const { data: origins } = useQuery({
    queryKey: ['brand-origins'],
    queryFn: async () => {
      const { data } = await api.get('/brands/origins');
      return data.data as string[];
    },
    staleTime: 300_000,
  });

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedOrigin]);

  // Track selected brand names for bulk delete modal
  useEffect(() => {
    if (!brands) return;
    setSelectedBrandNames(prev => {
      const next = new Map(prev);
      for (const b of brands) {
        if (selectedIds.includes(b._id)) {
          next.set(b._id, b.name);
        }
      }
      return next;
    });
  }, [brands, selectedIds]);

  // Mutation: Update brand (for featured toggle)
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Brand> }) =>
      api.patch(`/brands/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized') || err.response?.data?.message?.includes('đăng nhập');
      if (isAuth) {
        alert(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        alert(isVi ? 'Không thể cập nhật thương hiệu. Vui lòng thử lại!' : 'Failed to update brand. Please try again!');
      }
    }
  });

  // Mutation: Delete brand
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/brands/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      toast.success(isVi ? 'Đã xóa thương hiệu thành công!' : 'Brand deleted successfully!');
      setBrandToDelete(null);
      setSelectedIds(prev => prev.filter(item => item !== id));
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized') || err.response?.data?.message?.includes('đăng nhập');
      if (isAuth) {
        toast.error(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        toast.error(err.response?.data?.message || (isVi ? 'Không thể xóa thương hiệu này.' : 'Failed to delete brand.'));
      }
      setBrandToDelete(null);
    }
  });

  // Mutation: Bulk delete brands
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => api.post('/brands/bulk-delete', { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      toast.success(isVi ? 'Đã xóa hàng loạt thương hiệu thành công!' : 'Bulk deleted brands successfully!');
      setSelectedIds([]);
      setSelectedBrandNames(new Map());
      setShowBulkDeleteModal(false);
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err.response?.data?.message || (isVi ? 'Không thể xóa các thương hiệu đã chọn.' : 'Failed to delete selected brands.'));
      setShowBulkDeleteModal(false);
    }
  });

  const handleToggleFeatured = (brand: Brand) => {
    updateMutation.mutate({
      id: brand._id,
      data: { featured: !brand.featured }
    });
  };

  const allFilteredIds = brands?.map(b => b._id) || [];
  const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return {
    locale,
    isVi,
    brandToDelete,
    setBrandToDelete,
    selectedIds,
    setSelectedIds,
    showBulkDeleteModal,
    setShowBulkDeleteModal,
    searchTerm,
    setSearchTerm,
    selectedOrigin,
    setSelectedOrigin,
    currentPage,
    setCurrentPage,
    ITEMS_PER_PAGE,
    brands,
    isLoading,
    error,
    origins,
    total,
    totalPages,
    updateMutation,
    deleteMutation,
    bulkDeleteMutation,
    handleToggleFeatured,
    isAllSelected,
    isSomeSelected,
    handleSelectAll,
    handleSelectRow,
    selectedBrandNames,
  };
}
