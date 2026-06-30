'use client';

import { useState, useEffect, useRef } from 'react';


interface FlipBadgeProps {
  value: number;
  className?: string;
}

export function FlipBadge({ value, className = '' }: FlipBadgeProps) {
  const [bouncing, setBouncing] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const [phase, setPhase] = useState<'idle' | 'hiding' | 'showing'>('idle');
  const [animDirection, setAnimDirection] = useState<'up' | 'down'>('down');
  const prevValueRef = useRef(value);


  useEffect(() => {
    if (value !== prevValueRef.current) {
      setBouncing(true);
      const bounceTimer = setTimeout(() => setBouncing(false), 400);
      const isIncreasing = value > prevValueRef.current;
      setAnimDirection(isIncreasing ? 'down' : 'up');
      
      // Phase 1: Hide current value with slide out animation
      setPhase('hiding');
      
      // Phase 2: After slide out completes, show new value with slide in
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setPhase('showing');
        prevValueRef.current = value;
      }, 300);

      // Phase 3: After slide in completes, back to idle
      const timer2 = setTimeout(() => {
        setPhase('idle');
      }, 600);

      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
        clearTimeout(bounceTimer);
      };
    }
  }, [value]);

  const displayText = value > 99 ? '99+' : value;

  const getAnimationClass = () => {
    if (phase === 'hiding') {
      return animDirection === 'down' ? 'animate-slide-out-down' : 'animate-slide-out-up';
    } else if (phase === 'showing') {
      return animDirection === 'down' ? 'animate-slide-in-from-top' : 'animate-slide-in-from-bottom';
    }
    return '';
  };

  return (
    <span className={`relative inline-flex items-center justify-center ${className}${bouncing ? ' animate-badge-pop' : ''} transition-transform`}>
      {phase === 'idle' ? (
        <span className="inline-block">
          {displayText}
        </span>
      ) : (
        <span className={`inline-block ${getAnimationClass()}`}>
          {phase === 'showing' ? displayText : ''}
        </span>
      )}
    </span>
  );
}
