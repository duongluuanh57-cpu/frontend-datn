'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from '@/navigation';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAdminTaxonomy } from '@/hooks/useAdminTaxonomy';
import type { TaxonomyItem } from '@/types/admin';

export default function EditTaxonomyPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isVi = locale === 'vi';
  const tab = (searchParams.get('tab') || 'tags') as string;

  const adminTaxonomy = useAdminTaxonomy();
  const currentTabConfig = adminTaxonomy.tabs.find(t => t.id === tab) || adminTaxonomy.tabs[0];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'active' as 'active' | 'inactive',
    description: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        let item: TaxonomyItem | undefined;

        if (!currentTabConfig.taxonomySlug) {
          const { data } = await api.get('/tags');
          item = (data.data as TaxonomyItem[]).find((i: TaxonomyItem) => i._id === id);
          if (!item) throw new Error('Not found');
        } else {
          const { data: taxList } = await api.get('/v2/taxonomies');
          const taxonomyId = (taxList.data as { _id: string; slug: string }[]).find(t => t.slug === currentTabConfig.taxonomySlug)?._id;
          if (!taxonomyId) throw new Error('Taxonomy cha chưa được tạo');
          const { data } = await api.get(`/v2/taxonomies/${taxonomyId}/terms`);
          item = (data.data as TaxonomyItem[]).find((i: TaxonomyItem) => i._id === id);
          if (!item) throw new Error('Not found');
        }

        setFormData({
          name: item.name,
          slug: item.slug,
          status: item.status,
          description: item.description || '',
        });
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, currentTabConfig.taxonomySlug]);

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
        description: formData.description.trim() || undefined,
      };

      if (!currentTabConfig.taxonomySlug) {
        await api.patch(`/tags/${id}`, payload);
      } else {
        const { data: taxList } = await api.get('/v2/taxonomies');
        const taxonomyId = (taxList.data as { _id: string; slug: string }[]).find(t => t.slug === currentTabConfig.taxonomySlug)?._id;
        if (!taxonomyId) throw new Error('Taxonomy cha chưa được tạo');
        await api.patch(`/v2/taxonomies/${taxonomyId}/terms/${id}`, payload);
      }

      toast.success(isVi ? 'Đã cập nhật thành công' : 'Updated successfully');
      router.push(`/admin/taxonomy?tab=${tab}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading py-20">
          <Loader2 className="admin-loading__spinner" />
          <p>{isVi ? 'Đang tải...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-alert">
          <AlertCircle className="admin-alert__icon" />
          <h2 className="admin-alert__title">{isVi ? 'Lỗi' : 'Error'}</h2>
          <p className="admin-alert__text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">
            {isVi ? `Chỉnh sửa ${currentTabConfig.labelVi.replace('Quản lý ', '')}` : `Edit ${currentTabConfig.labelEn.replace(' Management', '')}`}
          </h1>
          <p className="admin-page-header__subtitle">{currentTabConfig.labelVi}</p>
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
            {isSaving ? <><Loader2 size={16} className="animate-spin" /> {isVi ? 'Đang lưu...' : 'Saving...'}</> : <><Check size={16} /> {isVi ? 'Lưu thay đổi' : 'Save Changes'}</>}
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
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4A5A5] focus:ring-4 focus:ring-[#D4A5A5]/10 transition-all font-mono"
            />
          </div>

          {tab === 'tags' && (
            <div>
              <label className="block text-xs font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-2">
                {isVi ? 'Mô tả nhãn' : 'Description'}
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4A5A5] focus:ring-4 focus:ring-[#D4A5A5]/10 transition-all resize-none"
              />
            </div>
          )}

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