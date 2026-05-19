'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getBrands } from '@/lib/api';

const FALLBACK_BRANDS = [
  { name: 'Burberry', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/04pq2s34-burberry.webp' },
  { name: 'Calvin Klein', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/rn8gigov-calvin-klein.webp' },
  { name: 'Carolina Herrera', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/lsj1bpnd-carolina-herrera.webp' },
  { name: 'Chloe', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/25a3ltx8-chloe.webp' },
  { name: 'Creed', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/qhddz730-creed.webp' },
  { name: 'Dolce & Gabbana', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/7b91ejpw-dolce---gabbana.webp' },
  { name: 'Giorgio Armani', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/dxhpaihh-giorgio-armani.webp' },
  { name: 'Gucci', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/gwlvqjeb-gucci.webp' },
  { name: 'Hugo Boss', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/67s71vd4-hugo-boss.webp' },
  { name: 'Jean Paul Gaultier', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/6jecenfm-jean-paul-gaultier.webp' },
  { name: 'Jimmy Choo', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/ct7wcion-jimmy-choo.webp' },
  { name: 'Lancome', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/58fgfo7u-lancome.webp' },
  { name: 'Marc Jacobs', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/iwlirekh-marc-jacobs.webp' },
  { name: 'Narciso Rodriguez', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/5v1eg8vv-narciso-rodriguez.webp' },
  { name: 'Paco Rabanne', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/0mszo6ip-paco-rabanne.webp' },
  { name: 'Parfums Parour', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/b3z7ak31-parfums-parour.webp' },
  { name: 'Versace', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/rohv2d8g-versace.webp' },
  { name: 'Yves Saint Laurent', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/hp2e26t2-yves-saint-laurent.webp' },
  { name: 'Birkholz Perfume Manufacture', logo: 'https://pub-51942afe81314369ba1985f0493bce19.r2.dev/uploads/k7l0gkeh-birkholz-perfume-manufacture.webp' }
];

export function BrandsMarquee() {
  const t = useTranslations('Home');
  const [brands, setBrands] = useState<Array<{ name: string; logo: string }>>([]);

  useEffect(() => {
    async function loadBrands() {
      const dbBrands = await getBrands();
      // Filter active brands with valid logo
      const activeBrands = dbBrands
        .filter(b => b.status === 'active' && b.logo)
        .map(b => ({ name: b.name, logo: b.logo! }));

      if (activeBrands.length > 0) {
        setBrands(activeBrands);
      } else {
        setBrands(FALLBACK_BRANDS);
      }
    }
    loadBrands();
  }, []);

  const listToRender = brands.length > 0 ? brands : FALLBACK_BRANDS;

  // Build marquee track array: ensure it has at least 10 elements to look smooth, then double for infinite scroll
  let repeatedList = [...listToRender];
  while (repeatedList.length < 10) {
    repeatedList = [...repeatedList, ...listToRender];
  }
  const marqueeBrands = [...repeatedList, ...repeatedList];

  return (
    <section 
      className="w-full bg-transparent pt-[88px] pb-8 lg:pt-[136px] lg:pb-10 overflow-hidden border-b border-[#7A5C5C]/5"
      style={{
        contain: 'content',
        contentVisibility: 'auto',
      } as React.CSSProperties}
    >
      
      {/* Compositor marquee styling */}
      <style dangerouslySetInnerHTML={{ __html: `
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

      <div className="container mx-auto px-6 mb-6 lg:mb-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-[9px] md:text-xs font-bold uppercase tracking-[0.45em] text-[#7A5C5C]/50"
        >
          {t('brandsTitle')}
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
                  quality={100}
                  unoptimized
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
