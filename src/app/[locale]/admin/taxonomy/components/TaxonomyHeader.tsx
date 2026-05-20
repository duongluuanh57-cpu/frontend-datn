'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type { UseAdminTaxonomyReturn } from '@/hooks/useAdminTaxonomy';

interface TaxonomyHeaderProps {
  adminTaxonomy: UseAdminTaxonomyReturn;
}

export function TaxonomyHeader({ adminTaxonomy }: TaxonomyHeaderProps) {
  const { isVi, handleAddNewClick, currentTabConfig } = adminTaxonomy;

  return (
    <header className="admin-page-header">
      <div>
        <h1 className="admin-page-header__title">{isVi ? 'QUẢN LÝ TẬP TRUNG' : 'TAXONOMY MANAGER'}</h1>
        <p className="admin-page-header__subtitle">
          {isVi 
            ? 'Hệ thống quản lý phân loại sản phẩm tập trung: Tag, Nhóm hương, Nồng độ và Phân khúc nhóm.' 
            : 'Unified taxonomy catalog: tags, scent notes, concentration levels, and brand segment profiles.'
          }
        </p>
      </div>
      <div className="admin-page-header__actions">
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
