'use client';

import { useState, useEffect } from 'react';
import { Ticket } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { VoucherCard, type Voucher } from '@/components/profile/voucher-card';


export function VoucherManager() {
  const { accessToken } = useAuthStore();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    api.get<Voucher[]>('/vouchers', { skipAuth: false })
      .then((res) => {
        const data = (res.data as any).data || [];
        // Chỉ lấy voucher còn hạn
        const now = new Date();
        const active = data.filter((v: Voucher) => new Date(v.endDate) >= now);
        setVouchers(active);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  const counts = {
    all: vouchers.length,
    shop: vouchers.filter((v) => !v.minTier).length,
    vip: vouchers.filter((v) => !!v.minTier).length,
  };

  const filterTabs = [
    { key: 'all', label: 'Tất cả', count: counts.all },
    { key: 'shop', label: "Voucher L'essecen", count: counts.shop },
    { key: 'vip', label: 'Voucher VIP', count: counts.vip },
  ];

  const filtered = vouchers.filter((v) => {
    if (filter === 'all') return true;
    if (filter === 'shop') return !v.minTier;
    if (filter === 'vip') return !!v.minTier;
    return true;
  });

  return (
    <div className="h-full flex flex-col space-y-4">
      <h2 className="text-2xl md:text-3xl font-bold text-text-primary flex-shrink-0">Voucher</h2>

      {/* Filter pills */}
      <div className="grid grid-cols-3 bg-background rounded-lg p-1 border border-border w-full flex-shrink-0">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-2 py-2 rounded-md text-sm font-medium transition-all duration-300 text-center ${
              filter === tab.key
                ? 'bg-primary text-on-primary shadow-soft'
                : 'text-text-secondary hover:text-text-primary hover:bg-foreground/5'
            }`}
          >
            {tab.label}<span className="ml-1 opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3 flex-shrink-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-full rounded-xl bg-foreground/5 border border-border p-5 space-y-3">
              <div className="h-4 bg-text-muted/10 rounded w-32 animate-pulse" />
              <div className="h-3 bg-text-muted/10 rounded w-48 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 flex-shrink-0">
          <Ticket className="mx-auto text-text-muted mb-3" size={48} />
          <p className="text-text-secondary text-sm">Không có voucher nào.</p>
        </div>
      )}

      {/* Voucher list — scroll only when content overflows */}
      {!loading && filtered.length > 0 && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
          {filtered.map((v) => (
            <VoucherCard key={v.code} voucher={v} />
          ))}
        </div>
      )}
    </div>
  );
}