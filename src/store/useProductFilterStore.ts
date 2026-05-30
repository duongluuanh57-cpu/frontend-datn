'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ProductFilterState {
  searchQuery: string;
  selectedBrand: string;
  stockFilter: string;
  selectedTag: string;
  selectedCategory: string;
  sortBy: string;
}

export interface ProductFilterActions {
  setSearchQuery: (val: string) => void;
  setSelectedBrand: (val: string) => void;
  setStockFilter: (val: string) => void;
  setSelectedTag: (val: string) => void;
  setSelectedCategory: (val: string) => void;
  setSortBy: (val: string) => void;
  handleClearFilters: () => void;
}

const DEFAULT_FILTERS: ProductFilterState = {
  searchQuery: '',
  selectedBrand: '',
  stockFilter: 'all',
  selectedTag: 'all',
  selectedCategory: '',
  sortBy: 'bestSeller',
};

export const useProductFilterStore = create<ProductFilterState & ProductFilterActions>()(
  persist(
    (set) => ({
      ...DEFAULT_FILTERS,
      setSearchQuery: (val) => set({ searchQuery: val }),
      setSelectedBrand: (val) => set({ selectedBrand: val }),
      setStockFilter: (val) => set({ stockFilter: val }),
      setSelectedTag: (val) => set({ selectedTag: val }),
      setSelectedCategory: (val) => set({ selectedCategory: val }),
      setSortBy: (val) => set({ sortBy: val }),
      handleClearFilters: () => set(DEFAULT_FILTERS),
    }),
    {
      name: 'admin-product-filters',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
