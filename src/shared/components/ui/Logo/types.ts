// src/shared/components/ui/Logo/types.ts
export type LogoVariant = 'default' | 'white' | 'black';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
}
