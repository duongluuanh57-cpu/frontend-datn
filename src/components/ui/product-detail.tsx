'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ShoppingBag,
  Heart,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Phone,
  Truck,
  ShieldCheck,
  RefreshCw,
  Clock,
  Sparkles,
  Sun,
  Moon,
  CloudSun,
  Eye,
  Check,
  CreditCard,
  Gift,
  Leaf,
  Droplets,
  Wind,
  ArrowRight,
  Hash,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';
import api, { resolveImageUrl } from '@/lib/api';
import type { Product } from '@/types/admin';

function renderDescription(text?: string) {
  if (!text) return '—';
  const html = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return <span className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: html }} />;
}

function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data.data as Product;
    },
    enabled: !!id,
  });
}

function useProductImages(id: string) {
  return useQuery({
    queryKey: ['product-images', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}/images`);
      return (data.data || []) as string[];
    },
    enabled: !!id,
  });
}

function useBrandProducts(brand: string) {
  return useQuery({
    queryKey: ['brand-products', brand],
    queryFn: async () => {
      const { data } = await api.get('/products', {
        params: { brand, limit: 8 },
      });
      return (data.data || []) as Product[];
    },
    enabled: !!brand,
  });
}

function formatPrice(price: number, locale: string) {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: locale === 'vi' ? 'VND' : 'USD',
  }).format(locale === 'vi' ? price : price / 25000);
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200')}
        />
      ))}
    </div>
  );
}

function ProductImages({ images, name, isFavorite, onToggleFavorite }: { images: string[]; name: string; isFavorite: boolean; onToggleFavorite: () => void }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const allImages = images.length > 0 ? images : [''];

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto max-h-[500px]">
        {allImages.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className={cn(
              'flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200',
              selectedIndex === i ? 'border-[#D4A5A5] shadow-md' : 'border-gray-100 hover:border-gray-300'
            )}
          >
            <img src={resolveImageUrl(img) || '/placeholder.svg'} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      <div className="flex-1 min-w-0 max-w-[800px] self-start relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFF8F5] to-[#F5EDE8] border border-[#E8DDD5]">
        <img src={resolveImageUrl(allImages[selectedIndex]) || '/placeholder.svg'} alt={name} className="w-full h-full object-contain p-8 md:p-12" />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className={cn(
            'absolute top-3 right-3 p-2 rounded-full border transition-all duration-300 bg-white/80 backdrop-blur-sm',
            isFavorite ? 'bg-[#D4A5A5] border-[#D4A5A5] text-white' : 'border-[#E8DDD5] text-[#7A5C5C]/60 hover:border-[#D4A5A5]/40'
          )}
        >
          <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
        </button>
      </div>
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E8DDD5]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left text-sm font-semibold text-[#5C3D3D] tracking-wide uppercase">
        {title}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="pb-4 text-sm text-[#7A5C5C]/80 leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SeasonIndicator({ product, locale }: { product: Product; locale: string }) {
  const seasonMap: Record<string, { icon: React.ReactNode; label: string }> = {
    'Xuân': { icon: <Sun size={14} />, label: locale === 'vi' ? 'Xuân' : 'Spring' },
    'Spring': { icon: <Sun size={14} />, label: locale === 'vi' ? 'Xuân' : 'Spring' },
    'Hạ': { icon: <Sun size={14} />, label: locale === 'vi' ? 'Hạ' : 'Summer' },
    'Summer': { icon: <Sun size={14} />, label: locale === 'vi' ? 'Hạ' : 'Summer' },
    'Thu': { icon: <CloudSun size={14} />, label: locale === 'vi' ? 'Thu' : 'Autumn' },
    'Autumn': { icon: <CloudSun size={14} />, label: locale === 'vi' ? 'Thu' : 'Autumn' },
    'Fall': { icon: <CloudSun size={14} />, label: locale === 'vi' ? 'Thu' : 'Autumn' },
    'Đông': { icon: <Moon size={14} />, label: locale === 'vi' ? 'Đông' : 'Winter' },
    'Winter': { icon: <Moon size={14} />, label: locale === 'vi' ? 'Đông' : 'Winter' },
  };
  
  const timeMap: Record<string, { icon: React.ReactNode; label: string }> = {
    'Sáng': { icon: <Sun size={14} />, label: locale === 'vi' ? 'Sáng' : 'Morning' },
    'Morning': { icon: <Sun size={14} />, label: locale === 'vi' ? 'Sáng' : 'Morning' },
    'Chiều': { icon: <Sun size={14} />, label: locale === 'vi' ? 'Chiều' : 'Afternoon' },
    'Afternoon': { icon: <Sun size={14} />, label: locale === 'vi' ? 'Chiều' : 'Afternoon' },
    'Tối': { icon: <Moon size={14} />, label: locale === 'vi' ? 'Tối' : 'Evening' },
    'Evening': { icon: <Moon size={14} />, label: locale === 'vi' ? 'Tối' : 'Evening' },
    'Đêm': { icon: <Moon size={14} />, label: locale === 'vi' ? 'Đêm' : 'Night' },
    'Night': { icon: <Moon size={14} />, label: locale === 'vi' ? 'Đêm' : 'Night' },
  };

  const productSeasons = product.season ? product.season.split(',').map(s => s.trim()).filter(Boolean) : [];
  const productTimes = product.time ? product.time.split(',').map(t => t.trim()).filter(Boolean) : [];

  if (productSeasons.length === 0 && productTimes.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-4 text-xs text-[#7A5C5C]/60">
      {productSeasons.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#7A5C5C]/40 uppercase tracking-wider text-[10px]">{locale === 'vi' ? 'Mùa' : 'Season'}:</span>
          {productSeasons.map((season) => {
            const mapped = seasonMap[season] || { icon: <Sun size={14} />, label: season };
            return (
              <span key={season} className="flex items-center gap-1 px-2 py-1 bg-[#FFF8F5] rounded-md">
                {mapped.icon}{mapped.label}
              </span>
            );
          })}
        </div>
      )}
      {productTimes.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#7A5C5C]/40 uppercase tracking-wider text-[10px]">{locale === 'vi' ? 'Thời gian' : 'Time'}:</span>
          {productTimes.map((time) => {
            const mapped = timeMap[time] || { icon: <Sun size={14} />, label: time };
            return (
              <span key={time} className="flex items-center gap-1 px-2 py-1 bg-[#FFF8F5] rounded-md">
                {mapped.icon}{mapped.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LongevitySillage({ product, locale }: { product: Product; locale: string }) {
  const hasData = product.longevity || product.sillage;
  if (!hasData) return null;
  return (
    <div className="flex flex-wrap gap-6 text-sm">
      {product.longevity && (
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#D4A5A5]" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#7A5C5C]/40 font-semibold">{locale === 'vi' ? 'Lưu hương' : 'Longevity'}</p>
            <p className="font-medium text-[#2D1B1B]">{product.longevity}</p>
          </div>
        </div>
      )}
      {product.sillage && (
        <div className="flex items-center gap-2">
          <Wind size={16} className="text-[#D4A5A5]" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#7A5C5C]/40 font-semibold">{locale === 'vi' ? 'Tỏa hương' : 'Sillage'}</p>
            <p className="font-medium text-[#2D1B1B]">{product.sillage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function AccordPills({ keywords, locale }: { keywords: string[]; locale: string }) {
  const noteIcons: Record<string, string> = {
    citrus: '🍊', amber: '🟤', woody: '🪵', 'warm spicy': '🌶️', aromatic: '🌿',
    'fresh spicy': '🌶️', smoky: '🔥', balsamic: '🧴', fresh: '💧', green: '🌱',
    floral: '🌸', fruity: '🍎', sweet: '🍯', leather: '👜', aquatic: '🌊',
    gourmand: '🍫', powdery: '👶', rose: '🌹', vanilla: '🍦', musk: '🤍',
  };
  return (
    <div className="flex flex-wrap gap-2">
      {(keywords || []).map((kw, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFF8F5] text-[#7A5C5C] border border-[#E8DDD5] hover:border-[#D4A5A5] hover:bg-white transition-all cursor-pointer"
        >
          <span>{noteIcons[kw.toLowerCase()] || '✨'}</span>
          {kw}
        </span>
      ))}
    </div>
  );
}

function RatingBreakdown({ rating, reviewsCount }: { rating: number; reviewsCount: number }) {
  const breakdown = [
    { stars: 5, pct: 83 },
    { stars: 4, pct: 13 },
    { stars: 3, pct: 3 },
    { stars: 2, pct: 0 },
    { stars: 1, pct: 0 },
  ];
  return (
    <div className="space-y-2">
      {breakdown.map((b) => (
        <div key={b.stars} className="flex items-center gap-2 text-xs">
          <span className="w-8 text-[#7A5C5C]/60">{b.stars} ★</span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${b.pct}%` }}
              transition={{ duration: 0.6, delay: b.stars * 0.1 }}
              className="h-full bg-amber-400 rounded-full"
            />
          </div>
          <span className="w-8 text-right text-[#7A5C5C]/40">{b.pct}%</span>
        </div>
      ))}
    </div>
  );
}

