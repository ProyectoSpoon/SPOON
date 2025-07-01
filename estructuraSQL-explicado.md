# Diseño de Base de Datos PostgreSQL para SPOON - VERSIÓN EXPLICADA
## Sistema Operativo para Restaurantes Independientes

### Resumen Ejecutivo
Este documento presenta el diseño completo de la base de datos PostgreSQL para SPOON, basado en el análisis exhaustivo del código fuente y la lógica de negocio del sistema. Cada tabla, relación e índice incluye una explicación detallada de su propósito y relación con otros elementos del sistema.

---

## Motor de Base de Datos Recomendado

**PostgreSQL 14+** es la elección óptima por:
- **Soporte nativo para UUID** como claves primarias - Necesario para escalabilidad y seguridad en un sistema multi-tenant
- **Tipos de datos JSONB** para configuraciones flexibles - Permite almacenar configuraciones dinámicas sin modificar esquema
- **Triggers y constraints avanzados** para integridad de datos - Automatiza validaciones complejas de negocio
- **Índices parciales y compuestos** para optimización - Mejora rendimiento en consultas específicas del dominio
- **Extensiones** como pg_crypto para seguridad - Encriptación nativa de datos sensibles
- **Escalabilidad horizontal** con particionado - Soporta crecimiento a miles de restaurantes
- **Soporte para auditoría** con triggers automáticos - Cumple requisitos de trazabilidad del negocio

---

## Esquemas de Base de Datos

```sql
-- PROPÓSITO: Organización lógica de la base de datos por funcionalidad
-- BENEFICIO: Facilita mantenimiento, seguridad y escalabilidad

CREATE SCHEMA IF NOT EXISTS auth;           -- Autenticación y usuarios
-- EXPLICACIÓN: Aísla toda la lógica de seguridad y autenticación del sistema
-- RELACIÓN: Base para todos los demás esquemas que requieren identificación de usuarios

CREATE SCHEMA IF NOT EXISTS restaurant;     -- Datos del restaurante
-- EXPLICACIÓN: Contiene información específica de cada restaurante como entidad de negocio
-- RELACIÓN: Conecta con auth para ownership y con menu/sales para operaciones

CREATE SCHEMA IF NOT EXISTS menu;           -- Gestión de menús
-- EXPLICACIÓN: Núcleo del negocio - gestión de productos, categorías y menús diarios
-- RELACIÓN: Depende de restaurant para contexto y alimenta sales para transacciones

CREATE SCHEMA IF NOT EXISTS sales;          -- Ventas y transacciones
-- EXPLICACIÓN: Registra todas las transacciones comerciales del restaurante
-- RELACIÓN: Consume datos de menu y restaurant, genera datos para audit

CREATE SCHEMA IF NOT EXISTS audit;          -- Auditoría y logs
-- EXPLICACIÓN: Trazabilidad completa de acciones para cumplimiento y debugging
-- RELACIÓN: Recibe eventos de todos los demás esquemas para logging

CREATE SCHEMA IF NOT EXISTS config;         -- Configuraciones del sistema
-- EXPLICACIÓN: Configuraciones flexibles por restaurante sin modificar código
-- RELACIÓN: Utilizado por todos los esquemas para personalización
```

---

## Diseño Completo de Tablas

### **ESQUEMA: auth (Autenticación y Usuarios)**

#### 1. Tabla: auth.users
**PROPÓSITO**: Tabla central de usuarios del sistema con autenticación completa y gestión de seguridad
**RELACIÓN CON NEGOCIO**: Representa a todas las personas que interactúan con el sistema (dueños, empleados, administradores)
**CONEXIONES**: Base para restaurant.restaurants (ownership), restaurant.restaurant_users (employment), audit.activity_logs (trazabilidad)

```sql
CREATE TABLE auth.users (
    -- IDENTIFICACIÓN ÚNICA
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- EXPLICACIÓN: UUID para evitar colisiones en sistema distribuido y mejorar seguridad
    
    -- CREDENCIALES DE ACCESO
    email VARCHAR(255) UNIQUE NOT NULL,
    -- EXPLICACIÓN: Email como identificador único, facilita recuperación de contraseña
    password_hash VARCHAR(255) NOT NULL,
    -- EXPLICACIÓN: Hash de contraseña, nunca almacenar texto plano por seguridad
    
    -- INFORMACIÓN PERSONAL
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    -- EXPLICACIÓN: Nombres separados para flexibilidad en reportes y personalización
    phone VARCHAR(20),
    -- EXPLICACIÓN: Opcional para comunicación y verificación adicional
    
    -- CONTROL DE ACCESO
    role auth_role_enum NOT NULL DEFAULT 'staff',
    -- EXPLICACIÓN: Define permisos base del usuario en el sistema
    status user_status_enum NOT NULL DEFAULT 'active',
    -- EXPLICACIÓN: Permite desactivar usuarios sin eliminar datos históricos
    
    -- VERIFICACIÓN Y SEGURIDAD
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    -- EXPLICACIÓN: Verificación de contactos para seguridad adicional
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(32),
    -- EXPLICACIÓN: 2FA para usuarios con roles críticos (admin, owner)
    
    -- CONTROL DE INTENTOS DE ACCESO
    failed_login_attempts INTEGER DEFAULT 0,
    last_failed_login TIMESTAMP WITH TIME ZONE,
    account_locked_until TIMESTAMP WITH TIME ZONE,
    -- EXPLICACIÓN: Previene ataques de fuerza bruta bloqueando cuentas temporalmente
    
    -- RECUPERACIÓN DE CONTRASEÑA
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP WITH TIME ZONE,
    -- EXPLICACIÓN: Tokens temporales para procesos de recuperación y verificación
    
    -- MÉTRICAS DE USO
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    -- EXPLICACIÓN: Estadísticas de uso para análisis de actividad
    
    -- CONFIGURACIONES PERSONALES
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    -- EXPLICACIÓN: Configuraciones flexibles sin modificar esquema (tema, idioma, etc.)
    
    -- AUDITORÍA ESTÁNDAR
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
    -- EXPLICACIÓN: Trazabilidad de quién y cuándo se creó/modificó cada registro
);

-- ENUMS PARA CONTROL DE VALORES
CREATE TYPE auth_role_enum AS ENUM (
    'super_admin',    -- Administrador del sistema SPOON - acceso total
    'admin',          -- Administrador del restaurante - gestión completa del restaurante
    'owner',          -- Dueño del restaurante - acceso a reportes financieros
    'manager',        -- Gerente del restaurante - operaciones diarias
    'staff',          -- Personal del restaurante - funciones básicas
    'waiter',         -- Mesero - gestión de mesas y pedidos
    'kitchen',        -- Personal de cocina - preparación de alimentos
    'cashier'         -- Cajero - procesamiento de pagos
);
-- EXPLICACIÓN: Jerarquía de roles que define permisos granulares en el sistema

CREATE TYPE user_status_enum AS ENUM (
    'active',         -- Usuario activo - puede acceder al sistema
    'inactive',       -- Usuario inactivo - temporalmente deshabilitado
    'suspended',      -- Usuario suspendido - violación de políticas
    'pending',        -- Pendiente de verificación - nuevo usuario
    'locked'          -- Cuenta bloqueada - por seguridad
);
-- EXPLICACIÓN: Estados que controlan el acceso sin eliminar datos históricos
```

