'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

const ConfigFooter = () => {
  const router = useRouter();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--spoon-neutral-200)] py-4 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/config-restaurante')}
            className="flex items-center gap-2 text-[var(--spoon-neutral-600)] hover:text-[var(--spoon-primary)] transition-colors duration-200 group"
          >
            <ChevronLeft 
              className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
            />
            <span className="font-medium">Volver a Configuración</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default ConfigFooter;