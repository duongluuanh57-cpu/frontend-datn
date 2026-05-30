'use client';

import { useState, useEffect, useMemo } from 'react';

interface UseAdminFilterOptions {
  extraParams?: Record<string, string>;
}

export function useAdminFilter(options?: UseAdminFilterOptions) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = { page: currentPage, limit: ITEMS_PER_PAGE };
    if (searchTerm) params.search = searchTerm;
    if (options?.extraParams) {
      for (const [k, v] of Object.entries(options.extraParams)) {
        if (v) params[k] = v;
      }
    }
    return params;
  }, [currentPage, searchTerm, options?.extraParams]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  return {
    searchTerm, setSearchTerm,
    currentPage, setCurrentPage,
    ITEMS_PER_PAGE, queryParams,
  };
}