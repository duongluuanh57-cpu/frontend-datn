'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import posthog from 'posthog-js';
import './banner.css';

// --- Configuration ---
const SLIDE_DURATION = 6000; // 6 seconds per slide
const IMAGES = [
  "/images/banner-1.webp",
  "/images/banner-2.webp",
  "/images/banner-3.webp",
  "/images/banner-4.webp"
];

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 70,
      damping: 15,
      staggerChildren: 0.15,
      delayChildren: 0.3,
    } as any,
  },
};

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

// --- Sub-components ---

const BannerBackground = ({ currentImageIndex, altText }: { currentImageIndex: number; altText: string }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {IMAGES.map((image, index) => {
        const isActive = index === currentImageIndex;
        return (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-[1500ms] cubic-bezier(0.16, 1, 0.3, 1) ${
              isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-103 pointer-events-none'
            }`}
            style={{
              zIndex: isActive ? 1 : 0,
            }}
          >
            <Image
              src={image}
              alt={`${altText} - Slide ${index + 1}`}
              fill
              priority={index === 0}
              quality={75}
              sizes="100vw"
              className="object-cover"
            />
            {/* Subtle gradient vignette to blend edges softly without blocking the image details */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-[#FFF5F5]/10 to-[#FFF5F5]/45 z-10" />
          </div>
        );
      })}
    </div>
  );
};

const BannerLabel = ({ children }: { children: React.ReactNode }) => (
  <motion.div variants={itemVariants}>
    <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#C08497] md:text-xs">
      {children}
    </span>
  </motion.div>
);

const BannerTitle = ({ children }: { children: React.ReactNode }) => (
  <motion.div variants={itemVariants}>
    <h1 className="banner-title text-3xl font-medium leading-[1.2] text-[#7A5C5C] md:text-4xl lg:text-5xl">
      {children}
    </h1>
  </motion.div>
);

const BannerDescription = ({ children }: { children: React.ReactNode }) => (
  <motion.div variants={itemVariants}>
    <p className="banner-description max-w-xl text-sm leading-[1.8] text-[#7A5C5C]/90 md:text-base">
      {children}
    </p>
  </motion.div>
);

const BannerActions = () => {
  const t = useTranslations('Home');
  const [isHovered, setIsHovered] = useState(false);

  const handleCtaClick = () => {
    posthog.capture('banner_cta_clicked', {
      destination: '/collections',
      banner_version: 'Elite_Liquid_Glass_v2'
    });
  };

  return (
    <motion.div
      variants={itemVariants}
      className="mt-6 flex flex-col items-center md:items-end gap-6 md:flex-row md:items-center md:gap-8"
    >
      <Link
        href="/collections"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCtaClick}
        aria-label={t('bannerCta')}
        className="banner-cta group relative flex h-13 w-56 items-center justify-center overflow-hidden rounded-full border border-white/40 bg-white/70 backdrop-blur-md shadow-md hover:shadow-xl transition-all duration-300"
      >
        {/* Iridescent shimmer effect inside button */}
        <span
          className="relative z-10 text-xs font-bold uppercase tracking-widest transition-colors duration-300 text-[#7A5C5C] group-hover:text-white"
        >
          {t('bannerCta')}
        </span>
        <div className="absolute inset-0 -z-10 translate-y-full bg-[#7A5C5C] transition-transform duration-500 ease-out group-hover:translate-y-0" />
      </Link>

      <Link
        href="/about"
        className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A5C5C] transition-all hover:text-[#C08497] hover:tracking-[0.25em] duration-300 focus:outline-none focus:underline"
        aria-label={t('aboutUs')}
      >
        {t('aboutUs')} &rarr;
      </Link>
    </motion.div>
  );
};

// --- Main Component ---

export function Banner() {
  const t = useTranslations('Home');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % IMAGES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": "L'essence",
    "description": "Premium Fragrance House",
    "url": "https://lessence.vn"
  };

  return (
    <section
      className="relative h-[calc(85vh+10px)] w-full overflow-hidden bg-[#FFF5F5]"
      role="banner"
      aria-label="Hero Banner Slideshow"
    >
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Slide Background */}
      <BannerBackground currentImageIndex={currentImageIndex} altText={t('bannerAlt')} />

      {/* Morphing ambient color blobs behind the glass card for refraction aesthetics */}
      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />

      {/* Content wrapper with floating Glassmorphic panel */}
      <div className="absolute inset-0 z-10 flex items-center justify-center md:justify-end px-6 md:px-16 lg:px-24">
        <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-10">
          
          {/* Glass Card Container */}
          <motion.div
            className="banner-glass banner-floating flex max-w-[92vw] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[580px] flex-col items-center md:items-end gap-5 p-8 sm:p-10 md:p-12 lg:p-14 text-center md:text-right"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            aria-live="polite"
          >
            <BannerLabel>{t('bannerTitle')}</BannerLabel>
            <BannerTitle>{t('bannerTitle')}</BannerTitle>
            <BannerDescription>{t('bannerSubtitle')}</BannerDescription>
            <BannerActions />
          </motion.div>

          {/* Slide Indicators - Translucent Dots */}
          <div 
            className="flex md:flex-col gap-4 py-2" 
            aria-label={t('goToSlide', { n: '' })}
          >
            {IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                aria-label={t('goToSlide', { n: i + 1 })}
                aria-pressed={i === currentImageIndex}
                className={`banner-indicator ${i === currentImageIndex ? 'active' : ''}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
