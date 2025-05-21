// Mock Firebase error utils for development

/**
 * Checks if an error is a Firebase error
 * @param {Error} error - The error to check
 * @returns {boolean} - Whether the error is a Firebase error
 */
export const isFirebaseError = (error) => {
  return error && error.code && typeof error.code === 'string' && error.code.includes('/');
};

/**
 * Normalizes a Firebase error to a standard format
 * @param {Error} error - The Firebase error to normalize
 * @returns {Object} - The normalized error
 */
export const normalizeFirebaseError = (error) => {
  if (!isFirebaseError(error)) {
    return {
      code: 'unknown/error',
      message: error?.message || 'An unknown error occurred',
      originalError: error
    };
  }

  // Extract the error code and message
  const code = error.code;
  let message = error.message || 'An error occurred';

  // Remove the Firebase error prefix if present
  if (message.includes('Firebase:')) {
    message = message.split('Firebase:')[1].trim();
  }

  // Remove the error code from the message if present
  const codeInMessage = `(${code})`;
  if (message.includes(codeInMessage)) {
    message = message.replace(codeInMessage, '').trim();
  }

  return {
    code,
    message,
    originalError: error
  };
};

/**
 * Gets a user-friendly message for a Firebase error
 * @param {Error} error - The Firebase error
 * @returns {string} - A user-friendly error message
 */
export const getFirebaseErrorMessage = (error) => {
  if (!isFirebaseError(error)) {
    return error?.message || 'An unknown error occurred';
  }

  const normalizedError = normalizeFirebaseError(error);
  const code = normalizedError.code;

  // Common Firebase error codes and their user-friendly messages
  const errorMessages = {
    'auth/user-not-found': 'No se encontró ninguna cuenta con este correo electrónico',
    'auth/wrong-password': 'La contraseña es incorrecta',
    'auth/email-already-in-use': 'Este correo electrónico ya está en uso',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/invalid-email': 'El correo electrónico no es válido',
    'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este correo electrónico',
    'auth/operation-not-allowed': 'Esta operación no está permitida',
    'auth/requires-recent-login': 'Por favor, vuelve a iniciar sesión para realizar esta acción',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/invalid-credential': 'Las credenciales son inválidas',
    'auth/invalid-verification-code': 'El código de verificación es inválido',
    'auth/invalid-verification-id': 'El ID de verificación es inválido',
    'auth/captcha-check-failed': 'La verificación de captcha ha fallado',
    'auth/missing-verification-code': 'Falta el código de verificación',
    'auth/missing-verification-id': 'Falta el ID de verificación',
    'auth/phone-number-already-exists': 'Este número de teléfono ya está en uso',
    'auth/invalid-phone-number': 'El número de teléfono no es válido',
    'auth/quota-exceeded': 'Se ha excedido la cuota de SMS',
    'storage/unauthorized': 'No tienes permiso para acceder a este archivo',
    'storage/canceled': 'La operación fue cancelada',
    'storage/unknown': 'Ocurrió un error desconocido',
    'storage/object-not-found': 'No se encontró el archivo',
    'storage/bucket-not-found': 'No se encontró el bucket',
    'storage/project-not-found': 'No se encontró el proyecto',
    'storage/quota-exceeded': 'Se ha excedido la cuota de almacenamiento',
    'storage/unauthenticated': 'No estás autenticado',
    'storage/retry-limit-exceeded': 'Se ha excedido el límite de reintentos',
    'storage/invalid-checksum': 'El archivo está corrupto',
    'storage/invalid-event-name': 'Nombre de evento inválido',
    'storage/invalid-url': 'URL inválida',
    'storage/invalid-argument': 'Argumento inválido',
    'storage/no-default-bucket': 'No hay un bucket predeterminado',
    'storage/cannot-slice-blob': 'No se puede dividir el blob',
    'storage/server-file-wrong-size': 'El archivo en el servidor tiene un tamaño incorrecto',
    'firestore/cancelled': 'La operación fue cancelada',
    'firestore/unknown': 'Ocurrió un error desconocido',
    'firestore/invalid-argument': 'Argumento inválido',
    'firestore/deadline-exceeded': 'Se excedió el tiempo límite',
    'firestore/not-found': 'No se encontró el documento',
    'firestore/already-exists': 'El documento ya existe',
    'firestore/permission-denied': 'Permiso denegado',
    'firestore/resource-exhausted': 'Recursos agotados',
    'firestore/failed-precondition': 'Condición previa fallida',
    'firestore/aborted': 'Operación abortada',
    'firestore/out-of-range': 'Fuera de rango',
    'firestore/unimplemented': 'No implementado',
    'firestore/internal': 'Error interno',
    'firestore/unavailable': 'Servicio no disponible',
    'firestore/data-loss': 'Pérdida de datos',
    'firestore/unauthenticated': 'No estás autenticado'
  };

  return errorMessages[code] || normalizedError.message;
};
