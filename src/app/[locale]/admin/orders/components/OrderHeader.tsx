'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export function OrderHeader() {
  const t = useTranslations('AdminOrders');

  return (
    <header className="admin-page-header">
      <div>
        <h1 className="admin-page-header__title">{t('title')}</h1>
        <p className="admin-page-header__subtitle">
          {t('subtitle')}
        </p>
      </div>
    </header>
  );
}
