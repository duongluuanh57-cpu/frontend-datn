'use client';

<<<<<<< HEAD
import { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
=======
import { useState, useMemo, useCallback } from 'react';
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, SearchX, Package } from 'lucide-react';
import { ProductCard } from '@/components/shared/product-card';
import { ProductFilterBar } from '@/components/products/product-filter-bar';
import api from '@/lib/api';

interface ProductItem {
  _id: string; name: string; brand: string; price: number;
  originalPrice?: number; image: string; tag?: string;
  discount?: number; reviewsCount?: number; soldCount?: number;
<<<<<<< HEAD
  categories?: string;
=======
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
}

type SortOption = 'newest' | 'priceAsc' | 'priceDesc' | 'bestSeller';
const PER_PAGE = 20;

<<<<<<< HEAD
const SESSION_SLUGS: Record<string, string[]> = {
  hot: ['hot', 'ban-chay', 'thinh-hanh', 'trending'],
  new: ['new', 'san-pham-moi'],
  limited: ['limited', 'gioi-han', 'gioi-han-dac-biet'],
  standard: ['standard'],
  sale: ['sale', 'giam-gia'],
};

=======
/** Giá thực sau discount */
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
function realPrice(p: ProductItem): number {
  if (p.discount && p.discount > 0) return Math.round(p.price * (1 - p.discount / 100));
  return p.price;
}

