'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
            {shouldRender && image && (
              <Image
                src={image}
                alt={`${altText} - Slide ${index + 1}`}
                fill
                priority={index === 0 && !!image}
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 10, 8, 0.7)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--admin-surface, #ffffff)',
        border: '1px solid var(--admin-border-subtle, #f0e9e4)',
        borderRadius: '24px',
        padding: '32px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        boxShadow: '0 24px 64px rgba(15, 10, 8, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--admin-border-subtle, #f0e9e4)', paddingBottom: '20px' }} className="flex justify-between w-full">
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--admin-text, #3d2e24)' }}>
              Chỉnh sửa ảnh Slides Trang chủ
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--admin-text-secondary, #6b564c)' }}>
              Tải lên hoặc liên kết các hình ảnh chất lượng cao để làm mới slideshow trang chủ.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text-secondary, #6b564c)' }}>Max W:</label>
              <input 
                type="number" 
                value={maxWidth ?? ''} 
                onChange={(e) => setMaxWidth(e.target.value ? Number(e.target.value) : undefined)} 
                style={{
                  width: '80px',
                  padding: '6px 12px',
                  border: '1px solid var(--admin-border, #e8e0da)',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  background: 'transparent',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text-secondary, #6b564c)' }}>Quality:</label>
              <input 
                type="number" 
                value={quality ?? ''} 
                onChange={(e) => setQuality(e.target.value ? Number(e.target.value) : undefined)} 
                style={{
                  width: '70px',
                  padding: '6px 12px',
                  border: '1px solid var(--admin-border, #e8e0da)',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  background: 'transparent',
                  outline: 'none',
                }}
              />
            </div>
            <button 
              onClick={onClose} 
              style={{
                background: 'var(--admin-accent, #7A5C5C)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 20px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--admin-accent-hover, #644646)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--admin-accent, #7A5C5C)';
              }}
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Content list */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {images.map((img, idx) => (
              <div 
                key={idx} 
                style={{
                  background: 'var(--admin-surface-muted, #faf8f6)',
                  border: '1px solid var(--admin-border-subtle, #f0e9e4)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--admin-accent, #7A5C5C)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  Hình ảnh Slide {idx + 1}
                </div>
                
                <div style={{
                  height: '160px',
                  width: '100%',
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.4)',
                  border: '1px solid var(--admin-border-subtle, #f0e9e4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {img ? (
                    <img 
                      src={img} 
                      alt={`Slide ${idx + 1}`} 
                      className="object-cover h-full w-full"
                      style={{ transition: 'transform 0.3s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  ) : (
                    <div className="text-[11px] text-[#A68F81] font-medium flex flex-col items-center gap-2 select-none">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      Chưa có hình ảnh
                    </div>
                  )}
                </div>
                
                <ImageUpload
                  value={img}
                  onChange={(url) => onChangeImage(idx, url)}
                  hideUrlInput={false}
                  maxWidth={maxWidth}
                  quality={quality}
                  folder="image"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
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
