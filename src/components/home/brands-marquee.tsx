'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { GraphQLBrand } from '@/lib/graphql';

interface BrandsMarqueeProps {
  brands?: GraphQLBrand[];
}

export function BrandsMarquee({ brands: initialBrands }: BrandsMarqueeProps) {
  // Use brands from props (GraphQL server-side), or fallback to empty
  const brands = (initialBrands || [])
    .filter(b => b.status === 'active' && b.logo)
    .map(b => ({ name: b.name, logo: b.logo! }));

  if (brands.length === 0) return null;

  const listToRender = brands;

  // Build marquee track array: ensure it has at least 10 elements to look smooth, then double for infinite scroll
  let repeatedList = [...listToRender];
  while (repeatedList.length < 10) {
    repeatedList = [...repeatedList, ...listToRender];
  }
  const marqueeBrands = [...repeatedList, ...repeatedList];

  return (
    <section
      className="py-8 md:py-12 mb-12 md:mb-16 bg-transparent overflow-hidden border-b border-border"
      style={{
        contain: 'content',
        contentVisibility: 'auto',
      } as React.CSSProperties}
    >

      {/* Compositor marquee styling */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marqueeScroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .brands-marquee-gpu {
          display: flex;
          width: max-content;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          animation: marqueeScroll 45s linear infinite;
        }
        .brands-marquee-gpu:hover {
          animation-play-state: paused;
        }
        .brand-logo-item {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
          opacity: 0.65;
        }
        .brand-logo-item:hover {
          transform: scale(1.1);
          opacity: 1;
        }
        @media (prefers-reduced-motion: reduce) {
          .brands-marquee-gpu {
            animation: none !important;
            flex-wrap: wrap;
            justify-content: center;
            width: 100%;
          }
          .brand-logo-item {
            opacity: 0.55;
          }
        }
      `}} />

      <div className="max-w-7xl mx-auto px-4 mb-6 md:mb-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-[9px] md:text-xs font-bold uppercase tracking-[0.45em] text-[#2D2D2D]/50"
        >
          THƯƠNG HIỆU
        </motion.h2>
      </div>

      <div className="relative flex overflow-hidden">
        {/* Elite Mask Effect: Smooth fade on edges matching the custom background */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, var(--background) 0%, transparent 15%, transparent 85%, var(--background) 100%)'
          }}
        />

        {/* Pure CSS GPU Composited marquee track */}
        <div className="brands-marquee-gpu">
          {marqueeBrands.map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="flex items-center justify-center px-4 md:px-6 lg:px-8"
              aria-hidden={index >= repeatedList.length}
            >
              <div className="brand-logo-item relative h-12 w-32 md:h-14 md:w-36 lg:h-16 lg:w-40 cursor-pointer">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  sizes="(max-width: 768px) 120px, 160px"
                  className="object-contain"
                  priority={index < 6}
                  loading={index < 6 ? undefined : "lazy"}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
