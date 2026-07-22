'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const p: (number | string)[] = [1];
    if (currentPage > 3) p.push('...');
    const s = Math.max(2, currentPage - 1);
    const e = Math.min(totalPages - 1, currentPage + 1);
    for (let i = s; i <= e; i++) p.push(i);
    if (currentPage < totalPages - 2) p.push('...');
    p.push(totalPages);
    return p;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center justify-center gap-2 mt-10 pb-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-foreground/5 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronLeft size={18} />
      </button>
      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`d-${idx}`} className="w-10 h-10 flex items-center justify-center text-text-muted">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`w-10 h-10 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
              currentPage === page
                ? 'bg-primary text-rich-black shadow-sm'
                : 'bg-foreground/5 border border-border text-text-secondary hover:border-primary'
            }`}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-foreground/5 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}