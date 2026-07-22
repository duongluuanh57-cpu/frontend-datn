'use client';

import { useState } from 'react';
import { Tag, ChevronDown, X, Loader2, Ticket } from 'lucide-react';
import { VoucherCard } from '@/components/profile/voucher-card';
import { getBackendOrigin } from '@/lib/api';

interface Voucher {
  _id: string;
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

interface VoucherSelectorProps {
  accessToken: string;
  voucherCode?: string | null;
  onApply: (code: string) => Promise<void>;
  onRemove: () => Promise<void>;
  /** endpoint to fetch vouchers — defaults to /api/vouchers */
  fetchUrl?: string;
}

export function VoucherSelector({
  accessToken,
  voucherCode,
  onApply,
  onRemove,
  fetchUrl,
}: VoucherSelectorProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [fetching, setFetching] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const fetchVouchers = async () => {
    if (!accessToken) return;
    setFetching(true);
    try {
      const origin = getBackendOrigin();
      const url = fetchUrl || `${origin.replace(/\/+$/, '')}/api/vouchers`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setVouchers(json.data);
        setSelectedCode(null);
        setShowPopup(true);
      }
    } catch {
      // ignore
    } finally {
      setFetching(false);
    }
  };

  const handleSelect = (code: string) => {
    setSelectedCode(code);
    setShowPopup(false);
    onApply(code);
  };

  return (
    <>
      {/* Button / applied badge */}
      <div className="space-y-1">
        {voucherCode ? (
          <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <Tag size={14} className="text-primary flex-shrink-0" />
              <span className="text-sm font-semibold text-primary truncate">{voucherCode}</span>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="text-xs text-red-500 hover:text-red-600 flex-shrink-0 ml-2 cursor-pointer font-medium"
            >
              Hủy
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={fetchVouchers}
            className="w-full flex items-center justify-between border border-dashed border-border rounded-lg px-3 py-2.5 text-sm font-semibold text-text-muted hover:text-primary hover:border-primary transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Tag size={14} />
              Thêm mã giảm giá
            </span>
            <ChevronDown size={16} />
          </button>
        )}
      </div>

      {/* Modal popup */}
      {showPopup && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center" style={{ margin: 0 }} onClick={() => setShowPopup(false)}>
          <div className="bg-white rounded-xl shadow-elevated w-full max-w-md max-h-[80vh] flex flex-col mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-text-primary">Chọn mã giảm giá</h3>
              <button type="button" onClick={() => setShowPopup(false)} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {fetching ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
              </div>
            ) : vouchers.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 px-5">
                <Ticket className="w-12 h-12 text-text-muted mb-3" />
                <p className="text-sm text-text-secondary">Không có voucher nào khả dụng.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 pb-4">
                <div className="space-y-4 pt-4">
                  {vouchers.filter((v) => !v.minTier).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Voucher L'essence</p>
                      <div className="space-y-2">
                        {vouchers.filter((v) => !v.minTier).map((v) => (
                          <label key={v.code} className="block cursor-pointer">
                            <input
                              type="radio"
                              name="voucher-select"
                              checked={selectedCode === v.code}
                              onChange={() => handleSelect(v.code)}
                              className="sr-only"
                            />
                            <VoucherCard voucher={v} selected={selectedCode === v.code} />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  {vouchers.filter((v) => !!v.minTier).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Voucher VIP</p>
                      <div className="space-y-2">
                        {vouchers.filter((v) => !!v.minTier).map((v) => (
                          <label key={v.code} className="block cursor-pointer">
                            <input
                              type="radio"
                              name="voucher-select"
                              checked={selectedCode === v.code}
                              onChange={() => handleSelect(v.code)}
                              className="sr-only"
                            />
                            <VoucherCard voucher={v} selected={selectedCode === v.code} />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex-shrink-0 flex justify-end px-5 py-4 border-t border-border">
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 text-sm font-semibold text-on-primary bg-primary rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}