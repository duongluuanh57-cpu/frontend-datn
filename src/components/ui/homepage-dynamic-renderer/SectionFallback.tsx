'use client';

import React from 'react';

export function SectionFallback({ height }: { height?: string }) {
  return (
    <div
      className="w-full py-12 lg:py-20 bg-transparent animate-pulse"
      style={height ? { height } : undefined}
    >
      <div className="max-w-container mx-auto px-6">
        <div className="h-20 w-1/3 bg-[#7A5C5C]/5 rounded-2xl mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-6">
              <div className="aspect-square w-full rounded-2xl bg-[#7A5C5C]/5" />
              <div className="flex flex-col items-center gap-3">
                <div className="h-3 w-16 rounded bg-[#7A5C5C]/5" />
                <div className="h-4 w-32 rounded bg-[#7A5C5C]/5" />
                <div className="h-5 w-20 rounded bg-[#7A5C5C]/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SmallSectionFallback({ height }: { height?: string }) {
  return <div className={`w-full bg-transparent ${height || 'h-[180px]'}`} />;
}