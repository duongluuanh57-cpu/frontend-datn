import { Metadata } from 'next';
import { Categories } from '@/components/home/categories';
import { HeroBanner } from '@/components/home/hero-banner';
import { ProductSession } from '@/components/home/product-session';
import { ChatWidget } from '@/components/shared/chat-widget';
import { BrandsMarquee } from '@/components/home/brands-marquee';
import { BrandUsp } from '@/components/home/brand-usp';
import { AboutUs } from '@/components/home/about-us';
import { Footer } from '@/components/layout/footer';
import { SectionReveal } from '@/components/shared/section-reveal';
import { fetchHomepage } from '@/lib/graphql';
import type { GraphQLProduct, GraphQLBrand } from '@/lib/graphql';

// ISR: Revalidate every 300 seconds (5 min) — matches backend GraphQL cache TTL
export const revalidate = 300;

export const metadata: Metadata = {
  title: "L'essence - Nước Hoa Chính Hãng | Giá Tốt",
  description: 'Trải nghiệm hương thơm cao cấp',
};

export default async function HomePage() {
  // Fetch tất cả dữ liệu trang chủ qua 1 GraphQL query
  // Nếu backend không reachable, tự động trả về empty data
  const homepageData = await fetchHomepage();
  const { sale, new: newProducts, hot, limited, standard, brands } = homepageData;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroBanner />
      <Categories />

      {/* Flash Sale — Marquee layout */}
      <SectionReveal>
        <ProductSession
          id="session-sale"
          type="sale"
          title="Flash Sale"
          products={sale}
          emptyMessage="Hiện tại chưa có chương trình Flash Sale nào"
          layout="marquee"
          maxProducts={8}
          enablePriceFilter={sale.length > 0}
        />
      </SectionReveal>

      {/* Sản Phẩm Mới — Horizontal scroll layout with navigation */}
      <SectionReveal delay={0.1}>
        <ProductSession
          id="session-new"
          type="new"
          title="Sản Phẩm Mới Về"
          products={newProducts}
          layout="horizontal"
          showNavigation={true}
          enablePriceFilter={true}
        />
      </SectionReveal>

      {/* Bán Chạy Nhất — Grid layout */}
      <SectionReveal delay={0.2}>
        <ProductSession
          id="session-hot"
          type="hot"
          title="Bán Chạy Nhất (Best Seller)"
          products={hot}
          layout="grid"
          maxProducts={10}
          enablePriceFilter={true}
        />
      </SectionReveal>

      {/* Phiên Bản Giới Hạn — Grid layout */}
      <SectionReveal delay={0.3}>
        <ProductSession
          id="session-limited"
          type="limited"
          title="Phiên Bản Giới Hạn"
          products={limited}
          layout="grid"
          maxProducts={10}
          enablePriceFilter={true}
        />
      </SectionReveal>

      {/* Bộ Sưu Tập — Stagger reveal layout */}
      <SectionReveal delay={0.4}>
        <ProductSession
          id="session-standard"
          type="standard"
          title="Bộ Sưu Tập"
          products={standard}
          layout="stagger"
          maxProducts={10}
          enablePriceFilter={true}
        />
      </SectionReveal>

      <SectionReveal delay={0.5}>
        <AboutUs />
      </SectionReveal>

      <SectionReveal delay={0.6}>
        <BrandUsp />
      </SectionReveal>

      <BrandsMarquee brands={brands} />
      <ChatWidget />
      <Footer />
    </div>
  );
}