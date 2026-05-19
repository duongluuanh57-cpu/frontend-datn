'use client';

import React, { useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';

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

  React.useEffect(() => {
    setPreview(value || '');
  }, [value]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setIsUploading(true);
    if (onUploadStateChange) onUploadStateChange(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      if (maxWidth != null) formData.append('maxWidth', String(maxWidth));
      else formData.append('maxWidth', '1920');
      if (quality != null) formData.append('quality', String(quality));
      else formData.append('quality', '90');
      if (folder) formData.append('folder', folder);

      const { data } = await api.post('/media/upload-imgbb', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success && data.data.url) {
        onChange(data.data.url);
        setPreview(data.data.url);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert(t('error'));
      setPreview(value);
    } finally {
      setIsUploading(false);
      if (onUploadStateChange) onUploadStateChange(false);
    }
  };

  const handleUrlUpload = async (url: string) => {
    if (!url.trim()) return;
    setIsUploading(true);
    if (onUploadStateChange) onUploadStateChange(true);
    setPreview(url); // Show temporary loading preview

    try {
      const { data } = await api.post('/media/upload-url', {
        url: url.trim(),
        maxWidth: maxWidth ?? 1920,
        quality: quality ?? 90,
        folder
      });

      if (data.success && data.data.url) {
        onChange(data.data.url);
        setPreview(data.data.url);
      }
    } catch (err: any) {
      console.error('URL upload failed:', err);
      const msg = err.response?.data?.message || 'Không thể tải hoặc xử lý ảnh từ URL này. Vui lòng thử lại.';
      alert(msg);
      setPreview(value);
    } finally {
      setIsUploading(false);
      if (onUploadStateChange) onUploadStateChange(false);
    }
  };

  const removeImage = () => {
    setPreview('');
    onChange('');
    if (onUploadStateChange) onUploadStateChange(false);
  };

  return (
    <div>
      <span className="admin-upload__label">{t('label')}</span>

      {preview ? (
        <div className="flex flex-col gap-3">
          <div className="admin-upload__preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={t('preview')} />

            {isUploading ? (
              <div className="admin-upload__overlay">
                <Loader2 className="admin-loading__spinner" />
              </div>
            ) : (
              <div className="admin-upload__remove">
                <button
                  type="button"
                  onClick={removeImage}
                  className="admin-upload__remove-btn"
                  aria-label={t('remove')}
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Read-only URL box to inspect/copy the link */}
          {!hideUrlInput && (
            <div className="admin-upload__url-input-container">
              <input
                key="image-preview-readonly-url"
                type="text"
                value={preview || ''}
                readOnly
                className="admin-input"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.7rem', borderRadius: '8px', border: '1px solid var(--admin-border, rgba(0,0,0,0.08))', background: 'var(--admin-bg-secondary, rgba(255,255,255,0.8))', color: 'var(--admin-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <span style={{ fontSize: '0.62rem', color: 'var(--admin-text-muted)', display: 'block', marginTop: '3px', paddingLeft: '4px' }}>
                Đường dẫn ảnh đang lưu. Click vào ô trên để bôi đen và sao chép.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
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
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>

          {/* Direct URL input */}
          {!hideUrlInput && (
            <div className="admin-upload__url-input-container">
              <input
                key="image-upload-direct-url-input"
                type="text"
                placeholder="Hoặc dán URL ảnh trực tiếp rồi ấn Enter..."
                className="admin-input"
                style={{ width: '100%', padding: '10px 14px', fontSize: '0.78rem', borderRadius: '10px', border: '1px solid var(--admin-border, rgba(0,0,0,0.08))', background: 'var(--admin-bg-secondary, rgba(255,255,255,0.8))' }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const target = e.target as HTMLInputElement;
                    const url = target.value.trim();
                    if (!url) return;
                    if (url.startsWith('http://') || url.startsWith('https://')) {
                      target.value = '';
                      await handleUrlUpload(url);
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
                    await handleUrlUpload(pastedText);
                  }
                }}
                onBlur={async (e) => {
                  const url = e.target.value.trim();
                  if (!url) return;
                  if (isUploading) return;
                  if (url.startsWith('http://') || url.startsWith('https://')) {
                    const target = e.target as HTMLInputElement;
                    target.value = '';
                    await handleUrlUpload(url);
                  }
                }}
                disabled={isUploading}
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', display: 'block', marginTop: '5px', paddingLeft: '4px', lineHeight: '1.4' }}>
                Nhập link ảnh ngoài. Hệ thống sẽ tự động tải về, nén tối ưu bằng Sharp, rồi đồng bộ lên ImgBB cho bạn.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
