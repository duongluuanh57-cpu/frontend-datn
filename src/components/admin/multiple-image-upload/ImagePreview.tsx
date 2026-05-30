'use client';

import React from 'react';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';

interface ImagePreviewProps {
  src: string;
  alt: string;
  isMain?: boolean;
  uploading?: boolean;
  onRemove: () => void;
  size?: 'large' | 'small';
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export function ImagePreview({
  src, alt, isMain, uploading, onRemove, size = 'small',
  onDragStart, onDragOver, onDrop
}: ImagePreviewProps) {
  const aspectClass = size === 'large'
    ? 'w-full max-w-[360px] aspect-[4/3] mx-auto'
    : 'aspect-square w-full';

  return (
    <div
      className={`admin-upload__preview relative ${aspectClass} rounded-xl overflow-hidden border border-solid border-[var(--admin-border-subtle)] bg-[var(--admin-surface-muted)] shadow-sm group cursor-grab active:cursor-grabbing`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={size === 'large' ? '300px' : '150px'}
        className="object-cover"
      />

      {uploading ? (
        <div className="admin-upload__overlay absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 className="admin-loading__spinner animate-spin text-white" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <button
            type="button"
            onClick={onRemove}
            className={`rounded-full bg-white/90 hover:bg-white text-red-500 shadow-md flex items-center justify-center transition-all hover:scale-110 ${size === 'large' ? 'w-9 h-9' : 'w-8 h-8'}`}
            aria-label={`Xóa ảnh ${alt}`}
          >
            <X size={size === 'large' ? 20 : 18} />
          </button>
        </div>
      )}

      {isMain && (
        <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] tracking-wider font-bold uppercase px-2.5 py-1 rounded-md shadow-sm z-10">
          Ảnh chính
        </div>
      )}
    </div>
  );
}

export function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="admin-upload__preview relative w-full aspect-[4/3] max-w-[360px] mx-auto rounded-xl border-2 border-dashed border-[var(--admin-border-subtle)] bg-[var(--admin-surface-muted)] flex items-center justify-center">
      <span className="text-xs text-[var(--admin-text-muted)]">{label}</span>
    </div>
  );
}