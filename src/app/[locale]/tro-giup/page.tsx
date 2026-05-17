import { setRequestLocale } from 'next-intl/server';
import { FadeIn } from '@/components/animations/FadeIn';

const ARTICLES = [
  { id: 1, title: 'Cách bảo quản nước hoa đúng cách', category: 'Hướng dẫn' },
  { id: 2, title: 'Phân biệt các tầng hương: Top, Heart, Base notes', category: 'Kiến thức' },
  { id: 3, title: 'Chính sách đổi trả trong 7 ngày', category: 'Chính sách' },
];

export default async function HelpCenterPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <FadeIn>
        <h1 className="text-4xl font-bold mb-8 text-center">Trung tâm trợ giúp Elite</h1>
        
        {/* Search Bar Placeholder */}
        <div className="relative mb-12">
          <input 
            type="text" 
            placeholder="Tìm kiếm câu trả lời bằng AI..." 
            className="w-full p-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <div className="absolute right-4 top-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        </div>

        <div className="grid gap-6">
          {ARTICLES.map((article) => (
            <div key={article.id} className="p-6 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{article.category}</span>
              <h2 className="text-xl font-medium mt-2">{article.title}</h2>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
