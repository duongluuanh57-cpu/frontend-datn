'use client';

import React from 'react';
import { useAdminTags } from '@/hooks/useAdminTags';
import { TagHeader } from './components/TagHeader';
import { TagTable } from './components/TagTable';
import { TagPagination } from './components/TagPagination';
import { AlertCircle } from 'lucide-react';

export default function AdminTagsPage() {
  const adminTags = useAdminTags();
  const { error, isVi } = adminTags;

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
      <TagTable adminTags={adminTags} />
      <TagPagination adminTags={adminTags} />
    </div>
  );
}
