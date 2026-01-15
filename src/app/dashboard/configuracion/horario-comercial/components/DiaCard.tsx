import React from 'react';
import { DiaSemana, HorarioDia } from '../types/horarios.types';
import { formatTo12Hour } from '../utils/time';

interface DiaCardProps {
    dia: DiaSemana;
    nombreDia: string;
    horario: HorarioDia;
    isSelected: boolean;
    onSelect: (dia: DiaSemana) => void;
}

export const DiaCard: React.FC<DiaCardProps> = ({
    dia,
    nombreDia,
    horario,
    isSelected,
    onSelect,
}) => {
    return (
        <div
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${isSelected ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
                }`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`w-3 h-3 rounded-full ${horario.abierto ? 'bg-green-500' : 'bg-red-500'
                        }`}
                />
                <span className="font-medium text-gray-900 w-20">
                    {nombreDia}
                </span>
            </div>

            <div className="flex-1 text-sm text-gray-600 mx-4">
                {horario.abierto ? (
                    horario.turnos.map((turno, i) => (
                        <span key={i} className="mr-3">
                            {formatTo12Hour(turno.horaApertura)} - {formatTo12Hour(turno.horaCierre)}
                        </span>
                    ))
                ) : (
                    <span className="text-red-600">Cerrado</span>
                )}
            </div>

            <button
                onClick={() => onSelect(dia)}
                className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
            >
                Editar
            </button>
        </div>
    );
};
