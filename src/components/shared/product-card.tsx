'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, Heart } from 'lucide-react';
import { FavoriteButton } from './favorites-popup';
import { useAuthStore } from '@/store/useAuthStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { addToFavorites, removeFromFavorites } from '@/services/favorite.service';
import { addToCart as addToCartAPI } from '@/services/cart.service';
import { useCartStore } from '@/store/useCartStore';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export interface ProductData {
  _id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  tag?: string;
  discount?: number;
  reviewsCount?: number;
  soldCount?: number;
  quantityInStock?: number;
}

interface ProductCardProps {
  product: ProductData;
  variant?: 'default' | 'compact';
  onAddToCart?: (id: string) => void;
  onFavoriteToggle?: (productId: string, isFavorite: boolean) => void;
  sessionType?: 'hot' | 'new' | 'limited' | 'standard' | 'sale';
  cardIndex?: number;
}

const TAG_MAP: Record<string, { label: string; className: string }> = {
  standard: { label: 'STANDARD', className: 'bg-text-muted/20 text-text-muted' },
  hot: { label: 'HOT', className: 'bg-red-400 text-white' },
  'ban-chay': { label: 'HOT', className: 'bg-red-400 text-white' },
  'thinh-hanh': { label: 'HOT', className: 'bg-red-400 text-white' },
  trending: { label: 'HOT', className: 'bg-red-400 text-white' },
  new: { label: 'MỚI', className: 'bg-green-500 text-white' },
  'san-pham-moi': { label: 'MỚI', className: 'bg-green-500 text-white' },
  limited: { label: 'LIMITED', className: 'bg-black text-white' },
  'gioi-han': { label: 'LIMITED', className: 'bg-black text-white' },
  'gioi-han-dac-biet': { label: 'LIMITED', className: 'bg-black text-white' },
  sale: { label: 'SALE', className: 'bg-primary text-rich-black' },
  'giam-gia': { label: 'SALE', className: 'bg-primary text-rich-black' },
};

const SESSION_SLUGS: Record<string, string[]> = {
  hot: ['hot', 'ban-chay', 'thinh-hanh', 'trending'],
  new: ['new', 'san-pham-moi'],
  limited: ['limited', 'gioi-han', 'gioi-han-dac-biet'],
  standard: ['standard'],
};

const SESSION_COLORS: Record<string, string> = {
  hot: 'bg-red-400 text-white',
  new: 'bg-green-500 text-white',
  limited: 'bg-black text-white',
  standard: 'bg-text-muted/20 text-text-muted',
  sale: 'bg-primary text-rich-black',
};

function getBadgeTags(rawTag: string, sessionType?: string): string[] {
  const slugs = rawTag.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (slugs.length === 0) return [];

  if (sessionType && sessionType !== 'standard') {
    const primary = SESSION_SLUGS[sessionType] || [];
    return slugs.filter(s => primary.includes(s));
  }

  return [];
}

function Stars({ reviewsCount }: { reviewsCount?: number }) {
  // Tính rating từ reviewsCount: mỗi 20 đánh giá = 1 sao, tối đa 5 sao
  if (!reviewsCount || reviewsCount <= 0) return null;
  const computedRating = Math.min(5, Math.ceil(reviewsCount / 20));
  return (
    <div className="flex items-center gap-1 mb-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= computedRating ? 'text-gold fill-gold' : 'text-text-muted'}
        />
      ))}
      <span className="text-[11px] text-text-muted">({reviewsCount})</span>
    </div>
  );
}

const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="sans-serif">No image</text></svg>');
function safeImg(src: string | undefined | null): string { return src && src.trim() ? src : PLACEHOLDER_IMG; }

