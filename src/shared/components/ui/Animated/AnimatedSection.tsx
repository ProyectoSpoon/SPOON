// /shared/components/ui/animated/AnimatedSection.tsx
'use client'

import { motion } from 'framer-motion';
import { spoonTheme } from '@/shared/Styles/spoon-theme';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const AnimatedSection = ({ 
  children, 
  className = '',
  delay = 0 
}: AnimatedSectionProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        ease: spoonTheme.animations.easing.smooth,
        delay 
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
};



























