'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/navigation';
import { ProductCard } from './product-card';
import './new-products.css';

import { useLimitedProducts } from './limited-products/useLimitedProducts';
import { ProductSkeleton } from './new-products/ProductSkeleton';
import { LimitedProductsFilterBar } from './limited-products/LimitedProductsFilterBar';
import { useHomepageTags } from '@/hooks/useHomepageTags';
import { useProductSessionLayout } from '@/store/useProductSessionPreviewStore';

export function LimitedProducts() {
  const layoutConfig = useProductSessionLayout();
  const filterTag = layoutConfig.sessions.limitedProducts.filterTag || 'limited';
  const formHelpers = useLimitedProducts(filterTag);
  const { getTagName } = useHomepageTags();
  const {
    locale,
    isLoading,
    error,
    products,
    isFiltering
  } = formHelpers;
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (error) return null;

  const cols = isMobile ? layoutConfig.columnsMobile : layoutConfig.columnsDesktop;
  const rows = isMobile ? layoutConfig.rowsMobile : layoutConfig.rowsDesktop;
  const totalToShow = cols * rows;

  return (
    <section className="new-products-section w-full bg-transparent pt-12 pb-10 lg:pt-20 lg:pb-14 overflow-hidden"
      style={{ contain: 'content', contentVisibility: 'auto' } as React.CSSProperties}>
      <div className="px-6">
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
                Sản phẩm giới hạn
              </span>
              <h2
                className="mt-4 font-medium text-[#7A5C5C]"
                style={{ fontSize: `${layoutConfig.sectionTitleFontSize}px` }}
              >
                {layoutConfig.sessions.limitedProducts.titleText}
              </h2>
              {layoutConfig.showSubtitle && (
                <p
                  className="mt-3 text-[#7A5C5C] max-w-[480px] font-medium leading-relaxed"
                  style={{ fontSize: `${layoutConfig.subtitleFontSize}px` }}
                >
                  {layoutConfig.sessions.limitedProducts.subtitleText}
                </p>
              )}
            </motion.div>
          )}

          {layoutConfig.showFilterBar && !isLoading && products && products.length > 0 && (
            <LimitedProductsFilterBar formHelpers={formHelpers} />
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <div
            className="grid auto-rows-fr"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: `${layoutConfig.gap}px`
            }}
          >
            {isLoading ? (
              Array.from({ length: totalToShow }).map((_, i) => <ProductSkeleton key={i} />)
            ) : products.length > 0 ? (
              products.slice(0, totalToShow).map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={index}
                />
              ))
            ) : (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-medium text-[#7A5C5C]/60 bg-white/60 border border-[#7A5C5C]/10 rounded-2xl px-8 py-6 shadow-sm">
                  {locale === 'vi'
                    ? 'Chưa có sản phẩm giới hạn nào phù hợp với bộ lọc.'
                    : 'No limited products found matching the filters.'}
                </span>
              </div>
            )}
          </div>
          {isFiltering && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm rounded-xl z-10">
              <div className="w-6 h-6 border-2 border-[#D4A5A5] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {layoutConfig.showViewAll && (
          <div className="mt-24 flex flex-col items-center">
            <Link href="/collections">
              <button className="explore-all-btn-luxury flex items-center gap-4 focus:outline-none">
                <span>{locale === 'vi' ? 'Khám phá bộ sưu tập' : 'Explore All Collections'}</span>
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