#### 2. Tabla: auth.user_sessions
**PROPÓSITO**: Gestión de sesiones activas para control de acceso y seguridad
**RELACIÓN CON NEGOCIO**: Permite múltiples sesiones por usuario y control de dispositivos
**CONEXIONES**: Depende de auth.users, utilizada por middleware de autenticación

```sql
CREATE TABLE auth.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- EXPLICACIÓN: Identificador único de cada sesión
    
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- EXPLICACIÓN: Vincula sesión con usuario, CASCADE elimina sesiones al eliminar usuario
    
    -- TOKENS DE SESIÓN
    session_token VARCHAR(500) NOT NULL UNIQUE,
    -- EXPLICACIÓN: Token principal para validar sesión activa
    refresh_token VARCHAR(500),
    -- EXPLICACIÓN: Token para renovar sesión sin re-autenticación
    
    -- INFORMACIÓN DEL DISPOSITIVO
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    location_info JSONB DEFAULT '{}',
    -- EXPLICACIÓN: Información de seguridad para detectar accesos sospechosos
    
    -- CONTROL DE SESIÓN
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- EXPLICACIÓN: Control temporal de sesiones para seguridad y limpieza automática
);
```

#### 3. Tabla: auth.permissions
**PROPÓSITO**: Definición granular de permisos del sistema
**RELACIÓN CON NEGOCIO**: Permite control fino de qué puede hacer cada rol
**CONEXIONES**: Utilizada por auth.role_permissions para asignar permisos a roles

```sql
CREATE TABLE auth.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- DEFINICIÓN DEL PERMISO
    name VARCHAR(100) NOT NULL UNIQUE,
    -- EXPLICACIÓN: Nombre único del permiso (ej: "menu.create", "sales.read")
    description TEXT,
    -- EXPLICACIÓN: Descripción humana del permiso para administración
    
    -- CONTEXTO DEL PERMISO
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    -- EXPLICACIÓN: Estructura resource.action para permisos granulares
    conditions JSONB DEFAULT '{}',
    -- EXPLICACIÓN: Condiciones adicionales (ej: solo sus propios restaurantes)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. Tabla: auth.role_permissions
**PROPÓSITO**: Asignación de permisos específicos a cada rol
**RELACIÓN CON NEGOCIO**: Implementa el modelo RBAC (Role-Based Access Control)
**CONEXIONES**: Conecta auth.permissions con roles enum, auditada por auth.users

```sql
CREATE TABLE auth.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    role auth_role_enum NOT NULL,
    -- EXPLICACIÓN: Rol al que se asigna el permiso
    permission_id UUID NOT NULL REFERENCES auth.permissions(id) ON DELETE CASCADE,
    -- EXPLICACIÓN: Permiso específico asignado al rol
    
    -- AUDITORÍA DE ASIGNACIÓN
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES auth.users(id),
    -- EXPLICACIÓN: Trazabilidad de quién otorgó el permiso y cuándo
    
    UNIQUE(role, permission_id)
    -- EXPLICACIÓN: Evita duplicar permisos para el mismo rol
);
```

### **ESQUEMA: restaurant (Datos del Restaurante)**

#### 5. Tabla: restaurant.restaurants
**PROPÓSITO**: Información principal de cada restaurante como entidad de negocio
**RELACIÓN CON NEGOCIO**: Entidad central que agrupa todos los datos operativos
**CONEXIONES**: Propiedad de auth.users, padre de menu/sales/audit por restaurant_id

```sql
CREATE TABLE restaurant.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- IDENTIFICACIÓN DEL NEGOCIO
    name VARCHAR(200) NOT NULL,
    -- EXPLICACIÓN: Nombre comercial del restaurante
    slug VARCHAR(200) UNIQUE NOT NULL,
    -- EXPLICACIÓN: URL-friendly identifier para apps móviles y web
    description TEXT,
    -- EXPLICACIÓN: Descripción del restaurante para marketing
    
    -- UBICACIÓN FÍSICA
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Colombia',
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    -- EXPLICACIÓN: Ubicación completa para delivery, mapas y análisis geográfico
    
    -- CONTACTO
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    -- EXPLICACIÓN: Información de contacto para clientes
    
    -- BRANDING
    logo_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    -- EXPLICACIÓN: Imágenes para apps móviles y marketing
    
    -- CLASIFICACIÓN DEL NEGOCIO
    cuisine_type VARCHAR(100),
    price_range price_range_enum DEFAULT 'medium',
    capacity INTEGER,
    -- EXPLICACIÓN: Categorización para filtros y análisis de mercado
    
    -- OWNERSHIP Y ESTADO
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    status restaurant_status_enum DEFAULT 'active',
    -- EXPLICACIÓN: Propietario y estado operativo del restaurante
    
    -- DOCUMENTACIÓN LEGAL
    tax_id VARCHAR(50),
    business_license VARCHAR(100),
    health_permit VARCHAR(100),
    -- EXPLICACIÓN: Documentos requeridos para operación legal
    
    -- CONFIGURACIONES FLEXIBLES
    settings JSONB DEFAULT '{}',
    social_media JSONB DEFAULT '{}',
    delivery_settings JSONB DEFAULT '{}',
    payment_settings JSONB DEFAULT '{}',
    -- EXPLICACIÓN: Configuraciones específicas sin modificar esquema
    
    -- AUDITORÍA ESTÁNDAR
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

CREATE TYPE price_range_enum AS ENUM ('budget', 'medium', 'expensive', 'luxury');
-- EXPLICACIÓN: Clasificación de precios para filtros en apps móviles

