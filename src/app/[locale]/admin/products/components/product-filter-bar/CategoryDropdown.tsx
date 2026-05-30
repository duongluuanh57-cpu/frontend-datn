'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Hash } from 'lucide-react';
import { UseProductFiltersReturn } from '@/hooks/useProductFilters';

interface CategoryDropdownProps {
  filters: UseProductFiltersReturn;
}

export function CategoryDropdown({ filters }: CategoryDropdownProps) {
  const {
    isVi,
    selectedCategory,
    setSelectedCategory,
    categories,
  } = filters;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = useMemo(
    () => categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [categories, searchQuery]
  );

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 12px',
          borderRadius: 'var(--admin-radius-md)',
          background: 'var(--admin-surface-muted)',
          border: '1px solid var(--admin-border-subtle)',
          color: selectedCategory ? 'var(--admin-text)' : 'var(--admin-text-muted)',
          fontSize: '0.75rem',
          outline: 'none',
          width: '180px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s',
          fontWeight: selectedCategory ? 500 : 400,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--admin-accent-hover, #D4A5A5)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--admin-border-subtle)'; }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>
          {selectedCategory || (isVi ? 'Danh mục...' : 'Category...')}
        </span>
        <ChevronDown
          size={14}
          style={{
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
            marginLeft: '4px',
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '240px',
            maxHeight: '280px',
            background: 'var(--admin-surface)',
            border: '1px solid var(--admin-border)',
            borderRadius: 'var(--admin-radius-md)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '8px', borderBottom: '1px solid var(--admin-border-subtle)' }}>
            <input
              type="text"
              placeholder={isVi ? 'Tìm danh mục...' : 'Search category...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: 'var(--admin-radius-sm)',
                background: 'var(--admin-surface-muted)',
                border: '1px solid var(--admin-border-subtle)',
                color: 'var(--admin-text)',
                fontSize: '0.75rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ overflowY: 'auto', maxHeight: '220px', padding: '4px' }}>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                textAlign: 'left',
                background: !selectedCategory ? 'rgba(212, 165, 165, 0.1)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--admin-radius-sm)',
                color: 'var(--admin-text-muted)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontStyle: 'italic',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212, 165, 165, 0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = !selectedCategory ? 'rgba(212, 165, 165, 0.1)' : 'transparent'; }}
            >
              {isVi ? '-- Tất cả danh mục --' : '-- All Categories --'}
            </button>

            {filtered.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>
                {isVi ? 'Không tìm thấy danh mục' : 'No categories found'}
              </div>
            ) : (
              filtered.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setSearchQuery('');
                    setIsOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: selectedCategory === cat.name ? 'rgba(212, 165, 165, 0.15)' : 'transparent',
                    border: 'none',
                    borderRadius: 'var(--admin-radius-sm)',
                    color: selectedCategory === cat.name ? 'var(--admin-accent-hover, #D4A5A5)' : 'var(--admin-text)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontWeight: selectedCategory === cat.name ? 600 : 400,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212, 165, 165, 0.15)'; }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = selectedCategory === cat.name ? 'rgba(212, 165, 165, 0.15)' : 'transparent';
                  }}
                >
                  <Hash size={12} style={{ flexShrink: 0, opacity: 0.5 }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
