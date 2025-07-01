# Diseño de la Base de Datos para SPOON (PostgreSQL)

Este documento detalla el diseño lógico y físico de la base de datos relacional para la aplicación SPOON, utilizando PostgreSQL como motor. El diseño se basa en el análisis de las interfaces de datos del frontend y está normalizado para garantizar la integridad, eficiencia y escalabilidad.

## Análisis General del Modelo

El modelo de datos se centra en la gestión de **productos** y sus **categorías**. Las entidades principales identificadas son:

1.  **Categorías (`categorias`)**: Para organizar los productos jerárquicamente.
2.  **Productos (`productos`)**: La entidad central que representa los ítems del menú.
3.  **Historial de Precios (`precio_historial`)**: Para registrar los cambios de precio de los productos a lo largo del tempo.
4.  **Versiones de Producto (`producto_versiones`)**: Para mantener un registro de las modificaciones de los productos.

La interfaz `MenuCrearMenuData` se considera un modelo de vista o de estado de la aplicación, no una entidad persistente, por lo que no se traduce en una tabla.

## Normalización y Decisiones de Diseño

*   **Normalización a 3NF**: Las entidades propuestas cumplen con la Tercera Forma Normal (3NF), asegurando que los atributos dependan de la clave primaria completa y no existan dependencias transitivas.
*   **Manejo de `ProductoStock` y `ProductoMetadata`**: Aunque podrían ser tablas separadas, sus atributos son intrínsecamente parte de un producto. Mantenerlos en la tabla `productos` simplifica las consultas comunes y reduce la necesidad de `JOIN`s. Se utilizan prefijos (`stock_`, `metadata_`) para mantener la claridad.
*   **Manejo de `priceHistory` y `versions`**: Estos campos, al ser arrays de datos con significado histórico, se normalizan en tablas separadas (`precio_historial` y `producto_versiones`) para una gestión más granular y eficiente.
*   **Tipos de Datos**: Se utilizan tipos de datos específicos de PostgreSQL como `UUID` para identificadores, `VARCHAR` y `TEXT` para cadenas, `NUMERIC` para precios y `TIMESTAMP WITH TIME ZONE` para fechas.
*   **Restricciones `CHECK`**: Se usan para validar los valores de campos que funcionan como enumeraciones (`tipo`, `status`, `stock_status`).

---

## Estructura Detallada de la Base de Datos

A continuación, se presenta la descripción de cada tabla, sus atributos, relaciones y las sentencias SQL para su creación.

### 1. Entidad: `categorias`

*   **Descripción**: Almacena las categorías y subcategorías de los productos. Permite una estructura jerárquica.
*   **Atributos**:
    *   `categoria_id`: Identificador único de la categoría.
    *   `nombre`: Nombre de la categoría (ej. "Entradas", "Bebidas").
    *   `tipo`: Indica si es una categoría `principal` o una `subcategoria`.
    *   `parent_id`: Referencia a la `categoria_id` de su categoría padre.
*   **Relaciones**:
    *   **Clave Primaria**: `categoria_id`
    *   **Clave Foránea**: `parent_id` referencia a `categorias.categoria_id` (relación recursiva).
*   **Reglas de Integridad Referencial**:
    *   `ON DELETE SET NULL`: Si una categoría padre es eliminada, sus subcategorías no se eliminan, sino que su `parent_id` se establece en `NULL`.

#### Código SQL

```sql
CREATE TABLE categorias (
    categoria_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('principal', 'subcategoria')),
    parent_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_parent_categoria
        FOREIGN KEY (parent_id)
        REFERENCES categorias (categoria_id)
        ON DELETE SET NULL
);

-- Índice para búsquedas por nombre de categoría
CREATE INDEX idx_categorias_nombre ON categorias (nombre);
-- Índice para búsquedas de subcategorías por parent_id
CREATE INDEX idx_categorias_parent_id ON categorias (parent_id);
```

### 2. Entidad: `productos`