<<<<<<< HEAD
function ProductsPageContent() {
  const searchParams = useSearchParams();
  const tagFromUrl = searchParams.get('tag') || '';
  const sortByFromUrl = (searchParams.get('sortBy') as SortOption) && ['newest', 'priceAsc', 'priceDesc', 'bestSeller'].includes(searchParams.get('sortBy') as string)
    ? (searchParams.get('sortBy') as SortOption) : 'newest';
  const categoryFromUrl = searchParams.get('category') || '';

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>(sortByFromUrl);
  const [selectedTag, setSelectedTag] = useState(tagFromUrl);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
=======
export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
  const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);
  const [brandOpen, setBrandOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

<<<<<<< HEAD
  // Sync state khi URL params thay đổi (client-side navigation)
  useEffect(() => {
    setSelectedTag(searchParams.get('tag') || '');
    const sort = searchParams.get('sortBy');
    if (sort && ['newest', 'priceAsc', 'priceDesc', 'bestSeller'].includes(sort)) {
      setSortBy(sort as SortOption);
    }
    setSelectedCategory(searchParams.get('category') || '');
    setCurrentPage(1);
  }, [searchParams]);

  const { data: pd, isLoading, error } = useQuery({
    queryKey: ['products-all', sortBy, selectedCategory],
    queryFn: async () => {
      const params: Record<string, string | number> = { page: 1, limit: 500, sortBy };
      if (selectedCategory) params.category = selectedCategory;
      const { data } = await api.get('/products', { params });
=======
  // Fetch tối đa 500 sản phẩm để sort + filter client-side
  const { data: pd, isLoading, error } = useQuery({
    queryKey: ['products-all', sortBy],
    queryFn: async () => {
      const { data } = await api.get('/products', { params: { page: 1, limit: 500, sortBy } });
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
      return data.data as { items: ProductItem[]; total: number };
    },
    staleTime: 30_000,
  });

<<<<<<< HEAD
  const sessionType = selectedTag || (sortBy === 'bestSeller' ? 'hot' : sortBy === 'newest' ? 'new' : undefined);
  const raw: ProductItem[] = pd?.items || [];
  const totalAll = pd?.total || 0;

  const processed = useMemo(() => {
    let arr = [...raw];
    if (selectedTag) {
      const allowedSlugs = SESSION_SLUGS[selectedTag] || [];
      arr = arr.filter(p => {
        const slugs = (p.tag || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        return slugs.some(s => allowedSlugs.includes(s));
      });
    }
    if (selectedBrand) arr = arr.filter(p => p.brand === selectedBrand);
    if (selectedCategory) arr = arr.filter(p => p.categories?.includes(selectedCategory));
    if (sortBy === 'priceAsc') arr.sort((a, b) => realPrice(a) - realPrice(b));
    else if (sortBy === 'priceDesc') arr.sort((a, b) => realPrice(b) - realPrice(a));
    if (priceMin !== undefined) arr = arr.filter(p => realPrice(p) >= priceMin);
    if (priceMax !== undefined) arr = arr.filter(p => realPrice(p) <= priceMax);
    return arr;
  }, [raw, selectedTag, selectedBrand, selectedCategory, sortBy, priceMin, priceMax]);

=======
  const raw: ProductItem[] = pd?.items || [];
  const totalAll = pd?.total || 0;

  // Client-side filter + sort
  const processed = useMemo(() => {
    let arr = [...raw];
    if (selectedBrand) arr = arr.filter(p => p.brand === selectedBrand);
    if (selectedCategory) arr = arr.filter(p => (p as any).category === selectedCategory);
    // Sort by discounted price
    if (sortBy === 'priceAsc') arr.sort((a, b) => realPrice(a) - realPrice(b));
    else if (sortBy === 'priceDesc') arr.sort((a, b) => realPrice(b) - realPrice(a));
    // newest và bestSeller đã được backend sort
    if (priceMin !== undefined) arr = arr.filter(p => realPrice(p) >= priceMin);
    if (priceMax !== undefined) arr = arr.filter(p => realPrice(p) <= priceMax);
    return arr;
  }, [raw, selectedBrand, selectedCategory, sortBy, priceMin, priceMax]);

  // Client-side pagination
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
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

  const hasActive = sortBy !== 'newest' || selectedBrand !== '' || selectedCategory !== '' || priceMin !== undefined || priceMax !== undefined;

  const clearAll = useCallback(() => {
    setSortBy('newest'); setSelectedBrand(''); setSelectedCategory('');
    setPriceMin(undefined); setPriceMax(undefined); setCurrentPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-background">
<<<<<<< HEAD
=======
      {/* Header */}
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
      <div className="bg-surface border-b border-border">
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

      <div className="max-w-7xl mx-auto px-4 py-6">
<<<<<<< HEAD
=======
        {/* Filter Bar */}
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
        <ProductFilterBar
          sortBy={sortBy}
          onSortChange={(v) => { setSortBy(v); resetPage(); }}
          selectedBrand={selectedBrand}
          onBrandSelect={(b) => { setSelectedBrand(b); resetPage(); setBrandOpen(false); }}
          selectedCategory={selectedCategory}
          onCategorySelect={(c) => { setSelectedCategory(c); resetPage(); setCategoryOpen(false); }}
          priceMin={priceMin}
          priceMax={priceMax}
          onPriceApply={(min, max) => { setPriceMin(min > 0 ? min : undefined); setPriceMax(max < Infinity ? max : undefined); resetPage(); setPriceOpen(false); }}
          onPriceClear={() => { setPriceMin(undefined); setPriceMax(undefined); resetPage(); setPriceOpen(false); }}
          brandOpen={brandOpen}
          onBrandToggle={() => { setBrandOpen(!brandOpen); setCategoryOpen(false); }}
          categoryOpen={categoryOpen}
          onCategoryToggle={() => { setCategoryOpen(!categoryOpen); setBrandOpen(false); }}
          priceOpen={priceOpen}
          onPriceToggle={() => setPriceOpen(!priceOpen)}
          hasActiveFilters={hasActive}
          onClearAll={clearAll}
        />

<<<<<<< HEAD
=======
        {/* Loading */}
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
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

<<<<<<< HEAD
=======
        {/* Error */}
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <SearchX size={32} className="text-red-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Lỗi tải sản phẩm</h3>
            <button onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-primary text-rich-black text-sm font-semibold rounded-xl cursor-pointer">
              Thử lại
            </button>
          </div>
        )}

<<<<<<< HEAD
=======
        {/* Empty */}
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
        {!isLoading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Package size={32} className="text-text-muted mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy sản phẩm</h3>
            {hasActive && (
              <button onClick={clearAll}
                className="px-5 py-2.5 bg-primary text-rich-black text-sm font-semibold rounded-xl cursor-pointer">
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

<<<<<<< HEAD
=======
        {/* Products */}
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
        {!isLoading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, idx) => (
                <div key={product._id} className="animate-fade-up opacity-0"
                  style={{ animationDelay: `${idx * 0.05}s` }}>
<<<<<<< HEAD
                  <ProductCard product={product} sessionType={sessionType} cardIndex={idx} />
=======
                  <ProductCard product={product} sessionType="standard" cardIndex={idx} />
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10 pb-8">
                <button onClick={() => goTo(currentPage - 1)} disabled={currentPage <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-surface hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
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
                          : 'bg-surface border border-border text-text-secondary hover:border-primary'
                      }`}>
                      {page}
                    </button>
                  )
                )}
                <button onClick={() => goTo(currentPage + 1)} disabled={currentPage >= totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-surface hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
<<<<<<< HEAD

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <div className="bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="h-4 bg-text-muted/10 rounded w-32 mb-3" />
            <div className="h-8 bg-text-muted/10 rounded w-48" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
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
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
=======
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
