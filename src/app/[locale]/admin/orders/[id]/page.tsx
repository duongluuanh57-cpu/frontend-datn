'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/navigation';
import { useLocale } from 'next-intl';
import {
  ArrowLeft,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Trash2,
  AlertCircle,
  Loader2,
  Ticket,
} from 'lucide-react';
import api from '@/lib/api';
import type { Order, OrderItem } from '@/hooks/useAdminOrders';

export default function OrderDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const isVi = locale === 'vi';
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const t = (key: string) => isVi
    ? {
        title: 'Chi tiết đơn hàng',
        back: 'Quay lại',
        customerInfo: 'Thông tin khách hàng',
        paymentInfo: 'Thông tin thanh toán',
        orderItems: 'Danh sách sản phẩm',
        actions: 'Thao tác',
        status: 'Trạng thái',
        paymentStatus: 'Trạng thái thanh toán',
        paymentMethod: 'Phương thức thanh toán',
        total: 'Tổng tiền',
        delete: 'Xóa đơn hàng',
        quantity: 'SL',
        price: 'Đơn giá',
        discount: 'Giảm giá',
        voucher: 'Mã giảm giá',
        product: 'Sản phẩm',
        name: 'Tên',
        email: 'Email',
        phone: 'SĐT',
        address: 'Địa chỉ',
        image: 'Ảnh',
        loading: 'Đang tải...',
        notFound: 'Không tìm thấy đơn hàng',
        loadError: 'Không thể tải thông tin đơn hàng',
        updateSuccess: 'Cập nhật thành công!',
        updateError: 'Cập nhật thất bại',
        deleteConfirm: 'Bạn có chắc chắn muốn xóa đơn hàng này?',
        deleteSuccess: 'Đã xóa đơn hàng',
        deleteError: 'Xóa đơn hàng thất bại',
        pending: 'Chờ xử lý',
        processing: 'Đang xử lý',
        shipped: 'Đã giao hàng',
        delivered: 'Đã nhận hàng',
        cancelled: 'Đã hủy',
        unpaid: 'Chưa thanh toán',
        paid: 'Đã thanh toán',
        refunded: 'Đã hoàn tiền',
        cod: 'COD',
        bankTransfer: 'Chuyển khoản',
        creditCard: 'Thẻ tín dụng',
        momo: 'MoMo',
        zalopay: 'ZaloPay',
        orderId: 'Mã đơn hàng',
        orderDate: 'Ngày đặt',
      }[key] || key
    : {
        title: 'Order Details',
        back: 'Back',
        customerInfo: 'Customer Information',
        paymentInfo: 'Payment Information',
        orderItems: 'Order Items',
        actions: 'Actions',
        status: 'Status',
        paymentStatus: 'Payment Status',
        paymentMethod: 'Payment Method',
        total: 'Total',
        delete: 'Delete Order',
        quantity: 'Qty',
        price: 'Price',
        discount: 'Discount',
        voucher: 'Voucher',
        product: 'Product',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        image: 'Image',
        loading: 'Loading...',
        notFound: 'Order not found',
        loadError: 'Failed to load order',
        updateSuccess: 'Updated successfully!',
        updateError: 'Update failed',
        deleteConfirm: 'Are you sure you want to delete this order?',
        deleteSuccess: 'Order deleted',
        deleteError: 'Failed to delete order',
        pending: 'Pending',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        unpaid: 'Unpaid',
        paid: 'Paid',
        refunded: 'Refunded',
        cod: 'COD',
        bankTransfer: 'Bank Transfer',
        creditCard: 'Credit Card',
        momo: 'MoMo',
        zalopay: 'ZaloPay',
        orderId: 'Order ID',
        orderDate: 'Order Date',
      }[key] || key;

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cod': return t('cod');
      case 'bank_transfer': return t('bankTransfer');
      case 'credit_card': return t('creditCard');
      case 'momo': return t('momo');
      case 'zalopay': return t('zalopay');
      default: return method;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isVi ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: isVi ? 'VND' : 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isVi ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fetch order details
  useEffect(() => {
    if (!orderId) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/orders/admin/${orderId}`);
        if (data.success) {
          setOrder(data.data);
        } else {
          setError(data.message || t('notFound'));
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || t('loadError'));
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  // Update order status
  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      await api.patch(`/orders/admin/${order._id}/status`, { status: newStatus });
      setOrder(prev => prev ? { ...prev, status: newStatus as Order['status'] } : prev);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t('updateError'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Update payment status
  const handleUpdatePaymentStatus = async (newPaymentStatus: string) => {
    if (!order) return;
    setUpdatingPayment(true);
    try {
      await api.patch(`/orders/admin/${order._id}/payment-status`, { paymentStatus: newPaymentStatus });
      setOrder(prev => prev ? { ...prev, paymentStatus: newPaymentStatus as Order['paymentStatus'] } : prev);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t('updateError'));
    } finally {
      setUpdatingPayment(false);
    }
  };

  // Delete order
  const handleDelete = async () => {
    if (!order) return;
    if (!confirm(t('deleteConfirm'))) return;
    setDeleting(true);
    try {
      await api.delete(`/orders/admin/${order._id}`);
      window.location.href = `/${locale}/admin/orders`;
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t('deleteError'));
      setDeleting(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-loading">
          <Loader2 size={32} className="order-detail-spinner" />
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Error
  if (error || !order) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-header">
          <h1 className="order-detail-title">{t('notFound')}</h1>
          <Link href="/admin/orders" className="order-detail-back" style={{ marginLeft: 'auto' }}>
            <ArrowLeft size={18} />
            <span>{t('back')}</span>
          </Link>
        </div>
        <div className="order-detail-error">
          <AlertCircle size={48} />
          <h3>{error || t('notFound')}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      {/* Header — nút Quay lại bên phải */}
      <div className="order-detail-header">
        <h1 className="order-detail-title">
          {t('title')} #{order._id.slice(-8)}
        </h1>
        <Link href="/admin/orders" className="order-detail-back" style={{ marginLeft: 'auto' }}>
          <ArrowLeft size={18} />
          <span>{t('back')}</span>
        </Link>
      </div>

      <div className="order-detail-grid">
        {/* Customer Info */}
        <div className="order-detail-card">
          <div className="order-detail-card__header">
            <User size={18} />
            <h2>{t('customerInfo')}</h2>
          </div>
          <div className="order-detail-card__body">
            <div className="order-detail-info-row">
              <span className="order-detail-info-label">{t('name')}</span>
              <span className="order-detail-info-value">{order.customerName}</span>
            </div>
            {order.customerEmail && (
              <div className="order-detail-info-row">
                <span className="order-detail-info-label"><Mail size={14} /> {t('email')}</span>
                <span className="order-detail-info-value">{order.customerEmail}</span>
              </div>
            )}
            {order.customerPhone && (
              <div className="order-detail-info-row">
                <span className="order-detail-info-label"><Phone size={14} /> {t('phone')}</span>
                <span className="order-detail-info-value">{order.customerPhone}</span>
              </div>
            )}
            {order.customerAddress && (
              <div className="order-detail-info-row">
                <span className="order-detail-info-label"><MapPin size={14} /> {t('address')}</span>
                <span className="order-detail-info-value">{order.customerAddress}</span>
              </div>
            )}
            <div className="order-detail-info-row">
              <span className="order-detail-info-label">{t('orderDate')}</span>
              <span className="order-detail-info-value">{formatDate(order.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="order-detail-card">
          <div className="order-detail-card__header">
            <CreditCard size={18} />
            <h2>{t('paymentInfo')}</h2>
          </div>
          <div className="order-detail-card__body">
            <div className="order-detail-info-row">
              <span className="order-detail-info-label">{t('paymentMethod')}</span>
              <span className="order-detail-info-value">{getPaymentMethodLabel(order.paymentMethod)}</span>
            </div>
            <div className="order-detail-info-row">
              <span className="order-detail-info-label">
                <Ticket size={14} style={{ display: 'inline', marginRight: 4 }} />
                {t('voucher')}
                {(order.voucherId as any)?.code && (
                  <span style={{ opacity: 0.6, marginLeft: 4, fontSize: '0.75rem' }}>
                    ({(order.voucherId as any).code})
                  </span>
                )}
              </span>
              <span className="order-detail-info-value" style={{ color: order.discountAmount ? '#10b981' : '#9a857c' }}>
                {order.discountAmount ? `-${formatCurrency(order.discountAmount)}` : (isVi ? 'Không áp dụng' : 'Not applied')}
              </span>
            </div>
            <div className="order-detail-info-row">
              <span className="order-detail-info-label">{t('total')}</span>
              <span className="order-detail-info-value order-detail-total">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="order-detail-card">
          <div className="order-detail-card__header">
            <Package size={18} />
            <h2>{t('actions')}</h2>
          </div>
          <div className="order-detail-card__body">
            <div className="order-detail-action-group">
              <label className="order-detail-action-label">{t('status')}</label>
              <select
                value={order.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className="order-detail-select"
                disabled={updatingStatus}
              >
                <option value="pending">{t('pending')}</option>
                <option value="processing">{t('processing')}</option>
                <option value="shipped">{t('shipped')}</option>
                <option value="delivered">{t('delivered')}</option>
                <option value="cancelled">{t('cancelled')}</option>
              </select>
              {updatingStatus && <Loader2 size={14} className="order-detail-spinner-inline" />}
            </div>
            <div className="order-detail-action-group">
              <label className="order-detail-action-label">{t('paymentStatus')}</label>
              <div style={{
                padding: '8px 14px',
                background: '#faf8f6',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#6b564c',
                border: '1px solid #f0e9e4',
                cursor: 'not-allowed',
              }}>
                {t(order.paymentStatus)}
              </div>
            </div>
            <button onClick={handleDelete} className="order-detail-delete-btn" disabled={deleting}>
              <Trash2 size={16} />
              <span>{deleting ? '...' : t('delete')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Order Items — bỏ thành tiền, thêm ảnh, variants, taxonomy */}
      <div className="order-detail-card order-detail-card--full">
        <div className="order-detail-card__header">
          <Package size={18} />
          <h2>{t('orderItems')}</h2>
          <span className="order-detail-items-count">({order.items.length})</span>
        </div>
        <div className="order-detail-card__body">
          <div className="order-detail-items-table-wrapper">
            <table className="order-detail-items-table">
              <thead>
                <tr>
                  <th>{t('product')}</th>
                  <th style={{ width: '80px', minWidth: '80px', textAlign: 'center' }}>{t('image')}</th>
                  <th className="order-detail-col-qty">{t('quantity')}</th>
                  <th className="order-detail-col-price">{t('price')}</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: OrderItem, idx: number) => (
                  <tr key={idx}>
                    <td>
                      <div className="order-detail-item-info">
                        <div className="order-detail-item-detail">
                          <span className="order-detail-item-name">{item.name}</span>
                          {item.variants && item.variants.length > 0 && (
                            <span style={{ fontSize: '0.7rem', color: '#9a857c', display: 'block', marginTop: '2px' }}>
                              {item.variants.map((v: any) => v.size).filter(Boolean).join(', ')}
                            </span>
                          )}
                          {item.taxonomy && item.taxonomy.length > 0 && (
                            <span style={{ fontSize: '0.65rem', color: '#b8a69e', display: 'block', marginTop: '1px' }}>
                              {item.taxonomy.map((t: any) => t.termName).filter(Boolean).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ width: '80px', minWidth: '80px', textAlign: 'center' }}>
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.name}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #f0e9e4' }}
                        />
                      ) : (
                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#faf8f6', border: '1px solid #f0e9e4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#9a857c', margin: '0 auto' }}>
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="order-detail-col-qty">{item.quantity}</td>
                    <td className="order-detail-col-price">{formatCurrency(item.price)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="order-detail-total-label" style={{ color: order.discountAmount ? '#10b981' : '#9a857c' }}>
                    <Ticket size={14} style={{ display: 'inline', marginRight: 4 }} />
                    {t('voucher')}
                    {(order.voucherId as any)?.code && (
                      <span style={{ opacity: 0.6, marginLeft: 4, fontSize: '0.75rem' }}>
                        ({(order.voucherId as any).code})
                      </span>
                    )}
                  </td>
                  <td className="order-detail-total-value" style={{ color: order.discountAmount ? '#10b981' : '#9a857c' }}>
                    {order.discountAmount ? `-${formatCurrency(order.discountAmount)}` : (isVi ? '—' : '—')}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="order-detail-total-label">{t('total')}</td>
                  <td className="order-detail-total-value">{formatCurrency(order.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}