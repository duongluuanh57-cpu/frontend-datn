'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';

const DEFAULT_GALLERY = Array.from({ length: 6 }, () => ({
  url: '',
  aspect: 'aspect-[3/4]',
  title: '',
  quote: ''
}));

export function useAdminHomepageGallery() {
  const [galleryVi, setGalleryVi] = useState(DEFAULT_GALLERY);
  const [galleryEn, setGalleryEn] = useState(DEFAULT_GALLERY);
  const [galleryAiLoading, setGalleryAiLoading] = useState<Record<number, boolean>>({});

  const handleGalleryFieldChange = useCallback((
    lang: 'vi' | 'en',
    index: number,
    field: 'url' | 'aspect' | 'title' | 'quote',
    value: string
  ) => {
    if (lang === 'vi') {
      setGalleryVi((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    } else {
      setGalleryEn((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    }
  }, []);

  const handleGalleryImageUpload = useCallback(async (idx: number, newUrl: string) => {
    handleGalleryFieldChange('vi', idx, 'url', newUrl);
    handleGalleryFieldChange('en', idx, 'url', newUrl);
    if (!newUrl) return;

    setGalleryAiLoading((prev) => ({ ...prev, [idx]: true }));
    const loadingToast = toast.loading('AI đang quét và phân tích hình ảnh nghệ thuật...');
    try {
      const response = await api.post('/ai/scan-gallery-image', { imageUrl: newUrl });
      if (response.data?.success && response.data?.data) {
        const { titleVi, quoteVi, titleEn, quoteEn } = response.data.data;
        setGalleryVi((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx], title: titleVi || next[idx].title, quote: quoteVi || next[idx].quote };
          return next;
        });
        setGalleryEn((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx], title: titleEn || next[idx].title, quote: quoteEn || next[idx].quote };
          return next;
        });
        toast.success('AI phân tích ảnh thành công!', { id: loadingToast, duration: 3000 });
      }
    } catch {
      toast.error('Không thể quét ảnh bằng AI.', { id: loadingToast, duration: 4000 });
    } finally {
      setGalleryAiLoading((prev) => ({ ...prev, [idx]: false }));
    }
  }, []);

  const initGallery = useCallback((dbConfig: any) => {
    const dbHasGalleryVi = dbConfig?.galleryVi?.some((img: any) => img?.url?.trim());
    const dbHasGalleryEn = dbConfig?.galleryEn?.some((img: any) => img?.url?.trim());

    if (dbHasGalleryVi) setGalleryVi(dbConfig.galleryVi);
    else {
      try {
        const saved = localStorage.getItem('lessence_custom_homepage_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.gallery?.length > 0) setGalleryVi(parsed.gallery);
        }
      } catch { }
    }

    if (dbHasGalleryEn) setGalleryEn(dbConfig.galleryEn);
    else {
      try {
        const saved = localStorage.getItem('lessence_custom_homepage_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.gallery_en?.length > 0) setGalleryEn(parsed.gallery_en);
        }
      } catch { }
    }
  }, []);

  const resetGallery = useCallback(() => {
    setGalleryVi(DEFAULT_GALLERY);
    setGalleryEn(DEFAULT_GALLERY);
  }, []);

  return {
    galleryVi, setGalleryVi,
    galleryEn, setGalleryEn,
    galleryAiLoading,
    handleGalleryFieldChange,
    handleGalleryImageUpload,
    initGallery,
    resetGallery,
  };
}