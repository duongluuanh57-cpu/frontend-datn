'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingBag } from 'lucide-react';
import type { NavbarConfig } from '@/hooks/useHomepageConfig';
import { DEFAULT_NAVBAR_CONFIG } from '@/hooks/useHomepageConfig';

interface NavbarCartProps {
  navbarConfig?: NavbarConfig | null;
  style?: NavbarConfig['style'];
  cartCount?: number;
}

export function NavbarCart({ navbarConfig, style, cartCount = 0 }: NavbarCartProps) {
  const t = useTranslations('Navbar');
  const cc = navbarConfig?.cartConfig || DEFAULT_NAVBAR_CONFIG.cartConfig;
  const mode = cc.displayMode || 'icon';

  return (
    <button className="nav-link" style={{
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--content)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      position: 'relative',
      padding: mode === 'text' ? '4px 8px' : '4px',
    }}>
      {mode !== 'text' && (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <ShoppingBag size={26} strokeWidth={2} />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-4px',
            background: style?.accentColor || '#C08497',
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
        </div>
      )}
      {(mode === 'text' || mode === 'icon-text') && (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: style?.textColor || 'var(--content)', whiteSpace: 'nowrap' }}>
          {cc.label || t('cart')}
        </span>
      )}
      <span className="nav-tooltip">{t('cart')}</span>
    </button>
  );
}