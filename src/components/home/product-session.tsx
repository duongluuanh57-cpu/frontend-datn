'use client';

import { motion, useReducedMotion } from 'framer-motion';
import React, { useState, useMemo } from 'react';
<<<<<<< HEAD
import Link from 'next/link';
=======
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
import { ProductCard } from '@/components/shared/product-card';
import { PriceFilterPopup } from '@/components/shared/price-filter-popup';

interface ProductSessionProps {
  type: 'hot' | 'new' | 'limited' | 'standard' | 'sale';
  title: string;
  id?: string;
  hideWhenEmpty?: boolean;
  emptyMessage?: string;
  layout?: 'grid' | 'horizontal' | 'bento' | 'marquee' | 'stagger';
  products?: any[];
  maxProducts?: number;
  showNavigation?: boolean;
  enablePriceFilter?: boolean;
<<<<<<< HEAD
  viewAllHref?: string;
=======
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
}

const SESSION_NAMES: Record<string, { title: string }> = {
  hot: { title: 'Bán chạy' },
  new: { title: 'Mới nhất' },
  limited: { title: 'Limited' },
  standard: { title: 'Phổ biến' },
  sale: { title: 'Flash Sale' },
};

// ── Render helpers cho từng layout ──

function GridLayout({ products, sessionType }: { products: any[]; sessionType?: string }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
      {products.map((product, idx) => (
        <div key={product._id} className="animate-fade-up opacity-0" style={{ animationDelay: `${idx * 0.08}s` }}>
          <ProductCard product={product} sessionType={sessionType} cardIndex={idx} />
        </div>
      ))}
    </div>
  );
}

