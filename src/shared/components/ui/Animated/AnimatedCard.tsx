// /shared/components/ui/animated/AnimatedCard.tsx
'use client'

import { motion } from 'framer-motion';
import { MotionComponentProps } from '@/shared/types/motion.types';
import { spoonTheme } from '@/shared/Styles/spoon-theme';
import { Tilt } from 'react-tilt';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'dramatic';
  withTilt?: boolean;
}

export const AnimatedCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  withTilt = true 
}: AnimatedCardProps) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={spoonTheme.animations.motion.fadeIn.transition}
      className={`relative group ${className}`}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-[#F4821F] to-[#CD853F] rounded-xl blur opacity-20 
                      group-hover:opacity-30 transition-opacity duration-300" 
      />
      <div className="relative bg-white rounded-lg p-6 transition-all duration-300
                      hover:shadow-xl hover:transform hover:scale-[1.02]">
        {children}
      </div>
    </motion.div>
  );

  if (!withTilt) return content;

  return (
    <Tilt options={spoonTheme.animations.tilt[variant]}>
      {content}
    </Tilt>
  );
};



























