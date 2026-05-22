'use client';

import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/navigation';
import type { BlogPost } from '@/data/blog-posts';

interface BlogDetailProps {
  post: BlogPost;
}

export function BlogDetail({ post }: BlogDetailProps) {
  const locale = useLocale();
  const lang = locale === 'vi' ? 'vi' : 'en';

  return (
    <main className="min-h-screen bg-transparent">
      {/* Back Button */}
      <div className="max-w-[800px] mx-auto px-6 pt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#7A5C5C]/60 hover:text-[#D4A5A5] transition-colors duration-300"
        >
          <ArrowLeft size={14} />
          {locale === 'vi' ? 'Quay lại' : 'Back to Blog'}
        </Link>
      </div>

      {/* Article */}
      <article className="max-w-[800px] mx-auto px-6 py-8 lg:py-12">
        {/* Category */}
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4A5A5]">
          {post.category[lang]}
        </span>

        {/* Title */}
        <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-medium text-[#7A5C5C] leading-tight">
          {post.title[lang]}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-6 mt-6 text-[#7A5C5C]/50 text-[11px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-[#D4A5A5]" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-[#D4A5A5]" />
            <span>{post.readTime[lang]}</span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-8 relative aspect-[16/9] rounded-2xl overflow-hidden bg-[#7A5C5C]/3 border border-[#7A5C5C]/6">
          <Image
            src={post.image}
            alt={post.title[lang]}
            fill
            sizes="(max-width: 800px) 100vw, 800px"
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="mt-10 prose prose-sm max-w-none text-[#7A5C5C]/80 leading-relaxed whitespace-pre-line text-[15px]">
          {post.content[lang]}
        </div>
      </article>

      {/* Divider */}
      <div className="max-w-[800px] mx-auto px-6 pb-12">
        <div className="border-t border-[#D4A5A5]/10" />
      </div>

      {/* Back to bottom */}
      <div className="max-w-[800px] mx-auto px-6 pb-16 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#D4A5A5] hover:text-[#7A5C5C] transition-colors duration-300"
        >
          <ArrowLeft size={14} />
          {locale === 'vi' ? 'Xem tất cả bài viết' : 'View All Articles'}
        </Link>
      </div>
    </main>
  );
}
