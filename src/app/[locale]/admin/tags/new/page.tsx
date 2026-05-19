'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, Sparkles, Hash, ChevronLeft } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import React, { useState } from 'react';

export default function NewTagPage() {
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'active' as 'active' | 'inactive'
  });

  const createMutation = useMutation({
    mutationFn: async (newTag: typeof formData) => api.post('/tags', newTag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      router.push('/admin/taxonomy');
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized') || err.response?.data?.message?.includes('đăng nhập');
      if (isAuth) {
        alert(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        alert(isVi ? 'Không thể lưu tag này. Vui lòng thử lại!' : 'Failed to save tag. Please try again!');
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    createMutation.mutate(formData);
  };

  return (
    <div className="admin-form-page">
      <div className="admin-form-toolbar">
        <div className="admin-form-toolbar__left">
          <Link href="/admin/taxonomy" className="admin-back-link">
            <ChevronLeft size={16} />
            {isVi ? 'Danh sách' : 'List'}
          </Link>
          <div>
            <h2 className="admin-form-toolbar__title">
              {isVi ? 'Thêm tag mới' : 'Add New Tag'}
            </h2>
            <p className="admin-form-toolbar__subtitle">L'essence Taxonomy Studio</p>
          </div>
        </div>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="admin-btn-submit"
        >
          {createMutation.isPending && <Loader2 className="animate-spin" size={14} />}
          {isVi ? 'Tạo tag' : 'Create Tag'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto w-full mt-6">
        <section className="admin-form-card" style={{ height: 'auto', padding: '24px 28px' }}>
          <div className="admin-form-card__head">
            <div className="admin-form-card__head-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="admin-form-card__title">{isVi ? 'Thông tin phân loại' : 'Taxonomy Info'}</p>
              <p className="admin-form-card__desc">{isVi ? 'Tên, đường dẫn và trạng thái hoạt động của tag' : 'Tag title, slug path and status settings'}</p>
            </div>
          </div>

          <div className="admin-form-fields" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="admin-field">
              <label className="admin-label" htmlFor="name">
                {isVi ? 'Tên Tag' : 'Tag Name'} *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Hương Gỗ, Hoa Hồng, EDP..."
                className="admin-input"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="slug">
                {isVi ? 'Đường dẫn (Slug)' : 'Slug (URL path)'}
              </label>
              <input
                id="slug"
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder={isVi ? 'Tự động tạo từ tên nếu bỏ trống' : 'Auto-generated from name if left empty'}
                className="admin-input"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="status">
                {isVi ? 'Trạng thái hoạt động' : 'Status'}
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="admin-select"
              >
                <option value="active">{isVi ? 'Đang hoạt động' : 'Active'}</option>
                <option value="inactive">{isVi ? 'Tạm ngưng' : 'Inactive'}</option>
              </select>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
