'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/api';
import './new-products.css';

export interface ProductData {
  _id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  description: string;
  tag?: string;
  rating?: number;
  reviewsCount?: number;
  quantityInStock?: number;
  discountPercentage?: number;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  keywords?: string[];
  size?: string;
}

interface ProductCardProps {
  product: ProductData;
  index?: number;
  priority?: boolean;
}

export function ProductCard({ product, index = 0, priority = false }: ProductCardProps) {
  const t = useTranslations('NewProducts');
  const locale = useLocale();
  const [isFavorite, setIsFavorite] = useState(false);

  const getTagDisplayName = (tag?: string) => {
    if (!tag) return '';
    const lower = tag.toLowerCase();
    if (lower === 'sale' || lower === 'giam-gia' || lower === 'giam gia') {
      return locale === 'vi' ? 'Giảm giá' : 'Sale';
    }
    if (lower === 'new' || lower === 'san-pham-moi' || lower === 'san pham moi') {
      return locale === 'vi' ? 'Sản phẩm mới' : 'New Arrivals';
    }
    return tag;
  };

  const isDiscountActive = () => {
    if (!product.discountPercentage || product.discountPercentage <= 0) return false;
    if (!product.discountStartDate && !product.discountEndDate) return true;
    
    const now = new Date();
    
    if (product.discountStartDate) {
      const start = new Date(product.discountStartDate);
      if (now < start) return false;
    }
    
    if (product.discountEndDate) {
      const end = new Date(product.discountEndDate);
      if (now > end) return false;
    }
    
    return true;
  };

  const activeDiscount = isDiscountActive();
  const discountedPrice = activeDiscount 
    ? product.price * (1 - (product.discountPercentage || 0) / 100)
    : product.price;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: locale === 'vi' ? 'VND' : 'USD',
    }).format(locale === 'vi' ? price : price / 25000);
  };

  const parsedSizes = product.size
    ? product.size
        .split(',')
        .map((s) => {
          const parts = s.trim().split(':');
          return parts[0].trim();
        })
        .filter(Boolean)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="product-card-container group relative flex h-full flex-col"
    >
      {/* Floating Favorite Heart Badge (Hangs off the top-right corner of the card, unclipped) */}
      {isFavorite && (
        <div
          className="floating-favorite-heart absolute -top-2.5 -right-2.5 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-[#D4A5A5] text-white shadow-lg border border-white cursor-pointer clickable"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite(false);
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center justify-center w-full h-full"
          >
            <Heart size={11} className="fill-current text-white" />
          </motion.div>
        </div>
      )}

      {/* Image Container with Luxury Effects */}
      <div className="product-image-frame aspect-square w-full flex-shrink-0 relative overflow-hidden bg-[#7A5C5C]/3 rounded-2xl">
        {product.tag && (
          <div className="absolute left-4 top-4 z-20 flex flex-col gap-1.5">
            {product.tag.split(',').slice(0, 1).map((singleTag, idx) => {
              const cleaned = singleTag.trim();
              if (!cleaned) return null;
              return (
                <div key={idx} className="product-badge-glass px-3.5 py-1">
                  {getTagDisplayName(cleaned)}
                </div>
              );
            })}
          </div>
        )}

        {activeDiscount && (
          <div className="absolute right-4 top-4 z-20">
            <div className="discount-badge-luxury px-3 py-1.5 shadow-md">
              -{product.discountPercentage}%
            </div>
          </div>
        )}

        <Link href={`/product/${product._id}`} className="absolute inset-0 z-10 block clickable">
          <div className="w-full h-full p-10 transition-transform duration-[1200ms] ease-out group-hover:scale-105">
            <div className="relative w-full h-full">
              {product.image ? (
                <Image
                  src={resolveImageUrl(product.image)}
                  alt={product.name}
                  fill
                  unoptimized
                  className="product-image object-contain"
                  priority={priority}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#7A5C5C]/5 text-[10px] text-[#7A5C5C]/20 uppercase tracking-widest">
                  No Image
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Glassmorphism Quick Action Overlay */}
        <div className="quick-action-glass-container absolute inset-x-0 bottom-0 z-20 flex translate-y-full items-center justify-center gap-2.5 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="quick-buy-glass-btn flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[9px] font-bold uppercase tracking-widest shadow-lg"
          >
            <ShoppingBag size={13} />
            {t('addToCart')}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className={cn(
              "wishlist-glass-btn flex h-11 w-11 items-center justify-center rounded-xl shadow-lg border",
              isFavorite 
                ? "bg-[#D4A5A5] border-[#D4A5A5] text-white" 
                : ""
            )}
          >
            <Heart size={15} className={isFavorite ? "fill-current" : ""} />
          </motion.button>
        </div>
      </div>

      {/* Product Meta Info */}
      <div className="mt-4 flex flex-1 flex-col items-center text-center">
        {product.keywords && product.keywords.length > 0 && (
          <div className="mb-2 flex flex-wrap justify-center gap-1 min-h-[16px]">
            {product.keywords.slice(0, 3).map((keyword, i) => (
              <span 
                key={i} 
                className="text-[7px] font-bold uppercase tracking-tighter text-[#7A5C5C]/40 border border-[#7A5C5C]/10 px-1.5 py-0.5 rounded-sm bg-white/40"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
        
        <span className="product-brand-luxury">
          {product.brand}
        </span>
        
        <Link href={`/product/${product._id}`} className="mt-1.5 block">
          <h3 className="product-title-luxury line-clamp-2 min-h-[2.2rem]">
            {product.name}
          </h3>
        </Link>

        {/* Sizing/Capacity variants */}
        <div className="mt-1.5 flex flex-wrap justify-center gap-1 min-h-[18px]">
          {parsedSizes.length > 0 && parsedSizes.map((sz, i) => (
            <span 
              key={i} 
              className="text-[10px] font-semibold tracking-wider text-[#7A5C5C]/70 bg-white/40 border border-[#7A5C5C]/10 px-1.5 py-0.5 rounded-md backdrop-blur-sm group-hover:border-[#D4A5A5]/30 group-hover:text-[#7A5C5C] transition-all duration-300"
            >
              {sz}
            </span>
          ))}
        </div>

        {/* Rating & Reviews */}
        <div className="mt-1.5 flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                className={cn(
                  i < (product.rating || 5) 
                    ? 'fill-[#D4A5A5] text-[#D4A5A5]' 
                    : 'text-[#D4A5A5]/20'
                )} 
              />
            ))}
          </div>
          <span className="text-[11px] text-[#7A5C5C]/50 font-medium">
            ({product.reviewsCount || 0})
          </span>
        </div>

        {/* Price & Stock status */}
        <div className="mt-auto pt-2 flex items-center justify-center gap-2">
          {activeDiscount ? (
            <>
              <span className="product-price-luxury text-[#D4A5A5] font-bold">
                {formatPrice(discountedPrice)}
              </span>
              <span className="text-[9px] line-through text-[#7A5C5C]/40">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="product-price-luxury">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
