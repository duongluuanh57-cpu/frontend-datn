'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, Sparkles, Hash, ChevronLeft } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import { useState, useEffect } from 'react';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default function EditTagPage({ params }: PageProps) {
  const { id } = React.use(params);
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'active' as 'active' | 'inactive'
  });

  // Fetch tag data
  const { data: tag, isLoading, error } = useQuery({
    queryKey: ['admin-tag', id],
    queryFn: async () => {
      const { data } = await api.get(`/tags/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });

  // Prefill form once tag is loaded
  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name || '',
        slug: tag.slug || '',
        status: tag.status || 'active'
      });
    }
  }, [tag]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData: typeof formData) => api.patch(`/tags/${id}`, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tag', id] });
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
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="admin-loading" style={{ minHeight: 320 }}>
        <Loader2 className="admin-loading__spinner animate-spin" />
        <p>{isVi ? 'Đang tải thông tin tag...' : 'Loading tag details...'}</p>
      </div>
    );
  }

  if (error || !tag) {
    return (
      <div className="admin-alert">
        <h2 className="admin-alert__title">{isVi ? 'Không tìm thấy tag' : 'Tag Not Found'}</h2>
        <p className="admin-alert__text">
          {isVi ? 'Tag này không tồn tại hoặc đã bị xóa khỏi hệ thống.' : 'This tag does not exist or has been deleted.'}
        </p>
        <Link href="/admin/taxonomy" className="mt-4 px-5 py-2.5 rounded-xl border border-[var(--admin-border-subtle)] text-[#7A5C5C] hover:bg-[rgba(0,0,0,0.02)] transition inline-block">
          {isVi ? 'Quay lại danh sách' : 'Back to catalog'}
        </Link>
      </div>
    );
  }

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
              {isVi ? 'Chỉnh sửa tag' : 'Edit Tag'}
            </h2>
            <p className="admin-form-toolbar__subtitle">
              {isVi ? `Tag: ${tag.name}` : `Tag: ${tag.name}`}
            </p>
          </div>
        </div>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
          className="admin-btn-submit"
        >
          {updateMutation.isPending && <Loader2 className="animate-spin" size={14} />}
          {isVi ? 'Lưu thay đổi' : 'Save Changes'}
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
