'use client';

export default function CartSkeleton() {
  return (
    <div className="bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-foreground/5 rounded-lg animate-pulse mb-8" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-foreground/5 rounded-lg p-4 flex gap-4 animate-pulse">
              <div className="w-16 h-16 bg-foreground/5 rounded flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-3/4 bg-foreground/5 rounded" />
                <div className="h-4 w-1/3 bg-foreground/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}