'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Link, usePathname, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { User, ShoppingBag, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { resolveImageUrl } from '@/lib/api';
import type { NavbarConfig } from '@/hooks/useHomepageConfig';
import { DEFAULT_NAVBAR_CONFIG } from '@/hooks/useHomepageConfig';

interface NavbarUserProps {
  user: any;
  isAuthenticated: boolean;
  logout: () => void;
  navbarConfig?: NavbarConfig | null;
  style?: NavbarConfig['style'];
}

export function NavbarUser({ user, isAuthenticated, logout, navbarConfig, style }: NavbarUserProps) {
  const t = useTranslations('Navbar');
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const uc = navbarConfig?.userConfig || DEFAULT_NAVBAR_CONFIG.userConfig;
  const mode = uc.displayMode || 'icon';

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Close dropdown when page changes
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [pathname]);

  const handleUserClick = (e: React.MouseEvent) => {
    if (isAuthenticated) {
      e.preventDefault();
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.replace('/login');
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <Link
        href={isAuthenticated ? '/profile' : '/login'}
        className="nav-link"
        onClick={handleUserClick}
        style={{
          background: user?.avatar ? 'transparent' : (style?.accentColor || 'var(--accent)'),
          color: 'white',
          textDecoration: 'none',
          width: mode === 'text' ? 'auto' : '42px',
          height: '42px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(231, 184, 184, 0.4)',
          overflow: 'hidden',
          padding: mode === 'text' ? '0 12px' : 0,
          position: 'relative',
          gap: '6px',
        }}
      >
        {mode !== 'text' && (
          user?.avatar ? (
            <Image
              src={resolveImageUrl(user.avatar)}
              alt={user.username || 'Avatar'}
              fill
              sizes="40px"
              style={{ objectFit: 'cover', borderRadius: '12px' }}
            />
          ) : (
            <User size={24} strokeWidth={2.5} />
          )
        )}
        {(mode === 'text' || mode === 'icon-text') && (
          <span style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', color: 'white' }}>
            {uc.label || t('account')}
          </span>
        )}
        {!isDropdownOpen && <span className="nav-tooltip">{t('account')}</span>}
      </Link>

      <AnimatePresence>
        {isDropdownOpen && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: 0,
              width: '280px',
              background: 'rgba(255, 245, 245, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--accent)',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(122, 92, 92, 0.15)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              zIndex: 1000
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(231, 184, 184, 0.5)' }}>
              <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)', flexShrink: 0 }}>
                {user?.avatar ? (
                  <Image
                    src={resolveImageUrl(user.avatar)}
                    alt={user.username}
                    fill
                    sizes="48px"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent)', color: 'white' }}>
                    <User size={20} strokeWidth={2} />
                  </div>
                )}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--content)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.username}
                </h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(122, 92, 92, 0.7)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.email}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <Link
                href="/profile?tab=profile"
                className="dropdown-item"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.8rem',
                  borderRadius: '10px', color: 'var(--content)', fontSize: '0.9rem', fontWeight: 500,
                  transition: 'all 0.2s ease', textDecoration: 'none'
                }}
              >
                <User size={18} strokeWidth={2} style={{ color: 'var(--primary)' }} />
                <span>{t('myProfile')}</span>
              </Link>
              <Link
                href="/profile?tab=orders"
                className="dropdown-item"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.8rem',
                  borderRadius: '10px', color: 'var(--content)', fontSize: '0.9rem', fontWeight: 500,
                  transition: 'all 0.2s ease', textDecoration: 'none'
                }}
              >
                <ShoppingBag size={18} strokeWidth={2} style={{ color: 'var(--primary)' }} />
                <span>{t('myOrders')}</span>
              </Link>
              {(user?.role === 'ADMIN' || user?.role === 'SUBADMIN') && (
                <Link
                  href="/admin"
                  className="dropdown-item"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.8rem',
                    borderRadius: '10px', color: 'var(--content)', fontSize: '0.9rem', fontWeight: 500,
                    transition: 'all 0.2s ease', textDecoration: 'none'
                  }}
                >
                  <LayoutDashboard size={18} strokeWidth={2} style={{ color: 'var(--primary)' }} />
                  <span>{t('dashboard')}</span>
                </Link>
              )}
              <Link
                href="/profile?tab=settings"
                className="dropdown-item"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.8rem',
                  borderRadius: '10px', color: 'var(--content)', fontSize: '0.9rem', fontWeight: 500,
                  transition: 'all 0.2s ease', textDecoration: 'none'
                }}
              >
                <Settings size={18} strokeWidth={2} style={{ color: 'var(--primary)' }} />
                <span>{t('settings')}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="dropdown-item"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.8rem',
                  borderRadius: '10px', color: '#DC2626', fontSize: '0.9rem', fontWeight: 500,
                  transition: 'all 0.2s ease', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left'
                }}
              >
                <LogOut size={18} strokeWidth={2} style={{ color: '#DC2626' }} />
                <span>{t('logout')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}