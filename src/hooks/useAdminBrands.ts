'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import { Brand } from '@/types/admin';
import { useAdminFilter } from '@/hooks/shared/useAdminFilter';
import { useAdminSelection } from '@/hooks/shared/useAdminSelection';

export interface UseAdminBrandsReturn {
  locale: string; isVi: boolean;
  brandToDelete: Brand | null; setBrandToDelete: (b: Brand | null) => void;
  selectedIds: string[]; setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  showBulkDeleteModal: boolean; setShowBulkDeleteModal: (show: boolean) => void;
  searchTerm: string; setSearchTerm: (term: string) => void;
  selectedOrigin: string; setSelectedOrigin: (origin: string) => void;
  currentPage: number; setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  ITEMS_PER_PAGE: number;
  brands: Brand[] | undefined; isLoading: boolean; error: any;
  origins: string[] | undefined; total: number; totalPages: number;
  updateMutation: any; deleteMutation: any; bulkDeleteMutation: any;
  handleToggleFeatured: (brand: Brand) => void;
  isAllSelected: boolean; isSomeSelected: boolean;
  handleSelectAll: () => void; handleSelectRow: (id: string) => void;
  selectedBrandNames: Map<string, string>;
}

export function useAdminBrands(): UseAdminBrandsReturn {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const [selectedOrigin, setSelectedOrigin] = useState('');

  const filter = useAdminFilter({ extraParams: { origin: selectedOrigin } });
  const { data: pageData, isLoading, error } = useQuery({
    queryKey: ['admin-brands', filter.queryParams],
    queryFn: async () => {
      const { data } = await api.get('/brands', { params: filter.queryParams });
      return data.data as { items: Brand[]; total: number; page: number; totalPages: number };
    },
    staleTime: 15_000,
  });

  const { data: origins } = useQuery({
    queryKey: ['brand-origins'],
    queryFn: async () => { const { data } = await api.get('/brands/origins'); return data.data as string[]; },
    staleTime: 300_000,
  });

  const brands = pageData?.items;
  const total = pageData?.total || 0;
  const totalPages = pageData?.totalPages || 0;

  const sel = useAdminSelection<Brand>(brands);

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Brand> }) => api.patch(`/brands/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-brands'] }),
    onError: (err: any) => {
      if (err.response?.status === 401) { alert(isVi ? 'Phiên làm việc đã hết hạn.' : 'Session expired.'); window.location.href = `/${locale}/login`; }
      else toast.error(err.response?.data?.message || (isVi ? 'Lỗi' : 'Error'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/brands/${id}`),
    onSuccess: (_, id) => { queryClient.invalidateQueries({ queryKey: ['admin-brands'] }); toast.success(isVi ? 'Đã xóa thương hiệu!' : 'Deleted!'); sel.setItemToDelete(null); sel.setSelectedIds(prev => prev.filter(i => i !== id)); },
    onError: () => { toast.error(isVi ? 'Không thể xóa.' : 'Cannot delete.'); sel.setItemToDelete(null); }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => api.post('/brands/bulk-delete', { ids }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-brands'] }); toast.success(isVi ? 'Đã xóa hàng loạt!' : 'Bulk deleted!'); sel.clearSelection(); },
    onError: () => { toast.error(isVi ? 'Lỗi.' : 'Error.'); sel.setShowBulkDeleteModal(false); }
  });

  const handleToggleFeatured = (brand: Brand) => updateMutation.mutate({ id: brand._id, data: { featured: !brand.featured } });

  return {
    locale, isVi,
    brandToDelete: sel.itemToDelete, setBrandToDelete: sel.setItemToDelete,
    selectedIds: sel.selectedIds, setSelectedIds: sel.setSelectedIds,
    showBulkDeleteModal: sel.showBulkDeleteModal, setShowBulkDeleteModal: sel.setShowBulkDeleteModal,
    searchTerm: filter.searchTerm, setSearchTerm: filter.setSearchTerm,
    selectedOrigin, setSelectedOrigin,
    currentPage: filter.currentPage, setCurrentPage: filter.setCurrentPage,
    ITEMS_PER_PAGE: filter.ITEMS_PER_PAGE,
    brands, isLoading, error, origins, total, totalPages,
    updateMutation, deleteMutation, bulkDeleteMutation, handleToggleFeatured,
    isAllSelected: sel.isAllSelected, isSomeSelected: sel.isSomeSelected,
    handleSelectAll: sel.handleSelectAll, handleSelectRow: sel.handleSelectRow,
    selectedBrandNames: sel.selectedNames,
  };
}