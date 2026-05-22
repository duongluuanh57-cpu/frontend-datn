'use client';

import React from 'react';
import { Package, Eye } from 'lucide-react';
import { Link } from '@/navigation';
import type { UseAdminOrdersReturn } from '@/hooks/useAdminOrders';

interface OrderTableProps {
  adminOrders: UseAdminOrdersReturn;
}

export function OrderTable({ adminOrders }: OrderTableProps) {
  const { isVi, orders, isLoading, handleUpdateStatus, handleDeleteOrder } = adminOrders;

  const t = (key: string) => isVi
    ? {
        orderId: 'Mã đơn hàng',
        customer: 'Khách hàng',
        productInfo: 'Tên sản phẩm',
        status: 'Trạng thái',
        paymentStatus: 'Thanh toán',
        date: 'Ngày đặt',
        actions: 'Hành động',
        noOrders: 'Không có đơn hàng nào',
        pending: 'Chờ xử lý',
        processing: 'Đang xử lý',
        shipped: 'Đã giao hàng',
        delivered: 'Đã nhận hàng',
        cancelled: 'Đã hủy',
        unpaid: 'Chưa thanh toán',
        paid: 'Đã thanh toán',
        refunded: 'Đã hoàn tiền',
        viewDetail: 'Xem chi tiết',
        delete: 'Xóa',
      }[key] || key
    : {
        orderId: 'Order ID',
        customer: 'Customer',
        productInfo: 'Products',
        status: 'Status',
        paymentStatus: 'Payment',
        date: 'Date',
        actions: 'Actions',
        noOrders: 'No orders found',
        pending: 'Pending',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        unpaid: 'Unpaid',
        paid: 'Paid',
        refunded: 'Refunded',
        viewDetail: 'View Details',
        delete: 'Delete',
      }[key] || key;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'var(--admin-warning)';
      case 'processing': return '#854d0e';
      case 'shipped': return '#6d28d9';
      case 'delivered': return 'var(--admin-success)';
      case 'cancelled': return 'var(--admin-danger)';
      default: return 'var(--admin-text-muted)';
    }
  };

  const getPaymentBadgeClass = (status: string) => {
    switch (status) {
      case 'unpaid': return 'order-status order-status--unpaid';
      case 'paid': return 'order-status order-status--paid';
      case 'refunded': return 'order-status order-status--refunded';
      default: return 'order-status';
    }
  };

  const getPaymentLabel = (status: string) => t(status);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isVi ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleConfirmDelete = (orderId: string, customerName: string) => {
    const msg = isVi
      ? `Bạn có chắc chắn muốn xóa đơn hàng của "${customerName}"?`
      : `Are you sure you want to delete order for "${customerName}"?`;
    if (confirm(msg)) {
      handleDeleteOrder(orderId);
    }
  };

  if (isLoading) {
    return (
      <div className="orders-loading-container">
        <div className="orders-loading">
          <div className="orders-loading-spinner" />
          <p>{isVi ? 'Đang tải đơn hàng...' : 'Loading orders...'}</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="orders-empty">
        <Package className="orders-empty__icon" size={48} />
        <h3 className="orders-empty__title">{t('noOrders')}</h3>
      </div>
    );
  }

  return (
    <div className="orders-table-wrapper">
      <table className="orders-table">
        <thead>
          <tr>
            <th>{t('orderId')}</th>
            <th>{t('customer')}</th>
            <th>{t('productInfo')}</th>
            <th>{t('status')}</th>
            <th>{t('paymentStatus')}</th>
            <th>{t('date')}</th>
            <th>{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td className="order-cell--id">#{order._id.slice(-8)}</td>
              <td className="order-cell--customer">{order.customerName}</td>
              <td className="order-cell--products">
                {order.items.slice(0, 3).map((item, idx) => (
                  <span key={idx} className="order-product-pill">
                    <span className="order-product-pill__name">{item.name}</span>
                    <span className="order-product-pill__qty">×{item.quantity}</span>
                  </span>
                ))}
                {order.items.length > 3 && (
                  <span className="order-product-more">+{order.items.length - 3}</span>
                )}
              </td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                  className="order-status-select"
                  style={{ color: getStatusColor(order.status) }}
                >
                  <option value="pending">{t('pending')}</option>
                  <option value="processing">{t('processing')}</option>
                  <option value="shipped">{t('shipped')}</option>
                  <option value="delivered">{t('delivered')}</option>
                  <option value="cancelled">{t('cancelled')}</option>
                </select>
              </td>
              <td>
                <span className={getPaymentBadgeClass(order.paymentStatus)}>
                  {getPaymentLabel(order.paymentStatus)}
                </span>
              </td>
              <td className="order-cell--date">{formatDateTime(order.createdAt)}</td>
              <td className="order-cell--actions">
                <Link href={`/admin/orders/${order._id}`} className="order-btn-view">
                  <Eye size={16} />
                  <span>{t('viewDetail')}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}