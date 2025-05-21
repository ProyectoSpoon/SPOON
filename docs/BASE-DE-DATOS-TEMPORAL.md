# Estructura de Datos Temporal para el Gestor de Menú

Este documento describe la estructura de datos temporal implementada para el Gestor de Menú utilizando archivos JSON. Esta implementación permite el desarrollo y pruebas del sistema sin depender de una base de datos relacional o NoSQL.

## Entidades de Datos Clave

Basado en el análisis del sistema, se han identificado las siguientes entidades principales:

1. **Categoría** - Clasificación principal de productos (Entradas, Principios, Proteínas, etc.)
2. **Subcategoría** - Clasificación secundaria dentro de una categoría (Sopas, Ensaladas, Arroces, etc.)
3. **Producto** - Ítems individuales que pueden ser parte de un menú (Sopa de Verduras, Arroz Blanco, etc.)
4. **Menú** - Agrupación de productos para un día específico
5. **Menú-Producto** - Relación entre menús y productos
6. **Combinación** - Conjunto predefinido de productos que forman una oferta completa
7. **Combinación-Producto** - Relación entre combinaciones y productos
8. **Programación** - Planificación de combinaciones para fechas específicas

## Estructura de Datos por Entidad

### 1. Categoría

**Archivo:** `categorias.json`

**Campos:**
- `id_categoria` (Texto): Identificador único de la categoría (ej. "CAT_001")
- `nombre` (Texto): Nombre de la categoría
- `orden` (Número): Posición de ordenamiento para visualización
- `estado` (Booleano): Indica si la categoría está activa
- `fecha_creacion` (Fecha): Fecha de creación del registro
- `fecha_actualizacion` (Fecha): Fecha de última actualización

**Ejemplo JSON:**
```json
{
  "id_categoria": "CAT_001",
  "nombre": "Entradas",
  "orden": 1,
  "estado": true,
  "fecha_creacion": "2025-01-01T00:00:00.000Z",
  "fecha_actualizacion": "2025-01-01T00:00:00.000Z"
}
```

**Estructura CSV:**
```
id_categoria,nombre,orden,estado,fecha_creacion,fecha_actualizacion
```

### 2. Subcategoría

**Archivo:** `subcategorias.json`

**Campos:**
- `id_subcategoria` (Texto): Identificador único de la subcategoría (ej. "SUBCAT_001")
- `id_categoria_padre` (Texto): ID de la categoría a la que pertenece
- `nombre` (Texto): Nombre de la subcategoría
- `orden` (Número): Posición de ordenamiento para visualización
- `estado` (Booleano): Indica si la subcategoría está activa
- `fecha_creacion` (Fecha): Fecha de creación del registro
- `fecha_actualizacion` (Fecha): Fecha de última actualización

**Ejemplo JSON:**
```json
{
  "id_subcategoria": "SUBCAT_001",
  "id_categoria_padre": "CAT_001",
  "nombre": "Sopas",
  "orden": 1,
  "estado": true,
  "fecha_creacion": "2025-01-01T00:00:00.000Z",
  "fecha_actualizacion": "2025-01-01T00:00:00.000Z"
}
```

**Estructura CSV:**
```
id_subcategoria,id_categoria_padre,nombre,orden,estado,fecha_creacion,fecha_actualizacion
```

### 3. Producto

**Archivo:** `productos.json`

**Campos:**
- `id_producto` (Texto): Identificador único del producto (ej. "PROD_001")
- `nombre` (Texto): Nombre del producto
- `descripcion` (Texto): Descripción detallada del producto
- `descripcion_corta` (Texto): Descripción resumida para visualización rápida
- `id_categoria` (Texto): ID de la categoría a la que pertenece
- `id_subcategoria` (Texto): ID de la subcategoría a la que pertenece
- `imagen_url` (Texto): URL de la imagen principal del producto
- `imagen_miniatura_url` (Texto): URL de la imagen en miniatura
- `estado_disponible` (Booleano): Indica si el producto está disponible
- `stock_actual` (Número): Cantidad disponible en inventario
- `stock_minimo` (Número): Cantidad mínima requerida en inventario
- `fecha_creacion` (Fecha): Fecha de creación del registro
- `fecha_actualizacion` (Fecha): Fecha de última actualización

