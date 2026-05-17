import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { FadeIn } from '@/components/animations/FadeIn';

// Giả lập dữ liệu cho Programmatic SEO
const SCENTS = {
  'go-dan-huong': { name: 'Gỗ đàn hương', description: 'Mùi hương ấm áp, sang trọng và đầy bí ẩn.' },
  'hoa-hong': { name: 'Hoa hồng', description: 'Sự lãng mạn kinh điển, tinh tế và quyến rũ.' },
  'cam-citrus': { name: 'Cam Citrus', description: 'Tươi mát, năng động và tràn đầy năng lượng.' }
};

export async function generateStaticParams() {
  return Object.keys(SCENTS).map((slug) => ({ slug }));
}

export default async function ScentPage({ 
  params 
}: { 
  params: Promise<{ locale: string, slug: string }> 
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  
  const scent = SCENTS[slug as keyof typeof SCENTS];
  
  if (!scent) {
    notFound();
  }

  return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <FadeIn>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{scent.name}</h1>
        <p style={{ fontSize: '1.5rem', color: '#666' }}>{scent.description}</p>
        <div style={{ marginTop: '2rem', padding: '2rem', border: '1px solid #eee', borderRadius: '1rem' }}>
          Đây là trang đích được tạo tự động cho nốt hương <strong>{scent.name}</strong>.
        </div>
      </FadeIn>
    </div>
  );
}
