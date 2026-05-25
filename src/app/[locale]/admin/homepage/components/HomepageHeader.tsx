'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Save, Loader2, LayoutTemplate, Images, Package, FileText, Grid3X3, ChevronDown, Menu } from 'lucide-react';

type ActiveTab = 'banners' | 'gallery' | 'layout' | 'cardCustomizer' | 'blogCard' | 'productSessionLayout' | 'navbar';

interface HomepageHeaderProps {
  isBannersMode: boolean;
  isSaving: boolean;
  handleRestoreDefaults: () => void;
  handleSave: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const LAYOUT_ITEMS = [
  { key: 'layout' as ActiveTab, label: 'Bố cục Trang chủ', icon: LayoutTemplate },
  { key: 'gallery' as ActiveTab, label: 'Album Nghệ Thuật (6 ảnh)', icon: Images },
  { key: 'productSessionLayout' as ActiveTab, label: 'Layout Product Session', icon: Grid3X3 },
  { key: 'navbar' as ActiveTab, label: 'Navbar', icon: Menu },
];

const CARD_ITEMS = [
  { key: 'cardCustomizer' as ActiveTab, label: 'Tùy biến Product Card', icon: Package },
  { key: 'blogCard' as ActiveTab, label: 'Tùy biến Blog Card', icon: FileText },
];

function Dropdown({
  label,
  items,
  activeTab,
  onSelect,
}: {
  label: string;
  items: typeof LAYOUT_ITEMS;
  activeTab: ActiveTab;
  onSelect: (key: ActiveTab) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentLabel = items.find(i => i.key === activeTab)?.label ?? label;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wide rounded-lg border border-[#7A5C5C]/20 text-[#7A5C5C] hover:bg-[#7A5C5C]/5 transition-all duration-200 whitespace-nowrap"
      >
        {currentLabel}
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 min-w-[220px] bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 z-50">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelect(item.key);
                  setOpen(false);
                }}
                className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all duration-200 ${isActive
                  ? 'text-[#7A5C5C] bg-[#7A5C5C]/5'
                  : 'text-gray-500 hover:text-[#7A5C5C] hover:bg-[#7A5C5C]/3'
                  }`}
              >
                <Icon size={15} className={isActive ? 'text-[#D4A5A5]' : 'text-gray-400'} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const HomepageHeader = React.memo(function HomepageHeader({
  isBannersMode,
  isSaving,
  handleSave,
  activeTab,
  setActiveTab
}: Omit<HomepageHeaderProps, 'handleRestoreDefaults'>) {

  return (
    <header className="admin-page-header">
      <div className="flex-1 min-w-0">
        <h1 className="admin-page-header__title">
          {isBannersMode ? 'Quản lý Banner & Quảng cáo' : 'Quản lý Nội dung Trang chủ'}
        </h1>
        <p className="admin-page-header__subtitle">
          {isBannersMode
            ? 'Tùy chỉnh hình ảnh, tiêu đề, nhãn và phụ đề hiển thị trên Hero Banner trang chủ.'
            : 'Sắp xếp, bật/tắt các section và chỉnh sửa các phần tử nội dung Trang chủ.'}
        </p>
      </div>
      <div className="admin-page-header__actions">
        {!isBannersMode && (
          <>
            <Dropdown
              label="Bố cục & Nội dung"
              items={LAYOUT_ITEMS}
              activeTab={activeTab}
              onSelect={setActiveTab}
            />
            <Dropdown
              label="Tùy biến Card"
              items={CARD_ITEMS}
              activeTab={activeTab}
              onSelect={setActiveTab}
            />
          </>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="admin-btn-primary flex items-center gap-2"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </header>
  );
});
