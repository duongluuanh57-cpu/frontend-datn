'use client';

import React from 'react';
import { Sparkles, Tag } from 'lucide-react';
import { MultipleImageUpload } from '@/components/admin/MultipleImageUpload';
import { UseProductFormReturn, slugify } from './useProductForm';

export function ProductMediaSection({ formHelpers }: { formHelpers: UseProductFormReturn }) {
  const {
    t,
    isVi,
    formData,
    update,
    setIsImageUploading,
    brands,
    tags,
    selectedTags,
    setIsTagModalOpen,
  } = formHelpers;

  return (
    <section className="admin-form-card">
      <div className="admin-form-card__head">
        <div className="admin-form-card__head-icon">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="admin-form-card__title">{t('sections.media')}</p>
          <p className="admin-form-card__desc">{t('sections.mediaDesc')}</p>
        </div>
      </div>

      {/* Lưới hình ảnh (Gồm cả ảnh chính và ảnh phụ) */}
      <div className="mb-4">
        <MultipleImageUpload
          value={formData.image ? [formData.image, ...(formData.images || [])] : []}
          onChange={(urls) => {
            const primary = urls[0] || '';
            const secondary = urls.slice(1);
            update({
              image: primary,
              images: secondary
            });
          }}
          onUploadStateChange={(uploading) => setIsImageUploading(uploading)}
          maxImages={10}
          folder={formData.name.trim() ? `products/${slugify(formData.name)}` : 'products'}
        />
      </div>


      <div className="admin-form-fields" style={{ marginTop: 10 }}>
        <div className="admin-field">
          <label className="admin-label" htmlFor="brand">
            {t('fields.brand')}
          </label>
          <select
            id="brand"
            required
            value={formData.brand}
            onChange={(e) => update({ brand: e.target.value })}
            className="admin-select"
          >
            <option value="" disabled>
              {isVi ? '-- Chọn thương hiệu --' : '-- Select Brand --'}
            </option>
            {brands?.map((b) => (
              <option key={b._id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-field">
          <label className="admin-label">
            {t('fields.tag')}
          </label>
          <div
            onClick={() => setIsTagModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              background: 'var(--admin-surface-muted)',
              border: '1px solid var(--admin-border)',
              borderRadius: 'var(--admin-radius)',
              padding: '10px 14px',
              marginTop: '4px',
              cursor: 'pointer',
              minHeight: '44px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 165, 165, 0.4)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 165, 165, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--admin-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedTags.length > 0 ? (
                selectedTags.map((slug) => {
                  const tagObj = tags?.find(t => t.slug === slug);
                  const displayName = tagObj ? tagObj.name : slug;
                  return (
                    <span
                      key={slug}
                      style={{
                        background: 'rgba(212, 165, 165, 0.12)',
                        color: '#D4A5A5',
                        border: '1px solid rgba(212, 165, 165, 0.3)',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      {displayName}
                    </span>
                  );
                })
              ) : (
                <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.8125rem' }}>
                  {isVi ? '-- Chọn phân loại tag --' : '-- Select tags --'}
                </span>
              )}
            </div>
            <div style={{ color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center' }}>
              <Tag size={16} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
