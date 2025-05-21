// src/app/config-restaurante/info-legal/types/types.ts

import { IEmpresa, ISucursal } from '@/firebase/types/collections.types';

// Tipos para la información del restaurante
export interface InfoRestauranteType extends Pick<IEmpresa['datosFiscales'], 'razonSocial' | 'nit' | 'regimenTributario' | 'actividadEconomica'> {
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
  tipo: keyof IEmpresa['documentosLegales'] | 'otros';
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
export interface InfoOperativa extends Pick<ISucursal, 'tipo'> {
  tipoRestaurante: string;
  especialidad: string;
  capacidad: string;
}