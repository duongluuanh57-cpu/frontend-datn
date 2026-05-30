'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { UseProductFiltersReturn } from '@/hooks/useProductFilters';

interface SearchAndSortProps {
  filters: UseProductFiltersReturn;
}

export function SearchAndSort({ filters }: SearchAndSortProps) {
  const {
    isVi,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  } = filters;

  const [localValue, setLocalValue] = useState(searchQuery);
  const debouncedValue = useDebounce(localValue, 300);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (debouncedValue !== searchQuery) {
      setSearchQuery(debouncedValue);
    }
  }, [debouncedValue]);

  useEffect(() => {
    if (searchQuery !== localValue && searchQuery !== debouncedValue) {
      setLocalValue(searchQuery);
    }
  }, [searchQuery]);

  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
      <div style={{ flex: 1, position: 'relative', minWidth: '260px' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--admin-text-muted)',
          }}
        />
        <input
          type="text"
          placeholder={
            isVi
              ? 'Tìm tên sản phẩm, thương hiệu hoặc từ khóa...'
              : 'Search name, brand or keywords...'
          }
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px 10px 40px',
            borderRadius: 'var(--admin-radius-md)',
            background: 'var(--admin-surface-muted)',
            border: '1px solid var(--admin-border-subtle)',
            color: 'var(--admin-text)',
            fontSize: '0.8125rem',
            outline: 'none',
            transition: 'all 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--admin-accent-hover, #D4A5A5)';
            e.target.style.boxShadow = '0 0 0 2px rgba(212, 165, 165, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--admin-border-subtle)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)' }}>
          {isVi ? 'Sắp xếp' : 'Sort by'}:
        </span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--admin-radius-md)',
            background: 'var(--admin-surface-muted)',
            border: '1px solid var(--admin-border-subtle)',
            color: 'var(--admin-text)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="bestSeller">{isVi ? 'Bán chạy nhất' : 'Best Sellers'}</option>
          <option value="newest">{isVi ? 'Mới nhất' : 'Newest'}</option>
          <option value="priceAsc">{isVi ? 'Giá: Thấp đến Cao' : 'Price: Low to High'}</option>
          <option value="priceDesc">{isVi ? 'Giá: Cao đến Thấp' : 'Price: High to Low'}</option>
          <option value="stockAsc">{isVi ? 'Kho: Ít đến Nhiều' : 'Stock: Low to High'}</option>
          <option value="stockDesc">{isVi ? 'Kho: Nhiều đến Ít' : 'Stock: High to Low'}</option>
          <option value="rating">{isVi ? 'Đánh giá cao nhất' : 'Top Rated'}</option>
        </select>
      </div>
    </div>
  );
}