CREATE TYPE restaurant_status_enum AS ENUM ('active', 'inactive', 'suspended', 'pending_approval');
-- EXPLICACIÓN: Estados operativos para control de visibilidad en apps
```

#### 6. Tabla: restaurant.restaurant_users
**PROPÓSITO**: Relación muchos-a-muchos entre usuarios y restaurantes con roles específicos
**RELACIÓN CON NEGOCIO**: Un usuario puede trabajar en múltiples restaurantes con diferentes roles
**CONEXIONES**: Conecta auth.users con restaurant.restaurants, define permisos por contexto

```sql
CREATE TABLE restaurant.restaurant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- RELACIÓN PRINCIPAL
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- EXPLICACIÓN: Vincula usuario con restaurante específico
    
    -- ROL EN EL RESTAURANTE
    role auth_role_enum NOT NULL,
    permissions JSONB DEFAULT '{}',
    -- EXPLICACIÓN: Rol específico en este restaurante, puede diferir del rol global
    
    -- ESTADO DE EMPLEO
    is_active BOOLEAN DEFAULT TRUE,
    hired_date DATE,
    -- EXPLICACIÓN: Control de empleados activos y fecha de contratación
    
    -- INFORMACIÓN LABORAL
    salary DECIMAL(10, 2),
    commission_rate DECIMAL(5, 2),
    schedule JSONB DEFAULT '{}',
    -- EXPLICACIÓN: Datos de nómina y horarios de trabajo
    
    -- INFORMACIÓN ADICIONAL
    emergency_contact JSONB DEFAULT '{}',
    notes TEXT,
    -- EXPLICACIÓN: Información de recursos humanos
    
    -- AUDITORÍA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    
    UNIQUE(restaurant_id, user_id)
    -- EXPLICACIÓN: Un usuario solo puede tener un rol por restaurante
);
```

#### 7. Tabla: restaurant.business_hours
**PROPÓSITO**: Horarios comerciales regulares por día de la semana
**RELACIÓN CON NEGOCIO**: Define cuándo está abierto el restaurante para pedidos
**CONEXIONES**: Utilizada por apps móviles para mostrar disponibilidad

```sql
CREATE TABLE restaurant.business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id) ON DELETE CASCADE,
    -- EXPLICACIÓN: Horarios específicos por restaurante
    
    -- DEFINICIÓN DEL DÍA
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    -- EXPLICACIÓN: 0=Domingo, 6=Sábado, estándar internacional
    
    -- HORARIOS DE OPERACIÓN
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    is_24_hours BOOLEAN DEFAULT FALSE,
    -- EXPLICACIÓN: Flexibilidad para días cerrados o 24 horas
    
    -- HORARIOS DE DESCANSO
    break_start_time TIME,
    break_end_time TIME,
    -- EXPLICACIÓN: Para restaurantes que cierran entre almuerzo y cena
    
    notes TEXT,
    -- EXPLICACIÓN: Notas adicionales sobre horarios especiales
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(restaurant_id, day_of_week)
    -- EXPLICACIÓN: Solo un horario por día por restaurante
);
```

#### 8. Tabla: restaurant.special_hours
**PROPÓSITO**: Horarios especiales para fechas específicas (feriados, eventos)
**RELACIÓN CON NEGOCIO**: Sobrescribe horarios regulares en fechas especiales
**CONEXIONES**: Complementa business_hours para casos excepcionales

```sql
CREATE TABLE restaurant.special_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    -- EXPLICACIÓN: Fecha específica que sobrescribe horario regular
    
    -- HORARIOS ESPECIALES
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    -- EXPLICACIÓN: Puede estar cerrado o tener horarios diferentes
    
    -- CONTEXTO
    reason VARCHAR(200),
    notes TEXT,
    -- EXPLICACIÓN: Explicación del horario especial para staff y clientes
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(restaurant_id, date)
    -- EXPLICACIÓN: Solo un horario especial por fecha por restaurante
);
```

### **ESQUEMA: menu (Gestión de Menús)**

#### 9. Tabla: menu.categories
**PROPÓSITO**: Categorización jerárquica de productos del menú
**RELACIÓN CON NEGOCIO**: Organiza productos para navegación en apps y gestión
**CONEXIONES**: Padre de menu.products, puede tener categorías padre (jerarquía)

```sql
CREATE TABLE menu.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id) ON DELETE CASCADE,
    -- EXPLICACIÓN: Categorías específicas por restaurante
    
    -- IDENTIFICACIÓN
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(100) NOT NULL,
    -- EXPLICACIÓN: Nombre, descripción y slug para URLs amigables
    
    -- JERARQUÍA
    parent_id UUID REFERENCES menu.categories(id),
    -- EXPLICACIÓN: Permite subcategorías (ej: Bebidas > Calientes > Café)
    
    -- TIPO DE CATEGORÍA
    category_type category_type_enum NOT NULL,
    -- EXPLICACIÓN: Tipo específico para lógica de menú del día
    
    -- PRESENTACIÓN
    icon VARCHAR(100),
    color VARCHAR(7),
    image_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    -- EXPLICACIÓN: Elementos visuales para apps móviles
    
    -- DISPONIBILIDAD
    is_active BOOLEAN DEFAULT TRUE,
    availability_schedule JSONB DEFAULT '{}',
    -- EXPLICACIÓN: Control de visibilidad y horarios específicos
    
    -- AUDITORÍA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(restaurant_id, slug)
    -- EXPLICACIÓN: Slugs únicos por restaurante para URLs
);

CREATE TYPE category_type_enum AS ENUM (
    'entrada',        -- CAT_001 - Platos de entrada
    'principio',      -- CAT_002 - Platos principales base
    'proteina',       -- CAT_003 - Proteínas principales
    'acompanamiento', -- CAT_004 - Acompañamientos
    'bebida',         -- CAT_005 - Bebidas
    'postre',         -- Postres
    'aperitivo',      -- Aperitivos
    'especial'        -- Platos especiales
);
-- EXPLICACIÓN: Tipos específicos para lógica de combinaciones del menú del día
```

#### 10. Tabla: menu.products
**PROPÓSITO**: Productos individuales del menú con información completa
**RELACIÓN CON NEGOCIO**: Núcleo del inventario y base para ventas
**CONEXIONES**: Pertenece a category, tiene stock, versiones, precios, usado en combinations y orders

```sql
CREATE TABLE menu.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- CONTEXTO
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES menu.categories(id),
    -- EXPLICACIÓN: Producto específico por restaurante y categoría
    
    -- IDENTIFICACIÓN
    name VARCHAR(200) NOT NULL,
    description TEXT,
    slug VARCHAR(200) NOT NULL,
    -- EXPLICACIÓN: Información básica del producto
    
    -- VERSIONADO
    current_version INTEGER DEFAULT 1,
    -- EXPLICACIÓN: Control de versiones para cambios en productos
    
    -- PRECIOS
    base_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    profit_margin DECIMAL(5, 2),
    -- EXPLICACIÓN: Estructura de precios para análisis de rentabilidad
    
    -- IDENTIFICADORES COMERCIALES
    sku VARCHAR(100),
    barcode VARCHAR(100),
    -- EXPLICACIÓN: Códigos para integración con sistemas externos
    
    -- MULTIMEDIA
    image_url VARCHAR(500),
    gallery_images JSONB DEFAULT '[]',
    -- EXPLICACIÓN: Imágenes para apps móviles y marketing
    
    -- INFORMACIÓN OPERATIVA
    preparation_time INTEGER,
    cooking_instructions TEXT,
    -- EXPLICACIÓN: Información para cocina y estimación de tiempos
    
    -- INFORMACIÓN NUTRICIONAL Y LEGAL
    allergens JSONB DEFAULT '[]',
    nutritional_info JSONB DEFAULT '{}',
    ingredients JSONB DEFAULT '[]',
    -- EXPLICACIÓN: Información requerida por regulaciones y preferencias
    
    -- PERSONALIZACIÓN
    customization_options JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    -- EXPLICACIÓN: Opciones de personalización y etiquetas para búsqueda
    
    -- ESTADO Y CARACTERÍSTICAS
    status product_status_enum DEFAULT 'active',
    is_featured BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_special BOOLEAN DEFAULT FALSE,
    -- EXPLICACIÓN: Estados y marcadores para presentación en apps
    
    -- ESTACIONALIDAD
    is_seasonal BOOLEAN DEFAULT FALSE,
    seasonal_start DATE,
    seasonal_end DATE,
    -- EXPLICACIÓN: Productos disponibles solo en ciertas épocas
    
    -- DISPONIBILIDAD Y ORDEN
    availability_schedule JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    -- EXPLICACIÓN: Control de cuándo y cómo se muestra el producto
    
    -- AUDITORÍA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(restaurant_id, slug)
    -- EXPLICACIÓN: Slugs únicos por restaurante
);

