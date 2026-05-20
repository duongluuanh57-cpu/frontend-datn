'use client';

import React from 'react';
import { UseProductCatalogReturn } from '@/hooks/useProductCatalog';
import { SingleDeleteModal } from './product-modals/SingleDeleteModal';
import { BulkDeleteModal } from './product-modals/BulkDeleteModal';

interface ProductModalsProps {
  catalog: UseProductCatalogReturn;
}

export function ProductModals({ catalog }: ProductModalsProps) {
  return (
    <>
      <SingleDeleteModal catalog={catalog} />
      <BulkDeleteModal catalog={catalog} />
    </>
  );
}
