'use client';

import { useState, useCallback } from 'react';
import type { ProductSessionLayoutConfig } from '@/hooks/useHomepageConfig';
import { DEFAULT_PRODUCT_SESSION_LAYOUT } from '@/hooks/useHomepageConfig';
import { useProductSessionPreviewStore } from '@/store/useProductSessionPreviewStore';

export function useAdminHomepageLayout() {
  const [productSessionLayout, setProductSessionLayout] = useState<ProductSessionLayoutConfig>(DEFAULT_PRODUCT_SESSION_LAYOUT);

  const initLayout = useCallback((dbConfig: any) => {
    const sessionLayout = dbConfig?.productSessionLayout;
    const isValidLayout = sessionLayout && typeof sessionLayout.columnsDesktop === 'number';
    if (isValidLayout) {
      const merged = {
        ...DEFAULT_PRODUCT_SESSION_LAYOUT,
        ...sessionLayout,
        sessions: {
          ...DEFAULT_PRODUCT_SESSION_LAYOUT.sessions,
          ...(sessionLayout.sessions || {})
        }
      };
      setProductSessionLayout(merged);
      useProductSessionPreviewStore.getState().setSavedConfig(merged);
    } else {
      setProductSessionLayout(DEFAULT_PRODUCT_SESSION_LAYOUT);
      useProductSessionPreviewStore.getState().setSavedConfig(DEFAULT_PRODUCT_SESSION_LAYOUT);
    }
  }, []);

  return {
    productSessionLayout, setProductSessionLayout,
    initLayout,
  };
}