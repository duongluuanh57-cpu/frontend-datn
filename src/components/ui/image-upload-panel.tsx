'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ImagePlus, Loader2, Copy, Check, Trash2 } from 'lucide-react';
import { uploadImageToImgBB, type ImgBBUploadResponseData } from '@/lib/api';

function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function ImageUploadPanel() {
  const t = useTranslations('Upload');
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [quality, setQuality] = useState(80);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImgBBUploadResponseData | null>(null);
  const [copied, setCopied] = useState(false);

  const resetPreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [previewUrl]);

  const pickFile = useCallback((f: File | null) => {
    resetPreview();
    if (!f || !f.type.startsWith('image/')) {
      setError(t('invalidFile'));
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setError(null);
  }, [resetPreview, t]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      pickFile(e.dataTransfer.files[0] ?? null);
    },
    [pickFile]
  );

  const onSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const data = await uploadImageToImgBB(file, { maxWidth, quality });
      setResult(data);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = async () => {
    if (!result?.url) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-xl border-2 border-dashed border-[var(--accent)] bg-[var(--background)]/50 px-6 py-14 text-center transition-colors hover:border-[var(--primary)] hover:bg-[var(--background)]"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
        <p className="font-medium text-[var(--content)]">{t('dropHint')}</p>
        <p className="mt-2 text-xs text-[var(--content)]/70">{t('formats')}</p>
      </div>

      {previewUrl && file && (
        <div className="space-y-4">
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- blob preview */}
            <img
              src={previewUrl}
              alt=""
              className="max-h-56 max-w-full rounded-lg object-contain shadow-md"
            />
          </div>
          <p className="text-center text-xs text-[var(--content)]/70">
            {file.name} · {formatKb(file.size)}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-[var(--content)]">{t('maxWidth')}</span>
              <input
                type="number"
                min={320}
                max={4096}
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value) || 1920)}
                className="rounded-lg border border-[var(--accent)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-[var(--content)]">{t('quality')}</span>
              <input
                type="number"
                min={40}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value) || 80)}
                className="rounded-lg border border-[var(--accent)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </label>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                void onSubmit();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-md transition-opacity disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? t('uploading') : t('upload')}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetPreview();
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--accent)] px-4 py-3 text-sm text-[var(--content)]"
            >
              <Trash2 className="h-4 w-4" />
              {t('clear')}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-4 rounded-xl border border-[var(--accent)] bg-[var(--background)]/40 p-5">
          <p className="text-sm font-semibold text-[var(--content)]">{t('result')}</p>
          <p className="break-all text-xs text-[var(--content)]/90">{result.url}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyUrl()}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? t('copied') : t('copy')}
            </button>
            <a
              href={result.displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[var(--accent)] px-4 py-2 text-sm text-[var(--content)]"
            >
              {t('open')}
            </a>
          </div>
          <p className="text-xs text-[var(--content)]/75">
            {t('bytesSaved', {
              original: formatKb(result.originalBytes),
              compressed: formatKb(result.compressedBytes),
            })}
          </p>
          {result.thumbUrl ? (
            <div className="pt-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote ImgBB */}
              <img src={result.thumbUrl} alt="" className="max-h-24 rounded-md border border-[var(--accent)]" />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
