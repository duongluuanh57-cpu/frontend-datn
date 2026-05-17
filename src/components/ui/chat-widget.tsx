'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, X, Send, Sparkles, 
  Minus, Square, Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/useChatStore';
import { ChatFeedback } from './chat-feedback';
import { ProductCard, type ProductData } from './product-card';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';
import './chat-widget.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Component hiển thị sản phẩm thu nhỏ - Có xử lý lỗi ảnh trống
 */
function ChatProductCard({ productId }: { productId: string }) {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api';
        const res = await fetch(`${backendUrl}/products/${productId}`);
        const json = await res.json();
        if (json.success) setProduct(json.data);
      } catch (err) {
        console.error('Failed to fetch product for chat card', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  if (loading) return (
    <div className="w-full aspect-[4/5] animate-pulse bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
      <Sparkles size={12} className="text-[#D4A5A5] animate-spin" />
    </div>
  );
  if (!product) return null;

  return (
    <Link href={`/product/${productId}`}>
      <motion.div 
        whileHover={{ y: -4, boxShadow: "0 10px 20px -10px rgba(122,92,92,0.3)" }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full flex flex-col overflow-hidden bg-white rounded-2xl border border-[#7A5C5C]/10 cursor-pointer transition-all shadow-sm"
      >
        <div className="relative aspect-square overflow-hidden bg-neutral-50 flex items-center justify-center">
          {product.image && product.image.trim() !== "" ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="object-cover w-full h-full transition-transform duration-500 hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <ImageIcon size={20} className="text-neutral-200" />
          )}
        </div>
        <div className="p-2.5 flex flex-col gap-0.5">
          <h4 className="text-[10px] font-bold text-[#5D4040] line-clamp-1 leading-tight">{product.name}</h4>
          <p className="text-[10px] font-black text-[#D4A5A5]">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

export function ChatWidget() {
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
    if (!trimmedInput && !selectedImage || isLoading) return;
    
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

  const renderMessageContent = (content: string) => {
    const cardRegex = /\[CARD:([a-f\d]{24})\]/g;
    const cardIds: string[] = [];
    let match;

    while ((match = cardRegex.exec(content)) !== null) {
      cardIds.push(match[1]);
    }

    const cleanText = content.replace(/\[CARD:[a-f\d]{24}\]/g, '').trim();

    return (
      <div className="flex flex-col gap-2">
        {cleanText && <span className="leading-relaxed text-sm whitespace-pre-wrap">{cleanText}</span>}
        
        {cardIds.length > 0 && (
          <div className={cn(
            "grid gap-3 mt-1",
            cardIds.length === 1 ? "grid-cols-1 max-w-[180px]" : "grid-cols-2"
          )}>
            {cardIds.map((id, i) => (
              <ChatProductCard key={`${id}-${i}`} productId={id} />
            ))}
          </div>
        )}
      </div>
    );
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
                <button onClick={() => setIsOpen(false)} className="window-control-btn">
                  <Minus size={14} />
                </button>
                <button onClick={handleCloseAndClear} className="window-control-btn close">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="chat-content-container relative">
              <div className="chat-messages-elite" ref={scrollRef}>
                {messages.map((msg, index) => (
                  <div key={msg.id} className={cn("message-wrapper", msg.role === 'user' ? 'user' : 'assistant')}>
                    <div className={cn(
                      "message-bubble", 
                      (msg as any).isError && "error-bubble"
                    )}>
                      {(msg as any).image && (
                        <img src={(msg as any).image} alt="uploaded" className="shadow-sm" />
                      )}
                      {renderMessageContent(msg.content)}
                    </div>
                    
                    {/* Phần đánh giá cho AI */}
                    {msg.role === 'assistant' && msg.id !== 'welcome' && !isLoading && (
                      <ChatFeedback 
                        messageId={msg.id} 
                        initialRating={msg.rating}
                        onRatingSubmit={(r) => setMessageRating(msg.id, r)}
                        imagePath={messages.slice(0, index).reverse().find(m => m.role === 'user' && m.image)?.image}
                      />
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="message-wrapper assistant">
                    <div className="message-bubble loading-dots">
                      <span /> <span /> <span />
                    </div>
                  </div>
                )}
              </div>

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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
