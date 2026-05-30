'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Columns3,
  LayoutGrid,
  Eye,
  EyeOff,
  Filter,
  AlignLeft,
  ChevronDown,
  GripVertical,
  ArrowRight,
} from 'lucide-react';
import type { ProductSessionLayoutConfig, ProductSessionConfig } from '@/hooks/useHomepageConfig';
import { DEFAULT_PRODUCT_SESSION_LAYOUT } from '@/hooks/useHomepageConfig';
import { useProductSessionPreviewStore, SESSION_OPTIONS, type SessionId } from '@/store/useProductSessionPreviewStore';
import { useHomepageTags } from '@/hooks/useHomepageTags';
import { PreviewProductCard } from '@/components/ui/product-session-preview/PreviewProductCard';

interface HomepageProductSessionLayoutTabProps {
  config: ProductSessionLayoutConfig;
  setConfig: React.Dispatch<React.SetStateAction<ProductSessionLayoutConfig>>;
  onSidebarChange?: (open: boolean) => void;
}

function getSessionLabel(id: SessionId): string {
  return SESSION_OPTIONS.find(o => o.id === id)?.label ?? id;
}

export const HomepageProductSessionLayoutTab = React.memo(function HomepageProductSessionLayoutTab({
  config,
  setConfig,
  onSidebarChange,
}: HomepageProductSessionLayoutTabProps) {
  const { previewConfig, setPreviewConfig } = useProductSessionPreviewStore();
  const { tags: availableTags } = useHomepageTags();

  const [editingSession, setEditingSession] = useState<SessionId | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const syncTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounced sync to preview store (avoids lag on slider/input changes)
  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      setPreviewConfig(config);
    }, 300);
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [config, setPreviewConfig]);

  useEffect(() => {
    onSidebarChange?.(sidebarVisible);
  }, [sidebarVisible, onSidebarChange]);

  const handleChange = (partial: Partial<ProductSessionLayoutConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }));
  };

  const currentSession = editingSession ? config.sessions[editingSession] : null;

  const handleSessionChange = (partial: Partial<ProductSessionConfig>) => {
    if (!editingSession || !currentSession) return;
    const updated = { ...currentSession, ...partial };
    setConfig(prev => ({
      ...prev,
      sessions: { ...prev.sessions, [editingSession]: updated }
    }));
  };

  const handleEditSession = (id: SessionId) => {
    if (sidebarVisible && editingSession === id) {
      setSidebarVisible(false);
      setEditingSession(null);
      return;
    }
    setEditingSession(id);
    setSidebarVisible(true);
  };

  return (
    <>
      <motion.div
        key="product-session-layout-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25 }}
        className="space-y-8"
      >
        {/* ── Product Session Preview ── */}
        <div className="admin-panel bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="border-b border-gray-100 pb-4 mb-4 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h2 className="text-sm font-semibold text-[#7A5C5C]">Product Session Preview</h2>
          </div>
          <InlinePreview config={config} />
        </div>

        {/* ── Layout Builder ── */}
        <div className="admin-panel bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical size={18} className="text-[#D4A5A5]" />
              <h2 className="text-sm font-semibold text-[#7A5C5C]">Layout Builder</h2>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mb-4">
            Tuỳ chỉnh layout chung và click vào từng session để chỉnh nội dung trong sidebar bên phải.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Left column: Layout + Columns/Rows + Filter Bar */}
            <div className="space-y-5">

              {/* Layout Mode */}
              <div className="bg-[#F9F7F7] rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <LayoutGrid size={14} className="text-[#D4A5A5]" />
                  <h3 className="text-xs font-bold text-[#7A5C5C]">Kiểu hiển thị</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(['grid', 'carousel'] as const).map((mode) => (
                    <button key={mode}
                      onClick={() => handleChange({ layout: mode })}
                      className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 ${
                        config.layout === mode
                          ? 'bg-[#7A5C5C] text-white border-[#7A5C5C] shadow-sm'
                          : 'bg-white text-[#7A5C5C] border-gray-200 hover:border-[#7A5C5C]/40 hover:bg-[#7A5C5C]/5'
                      }`}>
                      {mode === 'grid' ? '☰ Lưới (Grid)' : '⟷ Carousel'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Columns, Rows & Gap */}
              <div className="bg-[#F9F7F7] rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Columns3 size={14} className="text-[#D4A5A5]" />
                  <h3 className="text-xs font-bold text-[#7A5C5C]">Cột & hàng</h3>
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
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <SliderField label="Khoảng cách card" value={config.gap} min={4} max={40} onChange={v => handleChange({ gap: v })} />
                </div>
              </div>

              {/* Filter Bar */}
              <div className="bg-[#F9F7F7] rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter size={14} className="text-[#D4A5A5]" />
                  <h3 className="text-xs font-bold text-[#7A5C5C]">Thanh lọc (Filter Bar)</h3>
                </div>
                <div className="mb-3">
                  <ToggleBtn label="Bật thanh lọc" show={config.showFilterBar} onToggle={() => handleChange({ showFilterBar: !config.showFilterBar })} />
                </div>
                {config.showFilterBar && (
                  <div className="space-y-2 pt-3 border-t border-gray-200">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-[#7A5C5C]/50 mb-2">Chọn kiểu lọc</p>
                    <div className="grid grid-cols-2 gap-1.5">
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

            {/* Right column: Title/Subtitle + Session chips */}
            <div className="space-y-5">

              {/* Title Section */}
              <div className="bg-[#F9F7F7] rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye size={14} className="text-[#D4A5A5]" />
                  <h3 className="text-xs font-bold text-[#7A5C5C]">Tiêu đề Section</h3>
                </div>
                <SliderField label="Cỡ chữ tiêu đề" value={config.sectionTitleFontSize} min={16} max={40} onChange={v => handleChange({ sectionTitleFontSize: v })} />
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <ToggleBtn label="Tiêu đề" show={config.showTitle} onToggle={() => handleChange({ showTitle: !config.showTitle })} />
                  <ToggleBtn label="Xem tất cả" show={config.showViewAll} onToggle={() => handleChange({ showViewAll: !config.showViewAll })} />
                  <ToggleBtn label="Subtitle" show={config.showSubtitle} onToggle={() => handleChange({ showSubtitle: !config.showSubtitle })} />
                </div>
                {config.showSubtitle && (
                  <div className="mt-3">
                    <SliderField label="Cỡ chữ subtitle" value={config.subtitleFontSize} min={10} max={20} onChange={v => handleChange({ subtitleFontSize: v })} />
                  </div>
                )}
              </div>

              {/* 4 Session Chips */}
              <div className="bg-[#F9F7F7] rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlignLeft size={14} className="text-[#D4A5A5]" />
                  <h3 className="text-xs font-bold text-[#7A5C5C]">Sessions</h3>
                  <span className="text-[9px] text-gray-400 ml-1">(click để chỉnh trong sidebar)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SESSION_OPTIONS.map(opt => {
                    const isEditing = editingSession === opt.id;
                    const session = config.sessions[opt.id];
                    return (
                      <button key={opt.id}
                        onClick={() => handleEditSession(opt.id as SessionId)}
                        className={`text-left p-3 rounded-xl border transition-all duration-200 ${
                          isEditing
                            ? 'bg-[#7A5C5C] text-white border-[#7A5C5C] shadow-sm ring-2 ring-[#D4A5A5]/30'
                            : 'bg-white text-[#7A5C5C] border-gray-200 hover:border-[#7A5C5C]/40 hover:shadow-sm'
                        }`}>
                        <div className="text-[11px] font-bold mb-0.5">{opt.label}</div>
                        <div className={`text-[9px] truncate ${isEditing ? 'text-white/70' : 'text-gray-400'}`}>
                          {session.titleText || 'Chưa có tiêu đề'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Fixed Drawer – Session Editing ── */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '320px',
        transform: sidebarVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 40,
        background: '#ffffff',
        borderLeft: sidebarVisible ? '1px solid #e5e7eb' : 'none',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-[11px] font-semibold text-[#7A5C5C] uppercase tracking-wider">
            {editingSession ? `✎ ${getSessionLabel(editingSession)}` : 'Session'}
          </h3>
          <div className="flex items-center gap-2">
            {editingSession && (
              <button onClick={() => { setEditingSession(null); setSidebarVisible(false); }}
                className="text-[11px] font-semibold text-[#7A5C5C] hover:text-[#604444] px-1">← Danh sách</button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!editingSession && (
            <div className="space-y-2">
              <p className="text-[11px] text-gray-400 italic text-center py-4">Chọn một session trong Layout Builder để chỉnh sửa.</p>
              {SESSION_OPTIONS.map(opt => (
                <button key={opt.id}
                  onClick={() => handleEditSession(opt.id as SessionId)}
                  className="w-full text-left px-3 py-2.5 rounded-lg border border-gray-100 text-[11px] font-semibold text-[#7A5C5C] hover:border-[#D4A5A5]/30 hover:bg-[#D4A5A5]/5 transition-colors">
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {editingSession && currentSession && (
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Tiêu đề</label>
                <input type="text" value={currentSession.titleText}
                  onChange={e => handleSessionChange({ titleText: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/40" />
              </div>
              <div>
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Subtitle</label>
                <input type="text" value={currentSession.subtitleText}
                  onChange={e => handleSessionChange({ subtitleText: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/40" />
              </div>
              <div>
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Tag lọc sản phẩm</label>
                <div className="relative">
                  <button onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
                    className="flex items-center justify-between w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/40 text-[#7A5C5C]">
                    <span>{currentSession.filterTag || 'Chọn tag...'}</span>
                    <ChevronDown size={12} className={`transition-transform duration-200 ${tagDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {tagDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setTagDropdownOpen(false)} />
                      <div className="absolute top-full mt-1 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-[180px] overflow-y-auto">
                        {availableTags.map((tag) => (
                          <button key={tag._id}
                            onClick={() => { handleSessionChange({ filterTag: tag.slug }); setTagDropdownOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-[11px] font-medium transition-colors ${
                              currentSession.filterTag === tag.slug
                                ? 'bg-[#7A5C5C]/10 text-[#7A5C5C] font-bold'
                                : 'text-[#7A5C5C]/70 hover:bg-[#7A5C5C]/5'
                            }`}>
                            {tag.name} <span className="text-[9px] text-[#7A5C5C]/40">({tag.slug})</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

// ── Inline Preview (same visual as ProductSessionPreviewModal) ──
const InlinePreview = React.memo(function InlinePreview({ config }: { config: ProductSessionLayoutConfig }) {
  const cols = config.columnsDesktop;
  const rows = config.rowsDesktop;
  const totalCards = (rows || 2) * (cols || 4);
  const session = config.sessions.newProducts;

  return (
    <div className="bg-[#F9F7F7] rounded-xl border border-gray-100 p-6">
      {/* Section Header + Filter Bar */}
      <div className="relative mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 border-b border-[#D4A5A5]/10 pb-8">
        {/* Left: Title */}
        {config.showTitle && (
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0">
            <span className="text-[10px] font-bold uppercase text-[#D4A5A5]">Sản phẩm mới</span>
            <h2 className="mt-4 font-medium text-[#7A5C5C]"
              style={{ fontSize: `${config.sectionTitleFontSize}px` }}>
              {session.titleText}
            </h2>
            {config.showSubtitle && (
              <p className="mt-3 text-[#7A5C5C] max-w-[480px] font-medium leading-relaxed"
                style={{ fontSize: `${config.subtitleFontSize}px` }}>
                {session.subtitleText}
              </p>
            )}
          </div>
        )}

        {/* Right: Filter Bar */}
        {config.showFilterBar && (
          <div className="flex flex-col gap-3 text-[#7A5C5C]/80 w-full lg:w-auto">
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3">
              {config.showFilterBrand && (
                <div className="flex flex-col gap-1.5 min-w-[120px] sm:min-w-[130px] flex-1 sm:flex-initial">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">Hãng</label>
                  <div className="flex items-center justify-between w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium text-[#7A5C5C] h-[38px]">
                    <span>Tất cả</span>
                    <svg className="w-2.5 h-2.5 ml-2 opacity-60 shrink-0 text-[#7A5C5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}
              {config.showFilterScentGroup && (
                <div className="flex flex-col gap-1.5 min-w-[140px] sm:min-w-[150px] flex-1 sm:flex-initial">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">Nhóm hương</label>
                  <div className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium text-[#7A5C5C] h-[38px] flex items-center">Tất cả</div>
                </div>
              )}
              {config.showFilterConcentration && (
                <div className="flex flex-col gap-1.5 min-w-[120px] sm:min-w-[130px] flex-1 sm:flex-initial">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">Nồng độ</label>
                  <div className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium text-[#7A5C5C] h-[38px] flex items-center">Tất cả</div>
                </div>
              )}
              {config.showFilterSegment && (
                <div className="flex flex-col gap-1.5 min-w-[120px] sm:min-w-[130px] flex-1 sm:flex-initial">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">Phân khúc</label>
                  <div className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium text-[#7A5C5C] h-[38px] flex items-center">Tất cả</div>
                </div>
              )}
              {config.showFilterCapacity && (
                <div className="flex flex-col gap-1.5 min-w-[120px] sm:min-w-[130px] flex-1 sm:flex-initial">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">Dung tích</label>
                  <div className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium text-[#7A5C5C] h-[38px] flex items-center">Tất cả</div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3">
              {config.showFilterPrice && (
                <div className="flex flex-col gap-1.5 min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-initial">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">Mức giá</label>
                  <div className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium text-[#7A5C5C] h-[38px] flex items-center">Tất cả</div>
                </div>
              )}
              {config.showFilterSort && (
                <div className="flex flex-col gap-1.5 min-w-[125px] sm:min-w-[140px] flex-1 sm:flex-initial">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">Sắp xếp</label>
                  <div className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium text-[#7A5C5C] h-[38px] flex items-center">Mới nhất</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid auto-rows-fr"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: `${config.gap}px`
        }}>
        {Array.from({ length: totalCards }).map((_, i) => (
          <PreviewProductCard key={i} index={i} />
        ))}
      </div>

      {/* View All Footer */}
      {config.showViewAll && (
        <div className="mt-12 flex flex-col items-center">
          <button className="explore-all-btn-luxury flex items-center gap-4 focus:outline-none cursor-default">
            <span className="text-xs font-medium text-[#7A5C5C]/80">Xem tất cả bộ sưu tập</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4A5A5]/40">
              <ArrowRight size={15} className="text-[#D4A5A5]" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
});
// ============================================================
// Reusable Sub-components
// ============================================================
function SliderField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
        <span className="inline-flex items-center justify-center min-w-[28px] h-4 px-1 rounded-md bg-[#7A5C5C]/10 text-[9px] font-bold text-[#7A5C5C]">
          {value}
        </span>
      </div>
      <div className="relative h-4 flex items-center">
        <input type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="slider-custom w-full h-1 appearance-none rounded-full cursor-pointer"
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
    <button onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider border transition-all duration-200 ${
        show
          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm'
          : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
      }`}>
      {show ? <Eye size={10} /> : <EyeOff size={10} />}
      {show ? label : `Ẩn`}
    </button>
  );
}

function CheckboxField({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <label className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer text-[9px] font-bold uppercase tracking-wider select-none bg-white border-gray-200 hover:border-[#7A5C5C]/30 text-[#7A5C5C]/80 hover:text-[#7A5C5C]">
      <input type="checkbox" checked={checked} onChange={onToggle}
        className="w-3 h-3 rounded border-gray-300 text-[#7A5C5C] accent-[#7A5C5C] focus:ring-[#D4A5A5]" />
      {label}
    </label>
  );
}
