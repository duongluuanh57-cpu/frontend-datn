'use client';

import React from 'react';
import { Link } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { getNavSections } from './admin-sidebar/SidebarNavData';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pathname: string;
  t: any;
  onLogout: () => void;
}

function AdminSidebarNav({ isCollapsed, pathname, t }: { isCollapsed: boolean; pathname: string; t: any }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  const sections = getNavSections(pathname);

  const stripMinimal = (href: string) => href.replace('?minimal=true', '').replace('&minimal=true', '');

  const isActive = (href: string) => {
    const cleanHref = stripMinimal(href);
    if (cleanHref === '/admin') return /\/admin\/?$/.test(pathname);
    if (cleanHref.includes('?tab=')) {
      const [path, tab] = cleanHref.split('?tab=');
      return pathname.includes(path) && currentTab === tab;
    }
    if (cleanHref === '/admin/homepage') return pathname.includes(cleanHref) && (!currentTab || currentTab !== 'banners');
    return pathname.includes(cleanHref);
  };

  return (
    <nav className="admin-sidebar__nav" style={{ gap: '16px' }}>
      {sections.map((section, idx) => (
        <div key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {idx > 0 && <div className={`admin-sidebar__separator ${isCollapsed ? 'admin-sidebar__separator--show' : ''}`} />}
          <div className={`admin-sidebar__section-title ${isCollapsed ? 'admin-sidebar__section-title--hidden' : ''}`}>{section.title}</div>
          {section.items.map((item) => {
            const active = !item.isPlaceholder && isActive(item.href);
            const content = (
              <>
                <div className="admin-nav-item__hover-bg" />
                <item.icon className="admin-nav-item__icon" strokeWidth={1.75} />
                <span className="admin-nav-item__label">{item.name}</span>
              </>
            );
            if (item.isPlaceholder) {
              return (
                <button key={item.name} type="button" onClick={(e) => { e.preventDefault(); toast.info(pathname.includes('/vi') ? 'Tính năng đang phát triển' : 'Feature under development'); }} className="contents" style={{ border: 'none', background: 'transparent', width: '100%', padding: 0, textAlign: 'left' }}>
                  <span className={`admin-nav-item ${isCollapsed ? 'admin-nav-item--collapsed' : ''}`}>{content}</span>
                </button>
              );
            }
            return (
              <Link key={item.name} href={item.href} className="contents">
                <span className={`admin-nav-item ${active ? 'admin-nav-item--active' : ''} ${isCollapsed ? 'admin-nav-item--collapsed' : ''}`}>{content}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function AdminSidebar({ isCollapsed, onToggleCollapse, pathname, t, onLogout }: AdminSidebarProps) {
  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'admin-sidebar--collapsed' : ''}`}>
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__brand-text">
          <div className="admin-sidebar__logo">L'essence</div>
          <div className="admin-sidebar__tagline">Admin Studio</div>
        </div>
        <button type="button" onClick={onToggleCollapse} className="admin-sidebar__toggle" aria-label={isCollapsed ? t('nav.toggleExpand') : t('nav.toggleCollapse')}>
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <AdminSidebarNav isCollapsed={isCollapsed} pathname={pathname} t={t} />
      <div className="admin-sidebar__footer">
        <button type="button" onClick={onLogout} className={`admin-logout-btn ${isCollapsed ? 'admin-logout-btn--icon-only' : ''}`}>
          <LogOut size={18} />
          <span className="admin-logout-btn__label">{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
}