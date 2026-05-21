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

export function LimitedProducts() {
  const formHelpers = useLimitedProducts();
  const { getTagName } = useHomepageTags();
  const {
    locale,
    isLoading,
    error,
    products,
    sortedProducts
  } = formHelpers;

  if (error) return null;

  return (
    <section className="new-products-section w-full bg-transparent pt-12 pb-10 lg:pt-20 lg:pb-14 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="relative mb-16 lg:mb-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 border-b border-[#D4A5A5]/10 pb-8">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.span
              initial={{ opacity: 0, letterSpacing: '0.2em' }}
              whileInView={{ opacity: 1, letterSpacing: '0.45em' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-[10px] font-bold uppercase text-[#D4A5A5]"
            >
              Sản phẩm giới hạn
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="mt-4 text-3xl font-medium text-[#7A5C5C] md:text-4xl lg:text-5xl"
            >
              Sản phẩm giới hạn
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-3 text-[11px] md:text-xs text-[#7A5C5C] max-w-[480px] font-medium leading-relaxed"
            >
              {locale === 'vi'
                ? 'Khám phá những dòng hương giới hạn được chọn lọc cho bộ sưu tập riêng, số lượng ít và tinh tế.'
                : 'Discover a limited selection of rare fragrances curated for a more exclusive collection.'}
            </motion.p>
          </div>

          {!isLoading && products && products.length > 0 && (
            <LimitedProductsFilterBar formHelpers={formHelpers} />
          )}
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
          ) : sortedProducts.length > 0 ? (
            sortedProducts.slice(0, 8).map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                forceTag="Limited"
              />
            ))
          ) : (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-medium text-[#7A5C5C]/60 backdrop-blur-md bg-white/30 border border-[#7A5C5C]/10 rounded-2xl px-8 py-6 shadow-sm">
                {locale === 'vi'
                  ? 'Chưa có sản phẩm giới hạn nào phù hợp với bộ lọc.'
                  : 'No limited products found matching the filters.'}
              </span>
            </div>
          )}
        </div>

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
      </div>
    </section>
  );
}
