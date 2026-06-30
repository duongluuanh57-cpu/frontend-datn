'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/store/useChatStore';

export function useChatWidget() {
  const { 
    isOpen, setIsOpen, 
    unreadCount, resetUnread,
    messages, addMessage, updateLastMessage, clearMessages, setMessageRating
  } = useChatStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [localInput, setLocalInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleCloseAndClear = () => {
    clearMessages();
    setSelectedImage(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    setIsOpen(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedInput = localInput.trim();
    if ((!trimmedInput && !selectedImage) || isLoading) return;
    
    const newMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: localInput,
      image: selectedImage || undefined
    };

    addMessage(newMessage);
    setLocalInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
      if (baseUrl.includes('127.0.0.1')) {
        baseUrl = baseUrl.replace('127.0.0.1', 'localhost');
      }
      
      const fetchUrl = `${baseUrl}/ai/chat`;
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/plain',
        },
        body: JSON.stringify({ 
          messages: [...messages, newMessage], 
          image: selectedImage 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader found');

      const assistantId = (Date.now() + 1).toString();
      let accumulatedContent = '';
      
      // Thêm tin nhắn trống của assistant để stream vào
      addMessage({ id: assistantId, role: 'assistant', content: '' });

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;
        
        // Cập nhật nội dung đang stream vào tin nhắn cuối cùng
        updateLastMessage(accumulatedContent);
      }
    } catch (error: any) {
      console.error('❌ [handleSendMessage Error]:', error);
      addMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ Lỗi kết nối: ${error.message}. Vui lòng thử lại sau.`,
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Đợi một chút để DOM kịp render tin nhắn rồi mới cuộn
      setTimeout(scrollToBottom, 50);
    }
  }, [isOpen, messages, isLoading]);

  useEffect(() => {
    if (isOpen) resetUnread();
  }, [isOpen, resetUnread]);

  return {
    isOpen,
    setIsOpen,
    unreadCount,
    resetUnread,
    messages,
    addMessage,
    updateLastMessage,
    clearMessages,
    setMessageRating,
    scrollRef,
    imageInputRef,
    localInput,
    setLocalInput,
    selectedImage,
    setSelectedImage,
    isLoading,
    handleImageClick,
    handleImageChange,
    removeImage,
    handleCloseAndClear,
    handleSendMessage,
  };
}
