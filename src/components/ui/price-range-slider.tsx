'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

const MIN_PRICE = 0;
const MAX_PRICE = 5_000_000;
const STEP = 1_000_000;

function formatPrice(val: number) {
  return val.toLocaleString('vi-VN');
}

function roundToStep(val: number) {
  return Math.round(val / STEP) * STEP;
}

interface PriceRangeSliderProps {
  value: { min: number; max: number } | null;
  onChange: (range: { min: number; max: number } | null) => void;
  locale: string;
}

export function PriceRangeSlider({ value, onChange, locale }: PriceRangeSliderProps) {
  const isVi = locale === 'vi';
  const [isOpen, setIsOpen] = useState(false);
  const [localMin, setLocalMin] = useState(value?.min ?? MIN_PRICE);
  const [localMax, setLocalMax] = useState(value?.max ?? MAX_PRICE);
  const [inputMin, setInputMin] = useState(value ? formatPrice(value.min) : '');
  const [inputMax, setInputMax] = useState(value ? formatPrice(value.max) : '');
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<'min' | 'max' | null>(null);

  useEffect(() => {
    if (value) {
      setLocalMin(value.min);
      setLocalMax(value.max);
      setInputMin(formatPrice(value.min));
      setInputMax(formatPrice(value.max));
    } else {
      setLocalMin(MIN_PRICE);
      setLocalMax(MAX_PRICE);
      setInputMin('');
      setInputMax('');
    }
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const getPercent = (val: number) => ((val - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const pctToValue = (pct: number) => roundToStep((pct / 100) * (MAX_PRICE - MIN_PRICE) + MIN_PRICE);

  const getValueFromClientX = useCallback((clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    return pctToValue(pct);
  }, []);

  const handlePointerDown = (handle: 'min' | 'max') => (e: React.PointerEvent) => {
    e.preventDefault();
    dragRef.current = handle;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const val = getValueFromClientX(e.clientX);
    if (dragRef.current === 'min') {
      const next = Math.min(val, localMax);
      setLocalMin(next);
      setInputMin(formatPrice(next));
    } else {
      const next = Math.max(val, localMin);
      setLocalMax(next);
      setInputMax(formatPrice(next));
    }
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleInputMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setInputMin(raw ? Number(raw).toLocaleString('vi-VN') : '');
    const num = Number(raw);
    if (!isNaN(num)) {
      const rounded = roundToStep(num);
      setLocalMin(Math.min(rounded, localMax));
    }
  };

  const handleInputMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setInputMax(raw ? Number(raw).toLocaleString('vi-VN') : '');
    const num = Number(raw);
    if (!isNaN(num)) {
      const rounded = roundToStep(num);
      setLocalMax(Math.max(rounded, localMin));
    }
  };

  const handleApply = () => {
    const min = Math.max(MIN_PRICE, Math.min(localMin, localMax));
    const max = Math.min(MAX_PRICE, Math.max(localMax, localMin));
    if (min === MIN_PRICE && max === MAX_PRICE) {
      onChange(null);
    } else {
      onChange({ min, max });
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalMin(MIN_PRICE);
    setLocalMax(MAX_PRICE);
    setInputMin('');
    setInputMax('');
    onChange(null);
    setIsOpen(false);
  };

  const isActive = value !== null;
  const leftPct = getPercent(localMin);
  const rightPct = getPercent(localMax);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5 min-w-[140px] sm:min-w-[180px] flex-1 sm:flex-initial">
      <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">
        {isVi ? 'Mức giá' : 'Price'}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full border rounded-xl px-3 py-2 text-xs font-medium focus:outline-none transition-all cursor-pointer h-[38px] text-left ${
          isActive
            ? 'bg-[#D4A5A5]/10 border-[#D4A5A5]/30 text-[#7A5C5C]'
            : 'bg-white/40 border-[#7A5C5C]/10 text-[#7A5C5C]/80'
        }`}
      >
        <span className="truncate">
          {isActive
            ? `${formatPrice(value!.min)}₫ - ${formatPrice(value!.max)}₫`
            : isVi ? 'Tất cả' : 'All Prices'}
        </span>
        <svg
          className={`w-2.5 h-2.5 ml-2 transition-transform duration-300 opacity-60 shrink-0 text-[#7A5C5C] ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-transparent cursor-default" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[58px] left-1/2 -translate-x-1/2 w-[280px] bg-white border border-[#7A5C5C]/10 rounded-xl shadow-xl z-50 p-4">
            {/* Track */}
            <div
              ref={trackRef}
              className="relative w-full h-6 mb-1 cursor-pointer"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* Track bg */}
              <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-[#7A5C5C]/10 rounded-full pointer-events-none" />
              {/* Range highlight */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-[#D4A5A5] pointer-events-none"
                style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
              />
              {/* Min handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#D4A5A5] shadow-sm cursor-grab active:cursor-grabbing z-20 select-none touch-none"
                style={{ left: `${leftPct}%` }}
                onPointerDown={handlePointerDown('min')}
              />
              {/* Max handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#D4A5A5] shadow-sm cursor-grab active:cursor-grabbing z-10 select-none touch-none"
                style={{ left: `${rightPct}%` }}
                onPointerDown={handlePointerDown('max')}
              />
            </div>

            {/* Min/Max labels */}
            <div className="flex justify-between text-[10px] text-[#7A5C5C]/50 mb-3">
              <span>{formatPrice(localMin)}₫</span>
              <span>{formatPrice(localMax)}₫</span>
            </div>

            {/* Input fields */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMin}
                  onChange={handleInputMin}
                  placeholder={isVi ? 'Tối thiểu' : 'Min'}
                  className="w-full bg-white border border-[#7A5C5C]/15 rounded-lg px-2.5 py-1.5 text-xs text-[#7A5C5C] font-medium text-center focus:outline-none focus:border-[#D4A5A5] transition-colors"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#7A5C5C]/40">₫</span>
              </div>
              <span className="text-[#7A5C5C]/30 text-xs">—</span>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMax}
                  onChange={handleInputMax}
                  placeholder={isVi ? 'Tối đa' : 'Max'}
                  className="w-full bg-white border border-[#7A5C5C]/15 rounded-lg px-2.5 py-1.5 text-xs text-[#7A5C5C] font-medium text-center focus:outline-none focus:border-[#D4A5A5] transition-colors"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#7A5C5C]/40">₫</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#7A5C5C]/60 border border-[#7A5C5C]/10 hover:bg-[#7A5C5C]/5 transition-all"
              >
                {isVi ? 'Xóa' : 'Clear'}
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white bg-[#D4A5A5] hover:bg-[#c48d8d] transition-all"
              >
                {isVi ? 'Áp dụng' : 'Apply'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
