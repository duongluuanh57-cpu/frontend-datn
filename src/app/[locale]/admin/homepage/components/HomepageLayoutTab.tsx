'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Eye,
  EyeOff,
  LayoutTemplate,
  Star,
  ShoppingBag,
  Images,
  Newspaper,
  Award,
  Image as ImageIcon,
  Layout
} from 'lucide-react';
import type { UseAdminHomepageReturn } from '@/hooks/useAdminHomepage';
import type { SectionConfig } from '@/hooks/useHomepageConfig';

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

interface SortableSectionCardProps {
  section: SectionConfig;
  onToggle: (id: string) => void;
}

function SortableSectionCard({ section, onToggle }: SortableSectionCardProps) {
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

interface HomepageLayoutTabProps {
  adminHomepage: UseAdminHomepageReturn;
}

export function HomepageLayoutTab({ adminHomepage }: HomepageLayoutTabProps) {
  const {
    sections,
    isLoadingConfig,
    sensors,
    handleDragEnd,
    handleToggleSection
  } = adminHomepage;

  return (
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
  );
}
