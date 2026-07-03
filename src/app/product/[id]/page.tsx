'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Heart, ShoppingBag, Minus, Plus, ArrowLeft, ChevronDown, Sparkles, Eye, Clock, Wind, ShieldCheck, Zap, Droplets, Percent } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { addToFavorites, removeFromFavorites, checkFavorite } from '@/services/favorite.service';
import { addToCart as addToCartAPI } from '@/services/cart.service';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { fetchProductDetail } from '@/lib/graphql';
import { resolveImageUrl } from '@/lib/api';

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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
          <div className="h-4 bg-surface rounded w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-surface rounded-2xl" />
            <div className="space-y-4">
              <div className="h-4 bg-surface rounded w-1/4" />
              <div className="h-8 bg-surface rounded w-3/4" />
              <div className="h-4 bg-surface rounded w-1/2" />
              <div className="h-6 bg-surface rounded w-1/3" />
              <div className="h-24 bg-surface rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetailContent() {
  const { id } = useParams<{ id: string }>();
  const suggestionRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
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

  const accessToken = useAuthStore((state) => state.accessToken);
  const addFavoriteId = useFavoriteStore((state) => state.addFavoriteId);
  const removeFavoriteId = useFavoriteStore((state) => state.removeFavoriteId);
  const incrementCart = useCartStore((state) => state.incrementCart);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        // Single GraphQL call replaces 3 REST API calls
        const { productDetail: p, trendingProducts: suggestionsData } = await fetchProductDetail(id);

        if (!p) {
          setError('Không tìm thấy sản phẩm');
          return;
        }

        setProduct(p);

        // Track product view (fire-and-forget)
        var apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        fetch(apiBase + '/api/products/' + id + '/track-view', { method: 'POST', keepalive: true }).catch(function(){});

        // Build images array from product image + extra images
        const imgs: string[] = [];
        if (p.image) imgs.push(p.image);
        if (p.images && p.images.length > 0) {
          p.images.forEach((img: string) => { if (!imgs.includes(img)) imgs.push(img); });
        }
        setImages(imgs.length > 0 ? imgs : ['']);

        if (p.variants && p.variants.length > 0) {
          const defaultVariant = p.variants.find((v: any) => v.isDefault)
            || p.variants.find((v: any) => v.size === '50ml')
            || p.variants[0];
          setSelectedVariant(defaultVariant);
        }

        // Suggestions (trending products, exclude current product)
        if (suggestionsData && suggestionsData.length > 0) {
          const filtered = suggestionsData.filter((item: any) => item._id !== id);
          setSuggestions(filtered.slice(0, 8));
        }

        if (accessToken) {
          try {
            const favResult = await checkFavorite(id, accessToken);
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
  }, [id, accessToken]);

  const handleToggleFavorite = useCallback(async () => {
    if (!accessToken) { toast.info('Vui lòng đăng nhập để sử dụng tính năng này'); return; }
    const next = !isFavorite;
    try {
      if (next) { await addToFavorites(id, accessToken); addFavoriteId(id); }
      else { await removeFromFavorites(id, accessToken); removeFavoriteId(id); }
      setIsFavorite(next);
    } catch { console.error('Failed to toggle favorite'); }
  }, [accessToken, id, isFavorite, addFavoriteId, removeFavoriteId]);

  const handleAddToCart = useCallback(async () => {
    if (!accessToken) { toast.info('Vui lòng đăng nhập để thêm vào giỏ hàng'); return; }
    const size = selectedVariant?.size || '50ml';
    setAddingToCart(true);
    try {
      await addToCartAPI(accessToken, id, quantity, size);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      incrementCart();
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch { toast.error('Không thể thêm vào giỏ hàng'); }
    finally { setAddingToCart(false); }
  }, [accessToken, id, quantity, selectedVariant, incrementCart]);

  const handleBuyNow = useCallback(async () => {
    if (!accessToken) { toast.info('Vui lòng đăng nhập để mua hàng'); return; }
    const size = selectedVariant?.size || '50ml';
    try {
      await addToCartAPI(accessToken, id, quantity, size);
      router.push('/checkout');
    } catch { toast.error('Không thể thêm vào giỏ hàng'); }
  }, [accessToken, id, quantity, selectedVariant, router]);

  if (loading) return <ProductDetailSkeleton />;

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary text-lg font-medium mb-4">{error || 'Không tìm thấy sản phẩm'}</p>
          <Link href="/" className="text-primary hover:underline inline-flex items-center gap-1">
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
  const outOfStock = product.quantityInStock === 0;
  const savings = hasDiscount ? variantPrice - finalPrice : 0;
  const totalPrice = finalPrice * quantity;
  const reviewCount = product.reviewsCount || 0;
  const validImages = images.map(img => resolveImageUrl(img));

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-text-muted overflow-x-auto whitespace-nowrap">
          <Link href="/products" className="hover:text-primary transition-colors font-medium">Nước hoa</Link>
          {product.brand && (
            <>
              <span className="text-border/60 mx-0.5">/</span>
              <Link href="/products" className="hover:text-primary transition-colors font-medium">{product.brand}</Link>
            </>
          )}
          <span className="text-border/60 mx-0.5">/</span>
          <span className="text-text-primary font-medium truncate max-w-[180px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
          {/* Left — Images */}
          <div className="space-y-4">
            <div className="flex gap-4">
              {/* Vertical Thumbnails (desktop) */}
              {validImages.length > 1 && (
                <div className="hidden lg:flex flex-col gap-2 flex-shrink-0">
                  {validImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === i
                          ? 'border-primary shadow-md shadow-primary/10'
                          : 'border-border/50 hover:border-border opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="relative flex-1 rounded-2xl overflow-hidden bg-gradient-to-br from-surface via-background to-surface border border-border/50 shadow-sm group cursor-crosshair">
                <div className="aspect-square">
                  <img
                    src={validImages[selectedImage] || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-contain p-8 md:p-12 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.8]"
                  />
                </div>
                <button
                  onClick={handleToggleFavorite}
                  className={`absolute top-4 right-4 p-2.5 rounded-full border transition-[transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] z-10 active:scale-[0.92] ${
                    isFavorite
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-background/80 backdrop-blur-sm border-border/60 text-text-muted hover:border-primary/40 hover:shadow-md'
                  }`}
                >
                  <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
                </button>
                {hasDiscount && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-full shadow-lg shadow-primary/20">
                      <Percent size={10} /> -{discountPct}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Horizontal Thumbnails (mobile/tablet) */}
            {validImages.length > 1 && (
              <div className="flex lg:hidden gap-3 overflow-x-auto pb-2 mt-4">
                {validImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-primary' : 'border-border/50 opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Info */}
          <div className="space-y-8">
            {/* Brand + Name + Rating */}
            <div>
              {product.brand && (
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-primary bg-primary/5 px-3 py-1 rounded-full inline-block mb-3">
                  {product.brand}
                </span>
              )}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-light text-text-primary leading-tight tracking-tight">{product.name}</h1>
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className={s <= Math.min(5, Math.ceil(reviewCount / 20)) ? 'fill-amber-400 text-amber-400' : 'text-border/60'} />
                  ))}
                </div>
                <span className="text-sm text-text-secondary">{reviewCount} đánh giá</span>
                {product.soldCount ? (
                  <>
                    <span className="text-text-muted text-xs">·</span>
                    <span className="text-sm text-text-secondary">Đã bán {product.soldCount}</span>
                  </>
                ) : null}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl md:text-4xl font-bold text-text-primary">{formatPrice(finalPrice)}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-text-muted line-through">{formatPrice(variantPrice)}</span>
                  <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    -{formatPrice(savings)}
                  </span>
                </>
              )}
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-3">
              {product.longevity && (
                <SpecCard icon={<Clock size={16} />} label="Lưu hương" value={product.longevity} />
              )}
              {product.sillage && (
                <SpecCard icon={<Wind size={16} />} label="Tỏa hương" value={product.sillage} />
              )}
              {product.durability && (
                <SpecCard icon={<ShieldCheck size={16} />} label="Độ bền" value={product.durability} />
              )}
              {product.scentTrail && (
                <SpecCard icon={<Zap size={16} />} label="Vệt hương" value={product.scentTrail} />
              )}
              {product.season && (
                <SpecCard icon={<Droplets size={16} />} label="Mùa" value={product.season} />
              )}
            </div>

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="py-6 border-t border-border/60">
                <p className="text-sm font-medium text-text-primary mb-4">Dung tích</p>
                <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => {
                  const isSelected = selectedVariant?._id === v._id || (!selectedVariant && v.size === '50ml');
                  return (
                    <button
                      key={v._id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                        isSelected
                          ? 'bg-primary text-rich-black shadow-sm shadow-primary/20 ring-1 ring-black/10'
                          : 'bg-surface border border-border text-text-secondary hover:border-primary/40'
                      }`}
                    >
                      {v.size} {v.size === '50ml' && '(Mặc định)'}
                    </button>
                  );
                })}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart (Desktop) */}
            <div className="hidden lg:block py-6 border-t border-border/60">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center border border-border/60 rounded-xl overflow-hidden self-start sm:self-auto bg-background">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3.5 py-3 text-text-muted hover:text-text-primary hover:bg-surface transition-colors"><Minus size={14} /></button>
                  <span className="px-5 py-3 text-sm font-medium text-text-primary min-w-[40px] text-center border-x border-border/60">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3.5 py-3 text-text-muted hover:text-text-primary hover:bg-surface transition-colors"><Plus size={14} /></button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={outOfStock || addingToCart}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-[transform,box-shadow,background-color,color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    outOfStock
                      ? 'bg-surface text-text-muted cursor-not-allowed'
                      : addedToCart
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                        : 'bg-rich-black text-white hover:bg-foreground shadow-lg hover:shadow-xl active:scale-[0.98] hover:-translate-y-[1px]'
                  }`}
                >
                  <ShoppingBag size={16} />
                  {addingToCart ? 'Đang thêm...' : addedToCart ? 'Đã thêm ✓' : outOfStock ? 'Tạm hết hàng' : 'Thêm vào giỏ'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={outOfStock}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-[transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    outOfStock
                      ? 'bg-surface text-text-muted cursor-not-allowed'
                      : 'bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:bg-primary-dark active:scale-[0.98] hover:-translate-y-[1px]'
                  }`}
                >
                  <Eye size={16} /> Mua ngay
                </button>
              </div>
              <p className="mt-3 text-[10px] text-text-muted text-center flex items-center justify-center gap-1">
                <ShieldCheck size={12} /> Sản phẩm chính hãng 100% · Miễn phí giao hàng từ 500K
              </p>
            </div>

            {/* Accordion Details */}
            <div className="divide-y divide-border/60 overflow-hidden">
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

            {/* Total (Desktop) */}
            <div className="hidden lg:block text-right">
              <p className="text-xs text-text-muted">Tạm tính ({quantity} sản phẩm)</p>
              <p className="text-lg font-bold text-text-primary">{formatPrice(totalPrice)}</p>
            </div>
          </div>
        </div>

        {/* Full Description */}
        {product.description && (
          <ScrollReveal className="mt-20 max-w-4xl mx-auto">
            <div className="p-1.5 rounded-[2rem] ring-1 ring-black/5">
              <div className="bg-surface rounded-[calc(2rem-0.375rem)] p-8 md:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-px h-8 bg-gradient-to-b from-primary to-primary/30" />
                  <h2 className="text-lg md:text-xl font-semibold text-text-primary">Mô tả sản phẩm</h2>
                </div>
                <div className="text-sm md:text-base text-text-secondary leading-relaxed whitespace-pre-wrap font-serif tracking-wide">
                  {product.description}
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Product Suggestions */}
        {suggestions.length > 0 && (
          <ScrollReveal className="mt-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 whitespace-nowrap">
                <Sparkles size={18} className="text-primary" />
                Có thể bạn cũng thích
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
            </div>

            <div className="relative">
              <div
                ref={suggestionRef}
                className="flex gap-4 md:gap-5 overflow-x-auto scroll-smooth pb-4 -mx-4 px-4 hide-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {suggestions.slice(0, 8).map((item: any) => {
                  const itemDiscount = item.discount || item.discountPercentage || 0;
                  const itemPrice = item.price || 0;
                  const itemFinalPrice = itemDiscount > 0 ? Math.round(itemPrice * (1 - itemDiscount / 100)) : itemPrice;
                  return (
                    <Link
                      key={item._id}
                      href={`/product/${item._id}`}
                      className="group w-[180px] md:w-[220px] bg-background rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex-shrink-0"
                    >
                      <div className="aspect-square bg-surface relative overflow-hidden">
                        <img
                          src={resolveImageUrl(item.image) || '/placeholder.svg'}
                          alt={item.name}
                          className="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-500"
                        />
                        {itemDiscount > 0 && (
                          <span className="absolute top-2 left-2 text-[9px] font-bold text-white bg-primary px-2 py-0.5 rounded-full shadow-sm shadow-primary/20">
                            -{itemDiscount}%
                          </span>
                        )}
                      </div>
                      <div className="p-3 md:p-4">
                        {item.brand && <p className="text-[9px] uppercase tracking-[0.15em] text-primary font-semibold truncate">{item.brand}</p>}
                        <h3 className="text-sm font-medium text-text-primary mt-1 line-clamp-2 leading-snug h-10">{item.name}</h3>
                        <div className="mt-2 flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={10} className={s <= Math.min(5, Math.ceil((item.reviewsCount || 0) / 20)) ? 'fill-amber-400 text-amber-400' : 'text-border/60'} />
                          ))}
                        </div>
                        <div className="mt-2 flex items-baseline gap-1.5">
                          <span className="text-sm font-bold text-text-primary">{formatPrice(itemFinalPrice)}</span>
                          {itemDiscount > 0 && (
                            <span className="text-[10px] text-text-muted line-through">{formatPrice(itemPrice)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Mobile Sticky Add to Cart */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-border p-4 z-40">
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border/60 rounded-xl overflow-hidden bg-background">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-3 text-text-muted"><Minus size={14} /></button>
              <span className="px-4 py-3 text-sm font-medium text-text-primary min-w-[40px] text-center border-x border-border/60">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-3 text-text-muted"><Plus size={14} /></button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={outOfStock || addingToCart}
              className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-[transform,background-color,color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                outOfStock
                  ? 'bg-surface text-text-muted'
                  : addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-rich-black text-white active:scale-[0.98]'
              }`}
            >
              {addingToCart ? 'Đang thêm...' : addedToCart ? 'Đã thêm ✓' : outOfStock ? 'Hết hàng' : `Thêm - ${formatPrice(totalPrice)}`}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={outOfStock}
              className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                outOfStock
                  ? 'bg-surface text-text-muted'
                  : 'bg-primary text-white active:scale-[0.98]'
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

// Helper Components

function ScrollReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        visible ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-8 opacity-0 blur-sm'
      }`}
    >
      {children}
    </div>
  );
}

function SpecCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-1 rounded-xl ring-1 ring-black/5">
      <div className="flex items-center gap-3 p-3 rounded-[calc(0.75rem-0.25rem)] bg-surface shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
        <div className="text-primary shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] text-text-muted uppercase tracking-wide">{label}</p>
          <p className="text-sm font-medium text-text-primary truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 px-2 rounded-md hover:bg-background/50 transition-colors">
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
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-primary hover:bg-surface/50 transition-colors"
      >
        {title}
        <ChevronDown size={14} className={`text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}