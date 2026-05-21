'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface HomepageTaxonomy {
  _id: string;
  name: string;
  slug: string;
}

// Fetch taxonomy cha 1 lần, cache lại để dùng chung
const fetchTaxonomyList = async (): Promise<{ _id: string; slug: string }[]> => {
  const { data } = await api.get('/v2/taxonomies');
  return data.data || [];
};

const fetchTermsBySlug = async (
  slug: 'scent_group' | 'concentration' | 'segment'
): Promise<HomepageTaxonomy[]> => {
  const list = await fetchTaxonomyList();
  const taxonomy = list.find((t) => t.slug === slug);
  if (!taxonomy) return [];
  const { data } = await api.get(`/v2/taxonomies/${taxonomy._id}/terms?active=true`);
  return data.data || [];
};

export const normalizeFilterText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const fieldContainsSelectedValue = (fieldValue: string | undefined, selectedValue: string) => {
  if (selectedValue === 'all') return true;
  if (!fieldValue) return false;

  const selected = normalizeFilterText(selectedValue);
  return fieldValue
    .split(',')
    .map((item) => normalizeFilterText(item))
    .filter(Boolean)
    .includes(selected);
};

export function useHomepageTaxonomies() {
  // Fetch taxonomy cha 1 lần, dùng chung cho cả 3 query bên dưới
  const { data: taxonomyList } = useQuery({
    queryKey: ['v2-taxonomies'],
    queryFn: fetchTaxonomyList,
    staleTime: 1000 * 60 * 10,
  });

  const getTaxonomyId = (slug: string) =>
    taxonomyList?.find((t) => t.slug === slug)?._id ?? null;

  const { data: scentGroups = [] } = useQuery({
    queryKey: ['homepage-taxonomies', 'scent_group'],
    enabled: !!taxonomyList,
    queryFn: async () => {
      const id = getTaxonomyId('scent_group');
      if (!id) return [];
      const { data } = await api.get(`/v2/taxonomies/${id}/terms?active=true`);
      return (data.data || []) as HomepageTaxonomy[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: concentrations = [] } = useQuery({
    queryKey: ['homepage-taxonomies', 'concentration'],
    enabled: !!taxonomyList,
    queryFn: async () => {
      const id = getTaxonomyId('concentration');
      if (!id) return [];
      const { data } = await api.get(`/v2/taxonomies/${id}/terms?active=true`);
      return (data.data || []) as HomepageTaxonomy[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: segments = [] } = useQuery({
    queryKey: ['homepage-taxonomies', 'segment'],
    enabled: !!taxonomyList,
    queryFn: async () => {
      const id = getTaxonomyId('segment');
      if (!id) return [];
      const { data } = await api.get(`/v2/taxonomies/${id}/terms?active=true`);
      return (data.data || []) as HomepageTaxonomy[];
    },
    staleTime: 1000 * 60 * 10,
  });

  return {
    scentGroups,
    concentrations,
    segments,
  };
}
