'use client';

import React from 'react';
import { X, Loader2 } from 'lucide-react';

interface SelectionItem {
  id: string;
  label: string;
  secondaryLabel?: string;
}

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  items: SelectionItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  emptyMessage: string;
  customValue?: string;
  onCustomChange?: (value: string) => void;
  customPlaceholder?: string;
  onCustomAdd?: () => void;
  isCustomPending?: boolean;
}

export function SelectionModal({
  isOpen, onClose, icon, title, subtitle,
  items, selectedIds, onToggle, emptyMessage,
  customValue, onCustomChange, customPlaceholder, onCustomAdd, isCustomPending,
}: SelectionModalProps) {

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-5"
      style={{ background: 'rgba(61, 46, 36, 0.35)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white border border-[var(--admin-border)] rounded-[var(--admin-radius-lg,20px)] p-[30px] w-full max-w-[500px] flex flex-col gap-5"
        style={{ boxShadow: '0 20px 40px rgba(61, 46, 36, 0.08)', animation: 'fadeIn 0.25s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-[var(--admin-border)] pb-4">
          <div className="flex items-center gap-[10px]">
            <div className="p-2 rounded-[10px]" style={{ background: 'rgba(212, 165, 165, 0.1)', color: 'var(--admin-accent, #5c4a42)' }}>
              {icon}
            </div>
            <div>
              <h3 className="m-0 text-lg font-semibold" style={{ color: 'var(--admin-text, #3d2e24)' }}>{title}</h3>
              <p className="m-0 text-xs mt-1" style={{ color: 'var(--admin-text-secondary, #6b564c)' }}>{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border-none p-1 rounded-full flex items-center justify-center transition-colors"
            style={{ color: 'var(--admin-text-muted, #9a857c)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--admin-text, #3d2e24)'; e.currentTarget.style.background = 'rgba(61, 46, 36, 0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--admin-text-muted, #9a857c)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-[10px] max-h-[300px] overflow-y-auto pr-[6px] admin-scrollbar-luxury">
          {items.map((item) => {
            const isChecked = selectedIds.includes(item.id);
            return (
              <label
                key={item.id}
                className="flex items-center justify-between cursor-pointer text-sm select-none p-3 rounded-xl border transition-all duration-250"
                style={{
                  background: isChecked ? 'rgba(212, 165, 165, 0.08)' : 'var(--admin-surface-muted, #faf8f6)',
                  borderColor: isChecked ? 'rgba(212, 165, 165, 0.25)' : 'var(--admin-border, #e8e0da)',
                  color: 'var(--admin-text, #3d2e24)',
                }}
                onMouseEnter={(e) => {
                  if (!isChecked) { e.currentTarget.style.background = 'rgba(61, 46, 36, 0.03)'; e.currentTarget.style.borderColor = 'rgba(212, 165, 165, 0.2)'; }
                }}
                onMouseLeave={(e) => {
                  if (!isChecked) { e.currentTarget.style.background = 'var(--admin-surface-muted, #faf8f6)'; e.currentTarget.style.borderColor = 'var(--admin-border, #e8e0da)'; }
                }}
              >
                <div className="flex items-center gap-[10px]">
                  <span className="font-medium" style={{ color: 'var(--admin-text, #3d2e24)' }}>{item.label}</span>
                  {item.secondaryLabel && (
                    <span className="text-[0.6875rem] px-[6px] py-[2px] rounded" style={{ color: 'var(--admin-text-secondary, #6b564c)', background: 'rgba(61, 46, 36, 0.05)' }}>
                      {item.secondaryLabel}
                    </span>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(item.id)}
                  className="w-[18px] h-[18px] cursor-pointer"
                  style={{ accentColor: 'var(--admin-accent, #5c4a42)' }}
                />
              </label>
            );
          })}
          {items.length === 0 && (
            <p className="text-sm italic text-center m-0 py-6" style={{ color: 'var(--admin-text-secondary, #6b564c)' }}>
              {emptyMessage}
            </p>
          )}
        </div>

        {customValue !== undefined && (
          <div className="flex gap-2 pt-3 mt-1" style={{ borderTop: '1px solid var(--admin-border-subtle)' }}>
            <input
              type="text"
              placeholder={customPlaceholder}
              value={customValue}
              onChange={(e) => onCustomChange?.(e.target.value)}
              className="admin-input flex-grow"
              style={{ height: '36px', fontSize: '0.8125rem' }}
            />
            <button
              type="button"
              disabled={isCustomPending}
              onClick={onCustomAdd}
              className="px-4 py-2 text-white rounded-xl text-xs font-semibold transition active:scale-95 disabled:opacity-50"
              style={{ height: '36px', borderRadius: '10px', background: '#7A5C5C' }}
              onMouseEnter={(e) => { if (!isCustomPending) e.currentTarget.style.background = '#634747'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#7A5C5C'; }}
            >
              {isCustomPending ? <Loader2 size={14} className="animate-spin" /> : 'Thêm'}
            </button>
          </div>
        )}

        <div className="flex justify-end pt-4" style={{ borderTop: '1px solid var(--admin-border, #e8e0da)' }}>
          <button
            type="button"
            onClick={onClose}
            className="text-white px-6 py-[10px] rounded-[10px] text-sm font-semibold border-none transition-transform"
            style={{ background: 'var(--admin-accent, #5c4a42)', boxShadow: '0 4px 12px rgba(92, 74, 66, 0.15)' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '0.95'; e.currentTarget.style.background = 'var(--admin-accent-hover, #4a3728)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--admin-accent, #5c4a42)'; }}
          >
            Hoàn thành
          </button>
        </div>
      </div>
    </div>
  );
}
