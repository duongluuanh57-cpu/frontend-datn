'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';

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

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(errText || `HTTP ${response.status}`);
      }

      // Stream response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let aiContent = '';
      setMessages(prev => [...prev, { role: 'ai', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiContent += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'ai', content: aiContent };
          return updated;
        });
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu. Vui lòng thử lại sau.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: isOpen ? '360px' : '0',
        background: '#ffffff',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderLeft: isOpen ? '1px solid #f0e9e4' : 'none',
        transition: 'width 0.35s var(--admin-ease, cubic-bezier(0.4, 0, 0.2, 1))',
        zIndex: 40,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 'var(--admin-header-h, 64px)',
          padding: '0 20px',
          borderBottom: '1px solid #f0e9e4',
          background: '#ffffff',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#3d2e24' }}>
            Hỗ trợ AI
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#9a857c' }}>
            Trợ lý thông minh cho Admin
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: '#9a857c',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f0e9e4';
            e.currentTarget.style.color = '#3d2e24';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#9a857c';
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? '#7A5C5C' : '#f5f0ed',
                color: msg.role === 'user' ? '#ffffff' : '#3d2e24',
                fontSize: '0.8125rem',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '16px 16px 16px 4px',
                background: '#f5f0ed',
                color: '#9a857c',
                fontSize: '0.8125rem',
              }}
            >
              <span style={{ display: 'inline-flex', gap: '4px' }}>
                <span style={{ animation: 'dotPulse 1.4s infinite', animationDelay: '0s' }}>●</span>
                <span style={{ animation: 'dotPulse 1.4s infinite', animationDelay: '0.2s' }}>●</span>
                <span style={{ animation: 'dotPulse 1.4s infinite', animationDelay: '0.4s' }}>●</span>
              </span>
              <style>{`@keyframes dotPulse { 0%, 60%, 100% { opacity: 0.3; } 30% { opacity: 1; } }`}</style>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #f0e9e4',
          background: '#faf8f6',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end',
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            rows={1}
            style={{
              flex: 1,
              border: '1px solid #e8e0da',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '0.8125rem',
              color: '#3d2e24',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              background: '#ffffff',
              minHeight: '40px',
              maxHeight: '120px',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#D4A5A5';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(212, 165, 165, 0.15)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e8e0da';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onInput={(e) => {
              const target = e.currentTarget;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              border: 'none',
              background: input.trim() && !isLoading ? '#7A5C5C' : '#e8e0da',
              color: input.trim() && !isLoading ? '#ffffff' : '#9a857c',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (input.trim() && !isLoading) {
                e.currentTarget.style.background = '#604444';
              }
            }}
            onMouseLeave={(e) => {
              if (input.trim() && !isLoading) {
                e.currentTarget.style.background = '#7A5C5C';
              }
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}