'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import './banner.css';

// Subcomponents
import { BannerBackground } from './banner/BannerBackground';
import { EditableBannerLabel } from './banner/EditableBannerLabel';
import { BannerTitle } from './banner/BannerTitle';
import { BannerDescription } from './banner/BannerDescription';
import { BannerActions } from './banner/BannerActions';
import { ImageEditorModal } from './banner/ImageEditorModal';

// --- Configuration ---
const SLIDE_DURATION = 6000; // 6 seconds per slide
const DEFAULT_IMAGES = [
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

interface BannerProps {
  previewData?: {
    images: string[];
    title: string;
    subtitle: string;
    label?: string;
  };
  isPreview?: boolean;
  onTitleChange?: (val: string) => void;
  onSubtitleChange?: (val: string) => void;
  onLabelChange?: (val: string) => void;
  onImagesChange?: (index: number, url: string) => void;
}

export function Banner({ 
  previewData, 
  isPreview = false,
  onTitleChange,
  onSubtitleChange,
  onLabelChange,
  onImagesChange
}: BannerProps) {
  const t = useTranslations('Home');
  const locale = useLocale();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMaxWidth, setEditorMaxWidth] = useState<number | undefined>(1024);
  const [editorQuality, setEditorQuality] = useState<number | undefined>(80);

  // Dynamic customized data states
  const [images, setImages] = useState<string[]>(previewData ? previewData.images : DEFAULT_IMAGES);
  const [bannerTexts, setBannerTexts] = useState({
    title: '',
    subtitle: ''
  });
  const [bannerLabel, setBannerLabel] = useState('');

  // Load customizable homepage data from LocalStorage
  useEffect(() => {
    if (previewData) {
      setImages(previewData.images);
      if (previewData.label) setBannerLabel(previewData.label);
      return;
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lessence_custom_homepage_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.banners && Array.isArray(parsed.banners) && parsed.banners.length > 0) {
            setImages(parsed.banners);
          }
          const lang = locale === 'vi' ? 'vi' : 'en';
          const title = parsed[`banner_title_${lang}`];
          const subtitle = parsed[`banner_subtitle_${lang}`];
          setBannerTexts({
            title: title || '',
            subtitle: subtitle || ''
          });
          const label = parsed[`banner_label_${lang}`];
          setBannerLabel(label || '');
        } catch (e) {
          console.error('Error loading custom homepage config:', e);
        }
      }
    }
  }, [locale, previewData]);

  // Update images if previewData changes
  useEffect(() => {
    if (previewData) {
      setImages(previewData.images);
    }
  }, [previewData]);

  // Auto-slide effect
  useEffect(() => {
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [images]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": "L'essence",
    "description": "Premium Fragrance House",
    "url": "https://lessence.vn"
  };

  const displayTitle = bannerTexts.title || t('bannerTitle');
  const displaySubtitle = bannerTexts.subtitle || t('bannerSubtitle');
  const displayLabel = bannerLabel || (locale === 'vi' ? 'BST NƯỚC HOA CAO CẤP' : 'PREMIUM FRAGRANCE HOUSE');

  return (
    <section
      className={`relative w-full overflow-hidden bg-[#FFF5F5] ${
        isPreview ? 'h-[320px] sm:h-[380px] md:h-[450px]' : 'h-[calc(85vh-13px)]'
      }`}
      role="banner"
      aria-label="Hero Banner Slideshow"
    >
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Quick-edit overlay for images (shown on hover) */}
      {isPreview && (
        <div className="absolute inset-0 z-20 flex items-start justify-start pointer-events-none">
          <button
            onClick={() => setIsEditorOpen(true)}
            className="pointer-events-auto m-4 px-3 py-1.5 rounded-md bg-[#7A5C5C]/80 text-white text-xs shadow"
            aria-label="Edit slides"
          >
            Chỉnh sửa ảnh
          </button>
        </div>
      )}

      {/* Slide Background */}
      {images.length > 0 && (
        <BannerBackground
          images={images}
          currentImageIndex={currentImageIndex}
          altText={t('bannerAlt')}
        />
      )}

      {/* Morphing ambient color blobs behind the glass card for refraction aesthetics */}
      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />

      {/* Content wrapper with floating Glassmorphic panel */}
      <div className="absolute inset-0 z-10 flex items-center justify-center md:justify-end px-6 md:px-16 lg:px-24">
        <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-10">

          {/* Glass Card Container */}
          <motion.div
            className={`banner-glass banner-floating flex flex-col items-center md:items-end text-center md:text-right ${
              isPreview 
                ? 'max-w-[85vw] sm:max-w-[380px] md:max-w-[460px] lg:max-w-[500px] gap-3 md:gap-4 p-4 sm:p-6 md:p-8'
                : 'max-w-[92vw] sm:max-w-[480px] md:max-w-[540px] lg:max-w-[620px] gap-4 md:gap-5 p-6 sm:p-8 md:p-10 lg:p-12'
            }`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            aria-live="polite"
          >
            <EditableBannerLabel isPreview={isPreview} onChange={(v) => {
              setBannerLabel(v);
              onLabelChange?.(v);
            }}>
              {displayLabel}
            </EditableBannerLabel>
            
            <BannerTitle isPreview={isPreview} onChange={onTitleChange}>
              {displayTitle}
            </BannerTitle>
            
            <BannerDescription isPreview={isPreview} onChange={onSubtitleChange}>
              {displaySubtitle}
            </BannerDescription>
            
            <BannerActions isPreview={isPreview} />
          </motion.div>

          {/* Slide Indicators - Translucent Dots */}
          <div
            className="flex md:flex-col gap-4 py-2"
            aria-label={t('goToSlide', { n: '' })}
          >
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                aria-label={t('goToSlide', { n: i + 1 })}
                aria-pressed={i === currentImageIndex}
                className={`banner-indicator ${i === currentImageIndex ? 'active' : ''}`}
              />
            ))}
          </div>
          
          {isEditorOpen && (
            <ImageEditorModal
              images={images}
              onClose={() => setIsEditorOpen(false)}
              onChangeImage={(index, url) => {
                const next = [...images];
                next[index] = url;
                setImages(next);
                onImagesChange?.(index, url);
              }}
              maxWidth={editorMaxWidth}
              quality={editorQuality}
              setMaxWidth={setEditorMaxWidth}
              setQuality={setEditorQuality}
            />
          )}

        </div>
      </div>
    </section>
  );
}
