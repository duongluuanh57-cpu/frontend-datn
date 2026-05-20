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

interface EditableBannerLabelProps {
  children: React.ReactNode;
  isPreview?: boolean;
  onChange?: (val: string) => void;
}

export function EditableBannerLabel({
  children,
  isPreview = false,
  onChange,
}: EditableBannerLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(typeof children === 'string' ? children : '');

  useEffect(() => {
    if (typeof children === 'string') setTempVal(children);
  }, [children]);

  if (isPreview && isEditing) {
    return (
      <motion.div variants={itemVariants} className="w-full">
        <input
          value={tempVal}
          onChange={(e) => {
            setTempVal(e.target.value);
            onChange?.(e.target.value);
          }}
          onBlur={() => setIsEditing(false)}
          autoFocus
          className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#C08497] md:text-xs w-full bg-white/40 backdrop-blur-sm rounded-md px-2 py-1 border border-[#7A5C5C]/20 outline-none text-center"
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
      className={isPreview ? 'cursor-text group/label relative' : ''}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#C08497] md:text-xs">
        {typeof children === 'string' ? children : children}
      </span>
      {isPreview && (
        <span className="absolute -top-6 right-2 text-[9px] bg-[#7A5C5C] text-white px-1.5 py-0.5 rounded opacity-0 group-hover/label:opacity-100 transition-opacity duration-200 pointer-events-none">
          Click để sửa nhanh
        </span>
      )}
    </motion.div>
  );
}
