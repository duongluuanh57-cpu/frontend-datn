'use client';

import React from 'react';
import { Loader2, Sparkles, Search, Pencil, Lock, Trash2 } from 'lucide-react';
import { Link } from '@/navigation';
import { toast } from 'sonner';
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
    deleteMutation,
    total,
    searchTerm,
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
            ) : total === 0 && !searchTerm ? (
              <tr>
                <td colSpan={activeTab === 'tags' ? 6 : 5}>
                  <div className="admin-empty" style={{ padding: '60px 0' }}>
                    <Sparkles className="admin-empty__icon" />
                    <p>{isVi ? 'Chưa có bản ghi nào được tạo lập.' : 'No taxonomy items found.'}</p>
                  </div>
                </td>
              </tr>
            ) : !items?.length ? (
              <tr>
                <td colSpan={activeTab === 'tags' ? 6 : 5}>
                  <div className="admin-empty" style={{ padding: '60px 0' }}>
                    <Search className="admin-empty__icon" style={{ opacity: 0.5, marginBottom: '8px' }} />
                    <p>{isVi ? 'Không tìm thấy bản ghi nào khớp với bộ lọc.' : 'No items matching the filters found.'}</p>
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
                        <Link
                          href={`/admin/taxonomy/${item._id}/edit?tab=${activeTab}`}
                          className="admin-icon-btn"
                          aria-label={`Sửa ${item.name}`}
                        >
                          <Pencil size={17} />
                        </Link>
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
                              toast.custom((tId) => (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 flex flex-col gap-3 min-w-[280px]">
                                  <p className="text-sm font-semibold text-[#7A5C5C]">{isVi ? 'Xác nhận xóa' : 'Confirm deletion'}</p>
                                  <p className="text-xs text-[#7A5C5C]/70">
                                    {isVi ? `Bạn có chắc muốn xóa "${item.name}"?` : `Are you sure you want to delete "${item.name}"?`}
                                  </p>
                                  <div className="flex gap-2 justify-end pt-1">
                                    <button
                                      onClick={() => toast.dismiss(tId)}
                                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-[#7A5C5C] hover:bg-gray-50 transition-colors"
                                    >
                                      {isVi ? 'Hủy' : 'Cancel'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        deleteMutation.mutate(item._id);
                                        toast.dismiss(tId);
                                      }}
                                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                                    >
                                      {isVi ? 'Xóa' : 'Delete'}
                                    </button>
                                  </div>
                                </div>
                              ), { duration: Infinity });
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
