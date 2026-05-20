'use client';

import React from 'react';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { Link } from '@/navigation';
import { UseProductFormReturn } from './useProductForm';

export function ProductFormToolbar({ formHelpers }: { formHelpers: UseProductFormReturn }) {
  const { t, isVi, isSubmitting, isImageUploading, formData } = formHelpers;
  const productId = (formHelpers as any).productId || (formHelpers as any).initialData?._id; // safe fallback or passing down

  return (
    <div className="admin-form-toolbar">
      <div className="admin-form-toolbar__left">
        <Link href="/admin/products" className="admin-back-link">
          <ChevronLeft size={18} />
          {t('backToList')}
        </Link>
        <div>
          <p className="admin-form-toolbar__title">
            {productId ? t('editProduct') : t('createProduct')}
          </p>
          <p className="admin-form-toolbar__subtitle">L&apos;essence Creative Studio</p>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting || isImageUploading} 
        className="admin-btn-submit"
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
  );
}
