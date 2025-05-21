# Creación de Usuario de Prueba para el Sistema de Caché de Menú

Este documento explica cómo crear y utilizar un usuario de prueba para el sistema de caché de menú en la aplicación Spoon Restaurant.

## ¿Qué es el Usuario de Prueba?

El usuario de prueba es un conjunto predefinido de datos que se cargan en el caché del navegador (localStorage) para simular un estado inicial de la aplicación. Esto incluye:

- Categorías y subcategorías predefinidas
- Productos para el Menú del Día
- Productos Favoritos
- Productos Especiales

Estos datos permiten probar rápidamente la funcionalidad de la aplicación sin necesidad de crear manualmente todos los elementos.

## Cómo Crear un Usuario de Prueba

### Opción 1: Usando npm script

La forma más sencilla de crear un usuario de prueba es ejecutar el siguiente comando:

```bash
npm run create-test-user
```

Este comando ejecutará el script que crea los datos de prueba y los guarda en el localStorage.

### Opción 2: Desde el navegador

También puedes crear un usuario de prueba directamente desde la consola del navegador:

1. Abre la aplicación en el navegador
2. Abre la consola de desarrollador (F12 o Ctrl+Shift+I)
3. Pega y ejecuta el siguiente código:

```javascript
// Importar la función de creación de usuario de prueba
import('/src/utils/create-test-user.js').then(module => {
  const { createTestUser } = module;
  createTestUser();
  console.log('Usuario de prueba creado exitosamente');
});
```

## Datos Incluidos

### Categorías

- **Menú del Día**: Categoría principal para el menú diario
- **Platos Favoritos**: Categoría principal para platos favoritos
- **Platos Especiales**: Categoría principal para platos especiales
- **Subcategorías** (para Menú del Día):
  - Entrada
  - Principio
  - Proteína
  - Acompañamiento
  - Bebida

### Productos

#### Menú del Día
- Sopa de Guineo (Entrada)
- Frijoles (Principio)
- Pechuga a la Plancha (Proteína)
- Arroz Blanco (Acompañamiento)
- Jugo de Mora (Bebida)

#### Platos Favoritos
- Bandeja Paisa
- Ajiaco Santafereño
- Sancocho de Gallina

#### Platos Especiales
- Paella Valenciana
- Lomo al Trapo
- Cazuela de Mariscos

## Cómo Usar los Datos de Prueba

Una vez creado el usuario de prueba, puedes acceder a la aplicación normalmente. Los datos estarán disponibles en el caché y se cargarán automáticamente cuando accedas a la página de creación de menú.

Para verificar que los datos se han cargado correctamente:

1. Abre la aplicación y navega a la página de creación de menú
2. Deberías ver las categorías y productos predefinidos
3. Puedes cambiar entre los diferentes submenús (Menú del Día, Platos Favoritos, Platos Especiales) para ver los productos correspondientes

## Limpieza de Datos

Si deseas eliminar los datos de prueba, puedes hacerlo de las siguientes maneras:

### Desde la aplicación

Utiliza la función `clearCache` del hook `useMenuCache`:

```javascript
import { useMenuCache } from '@/hooks/useMenuCache';

function MiComponente() {
  const { clearCache } = useMenuCache();
  
  const handleLimpiarCache = () => {
    clearCache();
    alert('Caché limpiado correctamente');
  };
  
  return (
    <button onClick={handleLimpiarCache}>Limpiar Caché</button>
  );
}
```

### Desde la consola del navegador

```javascript
localStorage.removeItem('menu_crear_menu');
console.log('Caché limpiado correctamente');
```

## Personalización

Si deseas modificar los datos de prueba, puedes editar el archivo `src/utils/create-test-user.ts` para agregar, modificar o eliminar categorías y productos según tus necesidades.

## Notas Importantes

- Los datos de prueba se almacenan en el localStorage del navegador, por lo que son específicos del navegador y dispositivo que estés utilizando.
- El caché tiene un tiempo de expiración de 30 minutos por defecto. Después de este tiempo, los datos se considerarán expirados y se eliminarán automáticamente.
- Si realizas cambios en la aplicación que afecten a la estructura de datos del caché, es posible que necesites actualizar el script de creación de usuario de prueba.
