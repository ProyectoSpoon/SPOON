'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndicadorProgreso } from '@/shared/components/ui/IndicadorProgreso';
import { useToast } from '@/shared/Hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useConfigStore } from '../store/config-store';
import InfoBasica from './components/infobasica';
import InfoContacto from './components/infocontacto';
import InfoOperativa from './components/infooperativa';
import InfoRestaurante from './components/InfoRestaurante';
import DocumentosLegales from './components/DocumentosLegales';
import RevisionFinal from './components/RevisionFinal';

/**
 * Tipos para la información del restaurante
 */
interface DatosRestaurante {
  // Información Básica
  nombre: string;
  descripcion: string;
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

/**
 * Tipos para el representante legal
 */
interface RepresentanteLegal {
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  email: string;
  telefono: string;
  cargo: string;
}

/**
 * Tipos para documentos
 */
interface Documento {
  id: string;
  nombre: string;
  archivo: File | null;
  estado: 'pendiente' | 'cargando' | 'completado' | 'error';
  error?: string;
}

/**
 * Estado del formulario
 */
interface EstadoFormulario {
  paso: number;
  datosRestaurante: DatosRestaurante;
  representanteLegal: RepresentanteLegal;
  documentos: Record<string, Documento>;
}

/**
 * Pasos del formulario
 */
const PASOS_FORMULARIO = [
  { titulo: 'Información Básica', descripcion: 'Datos generales del restaurante' },
  { titulo: 'Información de Contacto', descripcion: 'Datos de contacto del negocio' },
  { titulo: 'Información Operativa', descripcion: 'Detalles de operación' },
  { titulo: 'Información Legal', descripcion: 'Datos legales del establecimiento' },
  { titulo: 'Documentos Legales', descripcion: 'Carga de documentos requeridos' },
  { titulo: 'Revisión Final', descripcion: 'Verificación de la información' }
];

/**
 * Estado inicial del formulario
 */
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
  }
};

/**
 * Componente principal de configuración del restaurante
 */
export default function ConfiguracionCompletaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { actualizarCampo } = useConfigStore();
  const [estado, setEstado] = useState<EstadoFormulario>(ESTADO_INICIAL);
  const [estaEnviando, setEstaEnviando] = useState(false);

  // Efecto para monitorear cambios en el estado
  useEffect(() => {
    console.log('[ConfiguracionCompletaPage] Estado actualizado:', {
      paso: estado.paso,
      pasoActual: PASOS_FORMULARIO[estado.paso].titulo,
      datosCompletos: validarPasoActual(),
      estado: estado
    });
  }, [estado]);

  /**
   * Validación por paso del formulario
   */
  const validarPasoActual = (): boolean => {
    console.log('[ValidarPasoActual] Iniciando validación del paso:', estado.paso);
    
    const { paso, datosRestaurante, representanteLegal, documentos } = estado;

    switch (paso) {
      case 0: // Información Básica
        console.log('[ValidarPasoActual] Validando Información Básica:', {
          nombre: datosRestaurante.nombre,
          descripcion: datosRestaurante.descripcion
        });
        return !!(
          datosRestaurante.nombre &&
          datosRestaurante.descripcion
        );

      case 1: // Información de Contacto
        console.log('[ValidarPasoActual] Validando Información de Contacto:', {
          telefono: datosRestaurante.telefono,
          email: datosRestaurante.email,
          emailValido: validarEmail(datosRestaurante.email),
          telefonoValido: validarTelefono(datosRestaurante.telefono)
        });
        return !!(
          datosRestaurante.telefono && 
          datosRestaurante.email &&
          validarEmail(datosRestaurante.email) &&
          validarTelefono(datosRestaurante.telefono)
        );

      case 2: // Información Operativa
        console.log('[ValidarPasoActual] Validando Información Operativa:', {
          tipoRestaurante: datosRestaurante.tipoRestaurante,
          especialidad: datosRestaurante.especialidad,
          capacidad: datosRestaurante.capacidad
        });
        return !!(
          datosRestaurante.tipoRestaurante &&
          datosRestaurante.especialidad &&
          datosRestaurante.capacidad
        );

      case 3: // Información Legal
        console.log('[ValidarPasoActual] Validando Información Legal:', {
          razonSocial: datosRestaurante.razonSocial,
          nit: datosRestaurante.nit,
          regimenTributario: datosRestaurante.regimenTributario,
          actividadEconomica: datosRestaurante.actividadEconomica
        });
        return !!(
          datosRestaurante.razonSocial &&
          datosRestaurante.nit &&
          datosRestaurante.regimenTributario &&
          datosRestaurante.actividadEconomica
        );

      case 4: // Documentos Legales
        const documentosValidos = Object.values(documentos).every(doc => doc.estado === 'completado');
        console.log('[ValidarPasoActual] Validando Documentos Legales:', {
          documentos: Object.keys(documentos).reduce((acc, key) => ({
            ...acc,
            [key]: documentos[key].estado
          }), {}),
          documentosValidos
        });
        return documentosValidos;

      case 5: // Revisión Final
        const formularioCompleto = validarFormularioCompleto();
        console.log('[ValidarPasoActual] Validando Revisión Final:', {
          formularioCompleto
        });
        return formularioCompleto;

      default:
        console.log('[ValidarPasoActual] Paso no reconocido:', paso);
        return false;
    }
  };

