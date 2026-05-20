import { setRequestLocale } from 'next-intl/server';
import { HomepageDynamicRenderer } from '@/components/ui/homepage-dynamic-renderer';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-[80vh] bg-transparent flex flex-col">
      <HomepageDynamicRenderer />
    </main>
  );
}
