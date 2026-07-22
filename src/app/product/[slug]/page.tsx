'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProductsFilterStore } from '@/store/useProductsFilterStore';
import { Star, Heart, ShoppingBag, Minus, Plus, ArrowLeft, ChevronDown, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { addToFavorites, removeFromFavorites, checkFavorite } from '@/services/favorite.service';
import { addToCart as addToCartAPI } from '@/services/cart.service';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { fetchProductDetail } from '@/lib/graphql';
import { resolveImageUrl } from '@/lib/api';
import { formatPrice } from '@/lib/formatPrice';
import { parseProductId, getProductSlug } from '@/lib/utils';
import { ProductCard } from '@/components/shared/product-card';
import type { ProductData } from '@/components/shared/product-card';
import { ProductReviews } from '@/components/products/product-reviews';

function ensurePerfumePrefix(name: string): string {
  if (!name || /^nước hoa\s/i.test(name)) return name;
  return `Nước hoa ${name}`;
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailContent />
    </Suspense>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-4 bg-foreground/5 rounded w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-foreground/5 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-4 bg-foreground/5 rounded w-1/4" />
              <div className="h-8 bg-foreground/5 rounded w-3/4" />
              <div className="h-4 bg-foreground/5 rounded w-1/2" />
              <div className="h-6 bg-foreground/5 rounded w-1/3" />
              <div className="h-24 bg-foreground/5 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetailContent() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const setFilterAndGo = useProductsFilterStore((s) => s.setFilterAndGo);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Extract product ID from URL slug like "nuoc-hoa-chanel-p.664f1a2b3c4d5e6f"
  const productId = slug ? parseProductId(slug) : null;

  const accessToken = useAuthStore((state) => state.accessToken);
  const addFavoriteId = useFavoriteStore((state) => state.addFavoriteId);
  const removeFavoriteId = useFavoriteStore((state) => state.removeFavoriteId);
  const incrementCart = useCartStore((state) => state.incrementCart);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('Không tìm thấy sản phẩm');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { productDetail: p, trendingProducts: suggestionsData } = await fetchProductDetail(productId);

        if (!p) {
          setError('Không tìm thấy sản phẩm');
          return;
        }

        setProduct(p);

        var apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        fetch(apiBase + '/api/products/' + productId + '/track-view', { method: 'POST', keepalive: true }).catch(function(){});

        const imgs: string[] = [];
        if (p.image) imgs.push(p.image);
        if (p.images && p.images.length > 0) {
          p.images.forEach((img: string) => { if (!imgs.includes(img)) imgs.push(img); });
        }
        setImages(imgs.length > 0 ? imgs : ['']);

        if (p.variants && p.variants.length > 0) {
          const inStockVariants = p.variants.filter((v: any) => v.quantityInStock > 0);
          if (inStockVariants.length > 0) {
            const defaultVariant = inStockVariants.find((v: any) => v.isDefault)
              || inStockVariants.find((v: any) => v.size === '50ml')
              || inStockVariants[0];
            setSelectedVariant(defaultVariant);
          }
        }

        if (suggestionsData && suggestionsData.length > 0) {
          const filtered = suggestionsData.filter((item: any) => item._id !== productId);
          setSuggestions(filtered.slice(0, 10));
        }

        if (accessToken) {
          try {
            const favResult = await checkFavorite(productId, accessToken);
            if (favResult.success && favResult.data?.isFavorite) setIsFavorite(true);
          } catch { /* ignore */ }
        }
      } catch {
        setError('Không thể tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, accessToken]);

  const handleToggleFavorite = useCallback(async () => {
    if (!accessToken || !productId) { toast.info('Vui lòng đăng nhập để sử dụng tính năng này'); return; }
    const next = !isFavorite;
    try {
      if (next) { await addToFavorites(productId, accessToken); addFavoriteId(productId); }
      else { await removeFromFavorites(productId, accessToken); removeFavoriteId(productId); }
      setIsFavorite(next);
    } catch { console.error('Failed to toggle favorite'); }
  }, [accessToken, productId, isFavorite, addFavoriteId, removeFavoriteId]);

  const handleAddToCart = useCallback(async () => {
    if (!accessToken || !productId) { toast.info('Vui lòng đăng nhập để thêm vào giỏ hàng'); return; }
    const size = selectedVariant?.size || '50ml';
    setAddingToCart(true);
    try {
      const result = await addToCartAPI(accessToken, productId, quantity, size);
      if (result.success && result.data) {
        queryClient.setQueryData(['cart', accessToken], result.data);
        incrementCart();
      }
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch { toast.error('Không thể thêm vào giỏ hàng'); }
    finally { setAddingToCart(false); }
  }, [accessToken, productId, quantity, selectedVariant, incrementCart]);

  const handleBuyNow = useCallback(async () => {
    if (!accessToken || !productId) { toast.info('Vui lòng đăng nhập để mua hàng'); return; }
    const size = selectedVariant?.size || '50ml';
    try {
      await addToCartAPI(accessToken, productId, quantity, size);
      router.push('/checkout');
    } catch { toast.error('Không thể thêm vào giỏ hàng'); }
  }, [accessToken, productId, quantity, selectedVariant, router]);

  if (loading) return <ProductDetailSkeleton />;

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary text-lg font-medium mb-4">{error || 'Không tìm thấy sản phẩm'}</p>
          <Link href="/" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
            <ArrowLeft size={16} /> Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  const discountPct = product.discount || product.discountPercentage || 0;
  const activeVariant = selectedVariant || product.variants?.find((v: any) => v.size === '50ml');
  const variantPrice = activeVariant?.price || product.price || 0;
  const hasDiscount = discountPct > 0;
  const finalPrice = hasDiscount ? Math.round(variantPrice * (1 - discountPct / 100)) : variantPrice;
  const inStockVariants = product.variants?.filter((v: any) => v.quantityInStock > 0) || [];
  const outOfStock = inStockVariants.length === 0;
  const reviewCount = product.reviewsCount || 0;
  const displayName = ensurePerfumePrefix(product.name);
  const validImages = images.map(img => resolveImageUrl(img));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link href="/products" className="hover:text-primary transition-colors font-medium">Nước hoa</Link>
          {product.brand && (
            <>
              <ChevronDown size={12} className="text-text-muted -rotate-90" />
              <button onClick={() => router.push(setFilterAndGo({ pendingBrand: product.brand }))} className="hover:text-primary transition-colors font-medium cursor-pointer">{product.brand}</button>
            </>
          )}
          <ChevronDown size={12} className="text-text-muted -rotate-90" />
          <span className="text-text-primary font-medium truncate max-w-[200px]">{displayName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="flex gap-4">
              {validImages.length > 1 && (
                <div className="hidden lg:flex flex-col gap-2 flex-shrink-0">
                  {validImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === i
                          ? 'border-primary shadow-soft shadow-primary/10'
                          : 'border-border-subtle opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="relative flex-1 rounded-xl overflow-hidden bg-foreground/5 border border-border-subtle">
                <div className="aspect-square">
                  <img
                    src={validImages[selectedImage] || '/placeholder.svg'}
                    alt={displayName}
                    className="w-full h-full object-contain p-8 md:p-12 transition-transform duration-500 hover:scale-150"
                  />
                </div>
                <button
                  onClick={handleToggleFavorite}
                  className={`absolute top-4 right-4 p-2.5 rounded-full border transition-all z-10 ${
                    isFavorite
                      ? 'bg-white border-red-500 text-red-500 shadow-soft'
                      : 'bg-background/80 backdrop-blur-sm border-border-subtle text-text-muted hover:border-red-400 hover:text-red-400'
                  }`}
                >
                  <Heart size={18} className={isFavorite ? 'fill-red-500' : ''} />
                </button>

              </div>
            </div>

            {validImages.length > 1 && (
              <div className="flex lg:hidden gap-3 overflow-x-auto pb-2">
                {validImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-primary' : 'border-border-subtle opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              {product.brand && (
                <span className="eyebrow text-[10px] font-semibold tracking-[0.18em] uppercase text-primary bg-primary/5 px-3 py-1 rounded-full inline-block mb-3">
                  {product.brand}
                </span>
              )}
              <h1 className="text-2xl md:text-3xl font-light text-text-primary leading-tight tracking-tight">{displayName}</h1>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-0.5">
                  {(() => {
                    const rating = product.rating ?? product.averageRating ?? 5;
                    return Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={16} className={i < Math.round(rating) ? 'text-gold fill-gold' : 'text-star-empty'} />
                    ));
                  })()}
                </div>
                <span className="text-sm text-text-secondary">{reviewCount} đánh giá</span>
                {product.soldCount ? (
                  <>
                    <span className="text-border/60 text-sm">·</span>
                    <span className="text-sm text-text-secondary">Đã bán {product.soldCount}</span>
                  </>
                ) : null}
              </div>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl md:text-4xl font-bold text-text-primary">{formatPrice(finalPrice)}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-text-muted line-through">{formatPrice(variantPrice)}</span>
                  <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    -{discountPct}%
                  </span>
                </>
              )}
            </div>

            {/* Variants */}
            {(() => {
              const inStockVariants = product.variants?.filter((v: any) => v.quantityInStock > 0);
              if (!inStockVariants || inStockVariants.length === 0) return null;
              return (
                <div className="py-4 border-t border-border-subtle">
                  <p className="text-sm font-medium text-text-primary mb-3">Dung tích</p>
                  <div className="flex flex-wrap gap-2">
                  {inStockVariants.map((v: any) => {
                    const isSelected = selectedVariant?._id === v._id || (!selectedVariant && v.size === '50ml');
                    return (
                      <button
                        key={v._id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                          isSelected
                            ? 'bg-primary text-on-primary'
                            : 'bg-foreground/5 border border-border-subtle text-text-secondary'
                        }`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                  </div>
                </div>
              );
            })()}

            {/* Add to Cart (Desktop) */}
            <div className="hidden lg:block py-4 border-t border-border-subtle">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center border border-border-subtle rounded-lg overflow-hidden self-start sm:self-auto bg-background">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3.5 py-3 text-text-muted hover:text-text-primary hover:bg-foreground/5 transition-colors"><Minus size={14} /></button>
                  <span className="px-5 py-3 text-sm font-medium text-text-primary min-w-[40px] text-center border-x border-border-subtle">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3.5 py-3 text-text-muted hover:text-text-primary hover:bg-foreground/5 transition-colors"><Plus size={14} /></button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={outOfStock || addingToCart}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-lg text-sm font-bold transition-all active:scale-[0.98] ${
                    outOfStock
                      ? 'bg-foreground/5 text-text-muted cursor-not-allowed'
                      : addedToCart
                        ? 'bg-success text-white shadow-soft'
                        : 'bg-rich-black text-white hover:bg-[#000] shadow-soft hover:shadow-card focus:ring-4 focus:ring-primary-light'
                  }`}
                >
                  <ShoppingBag size={16} />
                  {addingToCart ? 'Đang thêm...' : addedToCart ? 'Đã thêm ✓' : outOfStock ? 'Tạm hết hàng' : 'Thêm vào giỏ'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={outOfStock}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-lg text-sm font-bold transition-all active:scale-[0.98] ${
                    outOfStock
                      ? 'bg-foreground/5 text-text-muted cursor-not-allowed'
                      : 'bg-primary text-rich-black hover:bg-primary-dark shadow-soft hover:shadow-card focus:ring-4 focus:ring-primary-light'
                  }`}
                >
                  Mua ngay
                </button>
              </div>
              <p className="mt-3 text-[10px] text-text-muted text-center flex items-center justify-center gap-1">
                <ShieldCheck size={12} /> Sản phẩm chính hãng 100% · Miễn phí giao hàng từ 500K
              </p>
            </div>

            {/* Accordion */}
            <div className="border border-border-subtle rounded-xl divide-y divide-border-subtle">
              <AccordionRow title="Chi tiết sản phẩm" defaultOpen>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {product.brand && <DetailItem label="Thương hiệu" value={product.brand} />}
                  {product.style && <DetailItem label="Phong cách" value={product.style} />}
                  {product.longevity && <DetailItem label="Lưu hương" value={product.longevity} />}
                  {product.sillage && <DetailItem label="Tỏa hương" value={product.sillage} />}
                  {product.durability && <DetailItem label="Độ bền mùi" value={product.durability} />}
                  {product.scentTrail && <DetailItem label="Vệt hương" value={product.scentTrail} />}
                  {product.season && <DetailItem label="Mùa" value={product.season} />}
                  {product.time && <DetailItem label="Thời gian" value={product.time} />}
                  <DetailItem label="Tồn kho" value={outOfStock ? 'Hết hàng' : `${product.quantityInStock || 0}`} />
                </div>
              </AccordionRow>
              {product.suitableFor && (
                <AccordionRow title="Phù hợp">
                  <p className="text-sm text-text-secondary leading-relaxed">{product.suitableFor}</p>
                </AccordionRow>
              )}
              {product.occasion && (
                <AccordionRow title="Dịp sử dụng">
                  <p className="text-sm text-text-secondary leading-relaxed">{product.occasion}</p>
                </AccordionRow>
              )}
            </div>

          </div>
        </div>

        {/* Description */}
        {product.description && (
          <section className="mt-12">
            <div className="card p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">Mô tả sản phẩm</h2>
              <div className="text-sm md:text-base text-text-secondary leading-relaxed whitespace-pre-wrap">
                {product.description}
              </div>
            </div>
          </section>
        )}

        {/* Reviews */}
        <ProductReviews productId={productId!} />

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-2 whitespace-nowrap">
                <Sparkles size={18} className="text-primary" />
                Có thể bạn cũng thích
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {suggestions.map((item: any) => (
                <ProductCard key={item._id} product={item as ProductData} />
              ))}
            </div>
          </section>
        )}

        {/* Mobile Sticky Cart */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border-subtle p-4 z-40 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border-subtle rounded-lg overflow-hidden bg-background">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-3 text-text-muted"><Minus size={14} /></button>
              <span className="px-4 py-3 text-sm font-medium text-text-primary min-w-[40px] text-center border-x border-border-subtle">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-3 text-text-muted"><Plus size={14} /></button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={outOfStock || addingToCart}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all active:scale-[0.98] ${
                outOfStock
                  ? 'bg-foreground/5 text-text-muted'
                  : addedToCart
                    ? 'bg-success text-white'
                    : 'bg-rich-black text-white hover:bg-[#000]'
              }`}
            >
              {addingToCart ? 'Đang thêm...' : addedToCart ? 'Đã thêm ✓' : outOfStock ? 'Hết hàng' : `Thêm - ${formatPrice(finalPrice * quantity)}`}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={outOfStock}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all active:scale-[0.98] ${
                outOfStock
                  ? 'bg-foreground/5 text-text-muted'
                  : 'bg-primary text-rich-black hover:bg-primary-dark'
              }`}
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 px-2 rounded-md hover:bg-foreground/5 transition-colors">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="text-xs font-medium text-text-primary text-right ml-2">{value}</span>
    </div>
  );
}

function AccordionRow({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-text-primary hover:bg-foreground/5 transition-colors"
      >
        <span>{title}</span>
        <ChevronDown size={14} className={`text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}