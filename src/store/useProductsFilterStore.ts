import { create } from 'zustand';

type SortOption = 'newest' | 'priceAsc' | 'priceDesc' | 'bestSeller';

interface ProductsFilter {
  pendingBrand: string | null;
  pendingCategory: string | null;
  pendingTag: string | null;
  pendingSortBy: SortOption | null;
}

interface ProductsFilterStore extends ProductsFilter {
  /** Set filter and return path to navigate to */
  setFilterAndGo: (filter: Partial<ProductsFilter>) => string;
  /** Consume pending filters (called on mount) and reset */
  consumeFilter: () => {
    brand: string;
    category: string;
    tag: string;
    sortBy: SortOption;
  };
}

export const useProductsFilterStore = create<ProductsFilterStore>((set, get) => ({
  pendingBrand: null,
  pendingCategory: null,
  pendingTag: null,
  pendingSortBy: null,

  setFilterAndGo: (filter) => {
    set({
      pendingBrand: filter.pendingBrand ?? null,
      pendingCategory: filter.pendingCategory ?? null,
      pendingTag: filter.pendingTag ?? null,
      pendingSortBy: filter.pendingSortBy ?? null,
    });
    return '/products';
  },

  consumeFilter: () => {
    const state = get();
    const result = {
      brand: state.pendingBrand || '',
      category: state.pendingCategory || '',
      tag: state.pendingTag || '',
      sortBy: state.pendingSortBy || 'newest',
    };
    set({
      pendingBrand: null,
      pendingCategory: null,
      pendingTag: null,
      pendingSortBy: null,
    });
    return result;
  },
}));