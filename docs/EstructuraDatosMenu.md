# Documentación de Estructura de Datos para el Sistema de Menús

## Introducción

Este documento describe la estructura de datos JSON implementada para el sistema de gestión de menús. La estructura está diseñada para ser utilizada con localStorage, permitiendo la persistencia de datos entre sesiones del navegador y facilitando la integración con el backend cuando sea necesario.

## Estructura de Carpetas

La estructura de datos está organizada en las siguientes carpetas dentro de `test-data/`:

```
test-data/
├── categorias.json                # Categorías principales
├── subcategorias.json            # Subcategorías
├── productos.json                # Catálogo completo de productos
├── menu-dia/                     # Datos del menú diario
│   ├── menu-dia.json             # Menú actual
│   └── historial-menus.json      # Registro histórico de menús
├── favoritos/                    # Productos favoritos
│   └── favoritos.json            # Lista de productos favoritos
├── especiales/                   # Productos con ofertas especiales
│   └── especiales.json           # Lista de productos especiales
├── combinaciones/                # Combinaciones de productos
│   ├── combinaciones.json        # Lista de combinaciones disponibles
│   └── combinaciones-favoritas.json # Combinaciones favoritas
├── programacion-semanal/         # Programación semanal de menús
│   ├── programacion-actual.json  # Programación para la semana en curso
│   └── historial-programaciones.json # Registro histórico de programaciones
├── estadisticas/                 # Datos estadísticos
│   ├── ventas-diarias.json       # Registro de ventas por día
│   ├── productos-populares.json  # Ranking de productos más vendidos
│   └── tendencias-mensuales.json # Tendencias de ventas por mes
└── configuracion/                # Configuración del sistema
    ├── preferencias-usuario.json # Preferencias de usuario
    └── configuracion-sistema.json # Configuración general del sistema
```

## Descripción de Archivos JSON

### Archivos Base

#### categorias.json
Contiene las categorías principales de productos.

```json
[
  {
    "id_categoria": "CAT_001",
    "nombre": "Entradas",
    "orden": 1,
    "estado": true,
    "fecha_creacion": "2025-01-01T00:00:00.000Z",
    "fecha_actualizacion": "2025-01-01T00:00:00.000Z"
  },
  ...
]
```

#### subcategorias.json
Contiene las subcategorías dentro de cada categoría principal.

```json
[
  {
    "id_subcategoria": "SUBCAT_001",
    "id_categoria_padre": "CAT_001",
    "nombre": "Sopas",
    "orden": 1,
    "estado": true,
    "fecha_creacion": "2025-01-01T00:00:00.000Z",
    "fecha_actualizacion": "2025-01-01T00:00:00.000Z"
  },
  ...
]
```

#### productos.json
Catálogo completo de productos disponibles.

```json
[
  {
    "id_producto": "PROD_001",
    "nombre": "Sopa de Verduras",
    "descripcion": "Deliciosa sopa de verduras frescas con un toque de hierbas aromáticas",
    "descripcion_corta": "Sopa de verduras frescas",
    "id_categoria": "CAT_001",
    "id_subcategoria": "SUBCAT_001",
    "imagen_url": "/images/placeholder.jpg",
    "imagen_miniatura_url": "/images/placeholder.jpg",
    "estado_disponible": true,
    "stock_actual": 50,
    "stock_minimo": 10,
    "fecha_creacion": "2025-01-01T00:00:00.000Z",
    "fecha_actualizacion": "2025-01-01T00:00:00.000Z"
  },
  ...
]
```

### Menú del Día

#### menu-dia/menu-dia.json
Contiene la estructura del menú actual.

```json
{
  "id": "MENU_DIA_001",
  "fecha": "2025-05-19T00:00:00.000Z",
  "nombre": "Menú del Día",
  "estado": "activo",
  "productos": [
    {
      "id": "PROD_001",
      "nombre": "Ajiaco",
      "descripcion": "Sopa típica con tres tipos de papa, pollo y guascas",
      "categoriaId": "CAT_001",
      "imagen": "/images/placeholder.jpg"
    },
    ...
  ],
  "fecha_creacion": "2025-05-19T00:00:00.000Z",
  "fecha_actualizacion": "2025-05-19T00:00:00.000Z"
}
```

#### menu-dia/historial-menus.json
Registro histórico de menús diarios anteriores.

```json
[
  {
    "id": "MENU_DIA_HIST_001",
    "fecha": "2025-05-18T00:00:00.000Z",
    "nombre": "Menú del Día - Anterior",
    "estado": "inactivo",
    "productos": [...],
    "fecha_creacion": "2025-05-18T00:00:00.000Z",
    "fecha_actualizacion": "2025-05-18T00:00:00.000Z"
  },
  ...
]
```

### Favoritos

#### favoritos/favoritos.json
Lista de productos marcados como favoritos.

```json
[
  {
    "id": "FAV_001",
    "producto_id": "PROD_007",
    "nombre": "Lomo de Res",
    "descripcion": "Jugoso lomo de res a la parrilla con especias",
    "categoriaId": "CAT_003",
    "imagen": "/images/placeholder.jpg",
    "fecha_agregado": "2025-05-01T00:00:00.000Z"
  },
  ...
]
```

