# Diagrama de Flujo del Sistema SPOON
## Análisis Completo del Funcionamiento del Sistema

### Resumen Ejecutivo
SPOON es un sistema operativo para restaurantes independientes en Latinoamérica que permite la gestión completa del menú diario y su publicación en aplicaciones móviles. El sistema está construido con una arquitectura de microservicios usando Next.js como frontend y múltiples servicios backend especializados.

---

## Diagrama de Flujo Principal

```mermaid
flowchart TD
    %% Estilos
    classDef userAction fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    classDef systemProcess fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px
    classDef decision fill:#FFF3E0,stroke:#F57C00,stroke-width:2px
    classDef database fill:#E8F5E8,stroke:#388E3C,stroke-width:2px
    classDef external fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px
    classDef cache fill:#F1F8E9,stroke:#689F38,stroke-width:2px

    %% Punto de Entrada
    A[👤 Usuario accede a la Página Web SPOON] --> B{🔐 ¿Usuario autenticado?}
    
    %% Flujo de Autenticación
    B -->|No| C[📱 Página de Login<br/>LoginPage.tsx]
    C --> D[🔑 Ingreso de credenciales<br/>admin/1234 o Google OAuth]
    D --> E{✅ ¿Credenciales válidas?}
    E -->|No| F[❌ Error de autenticación<br/>toast.error]
    F --> C
    E -->|Sí| G[🍪 Establecer cookie de autenticación<br/>Cookies.set('dev-auth-token')]
    G --> H[🔄 Redirección al Dashboard<br/>router.push('/dashboard')]
    
    %% Dashboard Principal
    B -->|Sí| I[🏠 Dashboard Principal<br/>DashboardLayout.tsx]
    H --> I
    I --> J[📊 Barra Lateral de Navegación<br/>BarraLateral.tsx]
    J --> K{🎯 ¿Qué módulo selecciona?}
    
    %% Módulos del Dashboard
    K -->|Visión General| L[📈 Resumen de Ventas]
    K -->|Registro Ventas| M[💰 Registro de Ventas Diarias]
    K -->|Gestión Menú| N[🍽️ **MÓDULO PRINCIPAL**<br/>Gestión del Menú del Día]
    K -->|Estadísticas| O[📊 Análisis y Tendencias]
    K -->|Configuración| P[⚙️ Configuración del Sistema]
    
    %% FLUJO PRINCIPAL - Gestión del Menú
    N --> Q[🔄 Inicialización del Menú<br/>useMenuCache() hook]
    Q --> R{💾 ¿Caché válido?<br/>getCacheRemainingTime()}
    
    %% Gestión de Caché
    R -->|Sí| S[⚡ Cargar desde caché local<br/>menuCacheUtils.get()]
    R -->|No| T[📂 Cargar datos estáticos<br/>staticMenuData.ts]
    S --> U[🔔 Notificación: Datos desde caché<br/>toast.success]
    T --> V[🔔 Notificación: Datos frescos<br/>toast.info]
    
    %% Interfaz de Gestión del Menú
    U --> W[🖥️ Interfaz MenuDiaPage.tsx]
    V --> W
    W --> X[🔍 Barra de búsqueda de productos<br/>Search + Sugerencias]
    W --> Y[📑 Navegación por tipo de comida<br/>Desayuno/Almuerzo/Cena/Rápidas]
    W --> Z[📋 Acordeón de categorías<br/>Entradas/Principio/Proteína/Acompañamientos/Bebida]
    
    %% Selección de Productos
    Z --> AA[🛒 Selección de productos por categoría]
    AA --> BB{➕ ¿Agregar al menú del día?}
    BB -->|Sí| CC[✅ addProductoToMenu(producto)<br/>Agregar a productosMenu[]]
    BB -->|No| DD[⭐ Agregar a favoritos<br/>addProductoToFavoritos()]
    CC --> EE[🔔 toast.success: Producto agregado]
    DD --> FF[🔔 toast.success: Agregado a favoritos]
    
    %% Gestión del Menú del Día
    EE --> GG[📝 Visualización en MenuDiarioRediseno<br/>Lista de productos seleccionados]
    GG --> HH{🍽️ ¿Menú del día completo?}
    HH -->|No| II[⚠️ Continuar agregando productos]
    II --> AA
    HH -->|Sí| JJ[🎯 Botones de acción habilitados<br/>Mantener Menu | Publicar Menu]
    
    %% Decisión de Publicación
    JJ --> KK{📢 ¿Qué acción toma?}
    KK -->|Mantener| LL[💾 Guardar en caché local<br/>saveToCache()]
    KK -->|Publicar| MM[🚀 **PUBLICACIÓN DEL MENÚ**]
    
    %% Flujo de Publicación (Backend)
    MM --> NN[📡 API Call: /api/menu-dia/route.ts]
    NN --> OO[🔄 Procesamiento en Monolito/Service]
    OO --> PP{🗄️ Persistencia}
    PP -->|Primary| RR[🐘 Base de datos PostgreSQL<br/>Tablas: productos, menus, combinaciones]
    
    %% Sincronización y Caché Distribuido
    RR --> SS[⚡ Actualización en Redis Cache<br/>Caché distribuido para Apps]
    SS --> TT[🔄 Sincronización (Polling/SSE)<br/>menu-service ↔ ventas-service ↔ bi-service]
    
    %% Publicación en Apps Móviles
    TT --> UU[📱 **DISPONIBILIDAD EN APPS MÓVILES**]
    UU --> VV[👥 App Comensales<br/>Consume API/Redis]
    UU --> WW[🍽️ App Meseros<br/>Gestión de pedidos]
    UU --> XX[🚚 App Domicilios<br/>Gestión de entregas]
    
    %% Monitoreo y Analytics
    TT --> YY[📊 Sistema de Monitoreo<br/>Prometheus + Grafana]
    YY --> ZZ[📈 Métricas de rendimiento<br/>Ventas, productos más pedidos]
    ZZ --> AAA[🔄 Retroalimentación al Dashboard<br/>Módulo de Estadísticas]
    
    %% Flujo de Datos Técnico
    LL --> BBB[💾 Local Storage<br/>menu_crear_menu]
    BBB --> CCC[⏰ Expiración de caché<br/>60 minutos]
    CCC --> DDD{🕐 ¿Caché expirado?}
    DDD -->|Sí| T
    DDD -->|No| S
    
    %% Aplicar estilos
    class A,C,D,AA,JJ userAction
    class Q,NN,OO,TT,YY systemProcess
    class B,E,R,BB,HH,KK,PP,DDD decision
    class QQ,RR,SS,BBB database
    class VV,WW,XX,UU external
    class S,T,LL,CCC cache
```

