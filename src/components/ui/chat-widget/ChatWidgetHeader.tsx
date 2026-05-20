'use client';

import React from 'react';
import { Sparkles, Minus, X } from 'lucide-react';
import { useChatWidget } from './useChatWidget';

interface ChatWidgetHeaderProps {
  formHelpers: ReturnType<typeof useChatWidget>;
}

export function ChatWidgetHeader({ formHelpers }: ChatWidgetHeaderProps) {
  const { setIsOpen, handleCloseAndClear } = formHelpers;

  return (
    <div className="chat-header-elite">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#7A5C5C]/5 rounded-xl flex items-center justify-center border border-[#7A5C5C]/10">
          <Sparkles size={16} className="text-[#D4A5A5]" />
        </div>
        <div>
          <h3 className="tracking-[0.2em]">TINCO</h3>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5">
        <button 
          type="button"
          onClick={() => setIsOpen(false)} 
          className="window-control-btn"
        >
          <Minus size={14} />
        </button>
        <button 
          type="button"
          onClick={handleCloseAndClear} 
          className="window-control-btn close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
