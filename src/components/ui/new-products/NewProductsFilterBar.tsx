'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useNewProducts } from './useNewProducts';

interface NewProductsFilterBarProps {
  formHelpers: ReturnType<typeof useNewProducts>;
}

export function NewProductsFilterBar({ formHelpers }: NewProductsFilterBarProps) {
  const {
    locale,
    brands,
    capacities,
    selectedBrand,
    setSelectedBrand,
    selectedCapacity,
    setSelectedCapacity,
    selectedPriceRange,
    setSelectedPriceRange,
    selectedSort,
    setSelectedSort,
    isBrandOpen,
    setIsBrandOpen,
    handleResetFilters
  } = formHelpers;

  return (
    <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 sm:gap-4 text-[#7A5C5C]/80 w-full lg:w-auto">
      {/* Reset Filters Button */}
      {(selectedBrand !== 'all' || selectedCapacity !== 'all' || selectedPriceRange !== 'all' || selectedSort !== 'newest') && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleResetFilters}
          className="self-end h-[38px] flex items-center justify-center gap-1.5 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#D4A5A5] border border-[#D4A5A5]/20 bg-[#D4A5A5]/5 hover:bg-[#D4A5A5]/10 transition-all duration-300 backdrop-blur-md cursor-pointer w-full sm:w-auto"
        >
          <span className="text-[12px] font-normal leading-none">×</span>
          {locale === 'vi' ? 'Hủy lọc' : 'Clear'}
        </motion.button>
      )}

      {/* Brand Filter */}
      <div className="relative flex flex-col gap-1.5 min-w-[120px] sm:min-w-[130px] flex-1 sm:flex-initial">
        <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">
          {locale === 'vi' ? 'Hãng' : 'Brand'}
        </label>
        
        {/* Custom Luxury Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsBrandOpen(!isBrandOpen)}
          className="flex items-center justify-between w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium backdrop-blur-md focus:outline-none focus:border-[#D4A5A5] focus:ring-1 focus:ring-[#D4A5A5]/20 transition-all cursor-pointer text-[#7A5C5C] h-[38px] text-left"
        >
          <span className="truncate">
            {selectedBrand === 'all' 
              ? (locale === 'vi' ? 'Tất cả' : 'All Brands') 
              : selectedBrand}
          </span>
          <svg
            className={`w-2.5 h-2.5 ml-2 transition-transform duration-300 opacity-60 shrink-0 text-[#7A5C5C]`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ transform: isBrandOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Custom Options list limited to ~5 items high with custom scrollbar */}
        {isBrandOpen && (
          <>
            {/* Invisible overlay backdrop for click-away behavior */}
            <div 
              className="fixed inset-0 z-40 bg-transparent cursor-default" 
              onClick={() => setIsBrandOpen(false)} 
            />
            
            <div className="absolute top-[58px] left-0 w-full bg-white/95 border border-[#7A5C5C]/10 rounded-xl shadow-xl z-50 py-1.5 max-h-[175px] overflow-y-auto backdrop-blur-lg flex flex-col scrollbar-thin scrollbar-thumb-[#7A5C5C]/10 scrollbar-track-transparent">
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand('all');
                  setIsBrandOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-[#7A5C5C]/5 transition-colors cursor-pointer shrink-0 ${
                  selectedBrand === 'all' ? 'font-bold text-[#D4A5A5] bg-[#7A5C5C]/3' : 'text-[#7A5C5C]/80'
                }`}
              >
                {locale === 'vi' ? 'Tất cả' : 'All Brands'}
              </button>
              {brands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    setSelectedBrand(b);
                    setIsBrandOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#7A5C5C]/5 transition-colors truncate cursor-pointer shrink-0 ${
                    selectedBrand === b ? 'font-bold text-[#D4A5A5] bg-[#7A5C5C]/3' : 'text-[#7A5C5C]/80'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Capacity Filter */}
      <div className="flex flex-col gap-1.5 min-w-[120px] sm:min-w-[130px] flex-1 sm:flex-initial">
        <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">
          {locale === 'vi' ? 'Dung tích' : 'Capacity'}
        </label>
        <select
          value={selectedCapacity}
          onChange={(e) => setSelectedCapacity(e.target.value)}
          className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium backdrop-blur-md focus:outline-none focus:border-[#D4A5A5] transition-all cursor-pointer text-[#7A5C5C]"
        >
          <option value="all">{locale === 'vi' ? 'Tất cả' : 'All Sizes'}</option>
          {capacities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div className="flex flex-col gap-1.5 min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-initial">
        <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">
          {locale === 'vi' ? 'Mức giá' : 'Price'}
        </label>
        <select
          value={selectedPriceRange}
          onChange={(e) => setSelectedPriceRange(e.target.value)}
          className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium backdrop-blur-md focus:outline-none focus:border-[#D4A5A5] transition-all cursor-pointer text-[#7A5C5C]"
        >
          <option value="all">{locale === 'vi' ? 'Tất cả' : 'All Prices'}</option>
          <option value="under-1m">{locale === 'vi' ? 'Dưới 1 triệu' : 'Under 1M'}</option>
          <option value="1m-3m">{locale === 'vi' ? '1 triệu - 3 triệu' : '1M - 3M'}</option>
          <option value="over-3m">{locale === 'vi' ? 'Trên 3 triệu' : 'Over 3M'}</option>
        </select>
      </div>

      {/* Sort Control */}
      <div className="flex flex-col gap-1.5 min-w-[125px] sm:min-w-[140px] flex-1 sm:flex-initial">
        <label className="text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/50">
          {locale === 'vi' ? 'Sắp xếp' : 'Sort By'}
        </label>
        <select
          value={selectedSort}
          onChange={(e) => setSelectedSort(e.target.value)}
          className="w-full bg-white/40 border border-[#7A5C5C]/10 rounded-xl px-3 py-2 text-xs font-medium backdrop-blur-md focus:outline-none focus:border-[#D4A5A5] transition-all cursor-pointer text-[#7A5C5C]"
        >
          <option value="newest">{locale === 'vi' ? 'Mới nhất' : 'Newest'}</option>
          <option value="price-asc">{locale === 'vi' ? 'Giá tăng dần' : 'Price: Low-High'}</option>
          <option value="price-desc">{locale === 'vi' ? 'Giá giảm dần' : 'Price: High-Low'}</option>
        </select>
      </div>
    </div>
  );
}
