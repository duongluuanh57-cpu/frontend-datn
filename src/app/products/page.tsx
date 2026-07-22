'use client';

import { useState, useMemo, useCallback, useEffect, useRef, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { ProductCard } from '@/components/shared/product-card';
import { ProductFilterBar } from '@/components/products/product-filter-bar';
import { BrandStrip } from '@/components/products/brand-strip';
import Pagination from '@/components/products/pagination';
import { ProductGridSkeleton } from '@/components/shared/product-grid-skeleton';
import { useProductsFilterStore } from '@/store/useProductsFilterStore';
import api from '@/lib/api';

interface ProductItem {
  _id: string; name: string; brand: string; price: number;
  originalPrice?: number; image: string; tag?: string;
  discount?: number; reviewsCount?: number; soldCount?: number;
  categories?: string;
}

type SortOption = 'newest' | 'priceAsc' | 'priceDesc' | 'bestSeller';
const PER_PAGE = 20;

const SESSION_SLUGS: Record<string, string[]> = {
  hot: ['hot', 'ban-chay', 'thinh-hanh', 'trending'],
  new: ['new', 'san-pham-moi'],
  limited: ['limited', 'gioi-han', 'gioi-han-dac-biet'],
  standard: ['standard'],
  sale: ['sale', 'giam-gia'],
};

function realPrice(p: ProductItem): number {
  if (p.discount && p.discount > 0) return Math.round(p.price * (1 - p.discount / 100));
  return p.price;
}

function ProductsPageContent() {
  const consumeFilter = useProductsFilterStore((s) => s.consumeFilter);
  const [initialFilter] = useState(() => consumeFilter());

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>(initialFilter.sortBy as SortOption);
  const [selectedTag] = useState(initialFilter.tag);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialFilter.brand ? [initialFilter.brand] : []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilter.category ? [initialFilter.category] : []);
  const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);
  const [filterFixed, setFilterFixed] = useState(false);
  const [filterHeight, setFilterHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        setFilterFixed(headerBottom <= 0);
      }
      if (filterRef.current && filterHeight === 0) {
        setFilterHeight(filterRef.current.offsetHeight);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filterHeight]);

  const { data: pd, isLoading, error } = useQuery({
    queryKey: ['products-all', sortBy, selectedCategories],
    queryFn: async () => {
      const params: Record<string, string | number> = { page: 1, limit: 500, sortBy };
      if (selectedCategories.length > 0) params.category = selectedCategories[0];
      const { data } = await api.get('/products', { params });
      return data.data as { items: ProductItem[]; total: number };
    },
    staleTime: 30_000,
  });

  const sessionType = (selectedTag || (sortBy === 'bestSeller' ? 'hot' : sortBy === 'newest' ? 'new' : undefined)) as 'hot' | 'new' | 'limited' | 'standard' | 'sale' | undefined;
  const processed = useMemo(() => {
    const raw: ProductItem[] = pd?.items || [];
    let arr = [...raw];
    if (selectedTag) {
      const allowedSlugs = SESSION_SLUGS[selectedTag] || [];
      arr = arr.filter(p => {
        const slugs = (p.tag || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        return slugs.some(s => allowedSlugs.includes(s));
      });
    }
    if (selectedBrands.length > 0) arr = arr.filter(p => selectedBrands.includes(p.brand));
    if (selectedCategories.length > 0) arr = arr.filter(p => selectedCategories.some(cat => p.categories?.includes(cat)));
    if (sortBy === 'priceAsc') arr.sort((a, b) => realPrice(a) - realPrice(b));
    else if (sortBy === 'priceDesc') arr.sort((a, b) => realPrice(b) - realPrice(a));
    if (priceMin !== undefined) arr = arr.filter(p => realPrice(p) >= priceMin);
    if (priceMax !== undefined) arr = arr.filter(p => realPrice(p) <= priceMax);
    return arr;
  }, [pd, selectedTag, selectedBrands, selectedCategories, sortBy, priceMin, priceMax]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PER_PAGE));
  const products = processed.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const goTo = useCallback((p: number) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  const resetPage = useCallback(() => setCurrentPage(1), []);

  const hasActive = sortBy !== 'newest' || selectedBrands.length > 0 || selectedCategories.length > 0 || priceMin !== undefined || priceMax !== undefined;

  const clearAll = useCallback(() => {
    setSortBy('newest'); setSelectedBrands([]); setSelectedCategories([]);
    setPriceMin(undefined); setPriceMax(undefined); setCurrentPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div ref={headerRef} className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="flex items-center gap-2 text-sm text-text-muted mb-3">
            <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-text-primary font-medium">Tất cả sản phẩm</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Tất Cả Sản Phẩm</h1>
          {!isLoading && <p className="text-sm text-text-muted mt-1">{processed.length} sản phẩm</p>}
        </div>
      </div>

      {filterFixed && <div style={{ height: filterHeight || 60 }} />}

      <div
        ref={filterRef}
        className={`transition-transform duration-200 ${
          filterFixed ? 'fixed top-[64px] md:top-[80px] left-0 right-0 z-40' : 'relative z-10'
        } bg-background/95 backdrop-blur-sm border-b border-border shadow-xs`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <ProductFilterBar
            sortBy={sortBy}
            onSortChange={(v) => { setSortBy(v); resetPage(); }}
            selectedBrands={selectedBrands}
            onBrandSelect={(brands) => { setSelectedBrands(brands); resetPage(); }}
            selectedCategories={selectedCategories}
            onCategorySelect={(cats) => { setSelectedCategories(cats); resetPage(); }}
            priceMin={priceMin}
            priceMax={priceMax}
            onPriceApply={(min, max) => { setPriceMin(min > 0 ? min : undefined); setPriceMax(max < Infinity ? max : undefined); resetPage(); }}
            onPriceClear={() => { setPriceMin(undefined); setPriceMax(undefined); resetPage(); }}
            hasActiveFilters={hasActive}
            onClearAll={clearAll}
          />
        </div>
      </div>

      <BrandStrip selectedBrands={selectedBrands} onSelect={(brands) => { setSelectedBrands(brands); resetPage(); }} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mt-6">
          {isLoading || error ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Package size={32} className="text-text-muted mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy sản phẩm</h3>
              {hasActive && (
                <button onClick={clearAll}
                  className="px-5 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-xl cursor-pointer">
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product, idx) => (
                  <div key={product._id} className="animate-fade-up opacity-0"
                    style={{ animationDelay: `${idx * 0.05}s` }}>
                    <ProductCard product={product} sessionType={sessionType} cardIndex={idx} />
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goTo} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageContent />
    </Suspense>
  );
}