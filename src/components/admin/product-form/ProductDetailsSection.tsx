'use client';

import React from 'react';
import { AlignLeft, Hash, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ProductFormData, formatSizeString } from './useProductForm';

interface ProductDetailsSectionProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  isVi: boolean;
  formData: ProductFormData;
  update: (patch: Partial<ProductFormData>) => void;
  priceMarkupPercentage: number;
  dynamicSizeReport: string;
  dynamicDiscountReport: string;
  setIsPriceSuggestModalOpen: (v: boolean) => void;
  setPriceSuggestionData: (data: any) => void;
  setActiveSuggestContext: (ctx: any) => void;
  handleOpenPriceSuggestion: (size?: string, basePrice?: number, onApply?: (price: number) => void) => void;
  setIsCategoryModalOpen: (v: boolean) => void;
  setIsScentGroupModalOpen: (v: boolean) => void;
  setIsConcentrationModalOpen: (v: boolean) => void;
  setIsSegmentModalOpen: (v: boolean) => void;
  categories?: { _id: string; name: string }[];
  selectedCategories: string[];
  selectedScentGroups: string[];
  selectedConcentrations: string[];
  selectedSegments: string[];
}

const tagStyle = {
  background: 'rgba(212, 165, 165, 0.12)',
  color: '#D4A5A5',
  border: '1px solid rgba(212, 165, 165, 0.3)',
  borderRadius: '6px',
  padding: '2px 8px',
  fontSize: '0.75rem',
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
};

const selectBoxBase = {
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
} as const;

