// src/shared/components/ui/Badge/badge.tsx
import React from 'react';
import { BadgeProps } from './types';

export const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '' 
}: BadgeProps) => {
  const variantStyles = {
    default: 'bg-neutral-100 text-neutral-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span className={`
      inline-flex items-center justify-center font-medium rounded-full
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${className}
    `}>
      {children}
    </span>
  );
};



























