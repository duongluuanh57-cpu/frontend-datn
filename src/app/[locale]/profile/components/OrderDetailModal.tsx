'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UseUserProfileReturn } from '@/hooks/useUserProfile';

const currencyFmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

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
            transition={{ duration: 0.2, ease: 'easeOut' }}
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
                      const itemTotal = currencyFmt.format((item.price || 0) * (item.quantity || 1));
                      const formattedPrice = currencyFmt.format(item.price || 0);
                      const itemName = item.name || item.productName || 'Sản phẩm';
                      const itemImage = item.image || item.imageUrl || 'https://i.ibb.co/qFf0N0kH/perfume1.webp';
                      const variants = item.variants || [];
                      const taxonomy = item.taxonomy || [];

                      const groupedTax = () => {
                        const groups: Record<string, string[]> = {};
                        taxonomy.forEach((t: any) => {
                          const key = t.taxonomyName || t.taxonomySlug || 'Khác';
                          if (!groups[key]) groups[key] = [];
                          groups[key].push(t.termName || t.termSlug);
                        });
                        return groups;
                      };
                      const taxGroups = groupedTax();
                      
                      return (
                          <div key={idx} className="profile-modal-item-row">
                            <img 
                              src={itemImage} 
                              alt={itemName} 
                              className="profile-modal-item-img"
                            />
                            <div className="profile-modal-item-details" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div className="profile-modal-item-name">{itemName}</div>
                              {variants.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {variants.map((v: any, vi: number) => (
                                    <span key={vi} style={{
                                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                                      padding: '2px 8px', background: 'rgba(212, 165, 165, 0.12)',
                                      borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
                                      color: 'var(--primary)', border: '1px solid rgba(212, 165, 165, 0.2)',
                                    }}>
                                      {v.size || 'Mặc định'}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {Object.keys(taxGroups).length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  {Object.entries(taxGroups).map(([taxName, terms]) => (
                                    <div key={taxName} style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'rgba(122, 92, 92, 0.5)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                        {taxName}:
                                      </span>
                                      {terms.map((term, ti) => (
                                        <span key={ti} style={{
                                          padding: '1px 6px', background: 'rgba(122, 92, 92, 0.06)',
                                          borderRadius: '4px', fontSize: '0.68rem',
                                          color: 'rgba(122, 92, 92, 0.7)', fontWeight: 500,
                                          border: '1px solid rgba(122, 92, 92, 0.1)',
                                        }}>
                                          {term}
                                        </span>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="profile-modal-item-meta" style={{ marginTop: 'auto' }}>
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
                  <span>{currencyFmt.format(selectedOrder.totalAmount || 0)}</span>
                </div>
                <div className="profile-summary-row">
                  <span>Phí vận chuyển</span>
                  <span style={{ color: '#27ae60', fontWeight: 600 }}>
                    {selectedOrder.shippingFee ? currencyFmt.format(selectedOrder.shippingFee) : 'Miễn phí'}
                  </span>
                </div>
                <div className="profile-summary-row">
                  <span>Voucher</span>
                  <span style={{ color: selectedOrder.voucherDiscount ? '#e74c3c' : 'rgba(122,92,92,0.5)', fontWeight: 600 }}>
                    {selectedOrder.voucherCode ? `${selectedOrder.voucherCode}: ` : ''}
                    {selectedOrder.voucherDiscount
                      ? `-${currencyFmt.format(selectedOrder.voucherDiscount)}`
                      : 'Không áp dụng'}
                  </span>
                </div>
                <div className="profile-summary-row total">
                  <span>Tổng tiền thanh toán</span>
                  <span>{currencyFmt.format(selectedOrder.totalAmount || 0)}</span>
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
