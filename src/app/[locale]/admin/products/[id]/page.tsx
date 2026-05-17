import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { EditProductClient } from './EditProductClient';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

function EditProductFallback() {
  const t = useTranslations('Admin');
  return (
    <div className="admin-loading" style={{ minHeight: 320 }}>
      <Loader2 className="admin-loading__spinner" />
      <p>{t('loadingProduct')}</p>
    </div>
  );
}

async function EditProductLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditProductClient id={id} />;
}

export default function EditProductPage({ params }: PageProps) {
  return (
    <Suspense fallback={<EditProductFallback />}>
      <EditProductLoader params={params} />
    </Suspense>
  );
}
