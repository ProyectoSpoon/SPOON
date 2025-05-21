// types/error-categories.types.ts
export enum ErrorSeverity {
    CRITICAL = 'CRITICAL',
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW'
  }
  
  export enum ErrorCategory {
    AUTHENTICATION = 'AUTHENTICATION',
    AUTHORIZATION = 'AUTHORIZATION',
    NETWORK = 'NETWORK',
    DATABASE = 'DATABASE',
    VALIDATION = 'VALIDATION',
    BUSINESS_LOGIC = 'BUSINESS_LOGIC'
  }
  
  export interface ErrorMetadata {
    timestamp: Date;
    userId?: string;
    path: string;
    context?: Record<string, unknown>;
  }
  
  export interface AppError {
    code: string;
    message: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    metadata: ErrorMetadata;
    originalError?: unknown;
  }
  
  