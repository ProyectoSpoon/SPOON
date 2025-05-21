# DOCUMENTO-DASHBOARD: Estructura y Funcionalidades

## Índice
1. [Introducción](#introducción)
2. [Arquitectura General](#arquitectura-general)
3. [Estructura de Directorios](#estructura-de-directorios)
4. [Componentes Principales](#componentes-principales)
5. [Módulos Funcionales](#módulos-funcionales)
6. [Integración con Microservicios](#integración-con-microservicios)
7. [Sistema de Estilos](#sistema-de-estilos)
8. [Flujo de Datos](#flujo-de-datos)
9. [Seguridad y Autenticación](#seguridad-y-autenticación)
10. [Monitoreo y Observabilidad](#monitoreo-y-observabilidad)

## Introducción

El dashboard de Spoon es una aplicación web completa desarrollada con Next.js que proporciona una interfaz centralizada para la gestión de restaurantes. Permite a los propietarios y administradores controlar todos los aspectos de su negocio, desde la gestión del menú hasta el análisis de ventas y estadísticas, pasando por la configuración del restaurante y la administración de usuarios.

El dashboard está diseñado siguiendo principios de diseño moderno, con una interfaz intuitiva y responsive que prioriza la experiencia de usuario. La arquitectura está basada en microservicios, lo que permite una alta escalabilidad y mantenibilidad del sistema.

## Arquitectura General

El dashboard de Spoon forma parte de una arquitectura más amplia basada en microservicios, donde cada componente funcional está separado en servicios independientes que se comunican entre sí a través de APIs REST.

### Componentes Arquitectónicos Principales:

1. **Frontend (Next.js)**: Aplicación principal que contiene el dashboard y la interfaz de usuario.
2. **API Gateway (Nginx)**: Punto de entrada único que enruta las peticiones a los microservicios correspondientes.
3. **Microservicios**:
   - **Menu Service**: Gestión de menús, categorías y productos.
   - **Inventario Service**: Control de inventario y stock.
   - **Ventas Service**: Registro y procesamiento de ventas.
   - **Estadísticas Service**: Generación de reportes y análisis.
   - **BI Service**: Inteligencia de negocio y análisis avanzado.
4. **Base de Datos (PostgreSQL)**: Almacenamiento persistente de datos.
5. **Caché (Redis)**: Almacenamiento en caché para mejorar el rendimiento.
6. **Monitoreo (Prometheus/Grafana)**: Sistema de monitoreo y visualización de métricas.

## Estructura de Directorios

La estructura de directorios del dashboard sigue una organización modular basada en características (feature-based), lo que facilita la escalabilidad y mantenimiento del código.

```
src/
├── app/                    # Aplicación Next.js (App Router)
│   ├── dashboard/          # Módulo principal del dashboard
│   │   ├── components/     # Componentes específicos del dashboard
│   │   ├── carta/          # Gestión del menú y productos
│   │   ├── configuracion/  # Configuración del restaurante
│   │   ├── estadisticas/   # Análisis y estadísticas
│   │   ├── horario-comercial/ # Gestión de horarios
│   │   ├── registro-ventas/   # Registro de ventas
│   │   ├── usuarios/       # Gestión de usuarios
│   │   ├── vision-general/ # Vista general y KPIs
│   │   ├── layout.tsx      # Layout principal del dashboard
│   │   └── page.tsx        # Página principal del dashboard
├── components/             # Componentes globales
│   ├── ui/                 # Componentes de UI básicos
│   ├── gestion-menu/       # Componentes para gestión de menú
│   └── metrics/            # Componentes para métricas y gráficos
├── shared/                 # Recursos compartidos
│   ├── components/         # Componentes reutilizables
│   ├── hooks/              # Hooks personalizados
│   ├── services/           # Servicios compartidos
│   ├── types/              # Definiciones de tipos
│   └── utils/              # Utilidades
├── context/                # Contextos de React
├── hooks/                  # Hooks personalizados
├── services/               # Servicios de API
├── styles/                 # Estilos globales
└── utils/                  # Utilidades generales
```

## Componentes Principales

### Layout Principal

El dashboard utiliza un layout consistente en todas sus páginas, definido en `src/app/dashboard/layout.tsx`. Este layout incluye:

1. **Barra Superior**: Contiene el logo, título del dashboard y menú de usuario.
2. **Barra Lateral**: Navegación principal con acceso a todos los módulos.
3. **Contenido Principal**: Área donde se renderiza el contenido específico de cada página.

```jsx
// Estructura simplificada del layout
<div className="min-h-screen bg-white flex flex-col h-screen">
  {/* Barra Superior Fija */}
  <header className="h-[73px] bg-white border-b border-neutral-200 flex-shrink-0 z-50">
    {/* Contenido de la barra superior */}
  </header>

  {/* Contenedor principal con barra lateral y contenido */}
  <div className="flex flex-1 overflow-hidden">
    {/* Barra Lateral */}
    <aside className="w-64 bg-white border-r border-neutral-100 flex-shrink-0 overflow-y-auto">
      <BarraLateral />
    </aside>

    {/* Contenido Principal con scroll */}
    <main className="flex-1 overflow-auto pl-8 pt-6">
      {children}
    </main>
  </div>
</div>
```

### Barra Lateral (BarraLateral.tsx)

La barra lateral es un componente clave para la navegación, implementado en `src/app/dashboard/components/BarraLateral.tsx`. Proporciona acceso a todos los módulos del dashboard y utiliza:

- **Navegación Jerárquica**: Menús y submenús organizados por funcionalidad.
- **Indicadores Visuales**: Resalta la sección activa.
- **Animaciones**: Transiciones suaves al expandir/colapsar secciones.
- **Iconografía**: Iconos descriptivos para cada sección.

La estructura de navegación incluye:

1. **Visión General**: Dashboard principal con resumen de ventas, ventas diarias y notificaciones.
2. **Registro de Ventas**: Gestión de ventas diarias.
3. **Gestión del Menú**: Menú del día, platos favoritos, especiales, combinaciones y programación semanal.
4. **Estadísticas**: Análisis de ventas, rendimiento de menú, platos más vendidos y tendencias.
5. **Configuración**: Ajustes generales, horarios, información del restaurante, usuarios y preferencias.
6. **Ayuda**: Centro de ayuda y soporte.

## Módulos Funcionales

### 1. Visión General

Proporciona una vista rápida del estado del restaurante con KPIs importantes y gráficos de rendimiento.

**Funcionalidades principales**:
- Dashboard con métricas clave
- Resumen de ventas diarias y semanales
- Gráficos de tendencias
- Notificaciones y alertas

### 2. Gestión del Menú

Módulo central para la administración del menú del restaurante, implementado en `src/app/dashboard/carta/`.

**Funcionalidades principales**:
- Creación y edición del menú diario
- Gestión de categorías y productos
- Programación semanal de menús
- Platos favoritos y especiales
- Combinaciones de productos

**Componentes clave**:
- `MenuDiarioRediseno`: Visualización y gestión del menú del día
- `ListaProductosRediseno`: Listado y gestión de productos
- `ListaCategoriasRediseno`: Administración de categorías

**Flujo de datos**:
- Utiliza el hook `useMenuCache` para gestionar el estado del menú
- Implementa caché local para mejorar el rendimiento
- Sincronización con el backend a través de API REST

### 3. Estadísticas y Análisis

Proporciona herramientas de análisis y visualización de datos para la toma de decisiones, implementado en `src/app/dashboard/estadisticas/`.

**Funcionalidades principales**:
- Análisis de ventas por período
- Rendimiento de productos y categorías
- Tendencias y patrones de consumo
- KPIs de negocio

**Componentes clave**:
- `KPIsCards`: Tarjetas de indicadores clave
- `GraficoVentasPeriodo`: Visualización de ventas por período
- `FiltroPeriodo`: Selector de período para análisis

### 4. Configuración del Restaurante

Permite personalizar todos los aspectos del restaurante, implementado en `src/app/dashboard/configuracion/`.

**Funcionalidades principales**:
- Información básica del restaurante
- Configuración de horarios comerciales
- Gestión de categorías y subcategorías
- Preferencias del sistema

### 5. Gestión de Usuarios

Administración de usuarios y permisos, implementado en `src/app/dashboard/usuarios/`.

**Funcionalidades principales**:
- Creación y edición de usuarios
- Asignación de roles y permisos
- Gestión de accesos

### 6. Horario Comercial

Gestión de los horarios de operación del restaurante, implementado en `src/app/dashboard/horario-comercial/`.

**Funcionalidades principales**:
- Configuración de horarios por día
- Gestión de días festivos y excepciones
- Calendario de operaciones

## Integración con Microservicios

El dashboard se comunica con varios microservicios a través de APIs REST, coordinados por un API Gateway implementado con Nginx.

### Estructura de Microservicios:

1. **Menu Service (Puerto 3001)**:
   - Gestión de menús, categorías y productos
   - Endpoints: `/api/menu/*`

2. **Inventario Service (Puerto 3002)**:
   - Control de inventario y stock
   - Endpoints: `/api/inventario/*`

3. **Ventas Service (Puerto 3003)**:
   - Registro y procesamiento de ventas
   - Endpoints: `/api/ventas/*`

4. **Estadísticas Service (Puerto 3004)**:
   - Generación de reportes y análisis
   - Endpoints: `/api/estadisticas/*`

5. **BI Service (Puerto 3005)**:
   - Inteligencia de negocio y análisis avanzado
   - Endpoints: `/api/bi/*`

### Comunicación con Microservicios:

El API Gateway (Nginx) enruta las peticiones a los microservicios correspondientes según la URL:

```
# Ejemplo de configuración de enrutamiento en Nginx
location /api/menu/ {
    rewrite ^/api/menu/(.*) /$1 break;
    proxy_pass http://menu_service;
    # Configuración adicional...
}
```

## Sistema de Estilos

El dashboard utiliza un sistema de estilos consistente basado en TailwindCSS con variables CSS personalizadas.

### Paleta de Colores:

- **Primario**: `#F4821F` (Naranja Spoon)
- **Neutros**: Escala de grises desde `#FAFAFA` hasta `#111827`
- **Estados**: Verde (`#15803D`), Naranja (`#CC6A10`), Rojo (`#B91C1C`), Azul (`#1E40AF`)

### Componentes UI:

El sistema incluye componentes reutilizables como:
- Botones
- Tarjetas
- Inputs
- Modales
- Tablas
- Gráficos
- Notificaciones

### Animaciones:

Implementadas con Framer Motion para proporcionar transiciones suaves y efectos visuales que mejoran la experiencia de usuario.

## Flujo de Datos

### Estado Global:

- **Context API**: Para estado compartido entre componentes
- **SWR**: Para fetching de datos con caché y revalidación

### Caché Local:

El dashboard implementa un sistema de caché local para mejorar el rendimiento:

```jsx
// Ejemplo simplificado del hook useMenuCache
const useMenuCache = () => {
  const [menuData, setMenuData] = useState(initialState);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Cargar datos desde caché o API
  useEffect(() => {
    const cachedData = localStorage.getItem('menuCache');
    if (cachedData) {
      setMenuData(JSON.parse(cachedData));
      setIsLoaded(true);
    } else {
      // Cargar desde API
      fetchMenuData().then(data => {
        setMenuData(data);
        localStorage.setItem('menuCache', JSON.stringify(data));
        setIsLoaded(true);
      });
    }
  }, []);
  
  // Funciones para actualizar el estado
  // ...
  
  return {
    menuData,
    isLoaded,
    // Otras funciones y propiedades
  };
};
```

### Comunicación con Backend:

- **API REST**: Para operaciones CRUD estándar
- **WebSockets**: Para actualizaciones en tiempo real (notificaciones, pedidos)

## Seguridad y Autenticación

### Sistema de Autenticación:

- **JWT (JSON Web Tokens)**: Para autenticación de usuarios
- **Roles y Permisos**: Control de acceso basado en roles
- **Middleware de Autenticación**: Verificación de tokens en cada petición

### Protección de Rutas:

```jsx
// Ejemplo simplificado de protección de rutas
const withPermissions = (Component, requiredPermissions) => {
  return function ProtectedRoute(props) {
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
      return <LoadingSpinner />;
    }
    
    if (!user) {
      return <Redirect to="/login" />;
    }
    
    const hasPermission = requiredPermissions.every(
      permission => user.permissions.includes(permission)
    );
    
    if (!hasPermission) {
      return <Redirect to="/unauthorized" />;
    }
    
    return <Component {...props} />;
  };
};
```

## Monitoreo y Observabilidad

El sistema incluye herramientas de monitoreo y observabilidad para garantizar su correcto funcionamiento:

1. **Prometheus**: Recolección de métricas
2. **Grafana**: Visualización de métricas y dashboards
3. **Node Exporter**: Métricas del sistema
4. **cAdvisor**: Métricas de contenedores
5. **PostgreSQL Exporter**: Métricas de la base de datos
6. **Redis Exporter**: Métricas de Redis

Estas herramientas permiten monitorear:
- Rendimiento de la aplicación
- Uso de recursos
- Tiempos de respuesta
- Errores y excepciones
- Patrones de uso

## Conclusión

El dashboard de Spoon es una aplicación robusta y completa que proporciona todas las herramientas necesarias para la gestión eficiente de un restaurante. Su arquitectura basada en microservicios, combinada con una interfaz de usuario moderna e intuitiva, ofrece una solución escalable y mantenible para las necesidades de negocio.

La estructura modular del código, junto con el uso de componentes reutilizables y un sistema de estilos consistente, facilita el desarrollo y la evolución continua de la plataforma, permitiendo adaptarse a nuevos requisitos y funcionalidades.
