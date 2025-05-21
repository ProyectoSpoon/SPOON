// /src/shared/utils/error.utils.ts
export const manejadorErrores = (error: unknown): ErrorApp => {
    if (error instanceof FirebaseError) {
      return manejarErrorFirebase(error);
    }
    // ... otros tipos de errores
    return {
      tipo: 'DESCONOCIDO',
      mensaje: 'Ha ocurrido un error inesperado'
    };
  };