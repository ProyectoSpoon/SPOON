// src/shared/components/ui/animated/AnimatedText.tsx
'use client'

import { motion } from 'framer-motion';
import { MotionComponentProps } from '@/shared/types/motion.types';
import { spoonTheme } from '@/shared/Styles/spoon-theme';

interface AnimatedTextProps extends MotionComponentProps {
  variant?: 'fadeIn' | 'slideUp' | 'slideIn';
  delay?: number;
}

export const AnimatedText = ({
  children,
  className = '',
  variant = 'fadeIn',
  delay = 0,
  ...motionProps
}: AnimatedTextProps) => {
  return (
    <motion.div
      initial={spoonTheme.animations.motion[variant].initial}
      whileInView={spoonTheme.animations.motion[variant].animate}
      viewport={{ once: true }}
      transition={{ 
        ...spoonTheme.animations.motion[variant].transition,
        delay 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};



























