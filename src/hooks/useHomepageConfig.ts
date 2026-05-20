'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface SectionConfig {
  id: string;
  enabled: boolean;
  order: number;
}

export interface GalleryImage {
  url: string;
  aspect: string;
  title: string;
  quote: string;
}

export interface HomepageConfigData {
  _id?: string;
  tenantId?: string;
  sections: SectionConfig[];
  bannerImages: string[];
  bannerTitleVi: string;
  bannerSubtitleVi: string;
  bannerLabelVi: string;
  bannerTitleEn: string;
  bannerSubtitleEn: string;
  bannerLabelEn: string;
  galleryVi: GalleryImage[];
  galleryEn: GalleryImage[];
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'banner', enabled: true, order: 0 },
  { id: 'brandsMarquee', enabled: true, order: 1 },
  { id: 'saleProducts', enabled: true, order: 2 },
  { id: 'newProducts', enabled: true, order: 3 },
  { id: 'brandUsp', enabled: true, order: 4 },
  { id: 'luxuryGallery', enabled: true, order: 5 },
  { id: 'blogPosts', enabled: true, order: 6 }
];

const fetchHomepageConfig = async (): Promise<HomepageConfigData> => {
  try {
    const { data } = await api.get('/homepage-config');
    if (data.success && data.data) {
      return data.data;
    }
  } catch (err) {
    // Fallback đến localStorage nếu API lỗi (offline, cold start)
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
          galleryEn: parsed.gallery_en || []
        };
      }
    }
  }

  // Fallback: trả về config mặc định
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
    galleryEn: []
  };
};

export function useHomepageConfig() {
  return useQuery<HomepageConfigData>({
    queryKey: ['homepage-config'],
    queryFn: fetchHomepageConfig,
    staleTime: 1000 * 60 * 5, // 5 phút cache
    refetchOnWindowFocus: false
  });
}
