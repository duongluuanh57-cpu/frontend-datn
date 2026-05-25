'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Sparkles } from 'lucide-react';
import { Link } from '@/navigation';
import { resolveImageUrl } from '@/lib/api';
import Image from 'next/image';
import { type ProductData } from '../product-card';

interface ChatProductCardProps {
  productId: string;
}

export function ChatProductCard({ productId }: ChatProductCardProps) {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api';
        const res = await fetch(`${backendUrl}/products/${productId}`);
        const json = await res.json();
        if (json.success) setProduct(json.data);
      } catch (err) {
        console.error('Failed to fetch product for chat card', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  if (loading) return (
    <div className="w-full aspect-[4/5] animate-pulse bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
      <Sparkles size={12} className="text-[#D4A5A5] animate-spin" />
    </div>
  );
  if (!product) return null;

  return (
    <Link href={`/product/${productId}`}>
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
              onError={() => {
                // hide on error handled by parent fallback
              }}
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
