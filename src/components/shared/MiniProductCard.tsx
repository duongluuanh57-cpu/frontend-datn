'use client';

import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, Heart, ShoppingBag } from 'lucide-react';
import { resolveImageUrl } from '@/lib/api';

export interface MiniProductItem {
  productId: string;
  name: string;
  image?: string;
  brand?: string;
  price: number;
  discount?: number;
  quantity?: number;
  variantSize?: string;
}

interface MiniProductCardProps {
  item: MiniProductItem;
  variant: 'cart' | 'favorite';
  isRemoving?: boolean;
  onRemove: (productId: string, variantSize?: string) => void;
  onQuantityChange?: (productId: string, newQuantity: number, variantSize?: string) => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export function MiniProductCard({ item, variant, isRemoving, onRemove, onQuantityChange }: MiniProductCardProps) {
  const itemKey = item.productId + '-' + (item.variantSize || '50ml');

  return (
    <motion.div
      key={itemKey}
      initial={false}
      animate={{
        opacity: isRemoving ? 0 : 1,
        x: isRemoving ? 100 : 0,
        scale: isRemoving ? 0.9 : 1,
      }}
      transition={{ duration: 0.3 }}
      className="bg-surface rounded-lg p-3 flex gap-3"
    >
      {/* Product Image */}
      <div className="w-16 h-16 bg-white rounded-md overflow-hidden flex-shrink-0 border border-border">
        {item.image ? (
          <img src={resolveImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {variant === 'favorite' ? (
              <Heart className="w-6 h-6 text-text-muted" />
            ) : (
              <ShoppingBag className="w-6 h-6 text-text-muted" />
            )}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 relative">
        <div className="flex justify-between items-start mb-1 pr-8">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-primary line-clamp-2">{item.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {item.variantSize && (
                <span className="text-xs text-text-muted bg-gray-100 px-2 py-0.5 rounded">{item.variantSize}</span>
              )}
              {Number(item.discount || 0) > 0 && (
                <span className="inline-block px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">
                  -{item.discount}%
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onRemove(item.productId, item.variantSize)}
          className="absolute top-0 right-0 p-1 text-text-muted hover:text-red-500 transition-colors flex-shrink-0"
          aria-label="Xóa"
        >
          <Trash2 size={16} />
        </button>

        {item.brand && (
          <p className="text-xs text-text-muted mb-2">{item.brand}</p>
        )}

        <div className="flex items-center justify-between">
          {/* Quantity Controls (cart only) */}
          {variant === 'cart' && onQuantityChange && (
            <div className="flex items-center gap-1">
              <motion.button
                onClick={() => onQuantityChange(item.productId, (item.quantity || 1) - 1, item.variantSize)}
                className="p-1 rounded-md border border-border hover:bg-white transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <Minus size={14} />
              </motion.button>
              <motion.span
                key={item.quantity}
                initial={{ scale: 1.3, color: '#C48B8B' }}
                animate={{ scale: 1, color: 'currentColor' }}
                transition={{ duration: 0.3 }}
                className="w-6 text-center text-sm font-medium"
              >
                {item.quantity}
              </motion.span>
              <motion.button
                onClick={() => onQuantityChange(item.productId, (item.quantity || 1) + 1, item.variantSize)}
                className="p-1 rounded-md border border-border hover:bg-white transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <Plus size={14} />
              </motion.button>
            </div>
          )}

          {/* Price - chỉ hiển thị giá cuối cùng */}
          <div className="text-right">
            <motion.p
              key={item.price * (item.quantity || 1)}
              initial={{ scale: 1.2, color: '#C48B8B' }}
              animate={{ scale: 1, color: '#C48B8B' }}
              transition={{ duration: 0.3 }}
              className="text-sm font-bold text-primary"
            >
              {formatPrice(item.price * (item.quantity || 1))}
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}