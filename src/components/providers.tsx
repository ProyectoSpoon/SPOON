// src/components/providers.tsx
'use client';

import { Suspense } from 'react';
import { AuthProvider } from '@/context/authcontext';
import { ThemeProvider } from '@/shared/Context/theme-context';
import { CacheInitializer } from './CacheInitializer';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ThemeProvider>
        <AuthProvider>
          <CacheInitializer />
          {children}
          <Toaster 
            position="top-right" 
            closeButton
            richColors
            expand={false}
            duration={4000}
            visibleToasts={3}
          />
        </AuthProvider>
      </ThemeProvider>
    </Suspense>
  );
}



























