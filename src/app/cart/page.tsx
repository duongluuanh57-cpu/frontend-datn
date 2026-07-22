'use client';

import { useState, useCallback, useRef } from 'react';
import { ShoppingBag, ArrowRight, Package, Heart, X, Tag, Minus, Plus, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCart, removeFromCart, updateCartItem, updateCartItemVariant, getAvailableVouchers, applyVoucher, removeVoucher } from '@/services/cart.service';
import type { CartItem, VoucherInfo } from '@/services/cart.service';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/formatPrice';
import { MiniProductCard } from '@/components/shared/MiniProductCard';
import { VoucherCard } from '@/components/profile/voucher-card';
import { PriceSummary } from '@/components/shared/PriceSummary';
import { VoucherSelector } from '@/components/shared/VoucherSelector';

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: (open: boolean) => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center" onClick={() => onClose(false)}>
      <div className="bg-white rounded-xl shadow-elevated w-full max-w-md max-h-[80vh] flex flex-col mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          <button onClick={() => onClose(false)} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

function updateCartData(cart: any, mapItems: (items: any[]) => any[]) {
  if (!cart) return cart;
  const items = mapItems(cart.items || []);
  const totalItems = items.reduce((s: number, i: any) => s + (i.quantity || 0), 0);
  const totalAmount = items.reduce((s: number, i: any) => {
    const pct = Number(i.discount || 0);
    return s + i.price * (1 - pct / 100) * (i.quantity || 1);
  }, 0);
  return { ...cart, items, totalItems, totalAmount: Math.round(totalAmount * 100) / 100 };
}