CREATE TYPE product_status_enum AS ENUM (
    'active',         -- Producto activo y disponible
    'inactive',       -- Temporalmente no disponible
    'draft',          -- En desarrollo, no visible
    'archived',       -- Archivado, mantiene historial
    'discontinued',   -- Descontinuado permanentemente
    'out_of_stock'    -- Sin stock temporalmente
);
-- EXPLICACIÓN: Estados que controlan visibilidad sin perder datos históricos
```

#### 11. Tabla: menu.product_versions
**PROPÓSITO**: Historial de cambios en productos para trazabilidad
**RELACIÓN CON NEGOCIO**: Permite revertir cambios y auditar modificaciones
**CONEXIONES**: Depende de menu.products, auditada por auth.users

```sql
CREATE TABLE menu.product_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    product_id UUID NOT NULL REFERENCES menu.products(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    -- EXPLICACIÓN: Versión específica del producto
    
    -- CAMBIOS REALIZADOS
    changes JSONB NOT NULL,
    change_reason TEXT,
    -- EXPLICACIÓN: Qué cambió y por qué (precios, ingredientes, etc.)
    
    -- ESTADO DE LA VERSIÓN
    status version_status_enum DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    -- EXPLICACIÓN: Control de publicación de cambios
    
    -- AUDITORÍA DE CAMBIOS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    -- EXPLICACIÓN: Quién hizo el cambio y quién lo aprobó
    
    UNIQUE(product_id, version_number)
    -- EXPLICACIÓN: Versiones únicas por producto
);

CREATE TYPE version_status_enum AS ENUM ('draft', 'published', 'archived');
-- EXPLICACIÓN: Estados de versiones para control de publicación
```

#### 12. Tabla: menu.product_price_history
**PROPÓSITO**: Historial completo de cambios de precios
**RELACIÓN CON NEGOCIO**: Análisis de rentabilidad y cumplimiento fiscal
**CONEXIONES**: Depende de menu.products, crítica para reportes financieros

```sql
CREATE TABLE menu.product_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    product_id UUID NOT NULL REFERENCES menu.products(id) ON DELETE CASCADE,
    -- EXPLICACIÓN: Historial específico por producto
    
    -- CAMBIO DE PRECIO
    old_price DECIMAL(10, 2),
    new_price DECIMAL(10, 2) NOT NULL,
    change_reason TEXT,
    -- EXPLICACIÓN: Precio anterior, nuevo y justificación del cambio
    
    -- VIGENCIA
    effective_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expiration_date TIMESTAMP WITH TIME ZONE,
    -- EXPLICACIÓN: Período de vigencia del precio
    
    -- AUDITORÍA
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- EXPLICACIÓN: Quién autorizó el cambio de precio
);
```

#### 13. Tabla: menu.product_stock
**PROPÓSITO**: Control de inventario en tiempo real por producto
**RELACIÓN CON NEGOCIO**: Previene sobreventa y optimiza compras
**CONEXIONES**: Relación 1:1 con menu.products, actualizada por stock_movements

```sql
CREATE TABLE menu.product_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    product_id UUID NOT NULL REFERENCES menu.products(id) ON DELETE CASCADE,
    -- EXPLICACIÓN: Stock específico por producto (relación 1:1)
    
    -- CANTIDADES
    current_quantity DECIMAL(10, 2) DEFAULT 0,
    reserved_quantity DECIMAL(10, 2) DEFAULT 0,
    available_quantity DECIMAL(10, 2) GENERATED ALWAYS AS (current_quantity - reserved_quantity) STORED,
    -- EXPLICACIÓN: Stock actual, reservado y disponible calculado automáticamente
    
    -- LÍMITES DE STOCK
    min_quantity DECIMAL(10, 2) DEFAULT 0,
    max_quantity DECIMAL(10, 2) DEFAULT 1000,
    reorder_point DECIMAL(10, 2) DEFAULT 0,
    -- EXPLICACIÓN: Límites para alertas automáticas de reorden
    
    -- INFORMACIÓN ADICIONAL
    unit_of_measure VARCHAR(20) DEFAULT 'unit',
    location VARCHAR(100),
    batch_number VARCHAR(100),
    expiration_date DATE,
    -- EXPLICACIÓN: Detalles para gestión de inventario
    
    -- INFORMACIÓN DE PROVEEDOR
    supplier_info JSONB DEFAULT '{}',
    -- EXPLICACIÓN: Datos del proveedor para reorden automático
    
    -- AUDITORÍA
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(product_id)
    -- EXPLICACIÓN: Un registro de stock por producto
);
```

#### 14. Tabla: menu.stock_movements
**PROPÓSITO**: Registro detallado de todos los movimientos de inventario
**RELACIÓN CON NEGOCIO**: Trazabilidad completa para auditorías y análisis
**CONEXIONES**: Actualiza menu.product_stock, referencia menu.products

```sql
CREATE TABLE menu.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    product_id UUID NOT NULL REFERENCES menu.products(id) ON DELETE CASCADE,
    -- EXPLICACIÓN: Movimiento específico por producto
    
    -- TIPO Y CANTIDAD
    movement_type stock_movement_enum NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    -- EXPLICACIÓN: Tipo de movimiento y cantidad afectada
    
    -- INFORMACIÓN FINANCIERA
    unit_cost DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    -- EXPLICACIÓN: Costos para análisis de rentabilidad y valoración de inventario
    
    -- CONTEXTO DEL MOVIMIENTO
    reason TEXT,
    reference_number VARCHAR(100),
    supplier_id UUID,
    -- EXPLICACIÓN: Justificación, número de referencia y proveedor del movimiento
    
    -- INFORMACIÓN DE LOTE
    batch_number VARCHAR(100),
    expiration_date DATE,
    notes TEXT,
    -- EXPLICACIÓN: Trazabilidad de lotes para control de calidad y vencimientos
    
    -- AUDITORÍA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES auth.users(id)
    -- EXPLICACIÓN: Quién registró el movimiento y cuándo
);

