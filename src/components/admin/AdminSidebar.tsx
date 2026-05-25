'use client';

import React from 'react';
import { Link } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
  Activity,
  Image as ImageIcon,
  Newspaper,
  FileText,
  Ticket,
  Boxes,
  Award,
  Tag as TagIcon,
} from 'lucide-react';
import { toast } from 'sonner';

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
          href: '/admin/homepage?minimal=true' 
        },
        { 
          name: pathname.includes('/vi') ? 'Banner & Quảng cáo' : 'Banners & Ads', 
          icon: ImageIcon, 
          href: '/admin/homepage?tab=banners&minimal=true' 
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
        { name: t('nav.products'), icon: Package, href: '/admin/products?minimal=true' },
        { name: t('nav.brands'), icon: Award, href: '/admin/brands?minimal=true' },
        { name: pathname.includes('/vi') ? 'Quản lý chung' : 'Centralized Management', icon: TagIcon, href: '/admin/taxonomy?minimal=true' },
        { name: t('nav.orders'), icon: ShoppingBag, href: '/admin/orders?minimal=true' },
        { 
          name: pathname.includes('/vi') ? 'Mã giảm giá' : 'Discount Codes', 
          icon: Ticket, 
          href: '/admin/vouchers?minimal=true',
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
        { name: t('nav.users'), icon: Users, href: '/admin/users?minimal=true' },
        { name: t('nav.settings'), icon: Settings, href: '/admin/settings?minimal=true' },
      ]
    }
  ];

  const stripMinimal = (href: string) =>
    href.replace('?minimal=true', '').replace('&minimal=true', '');

  const isActive = (href: string) => {
    const cleanHref = stripMinimal(href);

    if (cleanHref === '/admin') {
      return /\/admin\/?$/.test(pathname);
    }

    if (cleanHref.includes('?tab=')) {
      const [path, tab] = cleanHref.split('?tab=');
      return pathname.includes(path) && currentTab === tab;
    }

    if (cleanHref === '/admin/homepage') {
      return pathname.includes(cleanHref) && (!currentTab || currentTab !== 'banners');
    }

    return pathname.includes(cleanHref);
  };

  const handlePlaceholderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info(
      pathname.includes('/vi') 
        ? 'Tính năng hiện đang được phát triển' 
        : 'Feature is currently under development'
    );
  };

  return (
    <nav className="admin-sidebar__nav" style={{ gap: '16px' }}>
      {sections.map((section, idx) => (
        <div key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {idx > 0 && <div className={`admin-sidebar__separator ${isCollapsed ? 'admin-sidebar__separator--show' : ''}`} />}

          <div className={`admin-sidebar__section-title ${isCollapsed ? 'admin-sidebar__section-title--hidden' : ''}`}>
            {section.title}
          </div>

          {section.items.map((item) => {
            const active = !item.isPlaceholder && isActive(item.href);

            const navItemContent = (
              <>
                <div className="admin-nav-item__hover-bg" />
                <item.icon className="admin-nav-item__icon" strokeWidth={1.75} />
                <span className="admin-nav-item__label">{item.name}</span>
              </>
            );

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
                    {navItemContent}
                  </span>
                </button>
              );
            }

            return (
              <Link key={item.name} href={item.href} className="contents">
                <span
                  className={`admin-nav-item ${active ? 'admin-nav-item--active' : ''} ${isCollapsed ? 'admin-nav-item--collapsed' : ''}`}
                >
                  {navItemContent}
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pathname: string;
  t: any;
  onLogout: () => void;
}

export function AdminSidebar({
  isCollapsed,
  onToggleCollapse,
  pathname,
  t,
  onLogout,
}: AdminSidebarProps) {
  return (
    <aside
      className={`admin-sidebar ${isCollapsed ? 'admin-sidebar--collapsed' : ''}`}
    >
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__brand-text">
          <div className="admin-sidebar__logo">L'essence</div>
          <div className="admin-sidebar__tagline">Admin Studio</div>
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="admin-sidebar__toggle"
          aria-label={isCollapsed ? t('nav.toggleExpand') : t('nav.toggleCollapse')}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <AdminSidebarNav isCollapsed={isCollapsed} pathname={pathname} t={t} />

      <div className="admin-sidebar__footer">
        <button
          type="button"
          onClick={onLogout}
          className={`admin-logout-btn ${isCollapsed ? 'admin-logout-btn--icon-only' : ''}`}
        >
          <LogOut size={18} />
          <span className="admin-logout-btn__label">{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
}