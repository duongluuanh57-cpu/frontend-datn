import dynamic from 'next/dynamic';
import { setRequestLocale } from 'next-intl/server';
import { HomepageDynamicRenderer } from '@/components/ui/homepage-dynamic-renderer';

const BrandsMarquee = dynamic(
  () => import('@/components/ui/brands-marquee').then((mod) => mod.BrandsMarquee),
  { ssr: true }
);
const SaleProducts = dynamic(
  () => import('@/components/ui/sale-products').then((mod) => mod.SaleProducts),
  { ssr: true }
);
const NewProducts = dynamic(
  () => import('@/components/ui/new-products').then((mod) => mod.NewProducts),
  { ssr: true }
);
const LuxuryGallery = dynamic(
  () => import('@/components/ui/luxury-gallery').then((mod) => mod.LuxuryGallery),
  { ssr: true }
);
const BlogPosts = dynamic(
  () => import('@/components/ui/blog-posts').then((mod) => mod.BlogPosts),
  { ssr: true }
);

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-[80vh] bg-transparent flex flex-col">
      <HomepageDynamicRenderer
        BrandsMarquee={BrandsMarquee}
        SaleProducts={SaleProducts}
        NewProducts={NewProducts}
        LuxuryGallery={LuxuryGallery}
        BlogPosts={BlogPosts}
      />
    </main>
  );
}
