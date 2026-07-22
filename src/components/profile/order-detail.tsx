'use client';

import Link from 'next/link';
import {
  ShoppingBag,
  Package,
  CreditCard,
  Clock,
  XCircle,
  Truck,
  AlertTriangle,
  PackageCheck,
  Star,
  MessageSquare
} from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';
import { resolveImageUrl } from '@/lib/api';
import { getProductSlug } from '@/lib/utils';
import { statusLabel, statusTextColor } from './order-constants';

interface OrderDetailProps {
  order: any;
  onBack: () => void;
}

type StepStatus = 'completed' | 'pending' | 'failed' | 'waiting';

interface TimelineStep {
  label: string;
  status: StepStatus;
  icon: React.ReactNode;
}

function getPaymentIcon(status: StepStatus): React.ReactNode {
  if (status === 'completed') return <CreditCard size={24} />;
  if (status === 'failed') return <XCircle size={24} />;
  return <Clock size={24} />;
}

function getDeliveryIcon(status: StepStatus): React.ReactNode {
  if (status === 'completed') return <PackageCheck size={24} />;
  if (status === 'failed') return <XCircle size={24} />;
  return <AlertTriangle size={24} />;
}

function getReviewIcon(status: StepStatus): React.ReactNode {
  return status === 'completed' ? <Star size={24} /> : <MessageSquare size={24} />;
}

function getTimelineSteps(order: any): TimelineStep[] {
  const status = order.status;

  const step1: TimelineStep = {
    label: 'Đơn hàng đã đặt',
    status: 'completed',
    icon: <Package size={24} />,
  };

  // Step 2: Đơn hàng đã thanh toán
  let step2Status: StepStatus;
  if (['processing', 'shipped', 'delivered'].includes(status)) {
    step2Status = 'completed';
  } else if (status === 'cancelled') {
    step2Status = 'failed';
  } else if (status === 'pending') {
    step2Status = 'waiting';
  } else {
    step2Status = 'pending';
  }
  const step2: TimelineStep = {
    label: 'Đơn hàng đã thanh toán',
    status: step2Status,
    icon: getPaymentIcon(step2Status),
  };

  // Step 3: Đã bàn giao cho ĐVVC
  const step3Status: StepStatus = ['shipped', 'delivered'].includes(status) ? 'completed' : 'pending';
  const step3: TimelineStep = {
    label: 'Đã bàn giao cho ĐVVC',
    status: step3Status,
    icon: <Truck size={24} />,
  };

  // Step 4: Đã nhận được hàng
  let step4Status: StepStatus;
  if (status === 'delivered') {
    step4Status = 'completed';
  } else if (status === 'cancelled') {
    step4Status = 'failed';
  } else if (status === 'shipped') {
    step4Status = 'waiting';
  } else {
    step4Status = 'pending';
  }
  const step4: TimelineStep = {
    label: 'Đã nhận được hàng',
    status: step4Status,
    icon: getDeliveryIcon(step4Status),
  };

  // Step 5: Đánh giá
  let step5Status: StepStatus;
  if (status === 'delivered' && order.isReviewed) {
    step5Status = 'completed';
  } else if (status === 'delivered') {
    step5Status = 'waiting';
  } else {
    step5Status = 'pending';
  }
  const step5: TimelineStep = {
    label: 'Đánh giá',
    status: step5Status,
    icon: getReviewIcon(step5Status),
  };

  return [step1, step2, step3, step4, step5];
}

const iconBorderColors: Record<StepStatus, string> = {
  completed: 'border-success text-success',
  pending: 'border-border text-text-muted',
  failed: 'border-red-400 text-red-500',
  waiting: 'border-primary text-primary',
};

const labelColors: Record<StepStatus, string> = {
  completed: 'text-text-primary',
  pending: 'text-text-muted',
  failed: 'text-red-500',
  waiting: 'text-text-secondary',
};

