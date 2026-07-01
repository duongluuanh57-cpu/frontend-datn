'use client';

export default function ProfileLoading() {
  return (
    <div className="h-full bg-background max-w-7xl mx-auto px-4 py-4">
      <div className="h-full flex flex-col border border-border rounded-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Sidebar skeleton */}
          <div className="bg-surface border-b md:border-b-0 md:border-r border-border md:w-72 lg:w-80 flex-shrink-0 flex flex-col p-5 md:p-6 gap-6">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-surface/80 animate-pulse flex-shrink-0 ring-2 ring-border" />
              <div className="flex-1 space-y-2 min-w-0">
                <div className="h-5 w-36 bg-surface/80 rounded animate-pulse" />
                <div className="h-3 w-48 bg-surface/80 rounded animate-pulse" />
              </div>
            </div>

            {/* Nav tabs */}
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-surface/80 rounded-xl animate-pulse" />
              ))}
            </div>

            {/* Logout button */}
            <div className="mt-auto">
              <div className="h-10 bg-surface/80 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Right Content Area skeleton */}
          <div className="flex-1 min-h-0 overflow-y-auto bg-background/30">
            <div className="px-4 py-6 md:py-8">
              {/* Header: title + edit button */}
              <div className="flex items-center justify-between mb-6">
                <div className="h-8 w-56 bg-surface rounded-lg animate-pulse" />
                <div className="h-10 w-28 bg-surface rounded-lg animate-pulse" />
              </div>

              {/* Info rows — 2 cột grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-surface border border-border animate-pulse">
                    <div className="w-5 h-5 rounded bg-surface/80 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 bg-surface/80 rounded" />
                      <div className="h-5 w-36 bg-surface/80 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}