# Configuración de Base de Datos PostgreSQL para Gestión de Menú

Este documento explica cómo configurar las tablas de PostgreSQL necesarias para el módulo de Gestión de Menú y cómo integrar los componentes de React con la base de datos.

## 1. Creación de las Tablas en PostgreSQL

### Opción 1: Ejecución del Script SQL con psql

El método más directo es utilizar la herramienta `psql` que viene con PostgreSQL:

1. Abre una terminal en la carpeta raíz del proyecto (`spoon-restaurant`)
2. Ejecuta el script batch incluido:
   ```
   cd scripts
   ejecutar_tablas_con_psql.bat
   ```
3. Introduce la contraseña cuando te la solicite

### Opción 2: Ejecución desde el código

La aplicación está configurada para inicializar automáticamente las tablas necesarias durante el arranque:

1. Asegúrate de que los datos de conexión en `src/config/database.ts` son correctos
2. Inicia la aplicación con:
   ```
   npm run dev
   ```
3. El sistema invocará automáticamente `initializeDatabase()` en `src/config/db-init.ts`, lo que creará las tablas si no existen

También puedes ejecutar manualmente el script de inicialización:

```
node src/config/db-init.ts
```

## 2. Estructura de las Tablas

El sistema utiliza las siguientes tablas principales:

- `categorias`: Almacena las categorías de productos (Entradas, Principios, etc.)
- `productos`: Tabla principal para las recetas/productos del menú
- `ingredientes`: Catálogo de ingredientes disponibles
- `producto_ingredientes`: Relación entre productos y sus ingredientes
- `menu_dia`: Gestiona los menús por fecha
- `menu_productos`: Productos incluidos en cada menú

Para ver el esquema completo, consulta `scripts/crear_tablas_menu.sql`.

## 3. Conexión de los Componentes React a PostgreSQL

### Uso del Servicio de Recetas

Para utilizar el servicio de recetas conectado a PostgreSQL, modifica el componente `RecetasSystem.tsx` de la siguiente manera:

```tsx
// Importar el servicio
import { RecetasSystemService, RecetaUI, IngredienteUI } from './RecetasSystemService';

// En el componente RecetasSystem:
export default function RecetasSystem() {
  // ... código existente ...

  // Modificar la carga de datos
  useEffect(() => {
    async function cargarDatos() {
      setCargando(true);
      try {
        // Obtener los datos desde PostgreSQL (restaurante ID 1 por defecto)
        const recetasDB = await RecetasSystemService.obtenerRecetas(1);
        const ingredientesDB = await RecetasSystemService.obtenerIngredientes(1);
        
        setRecetas(recetasDB);
        setRecetasFiltradas(recetasDB);
        setIngredientes(ingredientesDB);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        // En caso de error, cargar datos de ejemplo como fallback
        setRecetas(recetasEjemplo);
        setRecetasFiltradas(recetasEjemplo);
        setIngredientes(ingredientesEjemplo);
      } finally {
        setCargando(false);
      }
    }
    
    cargarDatos();
  }, []);

  // Modificar las funciones de guardar cambios
  const guardarCambiosDetalles = async (recetaActualizada: RecetaUI) => {
    try {
      await RecetasSystemService.guardarReceta(recetaActualizada, 1);
      
      // Actualizar el estado local
      setRecetas(prev => 
        prev.map(r => r.id === recetaActualizada.id ? recetaActualizada : r)
      );
      cerrarDetalles();
    } catch (error) {
      console.error('Error al guardar cambios en la receta:', error);
      // Mostrar mensaje de error
      alert('Error al guardar los cambios. Inténtelo de nuevo.');
    }
  };

  // ... resto del código ...
}
```

### API de Ingredientes

Para acceder a los ingredientes, se ha implementado un endpoint en `/api/ingredientes`:

- `GET /api/ingredientes?restauranteId=1` - Obtiene los ingredientes del restaurante
- `POST /api/ingredientes` - Crea un nuevo ingrediente

## 4. Carga de Datos Iniciales

Para cargar datos iniciales (categorías, algunos productos básicos), puedes ejecutar:

```
NODE_ENV=development node src/config/db-init.ts
```

Esto ejecutará la función `seedTestData()` que insertará las categorías básicas y, opcionalmente, otros datos de prueba.

## 5. Migración de Datos Existentes

Si tienes datos existentes (por ejemplo, en Firebase), puedes usar el servicio de migración:

```javascript
await MenuService.migrarDatosExistentes(restauranteId);
```

Esta función deberá implementarse específicamente para tu origen de datos.

## 6. Solución de Problemas

Si encuentras errores de permisos como:

```
ERROR: permiso denegado a la tabla productos
```

Asegúrate de que:

1. El usuario de PostgreSQL tiene permisos suficientes
2. La base de datos 'spoon' existe
3. Las credenciales en `src/config/database.ts` son correctas

Puedes ejecutar estos comandos en PostgreSQL para otorgar permisos:

```sql
CREATE DATABASE spoon;
CREATE USER spoon_admin WITH PASSWORD 'tu_contraseña';
GRANT ALL PRIVILEGES ON DATABASE spoon TO spoon_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO spoon_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO spoon_admin;
```
