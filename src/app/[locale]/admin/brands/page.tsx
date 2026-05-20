'use client';

import React from 'react';
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
  const { error, isVi } = adminBrands;

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

  return (
    <div className="admin-page">
      <BrandHeader adminBrands={adminBrands} />
      <BrandFilterBar adminBrands={adminBrands} />
      <BrandTable adminBrands={adminBrands} />
      <BrandPagination adminBrands={adminBrands} />
      <BrandBulkActionBar adminBrands={adminBrands} />
      <BrandModals adminBrands={adminBrands} />
    </div>
  );
}