### Especiales

#### especiales/especiales.json
Lista de productos marcados como especiales.

```json
[
  {
    "id": "ESP_001",
    "producto_id": "PROD_009",
    "nombre": "Filete de Pescado",
    "descripcion": "Filete de pescado fresco a la parrilla con limón y especias",
    "categoriaId": "CAT_003",
    "imagen": "/images/placeholder.jpg",
    "precio_especial": 15000,
    "precio_regular": 18000,
    "disponible_desde": "2025-05-15T00:00:00.000Z",
    "disponible_hasta": "2025-05-30T00:00:00.000Z"
  },
  ...
]
```

### Combinaciones

#### combinaciones/combinaciones.json
Lista de combinaciones disponibles.

```json
[
  {
    "id": "COMB_1",
    "nombre": "Combinación 1",
    "productos": [
      {
        "id": "PROD_001",
        "nombre": "Sopa de Verduras",
        "categoriaId": "CAT_001"
      },
      ...
    ],
    "fechaCreacion": "2025-05-19T19:35:09.485Z",
    "esFavorito": false,
    "esEspecial": false
  },
  ...
]
```

#### combinaciones/combinaciones-favoritas.json
Combinaciones marcadas como favoritas.

```json
[
  {
    "id": "COMB_FAV_001",
    "combinacion_id": "COMB_3",
    "nombre": "Combinación 3",
    "descripcion": "Sopa de Verduras, Frijoles, Pechuga de Pollo a la Plancha, Ensalada Mixta, Patacones, Jugo de Naranja",
    "fecha_agregado": "2025-05-10T00:00:00.000Z"
  },
  ...
]
```

### Programación Semanal

#### programacion-semanal/programacion-actual.json
Programación para la semana en curso.

```json
{
  "id": "PROG_SEM_001",
  "semana_inicio": "2025-05-19T00:00:00.000Z",
  "semana_fin": "2025-05-25T00:00:00.000Z",
  "dias": [
    {
      "dia": "lunes",
      "fecha": "2025-05-19T00:00:00.000Z",
      "menu_id": "MENU_001",
      "combinaciones": ["COMB_1", "COMB_2", "COMB_3"],
      "estado": "activo"
    },
    ...
  ],
  "fecha_creacion": "2025-05-15T00:00:00.000Z",
  "fecha_actualizacion": "2025-05-15T00:00:00.000Z"
}
```

#### programacion-semanal/historial-programaciones.json
Registro histórico de programaciones semanales.

```json
[
  {
    "id": "PROG_SEM_HIST_001",
    "semana_inicio": "2025-05-12T00:00:00.000Z",
    "semana_fin": "2025-05-18T00:00:00.000Z",
    "dias": [...],
    "fecha_creacion": "2025-05-08T00:00:00.000Z",
    "fecha_actualizacion": "2025-05-16T00:00:00.000Z"
  },
  ...
]
```

### Estadísticas

#### estadisticas/ventas-diarias.json
Registro de ventas por día.

```json
[
  {
    "fecha": "2025-05-19T00:00:00.000Z",
    "total_ventas": 1250000,
    "productos_vendidos": [
      {"producto_id": "PROD_001", "nombre": "Sopa de Verduras", "cantidad": 25, "total": 125000},
      ...
    ],
    "combinaciones_vendidas": [
      {"combinacion_id": "COMB_1", "nombre": "Combinación 1", "cantidad": 15, "total": 225000},
      ...
    ]
  },
  ...
]
```

#### estadisticas/productos-populares.json
Ranking de productos más vendidos.

```json
{
  "periodo": "mayo-2025",
  "fecha_generacion": "2025-05-19T00:00:00.000Z",
  "productos_mas_vendidos": [
    {
      "producto_id": "PROD_012",
      "nombre": "Jugo de Naranja",
      "categoriaId": "CAT_005",
      "total_vendido": 255,
      "total_ingresos": 1275000,
      "porcentaje_ventas": 15.8
    },
    ...
  ],
  "categorias_mas_vendidas": [...],
  "combinaciones_mas_vendidas": [...]
}
```

#### estadisticas/tendencias-mensuales.json
Tendencias de ventas por mes.

```json
{
  "fecha_generacion": "2025-05-19T00:00:00.000Z",
  "tendencias": [
    {
      "mes": "enero-2025",
      "total_ventas": 28500000,
      "promedio_diario": 950000,
      "productos_destacados": [...],
      "categorias_destacadas": [...]
    },
    ...
  ],
  "comparativa_anual": {
    "año_actual": "2025",
    "año_anterior": "2024",
    "crecimiento_ventas": 12.5,
    "productos_crecimiento": [...],
    "categorias_crecimiento": [...]
  }
}
```

### Configuración

#### configuracion/preferencias-usuario.json
Preferencias de usuario para la interfaz.

