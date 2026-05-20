'use client';

import React from 'react';
import { UseProductCatalogReturn } from '@/hooks/useProductCatalog';

interface TagPillsProps {
  catalog: UseProductCatalogReturn;
}

export function TagPills({ catalog }: TagPillsProps) {
  const { isVi, selectedTag, setSelectedTag } = catalog;

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {['all', 'New', 'Sale', 'Trending', 'Limited'].map((tag) => {
        const isSelected = selectedTag === tag;
        const displayTag = tag === 'all' ? (isVi ? 'Tất cả' : 'All') : tag;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => setSelectedTag(tag)}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: '1px solid',
              borderColor: isSelected
                ? 'var(--admin-accent, #D4A5A5)'
                : 'var(--admin-border-subtle)',
              background: isSelected
                ? 'rgba(212, 165, 165, 0.15)'
                : 'rgba(255, 255, 255, 0.02)',
              color: isSelected
                ? 'var(--admin-accent-hover, #D4A5A5)'
                : 'var(--admin-text-muted)',
            }}
          >
            {displayTag}
          </button>
        );
      })}
    </div>
  );
}
