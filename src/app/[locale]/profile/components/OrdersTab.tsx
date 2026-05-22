'use client';

import React, { useState } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp, Package, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { UseUserProfileReturn } from '@/hooks/useUserProfile';

interface OrdersTabProps {
  userProfile: UseUserProfileReturn;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'delivered', label: 'Đã giao hàng' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipped', label: 'Đang giao' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export function OrdersTab({ userProfile }: OrdersTabProps) {
  const {
    filterStartDate,
    setFilterStartDate,
    filterEndDate,
    setFilterEndDate,
    filterStatus,
    setFilterStatus,
    fetchOrders,
    loadingOrders,
    ordersError,
    orders,
    setSelectedOrder
  } = userProfile;

  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState('');

  const toggleExpand = (orderId: string) => {
    setExpandedId(expandedId === orderId ? null : orderId);
  };

  const applyMonthFilter = (month: string) => {
    setFilterMonth(month);
    if (month) {
      const [year, m] = month.split('-');
      const start = `${year}-${m}-01`;
      const lastDay = new Date(Number(year), Number(m), 0).getDate();
      const end = `${year}-${m}-${String(lastDay).padStart(2, '0')}`;
      setFilterStartDate(start);
      setFilterEndDate(end);
      fetchOrders(start, end, filterStatus);
    } else {
      setFilterStartDate('');
      setFilterEndDate('');
      fetchOrders('', '', filterStatus);
    }
  };

  const hasFilters = filterMonth || filterStatus !== 'all';

