// /src/shared/types/error.types.ts

export enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NETWORK = 'NETWORK', 
  DATABASE = 'DATABASE',
  VALIDATION = 'VALIDATION',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC'
 }
 
 export enum ErrorSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM', 
  LOW = 'LOW'
 }
 
 export interface ErrorMetadata {
  timestamp: Date;
  userId?: string;
  path: string;
  errorCode?: string;
  errorName?: string;
  errorStack?: string;
  retryCount?: number;
  lastRetry?: Date;
  context?: Record<string, unknown>;
 }
 
 export interface AppError {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  metadata: ErrorMetadata;
  details?: unknown;
  originalError?: unknown;
 }
 
 // Type guards
 export const isAppError = (error: unknown): error is AppError => {
  return (error as AppError)?.code !== undefined;
 }
 
 export const getErrorCategory = (code: string): ErrorCategory => {
  if (code.startsWith('AUTH_')) return ErrorCategory.AUTHENTICATION;
  if (code.startsWith('DB_')) return ErrorCategory.DATABASE;
  if (code.startsWith('NET_')) return ErrorCategory.NETWORK;
  if (code.startsWith('VAL_')) return ErrorCategory.VALIDATION;
  return ErrorCategory.BUSINESS_LOGIC;
 }
