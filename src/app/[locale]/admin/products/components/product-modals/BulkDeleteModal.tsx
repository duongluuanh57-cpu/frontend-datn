'use client';

import React from 'react';
import { Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Product } from '@/types/admin';

interface BulkDeleteModalProps {
  isVi: boolean;
  products: Product[];
  showBulkDeleteModal: boolean;
  setShowBulkDeleteModal: (show: boolean) => void;
  bulkDeleteMutation: { mutate: (ids: string[]) => void; isPending: boolean };
  selectedIds: string[];
}

export function BulkDeleteModal({
  isVi,
  products,
  showBulkDeleteModal,
  setShowBulkDeleteModal,
  bulkDeleteMutation,
  selectedIds,
}: BulkDeleteModalProps) {

  const selectedProducts = products?.filter((p) => selectedIds.includes(p._id)) || [];

  return (
    <>
      {selectedIds.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(30, 20, 15, 0.9)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            zIndex: 100,
            color: '#ffffff',
          }}
        >
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0e9e4' }}>
            {isVi
              ? `Đã chọn ${selectedIds.length} sản phẩm`
              : `${selectedIds.length} products selected`}
          </span>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255, 255, 255, 0.15)' }} />
          <button
            type="button"
            onClick={() => setShowBulkDeleteModal(true)}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              borderRadius: '8px',
              padding: '6px 16px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Trash2 size={14} />
            {isVi ? 'Xóa mục đã chọn' : 'Delete Selected'}
          </button>
        </div>
      )}

      {showBulkDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(30, 20, 15, 0.45)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
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
            }}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '16px',
                  padding: '12px',
                  color: 'var(--admin-danger, #ef4444)',
                  flexShrink: 0,
                }}
              >
                <AlertCircle size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--admin-text, #3d2e24)',
                  }}
                >
                  {isVi ? 'Xác nhận xóa hàng loạt' : 'Confirm Bulk Deletion'}
                </h3>
                <p
                  style={{
                    margin: '6px 0 0 0',
                    fontSize: '0.875rem',
                    lineHeight: '1.4',
                    color: 'var(--admin-text-secondary, #6b564c)',
                  }}
                >
                  {isVi
                    ? `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} sản phẩm đã chọn? Thao tác này sẽ dọn dẹp sạch toàn bộ dữ liệu ảnh trên Cloud và không thể hoàn tác.`
                    : `Are you sure you want to permanently delete the ${selectedIds.length} selected products? This will clean up all associated cloud images and cannot be undone.`}
                </p>
              </div>
            </div>

            <div
              style={{
                background: 'var(--admin-surface-muted, #faf8f6)',
                border: '1px solid var(--admin-border-subtle, #f0e9e4)',
                borderRadius: '12px',
                padding: '12px',
                maxHeight: '130px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {selectedProducts.map((p) => (
                <div
                  key={p._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.75rem',
                    color: 'var(--admin-text-secondary, #6b564c)',
                  }}
                >
                  <div
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: 'var(--admin-accent-hover, #D4A5A5)',
                    }}
                  />
                  <span
                    style={{
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.name}
                  </span>
                </div>
              ))}
            </div>

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
                ) : isVi ? (
                  'Xác nhận xóa'
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
