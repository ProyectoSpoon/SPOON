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
          'hover:bg-spoon-secondary',
          'active:bg-spoon-dark',
          'focus:ring-spoon-primary/50',
          'disabled:bg-spoon-primary/50',
        ],
        secondary: [
          'bg-[#F4F4F5] text-[#4B5563]',
          'hover:bg-[#E5E5E5]',
          'active:bg-[#D4D4D4]',
          'focus:ring-[#4B5563]/30',
          'disabled:bg-[#F4F4F5]/50',
        ],
        outline: [
          'border border-[#E5E5E5] bg-transparent',
          'text-[#4B5563]',
          'hover:bg-[#F4F4F5]',
          'active:bg-[#E5E5E5]',
          'focus:ring-[#4B5563]/30',
          'disabled:bg-transparent',
        ],
        destructive: [
          'bg-status-error text-white',
          'hover:bg-status-error/90',
          'active:bg-status-error/80',
          'focus:ring-status-error/50',
          'disabled:bg-status-error/50',
        ],
        ghost: [
          'bg-transparent',
          'text-[#4B5563]',
          'hover:bg-[#F4F4F5]',
          'active:bg-[#E5E5E5]',
          'focus:ring-[#4B5563]/30',
          'disabled:bg-transparent',
        ],
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-8 w-8 p-0',
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
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size }),
          disabled && [
            'cursor-not-allowed',
            'opacity-50',
            'pointer-events-none',
          ],
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { buttonVariants };
