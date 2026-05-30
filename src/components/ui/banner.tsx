'use client';

import React, { useState } from 'react';
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
import { useBannerData } from './banner/useBannerData';

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
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMaxWidth, setEditorMaxWidth] = useState<number | undefined>(1024);
  const [editorQuality, setEditorQuality] = useState<number | undefined>(80);

  const {
    currentImageIndex, setCurrentImageIndex,
    images, setImages,
    bannerTexts: { title, subtitle },
    bannerLabel, setBannerLabel,
  } = useBannerData(previewData);

  const displayTitle = title || t('bannerTitle');
  const displaySubtitle = subtitle || t('bannerSubtitle');
  const displayLabel = bannerLabel || (locale === 'vi' ? 'BST NƯỚC HOA CAO CẤP' : 'PREMIUM FRAGRANCE HOUSE');

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": "L'essence",
    "description": "Premium Fragrance House",
    "url": "https://lessence.vn"
  };

  return (
    <section
      className={`relative overflow-hidden bg-[#FFF5F5] ${
        isPreview ? 'w-full h-[320px] sm:h-[380px] md:h-[450px]' : 'w-[calc(100%-4rem)] mx-auto h-[calc(85vh-13px)]'
      }`}
      role="banner"
      aria-label="Hero Banner Slideshow"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Quick-edit overlay */}
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

      {images.length > 0 && (
        <BannerBackground
          images={images}
          currentImageIndex={currentImageIndex}
          altText={t('bannerAlt')}
        />
      )}

      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />

      <div className="absolute inset-0 z-10 flex items-center justify-center md:justify-end px-6 md:px-16 lg:px-24">
        <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-10">
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

          {/* Slide Indicators */}
          <div className="flex md:flex-col gap-4 py-2" aria-label={t('goToSlide', { n: '' })}>
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