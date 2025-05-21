// src/app/config-restaurante/info-legal/hooks/useFormularioLegal.ts

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/shared/Hooks/use-toast';
import { useConfigStore } from '../../store/config-store';
import restaurantLegalService, {
  BasicInfo,
  ContactInfo,
  OperationalInfo,
  LegalInfo
} from '@/firebase/services/restaurant/legal.service';

// Tipos
export interface InfoRestaurante {
  // Información Básica
  nombre: string;
  descripcion: string;
  // Información Legal
  razonSocial: string;
  nit: string;
  regimenTributario: string;
  actividadEconomica: string;
  // Información de Contacto
  telefono: string;
  email: string;
  // Información Operativa
  tipoRestaurante: string;
  especialidad: string;
  capacidad: string;
}

export interface RepresentanteLegal {
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  email: string;
  telefono: string;
  cargo: string;
}

export interface Documento {
  id: string;
  nombre: string;
  archivo: File | null;
  estado: 'pendiente' | 'cargando' | 'completado' | 'error';
  error?: string;
  url?: string;
}

export interface EstadoFormulario {
  paso: number;
  datosRestaurante: InfoRestaurante;
  representanteLegal: RepresentanteLegal;
  documentos: Record<string, Documento>;
  esValido: boolean;
  errores: Record<string, string>;
  cargando: boolean;
}

const ESTADO_INICIAL: EstadoFormulario = {
  paso: 0,
  datosRestaurante: {
    nombre: '',
    descripcion: '',
    razonSocial: '',
    nit: '',
    regimenTributario: '',
    actividadEconomica: '',
    telefono: '',
    email: '',
    tipoRestaurante: '',
    especialidad: '',
    capacidad: ''
  },
  representanteLegal: {
    nombres: '',
    apellidos: '',
    tipoDocumento: '',
    numeroDocumento: '',
    email: '',
    telefono: '',
    cargo: ''
  },
  documentos: {
    rut: {
      id: 'rut',
      nombre: 'RUT actualizado',
      archivo: null,
      estado: 'pendiente'
    },
    camara_comercio: {
      id: 'camara_comercio',
      nombre: 'Cámara de Comercio',
      archivo: null,
      estado: 'pendiente'
    },
    cedula_representante: {
      id: 'cedula_representante',
      nombre: 'Documento de Identidad',
      archivo: null,
      estado: 'pendiente'
    },
    registro_sanitario: {
      id: 'registro_sanitario',
      nombre: 'Registro Sanitario',
      archivo: null,
      estado: 'pendiente'
    }
  },
  esValido: false,
  errores: {},
  cargando: false
};

