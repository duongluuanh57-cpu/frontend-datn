'use client';

import { useState, useEffect } from 'react';
import { Button } from '@astryxdesign/core/Button';

interface PriceFilterDropdownProps {
  priceMin: number | undefined;
  priceMax: number | undefined;
  onApply: (min: number, max: number) => void;
  onClear: () => void;
}

function formatPrice(value: number): string {
  return value.toLocaleString('vi-VN');
}

function parsePrice(value: string): number {
  const cleaned = value.replace(/\./g, '').replace(/,/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

function getPriceSuggestions(value: number): string[] {
  if (value === 0) return [];
  const suggestions: string[] = [];
  const maxPrice = 5000000;
  if (value < 1000) {
    const s1 = value * 100000;
    const s2 = value * 1000000;
    if (s1 <= maxPrice) suggestions.push(formatPrice(s1));
    if (s2 <= maxPrice) suggestions.push(formatPrice(s2));
  } else if (value < 10000) {
    const s1 = value * 100;
    const s2 = value * 1000;
    if (s1 <= maxPrice) suggestions.push(formatPrice(s1));
    if (s2 <= maxPrice) suggestions.push(formatPrice(s2));
  } else if (value < 100000) {
    const s1 = value * 10;
    const s2 = value * 100;
    if (s1 <= maxPrice) suggestions.push(formatPrice(s1));
    if (s2 <= maxPrice) suggestions.push(formatPrice(s2));
  } else if (value < 1000000) {
    const s1 = value * 10;
    if (s1 <= maxPrice) suggestions.push(formatPrice(s1));
  }
  return suggestions.slice(0, 3);
}

export function PriceFilterDropdown({
  priceMin, priceMax, onApply, onClear,
}: PriceFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const initialMin = priceMin ?? 0;
  const initialMax = priceMax ?? 5000000;

  const [tempMin, setTempMin] = useState(initialMin);
  const [tempMax, setTempMax] = useState(initialMax);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setTempMin(initialMin);
    setTempMax(initialMax);
  }, [initialMin, initialMax]);

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parsePrice(e.target.value);
    setTempMin(parsed);
    setSuggestions(getPriceSuggestions(parsed));
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parsePrice(e.target.value);
    setTempMax(parsed);
    setSuggestions(getPriceSuggestions(parsed));
  };

  const handleSuggestionClick = (suggestedPrice: number) => {
    if (tempMin === 0 || (tempMin > 0 && tempMax > tempMin)) {
      setTempMin(suggestedPrice);
    } else {
      setTempMax(suggestedPrice);
    }
    setSuggestions([]);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (e.target.name === 'min') {
      setTempMin(value);
      setTempMax(prev => Math.max(value, prev));
    } else {
      setTempMax(value);
      setTempMin(prev => Math.min(prev, value));
    }
  };

  const handleApply = () => {
    onApply(tempMin, tempMax);
    setOpen(false);
  };

  const handleClear = () => {
    setTempMin(0);
    setTempMax(5000000);
    onClear();
    setOpen(false);
  };

  const hasActive = priceMin !== undefined || priceMax !== undefined;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${
          hasActive ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-text-primary hover:border-primary'
        }`}>
        <span>{hasActive ? 'Đã lọc giá' : 'Giá'}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-xl z-20 p-5">
            <div className="mb-4">
              <div className="relative h-2 bg-text-muted/10 rounded-full">
                <div
                  className="absolute h-2 bg-primary rounded-full"
                  style={{
                    left: `${(tempMin / 5000000) * 100}%`,
                    right: `${100 - (tempMax / 5000000) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  name="min"
                  min="0"
                  max="5000000"
                  step="1000000"
                  value={tempMin}
                  onChange={handleSliderChange}
                  className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                  style={{ zIndex: tempMin > 4000000 ? 5 : 1 }}
                />
                <input
                  type="range"
                  name="max"
                  min="0"
                  max="5000000"
                  step="1000000"
                  value={tempMax}
                  onChange={handleSliderChange}
                  className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                  style={{ zIndex: 2 }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-text-muted">
                <span>0đ</span>
                <span>1Tr</span>
                <span>2Tr</span>
                <span>3Tr</span>
                <span>4Tr</span>
                <span>5Tr</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Tối thiểu</label>
                <input
                  type="text"
                  value={formatPrice(tempMin)}
                  onChange={handleMinInputChange}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0đ"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Tối đa</label>
                <input
                  type="text"
                  value={formatPrice(tempMax)}
                  onChange={handleMaxInputChange}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="5.000.000đ"
                />
              </div>
            </div>

            {suggestions.length > 0 && (
              <div className="mb-3 p-2.5 bg-primary/5 rounded-lg">
                <p className="text-[10px] text-text-secondary mb-1.5">Đề xuất giá:</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(parsePrice(suggestion))}
                      className="px-2.5 py-1 bg-white border border-primary text-primary text-xs rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer"
                    >
                      {suggestion}đ
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button label="Xóa" variant="secondary" size="sm" onClick={handleClear} />
              <Button label="Áp dụng" variant="primary" size="sm" onClick={handleApply} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
