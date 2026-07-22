'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, Heart, ShoppingCart, Menu, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useProductsFilterStore } from '@/store/useProductsFilterStore';
import { getProductSlug } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { useCartStore } from '@/store/useCartStore';
import { useCart } from '@/hooks/useCart';
import { useSearchSuggestions, ProductSuggestion, BrandSuggestion } from '@/hooks/useSearchSuggestions';
import { getFavoriteIds } from '@/services/favorite.service';
import { CartSidebar } from '@/components/shared/cart-sidebar';
import { MiniProductCard } from '@/components/shared/MiniProductCard';
import { getOriginRedirectUrl, resolveImageUrl } from '@/lib/api';

export function Navbar() {
  const pathname = usePathname();
  return <NavbarInner pathname={pathname} />;
}

function NavbarInner({ pathname }: { pathname: string }) {
  const router = useRouter();
  const setFilterAndGo = useProductsFilterStore((s) => s.setFilterAndGo);
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
  const { totalItems } = useCart();
  const setCartCount = useCartStore((state) => state.setCartCount);
  const cartCount = useCartStore((state) => state.cartCount);

  // Sync initial cart count từ API vào Zustand store
  useEffect(() => {
    if (totalItems !== undefined) {
      setCartCount(totalItems);
    }
  }, [totalItems, setCartCount]);

  const {
    suggestions,
    brandResults,
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
    router.push(`/product/${getProductSlug(product.name, product._id)}`);
  }, [close, router]);

  const handleBrandClick = useCallback((brand: BrandSuggestion) => {
    close();
    router.push(setFilterAndGo({ pendingBrand: brand.name }));
  }, [close, router, setFilterAndGo]);

  // Ẩn navbar trên trang checkout — phải ĐẶT SAU TẤT CẢ hooks
  if (pathname === '/checkout') {
    return null;
  }

  return (
    <>
      {/* Main Header */}
      <header className="bg-white fixed top-0 left-0 right-0 z-50 font-sans">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            
            {/* Logo & Cart — fixed width, không co giãn */}
            <div className="flex items-center gap-2 flex-shrink-0 w-auto md:w-[240px] lg:w-[280px] overflow-hidden">
              <Link href="/" className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
                <img src="/logo.png" alt="L'essence" className="w-8 h-8 object-contain" />
                <span className="font-bold text-xl text-text-primary">L'essence</span>
              </Link>
              {(pathname === '/cart' || pathname === '/favorites' || pathname === '/profile' || pathname === '/products' || pathname.startsWith('/product/')) && (
                <>
                  <span className="text-text-muted mx-1">|</span>
                  <span className="flex items-center gap-1.5 text-text-secondary text-sm font-medium truncate">
                    {pathname === '/cart' ? (
                      <>
                        <ShoppingCart className="w-5 h-5 text-text-secondary" />
                        Giỏ hàng
                        {cartCount > 0 && (
                          <span className="bg-primary text-on-primary text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {cartCount > 99 ? '99+' : cartCount}
                          </span>
                        )}
                      </>
                    ) : pathname === '/favorites' ? (
                      <>
                        <Heart className="w-5 h-5 text-text-secondary" />
                        Yêu thích
                        {favoriteCount > 0 && (
                          <span className="bg-primary text-on-primary text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {favoriteCount > 99 ? '99+' : favoriteCount}
                          </span>
                        )}
                      </>
                    ) : pathname === '/products' ? (
                      <>
                        Sản phẩm
                      </>
                    ) : pathname.startsWith('/product/') ? (
                      <>
                        Chi tiết sản phẩm
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5 text-text-secondary" />
                        Tài khoản
                      </>
                    )}
                  </span>
                </>
              )}
            </div>
            
            {/* Search Bar with Suggestions */}
            <div className="flex-1 min-w-[300px] max-w-2xl hidden md:block" ref={containerRef}>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={open}
                  placeholder="Tìm nước hoa, thương hiệu..."
                  className="input-field pl-10 bg-white border-border hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />

                {/* Suggestions Dropdown */}
                {isOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">
                    {isLoading ? (
                      <div className="p-4 text-center text-text-secondary text-sm">
                        Đang tìm kiếm...
                      </div>
                    ) : (
                      <>
                        {/* Brand Suggestions */}
                        {brandResults.length > 0 && (
                          <div className="p-2 border-b border-border">
                            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">Thương hiệu</div>
                            {brandResults.map((brand) => (
                              <button
                                key={brand._id}
                                onClick={() => handleBrandClick(brand)}
                                className="w-full flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer border border-transparent hover:border-primary-dark hover:bg-surface/50 text-left"
                              >
                                <div className="w-10 h-10 rounded-md border border-border overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                                  {brand.logo ? (
                                    <img src={resolveImageUrl(brand.logo)} alt={brand.name} className="w-full h-full object-contain" />
                                  ) : (
                                    <span className="text-xs font-bold text-text-muted">{brand.name.charAt(0)}</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-text-primary truncate">{brand.name}</div>
                                </div>
                                <span className="text-xs text-primary font-medium whitespace-nowrap">Vào xem thương hiệu →</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Product Suggestions */}
                        {suggestions.length > 0 ? (
                          <div className="p-2">
                            {suggestions.map((product) => (
                              <button
                                key={product._id}
                                onClick={() => handleProductClick(product)}
                                className="w-full text-left rounded-md transition-colors cursor-pointer border border-transparent hover:border-primary-dark hover:bg-surface/50 p-2"
                              >
                                <MiniProductCard
                                  item={{
                                    productId: product._id,
                                    name: product.name,
                                    image: product.image,
                                    brand: product.brand,
                                    price: product.discount && product.discount > 0 ? product.price : product.originalPrice || product.price,
                                    discount: product.discount,
                                    variantSize: '50ml',
                                  }}
                                  variant="cart"
                                  hideRemoveButton
                                  compact
                                />
                              </button>
                            ))}
                          </div>
                        ) : brandResults.length === 0 && query.trim().length > 0 ? (
                          <div className="p-4 text-center text-text-secondary text-sm">
                            Không tìm thấy sản phẩm nào
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              <div className="relative">
                <button
                  aria-label="Yêu thích"
                  onClick={handleFavoritesOpen}
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-foreground/5 transition-colors cursor-pointer"
                >
                  <Heart className={`w-6 h-6 text-text-muted hover:text-primary-dark transition-all duration-300 ${favoriteCount > 0 ? 'scale-110' : ''}`} />
                </button>
                {favoriteCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 z-10 bg-primary-light text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                    style={{ backgroundColor: '#B8944F', color: '#FFFFFF' }}
                  >
                    {favoriteCount > 99 ? '99+' : favoriteCount}
                  </span>
                )}
              </div>
              <div className="relative">
                <button
                  aria-label="Giỏ hàng"
                  onClick={handleCartOpen}
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-foreground/5 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-6 h-6 text-text-muted hover:text-primary-dark" />
                </button>
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 z-10 bg-primary-light text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                    style={{ backgroundColor: '#B8944F', color: '#FFFFFF' }}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              {isAuthenticated ? (
                <div className="relative group">
                  <Link
                    href="/profile?tab=orders"
                    aria-label="Tài khoản"
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-foreground/5 transition-colors"
                  >
                    <User className="w-6 h-6 text-text-muted hover:text-primary-dark" />
                  </Link>
                  {/* Dropdown on hover — centered */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 bg-white rounded-xl border border-border shadow-elevated opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link
                      href="/profile?tab=info"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-foreground/5 rounded-t-xl transition-colors"
                    >
                      <User size={16} />
                      Tài khoản
                    </Link>
                    <button
                      onClick={() => useAuthStore.getState().logout()}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50/50 rounded-b-xl transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                <a
                  href={loginUrl}
                  aria-label="Đăng nhập"
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-foreground/5 transition-colors"
                >
                  <User className="w-6 h-6 text-text-muted" />
                </a>
              )}
              <button
                aria-label="Menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-foreground/5 transition-colors md:hidden cursor-pointer"
              >
                <Menu className="w-5 h-5 text-text-muted hover:text-primary-dark" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm nước hoa, thương hiệu..."
                className="input-field pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
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