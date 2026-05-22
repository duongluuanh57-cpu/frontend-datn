'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { OrderHeader } from './components/OrderHeader';
import { OrderFilterBar } from './components/OrderFilterBar';
import { OrderTable } from './components/OrderTable';
import { OrderPagination } from './components/OrderPagination';
import './orders.css';

export default function AdminOrdersPage() {
  const adminOrders = useAdminOrders();
  const { error, isVi } = adminOrders;

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
      <OrderTable adminOrders={adminOrders} />
      <OrderPagination adminOrders={adminOrders} />
    </div>
  );
}
