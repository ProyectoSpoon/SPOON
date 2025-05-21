// /shared/utils/animation.utils.ts
import { spoonTheme } from '@/shared/Styles/spoon-theme';
import type { 
  AnimationConfig, 
  EasingType, 
  MotionConfig,
  ParticlesConfig,
  GeometricPatternConfig
} from '../types/animation.types';

export const getEasing = (type: EasingType): string => {
  return spoonTheme.animations.easing[type] || spoonTheme.animations.easing.smooth;
};

export const createTransition = (config: AnimationConfig = {}): any => {
  const { 
    duration = 0.3, 
    delay = 0, 
    ease = 'easeOut' 
  } = config;

  return {
    duration,
    delay,
    ease: getEasing(ease as EasingType)
  };
};

export const createMotionVariants = (configs: Record<string, MotionConfig>): Record<string, any> => {
  const variants: Record<string, any> = {};

  for (const [key, config] of Object.entries(configs)) {
    variants[key] = {
      ...config,
      transition: createTransition(config.transition)
    };
  }

  return variants;
};

export const createParticlesConfig = (config: ParticlesConfig = {}): any => {
  const { 
    type = 'default',
    color = spoonTheme.colors.primary.main,
    opacity = 0.3,
    speed = 2,
    quantity = 30
  } = config;

  return {
    ...spoonTheme.animations.particles[type],
    particles: {
      ...spoonTheme.animations.particles[type].particles,
      color: { value: color },
      opacity: { value: opacity },
      move: { speed },
      number: { value: quantity }
    }
  };
};

export const createGeometricPattern = (config: GeometricPatternConfig = {}): string => {
  const { 
    pattern = 'grid',
    color = spoonTheme.colors.primary.main,
    size = 40 
  } = config;

  const patterns = {
    grid: `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <pattern id="grid" x="0" y="0" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
          <path d="M ${size} 0 L 0 0 0 ${size}" fill="none" stroke="${color}" stroke-width="1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    `,
    dots: `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <pattern id="dots" x="0" y="0" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
          <circle cx="${size/2}" cy="${size/2}" r="2" fill="${color}" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    `,
    lines: `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <pattern id="lines" x="0" y="0" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
          <line x1="0" y1="${size/2}" x2="${size}" y2="${size/2}" stroke="${color}" stroke-width="1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#lines)" />
      </svg>
    `
  };

  return `data:image/svg+xml,${encodeURIComponent(patterns[pattern])}`;
};

// Utilidades para scroll animations
export const getScrollConfig = (threshold: number = 0.1, once: boolean = true) => ({
  threshold,
  triggerOnce: once,
  rootMargin: '50px'
});

// Utilidades para hover effects
export const getHoverTransition = (duration: number = 0.3) => ({
  type: "tween",
  duration,
  ease: spoonTheme.animations.easing.smooth
});

// Utilidades para stagger animations
export const createStaggerVariants = (staggerChildren: number = 0.1) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren: 0.3
    }
  }
});

// Utilidad para transformar valores de scroll
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};