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

export interface BlogCardConfig {
  imageAspect: 'landscape' | 'square' | 'portrait';
  imagePadding: number;
  cardRadius: number;
  categoryBadgeBg: string;
  categoryBadgeText: string;
  titleFontSize: number;
  excerptFontSize: number;
  textAlign: 'left' | 'center';
  elementOrder: string[];
  showCategory: boolean;
  showDate: boolean;
  showReadTime: boolean;
  showExcerpt: boolean;
  showReadMore: boolean;
}

export interface ProductSessionConfig {
  titleText: string;
  subtitleText: string;
  filterTag: string;
}

export interface ProductSessionLayoutConfig {
  layout: 'grid' | 'carousel';
  columnsDesktop: number;
  columnsMobile: number;
  rowsDesktop: number;
  rowsMobile: number;
  gap: number;
  titleFontSize: number;
  showTitle: boolean;
  showSubtitle: boolean;
  subtitleFontSize: number;
  showFilterBar: boolean;
  showViewAll: boolean;
  sectionTitleFontSize: number;
  showFilterBrand: boolean;
  showFilterScentGroup: boolean;
  showFilterConcentration: boolean;
  showFilterSegment: boolean;
  showFilterCapacity: boolean;
  showFilterPrice: boolean;
  showFilterSort: boolean;
  sessions: {
    saleProducts: ProductSessionConfig;
    newProducts: ProductSessionConfig;
    limitedProducts: ProductSessionConfig;
    trendingProducts: ProductSessionConfig;
  };
}

export const DEFAULT_PRODUCT_SESSION_LAYOUT: ProductSessionLayoutConfig = {
  layout: 'grid',
  columnsDesktop: 4,
  columnsMobile: 2,
  rowsDesktop: 2,
  rowsMobile: 3,
  gap: 20,
  titleFontSize: 14,
  showTitle: true,
  showSubtitle: true,
  subtitleFontSize: 13,
  showFilterBar: true,
  showViewAll: true,
  sectionTitleFontSize: 24,
  showFilterBrand: true,
  showFilterScentGroup: true,
  showFilterConcentration: true,
  showFilterSegment: true,
  showFilterCapacity: true,
  showFilterPrice: true,
  showFilterSort: true,
  sessions: {
    saleProducts: {
      titleText: 'Ưu đãi đặc biệt',
      subtitleText: 'Trải nghiệm những hương thơm Niche tinh tuyển với ưu đãi đặc quyền giới hạn.',
      filterTag: 'sale'
    },
    newProducts: {
      titleText: 'Sản phẩm mới',
      subtitleText: 'Khám phá những kiệt tác mùi hương mới nhất vừa cập bến bộ sưu tập L\'essence.',
      filterTag: 'new'
    },
    limitedProducts: {
      titleText: 'Sản phẩm giới hạn',
      subtitleText: 'Khám phá những dòng hương giới hạn được chọn lọc cho bộ sưu tập riêng, số lượng ít và tinh tế.',
      filterTag: 'limited'
    },
    trendingProducts: {
      titleText: 'Sản phẩm thịnh hành',
      subtitleText: 'Khám phá các kiệt tác mùi hương thịnh hành nhất và được ưa chuộng tại cửa hàng.',
      filterTag: 'trending'
    }
  }
};

export const DEFAULT_BLOG_CARD_CONFIG: BlogCardConfig = {
  imageAspect: 'landscape',
  imagePadding: 0,
  cardRadius: 12,
  categoryBadgeBg: '#FFFFFF',
  categoryBadgeText: '#7A5C5C',
  titleFontSize: 14,
  excerptFontSize: 11,
  textAlign: 'left',
  elementOrder: ['category', 'date', 'title', 'excerpt', 'readMore'],
  showCategory: true,
  showDate: true,
  showReadTime: true,
  showExcerpt: true,
  showReadMore: true
};

export interface NavLink {
  label: string;
  href: string;
  order: number;
  enabled: boolean;
  displayMode: 'icon' | 'text' | 'icon-text';
}

export interface NavbarLayout {
  left: string[];
  center: string[];
  right: string[];
}

export interface NavbarConfig {
  logo: {
    image: string;
    text: string;
    width: number;
    height: number;
  };
  links: NavLink[];
  style: {
    background: string;
    textColor: string;
    accentColor: string;
    iconSize: number;
  };
  layout: NavbarLayout;
}

