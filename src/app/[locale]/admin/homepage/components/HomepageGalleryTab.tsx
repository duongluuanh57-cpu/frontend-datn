'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Globe } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface GalleryItemData {
  url: string;
  aspect: string;
  title: string;
  quote: string;
}

interface HomepageGalleryTabProps {
  galleryVi: GalleryItemData[];
  galleryEn: GalleryItemData[];
  galleryAiLoading: Record<number, boolean>;
  handleGalleryFieldChange: (lang: 'vi' | 'en', index: number, field: 'url' | 'aspect' | 'title' | 'quote', value: string) => void;
  handleGalleryImageUpload: (idx: number, newUrl: string) => Promise<void>;
}

export const HomepageGalleryTab = React.memo(function HomepageGalleryTab({
  galleryVi,
  galleryEn,
  galleryAiLoading,
  handleGalleryFieldChange,
  handleGalleryImageUpload
}: HomepageGalleryTabProps) {

  const [idx, setIdx] = useState(0);
  const total = 6;

  return (
    <motion.div
      key="gallery-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="admin-panel bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-4 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <h2 className="text-sm font-semibold text-[#7A5C5C]">Album Nghệ Thuật</h2>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-1.5 mb-5">
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                i === idx
                  ? 'bg-[#7A5C5C] text-white border-[#7A5C5C] shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-[#7A5C5C]/30 hover:text-[#7A5C5C]'
              }`}>
              #{i + 1}
            </button>
          ))}
        </div>

        {/* Thumbnail + Editing — same row */}
        <div className="flex gap-5 items-stretch">
          {/* Thumbnail */}
          <div className="shrink-0 w-[160px] sm:w-[200px] flex">
            <div className={`relative flex-1 min-h-[240px] rounded-xl overflow-hidden border border-gray-100 bg-gray-50 ${
              galleryVi[idx]?.url ? 'shadow-sm' : ''
            }`}>
              {galleryVi[idx]?.url ? (
                <img src={galleryVi[idx].url} alt=""
                  className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-300 p-4 text-center">
                  Chưa có ảnh
                </div>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <span className="text-[9px] font-bold text-[#7A5C5C] uppercase tracking-wider block mb-1.5">
                  Hình ảnh Ảnh #{idx + 1}
                </span>
                <ImageUpload
                  value={galleryVi[idx]?.url ?? ''}
                  onChange={(newUrl) => handleGalleryImageUpload(idx, newUrl)}
                  hideUrlInput={true}
                />
              </div>
              <div className="shrink-0">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Tỷ lệ</span>
                <select
                  value={galleryVi[idx]?.aspect ?? 'aspect-[3/4]'}
                  onChange={(e) => {
                    handleGalleryFieldChange('vi', idx, 'aspect', e.target.value);
                    handleGalleryFieldChange('en', idx, 'aspect', e.target.value);
                  }}
                  className="text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[#7A5C5C] font-medium focus:outline-none focus:border-[#7A5C5C]"
                >
                  <option value="aspect-[1/1]">1:1 (Square)</option>
                  <option value="aspect-[2/3]">2:3 (Portrait)</option>
                  <option value="aspect-[3/4]">3:4 (Tall Portrait)</option>
                  <option value="aspect-[3/2]">3:2 (Landscape)</option>
                </select>
              </div>
            </div>

            <div className="relative space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100 overflow-hidden">
              {galleryAiLoading[idx] && (
                <div className="absolute inset-0 bg-white/75 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="animate-spin text-[#7A5C5C]" size={20} />
                  <span className="text-[10px] text-[#7A5C5C] font-bold uppercase tracking-wider animate-pulse">
                    AI đang quét ảnh...
                  </span>
                </div>
              )}

              <div>
                <span className="text-[9px] font-bold uppercase text-[#D4A5A5] flex items-center gap-1 mb-1.5">
                  <Globe size={9} /> Tiếng Việt
                </span>
                <div className="flex gap-2">
                  <input type="text"
                    value={galleryVi[idx]?.title ?? ''}
                    onChange={(e) => handleGalleryFieldChange('vi', idx, 'title', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#7A5C5C] text-xs text-[#7A5C5C] font-semibold"
                    placeholder="Tên dòng nước hoa..." />
                  <input type="text"
                    value={galleryVi[idx]?.quote ?? ''}
                    onChange={(e) => handleGalleryFieldChange('vi', idx, 'quote', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#7A5C5C] text-xs text-[#7A5C5C] italic"
                    placeholder="Câu châm ngôn tình yêu..." />
                </div>
              </div>

              <div className="border-t border-gray-200/50" />

              <div>
                <span className="text-[9px] font-bold uppercase text-[#D4A5A5] flex items-center gap-1 mb-1.5">
                  <Globe size={9} /> English
                </span>
                <div className="flex gap-2">
                  <input type="text"
                    value={galleryEn[idx]?.title ?? ''}
                    onChange={(e) => handleGalleryFieldChange('en', idx, 'title', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#7A5C5C] text-xs text-[#7A5C5C] font-semibold"
                    placeholder="Perfume title..." />
                  <input type="text"
                    value={galleryEn[idx]?.quote ?? ''}
                    onChange={(e) => handleGalleryFieldChange('en', idx, 'quote', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#7A5C5C] text-xs text-[#7A5C5C] italic"
                    placeholder="Scent story quote..." />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
