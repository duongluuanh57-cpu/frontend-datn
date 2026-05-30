'use client';

import { useState, useCallback } from 'react';

export function useAdminSelection<T extends { _id: string; name?: string; code?: string }>(items: T[] | undefined) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedNames, setSelectedNames] = useState<Map<string, string>>(new Map());
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Track selected item names
  const updateSelectedNames = useCallback(() => {
    if (!items) return;
    setSelectedNames(prev => {
      const next = new Map(prev);
      for (const item of items) {
        if (selectedIds.includes(item._id)) {
          next.set(item._id, (item as any).name || (item as any).code || item._id);
        }
      }
      return next;
    });
  }, [items, selectedIds]);

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

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setSelectedNames(new Map());
    setShowBulkDeleteModal(false);
  }, []);

  return {
    selectedIds, setSelectedIds,
    selectedNames, setSelectedNames,
    itemToDelete, setItemToDelete,
    showBulkDeleteModal, setShowBulkDeleteModal,
    isAllSelected, isSomeSelected,
    handleSelectAll, handleSelectRow,
    clearSelection, updateSelectedNames,
  };
}