**Ejemplo JSON:**
```json
{
  "id_producto": "PROD_001",
  "nombre": "Sopa de Verduras",
  "descripcion": "Deliciosa sopa de verduras frescas con un toque de hierbas aromáticas",
  "descripcion_corta": "Sopa de verduras frescas",
  "id_categoria": "CAT_001",
  "id_subcategoria": "SUBCAT_001",
  "imagen_url": "/imagenes/productos/sopa_verduras.jpg",
  "imagen_miniatura_url": "/imagenes/productos/miniaturas/sopa_verduras.jpg",
  "estado_disponible": true,
  "stock_actual": 50,
  "stock_minimo": 10,
  "fecha_creacion": "2025-01-01T00:00:00.000Z",
  "fecha_actualizacion": "2025-01-01T00:00:00.000Z"
}
```

**Estructura CSV:**
```
id_producto,nombre,descripcion,descripcion_corta,id_categoria,id_subcategoria,imagen_url,imagen_miniatura_url,estado_disponible,stock_actual,stock_minimo,fecha_creacion,fecha_actualizacion
```

### 4. Menú

**Archivo:** `menus.json`

**Campos:**
- `id_menu` (Texto): Identificador único del menú (ej. "MENU_001")
- `nombre` (Texto): Nombre descriptivo del menú
- `descripcion` (Texto): Descripción detallada del menú
- `fecha` (Fecha): Fecha para la que está programado el menú
- `estado` (Texto): Estado del menú (activo, inactivo, etc.)
- `fecha_creacion` (Fecha): Fecha de creación del registro
- `fecha_actualizacion` (Fecha): Fecha de última actualización

**Ejemplo JSON:**
```json
{
  "id_menu": "MENU_001",
  "nombre": "Menú del Día - Lunes",
  "descripcion": "Menú especial para el lunes",
  "fecha": "2025-01-06T00:00:00.000Z",
  "estado": "activo",
  "fecha_creacion": "2025-01-01T00:00:00.000Z",
  "fecha_actualizacion": "2025-01-01T00:00:00.000Z"
}
```

**Estructura CSV:**
```
id_menu,nombre,descripcion,fecha,estado,fecha_creacion,fecha_actualizacion
```

### 5. Menú-Producto (Relación)

**Archivo:** `menu_productos.json`

**Campos:**
- `id_menu_producto` (Texto): Identificador único de la relación (ej. "MP_001")
- `id_menu` (Texto): ID del menú
- `id_producto` (Texto): ID del producto
- `cantidad` (Número): Cantidad del producto en el menú
- `fecha_creacion` (Fecha): Fecha de creación del registro
- `fecha_actualizacion` (Fecha): Fecha de última actualización

**Ejemplo JSON:**
```json
{
  "id_menu_producto": "MP_001",
  "id_menu": "MENU_001",
  "id_producto": "PROD_001",
  "cantidad": 1,
  "fecha_creacion": "2025-01-01T00:00:00.000Z",
  "fecha_actualizacion": "2025-01-01T00:00:00.000Z"
}
```

**Estructura CSV:**
```
id_menu_producto,id_menu,id_producto,cantidad,fecha_creacion,fecha_actualizacion
```

### 6. Combinación

**Archivo:** `combinaciones.json`

**Campos:**
- `id_combinacion` (Texto): Identificador único de la combinación (ej. "COMB_001")
- `nombre` (Texto): Nombre descriptivo de la combinación
- `es_favorito` (Booleano): Indica si es una combinación favorita
- `es_especial` (Booleano): Indica si es una combinación especial
- `fecha_creacion` (Fecha): Fecha de creación del registro
- `fecha_actualizacion` (Fecha): Fecha de última actualización

