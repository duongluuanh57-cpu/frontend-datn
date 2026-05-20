'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { useHomepageConfig } from '@/hooks/useHomepageConfig';

export interface IGalleryImage {
  url: string;
  aspect: string;
  title: string;
  quote: string;
}

export function useLuxuryGallery() {
  const locale = useLocale();
  const { data: config } = useHomepageConfig();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch images dynamically with DB data priority and fallback to localStorage
  const currentImages = useMemo<IGalleryImage[]>(() => {
    // 1. Check if DB config has valid images
    const dbGallery = locale === 'vi' ? config?.galleryVi : config?.galleryEn;
    const dbImages = (dbGallery ?? []).filter((img: any) => img && img.url && img.url.trim() !== '');
    if (dbImages.length > 0) {
      return dbImages as IGalleryImage[];
    }

    // 2. If DB is empty, fallback to localStorage (client-side only)
    if (mounted) {
      try {
        const saved = localStorage.getItem('lessence_custom_homepage_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          const localGallery = locale === 'vi' ? parsed.gallery : parsed.gallery_en;
          if (localGallery && Array.isArray(localGallery)) {
            return localGallery.filter((img: any) => img && img.url && img.url.trim() !== '') as IGalleryImage[];
          }
        }
      } catch {}
    }
    return [];
  }, [locale, config?.galleryVi, config?.galleryEn, mounted]);

  // Lightbox Modal states
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Prevent background scrolling when Lightbox is open
  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('lightbox-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('lightbox-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('lightbox-open');
    };
  }, [selectedImageIndex]);

  const handlePrev = () => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return prev === 0 ? currentImages.length - 1 : prev - 1;
    });
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return prev === currentImages.length - 1 ? 0 : prev + 1;
    });
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'Escape') setSelectedImageIndex(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, currentImages.length]);

  return {
    locale,
    mounted,
    currentImages,
    selectedImageIndex,
    setSelectedImageIndex,
    handlePrev,
    handleNext,
  };
}
