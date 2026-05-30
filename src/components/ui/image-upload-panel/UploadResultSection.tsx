'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { ImgBBUploadResponseData } from '@/lib/api';

function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

interface UploadResultSectionProps {
  result: ImgBBUploadResponseData | null;
}

export function UploadResultSection({ result }: UploadResultSectionProps) {
  const t = useTranslations('Upload');
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const copyUrl = async () => {
    if (!result?.url) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 rounded-xl border border-[var(--accent)] bg-[var(--background)]/40 p-5">
      <p className="text-sm font-semibold text-[var(--content)]">{t('result')}</p>
      <p className="break-all text-xs text-[var(--content)]/90">{result.url}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void copyUrl()}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? t('copied') : t('copy')}
        </button>
        <a href={result.displayUrl} target="_blank" rel="noopener noreferrer"
          className="rounded-lg border border-[var(--accent)] px-4 py-2 text-sm text-[var(--content)]">{t('open')}</a>
      </div>
      <p className="text-xs text-[var(--content)]/75">
        {t('bytesSaved', { original: formatKb(result.originalBytes), compressed: formatKb(result.compressedBytes) })}
      </p>
      {result.thumbUrl ? (
        <div className="pt-2">
          <Image src={result.thumbUrl} alt="" width={160} height={96} className="max-h-24 w-auto rounded-md border border-[var(--accent)]" />
        </div>
      ) : null}
    </div>
  );
}