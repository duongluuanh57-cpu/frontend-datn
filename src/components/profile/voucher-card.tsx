'use client';

import { Percent, Coins, Ticket } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';

export interface Voucher {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxDiscount: number | null;
  minOrderAmount: number;
  minTier: string | null;
  discountAmount: number;
  endDate: string;
  remaining?: number;
}

interface VoucherCardProps {
  voucher: Voucher;
  selected?: boolean;
}

function getDiscountLabel(v: Voucher) {
  if (v.type === 'percentage') {
    const base = `Giảm ${v.value}%`;
    if (v.maxDiscount) return `${base} · Giảm tối đa ${formatPrice(v.maxDiscount)}`;
    return base;
  }
  return `Giảm ${formatPrice(v.value)}`;
}

function getMinOrderLabel(amount: number) {
  if (amount <= 0) return 'Đơn từ 0đ';
  return `Đơn tối thiểu ${formatPrice(amount)}`;
}

export function VoucherCard({ voucher, selected }: VoucherCardProps) {
  const isExpired = new Date(voucher.endDate) < new Date();
  const isVip = !!voucher.minTier;

  return (
    <div className={`w-full rounded-xl bg-white border ${isExpired ? 'border-gray-200 opacity-60' : 'border-border'} shadow-soft overflow-hidden transition-all duration-200 hover:shadow-card`}>
      <div className="flex items-stretch min-h-[88px]">
        {/* Left: Logo square */}
        <div className="flex flex-col items-center justify-center w-[88px] flex-shrink-0 border-r border-dashed border-border py-3 px-2">
          <div className="w-10 h-10 rounded-lg border-2 border-primary/30 flex items-center justify-center bg-primary/5">
            {voucher.type === 'percentage' ? (
              <Percent size={20} className="text-primary" />
            ) : (
              <Coins size={20} className="text-primary" />
            )}
          </div>
          <span className="text-[10px] font-semibold text-text-muted mt-1.5 text-center leading-tight">
            {isVip ? 'Voucher VIP' : "Voucher L'essence"}
          </span>
        </div>

        {/* Middle: Content */}
        <div className="flex-1 px-3 py-3 min-w-0 flex flex-col justify-center gap-0.5">
          <p className="text-sm font-bold text-text-primary leading-tight">
            {getDiscountLabel(voucher)}
          </p>
          <p className="text-[11px] text-text-muted">
            {getMinOrderLabel(voucher.minOrderAmount)}
          </p>
          <p className="text-[11px] text-text-muted flex items-center gap-1">
            HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
          </p>
          {isExpired && (
            <span className="inline-block mt-1 text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-200 w-fit">
              Đã hết hạn
            </span>
          )}
        </div>

        {/* Right: Radio button (only when selected prop is passed, i.e. in Cart) */}
        {selected !== undefined && (
          <div className="flex items-center justify-center py-3 pr-3 pl-1 flex-shrink-0">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white transition-colors ${
              selected ? 'border-primary' : 'border-gray-300'
            }`}>
              {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}