'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAdminTaxonomy, type UseAdminTaxonomyReturn } from '@/hooks/useAdminTaxonomy';
import { TaxonomyHeader } from './components/TaxonomyHeader';
import { TaxonomyFilterBar } from './components/TaxonomyFilterBar';
import { TaxonomyTabs } from './components/TaxonomyTabs';
import { TaxonomyTable } from './components/TaxonomyTable';
import { TaxonomyPagination } from './components/TaxonomyPagination';
import { TaxonomyBulkActionBar } from './components/TaxonomyBulkActionBar';
import { TaxonomyModals } from './components/TaxonomyModals';
import { AlertCircle } from 'lucide-react';

export default function AdminTaxonomyPage() {
  const adminTaxonomy = useAdminTaxonomy();
  const { error, isVi, items } = adminTaxonomy;

  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const handleDeleteWithAnimation = (id: string) => {
    setDeletingIds(prev => [...prev, id]);
    adminTaxonomy.setItemToDelete(null);
    setTimeout(() => adminTaxonomy.deleteMutation.mutate(id), 400);
  };

  const handleBulkDeleteWithAnimation = (ids: string[]) => {
    setDeletingIds(prev => [...prev, ...ids]);
    adminTaxonomy.setShowBulkDeleteModal(false);
    setTimeout(() => adminTaxonomy.bulkDeleteMutation.mutate(ids), 400);
  };

  const prevItemsKeyRef = useRef('');

  useEffect(() => {
    const key = (items || []).map(i => i._id).join(',');
    if (prevItemsKeyRef.current === key) return;
    prevItemsKeyRef.current = key;
    setDeletingIds(prev => {
      const ids = new Set((items || []).map(i => i._id));
      const next = prev.filter(id => ids.has(id));
      return next.length === prev.length && next.every((id, i) => id === prev[i]) ? prev : next;
    });
  }, [items]);

  const modifiedAdminTaxonomy: UseAdminTaxonomyReturn = {
    ...adminTaxonomy,
    deleteMutation: { ...adminTaxonomy.deleteMutation, mutate: handleDeleteWithAnimation } as UseAdminTaxonomyReturn['deleteMutation'],
    bulkDeleteMutation: { ...adminTaxonomy.bulkDeleteMutation, mutate: handleBulkDeleteWithAnimation } as UseAdminTaxonomyReturn['bulkDeleteMutation'],
  };

  if (error) {
    return (
      <div className="admin-alert">
        <AlertCircle className="admin-alert__icon" />
        <h2 className="admin-alert__title">{isVi ? 'Lỗi kết nối dữ liệu' : 'Data Connection Error'}</h2>
        <p className="admin-alert__text">
          {isVi ? 'Không thể tải danh sách thuộc tính. Vui lòng kiểm tra lại kết nối server.' : 'Unable to load taxonomy catalog. Please verify server connection.'}
        </p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <TaxonomyHeader adminTaxonomy={adminTaxonomy} />
      <TaxonomyFilterBar adminTaxonomy={adminTaxonomy} />
      <TaxonomyTabs adminTaxonomy={adminTaxonomy} />
      <TaxonomyTable adminTaxonomy={adminTaxonomy} deletingIds={deletingIds} />
      <TaxonomyPagination adminTaxonomy={adminTaxonomy} />
      <TaxonomyBulkActionBar adminTaxonomy={adminTaxonomy} />
      <TaxonomyModals adminTaxonomy={modifiedAdminTaxonomy} />
    </div>
  );
}