'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/navigation';
import './new-products.css'; // Leverage our optimized luxury CSS styles

interface BlogPost {
  id: string;
  slug: string;
  image: string;
  date: string;
  readTime: { vi: string; en: string };
  category: { vi: string; en: string };
  title: { vi: string; en: string };
  excerpt: { vi: string; en: string };
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'nghe-thuat-luu-huong-bi-quyet-ben-lau',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
    date: '18/05/2026',
    readTime: { vi: '5 phút đọc', en: '5 min read' },
    category: { vi: 'HƯƠNG THƠM HỌC', en: 'SCENT ACADEMY' },
    title: {
      vi: 'Nghệ thuật lưu hương: Bí quyết để hương thơm bền bỉ suốt ngày dài',
      en: 'The Art of Scent: Secrets to Long-Lasting Fragrance All Day Long'
    },
    excerpt: {
      vi: 'Khám phá những vị trí xịt nước hoa đắt giá và bí thuật dưỡng ẩm giúp giữ trọn vẹn nốt hương vương vấn suốt 24 giờ...',
      en: 'Discover the strategic pulse points and deep moisturizing secrets that capture and hold perfume notes for up to 24 hours...'
    }
  },
  {
    id: 'post-2',
    slug: 'top-5-nhom-huong-niche-mua-he',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800',
    date: '15/05/2026',
    readTime: { vi: '4 phút đọc', en: '4 min read' },
    category: { vi: 'XU HƯỚNG', en: 'TRENDS' },
    title: {
      vi: 'Top 5 nhóm hương nước hoa Niche được săn đón nhất mùa hè này',
      en: 'Top 5 Niche Fragrance Families Coveted This Summer'
    },
    excerpt: {
      vi: 'Điểm mặt những tác phẩm mùi hương Niche thanh mát từ cam chanh và muối biển giúp bạn khẳng định phong vị cá nhân...',
      en: 'Revealing the cooling citrus and marine sea salt Niche fragrance masterpieces to define your personal aura this season...'
    }
  },
  {
    id: 'post-3',
    slug: 'hieu-ve-not-huong-dau-giua-cuoi',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
    date: '12/05/2026',
    readTime: { vi: '6 phút đọc', en: '6 min read' },
    category: { vi: 'KHÁM PHÁ', en: 'DISCOVERY' },
    title: {
      vi: 'Hiểu về Nốt Hương: Sự diệu kỳ của Hương Đầu, Hương Giữa và Hương Cuối',
      en: 'Understanding Fragrance Notes: The Magic of Top, Heart, and Base Notes'
    },
    excerpt: {
      vi: 'Hành trình tiến hóa đầy mê hoặc của mùi hương trên làn da và cách các nhà điều chế dệt nên câu chuyện hương sắc...',
      en: 'The captivating evolution of scents on the skin and how master perfumers weave olfactory stories over time...'
    }
  }
];

export function BlogPosts() {
  const locale = useLocale();

  return (
    <section className="blog-posts-section w-full bg-transparent pt-12 pb-12 lg:pt-20 lg:pb-20 overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* Header Section aligned exactly like products */}
        <div className="max-w-[1400px] mx-auto relative mb-16 lg:mb-20 flex flex-col items-center lg:items-start text-center lg:text-left border-b border-[#D4A5A5]/10 pb-8">
          <motion.span
            initial={{ opacity: 0, letterSpacing: '0.2em' }}
            whileInView={{ opacity: 1, letterSpacing: '0.45em' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[10px] font-bold uppercase text-[#D4A5A5]"
          >
            {locale === 'vi' ? "NHẬT KÝ L'ESSENCE" : "L'ESSENCE JOURNAL"}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="mt-4 text-3xl font-medium text-[#7A5C5C] md:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-heading), serif' }}
          >
            {locale === 'vi' ? 'BÀI VIẾT MỚI NHẤT' : 'LATEST JOURNAL'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-3 text-[11px] md:text-xs text-[#7A5C5C] max-w-[480px] font-medium leading-relaxed"
          >
            {locale === 'vi'
              ? 'Khám phá thế giới nước hoa qua những góc nhìn chuyên sâu và nghệ thuật lưu hương.'
              : 'Journey into the olfactory world through professional insights and perfume arts.'}
          </motion.p>
        </div>

        {/* Blog Post Grid matching product catalog constraints */}
        <div className="max-w-[1400px] mx-auto px-[10px] grid grid-cols-1 md:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-col h-full bg-transparent overflow-hidden"
            >
              {/* Image Box with zoom-on-hover */}
              <div 
                className="product-image-frame aspect-[16/10] w-full flex-shrink-0 relative overflow-hidden bg-[#7A5C5C]/3 rounded-2xl cursor-url pointer"
                style={{ cursor: "url('/pointer.png') 0 0, pointer" }}
              >
                <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10 block clickable">
                  <div className="w-full h-full transition-transform duration-[1200ms] ease-out group-hover:scale-105">
                    <Image
                      src={post.image}
                      alt={post.title[locale === 'vi' ? 'vi' : 'en']}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                </Link>
                
                {/* Category tag */}
                <div className="absolute left-4 top-4 z-20">
                  <div className="product-badge-glass px-4 py-1.5 text-[8px] font-bold tracking-wider">
                    {post.category[locale === 'vi' ? 'vi' : 'en']}
                  </div>
                </div>
              </div>

              {/* Text content metadata */}
              <div className="mt-5 flex flex-col flex-1">
                {/* Date and Read time row */}
                <div className="flex items-center gap-4 text-[#7A5C5C]/50 text-[10px] font-bold uppercase tracking-wider mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="stroke-[1.8] text-[#D4A5A5]" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="stroke-[1.8] text-[#D4A5A5]" />
                    <span>{post.readTime[locale === 'vi' ? 'vi' : 'en']}</span>
                  </div>
                </div>

                {/* Article Title */}
                <Link href={`/blog/${post.slug}`} className="block clickable mb-3">
                  <h3 
                    className="text-base lg:text-lg font-medium text-[#7A5C5C] hover:text-[#D4A5A5] transition-colors duration-300 line-clamp-2 leading-snug"
                    style={{ fontFamily: 'var(--font-heading), serif' }}
                  >
                    {post.title[locale === 'vi' ? 'vi' : 'en']}
                  </h3>
                </Link>

                {/* Article Excerpt */}
                <p className="text-[12px] leading-relaxed text-[#7A5C5C]/65 font-medium line-clamp-3 mb-4">
                  {post.excerpt[locale === 'vi' ? 'vi' : 'en']}
                </p>

                {/* Read More link */}
                <Link 
                  href={`/blog/${post.slug}`} 
                  className="mt-auto inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#7A5C5C] hover:text-[#D4A5A5] transition-colors duration-300 clickable"
                >
                  <span>{locale === 'vi' ? 'Đọc tiếp' : 'Read More'}</span>
                  <ArrowRight size={12} className="stroke-[2.2] transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
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
