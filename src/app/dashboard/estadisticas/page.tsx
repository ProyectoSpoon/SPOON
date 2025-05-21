'use client';

import { Card } from '@/shared/components/ui/Card';
import { useRouter } from 'next/navigation';
import { 
  BarChart2, 
  TrendingUp, 
  LineChart,
  ArrowRight 
} from 'lucide-react';

interface TarjetaEstadisticaProps {
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  ruta: string;
  colorFondo: string;
  colorIcono: string;
}

const TarjetaEstadistica = ({ 
  titulo, 
  descripcion, 
  icono, 
  ruta,
  colorFondo,
  colorIcono 
}: TarjetaEstadisticaProps) => {
  const router = useRouter();

  return (
    <Card 
      className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 group"
      onClick={() => router.push(ruta)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`p-3 ${colorFondo} rounded-lg w-fit`}>
            <div className={colorIcono}>
              {icono}
            </div>
          </div>
          <h3 className="text-lg font-semibold mt-4 text-neutral-800">
            {titulo}
          </h3>
          <p className="text-neutral-600 mt-2">
            {descripcion}
          </p>
        </div>
        <ArrowRight 
          className="h-5 w-5 text-neutral-400 transform transition-transform group-hover:translate-x-1" 
        />
      </div>
    </Card>
  );
};

const seccionesEstadisticas: TarjetaEstadisticaProps[] = [
  {
    titulo: "Análisis de Ventas",
    descripcion: "Visualiza y analiza tus ventas por período, con comparativas mensuales y KPIs principales",
    icono: <BarChart2 className="h-6 w-6" />,
    ruta: "/dashboard/estadisticas/analisis-ventas",
    colorFondo: "bg-blue-100",
    colorIcono: "text-blue-600"
  },
  {
    titulo: "Rendimiento de Menú",
    descripcion: "Examina el desempeño por categorías, análisis de rentabilidad y rankings de platos",
    icono: <TrendingUp className="h-6 w-6" />,
    ruta: "/dashboard/estadisticas/rendimiento-menu",
    colorFondo: "bg-green-100",
    colorIcono: "text-green-600"
  },
  {
    titulo: "Tendencias y Patrones",
    descripcion: "Analiza patrones por horarios, comportamiento semanal y estacionalidad",
    icono: <LineChart className="h-6 w-6" />,
    ruta: "/dashboard/estadisticas/tendencias",
    colorFondo: "bg-purple-100",
    colorIcono: "text-purple-600"
  }
];

export default function EstadisticasPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">
          Estadísticas
        </h1>
        <p className="text-neutral-600 mt-2">
          Selecciona una sección para ver análisis detallados y métricas específicas
        </p>
      </div>

      {/* Grid de secciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {seccionesEstadisticas.map((seccion) => (
          <TarjetaEstadistica
            key={seccion.ruta}
            {...seccion}
          />
        ))}
      </div>

      {/* Resumen rápido */}
      <Card className="p-6 mt-8 bg-[#FFF9F2]">
        <h3 className="text-lg font-semibold text-[#F4821F] mb-3">
          Consejos de uso
        </h3>
        <ul className="space-y-2 text-neutral-600">
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#F4821F]" />
            Utiliza Análisis de Ventas para una vista general del desempeño
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#F4821F]" />
            Rendimiento de Menú te ayuda a optimizar tu carta
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#F4821F]" />
            Tendencias y Patrones para descubrir oportunidades de mejora
          </li>
        </ul>
      </Card>
    </div>
  );
}