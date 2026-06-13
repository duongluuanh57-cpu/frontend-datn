'use client';

import React, { useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import { Link } from '@/navigation';
import { formatSizeString } from '@/components/admin/ProductForm';
import { resolveImageUrl } from '@/lib/api';
import { Loader2, Sparkles } from 'lucide-react';
import { Product } from '@/types/admin';

interface ProductTableProps {
  t: (key: string) => string;
  locale: string;
  isVi: boolean;
  products: Product[];
  isLoading: boolean;
  total: number;
  selectedIds: string[];
  isAllSelected: boolean;
  isSomeSelected: boolean;
  handleSelectAll: () => void;
  handleSelectRow: (id: string) => void;
  setProductToDelete: (product: Product | null) => void;
  deletingIds?: string[];
}

const formatPrice = (price: number, locale: string) =>
  new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: locale === 'vi' ? 'VND' : 'USD',
  }).format(locale === 'vi' ? price : price / 25000);

const computeCompletion = (product: Product): { pct: number; missing: string[] } => {
  // Toàn bộ field có trong form chỉnh sửa sản phẩm
  const fields: { key: string; label: string; check: (p: Product) => boolean }[] = [
    { key: 'name', label: 'Tên', check: p => !!p.name?.trim() },
    { key: 'brand', label: 'Brand', check: p => !!p.brand?.trim() },
    { key: 'price', label: 'Giá', check: p => (p.price || 0) > 0 },
    { key: 'image', label: 'Ảnh', check: p => !!p.image },
    { key: 'description', label: 'Mô tả', check: p => !!p.description?.trim() },
    { key: 'size', label: 'Size', check: p => !!p.size?.trim() },
    { key: 'tag', label: 'Tag', check: p => !!p.tag?.trim() },
    { key: 'quantityInStock', label: 'Kho', check: p => (p.quantityInStock || 0) >= 0 },
    { key: 'discountPercentage', label: 'Giảm giá', check: p => (p.discountPercentage || 0) > 0 },
    { key: 'scentGroup', label: 'Nhóm hương', check: p => !!p.scentGroup?.trim() },
    { key: 'concentration', label: 'Nồng độ', check: p => !!p.concentration?.trim() },
    { key: 'segment', label: 'Phân khúc', check: p => !!p.segment?.trim() },
    { key: 'categories', label: 'Danh mục', check: p => !!p.categories?.trim() },
    { key: 'longevity', label: 'Lưu hương', check: p => !!p.longevity?.trim() },
    { key: 'sillage', label: 'Tỏa hương', check: p => !!p.sillage?.trim() },
    { key: 'durability', label: 'Độ bền mùi', check: p => !!p.durability?.trim() },
    { key: 'scentTrail', label: 'Vệt hương', check: p => !!p.scentTrail?.trim() },
    { key: 'season', label: 'Mùa', check: p => !!p.season?.trim() },
    { key: 'time', label: 'Thời gian', check: p => !!p.time?.trim() },
    { key: 'metaTitle', label: 'Meta Title', check: p => !!p.metaTitle?.trim() },
    { key: 'metaDescription', label: 'Meta Desc', check: p => !!p.metaDescription?.trim() },
    { key: 'images', label: 'Ảnh phụ', check: p => (p as any).images ? (Array.isArray((p as any).images) ? (p as any).images.length > 0 : true) : false },
    { key: 'keywords', label: 'Từ khóa', check: p => (Array.isArray(p.keywords) ? p.keywords.length > 0 : !!p.keywords?.toString().trim()) },
    { key: 'slug', label: 'Slug', check: p => !!p.slug?.trim() },
    { key: 'priceReport', label: 'Báo giá', check: p => !!p.priceReport?.trim() },
    { key: 'sizeReport', label: 'Báo size', check: p => !!p.sizeReport?.trim() },
    { key: 'discountReport', label: 'Báo giảm giá', check: p => !!p.discountReport?.trim() },
  ];
  const missing: string[] = [];
  for (const f of fields) {
    if (!f.check(product)) missing.push(f.label);
  }
  const pct = fields.length > 0 ? Math.round(((fields.length - missing.length) / fields.length) * 100) : 0;
  return { pct, missing };
};