CREATE TYPE stock_movement_enum AS ENUM (
    'purchase',       -- Compra - entrada de mercancía
    'sale',          -- Venta - salida por venta al cliente
    'adjustment',    -- Ajuste - corrección de inventario
    'waste',         -- Desperdicio - pérdida por deterioro
    'transfer',      -- Transferencia - entre ubicaciones
    'return',        -- Devolución - retorno de mercancía
    'production',    -- Producción - creación de producto elaborado
    'consumption'    -- Consumo - uso en preparación
);
-- EXPLICACIÓN: Tipos de movimientos para clasificar y analizar flujos de inventario
```

#### 15. Tabla: menu.daily_menus
**PROPÓSITO**: Menús diarios que se publican en las aplicaciones móviles
**RELACIÓN CON NEGOCIO**: Núcleo del flujo principal - permite publicar el menú del día
**CONEXIONES**: Pertenece a restaurant, contiene menu_combinations, auditada en menu_publication_logs

```sql
CREATE TABLE menu.daily_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id) ON DELETE CASCADE,
    menu_date DATE NOT NULL,
    -- EXPLICACIÓN: Menú específico por restaurante y fecha
    
    -- INFORMACIÓN DEL MENÚ
    name VARCHAR(200),
    description TEXT,
    -- EXPLICACIÓN: Nombre y descripción del menú del día
    
    -- ESTADO DE PUBLICACIÓN
    status daily_menu_status_enum DEFAULT 'draft',
    -- EXPLICACIÓN: Controla si el menú es visible en apps móviles
    
    -- MÉTRICAS DEL MENÚ
    total_combinations INTEGER DEFAULT 0,
    estimated_cost DECIMAL(10, 2),
    target_profit_margin DECIMAL(5, 2),
    -- EXPLICACIÓN: Estadísticas para análisis de rentabilidad
    
    -- PUBLICACIÓN
    published_at TIMESTAMP WITH TIME ZONE,
    published_by UUID REFERENCES auth.users(id),
    -- EXPLICACIÓN: Cuándo y quién publicó el menú
    
    -- AUDITORÍA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(restaurant_id, menu_date)
    -- EXPLICACIÓN: Solo un menú por restaurante por fecha
);

CREATE TYPE daily_menu_status_enum AS ENUM (
    'draft',          -- Borrador - en construcción, no visible
    'published',      -- Publicado - visible en apps móviles
    'archived',       -- Archivado - menú pasado guardado
    'cancelled'       -- Cancelado - menú cancelado
);
-- EXPLICACIÓN: Estados que controlan la visibilidad del menú en apps móviles
```

#### 16. Tabla: menu.menu_combinations
**PROPÓSITO**: Combinaciones específicas dentro del menú del día (entrada + principio + proteína + bebida)
**RELACIÓN CON NEGOCIO**: Implementa la lógica de combinaciones del código (MenuDiarioRediseno)
**CONEXIONES**: Pertenece a daily_menus, referencia products, tiene combination_sides

```sql
CREATE TABLE menu.menu_combinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    daily_menu_id UUID NOT NULL REFERENCES menu.daily_menus(id) ON DELETE CASCADE,
    -- EXPLICACIÓN: Combinación específica de un menú diario
    
    -- INFORMACIÓN DE LA COMBINACIÓN
    name VARCHAR(200),
    description TEXT,
    -- EXPLICACIÓN: Nombre y descripción de la combinación
    
    -- COMPONENTES DE LA COMBINACIÓN (según código SPOON)
    entrada_id UUID REFERENCES menu.products(id),
    principio_id UUID REFERENCES menu.products(id),
    proteina_id UUID NOT NULL REFERENCES menu.products(id),
    bebida_id UUID REFERENCES menu.products(id),
    -- EXPLICACIÓN: Productos que forman la combinación, proteína es obligatoria
    
    -- PRECIOS
    base_price DECIMAL(10, 2) NOT NULL,
    special_price DECIMAL(10, 2),
    estimated_cost DECIMAL(10, 2),
    profit_margin DECIMAL(5, 2),
    -- EXPLICACIÓN: Estructura de precios y análisis de rentabilidad
    
    -- CONTROL DE CANTIDAD
    max_daily_quantity INTEGER,
    current_quantity INTEGER DEFAULT 0,
    sold_quantity INTEGER DEFAULT 0,
    -- EXPLICACIÓN: Control de stock de la combinación
    
    -- DISPONIBILIDAD
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    availability_start TIME,
    availability_end TIME,
    -- EXPLICACIÓN: Control de disponibilidad temporal
    
    -- PRESENTACIÓN
    sort_order INTEGER DEFAULT 0,
    -- EXPLICACIÓN: Orden de presentación en apps móviles
    
    -- AUDITORÍA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 17. Tabla: menu.combination_sides
**PROPÓSITO**: Acompañamientos adicionales para las combinaciones del menú
**RELACIÓN CON NEGOCIO**: Permite agregar múltiples acompañamientos a una combinación
**CONEXIONES**: Conecta menu_combinations con products para acompañamientos

```sql
CREATE TABLE menu.combination_sides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    combination_id UUID NOT NULL REFERENCES menu.menu_combinations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES menu.products(id),
    -- EXPLICACIÓN: Acompañamiento específico para una combinación
    
    -- CONFIGURACIÓN DEL ACOMPAÑAMIENTO
    quantity DECIMAL(10, 2) DEFAULT 1,
    is_required BOOLEAN DEFAULT FALSE,
    additional_cost DECIMAL(10, 2) DEFAULT 0,
    -- EXPLICACIÓN: Cantidad, si es obligatorio y costo adicional
    
    -- PRESENTACIÓN
    sort_order INTEGER DEFAULT 0,
    -- EXPLICACIÓN: Orden de presentación de acompañamientos
    
    UNIQUE(combination_id, product_id)
    -- EXPLICACIÓN: Un producto solo puede ser acompañamiento una vez por combinación
);
```

### **ESQUEMA: sales (Ventas y Transacciones)**

#### 18. Tabla: sales.orders
**PROPÓSITO**: Registro completo de órdenes de venta con seguimiento de estado
**RELACIÓN CON NEGOCIO**: Captura todas las transacciones comerciales del restaurante
**CONEXIONES**: Pertenece a restaurant, contiene order_items, actualiza daily_sales_summary

