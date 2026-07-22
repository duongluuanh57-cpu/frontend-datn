'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, ExternalLink, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { useQueryClient } from '@tanstack/react-query';
import { getCart, removeFromCart } from '@/services/cart.service';
import { CartItem } from '@/services/cart.service';
import { getFavorites, removeFromFavorites, invalidateFavoriteIdsCache } from '@/services/favorite.service';
import { toast } from 'sonner';
import { MiniProductCard } from './MiniProductCard';
import { formatPrice } from '@/lib/formatPrice';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'cart' | 'favorites';
}

const MAX_PREVIEW = 4;

export function CartSidebar({ isOpen, onClose, initialTab = 'cart' }: CartSidebarProps) {
  const [cart, setCart] = useState<{ items: CartItem[]; totalAmount: number; totalItems: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cart' | 'favorites'>(initialTab);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const cartCount = useCartStore((state) => state.cartCount);
  const favoriteCount = useFavoriteStore((state) => state.favoriteCount);
  const setCartCount = useCartStore((state) => state.setCartCount);
  const setFavoriteCount = useFavoriteStore((state) => state.setFavoriteCount);
  const removeFavoriteId = useFavoriteStore((state) => state.removeFavoriteId);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && accessToken) {
      const fetchCart = async () => {
        setLoading(true);
        try {
          const result = await getCart(accessToken);
          if (result.success && result.data) {
            setCart(result.data);
          }
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchCart();
    }
  }, [isOpen, accessToken]);

  useEffect(() => {
    if (!isOpen || !accessToken || activeTab !== 'favorites') return;
    const fetchFavorites = async () => {
      setFavoritesLoading(true);
      try {
        const result = await getFavorites(accessToken);
        if (result.success && result.data) {
          setFavorites(Array.isArray(result.data) ? result.data.slice(0, MAX_PREVIEW) : []);
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      } finally {
        setFavoritesLoading(false);
      }
    };
    fetchFavorites();
  }, [isOpen, accessToken, activeTab]);

  const handleRemove = async (productId: string, variantSize?: string) => {
    if (!accessToken) return;
    try {
      const result = await removeFromCart(accessToken, productId, variantSize);
      if (result.success && result.data) {
        setCart(result.data);
        setCartCount(result.data.totalItems || 0);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Không thể xóa sản phẩm khỏi giỏ hàng');
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    if (!accessToken) return;
    try {
      await removeFromFavorites(productId, accessToken);
      setFavorites(prev => prev.filter(f => {
        const p = f.productId || f;
        const id = p._id || f._id;
        return id !== productId;
      }));
      removeFavoriteId(productId);
      invalidateFavoriteIdsCache();
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      toast.error('Không thể xóa sản phẩm khỏi danh sách yêu thích');
    }
  };

  const cartItems = cart?.items?.slice(0, MAX_PREVIEW) || [];
  const hasMoreCartItems = (cart?.items?.length || 0) > MAX_PREVIEW;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/50 z-[10000] cart-overlay"
            onClick={onClose}
            onWheel={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl z-[10001]"
          >
            <div className="flex flex-col h-full">
              {/* Top bar — full height = navbar height, border at bottom aligns with navbar bottom edge */}
              <div className="flex-shrink-0 h-16 md:h-20 flex flex-col border-b border-border">
                <div className="flex-1" />
                <div className="flex items-stretch px-4 h-10 md:h-12">
                  <button
                    onClick={() => setActiveTab('cart')}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-sm md:text-base font-semibold border-b-2 transition-colors ${
                      activeTab === 'cart' ? 'text-primary border-primary' : 'text-text-muted hover:text-text-primary border-transparent hover:border-text-muted/30'
                    }`}
                  >
                    Giỏ hàng
                    {cartCount > 0 && (
                      <span className="text-[11px] md:text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{cartCount}</span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-sm md:text-base font-semibold border-b-2 transition-colors ${
                      activeTab === 'favorites' ? 'text-primary border-primary' : 'text-text-muted hover:text-text-primary border-transparent hover:border-text-muted/30'
                    }`}
                  >
                    Yêu thích
                    {favoriteCount > 0 && (
                      <span className="text-[11px] md:text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full">{favoriteCount}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 snap-y snap-mandatory scroll-smooth" style={{ overscrollBehavior: 'contain' }}>
                {activeTab === 'cart' ? (
                  <>
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="bg-foreground/5 rounded-lg p-3 flex gap-3 animate-pulse">
                            <div className="w-16 h-16 bg-foreground/5 rounded-md flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-3/4 bg-foreground/5 rounded" />
                              <div className="h-3 w-1/2 bg-foreground/5 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : !cart || cart.items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <ShoppingBag className="w-20 h-20 text-text-muted mb-4" />
                        <h3 className="text-xl font-bold text-text-primary mb-2">Giỏ hàng trống</h3>
                        <p className="text-sm text-text-secondary mb-6">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
                        <button onClick={onClose} className="btn-primary">Tiếp tục mua sắm</button>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {cartItems.map((item) => (
                          <div key={item.productId + '-' + (item.variantSize || '50ml')} className="snap-start shrink-0">
                            <MiniProductCard
                              item={item}
                              variant="cart"
                              onRemove={handleRemove}
                              compact={false}
                            />
                          </div>
                        ))}
                        {hasMoreCartItems && (
                          <Link
                            href="/cart"
                            onClick={onClose}
                            className="block text-xs text-primary font-medium text-center pt-1 hover:underline"
                          >
                            + {cart.items.length - MAX_PREVIEW} sản phẩm khác
                          </Link>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {favoritesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-text-secondary">Đang tải...</div>
                      </div>
                    ) : favorites.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Heart className="w-20 h-20 text-text-muted mb-4" />
                        <h3 className="text-xl font-bold text-text-primary mb-2">Chưa có sản phẩm yêu thích</h3>
                        <p className="text-sm text-text-secondary mb-6">Hãy thêm sản phẩm vào danh sách yêu thích của bạn</p>
                        <button onClick={onClose} className="btn-primary">Tiếp tục mua sắm</button>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {favorites.map((fav: any) => {
                          const product = fav.productId || fav;
                          const productId = product._id || fav._id;
                          return (
                            <div key={fav._id} className="snap-start shrink-0">
                              <MiniProductCard
                                item={{
                                  productId,
                                  name: product.name || '',
                                  image: product.image || '',
                                  brand: product.brand || '',
                                  price: product.price || 0,
                                  discount: product.discount || 0,
                                  variantSize: product.variantSize || '',
                                }}
                                variant="favorite"
                                onRemove={(id: string) => handleRemoveFavorite(id)}
                                compact={false}
                              />
                            </div>
                          );
                        })}
                        {favoriteCount > MAX_PREVIEW && (
                          <Link
                            href="/favorites"
                            onClick={onClose}
                            className="block text-xs text-primary font-medium text-center pt-1 hover:underline"
                          >
                            + {favoriteCount - MAX_PREVIEW} sản phẩm yêu thích khác
                          </Link>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border p-4">
                {activeTab === 'cart' && cart && cart.items.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">{cart.totalItems} sản phẩm</span>
                      <span className="text-base font-bold text-text-primary">Tạm tính: {formatPrice(cart.totalAmount)}</span>
                    </div>
                    <Link
                      href="/cart"
                      onClick={onClose}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary-dark text-on-primary font-semibold rounded-lg transition-colors"
                    >
                      Xem giỏ hàng
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                ) : activeTab === 'favorites' && favorites.length > 0 ? (
                  <Link
                    href="/favorites"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary-dark text-on-primary font-semibold rounded-lg transition-colors"
                  >
                    Xem tất cả yêu thích
                    <ExternalLink size={16} />
                  </Link>
                ) : null}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
