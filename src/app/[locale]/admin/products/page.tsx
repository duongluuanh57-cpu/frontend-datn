'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useProductList } from '@/hooks/useProductList';
import { useProductFilters } from '@/hooks/useProductFilters';
import { useProductSelection } from '@/hooks/useProductSelection';
import { useProductDelete } from '@/hooks/useProductDelete';
import { ProductHeader } from './components/ProductHeader';
import { ProductFilterBar } from './components/ProductFilterBar';
import { ProductTable } from './components/ProductTable';
import { ProductPagination } from './components/ProductPagination';
import { ProductModals } from './components/ProductModals';

export default function AdminProductsPage() {
  const filters = useProductFilters();
  const { products, isLoading, error, currentPage, setCurrentPage, totalPages, total } = useProductList({
    searchQuery: filters.searchQuery,
    selectedBrand: filters.selectedBrand,
    stockFilter: filters.stockFilter,
    selectedTag: filters.selectedTag,
    sortBy: filters.sortBy,
  });
  const selection = useProductSelection(products);
  const deletes = useProductDelete(filters.isVi, selection.setSelectedIds);

  if (error) {
    return (
      <div className="admin-alert">
        <AlertCircle className="admin-alert__icon" />
        <h2 className="admin-alert__title">{filters.t('errorTitle')}</h2>
        <p className="admin-alert__text">{filters.t('errorText')}</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <ProductHeader />
      <ProductFilterBar filters={filters} />
      <ProductTable
        t={filters.t}
        locale={filters.locale}
        isVi={filters.isVi}
        products={products}
        isLoading={isLoading}
        total={total}
        selectedIds={selection.selectedIds}
        isAllSelected={selection.isAllSelected}
        isSomeSelected={selection.isSomeSelected}
        handleSelectAll={selection.handleSelectAll}
        handleSelectRow={selection.handleSelectRow}
        setProductToDelete={deletes.setProductToDelete}
      />
      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        setCurrentPage={setCurrentPage}
        isVi={filters.isVi}
      />
      <ProductModals
        productToDelete={deletes.productToDelete}
        setProductToDelete={deletes.setProductToDelete}
        showBulkDeleteModal={deletes.showBulkDeleteModal}
        setShowBulkDeleteModal={deletes.setShowBulkDeleteModal}
        deleteMutation={deletes.deleteMutation}
        bulkDeleteMutation={deletes.bulkDeleteMutation}
        products={products}
        selectedIds={selection.selectedIds}
        isVi={filters.isVi}
      />
    </div>
  );
}
