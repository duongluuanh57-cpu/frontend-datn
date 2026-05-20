'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/navigation';
import { formatSizeString } from '@/components/admin/ProductForm';
import { resolveImageUrl } from '@/lib/api';
import { Loader2, Sparkles, Trash2 } from 'lucide-react';
import { UseProductCatalogReturn } from '@/hooks/useProductCatalog';

interface ProductTableProps {
  catalog: UseProductCatalogReturn;
}

const formatPrice = (price: number, locale: string) =>
  new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: locale === 'vi' ? 'VND' : 'USD',
  }).format(locale === 'vi' ? price : price / 25000);

export function ProductTable({ catalog }: ProductTableProps) {
  const {
    t,
    locale,
    isVi,
    isLoading,
    filteredProducts,
    paginatedProducts,
    selectedIds,
    isAllSelected,
    isSomeSelected,
    handleSelectAll,
    handleSelectRow,
    setProductToDelete,
    searchQuery,
    selectedBrand,
    stockFilter,
    selectedTag,
  } = catalog;

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '48px', textAlign: 'center', verticalAlign: 'middle' }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected;
                  }}
                  onChange={handleSelectAll}
                  style={{
                    cursor: 'pointer',
                    accentColor: 'var(--admin-accent, #3d2e24)',
                    borderRadius: '4px',
                    width: '16px',
                    height: '16px',
                  }}
                />
              </th>
              <th>{t('table.product')}</th>
              <th>{t('table.tag')}</th>
              <th>{t('table.stock')}</th>
              <th>{t('table.price')}</th>
              <th>{t('table.rating')}</th>
              <th style={{ textAlign: 'right' }}>{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7}>
                  <div className="admin-loading">
                    <Loader2 className="admin-loading__spinner animate-spin" />
                    <p>{t('loading')}</p>
                  </div>
                </td>
              </tr>
            ) : !filteredProducts.length ? (
              <tr>
                <td colSpan={7}>
                  <div className="admin-empty">
                    <Sparkles className="admin-empty__icon" />
                    <p>
                      {searchQuery ||
                      selectedBrand ||
                      stockFilter !== 'all' ||
                      selectedTag !== 'all'
                        ? isVi
                          ? 'Không tìm thấy sản phẩm khớp với bộ lọc'
                          : 'No products match the selected filters'
                        : t('empty')}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => {
                const isChecked = selectedIds.includes(product._id);
                return (
                  <tr
                    key={product._id}
                    style={isChecked ? { background: 'rgba(212, 165, 165, 0.05)' } : undefined}
                  >
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSelectRow(product._id)}
                        style={{
                          cursor: 'pointer',
                          accentColor: 'var(--admin-accent, #3d2e24)',
                          borderRadius: '4px',
                          width: '16px',
                          height: '16px',
                        }}
                      />
                    </td>
                    <td>
                      <div className="admin-table-product">
                        <div className="admin-table-product__thumb">
                          {product.image && (
                            <Image
                              src={resolveImageUrl(product.image)}
                              alt={product.name}
                              fill
                              sizes="52px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <Link href={`/admin/products/${product._id}`}>
                            <p className="admin-table-product__name hover:underline hover:text-[var(--admin-accent)] transition-colors">
                              {product.name}
                            </p>
                          </Link>
                          <p
                            className="admin-table-product__meta"
                            title={`${product.brand} • ${formatSizeString(product.size)}`}
                          >
                            {product.brand} • {formatSizeString(product.size)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {product.tag ? (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {product.tag.split(',').map((singleTag, idx) => {
                            const cleaned = singleTag.trim();
                            if (!cleaned) return null;
                            return (
                              <span
                                key={idx}
                                className="admin-badge"
                                style={{
                                  border: '1px solid var(--admin-border-subtle)',
                                  background: 'var(--admin-surface-muted)',
                                  color: 'var(--admin-text-secondary)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.6875rem',
                                  fontWeight: 600,
                                }}
                              >
                                {cleaned}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span style={{ opacity: 0.5 }}>—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          product.quantityInStock < 10 ? 'admin-badge--low' : 'admin-badge--ok'
                        }`}
                      >
                        {product.quantityInStock} SP
                      </span>
                    </td>
                    <td>
                      <p className="admin-table-price">{formatPrice(product.price, locale)}</p>
                      {(() => {
                        if (!product.discountPercentage || product.discountPercentage <= 0)
                          return null;

                        const now = new Date();
                        let active = true;
                        if (
                          product.discountStartDate &&
                          now < new Date(product.discountStartDate)
                        )
                          active = false;
                        if (product.discountEndDate && now > new Date(product.discountEndDate))
                          active = false;

                        return (
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              marginTop: '4px',
                            }}
                          >
                            <span
                              className="admin-badge--sale"
                              style={
                                !active
                                  ? {
                                      background: 'rgba(255, 255, 255, 0.05)',
                                      color: 'rgba(255, 255, 255, 0.3)',
                                      border: '1px dashed rgba(255, 255, 255, 0.15)',
                                    }
                                  : undefined
                              }
                            >
                              -{product.discountPercentage}%{' '}
                              {active ? '' : isVi ? '(Chưa chạy)' : '(Scheduled)'}
                            </span>
                            {(product.discountStartDate || product.discountEndDate) && (
                              <span
                                style={{
                                  fontSize: '8px',
                                  opacity: 0.5,
                                  color: '#D4A5A5',
                                  whiteSpace: 'nowrap',
                                  marginTop: '1px',
                                }}
                              >
                                📅{' '}
                                {product.discountStartDate
                                  ? new Date(product.discountStartDate).toLocaleDateString(
                                      isVi ? 'vi-VN' : 'en-US',
                                      {
                                        month: 'numeric',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      }
                                    )
                                  : '∞'}
                                {' - '}
                                {product.discountEndDate
                                  ? new Date(product.discountEndDate).toLocaleDateString(
                                      isVi ? 'vi-VN' : 'en-US',
                                      {
                                        month: 'numeric',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      }
                                    )
                                  : '∞'}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      <p className="admin-table-rating">
                        {product.rating} <span>({product.reviewsCount})</span>
                      </p>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          className="admin-icon-btn admin-icon-btn--danger"
                          aria-label={`Xóa ${product.name}`}
                          onClick={() => setProductToDelete(product)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
