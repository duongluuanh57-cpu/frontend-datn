'use client';

import React from 'react';
import { X } from 'lucide-react';
import { UseProductFiltersReturn } from '@/hooks/useProductFilters';
import { SearchAndSort } from './product-filter-bar/SearchAndSort';
import { TagPills } from './product-filter-bar/TagPills';
import { BrandDropdown } from './product-filter-bar/BrandDropdown';
import { CategoryDropdown } from './product-filter-bar/CategoryDropdown';
import { StockSelect } from './product-filter-bar/StockSelect';

interface ProductFilterBarProps {
  filters: UseProductFiltersReturn;
}

export function ProductFilterBar({ filters }: ProductFilterBarProps) {
  const {
    isVi,
    searchQuery,
    selectedBrand,
    selectedCategory,
    stockFilter,
    selectedTag,
    sortBy,
    handleClearFilters,
  } = filters;

  const showClearButton =
    searchQuery ||
    selectedBrand ||
    selectedCategory ||
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
        position: 'relative',
        zIndex: 10,
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
          <button
            type="button"
            onClick={handleClearFilters}
              title={isVi ? 'Xóa tất cả bộ lọc' : 'Clear all filters'}
              style={{
              padding: '8px 14px',
              borderRadius: 'var(--admin-radius-md)',
              background: showClearButton ? 'rgba(212, 165, 165, 0.1)' : 'rgba(212, 165, 165, 0)',
              border: `1px solid ${showClearButton ? 'var(--admin-border-subtle)' : 'transparent'}`,
              color: showClearButton ? 'var(--admin-accent-hover, #D4A5A5)' : 'transparent',
              cursor: showClearButton ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              opacity: showClearButton ? 1 : 0,
              transform: showClearButton ? 'scale(1)' : 'scale(0.92)',
              visibility: showClearButton ? 'visible' : 'hidden',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: showClearButton ? 'auto' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!showClearButton) return;
              e.currentTarget.style.background = 'rgba(212, 165, 165, 0.2)';
              e.currentTarget.style.borderColor = 'var(--admin-accent-hover, #D4A5A5)';
            }}
            onMouseLeave={(e) => {
              if (!showClearButton) return;
              e.currentTarget.style.background = 'rgba(212, 165, 165, 0.1)';
              e.currentTarget.style.borderColor = 'var(--admin-border-subtle)';
            }}
          >
            <X size={14} />
            {isVi ? 'Xóa lọc' : 'Clear Filters'}
          </button>

          {/* Category Dropdown */}
          <CategoryDropdown filters={filters} />

          {/* Brand Custom Dropdown */}
          <BrandDropdown filters={filters} />

          {/* Stock Select */}
          <StockSelect filters={filters} />
        </div>
      </div>
    </div>
  );
}
