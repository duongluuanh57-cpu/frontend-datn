'use client';

import React from 'react';
import { Link } from '@/navigation';
import Image from 'next/image';
import type { NavbarConfig } from '@/hooks/useHomepageConfig';

interface NavbarLogoProps {
  logo?: NavbarConfig['logo'];
  style?: NavbarConfig['style'];
}

export function NavbarLogo({ logo, style }: NavbarLogoProps) {
  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <div style={{
        fontSize: '1.5rem',
        fontWeight: '900',
        color: style?.textColor || 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem'
      }}>
        <div style={{ width: (logo?.width || 120), height: (logo?.height || 35), position: 'relative' }}>
          <Image
            src={logo?.image || "/pointer.png"}
            alt="L'essence Logo"
            fill
            sizes="120px"
            style={{
              objectFit: 'contain',
              filter: 'invert(79%) sepia(16%) saturate(601%) hue-rotate(315deg) brightness(91%) contrast(84%)'
            }}
          />
        </div>
        <span style={{ letterSpacing: '0.05em' }}>{logo?.text || "L'essence"}</span>
      </div>
    </Link>
  );
}