---

## Componentes Técnicos Identificados

### **Frontend (Next.js)**
- **Páginas principales:**
  - `src/app/login/page.tsx` - Autenticación
  - `src/app/dashboard/page.tsx` - Dashboard principal
  - `src/app/dashboard/carta/menu-dia/page.tsx` - Gestión del menú

- **Componentes clave:**
  - `BarraLateral.tsx` - Navegación del dashboard
  - `MenuDiarioRediseno.tsx` - Visualización del menú del día
  - `ListaProductosRediseno.tsx` - Lista de productos disponibles

- **Hooks y utilidades:**
  - `useMenuCache.ts` - Gestión de caché local
  - `menuCache.utils.ts` - Utilidades de caché
  - `staticMenuData.ts` - Datos estáticos del menú

### **Backend (Microservicios)**
- **menu-service** (Puerto 3001)
  - Gestión de productos y categorías

  - Versionado de productos

- **ventas-service** (Puerto 3003)
  - Registro de ventas diarias
  - Análisis de rendimiento

- **bi-service** (Puerto 3005)
  - Business Intelligence
  - Reportes y analytics

### **APIs Identificadas**
- `/api/menu-dia/route.ts` - Gestión del menú del día
- `/api/combinaciones/route.ts` - Combinaciones de productos
- `/api/productos/[categoriaId]/route.ts` - Productos por categoría

