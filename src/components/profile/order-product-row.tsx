'use client';

import Link from 'next/link';
import { formatPrice } from '@/lib/formatPrice';
import { resolveImageUrl } from '@/lib/api';
import { getProductSlug } from '@/lib/utils';

interface OrderProductRowProps {
  item: any;
}

export function OrderProductRow({ item }: OrderProductRowProps) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="w-16 h-16 rounded-lg bg-foreground/5 border border-border overflow-hidden flex-shrink-0">
        {item.image ? (
          <img
            src={resolveImageUrl(item.image)}
            alt={item.name || ''}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <span className="text-sm font-bold text-primary">
              {item.name?.charAt(0) || '?'}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href={`/product/${getProductSlug(item.name, item.productId)}`}
          className="text-sm font-medium text-text-primary hover:text-primary truncate block"
        >
          {item.name}
        </Link>
        <div className="flex items-center gap-3 mt-1">
          {item.variantSize && (
            <span className="text-sm text-text-muted">{item.variantSize}</span>
          )}
          <span className="text-sm text-text-muted">SL: {item.quantity}</span>
        </div>
      </div>
      <p className="text-lg font-bold text-text-primary flex-shrink-0">
        {formatPrice(item.price * (item.quantity || 1))}
      </p>
    </div>
  );
}
