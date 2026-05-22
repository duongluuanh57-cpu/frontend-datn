'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/navigation';
import type { BlogPost } from '@/data/blog-posts';

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

export function BlogCard({ post, index }: BlogCardProps) {
  const locale = useLocale();
  const lang = locale === 'vi' ? 'vi' : 'en';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col h-full bg-transparent overflow-hidden"
    >
      <div className="product-image-frame aspect-[4/3] w-full flex-shrink-0 relative overflow-hidden bg-[#7A5C5C]/3 rounded-xl">
        <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10 block">
          <div className="w-full h-full transition-transform duration-[1200ms] ease-out group-hover:scale-105">
            <Image
              src={post.image}
              alt={post.title[lang]}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        </Link>
        <div className="absolute left-4 top-4 z-20">
          <div className="px-4 py-1.5 text-[8px] font-bold tracking-wider bg-white/70 rounded-full text-[#7A5C5C]">
            {post.category[lang]}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-[#7A5C5C]/50 text-[9px] font-bold uppercase tracking-wider mb-2">
          <div className="flex items-center gap-1">
            <Calendar size={10} className="text-[#D4A5A5]" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={10} className="text-[#D4A5A5]" />
            <span>{post.readTime[lang]}</span>
          </div>
        </div>

        <Link href={`/blog/${post.slug}`} className="block mb-2">
          <h3 className="text-sm lg:text-base font-medium text-[#7A5C5C] hover:text-[#D4A5A5] transition-colors duration-300 line-clamp-2 leading-snug">
            {post.title[lang]}
          </h3>
        </Link>

        <p className="text-[11px] leading-relaxed text-[#7A5C5C]/65 font-medium line-clamp-2 mb-3">
          {post.excerpt[lang]}
        </p>

        <Link
          href={`/blog/${post.slug}`}
          className="mt-auto inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#7A5C5C] hover:text-[#D4A5A5] transition-colors duration-300"
        >
          <span>{locale === 'vi' ? 'Đọc tiếp' : 'Read More'}</span>
          <ArrowRight size={10} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}
