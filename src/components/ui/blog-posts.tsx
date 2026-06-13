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
    <section className="blog-posts-section mx-[calc(2rem+40px)] w-[calc(100%-4rem-80px)] bg-transparent pt-12 pb-12 lg:pt-20 lg:pb-20 overflow-hidden"
      style={{ contain: 'content', contentVisibility: 'auto' } as React.CSSProperties}>
      <div>
        
        {/* Header Section aligned exactly like products */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative mb-16 lg:mb-20 flex flex-col items-center lg:items-start text-center lg:text-left border-b border-[#D4A5A5]/10 pb-8"
        >
          <span className="text-[10px] font-bold uppercase text-[#D4A5A5]">
            {locale === 'vi' ? "NHẬT KÝ L'ESSENCE" : "L'ESSENCE JOURNAL"}
          </span>
          <h2 className="mt-4 text-[30px] font-medium text-[#7A5C5C]"
            style={{ fontFamily: 'var(--font-heading), serif' }}>
            {locale === 'vi' ? 'Bài viết mới nhất' : 'Latest Journal'}
          </h2>
          <p className="mt-3 text-[15px] text-[#7A5C5C] max-w-[480px] font-medium leading-relaxed">
            {locale === 'vi'
              ? 'Bài viết về nước hoa, mẹo chọn hương và phong cách sống.'
              : 'Articles about fragrances, scent tips and lifestyle.'}
          </p>
        </motion.div>

        {/* Blog Post Grid matching product catalog constraints */}
        <div className="px-[10px] grid grid-cols-1 md:grid-cols-3 gap-5">
          {BLOG_POSTS.slice(0, 3).map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>

        {/* View All Button matched exactly with e-commerce look */}
        <div className="mt-12 flex flex-col items-center">
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
