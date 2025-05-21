# Especificaciones Técnicas de Spoon

Este documento complementa la documentación general de Spoon con detalles técnicos más específicos sobre la implementación, arquitectura de datos y flujos de información.

## Stack Tecnológico Detallado

### Frontend
- **Framework principal**: Next.js 14
- **UI Framework**: React 18 con Hooks
- **Gestión de estado**: Context API + SWR para fetching
- **Estilos**: TailwindCSS + Componentes personalizados
- **Formularios**: React Hook Form + Zod para validación
- **Gráficos**: Recharts para visualizaciones
- **Animaciones**: Framer Motion
- **Internacionalización**: next-i18next
- **Fecha y hora**: date-fns
- **PWA**: Soporte mediante next-pwa

### Backend
- **Runtime**: Node.js 18+
- **Frameworks**: Express.js para APIs, NestJS para microservicios complejos
- **Validación**: Joi y class-validator
- **ORM**: Prisma para PostgreSQL
- **Autenticación**: JWT (jsonwebtoken)
- **Encriptación**: bcrypt para contraseñas, crypto para cifrado
- **Registro (logging)**: Winston configurado con rotación de archivos
- **Monitoreo**: Prometheus + Grafana

### DevOps
- **CI/CD**: GitHub Actions
- **Contenedores**: Docker con Docker Compose
- **Orquestación**: Kubernetes para producción
- **Monitoreo**: Datadog, Sentry para errores
- **Almacenamiento**: Amazon S3 compatible
- **Proxy/Gateway**: Nginx

### Base de Datos
- **Principal**: PostgreSQL 14+
- **Caché**: Redis 6+
- **Búsqueda**: Elasticsearch (opcional)

## Esquemas de Base de Datos

### Esquema `auth`

#### Tabla: `dueno_restaurante`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| uid | VARCHAR(50) | Identificador único del usuario |
| email | VARCHAR(100) | Email del usuario (único) |
| password_hash | VARCHAR(100) | Hash de la contraseña |
| nombre | VARCHAR(100) | Nombre del usuario |
| apellido | VARCHAR(100) | Apellido del usuario |
| telefono | VARCHAR(20) | Número de teléfono |
| fecha_registro | TIMESTAMP | Fecha de registro |
| ultimo_acceso | TIMESTAMP | Última fecha de acceso |
| restaurante_id | VARCHAR(50) | ID del restaurante asociado |
| is_2fa_enabled | BOOLEAN | Si tiene habilitada autenticación 2FA |
| failed_attempts | INTEGER | Número de intentos fallidos consecutivos |
| last_failed_attempt | TIMESTAMP | Timestamp del último intento fallido |
| requires_additional_info | BOOLEAN | Si requiere completar información adicional |
| email_verified | BOOLEAN | Si el email ha sido verificado |
| role | VARCHAR(20) | Rol del usuario (OWNER, ADMIN, etc.) |
| permissions | JSONB | Permisos específicos |
| activo | BOOLEAN | Si la cuenta está activa |
| metodos_auth | JSONB | Métodos de autenticación habilitados |
| sesiones_total | INTEGER | Contador total de sesiones |

#### Tabla: `sessions`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| uid | VARCHAR(50) | Identificador único del usuario (FK) |
| email | VARCHAR(100) | Email del usuario |
| last_login | TIMESTAMP | Timestamp del último login |
| last_logout | TIMESTAMP | Timestamp del último logout |
| last_updated | TIMESTAMP | Última actualización de la sesión |
| token | VARCHAR(500) | Token JWT de la sesión |
| device_info | JSONB | Información del dispositivo |

### Esquema `restaurant`

