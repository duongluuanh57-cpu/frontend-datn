'use client';

import React from 'react';
import { UseProductFiltersReturn } from '@/hooks/useProductFilters';

interface TagPillsProps {
  filters: UseProductFiltersReturn;
}

export function TagPills({ filters }: TagPillsProps) {
  const { isVi, selectedTag, setSelectedTag, tags } = filters;

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <button
        key="all"
        type="button"
        onClick={() => setSelectedTag('all')}
        style={{
          padding: '6px 14px',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
          border: '1px solid',
          borderColor: selectedTag === 'all'
            ? 'var(--admin-accent, #D4A5A5)'
            : 'var(--admin-border-subtle)',
          background: selectedTag === 'all'
            ? 'rgba(212, 165, 165, 0.15)'
            : 'rgba(255, 255, 255, 0.02)',
          color: selectedTag === 'all'
            ? 'var(--admin-accent-hover, #D4A5A5)'
            : 'var(--admin-text-muted)',
        }}
      >
        {isVi ? 'Tất cả' : 'All'}
      </button>
      {tags.map((tag) => {
        const isSelected = selectedTag === tag.slug;
        return (
          <button
            key={tag._id}
            type="button"
            onClick={() => setSelectedTag(tag.slug)}
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
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
