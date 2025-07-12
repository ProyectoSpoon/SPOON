// src/shared/components/ui/Tabs/types.ts
import { ReactNode } from 'react';

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}
