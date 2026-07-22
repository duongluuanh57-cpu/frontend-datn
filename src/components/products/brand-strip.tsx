'use client';

import { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Grid3X3, ChevronLeft, ChevronRight } from 'lucide-react';
import api, { resolveImageUrl } from '@/lib/api';

interface BrandStripItem {
  _id: string;
  name: string;
  logo?: string;
  status: string;
}

interface BrandStripProps {
  selectedBrands: string[];
  onSelect: (brands: string[]) => void;
}

export function BrandStrip({ selectedBrands, onSelect }: BrandStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { data: brands } = useQuery({
    queryKey: ['brands-strip'],
    queryFn: async () => {
      const { data } = await api.get('/brands');
      return ((data?.data || []) as BrandStripItem[]).filter(b => b.status === 'active');
    },
    staleTime: 300_000,
  });

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [brands]);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const offset = el.offsetLeft - container.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
      container.scrollTo({ left: offset, behavior: 'smooth' });
      setTimeout(updateScrollState, 400);
    }
  }, [selectedBrands, brands]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 200;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    setTimeout(updateScrollState, 400);
  };

  // Skeleton loading khi chưa fetch xong
  if (!brands) {
    return (
      <div className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            {/* Skeleton "Tất cả" button */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0 w-[68px]">
              <div className="w-11 h-11 rounded-full border-2 border-border bg-surface animate-pulse" />
              <div className="h-2 bg-text-muted/10 rounded w-10 animate-pulse" />
            </div>
            <div className="w-px h-10 bg-border flex-shrink-0" />
            {/* Skeleton brand items */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-[68px]">
                <div className="w-11 h-11 rounded-full border-2 border-border bg-surface animate-pulse" />
                <div className="h-2 bg-text-muted/10 rounded w-10 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (brands.length === 0) return null;

  return (
    <div className="border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 flex items-center">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-surface/90 border border-border shadow-md hover:border-primary cursor-pointer"
          >
            <ChevronLeft size={16} className="text-text-primary" />
          </button>
        )}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex flex-1 items-center gap-2 py-3 overflow-x-auto scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <button
            onClick={() => onSelect([])}
            className={`flex flex-col items-center gap-1.5 flex-shrink-0 w-[68px] cursor-pointer transition-all duration-200 group ${
              selectedBrands.length === 0 ? 'opacity-100' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                selectedBrands.length === 0
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface group-hover:border-primary/50'
              }`}
            >
              <Grid3X3 size={18} className={selectedBrands.length === 0 ? 'text-primary' : 'text-text-muted group-hover:text-primary'} />
            </div>
            <span className={`text-[10px] leading-tight text-center truncate w-full ${
              selectedBrands.length === 0 ? 'text-primary font-semibold' : 'text-text-secondary'
            }`}>
              Tất cả
            </span>
          </button>

          <div className="w-px h-10 bg-border flex-shrink-0" />

          {brands.map((b) => {
            const isActive = selectedBrands.includes(b.name);
            const toggleBrand = () => {
              if (isActive) {
                onSelect(selectedBrands.filter(name => name !== b.name));
              } else {
                onSelect([...selectedBrands, b.name]);
              }
            };
            return (
              <button
                key={b._id}
                ref={isActive ? activeRef : undefined}
                onClick={toggleBrand}
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
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-surface/90 border border-border shadow-md hover:border-primary cursor-pointer"
          >
            <ChevronRight size={16} className="text-text-primary" />
          </button>
        )}
      </div>
    </div>
  );
}