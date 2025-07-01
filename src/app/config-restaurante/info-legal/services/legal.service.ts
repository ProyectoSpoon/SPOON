// Legal service for PostgreSQL

interface ConfiguracionLegal {
  datosRestaurante: {
    nombre: string;
    descripcion: string;
    razonSocial: string;
    nit: string;
    regimenTributario: string;
    actividadEconomica: string;
    telefono: string;
    email: string;
    tipoRestaurante: string;
    especialidad: string;
    capacidad: string;
  };
  representanteLegal: {
    nombres: string;
    apellidos: string;
    tipoDocumento: string;
    numeroDocumento: string;
    email: string;
    telefono: string;
    cargo: string;
  };
  documentos: Record<string, {
    id: string;
    nombre: string;
    archivo: File | null;
    estado: 'pendiente' | 'cargando' | 'completado' | 'error';
    error?: string;
  }>;
  pasoCompletado: number;
  configuracionCompleta: boolean;
}

export const guardarConfiguracionLegal = async (
  email: string, 
  datos: ConfiguracionLegal
) => {
  try {
    const response = await fetch('/api/restaurants/legal-config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        ...datos,
        updatedAt: new Date(),
        info_legal: {
          completed: datos.configuracionCompleta,
          lastUpdated: new Date(),
          currentStep: datos.pasoCompletado
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Error al guardar configuración legal');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al guardar configuración legal:', error);
    throw error;
  }
};
