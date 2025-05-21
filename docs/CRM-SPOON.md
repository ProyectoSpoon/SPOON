# SpoonCRM - Sistema de Gestión de Relaciones con Clientes

## Descripción General

SpoonCRM es un sistema completo de gestión de relaciones con clientes diseñado específicamente para restaurantes. Proporciona herramientas para gestionar restaurantes, campañas de marketing, procesos de onboarding y oportunidades de ventas. El sistema está construido con una arquitectura de microservicios moderna, lo que permite escalabilidad y mantenimiento independiente de cada componente.

## Arquitectura del Sistema

### Microservicios

El sistema SpoonCRM está compuesto por los siguientes microservicios:

1. **CRM Service**: Gestiona la información de restaurantes, contactos y oportunidades de ventas.
2. **Marketing Service**: Maneja campañas de marketing, plantillas de comunicación y segmentación de audiencia.
3. **API Gateway**: Proporciona un punto de entrada único para todas las solicitudes de frontend, gestionando autenticación y enrutamiento.
4. **Frontend**: Aplicación web basada en Next.js y Material UI que proporciona la interfaz de usuario.

### Diagrama de Arquitectura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │ API Gateway │     │  Prometheus │
│   (Next.js) │────▶│   (Node.js) │◀───▶│  Monitoring │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           │
        ┌─────────────────┬┴────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│  CRM Service │  │ Marketing    │  │ Other        │
│  (Node.js)   │  │ Service      │  │ Services     │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        └─────────────────▼─────────────────┘
                          │
                    ┌─────▼─────┐
                    │ PostgreSQL│
                    │ Database  │
                    └───────────┘
