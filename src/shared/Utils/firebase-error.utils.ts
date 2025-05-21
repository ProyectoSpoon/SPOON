// src/shared/utils/firebase-error.utils.ts
import { FirebaseError } from 'firebase/app'
import { ErrorHandlerService } from '../services/error-handler.service'
import { AppError, ErrorCategory, ErrorSeverity } from '../types/error.types'

interface FirebaseErrorMapping {
 code: string;
 category: ErrorCategory;
 severity: ErrorSeverity;
 message: string;
}

const firebaseErrorMap: Record<string, FirebaseErrorMapping> = {
 'auth/user-not-found': {
   code: 'AUTH_USER_NOT_FOUND',
   category: ErrorCategory.AUTHENTICATION,
   severity: ErrorSeverity.HIGH,
   message: 'Usuario no encontrado'
 },
 'auth/wrong-password': {
   code: 'AUTH_INVALID_CREDENTIALS',
   category: ErrorCategory.AUTHENTICATION,
   severity: ErrorSeverity.MEDIUM,
   message: 'Credenciales inválidas'
 },
 'auth/email-already-in-use': {
   code: 'AUTH_EMAIL_IN_USE',
   category: ErrorCategory.AUTHENTICATION,
   severity: ErrorSeverity.MEDIUM,
   message: 'El correo electrónico ya está en uso'
 },
 'auth/weak-password': {
   code: 'AUTH_WEAK_PASSWORD',
   category: ErrorCategory.VALIDATION,
   severity: ErrorSeverity.LOW,
   message: 'La contraseña debe tener al menos 6 caracteres'
 },
 'auth/invalid-email': {
   code: 'AUTH_INVALID_EMAIL',
   category: ErrorCategory.VALIDATION,
   severity: ErrorSeverity.LOW,
   message: 'Correo electrónico inválido'
 },
 'auth/network-request-failed': {
   code: 'AUTH_NETWORK_ERROR',
   category: ErrorCategory.NETWORK,
   severity: ErrorSeverity.HIGH,
   message: 'Error de conexión'
 },
 'permission-denied': {
   code: 'DB_PERMISSION_DENIED',
   category: ErrorCategory.AUTHORIZATION,
   severity: ErrorSeverity.HIGH,
   message: 'No tienes permisos para realizar esta acción'
 },
 'not-found': {
   code: 'DB_NOT_FOUND',
   category: ErrorCategory.DATABASE,
   severity: ErrorSeverity.MEDIUM,
   message: 'El recurso solicitado no existe'
 }
}

export const isFirebaseError = (error: unknown): error is FirebaseError => {
 return (error as FirebaseError)?.code !== undefined;
}

export const normalizeFirebaseError = (error: FirebaseError): AppError => {
 const mapping = firebaseErrorMap[error.code] || {
   code: 'FIREBASE_UNKNOWN',
   category: ErrorCategory.BUSINESS_LOGIC,
   severity: ErrorSeverity.MEDIUM,
   message: 'Error desconocido en Firebase'
 };

 return {
   ...mapping,
   metadata: {
     timestamp: new Date(),
     path: window.location.pathname,
     userId: undefined, // Se puede agregar lógica para obtener userId
     errorCode: error.code,
     errorName: error.name,
     errorStack: error.stack,
     context: {
       platform: 'firebase',
       service: error.code.split('/')[0],
       operation: error.code.split('/')[1]
     }
   },
   originalError: error
 };
}

export const handleFirebaseError = async (
 error: unknown,
 context?: Record<string, unknown>
): Promise<void> => {
 if (isFirebaseError(error)) {
   const normalizedError = normalizeFirebaseError(error);
   await ErrorHandlerService.handleError({
     ...normalizedError,
     metadata: {
       ...normalizedError.metadata,
       context: {
         ...normalizedError.metadata.context,
         ...context
       }
     }
   });
   return;
 }
 await ErrorHandlerService.handleError(error, context);
}