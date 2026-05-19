'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const GALLERY_IMAGES = {
  vi: [
    {
      url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop',
      aspect: 'aspect-[3/4]',
      title: 'Giọt Nắng Pha Lê',
      quote: 'Hương thơm là tiếng thì thầm của tâm hồn.'
    },
    {
      url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop',
      aspect: 'aspect-[1/1]',
      title: 'Cánh Hồng Sương Sớm',
      quote: 'Sự lãng mạn ẩn mình trong từng nốt hương.'
    },
    {
      url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1200&auto=format&fit=crop',
      aspect: 'aspect-[2/3]',
      title: 'Tinh Hoa Cổ Điển',
      quote: 'Định nghĩa lại vẻ đẹp vĩnh cửu của hoàng gia.'
    },
    {
      url: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1200&auto=format&fit=crop',
      aspect: 'aspect-[3/2]',
      title: 'Lụa Mềm Tinh Khôi',
      quote: 'Mịn màng và thanh tao tựa như làn da thứ hai.'
    },
    {
      url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1200&auto=format&fit=crop',
      aspect: 'aspect-[3/4]',
      title: 'Hương Thảo Mộc Niche',
      quote: 'Sự giao thoa đầy say đắm giữa thiên nhiên và nghệ thuật.'
    },
    {
      url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop',
      aspect: 'aspect-[1/1]',
      title: 'Khay Ngọc Kiêu Kỳ',
      quote: 'Nơi lưu giữ những bí mật quyến rũ nhất.'
    }
  ],
  en: [
    {
      url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop',
      aspect: 'aspect-[3/4]',
      title: 'Crystal Sunlight',
      quote: 'Scent is the whisper of the soul.'
    },
    {
      url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop',
      aspect: 'aspect-[1/1]',
      title: 'Morning Dew Rose',
      quote: 'Romance hidden in every single note.'
    },
    {
      url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1200&auto=format&fit=crop',
      aspect: 'aspect-[2/3]',
      title: 'Classic Heritage',
      quote: 'Redefining the eternal beauty of royalty.'
    },
    {
      url: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1200&auto=format&fit=crop',
      aspect: 'aspect-[3/2]',
      title: 'Pristine Pure Silk',
      quote: 'Smooth and sublime like a luxurious second skin.'
    },
    {
      url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1200&auto=format&fit=crop',
      aspect: 'aspect-[3/4]',
      title: 'Artisanal Niche',
      quote: 'A captivating fusion of nature and fine art.'
    },
    {
      url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop',
      aspect: 'aspect-[1/1]',
      title: 'Vanity Secrets',
      quote: 'Where the most seductive mysteries reside.'
    }
  ]
};

