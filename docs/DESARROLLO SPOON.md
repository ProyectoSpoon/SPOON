# DESARROLLO SPOON

## Descripción General del Proyecto

Spoon es una plataforma integral para la gestión de restaurantes que permite a los propietarios y administradores gestionar todos los aspectos de su negocio desde un único sistema centralizado. La plataforma ha sido desarrollada utilizando una arquitectura de microservicios, lo que permite la escalabilidad, mantenibilidad y despliegue independiente de cada componente.

El proyecto está diseñado para ofrecer una solución completa que abarca desde la gestión del menú, inventario, ventas, estadísticas, hasta la administración de clientes y fidelización, todo ello con una interfaz de usuario moderna e intuitiva.

## Arquitectura del Sistema

Spoon está construido siguiendo una arquitectura moderna de microservicios con las siguientes características:

- **Frontend**: Aplicación Next.js (React) con enfoque SSR (Server-Side Rendering) para optimización SEO
- **Backend**: Conjunto de microservicios especializados desarrollados en Node.js
- **Base de datos**: PostgreSQL para almacenamiento relacional de datos
- **Autenticación**: Sistema JWT para gestión de sesiones y permisos
- **Almacenamiento**: Sistema para gestión de archivos e imágenes
- **Comunicación**: API REST para la comunicación entre servicios

## Tecnologías Utilizadas

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

## Microservicios

El sistema Spoon está compuesto por varios microservicios especializados que trabajan en conjunto para proporcionar todas las funcionalidades necesarias:

### 1. Menu Service (`menu-service`)

Este microservicio gestiona toda la información relacionada con los menús, categorías, productos, precios y disponibilidad.

#### Funcionalidades:
- Creación y gestión de menús
- Organización de productos por categorías
- Gestión de precios (normales, con descuento, promociones)
- Control de disponibilidad de productos
- Gestión de atributos y modificadores (ingredientes extra, personalizaciones)
- Integración con imágenes de productos
- Exportación/importación de menús (Excel, CSV)

### 2. Inventario Service (`inventario-service`) 

Este microservicio se encarga de la gestión del inventario, ingredientes y control de stock.

#### Funcionalidades:
- Registro y seguimiento de ingredientes y materia prima
- Control de stock y alertas de nivel bajo
- Gestión de proveedores
- Registro de entradas y salidas de inventario
- Cálculo automático de costos de productos
- Gestión de mermas y desperdicios
- Reportes de movimientos y valorización

### 3. Ventas Service (`ventas-service`)

Este microservicio gestiona todo el proceso de ventas, pedidos, pagos y facturación.

#### Funcionalidades:
- Gestión completa de pedidos (en sitio, para llevar, entrega)
- Procesamiento de pagos (efectivo, tarjeta, métodos digitales)
- Emisión de facturas y comprobantes
- Gestión de descuentos y promociones
- Control de mesas y áreas del restaurante
- Seguimiento de pedidos en tiempo real
- Historial completo de ventas

### 4. Estadísticas Service (`estadisticas-service`)

Este microservicio recopila, procesa y presenta datos estadísticos sobre el rendimiento del negocio.

#### Funcionalidades:
- Dashboard con KPIs principales
- Reportes de ventas por períodos
- Análisis de productos más vendidos
- Estadísticas de clientes y preferencias
- Predicciones de demanda
- Reportes de rendimiento financiero
- Exportación de informes en múltiples formatos

### 5. BI Service (`bi-service`)

Servicio especializado en Business Intelligence y análisis avanzado de datos para la toma de decisiones.

#### Funcionalidades:
- ETL (Extracción, Transformación y Carga) de datos
- Construcción de Data Warehouse
- Algoritmos de machine learning para recomendaciones
- Detección de patrones y anomalías
- Visualización avanzada de datos
- Reportes ejecutivos de alto nivel

## Flujo de Experiencia de Usuario

### 1. Página de Inicio y Registro

La página de inicio es el primer punto de contacto con los propietarios de restaurantes potenciales y sirve como presentación del producto Spoon.

