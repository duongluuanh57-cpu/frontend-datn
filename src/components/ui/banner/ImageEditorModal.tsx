'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ImageUpload } from '@/components/admin/ImageUpload';
import Image from 'next/image';

interface ImageEditorModalProps {
  images: string[];
  onClose: () => void;
  onChangeImage: (index: number, url: string) => void;
  maxWidth?: number;
  quality?: number;
  setMaxWidth: (v?: number) => void;
  setQuality: (v?: number) => void;
}

export function ImageEditorModal({
  images,
  onClose,
  onChangeImage,
  maxWidth,
  quality,
  setMaxWidth,
  setQuality
}: ImageEditorModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 10, 8, 0.7)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--admin-surface, #ffffff)',
        border: '1px solid var(--admin-border-subtle, #f0e9e4)',
        borderRadius: '24px',
        padding: '32px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        boxShadow: '0 24px 64px rgba(15, 10, 8, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--admin-border-subtle, #f0e9e4)', paddingBottom: '20px' }} className="flex justify-between w-full">
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--admin-text, #3d2e24)' }}>
              Chỉnh sửa ảnh Slides Trang chủ
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--admin-text-secondary, #6b564c)' }}>
              Tải lên hoặc liên kết các hình ảnh chất lượng cao để làm mới slideshow trang chủ.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text-secondary, #6b564c)' }}>Max W:</label>
              <input 
                type="number" 
                value={maxWidth ?? ''} 
                onChange={(e) => setMaxWidth(e.target.value ? Number(e.target.value) : undefined)} 
                style={{
                  width: '80px',
                  padding: '6px 12px',
                  border: '1px solid var(--admin-border, #e8e0da)',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  background: 'transparent',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text-secondary, #6b564c)' }}>Quality:</label>
              <input 
                type="number" 
                value={quality ?? ''} 
                onChange={(e) => setQuality(e.target.value ? Number(e.target.value) : undefined)} 
                style={{
                  width: '70px',
                  padding: '6px 12px',
                  border: '1px solid var(--admin-border, #e8e0da)',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  background: 'transparent',
                  outline: 'none',
                }}
              />
            </div>
            <button 
              onClick={onClose} 
              style={{
                background: 'var(--admin-accent, #7A5C5C)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 20px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--admin-accent-hover, #644646)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--admin-accent, #7A5C5C)';
              }}
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Content list */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {images.map((img, idx) => (
              <div 
                key={idx} 
                style={{
                  background: 'var(--admin-surface-muted, #faf8f6)',
                  border: '1px solid var(--admin-border-subtle, #f0e9e4)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--admin-accent, #7A5C5C)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  Hình ảnh Slide {idx + 1}
                </div>
                
                <div style={{
                  height: '160px',
                  width: '100%',
                  position: 'relative',
                  borderRadius: '12px',
        overflowY: 'auto',
                  background: 'rgba(255, 255, 255, 0.4)',
                  border: '1px solid var(--admin-border-subtle, #f0e9e4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {img ? (
                    <Image
                      src={img}
                      alt={`Slide ${idx + 1}`}
                      fill
                      sizes="200px"
                      className="object-cover"
                      style={{ transition: 'transform 0.3s' }}
                    />
                  ) : (
                    <div className="text-[11px] text-[#A68F81] font-medium flex flex-col items-center gap-2 select-none">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      Chưa có hình ảnh
                    </div>
                  )}
                </div>
                
                <ImageUpload
                  value={img}
                  onChange={(url) => onChangeImage(idx, url)}
                  hideUrlInput={false}
                  maxWidth={maxWidth}
                  quality={quality}
                  folder="image"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
