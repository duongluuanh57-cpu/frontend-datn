'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { UseProductFiltersReturn } from '@/hooks/useProductFilters';

const MAX_VISIBLE = 3;

interface TagPillsProps {
  filters: UseProductFiltersReturn;
}

const pillBase: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: '999px',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s',
  border: '1px solid',
};

const moreBtnBase: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '999px',
  fontSize: '0.75rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s',
  border: '1px solid var(--admin-border-subtle)',
  background: 'rgba(255, 255, 255, 0.02)',
  color: 'var(--admin-text-muted)',
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  letterSpacing: '0.05em',
};

function pillStyle(isSelected: boolean): React.CSSProperties {
  return {
    ...pillBase,
    borderColor: isSelected ? 'var(--admin-accent, #D4A5A5)' : 'var(--admin-border-subtle)',
    background: isSelected ? 'rgba(212, 165, 165, 0.15)' : 'rgba(255, 255, 255, 0.02)',
    color: isSelected ? 'var(--admin-accent-hover, #D4A5A5)' : 'var(--admin-text-muted)',
  };
}

export function TagPills({ filters }: TagPillsProps) {
  const { isVi, selectedTag, setSelectedTag, tags } = filters;
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleTags = tags.slice(0, MAX_VISIBLE);
  const moreTags = tags.length > MAX_VISIBLE ? tags.slice(MAX_VISIBLE) : [];

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <button
        type="button"
        onClick={() => setSelectedTag('all')}
        style={pillStyle(selectedTag === 'all')}
      >
        {isVi ? 'Tất cả' : 'All'}
      </button>

      {visibleTags.map((tag) => {
        const isSelected = selectedTag === tag.slug;
        return (
          <button
            key={tag._id}
            type="button"
            onClick={() => setSelectedTag(tag.slug)}
            style={pillStyle(isSelected)}
          >
            {tag.name}
          </button>
        );
      })}

      {moreTags.length > 0 && (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            style={moreBtnBase}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--admin-accent-hover, #D4A5A5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--admin-border-subtle)'; }}
          >
            <span>···</span>
            <ChevronDown
              size={12}
              style={{
                transition: 'transform 0.2s',
                transform: isMoreOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          {isMoreOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                minWidth: '180px',
                maxHeight: '260px',
                overflowY: 'auto',
                background: 'var(--admin-surface)',
                border: '1px solid var(--admin-border)',
                borderRadius: 'var(--admin-radius-md)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 1000,
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {moreTags.map((tag) => {
                const isSelected = selectedTag === tag.slug;
                return (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => {
                      setSelectedTag(tag.slug);
                      setIsMoreOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      textAlign: 'left',
                      background: isSelected ? 'rgba(212, 165, 165, 0.15)' : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--admin-radius-sm)',
                      color: isSelected ? 'var(--admin-accent-hover, #D4A5A5)' : 'var(--admin-text)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontWeight: isSelected ? 600 : 400,
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212, 165, 165, 0.15)'; }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isSelected ? 'rgba(212, 165, 165, 0.15)' : 'transparent';
                    }}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
