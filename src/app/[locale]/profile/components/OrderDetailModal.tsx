'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UseUserProfileReturn } from '@/hooks/useUserProfile';

interface OrderDetailModalProps {
  userProfile: UseUserProfileReturn;
}

export function OrderDetailModal({ userProfile }: OrderDetailModalProps) {
  const { selectedOrder, setSelectedOrder } = userProfile;

  return (
    <AnimatePresence>
      {selectedOrder && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="profile-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <motion.div 
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="profile-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-modal-header">
              <h2>Chi tiết đơn hàng</h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="profile-modal-close-btn"
              >
                &times;
              </button>
            </div>

            <div className="profile-modal-body">
              
              {/* Section 1: General Info */}
              <div className="profile-modal-section">
                <h3>Thông tin chung</h3>
                <div className="profile-modal-info-grid">
                  <div className="profile-info-item">
                    <span className="profile-info-label">Mã đơn hàng</span>
                    <span className="profile-info-value" style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700 }}>
                      {selectedOrder._id.toUpperCase()}
                    </span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">Trạng thái</span>
                    <span className={`profile-order-status ${selectedOrder.status}`} style={{ alignSelf: 'flex-start', marginTop: '2px' }}>
                      {selectedOrder.status === 'delivered' ? 'Đã giao hàng' : 
                       selectedOrder.status === 'pending' ? 'Chờ xử lý' :
                       selectedOrder.status === 'processing' ? 'Đang xử lý' :
                       selectedOrder.status === 'shipped' ? 'Đang giao' : 'Đã hủy'}
                    </span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">Ngày đặt hàng</span>
                    <span className="profile-info-value">
                      {new Date(selectedOrder.createdAt).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">Phương thức nhận hàng</span>
                    <span className="profile-info-value">Giao hàng tận nơi</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Customer details */}
              <div className="profile-modal-section">
                <h3>Thông tin giao hàng</h3>
                <div className="profile-modal-info-grid">
                  <div className="profile-info-item" style={{ gridColumn: 'span 2' }}>
                    <span className="profile-info-label">Họ và tên người nhận</span>
                    <span className="profile-info-value">{selectedOrder.customerName}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">Số điện thoại</span>
                    <span className="profile-info-value">{selectedOrder.customerPhone || 'Chưa cung cấp'}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">Địa chỉ email</span>
                    <span className="profile-info-value">{selectedOrder.customerEmail}</span>
                  </div>
                  <div className="profile-info-item" style={{ gridColumn: 'span 2' }}>
                    <span className="profile-info-label">Địa chỉ cụ thể</span>
                    <span className="profile-info-value" style={{ lineHeight: '1.4' }}>
                      {selectedOrder.customerAddress || 'Giao theo thông tin đăng ký hồ sơ'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Order Items */}
              <div className="profile-modal-section">
                <h3>Sản phẩm đã mua</h3>
                <div className="profile-modal-items">
                  {(Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0) ? (
                    selectedOrder.items.map((item: any, idx: number) => {
                      const itemTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.price || 0) * (item.quantity || 1));
                      const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0);
                      const itemName = item.name || item.productName || 'Sản phẩm';
                      const itemImage = item.image || item.imageUrl || 'https://i.ibb.co/qFf0N0kH/perfume1.webp';
                      
                      return (
                        <div key={idx} className="profile-modal-item-row">
                          <img 
                            src={itemImage} 
                            alt={itemName} 
                            className="profile-modal-item-img"
                          />
                          <div className="profile-modal-item-details">
                            <div className="profile-modal-item-name">{itemName}</div>
                            <div className="profile-modal-item-meta">
                              Số lượng: {item.quantity || 1} &times; {formattedPrice}
                            </div>
                          </div>
                          <div className="profile-modal-item-price">
                            {itemTotal}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                      Không có thông tin chi tiết sản phẩm
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Payment summary */}
              <div className="profile-modal-summary">
                <div className="profile-summary-row">
                  <span>Tạm tính</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalAmount || 0)}</span>
                </div>
                <div className="profile-summary-row">
                  <span>Phí vận chuyển</span>
                  <span style={{ color: '#27ae60', fontWeight: 600 }}>
                    {selectedOrder.shippingFee ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.shippingFee) : 'Miễn phí'}
                  </span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="profile-summary-row">
                    <span>Giảm giá</span>
                    <span style={{ color: '#e74c3c', fontWeight: 600 }}>
                      -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.discount)}
                    </span>
                  </div>
                )}
                <div className="profile-summary-row total">
                  <span>Tổng tiền thanh toán</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalAmount || 0)}</span>
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
