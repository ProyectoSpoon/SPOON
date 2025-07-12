// src/shared/components/ErrorBoundary/with-error-handler.tsx
'use client'

import { ErrorHandlerService } from '@/shared/services/error-handler.service'
import { useEffect } from 'react'

export function withErrorHandler<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function WithErrorHandlerWrapper(props: P) {
    useEffect(() => {
      const handleGlobalError = async (event: ErrorEvent) => {
        event.preventDefault()
        await ErrorHandlerService.handleError(event.error)
      }

      const handleUnhandledRejection = async (event: PromiseRejectionEvent) => {
        event.preventDefault()
        await ErrorHandlerService.handleError(event.reason)
      }

      window.addEventListener('error', handleGlobalError)
      window.addEventListener('unhandledrejection', handleUnhandledRejection)

      return () => {
        window.removeEventListener('error', handleGlobalError)
        window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      }
    }, [])

    return <Component {...props} />
  }
}
