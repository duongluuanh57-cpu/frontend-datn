'use client';

import React from 'react';
import { Link } from '@/navigation';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Sparkles,
  Search,
  User,
  Award,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import './admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('Admin');
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const menuItems = [
    { name: t('nav.dashboard'), icon: LayoutDashboard, href: '/admin' },
    { name: t('nav.products'), icon: Package, href: '/admin/products' },
    { name: t('nav.brands'), icon: Award, href: '/admin/brands' },
    { name: t('nav.orders'), icon: ShoppingBag, href: '/admin/orders' },
    { name: t('nav.users'), icon: Users, href: '/admin/users' },
    { name: t('nav.settings'), icon: Settings, href: '/admin/settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return /\/admin\/?$/.test(pathname);
    }
    return pathname.includes(href);
  };

  return (
    <div className="admin-shell">
      <aside
        className={`admin-sidebar ${isCollapsed ? 'admin-sidebar--collapsed' : ''}`}
      >
        <div className="admin-sidebar__brand">
          {!isCollapsed ? (
            <div>
              <div className="admin-sidebar__logo">L&apos;essence</div>
              <div className="admin-sidebar__tagline">Admin Studio</div>
            </div>
          ) : (
            <div className="admin-sidebar__logo-mark">
              <Sparkles size={18} />
            </div>
          )}

          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="admin-sidebar__toggle"
              aria-label={t('nav.toggleCollapse')}
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {isCollapsed && (
          <div
            style={{
              padding: '8px 0',
              display: 'flex',
              justifyContent: 'center',
              borderBottom: '1px solid var(--admin-border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="admin-sidebar__toggle"
              aria-label={t('nav.toggleExpand')}
            >
              <Menu size={18} />
            </button>
          </div>
        )}

        <nav className="admin-sidebar__nav">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.name} href={item.href} className="contents">
                <span
                  className={`admin-nav-item ${active ? 'admin-nav-item--active' : ''} ${isCollapsed ? 'admin-nav-item--collapsed' : ''}`}
                >
                  <item.icon className="admin-nav-item__icon" strokeWidth={1.75} />
                  {!isCollapsed && <span>{item.name}</span>}
                  {isCollapsed && (
                    <span className="admin-nav-item__tooltip">{item.name}</span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <button
            type="button"
            className={`admin-logout-btn ${isCollapsed ? 'admin-logout-btn--icon-only' : ''}`}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>{t('nav.logout')}</span>}
          </button>
        </div>
      </aside>

      <main
        className={`admin-main ${isCollapsed ? 'admin-main--collapsed' : 'admin-main--expanded'}`}
      >
        <header className="admin-header">
          <div className="admin-header__brand">
            <span className="admin-header__status-dot" />
            <span>L&apos;essence</span>
          </div>

          <label className="admin-search">
            <Search className="admin-search__icon" strokeWidth={1.5} />
            <input
              type="search"
              placeholder={t('header.searchPlaceholder')}
              className="admin-search__input"
            />
            <span className="admin-search__kbd">
              <span>⌘</span>
              <span>K</span>
            </span>
          </label>

          <div className="admin-header__actions">
            <div className="admin-header__user">
              <p className="admin-header__user-name">Administrator</p>
              <p className="admin-header__user-role">{t('header.role')}</p>
            </div>
            <button type="button" className="admin-header__avatar" aria-label={t('header.account')}>
              <User size={18} />
            </button>
            <span className="admin-header__divider" />
            <button type="button" className="admin-header__exit">
              <LogOut size={16} />
              <span className="admin-header__exit-label">{t('nav.exit')}</span>
            </button>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
