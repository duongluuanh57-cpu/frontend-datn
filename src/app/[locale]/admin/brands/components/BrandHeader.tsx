'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from '@/navigation';
import type { UseAdminBrandsReturn } from '@/hooks/useAdminBrands';

interface BrandHeaderProps {
  adminBrands: UseAdminBrandsReturn;
}

export function BrandHeader({ adminBrands }: BrandHeaderProps) {
  const { isVi } = adminBrands;

  return (
    <header className="admin-page-header">
      <div>
        <h1 className="admin-page-header__title">{isVi ? 'QUẢN LÝ THƯƠNG HIỆU' : 'BRAND MANAGEMENT'}</h1>
        <p className="admin-page-header__subtitle">
          {isVi ? 'Danh sách các thương hiệu nước hoa xa xỉ đang hoạt động.' : 'Active premium fragrance brands catalog.'}
        </p>
      </div>
      <div className="admin-page-header__actions">
        <Link href="/admin/brands/new" className="admin-btn-primary flex items-center gap-2">
          <Plus size={18} />
          {isVi ? 'Thêm thương hiệu mới' : 'Add New Brand'}
        </Link>
      </div>
    </header>
  );
}
