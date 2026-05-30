'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types/admin';

export function useUserSelection(users: User[] | undefined) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedUserNames, setSelectedUserNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!users) return;
    setSelectedUserNames(prev => {
      const next = new Map(prev);
      for (const u of users) {
        if (selectedIds.includes(u._id)) next.set(u._id, u.username);
      }
      return next;
    });
  }, [users, selectedIds]);

  const allFilteredIds = users?.map(u => u._id) || [];
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
    selectedIds, setSelectedIds, selectedUserNames, setSelectedUserNames,
    isAllSelected, isSomeSelected,
    handleSelectAll, handleSelectRow,
  };
}