// /shared/components/ui/animated/Tilt3D.tsx
'use client'

import { Tilt } from 'react-tilt';
import { spoonTheme } from '@/shared/Styles/spoon-theme';

interface Tilt3DProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'dramatic';
  glareEnabled?: boolean;
  glareColor?: string;
}

export const Tilt3D = ({
  children,
  className = '',
  variant = 'default',
  glareEnabled = false,
  glareColor = 'rgba(244, 130, 31, 0.4)'
}: Tilt3DProps) => {
  const tiltOptions = {
    ...spoonTheme.animations.tilt[variant],
    glare: glareEnabled,
    'max-glare': 0.5,
    'glare-prerender': false,
    'glareBorderRadius': '1rem',
    'glareColor': glareColor
  };

  return (
    <Tilt
      options={tiltOptions}
      className={`transform-gpu ${className}`}
    >
      {children}
    </Tilt>
  );
};
