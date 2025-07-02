import { HTMLMotionProps } from 'framer-motion';

export interface MotionComponentProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export interface MotionVariants {
  initial?: object;
  animate?: object;
  exit?: object;
  hover?: object;
  tap?: object;
  drag?: object;
  // ... otros estados que necesites
}

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  ease?: string;
  type?: string;
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export interface MotionTransition {
  duration?: number;
  delay?: number;
  ease?: string | number[];
  type?: string;
  stiffness?: number;
  damping?: number;
  mass?: number;
  when?: "beforeChildren" | "afterChildren" | string;
  staggerChildren?: number;
  delayChildren?: number;
}

export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'circIn' | 'circOut' | 'circInOut' | 'backIn' | 'backOut' | 'backInOut' | 'anticipate';

export interface MotionConfig {
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: MotionTransition;
}

export interface ParticlesConfig {
  particles: {
    number: { value: number; density: { enable: boolean; value_area: number; } };
    color: { value: string; };
    opacity: { value: number; random: boolean; };
    size: { value: number; random: boolean; };
    move: {
      enable: boolean;
      speed: number;
      direction: string;
      random: boolean;
      straight: boolean;
    };
  };
}

export interface GeometricPatternConfig {
  type: 'grid' | 'dots' | 'lines';
  size: number;
  spacing: number;
  color: string;
  opacity: number;
}
