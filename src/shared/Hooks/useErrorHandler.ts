// src/shared/hooks/useErrorHandler.ts
import { useCallback } from 'react'
import { ErrorHandlerService } from '@/shared/services/error-handler.service'

export const useErrorHandler = () => {
  const handleError = useCallback(async (error: unknown, context?: Record<string, unknown>) => {
    await ErrorHandlerService.handleError(error, context)
  }, [])

  return { handleError }
}
