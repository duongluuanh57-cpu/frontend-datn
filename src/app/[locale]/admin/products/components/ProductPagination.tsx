'use client';

import React from 'react';
import { AdminPagination } from '@/app/[locale]/admin/components/AdminPagination';

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  isVi: boolean;
}

const ITEMS_PER_PAGE = 25;

export function ProductPagination({ currentPage, totalPages, total, setCurrentPage, isVi }: ProductPaginationProps) {
  return (
    <AdminPagination
      currentPage={currentPage}
      totalPages={totalPages}
      total={total}
      itemsPerPage={ITEMS_PER_PAGE}
      setCurrentPage={setCurrentPage}
      isVi={isVi}
      label={isVi ? 'sản phẩm' : 'products'}
    />
  );
}