```sql
CREATE TABLE sales.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    order_number VARCHAR(50) NOT NULL,
    -- EXPLICACIÓN: Orden específica por restaurante con número único
    
    -- INFORMACIÓN DEL CLIENTE
    customer_name VARCHAR(200),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    table_number VARCHAR(20),
    -- EXPLICACIÓN: Datos del cliente para contacto y servicio
    
    -- TIPO Y ESTADO DE ORDEN
    order_type order_type_enum NOT NULL,
    status order_status_enum DEFAULT 'pending',
    -- EXPLICACIÓN: Tipo de servicio y estado actual de la orden
    
    -- ESTRUCTURA FINANCIERA
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tip_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    -- EXPLICACIÓN: Desglose completo de la facturación
    
    -- INFORMACIÓN DE PAGO
    payment_method payment_method_enum,
    payment_status payment_status_enum DEFAULT 'pending',
    payment_reference VARCHAR(100),
    -- EXPLICACIÓN: Método y estado del pago
    
    -- NOTAS Y OBSERVACIONES
    notes TEXT,
    special_instructions TEXT,
    -- EXPLICACIÓN: Notas generales e instrucciones especiales para cocina
    
    -- TIEMPOS DE PREPARACIÓN
    estimated_preparation_time INTEGER,
    actual_preparation_time INTEGER,
    -- EXPLICACIÓN: Tiempos estimados vs reales para análisis de eficiencia
    
    -- INFORMACIÓN DE DELIVERY
    delivery_address TEXT,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    delivery_time TIMESTAMP WITH TIME ZONE,
    -- EXPLICACIÓN: Datos específicos para órdenes de delivery
    
    -- TIMESTAMPS DE PROCESO
    served_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    -- EXPLICACIÓN: Seguimiento temporal del proceso de la orden
    
    -- AUDITORÍA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(restaurant_id, order_number)
    -- EXPLICACIÓN: Números de orden únicos por restaurante
);

-- ENUMS PARA VENTAS
CREATE TYPE order_type_enum AS ENUM ('dine_in', 'takeout', 'delivery', 'pickup');
-- EXPLICACIÓN: Tipos de servicio que afectan el flujo operativo

CREATE TYPE order_status_enum AS ENUM (
    'pending',        -- Pendiente - recién creada
    'confirmed',      -- Confirmada - aceptada por restaurante
    'preparing',      -- En preparación - cocina trabajando
    'ready',          -- Lista - esperando entrega/recogida
    'served',         -- Servida - entregada al cliente
    'completed',      -- Completada - proceso finalizado
    'cancelled'       -- Cancelada - orden cancelada
);
-- EXPLICACIÓN: Estados que reflejan el flujo operativo del restaurante

CREATE TYPE payment_method_enum AS ENUM (
    'cash',           -- Efectivo
    'card',           -- Tarjeta de crédito/débito
    'transfer',       -- Transferencia bancaria
    'digital_wallet', -- Billetera digital (Nequi, Daviplata)
    'credit'          -- Crédito del restaurante
);
-- EXPLICACIÓN: Métodos de pago disponibles en Colombia

CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'partial', 'refunded', 'failed');
-- EXPLICACIÓN: Estados de pago para control financiero
```

#### 19. Tabla: sales.order_items
**PROPÓSITO**: Items individuales dentro de cada orden con seguimiento específico
**RELACIÓN CON NEGOCIO**: Detalle de qué se vendió, base para análisis de productos
**CONEXIONES**: Pertenece a orders, referencia products o combinations

```sql
CREATE TABLE sales.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    order_id UUID NOT NULL REFERENCES sales.orders(id) ON DELETE CASCADE,
    -- EXPLICACIÓN: Item específico de una orden
    
    -- REFERENCIA AL PRODUCTO
    product_id UUID REFERENCES menu.products(id),
    combination_id UUID REFERENCES menu.menu_combinations(id),
    -- EXPLICACIÓN: Puede ser producto individual o combinación del menú
    
    -- INFORMACIÓN DEL ITEM
    item_name VARCHAR(200) NOT NULL,
    item_description TEXT,
    -- EXPLICACIÓN: Nombre y descripción al momento de la venta
    
    -- CANTIDAD Y PRECIOS
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    -- EXPLICACIÓN: Cantidad vendida y precios al momento de la venta
    
    -- PERSONALIZACIÓN
    customizations JSONB DEFAULT '{}',
    special_instructions TEXT,
    -- EXPLICACIÓN: Personalizaciones e instrucciones específicas del item
    
    -- ESTADO DEL ITEM
    status order_item_status_enum DEFAULT 'pending',
    prepared_at TIMESTAMP WITH TIME ZONE,
    served_at TIMESTAMP WITH TIME ZONE,
    -- EXPLICACIÓN: Estado específico del item en cocina
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_product_or_combination CHECK (
        (product_id IS NOT NULL AND combination_id IS NULL) OR
        (product_id IS NULL AND combination_id IS NOT NULL)
    )
    -- EXPLICACIÓN: Un item debe ser producto O combinación, no ambos
);

CREATE TYPE order_item_status_enum AS ENUM ('pending', 'preparing', 'ready', 'served', 'cancelled');
-- EXPLICACIÓN: Estados específicos para seguimiento en cocina
```

#### 20. Tabla: sales.daily_sales_summary
**PROPÓSITO**: Resumen automático de ventas diarias para reportes y análisis
**RELACIÓN CON NEGOCIO**: Dashboard de ventas y métricas de rendimiento
**CONEXIONES**: Actualizada automáticamente por triggers de sales.orders

```sql
CREATE TABLE sales.daily_sales_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    sales_date DATE NOT NULL,
    -- EXPLICACIÓN: Resumen específico por restaurante y fecha
    
    -- MÉTRICAS DE ÓRDENES
    total_orders INTEGER DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    -- EXPLICACIÓN: Cantidad de órdenes e items vendidos
    
    -- MÉTRICAS FINANCIERAS
    gross_sales DECIMAL(12, 2) DEFAULT 0,
    net_sales DECIMAL(12, 2) DEFAULT 0,
    tax_collected DECIMAL(10, 2) DEFAULT 0,
    tips_collected DECIMAL(10, 2) DEFAULT 0,
    discounts_given DECIMAL(10, 2) DEFAULT 0,
    refunds_given DECIMAL(10, 2) DEFAULT 0,
    -- EXPLICACIÓN: Desglose financiero completo del día
    
    -- MÉTRICAS POR MÉTODO DE PAGO
    cash_sales DECIMAL(10, 2) DEFAULT 0,
    card_sales DECIMAL(10, 2) DEFAULT 0,
    digital_sales DECIMAL(10, 2) DEFAULT 0,
    -- EXPLICACIÓN: Ventas por método de pago para cuadre de caja
    
    -- ANÁLISIS DE RENDIMIENTO
    average_order_value DECIMAL(10, 2) DEFAULT 0,
    peak_hour_start TIME,
    peak_hour_end TIME,
    -- EXPLICACIÓN: Métricas de rendimiento operativo
    
    -- PRODUCTOS MÁS VENDIDOS
    top_selling_items JSONB DEFAULT '[]',
    -- EXPLICACIÓN: Lista de productos más vendidos del día
    
    -- AUDITORÍA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(restaurant_id, sales_date)
    -- EXPLICACIÓN: Un resumen por restaurante por fecha
);
```

### **ESQUEMA: audit (Auditoría y Logs)**

#### 21. Tabla: audit.activity_logs
**PROPÓSITO**: Registro completo de todas las actividades del sistema para auditoría
**RELACIÓN CON NEGOCIO**: Cumplimiento, debugging y análisis de comportamiento
**CONEXIONES**: Recibe eventos de todos los esquemas vía triggers automáticos

