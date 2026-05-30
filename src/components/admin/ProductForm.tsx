'use client';

import React from 'react';
import { useProductForm, ProductFormData, UseProductFormReturn } from './product-form/useProductForm';
import { ProductFormToolbar } from './product-form/ProductFormToolbar';
import { ProductDetailsSection } from './product-form/ProductDetailsSection';
import { ProductMediaSection } from './product-form/ProductMediaSection';
import { ProductSEOSection } from './product-form/ProductSEOSection';
import { ProductFormModals } from './product-form/ProductFormModals';

export interface ProductFormProps {
  initialData?: ProductFormData;
  productId?: string;
}

export function ProductForm({ initialData, productId }: ProductFormProps) {
  const {
    t, isVi, isSubmitting, formData, update,
    handleSubmit, isImageUploading, setIsImageUploading,
    parsedSizes, selectedSizes, isFormComplete,
    brands, tags, categories, scentGroups, concentrations, segments,
    selectedTags, handleTagToggle,
    isTagModalOpen, setIsTagModalOpen,
    isCategoryModalOpen, setIsCategoryModalOpen,
    isScentGroupModalOpen, setIsScentGroupModalOpen,
    isConcentrationModalOpen, setIsConcentrationModalOpen,
    isSegmentModalOpen, setIsSegmentModalOpen,
    customScentGroup, setCustomScentGroup,
    customConcentration, setCustomConcentration,
    customSegment, setCustomSegment,
    selectedScentGroups, selectedConcentrations, selectedSegments, selectedCategories,
    handleCategoryToggle, handleScentGroupToggle, handleConcentrationToggle, handleSegmentToggle,
    addScentGroupMutation, addConcentrationMutation, addSegmentMutation,
    isPriceSuggestModalOpen, setIsPriceSuggestModalOpen,
    isSuggestingPrice, priceMarkupPercentage,
    priceSuggestionData, setPriceSuggestionData,
    activeSuggestContext, setActiveSuggestContext,
    dynamicSizeReport, dynamicDiscountReport,
    handleOpenPriceSuggestion, handleRecalculatePriceMarkup,
    isAiGenerating, handleAiGenerateProduct,
  } = useProductForm({ initialData, productId });

  return (
    <>
      <form onSubmit={handleSubmit} className="admin-form-page">
        <ProductFormToolbar
          t={t}
          isVi={isVi}
          isSubmitting={isSubmitting}
          isImageUploading={isImageUploading}
          productId={productId}
          onAiRegenerate={handleAiGenerateProduct}
          isAiRegenerating={isAiGenerating}
        />

        <div className="admin-form-grid">
          <div className="admin-form-column-left">
            <ProductDetailsSection
              t={t}
              isVi={isVi}
              formData={formData}
              update={update}
              priceMarkupPercentage={priceMarkupPercentage}
              dynamicSizeReport={dynamicSizeReport}
              dynamicDiscountReport={dynamicDiscountReport}
              setIsPriceSuggestModalOpen={setIsPriceSuggestModalOpen}
              setPriceSuggestionData={setPriceSuggestionData}
              setActiveSuggestContext={setActiveSuggestContext}
              handleOpenPriceSuggestion={handleOpenPriceSuggestion}
              setIsCategoryModalOpen={setIsCategoryModalOpen}
              setIsScentGroupModalOpen={setIsScentGroupModalOpen}
              setIsConcentrationModalOpen={setIsConcentrationModalOpen}
              setIsSegmentModalOpen={setIsSegmentModalOpen}
              categories={categories}
              selectedCategories={selectedCategories}
              selectedScentGroups={selectedScentGroups}
              selectedConcentrations={selectedConcentrations}
              selectedSegments={selectedSegments}
            />
          </div>

          <div className="admin-form-column-right">
            <ProductMediaSection
              t={t}
              isVi={isVi}
              formData={formData}
              update={update}
              setIsImageUploading={setIsImageUploading}
              brands={brands}
              tags={tags}
              selectedTags={selectedTags}
              setIsTagModalOpen={setIsTagModalOpen}
            />
          </div>
          <ProductSEOSection
            t={t}
            isVi={isVi}
            formData={formData}
            update={update}
            isFormComplete={isFormComplete}
          />
        </div>
      </form>

      <ProductFormModals
        formHelpers={{
          t, isVi, formData, update,
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
        } as unknown as UseProductFormReturn}
      />
    </>
  );
}
export { formatSizeString } from './product-form/useProductForm';
export type { ProductFormData };

