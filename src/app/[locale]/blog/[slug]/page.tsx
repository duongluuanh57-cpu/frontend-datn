import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { BLOG_POSTS } from '@/data/blog-posts';
import { BlogDetail } from './BlogDetail';

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return <BlogDetail post={post} />;
}
