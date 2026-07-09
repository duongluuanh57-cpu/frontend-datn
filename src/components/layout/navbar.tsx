'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, Heart, ShoppingCart, Menu, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { useSearchSuggestions, ProductSuggestion } from '@/hooks/useSearchSuggestions';
import { getFavoriteIds } from '@/services/favorite.service';
import { useCart } from '@/hooks/useCart';
import { CartSidebar } from '@/components/shared/cart-sidebar';
import { getOriginRedirectUrl, resolveImageUrl } from '@/lib/api';
import { Badge } from '@astryxdesign/core/Badge';
import { IconButton } from '@astryxdesign/core/IconButton';
import { TextInput } from '@astryxdesign/core/TextInput';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, accessToken } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'cart' | 'favorites'>('cart');
  const [loginUrl, setLoginUrl] = useState('http://localhost:4000/api/auth/login');

  useEffect(() => {
    setLoginUrl(getOriginRedirectUrl('/api/auth/login'));
  }, []);
  const favoriteCount = useFavoriteStore((state) => state.favoriteCount);
  const setFavoriteCount = useFavoriteStore((state) => state.setFavoriteCount);
  const { totalItems: cartCount } = useCart();
  const {
    suggestions,
    isLoading,
    isOpen,
    query,
    setQuery,
    open,
    close,
    containerRef,
  } = useSearchSuggestions();

  const setFavoriteIds = useFavoriteStore((state) => state.setFavoriteIds);

  // Fetch favorite IDs once
  useEffect(() => {
    const fetchFavoriteIds = async () => {
      if (!accessToken) {
        setFavoriteCount(0);
        setFavoriteIds([]);
        return;
      }

      try {
        const result = await getFavoriteIds(accessToken);
        if (result.success && result.data) {
          setFavoriteIds(result.data.ids || []);
        }
      } catch (error) {
        console.error('Failed to fetch favorite IDs:', error);
      }
    };

    fetchFavoriteIds();
  }, [accessToken]);

  const handleCartClose = useCallback(() => setCartSidebarOpen(false), []);
  const handleCartOpen = useCallback(() => { setSidebarTab('cart'); setCartSidebarOpen(true); }, []);
  const handleFavoritesOpen = useCallback(() => { setSidebarTab('favorites'); setCartSidebarOpen(true); }, []);

  const handleProductClick = useCallback((product: ProductSuggestion) => {
    close();
    window.location.href = `/product/${product._id}`;
  }, [close]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Ẩn navbar trên trang checkout — phải ĐẶT SAU TẤT CẢ hooks
  if (pathname === '/checkout') {
    return null;
  }

  return (
    <>
      {/* Main Header */}
      <header className="bg-surface/90 backdrop-blur-md fixed top-0 left-0 right-0 z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
              <img src="/logo.png" alt="L'essence" className="w-8 h-8 object-contain" />
              <span className="font-bold text-xl text-text-primary">L'essence</span>
            </Link>
            
            {/* Search Bar with Suggestions */}
            <div className="flex-1 max-w-2xl hidden md:block" ref={containerRef}>
              <div className="relative">
                <TextInput
                  label="Tìm kiếm"
                  isLabelHidden
                  value={query}
                  onChange={setQuery}
                  onFocus={open}
                  onEnter={() => {}}
                  placeholder="Tìm nước hoa, thương hiệu..."
                  startIcon={<Search size={16} />}
                  size="md"
                />

                {/* Suggestions Dropdown */}
                {isOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">
                    {isLoading ? (
                      <div className="p-4 text-center text-text-secondary text-sm">
                        Đang tìm kiếm...
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="p-2">
                        {suggestions.map((product) => (
                          <button
                            key={product._id}
                            onClick={() => handleProductClick(product)}
                            className="w-full flex items-center gap-3 p-2 hover:bg-primary/10 rounded-md transition-colors cursor-pointer text-left"
                          >
                            {product.image ? (
                              <div className="relative flex-shrink-0">
                                <img
                                  src={resolveImageUrl(product.image)}
                                  alt={product.name}
                                  className="w-10 h-10 rounded-md object-cover"
                                />
                                {product.discount && product.discount > 0 ? (
                                  <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none shadow-sm">
                                    -{product.discount}%
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-surface border border-border flex items-center justify-center flex-shrink-0">
                                <span className="text-xs text-text-muted">IMG</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary truncate">{product.name}</p>
                              <p className="text-xs text-text-secondary">{product.brand}</p>
                            </div>
                            <span className="flex-shrink-0 text-right">
                              {product.discount && product.discount > 0 && product.originalPrice && product.originalPrice > product.price ? (
                                <>
                                  <span className="text-xs text-text-muted line-through mr-1">{formatPrice(product.originalPrice)}</span>
                                  <br />
                                  <span className="text-sm font-semibold text-primary">{formatPrice(product.price)}</span>
                                </>
                              ) : (
                                <span className="text-sm font-semibold text-primary">{formatPrice(product.price)}</span>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : query.trim().length > 0 ? (
                      <div className="p-4 text-center text-text-secondary text-sm">
                        Không tìm thấy sản phẩm nào
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              <div className="relative">
                <IconButton
                  label="Yêu thích"
                  icon={<Heart className={`w-6 h-6 text-text-secondary transition-all duration-300 ${favoriteCount > 0 ? 'scale-110' : ''}`} />}
                  variant="ghost"
                  onClick={handleFavoritesOpen}
                />
                {favoriteCount > 0 && (
                  <Badge
                    label={favoriteCount > 99 ? '99+' : favoriteCount}
                    variant="info"
                    className="absolute -top-1 -right-1 z-10"
                  />
                )}
              </div>
              <div className="relative">
                <IconButton
                  label="Giỏ hàng"
                  icon={<ShoppingCart className="w-6 h-6 text-text-secondary" />}
                  variant="ghost"
                  onClick={handleCartOpen}
                />
                {cartCount > 0 && (
                  <Badge
                    label={cartCount > 99 ? '99+' : cartCount}
                    variant="info"
                    className="absolute -top-1 -right-1 z-10"
                  />
                )}
              </div>
              {isAuthenticated ? (
                <IconButton
                  label="Tài khoản"
                  icon={<User className="w-6 h-6 text-text-secondary" />}
                  variant="ghost"
                  href="/profile"
                />
              ) : (
                <IconButton
                  label="Đăng nhập"
                  icon={<User className="w-6 h-6 text-text-secondary" />}
                  variant="ghost"
                  href={loginUrl}
                />
              )}
              <IconButton
                label="Menu"
                icon={<Menu className="w-5 h-5 text-text-secondary" />}
                variant="ghost"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <div className="relative">
              <TextInput
                label="Tìm kiếm"
                isLabelHidden
                value={query}
                onChange={setQuery}
                placeholder="Tìm nước hoa, thương hiệu..."
                startIcon={<Search size={16} />}
                size="sm"
              />
            </div>
            <button
              onClick={() => {
                handleFavoritesOpen();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-text-secondary hover:text-primary"
            >
              Yêu thích
            </button>
            <button
              onClick={() => {
                handleCartOpen();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-text-secondary hover:text-primary"
            >
              Giỏ hàng
            </button>
            <span className="block py-2 text-text-muted">Hỗ trợ</span>
            {isAuthenticated ? (
              <Link href="/profile" className="block py-2 text-text-secondary hover:text-primary">{user?.username}</Link>
            ) : (
              <a href={loginUrl} className="block py-2 text-text-secondary hover:text-primary">Đăng nhập</a>
            )}
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={cartSidebarOpen}
        onClose={handleCartClose}
        initialTab={sidebarTab}
      />
    </>
  );
}