'use client';

import React from 'react';
import { Search, Globe, X } from 'lucide-react';
import type { UseAdminBrandsReturn } from '@/hooks/useAdminBrands';

interface BrandFilterBarProps {
  adminBrands: UseAdminBrandsReturn;
}

export function BrandFilterBar({ adminBrands }: BrandFilterBarProps) {
  const {
    isVi,
    searchTerm,
    setSearchTerm,
    selectedOrigin,
    setSelectedOrigin,
    origins
  } = adminBrands;

  return (
    <div style={{
      background: 'var(--admin-surface, #ffffff)',
      border: '1px solid var(--admin-border-subtle, #f0e9e4)',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '20px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      alignItems: 'center',
      boxShadow: '0 4px 20px rgba(61, 46, 36, 0.03)',
    }}>
      {/* Search Input */}
      <div style={{
        flex: '1 1 300px',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#a89285',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder={isVi ? 'Tìm kiếm theo tên thương hiệu hoặc mô tả...' : 'Search by brand name or description...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px 10px 38px',
            fontSize: '0.875rem',
            background: 'var(--admin-surface-muted, #faf8f6)',
            border: '1px solid var(--admin-border, #e8e0da)',
            borderRadius: '10px',
            color: 'var(--admin-text, #3d2e24)',
            outline: 'none',
            transition: 'all 0.2s',
          }}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: '#a89285',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Origin Select Dropdown */}
      <div style={{
        flex: '0 1 240px',
        minWidth: '180px',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#a89285',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Globe size={16} />
        </div>
        <select
          value={selectedOrigin}
          onChange={(e) => setSelectedOrigin(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 32px 10px 38px',
            fontSize: '0.875rem',
            background: 'var(--admin-surface-muted, #faf8f6)',
            border: '1px solid var(--admin-border, #e8e0da)',
            borderRadius: '10px',
            color: 'var(--admin-text, #3d2e24)',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            transition: 'all 0.2s',
          }}
        >
          <option value="">{isVi ? 'Tất cả xuất xứ' : 'All Origins'}</option>
          {origins && origins.map((org) => (
            <option key={org} value={org}>
              {org}
            </option>
          ))}
        </select>
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#a89285',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
        }}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
