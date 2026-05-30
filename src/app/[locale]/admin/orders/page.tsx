'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { OrderHeader } from './components/OrderHeader';
import { OrderFilterBar } from './components/OrderFilterBar';
import { OrderTable } from './components/OrderTable';
import { OrderPagination } from './components/OrderPagination';
import './orders.css';

export default function AdminOrdersPage() {
  const adminOrders = useAdminOrders();
  const { error, isVi, orders } = adminOrders;

  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const handleDeleteOrderWithAnimation = (orderId: string) => {
    setDeletingIds(prev => [...prev, orderId]);
    setTimeout(() => adminOrders.deleteMutation.mutate(orderId), 400);
  };

  const prevOrdersKeyRef = useRef('');

  useEffect(() => {
    const key = (orders || []).map(o => o._id).join(',');
    if (prevOrdersKeyRef.current === key) return;
    prevOrdersKeyRef.current = key;
    setDeletingIds(prev => {
      const ids = new Set((orders || []).map(o => o._id));
      const next = prev.filter(id => ids.has(id));
      return next.length === prev.length && next.every((id, i) => id === prev[i]) ? prev : next;
    });
  }, [orders]);

  const modifiedAdminOrders = {
    ...adminOrders,
    handleDeleteOrder: handleDeleteOrderWithAnimation,
  };

  if (error) {
    return (
      <div className="admin-alert">
        <AlertCircle className="admin-alert__icon" />
        <h2 className="admin-alert__title">
          {isVi ? 'Lỗi kết nối dữ liệu' : 'Data Connection Error'}
        </h2>
        <p className="admin-alert__text">
          {isVi 
            ? 'Không thể tải danh sách đơn hàng. Vui lòng kiểm tra lại kết nối server.' 
            : 'Unable to load orders. Please verify server connection.'}
        </p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <OrderHeader />
      <OrderFilterBar adminOrders={adminOrders} />
      <OrderTable adminOrders={modifiedAdminOrders} deletingIds={deletingIds} />
      <OrderPagination adminOrders={adminOrders} />
    </div>
  );
}