### **Base de Datos**
- **PostgreSQL** - Persistencia principal

- **Redis** - Caché distribuido

---

## Flujo de Datos Detallado

### **1. Carga Inicial de Datos**
```
staticMenuData.ts → useMenuCache() → Estado Local (Zustand) → UI Components
```

### **2. Gestión de Caché**
```
Local Storage ↔ menuCacheUtils ↔ useMenuCache() ↔ React State
```

### **3. Publicación del Menú**
```
UI Action → API Route → menu-service → PostgreSQL → Redis Cache → Apps Móviles
```

### **4. Sincronización entre Servicios**
```
menu-service ↔ ventas-service ↔ bi-service ↔ PostgreSQL ↔ Prometheus/Grafana
```

---

## Variables y Funciones Clave del Código

### **Gestión de Estado**
- `menuData: MenuCrearMenuData` - Estado principal del menú
- `productosMenu: Producto[]` - Productos del menú del día
- `productosFavoritos: Producto[]` - Productos favoritos
- `categoriaSeleccionada: string` - Categoría activa

### **Funciones Principales**
- `addProductoToMenu(producto: Producto)` - Agregar producto al menú
- `removeProductoFromMenu(productoId: string)` - Eliminar producto
- `updateProductosMenu(productos: Producto[])` - Actualizar lista completa
- `saveToCache()` - Guardar en caché local
- `loadFromCache()` - Cargar desde caché

### **APIs y Servicios**
- `MenuService.getMenuItems(categoryId?)` - Obtener productos
- `MenuService.updateMenuItems(items)` - Actualizar productos
- `menuCacheUtils.set(data)` - Guardar en caché
- `menuCacheUtils.get()` - Obtener del caché

---

## Decisiones Lógicas del Sistema

### **Autenticación**
- ✅ Credenciales válidas → Acceso al dashboard
- ❌ Credenciales inválidas → Permanecer en login
- 🔄 Token expirado → Redirección a login

### **Gestión de Caché**
- ✅ Caché válido (< 60 min) → Cargar datos locales
- ❌ Caché expirado → Cargar datos frescos
- 🔄 Cambios detectados → Guardar automáticamente

### **Publicación del Menú**
- ✅ Menú completo → Habilitar botón "Publicar"
- ❌ Menú incompleto → Botón deshabilitado
- 🚀 Publicar → Disponible en apps móviles

### **Sincronización de Datos**
- 📡 Cambios en menu-service → Actualizar Redis
- 🔄 Redis actualizado → Notificar otros servicios
- 📱 Servicios actualizados → Refrescar apps móviles

---

## Arquitectura del Sistema

### **Patrón de Arquitectura**
- **Frontend:** Single Page Application (SPA) con Next.js
- **Backend:** Microservicios con API Gateway (Nginx)
- **Base de datos:** Multi-database (PostgreSQL + Redis)
- **Caché:** Estrategia híbrida (Local + Distribuido)

### **Flujo de Comunicación**
```
Usuario → Frontend → API Gateway → Microservicio → Base de Datos
                                       ↓
                               Apps Móviles
```

### **Monitoreo y Observabilidad**
- **Prometheus** - Recolección de métricas
- **Grafana** - Visualización de datos
- **cAdvisor** - Métricas de contenedores
- **Health Checks** - Verificación de servicios

---

## Conclusiones

El sistema SPOON implementa un flujo completo desde la gestión del menú hasta su publicación en aplicaciones móviles, con las siguientes características clave:

1. **Autenticación robusta** con múltiples opciones (credenciales + OAuth)
2. **Gestión de caché inteligente** para optimizar rendimiento
3. **Interfaz intuitiva** para la creación del menú diario
4. **Arquitectura de microservicios** escalable y mantenible
5. **Sincronización en tiempo real** entre todos los componentes
6. **Monitoreo completo** del sistema y métricas de negocio

El flujo principal permite a los restaurantes crear y publicar su menú diario de manera eficiente, con visibilidad inmediata en las aplicaciones móviles de comensales y personal del restaurante.