#### Tabla: `restaurantes`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | VARCHAR(50) | Identificador único del restaurante |
| nombre | VARCHAR(100) | Nombre del restaurante |
| direccion | VARCHAR(200) | Dirección física |
| telefono | VARCHAR(20) | Teléfono de contacto |
| email | VARCHAR(100) | Email de contacto |
| categoria | VARCHAR(50) | Categoría (Italiana, Mexicana, etc.) |
| horario_id | INTEGER | ID del horario asociado |
| dueno_id | VARCHAR(50) | ID del propietario (FK) |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de actualización |
| logotipo_url | VARCHAR(255) | URL del logotipo |
| configuracion | JSONB | Configuración específica del restaurante |
| ubicacion_geo | POINT | Coordenadas geográficas |
| estado | VARCHAR(20) | Estado (Activo, Suspendido, etc.) |

#### Tabla: `horarios`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | INTEGER | ID del horario |
| restaurante_id | VARCHAR(50) | ID del restaurante asociado |
| dia_semana | INTEGER | Día de la semana (0-6) |
| hora_apertura | TIME | Hora de apertura |
| hora_cierre | TIME | Hora de cierre |
| es_cerrado | BOOLEAN | Si está cerrado ese día |
| es_especial | BOOLEAN | Si es un horario especial |
| fecha_especial | DATE | Fecha si es un horario especial |
| nota | VARCHAR(200) | Nota adicional |

### Esquema `menu`

#### Tabla: `menus`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | VARCHAR(50) | ID único del menú |
| restaurante_id | VARCHAR(50) | ID del restaurante (FK) |
| nombre | VARCHAR(100) | Nombre del menú |
| descripcion | TEXT | Descripción del menú |
| activo | BOOLEAN | Si está activo |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de actualización |
| orden | INTEGER | Orden de visualización |
| disponibilidad | JSONB | Configuración de disponibilidad |

#### Tabla: `menu_categories`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | VARCHAR(50) | ID único de la categoría |
| menu_id | VARCHAR(50) | ID del menú al que pertenece (FK) |
| nombre | VARCHAR(100) | Nombre de la categoría |
| descripcion | TEXT | Descripción de la categoría |
| imagen_url | VARCHAR(255) | URL de la imagen |
| activo | BOOLEAN | Si está activa |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de actualización |
| orden | INTEGER | Orden de visualización |

#### Tabla: `menu_items`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | VARCHAR(50) | ID único del ítem |
| categoria_id | VARCHAR(50) | ID de la categoría (FK) |
| nombre | VARCHAR(100) | Nombre del ítem |
| descripcion | TEXT | Descripción del ítem |
| precio | DECIMAL(10,2) | Precio normal |
| precio_descuento | DECIMAL(10,2) | Precio con descuento |
| imagen_url | VARCHAR(255) | URL de la imagen |
| tiempo_preparacion | INTEGER | Tiempo estimado de preparación (min) |
| calorias | INTEGER | Información nutricional - calorías |
| alergenos | JSONB | Lista de alérgenos |
| opciones_personalizacion | JSONB | Opciones de personalización |
| activo | BOOLEAN | Si está activo |
| destacado | BOOLEAN | Si es un ítem destacado |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de actualización |
| disponibilidad | JSONB | Configuración de disponibilidad |

## Diagrama de Microservicios

```
                        ┌──────────────┐
                        │     API      │
                        │   Gateway    │
                        └──────┬───────┘
                               │
       ┌───────────┬───────────┼───────────┬───────────┐
       │           │           │           │           │
┌──────▼─────┐┌────▼─────┐┌────▼─────┐┌────▼─────┐┌────▼─────┐
│   Menu     ││Inventario││  Ventas  ││Estadíst. ││   BI     │
│  Service   ││ Service  ││ Service  ││ Service  ││ Service  │
└──────┬─────┘└────┬─────┘└────┬─────┘└────┬─────┘└────┬─────┘
       │           │           │           │           │
       └───────────┴───────────┼───────────┴───────────┘
                               │
                        ┌──────▼───────┐
                        │              │
                        │ PostgreSQL   │
                        │              │
                        └──────────────┘
```

## APIs y Endpoints Detallados

### API de Autenticación

