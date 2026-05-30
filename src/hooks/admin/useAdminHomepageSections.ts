'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  PointerSensor,
  KeyboardSensor,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import type { SectionConfig } from '@/hooks/useHomepageConfig';

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'banner', enabled: true, order: 0 },
  { id: 'brandsMarquee', enabled: true, order: 1 },
  { id: 'saleProducts', enabled: true, order: 2 },
  { id: 'newProducts', enabled: true, order: 3 },
  { id: 'limitedProducts', enabled: true, order: 4 },
  { id: 'trendingProducts', enabled: true, order: 5 },
  { id: 'brandUsp', enabled: true, order: 6 },
  { id: 'luxuryGallery', enabled: true, order: 7 },
  { id: 'blogPosts', enabled: true, order: 8 }
];

export function useAdminHomepageSections() {
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);

  const sensors = useMemo(() => [
    { sensor: PointerSensor, options: { activationConstraint: { distance: 5 } } },
    { sensor: KeyboardSensor, options: { coordinateGetter: sortableKeyboardCoordinates } }
  ], []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((s, idx) => ({ ...s, order: idx }));
    });
  }, []);

  const handleToggleSection = useCallback((id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }, []);

  const initSections = useCallback((dbSections: SectionConfig[]) => {
    if (!dbSections?.length) return;
    const sorted = [...dbSections].sort((a, b) => a.order - b.order);
    const merged = DEFAULT_SECTIONS.map((section, index) =>
      sorted.find((item) => item.id === section.id) ?? { ...section, order: index }
    );
    const extras = sorted.filter((section) => !DEFAULT_SECTIONS.some((item) => item.id === section.id));
    setSections([...merged, ...extras].sort((a, b) => a.order - b.order));
  }, []);

  const resetSections = useCallback(() => setSections(DEFAULT_SECTIONS), []);

  return {
    sections, setSections,
    sensors,
    handleDragEnd,
    handleToggleSection,
    initSections,
    resetSections,
  };
}