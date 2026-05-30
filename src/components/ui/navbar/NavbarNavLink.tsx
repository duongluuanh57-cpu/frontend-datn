'use client';

import React from 'react';
import { Link, usePathname } from '@/navigation';
import { motion } from 'framer-motion';
import type { NavbarConfig } from '@/hooks/useHomepageConfig';
import { Home, Store, Library, BookOpen, HelpCircle } from 'lucide-react';

function getNavIcon(href: string, size: number) {
  const map: Record<string, React.ReactNode> = {
    '/': <Home size={size} strokeWidth={2} />,
    '/collections': <Store size={size} strokeWidth={2} />,
    '/bo-suu-tap': <Library size={size} strokeWidth={2} />,
    '/blog': <BookOpen size={size} strokeWidth={2} />,
    '/tro-giup': <HelpCircle size={size} strokeWidth={2} />,
  };
  return map[href] || <Store size={size} strokeWidth={2} />;
}

interface NavbarNavLinkProps {
  href: string;
  name: string;
  displayMode?: NavbarConfig['links'][number]['displayMode'];
  style?: NavbarConfig['style'];
}

export function NavbarNavLink({ href, name, displayMode, style }: NavbarNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const mode = displayMode || 'icon';
  const icon = getNavIcon(href, style?.iconSize || 26);

  return (
    <Link
      href={href as any}
      className="nav-link"
      style={{
        textDecoration: 'none',
        color: isActive ? (style?.accentColor || 'var(--primary)') : (style?.textColor || 'var(--content)'),
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: mode === 'icon-text' ? '6px' : '0px',
        padding: '8px',
        borderRadius: '10px',
        position: 'relative',
        whiteSpace: 'nowrap',
      }}
    >
      {(mode === 'icon' || mode === 'icon-text') && icon}
      {(mode === 'icon-text' || mode === 'text') && (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1, whiteSpace: 'nowrap' }}>
          {name}
        </span>
      )}
      {mode === 'icon' && !isActive && <span className="nav-tooltip">{name}</span>}
      {isActive && (
        <motion.div
          layoutId="activeNav"
          style={{
            position: 'absolute',
            bottom: '-4px',
            left: '20%',
            right: '20%',
            height: '2px',
            background: style?.accentColor || 'var(--primary)',
            borderRadius: '2px'
          }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}