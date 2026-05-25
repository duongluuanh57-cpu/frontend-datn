'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Banner } from '@/components/ui/banner';
import { BrandUsp } from '@/components/ui/brand-usp';
import { useHomepageConfig, DEFAULT_PRODUCT_SESSION_LAYOUT } from '@/hooks/useHomepageConfig';
import { useProductSessionPreviewStore } from '@/store/useProductSessionPreviewStore';

const BrandsMarquee = dynamic(
  () => import('@/components/ui/brands-marquee').then((m) => m.BrandsMarquee),
  {
    ssr: false,
    loading: () => <div className="h-[180px] w-full bg-transparent" />
  }
);
const SaleProducts = dynamic(
  () => import('@/components/ui/sale-products').then((m) => m.SaleProducts),
  {
    ssr: false,
    loading: () => (
      <div className="w-full py-12 lg:py-20 bg-transparent animate-pulse">
        <div className="max-w-container mx-auto px-6">
          <div className="h-20 w-1/3 bg-[#7A5C5C]/5 rounded-2xl mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-6">
                <div className="aspect-square w-full rounded-2xl bg-[#7A5C5C]/5" />
                <div className="flex flex-col items-center gap-3">
                  <div className="h-3 w-16 rounded bg-[#7A5C5C]/5" />
                  <div className="h-4 w-32 rounded bg-[#7A5C5C]/5" />
                  <div className="h-5 w-20 rounded bg-[#7A5C5C]/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
);
const NewProducts = dynamic(
  () => import('@/components/ui/new-products').then((m) => m.NewProducts),
  {
    ssr: false,
    loading: () => (
      <div className="w-full py-12 lg:py-20 bg-transparent animate-pulse">
        <div className="max-w-container mx-auto px-6">
          <div className="h-20 w-1/3 bg-[#7A5C5C]/5 rounded-2xl mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-6">
                <div className="aspect-square w-full rounded-2xl bg-[#7A5C5C]/5" />
                <div className="flex flex-col items-center gap-3">
                  <div className="h-3 w-16 rounded bg-[#7A5C5C]/5" />
                  <div className="h-4 w-32 rounded bg-[#7A5C5C]/5" />
                  <div className="h-5 w-20 rounded bg-[#7A5C5C]/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
);
const LimitedProducts = dynamic(
  () => import('@/components/ui/limited-products').then((m) => m.LimitedProducts),
  {
    ssr: false,
    loading: () => (
      <div className="w-full py-12 lg:py-20 bg-transparent animate-pulse">
        <div className="max-w-container mx-auto px-6">
          <div className="h-20 w-1/3 bg-[#7A5C5C]/5 rounded-2xl mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-6">
                <div className="aspect-square w-full rounded-2xl bg-[#7A5C5C]/5" />
                <div className="flex flex-col items-center gap-3">
                  <div className="h-3 w-16 rounded bg-[#7A5C5C]/5" />
                  <div className="h-4 w-32 rounded bg-[#7A5C5C]/5" />
                  <div className="h-5 w-20 rounded bg-[#7A5C5C]/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
);
const TrendingProducts = dynamic(
  () => import('@/components/ui/trending-products').then((m) => m.TrendingProducts),
  {
    ssr: false,
    loading: () => (
      <div className="w-full py-12 lg:py-20 bg-transparent animate-pulse">
        <div className="max-w-container mx-auto px-6">
          <div className="h-20 w-1/3 bg-[#7A5C5C]/5 rounded-2xl mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-6">
                <div className="aspect-square w-full rounded-2xl bg-[#7A5C5C]/5" />
                <div className="flex flex-col items-center gap-3">
                  <div className="h-3 w-16 rounded bg-[#7A5C5C]/5" />
                  <div className="h-4 w-32 rounded bg-[#7A5C5C]/5" />
                  <div className="h-5 w-20 rounded bg-[#7A5C5C]/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
);
const LuxuryGallery = dynamic(
  () => import('@/components/ui/luxury-gallery').then((m) => m.LuxuryGallery),
  {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-transparent" />
  }
);
const BlogPosts = dynamic(
  () => import('@/components/ui/blog-posts').then((m) => m.BlogPosts),
  {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-transparent" />
  }
);

const CustomerReviews = dynamic(
  () => import('@/components/ui/customer-reviews').then((m) => m.CustomerReviews),
  {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-transparent" />
  }
);

const NewsletterSubscription = dynamic(
  () => import('@/components/ui/newsletter-subscription').then((m) => m.NewsletterSubscription),
  {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-transparent" />
  }
);

const DEFAULT_ORDER = [
  'banner',
  'brandsMarquee',
  'saleProducts',
  'newProducts',
  'limitedProducts',
  'trendingProducts',
  'brandUsp',
  'luxuryGallery',
  'blogPosts'
];

export function HomepageDynamicRenderer() {
  const { data: config, isLoading } = useHomepageConfig();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync productSessionLayout từ API vào Zustand store
  // Deep-merge với DEFAULT để đảm bảo không thiếu nested fields (sessions, etc.)
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

  // Khi đang load, render thứ tự mặc định để không bị layout shift
  // IMPORTANT: useMemo must be called before any conditional returns (Rules of Hooks)
  const sectionsToRender = React.useMemo(() => {
    if (isLoading || !config?.sections?.length) {
      return DEFAULT_ORDER.map((id) => ({ id, enabled: true, order: DEFAULT_ORDER.indexOf(id) }));
    }
    const configured = [...config.sections].sort((a, b) => a.order - b.order);
    const merged = DEFAULT_ORDER.map((id, index) => configured.find((section) => section.id === id) ?? ({
      id,
      enabled: true,
      order: index
    }));
    const extras = configured.filter((section) => !DEFAULT_ORDER.includes(section.id));
    return [...merged, ...extras].sort((a, b) => a.order - b.order).filter((s) => s.enabled);
  }, [isLoading, config]);

  const renderSection = (id: string) => {
    // Return empty placeholders during SSR/first render for client-only dynamic components
    if (!mounted) {
      switch (id) {
        case 'banner':
          return <Banner key="banner" />;
        case 'brandUsp':
          return <BrandUsp key="brandUsp" />;
        default:
          return null;
      }
    }

    switch (id) {
      case 'banner':
        return <Banner key="banner" />;
      case 'brandsMarquee':
        return <BrandsMarquee key="brandsMarquee" />;
      case 'saleProducts':
        return <SaleProducts key="saleProducts" />;
      case 'newProducts':
        return <NewProducts key="newProducts" />;
      case 'limitedProducts':
        return <LimitedProducts key="limitedProducts" />;
      case 'trendingProducts':
        return <TrendingProducts key="trendingProducts" />;
      case 'brandUsp':
        return <BrandUsp key="brandUsp" />;
      case 'luxuryGallery':
        return <LuxuryGallery key="luxuryGallery" />;
      case 'blogPosts':
        return <BlogPosts key="blogPosts" />;
      default:
        return null;
    }
  };

  return (
    <>
      {sectionsToRender.map((s) => renderSection(s.id))}
      {/* Hardcoded Customer Reviews Section at the bottom */}
      <CustomerReviews />
      {/* Newsletter Subscription Section */}
      <NewsletterSubscription />
    </>
  );
}
