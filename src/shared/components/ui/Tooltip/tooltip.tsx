// src/shared/components/ui/Tooltip/tooltip.tsx
import React from 'react';
import { TooltipProps } from './types';

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 px-2 py-1
            text-sm text-white bg-neutral-900
            rounded shadow-lg whitespace-nowrap
            ${positions[side]}
            ${className}
          `}
          role="tooltip"
        >
          {content}
          <div
            className={`
              absolute w-2 h-2 bg-neutral-900
              transform rotate-45
              ${side === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
                side === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' :
                side === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
                'right-[-4px] top-1/2 -translate-y-1/2'}
            `}
          />
        </div>
      )}
    </div>
  );
};



























