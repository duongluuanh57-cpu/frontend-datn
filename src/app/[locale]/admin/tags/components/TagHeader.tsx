'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from '@/navigation';
import type { UseAdminTagsReturn } from '@/hooks/useAdminTags';

interface TagHeaderProps {
  adminTags: UseAdminTagsReturn;
}

export function TagHeader({ adminTags }: TagHeaderProps) {
  const { isVi } = adminTags;

  return (
    <header className="admin-page-header">
      <div>
        <h1 className="admin-page-header__title">{isVi ? 'QUẢN LÝ TAG' : 'TAG MANAGEMENT'}</h1>
        <p className="admin-page-header__subtitle">
          {isVi ? 'Danh mục các thẻ nhãn phân loại sản phẩm nước hoa.' : 'Product taxonomy tags and categories.'}
        </p>
      </div>
      <div className="admin-page-header__actions">
        <Link href="/admin/tags/new" className="admin-btn-primary flex items-center gap-2">
          <Plus size={18} />
          {isVi ? 'Thêm tag mới' : 'Add New Tag'}
        </Link>
      </div>
    </header>
  );
}
