'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatFeedbackProps {
  messageId: string;
  initialRating?: number;
  onRatingSubmit: (rating: number) => void;
  imagePath?: string;
}

const RATING_LABELS: Record<number, { label: string; emoji: string; color: string }> = {
  5: { label: 'Tuyệt vời!',       emoji: '🌟', color: '#D4A5A5' },
  4: { label: 'Cần cải thiện',    emoji: '🙂', color: '#C4A882' },
  3: { label: 'Tạm được',         emoji: '😐', color: '#A0A0B0' },
  2: { label: 'Tệ',               emoji: '😕', color: '#B07070' },
  1: { label: 'Rất tệ',           emoji: '😞', color: '#9B4040' },
};

export function ChatFeedback({ messageId, initialRating, onRatingSubmit, imagePath }: ChatFeedbackProps) {
  const [hovered, setHovered]   = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<number | null>(initialRating ?? null);
  const [aiReply, setAiReply]   = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Called when user clicks a star
  const handleRate = async (rating: number) => {
    if (submitted !== null) return; // already rated

    setSubmitted(rating);
    onRatingSubmit(rating);
    setIsLoading(true);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/ai/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/plain' },
        body: JSON.stringify({ messageId, rating }),
      });

      if (!res.ok) throw new Error('Failed to fetch AI feedback response');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setAiReply(full); // stream into UI live
      }
    } catch {
      // Fallback: just show the label without streaming
    } finally {
      setIsLoading(false);
    }
  };

  const activeRating = submitted ?? hovered;

  return (
    <div className="chat-feedback-wrapper">
      {/* Star Row */}
      <div
        className="chat-feedback-stars"
        onMouseLeave={() => !submitted && setHovered(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            disabled={submitted !== null}
            className="chat-feedback-star-btn"
            onMouseEnter={() => !submitted && setHovered(star)}
            onClick={() => handleRate(star)}
            whileHover={submitted === null ? { scale: 1.25, y: -2 } : {}}
            whileTap={submitted === null ? { scale: 0.9 }  : {}}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              size={14}
              className="chat-feedback-star-icon"
              style={{
                fill:
                  activeRating !== null && star <= activeRating
                    ? (RATING_LABELS[activeRating]?.color ?? '#D4A5A5')
                    : 'transparent',
                stroke:
                  activeRating !== null && star <= activeRating
                    ? (RATING_LABELS[activeRating]?.color ?? '#D4A5A5')
                    : 'rgba(122,92,92,0.3)',
                transition: 'fill 0.15s, stroke 0.15s',
              }}
            />
          </motion.button>
        ))}

        {/* Label shown on hover / after submission */}
        <AnimatePresence mode="wait">
          {activeRating !== null && (
            <motion.span
              key={activeRating}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 4 }}
              className="chat-feedback-label"
              style={{ color: RATING_LABELS[activeRating]?.color }}
            >
              {RATING_LABELS[activeRating]?.emoji} {RATING_LABELS[activeRating]?.label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* AI adaptive reply (streamed) */}
      <AnimatePresence>
        {submitted !== null && (isLoading || aiReply) && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="chat-feedback-ai-reply"
            style={{ borderColor: RATING_LABELS[submitted]?.color + '40' }}
          >
            {isLoading && !aiReply ? (
              <span className="chat-feedback-typing">
                <span /><span /><span />
              </span>
            ) : (
              <span className="chat-feedback-ai-text">{aiReply}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
