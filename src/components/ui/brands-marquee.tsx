'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const BRANDS = [
  { name: 'Logo0', logo: 'https://i.ibb.co/nMNSCskm/logo0.webp' },
  { name: 'Logo1', logo: 'https://i.ibb.co/xN5Zq79/logo1.webp' },
  { name: 'Logo2', logo: 'https://i.ibb.co/1GMTynwf/logo2.webp' },
  { name: 'Logo3', logo: 'https://i.ibb.co/8nRmnSWg/logo3.webp' },
  { name: 'Logo4', logo: 'https://i.ibb.co/gMrMkgp5/logo4.webp' },
  { name: 'Logo5', logo: 'https://i.ibb.co/3mhqNRT9/logo5.webp' },
  { name: 'Logo6', logo: 'https://i.ibb.co/VYfCMYXR/logo6.webp' },
  { name: 'logo7', logo: 'https://i.ibb.co/HDNK5KvW/logo7.webp' },
  { name: 'Logo8', logo: 'https://i.ibb.co/DPgVQRY4/logo8.webp' },
  { name: 'Logo9', logo: 'https://i.ibb.co/cXpBnYSs/logo9.webp' },
  { name: 'Logo10', logo: 'https://i.ibb.co/gLGzSq2X/logo10.webp' },
  { name: 'Logo11', logo: 'https://i.ibb.co/JFBZm06z/logo11.webp' },
  { name: 'Logo12', logo: 'https://i.ibb.co/1JtGvRWw/logo12.webp' },
  { name: 'Logo13', logo: 'https://i.ibb.co/W4dBpdJ7/logo13.webp' },
  { name: 'Logo14', logo: 'https://i.ibb.co/RGv6pnHh/logo14.webp' },
  { name: 'Logo15', logo: 'https://i.ibb.co/zhyBWvLh/logo15.webp' },
  { name: 'Logo16', logo: 'https://i.ibb.co/1tK5fNZH/logo16.webp' },
  { name: 'Logo17', logo: 'https://i.ibb.co/7NX2NMY0/logo17.webp' },
  { name: 'logo18', logo: 'https://i.ibb.co/SXqwKgxW/logo18.webp' }
];

// Double the list for seamless loop
const MARQUEE_BRANDS = [...BRANDS, ...BRANDS];

export function BrandsMarquee() {
  const t = useTranslations('Home');

  return (
    <section className="w-full bg-transparent pt-10 pb-8 lg:pt-16 lg:pb-10 overflow-hidden border-b border-[#7A5C5C]/5">
      
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
          will-change: transform, opacity;
          opacity: 0.22;
        }
        .brand-logo-item:hover {
          transform: scale(1.1);
          opacity: 0.95;
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
          {MARQUEE_BRANDS.map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="flex items-center justify-center px-4 md:px-6 lg:px-8"
              aria-hidden={index >= BRANDS.length}
            >
              <div className="brand-logo-item relative h-12 w-32 md:h-14 md:w-36 lg:h-16 lg:w-40 cursor-pointer">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  sizes="(max-width: 768px) 120px, 160px"
                  className="object-contain"
                  quality={70}
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
