'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Star, XCircle, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';
import { addToCart } from '@/services/cart.service';
import { cancelOrder } from '@/services/order.service';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { OrderProductRow } from './order-product-row';
import { statusLabel, statusTextColor, formatDate } from './order-constants';
import { getProductSlug } from '@/lib/utils';

interface OrderCardProps {
  order: any;
  onClick: () => void;
  onOrderCancelled?: () => void;
}

export function OrderCard({ order, onClick, onOrderCancelled }: OrderCardProps) {
  const { accessToken } = useAuthStore();
  const router = useRouter();
  const items = order.items || [];
  const [cancelling, setCancelling] = useState(false);

  const handleBuyAgain = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!accessToken || items.length === 0) return;

    try {
      await Promise.all(
        items.map((item: any) =>
          addToCart(accessToken, item.productId, item.quantity, item.variantSize)
        )
      );
      toast.success('Đã thêm sản phẩm vào giỏ hàng');
      router.push('/cart');
    } catch {
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  const handleCancelOrder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!accessToken) return;

    toast('Xác nhận hủy đơn hàng?', {
      description: 'Yêu cầu sẽ được gửi đến admin để xử lý.',
      duration: 10000,
      action: {
        label: 'Hủy đơn',
        onClick: async () => {
          setCancelling(true);
          try {
            await cancelOrder(accessToken, order._id);
            toast.success('Đã gửi yêu cầu hủy đơn');
            onOrderCancelled?.();
          } catch (err: any) {
            toast.error(err.message || 'Không thể hủy đơn hàng');
          } finally {
            setCancelling(false);
          }
        },
      },
      cancel: {
        label: 'Đóng',
        onClick: () => {},
      },
    });
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO
  };

  const handleReview = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const slug = getProductSlug(item.name, item.productId);
    router.push(`/product/${slug}`);
  };

  const canReview = order.status === 'delivered' && items.length === 1;
  const showBuyAgain = order.status === 'delivered';
  const showCancel = order.status === 'pending' && !order.cancelRequested;
  const displayStatus = order.cancelRequested ? 'ĐÃ YÊU CẦU HỦY' : (statusLabel[order.status] || order.status);
  const displayStatusColor = order.cancelRequested ? 'text-orange-500' : (statusTextColor[order.status] || 'text-text-secondary');

  return (
    <div
      onClick={onClick}
      className="w-full text-left rounded-xl bg-background border border-border overflow-hidden cursor-pointer"
    >
      {/* Header: Order ID + Status */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span className="font-semibold text-text-primary text-sm">
          Mã đơn hàng: #{order._id?.slice(-8).toUpperCase()}
        </span>
        <span className={`text-xs font-semibold uppercase ${displayStatusColor}`}>
          {displayStatus}
        </span>
      </div>

      {/* Product items */}
      <div>
        <div className="border-t border-border mx-5" />
        {items.slice(0, 2).map((item: any, idx: number) => (
          <OrderProductRow key={idx} item={item} />
        ))}
        {items.length > 2 && (
          <div className="px-5 py-2.5 text-center text-sm font-medium text-primary">
            +{items.length - 2} sản phẩm khác
          </div>
        )}
        <div className="border-t border-border mx-5" />
      </div>

      {/* Footer: Date + Total + Actions */}
      <div className="px-5 py-3 border-t border-border space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            {formatDate(order.createdAt)} · {items.length} sản phẩm
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-text-muted">Thành tiền:</p>
            <p className="font-bold text-text-primary text-base">
              {formatPrice(order.totalAmount)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          {canReview && (
            <button
              onClick={(e) => handleReview(e, items[0])}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Star size={16} />
              Đánh giá
            </button>
          )}
          {showBuyAgain && (
            <button
              onClick={handleBuyAgain}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors"
            >
              <ShoppingCart size={16} />
              Mua lại
            </button>
          )}
          {showCancel && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelling ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <XCircle size={16} />
              )}
              Hủy đơn hàng
            </button>
          )}
          <button
            onClick={handleContact}
            className="px-4 py-2 border border-border text-text-secondary text-sm font-medium rounded-lg hover:border-primary hover:text-primary transition-colors"
          >
            Liên hệ hỗ trợ
          </button>
        </div>
      </div>
    </div>
  );
}
