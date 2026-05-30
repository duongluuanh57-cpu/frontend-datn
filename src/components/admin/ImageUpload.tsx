'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import { ImagePreview, ImagePlaceholder } from './multiple-image-upload/ImagePreview';
import { UploadArea, UrlInput } from './multiple-image-upload/UploadArea';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
  hideUrlInput?: boolean;
  maxWidth?: number;
  quality?: number;
  folder?: string;
}

export function ImageUpload({ value, onChange, onUploadStateChange, hideUrlInput = false, maxWidth, quality, folder }: ImageUploadProps) {
  const t = useTranslations('Admin.upload');
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');

  useEffect(() => { setPreview(value || ''); }, [value]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    onUploadStateChange?.(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('maxWidth', String(maxWidth ?? 1920));
      formData.append('quality', String(quality ?? 90));
      if (folder) formData.append('folder', folder);
      const { data } = await api.post('/media/upload-r2', formData);
      if (data.success && data.data.url) { onChange(data.data.url); setPreview(data.data.url); }
    } catch (err) {
      console.error('Upload failed:', err);
      alert(t('error'));
      setPreview(value);
    } finally { setIsUploading(false); onUploadStateChange?.(false); }
  };

  const removeImage = () => { setPreview(''); onChange(''); onUploadStateChange?.(false); };

  return (
    <div>
      <span className="admin-upload__label">{t('label')}</span>
      {preview ? (
        <div className="flex flex-col gap-3">
          <ImagePreview src={preview} alt={t('preview')} uploading={isUploading} onRemove={removeImage} size="large" />
          {!hideUrlInput && (
            <div className="admin-upload__url-input-container">
              <input type="text" value={preview} readOnly className="admin-input" style={{ width: '100%', padding: '8px 12px', fontSize: '0.7rem', borderRadius: '8px', border: '1px solid var(--admin-border, rgba(0,0,0,0.08))', background: 'var(--admin-bg-secondary, rgba(255,255,255,0.8))', color: 'var(--admin-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onClick={(e) => (e.target as HTMLInputElement).select()} />
              <span style={{ fontSize: '0.62rem', color: 'var(--admin-text-muted)', display: 'block', marginTop: '3px', paddingLeft: '4px' }}>Đường dẫn ảnh đang lưu. Click để sao chép.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <UploadArea disabled={isUploading} onFileSelect={handleUpload} />
          {!hideUrlInput && <UrlInput disabled={isUploading} onUrlSubmit={async (url) => {
            setIsUploading(true);
            onUploadStateChange?.(true);
            try {
              const { data } = await api.post('/media/upload-url', { url, maxWidth: maxWidth ?? 1920, quality: quality ?? 90, folder });
              if (data.success && data.data.url) { onChange(data.data.url); setPreview(data.data.url); }
            } catch { alert('Không thể tải ảnh từ URL này.'); } finally { setIsUploading(false); onUploadStateChange?.(false); }
          }} />}
        </div>
      )}
    </div>
  );
}