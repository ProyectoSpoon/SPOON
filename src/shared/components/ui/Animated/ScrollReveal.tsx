// /shared/components/ui/animated/ScrollReveal.tsx
'use client'

import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { MotionComponentProps } from '@/shared/types/motion.types';
import { useInView } from 'react-intersection-observer';
import { spoonTheme } from '@/shared/Styles/spoon-theme';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: 'fadeUp' | 'fadeIn' | 'stagger';
  className?: string;
  delay?: number;
}

export const ScrollReveal = ({
  children,
  variant = 'fadeUp',
  className = '',
  delay = 0
}: ScrollRevealProps) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: spoonTheme.animations.scroll[variant].threshold,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const variants = {
    fadeUp: {
      hidden: { y: 50, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          ...spoonTheme.animations.scroll.fadeUp.transition,
          delay
        }
      }
    },
    fadeIn: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          ...spoonTheme.animations.scroll.fadeIn.transition,
          delay
        }
      }
    },
    stagger: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          ...spoonTheme.animations.scroll.stagger.transition,
          delay
        }
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants[variant]}
      className={className}
    >
      {children}
    </motion.div>
  );
};