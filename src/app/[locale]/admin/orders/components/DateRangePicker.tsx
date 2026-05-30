'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  isVi: boolean;
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_VI = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
const DAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function toYMD(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseYMD(s: string): { y: number; m: number; d: number } | null {
  if (!s) return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { y: +m[1], m: +m[2] - 1, d: +m[3] };
}

function displayDate(ymd: string, isVi: boolean): string {
  const p = parseYMD(ymd);
  if (!p) return '';
  return isVi
    ? `${String(p.d).padStart(2, '0')}/${String(p.m + 1).padStart(2, '0')}`
    : `${p.y}/${String(p.m + 1).padStart(2, '0')}/${String(p.d).padStart(2, '0')}`;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  isVi,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [phase, setPhase] = useState<'start' | 'end'>('start');
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const p = parseYMD(startDate);
    if (p) {
      setViewYear(p.y);
      setViewMonth(p.m);
    } else {
      const n = new Date();
      setViewYear(n.getFullYear());
      setViewMonth(n.getMonth());
    }
    setPhase('start');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) { setDropdownPos(null); return; }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dw = 300;
    const dh = 320;
    const margin = 12;
    let left = rect.left;
    if (left + dw > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - dw - margin);
    }
    let top = rect.bottom + 6;
    if (top + dh > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - dh - 6);
    }
    setDropdownPos({ top, left, width: dw });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => setIsOpen(false);
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const handleDayClick = useCallback((year: number, month: number, day: number) => {
    const dateStr = toYMD(year, month, day);

    if (phase === 'start') {
      onStartDateChange(dateStr);
      onEndDateChange('');
      setPhase('end');
    } else {
      const startP = parseYMD(startDate);
      if (startP) {
        const startTs = new Date(startP.y, startP.m, startP.d).getTime();
        const endTs = new Date(year, month, day).getTime();
        if (endTs < startTs) {
          onStartDateChange(dateStr);
          onEndDateChange('');
          setPhase('end');
          return;
        }
      }
      onEndDateChange(dateStr);
    }
  }, [phase, startDate, onStartDateChange, onEndDateChange]);

  const handleClear = useCallback(() => {
    onStartDateChange('');
    onEndDateChange('');
    setIsOpen(false);
  }, [onStartDateChange, onEndDateChange]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else { setViewMonth(viewMonth - 1); }
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else { setViewMonth(viewMonth + 1); }
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const monthNames = isVi ? MONTHS_VI : MONTHS_EN;
  const dayNames = isVi ? DAYS_VI : DAYS_EN;
  const startP = parseYMD(startDate);
  const endP = parseYMD(endDate);

  const displayValue = startDate && endDate
    ? `${displayDate(startDate, isVi)} — ${displayDate(endDate, isVi)}`
    : startDate
    ? `${displayDate(startDate, isVi)} — ...`
    : isVi ? 'Chọn khoảng ngày' : 'Select date range';

  const isInRange = (y: number, m: number, d: number) => {
    if (!startP) return false;
    const ts = new Date(y, m, d).getTime();
    const sTs = new Date(startP.y, startP.m, startP.d).getTime();
    if (!endP) return ts === sTs;
    const eTs = new Date(endP.y, endP.m, endP.d).getTime();
    return ts >= sTs && ts <= eTs;
  };

  const isRangeEdge = (y: number, m: number, d: number) => {
    if (!startP) return false;
    if (startP.y === y && startP.m === m && startP.d === d) return 'start';
    if (endP && endP.y === y && endP.m === m && endP.d === d) return 'end';
    return null;
  };

  return (
    <div className="admin-daterange" ref={containerRef}>
      <button
        ref={triggerRef}
        className="admin-daterange__trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <Calendar size={16} />
        <span>{displayValue}</span>
      </button>

      {isOpen && dropdownPos && (
        <div className="admin-daterange__dropdown" style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}>
          <div className="admin-daterange__nav">
            <button onClick={prevMonth} type="button" className="admin-daterange__nav-btn">{'‹'}</button>
            <span className="admin-daterange__nav-label">{monthNames[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} type="button" className="admin-daterange__nav-btn">{'›'}</button>
          </div>

          <div className="admin-daterange__grid">
            {dayNames.map(d => (
              <div key={d} className="admin-daterange__day-header">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e${i}`} className="admin-daterange__day admin-daterange__day--empty" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const edge = isRangeEdge(viewYear, viewMonth, day);
              return (
                <button
                  key={day}
                  type="button"
                  className={`admin-daterange__day${isInRange(viewYear, viewMonth, day) ? ' admin-daterange__day--in' : ''}${edge === 'start' ? ' admin-daterange__day--start' : ''}${edge === 'end' ? ' admin-daterange__day--end' : ''}${phase === 'end' && startDate && !endDate && edge === 'start' ? ' admin-daterange__day--start-only' : ''}`}
                  onClick={() => handleDayClick(viewYear, viewMonth, day)}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="admin-daterange__footer">
            <button onClick={handleClear} type="button" className="admin-daterange__clear">
              {isVi ? 'Xóa' : 'Clear'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
