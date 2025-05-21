// src/shared/components/ui/ErrorBoundary/error-boundary.tsx
import React from 'react'
import { Alert, AlertDescription } from '@/shared/components/ui/Alert'
import { Button } from '@/shared/components/ui/Button'
import { useError } from '@/shared/Hooks/useerror'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error): void {
    const { handleError } = useError()
    handleError(error)
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertDescription>
              Ha ocurrido un error inesperado
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Recargar página
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
