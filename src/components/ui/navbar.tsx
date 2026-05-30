'use client';

import { Link, usePathname, useRouter } from '@/navigation';
import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useHomepageConfig, DEFAULT_NAVBAR_LAYOUT, DEFAULT_NAVBAR_CONFIG } from '@/hooks/useHomepageConfig';
import { NavbarLogo } from '@/components/ui/navbar/NavbarLogo';
import { NavbarNavLink } from '@/components/ui/navbar/NavbarNavLink';
import { NavbarSearch } from '@/components/ui/navbar/NavbarSearch';
import { NavbarCart } from '@/components/ui/navbar/NavbarCart';
import { NavbarUser } from '@/components/ui/navbar/NavbarUser';

type ZoneId = 'left' | 'center' | 'right';
const zoneIds: ZoneId[] = ['left', 'center', 'right'];
const zoneJustify: Record<ZoneId, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { data: homepageConfig } = useHomepageConfig();
  const navbarConfig = homepageConfig?.navbar;
  const cfg = navbarConfig;
  const style = cfg?.style;
  const layout = cfg?.layout ?? DEFAULT_NAVBAR_LAYOUT;
  const cartCount = 0;

  // Map an item id from layout to its rendered JSX
  const renderLayoutItem = (id: string): React.ReactNode | null => {
    if (id === 'logo') return <NavbarLogo logo={cfg?.logo} style={style} />;
    const match = id.match(/^link-(\d+)$/);
    if (match) {
      const idx = parseInt(match[1]);
      const link = navbarConfig?.links?.[idx];
      if (!link || !link.enabled) return null;
      return <NavbarNavLink href={link.href} name={link.label} displayMode={link.displayMode} style={style} />;
    }
    if (id === 'search') return <NavbarSearch navbarConfig={navbarConfig} style={style} />;
    if (id === 'cart') return <NavbarCart navbarConfig={navbarConfig} style={style} cartCount={cartCount} />;
    if (id === 'user') return <NavbarUser user={user} isAuthenticated={isAuthenticated} logout={logout} navbarConfig={navbarConfig} style={style} />;
    return null;
  };

  return (
    <nav
      style={{
        width: '100%',
        padding: '1rem 2rem',
        background: style?.background || '#FFF5F5',
        borderBottom: `1px solid ${style?.accentColor || 'var(--accent)'}`,
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}
    >
      {zoneIds.map((zoneId) => (
        <div
          key={zoneId}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '2.5rem',
            justifyContent: zoneJustify[zoneId],
          }}
        >
          {(layout?.[zoneId] || []).map((itemId) => (
            <React.Fragment key={itemId}>
              {renderLayoutItem(itemId)}
            </React.Fragment>
          ))}
        </div>
      ))}
    </nav>
  );
}