/**
   * Validación del formulario completo
   */
const validarFormularioCompleto = (): boolean => {
  console.log('[ValidarFormularioCompleto] Iniciando validación completa');
  
  const { datosRestaurante, representanteLegal, documentos } = estado;
  
  // Validar todos los campos requeridos
  const datosBasicosValidos = !!(
    datosRestaurante.nombre &&
    datosRestaurante.descripcion &&
    datosRestaurante.telefono &&
    datosRestaurante.email &&
    validarEmail(datosRestaurante.email) &&
    validarTelefono(datosRestaurante.telefono) &&
    datosRestaurante.tipoRestaurante &&
    datosRestaurante.especialidad &&
    datosRestaurante.capacidad &&
    datosRestaurante.razonSocial &&
    datosRestaurante.nit &&
    datosRestaurante.regimenTributario &&
    datosRestaurante.actividadEconomica
  );

  const representanteValido = !!(
    representanteLegal.nombres &&
    representanteLegal.apellidos &&
    representanteLegal.tipoDocumento &&
    representanteLegal.numeroDocumento &&
    representanteLegal.email &&
    representanteLegal.telefono &&
    representanteLegal.cargo
  );

  const documentosValidos = Object.values(documentos)
    .every(doc => doc.estado === 'completado');

  console.log('[ValidarFormularioCompleto] Resultado de validación:', {
    datosBasicosValidos,
    representanteValido,
    documentosValidos,
    datosRestaurante,
    representanteLegal,
    documentosEstado: Object.entries(documentos).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value.estado
    }), {})
  });

  return datosBasicosValidos && representanteValido && documentosValidos;
};

/**
 * Validación de formato de email
 */
const validarEmail = (email: string): boolean => {
  const resultado = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  console.log('[ValidarEmail]', { email, esValido: resultado });
  return resultado;
};

/**
 * Validación de formato de teléfono
 */
const validarTelefono = (telefono: string): boolean => {
  const resultado = /^\d{10}$/.test(telefono);
  console.log('[ValidarTelefono]', { telefono, esValido: resultado });
  return resultado;
};

/**
 * Actualización de datos del restaurante
 */
const actualizarDatosRestaurante = (datos: Partial<DatosRestaurante>) => {
  console.log('[ActualizarDatosRestaurante] Nuevos datos:', datos);
  
  setEstado(prevEstado => {
    const nuevoEstado = {
      ...prevEstado,
      datosRestaurante: {
        ...prevEstado.datosRestaurante,
        ...datos
      }
    };
    
    console.log('[ActualizarDatosRestaurante] Estado actualizado:', {
      anterior: prevEstado.datosRestaurante,
      nuevo: nuevoEstado.datosRestaurante
    });
    
    return nuevoEstado;
  });
};

/**
 * Actualización de datos del representante legal
 */
const actualizarRepresentanteLegal = (datos: Partial<RepresentanteLegal>) => {
  console.log('[ActualizarRepresentanteLegal] Nuevos datos:', datos);
  
  setEstado(prevEstado => {
    const nuevoEstado = {
      ...prevEstado,
      representanteLegal: {
        ...prevEstado.representanteLegal,
        ...datos
      }
    };
    
    console.log('[ActualizarRepresentanteLegal] Estado actualizado:', {
      anterior: prevEstado.representanteLegal,
      nuevo: nuevoEstado.representanteLegal
    });
    
    return nuevoEstado;
  });
};

/**
 * Actualización de documentos
 */
const actualizarDocumento = (id: string, archivo: File) => {
  console.log('[ActualizarDocumento] Actualizando documento:', {
    id,
    archivo: {
      nombre: archivo.name,
      tipo: archivo.type,
      tamaño: archivo.size
    }
  });
  
  setEstado(prevEstado => {
    const nuevoEstado: EstadoFormulario = {
      ...prevEstado,
      documentos: {
        ...prevEstado.documentos,
        [id]: {
          ...prevEstado.documentos[id],
          archivo,
          estado: 'completado' as const
        }
      }
    };
    
    console.log('[ActualizarDocumento] Estado de documentos actualizado:', {
      anterior: prevEstado.documentos[id],
      nuevo: nuevoEstado.documentos[id]
    });
    
    return nuevoEstado;
  });
};

