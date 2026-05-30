'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Sparkles, Search, Hash } from 'lucide-react';
import { Link } from '@/navigation';
import type { UseAdminCategoriesReturn } from '@/hooks/useAdminCategories';

interface CategoryTableProps {
  adminCategories: UseAdminCategoriesReturn;
  deletingIds?: string[];
}

export function CategoryTable({ adminCategories, deletingIds = [] }: CategoryTableProps) {
  const {
    isVi,
    isLoading,
    categories,
    isAllSelected,
    isSomeSelected,
    handleSelectAll,
    selectedIds,
    handleSelectRow,
    setCategoryToDelete,
    searchTerm,
    selectedStatus,
    total,
  } = adminCategories;

  const [filterVersion, setFilterVersion] = useState(0);
  const prevCategoriesKeyRef = useRef('');

  useEffect(() => {
    const key = (categories || []).map(c => c._id).join(',');
    if (prevCategoriesKeyRef.current !== key) {
      setFilterVersion((v) => v + 1);
      prevCategoriesKeyRef.current = key;
    }
  }, [categories]);

  return (
    <div className="admin-table-wrap">
      <style>{`
        @keyframes catRowEnter {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes catRowExit {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(70px); }
        }
      `}</style>
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
              <th>{isVi ? 'Danh mục' : 'Category'}</th>
              <th>{isVi ? 'Slug' : 'Slug'}</th>
              <th>{isVi ? 'Trạng thái' : 'Status'}</th>
              <th>{isVi ? 'Thứ tự' : 'Sort Order'}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5}>
                  <div className="admin-loading">
                    <Loader2 className="admin-loading__spinner animate-spin" />
                    <p>{isVi ? 'Đang tải danh sách danh mục...' : 'Loading categories...'}</p>
                  </div>
                </td>
              </tr>
            ) : total === 0 && !searchTerm && !selectedStatus ? (
              <tr>
                <td colSpan={5}>
                  <div className="admin-empty">
                    <Sparkles className="admin-empty__icon" />
                    <p>{isVi ? 'Chưa có danh mục nào được tạo.' : 'No categories found.'}</p>
                  </div>
                </td>
              </tr>
            ) : !categories?.length ? (
              <tr>
                <td colSpan={5}>
                  <div className="admin-empty">
                    <Search className="admin-empty__icon" style={{ opacity: 0.5, marginBottom: '8px' }} />
                    <p>{isVi ? 'Không tìm thấy danh mục nào khớp với bộ lọc.' : 'No categories matching the filters found.'}</p>
                  </div>
                </td>
              </tr>
            ) : (
              categories.map((category, index) => {
                const isChecked = selectedIds.includes(category._id);
                const isDeleting = deletingIds.includes(category._id);
                const animDelay = `${index * 0.04}s`;
                return (
                  <tr
                    key={`${filterVersion}-${category._id}`}
                    style={{
                      animationName: isDeleting ? 'catRowExit' : 'catRowEnter',
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
                        onChange={() => handleSelectRow(category._id)}
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
                        <div className="admin-table-product__thumb flex items-center justify-center bg-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden relative">
                          <Hash className="text-[#D4A5A5]" size={22} />
                        </div>
                        <div>
                          <Link href={`/admin/categories/${category._id}`}>
                            <p className="admin-table-product__name hover:underline hover:text-[var(--admin-accent)] transition-colors">{category.name}</p>
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-[#7A5C5C] font-mono">{category.slug}</span>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${category.status === 'active' ? 'admin-badge--ok' : 'admin-badge--low'}`}
                      >
                        {category.status === 'active'
                          ? (isVi ? 'Đang hoạt động' : 'Active')
                          : (isVi ? 'Tạm ngừng' : 'Inactive')
                        }
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-[#7A5C5C]">{category.sortOrder ?? 0}</span>
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
