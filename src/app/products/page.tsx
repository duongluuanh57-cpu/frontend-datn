'use client';

import { useState, useMemo, useCallback, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, SearchX, Package } from 'lucide-react';
import { ProductCard } from '@/components/shared/product-card';
import { ProductFilterBar } from '@/components/products/product-filter-bar';
import { BrandStrip } from '@/components/products/brand-strip';
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

/** Real price after discount */
function realPrice(p: ProductItem): number {
  if (p.discount && p.discount > 0) return Math.round(p.price * (1 - p.discount / 100));
  return p.price;
}

function ProductsPageContent() {
  const router = useRouter();
  const consumeFilter = useProductsFilterStore((s) => s.consumeFilter);

  // Init from store on first mount
  const [initialFilter] = useState(() => consumeFilter());

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>(initialFilter.sortBy as SortOption);
  const [selectedTag, setSelectedTag] = useState(initialFilter.tag);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialFilter.brand ? [initialFilter.brand] : []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilter.category ? [initialFilter.category] : []);
  const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);
  const [filterFixed, setFilterFixed] = useState(false);
  const [filterHeight, setFilterHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Scroll listener to fix filter bar below navbar
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        setFilterFixed(headerBottom <= 0);
      }
      // Track filter bar height for placeholder
      if (filterRef.current && filterHeight === 0) {
        setFilterHeight(filterRef.current.offsetHeight);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filterHeight]);

  // Fetch up to 500 products for client-side sort + filter
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
  const raw: ProductItem[] = pd?.items || [];
  const totalAll = pd?.total || 0;

  // Client-side filter + sort
  const processed = useMemo(() => {
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
    // Sort by discounted price
    if (sortBy === 'priceAsc') arr.sort((a, b) => realPrice(a) - realPrice(b));
    else if (sortBy === 'priceDesc') arr.sort((a, b) => realPrice(b) - realPrice(a));
    // newest and bestSeller are sorted by backend
    if (priceMin !== undefined) arr = arr.filter(p => realPrice(p) >= priceMin);
    if (priceMax !== undefined) arr = arr.filter(p => realPrice(p) <= priceMax);
    return arr;
  }, [raw, selectedTag, selectedBrands, selectedCategories, sortBy, priceMin, priceMax]);

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(processed.length / PER_PAGE));
  const products = processed.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const pages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const p: (number | string)[] = [1];
    if (currentPage > 3) p.push('...');
    const s = Math.max(2, currentPage - 1);
    const e = Math.min(totalPages - 1, currentPage + 1);
    for (let i = s; i <= e; i++) p.push(i);
    if (currentPage < totalPages - 2) p.push('...');
    p.push(totalPages);
    return p;
  }, [currentPage, totalPages]);

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

      {/* Filter bar placeholder when fixed */}
      {filterFixed && <div style={{ height: filterHeight || 60 }} />}

      {/* Filter Bar — fixed below navbar on scroll */}
      <div
        ref={filterRef}
        className={`transition-transform duration-200 ${
          filterFixed
            ? 'fixed top-[64px] md:top-[80px] left-0 right-0 z-40'
            : 'relative z-10'
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

      {/* Brand Strip */}
      <BrandStrip selectedBrands={selectedBrands} onSelect={(brands) => { setSelectedBrands(brands); resetPage(); }} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mt-6">
        {/* Loading / Error — always show skeleton loading */}
        {(isLoading || error) && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
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
        )}

        {/* Empty */}
        {!isLoading && !error && products.length === 0 && (
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
        )}

        {/* Products */}
        {!isLoading && !error && products.length > 0 && (
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
              <div className="flex items-center justify-center gap-2 mt-10 pb-8">
                <button onClick={() => goTo(currentPage - 1)} disabled={currentPage <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-foreground/5 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                  <ChevronLeft size={18} />
                </button>
                {pages.map((page, idx) =>
                  page === '...' ? (
                    <span key={`d-${idx}`} className="w-10 h-10 flex items-center justify-center text-text-muted">...</span>
                  ) : (
                    <button key={page} onClick={() => goTo(page as number)}
                      className={`w-10 h-10 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
                        currentPage === page
                          ? 'bg-primary text-rich-black shadow-sm'
                          : 'bg-foreground/5 border border-border text-text-secondary hover:border-primary'
                      }`}>
                      {page}
                    </button>
                  )
                )}
                <button onClick={() => goTo(currentPage + 1)} disabled={currentPage >= totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-foreground/5 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                  <ChevronRight size={18} />
                </button>
              </div>
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