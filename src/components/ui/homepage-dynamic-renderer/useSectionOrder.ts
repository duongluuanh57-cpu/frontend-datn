'use client';

import { useMemo } from 'react';
import { useHomepageConfig } from '@/hooks/useHomepageConfig';

const DEFAULT_ORDER = [
  'banner',
  'brandsMarquee',
  'saleProducts',
  'newProducts',
  'limitedProducts',
  'trendingProducts',
  'brandUsp',
  'luxuryGallery',
  'blogPosts'
];

export function useSectionOrder() {
  const { data: config, isLoading } = useHomepageConfig();

  const sectionsToRender = useMemo(() => {
    if (isLoading || !config?.sections?.length) {
      return DEFAULT_ORDER.map((id) => ({ id, enabled: true, order: DEFAULT_ORDER.indexOf(id) }));
    }
    const configured = [...config.sections].sort((a, b) => a.order - b.order);
    const merged = DEFAULT_ORDER.map((id, index) =>
      configured.find((section) => section.id === id) ?? {
        id,
        enabled: true,
        order: index
      }
    );
    const extras = configured.filter((section) => !DEFAULT_ORDER.includes(section.id));
    return [...merged, ...extras].sort((a, b) => a.order - b.order).filter((s) => s.enabled);
  }, [isLoading, config]);

  return { sectionsToRender, isLoading };
}