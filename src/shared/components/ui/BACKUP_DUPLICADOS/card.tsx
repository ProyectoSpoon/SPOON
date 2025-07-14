// /src/shared/components/ui/Card/card.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { CardProps } from './types';

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', withHover, bordered = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg bg-white text-gray-950",
        {
          'border border-gray-200': bordered,
          'shadow-sm': variant === 'default',
          'shadow-md hover:shadow-lg transition-shadow duration-200': withHover || variant === 'hover',
          'shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden': variant === 'menu',
        },
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card };



























