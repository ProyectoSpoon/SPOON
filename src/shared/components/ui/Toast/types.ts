// src/shared/components/ui/Toast/types.ts
import { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  title?: string;
  description: string;
  type?: ToastType;
  onDismiss: (id: string) => void;
}