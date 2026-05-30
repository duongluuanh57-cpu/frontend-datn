'use client';

import React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ImagePreviewSectionProps {
  previewUrl: string | null;
  fileName: string;
  fileSize: number;
  loading: boolean;
  onClear: () => void;
  onUpload: () => void;
  maxWidth: number;
  quality: number;
  onMaxWidthChange: (v: number) => void;
  onQualityChange: (v: number) => void;
}

function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function ImagePreviewSection({
  previewUrl, fileName, fileSize, loading, onClear, onUpload,
  maxWidth, quality, onMaxWidthChange, onQualityChange
}: ImagePreviewSectionProps) {
  const t = useTranslations('Upload');

  if (!previewUrl) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <img src={previewUrl} alt="" className="max-h-56 max-w-full rounded-lg object-contain shadow-md" />
      </div>
      <p className="text-center text-xs text-[var(--content)]/70">{fileName} · {formatKb(fileSize)}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-[var(--content)]">{t('maxWidth')}</span>
          <input type="number" min={320} max={4096} value={maxWidth}
            onChange={(e) => onMaxWidthChange(Number(e.target.value) || 1920)}
            className="rounded-lg border border-[var(--accent)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)]" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-[var(--content)]">{t('quality')}</span>
          <input type="number" min={40} max={100} value={quality}
            onChange={(e) => onQualityChange(Number(e.target.value) || 80)}
            className="rounded-lg border border-[var(--accent)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)]" />
        </label>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" disabled={loading} onClick={onUpload}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-md transition-opacity disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? t('uploading') : t('upload')}
        </button>
        <button type="button" onClick={onClear}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--accent)] px-4 py-3 text-sm text-[var(--content)]">
          <Trash2 className="h-4 w-4" /> {t('clear')}
        </button>
      </div>
    </div>
  );
}