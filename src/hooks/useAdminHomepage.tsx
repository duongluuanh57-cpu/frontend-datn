'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { HomepageConfigData, ProductSessionLayoutConfig } from '@/hooks/useHomepageConfig';
import { DEFAULT_PRODUCT_SESSION_LAYOUT } from '@/hooks/useHomepageConfig';
import { useProductSessionPreviewStore } from '@/store/useProductSessionPreviewStore';
import { useAdminHomepageSections } from '@/hooks/admin/useAdminHomepageSections';
import { useAdminHomepageBanners } from '@/hooks/admin/useAdminHomepageBanners';
import { useAdminHomepageGallery } from '@/hooks/admin/useAdminHomepageGallery';
import { useAdminHomepageCards } from '@/hooks/admin/useAdminHomepageCards';
import { useAdminHomepageLayout } from '@/hooks/admin/useAdminHomepageLayout';
import { useAdminHomepageNavbarFooter } from '@/hooks/admin/useAdminHomepageNavbarFooter';

// ── Button-style sensors (kept here for convenience) ──
import {
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';

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
  const [activeTab, setActiveTab] = useState<'banners' | 'gallery' | 'layout' | 'cardCustomizer' | 'blogCard' | 'productSessionLayout' | 'navbar' | 'footer'>('layout');
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const isBannersMode = tabParam === 'banners';

  // Sync activeTab with tab query parameter
  useEffect(() => {
    if (tabParam === 'banners') {
      setActiveTab('banners');
    } else if (tabParam === 'gallery' || tabParam === 'layout' || tabParam === 'cardCustomizer' || tabParam === 'blogCard' || tabParam === 'productSessionLayout' || tabParam === 'navbar' || tabParam === 'footer') {
      setActiveTab(tabParam);
    } else {
      setActiveTab(prev => prev === 'banners' ? 'layout' : prev);
    }
  }, [tabParam]);

  // ── Sub-hooks ──
  const sectionsHook = useAdminHomepageSections();
  const bannersHook = useAdminHomepageBanners();
  const galleryHook = useAdminHomepageGallery();
  const cardsHook = useAdminHomepageCards();
  const layoutHook = useAdminHomepageLayout();
  const navbarFooterHook = useAdminHomepageNavbarFooter();

  // ── Fetch config from DB ──
  const { data: dbConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ['homepage-config'],
    queryFn: fetchConfig
  });

  // Populate sub-hook states from DB
  useEffect(() => {
    if (!dbConfig) return;
    sectionsHook.initSections(dbConfig.sections);
    bannersHook.initBanners(dbConfig);
    galleryHook.initGallery(dbConfig);
    cardsHook.initCards(dbConfig);
    layoutHook.initLayout(dbConfig);
    navbarFooterHook.initNavbarFooter(dbConfig);
  }, [dbConfig]);

  // ── Save mutation ──
  const saveMutation = useMutation({
    mutationFn: saveConfig,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['homepage-config'] });
      // Sync productSessionLayout from response
      const saved = data.productSessionLayout;
      const sent = variables?.productSessionLayout;
      const raw = saved && typeof saved.columnsDesktop === 'number'
        ? saved
        : (sent && typeof sent.columnsDesktop === 'number'
            ? sent
            : DEFAULT_PRODUCT_SESSION_LAYOUT);
      const merged = {
        ...DEFAULT_PRODUCT_SESSION_LAYOUT,
        ...raw,
        sessions: {
          ...DEFAULT_PRODUCT_SESSION_LAYOUT.sessions,
          ...(raw.sessions || {})
        }
      };
      layoutHook.setProductSessionLayout(merged);
      useProductSessionPreviewStore.getState().setSavedConfig(merged);
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

  // ── Save all ──
  const handleSave = useCallback(() => {
    const finalBlogCardConfig = {
      ...cardsHook.blogCardConfig,
      elementOrder: cardsHook.blogElementOrder.map(e => e.id),
      showCategory: cardsHook.blogElementOrder.find(e => e.id === 'category')?.show ?? true,
      showDate: cardsHook.blogElementOrder.find(e => e.id === 'date')?.show ?? true,
      showReadTime: cardsHook.blogElementOrder.find(e => e.id === 'date')?.show ?? true,
      showExcerpt: cardsHook.blogElementOrder.find(e => e.id === 'excerpt')?.show ?? true,
      showReadMore: cardsHook.blogElementOrder.find(e => e.id === 'readMore')?.show ?? true
    };

    const finalCardConfig = {
      ...cardsHook.cardConfig,
      elementOrder: cardsHook.cardElementOrder.map(e => e.id),
      showKeywords: cardsHook.cardElementOrder.find(e => e.id === 'keywords')?.show ?? true,
      showSizes: cardsHook.cardElementOrder.find(e => e.id === 'sizes')?.show ?? true,
      showRating: cardsHook.cardElementOrder.find(e => e.id === 'rating')?.show ?? true
    };
    const payload = {
      sections: sectionsHook.sections,
      bannerImages: bannersHook.banners,
      bannerTitleVi: bannersHook.bannerTitleVi,
      bannerSubtitleVi: bannersHook.bannerSubtitleVi,
      bannerLabelVi: bannersHook.bannerLabelVi,
      bannerTitleEn: bannersHook.bannerTitleEn,
      bannerSubtitleEn: bannersHook.bannerSubtitleEn,
      bannerLabelEn: bannersHook.bannerLabelEn,
      galleryVi: galleryHook.galleryVi,
      galleryEn: galleryHook.galleryEn,
      productCardConfig: finalCardConfig,
      blogCardConfig: finalBlogCardConfig,
      productSessionLayout: layoutHook.productSessionLayout,
      navbar: navbarFooterHook.navbarConfig,
      footer: navbarFooterHook.footerConfig
    };
    saveMutation.mutate(payload);
  }, [
    sectionsHook.sections,
    bannersHook.banners, bannersHook.bannerTitleVi, bannersHook.bannerSubtitleVi, bannersHook.bannerLabelVi,
    bannersHook.bannerTitleEn, bannersHook.bannerSubtitleEn, bannersHook.bannerLabelEn,
    galleryHook.galleryVi, galleryHook.galleryEn,
    cardsHook.cardConfig, cardsHook.cardElementOrder, cardsHook.blogCardConfig, cardsHook.blogElementOrder,
    layoutHook.productSessionLayout,
    navbarFooterHook.navbarConfig, navbarFooterHook.footerConfig,
    saveMutation
  ]);

  // ── Restore defaults ──
  const handleRestoreDefaults = useCallback(() => {
    toast.custom((tId) => (
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 flex flex-col gap-3 min-w-[280px]">
        <p className="text-sm font-semibold text-[#7A5C5C]">Xác nhận khôi phục</p>
        <p className="text-xs text-[#7A5C5C]/70">Bạn có chắc muốn khôi phục lại thiết kế trang chủ mặc định?</p>
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={() => toast.dismiss(tId)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-[#7A5C5C] hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              toast.dismiss(tId);
              sectionsHook.resetSections();
              bannersHook.resetBanners();
              galleryHook.resetGallery();
              toast.info('Đã khôi phục cài đặt mặc định. Bấm Lưu để áp dụng.');
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#7A5C5C] text-white hover:bg-[#604444] transition-colors"
          >
            Xác nhận
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  }, []);

  // ── Derived display values for banner preview ──
  const displayTitle = locale === 'vi' ? bannersHook.bannerTitleVi : bannersHook.bannerTitleEn;
  const displaySubtitle = locale === 'vi' ? bannersHook.bannerSubtitleVi : bannersHook.bannerSubtitleEn;
  const displayLabel = locale === 'vi' ? bannersHook.bannerLabelVi : bannersHook.bannerLabelEn;
  const isSaving = saveMutation.isPending;

  return {
    locale,
    activeTab,
    setActiveTab,
    isBannersMode,
    isLoadingConfig,
    isSaving,
    sections: sectionsHook.sections,
    setSections: sectionsHook.setSections,
    banners: bannersHook.banners,
    setBanners: bannersHook.setBanners,
    bannerTitleVi: bannersHook.bannerTitleVi,
    setBannerTitleVi: bannersHook.setBannerTitleVi,
    bannerSubtitleVi: bannersHook.bannerSubtitleVi,
    setBannerSubtitleVi: bannersHook.setBannerSubtitleVi,
    bannerLabelVi: bannersHook.bannerLabelVi,
    setBannerLabelVi: bannersHook.setBannerLabelVi,
    bannerTitleEn: bannersHook.bannerTitleEn,
    setBannerTitleEn: bannersHook.setBannerTitleEn,
    bannerSubtitleEn: bannersHook.bannerSubtitleEn,
    setBannerSubtitleEn: bannersHook.setBannerSubtitleEn,
    bannerLabelEn: bannersHook.bannerLabelEn,
    setBannerLabelEn: bannersHook.setBannerLabelEn,
    galleryVi: galleryHook.galleryVi,
    setGalleryVi: galleryHook.setGalleryVi,
    galleryEn: galleryHook.galleryEn,
    setGalleryEn: galleryHook.setGalleryEn,
    galleryAiLoading: galleryHook.galleryAiLoading,
    blogCardConfig: cardsHook.blogCardConfig,
    setBlogCardConfig: cardsHook.setBlogCardConfig,
    blogElementOrder: cardsHook.blogElementOrder,
    setBlogElementOrder: cardsHook.setBlogElementOrder,
    productSessionLayout: layoutHook.productSessionLayout,
    setProductSessionLayout: layoutHook.setProductSessionLayout,
    cardConfig: cardsHook.cardConfig,
    setCardConfig: cardsHook.setCardConfig,
    cardElementOrder: cardsHook.cardElementOrder,
    setCardElementOrder: cardsHook.setCardElementOrder,
    sensors: sectionsHook.sensors,
    cardElementSensors: cardsHook.cardElementSensors,
    handleDragEnd: sectionsHook.handleDragEnd,
    handleToggleSection: sectionsHook.handleToggleSection,
    handleSave,
    handleRestoreDefaults,
    handleGalleryFieldChange: galleryHook.handleGalleryFieldChange,
    handleGalleryImageUpload: galleryHook.handleGalleryImageUpload,
    displayTitle,
    displaySubtitle,
    displayLabel,
    navbarConfig: navbarFooterHook.navbarConfig,
    setNavbarConfig: navbarFooterHook.setNavbarConfig,
    footerConfig: navbarFooterHook.footerConfig,
    setFooterConfig: navbarFooterHook.setFooterConfig,
  };
}

export type UseAdminHomepageReturn = ReturnType<typeof useAdminHomepage>;