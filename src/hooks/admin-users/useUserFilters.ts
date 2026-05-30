'use client';

import { useState, useEffect, useMemo } from 'react';
import type { RoleFilter } from '@/types/admin';

export function useUserFilters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = { page: currentPage, limit: itemsPerPage };
    if (searchTerm) params.search = searchTerm;
    if (roleFilter !== 'ALL') params.role = roleFilter;
    return params;
  }, [currentPage, searchTerm, roleFilter]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, roleFilter]);

  return {
    searchTerm, setSearchTerm,
    roleFilter, setRoleFilter,
    currentPage, setCurrentPage,
    itemsPerPage, queryParams,
  };
}