'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface UploadDropzoneProps {
  onFilePicked: (file: File | null) => void;
}

export function UploadDropzone({ onFilePicked }: UploadDropzoneProps) {
  const t = useTranslations('Upload');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0] ?? null;
    if (file && !file.type.startsWith('image/')) return;
    onFilePicked(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="cursor-pointer rounded-xl border-2 border-dashed border-[var(--accent)] bg-[var(--background)]/50 px-6 py-14 text-center transition-colors hover:border-[var(--primary)] hover:bg-[var(--background)]"
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFilePicked(e.target.files?.[0] ?? null)} />
      <p className="font-medium text-[var(--content)]">{t('dropHint')}</p>
      <p className="mt-2 text-xs text-[var(--content)]/70">{t('formats')}</p>
    </div>
  );
}