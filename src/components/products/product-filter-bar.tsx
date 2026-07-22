'use client';

import { useState } from 'react';
import { SortFilter } from './sort-filter';
import { BrandFilter } from './brand-filter';
import { CategoryFilter } from './category-filter';
import { PriceFilterDropdown } from './price-filter-dropdown';

type SortOption = 'newest' | 'priceAsc' | 'priceDesc' | 'bestSeller';

interface FilterBarProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  selectedBrands: string[];
  onBrandSelect: (brands: string[]) => void;
  brandOpen: boolean;
  onBrandToggle: () => void;
  selectedCategories: string[];
  onCategorySelect: (categories: string[]) => void;
  priceMin: number | undefined;
  priceMax: number | undefined;
  onPriceApply: (min: number, max: number) => void;
  onPriceClear: () => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

export function ProductFilterBar({
  sortBy, onSortChange,
  selectedBrands, onBrandSelect,
  brandOpen, onBrandToggle,
  selectedCategories, onCategorySelect,
  priceMin, priceMax, onPriceApply, onPriceClear,
  hasActiveFilters, onClearAll,
}: FilterBarProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Single backdrop when any filter is open */}
      {activeFilter && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveFilter(null)} />
      )}

      <SortFilter
        sortBy={sortBy}
        onChange={(v) => { onSortChange(v); setActiveFilter(null); }}
        isOpen={activeFilter === 'sort'}
        onToggle={() => setActiveFilter(activeFilter === 'sort' ? null : 'sort')}
      />

      <div className="w-px h-7 bg-border hidden md:block" />

      <BrandFilter
        selectedBrands={selectedBrands}
        onSelect={(brands) => { onBrandSelect(brands); setActiveFilter(null); }}
        isOpen={activeFilter === 'brand'}
        onToggle={() => setActiveFilter(activeFilter === 'brand' ? null : 'brand')}
      />

      <div className="w-px h-7 bg-border hidden md:block" />

      <CategoryFilter
        selectedCategories={selectedCategories}
        onSelect={(cats) => { onCategorySelect(cats); setActiveFilter(null); }}
        isOpen={activeFilter === 'category'}
        onToggle={() => setActiveFilter(activeFilter === 'category' ? null : 'category')}
      />

      <div className="w-px h-7 bg-border hidden md:block" />

      <PriceFilterDropdown
        priceMin={priceMin}
        priceMax={priceMax}
        onApply={onPriceApply}
        onClear={onPriceClear}
        isOpen={activeFilter === 'price'}
        onToggle={() => setActiveFilter(activeFilter === 'price' ? null : 'price')}
      />

      {hasActiveFilters && (
        <button onClick={onClearAll} className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-primary transition-colors cursor-pointer">
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
