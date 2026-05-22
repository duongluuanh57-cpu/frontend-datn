'use client';

import React from 'react';
import { useAdminHomepage } from '@/hooks/useAdminHomepage';
import { HomepageHeader } from './components/HomepageHeader';
import { HomepageLayoutTab } from './components/HomepageLayoutTab';
import { HomepageBannersTab } from './components/HomepageBannersTab';
import { HomepageGalleryTab } from './components/HomepageGalleryTab';
import { HomepageCardTab } from './components/HomepageCardTab';
import { LayoutTemplate, Images, Package } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

function HomepageConfigContent() {
  const adminHomepage = useAdminHomepage();
  const { activeTab, setActiveTab, isBannersMode } = adminHomepage;

  return (
    <div className="admin-dashboard p-6 max-w-[1400px] mx-auto">
      <HomepageHeader
        isBannersMode={adminHomepage.isBannersMode}
        isSaving={adminHomepage.isSaving}
        handleRestoreDefaults={adminHomepage.handleRestoreDefaults}
        handleSave={adminHomepage.handleSave}
      />

      {!isBannersMode && (
        <div className="flex flex-wrap border-b border-gray-200 mb-8 select-none gap-1">
          {[
            { key: 'layout', label: 'Bố cục Trang chủ', icon: LayoutTemplate },
            { key: 'gallery', label: 'Album Nghệ Thuật (6 ảnh)', icon: Images },
            { key: 'cardCustomizer', label: 'Tùy biến Product Card', icon: Package }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
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
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'layout' && (
          <HomepageLayoutTab
            sections={adminHomepage.sections}
            isLoadingConfig={adminHomepage.isLoadingConfig}
            sensors={adminHomepage.sensors}
            handleDragEnd={adminHomepage.handleDragEnd}
            handleToggleSection={adminHomepage.handleToggleSection}
          />
        )}
        {activeTab === 'banners' && (
          <HomepageBannersTab
            locale={adminHomepage.locale}
            banners={adminHomepage.banners}
            setBanners={adminHomepage.setBanners}
            displayTitle={adminHomepage.displayTitle}
            displaySubtitle={adminHomepage.displaySubtitle}
            displayLabel={adminHomepage.displayLabel}
            setBannerTitleVi={adminHomepage.setBannerTitleVi}
            setBannerTitleEn={adminHomepage.setBannerTitleEn}
            setBannerSubtitleVi={adminHomepage.setBannerSubtitleVi}
            setBannerSubtitleEn={adminHomepage.setBannerSubtitleEn}
            setBannerLabelVi={adminHomepage.setBannerLabelVi}
            setBannerLabelEn={adminHomepage.setBannerLabelEn}
          />
        )}
        {activeTab === 'gallery' && (
          <HomepageGalleryTab
            galleryVi={adminHomepage.galleryVi}
            galleryEn={adminHomepage.galleryEn}
            galleryAiLoading={adminHomepage.galleryAiLoading}
            handleGalleryFieldChange={adminHomepage.handleGalleryFieldChange}
            handleGalleryImageUpload={adminHomepage.handleGalleryImageUpload}
          />
        )}
        {activeTab === 'cardCustomizer' && (
          <HomepageCardTab
            cardConfig={adminHomepage.cardConfig}
            setCardConfig={adminHomepage.setCardConfig}
            cardElementOrder={adminHomepage.cardElementOrder}
            setCardElementOrder={adminHomepage.setCardElementOrder}
            cardElementSensors={adminHomepage.cardElementSensors}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminHomepageConfig() {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A5C5C]" />
      </div>
    }>
      <HomepageConfigContent />
    </React.Suspense>
  );
}
