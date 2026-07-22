'use client';

type SortOption = 'newest' | 'priceAsc' | 'priceDesc' | 'bestSeller';

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Mới nhất',
  priceAsc: 'Giá: Thấp → Cao',
  priceDesc: 'Giá: Cao → Thấp',
  bestSeller: 'Bán chạy',
};

interface SortFilterProps {
  sortBy: SortOption;
  onChange: (value: SortOption) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function SortFilter({ sortBy, onChange, isOpen, onToggle }: SortFilterProps) {
  const value = SORT_LABELS[sortBy];

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${
          sortBy !== 'newest'
            ? 'bg-primary/10 border-primary text-primary'
            : 'bg-background border-border text-text-primary hover:border-primary'
        }`}
      >
        <span className="truncate max-w-[160px]">Sắp xếp: {value}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted flex-shrink-0">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="absolute top-full left-0 mt-2 w-56 bg-background border border-border rounded-xl shadow-xl z-50">
            <div className="p-1.5">
              {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { onChange(key); onToggle?.(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer text-left ${
                    sortBy === key ? 'bg-primary/10 text-primary font-medium' : 'bg-background text-text-primary hover:bg-foreground/5'
                  }`}
                >
                  {sortBy === key && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary flex-shrink-0">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                  <span className="flex-1">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}