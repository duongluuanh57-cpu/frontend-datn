'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ImagePlus } from 'lucide-react';
import { uploadImageToImgBB } from '@/lib/api';
import { UploadDropzone } from './image-upload-panel/UploadDropzone';
import { ImagePreviewSection } from './image-upload-panel/ImagePreviewSection';
import { UploadResultSection } from './image-upload-panel/UploadResultSection';

export function ImageUploadPanel() {
  const t = useTranslations('Upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [quality, setQuality] = useState(80);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const resetPreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    setResult(null);
    setError(null);
  }, [previewUrl]);

  const pickFile = useCallback((f: File | null) => {
    resetPreview();
    if (!f || !f.type.startsWith('image/')) { setError(t('invalidFile')); return; }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setError(null);
  }, [resetPreview, t]);

  const onSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await uploadImageToImgBB(file, { maxWidth, quality });
      setResult(data);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : t('error'));
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-xl space-y-8 rounded-2xl border border-[var(--accent)] bg-white/80 p-8 shadow-sm backdrop-blur-sm">
      <header className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/30 text-[var(--primary)]">
          <ImagePlus className="h-8 w-8" strokeWidth={1.75} />
        </div>
        <h2 className="text-2xl font-semibold text-[var(--content)]">{t('title')}</h2>
        <p className="mt-2 text-sm text-[var(--content)]/80">{t('subtitle')}</p>
      </header>

      <UploadDropzone onFilePicked={pickFile} />

      <ImagePreviewSection
        previewUrl={previewUrl}
        fileName={file?.name || ''}
        fileSize={file?.size || 0}
        loading={loading}
        onClear={resetPreview}
        onUpload={onSubmit}
        maxWidth={maxWidth}
        quality={quality}
        onMaxWidthChange={setMaxWidth}
        onQualityChange={setQuality}
      />

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700" role="alert">{error}</p>}
      <UploadResultSection result={result} />
    </div>
  );
}