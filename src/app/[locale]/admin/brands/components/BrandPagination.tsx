'use client';

import React from 'react';
import type { UseAdminBrandsReturn } from '@/hooks/useAdminBrands';
import { AdminPagination } from '@/app/[locale]/admin/components/AdminPagination';

interface BrandPaginationProps {
  adminBrands: UseAdminBrandsReturn;
}

export function BrandPagination({ adminBrands }: BrandPaginationProps) {
  const { currentPage, totalPages, total, ITEMS_PER_PAGE, setCurrentPage, isVi } = adminBrands;
  return (
    <AdminPagination
      currentPage={currentPage}
      totalPages={totalPages}
      total={total}
      itemsPerPage={ITEMS_PER_PAGE}
      setCurrentPage={setCurrentPage}
      isVi={isVi}
      label={isVi ? 'thương hiệu' : 'brands'}
    />
  );
}
