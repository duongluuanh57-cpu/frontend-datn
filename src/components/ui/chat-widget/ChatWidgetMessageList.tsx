'use client';

import React from 'react';
import { useChatWidget } from './useChatWidget';
import { ChatFeedback } from '../chat-feedback';
import { ChatProductCard } from './ChatProductCard';
import { cn } from '@/lib/utils';

interface ChatWidgetMessageListProps {
  formHelpers: ReturnType<typeof useChatWidget>;
}

export function ChatWidgetMessageList({ formHelpers }: ChatWidgetMessageListProps) {
  const {
    messages,
    isLoading,
    scrollRef,
    setMessageRating
  } = formHelpers;

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
          
          {/* Rating feedback section for AI response */}
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
