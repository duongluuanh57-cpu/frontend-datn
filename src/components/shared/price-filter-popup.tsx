'use client';

import { useState, useEffect, useRef } from 'react';
import { formatNumber, parsePrice, getPriceSuggestions } from '@/lib/priceFilterUtils';

interface PriceFilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (min: number, max: number) => void;
  onClear: () => void;
  initialMin?: number;
  initialMax?: number;
  popupId?: string;
}

export function PriceFilterPopup({
  isOpen,
  onClose,
  onApply,
  onClear,
  initialMin = 0,
  initialMax = 5000000,
  popupId,
}: PriceFilterPopupProps) {
  const [minPrice, setMinPrice] = useState(initialMin);
  const [maxPrice, setMaxPrice] = useState(initialMax);
  const [tempMin, setTempMin] = useState(initialMin);
  const [tempMax, setTempMax] = useState(initialMax);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTempMin(initialMin);
      setTempMax(initialMax);
      setMinPrice(initialMin);
      setMaxPrice(initialMax);
    }
  }, [isOpen, initialMin, initialMax]);

  // Click outside to close (không reset filter)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Đóng popup khác khi mở popup này
    const handlePopupOpen = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string }>;
      if (customEvent.detail?.id && customEvent.detail.id !== popupId) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('price-filter-opened', handlePopupOpen);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('price-filter-opened', handlePopupOpen);
    };
  }, [isOpen, onClose, popupId]);

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsed = parsePrice(value);
    setTempMin(parsed);
    setSuggestions(getPriceSuggestions(parsed));
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsed = parsePrice(value);
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
    setMinPrice(tempMin);
    setMaxPrice(tempMax);
    onApply(tempMin, tempMax);
    onClose();
  };

  // Thông báo cho các popup khác biết mình đang mở
  useEffect(() => {
    if (isOpen && popupId) {
      window.dispatchEvent(new CustomEvent('price-filter-opened', { detail: { id: popupId } }));
    }
  }, [isOpen, popupId]);

  const handleClear = () => {
    setTempMin(0);
    setTempMax(5000000);
    setMinPrice(0);
    setMaxPrice(5000000);
    onClear();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-5 w-80 z-50"
    >
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900 mb-1">Lọc theo giá</h3>
        <p className="text-xs text-gray-500">Chọn khoảng giá phù hợp</p>
      </div>

      <div className="mb-5">
        <div className="relative h-2 bg-gray-200 rounded-full">
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
        <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
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
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Tối thiểu
          </label>
          <input
            type="text"
            value={formatNumber(tempMin)}
            onChange={handleMinInputChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="0đ"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Tối đa
          </label>
          <input
            type="text"
            value={formatNumber(tempMax)}
            onChange={handleMaxInputChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="5.000.000đ"
          />
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="mb-3 p-2.5 bg-primary-light/10 rounded-lg">
          <p className="text-[10px] text-gray-600 mb-1.5">Đề xuất giá:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(parsePrice(suggestion))}
                className="px-2.5 py-1 bg-white border border-primary text-primary text-xs rounded-full hover:bg-primary hover:text-white transition-colors"
              >
                {suggestion}đ
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleClear}
          className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Xóa lọc
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
}