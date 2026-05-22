'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { ProductFormData } from './useProductForm';

interface ProductSEOSectionProps {
  t: (key: string) => string;
  isVi: boolean;
  formData: ProductFormData;
  update: (patch: Partial<ProductFormData>) => void;
  isFormComplete: boolean;
}

export const ProductSEOSection = React.memo(function ProductSEOSection({
  t, isVi, formData, update, isFormComplete,
}: ProductSEOSectionProps) {
  return (
    <section className="admin-form-card admin-form-grid__seo">
      <div className="admin-form-card__head">
        <div className="admin-form-card__head-icon">
          <Search size={18} />
        </div>
        <div>
          <p className="admin-form-card__title">{t('sections.seo')}</p>
          <p className="admin-form-card__desc">{t('sections.seoDesc')}</p>
        </div>
      </div>

      <div className="admin-form-fields">
        <div className="admin-field">
          <label className="admin-label" htmlFor="metaTitle">
            {t('fields.metaTitle')}
          </label>
          <input
            id="metaTitle"
            type="text"
            value={formData.metaTitle}
            onChange={(e) => update({ metaTitle: e.target.value })}
            className="admin-input"
          />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="slug">
            {t('fields.slug')}
          </label>
          <input
            id="slug"
            type="text"
            value={formData.slug || ''}
            onChange={(e) => update({ slug: e.target.value })}
            placeholder={t('fields.slugPlaceholder')}
            className="admin-input"
          />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="keywords">
            {t('fields.keywords')}
          </label>
          <input
            id="keywords"
            type="text"
            value={formData.keywords}
            onChange={(e) => update({ keywords: e.target.value })}
            placeholder={t('fields.keywordsPlaceholder')}
            className="admin-input"
          />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="metaDescription">
            {t('fields.metaDescription')}
          </label>
          <textarea
            id="metaDescription"
            rows={4}
            value={formData.metaDescription}
            onChange={(e) => update({ metaDescription: e.target.value })}
            className="admin-textarea"
          />
        </div>

        <div className="admin-status-pill">
          <span className="admin-status-pill__label">
            <span
              className="admin-status-pill__dot"
              style={{
                background: isFormComplete ? 'var(--admin-success)' : 'var(--admin-warning)',
                boxShadow: isFormComplete ? '0 0 8px var(--admin-success)' : '0 0 8px var(--admin-warning)'
              }}
              aria-hidden="true"
            />
            {t('fields.status')}
          </span>
          <span className="admin-status-pill__value">
            {isFormComplete ? t('fields.ready') : t('fields.draft')}
          </span>
        </div>
      </div>
    </section>
  );
});