#### Contenido Principal:
- Header con logo y botones de acción (Iniciar Sesión/Registrarse)
- Hero section con título principal, subtítulo y call-to-action
- Formulario de registro rápido
- Sección de beneficios clave
- Sección "¿Cómo Funciona?"
- Testimonios de clientes
- Preguntas frecuentes
- Call-to-action final

### 2. Página de Login

La página de login proporciona acceso seguro a los usuarios registrados mientras ofrece una experiencia agradable y opciones de recuperación de acceso.

#### Características:
- Estructura de dos columnas (visual/marketing y formulario)
- Opciones de inicio de sesión con email/contraseña o Google
- Recuperación de contraseña
- Seguridad avanzada (protección contra ataques, verificación de dispositivos)

### 3. Configuración Inicial del Restaurante

Esta página permite a los propietarios personalizar todos los aspectos de su restaurante en la plataforma.

#### Secciones:
- Información básica (nombre, descripción, categoría, contacto)
- Ubicación (dirección, mapa interactivo, área de entrega)
- Horarios (apertura/cierre, excepciones, días festivos)
- Impuestos (configuración fiscal)
- Métodos de pago (efectivo, tarjetas, pagos digitales)
- Entrega (configuración de delivery, costos, tiempos)
- Configuración avanzada (notificaciones, integraciones)

## Funcionalidades del Dashboard

### 1. Dashboard Principal (Vista General)

La pantalla de inicio tras el acceso al sistema, que ofrece una visión general del estado del restaurante.

#### Elementos:
- Panel de KPIs (ventas del día, número de pedidos, ticket promedio, valoración)
- Gráfico principal de ventas
- Mapa de calor de pedidos
- Lista de pedidos activos
- Alertas y sugerencias inteligentes
- Calendario de eventos

### 2. Gestión de Menú

Sección dedicada a la administración completa del menú del restaurante.

#### Funcionalidades:
- Lista de menús configurados
- Editor de categorías
- Administrador de productos
- Editor detallado de producto
- Gestión de combos/promociones
- Importación/exportación de datos

### 3. Gestión de Pedidos

Centro de operaciones para recibir, procesar y gestionar todos los pedidos del restaurante.

#### Características:
- Panel de pedidos con estados (nuevos, en preparación, listos, en camino, entregados)
- Detalles completos de cada pedido
- Centro de notificaciones
- Vista optimizada para cocina
- Gestión de entregas y repartidores
- Historial y búsqueda avanzada

### 4. Análisis y Reportes

Centro de inteligencia de negocios para analizar el rendimiento del restaurante y tomar decisiones informadas.

#### Funcionalidades:
- Panel de control analítico
- Análisis detallado de ventas
- Rentabilidad y costos
- Análisis de clientes
- Informes de rendimiento operativo
- Gestión de inventario
- Generador de informes personalizados

### 5. Configuración de Tienda Online

Herramientas para gestionar la presencia online del restaurante y la experiencia del cliente.

#### Características:
- Editor visual de tienda online
- Gestión de promociones
- Configuración de experiencia de usuario
- SEO y marketing
- Gestión de contenido estático

### 6. Gestión de Cliente y Fidelización

Herramientas para administrar la base de clientes y programas de fidelización.

#### Funcionalidades:
- Directorio completo de clientes
- Segmentación avanzada
- Programa de fidelización configurable
- Campañas de marketing
- Gestión de reseñas y opiniones

## Estructura de Base de Datos

El sistema utiliza PostgreSQL como base de datos principal, con un esquema bien definido para cada área funcional:

### Esquema `auth`
- Tabla `dueno_restaurante`: Información del propietario y credenciales
- Tabla `sessions`: Gestión de sesiones activas

### Esquema `restaurant`
- Tabla `restaurantes`: Información general del restaurante
- Tabla `horarios`: Configuración de horarios de operación

