'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * SectionReveal — Motion wrapper cho section entry animation.
 * Tôn trọng prefers-reduced-motion.
 * Dùng whileInView: items appear as they enter viewport.
 */
export function SectionReveal({ children, className, delay = 0 }: SectionRevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}