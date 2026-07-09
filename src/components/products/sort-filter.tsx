'use client';

import { Selector } from '@astryxdesign/core/Selector';

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
}

export function SortFilter({ sortBy, onChange }: SortFilterProps) {
  const value = SORT_LABELS[sortBy];

  return (
    <Selector
      label="Sắp xếp"
      isLabelHidden
      options={Object.values(SORT_LABELS)}
      value={value}
      onChange={(val) => {
        const entry = Object.entries(SORT_LABELS).find(([, label]) => label === val);
        if (entry) onChange(entry[0] as SortOption);
      }}
      placeholder="Sắp xếp"
      size="sm"
    />
  );
}

