// /src/shared/utils/error.utils.ts

interface ErrorApp {
  tipo: string;
  mensaje: string;
}

class FirebaseError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

const manejarErrorFirebase = (error: FirebaseError): ErrorApp => {
  return {
    tipo: 'FIREBASE',
    mensaje: error.message
  };
};

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
