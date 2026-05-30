'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ShoppingBag, Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/api';
import type { ProductData } from './types';

const ASPECT_CLASSES: Record<string, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]'
};

interface ProductImageProps {
  product: ProductData;
  isFavorite: boolean;
  setIsFavorite: (v: boolean) => void;
  activeDiscount: boolean;
  discountPercentage?: number;
  tagDisplay: React.ReactNode;
  aspectClass: string;
  cardStyle: React.CSSProperties;
  imagePadding: number;
  priority?: boolean;
}

export function ProductImage({
  product, isFavorite, setIsFavorite, activeDiscount,
  discountPercentage, tagDisplay, aspectClass,
  cardStyle, imagePadding, priority
}: ProductImageProps) {
  const t = useTranslations('NewProducts');

  return (
    <div className={`product-image-frame ${aspectClass} w-full flex-shrink-0 relative overflow-hidden bg-[#7A5C5C]/3`} style={cardStyle}>
      {/* Tag Badge */}
      {tagDisplay && (
        <div className="absolute left-4 top-4 z-20 flex flex-col gap-1.5">
          {tagDisplay}
        </div>
      )}

      {/* Discount Badge */}
      {activeDiscount && (
        <div className="absolute right-4 top-4 z-20">
          <div className="px-3 py-1.5 text-[11px] font-bold rounded-lg shadow-md" style={{
            backgroundColor: 'var(--discount-badge-bg, #DC2626)',
            color: 'var(--discount-badge-text, white)',
          }}>
            -{discountPercentage}%
          </div>
        </div>
      )}

      <Link href={`/product/${product._id}`} className="absolute inset-0 z-10 block clickable">
        <div className="w-full h-full transition-transform duration-[1200ms] ease-out group-hover:scale-105" style={{ padding: `${imagePadding}px` }}>
          <div className="relative w-full h-full">
            {product.image ? (
              <Image
                src={resolveImageUrl(product.image)}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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

      {/* Quick Action Overlay */}
      <div className="quick-action-glass-container absolute inset-x-0 bottom-0 z-20 flex translate-y-full items-center justify-center gap-2.5 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="quick-buy-glass-btn flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[9px] font-bold uppercase tracking-widest shadow-lg">
          <ShoppingBag size={13} />
          {t('addToCart')}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFavorite(!isFavorite); }}
          className={cn('wishlist-glass-btn flex h-11 w-11 items-center justify-center rounded-xl shadow-lg border', isFavorite ? 'bg-[#D4A5A5] border-[#D4A5A5] text-white' : '')}
        >
          <Heart size={15} className={isFavorite ? 'fill-current' : ''} />
        </motion.button>
      </div>
    </div>
  );
}