**Ejemplo JSON:**
```json
{
  "id_combinacion": "COMB_001",
  "nombre": "Combinación Clásica 1",
  "es_favorito": true,
  "es_especial": false,
  "fecha_creacion": "2025-01-01T00:00:00.000Z",
  "fecha_actualizacion": "2025-01-01T00:00:00.000Z"
}
```

**Estructura CSV:**
```
id_combinacion,nombre,es_favorito,es_especial,fecha_creacion,fecha_actualizacion
```

### 7. Combinación-Producto (Relación)

**Archivo:** `combinacion_productos.json`

**Campos:**
- `id_combinacion_producto` (Texto): Identificador único de la relación (ej. "CP_001")
- `id_combinacion` (Texto): ID de la combinación
- `id_producto` (Texto): ID del producto
- `tipo_categoria` (Texto): Tipo de categoría dentro de la combinación (entrada, principio, proteina, etc.)
- `fecha_creacion` (Fecha): Fecha de creación del registro
- `fecha_actualizacion` (Fecha): Fecha de última actualización

**Ejemplo JSON:**
```json
{
  "id_combinacion_producto": "CP_001",
  "id_combinacion": "COMB_001",
  "id_producto": "PROD_001",
  "tipo_categoria": "entrada",
  "fecha_creacion": "2025-01-01T00:00:00.000Z",
  "fecha_actualizacion": "2025-01-01T00:00:00.000Z"
}
```

**Estructura CSV:**
```
id_combinacion_producto,id_combinacion,id_producto,tipo_categoria,fecha_creacion,fecha_actualizacion
```

### 8. Programación

**Archivo:** `programaciones.json`

**Campos:**
- `id_programacion` (Texto): Identificador único de la programación (ej. "PROG_001")
- `id_combinacion` (Texto): ID de la combinación programada
- `fecha_programada` (Fecha): Fecha para la que está programada la combinación
- `cantidad` (Número): Cantidad programada
- `estado` (Texto): Estado de la programación (programado, completado, etc.)
- `fecha_creacion` (Fecha): Fecha de creación del registro
- `fecha_actualizacion` (Fecha): Fecha de última actualización

**Ejemplo JSON:**
```json
{
  "id_programacion": "PROG_001",
  "id_combinacion": "COMB_001",
  "fecha_programada": "2025-01-06T00:00:00.000Z",
  "cantidad": 20,
  "estado": "programado",
  "fecha_creacion": "2025-01-01T00:00:00.000Z",
  "fecha_actualizacion": "2025-01-01T00:00:00.000Z"
}
```

**Estructura CSV:**
```
id_programacion,id_combinacion,fecha_programada,cantidad,estado,fecha_creacion,fecha_actualizacion
```

## Manejo de Relaciones entre Entidades

### Categorías y Subcategorías

La relación jerárquica entre categorías y subcategorías se maneja mediante el campo `id_categoria_padre` en la entidad Subcategoría, que referencia al `id_categoria` de la categoría padre. Esto permite una estructura de árbol simple de dos niveles.

**Ejemplo de relación:**
- Categoría "Entradas" (CAT_001)
  - Subcategoría "Sopas" (SUBCAT_001) con id_categoria_padre = "CAT_001"
  - Subcategoría "Ensaladas" (SUBCAT_002) con id_categoria_padre = "CAT_001"

### Categorías/Subcategorías y Productos

Los productos están vinculados tanto a su categoría principal como a su subcategoría mediante los campos `id_categoria` e `id_subcategoria` respectivamente. Esto permite filtrar productos por categoría o subcategoría.

**Ejemplo de relación:**
- Producto "Sopa de Verduras" (PROD_001)
  - Pertenece a Categoría "Entradas" (id_categoria = "CAT_001")
  - Pertenece a Subcategoría "Sopas" (id_subcategoria = "SUBCAT_001")

### Productos en el "Menú del Día"

La relación entre menús y productos se maneja mediante la entidad de unión `menu_productos.json`, que contiene referencias a ambas entidades. Esto permite que un menú contenga múltiples productos y que un producto pueda estar en múltiples menús.

