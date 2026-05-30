'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLuxuryGallery } from './useLuxuryGallery';

interface LuxuryGalleryLightboxProps {
  formHelpers: ReturnType<typeof useLuxuryGallery>;
}

export function LuxuryGalleryLightbox({ formHelpers }: LuxuryGalleryLightboxProps) {
  const {
    currentImages,
    selectedImageIndex,
    setSelectedImageIndex,
    handlePrev,
    handleNext,
  } = formHelpers;

  if (selectedImageIndex === null) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[10001] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8 select-none"
        onClick={() => setSelectedImageIndex(null)}
      >
        {/* Soft background light blooms */}
        <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-[#D4A5A5]/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-[#E8C5C5]/8 blur-[120px] pointer-events-none" />

        {/* Header controls inside lightbox */}
        <div className="absolute top-6 left-6 md:left-10 text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] pointer-events-none">
          {selectedImageIndex + 1} / {currentImages.length}
        </div>

        {/* Close Button */}
        <button
          onClick={() => setSelectedImageIndex(null)}
          className="absolute top-6 right-6 md:right-10 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all duration-300 z-50 clickable focus:outline-none"
          style={{ cursor: "url('/pointer.png') 0 0, pointer" }}
        >
          <X size={20} className="stroke-[1.8]" />
        </button>

        {/* Left Navigation Arrow */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-4 md:left-10 p-3.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/15 transition-all duration-300 z-50 clickable focus:outline-none"
          style={{ cursor: "url('/pointer.png') 0 0, pointer" }}
        >
          <ChevronLeft size={24} className="stroke-[1.5]" />
        </button>

        {/* Active Image container */}
        <motion.div
          key={selectedImageIndex}
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: -15 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.6)] w-fit h-fit max-w-[90vw] md:max-w-[75vw] flex items-center justify-center overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {currentImages[selectedImageIndex]?.url && (
            <img
              src={currentImages[selectedImageIndex].url}
              alt={currentImages[selectedImageIndex].title}
              className="max-w-[85vw] md:max-w-[70vw] max-h-[50vh] md:max-h-[60vh] w-auto h-auto rounded-xl object-contain select-none"
            />
          )}
        </motion.div>

        {/* Bottom Caption Box */}
        <motion.div
          key={`caption-${selectedImageIndex}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-6 md:mt-8 bg-white/5 backdrop-blur-md px-8 py-5 rounded-2xl border border-white/10 max-w-[480px] w-full text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#E7B8B8] mb-1.5 block">
            L'essence Moment
          </span>
          <h3 
            className="text-lg font-light tracking-[0.1em] text-white uppercase mb-2"
            style={{ fontFamily: 'var(--font-heading), serif' }}
          >
            {currentImages[selectedImageIndex]?.title}
          </h3>
          <p 
            className="text-xs leading-relaxed text-white/80 font-light italic tracking-wide"
            style={{ fontFamily: 'var(--font-heading), serif' }}
          >
            "{currentImages[selectedImageIndex]?.quote}"
          </p>
        </motion.div>

        {/* Right Navigation Arrow */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 md:right-10 p-3.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/15 transition-all duration-300 z-50 clickable focus:outline-none"
          style={{ cursor: "url('/pointer.png') 0 0, pointer" }}
        >
          <ChevronRight size={24} className="stroke-[1.5]" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
