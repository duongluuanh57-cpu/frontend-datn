'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Heart, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { toast } from 'sonner';
import { getFavorites, removeFromFavorites } from '@/services/favorite.service';
import { MiniProductCard } from './MiniProductCard';

// ---- FavoriteButton (merged from ./favorite-button.tsx) ----

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: (newState: boolean) => void;
  onFloat?: (x: number, y: number) => void;
  className?: string;
  size?: number;
}

export function FavoriteButton({ isFavorite, onToggle, onFloat, className = '', size = 16 }: FavoriteButtonProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const next = !isFavorite;
    onToggle(next);
    if (next) {
      const rect = e.currentTarget.getBoundingClientRect();
      onFloat?.(rect.left + rect.width / 2, rect.top);
    }
  }, [isFavorite, onToggle, onFloat]);

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-md transition-colors cursor-pointer ${className}`}
    >
      <Heart
        size={size}
        className={`transition-all duration-200 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
      />
    </button>
  );
}

// ---- FavoritesPopup ----

interface FavoritesPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FavoritesPopup({ isOpen, onClose }: FavoritesPopupProps) {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [version, setVersion] = useState(0);
  const accessToken = useAuthStore((state) => state.accessToken);
  const favoriteCount = useFavoriteStore((state) => state.favoriteCount);
  const setFavoriteCount = useFavoriteStore((state) => state.setFavoriteCount);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is outside the popup
      if (!target.closest('.favorites-popup-container')) {
        onClose();
      }
    };

    // Add event listener after a small delay to avoid immediate close
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !accessToken) return;
    setVersion(v => v + 1);
  }, [isOpen, accessToken, favoriteCount]);

  useEffect(() => {
    if (!isOpen || !accessToken) return;

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const result = await getFavorites(accessToken);
        if (result.success && result.data) {
          // Get only the 3 most recent favorites
          setFavorites((result.data as any[]).slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isOpen, accessToken, version]);

  const handleRemove = async (productId: string, _variantSize?: string) => {
    if (!accessToken) return;

    try {
      await removeFromFavorites(productId, accessToken);
      setFavorites(prev => prev.filter(item => {
        const p = item.productId || item;
        const id = p._id || item._id;
        return id !== productId;
      }));
      setFavoriteCount(Math.max(0, favoriteCount - 1));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      toast.error('Không thể xóa sản phẩm khỏi danh sách yêu thích');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Popup */}
      <div className="favorites-popup-container fixed top-20 right-16 w-72 bg-white rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[101] max-h-[70vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-lg font-bold text-text-primary">Sản phẩm yêu thích</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-surface rounded-lg transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-text-secondary">Đang tải...</div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Heart className="w-12 h-12 text-text-muted mb-3" />
              <p className="text-text-secondary">Chưa có sản phẩm yêu thích</p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((fav) => {
                const product = fav.productId || fav;
                const productId = product._id || fav._id;
                return (
                  <MiniProductCard
                    key={fav._id}
                    item={{
                      productId,
                      name: product.name || '',
                      image: product.image || '',
                      brand: product.brand || '',
                      price: product.price || 0,
                      discount: product.discount || 0,
                    }}
                    variant="favorite"
                    onRemove={(id) => handleRemove(id)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {favorites.length > 0 && (
          <div className="border-t border-border p-3">
            <Link
              href="/favorites"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary hover:bg-primary-dark text-rich-black font-semibold rounded-lg transition-colors text-sm"
            >
              Xem tất cả sản phẩm yêu thích
              <ExternalLink size={16} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
