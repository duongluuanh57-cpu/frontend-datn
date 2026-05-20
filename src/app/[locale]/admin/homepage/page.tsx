'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Sparkles,
  Save,
  RotateCcw,
  Image as ImageIcon,
  Layout,
  GripVertical,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Check,
  LayoutTemplate,
  ShoppingBag,
  Star,
  BookOpen,
  Award,
  Images,
  Newspaper
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ImageUpload } from '@/components/admin/ImageUpload';
import api from '@/lib/api';
import '@/components/ui/banner.css';
import { Banner } from '@/components/ui/banner';
import type { SectionConfig, HomepageConfigData } from '@/hooks/useHomepageConfig';

// --- Metadata mô tả từng Section ---
const SECTION_META: Record<
  string,
  { label: string; description: string; icon: React.ElementType; color: string }
> = {
  banner: {
    label: 'Hero Banner',
    description: 'Slideshow ảnh toàn màn hình đầu trang',
    icon: ImageIcon,
    color: '#D4A5A5'
  },
  brandsMarquee: {
    label: 'Băng chuyền Thương hiệu',
    description: 'Dải logo các hãng nước hoa chạy ngang',
    icon: Award,
    color: '#B8A5C8'
  },
  saleProducts: {
    label: 'Ưu đãi Đặc biệt',
    description: 'Sản phẩm đang có chương trình giảm giá',
    icon: Star,
    color: '#E8A87C'
  },
  newProducts: {
    label: 'Sản phẩm Mới',
    description: 'Các sản phẩm mới nhất vừa cập bến',
    icon: ShoppingBag,
    color: '#7A9CC5'
  },
  brandUsp: {
    label: 'Điểm mạnh Thương hiệu',
    description: '4 cam kết chất lượng của L\'essence',
    icon: LayoutTemplate,
    color: '#82B39A'
  },
  luxuryGallery: {
    label: 'Album Khoảnh Khắc',
    description: 'Bộ sưu tập ảnh nghệ thuật Pinterest',
    icon: Images,
    color: '#C5956A'
  },
  blogPosts: {
    label: 'Bài viết & Câu chuyện',
    description: 'Nội dung blog và hành trình hương thơm',
    icon: Newspaper,
    color: '#8FB5C8'
  }
};

// --- Default data ---
const DEFAULT_BANNERS = [
  '/images/banner-1.webp',
  '/images/banner-2.webp',
  '/images/banner-3.webp',
  '/images/banner-4.webp'
];
const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'banner', enabled: true, order: 0 },
  { id: 'brandsMarquee', enabled: true, order: 1 },
  { id: 'saleProducts', enabled: true, order: 2 },
  { id: 'newProducts', enabled: true, order: 3 },
  { id: 'brandUsp', enabled: true, order: 4 },
  { id: 'luxuryGallery', enabled: true, order: 5 },
  { id: 'blogPosts', enabled: true, order: 6 }
];
const DEFAULT_GALLERY = Array.from({ length: 6 }, () => ({
  url: '',
  aspect: 'aspect-[3/4]',
  title: '',
  quote: ''
}));

// --- Fetch + Save API ---
const fetchConfig = async (): Promise<HomepageConfigData> => {
  const { data } = await api.get('/homepage-config');
  return data.data;
};
const saveConfig = async (payload: Partial<HomepageConfigData>): Promise<HomepageConfigData> => {
  const { data } = await api.put('/homepage-config', payload);
  return data.data;
};

// ============================================================
// Sortable Section Card Component
// ============================================================
interface SectionCardProps {
  section: SectionConfig;
  onToggle: (id: string) => void;
}

