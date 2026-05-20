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

export default function AdminHomepageConfig() {
  const adminHomepage = useAdminHomepage();
  const { activeTab, setActiveTab, isBannersMode } = adminHomepage;

  return (
    <div className="admin-dashboard p-6 max-w-[1400px] mx-auto">
      <HomepageHeader adminHomepage={adminHomepage} />

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
        {activeTab === 'layout' && <HomepageLayoutTab adminHomepage={adminHomepage} />}
        {activeTab === 'banners' && <HomepageBannersTab adminHomepage={adminHomepage} />}
        {activeTab === 'gallery' && <HomepageGalleryTab adminHomepage={adminHomepage} />}
        {activeTab === 'cardCustomizer' && <HomepageCardTab adminHomepage={adminHomepage} />}
      </AnimatePresence>
    </div>
  );
}