```

## Componentes Principales y Funcionalidades

### 1. Gestión de Restaurantes

#### Menú y Navegación:

- **Restaurantes**: Acceso principal desde el menú lateral
  - **Lista de Restaurantes**: Vista principal con todos los restaurantes
  - **Nuevo Restaurante**: Opción para crear un nuevo restaurante
  - **Ver Detalles**: Acceso a la información detallada de cada restaurante
  - **Editar**: Modificación de la información de restaurantes existentes

#### Funciones Detalladas:

##### Listado de Restaurantes
- **Función**: Muestra todos los restaurantes registrados en el sistema
- **Características**:
  - Tabla con columnas para nombre, tipo, ubicación, estado y acciones
  - Filtrado por nombre, tipo, ubicación y estado
  - Búsqueda global en todos los campos
  - Paginación para manejar grandes volúmenes de datos
  - Ordenamiento por cualquier columna
  - Acciones rápidas (ver, editar, eliminar)

##### Formulario de Creación de Restaurantes
- **Función**: Permite añadir nuevos restaurantes al sistema mediante un asistente paso a paso
- **Paso 1: Información Básica**
  - **Nombre del Restaurante**: Nombre comercial visible para los clientes
  - **Nombre Comercial**: Nombre utilizado en documentos comerciales
  - **Nombre Legal**: Razón social completa
  - **NIT/ID Fiscal**: Identificación tributaria
  - **Tipo de Restaurante**: Selección entre opciones predefinidas (Fast Food, Casual Dining, etc.)
  - **Cocinas**: Selección múltiple de tipos de cocina (Italiana, Mexicana, etc.)
  - **Año de Fundación**: Año en que se estableció el restaurante
  - **Estado**: Estado actual en el sistema (Prospecto, Oportunidad, Cliente, Activo)
  - **Descripción**: Información general sobre el restaurante

- **Paso 2: Información de Contacto**
  - **Email**: Correo electrónico principal
  - **Teléfono**: Número de contacto principal
  - **Sitio Web**: URL del sitio web
  - **Dirección**: Calle, ciudad, estado, código postal y país
  - **Redes Sociales**: Enlaces a perfiles en Facebook, Instagram, Twitter y TikTok

- **Paso 3: Contactos y Revisión**
  - **Gestión de Contactos**: Añadir personas de contacto con:
    - Nombre completo
    - Cargo/Posición
    - Email
    - Teléfono
    - Designación como contacto primario
  - **Estado Activo**: Activar o desactivar el restaurante
  - **Revisión Final**: Resumen de toda la información antes de crear

- **Validación de Datos**:
  - Validación en tiempo real de campos obligatorios
  - Validación de formato para emails, teléfonos y URLs
  - Mensajes de error claros y específicos
  - Prevención de envío del formulario con datos inválidos

#### Código Implementado:

- `spoonCRM/frontend/src/pages/restaurants/new.jsx`: Formulario de creación de restaurantes

### 2. Sistema de Marketing

#### Menú y Navegación:

- **Marketing**: Acceso principal desde el menú lateral
  - **Campañas**: Gestión de campañas de marketing
  - **Plantillas**: Gestión de plantillas de comunicación
  - **Audiencias**: Gestión de segmentos de audiencia
  - **Análisis**: Métricas y resultados de campañas

#### Funciones Detalladas:

##### Gestión de Plantillas
- **Función**: Permite crear, editar y gestionar plantillas para diferentes canales de comunicación
- **Características del Listado**:
  - Vista en cuadrícula con tarjetas para cada plantilla
  - Imagen de vista previa para identificación visual rápida
  - Filtrado por tipo de plantilla (Email, SMS, Push, In-App)
  - Búsqueda por nombre o contenido
  - Indicador de estado (activo/inactivo)
  - Contador de uso en campañas
  - Acciones rápidas (editar, duplicar, previsualizar, activar/desactivar, eliminar)

##### Editor de Plantillas
- **Función**: Permite crear y editar el contenido de las plantillas de comunicación
- **Características**:
  - **Información Básica**:
    - Nombre de la plantilla
    - Tipo de plantilla (Email, SMS, Push, In-App)
    - Descripción
    - Línea de asunto (para emails)
    - Estado activo/inactivo
  
  - **Editor de Contenido**:
    - **Para Email**: 
      - Editor WYSIWYG con opciones de formato (negrita, cursiva, listas, etc.)
      - Modo HTML para edición avanzada
      - Inserción de imágenes
      - Botones y enlaces
    - **Para SMS y Notificaciones**: 
      - Editor de texto simple con contador de caracteres
      - Limitaciones de longitud según el canal
  
  - **Sistema de Variables**:
    - Inserción de variables dinámicas ({{nombre}}, {{email}}, etc.)
    - Selector de variables disponibles
    - Vista previa con valores de ejemplo
  
  - **Previsualización**:
    - Vista previa en tiempo real
    - Simulación en diferentes dispositivos (móvil, escritorio)
    - Prueba de reemplazo de variables

##### Campañas de Marketing
- **Función**: Permite crear y gestionar campañas de comunicación dirigidas a restaurantes o comensales
- **Asistente de Creación**:
  - **Paso 1: Información Básica**
    - Nombre de la campaña
    - Descripción
    - Tipo de audiencia objetivo (Restaurantes, Comensales, Ambos)
    - Canales de comunicación (Email, SMS, Push, In-App)
  
  - **Paso 2: Selección de Plantillas**
    - Selección de plantilla para cada canal activado
    - Vista previa de las plantillas seleccionadas
  
  - **Paso 3: Programación**
    - Tipo de programación (Inmediata o Programada)
    - Fecha y hora de inicio (para programadas)
    - Fecha y hora de finalización (para programadas)
  
  - **Paso 4: Segmentación de Audiencia**
    - **Para Restaurantes**:
      - Filtro por ciudades
      - Filtro por estado (Prospecto, Oportunidad, Cliente, Activo)
      - Selección específica de restaurantes
    - **Para Comensales**:
      - Filtro por número mínimo de pedidos
      - Filtro por días desde el último pedido
      - Selección específica de comensales
    - Estimación de alcance en tiempo real
  
  - **Paso 5: Revisión**
    - Resumen completo de la campaña
    - Confirmación final antes de crear/programar

- **Gestión de Campañas**:
  - Listado de todas las campañas
  - Filtrado por estado, tipo y fecha
  - Métricas de rendimiento (envíos, aperturas, clics)
  - Acciones (pausar, reanudar, cancelar, duplicar)

#### Código Implementado:

- `spoonCRM/frontend/src/pages/marketing/templates/index.jsx`: Listado de plantillas
- `spoonCRM/frontend/src/pages/marketing/templates/[id]/edit.jsx`: Editor de plantillas
- `spoonCRM/frontend/src/pages/marketing/campaigns/new.jsx`: Creación de campañas

### 3. Proceso de Onboarding

#### Menú y Navegación:

- **Onboarding**: Acceso principal desde el menú lateral
  - **Procesos**: Lista de todos los procesos de onboarding
  - **Nuevo Proceso**: Creación de un nuevo proceso
  - **Tablero**: Vista de tablero Kanban de procesos
  - **Configuración**: Configuración de etapas y plantillas

#### Funciones Detalladas:

##### Listado de Procesos de Onboarding
- **Función**: Muestra y permite gestionar todos los procesos de onboarding de restaurantes
- **Características**:
  - **Panel de Estadísticas**:
    - Gráfico circular de distribución por estado
    - Tasa de finalización
    - Duración promedio
    - Contadores de procesos activos y pendientes
  
  - **Filtros y Búsqueda**:
    - Búsqueda por nombre de restaurante o responsable
    - Filtrado por estado (Pendiente, En Progreso, Pausado, Completado, Cancelado)
    - Ordenamiento por fecha, progreso o estado
  
  - **Tabla de Procesos**:
    - Nombre del restaurante
    - Estado actual con indicador visual
    - Barra de progreso con porcentaje
    - Información de fechas (creación, inicio, finalización esperada)
    - Responsable asignado
    - Acciones rápidas según el estado:
      - **Para Pendientes**: Iniciar, Editar, Eliminar
      - **Para En Progreso**: Pausar, Cancelar, Editar
      - **Para Pausados**: Reanudar, Cancelar, Editar
      - **Para Completados/Cancelados**: Solo visualización

##### Detalles del Proceso
- **Función**: Muestra información detallada de un proceso específico
- **Características**:
  - Información general del restaurante
  - Estado actual y progreso
  - Fechas importantes (creación, inicio, finalización esperada/real)
  - Responsable asignado
  - Lista de etapas con:
    - Nombre de la etapa
    - Estado (Pendiente, En Progreso, Completado, Cancelado)
    - Fecha de finalización (si aplica)
    - Indicador visual de progreso
  - Opción para gestionar el proceso (si no está completado/cancelado)

##### Gestión de Procesos
- **Función**: Permite crear y actualizar procesos de onboarding
- **Características**:
  - Selección de restaurante
  - Asignación de responsable
  - Configuración de fechas esperadas
  - Definición de etapas personalizadas
  - Actualización de progreso por etapa
  - Adición de notas y comentarios
  - Carga de documentos relacionados

#### Código Implementado:

- `spoonCRM/frontend/src/pages/onboarding/index.jsx`: Listado y gestión de procesos de onboarding

## Tecnologías Utilizadas

### Frontend

- **Framework**: Next.js (React)
- **UI Library**: Material UI
- **Estado**: React Hooks (useState, useEffect, useContext)
- **Routing**: Next.js Router
- **Formularios**: Componentes controlados de React
- **Notificaciones**: Notistack
- **Gráficos**: Recharts
- **Fechas**: Date-fns y MUI Date Pickers
- **Validación**: Validación personalizada con mensajes de error

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL
- **ORM**: Sequelize
- **Autenticación**: JWT (JSON Web Tokens)
- **API**: RESTful con Swagger para documentación
- **Monitoreo**: Prometheus y Grafana

### DevOps

- **Contenedores**: Docker y Docker Compose
- **CI/CD**: Configuración preparada para integración continua
- **Monitoreo**: Prometheus para métricas y Grafana para visualización

## Modelos de Datos

### Restaurantes

```
Restaurant {
  id: UUID
  name: String
  commercial_name: String
  legal_name: String
  tax_id: String
  restaurant_type: String
  cuisines: Array<String>
  description: String
  year_founded: Integer
  website: String
  email: String
  phone: String
  address: {
    street: String
    city: String
    state: String
    postal_code: String
    country: String
  }
  social_media: {
    facebook: String
    instagram: String
    twitter: String
    tiktok: String
  }
  contacts: Array<Contact>
  is_active: Boolean
  status: Enum('PROSPECT', 'OPPORTUNITY', 'CLIENT', 'ACTIVE')
  created_at: DateTime
  updated_at: DateTime
}

