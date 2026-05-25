import { setRequestLocale } from 'next-intl/server';
import { FadeIn } from '@/components/animations/FadeIn';
import { BLOG_POSTS } from '@/data/blog-posts';
import { BlogCard } from './components/BlogCard';

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isVi = locale === 'vi';

  return (
    <main className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <section className="w-full pt-16 pb-8 lg:pt-20 lg:pb-12 overflow-hidden border-b border-[#D4A5A5]/10">
        <div className="max-w-container mx-auto px-6">
          <FadeIn>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4A5A5]">
              L'essence Journal
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-medium text-[#7A5C5C]">
              {isVi ? 'Góc chia sẻ kiến thức' : 'Knowledge Blog'}
            </h1>
            <p className="mt-4 text-sm text-[#7A5C5C]/60 max-w-[600px] font-medium leading-relaxed">
              {isVi
                ? 'Khám phá thế giới nước hoa qua những góc nhìn chuyên sâu và nghệ thuật lưu hương.'
                : 'Journey into the olfactory world through professional insights and perfume arts.'}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="w-full py-12 lg:py-16">
        <div className="max-w-container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {BLOG_POSTS.slice(0, 6).map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
