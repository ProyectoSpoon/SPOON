import { PeriodoTiempo } from '../types/types';

interface SelectorPeriodoProps {
  periodoSeleccionado: PeriodoTiempo;
  onPeriodoChange: (periodo: PeriodoTiempo) => void;
}

export const SelectorPeriodo = ({ 
  periodoSeleccionado, 
  onPeriodoChange 
}: SelectorPeriodoProps) => (
  <div className="flex gap-4 mb-6">
    {(['hoy', 'semana', 'mes'] as PeriodoTiempo[]).map((periodo) => (
      <button
        key={periodo}
        onClick={() => onPeriodoChange(periodo)}
        className={`
          px-4 py-2 rounded-lg font-medium transition-colors
          ${periodoSeleccionado === periodo
            ? 'bg-[#F4821F] text-white'
            : 'bg-white text-neutral-600 hover:bg-[#FFF9F2]'}
        `}
      >
        {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
      </button>
    ))}
  </div>
);