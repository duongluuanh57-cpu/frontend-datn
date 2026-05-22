'use client';

import React, { useState } from 'react';
import { UploadCloud, X, Loader2, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface MultipleImageUploadProps {
  value: string[]; // Array of image URLs hoặc base64 strings (base64 bắt đầu bằng "data:image")
  onChange: (urls: string[]) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
  maxImages?: number;
  maxWidth?: number;
  quality?: number;
  folder?: string;
}

export function MultipleImageUpload({
  value,
  onChange,
  onUploadStateChange,
  maxImages = 10,
  maxWidth = 1920,
  quality = 90,
  folder
}: MultipleImageUploadProps) {
  const t = useTranslations('Admin.upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const images = value || [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed maxImages
    if (images.length + files.length > maxImages) {
      alert(`Chỉ có thể tải tối đa ${maxImages} ảnh`);
      return;
    }

    setIsUploading(true);
    if (onUploadStateChange) onUploadStateChange(true);

    const newBase64Strings: string[] = [];

    try {
      // Convert each file to base64 (local storage approach)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadingIndex(images.length + i);

        // Convert file to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newBase64Strings.push(base64);
      }

      // Update with all new base64 strings (chưa upload lên R2)
      onChange([...images, ...newBase64Strings]);
    } catch (err) {
      console.error('Convert to base64 failed:', err);
      alert('Không thể xử lý ảnh. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      setUploadingIndex(null);
      if (onUploadStateChange) onUploadStateChange(false);
    }
  };

  const handleUrlUpload = async (url: string) => {
    if (!url.trim()) return;
    if (images.length >= maxImages) {
      alert(`Chỉ có thể tải tối đa ${maxImages} ảnh`);
      return;
    }

    setIsUploading(true);
    if (onUploadStateChange) onUploadStateChange(true);
    setUploadingIndex(images.length);

    try {
      // Lưu URL thẳng vào array (chưa upload lên R2)
      onChange([...images, url.trim()]);
    } catch (err: any) {
      console.error('URL add failed:', err);
      const msg = err.response?.data?.message || 'Không thể thêm URL ảnh này. Vui lòng thử lại.';
      alert(msg);
    } finally {
      setIsUploading(false);
      setUploadingIndex(null);
      if (onUploadStateChange) onUploadStateChange(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const removeAllImages = () => {
    if (confirm('Bạn có chắc muốn xóa tất cả ảnh?')) {
      onChange([]);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    const sourceIndex = Number(e.dataTransfer.getData('text/plain'));
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const rearranged = [...images];
    const [removed] = rearranged.splice(sourceIndex, 1);
    rearranged.splice(targetIndex, 0, removed);
    onChange(rearranged);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="admin-upload__label">
          Hình ảnh sản phẩm ({images.length}/{maxImages})
        </span>
        {images.length > 0 && (
          <button
            type="button"
            onClick={removeAllImages}
            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 size={12} />
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="flex flex-col gap-4 mb-4">
          {/* Main Image (Large focused preview) */}
          <div
            className="admin-upload__preview relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-solid border-[var(--admin-border-subtle)] bg-[var(--admin-surface-muted)] shadow-sm group cursor-grab active:cursor-grabbing"
            style={{
              width: '100%',
              maxWidth: '360px',
              margin: '0 auto',
              aspectRatio: '4/3',
              display: 'block',
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, 0)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 0)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[0]}
              alt="Ảnh chính sản phẩm"
              className="w-full h-full object-cover"
              style={{ width: '100%', height: '100%', maxHeight: 'none', objectFit: 'cover' }}
            />

            {uploadingIndex === 0 ? (
              <div className="admin-upload__overlay absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="admin-loading__spinner animate-spin text-white" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(0)}
                  className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-red-500 shadow-md flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Xóa ảnh chính"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Primary badge for first image */}
            <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] tracking-wider font-bold uppercase px-2.5 py-1 rounded-md shadow-sm z-10">
              Ảnh chính
            </div>
          </div>

          {/* Sub Images (Sub-grid underneath) */}
          {images.length > 1 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wider text-[var(--admin-text-muted)] uppercase">
                  Ảnh phụ / Bộ sưu tập ({images.length - 1})
                </span>
                <span className="text-[10px] text-blue-500 font-medium hidden sm:inline">
                  💡 Kéo thả ảnh để thay đổi thứ tự hiển thị
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                {images.slice(1).map((url, subIndex) => {
                  const actualIndex = subIndex + 1;
                  return (
                    <div
                      key={actualIndex}
                      className="admin-upload__preview relative aspect-square rounded-lg overflow-hidden border border-solid border-[var(--admin-border-subtle)] bg-[var(--admin-surface-muted)] group cursor-grab active:cursor-grabbing"
                      style={{ width: '100%', aspectRatio: '1/1', margin: 0, display: 'block' }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, actualIndex)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, actualIndex)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Ảnh phụ ${actualIndex}`}
                        className="w-full h-full object-cover"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {uploadingIndex === actualIndex ? (
                        <div className="admin-upload__overlay absolute inset-0 flex items-center justify-center bg-black/40">
                          <Loader2 className="admin-loading__spinner animate-spin text-white" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(actualIndex)}
                            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-red-500 shadow-md flex items-center justify-center transition-all hover:scale-110"
                            aria-label={`Xóa ảnh ${actualIndex}`}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
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
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      )}

      {/* URL Input */}
      {images.length < maxImages && (
        <div className="admin-upload__url-input-container" style={{ marginTop: '12px' }}>
          <input
            key="image-upload-url-input"
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
            disabled={isUploading}
          />
          <span style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', display: 'block', marginTop: '5px', paddingLeft: '4px', lineHeight: '1.4' }}>
            Nhập link ảnh. Ảnh sẽ được lưu tạm và upload lên R2 khi bấm "Lưu vào bộ sưu tập".
          </span>
        </div>
      )}
    </div>
  );
}
