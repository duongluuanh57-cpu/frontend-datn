'use client';

import { motion, useReducedMotion } from 'framer-motion';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/shared/product-card';
import { useProductsFilterStore } from '@/store/useProductsFilterStore';
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
}

const SESSION_NAMES: Record<string, { title: string }> = {
  hot: { title: 'Ban chay' },
  new: { title: 'Moi nhat' },
  limited: { title: 'Limited' },
  standard: { title: 'Pho bien' },
  sale: { title: 'Flash Sale' },
};

type SessionType = 'hot' | 'new' | 'limited' | 'standard' | 'sale';

// Render helpers cho từng layout

function GridLayout({ products, sessionType }: { products: any[]; sessionType?: SessionType }) {
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

function HorizontalLayout({ products, showNavigation, sessionType }: { products: any[]; showNavigation?: boolean; sessionType?: SessionType }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 276;
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
            className="absolute -left-12 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-background/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-background hover:scale-110 transition-all cursor-pointer border border-border"
            aria-label="Scroll left"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute -right-12 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-background/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-background hover:scale-110 transition-all cursor-pointer border border-border"
            aria-label="Scroll right"
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

function MarqueeLayout({ products, sessionType }: { products: any[]; sessionType?: SessionType }) {
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

function BentoLayout({ products, sessionType }: { products: any[]; sessionType?: SessionType }) {
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

function StaggerLayout({ products, sessionType }: { products: any[]; sessionType?: SessionType }) {
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

// Main Component

export function ProductSession({
  type, title, id, hideWhenEmpty = false, emptyMessage,
  layout = 'grid', products, maxProducts = 10, showNavigation = false,
  enablePriceFilter = false,
}: ProductSessionProps) {
  const router = useRouter();
  const setFilterAndGo = useProductsFilterStore((s) => s.setFilterAndGo);
  const hasCustomTitle = title !== '';
  const t = hasCustomTitle ? (title || SESSION_NAMES[type]?.title || type) : '';
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
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

  // Skeleton loading
  if (products === undefined) {
    return (
      <section id={id} className="section-padding">
        <div className="section-container">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary">{t}</h2>
            </div>
            {enablePriceFilter && (
              <div className="relative">
                <button
                  onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-foreground/5 text-text-secondary hover:border-primary hover:text-primary transition-colors cursor-pointer"
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
                </button>
                {isPriceFilterOpen && (
                  <PriceFilterPopup
                    isOpen={isPriceFilterOpen}
                    onClose={() => setIsPriceFilterOpen(false)}
                    onApply={handleApplyPriceFilter}
                    onClear={handleClearPriceFilter}
                    initialMin={0}
                    initialMax={5000000}
                    popupId={id}
                  />
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-foreground/5 border border-border rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-text-muted/10" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-text-muted/10 rounded w-1/3" />
                  <div className="h-4 bg-text-muted/10 rounded w-2/3" />
                  <div className="h-5 bg-text-muted/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products && products.length === 0) {
    return null;
  }

  return (
    <section id={id} className="section-padding">
      <div className="section-container">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">{t}</h2>
          </div>
          {enablePriceFilter && (
            <div className="relative">
              <button
                onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
                  priceRange
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-foreground/5 border-border text-text-secondary hover:border-primary hover:text-primary'
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
                  popupId={id}
                />
              )}
            </div>
          )}
        </div>

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
            <button
              onClick={() => router.push(setFilterAndGo({ pendingTag: type }))}
              className="px-6 py-3 bg-foreground/5 border border-border rounded-lg text-sm font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>
        )}
      </div>
    </section>
  );
}