export function useFormularioLegal(restaurantId: string) {
  const [estado, setEstado] = useState<EstadoFormulario>(ESTADO_INICIAL);
  const { toast } = useToast();
  const { actualizarCampo } = useConfigStore();

  // Cargar datos iniciales
  const cargarDatos = useCallback(async () => {
    try {
      setEstado(prev => ({ ...prev, cargando: true }));
      const data = await restaurantLegalService.getAllLegalInfo(restaurantId);
      
      setEstado(prev => ({
        ...prev,
        datosRestaurante: {
          ...prev.datosRestaurante,
          ...data.basicInfo,
          ...data.contactInfo,
          ...data.operationalInfo,
          ...data.legalInfo
        },
        documentos: {
          ...prev.documentos,
          ...Object.entries(data.documents).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: {
              ...prev.documentos[key],
              estado: value.status === 'completed' ? 'completado' : 'pendiente',
              url: value.url
            }
          }), {})
        },
        cargando: false
      }));
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive'
      });
      setEstado(prev => ({ ...prev, cargando: false }));
    }
  }, [restaurantId, toast]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Validaciones
  const validarEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validarTelefono = (telefono: string): boolean => {
    return /^\d{10}$/.test(telefono);
  };

  const validarNIT = (nit: string): boolean => {
    return /^\d{9}-\d$/.test(nit);
  };

  const validarPasoActual = (): boolean => {
    const nuevosErrores: Record<string, string> = {};
    let esValido = true;

    switch (estado.paso) {
      case 0: // Información Básica
        if (!estado.datosRestaurante.nombre) {
          nuevosErrores.nombre = 'El nombre es requerido';
          esValido = false;
        }
        if (!estado.datosRestaurante.descripcion) {
          nuevosErrores.descripcion = 'La descripción es requerida';
          esValido = false;
        }
        break;

      case 1: // Información de Contacto
        if (!estado.datosRestaurante.telefono) {
          nuevosErrores.telefono = 'El teléfono es requerido';
          esValido = false;
        } else if (!validarTelefono(estado.datosRestaurante.telefono)) {
          nuevosErrores.telefono = 'El teléfono debe tener 10 dígitos';
          esValido = false;
        }
        
        if (!estado.datosRestaurante.email) {
          nuevosErrores.email = 'El email es requerido';
          esValido = false;
        } else if (!validarEmail(estado.datosRestaurante.email)) {
          nuevosErrores.email = 'El email no es válido';
          esValido = false;
        }
        break;

      case 2: // Información Operativa
        if (!estado.datosRestaurante.tipoRestaurante) {
          nuevosErrores.tipoRestaurante = 'El tipo de restaurante es requerido';
          esValido = false;
        }
        if (!estado.datosRestaurante.especialidad) {
          nuevosErrores.especialidad = 'La especialidad es requerida';
          esValido = false;
        }
        if (!estado.datosRestaurante.capacidad) {
          nuevosErrores.capacidad = 'La capacidad es requerida';
          esValido = false;
        }
        break;

      case 3: // Información Legal
        if (!estado.datosRestaurante.razonSocial) {
          nuevosErrores.razonSocial = 'La razón social es requerida';
          esValido = false;
        }
        if (!estado.datosRestaurante.nit) {
          nuevosErrores.nit = 'El NIT es requerido';
          esValido = false;
        } else if (!validarNIT(estado.datosRestaurante.nit)) {
          nuevosErrores.nit = 'El formato del NIT no es válido';
          esValido = false;
        }
        break;

      case 4: // Documentos
        const docsCompletos = Object.values(estado.documentos)
          .every(doc => doc.estado === 'completado');
        if (!docsCompletos) {
          nuevosErrores.documentos = 'Todos los documentos son requeridos';
          esValido = false;
        }
        break;

      case 5: // Revisión Final
        esValido = validarFormularioCompleto();
        break;
    }

    setEstado(prev => ({
      ...prev,
      errores: nuevosErrores,
      esValido
    }));

    return esValido;
  };

  const validarFormularioCompleto = (): boolean => {
    return (
      // Información básica
      !!estado.datosRestaurante.nombre &&
      !!estado.datosRestaurante.descripcion &&
      // Información de contacto
      validarEmail(estado.datosRestaurante.email) &&
      validarTelefono(estado.datosRestaurante.telefono) &&
      // Información operativa
      !!estado.datosRestaurante.tipoRestaurante &&
      !!estado.datosRestaurante.especialidad &&
      !!estado.datosRestaurante.capacidad &&
      // Información legal
      !!estado.datosRestaurante.razonSocial &&
      validarNIT(estado.datosRestaurante.nit) &&
      // Documentos
      Object.values(estado.documentos).every(doc => doc.estado === 'completado')
    );
  };

  // Manejadores de actualización
  const actualizarDatosRestaurante = async (datos: Partial<InfoRestaurante>) => {
    try {
      setEstado(prev => ({
        ...prev,
        cargando: true,
        datosRestaurante: {
          ...prev.datosRestaurante,
          ...datos
        }
      }));

      // Guardar en Firebase según el paso actual
      switch (estado.paso) {
        case 0:
          if (datos.nombre && datos.descripcion) {
            await restaurantLegalService.saveBasicInfo(restaurantId, {
              nombre: datos.nombre,
              descripcion: datos.descripcion
            });
          }
          break;

        case 1:
          if (datos.telefono && datos.email) {
            await restaurantLegalService.saveContactInfo(restaurantId, {
              telefono: datos.telefono,
              email: datos.email
            });
          }
          break;

        case 2:
          if (datos.tipoRestaurante && datos.especialidad && datos.capacidad) {
            await restaurantLegalService.saveOperationalInfo(restaurantId, {
              tipoRestaurante: datos.tipoRestaurante,
              especialidad: datos.especialidad,
              capacidad: datos.capacidad
            });
          }
          break;

        case 3:
          if (datos.razonSocial && datos.nit && datos.regimenTributario && datos.actividadEconomica) {
            await restaurantLegalService.saveLegalInfo(restaurantId, {
              razonSocial: datos.razonSocial,
              nit: datos.nit,
              regimenTributario: datos.regimenTributario,
              actividadEconomica: datos.actividadEconomica
            });
          }
          break;
      }

      actualizarCampo('info-legal', `paso-${estado.paso}`, true);
      validarPasoActual();
      
      toast({
        title: 'Éxito',
        description: 'Los cambios han sido guardados',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error actualizando datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios',
        variant: 'destructive'
      });
    } finally {
      setEstado(prev => ({ ...prev, cargando: false }));
    }
  };

  const actualizarDocumento = async (id: string, archivo: File) => {
    try {
      setEstado(prev => ({
        ...prev,
        cargando: true,
        documentos: {
          ...prev.documentos,
          [id]: {
            ...prev.documentos[id],
            archivo,
            estado: 'cargando'
          }
        }
      }));

      const url = await restaurantLegalService.uploadDocument(restaurantId, {
        id,
        file: archivo,
        type: id
      });

      setEstado(prev => ({
        ...prev,
        documentos: {
          ...prev.documentos,
          [id]: {
            ...prev.documentos[id],
            archivo,
            estado: 'completado',
            url
          }
        }
      }));

      actualizarCampo('info-legal', 'documentos-legales', true);
      validarPasoActual();

      toast({
        title: 'Éxito',
        description: 'Documento subido correctamente',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error subiendo documento:', error);
      setEstado(prev => ({
        ...prev,
        documentos: {
          ...prev.documentos,
          [id]: {
            ...prev.documentos[id],
            estado: 'error',
            error: 'Error al subir el documento'
          }
        }
      }));
      
      toast({
        title: 'Error',
        description: 'No se pudo subir el documento',
        variant: 'destructive'
      });
    } finally {
      setEstado(prev => ({ ...prev, cargando: false }));
    }
  };

  // Navegación
  const siguientePaso = useCallback(() => {
    if (validarPasoActual() && estado.paso < 5) {
      setEstado(prev => ({ ...prev, paso: prev.paso + 1 }));
    }
  }, [estado.paso]);

  const pasoAnterior = useCallback(() => {
    if (estado.paso > 0) {
      setEstado(prev => ({ ...prev, paso: prev.paso - 1 }));
    }
  }, [estado.paso]);

  return {
    estado,
    actualizarDatosRestaurante,
    actualizarDocumento,
    siguientePaso,
    pasoAnterior,
    validarPasoActual,
    validarFormularioCompleto,
    cargarDatos
  };
}