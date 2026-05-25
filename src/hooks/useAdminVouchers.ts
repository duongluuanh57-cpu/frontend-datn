'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useLocale } from 'next-intl';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

export interface Voucher {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  maxUsage: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface VoucherFormData {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  maxUsage: number;
  startDate: string;
  endDate: string;
  status?: 'active' | 'inactive';
}

export interface UseAdminVouchersReturn {
  locale: string;
  isVi: boolean;
  vouchers: Voucher[] | undefined;
  isLoading: boolean;
  error: any;
  createMutation: any;
  updateMutation: any;
  deleteMutation: any;
  bulkDeleteMutation: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  ITEMS_PER_PAGE: number;
  total: number;
  totalPages: number;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  handleSelectAll: () => void;
  handleSelectRow: (id: string) => void;
  voucherToDelete: Voucher | null;
  setVoucherToDelete: (v: Voucher | null) => void;
  showBulkDeleteModal: boolean;
  setShowBulkDeleteModal: (show: boolean) => void;
  selectedVoucherCodes: Map<string, string>;
}

export function useAdminVouchers(): UseAdminVouchersReturn {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedVoucherCodes, setSelectedVoucherCodes] = useState<Map<string, string>>(new Map());
  const [voucherToDelete, setVoucherToDelete] = useState<Voucher | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
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
    queryKey: ['admin-vouchers', queryParams],
    queryFn: async () => {
      const { data } = await api.get('/vouchers', { params: queryParams });
      const items = data.data as Voucher[];
      const total = items?.length || 0;
      return { items, total, page: 1, totalPages: 1 };
    },
    staleTime: 15_000,
  });

  const vouchers = pageData?.items;
  const total = pageData?.total || 0;
  const totalPages = pageData?.totalPages || 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Track selected voucher codes for bulk delete modal
  useEffect(() => {
    if (!vouchers) return;
    setSelectedVoucherCodes(prev => {
      const next = new Map(prev);
      for (const v of vouchers) {
        if (selectedIds.includes(v._id)) {
          next.set(v._id, v.code);
        }
      }
      return next;
    });
  }, [vouchers, selectedIds]);

  const createMutation = useMutation({
    mutationFn: async (formData: VoucherFormData) => api.post('/vouchers', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      toast.success(isVi ? 'Tạo mã giảm giá thành công!' : 'Voucher created successfully!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || (isVi ? 'Không thể tạo voucher' : 'Failed to create voucher');
      toast.error(msg);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<VoucherFormData> }) => api.patch(`/vouchers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      toast.success(isVi ? 'Cập nhật mã giảm giá thành công!' : 'Voucher updated successfully!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || (isVi ? 'Không thể cập nhật voucher' : 'Failed to update voucher');
      toast.error(msg);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/vouchers/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      toast.success(isVi ? 'Đã xóa mã giảm giá thành công!' : 'Voucher deleted successfully!');
      setVoucherToDelete(null);
      setSelectedIds(prev => prev.filter(item => item !== id));
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || (isVi ? 'Không thể xóa mã giảm giá này.' : 'Failed to delete voucher.'));
      setVoucherToDelete(null);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => api.post('/vouchers/bulk-delete', { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      toast.success(isVi ? 'Đã xóa hàng loạt mã giảm giá thành công!' : 'Bulk deleted vouchers successfully!');
      setSelectedIds([]);
      setSelectedVoucherCodes(new Map());
      setShowBulkDeleteModal(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || (isVi ? 'Không thể xóa các mã giảm giá đã chọn.' : 'Failed to delete selected vouchers.'));
      setShowBulkDeleteModal(false);
    }
  });

  const allFilteredIds = vouchers?.map(v => v._id) || [];
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
    vouchers,
    isLoading,
    error,
    createMutation,
    updateMutation,
    deleteMutation,
    bulkDeleteMutation,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    ITEMS_PER_PAGE,
    total,
    totalPages,
    selectedIds,
    setSelectedIds,
    isAllSelected,
    isSomeSelected,
    handleSelectAll,
    handleSelectRow,
    voucherToDelete,
    setVoucherToDelete,
    showBulkDeleteModal,
    setShowBulkDeleteModal,
    selectedVoucherCodes,
  };
}