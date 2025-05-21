import { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  error?: boolean;
}

export interface TimeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: boolean;
}