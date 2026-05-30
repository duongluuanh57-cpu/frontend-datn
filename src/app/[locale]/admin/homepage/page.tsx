'use client';

import React from 'react';
import { useAdminHomepage } from '@/hooks/useAdminHomepage';
import { HomepageHeader } from './components/HomepageHeader';
import { HomepageLayoutTab } from './components/HomepageLayoutTab';
import { HomepageBannersTab } from './components/HomepageBannersTab';
import { HomepageGalleryTab } from './components/HomepageGalleryTab';
import { HomepageCardTab } from './components/HomepageCardTab';
import { HomepageBlogCardTab } from './components/HomepageBlogCardTab';
import { HomepageProductSessionLayoutTab } from './components/HomepageProductSessionLayoutTab';
import { HomepageNavbarTab } from './components/HomepageNavbarTab';
import { HomepageFooterTab } from './components/HomepageFooterTab';
import { ProductSessionPreviewModal } from './components/ProductSessionPreviewModal';
import { AnimatePresence } from 'framer-motion';

function HomepageConfigContent() {
  const adminHomepage = useAdminHomepage();
  const { activeTab, setActiveTab, isBannersMode } = adminHomepage;
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="admin-dashboard p-6 max-w-container mx-auto"
      style={{
        marginRight: sidebarOpen ? '200px' : '0',
        transition: 'margin-right 0.25s ease',
      }}>
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
        {activeTab === 'productSessionLayout' && (
          <HomepageProductSessionLayoutTab
            config={adminHomepage.productSessionLayout}
            setConfig={adminHomepage.setProductSessionLayout}
            onSidebarChange={setSidebarOpen}
          />
        )}
        {activeTab === 'navbar' && (
          <HomepageNavbarTab
            navbarConfig={adminHomepage.navbarConfig}
            setNavbarConfig={adminHomepage.setNavbarConfig}
            onSidebarChange={setSidebarOpen}
          />
        )}
        {activeTab === 'footer' && (
          <HomepageFooterTab
            footerConfig={adminHomepage.footerConfig}
            setFooterConfig={adminHomepage.setFooterConfig}
            onSidebarChange={setSidebarOpen}
          />
        )}
      </AnimatePresence>

      <ProductSessionPreviewModal />
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
