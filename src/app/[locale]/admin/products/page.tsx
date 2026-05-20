'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useProductCatalog } from '@/hooks/useProductCatalog';
import { ProductHeader } from './components/ProductHeader';
import { ProductFilterBar } from './components/ProductFilterBar';
import { ProductTable } from './components/ProductTable';
import { ProductPagination } from './components/ProductPagination';
import { ProductModals } from './components/ProductModals';

export default function AdminProductsPage() {
  const catalog = useProductCatalog();
  const { error, t } = catalog;

  if (error) {
    return (
      <div className="admin-alert">
        <AlertCircle className="admin-alert__icon" />
        <h2 className="admin-alert__title">{t('errorTitle')}</h2>
        <p className="admin-alert__text">{t('errorText')}</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <ProductHeader />
      <ProductFilterBar catalog={catalog} />
      <ProductTable catalog={catalog} />
      <ProductPagination catalog={catalog} />
      <ProductModals catalog={catalog} />
    </div>
  );
}
