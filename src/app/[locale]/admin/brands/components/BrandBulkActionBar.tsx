'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import type { UseAdminBrandsReturn } from '@/hooks/useAdminBrands';

interface BrandBulkActionBarProps {
  adminBrands: UseAdminBrandsReturn;
}

export function BrandBulkActionBar({ adminBrands }: BrandBulkActionBarProps) {
  const {
    selectedIds,
    isVi,
    setShowBulkDeleteModal
  } = adminBrands;

  if (selectedIds.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(30, 20, 15, 0.9)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      zIndex: 100,
      color: '#ffffff',
    }}>
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0e9e4' }}>
        {isVi ? `Đã chọn ${selectedIds.length} thương hiệu` : `${selectedIds.length} brands selected`}
      </span>
      <div style={{ width: '1px', height: '16px', background: 'rgba(255, 255, 255, 0.15)' }} />
      <button
        type="button"
        onClick={() => setShowBulkDeleteModal(true)}
        style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#f87171',
          borderRadius: '8px',
          padding: '6px 16px',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <Trash2 size={14} />
        {isVi ? 'Xóa mục đã chọn' : 'Delete Selected'}
      </button>
    </div>
  );
}
