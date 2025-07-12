// src/app/dashboard/carta/components/layout/ColumnaLayout.tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ColumnaLayoutProps {
  children: ReactNode;
  titulo?: string;
  className?: string;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function ColumnaLayout({
  children,
  titulo,
  className,
  headerContent,
  footerContent,
  isLoading = false,
  fullWidth = false,
}: ColumnaLayoutProps) {
  return (
    <div 
      className={cn(
        "flex flex-col h-full border-r border-neutral-200 bg-white",
        !fullWidth && "min-w-[200px] max-w-[400px]",
        fullWidth && "flex-1",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col px-4 py-3 border-b border-neutral-200">
        {titulo && (
          <h2 className="text-lg font-semibold text-neutral-800 text-center">
            {titulo}
          </h2>
        )}
        {headerContent}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="p-4">
            {children}
          </div>
        )}
      </div>

      {/* Footer if provided */}
      {footerContent && (
        <div className="border-t border-neutral-200 p-4">
          {footerContent}
        </div>
      )}
    </div>
  );
}
