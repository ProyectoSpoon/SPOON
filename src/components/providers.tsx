// src/components/providers.tsx
'use client';

import { Suspense } from 'react';
import { AuthProvider } from '@/context/authcontext';
import { ThemeProvider } from '@/shared/Context/theme-context';
import { CacheInitializer } from './CacheInitializer';
import { ReloadProductsButton } from './ReloadProductsButton';
import { ForceReloadButton } from './ForceReloadButton';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ThemeProvider>
        <AuthProvider>
          <CacheInitializer />
          {children}
          <ReloadProductsButton />
          <ForceReloadButton />
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </Suspense>
  );
}