### Esquema `menu`
- Tabla `menus`: Definición de menús disponibles
- Tabla `menu_categories`: Categorías dentro de cada menú
- Tabla `menu_items`: Productos individuales con precios y atributos

### Tablas de Inventario
- Tabla `ingredientes`: Catálogo de ingredientes
- Tabla `stock`: Niveles actuales de inventario
- Tabla `suppliers`: Información de proveedores
- Tabla `inventory_transactions`: Movimientos de entrada/salida
- Tabla `recipe_ingredients`: Relación entre productos y sus ingredientes

### Tablas de Ventas
- Tabla `orders`: Pedidos realizados
- Tabla `order_items`: Detalles de productos en pedidos
- Tabla `payments`: Registro de pagos
- Tabla `tables`: Mesas del restaurante
- Tabla `invoices`: Facturas emitidas
- Tabla `promotions`: Promociones y descuentos

## Componentes Compartidos

El proyecto utiliza una arquitectura de componentes compartidos para maximizar la reutilización de código:

### Componentes UI
- Alertas, diálogos, botones, formularios
- Tablas, tarjetas, modales
- Componentes de navegación
- Indicadores de progreso

### Componentes Animados
- Tarjetas con animaciones
- Textos animados
- Fondos con partículas
- Efectos de scroll y 3D

### Servicios Compartidos
- Gestión de errores
- Auditoría
- Gestión de horarios
- Validación

### Hooks Personalizados
- Gestión de tema
- Notificaciones
- Manejo de errores
- Animaciones

## Integraciones Externas

El sistema Spoon se integra con diversas plataformas y servicios externos:

### 1. Pasarelas de Pago
- Integración con procesadores de tarjetas
- Sistemas de pago electrónico
- Billeteras digitales

### 2. Servicios de Delivery
- APIs de servicios de entrega
- Seguimiento GPS de repartidores
- Optimización de rutas

### 3. Servicios en la Nube
- Almacenamiento de archivos e imágenes
- Análisis y procesamiento de datos
- Servicio de notificaciones

### 4. Contabilidad y Facturación
- Integración con software contable
- Generación de informes fiscales
- Facturación electrónica

## Estado Actual del Desarrollo

El proyecto Spoon se encuentra en desarrollo activo, con las siguientes fases:

### Fase 1 (Completada)
- Implementación de microservicios base
- Desarrollo de interfaz de usuario core
- Integración con PostgreSQL
- Implementación de autenticación JWT

### Fase 2 (En Progreso)
- Optimización de rendimiento
- Mejoras en UX/UI
- Ampliación de analíticas
- Mejoras en gestión de inventario

### Fase 3 (Planificada)
- Implementación de machine learning para recomendaciones
- Integración con más plataformas de delivery
- App móvil para clientes
- Expansión internacional con soporte multilenguaje

## Consideraciones de Seguridad

El sistema Spoon implementa diversas medidas de seguridad:

### Protección de Datos
- Contraseñas almacenadas con bcrypt
- Datos sensibles cifrados en la base de datos
- Conexiones seguras con TLS/SSL
- Rotación regular de secretos y claves

### Protección contra Ataques
- Protección contra SQL Injection mediante ORM
- Protección contra XSS con sanitización de inputs
- Rate limiting en endpoints sensibles
- Validación de datos en servidor y cliente
- Protección CSRF mediante tokens

### Conformidad y Privacidad
- Conformidad con GDPR para datos de usuarios europeos
- Política de retención de datos clara
- Cifrado de datos sensibles en tránsito y en reposo
- Auditoría de acciones críticas

## Conclusión

Spoon representa una solución integral para la gestión de restaurantes, combinando tecnologías modernas con una arquitectura escalable y segura. El sistema está diseñado para crecer junto con las necesidades del negocio, ofreciendo desde funcionalidades básicas hasta análisis avanzados que permiten tomar decisiones informadas.

La plataforma continúa evolucionando, con un enfoque en mejorar la experiencia del usuario, optimizar el rendimiento y añadir nuevas capacidades que respondan a las demandas cambiantes del sector de la restauración.
