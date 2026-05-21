'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import api from '@/lib/api';
import type { SectionConfig, HomepageConfigData, ProductCardConfig } from '@/hooks/useHomepageConfig';
import { DEFAULT_PRODUCT_CARD_CONFIG } from '@/hooks/useHomepageConfig';

// --- Default data ---
const DEFAULT_BANNERS = [
  '/images/banner-1.webp',
  '/images/banner-2.webp',
  '/images/banner-3.webp',
  '/images/banner-4.webp'
];

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

const DEFAULT_GALLERY = Array.from({ length: 6 }, () => ({
  url: '',
  aspect: 'aspect-[3/4]',
  title: '',
  quote: ''
}));

// --- Fetch + Save API ---
const fetchConfig = async (): Promise<HomepageConfigData> => {
  const { data } = await api.get('/homepage-config');
  return data.data;
};

const saveConfig = async (payload: Partial<HomepageConfigData>): Promise<HomepageConfigData> => {
  const { data } = await api.put('/homepage-config', payload);
  return data.data;
};

export function useAdminHomepage() {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'banners' | 'gallery' | 'layout' | 'cardCustomizer'>('layout');
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const isBannersMode = tabParam === 'banners';

  // Sync activeTab with tab query parameter
  useEffect(() => {
    if (tabParam === 'banners') {
      setActiveTab('banners');
    } else if (tabParam === 'gallery' || tabParam === 'layout' || tabParam === 'cardCustomizer') {
      setActiveTab(tabParam);
    } else {
      // If we leave banner mode, reset activeTab to 'layout' if it was on banners
      setActiveTab(prev => prev === 'banners' ? 'layout' : prev);
    }
  }, [tabParam]);

  // ── Fetch config từ DB ──
  const { data: dbConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ['homepage-config'],
    queryFn: fetchConfig
  });

  // ── Save mutation ──
  const saveMutation = useMutation({
    mutationFn: saveConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-config'] });
      toast.success('Đã lưu cấu hình trang chủ thành công!', {
        description: 'Thay đổi sẽ có hiệu lực ngay trên trang chủ.',
        duration: 3000
      });
    },
    onError: (err: any) => {
      toast.error('Lưu thất bại', {
        description: err?.response?.data?.message || err.message,
        duration: 4000
      });
    }
  });

  // ── Local state (init từ DB) ──
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const [banners, setBanners] = useState<string[]>(DEFAULT_BANNERS);
  const [bannerTitleVi, setBannerTitleVi] = useState('Độc bản hương thơm Niche');
  const [bannerSubtitleVi, setBannerSubtitleVi] = useState('Khám phá tinh hoa mùi hương quý tộc mang đậm phong vị cá nhân từ những nhà điều chế hàng đầu thế giới.');
  const [bannerLabelVi, setBannerLabelVi] = useState('BST NƯỚC HOA CAO CẤP');
  const [bannerTitleEn, setBannerTitleEn] = useState('Bespoke Niche Perfumery');
  const [bannerSubtitleEn, setBannerSubtitleEn] = useState('Explore the elite essence of royal perfumery, crafted for individual distinction by master scent designers.');
  const [bannerLabelEn, setBannerLabelEn] = useState('PREMIUM FRAGRANCE HOUSE');
  const [galleryVi, setGalleryVi] = useState(DEFAULT_GALLERY);
  const [galleryEn, setGalleryEn] = useState(DEFAULT_GALLERY);
  const [galleryAiLoading, setGalleryAiLoading] = useState<Record<number, boolean>>({});

  // ── Product Card Config state ──
  const [cardConfig, setCardConfig] = useState<ProductCardConfig>(DEFAULT_PRODUCT_CARD_CONFIG);
  const [cardElementOrder, setCardElementOrder] = useState<Array<{ id: string; label: string; show: boolean }>>(
    [
      { id: 'keywords', label: 'Từ khóa / Keywords', show: true },
      { id: 'brand', label: 'Thương hiệu', show: true },
      { id: 'name', label: 'Tên sản phẩm', show: true },
      { id: 'sizes', label: 'Dung tích / Sizes', show: true },
      { id: 'rating', label: 'Đánh giá & Sao', show: true },
      { id: 'price', label: 'Giá bán', show: true }
    ]
  );

  // Populate state từ DB khi load xong, fallback localStorage nếu DB rỗng
  useEffect(() => {
    if (!dbConfig) return;
    if (dbConfig.sections?.length > 0) {
      const sorted = [...dbConfig.sections].sort((a, b) => a.order - b.order);
      const merged = DEFAULT_SECTIONS.map((section, index) =>
        sorted.find((item) => item.id === section.id) ?? { ...section, order: index }
      );
      const extras = sorted.filter((section) => !DEFAULT_SECTIONS.some((item) => item.id === section.id));
      setSections([...merged, ...extras].sort((a, b) => a.order - b.order));
    }
    if (dbConfig.bannerImages?.length > 0) setBanners(dbConfig.bannerImages);
    if (dbConfig.bannerTitleVi) setBannerTitleVi(dbConfig.bannerTitleVi);
    if (dbConfig.bannerSubtitleVi) setBannerSubtitleVi(dbConfig.bannerSubtitleVi);
    if (dbConfig.bannerLabelVi) setBannerLabelVi(dbConfig.bannerLabelVi);
    if (dbConfig.bannerTitleEn) setBannerTitleEn(dbConfig.bannerTitleEn);
    if (dbConfig.bannerSubtitleEn) setBannerSubtitleEn(dbConfig.bannerSubtitleEn);
    if (dbConfig.bannerLabelEn) setBannerLabelEn(dbConfig.bannerLabelEn);

    // Gallery: ưu tiên DB, fallback về localStorage nếu DB chưa có ảnh hợp lệ
    const dbHasGalleryVi = dbConfig.galleryVi?.some((img: any) => img?.url?.trim());
    const dbHasGalleryEn = dbConfig.galleryEn?.some((img: any) => img?.url?.trim());

    if (dbHasGalleryVi) {
      setGalleryVi(dbConfig.galleryVi);
    } else {
      // Migrate từ localStorage lần đầu
      try {
        const saved = localStorage.getItem('lessence_custom_homepage_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.gallery?.length > 0) setGalleryVi(parsed.gallery);
        }
      } catch {}
    }

    if (dbHasGalleryEn) {
      setGalleryEn(dbConfig.galleryEn);
    } else {
      try {
        const saved = localStorage.getItem('lessence_custom_homepage_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.gallery_en?.length > 0) setGalleryEn(parsed.gallery_en);
        }
      } catch {}
    }

    // Populate Product Card Config
    if (dbConfig.productCardConfig) {
      const cfg = dbConfig.productCardConfig;
      setCardConfig(cfg);
      if (cfg.elementOrder?.length > 0) {
        setCardElementOrder(prev =>
          cfg.elementOrder.map(id => {
            const existing = prev.find(e => e.id === id);
            return existing
              ? { ...existing, show: id === 'keywords' ? (cfg.showKeywords ?? true) : id === 'sizes' ? (cfg.showSizes ?? true) : id === 'rating' ? (cfg.showRating ?? true) : true }
              : { id, label: id, show: true };
          })
        );
      }
    }
  }, [dbConfig]);

  // ── Drag & Drop sensors ──
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Drag & Drop sensors for card element ordering ──
  const cardElementSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((s, idx) => ({ ...s, order: idx }));
    });
  }, []);

  const handleToggleSection = useCallback((id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }, []);

  // ── Save all ──
  const handleSave = useCallback(() => {
    const finalCardConfig: ProductCardConfig = {
      ...cardConfig,
      elementOrder: cardElementOrder.map(e => e.id),
      showKeywords: cardElementOrder.find(e => e.id === 'keywords')?.show ?? true,
      showSizes: cardElementOrder.find(e => e.id === 'sizes')?.show ?? true,
      showRating: cardElementOrder.find(e => e.id === 'rating')?.show ?? true
    };
    saveMutation.mutate({
      sections,
      bannerImages: banners,
      bannerTitleVi,
      bannerSubtitleVi,
      bannerLabelVi,
      bannerTitleEn,
      bannerSubtitleEn,
      bannerLabelEn,
      galleryVi,
      galleryEn,
      productCardConfig: finalCardConfig
    });
  }, [sections, banners, bannerTitleVi, bannerSubtitleVi, bannerLabelVi, bannerTitleEn, bannerSubtitleEn, bannerLabelEn, galleryVi, galleryEn, cardConfig, cardElementOrder, saveMutation]);

  // ── Restore defaults ──
  const handleRestoreDefaults = () => {
    if (!confirm("Bạn có chắc muốn khôi phục lại thiết kế trang chủ mặc định của L'essence?")) return;
    setSections(DEFAULT_SECTIONS);
    setBanners(DEFAULT_BANNERS);
    setBannerTitleVi('Độc bản hương thơm Niche');
    setBannerSubtitleVi('Khám phá tinh hoa mùi hương quý tộc mang đậm phong vị cá nhân từ những nhà điều chế hàng đầu thế giới.');
    setBannerLabelVi('BST NƯỚC HOA CAO CẤP');
    setBannerTitleEn('Bespoke Niche Perfumery');
    setBannerSubtitleEn('Explore the elite essence of royal perfumery, crafted for individual distinction by master scent designers.');
    setBannerLabelEn('PREMIUM FRAGRANCE HOUSE');
    setGalleryVi(DEFAULT_GALLERY);
    setGalleryEn(DEFAULT_GALLERY);
    toast.info('Đã khôi phục cài đặt mặc định. Bấm Lưu để áp dụng.');
  };

  // ── Gallery helpers ──
  const handleGalleryFieldChange = (
    lang: 'vi' | 'en',
    index: number,
    field: 'url' | 'aspect' | 'title' | 'quote',
    value: string
  ) => {
    if (lang === 'vi') {
      setGalleryVi((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    } else {
      setGalleryEn((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    }
  };

  const handleGalleryImageUpload = async (idx: number, newUrl: string) => {
    handleGalleryFieldChange('vi', idx, 'url', newUrl);
    handleGalleryFieldChange('en', idx, 'url', newUrl);
    if (!newUrl) return;

    setGalleryAiLoading((prev) => ({ ...prev, [idx]: true }));
    const loadingToast = toast.loading('AI đang quét và phân tích hình ảnh nghệ thuật...');
    try {
      const response = await api.post('/ai/scan-gallery-image', { imageUrl: newUrl });
      if (response.data?.success && response.data?.data) {
        const { titleVi, quoteVi, titleEn, quoteEn } = response.data.data;
        setGalleryVi((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx], title: titleVi || next[idx].title, quote: quoteVi || next[idx].quote };
          return next;
        });
        setGalleryEn((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx], title: titleEn || next[idx].title, quote: quoteEn || next[idx].quote };
          return next;
        });
        toast.success('AI phân tích ảnh thành công!', { id: loadingToast, duration: 3000 });
      }
    } catch {
      toast.error('Không thể quét ảnh bằng AI.', { id: loadingToast, duration: 4000 });
    } finally {
      setGalleryAiLoading((prev) => ({ ...prev, [idx]: false }));
    }
  };

  // ── Derived display values for banner preview ──
  const displayTitle = locale === 'vi' ? bannerTitleVi : bannerTitleEn;
  const displaySubtitle = locale === 'vi' ? bannerSubtitleVi : bannerSubtitleEn;
  const displayLabel = locale === 'vi' ? bannerLabelVi : bannerLabelEn;
  const isSaving = saveMutation.isPending;

  return {
    locale,
    activeTab,
    setActiveTab,
    isBannersMode,
    isLoadingConfig,
    isSaving,
    sections,
    setSections,
    banners,
    setBanners,
    bannerTitleVi,
    setBannerTitleVi,
    bannerSubtitleVi,
    setBannerSubtitleVi,
    bannerLabelVi,
    setBannerLabelVi,
    bannerTitleEn,
    setBannerTitleEn,
    bannerSubtitleEn,
    setBannerSubtitleEn,
    bannerLabelEn,
    setBannerLabelEn,
    galleryVi,
    setGalleryVi,
    galleryEn,
    setGalleryEn,
    galleryAiLoading,
    cardConfig,
    setCardConfig,
    cardElementOrder,
    setCardElementOrder,
    sensors,
    cardElementSensors,
    handleDragEnd,
    handleToggleSection,
    handleSave,
    handleRestoreDefaults,
    handleGalleryFieldChange,
    handleGalleryImageUpload,
    displayTitle,
    displaySubtitle,
    displayLabel
  };
}

export type UseAdminHomepageReturn = ReturnType<typeof useAdminHomepage>;
