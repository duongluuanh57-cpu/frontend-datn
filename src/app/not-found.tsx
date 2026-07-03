import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="p-1.5 rounded-[2rem] ring-1 ring-black/5 inline-block mb-8">
          <div className="bg-surface rounded-[calc(2rem-0.375rem)] px-8 py-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <span className="text-5xl md:text-6xl font-light text-text-primary tracking-tight">404</span>
          </div>
        </div>
        <h1 className="text-xl md:text-2xl font-medium text-text-primary mb-3">Trang không tồn tại</h1>
        <p className="text-sm text-text-secondary leading-relaxed mb-8">
          Trang bạn đang tìm kiếm không có hoặc đã bị di chuyển.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rich-black text-white rounded-xl text-sm font-medium hover:bg-foreground transition-[transform,background-color] duration-300 active:scale-[0.98]"
          >
            Mua sắm
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-text-primary rounded-xl text-sm font-medium hover:bg-background transition-[transform,background-color] duration-300 active:scale-[0.98]"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
