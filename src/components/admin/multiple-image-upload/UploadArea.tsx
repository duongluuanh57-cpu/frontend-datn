'use client';

import React from 'react';
import { UploadCloud } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UploadAreaProps {
  disabled?: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadArea({ disabled, onFileSelect }: UploadAreaProps) {
  const t = useTranslations('Admin.upload');

  return (
    <label className="admin-upload__dropzone">
      <span className="admin-upload__dropzone-icon">
        <UploadCloud size={22} />
      </span>
      <span className="admin-upload__dropzone-title">{t('prompt')}</span>
      <span className="admin-upload__dropzone-hint">{t('hint')}</span>
      <input
        key="image-upload-file-input"
        type="file"
        accept="image/*"
        multiple
        onChange={onFileSelect}
        disabled={disabled}
      />
    </label>
  );
}

interface UrlInputProps {
  disabled?: boolean;
  onUrlSubmit: (url: string) => Promise<void>;
}

export function UrlInput({ disabled, onUrlSubmit }: UrlInputProps) {
  return (
    <div className="admin-upload__url-input-container" style={{ marginTop: '12px' }}>
      <input
        key="image-upload-url-input"
        type="text"
        placeholder="Hoặc dán URL ảnh trực tiếp rồi ấn Enter..."
        className="admin-input"
        style={{
          width: '100%', padding: '10px 14px', fontSize: '0.78rem',
          borderRadius: '10px', border: '1px solid var(--admin-border, rgba(0,0,0,0.08))',
          background: 'var(--admin-bg-secondary, rgba(255,255,255,0.8))'
        }}
        onKeyDown={async (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const target = e.target as HTMLInputElement;
            const url = target.value.trim();
            if (!url) return;
            if (url.startsWith('http://') || url.startsWith('https://')) {
              target.value = '';
              await onUrlSubmit(url);
            }
          }
        }}
        onPaste={async (e) => {
          const pastedText = e.clipboardData.getData('text').trim();
          if (!pastedText) return;
          if (pastedText.startsWith('http://') || pastedText.startsWith('https://')) {
            e.preventDefault();
            const target = e.target as HTMLInputElement;
            target.value = '';
            await onUrlSubmit(pastedText);
          }
        }}
        disabled={disabled}
      />
      <span style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', display: 'block', marginTop: '5px', paddingLeft: '4px', lineHeight: '1.4' }}>
        Nhập link ảnh. Ảnh sẽ được lưu tạm và upload lên R2 khi bấm "Lưu vào bộ sưu tập".
      </span>
    </div>
  );
}