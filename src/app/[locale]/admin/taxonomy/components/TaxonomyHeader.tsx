'use client';

import React from 'react';
import { Plus, Search, X } from 'lucide-react';
import type { UseAdminTaxonomyReturn } from '@/hooks/useAdminTaxonomy';

interface TaxonomyHeaderProps {
  adminTaxonomy: UseAdminTaxonomyReturn;
}

export function TaxonomyHeader({ adminTaxonomy }: TaxonomyHeaderProps) {
  const { isVi, handleAddNewClick, currentTabConfig, searchTerm, setSearchTerm } = adminTaxonomy;

  return (
    <header className="admin-page-header">
      <div className="flex-1 min-w-0">
        <h1 className="admin-page-header__title">{isVi ? 'QUẢN LÝ TẬP TRUNG' : 'TAXONOMY MANAGER'}</h1>
        <p className="admin-page-header__subtitle">
          {isVi 
            ? 'Hệ thống quản lý phân loại sản phẩm tập trung: Tag, Nhóm hương, Nồng độ và Phân khúc nhóm.' 
            : 'Unified taxonomy catalog: tags, scent notes, concentration levels, and brand segment profiles.'
          }
        </p>
      </div>
      <div className="admin-page-header__actions">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#faf8f6] border border-[#e8e0da] rounded-lg focus-within:border-[#c9a99a] focus-within:ring-2 focus-within:ring-[#c9a99a]/20 transition-all">
          <Search size={15} className="text-[#9a857c] flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isVi ? 'Tìm kiếm...' : 'Search...'}
            className="flex-1 min-w-[160px] bg-transparent border-none outline-none text-sm text-[#3d2e24] placeholder:text-[#9a857c]/60"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-[#9a857c] hover:text-[#7A5C5C] transition-colors">
              <X size={15} />
            </button>
          )}
        </div>
        <button 
          type="button" 
          onClick={handleAddNewClick}
          className="admin-btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          {isVi 
            ? `Thêm ${currentTabConfig.labelVi.replace('Quản lý ', '').toLowerCase()} mới`
            : `Add New ${currentTabConfig.labelEn.replace(' Management', '')}`
          }
        </button>
      </div>
    </header>
  );
}
