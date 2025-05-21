// src/app/test-errors/page.tsx
'use client'

import { auth, db } from '@/firebase/config'

import { ErrorHandlerService } from '@/shared/services/error-handler.service'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'

import { AlertCircle, Shield, Database, Wifi, Key, Bug, Clock } from 'lucide-react'
import { useState } from 'react'

interface ErrorCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => Promise<void> | void
  isLoading?: boolean
}

const ErrorCard = ({ title, description, icon, onClick, isLoading }: ErrorCardProps) => (
  <Card className="p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start gap-4">
      <div className="p-2 rounded-lg bg-gray-100 shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <Button 
          onClick={onClick} 
          variant="outline" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Probando...' : 'Probar Error'}
        </Button>
      </div>
    </div>
  </Card>
)

export default function TestErrorsPage() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const handleErrorTest = async (key: string, errorFn: () => Promise<void> | void) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }))
    try {
      await errorFn()
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }))
    }
  }

  // 1. Error de Autenticación
  const testAuthError = async () => {
    try {
      await signInWithEmailAndPassword(auth, 'test@test.com', 'wrongpassword')
    } catch (error) {
      await ErrorHandlerService.handleError(error, {
        context: 'auth-test',
        action: 'login',
        timestamp: new Date().toISOString()
      })
    }
  }

  // 2. Error de Red
  const testNetworkError = async () => {
    try {
      await fetch('http://localhost:99999')
    } catch (error) {
      await ErrorHandlerService.handleError(error, {
        context: 'network-test',
        operation: 'fetch',
        timestamp: new Date().toISOString()
      })
    }
  }

// 3. Error de Base de Datos
const testDatabaseError = async () => {
    try {
      console.log('Intentando error de base de datos...');
      // Intentamos leer un documento que sabemos que no existe
      const docRef = doc(db, 'una-coleccion-que-no-existe', 'un-id-que-no-existe');
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('No se encontró el documento');
      }
    } catch (error) {
      console.log('Error capturado:', error); // Para ver el error en consola
      await ErrorHandlerService.handleError(error, {
        context: 'database-test',
        operation: 'read',
        timestamp: new Date().toISOString()
      });
    }
  };

  // 4. Error de Validación
  const testValidationError = () => {
    try {
      const email = 'correo-invalido'
      if (!email.includes('@')) {
        throw new Error('El formato del email no es válido')
      }
    } catch (error) {
      ErrorHandlerService.handleError(error, {
        context: 'validation-test',
        field: 'email',
        value: 'correo-invalido',
        timestamp: new Date().toISOString()
      })
    }
  }

// 5. Error de Permisos
const testPermissionError = async () => {
    try {
      console.log('Intentando error de permisos...');
      
      // Crear un error que simule el formato de Firebase
      const permissionError = {
        code: 'permission-denied',
        message: 'No tienes permisos para acceder a este recurso',
        name: 'FirebaseError'
      };
      
      throw permissionError;
      
    } catch (error) {
      console.log('Error capturado en permisos:', error);
      await ErrorHandlerService.handleError(error, {
        context: 'permission-test',
        resource: 'dueno_restaurante',
        action: 'write',
        timestamp: new Date().toISOString()
      });
    }
  };

// 6. Error General
const testGeneralError = () => {
    try {
      throw new Error('Se ha producido un error en la aplicación')
    } catch (error) {
      ErrorHandlerService.handleError(error, {
        context: 'general-test',
        type: 'error-general',
        timestamp: new Date().toISOString()
      })
    }
  }

  // 7. Error Asíncrono
  const testAsyncError = async () => {
    try {
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Error en operación asíncrona'))
        }, 1000)
      })
    } catch (error) {
      await ErrorHandlerService.handleError(error, {
        context: 'async-test',
        operation: 'timeout',
        timestamp: new Date().toISOString()
      })
    }
  }

  const errorCards = [
    {
      key: 'auth',
      title: 'Error de Autenticación',
      description: 'Simula un intento de inicio de sesión con credenciales inválidas.',
      icon: <Key className="w-6 h-6 text-blue-500" />,
      onClick: () => handleErrorTest('auth', testAuthError)
    },
    {
      key: 'network',
      title: 'Error de Red',
      description: 'Simula un fallo en la conexión de red.',
      icon: <Wifi className="w-6 h-6 text-red-500" />,
      onClick: () => handleErrorTest('network', testNetworkError)
    },
    {
        key: 'database',
        title: 'Error de Base de Datos',
        description: 'Intenta escribir en una colección inexistente en Firestore.',
        icon: <Database className="w-6 h-6 text-purple-500" />,
        onClick: () => handleErrorTest('database', testDatabaseError)
      },
    {
      key: 'validation',
      title: 'Error de Validación',
      description: 'Simula un error de validación con un email inválido.',
      icon: <AlertCircle className="w-6 h-6 text-yellow-500" />,
      onClick: () => handleErrorTest('validation', testValidationError)
    },
    {
        key: 'permission',
        title: 'Error de Permisos',
        description: 'Intenta escribir en una colección protegida del sistema.',
        icon: <Shield className="w-6 h-6 text-green-500" />,
        onClick: () => handleErrorTest('permission', testPermissionError)
      },
      {
        key: 'general',
        title: 'Error General',
        description: 'Genera un error al intentar usar un objeto nulo.',
        icon: <Bug className="w-6 h-6 text-orange-500" />,
        onClick: () => handleErrorTest('general', testGeneralError)
      },
    {
      key: 'async',
      title: 'Error Asíncrono',
      description: 'Simula un error en una operación asíncrona.',
      icon: <Clock className="w-6 h-6 text-indigo-500" />,
      onClick: () => handleErrorTest('async', testAsyncError)
    }
  ]

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Prueba de Errores</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {errorCards.map((card) => (
            <ErrorCard
              key={card.key}
              title={card.title}
              description={card.description}
              icon={card.icon}
              onClick={card.onClick}
              isLoading={loadingStates[card.key]}
            />
          ))}
        </div>

        <Card className="mt-8 p-6 bg-gray-50">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-blue-500 shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Información</h3>
              <p className="text-sm text-gray-600">
                Esta página permite probar diferentes tipos de errores y ver cómo son manejados por el sistema.
                Los errores se mostrarán como notificaciones toast y también puedes verificar los detalles en la consola del navegador.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}