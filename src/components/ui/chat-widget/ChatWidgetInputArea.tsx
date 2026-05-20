'use client';

import React from 'react';
import { X, Image as ImageIcon, Loader2, Send } from 'lucide-react';
import { useChatWidget } from './useChatWidget';

interface ChatWidgetInputAreaProps {
  formHelpers: ReturnType<typeof useChatWidget>;
}

export function ChatWidgetInputArea({ formHelpers }: ChatWidgetInputAreaProps) {
  const {
    localInput,
    setLocalInput,
    selectedImage,
    isLoading,
    imageInputRef,
    handleImageClick,
    handleImageChange,
    removeImage,
    handleSendMessage
  } = formHelpers;

  return (
    <div className="chat-input-elite">
      <form onSubmit={handleSendMessage}>
        {selectedImage && (
          <div className="mb-3 flex justify-start">
            <div className="relative border border-[#7A5C5C]/20 rounded-xl bg-white p-1 shadow-md">
              <img src={selectedImage} alt="preview" className="w-12 h-12 rounded-lg object-cover" />
              <button 
                type="button"
                onClick={removeImage}
                className="btn-remove-image"
              >
                <X size={10} />
              </button>
            </div>
          </div>
        )}
        <input 
          type="file" 
          ref={imageInputRef} 
          onChange={handleImageChange} 
          accept="image/*" 
          className="hidden" 
        />
        <div className="chat-input-container-inner">
          <button 
            type="button"
            onClick={handleImageClick}
            className="p-1.5 text-[#7A5C5C]/40 hover:text-[#7A5C5C] transition-colors"
          >
            <ImageIcon size={20} />
          </button>
          <textarea 
            rows={1}
            placeholder="Gửi tin nhắn cho Tinco..." 
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button 
            type="submit" 
            disabled={isLoading || (!localInput.trim() && !selectedImage)}
            className="chat-send-btn"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
}
