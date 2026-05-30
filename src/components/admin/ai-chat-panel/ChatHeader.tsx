'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
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
          border: 'none', background: 'transparent', cursor: 'pointer',
          color: '#9a857c', padding: '8px', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f0e9e4'; e.currentTarget.style.color = '#3d2e24'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9a857c'; }}
      >
        <X size={18} />
      </button>
    </div>
  );
}