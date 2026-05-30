'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAdminCategories } from '@/hooks/useAdminCategories';
import { CategoryHeader } from './components/CategoryHeader';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { CategoryTable } from './components/CategoryTable';
import { CategoryPagination } from './components/CategoryPagination';
import { CategoryBulkActionBar } from './components/CategoryBulkActionBar';
import { CategoryModals } from './components/CategoryModals';
import { AlertCircle } from 'lucide-react';

export default function AdminCategoriesPage() {
  const adminCategories = useAdminCategories();
  const { error, isVi, categories } = adminCategories;

  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const handleDeleteWithAnimation = (id: string) => {
    setDeletingIds(prev => [...prev, id]);
    adminCategories.setCategoryToDelete(null);
    setTimeout(() => adminCategories.deleteMutation.mutate(id), 400);
  };

  const handleBulkDeleteWithAnimation = (ids: string[]) => {
    setDeletingIds(prev => [...prev, ...ids]);
    adminCategories.setShowBulkDeleteModal(false);
    setTimeout(() => adminCategories.bulkDeleteMutation.mutate(ids), 400);
  };

  const prevCategoriesKeyRef = useRef('');

  useEffect(() => {
    const key = (categories || []).map(c => c._id).join(',');
    if (prevCategoriesKeyRef.current === key) return;
    prevCategoriesKeyRef.current = key;
    setDeletingIds(prev => {
      const ids = new Set((categories || []).map(c => c._id));
      const next = prev.filter(id => ids.has(id));
      return next.length === prev.length && next.every((id, i) => id === prev[i]) ? prev : next;
    });
  }, [categories]);

  if (error) {
    return (
      <div className="admin-alert">
        <AlertCircle className="admin-alert__icon" />
        <h2 className="admin-alert__title">{isVi ? 'Lỗi kết nối dữ liệu' : 'Data Connection Error'}</h2>
        <p className="admin-alert__text">
          {isVi ? 'Không thể tải danh sách danh mục. Vui lòng kiểm tra lại kết nối server.' : 'Unable to load categories. Please verify server connection.'}
        </p>
      </div>
    );
  }

  const animatedDeleteMutation = {
    mutate: handleDeleteWithAnimation,
    isPending: adminCategories.deleteMutation.isPending,
  };

  const animatedBulkDeleteMutation = {
    mutate: handleBulkDeleteWithAnimation,
    isPending: adminCategories.bulkDeleteMutation.isPending,
  };

  const modifiedAdminCategories = {
    ...adminCategories,
    deleteMutation: animatedDeleteMutation,
    bulkDeleteMutation: animatedBulkDeleteMutation,
  };

  return (
    <div className="admin-page">
      <CategoryHeader adminCategories={adminCategories} />
      <CategoryFilterBar adminCategories={adminCategories} />
      <CategoryTable adminCategories={adminCategories} deletingIds={deletingIds} />
      <CategoryPagination adminCategories={adminCategories} />
      <CategoryBulkActionBar adminCategories={adminCategories} />
      <CategoryModals adminCategories={modifiedAdminCategories} />
    </div>
  );
}
