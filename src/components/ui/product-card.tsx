'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';
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
      className="product-card-container group relative flex flex-col cursor-pointer"
    >
      {/* Image Container with Luxury Effects */}
      <div className="product-image-frame aspect-[3/4] w-full">
        {product.tag && (
          <div className="absolute left-4 top-4 z-20">
            <div className="product-badge-glass px-4 py-1.5">
              {product.tag}
            </div>
          </div>
        )}

        {activeDiscount && (
          <div className="absolute right-4 top-4 z-20">
            <div className="discount-badge-luxury px-3 py-1.5 shadow-md">
              -{product.discountPercentage}%
            </div>
          </div>
        )}

        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
            className="product-image object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-108"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#7A5C5C]/5 text-[10px] text-[#7A5C5C]/20 uppercase tracking-widest">
            No Image
          </div>
        )}

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
      <div className="mt-5 flex flex-col items-center text-center">
        {product.keywords && product.keywords.length > 0 && (
          <div className="mb-2.5 flex flex-wrap justify-center gap-1">
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
        
        <Link href={`/product/${product._id}`} className="mt-2 block">
          <h3 className="product-title-luxury">
            {product.name}
          </h3>
        </Link>

        {/* Sizing/Capacity variants */}
        {parsedSizes.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {parsedSizes.map((sz, i) => (
              <span 
                key={i} 
                className="text-[9px] font-semibold tracking-wider text-[#7A5C5C]/70 bg-white/40 border border-[#7A5C5C]/10 px-2 py-0.5 rounded-md backdrop-blur-sm group-hover:border-[#D4A5A5]/30 group-hover:text-[#7A5C5C] transition-all duration-300"
              >
                {sz}
              </span>
            ))}
          </div>
        )}

        {/* Rating & Reviews */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                size={9} 
                className={cn(
                  i < (product.rating || 5) 
                    ? 'fill-[#D4A5A5] text-[#D4A5A5]' 
                    : 'text-[#D4A5A5]/20'
                )} 
              />
            ))}
          </div>
          <span className="text-[10px] text-[#7A5C5C]/50 font-medium">
            ({product.reviewsCount || 0})
          </span>
        </div>

        {/* Price & Stock status */}
        <div className="mt-3 flex items-center gap-2">
          {activeDiscount ? (
            <>
              <span className="product-price-luxury text-[#D4A5A5] font-bold">
                {formatPrice(discountedPrice)}
              </span>
              <span className="text-[10px] line-through text-[#7A5C5C]/40">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="product-price-luxury">
              {formatPrice(product.price)}
            </span>
          )}
          {product.quantityInStock !== undefined && (
            <span className={cn(
              "text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors",
              product.quantityInStock > 0 
                ? 'bg-green-50 text-green-600 border border-green-100' 
                : 'bg-red-50 text-red-600 border border-red-100'
            )}>
              {product.quantityInStock > 0 
                ? t('inStock', { count: product.quantityInStock }) 
                : t('outOfStock')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
