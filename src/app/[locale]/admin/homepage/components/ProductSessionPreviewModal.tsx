'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Filter } from 'lucide-react';
import { useProductSessionPreviewStore } from '@/store/useProductSessionPreviewStore';
import { useProductSessionLayout } from '@/store/useProductSessionPreviewStore';
import { PreviewProductCard } from '@/components/ui/product-session-preview/PreviewProductCard';

export function ProductSessionPreviewModal() {
  const { showPreviewModal, setShowPreviewModal, isPreviewMode, setIsPreviewMode, selectedSessionId } = useProductSessionPreviewStore();
  const config = useProductSessionLayout();
  const currentSession = config.sessions?.[selectedSessionId] ?? { titleText: '', subtitleText: '' };
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Bật preview mode khi modal mở
  React.useEffect(() => {
    if (showPreviewModal) {
      setIsPreviewMode(true);
    }
  }, [showPreviewModal, setIsPreviewMode]);

  useEffect(() => {
    if (showPreviewModal) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showPreviewModal]);

  const handleClose = () => {
    setIsPreviewMode(false);
    setShowPreviewModal(false);
  };

  // Tính số card dựa trên config
  const cols = isMobile ? config.columnsMobile : config.columnsDesktop;
  const rows = isMobile ? config.rowsMobile : config.rowsDesktop;
  const totalCards = (rows || 2) * (cols || 4);

  return (
    <AnimatePresence>
      {showPreviewModal && (
        <motion.div
          key="product-session-preview-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-2xl w-[98vw] sm:w-full max-w-container mx-2 sm:mx-4 my-6 overflow-y-auto max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-base font-extrabold text-[#7A5C5C]">Xem trước Product Session</h2>
                <p className="text-xs font-medium text-[#7A5C5C]/60 mt-0.5">
                  Thay đổi config bên dưới để thấy component thay đổi realtime
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-all"
              >
                <X size={14} /> Đóng
              </button>
            </div>

            {/* Preview Body */}
            <div className="p-6">
              {/* Section Header + Filter Bar */}
              <div className="relative mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 border-b border-[#D4A5A5]/10 pb-8">
                {/* Left: Title */}
                {config.showTitle && (
                  <div className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0">
                    <span className="text-[10px] font-bold uppercase text-[#D4A5A5]">Sản phẩm mới</span>
                    <h2
                      className="mt-4 font-medium text-[#7A5C5C]"
                      style={{ fontSize: `${config.sectionTitleFontSize}px` }}
                    >
                      {currentSession.titleText}
                    </h2>
                    {config.showSubtitle && (
                      <p
                        className="mt-3 text-[#7A5C5C] max-w-[480px] font-medium leading-relaxed"
                        style={{ fontSize: `${config.subtitleFontSize}px` }}
                      >
                        {currentSession.subtitleText}
                      </p>
                    )}
                  </div>
                )}

                {/* Right: Filter Bar */}
                {config.showFilterBar && (
                  <div className="flex flex-col gap-3 text-[#7A5C5C]/80 w-full lg:w-auto">
                    {/* Row 1: Brand, Scent Group, Concentration, Segment, Capacity */}
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
                          <div className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium text-[#7A5C5C] h-[38px] flex items-center">
                            Tất cả
                          </div>
                        </div>
                      )}
                      {config.showFilterConcentration && (
                        <div className="flex flex-col gap-1.5 min-w-[120px] sm:min-w-[130px] flex-1 sm:flex-initial">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">Nồng độ</label>
                          <div className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium text-[#7A5C5C] h-[38px] flex items-center">
                            Tất cả
                          </div>
                        </div>
                      )}
                      {config.showFilterSegment && (
                        <div className="flex flex-col gap-1.5 min-w-[120px] sm:min-w-[130px] flex-1 sm:flex-initial">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">Phân khúc</label>
                          <div className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium text-[#7A5C5C] h-[38px] flex items-center">
                            Tất cả
                          </div>
                        </div>
                      )}
                      {config.showFilterCapacity && (
                        <div className="flex flex-col gap-1.5 min-w-[120px] sm:min-w-[130px] flex-1 sm:flex-initial">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">Dung tích</label>
                          <div className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium text-[#7A5C5C] h-[38px] flex items-center">
                            Tất cả
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Row 2: Price, Sort */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3">
                      {config.showFilterPrice && (
                        <div className="flex flex-col gap-1.5 min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-initial">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">Mức giá</label>
                          <div className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium text-[#7A5C5C] h-[38px] flex items-center">
                            Tất cả
                          </div>
                        </div>
                      )}
                      {config.showFilterSort && (
                        <div className="flex flex-col gap-1.5 min-w-[125px] sm:min-w-[140px] flex-1 sm:flex-initial">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">Sắp xếp</label>
                          <div className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium text-[#7A5C5C] h-[38px] flex items-center">
                            Mới nhất
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Grid */}
              <div
                className="grid auto-rows-fr"
                style={{
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gap: `${config.gap}px`
                }}
              >
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}