/**
   * Manejo de navegación entre pasos
   */
const siguientePaso = () => {
  console.log('[SiguientePaso] Intentando avanzar al siguiente paso:', {
    pasoActual: estado.paso,
    siguientePaso: estado.paso + 1,
    esValido: validarPasoActual()
  });

  if (validarPasoActual() && estado.paso < PASOS_FORMULARIO.length - 1) {
    setEstado(prevEstado => {
      const nuevoEstado = {
        ...prevEstado,
        paso: prevEstado.paso + 1
      };
      console.log('[SiguientePaso] Avanzando al siguiente paso:', {
        anterior: prevEstado.paso,
        nuevo: nuevoEstado.paso
      });
      return nuevoEstado;
    });
  } else {
    console.log('[SiguientePaso] No se puede avanzar:', {
      razon: !validarPasoActual() ? 'Validación fallida' : 'Último paso alcanzado'
    });
  }
};

const pasoAnterior = () => {
  console.log('[PasoAnterior] Intentando retroceder al paso anterior:', {
    pasoActual: estado.paso,
    pasoAnterior: estado.paso - 1
  });

  if (estado.paso > 0) {
    setEstado(prevEstado => {
      const nuevoEstado = {
        ...prevEstado,
        paso: prevEstado.paso - 1
      };
      console.log('[PasoAnterior] Retrocediendo al paso anterior:', {
        anterior: prevEstado.paso,
        nuevo: nuevoEstado.paso
      });
      return nuevoEstado;
    });
  } else {
    console.log('[PasoAnterior] No se puede retroceder: Ya está en el primer paso');
  }
};

/**
 * Manejo del guardado de datos
 */
