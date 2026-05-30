'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';
import type { ProductData } from './types';

interface ProductInfoProps {
  product: ProductData;
  activeDiscount: boolean;
  discountedPrice: number;
  formatPrice: (price: number) => string;
  parsedSizes: string[];
  textAlignClass: string;
  brandFontSize: number;
  nameFontSize: number;
  priceFontSize: number;
  showKeywords: boolean;
  showSizes: boolean;
  showRating: boolean;
  elementOrder: string[];
}

export function ProductInfo({
  product, activeDiscount, discountedPrice, formatPrice,
  parsedSizes, textAlignClass,
  brandFontSize, nameFontSize, priceFontSize,
  showKeywords, showSizes, showRating, elementOrder
}: ProductInfoProps) {
  const elementMap: Record<string, React.ReactNode> = {
    keywords: showKeywords && product.keywords && product.keywords.length > 0 ? (
      <div key="keywords" className={`mb-2 flex flex-wrap gap-1 min-h-[16px] ${textAlignClass.includes('left') ? 'justify-start' : 'justify-center'}`}>
        {product.keywords.slice(0, 3).map((kw, i) => (
          <span key={i} className="text-[7px] font-bold uppercase tracking-tighter text-[#7A5C5C]/40 border border-[#7A5C5C]/10 px-1.5 py-0.5 rounded-sm bg-white/40">
            {kw}
          </span>
        ))}
      </div>
    ) : null,

    brand: (
      <span key="brand" className="product-brand-luxury" style={{ fontSize: `${brandFontSize}px` }}>
        {product.brand}
      </span>
    ),

    name: (
      <Link key="name" href={`/product/${product._id}`} className="mt-1.5 block">
        <h3 className="product-title-luxury line-clamp-2 min-h-[2.2rem]" style={{ fontSize: `${nameFontSize}px` }}>
          {product.name}
        </h3>
      </Link>
    ),

    sizes: showSizes ? (
      <div key="sizes" className={`mt-1.5 flex flex-wrap gap-1 min-h-[18px] ${textAlignClass.includes('left') ? 'justify-start' : 'justify-center'}`}>
        {parsedSizes.map((sz, i) => (
          <span key={i} className="text-[10px] font-semibold tracking-wider text-[#7A5C5C]/70 bg-white/80 border border-[#7A5C5C]/10 px-1.5 py-0.5 rounded-md group-hover:border-[#D4A5A5]/30 transition-all duration-300">
            {sz}
          </span>
        ))}
      </div>
    ) : null,

    rating: showRating ? (
      <div key="rating" className="mt-1.5 flex items-center gap-1">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} className={cn(i < (product.rating || 5) ? 'fill-[#D4A5A5] text-[#D4A5A5]' : 'text-[#D4A5A5]/20')} />
          ))}
        </div>
        <span className="text-[11px] text-[#7A5C5C]/50 font-medium">({product.reviewsCount || 0})</span>
      </div>
    ) : null,

    price: (
      <div key="price" className="mt-auto pt-2 flex items-center justify-center gap-2">
        {activeDiscount ? (
          <>
            <span className="product-price-luxury text-[#D4A5A5] font-bold" style={{ fontSize: `${priceFontSize}px` }}>
              {formatPrice(discountedPrice)}
            </span>
            <span className="text-[9px] line-through text-[#7A5C5C]/40">{formatPrice(product.price)}</span>
          </>
        ) : (
          <span className="product-price-luxury" style={{ fontSize: `${priceFontSize}px` }}>
            {formatPrice(product.price)}
          </span>
        )}
      </div>
    )
  };

  return (
    <div className={`mt-4 flex flex-1 flex-col ${textAlignClass}`}>
      {elementOrder.map((elementId) => elementMap[elementId] ?? null)}
    </div>
  );
}