export const DEFAULT_NAVBAR_LAYOUT: NavbarLayout = {
  left: ['logo'],
  center: ['link-0', 'link-1', 'link-2', 'link-3', 'link-4'],
  right: ['search', 'cart', 'user'],
};

export const DEFAULT_NAVBAR_CONFIG: NavbarConfig = {
  logo: {
    image: 'https://i.ibb.co/TxzQXcMT/original.png',
    text: "L'essence",
    width: 120,
    height: 35,
  },
  links: [
    { label: 'Trang chủ', href: '/', order: 0, enabled: true, displayMode: 'icon' },
    { label: 'Cửa hàng', href: '/collections', order: 1, enabled: true, displayMode: 'icon' },
    { label: 'Bộ sưu tập', href: '/bo-suu-tap', order: 2, enabled: true, displayMode: 'icon' },
    { label: 'Bài viết', href: '/blog', order: 3, enabled: true, displayMode: 'icon' },
    { label: 'Hỗ trợ', href: '/tro-giup', order: 4, enabled: true, displayMode: 'icon' },
  ],
  style: {
    background: '#FFF5F5',
    textColor: '#7A5C5C',
    accentColor: '#C08497',
    iconSize: 26,
  },
  layout: DEFAULT_NAVBAR_LAYOUT,
};

export interface ProductCardConfig {
  imageAspect: 'square' | 'portrait' | 'landscape';
  imagePadding: number;
  cardRadius: number;
  tagBgColor: string;
  tagTextColor: string;
  discountBadgeBg: string;
  discountBadgeText: string;
  brandFontSize: number;
  nameFontSize: number;
  priceFontSize: number;
  textAlign: 'center' | 'left';
  elementOrder: string[];
  showKeywords: boolean;
  showSizes: boolean;
  showRating: boolean;
}

export const DEFAULT_PRODUCT_CARD_CONFIG: ProductCardConfig = {
  imageAspect: 'square',
  imagePadding: 40,
  cardRadius: 16,
  tagBgColor: '#FFFFFF',
  tagTextColor: '#7A5C5C',
  discountBadgeBg: '#D4A5A5',
  discountBadgeText: '#FFFFFF',
  brandFontSize: 11,
  nameFontSize: 14,
  priceFontSize: 16,
  textAlign: 'center',
  elementOrder: ['keywords', 'brand', 'name', 'sizes', 'rating', 'price'],
  showKeywords: true,
  showSizes: true,
  showRating: true
};

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
  productCardConfig: ProductCardConfig;
  blogCardConfig: BlogCardConfig;
  productSessionLayout?: ProductSessionLayoutConfig;
  navbar?: NavbarConfig;
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'banner', enabled: true, order: 0 },
  { id: 'brandsMarquee', enabled: true, order: 1 },
  { id: 'saleProducts', enabled: true, order: 2 },
  { id: 'newProducts', enabled: true, order: 3 },
  { id: 'limitedProducts', enabled: true, order: 4 },
  { id: 'trendingProducts', enabled: true, order: 5 },
  { id: 'brandUsp', enabled: true, order: 6 },
  { id: 'luxuryGallery', enabled: true, order: 7 },
  { id: 'blogPosts', enabled: true, order: 8 }
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
          galleryEn: parsed.gallery_en || [],
          productCardConfig: DEFAULT_PRODUCT_CARD_CONFIG,
          blogCardConfig: DEFAULT_BLOG_CARD_CONFIG,
          productSessionLayout: DEFAULT_PRODUCT_SESSION_LAYOUT,
          navbar: DEFAULT_NAVBAR_CONFIG
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
    galleryEn: [],
    productCardConfig: DEFAULT_PRODUCT_CARD_CONFIG,
    blogCardConfig: DEFAULT_BLOG_CARD_CONFIG,
    productSessionLayout: DEFAULT_PRODUCT_SESSION_LAYOUT,
    navbar: DEFAULT_NAVBAR_CONFIG
  };

}

export function useHomepageConfig() {
  return useQuery<HomepageConfigData>({
    queryKey: ['homepage-config'],
    queryFn: fetchHomepageConfig,
    staleTime: 1000 * 60 * 5, // 5 phút cache
    refetchOnWindowFocus: false
  });
}
