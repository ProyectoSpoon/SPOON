# Documentación Completa de Spoon

## Descripción General

Spoon es una plataforma integral para la gestión de restaurantes que permite a los propietarios y administradores gestionar todos los aspectos de su negocio desde un único sistema centralizado. La plataforma ha sido desarrollada utilizando una arquitectura de microservicios, lo que permite la escalabilidad, mantenibilidad y despliegue independiente de cada componente.

## Arquitectura

Spoon está construido siguiendo una arquitectura moderna de microservicios con las siguientes características:

- **Frontend**: Aplicación Next.js (React) con enfoque SSR (Server-Side Rendering) para optimización SEO
- **Backend**: Conjunto de microservicios especializados desarrollados en Node.js
- **Base de datos**: PostgreSQL para almacenamiento relacional de datos
- **Autenticación**: Sistema JWT para gestión de sesiones y permisos
- **Almacenamiento**: Sistema para gestión de archivos e imágenes
- **Comunicación**: API REST para la comunicación entre servicios

## Microservicios

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

#### Endpoints principales:
- `/menus` - Operaciones CRUD para menús
- `/categories` - Gestión de categorías de productos
- `/items` - Gestión de elementos/productos del menú
- `/modifiers` - Gestión de modificadores para personalización



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

#### Endpoints principales:
- `/ingredients` - Gestión de ingredientes
- `/stock` - Control de existencias actuales
- `/suppliers` - Información de proveedores
- `/transactions` - Registro de movimientos

#### Tablas en base de datos:
- `ingredients` - Catálogo de ingredientes
- `stock` - Niveles actuales de inventario
- `suppliers` - Información de proveedores
- `inventory_transactions` - Movimientos de entrada/salida
- `recipe_ingredients` - Relación entre productos del menú e ingredientes

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

#### Endpoints principales:
- `/orders` - Gestión de pedidos
- `/payments` - Procesamiento de pagos
- `/tables` - Gestión de mesas y áreas
- `/invoices` - Emisión de facturas
- `/promotions` - Gestión de descuentos y promociones

#### Tablas en base de datos:
- `orders` - Pedidos
- `order_items` - Detalles de productos en pedidos
- `payments` - Registro de pagos
- `tables` - Mesas del restaurante
- `invoices` - Facturas emitidas
- `promotions` - Promociones y descuentos

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

#### Endpoints principales:
- `/dashboard` - Información para el panel principal
- `/reports` - Generación de informes personalizados
- `/analytics` - Análisis avanzados
- `/forecasts` - Predicciones de demanda y ventas

#### Tablas en base de datos:
- `metrics` - Métricas calculadas y almacenadas
- `report_templates` - Plantillas para informes
- `analytics_data` - Datos procesados para análisis
- Vista materializada: `sales_summary` - Resumen de ventas para consultas rápidas

### 5. BI Service (`bi-service`)

Servicio especializado en Business Intelligence y análisis avanzado de datos para la toma de decisiones.

#### Funcionalidades:
- ETL (Extracción, Transformación y Carga) de datos
- Construcción de Data Warehouse
- Algoritmos de machine learning para recomendaciones
- Detección de patrones y anomalías
- Visualización avanzada de datos
- Reportes ejecutivos de alto nivel

#### Endpoints principales:
- `/etl` - Control de procesos ETL
- `/warehouse` - Acceso al Data Warehouse
- `/ml-models` - Gestión de modelos de machine learning
- `/executive-reports` - Informes ejecutivos

#### Tablas en base de datos:
- `etl_jobs` - Control de procesos ETL
- `data_warehouse.*` - Esquema separado para el Data Warehouse
- `ml_models` - Configuración y resultados de modelos

### 6. Autenticación y Usuarios

Este módulo gestiona la autenticación, autorización y gestión de usuarios en el sistema.

#### Funcionalidades:
- Registro e inicio de sesión de usuarios
- Autenticación basada en JWT
- Gestión de roles y permisos
- Autenticación de dos factores (2FA)
- Recuperación de contraseñas
- Auditoría de acciones de usuarios
- Gestión de perfiles y configuraciones

#### Endpoints principales:
- `/auth` - Autenticación y gestión de sesiones
- `/users` - Gestión de usuarios
- `/roles` - Configuración de roles
- `/permissions` - Asignación de permisos específicos