#### POST /auth/login
- **Descripción**: Iniciar sesión con email y contraseña
- **Payload**:
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
  }
  ```
- **Respuesta exitosa**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "uid": "user_12345",
      "email": "usuario@ejemplo.com",
      "nombre": "Juan",
      "apellido": "Pérez",
      "role": "OWNER",
      "permissions": ["MENU_READ", "MENU_WRITE", "...]
    }
  }
  ```

#### POST /auth/register
- **Descripción**: Registrar nuevo usuario
- **Payload**:
  ```json
  {
    "email": "nuevo@ejemplo.com",
    "password": "contraseña123",
    "nombre": "Nuevo",
    "apellido": "Usuario",
    "telefono": "5551234567"
  }
  ```
- **Respuesta exitosa**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "uid": "user_67890",
      "email": "nuevo@ejemplo.com",
      "nombre": "Nuevo",
      "apellido": "Usuario"
    }
  }
  ```

#### POST /auth/reset-password
- **Descripción**: Solicitar restablecimiento de contraseña
- **Payload**:
  ```json
  {
    "email": "usuario@ejemplo.com"
  }
  ```
- **Respuesta exitosa**:
  ```json
  {
    "message": "Se ha enviado un correo para restablecer tu contraseña",
    "success": true
  }
  ```

### API de Menús

#### GET /api/menus
- **Descripción**: Obtener todos los menús del restaurante
- **Headers necesarios**: Authorization: Bearer {token}
- **Parámetros query**: 
  - active (boolean): Filtrar por activos/inactivos
  - sort (string): Ordenar por campo específico
- **Respuesta exitosa**:
  ```json
  {
    "menus": [
      {
        "id": "menu_12345",
        "nombre": "Menú Principal",
        "descripcion": "Nuestras especialidades",
        "activo": true,
        "created_at": "2025-01-15T10:30:00Z",
        "categorias": [...]
      },
      ...
    ]
  }
  ```

#### POST /api/menus
- **Descripción**: Crear un nuevo menú
- **Headers necesarios**: Authorization: Bearer {token}
- **Payload**:
  ```json
  {
    "nombre": "Menú de Verano",
    "descripcion": "Platillos frescos para el verano",
    "activo": true
  }
  ```
- **Respuesta exitosa**:
  ```json
  {
    "id": "menu_67890",
    "nombre": "Menú de Verano",
    "descripcion": "Platillos frescos para el verano",
    "activo": true,
    "created_at": "2025-04-06T12:30:00Z"
  }
  ```

### API de Ventas

#### POST /api/orders
- **Descripción**: Crear un nuevo pedido
- **Headers necesarios**: Authorization: Bearer {token}
- **Payload**:
  ```json
  {
    "mesa_id": "table_123",
    "cliente": {
      "nombre": "Cliente de Ejemplo",
      "telefono": "5551234567"
    },
    "items": [
      {
        "menu_item_id": "item_456",
        "cantidad": 2,
        "notas": "Sin cebolla",
        "modificadores": [
          {
            "modificador_id": "mod_789",
            "opcion_id": "opt_012"
          }
        ]
      }
    ],
    "tipo_pedido": "EN_SITIO"
  }
  ```
- **Respuesta exitosa**:
  ```json
  {
    "id": "order_34567",
    "mesa_id": "table_123",
    "cliente": { ... },
    "items": [ ... ],
    "subtotal": 250.00,
    "impuestos": 40.00,
    "total": 290.00,
    "estado": "NUEVO",
    "created_at": "2025-04-06T18:45:00Z"
  }
  ```

## Flujos de Datos

### Flujo de Autenticación
1. Cliente envía credenciales (email/password)
2. Servicio de autenticación verifica credenciales contra base de datos
3. Si son válidas, genera token JWT con payload que incluye:
   - ID de usuario
   - Email
   - Rol
   - Permisos específicos
   - Tiempo de expiración
4. Devuelve token al cliente
5. Cliente almacena token y lo incluye en cabeceras Authorization
6. Middleware verifica validez del token en cada petición protegida

### Flujo de Creación de Pedido
1. Cliente envía datos del pedido
2. Servicio de Ventas:
   - Valida existencia y disponibilidad de productos
   - Consulta precios actualizados
   - Calcula subtotal, impuestos, descuentos
   - Genera registro del pedido
   - Actualiza estadísticas en tiempo real
3. Servicio de Inventario (asíncrono):
   - Recibe notificación del nuevo pedido
   - Actualiza niveles de stock
   - Genera alertas si nivel crítico
4. Dashboard recibe actualización en tiempo real
5. Cocina recibe notificación de nuevo pedido

## Consideraciones de Seguridad

### Protección de Datos
- Contraseñas almacenadas con bcrypt (10 rondas mínimo)
- Datos sensibles cifrados en la base de datos
- Conexiones seguras con TLS/SSL
- Rotación regular de secretos y claves

### Protección contra Ataques
- Protección contra SQL Injection mediante ORM y prepared statements
- Protección contra XSS con sanitización de inputs y CSP
- Rate limiting en endpoints sensibles
- Validación de datos en servidor y cliente
- Protección CSRF mediante tokens

### Conformidad y Privacidad
- Conformidad con GDPR para datos de usuarios europeos
- Política de retención de datos clara
- Cifrado de datos sensibles en tránsito y en reposo
- Auditoría de acciones críticas

## Estrategia de Testing

### Tests Unitarios
- Jest para lógica de negocio
- Cobertura mínima: 70%
- Ejecutados en cada commit

### Tests de Integración
- Supertest para APIs
- Pruebas con base de datos en memoria
- Ejecutados en PR

### Tests E2E
- Cypress para flujos completos
- Puppeteer para reportes y exports
- Ejecutados nightly

### Tests de Carga
- k6.io para simulación de carga
- Escenarios: normal, pico, sostenido
- Ejecutados semanalmente

## Infraestructura Cloud

### Ambiente de Desarrollo
- Heroku para despliegue rápido
- Base de datos compartida
- CI/CD con GitHub Actions

### Ambiente de Producción
- Kubernetes en AWS/Azure/GCP
- Base de datos dedicada con alta disponibilidad
- CDN para assets estáticos
- Caché distribuida con Redis
- Backup automático cada 6 horas

## Estrategia de Despliegue

### Despliegue Continuo
- Ramas feature -> desarrollo -> staging -> producción
- Tests automatizados en cada etapa
- Monitoreo post-despliegue
- Rollback automatizado ante métricas críticas

### Canary Releases
- Despliegue gradual a subconjunto de usuarios
- Monitoreo de métricas de error y performance
- Promoción automática ante ausencia de errores

## Monitoreo y Observabilidad

### Métricas Clave
- Latencia de requests (p50, p95, p99)
- Tasa de error por servicio
- Uso de recursos (CPU, memoria, I/O)
- Tiempo de respuesta de base de datos
- Concurrencia de usuarios

### Alertas
- Configuración basada en umbrales y anomalías
- Notificaciones a Slack, email, SMS según gravedad
- Runbooks para cada tipo de alerta

### Logs
- Formato estructurado (JSON)
- Centralización en Elasticsearch
- Retención según criticidad (30-365 días)
- Búsqueda y análisis con Kibana

### APM
- Trazado distribuido con OpenTelemetry
- Análisis de rendimiento de código
- Detección de cuellos de botella

## Roadmap Técnico Detallado

### Q2 2025
- Migración completa de autenticación a PostgreSQL
- Implementación de optimizaciones de consultas
- Rediseño de arquitectura de caché

### Q3 2025
- Implementación de GraphQL para APIs públicas
- Migración a Kubernetes en producción
- Implementación de análisis predictivo en BI

### Q4 2025
- Soporte para múltiples tenants
- Arquitectura de microfront-ends
- API pública para integradores

### Q1 2026
- Implementación de arquitectura CQRS
- Mejoras en sistema de recomendaciones
- Soporte para replicación global
