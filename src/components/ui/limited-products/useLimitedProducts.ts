'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import api from '@/lib/api';
import { fieldContainsSelectedValue, useHomepageTaxonomies } from '@/hooks/useHomepageTaxonomies';
import { type ProductData } from '../product-card';

const fetchLimitedProducts = async (): Promise<ProductData[]> => {
  const { data } = await api.get('/products/limited');
  return data.data;
};

const fetchAllBrands = async () => {
  const { data } = await api.get('/brands');
  return data.data || [];
};

export function useLimitedProducts(filterTag: string = 'limited') {
  const locale = useLocale();

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['limited-products'],
    queryFn: fetchLimitedProducts,
  });

  const { data: allBrands } = useQuery({
    queryKey: ['all-brands-list'],
    queryFn: fetchAllBrands,
  });

  const { scentGroups, concentrations, segments } = useHomepageTaxonomies();

  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedScentGroup, setSelectedScentGroup] = useState<string>('all');
  const [selectedConcentration, setSelectedConcentration] = useState<string>('all');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [isBrandOpen, setIsBrandOpen] = useState<boolean>(false);

  const brands = Array.from(
    new Set(
      (allBrands
        ?.map((b: any) => b.name)
        .filter(Boolean) || []) as string[]
    )
  ).sort() as string[];

  const capacities = ['2ml', '5ml', '10ml', '30ml', '50ml', '100ml', '150ml', '200ml'];
  const scentGroupOptions = Array.from(new Set((scentGroups?.map((item: any) => item.name).filter(Boolean) || []) as string[])).sort() as string[];
  const concentrationOptions = Array.from(new Set((concentrations?.map((item: any) => item.name).filter(Boolean) || []) as string[])).sort() as string[];
  const segmentOptions = Array.from(new Set((segments?.map((item: any) => item.name).filter(Boolean) || []) as string[])).sort() as string[];

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

  const filteredProducts = products ? products.filter((product) => {
    const hasTag = product.tag && product.tag.toLowerCase().split(',').map(t => t.trim()).includes(filterTag);
    if (!hasTag) return false;

    if (selectedBrand !== 'all') {
      const bName = (product.brand as any)?.name || (typeof product.brand === 'string' ? product.brand : '') || (product as any).brandName || '';
      if (bName.toLowerCase() !== selectedBrand.toLowerCase()) return false;
    }

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

    if (!fieldContainsSelectedValue(product.scentGroup, selectedScentGroup)) return false;
    if (!fieldContainsSelectedValue(product.concentration, selectedConcentration)) return false;
    if (!fieldContainsSelectedValue(product.segment, selectedSegment)) return false;

    if (selectedPriceRange !== 'all') {
      const actualPrice = getActualPrice(product);
      if (selectedPriceRange === 'under-1m' && actualPrice >= 1000000) return false;
      if (selectedPriceRange === '1m-3m' && (actualPrice < 1000000 || actualPrice > 3000000)) return false;
      if (selectedPriceRange === 'over-3m' && actualPrice <= 3000000) return false;
    }

    return true;
  }) : [];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (selectedSort === 'price-asc') {
      return getActualPrice(a) - getActualPrice(b);
    }
    if (selectedSort === 'price-desc') {
      return getActualPrice(b) - getActualPrice(a);
    }
    return new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime();
  });

  const handleResetFilters = () => {
    setSelectedBrand('all');
    setSelectedCapacity('all');
    setSelectedPriceRange('all');
    setSelectedScentGroup('all');
    setSelectedConcentration('all');
    setSelectedSegment('all');
    setSelectedSort('newest');
    setIsBrandOpen(false);
  };

  return {
    locale,
    isLoading,
    error,
    products,
    brands,
    capacities,
    scentGroupOptions,
    concentrationOptions,
    segmentOptions,
    selectedBrand,
    setSelectedBrand,
    selectedCapacity,
    setSelectedCapacity,
    selectedPriceRange,
    setSelectedPriceRange,
    selectedScentGroup,
    setSelectedScentGroup,
    selectedConcentration,
    setSelectedConcentration,
    selectedSegment,
    setSelectedSegment,
    selectedSort,
    setSelectedSort,
    isBrandOpen,
    setIsBrandOpen,
    sortedProducts,
    handleResetFilters
  };
}