function cleanName(name: string): string {
  return name.replace(/^Nước hoa\s*/i, '');
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function calcDiscountedPrice(price: number, discount?: number): number {
  return discount ? Math.round(price * (1 - discount / 100)) : price;
}

function calcOriginalPrice(discountedPrice: number, discountPercentage?: number): number {
  if (!discountPercentage || discountPercentage <= 0) return discountedPrice;
  return Math.round(discountedPrice / (1 - discountPercentage / 100));
}

export function ProductCard({ product, variant = 'default', onAddToCart, onFavoriteToggle, sessionType, cardIndex }: ProductCardProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [floatHearts, setFloatHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const floatIdRef = useRef(0);
  const badgeDelayRef = useRef(0);
  const accessToken = useAuthStore((state) => state.accessToken);
  const incrementCart = useCartStore((state) => state.incrementCart);
  const addFavoriteId = useFavoriteStore((state) => state.addFavoriteId);
  const removeFavoriteId = useFavoriteStore((state) => state.removeFavoriteId);
  const favoriteIds = useFavoriteStore((state) => state.favoriteIds);
  const queryClient = useQueryClient();

  // Sync isFavorite from global store (no extra API calls)
  useEffect(() => {
    const fav = favoriteIds.has(product._id);
    if (fav) {
      badgeDelayRef.current = (cardIndex ?? 0) * 0.08 + 0.45;
      setIsFavorite(true);
    } else {
      setIsFavorite(false);
    }
  }, [favoriteIds, product._id, cardIndex]);

  const handleFloat = useCallback((x: number, y: number) => {
    // Clamp coordinates to viewport to prevent horizontal scroll
    const clampedX = Math.max(20, Math.min(x, window.innerWidth - 20));
    const clampedY = Math.max(20, Math.min(y, window.innerHeight - 20));
    
    const batch = Array.from({ length: 12 }, () => ++floatIdRef.current);
    setFloatHearts(prev => [...prev, ...batch.map(heartId => ({ id: heartId, x: clampedX, y: clampedY }))]);
    setTimeout(() => setFloatHearts(prev => prev.filter(f => !batch.includes(f.id))), 900);
  }, []);

  const handleToggleFavorite = useCallback(async (next: boolean) => {
    if (!accessToken) {
      toast.info('Vui lòng đăng nhập để sử dụng tính năng này');
      return;
    }

    try {
      if (next) {
        await addToFavorites(product._id, accessToken);
      } else {
        await removeFromFavorites(product._id, accessToken);
      }
      badgeDelayRef.current = 0;
      setIsFavorite(next);
      if (next) addFavoriteId(product._id); else removeFavoriteId(product._id);
      onFavoriteToggle?.(product._id, next);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // If trying to unfavorite but product is already removed, sync local state
      if (!next) {
        setIsFavorite(false);
        removeFavoriteId(product._id);
      }
    }
  }, [accessToken, product._id, onFavoriteToggle, addFavoriteId, removeFavoriteId]);

  const handleAddToCart = useCallback(async () => {
    if (!accessToken) {
      toast.info('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    try {
      await addToCartAPI(accessToken, product._id, 1);
      // Invalidate React Query cart cache → navbar sẽ re-fetch badge count
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      incrementCart();
      // Notify parent to update cart count
      onAddToCart?.(product._id);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Không thể thêm vào giỏ hàng');
    }
  }, [accessToken, product._id, onAddToCart, incrementCart]);


  if (variant === 'compact') {
    return (
      <div className="flex-shrink-0 w-[140px] md:w-[160px] bg-surface rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-primary/20">
        <div className="aspect-square bg-surface rounded-md mb-2 overflow-hidden">
          <img src={safeImg(product.image)} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <p className="text-xs text-text-secondary truncate">{cleanName(product.name)}</p>
        {product.quantityInStock !== undefined && (
          <p className={`text-[10px] mt-1 ${product.quantityInStock > 0 ? 'text-green-500' : 'text-red-400'}`}>
            {product.quantityInStock > 0 ? 'Kho: ' + product.quantityInStock : 'Hết hàng'}
          </p>
        )}
        <div className="flex items-baseline gap-1 mt-1">
          {(product.discount ?? 0) > 0 ? (
            <>
              <span className="text-price font-bold text-sm">{formatPrice(product.price)}</span>
              <span className="text-text-muted text-[10px] line-through">{formatPrice(calcOriginalPrice(product.price, product.discount))}</span>
            </>
          ) : (
            <span className="text-price font-bold text-sm">{formatPrice(product.price)}</span>
          )}
        </div>
        {product.soldCount !== undefined && (
          <>
            <div className="mt-2 h-1.5 bg-primary-light/30 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(product.soldCount, 100)}%` }} />
            </div>
            <p className="text-[10px] text-text-muted mt-1">Đã bán {product.soldCount}</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className="h-full bg-surface rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-transparent hover:border-primary/20 group flex flex-col relative"
      onClick={() => router.push(`/product/${product._id}`)}
    >
      <div className="relative aspect-square bg-surface overflow-hidden">
        <img
          src={safeImg(product.image)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {(product.discount ?? 0) > 0 && (
            <span className="px-3 py-1 text-xs font-bold rounded-md bg-primary text-rich-black">
              -{product.discount}%
            </span>
          )}
          {getBadgeTags(product.tag || '', sessionType).map((slug) => {
            const t = TAG_MAP[slug];
            return (
              <span key={slug} className={"px-3 py-1 text-xs font-bold rounded-md self-start " + (SESSION_COLORS[sessionType || ''] || t?.className || 'bg-gold text-rich-black')}>
                {t?.label || slug.toUpperCase()}
              </span>
            );
          })}
        </div>
        {typeof window !== 'undefined' && floatHearts.length > 0 && createPortal(
          <div className="fixed inset-0 pointer-events-none z-[999]">
            {floatHearts.map((fh, idx) => {
              const sizes = [12, 16, 20, 24, 14, 18, 22, 16, 20, 14, 18, 16];
              const delays = [0, 0.04, 0.08, 0.12, 0.16, 0.2, 0.24, 0.28, 0.32, 0.36, 0.4, 0.44];
              return (
                <div
                  key={fh.id}
                  className="absolute"
                  style={{
                    left: fh.x,
                    top: fh.y,
                    animationDelay: `${delays[idx % delays.length]}s`,
                    transform: 'translateX(-50%)',
                  } as React.CSSProperties}
                >
                  <Heart size={sizes[idx % sizes.length]} className="text-red-500 fill-red-500 animate-heart-float drop-shadow" />
                </div>
              );
            })}
          </div>,
          document.body
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              className="flex-1 py-2 bg-primary hover:bg-primary/90 text-rich-black text-xs font-semibold rounded-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all duration-200"
            >
              Thêm vào giỏ
            </button>
            <FavoriteButton
              isFavorite={isFavorite}
              onToggle={handleToggleFavorite}
              onFloat={handleFloat}
              className="bg-white/90 hover:bg-white hover:scale-105 transition-all duration-200"
            />
          </div>
        </div>
      </div>
      <div
        className={`absolute top-2 right-2 z-20 transition-all duration-300 ease-out ${isFavorite ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
        style={{ transitionDelay: `${badgeDelayRef.current}s` }}
      >
        <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shadow-md leading-none">
          <Heart size={15} className="text-white fill-white flex-shrink-0" />
        </div>
      </div>
        <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">{product.brand}</p>
          <h3 className="text-base font-semibold text-text-primary mb-2 line-clamp-2 leading-snug">{cleanName(product.name)}</h3>
          <Stars reviewsCount={product.reviewsCount} />
          {product.quantityInStock !== undefined && (
            <p className={`text-[11px] mt-1 ${product.quantityInStock > 0 ? 'text-green-500' : 'text-red-400'}`}>
              {product.quantityInStock > 0 ? 'Kho: ' + product.quantityInStock : 'Hết hàng'}
            </p>
          )}
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          {(product.discount ?? 0) > 0 ? (
            <>
              <span className="text-price font-bold text-base">{formatPrice(product.price)}</span>
              <span className="text-text-muted text-xs line-through">{formatPrice(calcOriginalPrice(product.price, product.discount))}</span>
            </>
          ) : (
            <span className="text-price font-bold text-base">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
