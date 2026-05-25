'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Subcomponents & Hooks
import { useLuxuryGallery } from './luxury-gallery/useLuxuryGallery';
import { LuxuryGalleryLightbox } from './luxury-gallery/LuxuryGalleryLightbox';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

export function LuxuryGallery() {
  const formHelpers = useLuxuryGallery();
  const {
    locale,
    currentImages,
    setSelectedImageIndex,
  } = formHelpers;

  return (
    <section className="luxury-gallery-section w-full bg-transparent pt-12 pb-10 lg:pt-20 lg:pb-14 overflow-hidden"
      style={{ contain: 'content', contentVisibility: 'auto' } as React.CSSProperties}>
      <div className="max-w-container mx-auto px-6">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative mb-16 lg:mb-20 flex flex-col items-center lg:items-start text-center lg:text-left border-b border-[#D4A5A5]/10 pb-8"
        >
          <span className="text-[10px] font-bold uppercase text-[#D4A5A5]">
            {locale === 'vi' ? 'BỘ SƯU TẬP KHOẢNH KHẮC' : "L'ESSENCE GALLERY"}
          </span>
          <h2 className="mt-4 text-3xl font-medium text-[#7A5C5C] md:text-4xl lg:text-5xl uppercase"
            style={{ fontFamily: 'var(--font-heading), serif' }}>
            {locale === 'vi' ? 'KHOẢNH KHẮC NGHỆ THUẬT' : 'Moments d\'Élégance'}
          </h2>
          <p className="mt-3 text-[11px] md:text-xs text-[#7A5C5C] max-w-[480px] font-medium leading-relaxed">
            {locale === 'vi'
              ? 'Nhật ký hình ảnh lưu giữ nguồn cảm hứng thơ mộng và phong cách sống tinh tế.'
              : 'A visual journal of romantic inspiration and high-end aesthetic lifestyles.'}
          </p>
        </motion.div>

        {/* Pinterest Masonry Columns */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]"
        >
          {currentImages.map((image, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              onClick={() => setSelectedImageIndex(index)}
              className="break-inside-avoid mb-6 group relative rounded-2xl overflow-hidden border border-white/60 bg-white/40 p-2.5 shadow-[0_8px_32px_rgba(122,92,92,0.02)] hover:shadow-[0_20px_50px_rgba(212,165,165,0.12)] hover:border-[#D4A5A5]/30 transition-all duration-700 cursor-pointer"
            >
              {/* Image Frame with Glass background */}
              <div className={`relative w-full ${image.aspect} rounded-xl overflow-hidden bg-[#7A5C5C]/3`}>
                <Image
                  src={image.url}
                  alt={image.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110 group-hover:rotate-[1deg]"
                />

                {/* Soft Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

                {/* Aesthetic Glass Hover Details */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-[0.6s] cubic-bezier(0.16, 1, 0.3, 1) pointer-events-none">
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#E7B8B8] mb-1">
                    L'essence Moment
                  </span>
                  <h3 
                    className="text-sm font-light tracking-[0.1em] text-white uppercase mb-2"
                    style={{ fontFamily: 'var(--font-heading), serif' }}
                  >
                    {image.title}
                  </h3>
                  <p 
                    className="text-[11px] leading-relaxed text-white/90 font-light italic tracking-wide"
                    style={{ fontFamily: 'var(--font-heading), serif' }}
                  >
                    "{image.quote}"
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>

      {/* Luxury Lightbox Overlay Modal */}
      <LuxuryGalleryLightbox formHelpers={formHelpers} />

    </section>
  );
}
