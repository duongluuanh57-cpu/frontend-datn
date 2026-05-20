'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

export function ProductHeader() {
  const t = useTranslations('Admin');

  return (
    <header className="admin-page-header">
      <div>
        <h1 className="admin-page-header__title">{t('title')}</h1>
        <p className="admin-page-header__subtitle">
          {t('subtitle')}
        </p>
      </div>
      <div className="admin-page-header__actions">
        <Link href="/admin/products/new" className="admin-btn-primary">
          <Plus size={18} />
          {t('addNew')}
        </Link>
      </div>
    </header>
  );
}
