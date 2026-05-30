'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import type { UseAdminOrdersReturn } from '@/hooks/useAdminOrders';
import { DateRangePicker } from './DateRangePicker';

interface OrderFilterBarProps {
  adminOrders: UseAdminOrdersReturn;
}

export function OrderFilterBar({ adminOrders }: OrderFilterBarProps) {
  const {
    isVi,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedPaymentStatus,
    setSelectedPaymentStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = adminOrders;

  const t = (key: string) => isVi 
    ? {
        searchPlaceholder: 'Tìm kiếm...',
        all: 'Tất cả',
        pending: 'Chờ xử lý',
        processing: 'Đang xử lý',
        shipped: 'Đã giao hàng',
        delivered: 'Đã nhận hàng',
        cancelled: 'Đã hủy',
        unpaid: 'Chưa thanh toán',
        paid: 'Đã thanh toán',
        refunded: 'Đã hoàn tiền',
        clearFilters: 'Xóa lọc',
        status: 'Trạng thái',
        payment: 'Thanh toán',
      }[key] || key
    : {
        searchPlaceholder: 'Search...',
        all: 'All',
        pending: 'Pending',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        unpaid: 'Unpaid',
        paid: 'Paid',
        refunded: 'Refunded',
        clearFilters: 'Clear',
        status: 'Status',
        payment: 'Payment',
      }[key] || key;

  const hasActiveFilters = !!(
    searchTerm ||
    selectedStatus !== 'all' ||
    selectedPaymentStatus !== 'all' ||
    startDate ||
    endDate
  );

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedPaymentStatus('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="admin-filter-bar">
      <div className="admin-filter-bar__search">
        <Search className="admin-filter-bar__search-icon" size={16} />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-filter-bar__search-input"
        />
      </div>

      {hasActiveFilters && (
        <button onClick={handleClearFilters} className="admin-filter-clear">
          <X size={14} />
          <span>{t('clearFilters')}</span>
        </button>
      )}

      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="admin-filter-select"
      >
        <option value="all">{t('all')}</option>
        <option value="pending">{t('pending')}</option>
        <option value="processing">{t('processing')}</option>
        <option value="shipped">{t('shipped')}</option>
        <option value="delivered">{t('delivered')}</option>
        <option value="cancelled">{t('cancelled')}</option>
      </select>

      <select
        value={selectedPaymentStatus}
        onChange={(e) => setSelectedPaymentStatus(e.target.value)}
        className="admin-filter-select"
      >
        <option value="all">{t('all')}</option>
        <option value="unpaid">{t('unpaid')}</option>
        <option value="paid">{t('paid')}</option>
        <option value="refunded">{t('refunded')}</option>
      </select>

      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        isVi={isVi}
      />
    </div>
  );
}