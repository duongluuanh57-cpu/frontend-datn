'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { UseProductCatalogReturn } from '@/hooks/useProductCatalog';

interface BrandDropdownProps {
  catalog: UseProductCatalogReturn;
}

export function BrandDropdown({ catalog }: BrandDropdownProps) {
  const {
    isVi,
    selectedBrand,
    setSelectedBrand,
    brandSearchQuery,
    setBrandSearchQuery,
    isBrandDropdownOpen,
    setIsBrandDropdownOpen,
    brandDropdownRef,
    filteredBrands,
    brandProductCount,
  } = catalog;

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <div ref={brandDropdownRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--admin-radius-md)',
            background: 'var(--admin-surface-muted)',
            border: '1px solid var(--admin-border-subtle)',
            color: selectedBrand ? 'var(--admin-text)' : 'var(--admin-text-muted)',
            fontSize: '0.75rem',
            outline: 'none',
            width: '180px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
            fontWeight: selectedBrand ? 500 : 400,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--admin-accent-hover, #D4A5A5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--admin-border-subtle)';
          }}
        >
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              textAlign: 'left',
            }}
          >
            {selectedBrand || (isVi ? 'Thương hiệu...' : 'Brand...')}
          </span>
          <ChevronDown
            size={14}
            style={{
              transition: 'transform 0.2s',
              transform: isBrandDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
              marginLeft: '4px',
            }}
          />
        </button>

        {isBrandDropdownOpen && (
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
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Search input inside dropdown */}
            <div style={{ padding: '8px', borderBottom: '1px solid var(--admin-border-subtle)' }}>
              <input
                type="text"
                placeholder={isVi ? 'Tìm thương hiệu...' : 'Search brand...'}
                value={brandSearchQuery}
                onChange={(e) => setBrandSearchQuery(e.target.value)}
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

            {/* Scrollable brand list */}
            <div
              style={{
                overflowY: 'auto',
                maxHeight: '220px',
                padding: '4px',
              }}
            >
              {/* Clear selection option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand('');
                  setBrandSearchQuery('');
                  setIsBrandDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: !selectedBrand ? 'rgba(212, 165, 165, 0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--admin-radius-sm)',
                  color: 'var(--admin-text-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontStyle: 'italic',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(212, 165, 165, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = !selectedBrand
                    ? 'rgba(212, 165, 165, 0.1)'
                    : 'transparent';
                }}
              >
                {isVi ? '-- Tất cả thương hiệu --' : '-- All Brands --'}
              </button>

              {filteredBrands.length === 0 ? (
                <div
                  style={{
                    padding: '16px',
                    textAlign: 'center',
                    color: 'var(--admin-text-muted)',
                    fontSize: '0.75rem',
                  }}
                >
                  {isVi ? 'Không tìm thấy thương hiệu' : 'No brands found'}
                </div>
              ) : (
                filteredBrands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => {
                      setSelectedBrand(brand);
                      setBrandSearchQuery('');
                      setIsBrandDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      textAlign: 'left',
                      background:
                        selectedBrand === brand ? 'rgba(212, 165, 165, 0.15)' : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--admin-radius-sm)',
                      color:
                        selectedBrand === brand
                          ? 'var(--admin-accent-hover, #D4A5A5)'
                          : 'var(--admin-text)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontWeight: selectedBrand === brand ? 600 : 400,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(212, 165, 165, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        selectedBrand === brand
                          ? 'rgba(212, 165, 165, 0.15)'
                          : 'transparent';
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        gap: '8px',
                      }}
                    >
                      <span>{brand}</span>
                      {brandProductCount[brand] !== undefined && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            color:
                              selectedBrand === brand
                                ? 'var(--admin-accent-hover, #D4A5A5)'
                                : 'var(--admin-text-muted)',
                            background: 'rgba(212, 165, 165, 0.12)',
                            borderRadius: '999px',
                            padding: '1px 7px',
                            minWidth: '20px',
                            textAlign: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {brandProductCount[brand]}
                        </span>
                      )}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
