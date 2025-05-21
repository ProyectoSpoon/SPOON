// src/shared/components/ui/Card/types.ts
import { ReactNode } from 'react';

export type CardVariant = 'default' | 'hover' | 'menu';

export interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
  withHover?: boolean;
  bordered?: boolean;
}