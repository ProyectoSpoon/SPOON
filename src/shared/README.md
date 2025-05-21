# Sistema de Componentes y Utilidades Compartidas

Sistema modular para manejo de errores, auditoría, componentes UI y utilidades compartidas.

## 📁 Estructura
shared/
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (Button, Input, Toast, etc)
│   │   ├── Alert/        # Alertas y notificaciones
│   │   ├── Dialog/       # Ventanas modales
│   │   ├── Toast/        # Sistema de notificaciones
│   │   └── ...          # Otros componentes UI
│   ├── cards/           # Componentes de tarjetas
│   ├── calendario/      # Componentes de calendario
│   └── Animated/        # Componentes con animaciones
├── services/            # Servicios compartidos
│   ├── error-handler.service.ts
│   └── audit.service.ts
├── hooks/               # Hooks personalizados
│   ├── Animations/      # Hooks de animación
│   └── horarios/        # Hooks de horarios
├── types/              # Tipos y definiciones
├── utils/              # Utilidades comunes
└── context/            # Contextos de React

## 🔧 Funcionalidades Principales

### Sistema de Errores
- Manejo centralizado de errores
- Circuit breaker y rate limiting
- Retry con backoff exponencial
- Notificaciones contextuales
- Categorización y severidad
- Logging detallado

### Sistema de Auditoría
- Registro eventos y cambios
- Exploración de colecciones
- Trazabilidad y búsqueda
- Paginación y filtros
- Severidad y metadatos

### Componentes UI Base

- Alert             # Notificaciones y mensajes
- Badge             # Etiquetas y estados
- Button           # Botones estilizados 
- Calendar         # Selector de fechas
- Dialog           # Ventanas modales
- Input            # Campos de entrada
- Select           # Selectores desplegables
- Toast            # Notificaciones emergentes
Componentes Animados
typescriptCopy- AnimatedCard      # Tarjetas con animación
- AnimatedSection   # Secciones animadas
- AnimatedText      # Texto animado
- ScrollReveal      # Animación al scroll
- ParticlesBackground # Fondos con partículas

💻 Ejemplos de Uso
Manejo de Errores
typescriptCopyimport { useErrorHandler } from '@/shared/hooks/useErrorHandler'
import { ErrorHandlerService } from '@/shared/services/error-handler.service'

// En componentes
const { handleError } = useErrorHandler()
try {
  await someOperation()
} catch (error) {
  handleError(error)
}

// En servicios
try {
  await operation()
} catch (error) {
  ErrorHandlerService.handleError(error)
}
Sistema de Auditoría
typescriptCopyimport { AuditService } from '@/shared/services/audit.service'

// Registro de eventos
await AuditService.logEvent(
  AuditEventType.COLLECTION_READ,
  'Lectura de productos',
  { collectionName: 'products' }
)

// Registro de errores
await AuditService.logSystemError(
  error,
  { context: 'products-service' }
)
Componentes UI
typescriptCopyimport { Toast } from '@/shared/components/ui/Toast'
import { Alert } from '@/shared/components/ui/Alert'
import { Dialog } from '@/shared/components/ui/Dialog'

// Toast
toast({
  title: 'Éxito',
  description: 'Operación completada',
  variant: 'default'
})

// Alert
<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Mensaje de error</AlertDescription>
</Alert>

// Dialog
<Dialog>
  <DialogTrigger>Abrir</DialogTrigger>
  <DialogContent>
    <DialogTitle>Título</DialogTitle>
    <DialogDescription>Contenido...</DialogDescription>
  </DialogContent>
</Dialog>
Hooks de Animación
typescriptCopyimport { useInViewAnimation } from '@/shared/hooks/Animations'

const { ref, controls } = useInViewAnimation({
  variant: 'fadeIn',
  threshold: 0.2
})
🛠️ Configuración

Importar componentes necesarios

typescriptCopyimport { Toaster } from '@/shared/components/ui/Toast'

Configurar error handler

typescriptCopyErrorHandlerService.setToastFunction(toast)

Configurar tema y estilos

typescriptCopyimport '@/shared/styles/globals.css'
🧪 Testing
Cada componente incluye:

Pruebas unitarias
Pruebas de integración
Pruebas de accesibilidad

📚 Stack Tecnológico

React + Next.js
TypeScript
Firebase
Radix UI
Tailwind CSS
Framer Motion

📖 Documentación Adicional

Radix UI
Tailwind CSS
Firebase