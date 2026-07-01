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
import { FlipBadge } from '@/components/shared/flip-badge';
import { CartSidebar } from '@/components/shared/cart-sidebar';
import { FavoritesPopup } from '@/components/shared/favorites-popup';
import { getOriginRedirectUrl, resolveImageUrl } from '@/lib/api';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, accessToken } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [favoritesPopupOpen, setFavoritesPopupOpen] = useState(false);
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

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, [setQuery]);

  const handleCartClose = useCallback(() => setCartSidebarOpen(false), []);
  const handleFavoritesClose = useCallback(() => setFavoritesPopupOpen(false), []);

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
                <input
                  type="text"
                  placeholder="Tìm nước hoa, thương hiệu..."
                  value={query}
                  onChange={handleSearchChange}
                  onFocus={open}
                  className="w-full py-2.5 pl-4 pr-12 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors cursor-pointer">
                  <Search className="w-4 h-4" />
                </button>

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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFavoritesPopupOpen(prev => !prev);
                }}
                className="p-2 hover:bg-surface rounded-lg transition-colors cursor-pointer relative"
                aria-label="Yêu thích"
              >
                <Heart className={`w-5 h-5 text-text-secondary transition-all duration-300 ${favoriteCount > 0 ? 'scale-110' : ''}`} />
                {favoriteCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-rich-black text-xs font-bold rounded-full flex items-center justify-center min-w-[20px] min-h-[20px]">
                    <FlipBadge value={favoriteCount} />
                  </span>
                )}
              </button>
              <button
                onClick={() => setCartSidebarOpen(true)}
                className="p-2 hover:bg-surface rounded-lg transition-colors cursor-pointer relative"
                aria-label="Giỏ hàng"
              >
                <ShoppingCart className="w-5 h-5 text-text-secondary" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-rich-black text-xs font-bold rounded-full flex items-center justify-center min-w-[20px] min-h-[20px]">
                    <FlipBadge value={cartCount} />
                  </span>
                )}
              </button>
              {isAuthenticated ? (
                <Link href="/profile" className="p-2 hover:bg-surface rounded-lg transition-colors cursor-pointer">
                  <User className="w-5 h-5 text-text-secondary" />
                </Link>
              ) : (
                <a href={loginUrl} className="p-2 hover:bg-surface rounded-lg transition-colors cursor-pointer inline-flex">
                  <User className="w-5 h-5 text-text-secondary" />
                </a>
              )}
              <button
                className="md:hidden p-2 hover:bg-surface rounded-lg transition-colors cursor-pointer"
                aria-label="Menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-5 h-5 text-text-secondary" />
              </button>
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
              <input
                type="text"
                placeholder="Tìm nước hoa, thương hiệu..."
                className="w-full py-2.5 pl-4 pr-12 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors cursor-pointer">
                <Search className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => {
                setFavoritesPopupOpen(true);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-text-secondary hover:text-primary"
            >
              Yêu thích
            </button>
            <button
              onClick={() => {
                setCartSidebarOpen(true);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-text-secondary hover:text-primary"
            >
              Giỏ hàng
            </button>
            <Link href="#" className="block py-2 text-text-secondary hover:text-primary">Hỗ trợ</Link>
            {isAuthenticated ? (
              <Link href="/profile" className="block py-2 text-text-secondary hover:text-primary">{user?.username}</Link>
            ) : (
              <a href={loginUrl} className="block py-2 text-text-secondary hover:text-primary">Đăng nhập</a>
            )}
          </div>
        </div>
      )}

      {/* Favorites Popup */}
      <FavoritesPopup
        isOpen={favoritesPopupOpen}
        onClose={handleFavoritesClose}
      />

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={cartSidebarOpen}
        onClose={handleCartClose}
      />
    </>
  );
}