// /src/__tests__/error-handling.test.ts
;

// Tipo de error personalizado
interface ErrorResult {
  tipo: 'PERMISOS' | 'AUTENTICACION' | 'RED' | 'SERVIDOR' | 'DESCONOCIDO';
  mensaje: string;
  codigo?: string;
}

// Función manejadora de errores
const manejadorErrores = (error: any): ErrorResult => {
  // Si es un error de Firebase
  if (error instanceof FirebaseError) {
    const code = error.code;
    
    if (code.includes('permission-denied')) {
      return {
        tipo: 'PERMISOS',
        mensaje: 'No tienes permisos para realizar esta acción',
        codigo: code
      };
    }
    
    if (code.includes('unauthenticated') || code.includes('auth')) {
      return {
        tipo: 'AUTENTICACION',
        mensaje: 'Error de autenticación. Por favor, inicia sesión nuevamente',
        codigo: code
      };
    }
    
    return {
      tipo: 'DESCONOCIDO',
      mensaje: error.message,
      codigo: code
    };
  }
  
  // Si es un error de red
  if (error.message && error.message.includes('network')) {
    return {
      tipo: 'RED',
      mensaje: 'Error de conexión. Verifica tu conexión a internet'
    };
  }
  
  // Error por defecto
  return {
    tipo: 'DESCONOCIDO',
    mensaje: error.message || 'Ha ocurrido un error inesperado'
  };
};

// Mock de FirebaseError para pruebas
jest.mock('firebase/app', () => ({
  FirebaseError: class FirebaseError extends Error {
    code: string;
    
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
      this.name = 'FirebaseError';
    }
  }
}));

describe('Error Handling', () => {
  test('maneja errores de Firebase correctamente', () => {
    const error = new FirebaseError('permission-denied', 'No access');
    const resultado = manejadorErrores(error);
    expect(resultado.tipo).toBe('PERMISOS');
  });
  
  test('maneja errores de autenticación correctamente', () => {
    const error = new FirebaseError('auth/user-not-found', 'User not found');
    const resultado = manejadorErrores(error);
    expect(resultado.tipo).toBe('AUTENTICACION');
  });
  
  test('maneja errores de red correctamente', () => {
    const error = new Error('network error occurred');
    const resultado = manejadorErrores(error);
    expect(resultado.tipo).toBe('RED');
  });
  
  test('maneja errores desconocidos correctamente', () => {
    const error = new Error('Unknown error');
    const resultado = manejadorErrores(error);
    expect(resultado.tipo).toBe('DESCONOCIDO');
  });
});
