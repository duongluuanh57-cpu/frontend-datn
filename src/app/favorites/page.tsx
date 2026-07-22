'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { getOriginRedirectUrl } from '@/lib/api';
import { getFavorites } from '@/services/favorite.service';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '@/components/shared/product-card';

export default function FavoritesPage() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites', accessToken],
    queryFn: async () => {
      const result = await getFavorites(accessToken!);
      if (result.success && result.data) return result.data;
      throw new Error(result.message || 'Không thể tải danh sách yêu thích');
    },
    enabled: !!accessToken,
  });

  const favoritesList = favorites || [];

  if (isLoading) {
    return (
      <div className="bg-background flex flex-col h-[calc(100vh-80px)] overflow-hidden py-8 animate-pulse">
        <div className="flex-1 min-h-0 max-w-7xl mx-auto px-4 w-full overflow-hidden">
          <div className="mb-8 space-y-3">
            <div className="h-8 w-56 bg-foreground/5 rounded-lg" />
            <div className="h-5 w-40 bg-foreground/5 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white border border-border rounded-xl overflow-hidden shadow-soft">
                <div className="aspect-[3/4] bg-foreground/5" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-foreground/5 rounded w-1/3" />
                  <div className="h-4 bg-foreground/5 rounded w-2/3" />
                  <div className="h-5 bg-foreground/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">Vui lòng đăng nhập</h2>
          <p className="text-sm text-text-secondary mb-4">Bạn cần đăng nhập để xem danh sách yêu thích</p>
          <a href={getOriginRedirectUrl('/api/auth/login')} className="btn-primary inline-block">
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] overflow-hidden">
      <div className="flex-shrink-0 max-w-7xl mx-auto px-4 w-full pt-4 md:pt-6 pb-4">
        <nav className="flex items-center justify-between gap-2 text-sm text-text-muted mb-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-text-primary font-medium">Yêu thích</span>
          </div>
          <span className="text-text-muted">{favoritesList.length} sản phẩm</span>
        </nav>
      </div>

      <div className="flex-1 min-h-0 max-w-7xl mx-auto px-4 w-full pb-8 overflow-hidden">
        {favoritesList.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Heart className="w-20 h-20 text-text-muted mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">Chưa có sản phẩm yêu thích</h3>
              <p className="text-sm text-text-secondary mb-6">Hãy khám phá và thêm sản phẩm bạn thích vào danh sách</p>
              <Link href="/" className="btn-primary inline-block">
                Khám phá sản phẩm
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {favoritesList.map((fav: any) => {
                  const product = fav.productId || fav;
                  return (
                  <ProductCard
                    key={fav._id}
                    product={{
                      _id: product._id,
                      name: product.name,
                      brand: product.brand || '',
                      price: product.price,
                      originalPrice: product.originalPrice,
                      image: product.image || product.images?.[0] || '',
                      tag: product.tag,
                      discount: product.discount,
                      reviewsCount: product.reviewsCount,
                      soldCount: product.soldCount,
                      quantityInStock: product.quantityInStock,
                    }}
                  />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
