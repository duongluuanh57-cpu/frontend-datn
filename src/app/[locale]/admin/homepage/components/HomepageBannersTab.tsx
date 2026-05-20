'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Banner } from '@/components/ui/banner';
import type { UseAdminHomepageReturn } from '@/hooks/useAdminHomepage';

interface HomepageBannersTabProps {
  adminHomepage: UseAdminHomepageReturn;
}

export function HomepageBannersTab({ adminHomepage }: HomepageBannersTabProps) {
  const {
    locale,
    banners,
    setBanners,
    displayTitle,
    displaySubtitle,
    displayLabel,
    setBannerTitleVi,
    setBannerTitleEn,
    setBannerSubtitleVi,
    setBannerSubtitleEn,
    setBannerLabelVi,
    setBannerLabelEn
  } = adminHomepage;

  return (
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
  );
}
