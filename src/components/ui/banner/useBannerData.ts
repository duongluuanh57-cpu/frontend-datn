'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useHomepageConfig } from '@/hooks/useHomepageConfig';

const SLIDE_DURATION = 6000;
const DEFAULT_IMAGES = [
  "/images/banner-1.webp",
  "/images/banner-2.webp",
  "/images/banner-3.webp",
  "/images/banner-4.webp"
];

export function useBannerData(previewData?: {
  images: string[];
  title: string;
  subtitle: string;
  label?: string;
}) {
  const locale = useLocale();
  const { data: config } = useHomepageConfig();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>(previewData ? previewData.images : DEFAULT_IMAGES);
  const [bannerTexts, setBannerTexts] = useState({ title: '', subtitle: '' });
  const [bannerLabel, setBannerLabel] = useState('');

  // Load from localStorage (legacy)
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
          setBannerTexts({ title: title || '', subtitle: subtitle || '' });
          const label = parsed[`banner_label_${lang}`];
          setBannerLabel(label || '');
        } catch (e) {
          console.error('Error loading custom homepage config:', e);
        }
      }
    }
  }, [locale, previewData]);

  // Load from API
  useEffect(() => {
    if (previewData || !config) return;
    const isVi = locale === 'vi';
    setImages(config.bannerImages?.length ? config.bannerImages : DEFAULT_IMAGES);
    setBannerTexts({
      title: isVi ? (config.bannerTitleVi || '') : (config.bannerTitleEn || ''),
      subtitle: isVi ? (config.bannerSubtitleVi || '') : (config.bannerSubtitleEn || '')
    });
    setBannerLabel(isVi ? (config.bannerLabelVi || '') : (config.bannerLabelEn || ''));
  }, [locale, previewData, config]);

  // Sync preview images
  useEffect(() => {
    if (previewData) setImages(previewData.images);
  }, [previewData]);

  // Auto-slide
  useEffect(() => {
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [images]);

  return {
    currentImageIndex, setCurrentImageIndex,
    images, setImages,
    bannerTexts, setBannerTexts,
    bannerLabel, setBannerLabel,
  };
}