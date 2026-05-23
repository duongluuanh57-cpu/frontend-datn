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
    brands, tags, scentGroups, concentrations, segments,
    selectedTags, handleTagToggle,
    isTagModalOpen, setIsTagModalOpen,
    isGenderModalOpen, setIsGenderModalOpen,
    isScentGroupModalOpen, setIsScentGroupModalOpen,
    isConcentrationModalOpen, setIsConcentrationModalOpen,
    isSegmentModalOpen, setIsSegmentModalOpen,
    customGender, setCustomGender,
    customScentGroup, setCustomScentGroup,
    customConcentration, setCustomConcentration,
    customSegment, setCustomSegment,
    selectedGenders, selectedScentGroups, selectedConcentrations, selectedSegments,
    handleGenderToggle, handleScentGroupToggle, handleConcentrationToggle, handleSegmentToggle,
    addScentGroupMutation, addConcentrationMutation, addSegmentMutation,
    isPriceSuggestModalOpen, setIsPriceSuggestModalOpen,
    isSuggestingPrice, priceMarkupPercentage,
    priceSuggestionData, setPriceSuggestionData,
    activeSuggestContext, setActiveSuggestContext,
    dynamicSizeReport, dynamicDiscountReport,
    handleOpenPriceSuggestion, handleRecalculatePriceMarkup,
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
              setIsGenderModalOpen={setIsGenderModalOpen}
              setIsScentGroupModalOpen={setIsScentGroupModalOpen}
              setIsConcentrationModalOpen={setIsConcentrationModalOpen}
              setIsSegmentModalOpen={setIsSegmentModalOpen}
              selectedGenders={selectedGenders}
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
          isGenderModalOpen, setIsGenderModalOpen, isScentGroupModalOpen, setIsScentGroupModalOpen,
          isConcentrationModalOpen, setIsConcentrationModalOpen, isSegmentModalOpen, setIsSegmentModalOpen,
          customGender, setCustomGender, customScentGroup, setCustomScentGroup,
          customConcentration, setCustomConcentration, customSegment, setCustomSegment,
          selectedGenders, selectedScentGroups, selectedConcentrations, selectedSegments,
          handleGenderToggle, handleScentGroupToggle, handleConcentrationToggle, handleSegmentToggle,
          scentGroups, concentrations, segments,
          addScentGroupMutation, addConcentrationMutation, addSegmentMutation,
          isPriceSuggestModalOpen, setIsPriceSuggestModalOpen,
          isSuggestingPrice, priceMarkupPercentage, priceSuggestionData, setPriceSuggestionData,
          activeSuggestContext, setActiveSuggestContext,
          handleRecalculatePriceMarkup, parsedSizes, selectedSizes,
        } as UseProductFormReturn}
      />
    </>
  );
}
export { formatSizeString } from './product-form/useProductForm';
export type { ProductFormData };

