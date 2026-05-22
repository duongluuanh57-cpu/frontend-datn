'use client';

import React from 'react';
import type { UseAdminTagsReturn } from '@/hooks/useAdminTags';
import { AdminPagination } from '@/app/[locale]/admin/components/AdminPagination';

interface TagPaginationProps {
  adminTags: UseAdminTagsReturn;
}

export function TagPagination({ adminTags }: TagPaginationProps) {
  const { currentPage, totalPages, total, ITEMS_PER_PAGE, setCurrentPage, isVi } = adminTags;
  return (
    <AdminPagination
      currentPage={currentPage}
      totalPages={totalPages}
      total={total}
      itemsPerPage={ITEMS_PER_PAGE}
      setCurrentPage={setCurrentPage}
      isVi={isVi}
      label={isVi ? 'tag' : 'tags'}
    />
  );
}