export function ProductDetail({ productId }: { productId: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const { data: product, isLoading, error } = useProduct(productId);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedScentGroup, setSelectedScentGroup] = useState('');
  const [selectedConcentration, setSelectedConcentration] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');

  // Set mặc định 50ml + random biến thể sau khi product load
  useEffect(() => {
    if (!product) return;
    // Default size: ưu tiên 50ml
    const sizes = (product.size || '').split(',').map((s) => s.trim().split(':')[0]);
    const defaultSize = sizes.find((s) => s.toLowerCase().replace(/\s/g, '').startsWith('50ml') || s === '50') || sizes[0] || '';
    setSelectedSize(defaultSize);
    // Random pick cho 3 biến thể còn lại
    const pick = (items: string[]) => items.length > 0 ? items[Math.floor(Math.random() * items.length)] : '';
    const getItems = (field: string | undefined) => (field || '').split(',').map(s => s.trim()).filter(Boolean);
    setSelectedScentGroup(pick(getItems(product.scentGroup)));
    setSelectedConcentration(pick(getItems(product.concentration)));
    setSelectedSegment(pick(getItems(product.segment)));
  }, [product]);

  const { data: brandProducts = [] } = useBrandProducts(product?.brand || '');
  const { data: subImages } = useProductImages(productId);

  const images: string[] = [];
  if (product?.image) images.push(product.image);
  if (subImages) {
    for (const url of subImages) {
      if (!images.includes(url)) images.push(url);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-gray-100 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-4 bg-gray-100 rounded w-1/4" />
                <div className="h-8 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-6 bg-gray-100 rounded w-1/3" />
                <div className="h-24 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-[#7A5C5C]/60">{locale === 'vi' ? 'Không tìm thấy sản phẩm' : 'Product not found'}</p>
          <Link href="/" className="mt-4 inline-block text-sm text-[#D4A5A5] hover:underline">{locale === 'vi' ? 'Quay về trang chủ' : 'Back to home'}</Link>
        </div>
      </div>
    );
  }

  const parsedSizes = product.size ? product.size.split(',').map((s) => s.trim().split(':')[0]) : [];
  const sizePriceMap: Record<string, number> = {};
  if (product.size) {
    product.size.split(',').forEach((s) => {
      const parts = s.trim().split(':');
      if (parts.length >= 2) sizePriceMap[parts[0]] = Number(parts[1]) || 0;
    });
  }
  const isOutOfStock = typeof product.quantityInStock === 'number' && product.quantityInStock === 0;
  const keywords = product.keywords
    ? Array.isArray(product.keywords)
      ? product.keywords
      : product.keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : [];

  const isDiscountActive = () => {
    if (!product.discountPercentage || product.discountPercentage <= 0) return false;
    if (!product.discountStartDate && !product.discountEndDate) return true;
    const now = new Date();
    if (product.discountStartDate && now < new Date(product.discountStartDate)) return false;
    if (product.discountEndDate && now > new Date(product.discountEndDate)) return false;
    return true;
  };

  const activeDiscount = isDiscountActive();
  const selectedSizeRawPrice = selectedSize && sizePriceMap[selectedSize] ? sizePriceMap[selectedSize] : product.price;
  const basePrice = Math.round(selectedSizeRawPrice * 1.15);
  const isLargeSize = /^\d+/.test(selectedSize) && parseInt(selectedSize.match(/^\d+/)?.[0] || '0') >= 50;
  const effectivePrice = (activeDiscount && isLargeSize)
    ? Math.round(basePrice * (1 - (product.discountPercentage || 0) / 100))
    : basePrice;

  // Check if all 4 variants are selected
  const hasScentGroup = (product.scentGroup || '').split(',').map(s => s.trim()).filter(Boolean).length === 0 || !!selectedScentGroup;
  const hasConcentration = (product.concentration || '').split(',').map(s => s.trim()).filter(Boolean).length === 0 || !!selectedConcentration;
  const hasSegment = (product.segment || '').split(',').map(s => s.trim()).filter(Boolean).length === 0 || !!selectedSegment;
  const hasSize = parsedSizes.length === 0 || !!selectedSize;
  const isVariantsComplete = hasScentGroup && hasConcentration && hasSegment && hasSize;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-xs text-[#7A5C5C]/50 mb-6 flex-wrap">
          <Link href="/" className="hover:text-[#D4A5A5] transition-colors">{locale === 'vi' ? 'Trang chủ' : 'Home'}</Link>
          <span>/</span>
          <Link href="/collections" className="hover:text-[#D4A5A5] transition-colors">{locale === 'vi' ? 'Nước hoa' : 'Perfume'}</Link>
          <span>/</span>
          <Link href={`/brands/${product.brand.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-[#D4A5A5] transition-colors">{product.brand}</Link>
          <span>/</span>
          <span className="text-[#7A5C5C]/80 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ── Back to Home ── */}
        <Link href="/"
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white border border-[#D4A5A5]/20 rounded-full hover:shadow-md hover:bg-[#FFF5F5] transition-all duration-300 text-xs font-semibold text-[#7A5C5C]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          {locale === 'vi' ? 'Trang chủ' : 'Home'}
        </Link>

        {/* ── Main Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Left - Images */}
          <div>
            <ProductImages images={images} name={product.name} isFavorite={isFavorite} onToggleFavorite={() => setIsFavorite(!isFavorite)} />

            {/* Hotline + Fundiin + Badges dưới ảnh */}
            <div className="mt-4 flex flex-col gap-2">
              {/* Hotline */}
              <div className="flex items-center gap-2 text-sm text-[#7A5C5C]/60">
                <Phone size={12} />
                <span>{locale === 'vi' ? 'Gọi đặt mua:' : 'Call to order:'} <a href="tel:02888899942" className="text-[#D4A5A5] font-semibold hover:underline">028 888 999 42</a> (8:00-20:00)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#D4A5A5] bg-[#FFF8F5] rounded-xl px-4 py-3 border border-[#D4A5A5]/10">
                <Gift size={14} />
                <span>{locale === 'vi' ? 'Giảm đến 100K khi thanh toán qua Fundiin' : 'Up to 100K off when paying with Fundiin'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: ShieldCheck, text: locale === 'vi' ? 'Chính hãng 100%' : '100% Authentic' },
                  { icon: RefreshCw, text: locale === 'vi' ? 'Đổi trả trong 7 ngày' : '7-day returns' },
                  { icon: Truck, text: locale === 'vi' ? 'Giao hàng toàn quốc' : 'Free shipping' },
                  { icon: Clock, text: locale === 'vi' ? 'Bảo hành trọn đời' : 'Lifetime warranty' },
                ].map((badge) => (
                  <div key={badge.text} className="flex items-center gap-2 bg-[#FFF8F5] rounded-lg px-3 py-2">
                    <badge.icon size={14} className="text-[#D4A5A5] flex-shrink-0" />
                    <span className="text-[11px] text-[#7A5C5C]/70 font-medium">{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Info */}
          <div className="flex flex-col">
            {/* Brand + Name */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D4A5A5]">{product.brand}</span>
                <h1 className="mt-2 text-xl md:text-2xl lg:text-3xl font-medium text-[#2D1B1B] font-serif leading-tight">{product.name}</h1>
              </div>
            </div>

            {/* Rating + Sold */}
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <StarRating rating={product.rating || 5} />
              <span className="text-sm text-[#7A5C5C]/60">{product.rating || 5} ({product.reviewsCount || 0} {locale === 'vi' ? 'đánh giá' : 'reviews'})</span>
              {product.soldCount ? <span className="text-sm text-[#7A5C5C]/40">| {locale === 'vi' ? 'Đã bán' : 'Sold'} {product.soldCount}</span> : null}
            </div>

            {/* Longevity + Sillage */}
            <div className="mt-4">
              <LongevitySillage product={product} locale={locale} />
            </div>

            {/* Season + Time */}
            <div className="mt-4">
              <SeasonIndicator product={product} locale={locale} />
            </div>

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-2xl md:text-3xl font-bold text-[#2D1B1B]">{formatPrice(effectivePrice, locale)}</span>
              {activeDiscount && (
                <>
                  <span className="text-sm line-through text-[#7A5C5C]/40">{formatPrice(product.price, locale)}</span>
                  <span className="text-[11px] font-bold text-white bg-red-400 px-2 py-0.5 rounded-full">-{product.discountPercentage}%</span>
                </>
              )}
            </div>

            {/* Mô tả tìm kiếm */}
            {product.metaDescription && (
              <div className="mt-4 text-sm text-[#7A5C5C]/70 leading-relaxed">{product.metaDescription}</div>
            )}

            {/* Product Classifications (scent group, concentration, segment) — chọn 1 mỗi loại */}
            {(
              (product.scentGroup || '').split(',').map(s => s.trim()).filter(Boolean).length > 0 ||
              (product.concentration || '').split(',').map(s => s.trim()).filter(Boolean).length > 0 ||
              (product.segment || '').split(',').map(s => s.trim()).filter(Boolean).length > 0
            ) && (
              <div className="mt-6 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5C5C]/60 mb-3">{locale === 'vi' ? 'Phân loại' : 'Classification'}</p>
                {product.scentGroup && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#7A5C5C]/40 font-semibold mb-1">{locale === 'vi' ? 'Nhóm hương' : 'Scent Group'}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.scentGroup.split(',').map(s => s.trim()).filter(Boolean).map((item) => (
                        <button
                          key={item}
                          onClick={() => setSelectedScentGroup(selectedScentGroup === item ? '' : item)}
                          className={cn(
                            'px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200',
                            selectedScentGroup === item
                              ? 'border-[#D4A5A5] bg-[#FFF8F5] text-[#2D1B1B] shadow-sm'
                              : 'border-[#E8DDD5] text-[#7A5C5C]/70 bg-[#FFF8F5] hover:border-[#D4A5A5]/40'
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {product.concentration && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#7A5C5C]/40 font-semibold mb-1">{locale === 'vi' ? 'Nồng độ' : 'Concentration'}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.concentration.split(',').map(s => s.trim()).filter(Boolean).map((item) => (
                        <button
                          key={item}
                          onClick={() => setSelectedConcentration(selectedConcentration === item ? '' : item)}
                          className={cn(
                            'px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200',
                            selectedConcentration === item
                              ? 'border-[#D4A5A5] bg-[#FFF8F5] text-[#2D1B1B] shadow-sm'
                              : 'border-[#E8DDD5] text-[#7A5C5C]/70 bg-[#FFF8F5] hover:border-[#D4A5A5]/40'
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {product.segment && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#7A5C5C]/40 font-semibold mb-1">{locale === 'vi' ? 'Phân khúc' : 'Segment'}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.segment.split(',').map(s => s.trim()).filter(Boolean).map((item) => (
                        <button
                          key={item}
                          onClick={() => setSelectedSegment(selectedSegment === item ? '' : item)}
                          className={cn(
                            'px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200',
                            selectedSegment === item
                              ? 'border-[#D4A5A5] bg-[#FFF8F5] text-[#2D1B1B] shadow-sm'
                              : 'border-[#E8DDD5] text-[#7A5C5C]/70 bg-[#FFF8F5] hover:border-[#D4A5A5]/40'
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Size / Dung tích */}
            {parsedSizes.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5C5C]/60 mb-2">{locale === 'vi' ? 'Dung tích' : 'Size'}</p>
                <div className="flex flex-wrap gap-2">
                  {parsedSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200',
                        selectedSize === size ? 'border-[#D4A5A5] bg-[#FFF8F5] text-[#2D1B1B] shadow-sm' : 'border-[#E8DDD5] text-[#7A5C5C]/70 hover:border-[#D4A5A5]/40'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center border border-[#E8DDD5] rounded-xl overflow-hidden self-start sm:self-auto">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2.5 text-[#7A5C5C]/60 hover:text-[#2D1B1B] hover:bg-[#FFF8F5] transition-colors"><Minus size={14} /></button>
                <span className="px-4 py-2.5 text-sm font-medium text-[#2D1B1B] min-w-[40px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2.5 text-[#7A5C5C]/60 hover:text-[#2D1B1B] hover:bg-[#FFF8F5] transition-colors"><Plus size={14} /></button>
              </div>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={isOutOfStock || !isVariantsComplete}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300',
                  isOutOfStock || !isVariantsComplete ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-[#2D1B1B] text-white hover:bg-[#4A2B2B] shadow-lg shadow-black/5'
                )}
              >
                <ShoppingBag size={16} />
                {isOutOfStock ? (locale === 'vi' ? 'Tạm hết hàng' : 'Out of Stock') : (locale === 'vi' ? 'Thêm vào giỏ' : 'Add to Cart')}
              </motion.button>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={!isVariantsComplete}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300',
                  !isVariantsComplete ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-[#D4A5A5] text-white hover:bg-[#C49595] shadow-lg shadow-black/5'
                )}
              >
                <ShoppingBag size={16} />
                {locale === 'vi' ? 'Mua ngay' : 'Buy Now'}
              </motion.button>
            </div>

          </div>
        </div>

        {/* ── Accords / Mùi hương chính ── */}
        {keywords.length > 0 && (
          <div className="mt-14 border-t border-[#E8DDD5] pt-10">
            <div className="flex items-center gap-4 mb-4">
              <Sparkles size={18} className="text-[#D4A5A5]" />
              <h2 className="text-base font-semibold text-[#2D1B1B]">{locale === 'vi' ? 'MÙI HƯƠNG CHÍNH (ACCORDS)' : 'MAIN FRAGRANCE ACCORDS'}</h2>
            </div>
            <p className="text-[11px] text-[#7A5C5C]/40 mb-3 italic">{locale === 'vi' ? '(click tên nhóm hương để tìm hiểu chi tiết)' : '(click on accord to learn more)'}</p>
            <AccordPills keywords={keywords} locale={locale} />
          </div>
        )}

        {/* ── Fragrance Pyramid ── */}
        <div className="mt-12 border-t border-[#E8DDD5] pt-10">
          <h2 className="text-base font-semibold text-[#2D1B1B] mb-6">{locale === 'vi' ? 'Tháp hương' : 'Fragrance Pyramid'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: locale === 'vi' ? 'Hương đầu (5-15 phút)' : 'Top Notes (5-15 min)',
                color: 'from-emerald-50 to-emerald-100/50',
                border: 'border-emerald-200/50',
                icon: '🍊',
                notes: keywords.slice(0, 3),
              },
              {
                title: locale === 'vi' ? 'Hương giữa (20-60 phút)' : 'Heart Notes (20-60 min)',
                color: 'from-rose-50 to-rose-100/50',
                border: 'border-rose-200/50',
                icon: '🌸',
                notes: keywords.slice(3, 6),
              },
              {
                title: locale === 'vi' ? 'Hương cuối (>6 tiếng)' : 'Base Notes (>6 hours)',
                color: 'from-amber-50 to-amber-100/50',
                border: 'border-amber-200/50',
                icon: '🪵',
                notes: keywords.slice(6, 12),
              },
            ].map((layer) => (
              <div key={layer.title} className={cn('rounded-2xl p-5 bg-gradient-to-b border', layer.color, layer.border)}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{layer.icon}</span>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#5C3D3D]">{layer.title}</p>
                </div>
                {layer.notes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {layer.notes.map((note) => (
                      <div key={note} className="flex items-center gap-1.5 bg-white/70 rounded-lg px-2.5 py-1.5 border border-white/50">
                        <span className="text-[11px] text-[#7A5C5C]/80 font-medium">{note}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#7A5C5C]/40 italic">{locale === 'vi' ? 'Đang cập nhật' : 'Updating'}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Accordion Details ── */}
        <div className="mt-14 max-w-3xl border-t border-[#E8DDD5] pt-6">
          <Accordion title={locale === 'vi' ? 'Chi tiết sản phẩm' : 'Product Details'} defaultOpen>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: locale === 'vi' ? 'Thương hiệu' : 'Brand', value: product.brand },
                { label: locale === 'vi' ? 'Phân loại' : 'Category', value: product.categories || '—' },
                { label: locale === 'vi' ? 'Dung tích' : 'Size', value: product.size || '—' },
                { label: locale === 'vi' ? 'Nồng độ' : 'Concentration', value: product.concentration || '—' },
                { label: locale === 'vi' ? 'Đánh giá' : 'Rating', value: `${product.rating || 5}/5` },
                { label: locale === 'vi' ? 'Đã bán' : 'Sold', value: product.soldCount ? `${product.soldCount}+` : '—' },
                { label: locale === 'vi' ? 'Nhóm hương' : 'Scent Group', value: product.scentGroup || '—' },
                { label: locale === 'vi' ? 'Phong cách' : 'Style', value: product.style || '—' },
                { label: locale === 'vi' ? 'Trạng thái' : 'Status', value: isOutOfStock ? (locale === 'vi' ? 'Hết hàng' : 'Out of Stock') : (locale === 'vi' ? 'Còn hàng' : 'In Stock') },
                { label: 'Barcode', value: '—' },
              ].map((item) => (
                <div key={item.label} className="border-b border-[#F5EDE8] pb-2">
                  <span className="text-[11px] uppercase tracking-wider text-[#7A5C5C]/40 font-semibold">{item.label}</span>
                  <p className="text-sm text-[#2D1B1B] font-medium mt-0.5">{item.value || '—'}</p>
                </div>
              ))}
            </div>
          </Accordion>

          {/* Mô tả tìm kiếm */}
          {product.metaDescription && (
            <Accordion title={locale === 'vi' ? 'Mô tả tìm kiếm' : 'Search Description'}>
              <div className="text-sm text-[#7A5C5C]/80 leading-relaxed">{product.metaDescription}</div>
            </Accordion>
          )}

          {/* Who is it for */}
          {product.suitableFor && (
            <Accordion title={locale === 'vi' ? 'Ai phù hợp với mùi hương này?' : 'Who is this for?'}>
              <ul className="space-y-2 list-disc pl-4 text-[#7A5C5C]/70">
                {product.suitableFor.split('|').map(s => s.trim()).filter(Boolean).map((item, i) => (
                  <li key={i} className="text-sm">{item}</li>
                ))}
              </ul>
            </Accordion>
          )}

          {/* When to use */}
          {product.occasion && (
            <Accordion title={locale === 'vi' ? 'Thích hợp dùng khi nào?' : 'When to use?'}>
              <ul className="space-y-2 list-disc pl-4 text-[#7A5C5C]/70">
                {product.occasion.split('|').map(s => s.trim()).filter(Boolean).map((item, i) => (
                  <li key={i} className="text-sm">{item}</li>
                ))}
              </ul>
            </Accordion>
          )}

          {/* Longevity & Sillage Detail */}
          {(product.longevity || product.sillage || product.durability || product.scentTrail) && (
            <Accordion title={locale === 'vi' ? 'Độ lưu hương & tỏa hương' : 'Longevity & Sillage'}>
              <div className="space-y-3 text-sm text-[#7A5C5C]/70">
                {[
                  { label: locale === 'vi' ? 'Lưu hương' : 'Longevity', value: product.longevity || '—' },
                  { label: locale === 'vi' ? 'Độ tỏa hương' : 'Sillage', value: product.sillage || '—' },
                  { label: locale === 'vi' ? 'Độ bền mùi' : 'Durability', value: product.durability || '—' },
                  { label: locale === 'vi' ? 'Vệt hương' : 'Scent trail', value: product.scentTrail || '—' },
                ].map((item) => (
                  <div key={item.label}>
                    <strong className="text-[#5C3D3D]">{item.label}:</strong> {item.value}
                  </div>
                ))}
              </div>
            </Accordion>
          )}



          {/* Keywords */}
          {keywords.length > 0 && (
            <Accordion title={locale === 'vi' ? 'Mùi hương chính' : 'Fragrance Notes'}>
              <AccordPills keywords={keywords} locale={locale} />
            </Accordion>
          )}

          {/* Reviews Section */}
          <Accordion title={`${locale === 'vi' ? 'Đánh giá & Hỏi đáp' : 'Reviews & QA'} (${product.reviewsCount || 0})`}>
            {/* Rating Overview */}
            <div className="flex items-start gap-8 mb-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-[#2D1B1B]">{product.rating || 5}</p>
                <StarRating rating={product.rating || 5} size={14} />
                <p className="text-xs text-[#7A5C5C]/50 mt-1">{locale === 'vi' ? 'Đánh giá trung bình' : 'Average rating'}</p>
              </div>
              <div className="flex-1">
                <RatingBreakdown rating={product.rating || 5} reviewsCount={product.reviewsCount || 0} />
              </div>
            </div>

            {/* Review Form Prompt */}
            <div className="border-t border-[#E8DDD5] pt-4 mt-4">
              <p className="text-sm text-[#7A5C5C]/60 mb-3">{locale === 'vi' ? 'Viết đánh giá của bạn' : 'Write your review'}</p>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-[#7A5C5C]/40">{locale === 'vi' ? 'Chọn sao:' : 'Select rating:'}</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18} className="text-gray-200 hover:text-amber-400 cursor-pointer transition-colors" />
                ))}
              </div>
              <textarea
                placeholder={locale === 'vi' ? 'Chia sẻ cảm nhận của bạn về sản phẩm...' : 'Share your thoughts about this product...'}
                className="w-full border border-[#E8DDD5] rounded-xl px-4 py-3 text-sm text-[#2D1B1B] placeholder:text-[#7A5C5C]/30 focus:outline-none focus:border-[#D4A5A5] resize-none"
                rows={3}
              />
              <div className="flex items-center gap-3 mt-3">
                <button className="text-xs text-[#7A5C5C]/40 hover:text-[#D4A5A5] transition-colors">{locale === 'vi' ? 'Thêm ảnh' : 'Add photos'}</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="ml-auto px-5 py-2 bg-[#2D1B1B] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#4A2B2B] transition-colors"
                >
                  {locale === 'vi' ? 'Gửi đánh giá' : 'Submit Review'}
                </motion.button>
              </div>
            </div>
          </Accordion>
        </div>

        {/* ── Why Choose Section ── */}
        <div className="mt-16 border-t border-[#E8DDD5] pt-10">
          <h2 className="text-base font-semibold text-[#2D1B1B] font-serif text-center mb-8">
            {locale === 'vi' ? 'Tại sao chọn chúng tôi?' : 'Why Choose Us?'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, title: locale === 'vi' ? 'Cam kết chính hãng 100%' : '100% Authentic', desc: locale === 'vi' ? 'Tất cả nước hoa & mỹ phẩm' : 'All perfumes & cosmetics' },
              { icon: RefreshCw, title: locale === 'vi' ? 'Bảo hành đến giọt cuối cùng' : 'Guaranteed to last', desc: locale === 'vi' ? 'Miễn phí đổi trả trong 7 ngày' : 'Free returns within 7 days' },
              { icon: Truck, title: locale === 'vi' ? 'Giao hàng miễn phí' : 'Free shipping', desc: locale === 'vi' ? 'Miễn phí thiệp & gói quà' : 'Free gift wrapping' },
              { icon: CreditCard, title: locale === 'vi' ? 'Thanh toán online an toàn' : 'Secure payment', desc: locale === 'vi' ? 'Trả góp 0% qua Fundiin' : '0% installment via Fundiin' },
            ].map((item) => (
              <div key={item.title} className="text-center p-5 rounded-2xl bg-[#FFF8F5] border border-[#E8DDD5]">
                <div className="w-10 h-10 mx-auto rounded-full bg-white flex items-center justify-center shadow-sm mb-3">
                  <item.icon size={18} className="text-[#D4A5A5]" />
                </div>
                <p className="text-sm font-semibold text-[#2D1B1B]">{item.title}</p>
                <p className="text-xs text-[#7A5C5C]/50 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Brand Products Grid ── */}
        <div className="mt-16 border-t border-[#E8DDD5] pt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[#2D1B1B] font-serif">
                {locale === 'vi' ? 'Sản phẩm thương hiệu' : 'Brand Products'} {product.brand}
              </h2>
              <p className="text-sm text-[#7A5C5C]/50 mt-1">{locale === 'vi' ? 'Khám phá thêm các sản phẩm từ' : 'Explore more products from'} <strong>{product.brand}</strong></p>
            </div>
            <Link href={`/brands/${product.brand.toLowerCase().replace(/\s+/g, '-')}`} className="text-xs text-[#D4A5A5] font-semibold hover:underline flex items-center gap-1">
              {locale === 'vi' ? 'Xem tất cả' : 'View all'} <ArrowRight size={12} />
            </Link>
          </div>

          {brandProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {brandProducts.filter((p) => p._id !== productId).slice(0, 8).map((p) => (
                <Link key={p._id} href={`/product/${p._id}`} className="group">
                  <div className="aspect-square rounded-xl overflow-hidden bg-[#FFF8F5] border border-[#E8DDD5] p-4">
                    <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
                      <Image src={resolveImageUrl(p.image) || '/placeholder.svg'} alt={p.name} fill className="object-contain" sizes="(max-width: 640px) 50vw, 25vw" unoptimized />
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[#2D1B1B] line-clamp-1">{p.name}</p>
                  <p className="text-xs text-[#7A5C5C]/60">{formatPrice(p.price, locale)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#7A5C5C]/40 italic">{locale === 'vi' ? 'Đang tải...' : 'Loading...'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
