'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Heart, ShoppingBag, Minus, Plus, ArrowLeft, ChevronDown, Sparkles, Eye, Clock, Wind, ShieldCheck, Zap, Droplets, Percent, Tag } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { addToFavorites, removeFromFavorites, checkFavorite } from '@/services/favorite.service';
import { addToCart as addToCartAPI } from '@/services/cart.service';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { fetchProductDetail } from '@/lib/graphql';
import api from '@/lib/api';

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
  const [mouseOverImage, setMouseOverImage] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

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
    } catch {
      toast.error('Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  }, [accessToken, id, quantity, selectedVariant, incrementCart, queryClient]);

  const handleBuyNow = useCallback(async () => {
    if (!accessToken) { toast.info('Vui lòng đăng nhập để mua hàng'); return; }
    const size = selectedVariant?.size || '50ml';
    try {
      await addToCartAPI(accessToken, id, quantity, size);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      incrementCart();
      router.push('/checkout');
    } catch { toast.error('Không thể thêm vào giỏ hàng'); }
  }, [accessToken, id, quantity, selectedVariant, incrementCart, queryClient, router]);

  const handleImageMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  }, []);

  if (loading) return <ProductDetailSkeleton />;

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-text-secondary">{error || 'Không tìm thấy sản phẩm'}</p>
          <Link href="/" className="mt-4 inline-block text-sm text-primary hover:underline">Quay về trang chủ</Link>
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
  // Tính rating từ reviewsCount: mỗi 20 đánh giá = 1 sao, tối đa 5 sao
  const computedRating = Math.min(5, Math.ceil(reviewCount / 20));


  const validImages = images.filter(i => i);
  return (
    <>
      {/* Sticky Mobile Add-to-Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-t border-border p-3 flex items-center gap-3 lg:hidden">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text-primary">{formatPrice(totalPrice)}</p>
          {hasDiscount && <p className="text-[10px] text-green-600 font-medium"><Percent size={10} className="inline mr-0.5" />Tiết kiệm {formatPrice(savings)}</p>}
        </div>
        <div className="flex items-center border border-border rounded-lg overflow-hidden bg-background">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-text-muted hover:text-text-primary transition-colors"><Minus size={14} /></button>
          <span className="px-4 py-2 text-sm font-medium text-text-primary border-x border-border min-w-[36px] text-center">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-text-muted hover:text-text-primary transition-colors"><Plus size={14} /></button>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={outOfStock || addingToCart}
          className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            outOfStock ? 'bg-surface text-text-muted cursor-not-allowed' :
            addedToCart ? 'bg-green-500 text-white' : 'bg-rich-black text-white hover:bg-foreground'
          }`}
        >
          {addingToCart ? '...' : addedToCart ? '✓ Đã thêm' : outOfStock ? 'Hết hàng' : 'Thêm giỏ'}
        </button>
      </div>

      <div className="min-h-screen bg-background pb-24 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-text-muted mb-6">
            <Link href="/" className="hover:text-primary transition-colors font-medium">Trang chủ</Link>
            <span className="text-border/60 mx-0.5">/</span>
            <Link href="/" className="hover:text-primary transition-colors font-medium">Nước hoa</Link>
            {product.brand && (
              <>
                <span className="text-border/60 mx-0.5">/</span>
                <Link href="/" className="hover:text-primary transition-colors font-medium">{product.brand}</Link>
              </>
            )}
            <span className="text-border/60 mx-0.5">/</span>
            <span className="text-text-primary font-medium truncate max-w-[180px]">{product.name}</span>
          </nav>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
            {/* Left — Gallery */}
            <div className="lg:sticky lg:top-24 lg:self-start">
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
                <div
                  className="relative flex-1 rounded-2xl overflow-hidden bg-gradient-to-br from-surface via-background to-surface border border-border/50 shadow-sm group cursor-crosshair"
                  onMouseEnter={() => setMouseOverImage(true)}
                  onMouseLeave={() => setMouseOverImage(false)}
                  onMouseMove={handleImageMove}
                >
                  <div className="aspect-square">
                    <img
                      src={validImages[selectedImage] || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-full object-contain p-8 md:p-12 transition-transform duration-500"
                      style={mouseOverImage ? {
                        transform: 'scale(1.8)',
                        transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                      } : {}}
                    />
                  </div>
                  <button
                    onClick={handleToggleFavorite}
                    className={`absolute top-4 right-4 p-2.5 rounded-full border transition-all duration-300 z-10 ${
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
            <div className="space-y-6">
              {/* Brand + Name + Rating */}
              <div>
                {product.brand && (
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-primary bg-primary/5 px-3 py-1 rounded-full inline-block mb-3">
                    {product.brand}
                  </span>
                )}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-light text-text-primary leading-tight tracking-tight">{product.name}</h1>
                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className={s <= computedRating ? 'fill-amber-400 text-amber-400' : 'text-border/60'} />
                    ))}
                  </div>
                  <span className="text-text-muted text-xs">·</span>
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
              <div className="py-5 border-t border-border/60">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-light text-text-primary tracking-tight">{formatPrice(finalPrice)}</span>
                  {hasDiscount && (
                    <>
                      <span className="text-sm md:text-base line-through text-text-muted">{formatPrice(variantPrice)}</span>
                      <span className="text-[10px] font-bold text-white bg-primary px-2.5 py-1 rounded-full">-{discountPct}%</span>
                    </>
                  )}
                </div>
                {hasDiscount && (
                  <p className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                    <Tag size={12} /> Tiết kiệm <strong>{formatPrice(savings)}</strong> so với giá gốc
                  </p>
                )}
                {outOfStock && <p className="mt-3 text-sm text-red-500 font-medium">Tạm hết hàng</p>}
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
                <div className="py-5 border-t border-border/60">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-semibold mb-3">Dung tích</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v: any) => {
                      const isSelected = selectedVariant?._id === v._id || (!selectedVariant && v.size === '50ml');
                      return (
                        <button
                          key={v._id}
                          onClick={() => setSelectedVariant(v)}
                          className={`relative px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/5'
                              : 'border-border/60 bg-background text-text-secondary hover:border-primary/30 hover:bg-surface/50'
                          } ${v.quantityInStock === 0 ? 'opacity-50' : ''}`}
                        >
                          <span className="font-semibold">{v.size}</span>
                          <span className="ml-2 text-xs text-text-muted font-normal">{formatPrice(v.price)}</span>
                          {v.quantityInStock === 0 && <span className="ml-1 text-[10px] text-red-400 font-normal">(Hết)</span>}
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity + Add to Cart (Desktop) */}
              <div className="hidden lg:block py-5 border-t border-border/60">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex items-center border border-border/60 rounded-xl overflow-hidden self-start sm:self-auto bg-background">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3.5 py-3 text-text-muted hover:text-text-primary hover:bg-surface transition-colors"><Minus size={14} /></button>
                    <span className="px-5 py-3 text-sm font-medium text-text-primary min-w-[40px] text-center border-x border-border/60">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-3.5 py-3 text-text-muted hover:text-text-primary hover:bg-surface transition-colors"><Plus size={14} /></button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={outOfStock || addingToCart}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                      outOfStock
                        ? 'bg-surface text-text-muted cursor-not-allowed'
                        : addedToCart
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                          : 'bg-rich-black text-white hover:bg-foreground shadow-lg hover:shadow-xl active:scale-[0.98]'
                    }`}
                  >
                    <ShoppingBag size={16} />
                    {addingToCart ? 'Đang thêm...' : addedToCart ? 'Đã thêm ✓' : outOfStock ? 'Tạm hết hàng' : 'Thêm vào giỏ'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={outOfStock}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                      outOfStock
                        ? 'bg-surface text-text-muted cursor-not-allowed'
                        : 'bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:bg-primary-dark active:scale-[0.98]'
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
              <div className="border border-border/60 rounded-xl divide-y divide-border/60 overflow-hidden bg-surface/30">
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
            <div className="mt-16 max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-surface to-[#F5EDE8]/30 rounded-3xl" />
                <div className="relative bg-surface/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-border/50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-px h-8 bg-gradient-to-b from-primary to-primary/30" />
                    <h2 className="text-lg md:text-xl font-semibold text-text-primary">Mô tả sản phẩm</h2>
                  </div>
                  <div className="text-sm md:text-base text-text-secondary leading-relaxed whitespace-pre-wrap font-serif tracking-wide">
                    {product.description}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-20">
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
                        <div className="aspect-square bg-gradient-to-br from-surface to-[#F5EDE8]/50 relative overflow-hidden">
                          <img
                            src={item.image || '/placeholder.svg'}
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
                            {itemDiscount > 0 && <span className="text-[10px] line-through text-text-muted">{formatPrice(itemPrice)}</span>}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Navigation buttons */}
                <button
                  onClick={() => suggestionRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/90 backdrop-blur-sm border border-border rounded-full shadow-lg hover:bg-surface hover:shadow-xl transition-all flex items-center justify-center text-text-primary z-10 -ml-4 hidden md:flex"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={() => suggestionRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/90 backdrop-blur-sm border border-border rounded-full shadow-lg hover:bg-surface hover:shadow-xl transition-all flex items-center justify-center text-text-primary z-10 -mr-4 hidden md:flex"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SpecCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-surface/80 rounded-xl p-3.5 flex items-center gap-3 border border-border/40 hover:border-border/80 transition-colors">
      <div className="w-9 h-9 rounded-lg bg-background/80 flex items-center justify-center text-primary/70 flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-widest text-text-muted font-semibold">{label}</p>
        <p className="text-sm font-medium text-text-primary truncate">{value}</p>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border/30 pb-2">
      <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">{label}</span>
      <p className="text-sm text-text-primary font-medium mt-0.5">{value || '—'}</p>
    </div>
  );
}

function AccordionRow({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = `accordion-${title.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left text-xs font-semibold text-text-secondary tracking-wider uppercase hover:bg-surface/50 transition-colors"
        aria-expanded={open}
        aria-controls={contentId}
      >
        {title}
        <ChevronDown size={14} className={`text-text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        id={contentId}
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-4 text-sm text-text-secondary leading-relaxed">{children}</div>
      </div>
    </div>
  );
}