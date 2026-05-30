'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAdminTags } from '@/hooks/useAdminTags';
import { TagHeader } from './components/TagHeader';
import { TagTable } from './components/TagTable';
import { TagPagination } from './components/TagPagination';
import { AlertCircle } from 'lucide-react';

export default function AdminTagsPage() {
  const adminTags = useAdminTags();
  const { error, isVi, tags } = adminTags;

  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const handleDeleteWithAnimation = (id: string) => {
    setDeletingIds(prev => [...prev, id]);
    setTimeout(() => adminTags.deleteMutation.mutate(id), 400);
  };

  const prevTagsKeyRef = useRef('');

  useEffect(() => {
    const key = (tags || []).map(t => t._id).join(',');
    if (prevTagsKeyRef.current === key) return;
    prevTagsKeyRef.current = key;
    setDeletingIds(prev => {
      const ids = new Set((tags || []).map(t => t._id));
      const next = prev.filter(id => ids.has(id));
      return next.length === prev.length && next.every((id, i) => id === prev[i]) ? prev : next;
    });
  }, [tags]);

  const animatedDeleteMutation = {
    mutate: handleDeleteWithAnimation,
    isPending: adminTags.deleteMutation.isPending,
  };

  const modifiedAdminTags = {
    ...adminTags,
    deleteMutation: animatedDeleteMutation,
  };

  if (error) {
    return (
      <div className="admin-alert">
        <AlertCircle className="admin-alert__icon" />
        <h2 className="admin-alert__title">{isVi ? 'Lỗi kết nối dữ liệu' : 'Data Connection Error'}</h2>
        <p className="admin-alert__text">
          {isVi ? 'Không thể tải danh sách tag. Vui lòng kiểm tra lại kết nối server.' : 'Unable to load tags. Please verify server connection.'}
        </p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <TagHeader adminTags={adminTags} />
      <TagTable adminTags={modifiedAdminTags} deletingIds={deletingIds} />
      <TagPagination adminTags={adminTags} />
    </div>
  );
}
