import React from 'react';
import { Button } from '@/shared/components/ui/Button';

const ROUTES = {
  MENU_DEL_DIA: '/dashboard/carta/menu-dia',
};

interface DashboardHeaderProps {
  fechaHoy: string;
  onRefetch: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ fechaHoy, onRefetch }) => (
  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard de SPOON</h1>
      <p className="text-gray-600 capitalize">{fechaHoy}</p>
    </div>
    <div className="flex gap-3">
      <Button onClick={onRefetch} variant="outline" className="flex items-center gap-2">
        🔄 Actualizar
      </Button>
      <Button
        onClick={() => window.open(ROUTES.MENU_DEL_DIA, '_blank')}
        className="flex items-center gap-2 bg-spoon-primary hover:bg-spoon-primary-dark text-white"
      >
        🍽️ Gestionar Menú
      </Button>
    </div>
  </div>
);