#### Tablas en base de datos:
- `dueno_restaurante` - Usuario principal (dueño del restaurante)
- `users` - Usuarios del sistema
- `roles` - Roles disponibles
- `permissions` - Permisos individuales
- `sessions` - Sesiones activas

## Frontend (Next.js)

La interfaz de usuario está desarrollada con Next.js y ofrece diferentes módulos para interactuar con los microservicios:

### 1. Módulo de Login y Gestión de Usuarios

- Pantalla de inicio de sesión
- Registro de nuevos usuarios
- Recuperación de contraseñas
- Verificación de email
- Configuración de perfil
- Gestión de equipo y empleados

### 2. Módulo de Dashboard

- Vista general del negocio
- KPIs principales
- Gráficos y visualizaciones
- Notificaciones y alertas
- Acceso rápido a funciones frecuentes

### 3. Módulo de Gestión de Menú

- Editor visual de menús
- Organización de categorías
- Gestión de productos
- Configuración de precios
- Subida de imágenes
- Configuración de modificadores

### 4. Módulo de Pedidos y Ventas

- Pantalla de toma de pedidos
- Gestión de mesas
- Procesamiento de pagos
- Emisión de facturas
- Seguimiento de pedidos

### 5. Módulo de Informes y Estadísticas

- Reportes personalizables
- Exportación de datos
- Visualización de estadísticas
- Análisis de tendencias

### 6. Módulo de Configuración

- Configuración general del restaurante
- Gestión de horarios
- Configuración fiscal
- Personalización de interfaz

## Integraciones Externas

El sistema Spoon se integra con diversas plataformas y servicios externos para ampliar su funcionalidad:

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

## Flujos de Trabajo Principales

### 1. Configuración Inicial de Restaurante
1. Registro del propietario
2. Configuración básica del restaurante (nombre, dirección, teléfono)
3. Configuración de horarios de operación
4. Creación del menú inicial
5. Configuración de impuestos y métodos de pago
6. Configuración de áreas y mesas

### 2. Gestión de Menú
1. Creación de categorías
2. Definición de productos y precios
3. Configuración de modificadores
4. Carga de imágenes
5. Gestión de disponibilidad
6. Publicación del menú

### 3. Proceso de Venta
1. Creación de nuevo pedido
2. Selección de productos
3. Aplicación de modificadores y personalizaciones
4. Cálculo de total con impuestos
5. Procesamiento de pago
6. Emisión de factura o comprobante
7. Preparación y entrega

### 4. Gestión de Inventario
1. Registro de ingredientes y productos
2. Definición de proveedores
3. Registro de entradas (compras)
4. Vinculación con recetas
5. Control automático de stock
6. Alertas de nivel bajo
7. Registro de mermas

### 5. Análisis de Negocio
1. Recopilación de datos de operación
2. Procesamiento y análisis
3. Generación de reportes
4. Visualización en dashboard
5. Identificación de oportunidades
6. Toma de decisiones basada en datos

## Requisitos Técnicos

### Hardware Recomendado
- Servidor: 4 cores CPU, 8GB RAM mínimo
- Almacenamiento: 100GB SSD mínimo
- Base de datos: Servidor PostgreSQL dedicado para alto rendimiento

### Software
- Sistema Operativo: Linux (Ubuntu/Debian) recomendado
- Node.js: v16.x o superior
- PostgreSQL: v13.x o superior
- Redis: Para caché y gestión de colas
- Nginx: Como proxy inverso
- Docker: Para contenerización de servicios

### Escalabilidad
- Arquitectura diseñada para escalar horizontalmente
- Microservicios independientes para escalado selectivo
- Base de datos con capacidad de replicación
- Cachés distribuidas para alta disponibilidad

## Plan de Desarrollo Futuro

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

## Glosario

- **KPI**: Key Performance Indicator - Indicador clave de rendimiento
- **SSR**: Server-Side Rendering - Renderización en el lado del servidor
- **JWT**: JSON Web Token - Estándar para la creación de tokens de acceso
- **ETL**: Extract, Transform, Load - Proceso de extracción, transformación y carga de datos
- **2FA**: Two-Factor Authentication - Autenticación de dos factores
- **API**: Application Programming Interface - Interfaz de programación de aplicaciones
- **CRUD**: Create, Read, Update, Delete - Operaciones básicas de persistencia de datos
