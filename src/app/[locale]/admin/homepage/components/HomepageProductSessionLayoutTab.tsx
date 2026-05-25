'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Columns3,
  LayoutGrid,
  RotateCcw,
  Type,
  Eye,
  EyeOff,
  Filter,
  AlignLeft,
  Play,
  ChevronDown
} from 'lucide-react';
import type { ProductSessionLayoutConfig, ProductSessionConfig } from '@/hooks/useHomepageConfig';
import { DEFAULT_PRODUCT_SESSION_LAYOUT } from '@/hooks/useHomepageConfig';
import { useProductSessionPreviewStore, SESSION_OPTIONS, type SessionId } from '@/store/useProductSessionPreviewStore';
import { useHomepageTags } from '@/hooks/useHomepageTags';

interface HomepageProductSessionLayoutTabProps {
  config: ProductSessionLayoutConfig;
  setConfig: React.Dispatch<React.SetStateAction<ProductSessionLayoutConfig>>;
}

export const HomepageProductSessionLayoutTab = React.memo(function HomepageProductSessionLayoutTab({
  config,
  setConfig
}: HomepageProductSessionLayoutTabProps) {
  const { updatePreviewConfig, setShowPreviewModal, selectedSessionId, setSelectedSessionId } = useProductSessionPreviewStore();

  const currentSession = config.sessions[selectedSessionId];

  const handleChange = (partial: Partial<ProductSessionLayoutConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }));
    updatePreviewConfig(partial);
  };

  const handleSessionChange = (partial: Partial<ProductSessionConfig>) => {
    const updated = { ...currentSession, ...partial };
    setConfig(prev => ({
      ...prev,
      sessions: { ...prev.sessions, [selectedSessionId]: updated }
    }));
    updatePreviewConfig({
      sessions: { ...config.sessions, [selectedSessionId]: updated }
    });
  };

  const handleReset = () => {
    setConfig(DEFAULT_PRODUCT_SESSION_LAYOUT);
    updatePreviewConfig(DEFAULT_PRODUCT_SESSION_LAYOUT);
  };

  const handleOpenPreview = () => {
    updatePreviewConfig(config);
    setShowPreviewModal(true);
  };

  const { tags: availableTags } = useHomepageTags();

  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [tagDropdownOpen, setTagDropdownOpen] = React.useState(false);
  const selectedLabel = SESSION_OPTIONS.find(o => o.id === selectedSessionId)?.label ?? '';

  return (
    <motion.div
      key="product-session-layout-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      {/* Top toolbar */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenPreview}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all duration-200 shadow-sm"
          >
            <Play size={14} /> Xem Preview
          </button>
          <span className="text-[10px] text-[#7A5C5C]/40 font-medium">Popup sẽ hiển thị config hiện tại</span>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50 hover:text-[#7A5C5C] border border-gray-200 hover:border-[#7A5C5C]/30 px-3 py-2 rounded-xl transition-all duration-200"
        >
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      {/* Session Selector */}
      <div className="mb-5 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <label className="text-[10px] font-semibold text-[#7A5C5C]/70 uppercase tracking-wider block mb-2">Đang chỉnh sửa session</label>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-between w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#7A5C5C] hover:border-[#7A5C5C]/30 transition-all"
          >
            <span>{selectedLabel}</span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute top-full mt-1 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                {SESSION_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { setSelectedSessionId(opt.id as SessionId); setDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors
                      ${selectedSessionId === opt.id
                        ? 'bg-[#7A5C5C]/10 text-[#7A5C5C]'
                        : 'text-[#7A5C5C]/70 hover:bg-[#7A5C5C]/5'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main settings grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Left column: Layout + Columns/Rows + Filter Bar */}
        <div className="space-y-5">

          {/* Layout Mode */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <LayoutGrid size={15} className="text-[#D4A5A5]" />
              <h3 className="text-sm font-bold text-[#7A5C5C]">Kiểu hiển thị</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['grid', 'carousel'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleChange({ layout: mode })}
                  className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                    config.layout === mode
                      ? 'bg-[#7A5C5C] text-white border-[#7A5C5C] shadow-sm'
                      : 'bg-white text-[#7A5C5C] border-gray-200 hover:border-[#7A5C5C]/40 hover:bg-[#7A5C5C]/5'
                  }`}
                >
                  {mode === 'grid' ? '☰ Lưới (Grid)' : '⟷ Carousel'}
                </button>
              ))}
            </div>
          </div>

          {/* Columns, Rows & Gap */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <Columns3 size={15} className="text-[#D4A5A5]" />
              <h3 className="text-sm font-bold text-[#7A5C5C]">Cột & hàng</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <SliderField label="Cột Desktop" value={config.columnsDesktop} min={2} max={6} onChange={v => handleChange({ columnsDesktop: v })} />
              <SliderField label="Cột Mobile" value={config.columnsMobile} min={1} max={3} onChange={v => handleChange({ columnsMobile: v })} />
              {config.layout === 'grid' && (
                <>
                  <SliderField label="Hàng Desktop" value={config.rowsDesktop} min={1} max={4} onChange={v => handleChange({ rowsDesktop: v })} />
                  <SliderField label="Hàng Mobile" value={config.rowsMobile} min={1} max={4} onChange={v => handleChange({ rowsMobile: v })} />
                </>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <SliderField label="Khoảng cách card" value={config.gap} min={4} max={40} onChange={v => handleChange({ gap: v })} />
            </div>
          </div>

          {/* Filter Bar (moved to left column) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <Filter size={15} className="text-[#D4A5A5]" />
              <h3 className="text-sm font-bold text-[#7A5C5C]">Thanh lọc (Filter Bar)</h3>
            </div>
            <div className="mb-4">
              <ToggleBtn label="Bật thanh lọc" show={config.showFilterBar} onToggle={() => handleChange({ showFilterBar: !config.showFilterBar })} />
            </div>
            {config.showFilterBar && (
              <div className="space-y-2 pt-3 border-t border-gray-100">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50 mb-2">Chọn kiểu lọc hiển thị</p>
                <div className="grid grid-cols-2 gap-2">
                  <CheckboxField label="Hãng" checked={config.showFilterBrand} onToggle={() => handleChange({ showFilterBrand: !config.showFilterBrand })} />
                  <CheckboxField label="Nhóm hương" checked={config.showFilterScentGroup} onToggle={() => handleChange({ showFilterScentGroup: !config.showFilterScentGroup })} />
                  <CheckboxField label="Nồng độ" checked={config.showFilterConcentration} onToggle={() => handleChange({ showFilterConcentration: !config.showFilterConcentration })} />
                  <CheckboxField label="Phân khúc" checked={config.showFilterSegment} onToggle={() => handleChange({ showFilterSegment: !config.showFilterSegment })} />
                  <CheckboxField label="Dung tích" checked={config.showFilterCapacity} onToggle={() => handleChange({ showFilterCapacity: !config.showFilterCapacity })} />
                  <CheckboxField label="Mức giá" checked={config.showFilterPrice} onToggle={() => handleChange({ showFilterPrice: !config.showFilterPrice })} />
                  <CheckboxField label="Sắp xếp" checked={config.showFilterSort} onToggle={() => handleChange({ showFilterSort: !config.showFilterSort })} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Session Content + Title/Subtitle */}
        <div className="space-y-5">

          {/* Session Content (per-session) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <Type size={15} className="text-[#D4A5A5]" />
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-[#7A5C5C]">Nội dung {selectedLabel.toLowerCase()}</h3>
                <span className="text-[9px] text-[#7A5C5C]/40 font-medium italic">(Chỉ áp dụng cho session cố định)</span>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-[10px] font-semibold text-[#7A5C5C]/70 uppercase tracking-wider block mb-1.5">Tiêu đề</label>
              <input
                type="text"
                value={currentSession.titleText}
                onChange={e => handleSessionChange({ titleText: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-[#7A5C5C] focus:border-[#D4A5A5] focus:ring-1 focus:ring-[#D4A5A5]/20 transition-all outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#7A5C5C]/70 uppercase tracking-wider block mb-1.5">Subtitle</label>
              <input
                type="text"
                value={currentSession.subtitleText}
                onChange={e => handleSessionChange({ subtitleText: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-[#7A5C5C] focus:border-[#D4A5A5] focus:ring-1 focus:ring-[#D4A5A5]/20 transition-all outline-none"
              />
            </div>
            <div className="mt-4">
              <label className="text-[10px] font-semibold text-[#7A5C5C]/70 uppercase tracking-wider block mb-1.5">Tag lọc sản phẩm</label>
              <div className="relative">
                <button
                  onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
                  className="flex items-center justify-between w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-[#7A5C5C] hover:border-[#7A5C5C]/30 transition-all"
                >
                  <span>{currentSession.filterTag || 'Chọn tag...'}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${tagDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {tagDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setTagDropdownOpen(false)} />
                    <div className="absolute top-full mt-1 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-[200px] overflow-y-auto">
                      {availableTags.map((tag) => (
                        <button
                          key={tag._id}
                          onClick={() => { handleSessionChange({ filterTag: tag.slug }); setTagDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors
                            ${currentSession.filterTag === tag.slug
                              ? 'bg-[#7A5C5C]/10 text-[#7A5C5C] font-bold'
                              : 'text-[#7A5C5C]/70 hover:bg-[#7A5C5C]/5'
                            }`}
                        >
                          {tag.name} <span className="text-[9px] text-[#7A5C5C]/40">({tag.slug})</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <Type size={15} className="text-[#D4A5A5]" />
              <h3 className="text-sm font-bold text-[#7A5C5C]">Tiêu đề Section</h3>
            </div>
            <SliderField label="Cỡ chữ" value={config.sectionTitleFontSize} min={16} max={40} onChange={v => handleChange({ sectionTitleFontSize: v })} />
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <ToggleBtn label="Tiêu đề" show={config.showTitle} onToggle={() => handleChange({ showTitle: !config.showTitle })} />
              <ToggleBtn label="Xem tất cả" show={config.showViewAll} onToggle={() => handleChange({ showViewAll: !config.showViewAll })} />
            </div>
          </div>

          {/* Subtitle */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <AlignLeft size={15} className="text-[#D4A5A5]" />
              <h3 className="text-sm font-bold text-[#7A5C5C]">Subtitle</h3>
            </div>
            <SliderField label="Cỡ chữ" value={config.subtitleFontSize} min={10} max={20} onChange={v => handleChange({ subtitleFontSize: v })} />
            <div className="mt-4">
              <ToggleBtn label="Subtitle" show={config.showSubtitle} onToggle={() => handleChange({ showSubtitle: !config.showSubtitle })} />
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
});

// ============================================================
// Reusable Sub-components
// ============================================================
function SliderField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-semibold text-[#7A5C5C]/70 uppercase tracking-wider">{label}</label>
        <span className="inline-flex items-center justify-center min-w-[32px] h-5 px-1.5 rounded-md bg-[#7A5C5C]/10 text-[10px] font-bold text-[#7A5C5C]">
          {value}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="slider-custom w-full h-1.5 appearance-none rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, #D4A5A5 0%, #7A5C5C ${percent}%, #E5E7EB ${percent}%, #E5E7EB 100%)`
          }}
        />
      </div>
    </div>
  );
}

function ToggleBtn({ label, show, onToggle }: { label: string; show: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 ${
        show
          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm'
          : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
      }`}
    >
      {show ? <Eye size={12} /> : <EyeOff size={12} />}
      {show ? label : `Ẩn ${label.toLowerCase()}`}
    </button>
  );
}

function CheckboxField({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <label className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 cursor-pointer text-[10px] font-bold uppercase tracking-wider select-none
      bg-white border-gray-200 hover:border-[#7A5C5C]/30 text-[#7A5C5C]/80 hover:text-[#7A5C5C]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="w-3.5 h-3.5 rounded border-gray-300 text-[#7A5C5C] accent-[#7A5C5C] focus:ring-[#D4A5A5]"
      />
      {label}
    </label>
  );
}
