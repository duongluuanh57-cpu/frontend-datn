'use client';

import React from 'react';
import { useAdminHomepage } from '@/hooks/useAdminHomepage';
import { HomepageHeader } from './components/HomepageHeader';
import { HomepageLayoutTab } from './components/HomepageLayoutTab';
import { HomepageBannersTab } from './components/HomepageBannersTab';
import { HomepageGalleryTab } from './components/HomepageGalleryTab';
import { HomepageCardTab } from './components/HomepageCardTab';
import { HomepageBlogCardTab } from './components/HomepageBlogCardTab';
import { AnimatePresence } from 'framer-motion';

function HomepageConfigContent() {
  const adminHomepage = useAdminHomepage();
  const { activeTab, setActiveTab, isBannersMode } = adminHomepage;

  return (
    <div className="admin-dashboard p-6 max-w-[1400px] mx-auto">
      <HomepageHeader
        isBannersMode={adminHomepage.isBannersMode}
        isSaving={adminHomepage.isSaving}
        handleSave={adminHomepage.handleSave}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

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
        {activeTab === 'blogCard' && (
          <HomepageBlogCardTab
            blogCardConfig={adminHomepage.blogCardConfig}
            setBlogCardConfig={adminHomepage.setBlogCardConfig}
            blogElementOrder={adminHomepage.blogElementOrder}
            setBlogElementOrder={adminHomepage.setBlogElementOrder}
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
