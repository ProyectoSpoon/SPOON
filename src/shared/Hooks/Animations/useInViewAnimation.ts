// /shared/hooks/animations/useInViewAnimation.ts
'use client'

import { useEffect } from 'react';
import { useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { spoonTheme } from '@/shared/Styles/spoon-theme';

interface InViewConfig {
  variant?: keyof typeof spoonTheme.animations.motion;
  threshold?: number;
  triggerOnce?: boolean;
  delay?: number;
}

export const useInViewAnimation = ({
  variant = 'fadeIn',
  threshold = 0.2,
  triggerOnce = true,
  delay = 0
}: InViewConfig = {}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold,
    triggerOnce
  });

  useEffect(() => {
    if (inView) {
      controls.start({
        ...spoonTheme.animations.motion[variant].animate,
        transition: {
          ...spoonTheme.animations.motion[variant].transition,
          delay
        }
      });
    }
  }, [controls, inView, variant, delay]);

  return {
    ref,
    inView,
    controls,
    animation: spoonTheme.animations.motion[variant]
  };
};