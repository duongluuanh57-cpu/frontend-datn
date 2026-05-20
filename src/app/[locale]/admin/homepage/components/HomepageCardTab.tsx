'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { arrayMove } from '@dnd-kit/sortable';
import {
  GripVertical,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Palette,
  Type,
  Check,
  RotateCcw,
  Star,
  Package
} from 'lucide-react';
import type { UseAdminHomepageReturn } from '@/hooks/useAdminHomepage';
import type { ProductCardConfig } from '@/hooks/useHomepageConfig';
import { DEFAULT_PRODUCT_CARD_CONFIG } from '@/hooks/useHomepageConfig';

interface HomepageCardTabProps {
  adminHomepage: UseAdminHomepageReturn;
}

export function HomepageCardTab({ adminHomepage }: HomepageCardTabProps) {
  const {
    cardConfig,
    setCardConfig,
    cardElementOrder,
    setCardElementOrder,
    cardElementSensors
  } = adminHomepage;

  return (
    <motion.div
      key="card-customizer-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8"
    >
      {/* ── Control Panel (Left) ── */}
      <div className="space-y-5 order-2 lg:order-1">

        {/* Section: Layout */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <SlidersHorizontal size={15} className="text-[#D4A5A5]" />
            <h3 className="text-sm font-bold text-[#7A5C5C]">Layout & Kích thước</h3>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-bold text-[#7A5C5C]/60 uppercase tracking-wider block">Tỷ lệ khung ảnh</label>
            <div className="grid grid-cols-3 gap-2">
              {(['square', 'portrait', 'landscape'] as const).map((asp) => (
                <button
                  key={asp}
                  onClick={() => setCardConfig(p => ({ ...p, imageAspect: asp }))}
                  className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 ${
                    cardConfig.imageAspect === asp
                      ? 'bg-[#7A5C5C] text-white border-[#7A5C5C]'
                      : 'bg-white text-[#7A5C5C] border-gray-200 hover:border-[#7A5C5C]/40'
                  }`}
                >
                  {asp === 'square' ? '1:1 Vuông' : asp === 'portrait' ? '3:4 Dọc' : '4:3 Ngang'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-[9px] font-bold text-[#7A5C5C]/60 uppercase tracking-wider">Padding ảnh</label>
              <span className="text-[10px] font-bold text-[#7A5C5C]">{cardConfig.imagePadding}px</span>
            </div>
            <input type="range" min={0} max={60} value={cardConfig.imagePadding}
              onChange={e => setCardConfig(p => ({ ...p, imagePadding: Number(e.target.value) }))}
              className="w-full accent-[#7A5C5C]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-[9px] font-bold text-[#7A5C5C]/60 uppercase tracking-wider">Bo góc card</label>
              <span className="text-[10px] font-bold text-[#7A5C5C]">{cardConfig.cardRadius}px</span>
            </div>
            <input type="range" min={0} max={32} value={cardConfig.cardRadius}
              onChange={e => setCardConfig(p => ({ ...p, cardRadius: Number(e.target.value) }))}
              className="w-full accent-[#7A5C5C]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-bold text-[#7A5C5C]/60 uppercase tracking-wider block">Căn chỉnh văn bản</label>
            <div className="grid grid-cols-2 gap-2">
              {(['center', 'left'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => setCardConfig(p => ({ ...p, textAlign: align }))}
                  className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 ${
                    cardConfig.textAlign === align
                      ? 'bg-[#7A5C5C] text-white border-[#7A5C5C]'
                      : 'bg-white text-[#7A5C5C] border-gray-200 hover:border-[#7A5C5C]/40'
                  }`}
                >
                  {align === 'center' ? '⇔ Giữa' : '← Trái'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Element Order */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <GripVertical size={15} className="text-[#D4A5A5]" />
            <h3 className="text-sm font-bold text-[#7A5C5C]">Thứ tự & Hiển thị Elements</h3>
          </div>
          <p className="text-[10px] text-[#7A5C5C]/50">Kéo thả để đổi thứ tự, Toggle để ẩn/hiện</p>
          <DndContext
            sensors={cardElementSensors}
            collisionDetection={closestCenter}
            onDragEnd={(event: DragEndEvent) => {
              const { active, over } = event;
              if (!over || active.id === over.id) return;
              setCardElementOrder(prev => {
                const oldIdx = prev.findIndex(e => e.id === active.id);
                const newIdx = prev.findIndex(e => e.id === over.id);
                return arrayMove(prev, oldIdx, newIdx);
              });
            }}
          >
            <SortableContext items={cardElementOrder.map(e => e.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {cardElementOrder.map((elem) => (
                  <CardElementRow
                    key={elem.id}
                    element={elem}
                    onToggle={() => setCardElementOrder(prev =>
                      prev.map(e => e.id === elem.id ? { ...e, show: !e.show } : e)
                    )}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Section: Colors */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Palette size={15} className="text-[#D4A5A5]" />
            <h3 className="text-sm font-bold text-[#7A5C5C]">Màu sắc Tag & Badge</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Tag - Nền', key: 'tagBgColor' as const },
              { label: 'Tag - Chữ', key: 'tagTextColor' as const },
              { label: 'Discount - Nền', key: 'discountBadgeBg' as const },
              { label: 'Discount - Chữ', key: 'discountBadgeText' as const }
            ].map(({ label, key }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-[9px] font-bold text-[#7A5C5C]/60 uppercase tracking-wider block">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={cardConfig[key]}
                    onChange={e => setCardConfig(p => ({ ...p, [key]: e.target.value }))}
                    className="h-8 w-8 rounded-lg border border-gray-200 cursor-pointer flex-shrink-0 p-0.5"
                  />
                  <input
                    type="text"
                    value={cardConfig[key]}
                    onChange={e => setCardConfig(p => ({ ...p, [key]: e.target.value }))}
                    className="flex-1 px-2 py-1 text-[10px] font-mono border border-gray-200 rounded-lg focus:outline-none focus:border-[#7A5C5C] text-[#7A5C5C]"
                    maxLength={7}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Typography */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Type size={15} className="text-[#D4A5A5]" />
            <h3 className="text-sm font-bold text-[#7A5C5C]">Typography</h3>
          </div>
          {[
            { label: 'Thương hiệu', key: 'brandFontSize' as const, min: 8, max: 18 },
            { label: 'Tên sản phẩm', key: 'nameFontSize' as const, min: 10, max: 24 },
            { label: 'Giá bán', key: 'priceFontSize' as const, min: 12, max: 28 }
          ].map(({ label, key, min, max }) => (
            <div key={key} className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[9px] font-bold text-[#7A5C5C]/60 uppercase tracking-wider">{label}</label>
                <span className="text-[10px] font-bold text-[#7A5C5C]">{cardConfig[key]}px</span>
              </div>
              <input type="range" min={min} max={max} value={cardConfig[key]}
                onChange={e => setCardConfig(p => ({ ...p, [key]: Number(e.target.value) }))}
                className="w-full accent-[#7A5C5C]"
              />
            </div>
          ))}
        </div>

      </div>

      {/* ── Live Preview (Right) ── */}
      <div className="order-1 lg:order-2">
        <div className="sticky top-6 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500" />
                <h3 className="text-sm font-bold text-[#7A5C5C]">Xem trước Live</h3>
              </div>
              <button
                onClick={() => {
                  setCardConfig(DEFAULT_PRODUCT_CARD_CONFIG);
                  setCardElementOrder([
                    { id: 'keywords', label: 'Từ khóa / Keywords', show: true },
                    { id: 'brand', label: 'Thương hiệu', show: true },
                    { id: 'name', label: 'Tên sản phẩm', show: true },
                    { id: 'sizes', label: 'Dung tích / Sizes', show: true },
                    { id: 'rating', label: 'Đánh giá & Sao', show: true },
                    { id: 'price', label: 'Giá bán', show: true }
                  ]);
                }}
                className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/60 hover:text-[#7A5C5C] border border-gray-200 hover:border-[#7A5C5C]/30 px-2.5 py-1.5 rounded-lg transition-all duration-200"
              >
                <RotateCcw size={11} /> Reset
              </button>
            </div>

            {/* Preview Card */}
            <div className="max-w-[240px] mx-auto">
              <ProductCardPreview
                config={{
                  ...cardConfig,
                  elementOrder: cardElementOrder.map(e => e.id),
                  showKeywords: cardElementOrder.find(e => e.id === 'keywords')?.show ?? true,
                  showSizes: cardElementOrder.find(e => e.id === 'sizes')?.show ?? true,
                  showRating: cardElementOrder.find(e => e.id === 'rating')?.show ?? true
                }}
              />
            </div>

            <p className="text-center text-[9px] text-gray-400 mt-4 italic">
              * Bản xem trước dùng dữ liệu sản phẩm mẫu
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Card Element Row (Sortable)
// ============================================================
function CardElementRow({
  element,
  onToggle
}: {
  element: { id: string; label: string; show: boolean };
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: element.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.8 : 1, zIndex: isDragging ? 50 : undefined };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
        element.show ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-100 opacity-60'
      } ${isDragging ? 'shadow-lg ring-1 ring-[#D4A5A5]/30' : ''}`}
    >
      <button {...attributes} {...listeners} className="text-gray-300 hover:text-[#7A5C5C]/40 cursor-grab active:cursor-grabbing focus:outline-none">
        <GripVertical size={15} />
      </button>
      <span className="flex-1 text-xs font-medium text-[#7A5C5C]">{element.label}</span>
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
          element.show
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            : 'bg-gray-100 text-gray-400 border border-gray-200'
        }`}
      >
        {element.show ? <><Eye size={10} /> Hiện</> : <><EyeOff size={10} /> Ẩn</>}
      </button>
    </div>
  );
}

// ============================================================
// Product Card Preview - Static mock data
// ============================================================
function ProductCardPreview({ config }: { config: ProductCardConfig }) {
  const ASPECT_CLASSES: Record<string, string> = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  };
  const aspectClass = ASPECT_CLASSES[config.imageAspect] ?? 'aspect-square';
  const tagStyle = { backgroundColor: config.tagBgColor, color: config.tagTextColor };
  const discountStyle = { backgroundColor: config.discountBadgeBg, color: config.discountBadgeText };
  const textAlignClass = config.textAlign === 'left' ? 'items-start text-left' : 'items-center text-center';
  const justifyClass = config.textAlign === 'left' ? 'justify-start' : 'justify-center';

  const elementMap: Record<string, React.ReactNode> = {
    keywords: config.showKeywords ? (
      <div key="keywords" className={`mb-1.5 flex flex-wrap gap-1 ${justifyClass}`}>
        {['Niche', 'Floral', 'Woody'].map((kw, i) => (
          <span key={i} className="text-[7px] font-bold uppercase tracking-tighter text-[#7A5C5C]/40 border border-[#7A5C5C]/10 px-1.5 py-0.5 rounded-sm bg-white/40">{kw}</span>
        ))}
      </div>
    ) : null,
    brand: <span key="brand" className="text-[#7A5C5C]/60 font-semibold uppercase tracking-widest" style={{ fontSize: `${config.brandFontSize}px` }}>L&apos;essence</span>,
    name: <h3 key="name" className="mt-1 font-medium text-[#7A5C5C] line-clamp-2" style={{ fontSize: `${config.nameFontSize}px`, fontFamily: 'var(--font-heading, serif)' }}>Hương thơm Niche Premium</h3>,
    sizes: config.showSizes ? (
      <div key="sizes" className={`mt-1 flex flex-wrap gap-1 ${justifyClass}`}>
        {['30ml', '50ml', '100ml'].map((sz, i) => (
          <span key={i} className="text-[9px] font-semibold text-[#7A5C5C]/70 bg-white/40 border border-[#7A5C5C]/10 px-1.5 py-0.5 rounded-md">{sz}</span>
        ))}
      </div>
    ) : null,
    rating: config.showRating ? (
      <div key="rating" className="mt-1 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={10} className={i < 4 ? 'fill-[#D4A5A5] text-[#D4A5A5]' : 'text-[#D4A5A5]/20'} />
        ))}
        <span className="text-[10px] text-[#7A5C5C]/50 font-medium">(28)</span>
      </div>
    ) : null,
    price: (
      <div key="price" className={`mt-auto pt-2 flex items-center gap-2 ${justifyClass}`}>
        <span className="font-bold text-[#D4A5A5]" style={{ fontSize: `${config.priceFontSize}px` }}>1.200.000 ₫</span>
        <span className="text-[9px] line-through text-[#7A5C5C]/40">1.500.000 ₫</span>
      </div>
    )
  };

  return (
    <div className="flex flex-col h-full">
      {/* Image area */}
      <div
        className={`${aspectClass} w-full relative overflow-hidden bg-gradient-to-br from-[#FFF5F5] to-[#F5EEE8]`}
        style={{ borderRadius: `${config.cardRadius}px` }}
      >
        {/* Tag badge */}
        <div className="absolute left-3 top-3 z-20">
          <div className="px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/30 shadow-sm rounded-lg" style={tagStyle}>
            New Arrivals
          </div>
        </div>
        {/* Discount badge */}
        <div className="absolute right-3 top-3 z-20">
          <div className="px-2 py-1 text-[9px] font-bold rounded-lg shadow-md" style={discountStyle}>
            -20%
          </div>
        </div>
        {/* Mock product image placeholder */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ padding: `${config.imagePadding}px` }}
        >
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <Package size={48} className="text-[#7A5C5C]" />
          </div>
        </div>
      </div>

      {/* Info area */}
      <div className={`mt-3 flex flex-1 flex-col ${textAlignClass}`}>
        {config.elementOrder.map(id => elementMap[id] ?? null)}
      </div>
    </div>
  );
}
