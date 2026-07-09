'use client';

import { useCallback } from 'react';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: (newState: boolean) => void;
  onFloat?: (x: number, y: number) => void;
  className?: string;
  size?: number;
}

export function FavoriteButton({ isFavorite, onToggle, onFloat, className = '', size = 16 }: FavoriteButtonProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const next = !isFavorite;
    onToggle(next);
    if (next) {
      const rect = e.currentTarget.getBoundingClientRect();
      onFloat?.(rect.left + rect.width / 2, rect.top);
    }
  }, [isFavorite, onToggle, onFloat]);

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-md transition-colors cursor-pointer ${className}`}
    >
      <Heart
        size={size}
        className={`transition-all duration-200 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
      />
    </button>
  );
}
