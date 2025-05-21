# Documentación de Componentes Compartidos (shared)

Este documento proporciona un inventario completo de todos los recursos disponibles en la carpeta `shared` del proyecto Spoon Restaurant. La carpeta `shared` contiene componentes, servicios, hooks, utilidades y otros recursos reutilizables que pueden ser utilizados en toda la aplicación.

## 📋 Índice

1. [Estructura General](#estructura-general)
2. [Componentes UI](#componentes-ui)
3. [Componentes de Calendario](#componentes-de-calendario)
4. [Componentes de Tarjetas](#componentes-de-tarjetas)
5. [Componentes Animados](#componentes-animados)
6. [Servicios](#servicios)
7. [Hooks Personalizados](#hooks-personalizados)
8. [Tipos y Definiciones](#tipos-y-definiciones)
9. [Utilidades](#utilidades)
10. [Contextos](#contextos)
11. [Estilos](#estilos)

## Estructura General

```
shared/
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (Button, Input, Toast, etc)
│   ├── cards/           # Componentes de tarjetas
│   ├── calendario/      # Componentes de calendario
├── services/            # Servicios compartidos
├── Hooks/               # Hooks personalizados
├── types/              # Tipos y definiciones
├── Utils/              # Utilidades comunes
├── Context/            # Contextos de React
└── Styles/             # Estilos globales y tema
```

## Componentes UI

La carpeta `shared/components/ui` contiene componentes de interfaz de usuario reutilizables:

| Componente | Descripción | Archivo Principal |
|------------|-------------|-------------------|
| Alert | Sistema de alertas para notificaciones y mensajes de error | `components/ui/Alert/alert.tsx` |
| Alert-Dialog | Diálogos de alerta para confirmaciones importantes | `components/ui/Alert-Dialog/Alert-dialog.tsx` |
| Badge | Etiquetas para mostrar estados y categorías | `components/ui/Badge/badge.tsx` |
| Button | Botones estilizados con múltiples variantes (primary, secondary, outline, destructive, ghost) y tamaños | `components/ui/Button/button.tsx` |
| CacheTimer | Componente para mostrar tiempo de caché | `components/ui/CacheTimer/cacheTimer.tsx` |
| Calendar | Selector de fechas | `components/ui/Calendar/calendar.tsx` |
| Card | Tarjetas para mostrar información | `components/ui/Card/card.tsx` |
| Checkbox | Casillas de verificación | `components/ui/Checkbox/checkbox.tsx` |
| Dialog | Ventanas modales | `components/ui/Dialog/dialog.tsx` |
| DropdownMenu | Menús desplegables | `components/ui/DropdownMenu/dropdown-menu.tsx` |
| ErrorBoundary | Captura y manejo de errores en componentes | `components/ui/ErrorBoundary/error-boundary.tsx` |
| IndicadorProgreso | Indicador visual de progreso | `components/ui/IndicadorProgreso/indicador-progreso.tsx` |
| Input | Campos de entrada de texto | `components/ui/Input/input.tsx` |
| Label | Etiquetas para campos de formulario | `components/ui/Label/label.tsx` |
| Logo | Componente de logo | `components/ui/Logo/logo.tsx` |
| Progress | Barras de progreso | `components/ui/Progress.tsx` |
| RadioGroup | Grupos de botones de opción | `components/ui/RadioGroup/radiogroup.tsx` |
| Select | Selectores desplegables | `components/ui/Select/index.tsx` |
| Switch | Interruptores de activación/desactivación | `components/ui/Switch/switch.tsx` |
| Table | Tablas de datos | `components/ui/Table/table.tsx` |
| Tabs | Pestañas para organizar contenido | `components/ui/Tabs/tabs.tsx` |
| Textarea | Áreas de texto | `components/ui/Textarea/index.tsx` |
| TimeInput | Selector de tiempo | `components/ui/TimeInput/timeInput.tsx` |
| Toast | Sistema de notificaciones emergentes | `components/ui/Toast/toast.tsx` |
| Tooltip | Información adicional al pasar el ratón | `components/ui/Tooltip/tooltip.tsx` |

## Componentes de Calendario

Componentes especializados para la gestión de fechas y calendarios:

| Componente | Descripción | Archivo Principal |
|------------|-------------|-------------------|
| CalendarioFestivos | Calendario para mostrar y gestionar días festivos | `components/calendario/calendario-festivos.tsx` |

## Componentes de Tarjetas

Componentes para mostrar información en formato de tarjeta:

| Componente | Descripción | Archivo Principal |
|------------|-------------|-------------------|
| MenuCard | Tarjeta para mostrar elementos del menú | `components/cards/menu-card/index.tsx` |

## Componentes Animados

Componentes con efectos de animación para mejorar la experiencia de usuario:

| Componente | Descripción | Archivo Principal |
|------------|-------------|-------------------|
| AnimatedCard | Tarjetas con animaciones | `components/ui/Animated/AnimatedCard.tsx` |
| AnimatedSection | Secciones con animaciones | `components/ui/Animated/AnimatedSection.tsx` |
| AnimatedText | Texto con animaciones | `components/ui/Animated/AnimatedText.tsx` |
| GeometricPattern | Patrones geométricos animados | `components/ui/Animated/GeometricPattern.tsx` |
| ParticlesBackground | Fondos con partículas animadas | `components/ui/Animated/ParticlesBackground.tsx` |
| ScrollReveal | Animaciones al hacer scroll | `components/ui/Animated/ScrollReveal.tsx` |
| Tilt3D | Efecto de inclinación 3D | `components/ui/Animated/Tilt3D.tsx` |
| AnimatedContainer | Contenedor con animaciones | `components/ui/AnimatedContainer/animated-container.tsx` |

## Servicios

Servicios compartidos para funcionalidades comunes:

| Servicio | Descripción | Archivo Principal |
|----------|-------------|-------------------|
| AuditService | Registro de eventos y cambios en el sistema | `services/audit.service.ts` |
| ErrorHandlerService | Manejo centralizado de errores | `services/error-handler.service.ts` |
| ServicioFestivos | Gestión de días festivos | `services/horarios/servicio-festivos.ts` |
| ServicioHorarios | Gestión de horarios | `services/horarios/servicio-horarios.ts` |
| ValidadorHorarios | Validación de horarios | `services/horarios/validador-horarios.ts` |

## Hooks Personalizados

Hooks de React para reutilizar lógica en componentes:

| Hook | Descripción | Archivo Principal |
|------|-------------|-------------------|
| useTheme | Hook para gestionar el tema de la aplicación | `Hooks/use-theme.ts` |
| useToast | Hook para mostrar notificaciones toast | `Hooks/use-toast.ts` |
| useError | Hook para manejar errores | `Hooks/useerror.ts` |
| useErrorHandler | Hook para manejar errores con más opciones | `Hooks/useErrorHandler.ts` |
| useInViewAnimation | Hook para animaciones basadas en la visibilidad | `Hooks/Animations/useInViewAnimation.ts` |
| useParallax | Hook para efectos de parallax | `Hooks/Animations/useParallax.ts` |
| useScrollAnimation | Hook para animaciones al hacer scroll | `Hooks/Animations/useScrollAnimation.ts` |
| useTiltEffect | Hook para efectos de inclinación | `Hooks/Animations/useTiltEffect.ts` |
| usarFestivos | Hook para gestionar días festivos | `Hooks/horarios/usar-festivos.ts` |
| usarGestorHorarios | Hook para gestionar horarios | `Hooks/horarios/usar-gestor-horarios.ts` |

## Tipos y Definiciones

Definiciones de tipos TypeScript para el proyecto:

| Categoría | Descripción | Archivos Principales |
|-----------|-------------|----------------------|
| Animation | Tipos para animaciones | `types/animation.types.ts` |
| Audit | Tipos para el sistema de auditoría | `types/audit.types.ts` |
| Error | Tipos para el manejo de errores | `types/error.types.ts`, `types/error-categories.types.ts` |
| Motion | Tipos para animaciones con Framer Motion | `types/motion.types.ts` |
| Particles | Tipos para componentes de partículas | `types/particles.d.ts` |
| Horarios | Tipos para gestión de horarios | `types/horarios/tipos-festivos.ts`, `types/horarios/tipos-horarios.ts`, `types/horarios/tipos-programacion.ts` |

## Utilidades

Funciones utilitarias para tareas comunes:

| Utilidad | Descripción | Archivo Principal |
|----------|-------------|-------------------|
| AnimationUtils | Utilidades para animaciones | `Utils/animation.utils.ts` |
| ErrorUtils | Utilidades para manejo de errores | `Utils/error.utils.ts` |
| Utils | Utilidades generales | `lib/utils.ts` |

## Contextos

Contextos de React para compartir estado entre componentes:

| Contexto | Descripción | Archivo Principal |
|----------|-------------|-------------------|
| ThemeContext | Contexto para el tema de la aplicación | `Context/theme-context.tsx` |

## Estilos

Estilos globales y tema de la aplicación:

| Archivo | Descripción |
|---------|-------------|
| globals.css | Estilos globales de la aplicación | 
| spoon-theme.ts | Definición del tema Spoon |

## 🧪 Sistema de Errores

El sistema de errores es una parte fundamental de la capa compartida y ofrece:

- Manejo centralizado de errores
- Circuit breaker y rate limiting
- Retry con backoff exponencial
- Notificaciones contextuales
- Categorización y severidad
- Logging detallado

**Ejemplo de uso:**

```typescript
import { useErrorHandler } from '@/shared/hooks/useErrorHandler'

// En componentes
const { handleError } = useErrorHandler()
try {
  await someOperation()
} catch (error) {
  handleError(error)
}
```

## 🔄 Sistema de Auditoría

El sistema de auditoría permite:

- Registro de eventos y cambios
- Exploración de colecciones
- Trazabilidad y búsqueda
- Paginación y filtros
- Severidad y metadatos

**Ejemplo de uso:**

```typescript
import { AuditService } from '@/shared/services/audit.service'

// Registro de eventos
await AuditService.logEvent(
  AuditEventType.COLLECTION_READ,
  'Lectura de productos',
  { collectionName: 'products' }
)
```

## 📚 Stack Tecnológico

Los componentes compartidos están construidos utilizando:

- React + Next.js
- TypeScript
- Radix UI
- Tailwind CSS
- Framer Motion
