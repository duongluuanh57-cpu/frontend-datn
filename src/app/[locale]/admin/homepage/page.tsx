'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Save,
  RotateCcw,
  Image as ImageIcon,
  Type,
  Layout,
  Plus,
  Trash2,
  Check,
  Globe,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';
import { ImageUpload } from '@/components/admin/ImageUpload';
import api from '@/lib/api';
import '@/components/ui/banner.css';
import { Banner } from '@/components/ui/banner';

// --- Default Configuration (fallback / reset states) ---
const DEFAULT_BANNERS = [
  "/images/banner-1.webp",
  "/images/banner-2.webp",
  "/images/banner-3.webp",
  "/images/banner-4.webp"
];

const DEFAULT_BANNER_TEXTS = {
  vi: {
    title: 'Độc bản hương thơm Niche',
    subtitle: 'Khám phá tinh hoa mùi hương quý tộc mang đậm phong vị cá nhân từ những nhà điều chế hàng đầu thế giới.'
  },
  en: {
    title: 'Bespoke Niche Perfumery',
    subtitle: 'Explore the elite essence of royal perfumery, crafted for individual distinction by master scent designers.'
  }
};

const DEFAULT_BANNER_LABELS = {
  vi: 'BST NƯỚC HOA CAO CẤP',
  en: 'PREMIUM FRAGRANCE HOUSE'
};

