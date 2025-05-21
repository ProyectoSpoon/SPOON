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