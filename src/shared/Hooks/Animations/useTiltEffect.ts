'use client'

import { useState, useCallback } from 'react';
import { spoonTheme } from '@/shared/Styles/spoon-theme';

interface TiltConfig {
  max?: number;
  scale?: number;
  speed?: number;
  reverse?: boolean;
}

interface TiltStyle {
  transform: string;
  transition?: string;
}

export const useTiltEffect = (config: TiltConfig = {}) => {
  const {
    max = spoonTheme.animations.tilt.default.max,
    scale = spoonTheme.animations.tilt.default.scale,
    speed = spoonTheme.animations.tilt.default.speed,
    reverse = spoonTheme.animations.tilt.default.reverse
  } = config;

  const [tiltStyle, setTiltStyle] = useState<TiltStyle>({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
  });

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const element = e.currentTarget;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const multiplier = reverse ? -1 : 1;
      const rotateX = multiplier * ((y - rect.height / 2) / rect.height) * max;
      const rotateY = multiplier * ((x - rect.width / 2) / rect.width) * max;

      setTiltStyle({
        transform: `
          perspective(1000px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          scale(${scale})
        `,
        transition: `transform ${speed}ms ${spoonTheme.animations.easing.smooth}`
      });
    },
    [max, scale, speed, reverse]
  );

  const onMouseLeave = useCallback(() => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
      transition: `transform ${speed}ms ${spoonTheme.animations.easing.smooth}`
    });
  }, [speed]);

  return {
    tiltStyle,
    tiltEvents: {
      onMouseMove,
      onMouseLeave
    }
  };
};