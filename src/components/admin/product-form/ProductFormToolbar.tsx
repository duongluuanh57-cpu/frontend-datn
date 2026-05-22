'use client';

import React from 'react';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { Link } from '@/navigation';

interface ProductFormToolbarProps {
  t: (key: string) => string;
  isVi: boolean;
  isSubmitting: boolean;
  isImageUploading: boolean;
  productId?: string;
}

export const ProductFormToolbar = React.memo(function ProductFormToolbar({
  t, isVi, isSubmitting, isImageUploading, productId,
}: ProductFormToolbarProps) {
  return (
    <div className="admin-form-toolbar">
      <div className="admin-form-toolbar__left">
        <div>
          <p className="admin-form-toolbar__title">
            {productId ? t('editProduct') : t('createProduct')}
          </p>
          <p className="admin-form-toolbar__subtitle">L'essence Creative Studio</p>
        </div>
      </div>

      <div className="admin-page-header__actions flex gap-2">
        <Link
          href="/admin/products"
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-[#7A5C5C]/60 hover:bg-gray-50 transition-all inline-flex items-center gap-2"
        >
          <ChevronLeft size={16} /> {isVi ? 'Quay lại' : 'Back'}
        </Link>
        <button
          type="submit"
          disabled={isSubmitting || isImageUploading}
          className="px-4 py-2 bg-[#7A5C5C] hover:bg-[#604444] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 inline-flex items-center gap-2"
        >
          {isSubmitting || isImageUploading ? (
            <Loader2 size={14} className="admin-btn__spinner" />
          ) : (
            <Save size={16} />
          )}
          {isImageUploading
            ? (isVi ? 'Đang tải ảnh...' : 'Uploading image...')
            : isSubmitting
              ? (isVi ? 'Đang lưu...' : 'Saving...')
              : t('saveToCollection')}
        </button>
      </div>
    </div>
  );
});
