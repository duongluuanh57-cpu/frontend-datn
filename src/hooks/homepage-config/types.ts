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

export interface NavLink {
  label: string;
  href: string;
  order: number;
  enabled: boolean;
  displayMode: 'icon' | 'text' | 'icon-text';
}

export interface SpecialItemConfig {
  displayMode: 'icon' | 'text' | 'icon-text';
  label: string;
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
  searchConfig: SpecialItemConfig;
  cartConfig: SpecialItemConfig;
  userConfig: SpecialItemConfig;
  style: {
    background: string;
    textColor: string;
    accentColor: string;
    iconSize: number;
  };
  layout: NavbarLayout;
}

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

export interface FooterLinkItem {
  label: string;
  href: string;
  order: number;
  enabled: boolean;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: FooterLinkItem[];
  enabled: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
  enabled: boolean;
}

export interface FooterConfig {
  style: {
    background: string;
    textColor: string;
    headingColor: string;
    borderColor: string;
  };
  brand: {
    title: string;
    description: string;
    logo: string;
    enabled: boolean;
  };
  columns: FooterColumn[];
  socialLinks: SocialLink[];
  newsletter: {
    enabled: boolean;
    title: string;
    description: string;
    email: string;
  };
  copyright: {
    text: string;
    enabled: boolean;
    showPaymentIcons: boolean;
  };
  layout: {
    columnOrder: string[];
    showBrand: boolean;
    showNewsletter: boolean;
    showSocialLinks: boolean;
    showPaymentIcons: boolean;
  };
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
  productCardConfig: ProductCardConfig;
  blogCardConfig: BlogCardConfig;
  productSessionLayout?: ProductSessionLayoutConfig;
  navbar?: NavbarConfig;
  footer?: FooterConfig;
}