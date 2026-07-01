'use client';

import { useState, useEffect } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { getOriginRedirectUrl } from '@/lib/api';
import { toast } from 'sonner';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { getFavorites, removeFromFavorites } from '@/services/favorite.service';
import { ProductCard } from '@/components/shared/product-card';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const accessToken = useAuthStore((state) => state.accessToken);
  const removeFavoriteId = useFavoriteStore((state) => state.removeFavoriteId);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const result = await getFavorites(accessToken);
        if (result.success && result.data) {
          setFavorites(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [accessToken]);

  const handleRemove = async (productId: string) => {
    if (!accessToken) return;

    try {
      await removeFromFavorites(productId, accessToken);
      setFavorites(prev => prev.filter(item => (item.productId?._id || item._id) !== productId));
      removeFavoriteId(productId);
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      toast.error('Không thể xóa sản phẩm khỏi danh sách yêu thích');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-secondary">Đang tải...</div>
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
            {favorites.length > 0 
              ? `Bạn có ${favorites.length} sản phẩm yêu thích`
              : 'Chưa có sản phẩm yêu thích nào'}
          </p>
        </div>

        {favorites.length === 0 ? (
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
            {favorites.map((fav) => {
              const product = fav.productId || fav;
              const productId = product._id;
              return (
              <div key={fav._id} className="relative">
                <ProductCard 
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
                  onFavoriteToggle={(favProductId, isFavorite) => {
                    if (!isFavorite) {
                      setFavorites(prev => prev.filter(item => (item.productId?._id || item._id) !== favProductId));
                    }
                  }}
                />
                <button
                  onClick={() => handleRemove(productId)}
                  className="absolute top-2 right-2 z-30 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors cursor-pointer"
                  aria-label="Xóa khỏi yêu thích"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
