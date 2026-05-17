'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Pencil, Trash2, Loader2, Sparkles, AlertCircle, Award, Check, X, Globe } from 'lucide-react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/navigation';
import React from 'react';

interface Brand {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  origin?: string;
  status: 'active' | 'inactive';
  featured: boolean;
}

export default function AdminBrandsPage() {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  // Lấy danh sách thương hiệu
  const { data: brands, isLoading, error } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const { data } = await api.get('/brands');
      return data.data as Brand[];
    },
  });

  // Mutation: Cập nhật thương hiệu (dành cho nút toggle featured)
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Brand> }) => 
      api.patch(`/brands/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized') || err.response?.data?.message?.includes('đăng nhập');
      if (isAuth) {
        alert(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        alert(isVi ? 'Không thể cập nhật thương hiệu. Vui lòng thử lại!' : 'Failed to update brand. Please try again!');
      }
    }
  });

  // Mutation: Xóa thương hiệu
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/brands/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized') || err.response?.data?.message?.includes('đăng nhập');
      if (isAuth) {
        alert(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        alert(isVi ? 'Không thể xóa thương hiệu này.' : 'Failed to delete brand.');
      }
    }
  });

  const handleToggleFeatured = (brand: Brand) => {
    updateMutation.mutate({
      id: brand._id,
      data: { featured: !brand.featured }
    });
  };

  if (error) {
    return (
      <div className="admin-alert">
        <AlertCircle className="admin-alert__icon" />
        <h2 className="admin-alert__title">{isVi ? 'Lỗi kết nối dữ liệu' : 'Data Connection Error'}</h2>
        <p className="admin-alert__text">
          {isVi ? 'Không thể tải danh sách thương hiệu. Vui lòng kiểm tra lại kết nối server.' : 'Unable to load brands. Please verify server connection.'}
        </p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">{isVi ? 'QUẢN LÝ THƯƠNG HIỆU' : 'BRAND MANAGEMENT'}</h1>
          <p className="admin-page-header__subtitle">
            {isVi ? 'Danh sách các thương hiệu nước hoa xa xỉ đang hoạt động.' : 'Active premium fragrance brands catalog.'}
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link href="/admin/brands/new" className="admin-btn-primary flex items-center gap-2">
            <Plus size={18} />
            {isVi ? 'Thêm thương hiệu mới' : 'Add New Brand'}
          </Link>
        </div>
      </header>

      {/* Brands List Table */}
      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{isVi ? 'Thương hiệu' : 'Brand'}</th>
                <th>{isVi ? 'Xuất xứ' : 'Origin'}</th>
                <th>{isVi ? 'Trạng thái' : 'Status'}</th>
                <th>{isVi ? 'Nổi bật (Homepage)' : 'Featured'}</th>
                <th style={{ textAlign: 'right' }}>{isVi ? 'Thao tác' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-loading">
                      <Loader2 className="admin-loading__spinner animate-spin" />
                      <p>{isVi ? 'Đang tải danh sách thương hiệu...' : 'Loading brands catalog...'}</p>
                    </div>
                  </td>
                </tr>
              ) : !brands?.length ? (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-empty">
                      <Sparkles className="admin-empty__icon" />
                      <p>{isVi ? 'Chưa có thương hiệu nào được tạo.' : 'No brand entries found.'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand._id}>
                    <td>
                      <div className="admin-table-product">
                        <div className="admin-table-product__thumb flex items-center justify-center bg-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden relative">
                          {brand.logo ? (
                            <Image
                              src={brand.logo}
                              alt={brand.name}
                              fill
                              sizes="52px"
                              className="object-cover"
                            />
                          ) : (
                            <Award className="text-[#D4A5A5]" size={22} />
                          )}
                        </div>
                        <div>
                          <p className="admin-table-product__name">{brand.name}</p>
                          <p className="admin-table-product__meta truncate max-w-[300px]">
                            {brand.description || (isVi ? 'Chưa có mô tả câu chuyện.' : 'No brand description.')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="flex items-center gap-2 text-sm text-[#7A5C5C]">
                        <Globe size={14} className="text-[#D4A5A5]" />
                        {brand.origin || (isVi ? 'Chưa cập nhật' : 'Unknown')}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${brand.status === 'active' ? 'admin-badge--ok' : 'admin-badge--low'}`}
                      >
                        {brand.status === 'active' 
                          ? (isVi ? 'Đang hoạt động' : 'Active') 
                          : (isVi ? 'Tạm ngừng' : 'Inactive')
                        }
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleFeatured(brand)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                          brand.featured 
                            ? 'bg-[#7A5C5C]/10 text-[#7A5C5C] border border-[#7A5C5C]/20'
                            : 'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {brand.featured ? <Check size={12} /> : <X size={12} />}
                        {brand.featured ? (isVi ? 'Nổi bật' : 'Featured') : (isVi ? 'Thường' : 'Standard')}
                      </button>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <Link href={`/admin/brands/${brand._id}`}>
                          <button
                            type="button"
                            className="admin-icon-btn"
                            aria-label={`Sửa ${brand.name}`}
                          >
                            <Pencil size={17} />
                          </button>
                        </Link>
                        <button
                          type="button"
                          className="admin-icon-btn admin-icon-btn--danger"
                          aria-label={`Xóa ${brand.name}`}
                          onClick={() => {
                            const confirmMsg = isVi 
                              ? `Bạn có chắc chắn muốn xóa thương hiệu "${brand.name}" khỏi hệ thống?`
                              : `Are you sure you want to remove "${brand.name}" brand?`;
                            if (confirm(confirmMsg)) {
                              deleteMutation.mutate(brand._id);
                            }
                          }}
                        >
                          <Trash2 size={17} />
                        </button>
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
