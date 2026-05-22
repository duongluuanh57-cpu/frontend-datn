'use client';

import React from 'react';
import { Loader2, Sparkles, Search, Hash, Pencil, Lock, Trash2 } from 'lucide-react';
import { Link } from '@/navigation';
import { toast } from 'sonner';
import type { UseAdminTagsReturn } from '@/hooks/useAdminTags';

interface TagTableProps {
  adminTags: UseAdminTagsReturn;
}

export function TagTable({ adminTags }: TagTableProps) {
  const {
    tags,
    isLoading,
    isVi,
    deleteMutation,
    total,
    searchTerm,
  } = adminTags;

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>{isVi ? 'Tên Tag' : 'Tag Name'}</th>
              <th>{isVi ? 'Đường dẫn (Slug)' : 'Slug'}</th>
              <th>{isVi ? 'Trạng thái' : 'Status'}</th>
              <th style={{ textAlign: 'right' }}>{isVi ? 'Thao tác' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5}>
                  <div className="admin-loading">
                    <Loader2 className="admin-loading__spinner animate-spin" />
                    <p>{isVi ? 'Đang tải danh sách tag...' : 'Loading tags catalog...'}</p>
                  </div>
                </td>
              </tr>
            ) : total === 0 && !searchTerm ? (
              <tr>
                <td colSpan={5}>
                  <div className="admin-empty">
                    <Sparkles className="admin-empty__icon" />
                    <p>{isVi ? 'Chưa có tag nào được tạo.' : 'No tags found.'}</p>
                  </div>
                </td>
              </tr>
            ) : !tags?.length ? (
              <tr>
                <td colSpan={5}>
                  <div className="admin-empty">
                    <Search className="admin-empty__icon" style={{ opacity: 0.5, marginBottom: '8px' }} />
                    <p>{isVi ? 'Không tìm thấy tag nào khớp với bộ lọc.' : 'No tags matching the filters found.'}</p>
                  </div>
                </td>
              </tr>
            ) : (
              tags.map((tag) => (
                <tr key={tag._id}>
                  <td>
                    <div className="flex items-center justify-center text-[#D4A5A5]">
                      <Hash size={18} />
                    </div>
                  </td>
                  <td>
                    <p className="admin-table-product__name">{tag.name}</p>
                  </td>
                  <td>
                    <code className="text-xs bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded text-[#D4A5A5] font-mono">
                      {tag.slug}
                    </code>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${tag.status === 'active' ? 'admin-badge--ok' : 'admin-badge--low'}`}
                    >
                      {tag.status === 'active' 
                        ? (isVi ? 'Đang hoạt động' : 'Active') 
                        : (isVi ? 'Tạm ngừng' : 'Inactive')
                      }
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <Link href={`/admin/tags/${tag._id}`}>
                        <button
                          type="button"
                          className="admin-icon-btn"
                          aria-label={`Sửa ${tag.name}`}
                        >
                          <Pencil size={17} />
                        </button>
                      </Link>
                      {tag.slug === 'Sale' || tag.slug === 'New' ? (
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
                          aria-label={`Xóa ${tag.name}`}
                          onClick={() => {
                            toast.custom((tId) => (
                              <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 flex flex-col gap-3 min-w-[280px]">
                                <p className="text-sm font-semibold text-[#7A5C5C]">{isVi ? 'Xác nhận xóa' : 'Confirm deletion'}</p>
                                <p className="text-xs text-[#7A5C5C]/70">
                                  {isVi ? `Bạn có chắc muốn xóa tag "${tag.name}"?` : `Are you sure you want to remove "${tag.name}"?`}
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
                                      deleteMutation.mutate(tag._id);
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
