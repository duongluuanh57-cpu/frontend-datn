'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import type { ProductCardConfig, BlogCardConfig } from '@/hooks/useHomepageConfig';
import { DEFAULT_PRODUCT_CARD_CONFIG, DEFAULT_BLOG_CARD_CONFIG } from '@/hooks/useHomepageConfig';

export function useAdminHomepageCards() {
  // ── Product Card Config ──
  const [cardConfig, setCardConfig] = useState<ProductCardConfig>(DEFAULT_PRODUCT_CARD_CONFIG);
  const [cardElementOrder, setCardElementOrder] = useState<Array<{ id: string; label: string; show: boolean }>>([
    { id: 'keywords', label: 'Từ khóa / Keywords', show: true },
    { id: 'brand', label: 'Thương hiệu', show: true },
    { id: 'name', label: 'Tên sản phẩm', show: true },
    { id: 'sizes', label: 'Dung tích / Sizes', show: true },
    { id: 'rating', label: 'Đánh giá & Sao', show: true },
    { id: 'price', label: 'Giá bán', show: true },
  ]);

  // ── Blog Card Config ──
  const [blogCardConfig, setBlogCardConfig] = useState<BlogCardConfig>(DEFAULT_BLOG_CARD_CONFIG);
  const [blogElementOrder, setBlogElementOrder] = useState<Array<{ id: string; label: string; show: boolean }>>([
    { id: 'category', label: 'Danh mục / Category', show: true },
    { id: 'date', label: 'Ngày đăng + Giờ đọc', show: true },
    { id: 'title', label: 'Tiêu đề bài viết', show: true },
    { id: 'excerpt', label: 'Đoạn trích', show: true },
    { id: 'readMore', label: 'Nút Đọc tiếp', show: true },
  ]);

  const cardElementSensors = useMemo(() => [
    { sensor: PointerSensor, options: { activationConstraint: { distance: 5 } } },
    { sensor: KeyboardSensor, options: { coordinateGetter: sortableKeyboardCoordinates } }
  ], []);

  const initCards = useCallback((dbConfig: any) => {
    // Product Card
    if (dbConfig?.productCardConfig) {
      const cfg = dbConfig.productCardConfig;
      setCardConfig(cfg);
      if (cfg.elementOrder?.length > 0) {
        setCardElementOrder(prev =>
          cfg.elementOrder.map((id: string) => {
            const existing = prev.find(e => e.id === id);
            return existing
              ? { ...existing, show: id === 'keywords' ? (cfg.showKeywords ?? true) : id === 'sizes' ? (cfg.showSizes ?? true) : id === 'rating' ? (cfg.showRating ?? true) : true }
              : { id, label: id, show: true };
          })
        );
      }
    }
    // Blog Card
    if (dbConfig?.blogCardConfig) {
      const cfg = dbConfig.blogCardConfig;
      setBlogCardConfig(cfg);
      if (cfg.elementOrder?.length > 0) {
        setBlogElementOrder(prev =>
          cfg.elementOrder.map((id: string) => {
            const existing = prev.find(e => e.id === id);
            return existing
              ? { ...existing, show: id === 'category' ? (cfg.showCategory ?? true) : id === 'date' ? true : id === 'readTime' ? (cfg.showReadTime ?? true) : id === 'excerpt' ? (cfg.showExcerpt ?? true) : id === 'readMore' ? (cfg.showReadMore ?? true) : true }
              : { id, label: id, show: true };
          })
        );
      }
    }
  }, []);

  return {
    cardConfig, setCardConfig,
    cardElementOrder, setCardElementOrder,
    cardElementSensors,
    blogCardConfig, setBlogCardConfig,
    blogElementOrder, setBlogElementOrder,
    initCards,
  };
}