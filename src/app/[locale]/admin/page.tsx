'use client';

import { useEffect, useState } from 'react';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Sparkles,
  Activity,
  ShoppingBag,
  Star,
  Users,
  Eye,
} from 'lucide-react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

import api from '@/lib/api';

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

function AdminGreetingHeader() {
  const t = useTranslations('Admin.dashboard');
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) {
    return (
      <div className="admin-page-header__greeting">
        <h1 className="admin-page-header__title">{t('greeting', { timeOfDay: '...' })}</h1>
        <p className="admin-page-header__clock">--:--:--</p>
      </div>
    );
  }

  const hour = now.getHours();
  let timeOfDayKey = 'morning';
  if (hour >= 11 && hour < 13) timeOfDayKey = 'noon';
  else if (hour >= 13 && hour < 18) timeOfDayKey = 'afternoon';
  else if (hour >= 18 && hour < 22) timeOfDayKey = 'evening';
  else if (hour >= 22 || hour < 5) timeOfDayKey = 'night';

  const timeText = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const dateText = now.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="admin-page-header__greeting">
      <h1 className="admin-page-header__title">
        {t('greeting', { timeOfDay: t(`timeOfDay.${timeOfDayKey}`) })}
      </h1>
      <p className="admin-page-header__clock" aria-live="polite">
        {timeText}
      </p>
      <p className="admin-page-header__date">{dateText}</p>
    </div>
  );
}

function AdminHeaderAside() {
  const t = useTranslations('Admin.dashboard');
  const [stats, setStats] = useState<{
    revenueToday: number;
    newOrdersToday: number;
    visitsToday: number;
    revenuePercent: number;
    ordersPercent: number;
    visitsPercent: number;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

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

export default function AdminDashboard() {
  const t = useTranslations('Admin.dashboard');

  const statsList = [
    {
      name: t('stats.totalProducts'),
      value: '5',
      change: t('stats.increase', { n: 2 }),
      icon: Package,
      badgeVariant: 'default' as const,
    },
    {
      name: t('stats.inventoryValue'),
      value: '12.400.000₫',
      change: '+15.2%',
      icon: DollarSign,
      badgeVariant: 'default' as const,
    },
    {
      name: t('stats.lowStock'),
      value: '2',
      change: t('stats.needRestock'),
      icon: AlertTriangle,
      badgeVariant: 'warn' as const,
    },
    {
      name: t('stats.views'),
      value: '1,284',
      change: '+42%',
      icon: TrendingUp,
      badgeVariant: 'default' as const,
    },
  ];

  const recentProductsList = [
    {
      name: 'Midnight Rose',
      meta: 'Luxury Perfume • 100ml',
      price: '2.450.000₫',
      status: t('recentProducts.active'),
      statusType: 'ok' as const,
      image: 'https://i.ibb.co/3yxq0RjX/perfume1.webp',
    },
    {
      name: 'Velvet Jasmine',
      meta: 'Classic • 100ml',
      price: '3.100.000₫',
      status: t('recentProducts.lowStock'),
      statusType: 'low' as const,
      image: 'https://i.ibb.co/C3Y4Vv7Y/perfume2.webp',
    },
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-page-header admin-page-header--dashboard">
        <AdminGreetingHeader />
        <AdminHeaderAside />
      </header>

      <section className="admin-stats" aria-label="General statistics">
        {statsList.map((stat) => (
          <article key={stat.name} className="admin-stat-card">
            <div className="admin-stat-card__top">
              <div className="admin-stat-card__icon">
                <stat.icon size={22} strokeWidth={1.5} />
              </div>
              <span
                className={`admin-stat-card__badge ${stat.badgeVariant === 'warn' ? 'admin-stat-card__badge--warn' : ''}`}
              >
                {stat.change}
              </span>
            </div>
            <p className="admin-stat-card__label">{stat.name}</p>
            <p className="admin-stat-card__value">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="admin-dashboard-grid">
        <div className="admin-panel">
          <div className="admin-panel__head">
            <h2 className="admin-panel__title">{t('recentProducts.title')}</h2>
            <Link href="/admin/products" className="admin-panel__link">
              {t('recentProducts.viewAll')}
            </Link>
          </div>
          <div>
            {recentProductsList.map((product) => (
              <div key={product.name} className="admin-product-row">
                <div className="admin-product-row__left">
                  <div className="admin-product-row__thumb">
                    {product.image && <img src={product.image} alt="" />}
                  </div>
                  <div>
                    <p className="admin-product-row__name">{product.name}</p>
                    <p className="admin-product-row__meta">{product.meta}</p>
                  </div>
                </div>
                <div>
                  <p className="admin-product-row__price">{product.price}</p>
                  <p
                    className={`admin-product-row__status admin-product-row__status--${product.statusType}`}
                  >
                    {product.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="admin-insight">
          <div className="admin-insight__icon">
            <Sparkles size={20} />
          </div>
          <h3 className="admin-insight__title">{t('insight.title')}</h3>
          <p className="admin-insight__text">
            {t('insight.text')}
          </p>
          <button type="button" className="admin-insight__cta">
            {t('insight.cta')}
          </button>
        </aside>
      </section>
    </div>
  );
}
