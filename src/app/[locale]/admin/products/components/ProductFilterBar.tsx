'use client';

import React from 'react';
import { X } from 'lucide-react';
import { UseProductFiltersReturn } from '@/hooks/useProductFilters';
import { SearchAndSort } from './product-filter-bar/SearchAndSort';
import { TagPills } from './product-filter-bar/TagPills';
import { BrandDropdown } from './product-filter-bar/BrandDropdown';
import { StockSelect } from './product-filter-bar/StockSelect';

interface ProductFilterBarProps {
  filters: UseProductFiltersReturn;
}

export function ProductFilterBar({ filters }: ProductFilterBarProps) {
  const {
    isVi,
    searchQuery,
    selectedBrand,
    stockFilter,
    selectedTag,
    sortBy,
    handleClearFilters,
  } = filters;

  const showClearButton =
    searchQuery ||
    selectedBrand ||
    stockFilter !== 'all' ||
    selectedTag !== 'all' ||
    sortBy !== 'bestSeller';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: 'var(--admin-surface)',
        border: '1px solid var(--admin-border)',
        borderRadius: 'var(--admin-radius-lg)',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: 'var(--admin-shadow-sm)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Row 1: Search & Sort */}
      <SearchAndSort filters={filters} />

      {/* Row 2: Filters */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--admin-border-subtle)',
          paddingTop: '16px',
        }}
      >
        {/* Tag Pills */}
        <TagPills filters={filters} />

        {/* Dropdown Filters (Stock & Brand) + Clear All Button */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Clear All Filters Button */}
          {showClearButton && (
            <button
              type="button"
              onClick={handleClearFilters}
              title={isVi ? 'Xóa tất cả bộ lọc' : 'Clear all filters'}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--admin-radius-md)',
                background: 'rgba(212, 165, 165, 0.1)',
                border: '1px solid var(--admin-border-subtle)',
                color: 'var(--admin-accent-hover, #D4A5A5)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(212, 165, 165, 0.2)';
                e.currentTarget.style.borderColor = 'var(--admin-accent-hover, #D4A5A5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(212, 165, 165, 0.1)';
                e.currentTarget.style.borderColor = 'var(--admin-border-subtle)';
              }}
            >
              <X size={14} />
              {isVi ? 'Xóa bộ lọc' : 'Clear Filters'}
            </button>
          )}

          {/* Brand Custom Dropdown */}
          <BrandDropdown filters={filters} />

          {/* Stock Select */}
          <StockSelect filters={filters} />
        </div>
      </div>
    </div>
  );
}
