'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    } as any,
  },
};

interface BannerDescriptionProps {
  children: React.ReactNode;
  isPreview?: boolean;
  onChange?: (val: string) => void;
}

export function BannerDescription({
  children,
  isPreview = false,
  onChange,
}: BannerDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(typeof children === 'string' ? children : '');

  useEffect(() => {
    if (typeof children === 'string') {
      setTempVal(children);
    }
  }, [children]);

  if (isPreview && isEditing) {
    return (
      <motion.div variants={itemVariants} className="w-full">
        <textarea
          value={tempVal}
          onChange={(e) => {
            setTempVal(e.target.value);
            onChange?.(e.target.value);
          }}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              setIsEditing(false);
            }
          }}
          autoFocus
          className="banner-description max-w-sm text-[10px] sm:text-[11px] md:text-xs font-light tracking-wide text-[#7A5C5C]/90 leading-[1.8] bg-white/40 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-[#7A5C5C]/20 outline-none w-full text-center md:text-right resize-none min-h-[70px] focus:ring-1 focus:ring-[#7A5C5C]/40"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      onClick={() => {
        if (isPreview) setIsEditing(true);
      }}
      className={isPreview ? "cursor-text hover:bg-black/[0.02] hover:ring-1 hover:ring-[#7A5C5C]/15 rounded-xl transition-all duration-200 group/desc relative w-full flex justify-center md:justify-end px-2 py-1" : "w-full flex justify-center md:justify-end"}
    >
      <p className="banner-description max-w-[420px] text-[11px] sm:text-xs md:text-sm font-light tracking-wide text-[#7A5C5C]/90 leading-[1.6]">
        {children}
      </p>
      {isPreview && (
        <span className="absolute -top-6 right-2 text-[9px] bg-[#7A5C5C] text-white px-1.5 py-0.5 rounded opacity-0 group-hover/desc:opacity-100 transition-opacity duration-200 pointer-events-none">
          Click để sửa nhanh
        </span>
      )}
    </motion.div>
  );
}
