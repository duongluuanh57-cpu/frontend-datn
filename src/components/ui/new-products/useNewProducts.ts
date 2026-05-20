'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import api from '@/lib/api';
import { type ProductData } from '../product-card';

const fetchNewProducts = async (): Promise<ProductData[]> => {
  const { data } = await api.get('/products/new');
  return data.data;
};

const fetchAllBrands = async () => {
  const { data } = await api.get('/brands');
  return data.data || [];
};

export function useNewProducts() {
  const t = useTranslations('NewProducts');
  const locale = useLocale();

  // 1. Fetch data
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['new-products'],
    queryFn: fetchNewProducts,
  });

  const { data: allBrands } = useQuery({
    queryKey: ['all-brands-list'],
    queryFn: fetchAllBrands,
  });

  // 2. States for Filters and Sort
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [isBrandOpen, setIsBrandOpen] = useState<boolean>(false);

  // 3. Extract unique Brands for options dynamically from database
  const brands = Array.from(
    new Set(
      (allBrands
        ?.map((b: any) => b.name)
        .filter(Boolean) || []) as string[]
    )
  ).sort() as string[];

  // Hardcode standard capacity sizes for clean luxury selection
  const capacities = ['2ml', '5ml', '10ml', '30ml', '50ml', '100ml', '150ml', '200ml'];

  // Helper to get actual price of a product (including active discount)
  const getActualPrice = (product: ProductData) => {
    if (!product.price) return 0;
    
    const hasActiveDiscount = () => {
      if (!product.discountPercentage || product.discountPercentage <= 0) return false;
      
      const now = new Date();
      if (product.discountStartDate) {
        const start = new Date(product.discountStartDate);
        if (now < start) return false;
      }
      
      if (product.discountEndDate) {
        const end = new Date(product.discountEndDate);
        if (now > end) return false;
      }
      
      return true;
    };

    if (hasActiveDiscount()) {
      return product.price * (1 - (product.discountPercentage || 0) / 100);
    }
    
    return product.price;
  };

  // 4. Filtering Logic
  const filteredProducts = products ? products.filter((product) => {
    // Base Filter: Must have 'new' tag
    const hasNewTag = product.tag && product.tag.toLowerCase().split(',').map(t => t.trim()).includes('new');
    if (!hasNewTag) return false;

    // Filter by Brand
    if (selectedBrand !== 'all') {
      const bName = (product.brand as any)?.name || (typeof product.brand === 'string' ? product.brand : '') || (product as any).brandName || '';
      if (bName.toLowerCase() !== selectedBrand.toLowerCase()) return false;
    }

    // Filter by Capacity
    if (selectedCapacity !== 'all') {
      const parsedSizes = product.size
        ? product.size
            .split(',')
            .map((s) => {
              const parts = s.trim().split(':');
              return parts[0].trim().toLowerCase();
            })
            .filter(Boolean)
        : [];
      if (!parsedSizes.includes(selectedCapacity.toLowerCase())) return false;
    }

    // Filter by Price Range
    if (selectedPriceRange !== 'all') {
      const actualPrice = getActualPrice(product);
      if (selectedPriceRange === 'under-1m' && actualPrice >= 1000000) return false;
      if (selectedPriceRange === '1m-3m' && (actualPrice < 1000000 || actualPrice > 3000000)) return false;
      if (selectedPriceRange === 'over-3m' && actualPrice <= 3000000) return false;
    }

    return true;
  }) : [];

  // 5. Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (selectedSort === 'price-asc') {
      return getActualPrice(a) - getActualPrice(b);
    }
    if (selectedSort === 'price-desc') {
      return getActualPrice(b) - getActualPrice(a);
    }
    // Default: Newest
    return new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime();
  });

  const handleResetFilters = () => {
    setSelectedBrand('all');
    setSelectedCapacity('all');
    setSelectedPriceRange('all');
    setSelectedSort('newest');
    setIsBrandOpen(false);
  };

  return {
    t,
    locale,
    isLoading,
    error,
    products,
    brands,
    capacities,
    selectedBrand,
    setSelectedBrand,
    selectedCapacity,
    setSelectedCapacity,
    selectedPriceRange,
    setSelectedPriceRange,
    selectedSort,
    setSelectedSort,
    isBrandOpen,
    setIsBrandOpen,
    sortedProducts,
    handleResetFilters
  };
}
