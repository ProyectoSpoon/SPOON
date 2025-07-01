
import { CheckCircle } from 'lucide-react';

// Tipos necesarios para el componente
interface DatosRestaurante {
  nombre: string;
  telefono: string;
  email: string;
  descripcion: string;
  tipoRestaurante: string;
  especialidad: string;
  capacidad: number;
  razonSocial: string;
  nit: string;
  regimenTributario: string;
  actividadEconomica: string;
}

interface RepresentanteLegal {
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  email: string;
  telefono: string;
  cargo: string;
}

interface Documento {
  id: string;
  nombre: string;
  archivo?: File;
}

/**
 * Componente de revisión final que muestra toda la información recopilada
 * @param props - Propiedades del componente
 */
interface RevisionFinalProps {
  datosRestaurante: DatosRestaurante;
  representanteLegal: RepresentanteLegal;
  documentos: Record<string, Documento>;
}

export default function RevisionFinal({
  datosRestaurante,
  representanteLegal,
  documentos
}: RevisionFinalProps) {
  return (
    <div className="space-y-8">
      {/* Información Básica y de Contacto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-neutral-900">
          <CheckCircle className="text-[#F4821F]" size={20} />
          Información Básica y de Contacto
        </h3>
        <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-6 rounded-xl">
          <div>
            <p className="text-sm text-neutral-500">Nombre del Restaurante</p>
            <p className="font-medium text-neutral-900">{datosRestaurante.nombre}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Teléfono</p>
            <p className="font-medium text-neutral-900">{datosRestaurante.telefono}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Correo Electrónico</p>
            <p className="font-medium text-neutral-900">{datosRestaurante.email}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-neutral-500">Descripción</p>
            <p className="font-medium text-neutral-900">{datosRestaurante.descripcion}</p>
          </div>
        </div>
      </div>

      {/* Información Operativa */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-neutral-900">
          <CheckCircle className="text-[#F4821F]" size={20} />
          Información Operativa
        </h3>
        <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-6 rounded-xl">
          <div>
            <p className="text-sm text-neutral-500">Tipo de Restaurante</p>
            <p className="font-medium text-neutral-900">{datosRestaurante.tipoRestaurante}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Especialidad</p>
            <p className="font-medium text-neutral-900">{datosRestaurante.especialidad}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Capacidad</p>
            <p className="font-medium text-neutral-900">{datosRestaurante.capacidad} personas</p>
          </div>
        </div>
      </div>

      {/* Información Legal */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-neutral-900">
          <CheckCircle className="text-[#F4821F]" size={20} />
          Información Legal
        </h3>
        <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-6 rounded-xl">
          <div>
            <p className="text-sm text-neutral-500">Razón Social</p>
            <p className="font-medium text-neutral-900">{datosRestaurante.razonSocial}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">NIT</p>
            <p className="font-medium text-neutral-900">{datosRestaurante.nit}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Régimen Tributario</p>
            <p className="font-medium text-neutral-900">{datosRestaurante.regimenTributario}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Actividad Económica</p>
            <p className="font-medium text-neutral-900">{datosRestaurante.actividadEconomica}</p>
          </div>
        </div>
      </div>

      {/* Representante Legal */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-neutral-900">
          <CheckCircle className="text-[#F4821F]" size={20} />
          Representante Legal
        </h3>
        <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-6 rounded-xl">
          <div>
            <p className="text-sm text-neutral-500">Nombres</p>
            <p className="font-medium text-neutral-900">{representanteLegal.nombres}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Apellidos</p>
            <p className="font-medium text-neutral-900">{representanteLegal.apellidos}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Tipo de Documento</p>
            <p className="font-medium text-neutral-900">{representanteLegal.tipoDocumento}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Número de Documento</p>
            <p className="font-medium text-neutral-900">{representanteLegal.numeroDocumento}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Correo Electrónico</p>
            <p className="font-medium text-neutral-900">{representanteLegal.email}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Teléfono</p>
            <p className="font-medium text-neutral-900">{representanteLegal.telefono}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-neutral-500">Cargo</p>
            <p className="font-medium text-neutral-900">{representanteLegal.cargo}</p>
          </div>
        </div>
      </div>

      {/* Documentos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-neutral-900">
          <CheckCircle className="text-[#F4821F]" size={20} />
          Documentos Cargados
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.values(documentos).map((doc) => (
            <div key={doc.id} className="bg-neutral-50 p-4 rounded-xl">
              <p className="text-sm text-neutral-500">{doc.nombre}</p>
              <div className="flex items-center gap-2 mt-2 text-[#F4821F]">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">
                  {doc.archivo?.name || 'Archivo cargado'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mensaje Final */}
      <div className="bg-blue-50 p-6 rounded-xl">
        <p className="text-sm text-blue-700">
          Por favor, revise cuidadosamente toda la información antes de finalizar. 
          Una vez enviada, algunos datos no podrán ser modificados sin aprobación previa.
        </p>
      </div>
    </div>
  );
}