export default function CartPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const setCartCount = useCartStore((state) => state.setCartCount);
  const queryClient = useQueryClient();
  const debounceTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const pendingVersions = useRef(new Map<string, number>());

  const [selectedItems, setSelectedItems] = useState<{ productId: string; variantSize?: string }[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showVoucherPopup, setShowVoucherPopup] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<VoucherInfo[]>([]);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart', accessToken],
    queryFn: async () => {
      const result = await getCart(accessToken!);
      if (result.success && result.data) return result.data;
      throw new Error(result.message || 'Không thể tải giỏ hàng');
    },
    enabled: !!accessToken,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const isSelected = (productId: string, variantSize?: string) =>
    selectedItems.some(s => s.productId === productId && (s.variantSize || '50ml') === (variantSize || '50ml'));

  const handleToggleSelect = (productId: string, variantSize?: string) => {
    setSelectedItems(prev => {
      const existing = prev.findIndex(s => s.productId === productId && (s.variantSize || '50ml') === (variantSize || '50ml'));
      return existing >= 0
        ? prev.filter((_, i) => i !== existing)
        : [...prev, { productId, variantSize }];
    });
  };

  const handleToggleAll = () => {
    if (!cart) return;
    if (selectedItems.length === cart.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.items.map(i => ({ productId: i.productId, variantSize: i.variantSize })));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSelected = useCallback(async () => {
    if (!accessToken || selectedItems.length === 0) return;
    const itemsToDelete = [...selectedItems];
    setShowDeleteConfirm(false);
    setSelectedItems([]);

    const previousCart = queryClient.getQueryData(['cart', accessToken]);
    const prevTotal = previousCart?.totalItems ?? 0;

    const updated = updateCartData(previousCart, (items) =>
      items.filter((item: any) =>
        !itemsToDelete.some(s =>
          s.productId === item.productId && (s.variantSize || '50ml') === (item.variantSize || '50ml')
        )
      )
    );

    queryClient.setQueryData(['cart', accessToken], updated);
    setCartCount(updated?.totalItems ?? 0);

    try {
      await Promise.all(itemsToDelete.map(s => removeFromCart(accessToken, s.productId, s.variantSize)));
      const refreshed = await getCart(accessToken);
      if (refreshed.success && refreshed.data) {
        queryClient.setQueryData(['cart', accessToken], refreshed.data);
        setCartCount(refreshed.data.totalItems || 0);
      }
      toast.success('Đã xóa sản phẩm đã chọn');
    } catch {
      queryClient.setQueryData(['cart', accessToken], previousCart);
      setCartCount(prevTotal);
      toast.error('Không thể xóa sản phẩm');
    }
  }, [accessToken, selectedItems, queryClient, setCartCount]);

  const handleRemove = useCallback(async (productId: string, variantSize?: string) => {
    if (!accessToken) return;

    const previousCart = queryClient.getQueryData(['cart', accessToken]);
    const prevTotal = previousCart?.totalItems ?? 0;

    const updated = updateCartData(previousCart, (items) =>
      items.filter((i: any) =>
        !(i.productId === productId && (i.variantSize || '50ml') === (variantSize || '50ml'))
      )
    );

    queryClient.setQueryData(['cart', accessToken], updated);
    setCartCount(updated?.totalItems ?? 0);

    try {
      const result = await removeFromCart(accessToken, productId, variantSize);
      if (result.success && result.data) {
        queryClient.setQueryData(['cart', accessToken], result.data);
        setCartCount(result.data.totalItems || 0);
      }
    } catch {
      queryClient.setQueryData(['cart', accessToken], previousCart);
      setCartCount(prevTotal);
      toast.error('Không thể xóa sản phẩm');
    }
  }, [accessToken, queryClient, setCartCount]);

  const handleQuantityChange = useCallback(async (productId: string, newQuantity: number, variantSize?: string) => {
    if (!accessToken) return;

    const key = productId + '-' + (variantSize || '50ml');

    if (newQuantity < 1) {
      if (debounceTimers.current.has(key)) {
        clearTimeout(debounceTimers.current.get(key)!);
        debounceTimers.current.delete(key);
      }
      handleRemove(productId, variantSize);
      return;
    }
    if (debounceTimers.current.has(key)) {
      clearTimeout(debounceTimers.current.get(key)!);
    }

    const version = (pendingVersions.current.get(key) || 0) + 1;
    pendingVersions.current.set(key, version);

    const previousCart = queryClient.getQueryData(['cart', accessToken]);

    const updated = updateCartData(previousCart, (items) =>
      items.map((item: any) =>
        item.productId === productId && (item.variantSize || '50ml') === (variantSize || '50ml')
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    queryClient.setQueryData(['cart', accessToken], updated);
    setCartCount(updated?.totalItems ?? 0);

    debounceTimers.current.set(key, setTimeout(async () => {
      try {
        const result = await updateCartItem(accessToken, productId, newQuantity, variantSize);
        if (result.success && result.data) {
          const currentVersion = pendingVersions.current.get(key) || 0;
          if (version < currentVersion) return;
          queryClient.setQueryData(['cart', accessToken], result.data);
          setCartCount(result.data.totalItems || 0);
        }
      } catch {
        queryClient.setQueryData(['cart', accessToken], previousCart);
        if (previousCart) setCartCount(previousCart.totalItems || 0);
        toast.error('Không thể cập nhật số lượng');
      }
      debounceTimers.current.delete(key);
    }, 400));
  }, [accessToken, queryClient, setCartCount, handleRemove]);

  const handleOpenVoucherPopup = async () => {
    if (!accessToken) return;
    try {
      const result = await getAvailableVouchers(accessToken);
      if (result.success && result.data) {
        setAvailableVouchers(result.data);
        setSelectedVoucherCode('');
        setManualCode('');
        setShowVoucherPopup(true);
      }
    } catch (error) {
      console.error('Failed to load vouchers:', error);
      toast.error('Không thể tải danh sách mã giảm giá');
    }
  };

  const handleApplyVoucher = async (code: string) => {
    if (!accessToken || !code.trim()) return;
    setApplyingVoucher(true);
    try {
      const result = await applyVoucher(accessToken, code.trim());
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['cart', accessToken] });
        setShowVoucherPopup(false);
        toast.success(result.message || 'Áp dụng mã giảm giá thành công');
      } else {
        toast.error(result.message || 'Không thể áp dụng mã giảm giá');
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể áp dụng mã giảm giá');
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = async () => {
    if (!accessToken) return;
    try {
      const result = await removeVoucher(accessToken);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['cart', accessToken] });
        toast.success('Đã hủy mã giảm giá');
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể hủy mã giảm giá');
    }
  };

  const handleVariantChange = async (productId: string, currentVariantSize: string | undefined, newVariantSize: string) => {
    if (!accessToken) return;

    const previousCart = queryClient.getQueryData(['cart', accessToken]);

    // Optimistic update: find the new variant price and update immediately
    const updated = updateCartData(previousCart, (items) =>
      items.map((item: any) => {
        if (item.productId === productId && (item.variantSize || '50ml') === (currentVariantSize || '50ml')) {
          const newVariant = item.availableVariants?.find((v: any) => v.size === newVariantSize);
          return {
            ...item,
            variantSize: newVariantSize,
            price: newVariant?.price ?? item.price,
          };
        }
        return item;
      })
    );

    queryClient.setQueryData(['cart', accessToken], updated);

    try {
      const result = await updateCartItemVariant(accessToken, productId, currentVariantSize, newVariantSize);
      if (result.success && result.data) {
        queryClient.setQueryData(['cart', accessToken], result.data);
      }
    } catch (error) {
      // Rollback on failure
      queryClient.setQueryData(['cart', accessToken], previousCart);
      console.error('Failed to change variant:', error);
      toast.error('Không thể đổi dung tích');
    }
  };

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">Vui lòng đăng nhập</h2>
          <p className="text-sm text-text-secondary mb-4">Bạn cần đăng nhập để xem giỏ hàng</p>
          <Link href="/api/auth/login" className="btn-primary inline-block">Đăng nhập</Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-foreground/5 rounded-lg animate-pulse mb-8" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-foreground/5 rounded-lg p-4 flex gap-4 animate-pulse">
                <div className="w-16 h-16 bg-foreground/5 rounded flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 bg-foreground/5 rounded" />
                  <div className="h-4 w-1/3 bg-foreground/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-background">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-20 h-20 text-text-muted mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">Giỏ hàng trống</h1>
          <p className="text-sm text-text-secondary mb-8">Hãy khám phá và thêm sản phẩm bạn yêu thích vào giỏ hàng</p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            <Package size={18} />
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] overflow-hidden">
      {/* Fixed top section */}
      <div className="flex-shrink-0 max-w-7xl mx-auto px-4 w-full pt-4 md:pt-6 pb-4">
        <nav className="flex items-center justify-between gap-2 text-sm text-text-muted mb-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-text-primary font-medium">Giỏ hàng</span>
          </div>
          <span className="text-text-muted">{cart.items.length} sản phẩm</span>
        </nav>

        <div className="flex items-center justify-between bg-white border border-border rounded-xl px-4 py-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={cart.items.length > 0 && selectedItems.length === cart.items.length}
              onChange={handleToggleAll}
              className="checkbox-primary"
            />
            <span className="text-sm font-medium text-text-secondary">Chọn tất cả</span>
          </label>
          <button
            onClick={handleDeleteSelected}
            disabled={selectedItems.length === 0}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors cursor-pointer ${
              selectedItems.length > 0
                ? 'text-red-500 hover:text-red-600'
                : 'text-text-muted cursor-not-allowed'
            }`}
          >
            <ShoppingBag size={16} />
            Xóa ({selectedItems.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 max-w-7xl mx-auto px-4 w-full pb-8 overflow-hidden">
        <div className="flex gap-6 h-full">
          {/* Left — Scrollable Cart Items */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
            {cart.items.map((item) => {
              const discountPct = Number(item.discount || 0);
              const originalPrice = item.price;
              const discountedUnitPrice = originalPrice * (1 - discountPct / 100);
              const lineTotal = discountedUnitPrice * (item.quantity || 1);

              return (
                <div
                  key={item.productId + '-' + (item.variantSize || '50ml')}
                  className={`bg-white border rounded-xl p-3 transition-colors ${
                    isSelected(item.productId, item.variantSize)
                      ? 'border-primary shadow-soft'
                      : 'border-border'
                  }`}
                >
                  <MiniProductCard
                    item={{
                      productId: item.productId,
                      name: item.name,
                      image: item.image,
                      brand: item.brand,
                      price: lineTotal,
                      discount: item.discount,
                      quantity: item.quantity,
                      variantSize: item.variantSize,
                      availableVariants: item.availableVariants,
                    }}
                    variant="cart"
                    selected={isSelected(item.productId, item.variantSize)}
                    onToggleSelect={handleToggleSelect}
                    onRemove={handleRemove}
                    onQuantityChange={handleQuantityChange}
                    onVariantChange={handleVariantChange}
                    compact
                  />
                </div>
              );
            })}
          </div>

          {/* Right — Order Summary (fixed, not scrollable) */}
          <div className="w-80 flex-shrink-0 self-start">
            <div className="bg-white border border-border rounded-xl p-6 space-y-4">
              <h3 className="text-base font-bold text-text-primary">Tóm tắt đơn hàng</h3>

              <VoucherSelector
                accessToken={accessToken!}
                voucherCode={cart.voucherCode}
                onApply={handleApplyVoucher}
                onRemove={handleRemoveVoucher}
              />

              <PriceSummary
                totalAmount={cart.totalAmount}
                shippingFee="Miễn phí"
                voucherDiscount={cart.voucherDiscount || 0}
                finalTotal={(cart.totalAmount || 0) - (cart.voucherDiscount || 0)}
              />

              <button
                onClick={() => router.push('/checkout')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-on-primary text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-primary-dark transition-colors cursor-pointer shadow-soft"
              >
                Thanh toán
                <ArrowRight size={18} />
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Delete confirm dialog */}
      <Modal isOpen={showDeleteConfirm} onClose={setShowDeleteConfirm} title="Xóa sản phẩm">
        <p className="text-sm text-text-secondary">Xác nhận xóa {selectedItems.length} sản phẩm đã chọn?</p>
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="flex-1 px-4 py-2 text-sm font-semibold text-text-secondary bg-foreground/5 border border-border rounded-lg hover:bg-foreground/10 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={confirmDeleteSelected}
            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Xóa
          </button>
        </div>
      </Modal>

      {/* Voucher popup */}
      <Modal isOpen={showVoucherPopup} onClose={setShowVoucherPopup} title="Chọn mã giảm giá">
        {/* Scrollable vouchers */}
        <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-4">
          <div className="space-y-4">
              {availableVouchers.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-4">Không có mã giảm giá nào khả dụng</p>
            ) : (
              <>
                {availableVouchers.filter(v => !v.minTier).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Voucher L'essence</p>
                    <div className="space-y-2">
                      {availableVouchers.filter(v => !v.minTier).map((v) => (
                        <label
                          key={v.code}
                          className="block cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="voucher"
                            checked={selectedVoucherCode === v.code}
                            onChange={() => setSelectedVoucherCode(v.code)}
                            className="sr-only"
                          />
                          <VoucherCard voucher={v} selected={selectedVoucherCode === v.code} />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {availableVouchers.filter(v => !!v.minTier).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Voucher VIP</p>
                    <div className="space-y-2">
                      {availableVouchers.filter(v => !!v.minTier).map((v) => (
                        <label
                          key={v.code}
                          className="block cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="voucher"
                            checked={selectedVoucherCode === v.code}
                            onChange={() => setSelectedVoucherCode(v.code)}
                            className="sr-only"
                          />
                          <VoucherCard voucher={v} selected={selectedVoucherCode === v.code} />
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Fixed "Hoặc nhập mã" */}
        <div className="flex-shrink-0 border-t border-border pt-4 px-5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Hoặc nhập mã</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã giảm giá..."
              className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary bg-white"
            />
            <button
              onClick={() => handleApplyVoucher(manualCode)}
              disabled={applyingVoucher || !manualCode.trim()}
              className="px-4 py-2 text-sm font-semibold text-on-primary bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {applyingVoucher ? 'Đang áp...' : 'Áp dụng'}
            </button>
          </div>
        </div>

        {/* Fixed buttons */}
        <div className="flex-shrink-0 flex gap-3 w-full border-t border-border pt-4 mt-4 px-5">
          <button
            onClick={() => setShowVoucherPopup(false)}
            className="flex-1 px-4 py-2 text-sm font-semibold text-text-secondary bg-foreground/5 border border-border rounded-lg hover:bg-foreground/10 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={() => handleApplyVoucher(selectedVoucherCode)}
            disabled={applyingVoucher || !selectedVoucherCode}
            className="flex-1 px-4 py-2 text-sm font-semibold text-on-primary bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {applyingVoucher ? 'Đang áp...' : 'Áp dụng'}
          </button>
        </div>
      </Modal>
    </div>
  );
}