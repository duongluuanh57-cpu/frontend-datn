'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, Sparkles, Award, ChevronLeft } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useState, useEffect, useRef } from 'react';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default function EditBrandPage({ params }: PageProps) {
  const { id } = React.use(params);
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';

  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    logo: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
    featured: false
  });
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);

  // Fetch brand data
  const { data: brand, isLoading, error } = useQuery({
    queryKey: ['admin-brand', id],
    queryFn: async () => {
      const { data } = await api.get(`/brands/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });

  const lastGeneratedNameRef = useRef('');

  // Prefill form once brand is loaded
  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || '',
        origin: brand.origin || '',
        logo: brand.logo || '',
        description: brand.description || '',
        status: brand.status || 'active',
        featured: brand.featured || false
      });
      lastGeneratedNameRef.current = brand.name || '';
    }
  }, [brand]);

  const handleAiGenerateBrand = async (isManual = false) => {
    const trimmedName = formData.name.trim();
    if (!trimmedName) return;
    if (!isManual && trimmedName === lastGeneratedNameRef.current) return;
    
    lastGeneratedNameRef.current = trimmedName;
    setIsAiGenerating(true);
    try {
      const { data } = await api.post('/ai/generate-brand', { name: trimmedName });
      if (data.success && data.data) {
        const info = data.data;
        setFormData((prev) => ({
          ...prev,
          origin: info.origin || prev.origin,
          logo: info.logo || prev.logo,
          description: info.description || prev.description,
        }));
      }
    } catch (err) {
      console.error(err);
      if (isManual) {
        alert(isVi ? 'Không thể viết câu chuyện thương hiệu bằng AI. Vui lòng thử lại.' : 'AI brand generation failed. Please try again.');
      }
    } finally {
      setIsAiGenerating(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (updatedData: typeof formData) => api.patch(`/brands/${id}`, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      queryClient.invalidateQueries({ queryKey: ['admin-brand', id] });
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
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="admin-loading" style={{ minHeight: 320 }}>
        <Loader2 className="admin-loading__spinner animate-spin" />
        <p>{isVi ? 'Đang tải thương hiệu...' : 'Loading brand details...'}</p>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="admin-alert">
        <h2 className="admin-alert__title">{isVi ? 'Không tìm thấy thương hiệu' : 'Brand Not Found'}</h2>
        <p className="admin-alert__text">
          {isVi ? 'Thương hiệu này không tồn tại hoặc đã bị xóa khỏi hệ thống.' : 'This brand does not exist or has been deleted.'}
        </p>
        <Link href="/admin/brands" className="mt-4 px-5 py-2.5 rounded-xl border border-[var(--admin-border-subtle)] text-[#7A5C5C] hover:bg-[rgba(0,0,0,0.02)] transition inline-block">
          {isVi ? 'Quay lại danh sách' : 'Back to catalog'}
        </Link>
      </div>
    );
  }

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
              {isVi ? 'Chỉnh sửa thương hiệu' : 'Edit Brand'}
            </h2>
            <p className="admin-form-toolbar__subtitle">
              {isVi ? `Thương hiệu: ${brand.name}` : `Brand: ${brand.name}`}
            </p>
          </div>
        </div>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={updateMutation.isPending || isLogoUploading}
          className="admin-btn-submit disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateMutation.isPending || isLogoUploading ? (
            <Loader2 className="animate-spin" size={14} />
          ) : null}
          {isLogoUploading 
            ? (isVi ? 'Đang tải ảnh...' : 'Uploading logo...')
            : (isVi ? 'Lưu thay đổi' : 'Save Changes')}
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
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onBlur={() => handleAiGenerateBrand(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAiGenerateBrand(false);
                    }
                  }}
                  placeholder="VD: Chanel, Dior, Creed..."
                  className="admin-input"
                  style={{ width: '100%', paddingRight: isAiGenerating ? '75px' : '12px' }}
                />
                {isAiGenerating && (
                  <div style={{ position: 'absolute', right: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Loader2 size={14} className="animate-spin text-[#7A5C5C]" />
                    <span className="text-[10px] text-[#7A5C5C] font-bold uppercase tracking-wider select-none animate-pulse">AI viết</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
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
