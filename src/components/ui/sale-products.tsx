'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import api from '@/lib/api';
import { Link } from '@/navigation';
import { ProductCard, type ProductData } from './product-card';
import { useProductSessionLayout } from '@/store/useProductSessionPreviewStore';
import './new-products.css';

const fetchSaleProducts = async (): Promise<ProductData[]> => {
  const { data } = await api.get('/products/sale');
  return data.data;
};

// --- Countdown Timer Component ---
interface CountdownTimerProps {
  targetDate?: string | null;
  locale: string;
}

function CountdownTimer({ targetDate, locale }: CountdownTimerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false });
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate || !isInView) {
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, isInView]);

  const pad = (n: number) => String(n).padStart(2, '0');
  const labels = locale === 'vi'
    ? { days: 'Ngày', hours: 'Giờ', minutes: 'Phút', seconds: 'Giây' }
    : { days: 'Days', hours: 'Hours', minutes: 'Mins', seconds: 'Secs' };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="mt-6 lg:mt-0 flex items-center justify-center gap-3 md:gap-4"
    >
      {[
        { label: labels.days, value: pad(timeLeft.days) },
        { label: labels.hours, value: pad(timeLeft.hours) },
        { label: labels.minutes, value: pad(timeLeft.minutes) },
        { label: labels.seconds, value: pad(timeLeft.seconds) }
      ].map((item, index) => (
        <React.Fragment key={item.label}>
          <div className="flex flex-col items-center">
            <div className="countdown-box flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-xl">
              <span className="text-xl md:text-2xl font-bold tracking-tight text-[#7A5C5C]">
                {item.value}
              </span>
            </div>
            <span className="mt-2 text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">
              {item.label}
            </span>
          </div>
          {index < 3 && (
            <span className="text-lg font-medium text-[#D4A5A5] mb-5">:</span>
          )}
        </React.Fragment>
      ))}
    </motion.div>
  );
}

// --- Skeleton Component ---
const ProductSkeleton = () => (
  <div className="flex flex-col gap-6">
    <div className="aspect-square w-full animate-pulse rounded-2xl bg-[#7A5C5C]/5" />
    <div className="flex flex-col items-center gap-3">
      <div className="h-3 w-16 animate-pulse rounded bg-[#7A5C5C]/5" />
      <div className="h-4 w-32 animate-pulse rounded bg-[#7A5C5C]/5" />
      <div className="h-5 w-20 animate-pulse rounded bg-[#7A5C5C]/5" />
    </div>
  </div>
);

export function SaleProducts() {
  const t = useTranslations('SaleProducts');
  const locale = useLocale();
  const layoutConfig = useProductSessionLayout();
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['sale-products'],
    queryFn: fetchSaleProducts,
  });
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (error || !products || products.length === 0) return null;

  const targetDate = products?.[0]?.discountEndDate;
  const cols = isMobile ? layoutConfig.columnsMobile : layoutConfig.columnsDesktop;
  const rows = isMobile ? layoutConfig.rowsMobile : layoutConfig.rowsDesktop;
  const totalToShow = cols * rows;

  return (
    <section className="new-products-section w-full bg-transparent pt-[56px] pb-10 lg:pt-[96px] lg:pb-14 overflow-hidden"
      style={{ contain: 'content', contentVisibility: 'auto' } as React.CSSProperties}>
      <div className="max-w-container mx-auto px-6">

        {/* Header Section */}
        <div className="relative mb-16 lg:mb-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 border-b border-[#D4A5A5]/10 pb-8">
          {layoutConfig.showTitle && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center lg:items-start text-center lg:text-left"
            >
              <span className="text-[10px] font-bold uppercase text-[#D4A5A5]">
                L'essence Promotions
              </span>
              <h2
                className="mt-4 font-medium text-[#7A5C5C]"
                style={{ fontSize: `${layoutConfig.sectionTitleFontSize}px` }}
              >
                {layoutConfig.sessions.saleProducts.titleText}
              </h2>
              {layoutConfig.showSubtitle && (
                <p
                  className="mt-3 text-[#7A5C5C] max-w-[480px] font-medium leading-relaxed"
                  style={{ fontSize: `${layoutConfig.subtitleFontSize}px` }}
                >
                  {layoutConfig.sessions.saleProducts.subtitleText}
                </p>
              )}
            </motion.div>
          )}

          {/* Active Campaign Countdown */}
          {layoutConfig.showFilterBar && (
            <div className="flex justify-center lg:justify-end">
              <CountdownTimer targetDate={targetDate} locale={locale} />
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div
          className="grid auto-rows-fr"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: `${layoutConfig.gap}px`
          }}
        >
          {isLoading ? (
            Array.from({ length: totalToShow }).map((_, i) => <ProductSkeleton key={i} />)
          ) : (
            products?.slice(0, totalToShow).map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
              />
            ))
          )}
        </div>

        {/* Action Footer */}
        {layoutConfig.showViewAll && (
          <div className="mt-24 flex flex-col items-center">
            <Link href="/collections">
              <button className="explore-all-btn-luxury flex items-center gap-4 focus:outline-none">
                <span>{t('viewAll')}</span>
                <div className="arrow-circle flex h-10 w-10 items-center justify-center rounded-full">
                  <ArrowRight size={15} />
                </div>
              </button>
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
