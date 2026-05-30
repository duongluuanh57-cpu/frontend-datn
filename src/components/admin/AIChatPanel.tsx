'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatHeader } from './ai-chat-panel/ChatHeader';
import { ChatMessage, TypingIndicator } from './ai-chat-panel/ChatMessage';
import { ChatInput } from './ai-chat-panel/ChatInput';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatPanel({ isOpen, onClose }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Xin chào! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/ai/admin/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: userMessage.content, history: messages.slice(-10) }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');
      const decoder = new TextDecoder();
      let aiContent = '';
      setMessages(prev => [...prev, { role: 'ai', content: '' }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiContent += decoder.decode(value, { stream: true });
        setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'ai', content: aiContent }; return u; });
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu. Vui lòng thử lại sau.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: isOpen ? '360px' : '0',
        background: '#ffffff', boxShadow: 'none',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        borderLeft: isOpen ? '1px solid #f0e9e4' : 'none',
        transition: 'width 0.35s var(--admin-ease, cubic-bezier(0.4, 0, 0.2, 1))',
        zIndex: 40,
      }}
    >
      <ChatHeader onClose={onClose} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput value={input} onChange={setInput} onSend={handleSend} disabled={isLoading} />
    </div>
  );
}