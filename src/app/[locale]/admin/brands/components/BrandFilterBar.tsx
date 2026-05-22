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
    <div className="bg-[var(--admin-surface,#ffffff)] border border-[var(--admin-border-subtle,#f0e9e4)] rounded-[16px] p-4 mb-5 flex flex-wrap gap-4 items-center shadow-[0_4px_20px_rgba(61,46,36,0.03)]">
      {/* Search Input */}
      <div className="flex-[1_1_300px] relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a89285] pointer-events-none flex items-center">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder={isVi ? 'Tìm kiếm theo tên thương hiệu hoặc mô tả...' : 'Search by brand name or description...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-[10px_12px_10px_38px] text-sm bg-[var(--admin-surface-muted,#faf8f6)] border border-[var(--admin-border,#e8e0da)] rounded-[10px] text-[var(--admin-text,#3d2e24)] outline-none transition-all duration-200"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#a89285] cursor-pointer flex items-center p-1"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Origin Select Dropdown */}
      <div className="flex-[0_1_240px] min-w-[180px] relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a89285] pointer-events-none flex items-center">
          <Globe size={16} />
        </div>
        <select
          value={selectedOrigin}
          onChange={(e) => setSelectedOrigin(e.target.value)}
          className="w-full p-[10px_32px_10px_38px] text-sm bg-[var(--admin-surface-muted,#faf8f6)] border border-[var(--admin-border,#e8e0da)] rounded-[10px] text-[var(--admin-text,#3d2e24)] outline-none cursor-pointer appearance-none transition-all duration-200"
        >
          <option value="">{isVi ? 'Tất cả xuất xứ' : 'All Origins'}</option>
          {origins && origins.map((org) => (
            <option key={org} value={org}>
              {org}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a89285] pointer-events-none flex items-center">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
