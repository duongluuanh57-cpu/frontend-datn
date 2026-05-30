'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { HomepageConfigData } from '@/hooks/homepage-config/types';
import {
  DEFAULT_SECTIONS,
  DEFAULT_PRODUCT_CARD_CONFIG,
  DEFAULT_BLOG_CARD_CONFIG,
  DEFAULT_PRODUCT_SESSION_LAYOUT,
  DEFAULT_NAVBAR_CONFIG,
  DEFAULT_FOOTER_CONFIG,
} from '@/hooks/homepage-config/constants';

const fetchHomepageConfig = async (): Promise<HomepageConfigData> => {
  try {
    const { data } = await api.get('/homepage-config');
    if (data.success && data.data) {
      return data.data;
    }
  } catch (err) {
    // Fallback to localStorage if API fails
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lessence_custom_homepage_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          sections: DEFAULT_SECTIONS,
          bannerImages: parsed.banners || [],
          bannerTitleVi: parsed.banner_title_vi || '',
          bannerSubtitleVi: parsed.banner_subtitle_vi || '',
          bannerLabelVi: parsed.banner_label_vi || '',
          bannerTitleEn: parsed.banner_title_en || '',
          bannerSubtitleEn: parsed.banner_subtitle_en || '',
          bannerLabelEn: parsed.banner_label_en || '',
          galleryVi: parsed.gallery || [],
          galleryEn: parsed.gallery_en || [],
          productCardConfig: DEFAULT_PRODUCT_CARD_CONFIG,
          blogCardConfig: DEFAULT_BLOG_CARD_CONFIG,
          productSessionLayout: DEFAULT_PRODUCT_SESSION_LAYOUT,
          navbar: DEFAULT_NAVBAR_CONFIG,
          footer: DEFAULT_FOOTER_CONFIG,
        };
      }
    }
  }

  // Fallback: default config
  return {
    sections: DEFAULT_SECTIONS,
    bannerImages: [],
    bannerTitleVi: '',
    bannerSubtitleVi: '',
    bannerLabelVi: '',
    bannerTitleEn: '',
    bannerSubtitleEn: '',
    bannerLabelEn: '',
    galleryVi: [],
    galleryEn: [],
    productCardConfig: DEFAULT_PRODUCT_CARD_CONFIG,
    blogCardConfig: DEFAULT_BLOG_CARD_CONFIG,
    productSessionLayout: DEFAULT_PRODUCT_SESSION_LAYOUT,
    navbar: DEFAULT_NAVBAR_CONFIG,
    footer: DEFAULT_FOOTER_CONFIG,
  };
};

export function useHomepageConfig() {
  return useQuery<HomepageConfigData>({
    queryKey: ['homepage-config'],
    queryFn: fetchHomepageConfig,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });
}

// Re-export all types for backward compatibility
export type {
  SectionConfig,
  GalleryImage,
  BlogCardConfig,
  ProductSessionConfig,
  ProductSessionLayoutConfig,
  NavLink,
  SpecialItemConfig,
  NavbarLayout,
  NavbarConfig,
  ProductCardConfig,
  FooterLinkItem,
  FooterColumn,
  SocialLink,
  FooterConfig,
  HomepageConfigData,
} from '@/hooks/homepage-config/types';

// Re-export all constants for backward compatibility
export {
  DEFAULT_SECTIONS,
  DEFAULT_PRODUCT_SESSION_LAYOUT,
  DEFAULT_BLOG_CARD_CONFIG,
  DEFAULT_NAVBAR_LAYOUT,
  DEFAULT_NAVBAR_CONFIG,
  DEFAULT_PRODUCT_CARD_CONFIG,
  DEFAULT_FOOTER_CONFIG,
} from '@/hooks/homepage-config/constants';
