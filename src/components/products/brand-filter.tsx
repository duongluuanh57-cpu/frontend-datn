'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import api from '@/lib/api';

interface BrandItem { _id: string; name: string; status: string; productCount?: number; }

interface BrandFilterProps {
  selectedBrand: string;
  onSelect: (brandName: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function BrandFilter({ selectedBrand, onSelect, isOpen, onToggle }: BrandFilterProps) {
  const { data: brands } = useQuery({
    queryKey: ['brands-all-list'],
    queryFn: async () => { const { data } = await api.get('/brands'); return (data.data || []) as BrandItem[]; },
    staleTime: 300_000,
  });

  const active = brands?.filter(b => b.status === 'active') || [];

  return (
    <div className="relative">
      <button onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${
          selectedBrand ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-text-primary hover:border-primary'
        }`}>
        <span>{selectedBrand || 'Thương hiệu'}</span>
        <ChevronDown size={14} className="text-text-muted" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute top-full left-0 mt-2 w-60 max-h-72 overflow-y-auto bg-surface border border-border rounded-xl shadow-xl z-20">
            <button onClick={() => onSelect('')}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-background cursor-pointer ${!selectedBrand ? 'text-primary font-semibold' : 'text-text-secondary'}`}>
              Tất cả thương hiệu
            </button>
            {active.map(b => (
              <button key={b._id} onClick={() => onSelect(b.name)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-background cursor-pointer flex items-center justify-between ${selectedBrand === b.name ? 'text-primary font-semibold' : 'text-text-secondary'}`}>
                <span>{b.name}</span>
                {b.productCount != null && <span className="text-xs text-text-muted">({b.productCount})</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
