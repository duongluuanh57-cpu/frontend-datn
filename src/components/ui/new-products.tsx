'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/navigation';
import { ProductCard } from './product-card';
import './new-products.css';

// Subcomponents & Hook
import { useNewProducts } from './new-products/useNewProducts';
import { ProductSkeleton } from './new-products/ProductSkeleton';
import { NewProductsFilterBar } from './new-products/NewProductsFilterBar';

export function NewProducts() {
  const formHelpers = useNewProducts();
  const {
    t,
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
        
        {/* Header Section */}
        <div className="relative mb-16 lg:mb-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 border-b border-[#D4A5A5]/10 pb-8">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.span 
              initial={{ opacity: 0, letterSpacing: '0.2em' }}
              whileInView={{ opacity: 1, letterSpacing: '0.45em' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-[10px] font-bold uppercase text-[#D4A5A5]"
            >
              L'essence Arrivals
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="mt-4 text-3xl font-medium text-[#7A5C5C] md:text-4xl lg:text-5xl"
            >
              {t('title')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-3 text-[11px] md:text-xs text-[#7A5C5C] max-w-[480px] font-medium leading-relaxed"
            >
              {locale === 'vi'
                ? 'Khám phá những kiệt tác mùi hương mới nhất vừa cập bến bộ sưu tập L\'essence.'
                : 'Discover the latest olfactory masterpieces freshly arrived in our boutique.'}
            </motion.p>
          </div>

          {/* Filters Controls Bar */}
          {!isLoading && products && products.length > 0 && (
            <NewProductsFilterBar formHelpers={formHelpers} />
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
          ) : sortedProducts.length > 0 ? (
            sortedProducts.slice(0, 8).map((product, index) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                index={index} 
              />
            ))
          ) : (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-medium text-[#7A5C5C]/60 backdrop-blur-md bg-white/30 border border-[#7A5C5C]/10 rounded-2xl px-8 py-6 shadow-sm">
                {locale === 'vi' 
                  ? 'Không tìm thấy sản phẩm mới nào phù hợp với bộ lọc.' 
                  : 'No new products found matching the filters.'}
              </span>
            </div>
          )}
        </div>

        {/* Action Footer */}
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
        
      </div>
    </section>
  );
}
