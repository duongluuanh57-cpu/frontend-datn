'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import api from '@/lib/api';

interface CategoryItem { _id: string; name: string; status: string; productCount?: number; }

interface CategoryFilterProps {
  selectedCategory: string;
  onSelect: (categoryName: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function CategoryFilter({ selectedCategory, onSelect, isOpen, onToggle }: CategoryFilterProps) {
  const { data: categories } = useQuery({
    queryKey: ['categories-all-list'],
    queryFn: async () => { const { data } = await api.get('/categories'); return (data.data || []) as CategoryItem[]; },
    staleTime: 300_000,
  });

  const active = categories?.filter(c => c.status === 'active') || [];

  return (
    <div className="relative">
      <button onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${
          selectedCategory ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-text-primary hover:border-primary'
        }`}>
        <span>{selectedCategory || 'Danh mục'}</span>
        <ChevronDown size={14} className="text-text-muted" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute top-full left-0 mt-2 w-60 max-h-72 overflow-y-auto bg-surface border border-border rounded-xl shadow-xl z-20">
            <button onClick={() => onSelect('')}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-background cursor-pointer ${!selectedCategory ? 'text-primary font-semibold' : 'text-text-secondary'}`}>
              Tất cả danh mục
            </button>
            {active.map(c => (
              <button key={c._id} onClick={() => onSelect(c.name)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-background cursor-pointer flex items-center justify-between ${selectedCategory === c.name ? 'text-primary font-semibold' : 'text-text-secondary'}`}>
                <span>{c.name}</span>
                {c.productCount != null && <span className="text-xs text-text-muted">({c.productCount})</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
