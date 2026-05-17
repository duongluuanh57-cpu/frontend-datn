'use client';

import { motion, HTMLMotionProps } from 'framer-motion';

interface FadeInProps extends HTMLMotionProps<'div'> {
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
}

export function FadeIn({ 
  children, 
  delay = 0, 
  direction = 'up', 
  distance = 20, 
  ...props 
}: FadeInProps) {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: { x: 0, y: 0 }
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directions[direction] 
      }}
      whileInView={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: 'easeOut' 
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ 
  children, 
  delay = 0, 
  ...props 
}: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.4, 
        delay, 
        ease: 'backOut' 
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