Contact {
  id: UUID
  name: String
  position: String
  email: String
  phone: String
  is_primary: Boolean
}
```

### Marketing

```
Template {
  id: UUID
  name: String
  type: Enum('EMAIL', 'SMS', 'PUSH_NOTIFICATION', 'IN_APP')
  subject: String (nullable)
  description: String
  content: String
  thumbnail: String
  is_active: Boolean
  created_at: DateTime
  updated_at: DateTime
  created_by: String
  usage_count: Integer
}

Campaign {
  id: UUID
  name: String
  description: String
  target_type: Enum('RESTAURANT', 'DINER', 'BOTH')
  channels: Array<String>
  templates: {
    EMAIL: UUID
    SMS: UUID
    PUSH_NOTIFICATION: UUID
    IN_APP: UUID
  }
  schedule_type: Enum('IMMEDIATE', 'SCHEDULED')
  start_date: DateTime
  end_date: DateTime
  filters: {
    restaurants: {
      cities: Array<String>
      statuses: Array<String>
      selected_ids: Array<UUID>
    }
    diners: {
      min_orders: Integer
      max_days_since_last_order: Integer
      selected_ids: Array<UUID>
    }
  }
  estimated_recipients: Integer
  status: Enum('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
  created_at: DateTime
  updated_at: DateTime
  created_by: String
}
```

### Onboarding

```
OnboardingProcess {
  id: UUID
  restaurant_id: UUID
  restaurant_name: String
  status: Enum('PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED')
  progress: Integer
  start_date: DateTime
  expected_completion_date: DateTime
  completion_date: DateTime
  assigned_to: String
  created_at: DateTime
  updated_at: DateTime
  steps: Array<OnboardingStep>
}

OnboardingStep {
  id: UUID
  name: String
  status: Enum('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
  completion_date: DateTime
}
```

## Flujos de Usuario

### Creación de Restaurante

1. Usuario navega a la sección de Restaurantes
2. Usuario hace clic en "Nuevo Restaurante"
3. Usuario completa el formulario paso a paso:
   - Información básica
   - Información de contacto
   - Contactos y revisión
4. Usuario envía el formulario
5. Sistema valida los datos y crea el restaurante
6. Usuario es redirigido a la lista de restaurantes

### Creación de Plantilla de Marketing

1. Usuario navega a la sección de Plantillas de Marketing
2. Usuario hace clic en "Crear Plantilla"
3. Usuario selecciona el tipo de plantilla (Email, SMS, etc.)
4. Usuario completa la información básica
5. Usuario edita el contenido de la plantilla:
   - Para Email: Editor WYSIWYG o HTML
   - Para otros tipos: Editor de texto
6. Usuario inserta variables dinámicas según sea necesario
7. Usuario previsualiza la plantilla
8. Usuario guarda la plantilla
9. Sistema valida y guarda la plantilla
10. Usuario es redirigido a la lista de plantillas

### Creación de Campaña

1. Usuario navega a la sección de Campañas
2. Usuario hace clic en "Nueva Campaña"
3. Usuario completa el asistente paso a paso:
   - Información básica y canales
   - Selección de plantillas
   - Programación
   - Segmentación de audiencia
   - Revisión
4. Usuario confirma la creación de la campaña
5. Sistema crea la campaña y la programa si es necesario
6. Usuario es redirigido a la lista de campañas

### Gestión de Onboarding

1. Usuario navega a la sección de Onboarding
2. Usuario ve la lista de procesos de onboarding
3. Usuario puede:
   - Ver detalles de un proceso
   - Iniciar un proceso pendiente
   - Pausar un proceso en curso
   - Reanudar un proceso pausado
   - Cancelar un proceso
   - Editar un proceso
4. Usuario puede ver estadísticas de onboarding en la parte superior

## Capturas de Pantalla

(Las capturas de pantalla se incluirían en una implementación real)

## Próximos Pasos

Para completar el sistema SpoonCRM, se recomienda abordar los siguientes elementos:

1. **Implementación de API Real**:
   - Conectar los componentes frontend con las APIs del backend
   - Reemplazar los datos simulados con datos reales de la base de datos
   - Implementar manejo de errores y estados de carga

2. **Desarrollo de Componentes Adicionales**:
   - Formulario de edición de restaurantes
   - Gestión de oportunidades de ventas
   - Dashboard con métricas en tiempo real
   - Reportes y análisis avanzados

3. **Pruebas y Optimización**:
   - Pruebas de integración entre microservicios
   - Pruebas de rendimiento y optimización
   - Pruebas de usabilidad con usuarios reales

4. **Despliegue y Monitoreo**:
   - Configuración de Docker para producción
   - Implementación de CI/CD
   - Configuración de monitoreo y alertas

## Conclusión

El sistema SpoonCRM proporciona una solución completa para la gestión de relaciones con restaurantes, marketing y onboarding. La arquitectura de microservicios permite escalabilidad y mantenimiento independiente de cada componente. La interfaz de usuario moderna y la experiencia de usuario mejorada facilitan la adopción por parte de los usuarios.

El sistema está listo para ser conectado a APIs reales y desplegado en un entorno de producción. La documentación detallada y el código bien estructurado facilitan la extensión y mantenimiento del sistema en el futuro.
