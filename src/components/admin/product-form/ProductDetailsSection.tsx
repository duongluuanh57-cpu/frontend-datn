'use client';

import React, { useState } from 'react';
import { AlignLeft, Hash, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ProductFormData, formatSizeString } from './useProductForm';
import { InlinePriceSuggestion } from './InlinePriceSuggestion';
import { InlineDiscountPanel } from './InlineDiscountPanel';
import { SizeVariantsPanel } from './modals/PriceSuggestionModal';

interface PriceSuggestionData {
  marketPrice: number;
  markupPercentage: number;
  markupAmount: number;
  suggestedPrice: number;
  explanation: string;
}

interface ProductDetailsSectionProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  isVi: boolean;
  formData: ProductFormData;
  update: (patch: Partial<ProductFormData>) => void;
  priceMarkupPercentage: number;
  dynamicSizeReport: string;
  dynamicDiscountReport: string;
  isSuggestingPrice: boolean;
  priceSuggestionData: PriceSuggestionData | null;
  setPriceSuggestionData: (data: any) => void;
  handleRecalculatePriceMarkup: (pct: number) => void;
  setIsPriceSuggestModalOpen: (v: boolean) => void;
  setActiveSuggestContext: (ctx: any) => void;
  setIsCategoryModalOpen: (v: boolean) => void;
  setIsScentGroupModalOpen: (v: boolean) => void;
  setIsConcentrationModalOpen: (v: boolean) => void;
  setIsSegmentModalOpen: (v: boolean) => void;
  categories?: { _id: string; name: string }[];
  selectedCategories: string[];
  selectedScentGroups: string[];
  selectedConcentrations: string[];
  selectedSegments: string[];
  parsedSizes: { sz: string; price: string }[];
  selectedSizes: string[];
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
  isSuggestingPrice, priceSuggestionData, setPriceSuggestionData, handleRecalculatePriceMarkup,
  setIsPriceSuggestModalOpen, setActiveSuggestContext,
  setIsCategoryModalOpen, setIsScentGroupModalOpen, setIsConcentrationModalOpen, setIsSegmentModalOpen,
  categories, selectedCategories, selectedScentGroups, selectedConcentrations, selectedSegments,
  parsedSizes, selectedSizes,
}: ProductDetailsSectionProps) {

  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);

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

        <div className="admin-form-row" style={{ alignItems: 'start' }}>
          <div className="admin-field">
            <label className="admin-label" htmlFor="price">{t('fields.price', { currency: 'VNĐ' })}</label>
            <div className="admin-input-wrap" style={{ position: 'relative' }}>
              <input id="price" required type="text"
                value={formData.price ? formData.price.toLocaleString('vi-VN') : ''}
                readOnly
                onClick={() => {
                  if (!priceSuggestionData) {
                    const giaban = formData.price || 0;
                    const defaultMarketPrice = giaban > 0
                      ? Math.round(giaban * 100 / (100 + priceMarkupPercentage) / 10000) * 10000
                      : 3000000;
                    const suggestedPrice = Math.round(defaultMarketPrice * (100 + priceMarkupPercentage) / 100);
                    setPriceSuggestionData({
                      marketPrice: defaultMarketPrice,
                      markupPercentage: priceMarkupPercentage,
                      markupAmount: suggestedPrice - defaultMarketPrice,
                      suggestedPrice,
                      explanation: '',
                    });
                    update({ price: suggestedPrice });
                  }
                  setIsPriceOpen((v) => !v);
                }}
                className="admin-input" style={{ paddingRight: '45px', cursor: 'pointer' }} />
              <span className="admin-input-suffix" style={{ right: '12px' }}>VNĐ</span>
            </div>
            <div className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: isPriceOpen ? '9999px' : '0' }}>
              <div className="pt-3" style={{ pointerEvents: isPriceOpen ? 'auto' : 'none' }}>
                <InlinePriceSuggestion
                  isVi={isVi}
                  onApplyPrice={(val) => update({ price: val })}
                  priceMarkupPercentage={priceMarkupPercentage}
                  priceSuggestionData={priceSuggestionData}
                  setPriceSuggestionData={setPriceSuggestionData}
                  handleRecalculatePriceMarkup={handleRecalculatePriceMarkup}
                  isSuggestingPrice={isSuggestingPrice}
                />
              </div>
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
                  setIsSizeOpen((v) => !v);
                }}
                className="admin-input" style={{ cursor: 'pointer', paddingRight: '45px' }} />
              <span className="admin-input-suffix" style={{ right: '12px' }}>ML</span>
            </div>
            <div className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: isSizeOpen ? '9999px' : '0' }}>
              <div className="pt-3" style={{ pointerEvents: isSizeOpen ? 'auto' : 'none' }}>
                <div className="w-full p-4 mt-3 rounded-[var(--admin-radius-lg)] flex flex-col gap-3"
                  style={{ background: 'rgba(201, 169, 154, 0.05)', border: '1px solid var(--admin-border-subtle)' }}>
                  <SizeVariantsPanel
                    isVi={isVi}
                    selectedSizes={selectedSizes}
                    parsedSizes={parsedSizes}
                    update={update}
                    inline={true}
                  />
                </div>
              </div>
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
                  setIsDiscountOpen((v) => !v);
                }}
                className="admin-input" style={{ cursor: 'pointer', background: 'rgba(201, 169, 154, 0.02)', paddingRight: '45px' }} />
              <span className="admin-input-suffix" style={{ right: '12px' }}>%</span>
            </div>
            <div className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: isDiscountOpen ? '9999px' : '0' }}>
              <div className="pt-3" style={{ pointerEvents: isDiscountOpen ? 'auto' : 'none' }}>
                <InlineDiscountPanel
                  isVi={isVi}
                  discountPercentage={formData.discountPercentage}
                  discountStartDate={formData.discountStartDate}
                  discountEndDate={formData.discountEndDate}
                  update={update}
                />
              </div>
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

        {/* ── Longevity, Sillage, Fragrance Specs ── */}
        <div className="admin-form-row" style={{ marginTop: '24px' }}>
          <div className="admin-field">
            <label className="admin-label">{isVi ? 'Thời gian lưu hương' : 'Longevity'}</label>
            <div style={{ padding: '8px 12px', minHeight: '38px', backgroundColor: '#f9f9f9', borderRadius: '6px', color: '#7A5C5C', display: 'flex', alignItems: 'center', fontSize: '14px' }}>{formData.longevity || (isVi ? 'VD: 7 - 9 giờ' : 'e.g. 7 - 9 hours')}</div>
          </div>
          <div className="admin-field">
            <label className="admin-label">{isVi ? 'Độ tỏa hương' : 'Sillage'}</label>
            <div style={{ padding: '8px 12px', minHeight: '38px', backgroundColor: '#f9f9f9', borderRadius: '6px', color: '#7A5C5C', display: 'flex', alignItems: 'center', fontSize: '14px' }}>{formData.sillage || (isVi ? 'VD: 1m' : 'e.g. 1m')}</div>
          </div>
          <div className="admin-field">
            <label className="admin-label">{isVi ? 'Độ bền mùi' : 'Durability'}</label>
            <div style={{ padding: '8px 12px', minHeight: '38px', backgroundColor: '#f9f9f9', borderRadius: '6px', color: '#7A5C5C', display: 'flex', alignItems: 'center', fontSize: '14px' }}>{formData.durability || (isVi ? 'VD: Ổn định từ sáng tới chiều' : 'e.g. Stable from morning to afternoon')}</div>
          </div>
          <div className="admin-field">
            <label className="admin-label">{isVi ? 'Vệt hương' : 'Scent Trail'}</label>
            <div style={{ padding: '8px 12px', minHeight: '38px', backgroundColor: '#f9f9f9', borderRadius: '6px', color: '#7A5C5C', display: 'flex', alignItems: 'center', fontSize: '14px' }}>{formData.scentTrail || (isVi ? 'VD: Mịn, rõ nét' : 'e.g. Smooth, clear')}</div>
          </div>
        </div>

        {/* ── Season & Time (AI-only) ── */}
        <div className="admin-form-row" style={{ marginTop: '16px' }}>
          <div className="admin-field">
            <label className="admin-label">{isVi ? 'Mùa' : 'Season'}</label>
            <div style={{ padding: '8px 12px', minHeight: '38px', backgroundColor: '#f9f9f9', borderRadius: '6px', color: '#7A5C5C', display: 'flex', alignItems: 'center', fontSize: '14px' }}>{formData.season || '—'}</div>
          </div>
          <div className="admin-field">
            <label className="admin-label">{isVi ? 'Thời gian' : 'Time of Day'}</label>
            <div style={{ padding: '8px 12px', minHeight: '38px', backgroundColor: '#f9f9f9', borderRadius: '6px', color: '#7A5C5C', display: 'flex', alignItems: 'center', fontSize: '14px' }}>{formData.time || '—'}</div>
          </div>
        </div>

        <div className="admin-form-row">
          <div className="admin-field">
            <label className="admin-label">{isVi ? 'Phong cách' : 'Style'}</label>
            <div style={{ padding: '8px 12px', minHeight: '38px', backgroundColor: '#f9f9f9', borderRadius: '6px', color: '#7A5C5C', display: 'flex', alignItems: 'center', fontSize: '14px' }}>{formData.style || (isVi ? 'VD: Lịch lãm, hiện đại' : 'e.g. Elegant, modern')}</div>
          </div>
          <div className="admin-field">
            <label className="admin-label">{isVi ? 'Phù hợp cho' : 'Suitable For'}</label>
            <div style={{ padding: '8px 12px', minHeight: '38px', backgroundColor: '#f9f9f9', borderRadius: '6px', color: '#7A5C5C', display: 'flex', alignItems: 'center', fontSize: '14px' }}>{formData.suitableFor || (isVi ? 'VD: item1 | item2 | item3' : 'e.g. item1 | item2 | item3')}</div>
            <p className="text-[11px] mt-1" style={{ color: 'rgba(122, 92, 92, 0.6)' }}>{isVi ? 'Dùng | để phân cách nhiều mục' : 'Use | to separate multiple items'}</p>
          </div>
          <div className="admin-field">
            <label className="admin-label">{isVi ? 'Dịp sử dụng' : 'Occasion'}</label>
            <div style={{ padding: '8px 12px', minHeight: '38px', backgroundColor: '#f9f9f9', borderRadius: '6px', color: '#7A5C5C', display: 'flex', alignItems: 'center', fontSize: '14px' }}>{formData.occasion || (isVi ? 'VD: item1 | item2 | item3' : 'e.g. item1 | item2 | item3')}</div>
            <p className="text-[11px] mt-1" style={{ color: 'rgba(122, 92, 92, 0.6)' }}>{isVi ? 'Dùng | để phân cách nhiều mục' : 'Use | to separate multiple items'}</p>
          </div>
        </div>
      </div>
    </section>
  );
});
