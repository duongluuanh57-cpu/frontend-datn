'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatFeedbackProps {
  messageId: string;
  imagePath?: string;
  initialRating?: number;
  onRatingSubmit?: (rating: number) => void;
}

export function ChatFeedback({ messageId, imagePath, initialRating, onRatingSubmit }: ChatFeedbackProps) {
  const [rating, setRating] = useState(initialRating || 0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(!!initialRating);

  const handleSubmit = async (selectedRating: number) => {
    setRating(selectedRating);
    setSubmitted(true);
    
    // Logic gửi feedback
    console.log(`[Feedback] Message ${messageId}: ${selectedRating} stars`);
    
    if (onRatingSubmit) onRatingSubmit(selectedRating);

    // Nếu đánh giá thấp (<= 2 sao) và có ảnh, yêu cầu backend xóa cache
    if (selectedRating <= 2 && imagePath) {
      try {
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
        console.log(`[Cache] Requesting cache clear for: ${imagePath}`);
        
        await fetch(`${baseUrl}/ai/cache/clear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imagePath })
        });
      } catch (err) {
        console.error('Failed to clear redis cache', err);
      }
    }
  };

  return (
    <div className="mt-2 px-1">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-[10px] text-[#7A5C5C]/60 font-medium uppercase tracking-wider">
              AI chọn đúng không?
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => handleSubmit(star)}
                  className="transition-transform active:scale-90"
                >
                  <Star 
                    size={14} 
                    className={cn(
                      "transition-colors",
                      (hover || rating) >= star 
                        ? 'fill-[#D4A5A5] text-[#D4A5A5]' 
                        : 'text-[#7A5C5C]/20'
                    )} 
                  />
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[10px] text-[#D4A5A5] font-bold"
          >
            <Check size={12} />
            CẢM ƠN BẠN ĐÃ PHẢN HỒI!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
