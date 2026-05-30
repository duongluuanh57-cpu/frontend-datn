'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAdminVouchers } from '@/hooks/useAdminVouchers';
import { VoucherHeader } from './components/VoucherHeader';
import { VoucherTable } from './components/VoucherTable';
import { VoucherBulkActionBar } from './components/VoucherBulkActionBar';
import { VoucherModals } from './components/VoucherModals';
import { AlertCircle } from 'lucide-react';

export default function AdminVouchersPage() {
  const adminVouchers = useAdminVouchers();
  const { error, isVi, vouchers } = adminVouchers;

  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const handleDeleteWithAnimation = (id: string) => {
    setDeletingIds(prev => [...prev, id]);
    adminVouchers.setVoucherToDelete(null);
    setTimeout(() => adminVouchers.deleteMutation.mutate(id), 400);
  };

  const handleBulkDeleteWithAnimation = (ids: string[]) => {
    setDeletingIds(prev => [...prev, ...ids]);
    adminVouchers.setShowBulkDeleteModal(false);
    setTimeout(() => adminVouchers.bulkDeleteMutation.mutate(ids), 400);
  };

  const prevVouchersKeyRef = useRef('');

  useEffect(() => {
    const key = (vouchers || []).map(v => v._id).join(',');
    if (prevVouchersKeyRef.current === key) return;
    prevVouchersKeyRef.current = key;
    setDeletingIds(prev => {
      const ids = new Set((vouchers || []).map(v => v._id));
      const next = prev.filter(id => ids.has(id));
      return next.length === prev.length && next.every((id, i) => id === prev[i]) ? prev : next;
    });
  }, [vouchers]);

  const animatedDeleteMutation = {
    mutate: handleDeleteWithAnimation,
    isPending: adminVouchers.deleteMutation.isPending,
  };

  const animatedBulkDeleteMutation = {
    mutate: handleBulkDeleteWithAnimation,
    isPending: adminVouchers.bulkDeleteMutation.isPending,
  };

  const modifiedAdminVouchers = {
    ...adminVouchers,
    deleteMutation: animatedDeleteMutation,
    bulkDeleteMutation: animatedBulkDeleteMutation,
  };

  if (error) {
    return (
      <div className="admin-alert">
        <AlertCircle className="admin-alert__icon" />
        <h2 className="admin-alert__title">{isVi ? 'Lỗi kết nối dữ liệu' : 'Data Connection Error'}</h2>
        <p className="admin-alert__text">
          {isVi ? 'Không thể tải danh sách mã giảm giá. Vui lòng kiểm tra lại kết nối server.' : 'Unable to load vouchers. Please verify server connection.'}
        </p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <VoucherHeader adminVouchers={adminVouchers} />
      <VoucherTable adminVouchers={adminVouchers} deletingIds={deletingIds} />
      <VoucherBulkActionBar adminVouchers={adminVouchers} />
      <VoucherModals adminVouchers={modifiedAdminVouchers} />
    </div>
  );
}