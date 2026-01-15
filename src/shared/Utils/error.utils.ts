// /src/shared/utils/error.utils.ts

interface ErrorApp {
  tipo: string;
  mensaje: string;
}

export const manejadorErrores = (error: unknown): ErrorApp => {
  // Aquí se podrían manejar errores de Postgres o Axios si se definen clases específicas
  if (error instanceof Error) {
    return {
      tipo: 'GENERAL',
      mensaje: error.message
    };
  }

  return {
    tipo: 'DESCONOCIDO',
    mensaje: 'Ha ocurrido un error inesperado'
  };
};