**Ejemplo de relación:**
- Menú "Menú del Día - Lunes" (MENU_001)
  - Contiene Producto "Sopa de Verduras" (PROD_001) a través de la relación (MP_001)
  - Contiene Producto "Arroz Blanco" (PROD_004) a través de la relación (MP_002)

### Productos y sus Imágenes/Stock

La información de imágenes y stock está directamente integrada en la entidad Producto mediante los campos `imagen_url`, `imagen_miniatura_url`, `stock_actual` y `stock_minimo`. Esto simplifica el acceso a esta información sin necesidad de relaciones adicionales.

### Generación de Combinaciones

Las combinaciones de menú se manejan mediante dos entidades:

1. **Combinación** (`combinaciones.json`): Define la combinación como entidad principal con sus atributos generales.
2. **Combinación-Producto** (`combinacion_productos.json`): Establece qué productos específicos forman parte de cada combinación y qué rol tienen dentro de ella (entrada, principio, proteína, etc.) mediante el campo `tipo_categoria`.

**Ejemplo de relación:**
- Combinación "Combinación Clásica 1" (COMB_001)
  - Incluye Producto "Sopa de Verduras" (PROD_001) como "entrada" a través de la relación (CP_001)
  - Incluye Producto "Arroz Blanco" (PROD_004) como "principio" a través de la relación (CP_002)
  - Incluye Producto "Lomo de Res" (PROD_007) como "proteina" a través de la relación (CP_003)

### Programación de Combinaciones

La programación de combinaciones para fechas específicas se maneja mediante la entidad `programaciones.json`, que vincula una combinación con una fecha y cantidad específicas.

**Ejemplo de relación:**
- Combinación "Combinación Clásica 1" (COMB_001)
  - Programada para el 6 de enero de 2025 con cantidad 20 a través de la programación (PROG_001)
  - Programada para el 7 de enero de 2025 con cantidad 15 a través de la programación (PROG_002)

## Campos Necesarios para Operaciones del Frontend

### Carga de Lista de Categorías

Para mostrar la lista de categorías, el frontend necesita:
- `id_categoria`
- `nombre`
- `orden` (para ordenar la visualización)
- `estado` (para filtrar categorías inactivas)

### Visualización de Productos por Categoría

Al seleccionar una categoría, para mostrar sus productos se necesitan:
- `id_producto`
- `nombre`
- `descripcion_corta`
- `imagen_miniatura_url`
- `estado_disponible`
- `stock_actual` (para verificar disponibilidad)

### Visualización del Menú del Día en Construcción

Para mostrar el menú del día en construcción, se necesita:
- Del menú: `id_menu`, `nombre`, `fecha`
- De cada producto en el menú: `id_producto`, `nombre`, `descripcion_corta`, `imagen_miniatura_url`, `cantidad`

### Visualización de Combinaciones Generadas

Para la página de combinaciones generadas, se necesita:
- De la combinación: `id_combinacion`, `nombre`, `es_favorito`, `es_especial`
- De cada producto en la combinación: `id_producto`, `nombre`, `imagen_miniatura_url`, `tipo_categoria`
- De las programaciones: `fecha_programada`, `cantidad`, `estado`

## Consideraciones de Implementación

1. **Identificadores Únicos**: Todos los IDs siguen un formato consistente con un prefijo que indica el tipo de entidad (CAT_, PROD_, etc.) seguido de un número secuencial o timestamp.

2. **Fechas**: Todas las fechas se almacenan en formato ISO 8601 (YYYY-MM-DDTHH:MM:SS.sssZ) para garantizar compatibilidad.

3. **Relaciones**: Las relaciones se manejan mediante archivos de unión que contienen referencias a los IDs de las entidades relacionadas, simulando el comportamiento de tablas de unión en bases de datos relacionales.

4. **Carga de Datos**: El sistema utiliza un servicio centralizado (`json-data.service.ts`) para cargar los datos desde los archivos JSON, lo que facilita la transición futura a una base de datos real.

5. **Simulación de Operaciones**: Las operaciones de escritura (crear, actualizar, eliminar) se simulan en memoria y no modifican realmente los archivos JSON, pero mantienen la coherencia durante la sesión del usuario.
