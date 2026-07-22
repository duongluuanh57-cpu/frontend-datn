'use client';

import { Info } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';

interface PriceSummaryProps {
  totalAmount: number;
  shippingFee?: number | string;
  shippingFeeLabel?: string;
  showFreeShippingHint?: boolean;
  voucherDiscount: number;
  finalTotal: number;
}

export function PriceSummary({
  totalAmount,
  shippingFee,
  shippingFeeLabel,
  showFreeShippingHint = false,
  voucherDiscount,
  finalTotal,
}: PriceSummaryProps) {
  const hasShippingFee = shippingFee !== undefined;
  const isShippingFree = shippingFee === 0 || shippingFee === 'Miễn phí';

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">Tạm tính</span>
        <span className="font-medium text-text-primary">{formatPrice(totalAmount)}</span>
      </div>

      {hasShippingFee && (
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Phí vận chuyển</span>
          <span className={`font-medium ${isShippingFree ? 'text-green-600' : 'text-text-primary'}`}>
            {typeof shippingFee === 'number'
              ? shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)
              : shippingFee}
          </span>
        </div>
      )}

      {showFreeShippingHint && typeof shippingFee === 'number' && shippingFee > 0 && (
        <p className="text-xs text-text-muted flex items-center gap-1">
          <Info className="w-3 h-3" />
          {shippingFeeLabel || 'Miễn phí vận chuyển cho đơn từ 500.000₫'}
        </p>
      )}

      {voucherDiscount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Giảm giá</span>
          <span className="font-medium text-green-600">-{formatPrice(voucherDiscount)}</span>
        </div>
      )}

      <div className="border-t border-border pt-3">
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-text-primary">Tổng cộng</span>
          <span className="text-xl lg:text-2xl font-bold text-primary">
            {formatPrice(Math.max(0, finalTotal))}
          </span>
        </div>
      </div>
    </div>
  );
}