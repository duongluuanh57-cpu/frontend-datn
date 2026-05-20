'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Banner } from '@/components/ui/banner';
import { BrandUsp } from '@/components/ui/brand-usp';
import { useHomepageConfig } from '@/hooks/useHomepageConfig';

const BrandsMarquee = dynamic(
  () => import('@/components/ui/brands-marquee').then((m) => m.BrandsMarquee),
  { ssr: false }
);
const SaleProducts = dynamic(
  () => import('@/components/ui/sale-products').then((m) => m.SaleProducts),
  { ssr: false }
);
const NewProducts = dynamic(
  () => import('@/components/ui/new-products').then((m) => m.NewProducts),
  { ssr: false }
);
const LuxuryGallery = dynamic(
  () => import('@/components/ui/luxury-gallery').then((m) => m.LuxuryGallery),
  { ssr: false }
);
const BlogPosts = dynamic(
  () => import('@/components/ui/blog-posts').then((m) => m.BlogPosts),
  { ssr: false }
);

import { CustomerReviews } from '@/components/ui/customer-reviews';
import { NewsletterSubscription } from '@/components/ui/newsletter-subscription';

const DEFAULT_ORDER = [
  'banner',
  'brandsMarquee',
  'saleProducts',
  'newProducts',
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

  // Khi đang load, render thứ tự mặc định để không bị layout shift
  // IMPORTANT: useMemo must be called before any conditional returns (Rules of Hooks)
  const sectionsToRender = React.useMemo(() => {
    if (isLoading || !config?.sections?.length) {
      return DEFAULT_ORDER.map((id) => ({ id, enabled: true, order: DEFAULT_ORDER.indexOf(id) }));
    }
    return [...config.sections].sort((a, b) => a.order - b.order).filter((s) => s.enabled);
  }, [isLoading, config]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const renderSection = (id: string) => {
    switch (id) {
      case 'banner':
        return <Banner key="banner" />;
      case 'brandsMarquee':
        return <BrandsMarquee key="brandsMarquee" />;
      case 'saleProducts':
        return <SaleProducts key="saleProducts" />;
      case 'newProducts':
        return <NewProducts key="newProducts" />;
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