const DEFAULT_GALLERY = {
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

export default function AdminHomepageConfig() {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<'banners' | 'gallery'>('banners');

  // Stateful configurations for editing
  const [banners, setBanners] = useState<string[]>(DEFAULT_BANNERS);
  const [bannerTitleVi, setBannerTitleVi] = useState(DEFAULT_BANNER_TEXTS.vi.title);
  const [bannerSubtitleVi, setBannerSubtitleVi] = useState(DEFAULT_BANNER_TEXTS.vi.subtitle);
  const [bannerTitleEn, setBannerTitleEn] = useState(DEFAULT_BANNER_TEXTS.en.title);
  const [bannerSubtitleEn, setBannerSubtitleEn] = useState(DEFAULT_BANNER_TEXTS.en.subtitle);
  const [bannerLabelVi, setBannerLabelVi] = useState(DEFAULT_BANNER_LABELS.vi);
  const [bannerLabelEn, setBannerLabelEn] = useState(DEFAULT_BANNER_LABELS.en);

  const [galleryVi, setGalleryVi] = useState(DEFAULT_GALLERY.vi);
  const [galleryEn, setGalleryEn] = useState(DEFAULT_GALLERY.en);
  const [galleryAiLoading, setGalleryAiLoading] = useState<Record<number, boolean>>({});

  // Load custom data from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lessence_custom_homepage_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.banners && Array.isArray(parsed.banners)) setBanners(parsed.banners);
          if (parsed.banner_title_vi) setBannerTitleVi(parsed.banner_title_vi);
          if (parsed.banner_subtitle_vi) setBannerSubtitleVi(parsed.banner_subtitle_vi);
              if (parsed.banner_label_vi) setBannerLabelVi(parsed.banner_label_vi);
          if (parsed.banner_title_en) setBannerTitleEn(parsed.banner_title_en);
          if (parsed.banner_subtitle_en) setBannerSubtitleEn(parsed.banner_subtitle_en);
              if (parsed.banner_label_en) setBannerLabelEn(parsed.banner_label_en);
          if (parsed.gallery && Array.isArray(parsed.gallery)) setGalleryVi(parsed.gallery);
          if (parsed.gallery_en && Array.isArray(parsed.gallery_en)) setGalleryEn(parsed.gallery_en);
        } catch (e) {
          console.error('Error loading localStorage data:', e);
        }
      }
    }
  }, []);

  // Save Config function
  const handleSave = () => {
    const dataToSave = {
      banners,
      banner_title_vi: bannerTitleVi,
      banner_subtitle_vi: bannerSubtitleVi,
      banner_label_vi: bannerLabelVi,
      banner_title_en: bannerTitleEn,
      banner_subtitle_en: bannerSubtitleEn,
      banner_label_en: bannerLabelEn,
      gallery: galleryVi,
      gallery_en: galleryEn
    };
    localStorage.setItem('lessence_custom_homepage_data', JSON.stringify(dataToSave));
    toast.success('Cập nhật giao diện trang chủ thành công!', {
      description: 'Nội dung mới đã được cập nhật trực tiếp trên trang chủ.',
      duration: 3000
    });
  };

  // Auto-save (debounced) for quick inline edits in preview — writes to localStorage without toast
  useEffect(() => {
    const dataToSave = {
      banners,
      banner_title_vi: bannerTitleVi,
      banner_subtitle_vi: bannerSubtitleVi,
      banner_label_vi: bannerLabelVi,
      banner_title_en: bannerTitleEn,
      banner_subtitle_en: bannerSubtitleEn,
      banner_label_en: bannerLabelEn,
      gallery: galleryVi,
      gallery_en: galleryEn
    };

    const timer = setTimeout(() => {
      try {
        localStorage.setItem('lessence_custom_homepage_data', JSON.stringify(dataToSave));
      } catch (e) {
        console.error('Auto-save failed:', e);
      }
    }, 900);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banners, bannerTitleVi, bannerSubtitleVi, bannerLabelVi, bannerTitleEn, bannerSubtitleEn, bannerLabelEn, galleryVi, galleryEn]);

  // Restore Defaults
  const handleRestoreDefaults = () => {
    if (confirm('Bạn có chắc muốn khôi phục lại thiết kế trang chủ mặc định của L\'essence?')) {
      setBanners(DEFAULT_BANNERS);
      setBannerTitleVi(DEFAULT_BANNER_TEXTS.vi.title);
      setBannerSubtitleVi(DEFAULT_BANNER_TEXTS.vi.subtitle);
      setBannerLabelVi(DEFAULT_BANNER_LABELS.vi);
      setBannerTitleEn(DEFAULT_BANNER_TEXTS.en.title);
      setBannerSubtitleEn(DEFAULT_BANNER_TEXTS.en.subtitle);
      setBannerLabelEn(DEFAULT_BANNER_LABELS.en);
      setGalleryVi(DEFAULT_GALLERY.vi);
      setGalleryEn(DEFAULT_GALLERY.en);
      localStorage.removeItem('lessence_custom_homepage_data');
      toast.success('Đã khôi phục cài đặt mặc định!', {
        description: 'Tất cả các tệp hình ảnh và câu trích dẫn nguyên bản đã được khôi phục.',
        duration: 3000
      });
    }
  };

  // Banners helper edits
  const handleBannerUrlChange = (index: number, value: string) => {
    const next = [...banners];
    next[index] = value;
    setBanners(next);
  };

  // Gallery edits
  const handleGalleryFieldChange = (
    lang: 'vi' | 'en',
    index: number,
    field: 'url' | 'aspect' | 'title' | 'quote',
    value: string
  ) => {
    if (lang === 'vi') {
      const next = [...galleryVi];
      next[index] = { ...next[index], [field]: value };
      setGalleryVi(next);
    } else {
      const next = [...galleryEn];
      next[index] = { ...next[index], [field]: value };
      setGalleryEn(next);
    }
  };

  // AI Automatic Image scanning for luxury quotes & titles
  const handleGalleryImageUpload = async (idx: number, newUrl: string) => {
    // 1. Update image url fields in both states
    handleGalleryFieldChange('vi', idx, 'url', newUrl);
    handleGalleryFieldChange('en', idx, 'url', newUrl);

    if (!newUrl) return;

    // 2. Start AI Vision analysis loading
    setGalleryAiLoading(prev => ({ ...prev, [idx]: true }));
    const loadingToast = toast.loading('AI đang quét và phân tích hình ảnh nghệ thuật...');

    try {
      const response = await api.post('/ai/scan-gallery-image', { imageUrl: newUrl });
      if (response.data && response.data.success && response.data.data) {
        const { titleVi, quoteVi, titleEn, quoteEn } = response.data.data;
        
        // Populate Vietnamese fields
        if (titleVi) handleGalleryFieldChange('vi', idx, 'title', titleVi);
        if (quoteVi) handleGalleryFieldChange('vi', idx, 'quote', quoteVi);
        
        // Populate English fields
        if (titleEn) handleGalleryFieldChange('en', idx, 'title', titleEn);
        if (quoteEn) handleGalleryFieldChange('en', idx, 'quote', quoteEn);

        toast.success('AI đã phân tích ảnh và hoàn thành nội dung song ngữ thành công!', {
          id: loadingToast,
          duration: 3000
        });
      } else {
        throw new Error(response.data?.error || 'Không nhận được dữ liệu hợp lệ từ AI');
      }
    } catch (err: any) {
      console.error('Artistic AI Scan failed:', err);
      toast.error('Không thể quét ảnh bằng AI. Vui lòng tự nhập thủ công.', {
        id: loadingToast,
        description: err.response?.data?.error || err.message || 'Lỗi kết nối AI.',
        duration: 4000
      });
    } finally {
      setGalleryAiLoading(prev => ({ ...prev, [idx]: false }));
    }
  };

  return (
    <div className="admin-dashboard p-6 max-w-[1400px] mx-auto">
      {/* Title Header */}
      <header className="admin-page-header flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#D4A5A5]/15 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#7A5C5C] flex items-center gap-2.5">
            <Sparkles className="text-[#D4A5A5]" size={24} />
            Quản lý Nội dung Trang chủ
          </h1>
          <p className="text-xs text-[#7A5C5C]/60 mt-1">
            Chỉnh sửa trực tiếp các tệp hình ảnh, tiêu đề trượt của Hero Banner và các câu trích dẫn trong Album nghệ thuật.
          </p>
        </div>

        {/* Global Action controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleRestoreDefaults}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg border border-[#7A5C5C]/20 text-[#7A5C5C] hover:bg-[#7A5C5C]/5 transition-all duration-300"
          >
            <RotateCcw size={14} />
            Khôi phục mặc định
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#7A5C5C] hover:bg-[#604444] text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Save size={14} />
            Lưu thay đổi
          </button>
        </div>
      </header>

      {/* Tabs Controller */}
      <div className="flex border-b border-gray-200 mb-8 select-none">
        <button
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-2.5 px-6 py-3 border-b-2 text-sm font-semibold tracking-wide transition-all duration-300 ${activeTab === 'banners'
            ? 'border-[#7A5C5C] text-[#7A5C5C]'
            : 'border-transparent text-gray-400 hover:text-[#7A5C5C]/60'
            }`}
        >
          <ImageIcon size={16} />
          Trình chiếu Hero Banner ({banners.length} slides)
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2.5 px-6 py-3 border-b-2 text-sm font-semibold tracking-wide transition-all duration-300 ${activeTab === 'gallery'
            ? 'border-[#7A5C5C] text-[#7A5C5C]'
            : 'border-transparent text-gray-400 hover:text-[#7A5C5C]/60'
            }`}
        >
          <Layout size={16} />
          Album Khoảnh Khắc Nghệ Thuật (6 ảnh Pinterest)
        </button>
      </div>

      {/* Content Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'banners' ? (
          (() => {
            const displayTitlePreview = locale === 'vi'
              ? (bannerTitleVi || DEFAULT_BANNER_TEXTS.vi.title)
              : (bannerTitleEn || DEFAULT_BANNER_TEXTS.en.title);
            const displaySubtitlePreview = locale === 'vi'
              ? (bannerSubtitleVi || DEFAULT_BANNER_TEXTS.vi.subtitle)
              : (bannerSubtitleEn || DEFAULT_BANNER_TEXTS.en.subtitle);
            const displayLabelPreview = locale === 'vi'
              ? (bannerLabelVi || DEFAULT_BANNER_LABELS.vi)
              : (bannerLabelEn || DEFAULT_BANNER_LABELS.en);
            const displayCtaPreview = locale === 'vi' ? 'VÀO CỬA HÀNG' : 'SHOP COLLECTION';
            const displayAboutPreview = locale === 'vi' ? 'VỀ CHÚNG TÔI' : 'ABOUT US';

            return (
              <motion.div
                key="banners-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Top Widescreen Simulator Preview */}
                <div className="admin-panel bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="border-b border-gray-100 pb-4 mb-5 flex items-center gap-2">
                    <Check size={18} className="text-emerald-500" />
                    <h2 className="text-sm font-semibold text-[#7A5C5C]">Mô phỏng Giao diện Banner (Bản xem trước trực tiếp)</h2>
                  </div>

                  <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                    <Banner
                      isPreview={true}
                      previewData={{
                        images: banners,
                        title: displayTitlePreview,
                        subtitle: displaySubtitlePreview,
                        label: displayLabelPreview
                      }}
                      onTitleChange={(newTitle) => {
                        if (locale === 'vi') {
                          setBannerTitleVi(newTitle);
                        } else {
                          setBannerTitleEn(newTitle);
                        }
                      }}
                      onSubtitleChange={(newSubtitle) => {
                        if (locale === 'vi') {
                          setBannerSubtitleVi(newSubtitle);
                        } else {
                          setBannerSubtitleEn(newSubtitle);
                        }
                      }}
                      onLabelChange={(newLabel) => {
                        if (locale === 'vi') setBannerLabelVi(newLabel);
                        else setBannerLabelEn(newLabel);
                      }}
                      onImagesChange={(index, url) => {
                        setBanners((prev) => {
                          const next = [...prev];
                          next[index] = url;
                          return next;
                        });
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-3 text-center italic">
                    * Bản xem trước có thể sẽ khác với bản ở bên ngoài trang chủ.
                  </p>
                </div>

                {/* Inputs Layout in two-column grid underneath the widescreen preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Banner image URL editor removed per request */}
                </div>
              </motion.div>
            );
          })()
        ) : (
          <motion.div
            key="gallery-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Grid selector of 6 items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="admin-panel bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 hover:border-[#D4A5A5]/35 transition-all duration-300"
                >
                  {/* Grid header index & Aspect Selector */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="h-6 w-6 rounded-full bg-[#FFF5F5] text-[#7A5C5C] font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Tỷ lệ lưới:</span>
                      <select
                        value={galleryVi[idx].aspect}
                        onChange={(e) => {
                          handleGalleryFieldChange('vi', idx, 'aspect', e.target.value);
                          handleGalleryFieldChange('en', idx, 'aspect', e.target.value);
                        }}
                        className="text-xs px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-[#7A5C5C] font-medium"
                      >
                        <option value="aspect-[1/1]">1:1 (Square)</option>
                        <option value="aspect-[2/3]">2:3 (Portrait)</option>
                        <option value="aspect-[3/4]">3:4 (Tall Portrait)</option>
                        <option value="aspect-[3/2]">3:2 (Landscape)</option>
                      </select>
                    </div>
                  </div>

                  {/* Thumbnail & Image URL via ImageUpload */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-[#7A5C5C] uppercase tracking-wider block">
                      Hình ảnh Khoảnh Khắc #{idx + 1}
                    </span>
                    <ImageUpload
                      value={galleryVi[idx].url}
                      onChange={(newUrl) => handleGalleryImageUpload(idx, newUrl)}
                      hideUrlInput={true}
                    />
                  </div>

                  {/* Bilingual Wording Fields */}
                  <div className="relative space-y-3 bg-gray-50/50 p-3.5 rounded-xl border border-gray-100 overflow-hidden">
                    {/* Glassmorphic AI Scanning Indicator Overlay */}
                    {galleryAiLoading[idx] && (
                      <div className="absolute inset-0 bg-white/75 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2 shadow-inner">
                        <Loader2 className="animate-spin text-[#7A5C5C]" size={20} />
                        <span className="text-[10px] text-[#7A5C5C] font-bold uppercase tracking-wider animate-pulse select-none">AI đang quét ảnh...</span>
                      </div>
                    )}
                    {/* Vietnamese */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold uppercase text-[#D4A5A5] flex items-center gap-1">
                        <Globe size={9} />
                        Tiếng Việt
                      </span>
                      <input
                        type="text"
                        value={galleryVi[idx].title}
                        onChange={(e) => handleGalleryFieldChange('vi', idx, 'title', e.target.value)}
                        className="w-full px-3 py-1 rounded-md border border-gray-200 focus:outline-none focus:border-[#7A5C5C] text-xs text-[#7A5C5C] font-semibold"
                        placeholder="Tên dòng nước hoa..."
                      />
                      <input
                        type="text"
                        value={galleryVi[idx].quote}
                        onChange={(e) => handleGalleryFieldChange('vi', idx, 'quote', e.target.value)}
                        className="w-full px-3 py-1 rounded-md border border-gray-200 focus:outline-none focus:border-[#7A5C5C] text-xs text-[#7A5C5C] italic"
                        placeholder="Câu châm ngôn tình yêu..."
                      />
                    </div>

                    <div className="border-t border-gray-200/50 my-2" />

                    {/* English */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold uppercase text-[#D4A5A5] flex items-center gap-1">
                        <Globe size={9} />
                        English Translation
                      </span>
                      <input
                        type="text"
                        value={galleryEn[idx].title}
                        onChange={(e) => handleGalleryFieldChange('en', idx, 'title', e.target.value)}
                        className="w-full px-3 py-1 rounded-md border border-gray-200 focus:outline-none focus:border-[#7A5C5C] text-xs text-[#7A5C5C] font-semibold"
                        placeholder="Perfume title..."
                      />
                      <input
                        type="text"
                        value={galleryEn[idx].quote}
                        onChange={(e) => handleGalleryFieldChange('en', idx, 'quote', e.target.value)}
                        className="w-full px-3 py-1 rounded-md border border-gray-200 focus:outline-none focus:border-[#7A5C5C] text-xs text-[#7A5C5C] italic"
                        placeholder="Scent story quote..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
