# Sistema de Caché para el Menú

Este sistema proporciona una forma eficiente de almacenar y recuperar datos del menú en el navegador del cliente, mejorando la experiencia del usuario al reducir los tiempos de carga y permitiendo la persistencia de datos entre navegaciones.

## Componentes Principales

### 1. `menuCache.utils.ts`

Contiene las utilidades básicas para interactuar con el caché del menú:

- **Interfaces**: Define la estructura de datos para categorías, productos y el menú completo.
- **Funciones de caché**: Proporciona métodos para guardar, recuperar y limpiar datos del caché.

### 2. `useMenuCache.ts`

Hook personalizado que facilita el uso del caché en componentes React:

- **Estado local**: Mantiene los datos del menú en el estado de React.
- **Sincronización automática**: Guarda automáticamente los cambios en el caché.
- **Funciones de utilidad**: Proporciona métodos para actualizar partes específicas del menú.

### 3. `MenuDiarioContainer.tsx`

Componente de ejemplo que muestra cómo integrar el caché en una interfaz de usuario:

- **Conversión de tipos**: Adapta los tipos de datos entre el sistema de caché y los componentes UI.
- **Notificaciones**: Informa al usuario cuando se cargan datos desde el caché.
- **Manejo de eventos**: Conecta las acciones del usuario con las actualizaciones del caché.
- **Sistema de pestañas**: Permite cambiar entre diferentes submenús (Menú del Día, Platos Favoritos, Platos Especiales).

## Estructura de Datos

```typescript
interface MenuCrearMenuData {
  categorias: Categoria[];
  productosSeleccionados: Producto[];
  productosMenu: Producto[];
  productosFavoritos: Producto[];
  productosEspeciales: Producto[];
  categoriaSeleccionada: string | null;
  subcategoriaSeleccionada: string | null;
  submenuActivo: 'menu-dia' | 'favoritos' | 'especiales';
}
```

## Submenús Disponibles

El sistema de caché ahora soporta tres submenús diferentes:

1. **Menú del Día**: Productos que forman parte del menú diario regular.
2. **Platos Favoritos**: Productos marcados como favoritos para acceso rápido.
3. **Platos Especiales**: Productos destacados o de temporada.

Cada submenú tiene su propio conjunto de productos y funciones específicas para agregar y eliminar elementos.

## Cómo Usar el Sistema de Caché

### 1. Importar el Hook

```typescript
import { useMenuCache } from '@/hooks/useMenuCache';
```

### 2. Usar el Hook en tu Componente

```typescript
const {
  menuData,
  isLoaded,
  updateCategorias,
  updateProductosSeleccionados,
  updateProductosMenu,
  updateProductosFavoritos,
  updateProductosEspeciales,
  addProductoToMenu,
  addProductoToFavoritos,
  addProductoToEspeciales,
  removeProductoFromMenu,
  removeProductoFromFavoritos,
  removeProductoFromEspeciales,
  updateSeleccion,
  updateSubmenuActivo,
  getProductosSubmenuActivo,
  clearCache
} = useMenuCache();
```

### 3. Acceder a los Datos del Menú

```typescript
// Acceder a las categorías
const categorias = menuData.categorias;

// Acceder a los productos seleccionados
const productosSeleccionados = menuData.productosSeleccionados;

// Acceder a los productos del menú del día
const productosMenu = menuData.productosMenu;

// Acceder a los productos favoritos
const productosFavoritos = menuData.productosFavoritos;

// Acceder a los productos especiales
const productosEspeciales = menuData.productosEspeciales;

// Obtener los productos del submenú activo
const productosActivos = getProductosSubmenuActivo();
```

### 4. Actualizar los Datos del Menú

