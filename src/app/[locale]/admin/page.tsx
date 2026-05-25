'use client';

import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Sparkles,
  Users,
  ShoppingBag,
  ArrowUpRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Link } from '@/navigation';
import Image from 'next/image';

import { AdminGreetingHeader } from './components/AdminGreetingHeader';
import { AdminHeaderAside } from './components/AdminHeaderAside';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

export default function AdminDashboard() {
  const t = useTranslations('Admin.dashboard');
  const { totalProducts, lowStockCount, visitsToday } = useAdminDashboard();

  const statsList = [
    {
      name: t('stats.totalProducts'),
      value: totalProducts.toLocaleString(),
      change: t('stats.increase', { n: totalProducts }),
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
      value: lowStockCount.toLocaleString(),
      change: t('stats.needRestock'),
      icon: AlertTriangle,
      badgeVariant: 'warn' as const,
    },
    {
      name: t('stats.views'),
      value: visitsToday.toLocaleString(),
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
      image: '',
    },
    {
      name: 'Velvet Jasmine',
      meta: 'Classic • 100ml',
      price: '3.100.000₫',
      status: t('recentProducts.lowStock'),
      statusType: 'low' as const,
      image: '',
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
                    {product.image && <Image src={product.image} alt="" fill sizes="48px" />}
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
