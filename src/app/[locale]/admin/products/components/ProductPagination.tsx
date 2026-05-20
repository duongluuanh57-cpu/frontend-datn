'use client';

import React from 'react';
import { UseProductCatalogReturn } from '@/hooks/useProductCatalog';

interface ProductPaginationProps {
  catalog: UseProductCatalogReturn;
}

const ITEMS_PER_PAGE = 15; // Kept consistent with useProductCatalog hook!

export function ProductPagination({ catalog }: ProductPaginationProps) {
  const { isVi, currentPage, setCurrentPage, totalPages, filteredProducts } = catalog;

  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: 'var(--admin-surface, #ffffff)',
        border: '1px solid var(--admin-border-subtle, #f0e9e4)',
        borderTop: 'none',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px',
        boxShadow: '0 4px 20px rgba(61, 46, 36, 0.02)',
        marginTop: '-1px', // Seamlessly connect with the table border
      }}
    >
      <p style={{ margin: 0, fontSize: '0.8125rem', color: '#7A5C5C', fontWeight: 500 }}>
        {isVi
          ? `Hiển thị từ ${(currentPage - 1) * ITEMS_PER_PAGE + 1} đến ${Math.min(
              currentPage * ITEMS_PER_PAGE,
              filteredProducts.length
            )} trong tổng số ${filteredProducts.length} sản phẩm`
          : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1} to ${Math.min(
              currentPage * ITEMS_PER_PAGE,
              filteredProducts.length
            )} of ${filteredProducts.length} products`}
      </p>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Previous Page Button */}
        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{
            padding: '8px 16px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: currentPage === 1 ? '#c8b8b0' : 'var(--admin-text, #3d2e24)',
            background: 'transparent',
            border: '1px solid var(--admin-border, #e8e0da)',
            borderRadius: '8px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isVi ? 'Trước' : 'Previous'}
        </button>

        {/* Page Tabs/Numbers */}
        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          const isActive = currentPage === pageNum;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => setCurrentPage(pageNum)}
              style={{
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8125rem',
                fontWeight: 700,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: isActive ? 'var(--admin-accent, #3d2e24)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--admin-text, #3d2e24)',
                border: isActive ? '1px solid var(--admin-accent, #3d2e24)' : '1px solid transparent',
              }}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Page Button */}
        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 16px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: currentPage === totalPages ? '#c8b8b0' : 'var(--admin-text, #3d2e24)',
            background: 'transparent',
            border: '1px solid var(--admin-border, #e8e0da)',
            borderRadius: '8px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isVi ? 'Tiếp' : 'Next'}
        </button>
      </div>
    </div>
  );
}
