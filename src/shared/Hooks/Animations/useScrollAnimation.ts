// /shared/hooks/animations/useScrollAnimation.ts
'use client'

import { useScroll, useTransform, MotionValue } from 'framer-motion';
import { spoonTheme } from '@/shared/Styles/spoon-theme';

interface ScrollAnimationConfig {
  inputRange?: number[];
  outputRange?: number[] | string[];
  smooth?: boolean;
}

export const useScrollAnimation = (config: ScrollAnimationConfig = {}) => {
  const { 
    inputRange = [0, 100],
    outputRange = [0, 1],
    smooth = true 
  } = config;

  const { scrollY } = useScroll();
  
  const smoothing = smooth ? {
    stiffness: spoonTheme.animations.spring.gentle.tension,
    damping: spoonTheme.animations.spring.gentle.friction,
  } : undefined;

  const transformedValue = useTransform(
    scrollY,
    inputRange,
    outputRange,
    { ease: spoonTheme.animations.easing.smooth }
  );

  return { scrollY, transformedValue, smoothing };
};