'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChatWidget } from './useChatWidget';
import { ChatFeedback } from '../chat-feedback';
import { ChatProductCard } from './ChatProductCard';
import { cn } from '@/lib/utils';
import { type ProductData } from '../product-card';

interface ChatWidgetMessageListProps {
  formHelpers: ReturnType<typeof useChatWidget>;
}

const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api';

export function ChatWidgetMessageList({ formHelpers }: ChatWidgetMessageListProps) {
  const {
    messages,
    isLoading,
    scrollRef,
    setMessageRating
  } = formHelpers;

  const [productMap, setProductMap] = useState<Record<string, ProductData>>({});
  const [loadingCards, setLoadingCards] = useState(false);
  const prevCardIdsRef = useRef('');

  const extractCardIds = (content: string): string[] => {
    const cardRegex = /\[CARD:([a-f\d]{24})\]/g;
    const ids: string[] = [];
    let match;
    while ((match = cardRegex.exec(content)) !== null) {
      ids.push(match[1]);
    }
    return ids;
  };

  const allCardIds = messages
    .filter(m => m.role === 'assistant')
    .flatMap(m => extractCardIds(m.content));

  const cardIdsKey = allCardIds.join(',');

  useEffect(() => {
    if (!allCardIds.length) return;
    if (cardIdsKey === prevCardIdsRef.current) return;
    prevCardIdsRef.current = cardIdsKey;

    let cancelled = false;
    setLoadingCards(true);

    (async () => {
      try {
        const res = await fetch(`${backendUrl}/products/bulk?ids=${allCardIds.join(',')}`);
        const json = await res.json();
        if (cancelled) return;
        if (json.success && Array.isArray(json.data)) {
          const map: Record<string, ProductData> = {};
          json.data.forEach((p: ProductData) => { map[p._id] = p; });
          setProductMap(map);
        }
      } catch (err) {
        console.error('Failed to bulk fetch products', err);
      } finally {
        if (!cancelled) setLoadingCards(false);
      }
    })();

    return () => { cancelled = true; };
  }, [cardIdsKey]);

  const renderMessageContent = (content: string) => {
    const cardIds = extractCardIds(content);
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
              <ChatProductCard
                key={`${id}-${i}`}
                product={productMap[id] ?? null}
                loading={loadingCards && !productMap[id]}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chat-messages-elite" ref={scrollRef}>
      {messages.map((msg, index) => (
        <div key={msg.id} className={cn("message-wrapper", msg.role === 'user' ? 'user' : 'assistant')}>
          <div className={cn(
            "message-bubble", 
            msg.isError && "error-bubble"
          )}>
            {msg.image && (
              <img src={msg.image} alt="uploaded" className="shadow-sm" />
            )}
            {renderMessageContent(msg.content)}
          </div>
          
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
  );
}
