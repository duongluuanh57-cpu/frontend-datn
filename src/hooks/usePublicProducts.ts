'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import api from '@/lib/api';
import { fieldContainsSelectedValue, useHomepageTaxonomies } from '@/hooks/useHomepageTaxonomies';
import { useDebounce } from '@/hooks/useDebounce';
import { type ProductData } from '@/components/ui/product-card';

const fetchAllBrands = async () => {
  const { data } = await api.get('/brands');
  return data.data || [];
};

export function usePublicProducts(type: 'trending' | 'new' | 'limited', translationsNs?: string, filterTag?: string) {
  const t = translationsNs ? useTranslations(translationsNs) : undefined;
  const locale = useLocale();

  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedScentGroup, setSelectedScentGroup] = useState<string>('all');
  const [selectedConcentration, setSelectedConcentration] = useState<string>('all');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [isBrandOpen, setIsBrandOpen] = useState<boolean>(false);

  const { data: allBrands } = useQuery({
    queryKey: ['all-brands-list'],
    queryFn: fetchAllBrands,
  });

  const { scentGroups, concentrations, segments } = useHomepageTaxonomies();

  const brands = useMemo(
    () => Array.from(new Set((allBrands?.map((b: any) => b.name).filter(Boolean) || []) as string[])).sort(),
    [allBrands]
  );

  const capacities = ['2ml', '5ml', '10ml', '30ml', '50ml', '100ml', '150ml', '200ml'];

  const scentGroupOptions = useMemo(
    () => Array.from(new Set((scentGroups?.map((item: any) => item.name).filter(Boolean) || []) as string[])).sort(),
    [scentGroups]
  );

  const concentrationOptions = useMemo(
    () => Array.from(new Set((concentrations?.map((item: any) => item.name).filter(Boolean) || []) as string[])).sort(),
    [concentrations]
  );

  const segmentOptions = useMemo(
    () => Array.from(new Set((segments?.map((item: any) => item.name).filter(Boolean) || []) as string[])).sort(),
    [segments]
  );

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('type', type);
    params.set('sortBy', selectedSort);
    params.set('limit', '50');
    if (selectedBrand !== 'all') params.set('brand', selectedBrand);
    if (selectedCapacity !== 'all') params.set('capacity', selectedCapacity);
    if (selectedPriceRange !== 'all') params.set('priceRange', selectedPriceRange);
    if (selectedScentGroup !== 'all') params.set('scentGroup', selectedScentGroup);
    if (selectedConcentration !== 'all') params.set('concentration', selectedConcentration);
    if (selectedSegment !== 'all') params.set('segment', selectedSegment);
    if (filterTag) params.set('filterTag', filterTag);
    return params.toString();
  }, [type, selectedBrand, selectedCapacity, selectedPriceRange, selectedScentGroup, selectedConcentration, selectedSegment, selectedSort, filterTag]);

  const debouncedQueryParams = useDebounce(queryParams, 300);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['public-products', type, debouncedQueryParams],
    queryFn: async () => {
      const { data } = await api.get(`/products/public?${debouncedQueryParams}`);
      return (data.data || []) as ProductData[];
    },
    placeholderData: (previousData) => previousData,
  });

  const products = data ?? [];
  const sortedProducts = products;
  const isFiltering = isFetching && !isLoading;

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
    t,
    locale,
    isLoading,
    error,
    products,
    sortedProducts,
    isFiltering,
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
    handleResetFilters,
  };
}
