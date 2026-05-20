'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import type { UseUserProfileReturn } from '@/hooks/useUserProfile';

interface OrdersTabProps {
  userProfile: UseUserProfileReturn;
}

export function OrdersTab({ userProfile }: OrdersTabProps) {
  const {
    filterStartDate,
    setFilterStartDate,
    filterEndDate,
    setFilterEndDate,
    fetchOrders,
    loadingOrders,
    ordersError,
    orders,
    setSelectedOrder
  } = userProfile;

  return (
    <motion.div
      key="orders"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%' }}
    >
      <div className="profile-section-header">
        <h1>Lịch sử mua sắm</h1>
        <p>Danh sách các mùi hương sang trọng bạn đã sở hữu</p>
      </div>

      {/* 1. Date Filter Bar */}
      <div className="profile-order-filter-bar">
        <div className="profile-filter-input-group">
          <label>Từ ngày</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="profile-filter-input"
          />
        </div>
        <div className="profile-filter-input-group">
          <label>Đến ngày</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="profile-filter-input"
          />
        </div>
        <div className="profile-filter-actions">
          <button
            onClick={() => fetchOrders(filterStartDate, filterEndDate)}
            className="btn-profile-primary"
            style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.85rem' }}
          >
            Lọc ngày
          </button>
          <button
            onClick={() => {
              setFilterStartDate('');
              setFilterEndDate('');
              fetchOrders('', '');
            }}
            className="btn-profile-secondary"
            style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.85rem' }}
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* 2. Orders Content */}
      {loadingOrders ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0', color: 'rgba(122, 92, 92, 0.6)' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Đang tải lịch sử đơn hàng...</span>
        </div>
      ) : ordersError ? (
        <div className="profile-alert danger" style={{ margin: '1.5rem 0' }}>
          {ordersError}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.3)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.5)' }}>
          <ShoppingBag size={48} strokeWidth={1} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.8 }} />
          <h3 style={{ fontFamily: 'var(--font-heading), serif', fontSize: '1.2rem', color: 'var(--content)', margin: '0 0 8px 0' }}>Không tìm thấy đơn hàng nào</h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(122, 92, 92, 0.6)', margin: 0, textAlign: 'center' }}>
            {(filterStartDate || filterEndDate) ? 'Không có đơn hàng nào khớp với khoảng thời gian lọc.' : 'Bạn chưa thực hiện bất kỳ giao dịch nào trên hệ thống.'}
          </p>
        </div>
      ) : (
        <div className="profile-order-list">
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
            
            const displayStatus = 
              order.status === 'delivered' ? 'Đã giao hàng' : 
              order.status === 'pending' ? 'Chờ xử lý' :
              order.status === 'processing' ? 'Đang xử lý' :
              order.status === 'shipped' ? 'Đang giao' : 'Đã hủy';

            // Format total amount to VND
            const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0);

            // Primary item or multiple items text
            const items = Array.isArray(order.items) ? order.items : [];
            const firstItemName = items[0]?.name || items[0]?.productName || 'Sản phẩm nước hoa';
            const itemsCount = items.length;
            const displayTitle = itemsCount > 1 ? `${firstItemName} và ${itemsCount - 1} sản phẩm khác` : firstItemName;

            return (
              <div 
                key={order._id} 
                className="profile-order-item"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="profile-order-info">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{displayTitle}</span>
                  </h4>
                  <p>
                    Mã đơn: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{order._id.substring(order._id.length - 8).toUpperCase()}</span> | Ngày mua: {formattedDate} | Tổng tiền: <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formattedTotal}</span>
                  </p>
                </div>
                <div className={`profile-order-status ${order.status}`}>
                  {displayStatus}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
