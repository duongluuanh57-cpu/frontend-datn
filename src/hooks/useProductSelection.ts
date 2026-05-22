import { useState, useMemo } from 'react';
import { Product } from '@/types/admin';

export function useProductSelection(products: Product[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allFilteredIds = useMemo(() => {
    return products.map(p => p._id);
  }, [products]);

  const isAllSelected = useMemo(() => {
    return allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));
  }, [allFilteredIds, selectedIds]);

  const isSomeSelected = useMemo(() => {
    return selectedIds.length > 0 && !isAllSelected;
  }, [selectedIds, isAllSelected]);

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  return {
    selectedIds, setSelectedIds,
    isAllSelected, isSomeSelected,
    handleSelectAll, handleSelectRow,
  };
}
