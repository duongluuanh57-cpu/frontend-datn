'use client';

import { useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Grid3X3 } from 'lucide-react';
import api, { resolveImageUrl } from '@/lib/api';

interface BrandStripItem {
  _id: string;
  name: string;
  logo?: string;
  status: string;
}

interface BrandStripProps {
  selectedBrand: string;
  onSelect: (brandName: string) => void;
}

export function BrandStrip({ selectedBrand, onSelect }: BrandStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  const { data: brands } = useQuery({
    queryKey: ['brands-strip'],
    queryFn: async () => {
      const { data } = await api.get('/brands');
      return ((data?.data || []) as BrandStripItem[]).filter(b => b.status === 'active');
    },
    staleTime: 300_000,
  });

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const offset = el.offsetLeft - container.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
      container.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }, [selectedBrand, brands]);

  if (!brands || brands.length === 0) return null;

  return (
    <div className="border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div
          ref={scrollRef}
          className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <button
            onClick={() => onSelect('')}
            className={`flex flex-col items-center gap-1.5 flex-shrink-0 w-[68px] cursor-pointer transition-all duration-200 group ${
              !selectedBrand ? 'opacity-100' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                !selectedBrand
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface group-hover:border-primary/50'
              }`}
            >
              <Grid3X3 size={18} className={!selectedBrand ? 'text-primary' : 'text-text-muted group-hover:text-primary'} />
            </div>
            <span className={`text-[10px] leading-tight text-center truncate w-full ${
              !selectedBrand ? 'text-primary font-semibold' : 'text-text-secondary'
            }`}>
              Tất cả
            </span>
          </button>

          <div className="w-px h-10 bg-border flex-shrink-0" />

          {brands.map((b) => {
            const isActive = selectedBrand === b.name;
            return (
              <button
                key={b._id}
                ref={isActive ? activeRef : undefined}
                onClick={() => onSelect(b.name)}
                className={`flex flex-col items-center gap-1.5 flex-shrink-0 w-[68px] cursor-pointer transition-all duration-200 group ${
                  isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all duration-200 ${
                    isActive
                      ? 'border-primary shadow-sm shadow-primary/20'
                      : 'border-border bg-surface group-hover:border-primary/50'
                  }`}
                >
                  {b.logo ? (
                    <img
                      src={resolveImageUrl(b.logo)}
                      alt={b.name}
                      className="w-full h-full object-contain p-1.5"
                      loading="lazy"
                    />
                  ) : (
                    <span className={`text-sm font-bold ${
                      isActive ? 'text-primary' : 'text-text-muted'
                    }`}>
                      {b.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] leading-tight text-center truncate w-full ${
                  isActive ? 'text-primary font-semibold' : 'text-text-secondary'
                }`}>
                  {b.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
