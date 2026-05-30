'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import type { TaxonomyItem } from '@/types/admin';

export interface TabConfig {
  id: string;
  labelVi: string;
  labelEn: string;
  taxonomySlug: string | null;
  queryKey: string;
}

export const TABS: TabConfig[] = [
  { id: 'tags',          labelVi: 'Quản lý Tag',            labelEn: 'Tag Management',       taxonomySlug: null,           queryKey: 'admin-tags' },
  { id: 'notes',         labelVi: 'Quản lý Nhóm hương',     labelEn: 'Scent Groups',          taxonomySlug: 'scent_group',  queryKey: 'admin-scent-groups' },
  { id: 'concentrations',labelVi: 'Quản lý Nồng độ',        labelEn: 'Concentration Levels',  taxonomySlug: 'concentration',queryKey: 'admin-concentrations' },
  { id: 'segments',      labelVi: 'Quản lý Phân khúc nhóm', labelEn: 'Brand Segments',        taxonomySlug: 'segment',      queryKey: 'admin-segments' },
];

export function useTaxonomyQuery(activeTabId: string, searchTerm: string, currentPage: number) {
  const currentTabConfig = TABS.find(t => t.id === activeTabId)!;
  const ITEMS_PER_PAGE = 25;

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = { page: currentPage, limit: ITEMS_PER_PAGE };
    if (searchTerm) params.search = searchTerm;
    return params;
  }, [currentPage, searchTerm]);

  // Fetch taxonomy list (parent) — cached 10 min
  const { data: taxonomyList } = useQuery({
    queryKey: ['v2-taxonomies'],
    queryFn: async () => {
      const { data } = await api.get('/v2/taxonomies');
      return data.data as { _id: string; slug: string; name: string }[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const getTaxonomyId = (slug: string): string | null =>
    taxonomyList?.find(t => t.slug === slug)?._id ?? null;

  // Fetch paginated items
  const { data: pageData, isLoading, error } = useQuery({
    queryKey: [currentTabConfig.queryKey, queryParams],
    queryFn: async () => {
      if (!currentTabConfig.taxonomySlug) {
        const { data } = await api.get('/tags', { params: queryParams });
        return data.data as { items: TaxonomyItem[]; total: number; page: number; totalPages: number };
      }
      const taxonomyId = getTaxonomyId(currentTabConfig.taxonomySlug);
      if (!taxonomyId) {
        return { items: [] as TaxonomyItem[], total: 0, page: 1, totalPages: 0 };
      }
      const { data } = await api.get(`/v2/taxonomies/${taxonomyId}/terms`, { params: queryParams });
      return data.data as { items: TaxonomyItem[]; total: number; page: number; totalPages: number };
    },
    enabled: currentTabConfig.taxonomySlug === null || !!taxonomyList,
  });

  const items = pageData?.items;
  const total = pageData?.total || 0;
  const totalPages = pageData?.totalPages || 0;

  return {
    currentTabConfig,
    items,
    isLoading,
    error,
    total,
    totalPages,
    ITEMS_PER_PAGE,
    getTaxonomyId,
  };
}