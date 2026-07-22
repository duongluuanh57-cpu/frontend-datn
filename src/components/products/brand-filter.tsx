'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface BrandItem { _id: string; name: string; status: string; productCount?: number; }

interface BrandFilterProps {
  selectedBrands: string[];
  onSelect: (brands: string[]) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function BrandFilter({ selectedBrands, onSelect, isOpen, onToggle }: BrandFilterProps) {
  const { data: brands, isLoading } = useQuery({
    queryKey: ['brands-all-list'],
    queryFn: async () => { const { data } = await api.get('/brands'); return (data.data || []) as BrandItem[]; },
    staleTime: 300_000,
  });

  const active = brands?.filter(b => b.status === 'active') || [];

  const toggleBrand = (brandName: string) => {
    if (selectedBrands.includes(brandName)) {
      onSelect(selectedBrands.filter(b => b !== brandName));
    } else {
      onSelect([...selectedBrands, brandName]);
    }
  };

  const buttonLabel = selectedBrands.length === 0
    ? 'Thương hiệu'
    : selectedBrands.length === 1
      ? selectedBrands[0]
      : `Đã chọn ${selectedBrands.length} thương hiệu`;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${
          selectedBrands.length > 0
            ? 'bg-primary/10 border-primary text-primary'
            : 'bg-background border-border text-text-primary hover:border-primary'
        }`}
      >
        <span className="truncate max-w-[120px]">{buttonLabel}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted flex-shrink-0">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="absolute top-full left-0 mt-2 w-64 bg-background border border-border rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-2 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-text-muted/10 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : active.length === 0 ? (
              <div className="p-4 text-center text-sm text-text-muted">Không có thương hiệu</div>
            ) : (
              <div className="p-1.5">
                {active.map(brand => {
                  const checked = selectedBrands.includes(brand.name);
                  return (
                    <button
                      key={brand._id}
                      onClick={() => toggleBrand(brand.name)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer text-left ${
                        checked ? 'bg-primary/10 text-primary' : 'bg-background text-text-primary hover:bg-foreground/5'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        checked ? 'bg-primary border-primary' : 'border-border bg-white'
                      }`}>
                        {checked && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-on-primary">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </div>
                      <span className="flex-1 truncate">{brand.name}</span>
                      {brand.productCount != null && (
                        <span className="text-xs text-text-muted flex-shrink-0">({brand.productCount})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}