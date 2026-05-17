import { setRequestLocale } from 'next-intl/server';
import { FadeIn } from '@/components/animations/FadeIn';
import { ImageUploadPanel } from '@/components/ui/image-upload-panel';

export default async function UploadImagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <FadeIn>
        <ImageUploadPanel />
      </FadeIn>
    </div>
  );
}