const connectorColors: Record<StepStatus, string> = {
  completed: 'border-success',
  pending: 'border-border',
  failed: 'border-red-300',
  waiting: 'border-primary',
};

export function OrderDetail({ order, onBack }: OrderDetailProps) {
  const steps = getTimelineSteps(order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium">
          ← QUAY LẠI
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">MÃ ĐƠN HÀNG</span>
          <span className="text-sm text-text-primary">#{order._id?.slice(-8).toUpperCase()}</span>
          <span className="text-sm text-text-muted mx-1">|</span>
          <span className={`text-sm font-semibold uppercase ${statusTextColor[order.status] || 'text-text-secondary'}`}>
            {statusLabel[order.status] || order.status}
          </span>
        </div>
      </div>

      {/* Timeline - 5 giai đoạn */}
      <div className="bg-background rounded-xl p-5 md:p-8 border border-border">
        {/* Desktop: horizontal grid */}
        <div className="hidden md:grid md:grid-cols-5 md:gap-0">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 relative">
              <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center bg-background ${iconBorderColors[step.status]}`}>
                {step.icon}
              </div>
              <span className={`text-xs font-semibold text-center leading-tight ${labelColors[step.status]}`}>
                {step.label}
              </span>
              {/* Connector line between circles */}
              {idx < steps.length - 1 && (
                <div className={`absolute top-7 left-[calc(50%+30px)] right-[calc(-50%+30px)] h-px border-t-2 pointer-events-none ${connectorColors[step.status]}`} />
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical stack */}
        <div className="flex md:hidden flex-col gap-3">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 bg-background ${iconBorderColors[step.status]}`}>
                {step.icon}
              </div>
              <span className={`text-sm font-semibold ${labelColors[step.status]}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-background rounded-xl p-5 border border-border">
          <div className="space-y-2">
            <p className="text-sm"><span className="text-text-muted">Người nhận:</span> <span className="text-text-primary font-medium">{order.shippingAddress?.fullName || order.customerName}</span></p>
            <p className="text-sm"><span className="text-text-muted">Điện thoại:</span> <span className="text-text-primary font-medium">{order.shippingAddress?.phone || order.customerPhone}</span></p>
            <p className="text-sm"><span className="text-text-muted">Địa chỉ:</span> <span className="text-text-primary font-medium">{order.shippingAddress?.address || order.customerAddress}</span></p>
            {order.note && <p className="text-sm"><span className="text-text-muted">Ghi chú:</span> <span className="text-text-primary">{order.note}</span></p>}
          </div>
        </div>

        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-text-primary text-sm">Sản phẩm ({order.items?.length || 0})</h3>
          </div>
          <div className="divide-y divide-border">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 px-5 py-4">
                <div className="w-16 h-16 rounded-lg bg-foreground/5 border border-border overflow-hidden flex-shrink-0">
                  {item.image ? <img src={resolveImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-text-muted"><ShoppingBag size={18} /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${getProductSlug(item.name, item.productId)}`} className="text-sm font-medium text-text-primary hover:text-primary truncate block">{item.name}</Link>
                  {item.brand && <p className="text-xs text-text-muted mt-0.5">{item.brand}</p>}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-text-muted">SL: {item.quantity}</span>
                    {item.variantSize && <span className="text-xs text-text-muted">{item.variantSize}</span>}
                  </div>
                </div>
                <p className="font-bold text-text-primary text-sm">{formatPrice(item.price * (item.quantity || 1))}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-background rounded-xl p-5 border border-border">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Tạm tính</span>
              <span className="font-medium text-text-primary">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Phí vận chuyển</span>
              <span className={`font-medium ${order.shippingFee === 0 ? 'text-green-600' : 'text-text-primary'}`}>
                {order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Phương thức</span>
              <span className="font-medium text-text-primary">{order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : order.paymentMethod}</span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-text-primary">Tổng cộng</span>
                <span className="text-lg font-bold text-primary">{formatPrice(order.finalAmount || order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}