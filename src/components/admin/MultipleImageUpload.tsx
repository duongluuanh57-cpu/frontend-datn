'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import { ImagePreview } from './multiple-image-upload/ImagePreview';
import { UploadArea, UrlInput } from './multiple-image-upload/UploadArea';

interface MultipleImageUploadProps {
  value: string[];
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
}: MultipleImageUploadProps) {
  const t = useTranslations('Admin.upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const images = value || [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (images.length + files.length > maxImages) {
      alert(`Chỉ có thể tải tối đa ${maxImages} ảnh`);
      return;
    }
    setIsUploading(true);
    onUploadStateChange?.(true);
    const newBase64Strings: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadingIndex(images.length + i);
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newBase64Strings.push(base64);
      }
      onChange([...images, ...newBase64Strings]);
    } catch (err) {
      console.error('Convert to base64 failed:', err);
      alert('Không thể xử lý ảnh. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      setUploadingIndex(null);
      onUploadStateChange?.(false);
    }
  };

  const handleUrlUpload = async (url: string) => {
    if (!url.trim()) return;
    if (images.length >= maxImages) {
      alert(`Chỉ có thể tải tối đa ${maxImages} ảnh`);
      return;
    }
    setIsUploading(true);
    onUploadStateChange?.(true);
    setUploadingIndex(images.length);
    try {
      onChange([...images, url.trim()]);
    } catch (err: any) {
      console.error('URL add failed:', err);
      alert(err.response?.data?.message || 'Không thể thêm URL ảnh này. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      setUploadingIndex(null);
      onUploadStateChange?.(false);
    }
  };

  const deleteFromR2 = async (url: string) => {
    if (url.startsWith('data:')) return;
    try { await api.delete('/media/delete', { data: { url } }); }
    catch (err) { console.error('[MultipleImageUpload] Xóa ảnh trên R2 thất bại:', err); }
  };

  const removeImage = async (index: number) => {
    await deleteFromR2(images[index]);
    onChange(images.filter((_, i) => i !== index));
  };

  const removeAllImages = async () => {
    if (!confirm('Bạn có chắc muốn xóa tất cả ảnh?')) return;
    const r2Urls = images.filter((u) => !u.startsWith('data:') && u.trim());
    if (r2Urls.length > 0) {
      try { await api.delete('/media/delete-folder', { data: { urls: r2Urls } }); }
      catch (err) { console.error('[MultipleImageUpload] Xóa folder trên R2 thất bại:', err); }
    }
    onChange([]);
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
          <button type="button" onClick={removeAllImages} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
            <Trash2 size={12} /> Xóa tất cả
          </button>
        )}
      </div>

      {images.length > 0 && (
        <div className="flex flex-col gap-4 mb-4">
          {/* Main Image */}
          <ImagePreview
            src={images[0]}
            alt="Ảnh chính sản phẩm"
            isMain
            uploading={uploadingIndex === 0}
            size="large"
            onRemove={() => removeImage(0)}
            onDragStart={(e) => handleDragStart(e, 0)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 0)}
          />

          {/* Sub Images */}
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
                    <ImagePreview
                      key={actualIndex}
                      src={url}
                      alt={`Ảnh phụ ${actualIndex}`}
                      uploading={uploadingIndex === actualIndex}
                      onRemove={() => removeImage(actualIndex)}
                      onDragStart={(e) => handleDragStart(e, actualIndex)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, actualIndex)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {images.length < maxImages && <UploadArea disabled={isUploading} onFileSelect={handleUpload} />}
      {images.length < maxImages && <UrlInput disabled={isUploading} onUrlSubmit={handleUrlUpload} />}
    </div>
  );
}