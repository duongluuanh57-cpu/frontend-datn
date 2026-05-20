'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface BannerBackgroundProps {
  images: string[];
  currentImageIndex: number;
  altText: string;
}

export function BannerBackground({
  images,
  currentImageIndex,
  altText
}: BannerBackgroundProps) {
  const [visitedIndices, setVisitedIndices] = useState<number[]>([currentImageIndex]);

  useEffect(() => {
    if (!visitedIndices.includes(currentImageIndex)) {
      setVisitedIndices((prev) => [...prev, currentImageIndex]);
    }
  }, [currentImageIndex, visitedIndices]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {images.map((image, index) => {
        const isActive = index === currentImageIndex;
        const shouldRender = visitedIndices.includes(index);
        return (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-[1500ms] cubic-bezier(0.16, 1, 0.3, 1) ${
              isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-103 pointer-events-none'
            }`}
            style={{
              zIndex: isActive ? 1 : 0,
            }}
          >
            {shouldRender && image && (
              <Image
                src={image}
                alt={`${altText} - Slide ${index + 1}`}
                fill
                priority={index === 0 && !!image}
                unoptimized
                className="object-cover"
              />
            )}
            {/* Subtle gradient vignette to blend edges softly without blocking the image details */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-[#FFF5F5]/10 to-[#FFF5F5]/45 z-10" />
          </div>
        );
      })}
    </div>
  );
}
