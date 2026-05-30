'use client';

import React from 'react';
import { Sparkles, FileText, Loader2 } from 'lucide-react';
import { SIZE_CATEGORIES } from '../useProductForm';

interface PriceSuggestionData {
  marketPrice: number;
  markupPercentage: number;
  markupAmount: number;
  suggestedPrice: number;
  explanation: string;
}

interface ActiveSuggestContext {
  size?: string;
  basePrice?: number;
  onApply: (price: number) => void;
}

const formatBullets = (content: string) => {
  if (!content) return null;
  return content.split('\n').map((line) => line.trim()).filter((line) => {
    const clean = line.replace(/^[-*•\s]+/, '').trim();
    return clean.length > 0;
  }).map((line, idx) => {
    const cleanLine = line.replace(/^[-*•\s]*/, '').trim();
    const parts = cleanLine.split(/\*\*(.*?)\*\*/g);
    return (
      <li key={idx} className="mb-[6px] list-none pl-[14px] relative text-[0.718rem] leading-[1.45] text-left"
        style={{ color: 'var(--admin-text-muted)' }}>
        <span className="absolute left-0 top-[6px] w-[5px] h-[5px] rounded-full"
          style={{ background: 'var(--admin-accent, #C9A99A)' }} />
        {parts.map((part, pIdx) =>
          pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold" style={{ color: 'var(--admin-text)' }}>{part}</strong> : part
        )}
      </li>
    );
  });
};

const parseExplanation = (text: string) => {
  if (!text) return [];
  const sections = text.split(/\*\*(?=\d\.)/);
  return sections.map((sec) => sec.trim()).filter(Boolean).filter((sec) => /^\d\./.test(sec)).map((sec) => {
    const lines = sec.split('\n');
    let titleLine = lines[0].replace(/\*\*/g, '').trim();
    let content = lines.slice(1).join('\n').trim();
    if (titleLine.length > 80 && titleLine.includes(':')) {
      const colonIndex = titleLine.indexOf(':');
      const realTitle = titleLine.substring(0, colonIndex + 1).trim();
      const firstBullet = titleLine.substring(colonIndex + 1).trim();
      titleLine = realTitle;
      content = firstBullet + (content ? '\n' + content : '');
    }
    return { title: titleLine, content };
  });
};

