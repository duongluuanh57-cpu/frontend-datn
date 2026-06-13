'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

import { useLuxuryGallery } from './luxury-gallery/useLuxuryGallery';
import { LuxuryGalleryLightbox } from './luxury-gallery/LuxuryGalleryLightbox';

export function LuxuryGallery() {
  const formHelpers = useLuxuryGallery();
  const {
    locale,
    currentImages,
    setSelectedImageIndex,
  } = formHelpers;

  return (
    <section className="luxury-gallery-section mx-[calc(2rem+40px)] w-[calc(100%-4rem-80px)] bg-transparent pt-12 pb-10 lg:pt-20 lg:pb-14 overflow-hidden">
      <div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mb-16 lg:mb-20 flex flex-col items-center lg:items-start text-center lg:text-left border-b border-[#D4A5A5]/10 pb-8"
        >
          <span className="text-[10px] font-bold uppercase text-[#D4A5A5]">
            {locale === 'vi' ? 'BỘ SƯU TẬP KHOẢNH KHẮC' : "L'ESSENCE GALLERY"}
          </span>
          <h2 className="mt-4 text-[30px] font-medium text-[#7A5C5C]"
            style={{ fontFamily: 'var(--font-heading), serif' }}>
            {locale === 'vi' ? 'Khoảnh khắc nghệ thuật' : 'Moments d\'Élégance'}
          </h2>
          <p className="mt-3 text-[15px] text-[#7A5C5C] max-w-[480px] font-medium leading-relaxed">
            {locale === 'vi'
              ? 'Hình ảnh được chọn lọc từ cộng đồng yêu nước hoa.'
              : 'Selected images from our fragrance community.'}
          </p>
        </motion.div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
          {currentImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              onClick={() => setSelectedImageIndex(index)}
              className="break-inside-avoid mb-6 group relative rounded-xl overflow-hidden border border-[#D4A5A5]/8 bg-white/50 p-2 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
            >
              <div className={`relative w-full ${image.aspect} rounded-lg overflow-hidden bg-[#7A5C5C]/3`}>
                <Image
                  src={image.url}
                  alt={image.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />

                <div className="absolute inset-0 z-20 flex flex-col justify-end p-5 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 pointer-events-none">
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
        </div>

      </div>

      <LuxuryGalleryLightbox formHelpers={formHelpers} />

    </section>
  );
}