export const ProductDetailsSection = React.memo(function ProductDetailsSection({
  t, isVi, formData, update, priceMarkupPercentage,
  dynamicSizeReport, dynamicDiscountReport,
  setIsPriceSuggestModalOpen, setPriceSuggestionData, setActiveSuggestContext,
  handleOpenPriceSuggestion,
  setIsCategoryModalOpen, setIsScentGroupModalOpen, setIsConcentrationModalOpen, setIsSegmentModalOpen,
  categories, selectedCategories, selectedScentGroups, selectedConcentrations, selectedSegments,
}: ProductDetailsSectionProps) {

  const handleSelectClick = (label: string, setter: (v: boolean) => void) => {
    if (!formData.name.trim()) {
      toast.error(isVi ? 'Vui lòng nhập Tên sản phẩm trước.' : 'Please enter Product Name first.');
      return;
    }
    setter(true);
  };

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
          <label className="admin-label" htmlFor="name">{t('fields.name')}</label>
          <input id="name" required type="text" value={formData.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder={t('fields.namePlaceholder')} className="admin-input admin-input--lg w-full" />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="description">{t('fields.description')}</label>
          <textarea id="description" rows={4} value={formData.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder={t('fields.descriptionPlaceholder')} className="admin-textarea" />
        </div>

        <div className="admin-form-row">
          <div className="admin-field">
            <label className="admin-label" htmlFor="price">{t('fields.price', { currency: 'VNĐ' })}</label>
            <div className="admin-input-wrap" style={{ position: 'relative' }}>
              <input id="price" required readOnly type="text"
                value={formData.price ? formData.price.toLocaleString('vi-VN') : ''}
                onClick={() => handleOpenPriceSuggestion(undefined, formData.price, (suggestedVal) => update({ price: suggestedVal }))}
                className="admin-input" style={{ paddingRight: '45px', cursor: 'pointer', background: 'rgba(201, 169, 154, 0.02)' }} />
              <span className="admin-input-suffix" style={{ right: '12px' }}>VNĐ</span>
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="size">{t('fields.size')}</label>
            <div className="admin-input-wrap" style={{ position: 'relative' }}>
              <input id="size" readOnly type="text"
                value={formData.size ? formatSizeString(formData.size) : ''}
                onClick={() => {
                  if (!formData.name.trim()) {
                    toast.error(isVi ? 'Vui lòng nhập Tên sản phẩm trước.' : 'Please enter Product Name first.');
                    return;
                  }
                  setPriceSuggestionData({
                    marketPrice: formData.price || 3000000, markupPercentage: priceMarkupPercentage,
                    markupAmount: 0, suggestedPrice: formData.price || 3000000,
                    explanation: dynamicSizeReport
                  });
                  setActiveSuggestContext({ size: 'Dung tích', basePrice: formData.price, onApply: () => {} });
                  setIsPriceSuggestModalOpen(true);
                }}
                className="admin-input" style={{ background: 'rgba(201, 169, 154, 0.02)', cursor: 'pointer', paddingRight: '45px' }} />
              <span className="admin-input-suffix" style={{ right: '12px' }}>ML</span>
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="stock">{t('fields.stock')}</label>
            <div className="admin-input-wrap">
              <Hash className="admin-input-wrap__icon" size={18} />
              <input id="stock" required type="number" min={0} value={formData.quantityInStock}
                onChange={(e) => update({ quantityInStock: Number(e.target.value) })} className="admin-input" />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="discount">{t('fields.discount')}</label>
            <div className="admin-input-wrap" style={{ position: 'relative' }}>
              <input id="discount" readOnly type="text" value={formData.discountPercentage || ''}
                onClick={() => {
                  if (!formData.name.trim()) {
                    toast.error(isVi ? 'Vui lòng nhập Tên sản phẩm trước.' : 'Please enter Product Name first.');
                    return;
                  }
                  setPriceSuggestionData({
                    marketPrice: formData.price || 3000000, markupPercentage: priceMarkupPercentage,
                    markupAmount: 0, suggestedPrice: formData.price || 3000000,
                    explanation: dynamicDiscountReport
                  });
                  setActiveSuggestContext({ size: 'Chiết khấu', basePrice: formData.price, onApply: () => {} });
                  setIsPriceSuggestModalOpen(true);
                }}
                className="admin-input" style={{ cursor: 'pointer', background: 'rgba(201, 169, 154, 0.02)', paddingRight: '45px' }} />
              <span className="admin-input-suffix" style={{ right: '12px' }}>%</span>
            </div>
            {formData.discountPercentage > 0 && (formData.discountStartDate || formData.discountEndDate) && (
              <p className="text-xs mt-[6px] flex items-center gap-1" style={{ color: '#D4A5A5', fontWeight: 500 }}>
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

        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="admin-field">
            <label className="admin-label">{isVi ? 'Danh mục' : 'Category'}</label>
            <div
              onClick={() => handleSelectClick(isVi ? 'Danh mục' : 'Category', setIsCategoryModalOpen)}
              style={selectBoxBase}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 165, 165, 0.4)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 165, 165, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--admin-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex flex-wrap gap-[6px] max-h-[82px] overflow-y-auto w-full">
                {selectedCategories.length > 0 ? selectedCategories.map((item) => (
                  <span key={`cat-${item}`} style={tagStyle}>{categories?.find(c => c.name === item)?.name || item}</span>
                )) : null}
              </div>
            </div>
          </div>
          {[
            { label: isVi ? 'Nhóm hương' : 'Scent Group', items: selectedScentGroups, setter: setIsScentGroupModalOpen as (v: boolean) => void },
            { label: isVi ? 'Nồng độ' : 'Concentration', items: selectedConcentrations, setter: setIsConcentrationModalOpen as (v: boolean) => void },
            { label: isVi ? 'Phân khúc nhóm' : 'Brand Segment', items: selectedSegments, setter: setIsSegmentModalOpen as (v: boolean) => void },
          ].map(({ label, items, setter }) => (
            <div className="admin-field" key={label}>
              <label className="admin-label">{label}</label>
              <div
                onClick={() => handleSelectClick(label, setter)}
                style={selectBoxBase}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212, 165, 165, 0.4)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 165, 165, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--admin-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="flex flex-wrap gap-[6px] max-h-[82px] overflow-y-auto w-full">
                  {items.length > 0 ? items.map((item) => (
                    <span key={`${label}-${item}`} style={tagStyle}>{item}</span>
                  )) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
