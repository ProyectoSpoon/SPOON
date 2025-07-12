// src/shared/components/ui/TimeInput/types.ts
import { InputHTMLAttributes } from 'react';

export interface TimeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  showEditIcon?: boolean;
}