*   **Descripción**: Contiene la información detallada de cada producto del menú. Incluye atributos de stock y metadatos.
*   **Atributos**:
    *   `producto_id`: Identificador único del producto.
    *   `nombre`, `descripcion`, `categoria_id`, `current_version`, `status`, `imagen_url`, `es_favorito`, `es_especial`.
    *   `stock_current_quantity`, `stock_min_quantity`, `stock_max_quantity`, `stock_status`, `stock_last_updated`, `stock_alerts`.
    *   `metadata_created_at`, `metadata_created_by`, `metadata_last_modified`, `metadata_last_modified_by`.
*   **Relaciones**:
    *   **Clave Primaria**: `producto_id`
    *   **Clave Foránea**: `categoria_id` referencia a `categorias.categoria_id`.
*   **Reglas de Integridad Referencial**:
    *   `ON DELETE RESTRICT`: No se puede eliminar una categoría si hay productos asociados a ella.

#### Código SQL

```sql
CREATE TABLE productos (
    producto_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria_id UUID NOT NULL,
    current_version INTEGER DEFAULT 1 NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'draft', 'archived', 'discontinued')),
    imagen_url VARCHAR(2048),
    es_favorito BOOLEAN DEFAULT FALSE NOT NULL,
    es_especial BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Atributos de stock
    stock_current_quantity INTEGER NOT NULL,
    stock_min_quantity INTEGER NOT NULL,
    stock_max_quantity INTEGER NOT NULL,
    stock_status VARCHAR(50) NOT NULL CHECK (stock_status IN ('in_stock', 'out_of_stock', 'low_stock')),
    stock_last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    stock_alerts JSONB,

    -- Atributos de metadatos
    metadata_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata_created_by VARCHAR(255) DEFAULT 'system' NOT NULL,
    metadata_last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata_last_modified_by VARCHAR(255) DEFAULT 'system' NOT NULL,

    CONSTRAINT fk_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias (categoria_id)
        ON DELETE RESTRICT
);

-- Índices para búsquedas y filtrados comunes
CREATE INDEX idx_productos_nombre ON productos (nombre);
CREATE INDEX idx_productos_categoria_id ON productos (categoria_id);
CREATE INDEX idx_productos_status ON productos (status);
CREATE INDEX idx_productos_es_favorito ON productos (es_favorito) WHERE es_favorito = TRUE;
CREATE INDEX idx_productos_es_especial ON productos (es_especial) WHERE es_especial = TRUE;
```

### 3. Entidad: `precio_historial`

*   **Descripción**: Registra los cambios de precio de un producto a lo largo del tiempo.
*   **Atributos**:
    *   `precio_historial_id`: Identificador único del registro.
    *   `producto_id`: ID del producto asociado.
    *   `precio`: El valor monetario.
    *   `fecha_efectiva`: Fecha de inicio de validez del precio.
    *   `moneda`: Código de la moneda (ej. "USD", "ARS").
*   **Relaciones**:
    *   **Clave Primaria**: `precio_historial_id`
    *   **Clave Foránea**: `producto_id` referencia a `productos.producto_id`.
*   **Reglas de Integridad Referencial**:
    *   `ON DELETE CASCADE`: Si un producto es eliminado, todo su historial de precios también se elimina.

#### Código SQL

```sql
CREATE TABLE precio_historial (
    precio_historial_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL,
    precio NUMERIC(10, 2) NOT NULL,
    fecha_efectiva TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    moneda VARCHAR(3) DEFAULT 'USD' NOT NULL,

    CONSTRAINT fk_producto_precio
        FOREIGN KEY (producto_id)
        REFERENCES productos (producto_id)
        ON DELETE CASCADE
);

-- Índices para consultas de historial de precios
CREATE INDEX idx_precio_historial_producto_id ON precio_historial (producto_id);
CREATE INDEX idx_precio_historial_fecha_efectiva ON precio_historial (fecha_efectiva DESC);
```

### 4. Entidad: `producto_versiones`

