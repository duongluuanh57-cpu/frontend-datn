'use client';

import React, { useState } from 'react';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAdminTaxonomy } from '@/hooks/useAdminTaxonomy';

export default function NewTaxonomyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isVi = locale === 'vi';
  const tab = (searchParams.get('tab') || 'tags') as string;

  const adminTaxonomy = useAdminTaxonomy();
  const currentTabConfig = adminTaxonomy.tabs.find(t => t.id === tab) || adminTaxonomy.tabs[0];

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(isVi ? 'Vui lòng nhập tên' : 'Please enter a name');
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        status: formData.status,
      };

      if (!currentTabConfig.taxonomySlug) {
        await api.post('/tags', payload);
      } else {
        const { data: taxList } = await api.get('/v2/taxonomies');
        const taxonomyId = (taxList.data as { _id: string; slug: string }[]).find(t => t.slug === currentTabConfig.taxonomySlug)?._id;
        if (!taxonomyId) throw new Error('Taxonomy cha chưa được tạo');
        await api.post(`/v2/taxonomies/${taxonomyId}/terms`, payload);
      }

      toast.success(isVi ? 'Đã tạo thành công' : 'Created successfully');
      router.push(`/admin/taxonomy?tab=${tab}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">
            {isVi ? `Thêm ${currentTabConfig.labelVi.replace('Quản lý ', '')} mới` : `Add New ${currentTabConfig.labelEn.replace(' Management', '')}`}
          </h1>
          <p className="admin-page-header__subtitle">{currentTabConfig.labelVi} — {isVi ? 'Thiết lập thuộc tính lưu trữ' : 'Configure taxonomy values'}</p>
        </div>
        <div className="admin-page-header__actions flex gap-2">
          <button
            onClick={() => router.push(`/admin/taxonomy?tab=${tab}`)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-[#7A5C5C]/60 hover:bg-gray-50 transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} /> {isVi ? 'Quay lại' : 'Back'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 bg-[#7A5C5C] hover:bg-[#604444] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 inline-flex items-center gap-2"
          >
            {isSaving ? <><Loader2 size={16} className="animate-spin" /> {isVi ? 'Đang lưu...' : 'Saving...'}</> : <><Check size={16} /> {isVi ? 'Tạo mới' : 'Create'}</>}
          </button>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-2">
              {isVi ? 'Tên gọi hiển thị' : 'Display Name'} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={isVi ? 'Ví dụ: Hương Gỗ (Woody)' : 'e.g. Woody Spicy'}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4A5A5] focus:ring-4 focus:ring-[#D4A5A5]/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-2">
              {isVi ? 'Mã liên kết (Slug)' : 'Slug'}
            </label>
            <input
              type="text"
              placeholder={isVi ? 'Để trống hệ thống sẽ tự động tạo' : 'Leave empty to auto-generate'}
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4A5A5] focus:ring-4 focus:ring-[#D4A5A5]/10 transition-all font-mono"
            />
          </div>



          <div>
            <label className="block text-xs font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-2">
              {isVi ? 'Trạng thái' : 'Status'}
            </label>
            <div className="flex gap-3">
              {(['active', 'inactive'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: st }))}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all ${
                    formData.status === st
                      ? 'bg-[#7A5C5C] text-white border-[#7A5C5C]'
                      : 'bg-white text-[#7A5C5C]/60 border-gray-200 hover:border-[#7A5C5C]/40'
                  }`}
                >
                  <Check size={14} className={`inline mr-1.5 ${formData.status === st ? '' : 'opacity-0'}`} />
                  {st === 'active' ? (isVi ? 'Hoạt động' : 'Active') : (isVi ? 'Tạm ngưng' : 'Inactive')}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}