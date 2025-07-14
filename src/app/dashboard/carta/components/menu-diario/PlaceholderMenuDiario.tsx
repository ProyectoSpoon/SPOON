// src/app/dashboard/carta/components/menu-diario/PlaceholderMenuDiario.tsx
import { MenuIcon } from "lucide-react";

export function PlaceholderMenuDiario() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-neutral-500 p-8">
      <div className="bg-primary/10 rounded-full p-6 mb-4">
        <MenuIcon className="h-12 w-12 text-primary" />
      </div>
      <p className="text-lg font-medium text-center">
        Gestiona tus menús diarios y promociones especiales
      </p>
    </div>
  );
}


























