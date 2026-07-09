'use client';

import { useQuery } from '@tanstack/react-query';
import { Selector } from '@astryxdesign/core/Selector';
import api from '@/lib/api';

interface BrandItem { _id: string; name: string; status: string; productCount?: number; }

interface BrandFilterProps {
  selectedBrand: string;
  onSelect: (brandName: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function BrandFilter({ selectedBrand, onSelect }: BrandFilterProps) {
  const { data: brands } = useQuery({
    queryKey: ['brands-all-list'],
    queryFn: async () => { const { data } = await api.get('/brands'); return (data.data || []) as BrandItem[]; },
    staleTime: 300_000,
  });

  const active = brands?.filter(b => b.status === 'active') || [];

  return (
    <Selector
      label="Thương hiệu"
      isLabelHidden
      value={selectedBrand || null}
      onChange={(val) => onSelect(val || '')}
      options={active.map(b => ({value: b.name, label: b.name}))}
      placeholder="Thương hiệu"
      size="sm"
      renderOption={(option) => {
        const brand = active.find(b => b.name === option.label);
        return (
          <div className="flex items-center justify-between w-full">
            <span className="truncate whitespace-nowrap min-w-0">{option.label}</span>
            {brand?.productCount != null && (
              <span className="text-xs text-text-muted flex-shrink-0 ml-1">({brand.productCount})</span>
            )}
          </div>
        );
      }}
    />
  );
}