function HorizontalLayout({ products, showNavigation, sessionType }: { products: any[]; showNavigation?: boolean; sessionType?: string }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 276; // card width (260) + gap (16)
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative">
      {showNavigation && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all cursor-pointer border border-gray-200"
            aria-label="Scroll left"
            style={{ marginLeft: '-16px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all cursor-pointer border border-gray-200"
            aria-label="Scroll right"
            style={{ marginRight: '-16px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}
      <div ref={scrollRef} className="overflow-x-auto scrollbar-none px-4 pb-2">
        <div className="flex gap-4" style={{ scrollSnapType: 'x mandatory' }}>
          {products.map((product) => (
            <div key={product._id} className="min-w-[220px] max-w-[260px] flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
              <ProductCard product={product} sessionType={sessionType} cardIndex={0} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarqueeLayout({ products, sessionType }: { products: any[]; sessionType?: string }) {
  const reduce = useReducedMotion();
  const doubled = [...products, ...products];

  return (
    <div className="overflow-hidden -mx-4">
      <div
        className={`flex gap-4 ${reduce ? 'overflow-x-auto px-4' : 'animate-marquee'}`}
        style={reduce ? { scrollSnapType: 'x mandatory' } : { width: 'fit-content' }}
      >
        {doubled.map((product, idx) => (
          <div key={`${product._id}-${idx}`} className="min-w-[200px] max-w-[240px] flex-shrink-0">
            <ProductCard product={product} sessionType={sessionType} cardIndex={idx} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BentoLayout({ products, sessionType }: { products: any[]; sessionType?: string }) {
  if (products.length === 0) return null;

  const [hero, ...rest] = products;
  const cols = rest.slice(0, 4);

  return (
    <div className="grid md:grid-cols-4 gap-4 md:gap-6">
      <div className="md:col-span-2 md:row-span-2">
        <div className="h-full">
          <ProductCard product={hero} sessionType={sessionType} cardIndex={0} />
        </div>
      </div>
      <div className="md:col-span-2 grid grid-cols-2 gap-4 md:gap-6">
        {cols.map((product, idx) => (
          <div key={product._id} className="animate-fade-up opacity-0" style={{ animationDelay: `${idx * 0.08}s` }}>
            <ProductCard product={product} sessionType={sessionType} cardIndex={idx + 1} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StaggerLayout({ products, sessionType }: { products: any[]; sessionType?: string }) {
  const reduce = useReducedMotion();

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
      {products.map((product, idx) => (
        <motion.div
          key={product._id}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.5,
            delay: idx * 0.06,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <ProductCard product={product} sessionType={sessionType} cardIndex={idx} />
        </motion.div>
      ))}
    </div>
  );
}

// ── Main Component — Chỉ render data từ GraphQL, không tự fetch REST ──

export function ProductSession({
  type, title, id, hideWhenEmpty = false, emptyMessage,
  layout = 'grid', products = [], maxProducts = 10, showNavigation = false,
<<<<<<< HEAD
  enablePriceFilter = false, viewAllHref,
=======
  enablePriceFilter = false,
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
}: ProductSessionProps) {
  const hasCustomTitle = title !== '';
  const t = hasCustomTitle ? (title || SESSION_NAMES[type]?.title || type) : '';
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (priceRange) {
      result = result.filter(p => {
        const price = p.price || 0;
        return price >= priceRange.min && price <= priceRange.max;
      });
    }
    return result.slice(0, maxProducts);
  }, [products, priceRange, maxProducts]);

  const renderProducts = () => {
    switch (layout) {
      case 'horizontal': return <HorizontalLayout products={filteredProducts} showNavigation={showNavigation} sessionType={type} />;
      case 'marquee': return <MarqueeLayout products={filteredProducts} sessionType={type} />;
      case 'bento': return <BentoLayout products={filteredProducts} sessionType={type} />;
      case 'stagger': return <StaggerLayout products={filteredProducts} sessionType={type} />;
      default: return <GridLayout products={filteredProducts} sessionType={type} />;
    }
  };

  const handleApplyPriceFilter = (min: number, max: number) => {
    setPriceRange({ min, max });
  };

  const handleClearPriceFilter = () => {
    setPriceRange(null);
  };

  return (
    <section id={id} className="section-padding">
      <div className="section-container">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-text-primary">{t}</h2>
          </div>
          {enablePriceFilter && (
            <div className="relative">
              <button
                onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
                  priceRange
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-surface border-border text-text-secondary hover:border-primary hover:text-primary'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                <span className="text-sm font-medium">Lọc giá</span>
                {priceRange && (
                  <span className="w-2 h-2 bg-primary rounded-full" />
                )}
              </button>
              {isPriceFilterOpen && (
                <PriceFilterPopup
                  isOpen={isPriceFilterOpen}
                  onClose={() => setIsPriceFilterOpen(false)}
                  onApply={handleApplyPriceFilter}
                  onClear={handleClearPriceFilter}
                  initialMin={priceRange?.min ?? 0}
                  initialMax={priceRange?.max ?? 5000000}
                />
              )}
            </div>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          hideWhenEmpty ? null : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-text-secondary mb-1">{emptyMessage || 'Không có sản phẩm'}</p>
            </div>
          )
        ) : (
          <>
            {(() => {
              switch (layout) {
                case 'horizontal': return <HorizontalLayout products={filteredProducts} showNavigation={showNavigation} sessionType={type} />;
                case 'marquee': return <MarqueeLayout products={filteredProducts} sessionType={type} />;
                case 'bento': return <BentoLayout products={filteredProducts} sessionType={type} />;
                case 'stagger': return <StaggerLayout products={filteredProducts} sessionType={type} />;
                default: return <GridLayout products={filteredProducts} sessionType={type} />;
              }
            })()}
            {t && (
              <div className="flex justify-center mt-8">
<<<<<<< HEAD
                {viewAllHref ? (
                  <Link href={viewAllHref} className="px-6 py-3 bg-surface border border-border rounded-lg text-sm font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors cursor-pointer inline-block">
                    Xem tất cả
                  </Link>
                ) : (
                  <button className="px-6 py-3 bg-surface border border-border rounded-lg text-sm font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors cursor-pointer">
                    Xem tất cả
                  </button>
                )}
=======
                <button className="px-6 py-3 bg-surface border border-border rounded-lg text-sm font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors cursor-pointer">
                  Xem tất cả
                </button>
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}