export const ProductTable = React.memo(function ProductTable({
  t, locale, isVi,
  products, isLoading, total,
  selectedIds, isAllSelected, isSomeSelected,
  handleSelectAll, handleSelectRow,
  setProductToDelete,
  deletingIds = [],
}: ProductTableProps) {

  const rowRefs = useRef<Map<string, HTMLTableRowElement | null>>(new Map());
  const prevPositionsRef = useRef<Map<string, number>>(new Map());
  const prevProductsRef = useRef<Product[]>([]);

  useLayoutEffect(() => {
    const prevIds = new Set(prevProductsRef.current.map(p => p._id));
    const isDeletion = products.length > 0 && products.length < prevProductsRef.current.length &&
      products.every(p => prevIds.has(p._id));

    if (isDeletion && prevPositionsRef.current.size > 0) {
      requestAnimationFrame(() => {
        for (const p of products) {
          const el = rowRefs.current.get(p._id);
          if (!el) continue;
          const oldTop = prevPositionsRef.current.get(p._id);
          const newTop = el.getBoundingClientRect().top;
          if (oldTop !== undefined && Math.abs(oldTop - newTop) > 1) {
            const d = oldTop - newTop;
            el.style.transition = 'none';
            el.style.transform = `translateY(${d}px)`;
            void el.offsetHeight;
            el.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
            el.style.transform = 'translateY(0)';
          }
        }
      });
    }

    requestAnimationFrame(() => {
      prevPositionsRef.current.clear();
      for (const p of products) {
        const el = rowRefs.current.get(p._id);
        if (el) {
          prevPositionsRef.current.set(p._id, el.getBoundingClientRect().top);
        }
      }
    });

    prevProductsRef.current = products;
  }, [products]);

  return (
    <div className="admin-table-wrap">
      <style>{`
        @keyframes adminRowEnter {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes adminRowExit {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(70px); }
        }
      `}</style>
      <div className="admin-table-scroll" style={{ overflowX: deletingIds.length > 0 ? ('hidden' as const) : undefined }}>
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
              <th>{t('table.stock')}</th>
              <th>{isVi ? 'Trạng thái' : 'Status'}</th>
              <th>{t('table.price')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5}>
                  <div className="admin-loading">
                    <Loader2 className="admin-loading__spinner animate-spin" />
                    <p>{t('loading')}</p>
                  </div>
                </td>
              </tr>
            ) : total === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="admin-empty">
                    <Sparkles className="admin-empty__icon" />
                    <p>{t('empty')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product, index) => {
                const isChecked = selectedIds.includes(product._id);
                const isDeleting = deletingIds.includes(product._id);
                const animDelay = `${index * 0.04}s`;
                return (
                  <tr
                    key={product._id}
                    ref={el => { if (el) rowRefs.current.set(product._id, el); else rowRefs.current.delete(product._id); }}
                    style={{
                      animationName: isDeleting ? 'adminRowExit' : 'adminRowEnter',
                      animationDuration: '0.35s',
                      animationTimingFunction: 'ease',
                      animationFillMode: isDeleting ? 'forwards' : 'both',
                      animationDelay: isDeleting ? '0s' : animDelay,
                      ...(isChecked && !isDeleting ? { background: 'rgba(212, 165, 165, 0.05)' } : {}),
                    }}
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
                      <span
                        className={`admin-badge ${
                          product.quantityInStock < 10 ? 'admin-badge--low' : 'admin-badge--ok'
                        }`}
                      >
                        {product.quantityInStock} SP
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '6px',
                            borderRadius: '3px',
                            background: 'var(--admin-border-subtle)',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              width: `${computeCompletion(product).pct}%`,
                              height: '100%',
                              borderRadius: '3px',
                              transition: 'width 0.4s ease',
                              background:
                                computeCompletion(product).pct >= 80
                                  ? '#22c55e'
                                  : computeCompletion(product).pct >= 50
                                  ? '#eab308'
                                  : '#ef4444',
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            color: 'var(--admin-text-secondary)',
                          }}
                          title={computeCompletion(product).missing.length > 0 ? `Thiếu: ${computeCompletion(product).missing.join(', ')}` : 'Đầy đủ'}
                        >
                          {computeCompletion(product).pct}%
                        </span>
                      </div>
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
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});
