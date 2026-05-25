'use client';

import { Link, usePathname, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Home, 
  Store, 
  Library, 
  BookOpen, 
  HelpCircle,
  ImagePlus,
  X,
  LogOut,
  LayoutDashboard,
  Settings
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { resolveImageUrl } from '@/lib/api';

export function Navbar() {
  const t = useTranslations('Navbar');
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.replace('/login');
  };

  const handleUserClick = (e: React.MouseEvent) => {
    if (isAuthenticated) {
      e.preventDefault();
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const navLinks = [
    { name: t('home'), href: '/', icon: <Home size={26} strokeWidth={2} /> },
    { name: t('shop'), href: '/collections', icon: <Store size={26} strokeWidth={2} /> },
    { name: t('collections'), href: '/bo-suu-tap', icon: <Library size={26} strokeWidth={2} /> },
    { name: t('blog'), href: '/blog', icon: <BookOpen size={26} strokeWidth={2} /> },
    { name: t('support'), href: '/tro-giup', icon: <HelpCircle size={26} strokeWidth={2} /> },
  ];

  const cartCount = 0;

  return (
    <nav 
      style={{
        width: '100%',
        padding: '1rem 2rem',
        background: '#FFF5F5',
        borderBottom: '1px solid var(--accent)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}
    >
      {/* Logo Area */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: '900', 
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <Image
            src="https://i.ibb.co/TxzQXcMT/original.png"
            alt="L'essence Logo"
            width={120}
            height={35}
            style={{
              objectFit: 'contain',
              filter: 'invert(79%) sepia(16%) saturate(601%) hue-rotate(315deg) brightness(91%) contrast(84%)'
            }}
          />
          <span style={{ letterSpacing: '0.05em' }}>L'essence</span>
        </div>
      </Link>

      {/* Navigation Icons Only */}
      <div style={{ 
        display: 'flex', 
        gap: '2.5rem', 
        alignItems: 'center'
      }}>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href as any}
              className="nav-link"
              style={{
                textDecoration: 'none',
                color: isActive ? 'var(--primary)' : 'var(--content)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                borderRadius: '10px',
                position: 'relative'
              }}
            >
              {link.icon}
              {!isActive && <span className="nav-tooltip">{link.name}</span>}
              {isActive && (
                <motion.div 
                  layoutId="activeNav"
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: '20%',
                    right: '20%',
                    height: '2px',
                    background: 'var(--primary)',
                    borderRadius: '2px'
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div 
          className={`search-container ${isSearchOpen ? 'active' : ''}`}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            position: 'relative',
            width: '40px', // Cố định chiều rộng container để không đẩy menu
            height: '40px',
            justifyContent: 'center'
          }}
        >
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder={t('searchPlaceholder')} 
            style={{
              position: 'absolute',
              right: 0, // Trượt từ phải sang trái
              width: isSearchOpen ? '300px' : '0',
              opacity: isSearchOpen ? 1 : 0,
              padding: isSearchOpen ? '10px 45px 10px 20px' : '0',
              border: isSearchOpen ? '1px solid var(--accent)' : 'none',
              outline: 'none',
              background: 'white',
              borderRadius: '25px',
              fontSize: '0.9rem',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              color: 'var(--content)',
              pointerEvents: isSearchOpen ? 'auto' : 'none',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              zIndex: 1
            }}
            onBlur={() => setIsSearchOpen(false)}
          />
          <button 
            className="nav-link" 
            onMouseDown={(e) => e.preventDefault()} // Ngăn chặn sự kiện blur của input xảy ra trước click
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: 'var(--content)', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2, // Luôn nằm trên input
              width: '100%',
              height: '100%',
              padding: 0
            }}
          >
            <Search size={26} strokeWidth={2} style={{ display: isSearchOpen ? 'none' : 'block' }} />
            <X size={26} strokeWidth={2} style={{ display: isSearchOpen ? 'block' : 'none' }} />
            {!isSearchOpen && <span className="nav-tooltip">{t('search')}</span>}
          </button>
        </div>

        {/* Giỏ hàng với Badge */}
        <button className="nav-link" style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          color: 'var(--content)', 
          display: 'flex', 
          alignItems: 'center',
          position: 'relative',
          padding: '4px'
        }}>
          <ShoppingBag size={26} strokeWidth={2} />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-4px',
            background: '#C08497',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: '900',
            minWidth: '18px',
            height: '18px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {cartCount}
          </span>
          <span className="nav-tooltip">{t('cart')}</span>
        </button>

        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <Link 
            href={isAuthenticated ? '/profile' : '/login'} 
            className="nav-link" 
            onClick={handleUserClick}
            style={{
              background: user?.avatar ? 'transparent' : 'var(--accent)', 
              color: 'white',
              textDecoration: 'none',
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(231, 184, 184, 0.4)',
              overflow: 'hidden',
              padding: 0,
              position: 'relative'
            }}
          >
            {user?.avatar ? (
              <Image
                src={resolveImageUrl(user.avatar)}
                alt={user.username || 'Avatar'}
                fill
                sizes="40px"
                style={{ objectFit: 'cover', borderRadius: '12px' }}
              />
            ) : (
              <User size={24} strokeWidth={2.5} />
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
                {/* User Info Header */}
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

                {/* Dropdown Menu Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <Link
                    href="/profile?tab=profile"
                    className="dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '10px',
                      color: 'var(--content)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      textDecoration: 'none'
                    }}
                  >
                    <User size={18} strokeWidth={2} style={{ color: 'var(--primary)' }} />
                    <span>{t('myProfile')}</span>
                  </Link>

                  <Link
                    href="/profile?tab=orders"
                    className="dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '10px',
                      color: 'var(--content)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      textDecoration: 'none'
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '10px',
                        color: 'var(--content)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        textDecoration: 'none'
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '10px',
                      color: 'var(--content)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      textDecoration: 'none'
                    }}
                  >
                    <Settings size={18} strokeWidth={2} style={{ color: 'var(--primary)' }} />
                    <span>{t('settings')}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '10px',
                      color: '#DC2626',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left'
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
      </div>
    </nav>
  );
}
