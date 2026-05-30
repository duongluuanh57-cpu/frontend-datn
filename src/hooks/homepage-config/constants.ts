import type {
  BlogCardConfig,
  ProductSessionLayoutConfig,
  NavbarLayout,
  NavbarConfig,
  ProductCardConfig,
  FooterConfig,
  SectionConfig,
} from './types';

export const DEFAULT_SECTIONS: SectionConfig[] = [
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
  searchConfig: { displayMode: 'icon', label: 'Tìm kiếm' },
  cartConfig: { displayMode: 'icon', label: 'Giỏ hàng' },
  userConfig: { displayMode: 'icon', label: 'Tài khoản' },
  style: {
    background: '#FFF5F5',
    textColor: '#7A5C5C',
    accentColor: '#C08497',
    iconSize: 26,
  },
  layout: { left: ['logo'], center: ['link-0', 'link-1', 'link-2', 'link-3', 'link-4'], right: ['search', 'cart', 'user'] },
};

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

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  style: {
    background: 'rgba(255, 255, 255, 0.02)',
    textColor: '#5D4040',
    headingColor: '#7A5C5C',
    borderColor: 'rgba(122, 92, 92, 0.08)',
  },
  brand: {
    title: "L'essence",
    description: 'Hành trình đánh thức giác quan thông qua những nốt hương haute couture. Mỗi sản phẩm là một tác phẩm nghệ thuật, mang tâm hồn và sự lãng mạn của nước Pháp.',
    logo: '',
    enabled: true,
  },
  columns: [
    {
      id: 'col-0',
      title: 'Khám Phá',
      enabled: true,
      links: [
        { label: 'Bộ Sưu Tập', href: '/shop', order: 0, enabled: true },
        { label: 'Sản Phẩm Mới', href: '/new-arrivals', order: 1, enabled: true },
        { label: 'Câu Chuyện Thương Hiệu', href: '/about', order: 2, enabled: true },
        { label: 'Liên Hệ', href: '/contact', order: 3, enabled: true },
        { label: 'Cửa Hàng', href: '/stores', order: 4, enabled: true },
      ],
    },
    {
      id: 'col-1',
      title: 'Về chúng tôi',
      enabled: true,
      links: [
        { label: 'Giới thiệu', href: '/about', order: 0, enabled: true },
        { label: 'Câu chuyện thương hiệu', href: '/about#story', order: 1, enabled: true },
        { label: 'Tuyển dụng', href: '/careers', order: 2, enabled: true },
        { label: 'Liên hệ', href: '/contact', order: 3, enabled: true },
      ],
    },
  ],
  socialLinks: [
    { platform: 'instagram', url: '#', enabled: true },
    { platform: 'facebook', url: '#', enabled: true },
    { platform: 'twitter', url: '#', enabled: true },
  ],
  newsletter: {
    enabled: true,
    title: 'Kết Nối',
    description: 'Đăng ký nhận những đặc quyền riêng biệt và thông tin mới nhất từ L\'essence.',
    email: 'concierge@lessence.com',
  },
  copyright: {
    text: "L'essence. Trang web là sản phẩm của trường Cao đẳng FPT Polytechnic không có mục đích thương mại.",
    enabled: true,
    showPaymentIcons: false,
  },
  layout: {
    columnOrder: ['brand', 'col-0', 'col-1', 'newsletter'],
    showBrand: true,
    showNewsletter: true,
    showSocialLinks: true,
    showPaymentIcons: false,
  },
};