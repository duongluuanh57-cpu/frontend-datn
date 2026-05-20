'use client';

import React from 'react';
import { useProductForm, ProductFormData } from './product-form/useProductForm';
import { ProductFormToolbar } from './product-form/ProductFormToolbar';
import { ProductDetailsSection } from './product-form/ProductDetailsSection';
import { ProductMediaSection } from './product-form/ProductMediaSection';
import { ProductSEOSection } from './product-form/ProductSEOSection';
import { ProductFormModals } from './product-form/ProductFormModals';

export interface ProductFormProps {
  initialData?: ProductFormData;
  productId?: string;
}

export function ProductForm({ initialData, productId }: ProductFormProps) {
  const formHelpers = useProductForm({ initialData, productId });

  return (
    <>
      <form onSubmit={formHelpers.handleSubmit} className="admin-form-page">
        <ProductFormToolbar formHelpers={formHelpers} />

        <div className="admin-form-grid">
          {/* Cột trái: Thông tin sản phẩm */}
          <div className="admin-form-column-left">
            <ProductDetailsSection formHelpers={formHelpers} />
          </div>

          {/* Cột phải: Media & Phân loại, SEO */}
          <div className="admin-form-column-right">
            <ProductMediaSection formHelpers={formHelpers} />
            <ProductSEOSection formHelpers={formHelpers} />
          </div>
        </div>
      </form>

      {/* Render all overlay modals */}
      <ProductFormModals formHelpers={formHelpers} />
    </>
  );
}
export { formatSizeString } from './product-form/useProductForm';
export type { ProductFormData };

