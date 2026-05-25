'use client';

import React from 'react';
import { Loader2, Sparkles, Search } from 'lucide-react';
import { Link } from '@/navigation';
import type { UseAdminTaxonomyReturn } from '@/hooks/useAdminTaxonomy';

interface TaxonomyTableProps {
  adminTaxonomy: UseAdminTaxonomyReturn;
}

export function TaxonomyTable({ adminTaxonomy }: TaxonomyTableProps) {
  const {
    activeTab,
    isVi,
    isLoading,
    items,
    currentTabConfig,
    total,
    searchTerm,
    selectedIds,
    isAllSelected,
    isSomeSelected,
    handleSelectAll,
    handleSelectRow,
  } = adminTaxonomy;

  const colCount = activeTab === 'tags' ? 5 : 4; // checkbox + name + slug + (desc) + status

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
              <th>{isVi ? 'Tên gọi' : 'Name'}</th>
              <th>{isVi ? 'Mã liên kết (Slug)' : 'Slug'}</th>
              {activeTab === 'tags' && <th>{isVi ? 'Mô tả' : 'Description'}</th>}
              <th>{isVi ? 'Trạng thái' : 'Status'}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={colCount}>
                  <div className="admin-loading" style={{ padding: '60px 0' }}>
                    <Loader2 className="admin-loading__spinner animate-spin" />
                    <p>{isVi ? 'Đang tải danh sách thuộc tính...' : 'Loading taxonomy details...'}</p>
                  </div>
                </td>
              </tr>
            ) : total === 0 && !searchTerm ? (
              <tr>
                <td colSpan={colCount}>
                  <div className="admin-empty" style={{ padding: '60px 0' }}>
                    <Sparkles className="admin-empty__icon" />
                    <p>{isVi ? 'Chưa có bản ghi nào được tạo lập.' : 'No taxonomy items found.'}</p>
                  </div>
                </td>
              </tr>
            ) : !items?.length ? (
              <tr>
                <td colSpan={colCount}>
                  <div className="admin-empty" style={{ padding: '60px 0' }}>
                    <Search className="admin-empty__icon" style={{ opacity: 0.5, marginBottom: '8px' }} />
                    <p>{isVi ? 'Không tìm thấy bản ghi nào khớp với bộ lọc.' : 'No items matching the filters found.'}</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isChecked = selectedIds.includes(item._id);
                return (
                  <tr key={item._id} style={isChecked ? { background: 'rgba(212, 165, 165, 0.05)' } : undefined}>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSelectRow(item._id)}
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
                      <Link href={`/admin/taxonomy/${item._id}/edit?tab=${activeTab}`}>
                        <p className="admin-table-product__name hover:underline hover:text-[var(--admin-accent)] transition-colors" style={{ fontWeight: 600 }}>
                          {item.name}
                        </p>
                      </Link>
                    </td>
                    <td>
                      <code className="text-xs bg-[rgba(212,165,165,0.06)] px-2.5 py-1 rounded-lg text-[#D4A5A5] font-mono">
                        {item.slug}
                      </code>
                    </td>
                    {activeTab === 'tags' && (
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--admin-text-secondary, #6b564c)' }}>
                          {item.description || '—'}
                        </span>
                      </td>
                    )}
                    <td>
                      <span
                        className={`admin-badge ${item.status === 'active' ? 'admin-badge--ok' : 'admin-badge--low'}`}
                      >
                        {item.status === 'active' 
                          ? (isVi ? 'Đang hoạt động' : 'Active') 
                          : (isVi ? 'Tạm ngừng' : 'Inactive')
                        }
                      </span>
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