'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAdminBrands } from '@/hooks/useAdminBrands';
import { BrandHeader } from './components/BrandHeader';
import { BrandFilterBar } from './components/BrandFilterBar';
import { BrandTable } from './components/BrandTable';
import { BrandPagination } from './components/BrandPagination';
import { BrandBulkActionBar } from './components/BrandBulkActionBar';
import { BrandModals } from './components/BrandModals';
import { AlertCircle } from 'lucide-react';

export default function AdminBrandsPage() {
  const adminBrands = useAdminBrands();
  const { error, isVi, brands } = adminBrands;

  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const handleDeleteWithAnimation = (id: string) => {
    setDeletingIds(prev => [...prev, id]);
    adminBrands.setBrandToDelete(null);
    setTimeout(() => adminBrands.deleteMutation.mutate(id), 400);
  };

  const handleBulkDeleteWithAnimation = (ids: string[]) => {
    setDeletingIds(prev => [...prev, ...ids]);
    adminBrands.setShowBulkDeleteModal(false);
    setTimeout(() => adminBrands.bulkDeleteMutation.mutate(ids), 400);
  };

  const prevBrandsKeyRef = useRef('');

  useEffect(() => {
    const key = (brands || []).map(b => b._id).join(',');
    if (prevBrandsKeyRef.current === key) return;
    prevBrandsKeyRef.current = key;
    setDeletingIds(prev => {
      const ids = new Set((brands || []).map(b => b._id));
      const next = prev.filter(id => ids.has(id));
      return next.length === prev.length && next.every((id, i) => id === prev[i]) ? prev : next;
    });
  }, [brands]);

  if (error) {
    return (
      <div className="admin-alert">
        <AlertCircle className="admin-alert__icon" />
        <h2 className="admin-alert__title">{isVi ? 'Lỗi kết nối dữ liệu' : 'Data Connection Error'}</h2>
        <p className="admin-alert__text">
          {isVi ? 'Không thể tải danh sách thương hiệu. Vui lòng kiểm tra lại kết nối server.' : 'Unable to load brands. Please verify server connection.'}
        </p>
      </div>
    );
  }

  const animatedDeleteMutation = {
    mutate: handleDeleteWithAnimation,
    isPending: adminBrands.deleteMutation.isPending,
  };

  const animatedBulkDeleteMutation = {
    mutate: handleBulkDeleteWithAnimation,
    isPending: adminBrands.bulkDeleteMutation.isPending,
  };

  const modifiedAdminBrands = {
    ...adminBrands,
    deleteMutation: animatedDeleteMutation,
    bulkDeleteMutation: animatedBulkDeleteMutation,
  };

  return (
    <div className="admin-page">
      <BrandHeader adminBrands={adminBrands} />
      <BrandFilterBar adminBrands={adminBrands} />
      <BrandTable adminBrands={adminBrands} deletingIds={deletingIds} />
      <BrandPagination adminBrands={adminBrands} />
      <BrandBulkActionBar adminBrands={adminBrands} />
      <BrandModals adminBrands={modifiedAdminBrands} />
    </div>
  );
}
