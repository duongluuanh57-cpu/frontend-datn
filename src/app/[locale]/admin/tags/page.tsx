'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Pencil, Trash2, Loader2, Sparkles, AlertCircle, Hash, Lock } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link } from '@/navigation';
import React from 'react';

interface Tag {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'inactive';
}

export default function AdminTagsPage() {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  // Fetch tags
  const { data: tags, isLoading, error } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: async () => {
      const { data } = await api.get('/tags');
      return data.data as Tag[];
    },
  });

  // Mutation: Delete tag
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/tags/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized') || err.response?.data?.message?.includes('đăng nhập');
      if (isAuth) {
        alert(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        alert(isVi ? 'Không thể xóa tag này.' : 'Failed to delete tag.');
      }
    }
  });

  if (error) {
    return (
      <div className="admin-alert">
        <AlertCircle className="admin-alert__icon" />
        <h2 className="admin-alert__title">{isVi ? 'Lỗi kết nối dữ liệu' : 'Data Connection Error'}</h2>
        <p className="admin-alert__text">
          {isVi ? 'Không thể tải danh sách tag. Vui lòng kiểm tra lại kết nối server.' : 'Unable to load tags. Please verify server connection.'}
        </p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">{isVi ? 'QUẢN LÝ TAG' : 'TAG MANAGEMENT'}</h1>
          <p className="admin-page-header__subtitle">
            {isVi ? 'Danh mục các thẻ nhãn phân loại sản phẩm nước hoa.' : 'Product taxonomy tags and categories.'}
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link href="/admin/tags/new" className="admin-btn-primary flex items-center gap-2">
            <Plus size={18} />
            {isVi ? 'Thêm tag mới' : 'Add New Tag'}
          </Link>
        </div>
      </header>

      {/* Tags List Table */}
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
              ) : !tags?.length ? (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-empty">
                      <Sparkles className="admin-empty__icon" />
                      <p>{isVi ? 'Chưa có tag nào được tạo.' : 'No tags found.'}</p>
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
                              const confirmMsg = isVi 
                                ? `Bạn có chắc chắn muốn xóa tag "${tag.name}" khỏi hệ thống?`
                                : `Are you sure you want to remove "${tag.name}" tag?`;
                              if (confirm(confirmMsg)) {
                                deleteMutation.mutate(tag._id);
                              }
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
    </div>
  );
}
