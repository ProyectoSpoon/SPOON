import React from 'react';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface VistaPreviaProps {
  logo: string | null;
  portada: string | null;
}

export default function VistaPrevia({ logo, portada }: VistaPreviaProps) {
  return (
    <div className="space-y-6">
      <div className="text-lg font-semibold">Vista Previa</div>

      <div className="border rounded-lg overflow-hidden">
        {/* Simulación de cómo se verá en la app */}
        <div className="relative h-64 bg-gray-100">
          {portada ? (
            <div className="relative w-full h-full">
              <Image
                src={portada}
                alt="Portada"
                fill
                style={{ objectFit: 'cover' }}
                unoptimized={portada.startsWith('blob:')}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sin imagen de portada
            </div>
          )}

          {logo && (
            <div className="absolute left-4 bottom-4 w-24 h-24 bg-white rounded-lg p-2 shadow-lg z-10">
              <div className="relative w-full h-full">
                <Image
                  src={logo}
                  alt="Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  unoptimized={logo.startsWith('blob:')}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex-1 flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${logo ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>Logo</span>
          </div>
          {logo && (
            <CheckCircle size={20} className="text-green-500" />
          )}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex-1 flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${portada ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>Portada</span>
          </div>
          {portada && (
            <CheckCircle size={20} className="text-green-500" />
          )}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          Esta es una vista previa de cómo se verán tu logo y portada en la aplicación.
          Asegúrate de que todo se vea correcto antes de finalizar.
        </p>
      </div>
    </div>
  );
}


























