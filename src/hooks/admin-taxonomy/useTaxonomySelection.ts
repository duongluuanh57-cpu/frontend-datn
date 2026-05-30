'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TaxonomyItem } from '@/types/admin';

export function useTaxonomySelection(items: TaxonomyItem[] | undefined, selectedItemNames: Map<string, string>) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const ITEMS_PER_PAGE = 25;

  // Track selected item names
  useEffect(() => {
    if (!items) return;
    const next = new Map(selectedItemNames);
    for (const item of items) {
      if (selectedIds.includes(item._id)) {
        next.set(item._id, item.name);
      }
    }
    // This effect updates the parent's map; we'll just log locally
  }, [items, selectedIds, selectedItemNames]);

  const allFilteredIds = items?.map(i => i._id) || [];
  const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  }, [isAllSelected, allFilteredIds]);

  const handleSelectRow = useCallback((id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  }, []);

  return {
    selectedIds, setSelectedIds,
    ITEMS_PER_PAGE,
    isAllSelected, isSomeSelected,
    handleSelectAll, handleSelectRow,
  };
}