'use client';

import { SlidersHorizontal } from 'lucide-react';
import { SortFilter } from './sort-filter';
import { BrandFilter } from './brand-filter';
import { CategoryFilter } from './category-filter';
import { PriceFilterPopup } from '@/components/shared/price-filter-popup';

type SortOption = 'newest' | 'priceAsc' | 'priceDesc' | 'bestSeller';

interface FilterBarProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  selectedBrand: string;
  onBrandSelect: (brand: string) => void;
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  priceMin: number | undefined;
  priceMax: number | undefined;
  onPriceApply: (min: number, max: number) => void;
  onPriceClear: () => void;
  brandOpen: boolean;
  onBrandToggle: () => void;
  categoryOpen: boolean;
  onCategoryToggle: () => void;
  priceOpen: boolean;
  onPriceToggle: () => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

export function ProductFilterBar({
  sortBy, onSortChange,
  selectedBrand, onBrandSelect,
  selectedCategory, onCategorySelect,
  priceMin, priceMax, onPriceApply, onPriceClear,
  brandOpen, onBrandToggle,
  categoryOpen, onCategoryToggle,
  priceOpen, onPriceToggle,
  hasActiveFilters, onClearAll,
}: FilterBarProps) {
  return (
    <div className="sticky top-16 md:top-20 z-40 bg-background/95 backdrop-blur-sm pb-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Sort chips */}
        <SortFilter sortBy={sortBy} onChange={onSortChange} />

        <div className="w-px h-7 bg-border hidden md:block" />

        {/* Brand dropdown */}
        <BrandFilter
          selectedBrand={selectedBrand}
          onSelect={onBrandSelect}
          isOpen={brandOpen}
          onToggle={onBrandToggle}
        />

        {/* Category dropdown */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelect={onCategorySelect}
          isOpen={categoryOpen}
          onToggle={onCategoryToggle}
        />

        {/* Price filter */}
        <div className="relative">
          <button onClick={onPriceToggle}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${
              (priceMin !== undefined || priceMax !== undefined)
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-surface border-border text-text-primary hover:border-primary'
            }`}>
            <SlidersHorizontal size={14} />
            <span>Lọc giá</span>
            {(priceMin !== undefined || priceMax !== undefined) && <span className="w-2 h-2 bg-primary rounded-full" />}
          </button>
          {priceOpen && (
            <PriceFilterPopup
              isOpen={priceOpen}
              onClose={onPriceToggle}
              onApply={onPriceApply}
              onClear={onPriceClear}
              initialMin={priceMin ?? 0}
              initialMax={priceMax ?? 5000000}
            />
          )}
        </div>

        {/* Clear all */}
        {hasActiveFilters && (
          <button onClick={onClearAll}
            className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer">
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
