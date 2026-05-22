'use client';

import React from 'react';
import { ImageIcon, Sparkles, RotateCcw, Save, Loader2 } from 'lucide-react';

interface HomepageHeaderProps {
  isBannersMode: boolean;
  isSaving: boolean;
  handleRestoreDefaults: () => void;
  handleSave: () => void;
}

export const HomepageHeader = React.memo(function HomepageHeader({
  isBannersMode,
  isSaving,
  handleRestoreDefaults,
  handleSave
}: HomepageHeaderProps) {

  return (
    <header className="admin-page-header flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#D4A5A5]/15 pb-6 mb-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#7A5C5C] flex items-center gap-2.5">
          {isBannersMode ? (
            <>
              <ImageIcon className="text-[#D4A5A5]" size={24} />
              Banner & Quảng cáo
            </>
          ) : (
            <>
              <Sparkles className="text-[#D4A5A5]" size={24} />
              Quản lý Nội dung Trang chủ
            </>
          )}
        </h1>
        <p className="text-xs text-[#7A5C5C]/60 mt-1">
          {isBannersMode
            ? 'Tùy chỉnh hình ảnh, tiêu đề, nhãn và phụ đề hiển thị trên Hero Banner trang chủ.'
            : 'Sắp xếp, bật/tắt các section và chỉnh sửa các phần tử nội dung Trang chủ.'}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleRestoreDefaults}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg border border-[#7A5C5C]/20 text-[#7A5C5C] hover:bg-[#7A5C5C]/5 transition-all duration-300"
        >
          <RotateCcw size={14} />
          Khôi phục mặc định
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#7A5C5C] hover:bg-[#604444] text-white shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </header>
  );
});
