// src/shared/components/ui/Badge/types.ts
import { ReactNode } from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}
