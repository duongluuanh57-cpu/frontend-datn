export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <div className="h-[50vh] md:h-[70vh] bg-surface/50 animate-pulse" />

      {/* Categories skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-6 w-32 bg-surface rounded-lg animate-pulse mb-6" />
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      </div>

      {/* Product sections skeleton — 3 sections matching homepage */}
      {[...Array(3)].map((_, section) => (
        <div key={section} className="max-w-7xl mx-auto px-4 py-10">
          {/* Section title + filter button */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-7 w-44 bg-surface rounded-lg animate-pulse" />
            <div className="h-9 w-24 bg-surface rounded-lg animate-pulse" />
          </div>
          {/* Product cards grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface rounded-xl overflow-hidden animate-pulse">
                {/* Product image */}
                <div className="aspect-square bg-surface/80" />
                {/* Product info */}
                <div className="p-3 space-y-2">
                  <div className="h-3 w-16 bg-surface/80 rounded" />
                  <div className="h-4 w-full bg-surface/80 rounded" />
                  <div className="h-4 w-3/4 bg-surface/80 rounded" />
                  <div className="h-5 w-20 bg-primary/20 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* USP section skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      </div>

      {/* Brands marquee skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8 justify-center">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-24 bg-surface rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="h-64 bg-surface/50 animate-pulse mt-12" />
    </div>
  );
}