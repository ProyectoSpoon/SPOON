// src/app/config-restaurante/info-legal/types/types.ts

// Mock types for Firebase (to be replaced with actual Firebase types later)
interface MockDatosFiscales {
  razonSocial: string;
  nit: string;
  regimenTributario: string;
  actividadEconomica: string;
}

interface MockDocumentosLegales {
  rut: string;
  camara_comercio: string;
  cedula_representante: string;
  registro_sanitario: string;
}

interface MockEmpresa {
  datosFiscales: MockDatosFiscales;
  documentosLegales: MockDocumentosLegales;
}

interface MockSucursal {
  tipo: string;
}

// Tipos para la información del restaurante
export interface InfoRestauranteType extends Pick<MockEmpresa['datosFiscales'], 'razonSocial' | 'nit' | 'regimenTributario' | 'actividadEconomica'> {
  tipoPersona: 'Persona natural' | 'Persona jurídica';
  responsabilidadFiscal: 'No responsable de IVA' | 'Responsable de IVA';
  nombresRestaurante: string;
  apellidosRestaurante: string;
}

// Tipos para el representante legal
export interface RepresentanteLegalType {
  nombres: string;
  apellidos: string;
  tipoDocumento: 'C.C.' | 'C.E.';
  numeroDocumento: string;
}

// Tipos para los documentos cargados
export interface DocumentoCargadoType {
  tipo: keyof MockEmpresa['documentosLegales'] | 'otros';
  archivo: File | null;
  nombreArchivo: string;
  estado: 'pendiente' | 'cargando' | 'completo' | 'error';
  error?: string;
}

// Estado global del formulario
export interface EstadoFormularioLegal {
  paso: number;
  infoRestaurante: InfoRestauranteType;
  representanteLegal: RepresentanteLegalType;
  documentos: DocumentoCargadoType[];
  esValido: boolean;
}

// Información Operativa
export interface InfoOperativa extends Pick<MockSucursal, 'tipo'> {
  tipoRestaurante: string;
  especialidad: string;
  capacidad: string;
}
