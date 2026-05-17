'use client';

import React, { useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const t = useTranslations('Admin.upload');
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(value);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('maxWidth', '1200');
      formData.append('quality', '80');

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
    }
  };

  const removeImage = () => {
    setPreview('');
    onChange('');
  };

  return (
    <div>
      <span className="admin-upload__label">{t('label')}</span>

      {preview ? (
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
      ) : (
        <label className="admin-upload__dropzone">
          <span className="admin-upload__dropzone-icon">
            <UploadCloud size={22} />
          </span>
          <span className="admin-upload__dropzone-title">{t('prompt')}</span>
          <span className="admin-upload__dropzone-hint">{t('hint')}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
}
