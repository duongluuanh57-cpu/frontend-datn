'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useQueryClient } from '@tanstack/react-query';
import { getCart, removeFromCart, updateCartItem, updateCartItemVariant } from '@/services/cart.service';
import { CartItem } from '@/services/cart.service';
import { toast } from 'sonner';
import { MiniProductCard } from './MiniProductCard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const [cart, setCart] = useState<{ items: CartItem[]; totalAmount: number; totalItems: number; voucherCode?: string | null; voucherDiscount?: number } | null>(null);
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherMsg, setVoucherMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [showVoucherPopup, setShowVoucherPopup] = useState(false);
  const [fetchingVouchers, setFetchingVouchers] = useState(false);
  const [animatingItem, setAnimatingItem] = useState<string | null>(null);
  const [animatingPrice, setAnimatingPrice] = useState<string | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setCartCount = useCartStore((state) => state.setCartCount);
  const queryClient = useQueryClient();
  const scrollYRef = React.useRef(0);

  useEffect(() => {
    if (isOpen) {
      scrollYRef.current = window.scrollY;
      // Lock body scroll, chỉ scroll nội dung trong cart
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.overscrollBehavior = 'none';
    } else {
      // Unlock khi đóng cart
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
      window.scrollTo(0, scrollYRef.current);
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
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

  const handleQuantityChange = async (productId: string, newQuantity: number, variantSize?: string) => {
    if (!accessToken) return;

    try {
      if (newQuantity < 1) {
        setAnimatingItem(productId);
        await handleRemove(productId, variantSize);
        return;
      }
      setAnimatingItem(productId);
      const result = await updateCartItem(accessToken, productId, newQuantity, variantSize);
      if (result.success && result.data) {
        setCart(result.data);
        setCartCount(result.data.totalItems || 0);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
      setTimeout(() => setAnimatingItem(null), 300);
      setAnimatingPrice(productId);
      setTimeout(() => setAnimatingPrice(null), 300);
    } catch (error) {
      console.error('Failed to update cart:', error);
      toast.error('Không thể cập nhật số lượng');
    }
  };

  const handleRemove = async (productId: string, variantSize?: string) => {
    if (!accessToken) return;

    try {
      setRemovingItem(productId);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await removeFromCart(accessToken, productId, variantSize);
      if (result.success && result.data) {
        setCart(result.data);
        setCartCount(result.data.totalItems || 0);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
      
      setRemovingItem(null);
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Không thể xóa sản phẩm khỏi giỏ hàng');
      setRemovingItem(null);
    }
  };

  const fetchVouchers = async () => {
    if (!accessToken) return;
    setFetchingVouchers(true);
    try {
      const res = await fetch(`${API_BASE}/api/vouchers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setVouchers(json.data);
        setShowVoucherPopup(true);
      }
    } catch {
      // ignore
    } finally {
      setFetchingVouchers(false);
    }
  };

  const handleApplyVoucher = async (code?: string) => {
    if (!accessToken || !voucherInput.trim()) return;
    setApplyingVoucher(true);
    setVoucherMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/cart/apply-voucher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ code: (code || voucherInput).trim() }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCart(json.data);
        setVoucherMsg({ type: 'success', text: json.message });
      } else {
        setVoucherMsg({ type: 'error', text: json.message || 'Mã giảm giá không hợp lệ' });
      }
    } catch {
      setVoucherMsg({ type: 'error', text: 'Lỗi kết nối' });
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = async () => {
    if (!accessToken) return;
    setApplyingVoucher(true);
    try {
      const res = await fetch(`${API_BASE}/api/cart/remove-voucher`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCart(json.data);
        setVoucherInput('');
        setVoucherMsg(null);
      }
    } catch {
      // ignore
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleVariantChange = async (productId: string, currentVariantSize: string | undefined, newVariantSize: string) => {
    if (!accessToken) return;
    try {
      const result = await updateCartItemVariant(accessToken, productId, currentVariantSize, newVariantSize);
      if (result.success && result.data) {
        setCart(result.data);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        toast.success('Đã đổi biến thể sản phẩm');
      }
    } catch (error) {
      console.error('Failed to change variant:', error);
      toast.error('Không thể đổi biến thể');
    }
  };

  const handleCheckout = () => {
    onClose();
    window.location.href = '/checkout';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/50 z-[100] cart-overlay"
            onClick={onClose}
            onWheel={onClose}
          />
          
          <motion.div
            key="cart-sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[102]"
          >
            <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold text-text-primary">Giỏ hàng</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface rounded-lg transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-surface rounded-lg p-3 flex gap-3 animate-pulse">
                    <div className="w-16 h-16 bg-surface/80 rounded-md flex-shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-4 w-3/4 bg-surface/80 rounded" />
                      <div className="h-3 w-1/2 bg-surface/80 rounded" />
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-7 h-7 bg-surface/80 rounded" />
                        <div className="w-7 h-5 bg-surface/80 rounded" />
                        <div className="w-7 h-7 bg-surface/80 rounded" />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="w-5 h-5 bg-surface/80 rounded" />
                      <div className="h-4 w-16 bg-surface/80 rounded mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !cart || cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-16 h-16 text-text-muted mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">Giỏ hàng trống</h3>
                <p className="text-text-secondary mb-6">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
                <button
                  onClick={onClose}
                  className="btn-primary"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            ) : (
              <div className="space-y-4 overflow-x-hidden">
                {cart.items.map((item) => (
                  <MiniProductCard
                    key={item.productId + '-' + (item.variantSize || '50ml')}
                    item={item}
                    variant="cart"
                    isRemoving={removingItem === item.productId}
                    onRemove={handleRemove}
                    onQuantityChange={handleQuantityChange}
                    onVariantChange={handleVariantChange}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart && cart.items.length > 0 && (
            <div className="border-t border-border p-4 space-y-3">
              {/* Voucher */}
              <div className="space-y-2 relative">
                {showVoucherPopup && vouchers.length > 0 && (
                  <div className="border border-border rounded-lg bg-white shadow-lg max-h-36 overflow-y-auto absolute bottom-full left-0 right-0 mb-2 z-10">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-surface sticky top-0">
                      <span className="text-xs font-medium text-text-secondary">Mã giảm giá có sẵn</span>
                    </div>
                    {vouchers.map((v: any) => (
                      <button
                        key={v._id}
                        onClick={() => { setVoucherInput(v.code); setShowVoucherPopup(false); handleApplyVoucher(v.code); }}
                        className="w-full text-left px-3 py-2 hover:bg-surface transition-colors border-b border-border last:border-0"
                      >
                        <span className="text-sm font-semibold text-text-primary">{v.code}</span>
                        <span className="text-xs text-text-muted ml-2">
                          {v.type === 'percentage' ? `Giảm ${v.value}%` : `Giảm ${v.value.toLocaleString('vi-VN')}đ`}
                          {v.minOrderAmount > 0 && ` (Đơn từ ${v.minOrderAmount.toLocaleString('vi-VN')}đ)`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {!cart.voucherCode ? (
                  <div className="flex gap-2">
                    <input
                      id="voucher-input"
                      type="text"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
                      onFocus={() => fetchVouchers()}
                      onBlur={() => setTimeout(() => setShowVoucherPopup(false), 200)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                    />
                    <button
                      onClick={() => handleApplyVoucher()}
                      disabled={applyingVoucher || !voucherInput.trim()}
                      className="px-4 py-2 bg-primary hover:bg-primary-dark text-rich-black text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {applyingVoucher ? '...' : 'Áp dụng'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div>
                      <span className="text-sm font-semibold text-green-700">{cart.voucherCode}</span>
                      <span className="text-xs text-green-600 ml-2">
                        -{formatPrice(cart.voucherDiscount || 0)}
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveVoucher}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Hủy
                    </button>
                  </div>
                )}
                {voucherMsg && (
                  <p className={`text-xs ${voucherMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {voucherMsg.text}
                  </p>
                )}

              </div>

              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Tạm tính</span>
                <span className="font-medium">{formatPrice(cart.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Phí vận chuyển</span>
                <span className="font-medium text-green-600">Miễn phí</span>
              </div>
              {cart.voucherDiscount ? (
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Giảm giá</span>
                  <span className="font-medium text-green-600">-{formatPrice(cart.voucherDiscount)}</span>
                </div>
              ) : null}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold text-text-primary">Tổng cộng</span>
                  <span className="text-xl font-bold text-primary">{formatPrice(Math.max(0, cart.totalAmount - (cart.voucherDiscount || 0)))}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-primary hover:bg-primary-dark text-rich-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Thanh toán
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
          </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}