export function SizeVariantsPanel({ isVi, selectedSizes, parsedSizes, update, setIsPriceSuggestModalOpen }: any) {
  return (
    <>
      <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid var(--admin-border-subtle)' }}>
        <div>
          <h4 className="font-semibold text-lg flex items-center gap-2" style={{ color: 'var(--admin-text)' }}>
            <Sparkles size={18} className="text-[#D4A5A5]" />
            {isVi ? 'Biến thể dung tích' : 'Size Variants'}
          </h4>
          <p className="text-[0.6875rem] mt-[2px]" style={{ color: 'var(--admin-text-muted)' }}>
            {isVi ? 'Chọn dung tích bán và nhập giá của từng loại' : 'Select variants and set custom pricing'}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-5 flex-1 pr-[6px]">
        {SIZE_CATEGORIES.map((category: any) => {
          const catName = isVi ? category.name : category.nameEn;
          return (
            <div key={category.name} className="flex flex-col gap-[10px]">
              <p className="text-[0.6875rem] font-bold tracking-wide uppercase text-left"
                style={{ color: 'var(--admin-text-muted)' }}>• {catName}</p>
              <div className="flex flex-col gap-[10px]">
                {category.sizes.map((sz: string) => {
                  const isSelected = selectedSizes.includes(sz);
                  const matched = parsedSizes.find((p: any) => p.sz === sz);
                  const sizePrice = matched ? matched.price : '';
                  return (
                    <div key={sz} className="flex items-center gap-3 w-full">
                      <label className="inline-flex items-center justify-center min-w-[70px] p-2 px-[14px] rounded-[var(--admin-radius)] border cursor-pointer text-sm font-medium transition-all duration-150 text-center"
                        style={{
                          borderColor: isSelected ? 'var(--admin-accent)' : 'var(--admin-border)',
                          background: isSelected ? 'rgba(201, 169, 154, 0.1)' : 'var(--admin-surface-muted)',
                          color: isSelected ? 'var(--admin-accent-hover)' : 'var(--admin-text)',
                        }}>
                        <input type="checkbox" checked={isSelected}
                          onChange={async () => {
                            let newSizes = [...parsedSizes];
                            if (isSelected) {
                              newSizes = newSizes.filter((p: any) => p.sz !== sz);
                              update({ size: newSizes.map((p: any) => p.price ? `${p.sz}:${p.price}` : p.sz).join(', ') });
                            } else {
                              newSizes.push({ sz, price: '' });
                              newSizes.sort((a: any, b: any) => parseInt(a.sz) - parseInt(b.sz));
                              update({ size: newSizes.map((p: any) => p.price ? `${p.sz}:${p.price}` : p.sz).join(', ') });
                            }
                          }}
                          className="hidden" />
                        {sz}
                      </label>
                      {isSelected && (
                        <div className="flex items-center gap-[6px] flex-grow">
                          <div className="relative flex-grow flex items-center">
                            <input type="number" min={0}
                              placeholder={isVi ? 'Nhập giá bán...' : 'Enter price...'}
                              value={sizePrice}
                              onChange={(e) => {
                                const newPrice = e.target.value;
                                update({ size: parsedSizes.map((p: any) => p.sz === sz ? { ...p, price: newPrice } : p).map((p: any) => p.price ? `${p.sz}:${p.price}` : p.sz).join(', ') });
                              }}
                              className="w-full p-[6px_12px] h-[34px] rounded-[var(--admin-radius)] text-sm outline-none transition-all duration-150"
                              style={{
                                border: '1px solid var(--admin-border-subtle)',
                                background: 'var(--admin-surface)',
                                color: 'var(--admin-text)',
                              }} />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: 'var(--admin-text-muted)' }}>VNĐ</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end pt-4 mt-auto" style={{ borderTop: '1px solid var(--admin-border-subtle)' }}>
        <button type="button" onClick={() => setIsPriceSuggestModalOpen(false)}
          className="admin-btn-submit" style={{ padding: '8px 20px', fontSize: '0.75rem', width: 'auto', borderRadius: 'var(--admin-radius-lg)' }}>
          {isVi ? 'Xác nhận dung tích' : 'Confirm Capacities'}
        </button>
      </div>
    </>
  );
}

export function DiscountPanel({ isVi, formData, update, setIsPriceSuggestModalOpen }: any) {
  return (
    <>
      <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid var(--admin-border-subtle)' }}>
        <div>
          <h4 className="font-semibold text-lg flex items-center gap-2" style={{ color: 'var(--admin-text)' }}>
            <Sparkles size={18} className="text-[#D4A5A5]" />
            {isVi ? 'Thiết lập chiết khấu' : 'Configure Discount'}
          </h4>
          <p className="text-[0.6875rem] mt-[2px]" style={{ color: 'var(--admin-text-muted)' }}>
            {isVi ? 'Chỉnh sửa tỷ lệ chiết khấu và lên lịch sự kiện' : 'Set discount rates and configure event schedules'}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-5 flex-1">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold" style={{ color: 'var(--admin-text)' }}>
              {isVi ? 'Tỷ lệ chiết khấu (%)' : 'Discount Percentage (%)'}
            </label>
            <span className="text-xs font-bold" style={{ color: 'var(--admin-text-brand, #7A5C5C)' }}>
              {formData.discountPercentage}%
            </span>
          </div>
          <div className="flex gap-[10px] items-center">
            <input type="range" min={0} max={90} step={5}
              value={formData.discountPercentage}
              onChange={(e) => {
                const val = Number(e.target.value);
                update({ discountPercentage: val, ...(val <= 0 ? { discountStartDate: null, discountEndDate: null } : {}) });
              }}
              className="flex-grow cursor-pointer"
              style={{ accentColor: 'var(--admin-text-brand, #7A5C5C)' }} />
            <input type="number" min={0} max={100} value={formData.discountPercentage}
              onChange={(e) => {
                const val = Number(e.target.value);
                update({ discountPercentage: val, ...(val <= 0 ? { discountStartDate: null, discountEndDate: null } : {}) });
              }}
              className="w-[65px] text-center outline-none text-sm rounded-[var(--admin-radius)] p-[6px] border"
              style={{ background: 'rgba(201, 169, 154, 0.05)', borderColor: 'var(--admin-border-subtle)', color: 'var(--admin-text)' }} />
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-4" style={{ borderTop: '1px solid var(--admin-border-subtle)' }}>
          <p className="text-xs font-bold" style={{ color: 'var(--admin-text)' }}>
            📅 {isVi ? 'Đặt lịch thời gian áp dụng' : 'Active Event Schedule'}
          </p>
          <div className="admin-field">
            <label className="admin-label text-[0.6875rem]">{isVi ? 'Ngày bắt đầu' : 'Start Date'}</label>
            <input type="datetime-local"
              value={formData.discountStartDate ? new Date(new Date(formData.discountStartDate).getTime() - new Date().getTimezoneOffset()*60000).toISOString().slice(0, 16) : ''}
              onChange={(e) => update({ discountStartDate: e.target.value ? new Date(e.target.value) : null })}
              onClick={(e) => { try { (e.target as HTMLInputElement).showPicker(); } catch {} }}
              className="admin-input" style={{ colorScheme: 'dark', cursor: 'pointer', fontSize: '0.75rem', height: '38px' }} />
          </div>
          <div className="admin-field">
            <label className="admin-label text-[0.6875rem]">{isVi ? 'Ngày kết thúc' : 'End Date'}</label>
            <input type="datetime-local"
              value={formData.discountEndDate ? new Date(new Date(formData.discountEndDate).getTime() - new Date().getTimezoneOffset()*60000).toISOString().slice(0, 16) : ''}
              onChange={(e) => update({ discountEndDate: e.target.value ? new Date(e.target.value) : null })}
              onClick={(e) => { try { (e.target as HTMLInputElement).showPicker(); } catch {} }}
              className="admin-input" style={{ colorScheme: 'dark', cursor: 'pointer', fontSize: '0.75rem', height: '38px' }} />
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4 mt-auto" style={{ borderTop: '1px solid var(--admin-border-subtle)' }}>
        <button type="button" onClick={() => setIsPriceSuggestModalOpen(false)}
          className="admin-btn-submit" style={{ padding: '8px 20px', fontSize: '0.75rem', width: 'auto', borderRadius: 'var(--admin-radius-lg)' }}>
          {isVi ? 'Xác nhận chiết khấu' : 'Confirm Discount'}
        </button>
      </div>
    </>
  );
}

export function PriceSuggestionPanel({
  isVi, isSuggestingPrice, priceSuggestionData, priceMarkupPercentage,
  setPriceSuggestionData, handleRecalculatePriceMarkup,
  activeSuggestContext, setIsPriceSuggestModalOpen, isSuggesting, onApplyPrice,
}: any) {
  return (
    <>
      <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid var(--admin-border-subtle)' }}>
        <div>
          <h4 className="font-semibold text-lg flex items-center gap-2" style={{ color: 'var(--admin-text)' }}>
            <Sparkles size={18} className="text-[#D4A5A5]" />
            {isVi ? 'Đề xuất giá bằng AI' : 'AI Price Suggestion'}
          </h4>
          <p className="text-[0.6875rem] mt-[2px]" style={{ color: 'var(--admin-text-muted)' }}>
            {isVi ? 'Phân tích thị trường nước hoa chính hãng + biên lợi nhuận' : 'Analyze authentic perfume market prices & target profit margin'}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 flex-1">
        {isSuggestingPrice ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10">
            <Loader2 size={32} className="animate-spin text-[#D4A5A5]" />
            <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
              {isVi ? 'AI đang phân tích giá thị trường...' : 'AI is analyzing market prices...'}
            </p>
          </div>
        ) : priceSuggestionData ? (
          <>
            <div className="grid grid-cols-3 gap-[10px] p-[14px] rounded-[var(--admin-radius)] border"
              style={{ background: 'rgba(201, 169, 154, 0.05)', borderColor: 'var(--admin-border-subtle)' }}>
              <div className="text-center">
                <p className="text-[0.6875rem] font-medium" style={{ color: 'var(--admin-text-muted)' }}>{isVi ? 'Giá thị trường' : 'Market Price'}</p>
                <p className="text-[0.9375rem] font-semibold mt-1" style={{ color: 'var(--admin-text)' }}>
                  {priceSuggestionData.marketPrice.toLocaleString('vi-VN')}đ
                </p>
              </div>
              <div className="text-center" style={{ borderLeft: '1px solid var(--admin-border-subtle)', borderRight: '1px solid var(--admin-border-subtle)' }}>
                <p className="text-[0.6875rem] font-medium" style={{ color: 'var(--admin-text-muted)' }}>Markup ({priceMarkupPercentage}%)</p>
                <p className="text-[0.9375rem] font-semibold mt-1" style={{ color: 'var(--admin-text-muted)' }}>
                  +{priceSuggestionData.markupAmount.toLocaleString('vi-VN')}đ
                </p>
              </div>
              <div className="text-center">
                <p className="text-[0.6875rem] font-bold" style={{ color: 'var(--admin-text-brand, #7A5C5C)' }}>{isVi ? 'Giá đề xuất web' : 'Suggested Price'}</p>
                <p className="text-[1.0625rem] font-bold mt-1" style={{ color: 'var(--admin-accent-hover, #D4A5A5)' }}>
                  {priceSuggestionData.suggestedPrice.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-[6px]">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold" style={{ color: 'var(--admin-text)' }}>{isVi ? 'Biên lợi nhuận (Markup)' : 'Markup Margin'}</label>
                <span className="text-xs font-bold" style={{ color: 'var(--admin-text-brand, #7A5C5C)' }}>{priceMarkupPercentage}%</span>
              </div>
              <input type="range" min={5} max={40} step={5} value={priceMarkupPercentage}
                onChange={(e) => handleRecalculatePriceMarkup(Number(e.target.value))}
                className="w-full cursor-pointer" style={{ accentColor: 'var(--admin-text-brand, #7A5C5C)' }} />
            </div>
            <div className="flex flex-col gap-[6px] pt-3 mt-1" style={{ borderTop: '1px solid var(--admin-border-subtle)' }}>
              <label className="text-xs font-semibold" style={{ color: 'var(--admin-text)' }}>{isVi ? 'Nhập giá bán thủ công' : 'Custom Price'}</label>
              <div className="relative flex items-center">
                <input type="number" min={0} value={priceSuggestionData.suggestedPrice}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const marketPrice = Math.round((val / (1 + priceMarkupPercentage / 100)) / 10000) * 10000;
                    setPriceSuggestionData({ ...priceSuggestionData, suggestedPrice: val, marketPrice, markupAmount: val - marketPrice });
                  }}
                  className="w-full p-[8px_45px_8px_12px] text-sm outline-none rounded-[var(--admin-radius)]"
                  style={{ background: 'rgba(201, 169, 154, 0.05)', border: '1px solid var(--admin-border-subtle)', color: 'var(--admin-text)' }} />
                <span className="absolute right-3 text-xs font-semibold" style={{ color: 'var(--admin-text-muted)' }}>VNĐ</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center py-10 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
            {isVi ? 'Không có dữ liệu gợi ý giá.' : 'No price suggestion data available.'}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-[10px] pt-4 mt-auto" style={{ borderTop: '1px solid var(--admin-border-subtle)' }}>
        <button type="button" onClick={() => setIsPriceSuggestModalOpen(false)}
          className="px-4 py-2 border border-[var(--admin-border-subtle)] hover:bg-[#7A5C5C]/5 text-[#7A5C5C] rounded-xl text-xs font-semibold transition active:scale-95">
          {isVi ? 'Hủy' : 'Cancel'}
        </button>
        <button type="button" disabled={!priceSuggestionData || isSuggesting}
          onClick={() => { if (priceSuggestionData && activeSuggestContext) { activeSuggestContext.onApply(priceSuggestionData.suggestedPrice); setIsPriceSuggestModalOpen(false); } }}
          className="admin-btn-submit" style={{ padding: '8px 20px', fontSize: '0.75rem', width: 'auto', borderRadius: 'var(--admin-radius-lg)' }}>
          {isVi ? 'Áp dụng' : 'Apply'}
        </button>
      </div>
    </>
  );
}

export function AIPriceReportPanel({ isVi, priceSuggestionData, isSuggestingPrice, activeSuggestContext }: any) {
  if (!priceSuggestionData || isSuggestingPrice) return null;
  return (
    <div className="flex-[1_1_500px] max-w-[560px] w-full p-6 rounded-[var(--admin-radius-lg)] flex flex-col gap-4"
      style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', boxShadow: 'var(--admin-shadow-lg)' }}>
      <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid var(--admin-border-subtle)' }}>
        <div>
          <h4 className="font-semibold text-lg flex items-center gap-2" style={{ color: 'var(--admin-text)' }}>
            <FileText size={18} className="text-[#C9A99A]" />
            {isVi ? 'Phân tích thị trường của AI' : 'AI Market Analysis Report'}
          </h4>
          <p className="text-[0.6875rem] mt-[2px]" style={{ color: 'var(--admin-text-muted)' }}>
            {isVi ? 'Báo cáo thông minh bởi L\'essence AI Studio' : 'Auto-generated by L\'essence AI Studio'}
          </p>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-[14px]">
        {parseExplanation(priceSuggestionData.explanation).map((sec: any, sIdx: number) => (
          <div key={sIdx} className="p-[12px_14px] flex flex-col gap-2 rounded-[var(--admin-radius)] border"
            style={{ background: 'rgba(201, 169, 154, 0.03)', borderColor: 'var(--admin-border-subtle)' }}>
            <h5 className="text-sm font-bold flex items-center gap-[6px] m-0" style={{ color: 'var(--admin-text)' }}>
              <span className="w-[4px] h-3 rounded-sm" style={{ background: 'var(--admin-accent, #C9A99A)' }} />
              {sec.title}
            </h5>
            <ul className="m-0 p-0">{formatBullets(sec.content)}</ul>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center pt-3 mt-auto text-[0.625rem]"
        style={{ borderTop: '1px solid var(--admin-border-subtle)', color: 'var(--admin-text-muted)' }}>
        <span>🔒 L'essence Confidential Data</span>
        <span>Model: Gemini 3.1 Flash Lite</span>
      </div>
    </div>
  );
}