'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import posthog from 'posthog-js';
import './banner.css';
import { ImageUpload } from '@/components/admin/ImageUpload';

// --- Configuration ---
const SLIDE_DURATION = 6000; // 6 seconds per slide
const DEFAULT_IMAGES = [
  "/images/banner-1.webp",
  "/images/banner-2.webp",
  "/images/banner-3.webp",
  "/images/banner-4.webp"
];

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 70,
      damping: 15,
      staggerChildren: 0.15,
      delayChildren: 0.3,
    } as any,
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    } as any,
  },
};

// --- Sub-components ---

const BannerBackground = ({
  images,
  currentImageIndex,
  altText
}: {
  images: string[];
  currentImageIndex: number;
  altText: string;
}) => {
  const [visitedIndices, setVisitedIndices] = useState<number[]>([currentImageIndex]);

  useEffect(() => {
    if (!visitedIndices.includes(currentImageIndex)) {
      setVisitedIndices((prev) => [...prev, currentImageIndex]);
    }
  }, [currentImageIndex, visitedIndices]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {images.map((image, index) => {
        const isActive = index === currentImageIndex;
        const shouldRender = visitedIndices.includes(index);
        return (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-[1500ms] cubic-bezier(0.16, 1, 0.3, 1) ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-103 pointer-events-none'
              }`}
            style={{
              zIndex: isActive ? 1 : 0,
            }}
          >
            {shouldRender && (
              <Image
                src={image}
                alt={`${altText} - Slide ${index + 1}`}
                fill
                priority={index === 0}
                unoptimized
                className="object-cover"
              />
            )}
            {/* Subtle gradient vignette to blend edges softly without blocking the image details */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-[#FFF5F5]/10 to-[#FFF5F5]/45 z-10" />
          </div>
        );
      })}
    </div>
  );
};

const BannerLabel = ({ children }: { children: React.ReactNode }) => (
  <motion.div variants={itemVariants}>
    <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#C08497] md:text-xs">
      {children}
    </span>
  </motion.div>
);

const EditableBannerLabel = ({
  children,
  isPreview = false,
  onChange,
}: {
  children: React.ReactNode;
  isPreview?: boolean;
  onChange?: (val: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(typeof children === 'string' ? children : '');

  useEffect(() => {
    if (typeof children === 'string') setTempVal(children);
  }, [children]);

  if (isPreview && isEditing) {
    return (
      <motion.div variants={itemVariants} className="w-full">
        <input
          value={tempVal}
          onChange={(e) => {
            setTempVal(e.target.value);
            onChange?.(e.target.value);
          }}
          onBlur={() => setIsEditing(false)}
          autoFocus
          className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#C08497] md:text-xs w-full bg-white/40 backdrop-blur-sm rounded-md px-2 py-1 border border-[#7A5C5C]/20 outline-none text-center"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      onClick={() => {
        if (isPreview) setIsEditing(true);
      }}
      className={isPreview ? 'cursor-text group/label relative' : ''}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#C08497] md:text-xs">
        {typeof children === 'string' ? children : children}
      </span>
      {isPreview && (
        <span className="absolute -top-6 right-2 text-[9px] bg-[#7A5C5C] text-white px-1.5 py-0.5 rounded opacity-0 group-hover/label:opacity-100 transition-opacity duration-200 pointer-events-none">
          Click để sửa nhanh
        </span>
      )}
    </motion.div>
  );
};

// Image Editor Modal (local component)
function ImageEditorModal({
  images,
  onClose,
  onChangeImage,
  maxWidth,
  quality,
  setMaxWidth,
  setQuality
}: {
  images: string[];
  onClose: () => void;
  onChangeImage: (index: number, url: string) => void;
  maxWidth?: number | undefined;
  quality?: number | undefined;
  setMaxWidth: (v?: number) => void;
  setQuality: (v?: number) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 p-6 shadow-lg overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Chỉnh sửa ảnh Slides</h3>
          <div className="flex items-center gap-3">
            <label className="text-sm">Max W:</label>
            <input type="number" value={maxWidth ?? ''} onChange={(e) => setMaxWidth(e.target.value ? Number(e.target.value) : undefined)} className="w-24 px-2 py-1 border rounded" />
            <label className="text-sm">Quality:</label>
            <input type="number" value={quality ?? ''} onChange={(e) => setQuality(e.target.value ? Number(e.target.value) : undefined)} className="w-20 px-2 py-1 border rounded" />
            <button onClick={onClose} className="px-3 py-1 rounded bg-[#7A5C5C] text-white">Đóng</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="bg-gray-50 p-3 rounded">
              <div className="h-40 mb-3 bg-white rounded overflow-hidden flex items-center justify-center border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Slide ${idx + 1}`} className="object-cover h-full w-full" />
              </div>
              <ImageUpload
                value={img}
                onChange={(url) => onChangeImage(idx, url)}
                hideUrlInput={false}
                maxWidth={maxWidth}
                quality={quality}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



const BannerTitle = ({ 
  children, 
  isPreview = false,
  onChange 
}: { 
  children: React.ReactNode; 
  isPreview?: boolean;
  onChange?: (val: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(typeof children === 'string' ? children : '');

  useEffect(() => {
    if (typeof children === 'string') {
      setTempVal(children);
    }
  }, [children]);

  if (isPreview && isEditing) {
    return (
      <motion.div variants={itemVariants} className="w-full">
        <textarea
          value={tempVal}
          onChange={(e) => {
            setTempVal(e.target.value);
            onChange?.(e.target.value);
          }}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              setIsEditing(false);
            }
          }}
          autoFocus
          className="banner-title text-lg sm:text-xl md:text-2xl lg:text-[28px] font-medium leading-[1.2] text-[#7A5C5C] uppercase bg-white/40 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-[#7A5C5C]/20 outline-none w-full text-center md:text-right resize-none min-h-[80px] focus:ring-1 focus:ring-[#7A5C5C]/40"
        />
      </motion.div>
    );
  }

  const lines = typeof children === 'string' ? children.split('\n') : [children];

  return (
    <motion.div 
      variants={itemVariants}
      onClick={() => {
        if (isPreview) setIsEditing(true);
      }}
      className={isPreview ? "cursor-text hover:bg-black/[0.02] hover:ring-1 hover:ring-[#7A5C5C]/15 rounded-xl transition-all duration-200 group/title relative w-full px-2 py-1" : "w-full"}
    >
      <h1 className="banner-title text-lg sm:text-xl md:text-2xl lg:text-[28px] font-medium leading-[1.2] text-[#7A5C5C] uppercase">
        {lines.map((line, index) => (
          <span key={index} className="block">
            {line}
          </span>
        ))}
      </h1>
      {isPreview && (
        <span className="absolute -top-6 right-2 text-[9px] bg-[#7A5C5C] text-white px-1.5 py-0.5 rounded opacity-0 group-hover/title:opacity-100 transition-opacity duration-200 pointer-events-none">
          Click để sửa nhanh
        </span>
      )}
    </motion.div>
  );
};

const BannerDescription = ({ 
  children, 
  isPreview = false,
  onChange 
}: { 
  children: React.ReactNode; 
  isPreview?: boolean;
  onChange?: (val: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(typeof children === 'string' ? children : '');

  useEffect(() => {
    if (typeof children === 'string') {
      setTempVal(children);
    }
  }, [children]);

  if (isPreview && isEditing) {
    return (
      <motion.div variants={itemVariants} className="w-full">
        <textarea
          value={tempVal}
          onChange={(e) => {
            setTempVal(e.target.value);
            onChange?.(e.target.value);
          }}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              setIsEditing(false);
            }
          }}
          autoFocus
          className="banner-description max-w-sm text-[10px] sm:text-[11px] md:text-xs font-light tracking-wide text-[#7A5C5C]/90 leading-[1.8] bg-white/40 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-[#7A5C5C]/20 outline-none w-full text-center md:text-right resize-none min-h-[70px] focus:ring-1 focus:ring-[#7A5C5C]/40"
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={itemVariants}
      onClick={() => {
        if (isPreview) setIsEditing(true);
      }}
      className={isPreview ? "cursor-text hover:bg-black/[0.02] hover:ring-1 hover:ring-[#7A5C5C]/15 rounded-xl transition-all duration-200 group/desc relative w-full flex justify-center md:justify-end px-2 py-1" : "w-full flex justify-center md:justify-end"}
    >
      <p className="banner-description max-w-[420px] text-[11px] sm:text-xs md:text-sm font-light tracking-wide text-[#7A5C5C]/90 leading-[1.6]">
        {children}
      </p>
      {isPreview && (
        <span className="absolute -top-6 right-2 text-[9px] bg-[#7A5C5C] text-white px-1.5 py-0.5 rounded opacity-0 group-hover/desc:opacity-100 transition-opacity duration-200 pointer-events-none">
          Click để sửa nhanh
        </span>
      )}
    </motion.div>
  );
};

const BannerActions = ({ isPreview = false }: { isPreview?: boolean }) => {
  const t = useTranslations('Home');
  const [isHovered, setIsHovered] = useState(false);

  const handleCtaClick = (e: React.MouseEvent) => {
    if (isPreview) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    posthog.capture('banner_cta_clicked', {
      destination: '/collections',
      banner_version: 'Elite_Liquid_Glass_v2'
    });
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`flex flex-row items-center justify-center md:justify-end ${
        isPreview ? 'mt-2 gap-4 md:gap-5' : 'mt-4 gap-6 md:gap-8'
      }`}
    >
      <Link
        href="/collections"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCtaClick}
        aria-label={t('bannerCta')}
        className={`banner-cta group relative flex items-center justify-center overflow-hidden rounded-full border border-white/40 bg-white/70 backdrop-blur-md shadow-md hover:shadow-xl transition-all duration-300 ${
          isPreview ? 'h-8 w-32' : 'h-10 w-44'
        }`}
      >
        {/* Iridescent shimmer effect inside button */}
        <span
          className={`relative z-10 font-bold uppercase tracking-widest transition-colors duration-300 text-[#7A5C5C] group-hover:text-white ${
            isPreview ? 'text-[8px] md:text-[9px]' : 'text-[10px] md:text-xs'
          }`}
        >
          {t('bannerCta')}
        </span>
        <div className="absolute inset-0 -z-10 translate-y-full bg-[#7A5C5C] transition-transform duration-500 ease-out group-hover:translate-y-0" />
      </Link>

      <Link
        href="/about"
        onClick={(e) => {
          if (isPreview) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className={`font-bold uppercase tracking-[0.2em] text-[#7A5C5C] transition-all hover:text-[#C08497] hover:tracking-[0.25em] duration-300 focus:outline-none focus:underline ${
          isPreview ? 'text-[9px] md:text-[10px]' : 'text-[11px]'
        }`}
        aria-label={t('aboutUs')}
      >
        {t('aboutUs')} &rarr;
      </Link>
    </motion.div>
  );
};

// --- Main Component ---

export function Banner({ 
  previewData, 
  isPreview = false,
  onTitleChange,
  onSubtitleChange,
  onLabelChange
  ,
  onImagesChange
}: {
  previewData?: {
    images: string[];
    title: string;
    subtitle: string;
    label?: string;
  };
  isPreview?: boolean;
  onTitleChange?: (val: string) => void;
  onSubtitleChange?: (val: string) => void;
  onLabelChange?: (val: string) => void;
  onImagesChange?: (index: number, url: string) => void;
}) {
  const t = useTranslations('Home');
  const locale = useLocale();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMaxWidth, setEditorMaxWidth] = useState<number | undefined>(1024);
  const [editorQuality, setEditorQuality] = useState<number | undefined>(80);

  // Dynamic customized data states
  const [images, setImages] = useState<string[]>(previewData ? previewData.images : DEFAULT_IMAGES);
  const [bannerTexts, setBannerTexts] = useState({
    title: '',
    subtitle: ''
  });
  const [bannerLabel, setBannerLabel] = useState('');

  // Load customizable homepage data from LocalStorage
  useEffect(() => {
    if (previewData) {
      setImages(previewData.images);
      if (previewData.label) setBannerLabel(previewData.label);
      return;
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lessence_custom_homepage_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.banners && Array.isArray(parsed.banners) && parsed.banners.length > 0) {
            setImages(parsed.banners);
          }
          const lang = locale === 'vi' ? 'vi' : 'en';
          const title = parsed[`banner_title_${lang}`];
          const subtitle = parsed[`banner_subtitle_${lang}`];
          setBannerTexts({
            title: title || '',
            subtitle: subtitle || ''
          });
          const label = parsed[`banner_label_${lang}`];
          setBannerLabel(label || '');
        } catch (e) {
          console.error('Error loading custom homepage config:', e);
        }
      }
    }
  }, [locale, previewData]);

  // Update images if previewData changes
  useEffect(() => {
    if (previewData) {
      setImages(previewData.images);
    }
  }, [previewData]);

  // Auto-slide effect
  useEffect(() => {
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [images]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": "L'essence",
    "description": "Premium Fragrance House",
    "url": "https://lessence.vn"
  };

  const displayTitle = bannerTexts.title || t('bannerTitle');
  const displaySubtitle = bannerTexts.subtitle || t('bannerSubtitle');
  const displayLabel = bannerLabel || (locale === 'vi' ? 'BST NƯỚC HOA CAO CẤP' : 'PREMIUM FRAGRANCE HOUSE');

  return (
    <section
      className={`relative w-full overflow-hidden bg-[#FFF5F5] ${
        isPreview ? 'h-[320px] sm:h-[380px] md:h-[450px]' : 'h-[calc(85vh-13px)]'
      }`}
      role="banner"
      aria-label="Hero Banner Slideshow"
    >
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

          {/* Quick-edit overlay for images (shown on hover) */}
          {isPreview && (
            <div className="absolute inset-0 z-20 flex items-start justify-start pointer-events-none">
              <button
                onClick={() => setIsEditorOpen(true)}
                className="pointer-events-auto m-4 px-3 py-1.5 rounded-md bg-[#7A5C5C]/80 text-white text-xs shadow"
                aria-label="Edit slides"
              >
                Chỉnh sửa ảnh
              </button>
            </div>
          )}
      {/* Slide Background */}
      {images.length > 0 && (
        <BannerBackground
          images={images}
          currentImageIndex={currentImageIndex}
          altText={t('bannerAlt')}
        />
      )}

      {/* Morphing ambient color blobs behind the glass card for refraction aesthetics */}
      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />

      {/* Content wrapper with floating Glassmorphic panel */}
      <div className="absolute inset-0 z-10 flex items-center justify-center md:justify-end px-6 md:px-16 lg:px-24">
        <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-10">

          {/* Glass Card Container */}
          <motion.div
            className={`banner-glass banner-floating flex flex-col items-center md:items-end text-center md:text-right ${
              isPreview 
                ? 'max-w-[85vw] sm:max-w-[380px] md:max-w-[460px] lg:max-w-[500px] gap-3 md:gap-4 p-4 sm:p-6 md:p-8'
                : 'max-w-[92vw] sm:max-w-[480px] md:max-w-[540px] lg:max-w-[620px] gap-4 md:gap-5 p-6 sm:p-8 md:p-10 lg:p-12'
            }`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            aria-live="polite"
          >
            <EditableBannerLabel isPreview={isPreview} onChange={(v) => {
              setBannerLabel(v);
              onLabelChange?.(v);
            }}>
              {displayLabel}
            </EditableBannerLabel>
            <BannerTitle isPreview={isPreview} onChange={onTitleChange}>{displayTitle}</BannerTitle>
            <BannerDescription isPreview={isPreview} onChange={onSubtitleChange}>{displaySubtitle}</BannerDescription>
            <BannerActions isPreview={isPreview} />
          </motion.div>

          {/* Slide Indicators - Translucent Dots */}
          <div
            className="flex md:flex-col gap-4 py-2"
            aria-label={t('goToSlide', { n: '' })}
          >
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                aria-label={t('goToSlide', { n: i + 1 })}
                aria-pressed={i === currentImageIndex}
                className={`banner-indicator ${i === currentImageIndex ? 'active' : ''}`}
              />
            ))}
          </div>
          {isEditorOpen && (
            <ImageEditorModal
              images={images}
              onClose={() => setIsEditorOpen(false)}
              onChangeImage={(index, url) => {
                // update local images and notify parent
                const next = [...images];
                next[index] = url;
                setImages(next);
                onImagesChange?.(index, url);
              }}
              maxWidth={editorMaxWidth}
              quality={editorQuality}
              setMaxWidth={setEditorMaxWidth}
              setQuality={setEditorQuality}
            />
          )}

        </div>
      </div>
    </section>
  );
}
