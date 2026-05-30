'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    selectedCategory: filters.selectedCategory,
    sortBy: filters.sortBy,
  });
  const selection = useProductSelection(products);
  const deletes = useProductDelete(filters.isVi, selection.setSelectedIds);

  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const handleDeleteWithAnimation = (id: string) => {
    setDeletingIds(prev => [...prev, id]);
    deletes.setProductToDelete(null);
    setTimeout(() => deletes.deleteMutation.mutate(id), 400);
  };

  const handleBulkDeleteWithAnimation = (ids: string[]) => {
    setDeletingIds(prev => [...prev, ...ids]);
    deletes.setShowBulkDeleteModal(false);
    setTimeout(() => deletes.bulkDeleteMutation.mutate(ids), 400);
  };

  const animatedDeleteMutation = {
    mutate: handleDeleteWithAnimation,
    isPending: deletes.deleteMutation.isPending,
  };

  const animatedBulkDeleteMutation = {
    mutate: handleBulkDeleteWithAnimation,
    isPending: deletes.bulkDeleteMutation.isPending,
  };

  const prevProductsKeyRef = useRef('');

  useEffect(() => {
    const key = products.map(p => p._id).join(',');
    if (prevProductsKeyRef.current === key) return;
    prevProductsKeyRef.current = key;
    setDeletingIds(prev => {
      const ids = new Set(products.map(p => p._id));
      const next = prev.filter(id => ids.has(id));
      return next.length === prev.length && next.every((id, i) => id === prev[i]) ? prev : next;
    });
  }, [products]);

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
        deletingIds={deletingIds}
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
        deleteMutation={animatedDeleteMutation}
        bulkDeleteMutation={animatedBulkDeleteMutation}
        products={products}
        selectedIds={selection.selectedIds}
        isVi={filters.isVi}
      />
    </div>
  );
}
