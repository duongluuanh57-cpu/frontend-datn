'use client';

import React, { Suspense } from 'react';
import { useRouter } from '@/navigation';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Search,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/useAuthStore';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AIChatPanel } from '@/components/admin/AIChatPanel';
import './admin.css';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const t = useTranslations('Admin');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMinimal = searchParams.get('minimal') === 'true' ||
    !pathname.match(/\/admin\/?$/) &&
    !pathname.match(/\/admin\/homepage/);

  const [isCollapsed, setIsCollapsed] = React.useState(isMinimal);
  const [showAIChat, setShowAIChat] = React.useState(false);
  const [authChecked, setAuthChecked] = React.useState(false);
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isMinimal) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [pathname, isMinimal]);

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
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        pathname={pathname}
        t={t}
        onLogout={handleLogout}
      />

      <main
        className={`admin-main ${isCollapsed ? 'admin-main--collapsed' : 'admin-main--expanded'} ${showAIChat ? 'admin-main--chat-open' : ''}`}
      >
        {!isMinimal && (
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
              <button
                type="button"
                onClick={() => {
                  setShowAIChat(true);
                  setIsCollapsed(true);
                }}
                className="admin-header__exit"
              >
                <span className="admin-header__exit-label">Hỗ trợ AI</span>
              </button>
            </div>
          </header>
        )}

        <div ref={contentRef} className="admin-content">{children}</div>
      </main>

      <AIChatPanel isOpen={showAIChat} onClose={() => { setShowAIChat(false); setIsCollapsed(false); }} />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
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
    }>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
