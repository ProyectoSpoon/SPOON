// /shared/hooks/animations/useParallax.ts
'use client'

import { useScroll, useTransform, MotionValue } from 'framer-motion';

interface ParallaxConfig {
  offset?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  speed?: number;
}

export const useParallax = ({
  offset = 100,
  direction = 'up',
  speed = 1
}: ParallaxConfig = {}) => {
  const { scrollY } = useScroll();

  const getValue = () => {
    switch (direction) {
      case 'up':
        return [offset, -offset];
      case 'down':
        return [-offset, offset];
      case 'left':
        return [offset, -offset];
      case 'right':
        return [-offset, offset];
      default:
        return [0, 0];
    }
  };

  const [start, end] = getValue();
  const y = useTransform(
    scrollY,
    [0, offset * speed],
    direction === 'left' || direction === 'right' ? [start, end] : [start, end]
  );
  const x = useTransform(
    scrollY,
    [0, offset * speed],
    direction === 'left' || direction === 'right' ? [start, end] : [0, 0]
  );

  return { x, y };
};
