'use client';

import React from 'react';
import { UseProductCatalogReturn } from '@/hooks/useProductCatalog';

interface StockSelectProps {
  catalog: UseProductCatalogReturn;
}

export function StockSelect({ catalog }: StockSelectProps) {
  const { isVi, stockFilter, setStockFilter } = catalog;

  return (
    <select
      value={stockFilter}
      onChange={(e) => setStockFilter(e.target.value)}
      style={{
        padding: '8px 12px',
        borderRadius: 'var(--admin-radius-md)',
        background: 'var(--admin-surface-muted)',
        border: '1px solid var(--admin-border-subtle)',
        color: 'var(--admin-text)',
        fontSize: '0.75rem',
        outline: 'none',
        cursor: 'pointer',
      }}
    >
      <option value="all">{isVi ? 'Mọi trạng thái kho' : 'All Stock Status'}</option>
      <option value="inStock">{isVi ? 'Còn hàng' : 'In Stock'}</option>
      <option value="lowStock">{isVi ? 'Sắp hết hàng (<10)' : 'Low Stock (<10)'}</option>
      <option value="outOfStock">{isVi ? 'Hết hàng' : 'Out of Stock'}</option>
    </select>
  );
}
