'use client';

import React from 'react';
import Image from 'next/image';
import { Trash2, Loader2 } from 'lucide-react';
import { resolveImageUrl } from '@/lib/api';
import { formatSizeString } from '@/components/admin/ProductForm';
import { UseProductCatalogReturn } from '@/hooks/useProductCatalog';

interface SingleDeleteModalProps {
  catalog: UseProductCatalogReturn;
}

export function SingleDeleteModal({ catalog }: SingleDeleteModalProps) {
  const {
    isVi,
    productToDelete,
    setProductToDelete,
    deleteMutation,
  } = catalog;

  if (!productToDelete) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(30, 20, 15, 0.45)',
        backdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.3s ease',
      }}
      onClick={() => {
        if (!deleteMutation.isPending) {
          setProductToDelete(null);
        }
      }}
    >
      <div
        style={{
          background: 'var(--admin-surface, #ffffff)',
          border: '1px solid var(--admin-border, #e8e0da)',
          borderRadius: 'var(--admin-radius-lg, 20px)',
          padding: '32px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon & Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'rgba(239, 68, 68, 0.9)',
              padding: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.05)',
            }}
          >
            <Trash2 size={32} />
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--admin-text, #3d2e24)',
              }}
            >
              {isVi ? 'Xóa sản phẩm' : 'Delete Product'}
            </h3>
            <p
              style={{
                margin: '8px 0 0 0',
                fontSize: '0.875rem',
                color: 'var(--admin-text-secondary, #6b564c)',
                lineHeight: 1.5,
              }}
            >
              {isVi
                ? 'Bạn có chắc chắn muốn xóa sản phẩm '
                : 'Are you sure you want to delete product '}
              <strong style={{ color: 'var(--admin-accent, #5c4a42)' }}>
                {productToDelete.name}
              </strong>
              {isVi
                ? '? Thao tác này không thể hoàn tác và sẽ gỡ bỏ sản phẩm vĩnh viễn.'
                : '? This action is permanent and cannot be undone.'}
            </p>
          </div>
        </div>

        {/* Product Card Preview inside Modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--admin-surface-muted, #faf8f6)',
            border: '1px solid var(--admin-border-subtle, #f0e9e4)',
            borderRadius: '12px',
            padding: '12px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.1)',
              flexShrink: 0,
            }}
          >
            {productToDelete.image && (
              <Image
                src={resolveImageUrl(productToDelete.image)}
                alt={productToDelete.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--admin-text, #3d2e24)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {productToDelete.name}
            </p>
            <p
              style={{
                margin: '2px 0 0 0',
                fontSize: '0.75rem',
                color: 'var(--admin-text-muted, #9a857c)',
              }}
            >
              {productToDelete.brand} • {formatSizeString(productToDelete.size)}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button
            type="button"
            disabled={deleteMutation.isPending}
            onClick={() => setProductToDelete(null)}
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
              deleteMutation.mutate(productToDelete._id);
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
            ) : isVi ? (
              'Xác nhận xóa'
            ) : (
              'Confirm Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