  const clearFilters = () => {
    setFilterMonth('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterStatus('all');
    fetchOrders('', '', 'all');
  };

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

      {/* 1. Filter Bar */}
      <div className="profile-order-filter-bar">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="profile-filter-input-group" style={{ minWidth: '100px', flex: '0 0 auto' }}>
            <label>Tháng</label>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => applyMonthFilter(e.target.value)}
              className="profile-filter-input"
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'flex-end', paddingBottom: '1px' }}>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setFilterStatus(opt.value);
                  fetchOrders(filterStartDate, filterEndDate, opt.value);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: filterStatus === opt.value ? 'var(--primary)' : 'rgba(122,92,92,0.07)',
                  color: filterStatus === opt.value ? '#fff' : 'rgba(122,92,92,0.65)',
                  transition: 'all 0.2s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="profile-filter-actions">
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="btn-profile-secondary"
              style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px', border: 'none' }}
            >
              <X size={12} strokeWidth={2} />
              Xóa
            </button>
          )}
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
            {hasFilters ? 'Không có đơn hàng nào khớp với bộ lọc hiện tại.' : 'Bạn chưa thực hiện bất kỳ giao dịch nào trên hệ thống.'}
          </p>
        </div>
      ) : (
        <div className="profile-order-list">
          {orders.map((order) => {
            const isExpanded = expandedId === order._id;
            const formattedDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            });
            const formattedTime = new Date(order.createdAt).toLocaleTimeString('vi-VN', {
              hour: '2-digit', minute: '2-digit'
            });

            const displayStatus =
              order.status === 'delivered' ? 'Đã giao hàng' :
              order.status === 'pending' ? 'Chờ xử lý' :
              order.status === 'processing' ? 'Đang xử lý' :
              order.status === 'shipped' ? 'Đang giao' : 'Đã hủy';

            const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0);

            const items = Array.isArray(order.items) ? order.items : [];
            const firstItemName = items[0]?.name || items[0]?.productName || 'Sản phẩm nước hoa';
            const itemsCount = items.length;

            const groupedTaxonomy = (item: any) => {
              const groups: Record<string, string[]> = {};
              (item.taxonomy || []).forEach((t: any) => {
                const key = t.taxonomyName || t.taxonomySlug || 'Khác';
                if (!groups[key]) groups[key] = [];
                groups[key].push(t.termName || t.termSlug);
              });
              return groups;
            };

            return (
              <div
                key={order._id}
                className="profile-order-item"
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: isExpanded ? '16px' : '0',
                  padding: '20px 24px',
                  background: 'rgba(255, 255, 255, 0.45)',
                  border: `1px solid rgba(255, 255, 255, ${isExpanded ? '0.85' : '0.65'})`,
                  borderRadius: '20px',
                  boxShadow: isExpanded
                    ? '0 8px 32px 0 rgba(122, 92, 92, 0.08)'
                    : '0 8px 32px 0 rgba(122, 92, 92, 0.02)',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Clickable Summary Row */}
                <div
                  onClick={() => toggleExpand(order._id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        letterSpacing: '0.03em'
                      }}>
                        MÃ ĐƠN: #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </span>
                      <div className={`profile-order-status ${order.status}`} style={{ margin: 0, padding: '3px 10px', borderRadius: '8px', fontSize: '0.72rem' }}>
                        {displayStatus}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'rgba(122, 92, 92, 0.55)' }}>
                      <span>{formattedDate} {formattedTime}</span>
                      <span>·</span>
                      <span style={{ fontWeight: 600, color: 'var(--content)' }}>
                        {itemsCount > 0 ? `${firstItemName}${itemsCount > 1 ? ` +${itemsCount - 1}` : ''}` : 'Đang cập nhật'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(122, 92, 92, 0.5)', marginBottom: '1px' }}>Tổng</div>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                        {formattedTotal}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={20} strokeWidth={1.5} color="var(--primary)" /> : <ChevronDown size={20} strokeWidth={1.5} color="var(--primary)" />}
                  </div>
                </div>

                {/* Expanded: Items Detail */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ borderTop: '1px dashed rgba(122, 92, 92, 0.15)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {items.length === 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.2)', borderRadius: '14px' }}>
                            <Package size={32} strokeWidth={1} style={{ color: 'rgba(122, 92, 92, 0.3)' }} />
                            <span style={{ fontSize: '0.85rem', color: 'rgba(122, 92, 92, 0.5)' }}>Chi tiết sản phẩm đang được cập nhật</span>
                          </div>
                        ) : (
                          items.map((item: any, idx: number) => {
                            const itemName = item.name || item.productName || 'Sản phẩm nước hoa';
                            const itemImage = item.image || item.imageUrl || 'https://i.ibb.co/qFf0N0kH/perfume1.webp';
                            const itemBrand = item.brand || "L'essence";
                            const itemPrice = item.price || 0;
                            const itemQty = item.quantity || 1;
                            const itemSubTotal = item.subTotal || itemPrice * itemQty;
                            const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(itemPrice);
                            const formattedSubTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(itemSubTotal);
                            const taxonomyGroups = groupedTaxonomy(item);
                            const variants = item.variants || [];

                            return (
                              <div key={idx} style={{
                                display: 'flex',
                                gap: '16px',
                                padding: '16px',
                                background: 'rgba(255,255,255,0.25)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.4)',
                              }}>
                                <img
                                  src={itemImage}
                                  alt={itemName}
                                  style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'cover',
                                    borderRadius: '14px',
                                    background: 'rgba(255, 255, 255, 0.3)',
                                    border: '1px solid rgba(255, 255, 255, 0.5)',
                                    flexShrink: 0,
                                  }}
                                />

                                <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <div>
                                    <h5
                                      onClick={() => setSelectedOrder(order)}
                                      style={{
                                        fontSize: '0.95rem',
                                        fontWeight: 700,
                                        color: 'var(--primary)',
                                        margin: '0 0 2px 0',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        textDecorationColor: 'rgba(212, 165, 165, 0.3)',
                                        textUnderlineOffset: '2px',
                                      }}
                                    >
                                      {itemName}
                                    </h5>
                                    <span style={{ fontSize: '0.78rem', color: 'rgba(122, 92, 92, 0.5)' }}>
                                      Thương hiệu: {itemBrand}
                                    </span>
                                  </div>

                                  {variants.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                      {variants.map((v: any, vi: number) => (
                                        <span key={vi} style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          padding: '3px 10px',
                                          background: 'rgba(212, 165, 165, 0.12)',
                                          borderRadius: '8px',
                                          fontSize: '0.72rem',
                                          fontWeight: 600,
                                          color: 'var(--primary)',
                                          border: '1px solid rgba(212, 165, 165, 0.2)',
                                        }}>
                                          {v.size || 'Mặc định'}
                                          {v.sku && <span style={{ fontWeight: 400, opacity: 0.6 }}>· {v.sku}</span>}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {Object.keys(taxonomyGroups).length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      {Object.entries(taxonomyGroups).map(([taxName, terms]) => (
                                        <div key={taxName} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(122, 92, 92, 0.5)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                            {taxName}:
                                          </span>
                                          {terms.map((term, ti) => (
                                            <span key={ti} style={{
                                              padding: '2px 8px',
                                              background: 'rgba(122, 92, 92, 0.06)',
                                              borderRadius: '6px',
                                              fontSize: '0.7rem',
                                              color: 'rgba(122, 92, 92, 0.7)',
                                              fontWeight: 500,
                                              border: '1px solid rgba(122, 92, 92, 0.1)',
                                            }}>
                                              {term}
                                            </span>
                                          ))}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {item.productRating > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <span key={i} style={{
                                          fontSize: '0.85rem',
                                          color: i < Math.round(item.productRating) ? '#D4A5A5' : 'rgba(212,165,165,0.2)',
                                          lineHeight: 1,
                                        }}>
                                          ★
                                        </span>
                                      ))}
                                      <span style={{ fontSize: '0.7rem', color: 'rgba(122, 92, 92, 0.5)', marginLeft: '4px' }}>
                                        ({item.productReviewsCount || 0})
                                      </span>
                                    </div>
                                  )}

                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '4px' }}>
                                    <span style={{ fontSize: '0.78rem', color: 'rgba(122, 92, 92, 0.55)' }}>
                                      {formattedPrice} × {itemQty}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <span
                                        onClick={() => router.push(`/product/${item.productId}`)}
                                        style={{
                                          padding: '6px 16px',
                                          fontSize: '0.82rem',
                                          fontWeight: 700,
                                          color: '#fff',
                                          background: 'var(--primary)',
                                          borderRadius: '10px',
                                          cursor: 'pointer',
                                          transition: 'opacity 0.2s',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          opacity: 0.85,
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.85')}
                                      >
                                        Mua lại →
                                      </span>
                                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                                        {formattedSubTotal}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
