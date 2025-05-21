// src/app/config-restaurante/info-legal/components/DocumentosLegales.tsx
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface Documento {
  id: string;
  nombre: string;
  archivo: File | null;
  estado: 'pendiente' | 'cargando' | 'completado' | 'error';
  error?: string;
}

interface DocumentosLegalesProps {
  documentos: Record<string, Documento>;
  actualizarDocumento: (id: string, archivo: File) => void;
  estaEnviando: boolean;
}

export default function DocumentosLegales({
  documentos,
  actualizarDocumento,
  estaEnviando
}: DocumentosLegalesProps) {
  const documentosRequeridos = [
    {
      id: 'rut',
      nombre: 'RUT actualizado',
      descripcion: 'Registro Único Tributario vigente'
    },
    {
      id: 'camara_comercio',
      nombre: 'Cámara de Comercio',
      descripcion: 'Certificado de Cámara de Comercio (no mayor a 30 días)'
    },
    {
      id: 'cedula_representante',
      nombre: 'Documento de Identidad',
      descripcion: 'Cédula del representante legal por ambas caras'
    },
    {
      id: 'registro_sanitario',
      nombre: 'Registro Sanitario',
      descripcion: 'Permiso sanitario vigente'
    }
  ];

  const handleFileChange = (id: string, file: File) => {
    if (validarArchivo(file)) {
      actualizarDocumento(id, file);
    }
  };

  const validarArchivo = (file: File): boolean => {
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png'];
    const tamañoMaximo = 5 * 1024 * 1024; // 5MB

    if (!tiposPermitidos.includes(file.type)) {
      alert('Solo se permiten archivos PDF, JPG y PNG');
      return false;
    }

    if (file.size > tamañoMaximo) {
      alert('El archivo es demasiado grande. Máximo 5MB');
      return false;
    }

    return true;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentosRequeridos.map((doc) => (
          <div key={doc.id} className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-gray-900">{doc.nombre}</h3>
            <p className="text-sm text-gray-500">{doc.descripcion}</p>

            <input
              type="file"
              id={doc.id}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(doc.id, file);
              }}
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={estaEnviando}
              className="hidden"
            />

            {documentos[doc.id]?.archivo ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={20} />
                  <span className="text-sm">Archivo cargado</span>
                </div>
                <button
                  onClick={() => document.getElementById(doc.id)?.click()}
                  disabled={estaEnviando}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cambiar archivo
                </button>
              </div>
            ) : (
              <button
                onClick={() => document.getElementById(doc.id)?.click()}
                disabled={estaEnviando}
                className="w-full px-4 py-2 flex items-center justify-center gap-2 text-gray-600
                  border border-gray-300 rounded-lg hover:bg-gray-50
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={20} />
                <span>Subir archivo</span>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          Todos los documentos deben estar vigentes y ser claramente legibles.
          Se aceptan archivos en formato PDF, JPG o PNG con un tamaño máximo de 5MB.
        </p>
      </div>
    </div>
  );
}