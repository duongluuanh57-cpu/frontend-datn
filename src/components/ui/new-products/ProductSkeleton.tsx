'use client';

import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="aspect-square w-full animate-pulse rounded-2xl bg-[#7A5C5C]/5" />
      <div className="flex flex-col items-center gap-3">
        <div className="h-3 w-16 animate-pulse rounded bg-[#7A5C5C]/5" />
        <div className="h-4 w-32 animate-pulse rounded bg-[#7A5C5C]/5" />
        <div className="h-5 w-20 animate-pulse rounded bg-[#7A5C5C]/5" />
      </div>
    </div>
  );
}