const manejarGuardado = async (finalizar: boolean = false) => {
  console.log('[ManejarGuardado] Iniciando proceso de guardado:', {
    finalizar,
    pasoActual: estado.paso,
    estadoActual: estado
  });

  try {
    setEstaEnviando(true);

    // Mock del guardado - aquí iría la lógica real de Firebase
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (finalizar) {
      // Actualizamos todos los campos al finalizar
      actualizarCampo('info-legal', 'info-basica', true);
      actualizarCampo('info-legal', 'info-contacto', true);
      actualizarCampo('info-legal', 'info-operativa', true);
      actualizarCampo('info-legal', 'info-legal', true);
      actualizarCampo('info-legal', 'documentos-legales', true);
      actualizarCampo('info-legal', 'revision-final', true);

      toast({
        title: 'Configuración completada',
        description: 'Tu información ha sido guardada exitosamente',
        variant: 'default'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/config-restaurante');
    } else {
      // Actualizamos solo el paso actual
      const pasoActual = PASOS_FORMULARIO[estado.paso].titulo
        .toLowerCase()
        .replace(' ', '-');
      
      actualizarCampo('info-legal', pasoActual, true);
      
      toast({
        title: 'Progreso guardado',
        description: 'Los cambios han sido guardados correctamente',
        variant: 'default'
      });
    }
  } catch (error) {
    console.error('[ManejarGuardado] Error:', error);
    toast({
      title: 'Error al guardar',
      description: error instanceof Error ? error.message : 
        'No se pudieron guardar los cambios. Por favor, intente nuevamente.',
      variant: 'destructive'
    });
  } finally {
    setEstaEnviando(false);
  }
};

/**
   * Renderizado del contenido según el paso actual
   */
const renderizarContenido = () => {
  console.log('[RenderizarContenido] Renderizando contenido para paso:', {
    paso: estado.paso,
    titulo: PASOS_FORMULARIO[estado.paso].titulo
  });

  switch (estado.paso) {
    case 0:
      console.log('[RenderizarContenido] Renderizando InfoBasica');
      return (
        <InfoBasica
          datos={{
            nombre: estado.datosRestaurante.nombre,
            descripcion: estado.datosRestaurante.descripcion
          }}
          actualizarDatos={actualizarDatosRestaurante}
          estaEnviando={estaEnviando}
        />
      );

    case 1:
      console.log('[RenderizarContenido] Renderizando InfoContacto');
      return (
        <InfoContacto
          datos={{
            telefono: estado.datosRestaurante.telefono,
            email: estado.datosRestaurante.email
          }}
          actualizarDatos={actualizarDatosRestaurante}
          estaEnviando={estaEnviando}
        />
      );

    case 2:
      console.log('[RenderizarContenido] Renderizando InfoOperativa');
      return (
        <InfoOperativa
          datos={{
            tipoRestaurante: estado.datosRestaurante.tipoRestaurante,
            especialidad: estado.datosRestaurante.especialidad,
            capacidad: estado.datosRestaurante.capacidad
          }}
          actualizarDatos={actualizarDatosRestaurante}
          estaEnviando={estaEnviando}
        />
      );

    case 3:
      console.log('[RenderizarContenido] Renderizando InfoRestaurante');
      return (
        <InfoRestaurante
          datos={{
            nombreNegocio: estado.datosRestaurante.nombre,
            razonSocial: estado.datosRestaurante.razonSocial,
            nit: estado.datosRestaurante.nit,
            regimenTributario: estado.datosRestaurante.regimenTributario,
            actividadEconomica: estado.datosRestaurante.actividadEconomica
          }}
          actualizarDatos={actualizarDatosRestaurante}
          estaEnviando={estaEnviando}
        />
      );

    case 4:
      console.log('[RenderizarContenido] Renderizando DocumentosLegales');
      return (
        <DocumentosLegales
          documentos={estado.documentos}
          actualizarDocumento={actualizarDocumento}
          estaEnviando={estaEnviando}
        />
      );

    case 5:
      console.log('[RenderizarContenido] Renderizando RevisionFinal');
      return (
        <RevisionFinal
          datosRestaurante={{
            ...estado.datosRestaurante,
            capacidad: parseInt(estado.datosRestaurante.capacidad) || 0
          }}
          representanteLegal={estado.representanteLegal}
          documentos={Object.fromEntries(
            Object.entries(estado.documentos).map(([key, doc]) => [
              key,
              {
                ...doc,
                archivo: doc.archivo || undefined
              }
            ])
          )}
        />
      );

    default:
      console.warn('[RenderizarContenido] Paso no reconocido:', estado.paso);
      return null;
  }
};

return (
  <div className="min-h-screen bg-white py-8">
    <div className="max-w-3xl mx-auto px-4">
      {/* Breadcrumb */}
      <nav className="flex mb-4 text-sm">
        <ol className="flex items-center space-x-2">
          <li>
            <a href="/dashboard" className="text-neutral-500 hover:text-neutral-700">
              Dashboard
            </a>
          </li>
          <li className="text-neutral-500">/</li>
          <li className="text-neutral-900">Configuración del Restaurante</li>
        </ol>
      </nav>

      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Configuración del Restaurante
        </h1>
        <p className="text-neutral-600">
          Complete la información de su establecimiento
        </p>
      </motion.div>
      {/* Indicador de Progreso */}
      <div className="mb-8">
          <IndicadorProgreso
            pasos={PASOS_FORMULARIO}
            pasoActual={estado.paso}
          />
        </div>

        {/* Contenido Principal */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          {renderizarContenido()}
        </div>

        {/* Navegación y Botones */}
        <div className="flex justify-between items-center">
          {/* Botón de Guardar Progreso - Solo visible si NO es RevisionFinal */}
          {estado.paso < PASOS_FORMULARIO.length - 1 && (
            <button
              onClick={() => {
                console.log('[UI] Click en Guardar Progreso');
                manejarGuardado(false);
              }}
              disabled={estaEnviando}
              className="px-4 py-2 text-neutral-600 hover:text-neutral-800 
                        border border-neutral-300 rounded-lg transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar Progreso
            </button>
          )}

          <div className="flex gap-4 ml-auto">
            {estado.paso > 0 && (
              <button
                onClick={() => {
                  console.log('[UI] Click en botón Anterior');
                  pasoAnterior();
                }}
                disabled={estaEnviando}
                className="px-4 py-2 text-neutral-600 hover:text-neutral-800 
                          border border-neutral-300 rounded-lg transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
            )}

            {estado.paso === PASOS_FORMULARIO.length - 1 ? (
              <button
                onClick={() => {
                  console.log('[UI] Click en botón Finalizar Configuración');
                  manejarGuardado(true);
                }}
                disabled={estaEnviando}
                className="px-4 py-2 bg-[#F4821F] hover:bg-[#CC6A10] 
                          text-white rounded-lg transition-colors"
              >
                {estaEnviando ? 'Enviando...' : 'Finalizar Configuración'}
              </button>
            ) : (
              <button
                onClick={() => {
                  console.log('[UI] Click en botón Siguiente');
                  siguientePaso();
                }}
                disabled={estaEnviando || !validarPasoActual()}
                className="px-4 py-2 bg-[#F4821F] hover:bg-[#CC6A10] 
                          text-white rounded-lg transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            )}
          </div>
        </div>

        {/* Mensajes de validación */}
        {estado.paso === PASOS_FORMULARIO.length - 1 && !validarFormularioCompleto() && (
          <p className="text-sm text-[#F4821F] text-center mt-4">
            Por favor, asegúrese de que toda la información esté completa antes de finalizar
          </p>
        )}
      </div>
    </div>
  );
}
