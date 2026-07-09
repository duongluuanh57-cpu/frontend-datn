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
      <div className="min-h-screen bg-background py-8 animate-pulse">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 space-y-3">
            <div className="h-8 w-56 bg-surface rounded-lg" />
            <div className="h-5 w-40 bg-surface rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl overflow-hidden">
                <div className="aspect-[3/4] bg-text-muted/10" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-text-muted/10 rounded w-1/3" />
                  <div className="h-4 bg-text-muted/10 rounded w-2/3" />
                  <div className="h-5 bg-text-muted/10 rounded w-1/2" />
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
          <h2 className="text-xl font-semibold text-text-primary mb-2">Vui lòng đăng nhập</h2>
          <p className="text-text-secondary mb-4">Bạn cần đăng nhập để xem danh sách yêu thích</p>
          <a href={getOriginRedirectUrl('/api/auth/login')} className="btn-primary inline-block">
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Sản phẩm yêu thích</h1>
          <p className="text-text-secondary">
            {favoritesList.length > 0 
              ? `Bạn có ${favoritesList.length} sản phẩm yêu thích`
              : 'Chưa có sản phẩm yêu thích nào'}
          </p>
        </div>

        {favoritesList.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-20 h-20 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Chưa có sản phẩm yêu thích</h3>
            <p className="text-text-secondary mb-6">Hãy khám phá và thêm sản phẩm bạn thích vào danh sách</p>
            <Link href="/" className="btn-primary">
              Khám phá sản phẩm
                         </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {favoritesList.map((fav: any) => {
              const product = fav.productId || fav;
              const productId = product._id;
              return (
              <ProductCard 
                key={fav._id}
                product={{
                  _id: productId,
                  name: product.name,
                  brand: product.brand || '',
                  price: product.price,
                  image: product.image || product.images?.[0] || '',
                  discount: product.discount,
                  reviewsCount: product.reviewsCount,
                  soldCount: product.soldCount,
                }}
              />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
