'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Sparkles } from 'lucide-react';
import { Link } from '@/navigation';
import { resolveImageUrl } from '@/lib/api';
import Image from 'next/image';
import { type ProductData } from '../product-card';

interface ChatProductCardProps {
  product: ProductData | null;
  loading?: boolean;
}

export function ChatProductCard({ product, loading }: ChatProductCardProps) {
  if (loading) return (
    <div className="w-full aspect-[4/5] animate-pulse bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
      <Sparkles size={12} className="text-[#D4A5A5] animate-spin" />
    </div>
  );
  if (!product) return null;

  return (
    <Link href={`/product/${product._id}`}>
      <motion.div 
        whileHover={{ y: -4, boxShadow: "0 10px 20px -10px rgba(122,92,92,0.3)" }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full flex flex-col overflow-hidden bg-white rounded-2xl border border-[#7A5C5C]/10 cursor-pointer transition-all shadow-sm"
      >
        <div className="relative aspect-square overflow-hidden bg-neutral-50 flex items-center justify-center">
          {product.image && product.image.trim() !== "" ? (
            <Image
              src={resolveImageUrl(product.image)}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 hover:scale-110"
            />
          ) : (
            <ImageIcon size={20} className="text-neutral-200" />
          )}
        </div>
        <div className="p-2.5 flex flex-col gap-0.5">
          <h4 className="text-[10px] font-bold text-[#5D4040] line-clamp-1 leading-tight">{product.name}</h4>
          <p className="text-[10px] font-black text-[#D4A5A5]">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
