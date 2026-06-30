'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type SortOption = 'newest' | 'priceAsc' | 'priceDesc' | 'bestSeller';

const SORTS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'priceAsc', label: 'Giá: Thấp → Cao' },
  { value: 'priceDesc', label: 'Giá: Cao → Thấp' },
  { value: 'bestSeller', label: 'Bán chạy' },
];

interface SortFilterProps {
  sortBy: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortFilter({ sortBy, onChange }: SortFilterProps) {
  const [open, setOpen] = useState(false);
  const label = SORTS.find(s => s.value === sortBy)?.label || 'Sắp xếp';

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer bg-surface border-border text-text-primary hover:border-primary">
        <span>{label}</span>
        <ChevronDown size={14} className="text-text-muted" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-52 bg-surface border border-border rounded-xl shadow-xl z-20 overflow-hidden">
            {SORTS.map(s => (
              <button key={s.value} onClick={() => { onChange(s.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-background cursor-pointer transition-colors ${
                  sortBy === s.value ? 'text-primary font-semibold bg-primary/5' : 'text-text-secondary'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