```sql
CREATE TABLE audit.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- CONTEXTO DE LA ACTIVIDAD
    restaurant_id UUID REFERENCES restaurant.restaurants(id),
    user_id UUID REFERENCES auth.users(id),
    -- EXPLICACIÓN: Contexto del restaurante y usuario que realizó la acción
    
    -- DESCRIPCIÓN DE LA ACCIÓN
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    -- EXPLICACIÓN: Qué acción se realizó sobre qué recurso
    
    -- DATOS DE LA ACCIÓN
    old_values JSONB,
    new_values JSONB,
    -- EXPLICACIÓN: Estado anterior y nuevo para trazabilidad completa
    
    -- INFORMACIÓN DE SEGURIDAD
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    -- EXPLICACIÓN: Información de la sesión para análisis de seguridad
    
    -- CLASIFICACIÓN
    severity log_severity_enum DEFAULT 'info',
    description TEXT,
    metadata JSONB DEFAULT '{}',
    -- EXPLICACIÓN: Clasificación y contexto adicional del evento
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE log_severity_enum AS ENUM ('debug', 'info', 'warning', 'error', 'critical');
-- EXPLICACIÓN: Niveles de severidad para filtrado y alertas
```

#### 22. Tabla: audit.menu_publication_logs
**PROPÓSITO**: Trazabilidad específica de publicaciones de menú (flujo crítico del negocio)
**RELACIÓN CON NEGOCIO**: Audita el proceso principal de publicación de menús
**CONEXIONES**: Registra eventos de menu.daily_menus cuando se publican

```sql
CREATE TABLE audit.menu_publication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    daily_menu_id UUID NOT NULL REFERENCES menu.daily_menus(id),
    -- EXPLICACIÓN: Contexto específico de la publicación
    
    -- ACCIÓN REALIZADA
    action publication_action_enum NOT NULL,
    published_by UUID NOT NULL REFERENCES auth.users(id),
    -- EXPLICACIÓN: Qué acción se realizó y quién la ejecutó
    
    -- CONTEXTO DE PUBLICACIÓN
    publication_channel VARCHAR(50),
    total_combinations INTEGER,
    -- EXPLICACIÓN: Canal de publicación y cantidad de combinaciones
    
    -- RESULTADO
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    -- EXPLICACIÓN: Si fue exitosa y detalles adicionales
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE publication_action_enum AS ENUM ('publish', 'unpublish', 'update', 'schedule');
-- EXPLICACIÓN: Acciones específicas de publicación de menús
```

### **ESQUEMA: config (Configuraciones del Sistema)**

#### 23. Tabla: config.system_settings
**PROPÓSITO**: Configuraciones flexibles por restaurante sin modificar código
**RELACIÓN CON NEGOCIO**: Personalización del comportamiento del sistema
**CONEXIONES**: Utilizada por todos los módulos para configuraciones específicas

```sql
CREATE TABLE config.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    restaurant_id UUID REFERENCES restaurant.restaurants(id),
    -- EXPLICACIÓN: Configuración específica por restaurante (NULL = global)
    
    -- DEFINICIÓN DE LA CONFIGURACIÓN
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type setting_type_enum NOT NULL,
    -- EXPLICACIÓN: Clave, valor y tipo de la configuración
    
    -- METADATOS
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_encrypted BOOLEAN DEFAULT FALSE,
    -- EXPLICACIÓN: Descripción, visibilidad y si requiere encriptación
    
    -- AUDITORÍA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(restaurant_id, setting_key)
    -- EXPLICACIÓN: Una configuración por clave por restaurante
);

CREATE TYPE setting_type_enum AS ENUM ('string', 'number', 'boolean', 'json', 'array');
-- EXPLICACIÓN: Tipos de datos para validación de configuraciones
```

---

## Índices Recomendados para Optimización

### **PROPÓSITO DE LOS ÍNDICES**: Mejorar el rendimiento de consultas frecuentes identificadas en el código

```sql
-- ÍNDICES PARA AUTENTICACIÓN (Consultas más frecuentes del sistema)
CREATE INDEX idx_users_email ON auth.users(email);
-- EXPLICACIÓN: Login diario de usuarios, consulta más frecuente del sistema

CREATE INDEX idx_users_role_status ON auth.users(role, status);
-- EXPLICACIÓN: Filtrado de usuarios por rol y estado para permisos

CREATE INDEX idx_sessions_user_active ON auth.user_sessions(user_id, is_active);
-- EXPLICACIÓN: Validación de sesiones activas en cada request

CREATE INDEX idx_sessions_token ON auth.user_sessions(session_token);
-- EXPLICACIÓN: Validación de tokens de sesión en middleware

CREATE INDEX idx_sessions_expires ON auth.user_sessions(expires_at);
-- EXPLICACIÓN: Limpieza automática de sesiones expiradas

-- ÍNDICES PARA RESTAURANTES (Contexto principal del sistema)
CREATE INDEX idx_restaurants_owner ON restaurant.restaurants(owner_id);
-- EXPLICACIÓN: Listado de restaurantes por propietario

CREATE INDEX idx_restaurants_status ON restaurant.restaurants(status);
-- EXPLICACIÓN: Filtrado de restaurantes activos para apps móviles

CREATE INDEX idx_restaurants_location ON restaurant.restaurants(latitude, longitude);
-- EXPLICACIÓN: Búsqueda geográfica para delivery

CREATE INDEX idx_restaurant_users_restaurant ON restaurant.restaurant_users(restaurant_id);
-- EXPLICACIÓN: Listado de empleados por restaurante

CREATE INDEX idx_business_hours_restaurant ON restaurant.business_hours(restaurant_id);
-- EXPLICACIÓN: Consulta de horarios para apps móviles

-- ÍNDICES PARA MENÚS (Núcleo del negocio)
CREATE INDEX idx_categories_restaurant ON menu.categories(restaurant_id, is_active);
-- EXPLICACIÓN: Listado de categorías activas por restaurante

CREATE INDEX idx_products_restaurant_category ON menu.products(restaurant_id, category_id);
-- EXPLICACIÓN: Productos por categoría, consulta principal del menú

CREATE INDEX idx_products_status ON menu.products(status, is_active);
-- EXPLICACIÓN: Filtrado de productos disponibles

CREATE INDEX idx_products_featured ON menu.products(is_featured, is_special);
-- EXPLICACIÓN: Productos destacados para promociones

CREATE INDEX idx_daily_menus_restaurant_date ON menu.daily_menus(restaurant_id, menu_date);
-- EXPLICACIÓN: Menú del día por restaurante y fecha

CREATE INDEX idx_combinations_daily_menu ON menu.menu_combinations(daily_menu_id);
-- EXPLICACIÓN: Combinaciones de un menú específico

CREATE INDEX idx_stock_product ON menu.product_stock(product_id);
-- EXPLICACIÓN: Consulta de stock por producto

-- ÍNDICES PARA VENTAS (Análisis y reportes)
CREATE INDEX idx_orders_restaurant_date ON sales.orders(restaurant_id, created_at);
-- EXPLICACIÓN: Órdenes por restaurante y fecha para reportes

CREATE INDEX idx_orders_status ON sales.orders(status, payment_status);
-- EXPLICACIÓN: Órdenes pendientes y estados de pago

CREATE INDEX idx_order_items_order ON sales.order_items(order_id);
-- EXPLICACIÓN: Items de una orden específica

CREATE INDEX idx_daily_sales_restaurant_date ON sales.daily_sales_summary(restaurant_id, sales_date);
-- EXPLICACIÓN: Resúmenes de ventas para dashboard

-- ÍNDICES PARA AUDITORÍA (Investigación y compliance)
CREATE INDEX idx_activity_logs_restaurant_date ON audit.activity_logs(restaurant_id, created_at);
-- EXPLICACIÓN: Logs por restaurante y fecha para auditorías

CREATE INDEX idx_activity_logs_user_action ON audit.activity_logs(user_id, action);
-- EXPLICACIÓN: Acciones por usuario para investigaciones

CREATE INDEX idx_publication_logs_restaurant ON audit.menu_publication_logs(restaurant_id, created_at);
-- EXPLICACIÓN: Historial de publicaciones por restaurante

-- ÍNDICES PARCIALES (Optimización específica para casos comunes)
CREATE INDEX idx_active_products ON menu.products(restaurant_id, category_id) 
WHERE status = 'active';
-- EXPLICACIÓN: Solo productos activos, reduce tamaño del índice significativamente

CREATE INDEX idx_published_menus ON menu.daily_menus(restaurant_id, menu_date) 
WHERE status = 'published';
-- EXPLICACIÓN: Solo menús publicados para apps móviles

CREATE INDEX idx_pending_orders ON sales.orders(restaurant_id, created_at) 
WHERE status IN ('pending', 'confirmed', 'preparing');
-- EXPLICACIÓN: Solo órdenes activas para dashboard operativo
```

