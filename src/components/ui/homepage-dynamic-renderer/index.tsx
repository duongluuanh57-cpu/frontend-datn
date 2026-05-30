'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Banner } from '@/components/ui/banner';
import { BrandUsp } from '@/components/ui/brand-usp';
import { DEFAULT_PRODUCT_SESSION_LAYOUT } from '@/hooks/useHomepageConfig';
import { useProductSessionPreviewStore } from '@/store/useProductSessionPreviewStore';
import { useSectionOrder } from './useSectionOrder';
import { SectionFallback, SmallSectionFallback } from './SectionFallback';
import { useHomepageConfig } from '@/hooks/useHomepageConfig';

const BrandsMarquee = dynamic(
  () => import('@/components/ui/brands-marquee').then((m) => m.BrandsMarquee),
  { ssr: false, loading: () => <SmallSectionFallback /> }
);
const SaleProducts = dynamic(
  () => import('@/components/ui/sale-products').then((m) => m.SaleProducts),
  { ssr: false, loading: () => <SectionFallback /> }
);
const NewProducts = dynamic(
  () => import('@/components/ui/new-products').then((m) => m.NewProducts),
  { ssr: false, loading: () => <SectionFallback /> }
);
const LimitedProducts = dynamic(
  () => import('@/components/ui/limited-products').then((m) => m.LimitedProducts),
  { ssr: false, loading: () => <SectionFallback /> }
);
const TrendingProducts = dynamic(
  () => import('@/components/ui/trending-products').then((m) => m.TrendingProducts),
  { ssr: false, loading: () => <SectionFallback /> }
);
const LuxuryGallery = dynamic(
  () => import('@/components/ui/luxury-gallery').then((m) => m.LuxuryGallery),
  { ssr: false, loading: () => <SmallSectionFallback height="h-[400px]" /> }
);
const BlogPosts = dynamic(
  () => import('@/components/ui/blog-posts').then((m) => m.BlogPosts),
  { ssr: false, loading: () => <SmallSectionFallback height="h-[300px]" /> }
);
const CustomerReviews = dynamic(
  () => import('@/components/ui/customer-reviews').then((m) => m.CustomerReviews),
  { ssr: false, loading: () => <SmallSectionFallback height="h-[200px]" /> }
);
const NewsletterSubscription = dynamic(
  () => import('@/components/ui/newsletter-subscription').then((m) => m.NewsletterSubscription),
  { ssr: false, loading: () => <SmallSectionFallback height="h-[200px]" /> }
);

export function HomepageDynamicRenderer() {
  const { data: config } = useHomepageConfig();
  const [mounted, setMounted] = useState(false);
  const { sectionsToRender } = useSectionOrder();

  // Prevent hydration mismatch
  useEffect(() => { setMounted(true); }, []);

  // Sync productSessionLayout vào Zustand store
  useEffect(() => {
    if (config) {
      const layout = config.productSessionLayout;
      const isValid = layout && typeof layout.columnsDesktop === 'number';
      if (isValid) {
        const merged = {
          ...DEFAULT_PRODUCT_SESSION_LAYOUT,
          ...layout,
          sessions: {
            ...DEFAULT_PRODUCT_SESSION_LAYOUT.sessions,
            ...(layout.sessions || {})
          }
        };
        useProductSessionPreviewStore.getState().setSavedConfig(merged);
      }
    }
  }, [config]);

  const renderSection = (id: string) => {
    if (!mounted) {
      switch (id) {
        case 'banner': return <Banner key="banner" />;
        case 'brandUsp': return <BrandUsp key="brandUsp" />;
        default: return null;
      }
    }
    switch (id) {
      case 'banner': return <Banner key="banner" />;
      case 'brandsMarquee': return <BrandsMarquee key="brandsMarquee" />;
      case 'saleProducts': return <SaleProducts key="saleProducts" />;
      case 'newProducts': return <NewProducts key="newProducts" />;
      case 'limitedProducts': return <LimitedProducts key="limitedProducts" />;
      case 'trendingProducts': return <TrendingProducts key="trendingProducts" />;
      case 'brandUsp': return <BrandUsp key="brandUsp" />;
      case 'luxuryGallery': return <LuxuryGallery key="luxuryGallery" />;
      case 'blogPosts': return <BlogPosts key="blogPosts" />;
      default: return null;
    }
  };

  return (
    <>
      {sectionsToRender.map((s) => renderSection(s.id))}
      <CustomerReviews />
      <NewsletterSubscription />
    </>
  );
}