export function LuxuryGallery() {
  const locale = useLocale();
  const defaultImages = locale === 'vi' ? GALLERY_IMAGES.vi : GALLERY_IMAGES.en;
  const [currentImages, setCurrentImages] = useState(defaultImages);

  // Load custom gallery images from LocalStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lessence_custom_homepage_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const customGallery = locale === 'vi' ? parsed.gallery : parsed.gallery_en;
          if (customGallery && Array.isArray(customGallery) && customGallery.length > 0) {
            setCurrentImages(customGallery);
          } else {
            setCurrentImages(defaultImages);
          }
        } catch (e) {
          console.error('Error loading custom gallery data:', e);
          setCurrentImages(defaultImages);
        }
      } else {
        setCurrentImages(defaultImages);
      }
    } else {
      setCurrentImages(defaultImages);
    }
  }, [locale]);
  
  // Lightbox Modal states
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Prevent background scrolling and hide UI overlays when Lightbox is open
  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('lightbox-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('lightbox-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('lightbox-open');
    };
  }, [selectedImageIndex]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'Escape') setSelectedImageIndex(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex]);

  const handlePrev = () => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return prev === 0 ? currentImages.length - 1 : prev - 1;
    });
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return prev === currentImages.length - 1 ? 0 : prev + 1;
    });
  };

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

  return (
    <section className="luxury-gallery-section w-full bg-transparent pt-12 pb-10 lg:pt-20 lg:pb-14 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Section Header */}
        <div className="relative mb-16 lg:mb-20 flex flex-col items-center lg:items-start text-center lg:text-left border-b border-[#D4A5A5]/10 pb-8">
          <motion.span
            initial={{ opacity: 0, letterSpacing: '0.2em' }}
            whileInView={{ opacity: 1, letterSpacing: '0.45em' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[10px] font-bold uppercase text-[#D4A5A5]"
          >
            {locale === 'vi' ? 'BỘ SƯU TẬP KHOẢNH KHẮC' : "L'ESSENCE GALLERY"}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="mt-4 text-3xl font-medium text-[#7A5C5C] md:text-4xl lg:text-5xl uppercase"
            style={{ fontFamily: 'var(--font-heading), serif' }}
          >
            {locale === 'vi' ? 'KHOẢNH KHẮC NGHỆ THUẬT' : 'Moments d\'Élégance'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-3 text-[11px] md:text-xs text-[#7A5C5C] max-w-[480px] font-medium leading-relaxed"
          >
            {locale === 'vi'
              ? 'Nhật ký hình ảnh lưu giữ nguồn cảm hứng thơ mộng và phong cách sống tinh tế.'
              : 'A visual journal of romantic inspiration and high-end aesthetic lifestyles.'}
          </motion.p>
        </div>

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
              className="break-inside-avoid mb-6 group relative rounded-2xl overflow-hidden border border-white/60 bg-white/30 backdrop-blur-md p-2.5 shadow-[0_8px_32px_rgba(122,92,92,0.02)] hover:shadow-[0_20px_50px_rgba(212,165,165,0.12)] hover:border-[#D4A5A5]/30 transition-all duration-700 cursor-pointer"
            >
              {/* Image Frame with Glass background */}
              <div className={`relative w-full ${image.aspect} rounded-xl overflow-hidden bg-[#7A5C5C]/3`}>
                <Image
                  src={image.url}
                  alt={image.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110 group-hover:rotate-[1deg]"
                  quality={95}
                  unoptimized
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
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8 select-none"
            onClick={() => setSelectedImageIndex(null)}
          >
            {/* Soft background light blooms */}
            <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-[#D4A5A5]/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-[#E8C5C5]/8 blur-[120px] pointer-events-none" />

            {/* Header controls inside lightbox */}
            <div className="absolute top-6 left-6 md:left-10 text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] pointer-events-none">
              {selectedImageIndex + 1} / {currentImages.length}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-6 right-6 md:right-10 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all duration-300 z-50 clickable focus:outline-none"
              style={{ cursor: "url('/pointer.png') 0 0, pointer" }}
            >
              <X size={20} className="stroke-[1.8]" />
            </button>

            {/* Left Navigation Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 md:left-10 p-3.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/15 transition-all duration-300 z-50 clickable focus:outline-none"
              style={{ cursor: "url('/pointer.png') 0 0, pointer" }}
            >
              <ChevronLeft size={24} className="stroke-[1.5]" />
            </button>

            {/* Active Image container */}
            <motion.div
              key={selectedImageIndex}
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.6)] w-fit h-fit max-w-[90vw] md:max-w-[75vw] flex items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentImages[selectedImageIndex].url}
                alt={currentImages[selectedImageIndex].title}
                className="max-w-[85vw] md:max-w-[70vw] max-h-[50vh] md:max-h-[60vh] w-auto h-auto rounded-xl object-contain select-none"
              />
            </motion.div>

            {/* Bottom Caption Box */}
            <motion.div
              key={`caption-${selectedImageIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mt-6 md:mt-8 bg-white/5 backdrop-blur-md px-8 py-5 rounded-2xl border border-white/10 max-w-[480px] w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#E7B8B8] mb-1.5 block">
                L'essence Moment
              </span>
              <h3 
                className="text-lg font-light tracking-[0.1em] text-white uppercase mb-2"
                style={{ fontFamily: 'var(--font-heading), serif' }}
              >
                {currentImages[selectedImageIndex].title}
              </h3>
              <p 
                className="text-xs leading-relaxed text-white/80 font-light italic tracking-wide"
                style={{ fontFamily: 'var(--font-heading), serif' }}
              >
                "{currentImages[selectedImageIndex].quote}"
              </p>
            </motion.div>

            {/* Right Navigation Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 md:right-10 p-3.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/15 transition-all duration-300 z-50 clickable focus:outline-none"
              style={{ cursor: "url('/pointer.png') 0 0, pointer" }}
            >
              <ChevronRight size={24} className="stroke-[1.5]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