```json
{
  "usuario_id": "USR_001",
  "nombre": "Admin",
  "tema": "claro",
  "idioma": "es",
  "notificaciones": {...},
  "dashboard": {...},
  "menu": {
    "mostrar_imagenes": true,
    "mostrar_descripciones": true,
    "ordenar_por": "categoria",
    "items_por_pagina": 20,
    "cache_habilitado": true,
    "tiempo_cache_minutos": 60
  },
  "fecha_actualizacion": "2025-05-15T00:00:00.000Z"
}
```

#### configuracion/configuracion-sistema.json
Configuraciones generales del sistema.

```json
{
  "version": "1.5.2",
  "fecha_actualizacion": "2025-05-10T00:00:00.000Z",
  "restaurante": {...},
  "sistema": {...},
  "menu": {
    "categorias_predeterminadas": [...],
    "max_items_menu_dia": 25,
    "max_items_por_categoria": 10,
    "dias_programacion_maximos": 14,
    "permitir_duplicados": false,
    "notificar_cambios_menu": true
  },
  "notificaciones": {...},
  "integraciones": {...}
}
```

## Relaciones entre Archivos

Los archivos JSON están relacionados entre sí mediante identificadores únicos:

1. **Productos y Categorías**:
   - Los productos en `productos.json` hacen referencia a categorías en `categorias.json` mediante `id_categoria`.
   - Los productos también pueden hacer referencia a subcategorías en `subcategorias.json` mediante `id_subcategoria`.

2. **Menú del Día y Productos**:
   - El menú del día en `menu-dia.json` contiene productos que hacen referencia a `productos.json` mediante `id`.

3. **Favoritos y Productos**:
   - Los favoritos en `favoritos.json` hacen referencia a productos en `productos.json` mediante `producto_id`.

4. **Especiales y Productos**:
   - Los especiales en `especiales.json` hacen referencia a productos en `productos.json` mediante `producto_id`.

5. **Combinaciones y Productos**:
   - Las combinaciones en `combinaciones.json` contienen productos que hacen referencia a `productos.json` mediante `id`.

6. **Programación Semanal y Combinaciones**:
   - La programación semanal en `programacion-actual.json` hace referencia a combinaciones en `combinaciones.json` mediante `combinaciones`.

7. **Estadísticas y Productos/Combinaciones**:
   - Las estadísticas en `ventas-diarias.json`, `productos-populares.json` y `tendencias-mensuales.json` hacen referencia a productos y combinaciones mediante sus respectivos IDs.

## Uso con localStorage

Para utilizar estos datos con localStorage, se pueden seguir estos pasos:

1. **Cargar datos iniciales**:
   ```javascript
   // Cargar categorías
   fetch('/test-data/categorias.json')
     .then(response => response.json())
     .then(data => localStorage.setItem('categorias', JSON.stringify(data)));
   
   // Cargar productos
   fetch('/test-data/productos.json')
     .then(response => response.json())
     .then(data => localStorage.setItem('productos', JSON.stringify(data)));
   
   // Cargar menú del día
   fetch('/test-data/menu-dia/menu-dia.json')
     .then(response => response.json())
     .then(data => localStorage.setItem('menu_dia', JSON.stringify(data)));
   ```

2. **Leer datos**:
   ```javascript
   // Obtener categorías
   const categorias = JSON.parse(localStorage.getItem('categorias') || '[]');
   
   // Obtener productos
   const productos = JSON.parse(localStorage.getItem('productos') || '[]');
   
   // Obtener menú del día
   const menuDia = JSON.parse(localStorage.getItem('menu_dia') || '{}');
   ```

3. **Actualizar datos**:
   ```javascript
   // Actualizar menú del día
   const menuDia = JSON.parse(localStorage.getItem('menu_dia') || '{}');
   menuDia.productos.push(nuevoProducto);
   localStorage.setItem('menu_dia', JSON.stringify(menuDia));
   
   // Agregar a favoritos
   const favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
   favoritos.push(nuevoFavorito);
   localStorage.setItem('favoritos', JSON.stringify(favoritos));
   ```

4. **Sincronizar con el backend**:
   ```javascript
   // Enviar datos al backend
   const menuDia = JSON.parse(localStorage.getItem('menu_dia') || '{}');
   fetch('/api/menu-dia', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify(menuDia),
   })
     .then(response => response.json())
     .then(data => console.log('Menú sincronizado con éxito'));
   ```

## Consideraciones de Rendimiento

1. **Tamaño de los datos**:
   - localStorage tiene un límite de almacenamiento (generalmente 5-10 MB).
   - Considerar la posibilidad de almacenar solo los datos esenciales y cargar el resto desde el servidor.

2. **Frecuencia de actualización**:
   - Evitar actualizaciones frecuentes de localStorage para no afectar el rendimiento.
   - Considerar el uso de un sistema de caché con tiempo de expiración.

3. **Sincronización**:
   - Implementar un sistema de sincronización periódica con el backend.
   - Considerar el uso de un mecanismo de resolución de conflictos.

## Conclusión

Esta estructura de datos JSON proporciona una base sólida para el sistema de gestión de menús. Está diseñada para ser modular, escalable y fácil de mantener. Los desarrolladores pueden extender esta estructura según las necesidades específicas del proyecto.

Para cualquier pregunta o sugerencia, por favor contactar al equipo de desarrollo.
