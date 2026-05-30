export default function Loading() {
  return (
    <main className="min-h-screen w-full bg-white flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Đang tải...</p>
      </div>
    </main>
  );
}