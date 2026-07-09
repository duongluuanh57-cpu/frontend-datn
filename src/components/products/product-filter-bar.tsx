'use client';

import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { SortFilter } from './sort-filter';
import { BrandFilter } from './brand-filter';
import { CategoryFilter } from './category-filter';
import { PriceFilterDropdown } from './price-filter-dropdown';

type SortOption = 'newest' | 'priceAsc' | 'priceDesc' | 'bestSeller';

interface FilterBarProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  selectedBrand: string;
  onBrandSelect: (brand: string) => void;
  brandOpen: boolean;
  onBrandToggle: () => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  priceMin: number | undefined;
  priceMax: number | undefined;
  onPriceApply: (min: number, max: number) => void;
  onPriceClear: () => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

export function ProductFilterBar({
  sortBy, onSortChange,
  selectedBrand, onBrandSelect,
  brandOpen, onBrandToggle,
  selectedCategory, onCategorySelect,
  priceMin, priceMax, onPriceApply, onPriceClear,
  hasActiveFilters, onClearAll,
}: FilterBarProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);

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

      <div className="w-px h-7 bg-border hidden md:block" />

      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelect={(cat) => { onCategorySelect(cat); setCategoryOpen(false); }}
        isOpen={categoryOpen}
        onToggle={() => setCategoryOpen(!categoryOpen)}
      />

      <div className="w-px h-7 bg-border hidden md:block" />

      <PriceFilterDropdown
        priceMin={priceMin}
        priceMax={priceMax}
        onApply={onPriceApply}
        onClear={onPriceClear}
      />

      {hasActiveFilters && (
        <Button label="Xóa bộ lọc" variant="ghost" size="sm" onClick={onClearAll} />
      )}
    </div>
  );
}
