// src/app/pages/logo-portada/components/vista_previa.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiSmartphone } from 'react-icons/fi';

interface PropsVistaPrevia {
  logo: string | null;
  portada: string | null;
}

const VistaPrevia: React.FC<PropsVistaPrevia> = ({ logo, portada }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-neutral-900">Vista Previa</h3>
            <p className="text-gray-600 text-sm">
              Así se verá en la aplicación
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6 flex flex-col items-center">
            {/* Vista móvil */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden w-full max-w-[320px] bg-white">
              <div className="space-y-0">
                {/* Header con icono de móvil */}
                <div className="w-full p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <FiSmartphone className="w-4 h-4" />
                    <span className="text-sm font-medium">Vista Móvil</span>
                  </div>
                </div>

                {/* Imagen de portada */}
                <div className="relative w-full h-40">
                  {portada ? (
                    <img
                      src={portada}
                      alt="Portada del restaurante"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 animate-pulse" />
                  )}
                  
                  {/* Logo superpuesto */}
                  {logo && (
                    <div className="absolute -bottom-8 left-5 bg-white rounded-full p-2 shadow-lg">
                      <img
                        src={logo}
                        alt="Logo del restaurante"
                        className="w-15 h-15 rounded-full object-cover"
                        style={{ width: '60px', height: '60px' }}
                      />
                    </div>
                  )}
                </div>

                {/* Contenido de ejemplo */}
                <div className="w-full p-6 pt-10">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-neutral-900">Tu Restaurante</h4>
                    <span className="inline-block px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      Abierto ahora
                    </span>
                    <p className="text-sm text-gray-600">
                      Aquí aparecerá la descripción de tu restaurante...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicadores de estado */}
            <div className="flex space-x-4 w-full justify-center">
              <span className={`
                px-3 py-1 text-sm font-medium rounded-full
                ${logo ? 'text-green-700 bg-green-100' : 'text-gray-700 bg-gray-100'}
              `}>
                Logo: {logo ? "✓" : "Pendiente"}
              </span>
              <span className={`
                px-3 py-1 text-sm font-medium rounded-full
                ${portada ? 'text-green-700 bg-green-100' : 'text-gray-700 bg-gray-100'}
              `}>
                Portada: {portada ? "✓" : "Pendiente"}
              </span>
            </div>

            {/* Mensaje informativo */}
            <div className="p-4 bg-blue-50 rounded-md w-full">
              <p className="text-sm text-blue-600">
                Las imágenes se ajustarán automáticamente para mantener la mejor calidad posible en todos los dispositivos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VistaPrevia;