```typescript
// Actualizar categorías
updateCategorias(nuevasCategorias);

// Agregar un producto al menú del día
addProductoToMenu(producto);

// Agregar un producto a favoritos
addProductoToFavoritos(producto);

// Agregar un producto a especiales
addProductoToEspeciales(producto);

// Eliminar un producto del menú del día
removeProductoFromMenu(productoId);

// Eliminar un producto de favoritos
removeProductoFromFavoritos(productoId);

// Eliminar un producto de especiales
removeProductoFromEspeciales(productoId);

// Actualizar la selección de categoría/subcategoría
updateSeleccion(categoriaId, subcategoriaId);

// Cambiar el submenú activo
updateSubmenuActivo('menu-dia' | 'favoritos' | 'especiales');
```

### 5. Limpiar el Caché

```typescript
// Limpiar todo el caché
clearCache();
```

## Ejemplo de Integración con Submenús

```tsx
import { useMenuCache } from '@/hooks/useMenuCache';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/Tabs';
import { toast } from 'react-hot-toast';

function MenuComponent() {
  const { 
    menuData, 
    addProductoToMenu, 
    addProductoToFavoritos, 
    addProductoToEspeciales,
    updateSubmenuActivo 
  } = useMenuCache();
  
  const handleAgregarProducto = (producto, tipo) => {
    switch (tipo) {
      case 'menu-dia':
        addProductoToMenu(producto);
        toast.success(`${producto.nombre} agregado al menú del día`);
        break;
      case 'favoritos':
        addProductoToFavoritos(producto);
        toast.success(`${producto.nombre} agregado a favoritos`);
        break;
      case 'especiales':
        addProductoToEspeciales(producto);
        toast.success(`${producto.nombre} agregado a especiales`);
        break;
    }
  };
  
  return (
    <Tabs 
      value={menuData.submenuActivo} 
      onValueChange={(value) => updateSubmenuActivo(value)}
    >
      <TabsList>
        <TabsTrigger value="menu-dia">Menú del Día</TabsTrigger>
        <TabsTrigger value="favoritos">Platos Favoritos</TabsTrigger>
        <TabsTrigger value="especiales">Platos Especiales</TabsTrigger>
      </TabsList>
      
      <TabsContent value="menu-dia">
        {/* Contenido del menú del día */}
      </TabsContent>
      
      <TabsContent value="favoritos">
        {/* Contenido de platos favoritos */}
      </TabsContent>
      
      <TabsContent value="especiales">
        {/* Contenido de platos especiales */}
      </TabsContent>
    </Tabs>
  );
}
```

## Consideraciones Técnicas

1. **Tiempo de Expiración**: El caché expira después de 30 minutos por defecto. Puedes modificar este valor en `menuCache.utils.ts`.

2. **Almacenamiento**: Los datos se guardan en el localStorage del navegador, lo que significa que persisten incluso si el usuario cierra la pestaña o el navegador.

3. **Serialización**: Las fechas se serializan automáticamente al guardar y se deserializan al recuperar los datos.

4. **Tamaño del Caché**: Ten en cuenta que localStorage tiene un límite de aproximadamente 5MB. Si almacenas grandes cantidades de datos, considera implementar una estrategia de limpieza o compresión.

5. **Compatibilidad**: Este sistema funciona en todos los navegadores modernos que soportan localStorage.

6. **Submenús**: El sistema ahora soporta múltiples submenús, cada uno con su propio conjunto de productos y funciones específicas.

## Depuración

El sistema incluye mensajes de registro detallados que puedes ver en la consola del navegador. Estos mensajes te ayudarán a entender el flujo de datos y a identificar posibles problemas.

```javascript
// Ejemplo de mensajes de registro
console.log('Guardando en caché del menú:', data);
console.log('Datos guardados en caché del menú correctamente');
console.log('Datos encontrados en caché del menú, timestamp:', new Date(timestamp));
```

## Extensión del Sistema

Si necesitas extender el sistema para almacenar datos adicionales:

1. Actualiza las interfaces en `menuCache.utils.ts` para incluir los nuevos campos.
2. Agrega nuevas funciones de utilidad en `useMenuCache.ts` para manejar los nuevos datos.
3. Actualiza los componentes que utilizan el caché para trabajar con los nuevos campos.
4. Si necesitas agregar más submenús, actualiza el tipo `submenuActivo` y agrega las funciones correspondientes.
