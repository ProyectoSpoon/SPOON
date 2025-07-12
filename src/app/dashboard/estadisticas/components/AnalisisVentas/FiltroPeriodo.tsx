'use client';

import { PeriodoTiempo } from '../../types/estadisticas.types';

interface FiltroPeriodoProps {
  periodoSeleccionado: PeriodoTiempo;
  onPeriodoChange: (periodo: PeriodoTiempo) => void;
}

const periodos: Array<{valor: PeriodoTiempo; etiqueta: string}> = [
  { valor: 'hoy', etiqueta: 'Hoy' },
  { valor: 'semana', etiqueta: 'Semana' },
  { valor: 'mes', etiqueta: 'Mes' },
  { valor: 'trimestre', etiqueta: 'Trimestre' },
  { valor: 'año', etiqueta: 'Año' }
];

export const FiltroPeriodo = ({
  periodoSeleccionado,
  onPeriodoChange
}: FiltroPeriodoProps) => {
  return (
    <div className="flex items-center justify-start gap-2">
      {periodos.map(({ valor, etiqueta }) => (
        <button
          key={valor}
          type="button"
          onClick={() => onPeriodoChange(valor)}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all
            ${periodoSeleccionado === valor
              ? 'bg-[#F4821F] text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }
          `}
        >
          {etiqueta}
        </button>
      ))}
    </div>
  );
};
