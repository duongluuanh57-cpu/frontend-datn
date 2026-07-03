'use client';

import { SortFilter } from './sort-filter';
import { BrandFilter } from './brand-filter';

type SortOption = 'newest' | 'priceAsc' | 'priceDesc' | 'bestSeller';

interface FilterBarProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  selectedBrand: string;
  onBrandSelect: (brand: string) => void;
  brandOpen: boolean;
  onBrandToggle: () => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

export function ProductFilterBar({
  sortBy, onSortChange,
  selectedBrand, onBrandSelect,
  brandOpen, onBrandToggle,
  hasActiveFilters, onClearAll,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SortFilter sortBy={sortBy} onChange={onSortChange} />

      <div className="w-px h-7 bg-border hidden md:block" />

      <BrandFilter
        selectedBrand={selectedBrand}
        onSelect={onBrandSelect}
        isOpen={brandOpen}
        onToggle={onBrandToggle}
      />

      {hasActiveFilters && (
        <button onClick={onClearAll}
          className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer">
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
