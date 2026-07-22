'use client';

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-foreground/5 border border-border rounded-2xl overflow-hidden animate-pulse">
          <div className="aspect-[3/4] bg-text-muted/10" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-text-muted/10 rounded w-1/3" />
            <div className="h-4 bg-text-muted/10 rounded w-2/3" />
            <div className="h-5 bg-text-muted/10 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-foreground/5 rounded-lg p-4 flex gap-4 animate-pulse">
          <div className="w-16 h-16 bg-foreground/5 rounded flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-3/4 bg-foreground/5 rounded" />
            <div className="h-4 w-1/3 bg-foreground/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FavoritesGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-border rounded-xl overflow-hidden shadow-soft animate-pulse">
          <div className="aspect-[3/4] bg-foreground/5" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-foreground/5 rounded w-1/3" />
            <div className="h-4 bg-foreground/5 rounded w-2/3" />
            <div className="h-5 bg-foreground/5 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}