// src/app/pages/logo-portada/components/tarjeta_carga_imagen.tsx
'use client';

import React, { useRef, useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';

interface PropsTarjetaCargaImagen {
  titulo: string;
  descripcion?: string;
  tipo: 'logo' | 'portada';
  onFileChange: (archivo: File) => void;
  archivo?: {
    archivo: File | null;
    previewUrl: string | null;
    estado: string;
    error?: string;
  };
}

const TarjetaCargaImagen: React.FC<PropsTarjetaCargaImagen> = ({
  titulo,
  descripcion = 'Arrastra una imagen o haz clic para seleccionar',
  tipo,
  archivo,
  onFileChange
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileChange(file);
  };

  return (
    <div
      className={`
        border-2 border-dashed rounded-xl p-6 transition-colors
        ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}
      `}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-neutral-900">{titulo}</h3>
        
        {archivo?.previewUrl ? (
          // Vista previa de la imagen
          <div className="relative">
            <img
              src={archivo.previewUrl}
              alt={titulo}
              className="object-cover rounded-md max-h-[200px] w-full"
            />
            <button
              aria-label="Eliminar imagen"
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              onClick={() => onFileChange(null as any)}
            >
              <FiX size={16} />
            </button>
          </div>
        ) : (
          // Área de carga
          <div
            className="py-10 space-y-4 cursor-pointer text-center"
            onClick={() => inputRef.current?.click()}
          >
            <div className="flex justify-center">
              <FiUpload className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-500 text-center">
              {descripcion}
            </p>
            <p className="text-sm text-gray-400">
              {tipo === 'logo' 
                ? 'Tamaño recomendado: 400x400px' 
                : 'Tamaño recomendado: 1200x400px'}
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileChange(file);
          }}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default TarjetaCargaImagen;


