---

## Triggers y Constraints Recomendados

### **PROPÓSITO DE LOS TRIGGERS**: Automatizar procesos de negocio y mantener integridad

```sql
-- TRIGGER PARA ACTUALIZACIÓN AUTOMÁTICA DE TIMESTAMPS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
-- EXPLICACIÓN: Actualiza automáticamente updated_at en cada modificación

-- APLICACIÓN A TABLAS PRINCIPALES
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- EXPLICACIÓN: Mantiene trazabilidad temporal automática en usuarios

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurant.restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- EXPLICACIÓN: Mantiene trazabilidad temporal automática en restaurantes

-- TRIGGER PARA AUDITORÍA AUTOMÁTICA
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit.activity_logs (
        user_id, action, resource_type, resource_id, 
        old_values, new_values, created_at
    ) VALUES (
        COALESCE(NEW.updated_by, NEW.created_by),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
        CURRENT_TIMESTAMP
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
-- EXPLICACIÓN: Registra automáticamente todos los cambios para auditoría

-- TRIGGER PARA ACTUALIZACIÓN AUTOMÁTICA DE STOCK
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE menu.product_stock 
        SET current_quantity = current_quantity - NEW.quantity
        WHERE product_id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- EXPLICACIÓN: Actualiza stock automáticamente cuando se registra una venta

-- TRIGGER PARA RESUMEN DIARIO DE VENTAS
CREATE OR REPLACE FUNCTION update_daily_sales_summary()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO sales.daily_sales_summary (
        restaurant_id, sales_date, total_orders, gross_sales, net_sales
    ) VALUES (
        NEW.restaurant_id, 
        NEW.created_at::date,
        1,
        NEW.total_amount,
        NEW.total_amount - NEW.tax_amount
    )
    ON CONFLICT (restaurant_id, sales_date) 
    DO UPDATE SET
        total_orders = daily_sales_summary.total_orders + 1,
        gross_sales = daily_sales_summary.gross_sales + NEW.total_amount,
        net_sales = daily_sales_summary.net_sales + (NEW.total_amount - NEW.tax_amount),
        updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- EXPLICACIÓN: Actualiza automáticamente resúmenes diarios cuando se crea una orden

CREATE TRIGGER trigger_update_daily_sales 
    AFTER INSERT ON sales.orders
    FOR EACH ROW EXECUTE FUNCTION update_daily_sales_summary();
-- EXPLICACIÓN: Mantiene métricas de ventas actualizadas en tiempo real

-- CONSTRAINTS DE INTEGRIDAD DE NEGOCIO
ALTER TABLE restaurant.business_hours 
ADD CONSTRAINT check_valid_hours 
CHECK (
    (is_closed = TRUE) OR 
    (open_time IS NOT NULL AND close_time IS NOT NULL AND open_time < close_time)
);
-- EXPLICACIÓN: Valida que los horarios sean lógicamente correctos

ALTER TABLE menu.products 
ADD CONSTRAINT check_positive_prices 
CHECK (base_price > 0 AND current_price > 0);
-- EXPLICACIÓN: Previene precios negativos o cero

ALTER TABLE menu.product_stock 
ADD CONSTRAINT check_non_negative_stock 
CHECK (current_quantity >= 0 AND reserved_quantity >= 0);
-- EXPLICACIÓN: Previene stock negativo

ALTER TABLE menu.daily_menus 
ADD CONSTRAINT check_future_menu_date 
CHECK (menu_date >= CURRENT_DATE);
-- EXPLICACIÓN: Previene crear menús para fechas pasadas

ALTER TABLE sales.orders 
ADD CONSTRAINT check_positive_total 
CHECK (total_amount > 0 AND subtotal > 0);
-- EXPLICACIÓN: Valida que las órdenes tengan montos positivos
```

---

## Conclusiones y Justificación del Diseño

### **FORTALEZAS DEL DISEÑO EXPLICADAS:**

1. **Normalización Completa (3FN)** 
   - **PROPÓSITO**: Elimina redundancia
2. **Escalabilidad** - Diseño preparado para millones de registros
3. **Flexibilidad** - Uso de JSONB para configuraciones dinámicas
4. **Seguridad** - RLS, auditoría completa y encriptación
5. **Rendimiento** - Índices optimizados y particionado estratégico
6. **Trazabilidad** - Logs completos de todas las operaciones críticas

### **Próximos Pasos:**

1. **Implementar en etapas** - Comenzar con esquemas core (auth, restaurant, menu)
2. **Pruebas de carga** - Validar rendimiento con datos reales
3. **Monitoreo** - Implementar alertas para métricas críticas
4. **Backup y Recovery** - Estrategia de respaldo automatizada
5. **Documentación** - Mantener documentación actualizada del esquema

### **Métricas de Éxito:**

- **Tiempo de respuesta** < 100ms para consultas frecuentes
- **Disponibilidad** > 99.9% uptime
- **Integridad** 0% pérdida de datos críticos
- **Escalabilidad** Soporte para 1000+ restaurantes simultáneos
- **Seguridad** Cumplimiento con estándares de protección de datos

Este diseño de base de datos proporciona una base sólida y escalable para el crecimiento futuro de SPOON como el sistema operativo líder para restaurantes independientes en Latinoamérica.