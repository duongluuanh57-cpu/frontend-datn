'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, ChevronLeft } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import { useState, useEffect } from 'react';
import { CategoryForm } from '../components/CategoryForm';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default function EditCategoryPage({ params }: PageProps) {
  const { id } = React.use(params);
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const [formData, setFormData] = useState({
    name: '',
    status: 'active' as 'active' | 'inactive',
    sortOrder: 0,
  });

  const { data: category, isLoading, error } = useQuery({
    queryKey: ['admin-category', id],
    queryFn: async () => {
      const { data } = await api.get(`/categories/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        status: category.status || 'active',
        sortOrder: category.sortOrder ?? 0,
      });
    }
  }, [category]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData: typeof formData) => api.patch(`/categories/${id}`, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-category', id] });
      router.push('/admin/categories');
    },
    onError: (err: any) => {
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized') || err.response?.data?.message?.includes('đăng nhập');
      if (isAuth) {
        alert(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        alert(err.response?.data?.message || (isVi ? 'Vui lòng kiểm tra lại thông tin.' : 'Please check the information.'));
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
        <p>{isVi ? 'Đang tải danh mục...' : 'Loading category...'}</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="admin-alert">
        <h2 className="admin-alert__title">{isVi ? 'Không tìm thấy danh mục' : 'Category Not Found'}</h2>
        <p className="admin-alert__text">
          {isVi ? 'Danh mục này không tồn tại hoặc đã bị xóa.' : 'This category does not exist or has been deleted.'}
        </p>
        <Link href="/admin/categories" className="mt-4 px-5 py-2.5 rounded-xl border border-[var(--admin-border-subtle)] text-[#7A5C5C] hover:bg-[rgba(0,0,0,0.02)] transition inline-block">
          {isVi ? 'Quay lại danh sách' : 'Back to catalog'}
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-form-page">
      <div className="admin-form-toolbar">
        <div className="admin-form-toolbar__left">
          <div>
            <h2 className="admin-form-toolbar__title">
              {isVi ? 'Chỉnh sửa danh mục' : 'Edit Category'}
            </h2>
            <p className="admin-form-toolbar__subtitle">
              {isVi ? `Danh mục: ${category.name}` : `Category: ${category.name}`}
            </p>
          </div>
        </div>
        <div className="admin-page-header__actions flex gap-2">
          <Link
            href="/admin/categories"
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-[#7A5C5C]/60 hover:bg-gray-50 transition-all inline-flex items-center gap-2"
          >
            <ChevronLeft size={16} /> {isVi ? 'Quay lại' : 'Back'}
          </Link>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="px-4 py-2 bg-[#7A5C5C] hover:bg-[#604444] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 inline-flex items-center gap-2"
          >
            {updateMutation.isPending ? (
              <Loader2 className="animate-spin" size={14} />
            ) : null}
            {isVi ? 'Lưu thay đổi' : 'Save Changes'}
          </button>
        </div>
      </div>

      <CategoryForm
        formData={formData}
        onChange={setFormData}
      />
    </div>
  );
}
