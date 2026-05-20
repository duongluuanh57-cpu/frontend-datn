'use client';

import React from 'react';
import { AlignLeft, Hash, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { UseProductFormReturn, formatSizeString } from './useProductForm';

export function ProductDetailsSection({ formHelpers }: { formHelpers: UseProductFormReturn }) {
  const {
    t,
    isVi,
    formData,
    update,
    priceMarkupPercentage,
    dynamicSizeReport,
    dynamicDiscountReport,
    setIsPriceSuggestModalOpen,
    setPriceSuggestionData,
    setActiveSuggestContext,
    handleOpenPriceSuggestion,
    setIsGenderModalOpen,
    setIsScentGroupModalOpen,
    setIsConcentrationModalOpen,
    setIsSegmentModalOpen,
    selectedGenders,
    selectedScentGroups,
    selectedConcentrations,
    selectedSegments,
  } = formHelpers;

  return (
    <section className="admin-form-card admin-form-card--details">
      <div className="admin-form-card__head">
        <div className="admin-form-card__head-icon">
          <AlignLeft size={18} />
        </div>
        <div>
          <p className="admin-form-card__title">{t('sections.info')}</p>
          <p className="admin-form-card__desc">{t('sections.infoDesc')}</p>
        </div>
      </div>

      <div className="admin-form-fields">
        <div className="admin-field">
          <label className="admin-label" htmlFor="name">
            {t('fields.name')}
          </label>
          <input
            id="name"
            required
            type="text"
            value={formData.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder={t('fields.namePlaceholder')}
            className="admin-input admin-input--lg w-full"
          />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="description">
            {t('fields.description')}
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder={t('fields.descriptionPlaceholder')}
            className="admin-textarea"
          />
        </div>

        <div className="admin-form-row">
          <div className="admin-field">
            <label className="admin-label" htmlFor="price">
              {t('fields.price', { currency: 'VNĐ' })}
            </label>
            <div className="admin-input-wrap" style={{ position: 'relative' }}>
              <input
                id="price"
                required
                readOnly
                type="text"
                value={formData.price ? formData.price.toLocaleString('vi-VN') : ''}
                onClick={() => handleOpenPriceSuggestion(undefined, formData.price, (suggestedVal) => update({ price: suggestedVal }))}
                className="admin-input"
                style={{ paddingRight: '45px', cursor: 'pointer', background: 'rgba(201, 169, 154, 0.02)' }}
              />
              <span className="admin-input-suffix" style={{ right: '12px' }}>VNĐ</span>
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="size">
              {t('fields.size')}
            </label>
            <div className="admin-input-wrap" style={{ position: 'relative' }}>
              <input
                id="size"
                readOnly
                type="text"
                value={formData.size ? formatSizeString(formData.size) : ''}
                onClick={() => {
                  if (!formData.name.trim()) {
                    toast.error(isVi ? 'Vui lòng nhập Tên sản phẩm trước để AI phân tích.' : 'Please enter Product Name first so AI can analyze.');
                    return;
                  }

                  setPriceSuggestionData({
                    marketPrice: formData.price || 3000000,
                    markupPercentage: priceMarkupPercentage,
                    markupAmount: 0,
                    suggestedPrice: formData.price || 3000000,
                    explanation: dynamicSizeReport
                  });
                  setActiveSuggestContext({
                    size: 'Dung tích',
                    basePrice: formData.price,
                    onApply: () => {}
                  });
                  setIsPriceSuggestModalOpen(true);
                }}
                className="admin-input"
                style={{
                  background: 'rgba(201, 169, 154, 0.02)',
                  cursor: 'pointer',
                  paddingRight: '45px'
                }}
              />
              <span className="admin-input-suffix" style={{ right: '12px' }}>ML</span>
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="stock">
              {t('fields.stock')}
            </label>
            <div className="admin-input-wrap">
              <Hash className="admin-input-wrap__icon" size={18} />
              <input
                id="stock"
                required
                type="number"
                min={0}
                value={formData.quantityInStock}
                onChange={(e) => update({ quantityInStock: Number(e.target.value) })}
                className="admin-input"
              />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="discount">
              {t('fields.discount')}
            </label>
            <div className="admin-input-wrap" style={{ position: 'relative' }}>
              <input
                id="discount"
                readOnly
                type="text"
                value={formData.discountPercentage || ''}
                onClick={() => {
                  if (!formData.name.trim()) {
                    toast.error(isVi ? 'Vui lòng nhập Tên sản phẩm trước để AI phân tích.' : 'Please enter Product Name first so AI can analyze.');
                    return;
                  }

                  setPriceSuggestionData({
                    marketPrice: formData.price || 3000000,
                    markupPercentage: priceMarkupPercentage,
                    markupAmount: 0,
                    suggestedPrice: formData.price || 3000000,
                    explanation: dynamicDiscountReport
                  });
                  setActiveSuggestContext({
                    size: 'Chiết khấu',
                    basePrice: formData.price,
                    onApply: () => {}
                  });
                  setIsPriceSuggestModalOpen(true);
                }}
                className="admin-input"
                style={{ 
                  cursor: 'pointer',
                  background: 'rgba(201, 169, 154, 0.02)',
                  paddingRight: '45px'
                }}
              />
              <span className="admin-input-suffix" style={{ right: '12px' }}>%</span>
            </div>
            {formData.discountPercentage > 0 && (formData.discountStartDate || formData.discountEndDate) && (
              <p style={{ fontSize: '0.6875rem', color: '#D4A5A5', marginTop: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>📅</span>
                <span>
                  {formData.discountStartDate ? new Date(formData.discountStartDate).toLocaleString(isVi ? 'vi-VN' : 'en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '∞'}
                  {' - '}
                  {formData.discountEndDate ? new Date(formData.discountEndDate).toLocaleString(isVi ? 'vi-VN' : 'en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '∞'}
                </span>
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '16px' }}>
          {/* Giới tính */}
          <div className="admin-field">
            <label className="admin-label">
              {isVi ? 'Giới tính' : 'Gender'}
            </label>
            <div
              onClick={() => {
                if (!formData.name.trim()) {
                  toast.error(isVi ? 'Vui lòng nhập Tên sản phẩm trước để AI phân tích.' : 'Please enter Product Name first so AI can analyze.');
                  return;
                }
                setIsGenderModalOpen(true);
              }}
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '82px', overflowY: 'auto', width: '100%' }}>
                {selectedGenders.length > 0 && (
                  selectedGenders.map((g) => (
                    <span
                      key={g}
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
                      {g}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Nhóm hương */}
          <div className="admin-field">
            <label className="admin-label">
              {isVi ? 'Nhóm hương' : 'Scent Group'}
            </label>
            <div
              onClick={() => {
                if (!formData.name.trim()) {
                  toast.error(isVi ? 'Vui lòng nhập Tên sản phẩm trước để AI phân tích.' : 'Please enter Product Name first so AI can analyze.');
                  return;
                }
                setIsScentGroupModalOpen(true);
              }}
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '82px', overflowY: 'auto', width: '100%' }}>
                {selectedScentGroups.length > 0 && (
                  selectedScentGroups.map((sg) => (
                    <span
                      key={sg}
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
                      {sg}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Nồng độ */}
          <div className="admin-field">
            <label className="admin-label">
              {isVi ? 'Nồng độ' : 'Concentration'}
            </label>
            <div
              onClick={() => {
                if (!formData.name.trim()) {
                  toast.error(isVi ? 'Vui lòng nhập Tên sản phẩm trước để AI phân tích.' : 'Please enter Product Name first so AI can analyze.');
                  return;
                }
                setIsConcentrationModalOpen(true);
              }}
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '82px', overflowY: 'auto', width: '100%' }}>
                {selectedConcentrations.length > 0 && (
                  selectedConcentrations.map((c) => (
                    <span
                      key={c}
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
                      {c}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Phân khúc nhóm */}
          <div className="admin-field">
            <label className="admin-label">
              {isVi ? 'Phân khúc nhóm' : 'Brand Segment'}
            </label>
            <div
              onClick={() => {
                if (!formData.name.trim()) {
                  toast.error(isVi ? 'Vui lòng nhập Tên sản phẩm trước để AI phân tích.' : 'Please enter Product Name first so AI can analyze.');
                  return;
                }
                setIsSegmentModalOpen(true);
              }}
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '82px', overflowY: 'auto', width: '100%' }}>
                {selectedSegments.length > 0 && (
                  selectedSegments.map((s) => (
                    <span
                      key={s}
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
                      {s}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
