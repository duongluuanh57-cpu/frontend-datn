'use client';

import React from 'react';
import { useAdminTaxonomy } from '@/hooks/useAdminTaxonomy';
import { TaxonomyHeader } from './components/TaxonomyHeader';
import { TaxonomyTabs } from './components/TaxonomyTabs';
import { TaxonomyTable } from './components/TaxonomyTable';
import { TaxonomyModal } from './components/TaxonomyModal';
import { AlertCircle } from 'lucide-react';

export default function AdminTaxonomyPage() {
  const adminTaxonomy = useAdminTaxonomy();
  const { error, isVi } = adminTaxonomy;

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
      <TaxonomyTabs adminTaxonomy={adminTaxonomy} />
      <TaxonomyTable adminTaxonomy={adminTaxonomy} />
      <TaxonomyModal adminTaxonomy={adminTaxonomy} />
    </div>
  );
}
