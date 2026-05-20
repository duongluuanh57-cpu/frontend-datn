'use client';

import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import './chat-widget.css';

// Subcomponents & Hook
import { useChatWidget } from './chat-widget/useChatWidget';
import { ChatWidgetHeader } from './chat-widget/ChatWidgetHeader';
import { ChatWidgetMessageList } from './chat-widget/ChatWidgetMessageList';
import { ChatWidgetInputArea } from './chat-widget/ChatWidgetInputArea';

export function ChatWidget() {
  const formHelpers = useChatWidget();
  const {
    isOpen,
    setIsOpen,
    unreadCount
  } = formHelpers;

  return (
    <div className="chat-widget-container">
      <motion.button 
        className={cn(
          "chat-trigger",
          isOpen && "is-mini"
        )}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? <X size={24} /> : (
            <div className="relative flex items-center justify-center">
              <MessageCircle size={28} strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4A5A5] text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-md">
                  {unreadCount}
                </span>
              )}
            </div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="chat-window-elite"
          >
            <ChatWidgetHeader formHelpers={formHelpers} />

            <div className="chat-content-container relative">
              <ChatWidgetMessageList formHelpers={formHelpers} />
              <ChatWidgetInputArea formHelpers={formHelpers} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
