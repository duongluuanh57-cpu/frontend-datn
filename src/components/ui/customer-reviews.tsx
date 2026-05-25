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
    content: "Mùi hương thực sự quá quyến rũ và tinh tế. L'essence luôn mang đến trải nghiệm đẳng cấp từ cách đóng gói đến chất lượng nước hoa bên trong.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d"
  },
  {
    id: 2,
    name: "Hoàng Minh Tuấn",
    role: "Fragrance Enthusiast",
    content: "Đã thử nghiệm rất nhiều dòng niche perfume, nhưng bộ sưu tập mới của L'essence thực sự làm tôi bất ngờ. Độ lưu hương trên da vô cùng hoàn hảo.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
  },
  {
    id: 3,
    name: "Phạm Thanh Thủy",
    role: "Verified Buyer",
    content: "Giao hàng cực kỳ nhanh chóng. Box đẹp như một tác phẩm nghệ thuật. Đây chắc chắn là món quà tuyệt vời nhất để tự thưởng cho bản thân.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=a04258a2462d826712d"
  }
];

export function CustomerReviews() {
  const t = useTranslations('Index'); // Fallback to index if no specific translations exist, or hardcode

  return (
    <section className="py-12 lg:py-20 relative overflow-hidden bg-[var(--background)]"
      style={{ contain: 'content', contentVisibility: 'auto' } as React.CSSProperties}>
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-20"></div>
      
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[var(--primary)] uppercase tracking-[0.2em] text-xs font-semibold mb-3">
            Testimonials
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-[var(--content)] mb-6 tracking-wide font-light">
            Câu Chuyện Khách Hàng
          </h2>
          <div className="w-16 h-[1px] bg-[var(--primary)] mx-auto opacity-50"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="bg-white/40 p-8 rounded-2xl border border-[var(--accent)] border-opacity-30 relative group hover:bg-white/60 transition-all duration-500 shadow-[0_4px_20px_rgba(212,165,165,0.05)] hover:shadow-[0_8px_30px_rgba(212,165,165,0.15)]"
            >
              <Quote className="absolute top-6 right-6 text-[var(--primary)] opacity-20 w-12 h-12 transform -scale-x-100 group-hover:scale-110 transition-transform duration-500" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[var(--primary)] text-[var(--primary)]" />
                ))}
              </div>

              <p className="text-[var(--content)] leading-relaxed font-light mb-8 italic relative z-10 text-sm md:text-base">
                "{review.content}"
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--background)] shadow-sm">
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-[var(--content)] font-medium text-sm">
                    {review.name}
                  </h4>
                  <p className="text-[var(--primary)] text-xs tracking-wider uppercase mt-0.5">
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
