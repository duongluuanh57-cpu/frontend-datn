'use client';

import { useState } from 'react';
import { ShoppingBag, Trash2, ArrowRight, Package, Heart, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCart, removeFromCart, updateCartItem, updateCartItemVariant } from '@/services/cart.service';
import type { CartItem } from '@/services/cart.service';
import { toast } from 'sonner';
import { MiniProductCard } from '@/components/shared/MiniProductCard';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function CartPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const setCartCount = useCartStore((state) => state.setCartCount);
  const queryClient = useQueryClient();

  const [selectedItems, setSelectedItems] = useState<{ productId: string; variantSize?: string }[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart', accessToken],
    queryFn: async () => {
      const result = await getCart(accessToken!);
      if (result.success && result.data) return result.data;
      throw new Error(result.message || 'Không thể tải giỏ hàng');
    },
    enabled: !!accessToken,
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

  const confirmDeleteSelected = async () => {
    if (!accessToken || selectedItems.length === 0) return;
    setShowDeleteConfirm(false);
    for (const s of selectedItems) {
      const result = await removeFromCart(accessToken, s.productId, s.variantSize);
      if (result.success && result.data) {
        setCartCount(result.data.totalItems || 0);
      }
    }
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    setSelectedItems([]);
    toast.success('Đã xóa sản phẩm đã chọn');
  };

  const handleQuantityChange = async (productId: string, newQuantity: number, variantSize?: string) => {
    if (!accessToken) return;
    try {
      if (newQuantity < 1) {
        await handleRemove(productId, variantSize);
        return;
      }
      const result = await updateCartItem(accessToken, productId, newQuantity, variantSize);
      if (result.success && result.data) {
        setCartCount(result.data.totalItems || 0);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
    } catch (error) {
      console.error('Failed to update cart:', error);
      toast.error('Không thể cập nhật số lượng');
    }
  };

  const handleRemove = async (productId: string, variantSize?: string) => {
    if (!accessToken) return;
    try {
      const result = await removeFromCart(accessToken, productId, variantSize);
      if (result.success && result.data) {
        setCartCount(result.data.totalItems || 0);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleVariantChange = async (productId: string, currentVariantSize: string | undefined, newVariantSize: string) => {
    if (!accessToken) return;
    try {
      const result = await updateCartItemVariant(accessToken, productId, currentVariantSize, newVariantSize);
      if (result.success && result.data) {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
    } catch (error) {
      console.error('Failed to change variant:', error);
      toast.error('Không thể đổi dung tích');
    }
  };

  // --- Auth gate ---
  if (!accessToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Vui lòng đăng nhập</h2>
          <p className="text-text-secondary mb-4">Bạn cần đăng nhập để xem giỏ hàng</p>
          <Link href="/api/auth/login" className="btn-primary inline-block">Đăng nhập</Link>
        </div>
      </div>
    );
  }

  // --- Loading ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-surface rounded-lg animate-pulse mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface rounded-xl p-4 flex gap-4 animate-pulse">
                <div className="w-20 h-20 bg-surface/80 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 bg-surface/80 rounded" />
                  <div className="h-4 w-1/3 bg-surface/80 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Empty ---
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-20 h-20 text-text-muted mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Giỏ hàng trống</h1>
          <p className="text-text-secondary mb-8">Hãy khám phá và thêm sản phẩm bạn yêu thích vào giỏ hàng</p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            <Package size={18} />
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header — locked */}
      <div className="flex-shrink-0 max-w-6xl w-full mx-auto px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/products" className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1">
            <ChevronLeft size={14} />
            Tiếp tục mua sắm
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Giỏ hàng</h1>
            <p className="text-sm text-text-secondary mt-0.5">{cart.totalItems} sản phẩm</p>
          </div>
        </div>
      </div>

      {/* Content — only items scroll on desktop */}
      <div className="flex-1 min-h-0 max-w-6xl w-full mx-auto px-4 pb-6">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left — scrollable items */}
          <div className="lg:col-span-2 lg:overflow-y-auto lg:h-full space-y-4">
            <div className="flex items-center justify-between bg-surface rounded-xl px-4 py-3 flex-shrink-0">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={cart.items.length > 0 && selectedItems.length === cart.items.length}
                  onChange={handleToggleAll}
                  className="checkbox-primary"
                />
                <span className="text-sm font-medium text-text-primary">Chọn tất cả</span>
              </label>
              <button
                onClick={handleDeleteSelected}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all duration-200 ${
                  selectedItems.length > 0 ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
              >
                <Trash2 size={16} />
                Xóa ({selectedItems.length})
              </button>
            </div>

            <div className="space-y-3">
              {cart.items.map((item) => (
                <MiniProductCard
                  key={item.productId + '-' + (item.variantSize || '50ml')}
                  item={item}
                  variant="cart"
                  selected={isSelected(item.productId, item.variantSize)}
                  onToggleSelect={handleToggleSelect}
                  onRemove={handleRemove}
                  onQuantityChange={handleQuantityChange}
                  onVariantChange={handleVariantChange}
                />
              ))}
            </div>
          </div>

          {/* Right — Summary locked */}
          <div className="flex-shrink-0">
            <div className="bg-surface rounded-xl border border-border p-5">
              <h2 className="text-base font-semibold text-text-primary mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Tạm tính</span>
                  <span className="font-medium text-text-primary">{formatPrice(cart.totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Phí vận chuyển</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-text-primary">Tổng cộng</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(cart.totalAmount)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => router.push('/checkout')}
                className="w-full mt-5 py-3.5 bg-primary hover:bg-primary-dark text-rich-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                Thanh toán
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        isOpen={showDeleteConfirm}
        onOpenChange={(open) => setShowDeleteConfirm(open)}
        width={400}
        purpose="info"
      >
        <Layout
          header={<DialogHeader title="Xóa sản phẩm" onOpenChange={(open) => setShowDeleteConfirm(open)} />}
          content={
            <LayoutContent>
              <p className="text-sm text-text-secondary">Xác nhận xóa {selectedItems.length} sản phẩm đã chọn?</p>
            </LayoutContent>
          }
          footer={
            <LayoutFooter hasDivider>
              <div className="flex gap-3">
                <Button label="Hủy" variant="secondary" onClick={() => setShowDeleteConfirm(false)} />
                <Button label="Xóa" variant="destructive" onClick={confirmDeleteSelected} />
              </div>
            </LayoutFooter>
          }
        />
      </Dialog>
    </div>
  );
}
