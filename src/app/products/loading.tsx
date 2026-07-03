export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="h-4 bg-text-muted/10 rounded w-32 mb-3 animate-pulse" />
          <div className="h-8 bg-text-muted/10 rounded w-48 animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <div className="h-10 w-32 bg-surface rounded-xl animate-pulse" />
          <div className="h-10 w-28 bg-surface rounded-xl animate-pulse" />
          <div className="h-10 w-36 bg-surface rounded-xl animate-pulse ml-auto" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-[3/4] bg-text-muted/10" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-text-muted/10 rounded w-1/3" />
                <div className="h-4 bg-text-muted/10 rounded w-2/3" />
                <div className="h-5 bg-text-muted/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
