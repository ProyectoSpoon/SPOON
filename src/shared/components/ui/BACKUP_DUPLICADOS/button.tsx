'use client';

import React from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        primary: [
          'bg-spoon-primary text-white',
          'hover:bg-spoon-primary-dark',
          'active:bg-spoon-primary-darker',
          'focus:ring-spoon-primary/50',
          'disabled:bg-spoon-primary/50',
        ],
        secondary: [
          'bg-spoon-neutral-100 text-spoon-neutral-600',
          'hover:bg-spoon-neutral-200',
          'active:bg-spoon-neutral-300',
          'focus:ring-spoon-neutral-600/30',
          'disabled:bg-spoon-neutral-100/50',
        ],
        outline: [
          'border border-spoon-border bg-transparent',
          'text-spoon-neutral-600',
          'hover:bg-spoon-neutral-100',
          'active:bg-spoon-neutral-200',
          'focus:ring-spoon-neutral-600/30',
          'disabled:bg-transparent disabled:border-spoon-neutral-300',
        ],
        destructive: [
          'bg-spoon-error text-white',
          'hover:bg-spoon-error/90',
          'active:bg-spoon-error/80',
          'focus:ring-spoon-error/50',
          'disabled:bg-spoon-error/50',
        ],
        ghost: [
          'bg-transparent',
          'text-spoon-neutral-600',
          'hover:bg-spoon-neutral-100',
          'active:bg-spoon-neutral-200',
          'focus:ring-spoon-neutral-600/30',
          'disabled:bg-transparent',
        ],
        warning: [
          'bg-spoon-warning text-white',
          'hover:bg-spoon-warning/90',
          'active:bg-spoon-warning/80',
          'focus:ring-spoon-warning/50',
          'disabled:bg-spoon-warning/50',
        ],
        success: [
          'bg-spoon-success text-white',
          'hover:bg-spoon-success/90',
          'active:bg-spoon-success/80',
          'focus:ring-spoon-success/50',
          'disabled:bg-spoon-success/50',
        ],
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-8 w-8 p-0',
        'icon-sm': 'h-6 w-6 p-0',
        'icon-lg': 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'default', 
    disabled, 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <button
        className={cn(
          buttonVariants({ variant, size }),
          isDisabled && [
            'cursor-not-allowed',
            'opacity-50',
            'pointer-events-none',
          ],
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {/* Left Icon */}
        {leftIcon && !loading && (
          <span className="mr-2 flex-shrink-0">
            {leftIcon}
          </span>
        )}
        
        {/* Content */}
        <span className="flex-1">
          {children}
        </span>
        
        {/* Right Icon */}
        {rightIcon && (
          <span className="ml-2 flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { buttonVariants };


























