// src/app/config-restaurante/components/DebugStore.tsx
'use client';

import React from 'react';
import { useConfigStore } from '../store/config-store';
import { FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

export default function DebugStore() {
  const { tarjetas, puedeAvanzar } = useConfigStore();

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-900 mb-2">🔍 Debug Store</h3>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>Puede Avanzar:</span>
            <span className={`font-medium ${puedeAvanzar ? 'text-green-600' : 'text-red-600'}`}>
              {puedeAvanzar ? '✅ SÍ' : '❌ NO'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {tarjetas.map((tarjeta) => (
          <div key={tarjeta.id} className="border border-gray-200 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">
                {tarjeta.titulo}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${tarjeta.estado === 'completo'
                ? 'bg-green-100 text-green-800'
                : tarjeta.estado === 'incompleto'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-600'
                }`}>
                {tarjeta.estado}
              </span>
            </div>

            <div className="space-y-1">
              {tarjeta.camposRequeridos.map((campo) => (
                <div key={campo.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{campo.nombre}:</span>
                  <span className="flex items-center gap-1">
                    {campo.completado ? (
                      <FaCheck className="text-green-600 text-xs" />
                    ) : (
                      <FaTimes className="text-red-600 text-xs" />
                    )}
                    <span className={campo.completado ? 'text-green-600' : 'text-red-600'}>
                      {campo.completado ? 'OK' : 'Pendiente'}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div>Total tarjetas: {tarjetas.length}</div>
          <div>Completas: {tarjetas.filter(t => t.estado === 'completo').length}</div>
          <div>Campos totales: {tarjetas.reduce((acc, t) => acc + t.camposRequeridos.length, 0)}</div>
          <div>Campos completados: {tarjetas.reduce((acc, t) => acc + t.camposRequeridos.filter(c => c.completado).length, 0)}</div>
        </div>
      </div>
    </div>
  );
}
