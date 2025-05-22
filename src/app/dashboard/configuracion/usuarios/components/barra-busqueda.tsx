'use client'

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';

interface BarraBusquedaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function BarraBusqueda({ 
  value, 
  onChange,
  placeholder = "Buscar..."
}: BarraBusquedaProps) {
  return (
    <div className="flex items-center space-x-2 w-full max-w-sm">
      <div className="relative w-full">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="pl-8 w-full"
        />
      </div>
    </div>
  );
}