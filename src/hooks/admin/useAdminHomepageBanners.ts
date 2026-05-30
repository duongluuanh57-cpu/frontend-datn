'use client';

import { useState, useCallback } from 'react';

const DEFAULT_BANNERS = [
  '/images/banner-1.webp',
  '/images/banner-2.webp',
  '/images/banner-3.webp',
  '/images/banner-4.webp'
];

export function useAdminHomepageBanners() {
  const [banners, setBanners] = useState<string[]>(DEFAULT_BANNERS);
  const [bannerTitleVi, setBannerTitleVi] = useState('Độc bản hương thơm Niche');
  const [bannerSubtitleVi, setBannerSubtitleVi] = useState('Khám phá tinh hoa mùi hương quý tộc mang đậm phong vị cá nhân từ những nhà điều chế hàng đầu thế giới.');
  const [bannerLabelVi, setBannerLabelVi] = useState('BST NƯỚC HOA CAO CẤP');
  const [bannerTitleEn, setBannerTitleEn] = useState('Bespoke Niche Perfumery');
  const [bannerSubtitleEn, setBannerSubtitleEn] = useState('Explore the elite essence of royal perfumery, crafted for individual distinction by master scent designers.');
  const [bannerLabelEn, setBannerLabelEn] = useState('PREMIUM FRAGRANCE HOUSE');

  const initBanners = useCallback((dbConfig: any) => {
    if (dbConfig?.bannerImages?.length > 0) setBanners(dbConfig.bannerImages);
    if (dbConfig?.bannerTitleVi) setBannerTitleVi(dbConfig.bannerTitleVi);
    if (dbConfig?.bannerSubtitleVi) setBannerSubtitleVi(dbConfig.bannerSubtitleVi);
    if (dbConfig?.bannerLabelVi) setBannerLabelVi(dbConfig.bannerLabelVi);
    if (dbConfig?.bannerTitleEn) setBannerTitleEn(dbConfig.bannerTitleEn);
    if (dbConfig?.bannerSubtitleEn) setBannerSubtitleEn(dbConfig.bannerSubtitleEn);
    if (dbConfig?.bannerLabelEn) setBannerLabelEn(dbConfig.bannerLabelEn);
  }, []);

  const resetBanners = useCallback(() => {
    setBanners(DEFAULT_BANNERS);
    setBannerTitleVi('Độc bản hương thơm Niche');
    setBannerSubtitleVi('Khám phá tinh hoa mùi hương quý tộc mang đậm phong vị cá nhân từ những nhà điều chế hàng đầu thế giới.');
    setBannerLabelVi('BST NƯỚC HOA CAO CẤP');
    setBannerTitleEn('Bespoke Niche Perfumery');
    setBannerSubtitleEn('Explore the elite essence of royal perfumery, crafted for individual distinction by master scent designers.');
    setBannerLabelEn('PREMIUM FRAGRANCE HOUSE');
  }, []);

  return {
    banners, setBanners,
    bannerTitleVi, setBannerTitleVi,
    bannerSubtitleVi, setBannerSubtitleVi,
    bannerLabelVi, setBannerLabelVi,
    bannerTitleEn, setBannerTitleEn,
    bannerSubtitleEn, setBannerSubtitleEn,
    bannerLabelEn, setBannerLabelEn,
    initBanners,
    resetBanners,
  };
}