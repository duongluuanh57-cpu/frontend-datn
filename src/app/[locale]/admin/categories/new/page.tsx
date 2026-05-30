'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, ChevronLeft } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import React, { useState } from 'react';
import { CategoryForm } from '../components/CategoryForm';

export default function NewCategoryPage() {
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const [formData, setFormData] = useState({
    name: '',
    status: 'active' as 'active' | 'inactive',
    sortOrder: 0,
  });

  const createMutation = useMutation({
    mutationFn: async (newCategory: typeof formData) => api.post('/categories', newCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
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
    createMutation.mutate(formData);
  };

  return (
    <div className="admin-form-page">
      <div className="admin-form-toolbar">
        <div className="admin-form-toolbar__left">
          <div>
            <h2 className="admin-form-toolbar__title">
              {isVi ? 'Thêm danh mục mới' : 'Add New Category'}
            </h2>
            <p className="admin-form-toolbar__subtitle">
              {isVi ? 'Tạo danh mục sản phẩm mới' : 'Create a new product category'}
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
            disabled={createMutation.isPending}
            className="px-4 py-2 bg-[#7A5C5C] hover:bg-[#604444] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 inline-flex items-center gap-2"
          >
            {createMutation.isPending ? (
              <Loader2 className="animate-spin" size={14} />
            ) : null}
            {isVi ? 'Tạo danh mục' : 'Create Category'}
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
