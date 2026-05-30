'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const HomepageDynamicRenderer = dynamic(
  () => import('@/components/ui/homepage-dynamic-renderer').then(m => m.HomepageDynamicRenderer),
  { ssr: false }
);

export default function Page() {
  return (
    <main className="min-h-[80vh] bg-transparent flex flex-col">
      <Suspense>
        <HomepageDynamicRenderer />
      </Suspense>
    </main>
  );
}