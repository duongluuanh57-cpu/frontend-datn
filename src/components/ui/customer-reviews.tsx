'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Star, Quote } from 'lucide-react';
import Image from 'next/image';

const REVIEWS = [
  {
    id: 1,
    name: "Lê Ngọc Hân",
    role: "Verified Buyer",
    content: "Mùi hương rất dễ chịu và giữ được lâu trên da. Đóng gói cẩn thận, giao hàng nhanh.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d"
  },
  {
    id: 2,
    name: "Hoàng Minh Tuấn",
    role: "Fragrance Enthusiast",
    content: "Đã thử nhiều dòng niche nhưng bộ sưu tập mới của L'essence thực sự ấn tượng. Hương thơm độc đáo và lưu hương tốt.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
  },
  {
    id: 3,
    name: "Phạm Thanh Thủy",
    role: "Verified Buyer",
    content: "Giao hàng siêu nhanh, hộp đóng gói rất đẹp. Sẽ ủng hộ dài dài.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=a04258a2462d826712d"
  }
];

export function CustomerReviews() {
  const t = useTranslations('Index');

  return (
    <section className="mx-[calc(2rem+40px)] w-[calc(100%-4rem-80px)] py-12 lg:py-20 relative overflow-hidden bg-[var(--background)]"
      style={{ contain: 'content', contentVisibility: 'auto' } as React.CSSProperties}>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-20"></div>

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[var(--primary)] uppercase tracking-[0.2em] text-xs font-semibold mb-3">
            Testimonials
          </p>
          <h2 className="font-body text-4xl md:text-5xl text-[var(--content)] mb-6 tracking-wide font-light">
            Câu Chuyện Khách Hàng
          </h2>
          <div className="w-16 h-[1px] bg-[var(--primary)] mx-auto opacity-50"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white/50 p-6 rounded-xl border border-[var(--accent)] border-opacity-20 relative"
            >
              <Quote className="absolute top-5 right-5 text-[var(--primary)] opacity-10 w-10 h-10 transform -scale-x-100" />

              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[var(--primary)] text-[var(--primary)]" />
                ))}
              </div>

              <p className="font-body text-[var(--content)] leading-relaxed font-light mb-6 italic text-sm md:text-base">
                "{review.content}"
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[var(--background)]">
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-body text-[var(--content)] font-medium text-sm">
                    {review.name}
                  </h4>
                  <p className="font-body text-[var(--primary)] text-xs tracking-wider uppercase mt-0.5">
                    {review.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
