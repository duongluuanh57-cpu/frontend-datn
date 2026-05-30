'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from '@/navigation';
import type { UseAdminCategoriesReturn } from '@/hooks/useAdminCategories';

interface CategoryHeaderProps {
  adminCategories: UseAdminCategoriesReturn;
}

export function CategoryHeader({ adminCategories }: CategoryHeaderProps) {
  const { isVi } = adminCategories;

  return (
    <header className="admin-page-header">
      <div>
        <h1 className="admin-page-header__title">{isVi ? 'Quản lý danh mục' : 'CATEGORY MANAGEMENT'}</h1>
        <p className="admin-page-header__subtitle">
          {isVi ? 'Danh sách các danh mục sản phẩm nước hoa.' : 'Premium fragrance product categories.'}
        </p>
      </div>
      <div className="admin-page-header__actions">
        <Link href="/admin/categories/new" className="admin-btn-primary flex items-center gap-2">
          <Plus size={18} />
          {isVi ? 'Thêm danh mục mới' : 'Add New Category'}
        </Link>
      </div>
    </header>
  );
}
