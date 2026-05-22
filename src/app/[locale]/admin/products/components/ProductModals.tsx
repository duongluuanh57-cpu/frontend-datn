'use client';

import React from 'react';
import { Product } from '@/types/admin';
import { SingleDeleteModal } from './product-modals/SingleDeleteModal';
import { BulkDeleteModal } from './product-modals/BulkDeleteModal';

interface ProductModalsProps {
  productToDelete: Product | null;
  setProductToDelete: (product: Product | null) => void;
  showBulkDeleteModal: boolean;
  setShowBulkDeleteModal: (show: boolean) => void;
  deleteMutation: { mutate: (id: string) => void; isPending: boolean };
  bulkDeleteMutation: { mutate: (ids: string[]) => void; isPending: boolean };
  products: Product[];
  selectedIds: string[];
  isVi: boolean;
}

export function ProductModals({
  productToDelete, setProductToDelete,
  showBulkDeleteModal, setShowBulkDeleteModal,
  deleteMutation, bulkDeleteMutation,
  products, selectedIds, isVi,
}: ProductModalsProps) {
  return (
    <>
      <SingleDeleteModal
        isVi={isVi}
        productToDelete={productToDelete}
        setProductToDelete={setProductToDelete}
        deleteMutation={deleteMutation}
      />
      <BulkDeleteModal
        isVi={isVi}
        products={products}
        showBulkDeleteModal={showBulkDeleteModal}
        setShowBulkDeleteModal={setShowBulkDeleteModal}
        bulkDeleteMutation={bulkDeleteMutation}
        selectedIds={selectedIds}
      />
    </>
  );
}
