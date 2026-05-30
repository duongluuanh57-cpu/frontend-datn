'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';

export function useProfileOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = useCallback(async (start?: string, end?: string, st?: string) => {
    setLoadingOrders(true);
    setOrdersError(null);
    try {
      let url = '/orders/my-orders';
      const params: string[] = [];
      if (start) params.push(`startDate=${start}`);
      if (end) params.push(`endDate=${end}`);
      if (st && st !== 'all') params.push(`status=${st}`);
      if (params.length > 0) url += `?${params.join('&')}`;
      const res = await api.get(url);
      if (res.data && res.data.success) {
        setOrders(res.data.data);
      } else {
        setOrdersError(res.data?.message || 'Không thể lấy dữ liệu đơn hàng');
      }
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setOrdersError(err.response?.data?.message || err.message || 'Lỗi kết nối đến máy chủ');
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  return {
    orders, setOrders,
    loadingOrders,
    ordersError,
    filterStartDate, setFilterStartDate,
    filterEndDate, setFilterEndDate,
    filterStatus, setFilterStatus,
    selectedOrder, setSelectedOrder,
    fetchOrders,
  };
}