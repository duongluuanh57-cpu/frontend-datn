'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';

interface DashboardStats {
  revenueToday: number;
  newOrdersToday: number;
  visitsToday: number;
  revenuePercent: number;
  ordersPercent: number;
  visitsPercent: number;
}

function PieChart({ percent, value, color }: { percent: number; value: string; color: string }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center w-14 h-14">
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-gray-100"
          />
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke={color}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-black leading-none">{value}</span>
          <span className="text-[7px] font-bold opacity-60">{percent}%</span>
        </div>
      </div>
    </div>
  );
}

export function AdminHeaderAside() {
  const t = useTranslations('Admin.dashboard');

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/stats/dashboard');
      return res.data;
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    return val.toLocaleString();
  };

  return (
    <aside className="admin-header-aside" aria-label="Quick summary">
      <div className="admin-header-aside__metric admin-header-aside__metric--vertical">
        <PieChart
          percent={stats?.revenuePercent || 0}
          value={stats ? formatCurrency(stats.revenueToday) : '...'}
          color="var(--admin-accent)"
        />
        <p className="admin-header-aside__metric-label">{t('quickStats.revenue')}</p>
      </div>

      <div className="admin-header-aside__metric admin-header-aside__metric--vertical">
        <PieChart
          percent={stats?.visitsPercent || 0}
          value={stats ? (stats.visitsToday >= 1000 ? `${(stats.visitsToday / 1000).toFixed(1)}k` : stats.visitsToday.toString()) : '...'}
          color="#5a7d62"
        />
        <p className="admin-header-aside__metric-label">{t('quickStats.visits')}</p>
      </div>

      <div className="admin-header-aside__metric admin-header-aside__metric--vertical">
        <PieChart
          percent={stats?.ordersPercent || 0}
          value={stats ? stats.newOrdersToday.toString() : '...'}
          color="#b8860b"
        />
        <p className="admin-header-aside__metric-label">{t('quickStats.newOrders')}</p>
      </div>
    </aside>
  );
}
