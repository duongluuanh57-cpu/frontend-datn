'use client';

import React, { useState } from 'react';
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

const fetchAllBrands = async () => {
  const { data } = await api.get('/brands');
  return data.data || [];
};

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

export function NewProducts() {
  const t = useTranslations('NewProducts');
  const locale = useLocale();
  
  // 1. Fetch data
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['new-products'],
    queryFn: fetchNewProducts,
  });

  const { data: allBrands } = useQuery({
    queryKey: ['all-brands-list'],
    queryFn: fetchAllBrands,
  });

  // 2. States for Filters and Sort
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [isBrandOpen, setIsBrandOpen] = useState<boolean>(false);

  if (error) return null;

  // 3. Extract unique Brands for options dynamically from database
  const brands = Array.from(
    new Set(
      (allBrands
        ?.map((b: any) => b.name)
        .filter(Boolean) || []) as string[]
    )
  ).sort() as string[];

  // Hardcode standard capacity sizes for clean luxury selection
  const capacities = ['2ml', '5ml', '10ml', '30ml', '50ml', '100ml', '150ml', '200ml'];

  // Helper to get actual price of a product (including active discount)
  const getActualPrice = (product: ProductData) => {
    if (!product.price) return 0;
    
    const hasActiveDiscount = () => {
      if (!product.discountPercentage || product.discountPercentage <= 0) return false;
      
      const now = new Date();
      if (product.discountStartDate) {
        const start = new Date(product.discountStartDate);
        if (now < start) return false;
      }
      
      if (product.discountEndDate) {
        const end = new Date(product.discountEndDate);
        if (now > end) return false;
      }
      
      return true;
    };

    if (hasActiveDiscount()) {
      return product.price * (1 - (product.discountPercentage || 0) / 100);
    }
    
    return product.price;
  };

  // 4. Filtering Logic
  const filteredProducts = products ? products.filter((product) => {
    // Filter by Brand
    if (selectedBrand !== 'all') {
      const bName = (product.brand as any)?.name || (typeof product.brand === 'string' ? product.brand : '') || (product as any).brandName || '';
      if (bName.toLowerCase() !== selectedBrand.toLowerCase()) return false;
    }

    // Filter by Capacity
    if (selectedCapacity !== 'all') {
      const parsedSizes = product.size
        ? product.size
            .split(',')
            .map((s) => {
              const parts = s.trim().split(':');
              return parts[0].trim().toLowerCase();
            })
            .filter(Boolean)
        : [];
      if (!parsedSizes.includes(selectedCapacity.toLowerCase())) return false;
    }

    // Filter by Price Range
    if (selectedPriceRange !== 'all') {
      const actualPrice = getActualPrice(product);
      if (selectedPriceRange === 'under-1m' && actualPrice >= 1000000) return false;
      if (selectedPriceRange === '1m-3m' && (actualPrice < 1000000 || actualPrice > 3000000)) return false;
      if (selectedPriceRange === 'over-3m' && actualPrice <= 3000000) return false;
    }

    return true;
  }) : [];

  // 5. Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (selectedSort === 'price-asc') {
      return getActualPrice(a) - getActualPrice(b);
    }
    if (selectedSort === 'price-desc') {
      return getActualPrice(b) - getActualPrice(a);
    }
    // Default: Newest
    return new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime();
  });

  const handleResetFilters = () => {
    setSelectedBrand('all');
    setSelectedCapacity('all');
    setSelectedPriceRange('all');
    setSelectedSort('newest');
    setIsBrandOpen(false);
  };

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
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 sm:gap-4 text-[#7A5C5C]/80 w-full lg:w-auto">
              {/* Reset Filters Button */}
              {(selectedBrand !== 'all' || selectedCapacity !== 'all' || selectedPriceRange !== 'all' || selectedSort !== 'newest') && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResetFilters}
                  className="self-end h-[38px] flex items-center justify-center gap-1.5 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#D4A5A5] border border-[#D4A5A5]/20 bg-[#D4A5A5]/5 hover:bg-[#D4A5A5]/10 transition-all duration-300 backdrop-blur-md cursor-pointer w-full sm:w-auto"
                >
                  <span className="text-[12px] font-normal leading-none">×</span>
                  {locale === 'vi' ? 'Hủy lọc' : 'Clear'}
                </motion.button>
              )}

              {/* Brand Filter */}
              <div className="relative flex flex-col gap-1.5 min-w-[120px] sm:min-w-[130px] flex-1 sm:flex-initial">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">
                  {locale === 'vi' ? 'Hãng' : 'Brand'}
                </label>
                
                {/* Custom Luxury Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => setIsBrandOpen(!isBrandOpen)}
                  className="flex items-center justify-between w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium backdrop-blur-md focus:outline-none focus:border-[#D4A5A5] focus:ring-1 focus:ring-[#D4A5A5]/20 transition-all cursor-pointer text-[#7A5C5C] h-[38px] text-left"
                >
                  <span className="truncate">
                    {selectedBrand === 'all' 
                      ? (locale === 'vi' ? 'Tất cả' : 'All Brands') 
                      : selectedBrand}
                  </span>
                  <svg
                    className={`w-2.5 h-2.5 ml-2 transition-transform duration-300 opacity-60 shrink-0 text-[#7A5C5C]`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ transform: isBrandOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Custom Options list limited to ~5 items high with custom scrollbar */}
                {isBrandOpen && (
                  <>
                    {/* Invisible overlay backdrop for click-away behavior */}
                    <div 
                      className="fixed inset-0 z-40 bg-transparent cursor-default" 
                      onClick={() => setIsBrandOpen(false)} 
                    />
                    
                    <div className="absolute top-[58px] left-0 w-full bg-white/95 border border-[#7A5C5C]/10 rounded-xl shadow-xl z-50 py-1.5 max-h-[175px] overflow-y-auto backdrop-blur-lg flex flex-col scrollbar-thin scrollbar-thumb-[#7A5C5C]/10 scrollbar-track-transparent">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBrand('all');
                          setIsBrandOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-[#7A5C5C]/5 transition-colors cursor-pointer shrink-0 ${
                          selectedBrand === 'all' ? 'font-bold text-[#D4A5A5] bg-[#7A5C5C]/3' : 'text-[#7A5C5C]/80'
                        }`}
                      >
                        {locale === 'vi' ? 'Tất cả' : 'All Brands'}
                      </button>
                      {brands.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => {
                            setSelectedBrand(b);
                            setIsBrandOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-[#7A5C5C]/5 transition-colors truncate cursor-pointer shrink-0 ${
                            selectedBrand === b ? 'font-bold text-[#D4A5A5] bg-[#7A5C5C]/3' : 'text-[#7A5C5C]/80'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Capacity Filter */}
              <div className="flex flex-col gap-1.5 min-w-[120px] sm:min-w-[130px] flex-1 sm:flex-initial">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">
                  {locale === 'vi' ? 'Dung tích' : 'Capacity'}
                </label>
                <select
                  value={selectedCapacity}
                  onChange={(e) => setSelectedCapacity(e.target.value)}
                  className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium backdrop-blur-md focus:outline-none focus:border-[#D4A5A5] transition-all cursor-pointer text-[#7A5C5C]"
                >
                  <option value="all">{locale === 'vi' ? 'Tất cả' : 'All Sizes'}</option>
                  {capacities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="flex flex-col gap-1.5 min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-initial">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">
                  {locale === 'vi' ? 'Mức giá' : 'Price'}
                </label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium backdrop-blur-md focus:outline-none focus:border-[#D4A5A5] transition-all cursor-pointer text-[#7A5C5C]"
                >
                  <option value="all">{locale === 'vi' ? 'Tất cả' : 'All Prices'}</option>
                  <option value="under-1m">{locale === 'vi' ? 'Dưới 1 triệu' : 'Under 1M'}</option>
                  <option value="1m-3m">{locale === 'vi' ? '1 triệu - 3 triệu' : '1M - 3M'}</option>
                  <option value="over-3m">{locale === 'vi' ? 'Trên 3 triệu' : 'Over 3M'}</option>
                </select>
              </div>

              {/* Sort Control */}
              <div className="flex flex-col gap-1.5 min-w-[125px] sm:min-w-[140px] flex-1 sm:flex-initial">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">
                  {locale === 'vi' ? 'Sắp xếp' : 'Sort By'}
                </label>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium backdrop-blur-md focus:outline-none focus:border-[#D4A5A5] transition-all cursor-pointer text-[#7A5C5C]"
                >
                  <option value="newest">{locale === 'vi' ? 'Mới nhất' : 'Newest'}</option>
                  <option value="price-asc">{locale === 'vi' ? 'Giá tăng dần' : 'Price: Low-High'}</option>
                  <option value="price-desc">{locale === 'vi' ? 'Giá giảm dần' : 'Price: High-Low'}</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
          ) : sortedProducts.length > 0 ? (
            sortedProducts.slice(0, 4).map((product, index) => (
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
