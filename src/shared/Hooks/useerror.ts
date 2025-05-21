// src/shared/hooks/useError.ts
import { useCallback } from 'react'
import { ErrorHandlerService } from '../services/error-handler.service'

export const useError = () => {
  const handleError = useCallback(async (
    error: unknown, 
    context?: Record<string, unknown>
  ) => {
    await ErrorHandlerService.handleError(error, context)
  }, [])

  return { handleError }
}
