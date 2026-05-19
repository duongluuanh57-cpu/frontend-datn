'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, Sparkles, Award, ChevronLeft } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import { ImageUpload } from '@/components/admin/ImageUpload';
import React, { useState } from 'react';

export default function NewBrandPage() {
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    logo: '',
    description: '',
    gender: '',
    scentGroup: '',
    concentration: '',
    group: '',
    status: 'active' as 'active' | 'inactive',
    featured: false
  });
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);

  const handleAiGenerateBrand = async () => {
    if (!formData.name.trim()) return;
    setIsAiGenerating(true);
    try {
      const { data } = await api.post('/ai/generate-brand', { name: formData.name });
      if (data.success && data.data) {
        const info = data.data;
        setFormData((prev) => ({
          ...prev,
          origin: info.origin || prev.origin,
          logo: info.logo || prev.logo,
          description: info.description || prev.description,
          gender: info.gender || prev.gender,
          scentGroup: info.scentGroup || prev.scentGroup,
          concentration: info.concentration || prev.concentration,
          group: info.group || prev.group,
        }));
      }
    } catch (err) {
      console.error(err);
      alert(isVi ? 'Không thể viết câu chuyện thương hiệu bằng AI. Vui lòng thử lại.' : 'AI brand generation failed. Please try again.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (newBrand: typeof formData) => api.post('/brands', newBrand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      router.push('/admin/brands');
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized') || err.response?.data?.message?.includes('đăng nhập');
      if (isAuth) {
        alert(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        alert(isVi ? 'Không thể lưu thương hiệu. Vui lòng thử lại!' : 'Failed to save brand. Please try again!');
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
          <Link href="/admin/brands" className="admin-back-link">
            <ChevronLeft size={16} />
            {isVi ? 'Danh sách' : 'List'}
          </Link>
          <div>
            <h2 className="admin-form-toolbar__title">
              {isVi ? 'Thêm thương hiệu mới' : 'Add New Brand'}
            </h2>
            <p className="admin-form-toolbar__subtitle">L'essence Creative Studio</p>
          </div>
        </div>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={createMutation.isPending || isLogoUploading}
          className="admin-btn-submit disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createMutation.isPending || isLogoUploading ? (
            <Loader2 className="animate-spin" size={14} />
          ) : null}
          {isLogoUploading 
            ? (isVi ? 'Đang tải ảnh...' : 'Uploading logo...')
            : (isVi ? 'Tạo thương hiệu' : 'Create Brand')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-grid" style={{ gridTemplateColumns: '300px 1fr' }}>
        {/* Column 1: Logo & Status */}
        <section className="admin-form-card">
          <div className="admin-form-card__head">
            <div className="admin-form-card__head-icon">
              <Award size={18} />
            </div>
            <div>
              <p className="admin-form-card__title">{isVi ? 'Hình ảnh & Logo' : 'Logo & Visuals'}</p>
              <p className="admin-form-card__desc">{isVi ? 'Logo thương hiệu xa xỉ' : 'Luxury house logo'}</p>
            </div>
          </div>

          <ImageUpload 
            value={formData.logo} 
            onChange={(url) => setFormData(prev => ({ ...prev, logo: url }))} 
            onUploadStateChange={(uploading) => setIsLogoUploading(uploading)}
            folder="brands"
          />

          <div className="admin-form-fields" style={{ marginTop: 10 }}>
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
                <option value="active">{isVi ? 'Đang kinh doanh' : 'Active'}</option>
                <option value="inactive">{isVi ? 'Ngừng kinh doanh' : 'Inactive'}</option>
              </select>
            </div>

            <div className="admin-status-pill" style={{ marginTop: 'auto' }}>
              <span className="admin-status-pill__label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  style={{ width: 14, height: 14 }}
                />
                <label htmlFor="featured" className="cursor-pointer" style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--admin-text-muted)' }}>
                  {isVi ? 'Nổi bật' : 'Featured'}
                </label>
              </span>
              <span className="admin-status-pill__value" style={{ fontSize: '0.6875rem', fontWeight: 600 }}>
                {formData.featured ? (isVi ? 'Trang chủ' : 'Homepage') : (isVi ? 'Thường' : 'Standard')}
              </span>
            </div>
          </div>
        </section>

        {/* Column 2: Information */}
        <section className="admin-form-card">
          <div className="admin-form-card__head">
            <div className="admin-form-card__head-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="admin-form-card__title">{isVi ? 'Thông tin chi tiết' : 'Brand Information'}</p>
              <p className="admin-form-card__desc">{isVi ? 'Câu chuyện thương hiệu xa xỉ' : 'Details and heritage story'}</p>
            </div>
          </div>

          <div className="admin-form-fields" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="admin-field">
              <label className="admin-label" htmlFor="name">
                {isVi ? 'Tên thương hiệu' : 'Brand Name'} *
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Chanel, Dior, Creed..."
                  className="admin-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  disabled={!formData.name.trim() || isAiGenerating}
                  onClick={handleAiGenerateBrand}
                  className="admin-btn-submit"
                  style={{ background: 'transparent', border: '1px solid var(--admin-border)', color: 'var(--admin-text)', padding: '0 16px', boxShadow: 'none' }}
                >
                  {isAiGenerating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} className="text-[#D4A5A5]" />
                  )}
                  <span style={{ marginLeft: 6 }}>{isVi ? 'AI Viết' : 'AI Generate'}</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Quốc gia xuất xứ */}
              <div className="admin-field">
                <label className="admin-label" htmlFor="origin">
                  {isVi ? 'Quốc gia xuất xứ' : 'Country of Origin'}
                </label>
                <input
                  id="origin"
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  placeholder="VD: France, Italy, United Kingdom..."
                  className="admin-input"
                />
              </div>

              {/* Giới tính */}
              <div className="admin-field">
                <label className="admin-label" htmlFor="gender">
                  {isVi ? 'Giới tính' : 'Gender'}
                </label>
                <input
                  id="gender"
                  type="text"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  placeholder={isVi ? 'VD: Nam, Nữ, Unisex' : 'e.g., Men, Women, Unisex'}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="admin-field" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="admin-label" htmlFor="description">
                {isVi ? 'Câu chuyện thương hiệu (Mô tả)' : 'Brand Description / Story'}
              </label>
              <textarea
                id="description"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={isVi ? 'Kể về phong cách, lịch sử và nét độc bản...' : 'Narrate the heritage and uniqueness...'}
                className="admin-textarea"
                style={{ flex: 1, minHeight: 90 }}
              />
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
