'use client';

import React, { Suspense } from 'react';
import { Link, useRouter } from '@/navigation';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sparkles,
  Search,
  User,
  Award,
  Tag as TagIcon,
  BarChart3,
  Activity,
  Image as ImageIcon,
  Newspaper,
  FileText,
  Ticket,
  Boxes,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import './admin.css';

interface AdminSidebarNavProps {
  isCollapsed: boolean;
  pathname: string;
  t: any;
}

function AdminSidebarNav({ isCollapsed, pathname, t }: AdminSidebarNavProps) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  const sections = [
    {
      title: pathname.includes('/vi') ? 'Tổng Quan' : 'Overview',
      items: [
        { name: t('nav.dashboard'), icon: LayoutDashboard, href: '/admin' },
        { 
          name: pathname.includes('/vi') ? 'Báo cáo & Thống kê' : 'Reports & Analytics', 
          icon: BarChart3, 
          href: '#',
          isPlaceholder: true 
        },
        { 
          name: pathname.includes('/vi') ? 'Nhật ký hoạt động' : 'Activity Log', 
          icon: Activity, 
          href: '#',
          isPlaceholder: true 
        },
      ]
    },
    {
      title: pathname.includes('/vi') ? 'Quản lý Nội dung' : 'Content Management',
      items: [
        { 
          name: pathname.includes('/vi') ? 'Cấu hình Trang chủ' : 'Homepage Config', 
          icon: Sparkles, 
          href: '/admin/homepage' 
        },
        { 
          name: pathname.includes('/vi') ? 'Banner & Quảng cáo' : 'Banners & Ads', 
          icon: ImageIcon, 
          href: '/admin/homepage?tab=banners' 
        },
        { 
          name: pathname.includes('/vi') ? 'Bài viết & Tin tức' : 'Articles & News', 
          icon: Newspaper, 
          href: '#',
          isPlaceholder: true 
        },
        { 
          name: pathname.includes('/vi') ? 'Các trang chính sách' : 'Policy Pages', 
          icon: FileText, 
          href: '#',
          isPlaceholder: true 
        },
      ]
    },
    {
      title: pathname.includes('/vi') ? 'Quản lý Cửa hàng' : 'Store Management',
      items: [
        { name: t('nav.products'), icon: Package, href: '/admin/products' },
        { name: t('nav.brands'), icon: Award, href: '/admin/brands' },
        { name: pathname.includes('/vi') ? 'Quản lý chung' : 'Centralized Management', icon: TagIcon, href: '/admin/taxonomy' },
        { name: t('nav.orders'), icon: ShoppingBag, href: '/admin/orders' },
        { 
          name: pathname.includes('/vi') ? 'Mã giảm giá' : 'Discount Codes', 
          icon: Ticket, 
          href: '/admin/vouchers',
        },
        { 
          name: pathname.includes('/vi') ? 'Quản lý Kho hàng' : 'Inventory Management', 
          icon: Boxes, 
          href: '#',
          isPlaceholder: true 
        },
      ]
    },
    {
      title: pathname.includes('/vi') ? 'Hệ thống' : 'System',
      items: [
        { name: t('nav.users'), icon: Users, href: '/admin/users' },
        { name: t('nav.settings'), icon: Settings, href: '/admin/settings' },
      ]
    }
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return /\/admin\/?$/.test(pathname);
    }
    
    // For specific sub-tabs
    if (href.includes('?tab=')) {
      const [path, tab] = href.split('?tab=');
      return pathname.includes(path) && currentTab === tab;
    }
    
    // For main pages that don't have tab or if it's homepage with no specific tab
    if (href === '/admin/homepage') {
      return pathname.includes(href) && (!currentTab || currentTab !== 'banners');
    }

    return pathname.includes(href);
  };

  return (
    <nav className="admin-sidebar__nav" style={{ gap: '16px' }}>
      {sections.map((section, idx) => (
        <div key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Divider between sections when collapsed */}
          {idx > 0 && isCollapsed && (
            <div 
              style={{
                height: '1px',
                background: 'var(--admin-border-subtle)',
                margin: '8px 14px',
              }}
            />
          )}

          {/* Section title when expanded */}
          {!isCollapsed && (
            <div
              style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--admin-text-muted)',
                padding: '12px 14px 6px',
                opacity: 0.8,
              }}
            >
              {section.title}
            </div>
          )}

          {section.items.map((item) => {
            const active = !item.isPlaceholder && isActive(item.href);

            const handlePlaceholderClick = (e: React.MouseEvent) => {
              e.preventDefault();
              toast.info(
                pathname.includes('/vi') 
                  ? 'Tính năng hiện đang được phát triển' 
                  : 'Feature is currently under development'
              );
            };

            if (item.isPlaceholder) {
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={handlePlaceholderClick}
                  className="contents"
                  style={{ border: 'none', background: 'transparent', width: '100%', padding: 0, textAlign: 'left' }}
                >
                  <span
                    className={`admin-nav-item ${isCollapsed ? 'admin-nav-item--collapsed' : ''}`}
                  >
                    <item.icon className="admin-nav-item__icon" strokeWidth={1.75} />
                    {!isCollapsed && <span>{item.name}</span>}
                    {isCollapsed && (
                      <span className="admin-nav-item__tooltip">{item.name}</span>
                    )}
                  </span>
                </button>
              );
            }

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
        </div>
      ))}
    </nav>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('Admin');
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [authChecked, setAuthChecked] = React.useState(false);
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  // Auth & Role Protection
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('access_token');
    const token = urlToken || localStorage.getItem('token');

    if (!token) {
      router.replace('/login');
      setAuthChecked(true);
      return;
    }

    if (urlToken) {
      localStorage.setItem('token', urlToken);
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'ADMIN' && payload.role !== 'SUBADMIN') {
        router.replace('/');
      }
    } catch (e) {
      if (!urlToken) router.replace('/login');
    }

    setAuthChecked(true);
  }, [router]);

  // Prevent flash: show loading until auth check completes
  if (!authChecked) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#FFF5F5',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f0e9e4',
            borderTopColor: '#D4A5A5',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside
        className={`admin-sidebar ${isCollapsed ? 'admin-sidebar--collapsed' : ''}`}
      >
        <div className="admin-sidebar__brand">
          {!isCollapsed && (
            <div>
              <div className="admin-sidebar__logo">L&apos;essence</div>
              <div className="admin-sidebar__tagline">Admin Studio</div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="admin-sidebar__toggle"
            aria-label={isCollapsed ? t('nav.toggleExpand') : t('nav.toggleCollapse')}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <Suspense fallback={
          <div className="admin-sidebar__nav-fallback" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px 14px' }}>
            <div className="animate-pulse bg-gray-200/20 h-6 w-3/4 rounded" />
            <div className="animate-pulse bg-gray-200/20 h-10 w-full rounded" />
            <div className="animate-pulse bg-gray-200/20 h-10 w-full rounded" />
          </div>
        }>
          <AdminSidebarNav isCollapsed={isCollapsed} pathname={pathname} t={t} />
        </Suspense>


        <div className="admin-sidebar__footer">
          <button
            type="button"
            onClick={handleLogout}
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
            <button type="button" onClick={handleLogout} className="admin-header__exit">
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
