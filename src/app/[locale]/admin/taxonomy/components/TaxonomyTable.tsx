'use client';

import React from 'react';
import { Loader2, Sparkles, Pencil, Lock, Trash2 } from 'lucide-react';
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
    handleEditClick,
    deleteMutation
  } = adminTaxonomy;

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}></th>
              <th>{isVi ? 'Tên gọi' : 'Name'}</th>
              <th>{isVi ? 'Mã liên kết (Slug)' : 'Slug'}</th>
              {activeTab === 'tags' && <th>{isVi ? 'Mô tả' : 'Description'}</th>}
              <th>{isVi ? 'Trạng thái' : 'Status'}</th>
              <th style={{ textAlign: 'right', width: '120px' }}>{isVi ? 'Thao tác' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={activeTab === 'tags' ? 6 : 5}>
                  <div className="admin-loading" style={{ padding: '60px 0' }}>
                    <Loader2 className="admin-loading__spinner animate-spin" />
                    <p>{isVi ? 'Đang tải danh sách thuộc tính...' : 'Loading taxonomy details...'}</p>
                  </div>
                </td>
              </tr>
            ) : !items?.length ? (
              <tr>
                <td colSpan={activeTab === 'tags' ? 6 : 5}>
                  <div className="admin-empty" style={{ padding: '60px 0' }}>
                    <Sparkles className="admin-empty__icon" />
                    <p>{isVi ? 'Chưa có bản ghi nào được tạo lập.' : 'No taxonomy items found.'}</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isSystemTag = activeTab === 'tags' && (item.slug === 'Sale' || item.slug === 'New');
                return (
                  <tr key={item._id}>
                    <td>
                      <div className="flex items-center justify-center text-[#D4A5A5]">
                        {React.createElement(currentTabConfig.icon, { size: 18 })}
                      </div>
                    </td>
                    <td>
                      <p className="admin-table-product__name" style={{ fontWeight: 600 }}>{item.name}</p>
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
                    <td>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          className="admin-icon-btn"
                          aria-label={`Sửa ${item.name}`}
                          onClick={() => handleEditClick(item)}
                        >
                          <Pencil size={17} />
                        </button>
                        {isSystemTag ? (
                          <button
                            type="button"
                            className="admin-icon-btn opacity-40 cursor-not-allowed"
                            title={isVi ? 'Tag hệ thống mặc định (Không thể xóa)' : 'Default system tag (Cannot be deleted)'}
                            disabled
                          >
                            <Lock size={17} className="text-gray-400" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-icon-btn admin-icon-btn--danger"
                            aria-label={`Xóa ${item.name}`}
                            onClick={() => {
                              const confirmMsg = isVi 
                                ? `Bạn có chắc chắn muốn xóa "${item.name}" khỏi cơ sở dữ liệu?`
                                : `Are you sure you want to delete "${item.name}" from the database?`;
                              if (confirm(confirmMsg)) {
                                deleteMutation.mutate(item._id);
                              }
                            }}
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
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
