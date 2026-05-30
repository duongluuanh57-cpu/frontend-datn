'use client';

import React from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        borderTop: '1px solid #f0e9e4',
        background: '#faf8f6',
      }}
    >
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
          onFocus={(e) => { e.currentTarget.style.borderColor = '#D4A5A5'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(212, 165, 165, 0.15)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#e8e0da'; e.currentTarget.style.boxShadow = 'none'; }}
          onInput={(e) => {
            const target = e.currentTarget;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 120) + 'px';
          }}
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          style={{
            border: 'none',
            background: value.trim() && !disabled ? '#7A5C5C' : '#e8e0da',
            color: value.trim() && !disabled ? '#ffffff' : '#9a857c',
            borderRadius: '12px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: value.trim() && !disabled ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { if (value.trim() && !disabled) e.currentTarget.style.background = '#604444'; }}
          onMouseLeave={(e) => { if (value.trim() && !disabled) e.currentTarget.style.background = '#7A5C5C'; }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}