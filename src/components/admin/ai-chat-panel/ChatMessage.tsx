'use client';

import React from 'react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export function ChatMessage({ msg }: { msg: Message }) {
  return (
    <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
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
  );
}

export function TypingIndicator() {
  return (
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
  );
}