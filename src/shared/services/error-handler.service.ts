// src/shared/services/error-handler.service.ts
import { useToast } from '@/shared/components/ui/Toast/use-toast'
import { Alert, AlertDescription } from '@/shared/components/ui/Alert'
import { ErrorCategory, ErrorSeverity, AppError } from '@/shared/types/error.types'
import { auth } from '@/firebase/config'

import { isFirebaseError, normalizeFirebaseError } from '@/shared/Utils/firebase-error.utils'

export class ErrorHandlerService {
 private static RETRY_ATTEMPTS = 3;
 private static RETRY_DELAY = 1000;
 private static toastFn: ReturnType<typeof useToast>['toast'] | null = null;
 private static errorCounts = new Map<string, number>();
 private static circuitBreaker = new Map<string, boolean>();
 private static recoveryState = {
   isRecovering: false,
   lastAttempt: new Date(),
   failures: 0,
   maxFailures: 3
 };

 static setToastFunction(toastFn: ReturnType<typeof useToast>['toast']) {
   this.toastFn = toastFn;
 }

 static async handleError(error: unknown, context?: Record<string, unknown>): Promise<void> {
   const appError = isFirebaseError(error) 
     ? normalizeFirebaseError(error) 
     : this.normalizeError(error, context);

   if (this.isRateLimited(appError.code)) {
     console.warn(`Error rate limited: ${appError.code}`);
     return;
   }

   await this.logError(appError);
   await this.attemptRecovery(appError);
   this.updateErrorCount(appError.code);
   this.notifyUser(appError);
 }

 private static normalizeError(error: unknown, context?: Record<string, unknown>): AppError {
   return {
     code: 'UNKNOWN_ERROR',
     message: error instanceof Error ? error.message : 'Ha ocurrido un error inesperado',
     category: ErrorCategory.BUSINESS_LOGIC,
     severity: ErrorSeverity.MEDIUM,
     metadata: {
       timestamp: new Date(),
       path: window.location.pathname,
       context,
       retryCount: 0
     },
     originalError: error
   }
 }

 private static isRateLimited(errorCode: string): boolean {
   const count = this.errorCounts.get(errorCode) || 0;
   const maxErrorsPerMinute = 5;
   return count >= maxErrorsPerMinute;
 }

 private static updateErrorCount(errorCode: string): void {
   const currentCount = this.errorCounts.get(errorCode) || 0;
   this.errorCounts.set(errorCode, currentCount + 1);

   setTimeout(() => {
     const count = this.errorCounts.get(errorCode) || 0;
     if (count > 0) {
       this.errorCounts.set(errorCode, count - 1);
     }
   }, 60000); // Reset after 1 minute
 }

 private static async logError(error: AppError): Promise<void> {
   console.error('Error:', {
     code: error.code,
     category: error.category,
     severity: error.severity,
     message: error.message,
     metadata: {
       ...error.metadata,
       timestamp: error.metadata.timestamp.toISOString(),
       retryCount: error.metadata.retryCount
     }
   });

   // Aquí se podría integrar con servicios externos de logging
   if (process.env.NODE_ENV === 'production') {
     // await this.sendToLogService(error);
   }
 }

 private static notifyUser(error: AppError): void {
   if (!this.toastFn) {
     console.error('Toast function not set');
     return;
   }

   this.toastFn({
     title: this.getErrorTitle(error.category),
     description: error.message,
     variant: this.getSeverityVariant(error.severity),
     duration: this.getToastDuration(error.severity),
   });
 }

 private static getSeverityVariant(severity: ErrorSeverity): "default" | "destructive" {
   const variants = {
     [ErrorSeverity.CRITICAL]: "destructive",
     [ErrorSeverity.HIGH]: "destructive",
     [ErrorSeverity.MEDIUM]: "destructive",
     [ErrorSeverity.LOW]: "default",
   } as const;
   return variants[severity];
 }

 private static getErrorTitle(category: ErrorCategory): string {
   const titles = {
     [ErrorCategory.AUTHENTICATION]: 'Error de autenticación',
     [ErrorCategory.AUTHORIZATION]: 'Error de autorización',
     [ErrorCategory.NETWORK]: 'Error de red',
     [ErrorCategory.DATABASE]: 'Error de base de datos',
     [ErrorCategory.VALIDATION]: 'Error de validación',
     [ErrorCategory.BUSINESS_LOGIC]: 'Error de la aplicación'
   };
   return titles[category];
 }

 private static getToastDuration(severity: ErrorSeverity): number {
   const durations = {
     [ErrorSeverity.CRITICAL]: 10000,
     [ErrorSeverity.HIGH]: 7000,
     [ErrorSeverity.MEDIUM]: 5000,
     [ErrorSeverity.LOW]: 3000
   };
   return durations[severity];
 }

 private static async attemptRecovery(error: AppError): Promise<void> {
   if (this.recoveryState.isRecovering || this.circuitBreaker.get(error.code)) {
     return;
   }

   this.recoveryState.isRecovering = true;

   try {
     const strategy = this.getRecoveryStrategy(error);
     if (strategy) {
       await strategy();
       this.recoveryState.failures = 0;
       this.circuitBreaker.set(error.code, false);
     }
   } catch (e) {
     this.recoveryState.failures++;
     if (this.recoveryState.failures >= this.recoveryState.maxFailures) {
       this.circuitBreaker.set(error.code, true);
       setTimeout(() => {
         this.circuitBreaker.set(error.code, false);
         this.recoveryState.failures = 0;
       }, 300000); // Reset circuit breaker after 5 minutes
     }
     throw e;
   } finally {
     this.recoveryState.isRecovering = false;
     this.recoveryState.lastAttempt = new Date();
   }
 }

 private static getRecoveryStrategy(error: AppError): (() => Promise<void>) | null {
  const strategies: Partial<Record<ErrorCategory, () => Promise<void>>> = {
    [ErrorCategory.AUTHENTICATION]: this.handleAuthError,
    [ErrorCategory.NETWORK]: this.handleNetworkError,
    [ErrorCategory.DATABASE]: this.handleDatabaseError
  };
  return strategies[error.category] || null;
}

 private static async handleAuthError(): Promise<void> {
   try {
     await signOut(auth);
     window.location.href = '/login';
   } catch (error) {
     console.error('Error during auth recovery:', error);
     throw error;
   }
 }

 private static async handleNetworkError(): Promise<void> {
   for (let i = 0; i < this.RETRY_ATTEMPTS; i++) {
     try {
       const delay = this.RETRY_DELAY * Math.pow(2, i);
       await new Promise(resolve => setTimeout(resolve, delay));
       return;
     } catch (error) {
       if (i === this.RETRY_ATTEMPTS - 1) {
         throw error;
       }
     }
   }
 }

 private static async handleDatabaseError(): Promise<void> {
   try {
     // Implementar estrategia de recuperación específica para BD
     // Por ejemplo: limpiar cache, reintentar conexión, etc.
     await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
   } catch (error) {
     console.error('Error during database recovery:', error);
     throw error;
   }
 }
}