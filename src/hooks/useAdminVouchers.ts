'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import { useAdminFilter } from '@/hooks/shared/useAdminFilter';
import { useAdminSelection } from '@/hooks/shared/useAdminSelection';

export interface Voucher {
  _id: string; code: string; type: 'percentage' | 'fixed';
  value: number; minOrderAmount: number; maxDiscount?: number;
  maxUsage: number; usedCount: number;
  startDate: string; endDate: string; status: 'active' | 'inactive';
  createdAt: string; updatedAt: string;
}

export interface VoucherFormData {
  code: string; type: 'percentage' | 'fixed'; value: number;
  minOrderAmount: number; maxDiscount?: number; maxUsage: number;
  startDate: string; endDate: string; status?: 'active' | 'inactive';
}

export interface UseAdminVouchersReturn {
  locale: string; isVi: boolean;
  vouchers: Voucher[] | undefined; isLoading: boolean; error: any;
  createMutation: any; updateMutation: any; deleteMutation: any; bulkDeleteMutation: any;
  searchTerm: string; setSearchTerm: (term: string) => void;
  currentPage: number; setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  ITEMS_PER_PAGE: number; total: number; totalPages: number;
  selectedIds: string[]; setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  isAllSelected: boolean; isSomeSelected: boolean;
  handleSelectAll: () => void; handleSelectRow: (id: string) => void;
  voucherToDelete: Voucher | null; setVoucherToDelete: (v: Voucher | null) => void;
  showBulkDeleteModal: boolean; setShowBulkDeleteModal: (show: boolean) => void;
  selectedVoucherCodes: Map<string, string>;
}

export function useAdminVouchers(): UseAdminVouchersReturn {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const filter = useAdminFilter();

  const { data: pageData, isLoading, error } = useQuery({
    queryKey: ['admin-vouchers', filter.queryParams],
    queryFn: async () => {
      const { data } = await api.get('/vouchers', { params: filter.queryParams });
      const items = data.data as Voucher[];
      return { items, total: items?.length || 0, page: 1, totalPages: 1 };
    },
    staleTime: 15_000,
  });

  const vouchers = pageData?.items;
  const total = pageData?.total || 0;
  const totalPages = pageData?.totalPages || 0;

  const sel = useAdminSelection<Voucher>(vouchers);

  const createMutation = useMutation({
    mutationFn: (formData: VoucherFormData) => api.post('/vouchers', formData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] }); toast.success(isVi ? 'Tạo mã giảm giá thành công!' : 'Created!'); },
    onError: (err: any) => toast.error(err.response?.data?.message || (isVi ? 'Lỗi' : 'Error'))
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VoucherFormData> }) => api.patch(`/vouchers/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] }); toast.success(isVi ? 'Cập nhật thành công!' : 'Updated!'); },
    onError: (err: any) => toast.error(err.response?.data?.message || (isVi ? 'Lỗi' : 'Error'))
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vouchers/${id}`),
    onSuccess: (_, id) => { queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] }); toast.success(isVi ? 'Đã xóa!' : 'Deleted!'); sel.setItemToDelete(null); sel.setSelectedIds(prev => prev.filter(i => i !== id)); },
    onError: () => { toast.error(isVi ? 'Không thể xóa.' : 'Cannot delete.'); sel.setItemToDelete(null); }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => api.post('/vouchers/bulk-delete', { ids }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] }); toast.success(isVi ? 'Đã xóa hàng loạt!' : 'Bulk deleted!'); sel.clearSelection(); },
    onError: () => { toast.error(isVi ? 'Lỗi.' : 'Error.'); sel.setShowBulkDeleteModal(false); }
  });

  return {
    locale, isVi,
    vouchers, isLoading, error,
    createMutation, updateMutation, deleteMutation, bulkDeleteMutation,
    searchTerm: filter.searchTerm, setSearchTerm: filter.setSearchTerm,
    currentPage: filter.currentPage, setCurrentPage: filter.setCurrentPage,
    ITEMS_PER_PAGE: filter.ITEMS_PER_PAGE, total, totalPages,
    selectedIds: sel.selectedIds, setSelectedIds: sel.setSelectedIds,
    isAllSelected: sel.isAllSelected, isSomeSelected: sel.isSomeSelected,
    handleSelectAll: sel.handleSelectAll, handleSelectRow: sel.handleSelectRow,
    voucherToDelete: sel.itemToDelete, setVoucherToDelete: sel.setItemToDelete,
    showBulkDeleteModal: sel.showBulkDeleteModal, setShowBulkDeleteModal: sel.setShowBulkDeleteModal,
    selectedVoucherCodes: sel.selectedNames,
  };
}