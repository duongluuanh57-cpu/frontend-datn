'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface HomepageTag {
  _id: string;
  name: string;
  slug: string;
}

const fetchHomepageTags = async (): Promise<HomepageTag[]> => {
  const { data } = await api.get('/tags');
  return data.data || [];
};

export function useHomepageTags() {
  const { data: tags = [] } = useQuery({
    queryKey: ['homepage-tags'],
    queryFn: fetchHomepageTags,
    staleTime: 1000 * 60 * 10
  });

  const getTagName = (slug: string, fallback: string) => {
    const normalized = slug.toLowerCase();
    const tag = tags.find((item) => item.slug?.toLowerCase() === normalized);
    return tag?.name?.trim() || fallback;
  };

  return {
    tags,
    getTagName
  };
}
