'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import api from '@/lib/api';
import { Link } from '@/navigation';
import { ProductCard, type ProductData } from './product-card';
import './new-products.css';

const fetchNewProducts = async (): Promise<ProductData[]> => {
  const { data } = await api.get('/products/new');
  return data.data;
};

// --- Skeleton Component ---
const ProductSkeleton = () => (
  <div className="flex flex-col gap-6">
    <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-[#7A5C5C]/5" />
    <div className="flex flex-col items-center gap-3">
      <div className="h-3 w-16 animate-pulse rounded bg-[#7A5C5C]/5" />
      <div className="h-4 w-32 animate-pulse rounded bg-[#7A5C5C]/5" />
      <div className="h-5 w-20 animate-pulse rounded bg-[#7A5C5C]/5" />
    </div>
  </div>
);

export function NewProducts() {
  const t = useTranslations('NewProducts');
  const locale = useLocale();
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['new-products'],
    queryFn: fetchNewProducts,
  });

  if (error) return null;

  return (
    <section className="new-products-section w-full bg-transparent pt-12 pb-24 lg:pt-20 lg:pb-36 overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* Header Section */}
        <div className="relative mb-16 lg:mb-24 flex flex-col items-center text-center">
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
          <div className="mt-8 h-px w-24 bg-gradient-to-r from-transparent via-[#D4A5A5]/40 to-transparent" />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <ProductSkeleton key={i} />)
          ) : (
            products?.map((product, index) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                index={index} 
              />
            ))
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
