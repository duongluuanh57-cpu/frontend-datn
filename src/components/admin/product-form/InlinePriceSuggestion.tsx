'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface PriceSuggestionData {
  marketPrice: number;
  markupPercentage: number;
  markupAmount: number;
  suggestedPrice: number;
  explanation: string;
}

interface InlinePriceSuggestionProps {
  isVi: boolean;
  onApplyPrice: (price: number) => void;
  priceMarkupPercentage: number;
  priceSuggestionData: PriceSuggestionData | null;
  setPriceSuggestionData: (data: PriceSuggestionData) => void;
  handleRecalculatePriceMarkup: (pct: number) => void;
  isSuggestingPrice: boolean;
}

export function InlinePriceSuggestion({
  isVi, onApplyPrice, priceMarkupPercentage,
  priceSuggestionData, setPriceSuggestionData,
  handleRecalculatePriceMarkup, isSuggestingPrice,
}: InlinePriceSuggestionProps) {

  if (isSuggestingPrice) {
    return (
      <div className="flex items-center justify-center gap-3 py-8" style={{ color: 'var(--admin-text-muted)' }}>
        <Loader2 size={20} className="animate-spin text-[#D4A5A5]" />
        <span className="text-sm">{isVi ? 'Đang phân tích giá thị trường...' : 'Analyzing market prices...'}</span>
      </div>
    );
  }

  if (!priceSuggestionData) return null;

  return (
    <div className="mt-3">
      <div className="w-full p-4 rounded-[var(--admin-radius-lg)] flex flex-col gap-3"
        style={{ background: 'rgba(201, 169, 154, 0.05)', border: '1px solid var(--admin-border-subtle)' }}>
        <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid var(--admin-border-subtle)' }}>
          <span className="text-xs font-semibold" style={{ color: 'var(--admin-text)' }}>
            {isVi ? 'Đề xuất giá' : 'Price Suggestion'}
          </span>
        </div>
        <div className="flex flex-col gap-3 flex-1">
          <div className="grid grid-cols-3 gap-2 p-3 rounded-[var(--admin-radius)] border"
            style={{ background: 'rgba(201, 169, 154, 0.05)', borderColor: 'var(--admin-border-subtle)' }}>
            <div className="text-center">
              <p className="text-[0.625rem] font-medium" style={{ color: 'var(--admin-text-muted)' }}>{isVi ? 'Giá thị trường' : 'Market Price'}</p>
              <p className="text-sm font-semibold mt-1" style={{ color: 'var(--admin-text)' }}>
                {priceSuggestionData.marketPrice.toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div className="text-center" style={{ borderLeft: '1px solid var(--admin-border-subtle)', borderRight: '1px solid var(--admin-border-subtle)' }}>
              <p className="text-[0.625rem] font-medium" style={{ color: 'var(--admin-text-muted)' }}>Markup ({priceMarkupPercentage}%)</p>
              <p className="text-sm font-semibold mt-1" style={{ color: 'var(--admin-text-muted)' }}>
                +{priceSuggestionData.markupAmount.toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div className="text-center">
              <p className="text-[0.625rem] font-bold" style={{ color: 'var(--admin-text-brand, #7A5C5C)' }}>{isVi ? 'Giá web' : 'Web Price'}</p>
              <p className="text-[0.9375rem] font-bold mt-1" style={{ color: 'var(--admin-accent-hover, #D4A5A5)' }}>
                {priceSuggestionData.suggestedPrice.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-[0.6875rem] font-semibold" style={{ color: 'var(--admin-text)' }}>
                {isVi ? 'Biên lợi nhuận (Markup)' : 'Markup Margin'}
              </label>
              <span className="text-[0.6875rem] font-bold" style={{ color: 'var(--admin-text-brand, #7A5C5C)' }}>{priceMarkupPercentage}%</span>
            </div>
            <input type="range" min={5} max={40} step={5} value={priceMarkupPercentage}
              onChange={(e) => {
                const percent = Number(e.target.value);
                handleRecalculatePriceMarkup(percent);
                if (priceSuggestionData) {
                  const marketPrice = priceSuggestionData.marketPrice;
                  const markupAmount = Math.round(marketPrice * percent / 100);
                  onApplyPrice(marketPrice + markupAmount);
                }
              }}
              className="w-full cursor-pointer" style={{ accentColor: 'var(--admin-text-brand, #7A5C5C)' }} />
          </div>
          <div className="flex flex-col gap-1 pt-2 mt-1" style={{ borderTop: '1px solid var(--admin-border-subtle)' }}>
            <label className="text-[0.6875rem] font-semibold" style={{ color: 'var(--admin-text)' }}>
              {isVi ? 'Giá thị trường' : 'Market Price'}
            </label>
            <div className="relative flex items-center">
              <input type="number" min={0} value={priceSuggestionData.marketPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const markupAmount = Math.round(val * priceMarkupPercentage / 100);
                  const suggestedPrice = val + markupAmount;
                  setPriceSuggestionData({ ...priceSuggestionData, marketPrice: val, suggestedPrice, markupAmount });
                  onApplyPrice(suggestedPrice);
                }}
                className="w-full p-[6px_40px_6px_10px] text-sm outline-none rounded-[var(--admin-radius)]"
                style={{ background: 'rgba(201, 169, 154, 0.05)', border: '1px solid var(--admin-border-subtle)', color: 'var(--admin-text)' }} />
              <span className="absolute right-3 text-[0.625rem] font-semibold" style={{ color: 'var(--admin-text-muted)' }}>VNĐ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
