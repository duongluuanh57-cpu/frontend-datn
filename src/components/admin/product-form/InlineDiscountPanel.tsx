'use client';

import React from 'react';

interface InlineDiscountPanelProps {
  isVi: boolean;
  discountPercentage: number;
  discountStartDate: string | Date | null | undefined;
  discountEndDate: string | Date | null | undefined;
  update: (patch: any) => void;
}

export function InlineDiscountPanel({
  isVi, discountPercentage, discountStartDate, discountEndDate, update,
}: InlineDiscountPanelProps) {
  const handleChange = (val: number) => {
    const patch: any = { discountPercentage: val };
    if (val <= 0) {
      patch.discountStartDate = null;
      patch.discountEndDate = null;
    } else if (val <= 10) {
      patch.discountStartDate = null;
      patch.discountEndDate = null;
    }
    update(patch);
  };

  return (
    <div className="w-full p-4 rounded-[var(--admin-radius-lg)] flex flex-col gap-3"
      style={{ background: 'rgba(201, 169, 154, 0.05)', border: '1px solid var(--admin-border-subtle)' }}>
      <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid var(--admin-border-subtle)' }}>
        <span className="text-xs font-semibold" style={{ color: 'var(--admin-text)' }}>
          {isVi ? 'Chiết khấu' : 'Discount'}
        </span>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-[0.6875rem] font-semibold" style={{ color: 'var(--admin-text)' }}>
              {isVi ? 'Tỷ lệ chiết khấu (%)' : 'Discount Percentage (%)'}
            </label>
            <span className="text-[0.6875rem] font-bold" style={{ color: 'var(--admin-text-brand, #7A5C5C)' }}>
              {discountPercentage}%
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <input type="range" min={0} max={90} step={5}
              value={discountPercentage}
              onChange={(e) => handleChange(Number(e.target.value))}
              className="flex-grow cursor-pointer"
              style={{ accentColor: 'var(--admin-text-brand, #7A5C5C)' }} />
            <input type="number" min={0} max={100} value={discountPercentage}
              onChange={(e) => handleChange(Number(e.target.value))}
              className="w-[60px] text-center outline-none text-sm rounded-[var(--admin-radius)] p-[5px] border"
              style={{ background: 'rgba(201, 169, 154, 0.05)', borderColor: 'var(--admin-border-subtle)', color: 'var(--admin-text)' }} />
          </div>
        </div>

        {discountPercentage > 10 && (
          <div className="flex flex-col gap-3 pt-3" style={{ borderTop: '1px solid var(--admin-border-subtle)' }}>
            <p className="text-[0.6875rem] font-bold" style={{ color: 'var(--admin-text)' }}>
              {isVi ? 'Đặt lịch thời gian áp dụng' : 'Active Event Schedule'}
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[0.625rem] font-medium block mb-1" style={{ color: 'var(--admin-text-muted)' }}>
                  {isVi ? 'Ngày bắt đầu' : 'Start Date'}
                </label>
                <input type="datetime-local"
                  value={discountStartDate ? new Date(new Date(discountStartDate).getTime() - new Date().getTimezoneOffset()*60000).toISOString().slice(0, 16) : ''}
                  onChange={(e) => update({ discountStartDate: e.target.value ? new Date(e.target.value) : null })}
                  onClick={(e) => { try { (e.target as HTMLInputElement).showPicker(); } catch {} }}
                  className="w-full rounded-[var(--admin-radius)] outline-none text-[0.6875rem] p-[6px_8px] border"
                  style={{ background: 'rgba(201, 169, 154, 0.05)', borderColor: 'var(--admin-border-subtle)', color: 'var(--admin-text)', colorScheme: 'dark' }} />
              </div>
              <div className="flex-1">
                <label className="text-[0.625rem] font-medium block mb-1" style={{ color: 'var(--admin-text-muted)' }}>
                  {isVi ? 'Ngày kết thúc' : 'End Date'}
                </label>
                <input type="datetime-local"
                  value={discountEndDate ? new Date(new Date(discountEndDate).getTime() - new Date().getTimezoneOffset()*60000).toISOString().slice(0, 16) : ''}
                  onChange={(e) => update({ discountEndDate: e.target.value ? new Date(e.target.value) : null })}
                  onClick={(e) => { try { (e.target as HTMLInputElement).showPicker(); } catch {} }}
                  className="w-full rounded-[var(--admin-radius)] outline-none text-[0.6875rem] p-[6px_8px] border"
                  style={{ background: 'rgba(201, 169, 154, 0.05)', borderColor: 'var(--admin-border-subtle)', color: 'var(--admin-text)', colorScheme: 'dark' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
