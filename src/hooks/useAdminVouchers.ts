'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useLocale } from 'next-intl';
import React, { useState, useMemo, useEffect } from 'react';

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
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  ITEMS_PER_PAGE: number;
  total: number;
  totalPages: number;
  showModal: boolean;
  editingVoucher: Voucher | null;
  openCreateModal: () => void;
  openEditModal: (v: Voucher) => void;
  closeModal: () => void;
}

export function useAdminVouchers(): UseAdminVouchersReturn {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
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
      // Client-side pagination nếu backend không hỗ trợ
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

  const createMutation = useMutation({
    mutationFn: async (formData: VoucherFormData) => api.post('/vouchers', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      setShowModal(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || (isVi ? 'Không thể tạo voucher' : 'Failed to create voucher');
      alert(msg);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<VoucherFormData> }) => api.patch(`/vouchers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      setShowModal(false);
      setEditingVoucher(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || (isVi ? 'Không thể cập nhật voucher' : 'Failed to update voucher');
      alert(msg);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/vouchers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || (isVi ? 'Không thể xoá voucher' : 'Failed to delete voucher');
      alert(msg);
    }
  });

  const openCreateModal = () => {
    setEditingVoucher(null);
    setShowModal(true);
  };

  const openEditModal = (v: Voucher) => {
    setEditingVoucher(v);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVoucher(null);
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
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    ITEMS_PER_PAGE,
    total,
    totalPages,
    showModal,
    editingVoucher,
    openCreateModal,
    openEditModal,
    closeModal,
  };
}