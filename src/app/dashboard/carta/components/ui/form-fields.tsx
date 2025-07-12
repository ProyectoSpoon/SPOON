// src/app/dashboard/carta/components/ui/form-fields.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputWithErrorProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputWithErrorProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <div>
        <input
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaWithErrorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaWithErrorProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <div>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
