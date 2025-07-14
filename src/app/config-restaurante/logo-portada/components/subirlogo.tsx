// src/app/config-restaurante/logo-portada/components/SubirLogo.tsx
import React, { useRef } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface SubirLogoProps {
  archivo: {
    archivo: File | null;
    previewUrl: string | null;
    estado: 'pendiente' | 'cargando' | 'completado' | 'error';
    error?: string;
  };
  onFileChange: (archivo: File) => void;
  estaEnviando: boolean;
}

export default function SubirLogo({ archivo, onFileChange, estaEnviando }: SubirLogoProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const esValido = validarArchivo(file);
      if (esValido) {
        onFileChange(file);
      }
    }
  };

  const validarArchivo = (file: File): boolean => {
    const tiposPermitidos = ['image/jpeg', 'image/png'];
    const tamañoMaximo = 5 * 1024 * 1024; // 5MB

    if (!tiposPermitidos.includes(file.type)) {
      alert('Solo se permiten archivos JPG y PNG');
      return false;
    }

    if (file.size > tamañoMaximo) {
      alert('El archivo es demasiado grande. Máximo 5MB');
      return false;
    }

    return true;
  };

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">Logo del Restaurante</div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-spoon-primary transition-colors">
        <input
          ref={inputRef}
          type="file"
          onChange={handleChange}
          accept="image/jpeg,image/png"
          className="hidden"
          disabled={estaEnviando}
        />

        {archivo.previewUrl ? (
          <div className="space-y-4">
            <div className="relative w-48 h-48 mx-auto">
              <img
                src={archivo.previewUrl}
                alt="Logo preview"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle size={20} />
              <span>Imagen cargada correctamente</span>
            </div>
            <button
              onClick={handleClick}
              disabled={estaEnviando}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cambiar imagen
            </button>
          </div>
        ) : (
          <button
            onClick={handleClick}
            disabled={estaEnviando}
            className="w-full h-48 flex flex-col items-center justify-center gap-4 text-gray-500 hover:text-spoon-primary"
          >
            <Upload size={40} />
            <div className="text-center">
              <p className="font-medium">Haz clic para subir tu logo</p>
              <p className="text-sm text-gray-400">PNG o JPG (máx. 5MB)</p>
            </div>
          </button>
        )}
      </div>

      <div className="text-sm text-gray-500">
        <p>Recomendaciones:</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Usa un fondo transparente (PNG)</li>
          <li>Dimensiones recomendadas: 500x500 píxeles</li>
          <li>Asegúrate que el logo sea legible</li>
        </ul>
      </div>
    </div>
  );
}


























