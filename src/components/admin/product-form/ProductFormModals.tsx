'use client';

import React, { useEffect } from 'react';
import { TagSelectionModal } from './modals/TagSelectionModal';
import { TaxonomySelectionModal } from './modals/TaxonomySelectionModal';
import { SizeVariantsPanel, DiscountPanel, PriceSuggestionPanel, AIPriceReportPanel } from './modals/PriceSuggestionModal';
import type { UseProductFormReturn } from './useProductForm';

export function ProductFormModals({ formHelpers }: { formHelpers: UseProductFormReturn }) {
  const {
    isVi, formData, update,
    tags, selectedTags, handleTagToggle, isTagModalOpen, setIsTagModalOpen,
    isCategoryModalOpen, setIsCategoryModalOpen, isScentGroupModalOpen, setIsScentGroupModalOpen,
    isConcentrationModalOpen, setIsConcentrationModalOpen, isSegmentModalOpen, setIsSegmentModalOpen,
    customScentGroup, setCustomScentGroup,
    customConcentration, setCustomConcentration, customSegment, setCustomSegment,
    selectedScentGroups, selectedConcentrations, selectedSegments, selectedCategories,
    handleCategoryToggle, handleScentGroupToggle, handleConcentrationToggle, handleSegmentToggle,
    scentGroups, categories, concentrations, segments,
    addScentGroupMutation, addConcentrationMutation, addSegmentMutation,
    isPriceSuggestModalOpen, setIsPriceSuggestModalOpen,
    isSuggestingPrice, priceMarkupPercentage, priceSuggestionData, setPriceSuggestionData,
    activeSuggestContext, setActiveSuggestContext,
    handleRecalculatePriceMarkup, parsedSizes, selectedSizes,
  } = formHelpers;

  useEffect(() => {
    if (isPriceSuggestModalOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isPriceSuggestModalOpen]);

  return (
    <>
      {/* Tag Selection Modal */}
      <TagSelectionModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        tags={tags}
        selectedTags={selectedTags}
        handleTagToggle={handleTagToggle}
        isVi={isVi}
      />

      {/* Category Selection Modal */}
      <TaxonomySelectionModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={isVi ? 'Chọn Danh mục' : 'Select Categories'}
        subtitle={isVi ? 'Chọn một hoặc nhiều danh mục cho sản phẩm' : 'Select one or multiple categories for this product'}
        items={(categories || []).filter((c: any) => c.status === 'active')}
        defaultItems={[]}
        selectedIds={selectedCategories}
        onToggle={handleCategoryToggle}
        customValue=""
        onCustomChange={() => {}}
        customPlaceholder=""
        onCustomAdd={() => {}}
        isCustomPending={false}
        emptyMessage={isVi ? 'Không có danh mục nào' : 'No categories available'}
        isVi={isVi}
      />

      {/* Scent Group Selection Modal */}
      <TaxonomySelectionModal
        isOpen={isScentGroupModalOpen}
        onClose={() => setIsScentGroupModalOpen(false)}
        title={isVi ? 'Phân loại Nhóm hương' : 'Scent Group Selection'}
        subtitle={isVi ? 'Chọn các nhóm hương đặc trưng của nước hoa này' : 'Select signature scent groups of this perfume'}
        items={scentGroups || []}
        defaultItems={[
          'Hương Gỗ (Woody)', 'Hương Hoa Cỏ (Floral)', 'Hương Phương Đông (Oriental)',
          'Hương Cam Chanh (Citrus)', 'Hương Gia Vị (Spicy)', 'Hương Da Thuộc (Leather)',
          'Hương Nước (Aquatic)', 'Hương Trái Cây (Fruity)', 'Hương Rêu Sồi (Chypre)', 'Hương Thảo Mộc (Fougere)'
        ]}
        selectedIds={selectedScentGroups}
        onToggle={handleScentGroupToggle}
        customValue={customScentGroup}
        onCustomChange={setCustomScentGroup}
        customPlaceholder={isVi ? 'Thêm nhóm hương tùy chỉnh...' : 'Add custom scent group...'}
        onCustomAdd={() => { if (customScentGroup.trim()) addScentGroupMutation.mutate(customScentGroup.trim()); }}
        isCustomPending={addScentGroupMutation.isPending}
        emptyMessage={isVi ? 'Không có nhóm hương' : 'No scent groups available'}
        isVi={isVi}
      />

      {/* Concentration Selection Modal */}
      <TaxonomySelectionModal
        isOpen={isConcentrationModalOpen}
        onClose={() => setIsConcentrationModalOpen(false)}
        title={isVi ? 'Phân loại Nồng độ' : 'Concentration Selection'}
        subtitle={isVi ? 'Chọn nồng độ tinh dầu của nước hoa' : 'Select perfume concentrations'}
        items={concentrations || []}
        defaultItems={[
          'EDP (Eau de Parfum)', 'EDT (Eau de Toilette)', 'Parfum / Extrait',
          'EDC (Eau de Cologne)', 'Eau Fraiche', 'Body Mist / Deodorant'
        ]}
        selectedIds={selectedConcentrations}
        onToggle={handleConcentrationToggle}
        customValue={customConcentration}
        onCustomChange={setCustomConcentration}
        customPlaceholder={isVi ? 'Thêm nồng độ tùy chỉnh...' : 'Add custom concentration...'}
        onCustomAdd={() => { if (customConcentration.trim()) addConcentrationMutation.mutate(customConcentration.trim()); }}
        isCustomPending={addConcentrationMutation.isPending}
        emptyMessage={isVi ? 'Không có nồng độ' : 'No concentrations available'}
        isVi={isVi}
      />

      {/* Segment Selection Modal */}
      <TaxonomySelectionModal
        isOpen={isSegmentModalOpen}
        onClose={() => setIsSegmentModalOpen(false)}
        title={isVi ? 'Phân loại Phân khúc' : 'Segment Selection'}
        subtitle={isVi ? 'Chọn phân khúc phân cấp của thương hiệu nước hoa' : 'Select brand segment classification'}
        items={segments || []}
        defaultItems={['Niche', 'Designer', 'Indie / Artisan', 'Masstige', 'Classic / Vintage']}
        selectedIds={selectedSegments}
        onToggle={handleSegmentToggle}
        customValue={customSegment}
        onCustomChange={setCustomSegment}
        customPlaceholder={isVi ? 'Thêm phân khúc tùy chỉnh...' : 'Add custom segment...'}
        onCustomAdd={() => { if (customSegment.trim()) addSegmentMutation.mutate(customSegment.trim()); }}
        isCustomPending={addSegmentMutation.isPending}
        emptyMessage={isVi ? 'Không có phân khúc' : 'No segments available'}
        isVi={isVi}
      />

      {/* AI Price/Discount/Variants Suggestion Modal */}
      {isPriceSuggestModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5"
          style={{ background: 'rgba(61, 46, 36, 0.4)', backdropFilter: 'blur(8px)' }}
          onClick={() => setIsPriceSuggestModalOpen(false)}>
          <div className="flex flex-row gap-5 items-stretch justify-center flex-wrap w-full max-w-[1060px] max-h-[90vh] overflow-y-auto"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
            onClick={(e) => e.stopPropagation()}>

            {/* Left Card */}
            <div className="flex-[1_1_420px] max-w-[480px] p-6 rounded-[var(--admin-radius-lg)] flex flex-col gap-5"
              style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', boxShadow: 'var(--admin-shadow-lg)' }}>

              {activeSuggestContext?.size === 'Dung tích' ? (
                <SizeVariantsPanel
                  isVi={isVi} selectedSizes={selectedSizes} parsedSizes={parsedSizes}
                  update={update} setIsPriceSuggestModalOpen={setIsPriceSuggestModalOpen} />
              ) : activeSuggestContext?.size === 'Chiết khấu' ? (
                <DiscountPanel
                  isVi={isVi} formData={formData} update={update}
                  setIsPriceSuggestModalOpen={setIsPriceSuggestModalOpen} />
              ) : (
                <PriceSuggestionPanel
                  isVi={isVi} isSuggestingPrice={isSuggestingPrice}
                  priceSuggestionData={priceSuggestionData} priceMarkupPercentage={priceMarkupPercentage}
                  setPriceSuggestionData={setPriceSuggestionData}
                  handleRecalculatePriceMarkup={handleRecalculatePriceMarkup}
                  activeSuggestContext={activeSuggestContext}
                  setIsPriceSuggestModalOpen={setIsPriceSuggestModalOpen}
                  isSuggesting={isSuggestingPrice} />
              )}
            </div>

            {/* Right Card: AI Market Analysis Report */}
            <AIPriceReportPanel
              isVi={isVi} priceSuggestionData={priceSuggestionData}
              isSuggestingPrice={isSuggestingPrice} activeSuggestContext={activeSuggestContext} />
          </div>
        </div>
      )}
    </>
  );
}