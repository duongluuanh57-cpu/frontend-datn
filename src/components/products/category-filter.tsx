'use client';

import { useQuery } from '@tanstack/react-query';
import { Selector } from '@astryxdesign/core/Selector';
import api from '@/lib/api';

interface CategoryItem { _id: string; name: string; status: string; productCount?: number; }

interface CategoryFilterProps {
  selectedCategory: string;
  onSelect: (categoryName: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function CategoryFilter({ selectedCategory, onSelect }: CategoryFilterProps) {
  const { data: categories } = useQuery({
    queryKey: ['categories-all-list'],
    queryFn: async () => { const { data } = await api.get('/categories'); return (data.data || []) as CategoryItem[]; },
    staleTime: 300_000,
  });

  const active = categories?.filter(c => c.status === 'active') || [];

  return (
    <Selector
      label="Danh mục"
      isLabelHidden
      value={selectedCategory || null}
      onChange={(val) => onSelect(val || '')}
      options={active.map(c => ({value: c.name, label: c.name}))}
      placeholder="Danh mục"
      size="sm"
      renderOption={(option) => {
        const cat = active.find(c => c.name === option.label);
        return (
          <div className="flex items-center justify-between w-full">
            <span>{option.label}</span>
            {cat?.productCount != null && (
              <span className="text-xs text-text-muted flex-shrink-0 ml-1">({cat.productCount})</span>
            )}
          </div>
        );
      }}
    />
  );
}
