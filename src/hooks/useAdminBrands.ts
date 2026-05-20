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
  filteredBrands: Brand[];
  totalPages: number;
  paginatedBrands: Brand[];
  updateMutation: any;
  deleteMutation: any;
  bulkDeleteMutation: any;
  handleToggleFeatured: (brand: Brand) => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  handleSelectAll: () => void;
  handleSelectRow: (id: string) => void;
}

export function useAdminBrands(): UseAdminBrandsReturn {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Lấy danh sách thương hiệu
  const { data: brands, isLoading, error } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const { data } = await api.get('/brands');
      return data.data as Brand[];
    },
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('');

  // Lấy danh sách xuất xứ duy nhất từ API
  const { data: origins } = useQuery({
    queryKey: ['brand-origins'],
    queryFn: async () => {
      const { data } = await api.get('/brands/origins');
      return data.data as string[];
    },
  });

  // Lọc thương hiệu dựa trên ô tìm kiếm và dropdown xuất xứ
  const filteredBrands = useMemo(() => {
    if (!brands) return [];
    return brands.filter(brand => {
      const nameMatch = brand.name.toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = brand.description ? brand.description.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      const matchesSearch = nameMatch || descMatch;
      const matchesOrigin = !selectedOrigin || brand.origin === selectedOrigin;
      return matchesSearch && matchesOrigin;
    });
  }, [brands, searchTerm, selectedOrigin]);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedOrigin]);

  const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);

  const paginatedBrands = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBrands.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredBrands, currentPage]);

  // Mutation: Cập nhật thương hiệu (dành cho nút toggle featured)
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

  // Mutation: Xóa thương hiệu
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

  // Mutation: Xóa hàng loạt thương hiệu
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => api.post('/brands/bulk-delete', { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      toast.success(isVi ? 'Đã xóa hàng loạt thương hiệu thành công!' : 'Bulk deleted brands successfully!');
      setSelectedIds([]);
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

  const allFilteredIds = paginatedBrands.map(b => b._id);
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
    filteredBrands,
    totalPages,
    paginatedBrands,
    updateMutation,
    deleteMutation,
    bulkDeleteMutation,
    handleToggleFeatured,
    isAllSelected,
    isSomeSelected,
    handleSelectAll,
    handleSelectRow
  };
}
