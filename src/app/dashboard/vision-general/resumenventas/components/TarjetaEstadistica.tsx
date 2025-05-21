import { Card } from '@/shared/components/ui/Card';
import { TarjetaEstadisticaProps } from '../types/types';

export const TarjetaEstadistica = ({ 
  titulo, 
  valor, 
  icono, 
  colorFondo, 
  colorIcono 
}: TarjetaEstadisticaProps) => (
  <Card className="p-6 bg-white hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4">
      <div className={`p-3 ${colorFondo} rounded-full`}>
        <div className={colorIcono}>{icono}</div>
      </div>
      <div>
        <p className="text-sm text-neutral-600 font-medium">{titulo}</p>
        <p className="text-2xl font-bold text-neutral-900">{valor}</p>
      </div>
    </div>
  </Card>
);