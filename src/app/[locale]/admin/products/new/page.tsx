'use client';

import { useTranslations } from 'next-intl';
import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
  const t = useTranslations('Admin');
  return (
    <div className="admin-page">


      <ProductForm />
    </div>
  );
}