function SortableSectionCard({ section, onToggle }: SectionCardProps) {
  const meta = SECTION_META[section.id];
  const Icon = meta?.icon ?? Layout;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 select-none ${
        section.enabled
          ? 'bg-white border-gray-100 shadow-sm hover:border-[#D4A5A5]/30 hover:shadow-md'
          : 'bg-gray-50/60 border-gray-100/80 opacity-60'
      } ${isDragging ? 'shadow-2xl ring-2 ring-[#D4A5A5]/30 scale-[1.02]' : ''}`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-[#7A5C5C]/50 hover:bg-[#7A5C5C]/5 transition-all duration-200 cursor-grab active:cursor-grabbing focus:outline-none"
        title="Kéo để sắp xếp"
      >
        <GripVertical size={18} />
      </button>

      {/* Order Badge */}
      <span className="flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
        style={{ backgroundColor: meta?.color ?? '#7A5C5C' }}>
        {section.order + 1}
      </span>

      {/* Icon */}
      <div
        className="flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${meta?.color ?? '#D4A5A5'}18` }}
      >
        <Icon size={16} style={{ color: meta?.color ?? '#7A5C5C' }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#7A5C5C] truncate">{meta?.label ?? section.id}</p>
        <p className="text-[10px] text-[#7A5C5C]/50 mt-0.5 truncate">{meta?.description ?? ''}</p>
      </div>

      {/* Toggle Switch */}
      <button
        onClick={() => onToggle(section.id)}
        className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
          section.enabled
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
            : 'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200'
        }`}
        title={section.enabled ? 'Bấm để ẩn section này' : 'Bấm để hiện section này'}
      >
        {section.enabled ? (
          <><Eye size={11} /> Hiện</>
        ) : (
          <><EyeOff size={11} /> Ẩn</>
        )}
      </button>
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================
export default function AdminHomepageConfig() {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'banners' | 'gallery' | 'layout'>('layout');

  // ── Fetch config từ DB ──
  const { data: dbConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ['homepage-config'],
    queryFn: fetchConfig
  });

  // ── Save mutation ──
  const saveMutation = useMutation({
    mutationFn: saveConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-config'] });
      toast.success('Đã lưu cấu hình trang chủ thành công!', {
        description: 'Thay đổi sẽ có hiệu lực ngay trên trang chủ.',
        duration: 3000
      });
    },
    onError: (err: any) => {
      toast.error('Lưu thất bại', {
        description: err?.response?.data?.message || err.message,
        duration: 4000
      });
    }
  });

  // ── Local state (init từ DB) ──
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const [banners, setBanners] = useState<string[]>(DEFAULT_BANNERS);
  const [bannerTitleVi, setBannerTitleVi] = useState('Độc bản hương thơm Niche');
  const [bannerSubtitleVi, setBannerSubtitleVi] = useState('Khám phá tinh hoa mùi hương quý tộc mang đậm phong vị cá nhân từ những nhà điều chế hàng đầu thế giới.');
  const [bannerLabelVi, setBannerLabelVi] = useState('BST NƯỚC HOA CAO CẤP');
  const [bannerTitleEn, setBannerTitleEn] = useState('Bespoke Niche Perfumery');
  const [bannerSubtitleEn, setBannerSubtitleEn] = useState('Explore the elite essence of royal perfumery, crafted for individual distinction by master scent designers.');
  const [bannerLabelEn, setBannerLabelEn] = useState('PREMIUM FRAGRANCE HOUSE');
  const [galleryVi, setGalleryVi] = useState(DEFAULT_GALLERY);
  const [galleryEn, setGalleryEn] = useState(DEFAULT_GALLERY);
  const [galleryAiLoading, setGalleryAiLoading] = useState<Record<number, boolean>>({});

  // Populate state từ DB khi load xong
  useEffect(() => {
    if (!dbConfig) return;
    if (dbConfig.sections?.length > 0) {
      const sorted = [...dbConfig.sections].sort((a, b) => a.order - b.order);
      setSections(sorted);
    }
    if (dbConfig.bannerImages?.length > 0) setBanners(dbConfig.bannerImages);
    if (dbConfig.bannerTitleVi) setBannerTitleVi(dbConfig.bannerTitleVi);
    if (dbConfig.bannerSubtitleVi) setBannerSubtitleVi(dbConfig.bannerSubtitleVi);
    if (dbConfig.bannerLabelVi) setBannerLabelVi(dbConfig.bannerLabelVi);
    if (dbConfig.bannerTitleEn) setBannerTitleEn(dbConfig.bannerTitleEn);
    if (dbConfig.bannerSubtitleEn) setBannerSubtitleEn(dbConfig.bannerSubtitleEn);
    if (dbConfig.bannerLabelEn) setBannerLabelEn(dbConfig.bannerLabelEn);
    if (dbConfig.galleryVi?.length > 0) setGalleryVi(dbConfig.galleryVi);
    if (dbConfig.galleryEn?.length > 0) setGalleryEn(dbConfig.galleryEn);
  }, [dbConfig]);

  // ── Drag & Drop sensors ──
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((s, idx) => ({ ...s, order: idx }));
    });
  }, []);

  const handleToggleSection = useCallback((id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }, []);

  // ── Save all ──
  const handleSave = useCallback(() => {
    saveMutation.mutate({
      sections,
      bannerImages: banners,
      bannerTitleVi,
      bannerSubtitleVi,
      bannerLabelVi,
      bannerTitleEn,
      bannerSubtitleEn,
      bannerLabelEn,
      galleryVi,
      galleryEn
    });
  }, [sections, banners, bannerTitleVi, bannerSubtitleVi, bannerLabelVi, bannerTitleEn, bannerSubtitleEn, bannerLabelEn, galleryVi, galleryEn, saveMutation]);

  // ── Restore defaults ──
  const handleRestoreDefaults = () => {
    if (!confirm("Bạn có chắc muốn khôi phục lại thiết kế trang chủ mặc định của L'essence?")) return;
    setSections(DEFAULT_SECTIONS);
    setBanners(DEFAULT_BANNERS);
    setBannerTitleVi('Độc bản hương thơm Niche');
    setBannerSubtitleVi('Khám phá tinh hoa mùi hương quý tộc mang đậm phong vị cá nhân từ những nhà điều chế hàng đầu thế giới.');
    setBannerLabelVi('BST NƯỚC HOA CAO CẤP');
    setBannerTitleEn('Bespoke Niche Perfumery');
    setBannerSubtitleEn('Explore the elite essence of royal perfumery, crafted for individual distinction by master scent designers.');
    setBannerLabelEn('PREMIUM FRAGRANCE HOUSE');
    setGalleryVi(DEFAULT_GALLERY);
    setGalleryEn(DEFAULT_GALLERY);
    toast.info('Đã khôi phục cài đặt mặc định. Bấm Lưu để áp dụng.');
  };

  // ── Gallery helpers ──
  const handleGalleryFieldChange = (
    lang: 'vi' | 'en',
    index: number,
    field: 'url' | 'aspect' | 'title' | 'quote',
    value: string
  ) => {
    if (lang === 'vi') {
      setGalleryVi((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    } else {
      setGalleryEn((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    }
  };

  const handleGalleryImageUpload = async (idx: number, newUrl: string) => {
    handleGalleryFieldChange('vi', idx, 'url', newUrl);
    handleGalleryFieldChange('en', idx, 'url', newUrl);
    if (!newUrl) return;

    setGalleryAiLoading((prev) => ({ ...prev, [idx]: true }));
    const loadingToast = toast.loading('AI đang quét và phân tích hình ảnh nghệ thuật...');
    try {
      const response = await api.post('/ai/scan-gallery-image', { imageUrl: newUrl });
      if (response.data?.success && response.data?.data) {
        const { titleVi, quoteVi, titleEn, quoteEn } = response.data.data;
        setGalleryVi((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx], title: titleVi || next[idx].title, quote: quoteVi || next[idx].quote };
          return next;
        });
        setGalleryEn((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx], title: titleEn || next[idx].title, quote: quoteEn || next[idx].quote };
          return next;
        });
        toast.success('AI phân tích ảnh thành công!', { id: loadingToast, duration: 3000 });
      }
    } catch {
      toast.error('Không thể quét ảnh bằng AI.', { id: loadingToast, duration: 4000 });
    } finally {
      setGalleryAiLoading((prev) => ({ ...prev, [idx]: false }));
    }
  };

  // ── Derived display values for banner preview ──
  const displayTitle = locale === 'vi' ? bannerTitleVi : bannerTitleEn;
  const displaySubtitle = locale === 'vi' ? bannerSubtitleVi : bannerSubtitleEn;
  const displayLabel = locale === 'vi' ? bannerLabelVi : bannerLabelEn;
  const isSaving = saveMutation.isPending;

  return (
    <div className="admin-dashboard p-6 max-w-[1400px] mx-auto">
      {/* ── Header ── */}
      <header className="admin-page-header flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#D4A5A5]/15 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#7A5C5C] flex items-center gap-2.5">
            <Sparkles className="text-[#D4A5A5]" size={24} />
            Quản lý Nội dung Trang chủ
          </h1>
          <p className="text-xs text-[#7A5C5C]/60 mt-1">
            Sắp xếp, bật/tắt các section và chỉnh sửa nội dung Hero Banner, Album nghệ thuật.
          </p>
        </div>
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
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#7A5C5C] hover:bg-[#604444] text-white shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="flex border-b border-gray-200 mb-8 select-none gap-1">
        {[
          { key: 'layout', label: 'Bố cục Trang chủ', icon: LayoutTemplate },
          { key: 'banners', label: `Hero Banner (${banners.length} slides)`, icon: ImageIcon },
          { key: 'gallery', label: 'Album Nghệ Thuật (6 ảnh)', icon: Images }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold tracking-wide transition-all duration-300 ${
              activeTab === key
                ? 'border-[#7A5C5C] text-[#7A5C5C]'
                : 'border-transparent text-gray-400 hover:text-[#7A5C5C]/60'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Panels ── */}
      <AnimatePresence mode="wait">

        {/* ════ TAB: Bố cục ════ */}
        {activeTab === 'layout' && (
          <motion.div
            key="layout-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Instruction card */}
            <div className="bg-gradient-to-r from-[#FFF5F5] to-[#FDF8F8] border border-[#D4A5A5]/15 rounded-2xl p-5 flex items-start gap-4">
              <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-[#D4A5A5]/10 flex items-center justify-center">
                <GripVertical size={16} className="text-[#D4A5A5]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#7A5C5C]">Kéo thả để sắp xếp thứ tự hiển thị</p>
                <p className="text-xs text-[#7A5C5C]/60 mt-1 leading-relaxed">
                  Kéo từng section bằng biểu tượng <span className="font-mono text-[10px] bg-gray-100 px-1 rounded">⠿</span> để thay đổi thứ tự. Toggle <span className="font-semibold text-emerald-600">Hiện/Ẩn</span> để bật hoặc tắt section. Bấm <span className="font-semibold text-[#7A5C5C]">Lưu thay đổi</span> để áp dụng lên trang chủ.
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Eye size={15} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#7A5C5C]">{sections.filter(s => s.enabled).length}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Section đang hiển thị</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center">
                  <EyeOff size={15} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#7A5C5C]">{sections.filter(s => !s.enabled).length}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Section đang ẩn</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm col-span-2 sm:col-span-1">
                <div className="h-9 w-9 rounded-xl bg-[#D4A5A5]/10 flex items-center justify-center">
                  <LayoutTemplate size={15} className="text-[#D4A5A5]" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#7A5C5C]">{sections.length}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Tổng số section</p>
                </div>
              </div>
            </div>

            {/* Drag & Drop list */}
            {isLoadingConfig ? (
              <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl bg-gray-50 animate-pulse" />
                ))}
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sections.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {sections.map((section) => (
                      <SortableSectionCard
                        key={section.id}
                        section={section}
                        onToggle={handleToggleSection}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </motion.div>
        )}

        {/* ════ TAB: Banner ════ */}
        {activeTab === 'banners' && (
          <motion.div
            key="banners-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            {/* Live Preview */}
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
                    title: displayTitle,
                    subtitle: displaySubtitle,
                    label: displayLabel
                  }}
                  onTitleChange={(v) => locale === 'vi' ? setBannerTitleVi(v) : setBannerTitleEn(v)}
                  onSubtitleChange={(v) => locale === 'vi' ? setBannerSubtitleVi(v) : setBannerSubtitleEn(v)}
                  onLabelChange={(v) => locale === 'vi' ? setBannerLabelVi(v) : setBannerLabelEn(v)}
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
          </motion.div>
        )}

        {/* ════ TAB: Gallery ════ */}
        {activeTab === 'gallery' && (
          <motion.div
            key="gallery-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="admin-panel bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 hover:border-[#D4A5A5]/35 transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="h-6 w-6 rounded-full bg-[#FFF5F5] text-[#7A5C5C] font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Tỷ lệ lưới:</span>
                      <select
                        value={galleryVi[idx]?.aspect ?? 'aspect-[3/4]'}
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

                  {/* Image Upload */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-[#7A5C5C] uppercase tracking-wider block">
                      Hình ảnh Khoảnh Khắc #{idx + 1}
                    </span>
                    <ImageUpload
                      value={galleryVi[idx]?.url ?? ''}
                      onChange={(newUrl) => handleGalleryImageUpload(idx, newUrl)}
                      hideUrlInput={true}
                    />
                  </div>

                  {/* Bilingual fields */}
                  <div className="relative space-y-3 bg-gray-50/50 p-3.5 rounded-xl border border-gray-100 overflow-hidden">
                    {galleryAiLoading[idx] && (
                      <div className="absolute inset-0 bg-white/75 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-[#7A5C5C]" size={20} />
                        <span className="text-[10px] text-[#7A5C5C] font-bold uppercase tracking-wider animate-pulse">
                          AI đang quét ảnh...
                        </span>
                      </div>
                    )}
                    {/* Vietnamese */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold uppercase text-[#D4A5A5] flex items-center gap-1">
                        <Globe size={9} /> Tiếng Việt
                      </span>
                      <input
                        type="text"
                        value={galleryVi[idx]?.title ?? ''}
                        onChange={(e) => handleGalleryFieldChange('vi', idx, 'title', e.target.value)}
                        className="w-full px-3 py-1 rounded-md border border-gray-200 focus:outline-none focus:border-[#7A5C5C] text-xs text-[#7A5C5C] font-semibold"
                        placeholder="Tên dòng nước hoa..."
                      />
                      <input
                        type="text"
                        value={galleryVi[idx]?.quote ?? ''}
                        onChange={(e) => handleGalleryFieldChange('vi', idx, 'quote', e.target.value)}
                        className="w-full px-3 py-1 rounded-md border border-gray-200 focus:outline-none focus:border-[#7A5C5C] text-xs text-[#7A5C5C] italic"
                        placeholder="Câu châm ngôn tình yêu..."
                      />
                    </div>
                    <div className="border-t border-gray-200/50 my-2" />
                    {/* English */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold uppercase text-[#D4A5A5] flex items-center gap-1">
                        <Globe size={9} /> English
                      </span>
                      <input
                        type="text"
                        value={galleryEn[idx]?.title ?? ''}
                        onChange={(e) => handleGalleryFieldChange('en', idx, 'title', e.target.value)}
                        className="w-full px-3 py-1 rounded-md border border-gray-200 focus:outline-none focus:border-[#7A5C5C] text-xs text-[#7A5C5C] font-semibold"
                        placeholder="Perfume title..."
                      />
                      <input
                        type="text"
                        value={galleryEn[idx]?.quote ?? ''}
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
