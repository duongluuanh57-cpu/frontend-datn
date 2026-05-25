'use client';

import React from 'react';
import { AlertCircle, Loader2, Ticket } from 'lucide-react';
import type { UseAdminVouchersReturn } from '@/hooks/useAdminVouchers';

interface VoucherModalsProps {
  adminVouchers: UseAdminVouchersReturn;
}

export function VoucherModals({ adminVouchers }: VoucherModalsProps) {
  const {
    voucherToDelete,
    setVoucherToDelete,
    deleteMutation,
    isVi,
    showBulkDeleteModal,
    setShowBulkDeleteModal,
    selectedIds,
    selectedVoucherCodes,
    bulkDeleteMutation
  } = adminVouchers;

  return (
    <>
      {/* Modal xóa đơn */}
      {voucherToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(30, 20, 15, 0.45)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
        }}>
          <div style={{
            background: 'var(--admin-surface, #ffffff)',
            border: '1px solid var(--admin-border-subtle, #f0e9e4)',
            borderRadius: '24px',
            padding: '28px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 24px 48px rgba(30, 20, 15, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '16px',
                padding: '12px',
                color: 'var(--admin-danger, #ef4444)',
                flexShrink: 0,
              }}>
                <AlertCircle size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--admin-text, #3d2e24)' }}>
                  {isVi ? 'Xác nhận xóa mã giảm giá' : 'Confirm Delete Voucher'}
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', lineHeight: '1.4', color: 'var(--admin-text-secondary, #6b564c)' }}>
                  {isVi
                    ? `Bạn có chắc chắn muốn xóa vĩnh viễn mã giảm giá này? Hành động này không thể hoàn tác.`
                    : `Are you sure you want to permanently delete this voucher? This cannot be undone.`}
                </p>
              </div>
            </div>

            {/* Voucher details preview card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--admin-surface-muted, #faf8f6)',
              border: '1px solid var(--admin-border-subtle, #f0e9e4)',
              borderRadius: '16px',
              padding: '12px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'rgba(212, 165, 165, 0.1)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ticket className="text-[#D4A5A5]" size={20} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--admin-text, #3d2e24)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                  {voucherToDelete.code}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted, #9a857c)' }}>
                  {voucherToDelete.type === 'percentage' ? `${voucherToDelete.value}%` : `${voucherToDelete.value.toLocaleString()}đ`}
                  {' · '}
                  {voucherToDelete.status === 'active' ? (isVi ? 'Đang hoạt động' : 'Active') : (isVi ? 'Tắt' : 'Inactive')}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => setVoucherToDelete(null)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--admin-border, #e8e0da)',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--admin-text-secondary, #6b564c)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!deleteMutation.isPending) {
                    e.currentTarget.style.background = 'rgba(61, 46, 36, 0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {isVi ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  deleteMutation.mutate(voucherToDelete._id);
                }}
                style={{
                  flex: 1,
                  background: 'var(--admin-danger, #ef4444)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!deleteMutation.isPending) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'var(--admin-danger, #ef4444)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                }}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isVi ? 'Đang xóa...' : 'Deleting...'}
                  </>
                ) : (
                  isVi ? 'Xác nhận xóa' : 'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xóa hàng loạt */}
      {showBulkDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(30, 20, 15, 0.45)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
        }}>
          <div style={{
            background: 'var(--admin-surface, #ffffff)',
            border: '1px solid var(--admin-border-subtle, #f0e9e4)',
            borderRadius: '24px',
            padding: '28px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 24px 48px rgba(30, 20, 15, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '16px',
                padding: '12px',
                color: 'var(--admin-danger, #ef4444)',
                flexShrink: 0,
              }}>
                <AlertCircle size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--admin-text, #3d2e24)' }}>
                  {isVi ? 'Xác nhận xóa hàng loạt' : 'Confirm Bulk Deletion'}
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', lineHeight: '1.4', color: 'var(--admin-text-secondary, #6b564c)' }}>
                  {isVi
                    ? `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} mã giảm giá đã chọn? Thao tác này không thể hoàn tác.`
                    : `Are you sure you want to permanently delete the ${selectedIds.length} selected vouchers? This cannot be undone.`}
                </p>
              </div>
            </div>

            {/* Scrollable list of selected items */}
            <div style={{
              background: 'var(--admin-surface-muted, #faf8f6)',
              border: '1px solid var(--admin-border-subtle, #f0e9e4)',
              borderRadius: '12px',
              padding: '12px',
              maxHeight: '130px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              {Array.from(selectedVoucherCodes.entries()).filter(([id]) => selectedIds.includes(id)).map(([id, code]) => (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--admin-text-secondary, #6b564c)' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--admin-accent-hover, #D4A5A5)' }} />
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {code}
                  </span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                disabled={bulkDeleteMutation.isPending}
                onClick={() => setShowBulkDeleteModal(false)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--admin-border, #e8e0da)',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--admin-text-secondary, #6b564c)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!bulkDeleteMutation.isPending) {
                    e.currentTarget.style.background = 'rgba(61, 46, 36, 0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {isVi ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={bulkDeleteMutation.isPending}
                onClick={() => {
                  bulkDeleteMutation.mutate(selectedIds);
                }}
                style={{
                  flex: 1,
                  background: 'var(--admin-danger, #ef4444)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!bulkDeleteMutation.isPending) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'var(--admin-danger, #ef4444)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                }}
              >
                {bulkDeleteMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isVi ? 'Đang xóa...' : 'Deleting...'}
                  </>
                ) : (
                  isVi ? 'Xác nhận xóa' : 'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}