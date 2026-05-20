'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import posthog from 'posthog-js';

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    } as any,
  },
};

interface BannerActionsProps {
  isPreview?: boolean;
}

export function BannerActions({ isPreview = false }: BannerActionsProps) {
  const t = useTranslations('Home');
  const [isHovered, setIsHovered] = useState(false);

  const handleCtaClick = (e: React.MouseEvent) => {
    if (isPreview) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    posthog.capture('banner_cta_clicked', {
      destination: '/collections',
      banner_version: 'Elite_Liquid_Glass_v2'
    });
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`flex flex-row items-center justify-center md:justify-end ${
        isPreview ? 'mt-2 gap-4 md:gap-5' : 'mt-4 gap-6 md:gap-8'
      }`}
    >
      <Link
        href="/collections"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCtaClick}
        aria-label={t('bannerCta')}
        className={`banner-cta group relative flex items-center justify-center overflow-hidden rounded-full border border-white/40 bg-white/70 backdrop-blur-md shadow-md hover:shadow-xl transition-all duration-300 ${
          isPreview ? 'h-8 w-32' : 'h-10 w-44'
        }`}
      >
        {/* Iridescent shimmer effect inside button */}
        <span
          className={`relative z-10 font-bold uppercase tracking-widest transition-colors duration-300 text-[#7A5C5C] group-hover:text-white ${
            isPreview ? 'text-[8px] md:text-[9px]' : 'text-[10px] md:text-xs'
          }`}
        >
          {t('bannerCta')}
        </span>
        <div className="absolute inset-0 -z-10 translate-y-full bg-[#7A5C5C] transition-transform duration-500 ease-out group-hover:translate-y-0" />
      </Link>

      <Link
        href="/about"
        onClick={(e) => {
          if (isPreview) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className={`font-bold uppercase tracking-[0.2em] text-[#7A5C5C] transition-all hover:text-[#C08497] hover:tracking-[0.25em] duration-300 focus:outline-none focus:underline ${
          isPreview ? 'text-[9px] md:text-[10px]' : 'text-[11px]'
        }`}
        aria-label={t('aboutUs')}
      >
        {t('aboutUs')} &rarr;
      </Link>
    </motion.div>
  );
}
