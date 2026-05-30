'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import { useState } from 'react';
import { Category } from '@/types/admin';
import { useAdminFilter } from '@/hooks/shared/useAdminFilter';
import { useAdminSelection } from '@/hooks/shared/useAdminSelection';

export interface UseAdminCategoriesReturn {
  locale: string; isVi: boolean;
  categoryToDelete: Category | null; setCategoryToDelete: (c: Category | null) => void;
  selectedIds: string[]; setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  showBulkDeleteModal: boolean; setShowBulkDeleteModal: (show: boolean) => void;
  searchTerm: string; setSearchTerm: (term: string) => void;
  selectedStatus: string; setSelectedStatus: (status: string) => void;
  currentPage: number; setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  ITEMS_PER_PAGE: number;
  categories: Category[] | undefined; isLoading: boolean; error: any;
  total: number; totalPages: number;
  updateMutation: any; deleteMutation: any; bulkDeleteMutation: any;
  isAllSelected: boolean; isSomeSelected: boolean;
  handleSelectAll: () => void; handleSelectRow: (id: string) => void;
  selectedCategoryNames: Map<string, string>;
}

export function useAdminCategories(): UseAdminCategoriesReturn {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const [selectedStatus, setSelectedStatus] = useState('');
  const filter = useAdminFilter({ extraParams: { status: selectedStatus } });

  const { data: pageData, isLoading, error } = useQuery({
    queryKey: ['admin-categories', filter.queryParams],
    queryFn: async () => {
      const { data } = await api.get('/categories', { params: filter.queryParams });
      return data.data as { items: Category[]; total: number; page: number; totalPages: number };
    },
    staleTime: 15_000,
  });

  const categories = pageData?.items;
  const total = pageData?.total || 0;
  const totalPages = pageData?.totalPages || 0;

  const sel = useAdminSelection<Category>(categories);
  const [selectedNames, setSelectedNames] = useState<Map<string, string>>(new Map());

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) => api.patch(`/categories/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
    onError: (err: any) => {
      if (err.response?.status === 401) { alert(isVi ? 'Phiên đã hết hạn.' : 'Session expired.'); window.location.href = `/${locale}/login`; }
      else toast.error(err.response?.data?.message || (isVi ? 'Lỗi' : 'Error'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: (_, id) => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success(isVi ? 'Đã xóa!' : 'Deleted!'); sel.setItemToDelete(null); sel.setSelectedIds(prev => prev.filter(i => i !== id)); },
    onError: () => { toast.error(isVi ? 'Không thể xóa.' : 'Cannot delete.'); sel.setItemToDelete(null); }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => api.post('/categories/bulk-delete', { ids }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success(isVi ? 'Đã xóa hàng loạt!' : 'Bulk deleted!'); sel.clearSelection(); },
    onError: () => { toast.error(isVi ? 'Lỗi.' : 'Error.'); sel.setShowBulkDeleteModal(false); }
  });

  return {
    locale, isVi,
    categoryToDelete: sel.itemToDelete, setCategoryToDelete: sel.setItemToDelete,
    selectedIds: sel.selectedIds, setSelectedIds: sel.setSelectedIds,
    showBulkDeleteModal: sel.showBulkDeleteModal, setShowBulkDeleteModal: sel.setShowBulkDeleteModal,
    searchTerm: filter.searchTerm, setSearchTerm: filter.setSearchTerm,
    selectedStatus, setSelectedStatus,
    currentPage: filter.currentPage, setCurrentPage: filter.setCurrentPage,
    ITEMS_PER_PAGE: filter.ITEMS_PER_PAGE,
    categories, isLoading, error, total, totalPages,
    updateMutation, deleteMutation, bulkDeleteMutation,
    isAllSelected: sel.isAllSelected, isSomeSelected: sel.isSomeSelected,
    handleSelectAll: sel.handleSelectAll, handleSelectRow: sel.handleSelectRow,
    selectedCategoryNames: selectedNames,
  };
}