'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useHomepageConfig, ProductCardConfig, DEFAULT_PRODUCT_CARD_CONFIG } from '@/hooks/useHomepageConfig';
import { useHomepageTags } from '@/hooks/useHomepageTags';
import type { ProductData } from './types';
import { ProductImage } from './ProductImage';
import { ProductInfo } from './ProductInfo';
import '../new-products.css';

const ASPECT_CLASSES: Record<string, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]'
};

interface ProductCardProps {
  product: ProductData;
  index?: number;
  priority?: boolean;
  configOverride?: ProductCardConfig;
}

export function ProductCard({ product, index = 0, priority = false, configOverride }: ProductCardProps) {
  const t = useTranslations('NewProducts');
  const locale = useLocale();
  const [isFavorite, setIsFavorite] = useState(false);
  const { getTagName } = useHomepageTags();

  const { data: homepageConfig } = useHomepageConfig();
  const cardConfig: ProductCardConfig = configOverride
    ?? homepageConfig?.productCardConfig
    ?? DEFAULT_PRODUCT_CARD_CONFIG;

  const getTagDisplayName = (tag?: string) => {
    if (!tag) return '';
    return getTagName(tag, tag);
  };

  const isDiscountActive = () => {
    if (!product.discountPercentage || product.discountPercentage <= 0) return false;
    if (!product.discountStartDate && !product.discountEndDate) return true;
    const now = new Date();
    if (product.discountStartDate && now < new Date(product.discountStartDate)) return false;
    if (product.discountEndDate && now > new Date(product.discountEndDate)) return false;
    return true;
  };

  const activeDiscount = isDiscountActive();
  const discountedPrice = activeDiscount
    ? product.price * (1 - (product.discountPercentage || 0) / 100)
    : product.price;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: locale === 'vi' ? 'VND' : 'USD',
    }).format(locale === 'vi' ? price : price / 25000);

  const parsedSizes = product.size
    ? product.size.split(',').map((s) => s.trim().split(':')[0].trim()).filter(Boolean)
    : [];

  const aspectClass = ASPECT_CLASSES[cardConfig.imageAspect] ?? 'aspect-square';
  const cardStyle = { borderRadius: `${cardConfig.cardRadius}px` };
  const textAlignClass = cardConfig.textAlign === 'left' ? 'items-start text-left' : 'items-center text-center';

  // Build tag badge from actual product tag
  const tagBadge = (() => {
    if (!product.tag) return null;
    const allTags = product.tag.split(',').map((t) => t.trim()).filter(Boolean);
    const firstTag = allTags[0];
    if (!firstTag) return null;
    return (
      <div className="px-3.5 py-1 text-[9px] font-bold uppercase tracking-wider border border-white/30 shadow-sm rounded-lg"
        style={{ backgroundColor: cardConfig.tagBgColor, color: cardConfig.tagTextColor }}>
        {getTagDisplayName(firstTag)}
      </div>
    );
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="product-card-container group relative flex h-full flex-col"
    >
      {/* Floating Favorite Heart Badge */}
      {isFavorite && (
        <div
          className="floating-favorite-heart absolute -top-2.5 -right-2.5 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-[#D4A5A5] text-white shadow-lg border border-white cursor-pointer clickable"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFavorite(false); }}
        >
          <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className="flex items-center justify-center w-full h-full">
            <Heart size={11} className="fill-current text-white" />
          </motion.div>
        </div>
      )}

      <ProductImage
        product={product}
        isFavorite={isFavorite}
        setIsFavorite={setIsFavorite}
        activeDiscount={activeDiscount}
        discountPercentage={product.discountPercentage}
        tagDisplay={tagBadge}
        aspectClass={aspectClass}
        cardStyle={cardStyle}
        imagePadding={cardConfig.imagePadding}
        priority={priority}
      />

      <ProductInfo
        product={product}
        activeDiscount={activeDiscount}
        discountedPrice={discountedPrice}
        formatPrice={formatPrice}
        parsedSizes={parsedSizes}
        textAlignClass={textAlignClass}
        brandFontSize={cardConfig.brandFontSize}
        nameFontSize={cardConfig.nameFontSize}
        priceFontSize={cardConfig.priceFontSize}
        showKeywords={cardConfig.showKeywords}
        showSizes={cardConfig.showSizes}
        showRating={cardConfig.showRating}
        elementOrder={cardConfig.elementOrder}
      />
    </motion.div>
  );
}

export type { ProductData } from './types';