'use client';

import React from 'react';
import type { UseAdminTaxonomyReturn } from '@/hooks/useAdminTaxonomy';
import { AdminPagination } from '@/app/[locale]/admin/components/AdminPagination';

interface TaxonomyPaginationProps {
  adminTaxonomy: UseAdminTaxonomyReturn;
}

export function TaxonomyPagination({ adminTaxonomy }: TaxonomyPaginationProps) {
  const { currentPage, totalPages, total, ITEMS_PER_PAGE, setCurrentPage, isVi } = adminTaxonomy;
  return (
    <AdminPagination
      currentPage={currentPage}
      totalPages={totalPages}
      total={total}
      itemsPerPage={ITEMS_PER_PAGE}
      setCurrentPage={setCurrentPage}
      isVi={isVi}
      label={isVi ? 'bản ghi' : 'records'}
    />
  );
}
