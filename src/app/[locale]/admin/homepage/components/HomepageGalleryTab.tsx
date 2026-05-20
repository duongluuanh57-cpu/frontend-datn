'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Globe } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';
import type { UseAdminHomepageReturn } from '@/hooks/useAdminHomepage';

interface HomepageGalleryTabProps {
  adminHomepage: UseAdminHomepageReturn;
}

export function HomepageGalleryTab({ adminHomepage }: HomepageGalleryTabProps) {
  const {
    galleryVi,
    galleryEn,
    galleryAiLoading,
    handleGalleryFieldChange,
    handleGalleryImageUpload
  } = adminHomepage;

  return (
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
  );
}
