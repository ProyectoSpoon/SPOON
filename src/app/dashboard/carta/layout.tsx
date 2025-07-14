// src/app/dashboard/carta/layout.tsx
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function CartaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full flex flex-col">
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}


























