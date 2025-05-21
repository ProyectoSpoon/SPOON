// src/shared/components/ui/Alert/types.ts
import { ReactNode } from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
  className?: string;
  icon?: ReactNode;
  title?: string;
}