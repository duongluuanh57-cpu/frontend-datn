'use client';

import React from 'react';
import type { UseAdminCategoriesReturn } from '@/hooks/useAdminCategories';
import { AdminPagination } from '@/app/[locale]/admin/components/AdminPagination';

interface CategoryPaginationProps {
  adminCategories: UseAdminCategoriesReturn;
}

export function CategoryPagination({ adminCategories }: CategoryPaginationProps) {
  const { currentPage, totalPages, total, ITEMS_PER_PAGE, setCurrentPage, isVi } = adminCategories;
  return (
    <AdminPagination
      currentPage={currentPage}
      totalPages={totalPages}
      total={total}
      itemsPerPage={ITEMS_PER_PAGE}
      setCurrentPage={setCurrentPage}
      isVi={isVi}
      label={isVi ? 'danh mục' : 'categories'}
    />
  );
}
