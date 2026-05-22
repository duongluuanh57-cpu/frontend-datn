'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { BLOG_POSTS } from '@/data/blog-posts';
import { BlogCard } from '@/app/[locale]/blog/components/BlogCard';
import './new-products.css';

export function BlogPosts() {
  const locale = useLocale();

  return (
    <section className="blog-posts-section w-full bg-transparent pt-12 pb-12 lg:pt-20 lg:pb-20 overflow-hidden"
      style={{ contain: 'content', contentVisibility: 'auto' } as React.CSSProperties}>
      <div className="container mx-auto px-6">
        
        {/* Header Section aligned exactly like products */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-[1400px] mx-auto relative mb-16 lg:mb-20 flex flex-col items-center lg:items-start text-center lg:text-left border-b border-[#D4A5A5]/10 pb-8"
        >
          <span className="text-[10px] font-bold uppercase text-[#D4A5A5]">
            {locale === 'vi' ? "NHẬT KÝ L'ESSENCE" : "L'ESSENCE JOURNAL"}
          </span>
          <h2 className="mt-4 text-3xl font-medium text-[#7A5C5C] md:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-heading), serif' }}>
            {locale === 'vi' ? 'BÀI VIẾT MỚI NHẤT' : 'LATEST JOURNAL'}
          </h2>
          <p className="mt-3 text-[11px] md:text-xs text-[#7A5C5C] max-w-[480px] font-medium leading-relaxed">
            {locale === 'vi'
              ? 'Khám phá thế giới nước hoa qua những góc nhìn chuyên sâu và nghệ thuật lưu hương.'
              : 'Journey into the olfactory world through professional insights and perfume arts.'}
          </p>
        </motion.div>

        {/* Blog Post Grid matching product catalog constraints */}
        <div className="max-w-[1400px] mx-auto px-[10px] grid grid-cols-1 md:grid-cols-3 gap-5">
          {BLOG_POSTS.slice(0, 3).map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>

        {/* View All Button matched exactly with e-commerce look */}
        <div className="max-w-[1400px] mx-auto mt-12 flex flex-col items-center">
          <Link href="/blog">
            <button 
              className="explore-all-btn-luxury flex items-center gap-4 focus:outline-none clickable"
              style={{ cursor: "url('/pointer.png') 0 0, pointer" }}
            >
              <span>{locale === 'vi' ? 'Xem tất cả bài viết' : 'View All Articles'}</span>
              <div className="arrow-circle flex h-10 w-10 items-center justify-center rounded-full">
                <ArrowRight size={15} />
              </div>
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
}
