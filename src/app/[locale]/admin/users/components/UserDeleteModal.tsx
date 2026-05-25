'use client';

import React from 'react';
import { AlertCircle, Loader2, Users } from 'lucide-react';
import type { UseAdminUsersReturn } from '@/hooks/useAdminUsers';

interface UserDeleteModalProps {
  adminUsers: UseAdminUsersReturn;
}

export function UserDeleteModal({ adminUsers }: UserDeleteModalProps) {
  const {
    userToDelete,
    setUserToDelete,
    deleteMutation,
    showBulkDeleteModal,
    setShowBulkDeleteModal,
    selectedIds,
    selectedUserNames,
    bulkDeleteMutation
  } = adminUsers;

  return (
    <>
      {/* Modal xóa đơn */}
      {userToDelete && (
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
                  Xác nhận xóa người dùng
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', lineHeight: '1.4', color: 'var(--admin-text-secondary, #6b564c)' }}>
                  Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này? Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>

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
                <Users className="text-[#D4A5A5]" size={20} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text, #3d2e24)' }}>
                  {userToDelete.username}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted, #9a857c)' }}>
                  {userToDelete.email}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => setUserToDelete(null)}
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
                Hủy
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(userToDelete._id)}
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
                    Đang xóa...
                  </>
                ) : (
                  'Xác nhận xóa'
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
                  Xác nhận xóa hàng loạt
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', lineHeight: '1.4', color: 'var(--admin-text-secondary, #6b564c)' }}>
                  Bạn có chắc chắn muốn xóa vĩnh viễn {selectedIds.length} người dùng đã chọn? Thao tác này không thể hoàn tác.
                </p>
              </div>
            </div>

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
              {Array.from(selectedUserNames.entries()).filter(([id]) => selectedIds.includes(id)).map(([id, name]) => (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--admin-text-secondary, #6b564c)' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--admin-accent-hover, #D4A5A5)' }} />
                  <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name}
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
                Hủy
              </button>
              <button
                type="button"
                disabled={bulkDeleteMutation.isPending}
                onClick={() => bulkDeleteMutation.mutate(selectedIds)}
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
                    Đang xóa...
                  </>
                ) : (
                  'Xác nhận xóa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}