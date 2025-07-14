// /shared/components/ui/animated/GeometricPattern.tsx
'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface GeometricPatternProps {
  color?: string;
  opacity?: number;
  animate?: boolean;
  pattern?: 'grid' | 'dots' | 'lines';
}

export const GeometricPattern = ({
  color = '#F4821F',
  opacity = 0.1,
  animate = true,
  pattern = 'grid'
}: GeometricPatternProps) => {
  const patternVariants = {
    grid: (
      <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
      </pattern>
    ),
    dots: (
      <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="2" fill="currentColor" />
      </pattern>
    ),
    lines: (
      <pattern id="lines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <line x1="0" y1="20" x2="40" y2="20" stroke="currentColor" strokeWidth="1" />
      </pattern>
    )
  };

  const motionVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: opacity,
      scale: 1,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.svg
      className="absolute inset-0 w-full h-full"
      initial="initial"
      animate="animate"
      variants={animate ? motionVariants : undefined}
      style={{ color }}
    >
      <defs>
        {patternVariants[pattern]}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pattern})`} />
    </motion.svg>
  );
};



