*   **Descripción**: Almacena diferentes versiones de un producto, permitiendo rastrear cambios significativos.
*   **Atributos**:
    *   `producto_version_id`: Identificador único de la versión.
    *   `producto_id`: ID del producto asociado.
    *   `version_numero`: Número de la versión.
    *   `descripcion_cambios`: Notas sobre los cambios en esta versión.
    *   `fecha_creacion`: Fecha de creación de la versión.
    *   `snapshot_data`: Un snapshot en formato JSON del producto en esta versión.
*   **Relaciones**:
    *   **Clave Primaria**: `producto_version_id`
    *   **Clave Foránea**: `producto_id` referencia a `productos.producto_id`.
*   **Reglas de Integridad Referencial**:
    *   `ON DELETE CASCADE`: Si un producto es eliminado, todas sus versiones también se eliminan.

#### Código SQL

```sql
CREATE TABLE producto_versiones (
    producto_version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL,
    version_numero INTEGER NOT NULL,
    descripcion_cambios TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    snapshot_data JSONB,

    CONSTRAINT fk_producto_version
        FOREIGN KEY (producto_id)
        REFERENCES productos (producto_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_producto_version UNIQUE (producto_id, version_numero)
);

-- Índices para consultas de versiones
CREATE INDEX idx_producto_versiones_producto_id ON producto_versiones (producto_id);
CREATE INDEX idx_producto_versiones_version_numero ON producto_versiones (version_numero DESC);
```

---

## Diagrama ER Textual (Simplificado)

```
+-------------------+       +-------------------+       +-----------------------+
|    categorias     |       |     productos     |       |   precio_historial    |
+-------------------+       +-------------------+       +-----------------------+
| PK categoria_id   |<------| PK producto_id    |------>| PK precio_historial_id|
|    nombre         |       |    nombre         |       | FK producto_id        |
|    tipo           |       |    descripcion    |       |    precio             |
| FK parent_id -----+------>| FK categoria_id   |       |    fecha_efectiva     |
+-------------------+       |    current_version|       |    moneda             |
          ^                 |    status         |       +-----------------------+
          |                 |    imagen_url     |
          |                 |    es_favorito    |       +-----------------------+
          |                 |    es_especial    |       |  producto_versiones   |
          |                 |    stock_...      |       +-----------------------+
          |                 |    metadata_...   |------>| PK producto_version_id|
          +-----------------|-------------------+       | FK producto_id        |
                            |                           |    version_numero     |
                            |                           |    descripcion_cambios|
                            |                           |    fecha_creacion     |
                            |                           |    snapshot_data      |
                            +---------------------------+-----------------------+
```

**Explicación de Relaciones:**

*   **`categorias` (self-referencing)**: Una categoría puede tener un `parent_id` que apunta a otra categoría, formando una jerarquía.
*   **`productos` a `categorias` (1 a N)**: Cada producto pertenece a una y solo una categoría.
*   **`productos` a `precio_historial` (1 a N)**: Un producto puede tener múltiples registros de precio a lo largo del tiempo.
*   **`productos` a `producto_versiones` (1 a N)**: Un producto puede tener múltiples versiones.

---

## Resumen y Sugerencias Adicionales

Este modelo proporciona una base de datos sólida y normalizada para la aplicación. La separación del historial de precios y las versiones mejora la integridad, la eficiencia de las consultas y la flexibilidad para futuras funcionalidades.

**Sugerencias Adicionales:**

1.  **Tabla de Usuarios**: Considerar una tabla `usuarios` para gestionar quién crea o modifica los productos, en lugar de usar un campo `VARCHAR`.
2.  **Gestión de Stock Avanzada**: Si el stock se vuelve más complejo (ej. múltiples ubicaciones), podría extraerse a su propia tabla.
3.  **Internacionalización (i18n)**: Para soportar múltiples idiomas, se podría añadir una tabla `traducciones` o usar campos `JSONB` en las tablas existentes.
4.  **Optimización de Consultas**: Usar `EXPLAIN ANALYZE` en producción para identificar cuellos de botella y añadir índices compuestos si es necesario.