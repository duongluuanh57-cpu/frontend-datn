'use client';

import React from 'react';

interface PreviewProductCardProps {
  index: number;
}

const MOCK_PRODUCTS = [
  { brand: "Maison Francis Kurkdjian", name: "Baccarat Rouge 540", price: "8.500.000₫", tag: "Best Seller" },
  { brand: "Creed", name: "Aventus", price: "9.200.000₫", tag: "Trending" },
  { brand: "Byredo", name: "Gypsy Water", price: "5.800.000₫", tag: "New" },
  { brand: "Le Labo", name: "Santal 33", price: "7.200.000₫", tag: "Limited" },
  { brand: "Jo Malone", name: "Wood Sage & Sea Salt", price: "4.200.000₫", tag: "Popular" },
  { brand: "Diptyque", name: "Philosykos", price: "5.600.000₫", tag: "Trending" },
  { brand: "Tom Ford", name: "Oud Wood", price: "11.500.000₫", tag: "Luxury" },
  { brand: "Kilian", name: "Angels' Share", price: "10.200.000₫", tag: "Limited" },
];

export function PreviewProductCard({ index }: PreviewProductCardProps) {
  const product = MOCK_PRODUCTS[index % MOCK_PRODUCTS.length];
  const displayIndex = (index % MOCK_PRODUCTS.length) + 1;

  return (
    <div className="group relative flex flex-col gap-4">
      {/* Image placeholder */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#FDF2F8] to-[#F1EEF5] border border-white/60 shadow-[0_8px_32px_rgba(122,92,92,0.05)]">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[48px] font-light text-[#D4A5A5]/30" style={{ fontFamily: 'serif' }}>
            {String(displayIndex).padStart(2, '0')}
          </span>
        </div>
        {/* Decorative element */}
        <div className="absolute -top-2 -right-2 w-16 h-16 rounded-full bg-[#D4A5A5]/5 blur-xl" />
        <div className="absolute -bottom-2 -left-2 w-20 h-20 rounded-full bg-[#EC4899]/5 blur-xl" />
      </div>

      {/* Info */}
      <div className="flex flex-col items-center text-center gap-1.5">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D4A5A5]">
          {product.brand}
        </span>
        <h3 className="text-sm font-medium text-[#7A5C5C] leading-tight">
          {product.name}
        </h3>
        <span className="text-sm font-semibold text-[#7A5C5C]">
          {product.price}
        </span>
      </div>

      {/* Tag badge */}
      <div className="absolute top-3 left-3">
        <span className="px-2 py-1 text-[8px] font-bold uppercase tracking-wider rounded-full bg-white/80 text-[#7A5C5C] border border-white/60 shadow-sm backdrop-blur-sm">
          {product.tag}
        </span>
      </div>
    </div>
  );
}