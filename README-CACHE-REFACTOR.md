# Refactorización del Sistema de Caché

Este documento describe los cambios realizados para resolver los problemas de caché y los bucles infinitos en la aplicación.

## Cambios Realizados

### 1. Creación de `staticMenuData.ts`

Se ha creado un nuevo módulo en `src/data/staticMenuData.ts` que:
- Importa directamente los archivos JSON de categorías, subcategorías y productos
- Transforma los datos al formato requerido por la aplicación
- Exporta `todasLasCategoriasBase` y `todosLosProductosBase` para uso en toda la aplicación

Este enfoque garantiza que los datos base estén siempre disponibles sin depender del caché.

### 2. Actualización de `useMenuCache.ts`

Se ha modificado el hook para:
- Usar los datos base importados directamente desde `staticMenuData.ts`
- Memoizar `getCacheRemainingTime` con `useCallback` para evitar bucles infinitos
- Solo guardar en caché los datos de sesión del usuario (productosMenu, favoritos, etc.)
- Implementar verificaciones robustas para asegurar que todos los arrays sean válidos

### 3. Simplificación de `init-cache.ts`

Se ha simplificado este archivo para:
- Eliminar la carga redundante de datos base (categorías, subcategorías, productos)
- Enfocarse solo en cargar datos de sesión (menú del día, favoritos, especiales)
- Mejorar la detección y manejo de respuestas de API no válidas
- Asegurar que siempre se devuelvan arrays válidos

### 4. Corrección de `menu-dia/page.tsx`

Se ha actualizado este componente para:
- Usar correctamente la versión memoizada de `getCacheRemainingTime`
- Incluir las dependencias correctas en los useEffect para evitar bucles infinitos
- Añadir verificaciones adicionales para prevenir errores cuando los datos no están cargados

### 5. Herramientas de Depuración

Se han creado dos herramientas para ayudar a depurar y gestionar el caché:

- **clear-cache.html**: Permite limpiar el caché de forma selectiva o completa
- **debug-cache.html**: Permite inspeccionar y analizar el estado del caché, validar su estructura y reparar problemas

## Beneficios de los Cambios

1. **Rendimiento mejorado**: Los datos base se cargan una sola vez al importar el módulo
2. **Mayor robustez**: Verificaciones exhaustivas para prevenir errores con datos no válidos
3. **Caché más eficiente**: Solo se almacenan en localStorage los datos de sesión del usuario
4. **Eliminación de bucles infinitos**: Uso correcto de useCallback y dependencias en useEffect

## Cómo Usar las Nuevas Herramientas

### Herramienta de Limpieza de Caché

Accede a `http://localhost:3000/clear-cache.html` para:
- Ver las claves actuales en localStorage
- Limpiar solo el caché del menú
- Limpiar todo el localStorage

### Herramienta de Depuración de Caché

Accede a `http://localhost:3000/debug-cache.html` para:
- Ver un resumen del estado del caché
- Inspeccionar los datos almacenados en el caché
- Validar la estructura del caché
- Reparar arrays inválidos en el caché

## Flujo de Datos Actualizado

1. **Datos Base (Estáticos)**:
   - Categorías, subcategorías y productos base se importan directamente desde los archivos JSON
   - Se transforman una sola vez al cargar la aplicación
   - No se almacenan en localStorage

2. **Datos de Sesión (Dinámicos)**:
   - Productos del menú del día, favoritos y especiales se cargan desde la API o archivos JSON
   - Se almacenan en localStorage bajo la clave `menu_crear_menu`
   - Se actualizan cuando el usuario interactúa con la aplicación

## Cómo Probar los Cambios

1. Limpia el localStorage usando la herramienta `clear-cache.html`
2. Recarga la aplicación y verifica que los datos se carguen correctamente
3. Usa la herramienta `debug-cache.html` para verificar la estructura del caché
4. Prueba las funcionalidades de agregar/quitar productos del menú
5. Verifica que no aparezcan errores en la consola relacionados con "Maximum update depth exceeded"

## Solución de Problemas

Si encuentras algún problema después de la refactorización:

1. Verifica la consola del navegador para ver mensajes de error específicos
2. Usa la herramienta `debug-cache.html` para inspeccionar el estado del caché
3. Si el caché parece corrupto, usa el botón "Reparar Arrays" en `debug-cache.html` o limpia el caché con `clear-cache.html`
4. Si persisten los problemas, reinicia el servidor de desarrollo

## Notas Adicionales

- El caché sigue expirando después de 30 minutos (configurable en `menuCache.utils.ts`)
- Los datos base (categorías, subcategorías, productos) ahora siempre están disponibles, incluso si el caché expira
- La aplicación debería ser más estable y tener un mejor rendimiento con estos cambios
