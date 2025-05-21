# Descripción Detallada del Gestor de Menú en Spoon Restaurant

## Introducción

El Gestor de Menú es un componente central del sistema Spoon Restaurant que permite a los administradores y propietarios de restaurantes crear, organizar y gestionar los productos que conforman su carta, así como generar combinaciones de menú para ofrecer a sus clientes. Este documento describe en detalle la estructura, funcionalidades y flujo de trabajo del Gestor de Menú.

## Estructura General

El Gestor de Menú está organizado en una interfaz de tres columnas principales:

1. **Columna de Categorías**: Muestra las categorías de productos disponibles.
2. **Columna de Productos**: Muestra los productos pertenecientes a la categoría seleccionada.
3. **Columna de Menú del Día**: Muestra los productos seleccionados para formar el menú del día.

Además, cuenta con una barra superior que contiene:
- Título de la sección ("Menú/Carta")
- Indicador de tiempo restante de caché
- Botones de ayuda y tutoriales
- Botón para generar combinaciones

## Categorías de Productos

### Estructura de Categorías

Las categorías están organizadas según el tipo de alimento y siguen una estructura predefinida:

- **Entradas**: Sopas, ensaladas y otros platos iniciales.
- **Principios**: Platos principales que acompañan la proteína (frijoles, lentejas, etc.).
- **Proteínas**: Carnes, pescados y otras fuentes de proteína.
- **Acompañamientos**: Guarniciones y complementos (arroz, ensalada, patacones, etc.).
- **Bebidas**: Jugos, refrescos y otras bebidas.

### Componente ListaCategorias

Este componente muestra la lista de categorías disponibles y permite seleccionar una para ver sus productos. Cada categoría se representa con:

- Un icono representativo
- El nombre de la categoría (con tipografía reducida)
- Un indicador visual cuando está seleccionada
- Un botón "Agregar subcategoría" debajo de cada categoría

### Funcionalidades de Categorías

- **Selección de Categoría**: Al hacer clic en una categoría, se cargan los productos correspondientes en la columna central.
- **Creación de Categoría**: A través del diálogo `DialogoNuevaCategoria`, se pueden crear nuevas categorías proporcionando un nombre.
- **Ordenamiento**: Las categorías se muestran en un orden predefinido según su importancia en la composición del menú.
- **Agregar Subcategoría**: Cada categoría tiene un botón dedicado para agregar subcategorías, ubicado debajo de la categoría.

## Productos

### Estructura de Productos

Cada producto contiene la siguiente información:

- **ID**: Identificador único del producto.
- **Nombre**: Nombre del producto.
- **Descripción**: Descripción detallada del producto.
- **Categoría**: Categoría a la que pertenece.
- **Imagen**: Imagen representativa del producto.
- **Estado**: Indica si el producto está disponible o no.
- **Stock**: Información sobre la cantidad disponible.

*Nota: Los campos de precio han sido eliminados de la estructura de productos.*

### Componente ListaProductos

Este componente muestra los productos de la categoría seleccionada y permite:

- **Filtrar productos**: Por nombre, estado o nivel de stock.
- **Ordenar productos**: Por nombre o disponibilidad.
- **Paginación**: Navegar entre páginas de productos cuando hay muchos.

### Componente VirtualizedProductList

Utiliza virtualización para mostrar eficientemente grandes listas de productos, cargando solo los elementos visibles en pantalla. Cada producto se muestra con:

- Imagen en miniatura
- Nombre del producto (con tipografía reducida)
- Información de stock

### Funcionalidades de Productos

- **Checkbox para Menú del Día**: Cada producto tiene un checkbox que permite:
  - Al activarlo (check), el producto se agrega al menú del día y el checkbox permanece encendido
  - Si el checkbox está encendido y se apaga, el producto se elimina del menú del día
  - El estado del checkbox refleja si el producto está o no en el menú actual
- **Crear Producto**: A través del diálogo `DialogoNuevoProducto`, se pueden crear nuevos productos proporcionando nombre, descripción, imagen, etc.
- **Editar Producto**: Modificar la información de un producto existente.
- **Gestión de Imágenes**: Subir imágenes para los productos o seleccionarlas de una galería.

## Menú del Día

### Estructura del Menú

El menú del día se organiza por categorías y muestra los productos seleccionados para cada una. La estructura típica es:

- Una entrada (sopa, ensalada)
- Un principio (frijoles, lentejas, etc.)
- Una proteína (carne, pollo, pescado)
- Acompañamientos (arroz, ensalada, patacones)
- Una bebida (jugo, refresco)

### Componente MenuDiario

Este componente muestra los productos seleccionados para el menú del día, organizados por categoría. Características principales:

- **Títulos siempre visibles**: Los títulos de las categorías (Entradas, Principio, Proteína, Acompañamientos, Bebida) siempre se muestran, incluso cuando no hay productos agregados.
- **Mensaje para categorías vacías**: Para las categorías sin productos, se muestra el mensaje "No hay productos seleccionados".
- **Visualización de productos**: Cada producto agregado se muestra con:
  - Nombre del producto (con tipografía reducida)
  - Icono representativo de su categoría
  - Botón para eliminar el producto del menú

### Funcionalidades del Menú del Día

- **Visualización por Categoría**: Los productos se agrupan por su categoría correspondiente.
- **Eliminación de Productos**: Se pueden quitar productos del menú mediante el botón de eliminar.
- **Botones de acción condicionales**: Los botones "Mantener Menu" y "Publicar Menu" solo se activan cuando todas las categorías tienen al menos un producto. Si falta algún producto en cualquier categoría, los botones aparecen deshabilitados.
- **Publicación del Menú**: Al hacer clic en "Publicar Menu", se generan combinaciones entre los productos de entrada, principio y proteína sin repeticiones. Para cada combinación, se incluyen todos los acompañamientos disponibles y se selecciona una bebida de forma rotativa. Estas combinaciones se descargan como un archivo JSON que debe guardarse en la ruta E:\Rescate\spoonweb\spoon-restaurant\test-data\combinaciones.json. Cada vez que se hace clic en este botón, el archivo se sobrescribe con las nuevas combinaciones.
- **Generación de Combinaciones**: Al hacer clic en "Generar Combinaciones", se crean diferentes combinaciones posibles con los productos seleccionados.

## Sistema de Caché

### Funcionamiento del Caché

El sistema implementa un caché de 60 minutos que permite a los usuarios navegar por el dashboard sin perder la información de su menú en creación:

- **Duración**: El caché mantiene la información durante 60 minutos desde la última modificación.
- **Almacenamiento**: Guarda categorías, subcategorías, productos seleccionados y productos agregados al menú del día.
- **Persistencia**: La información se mantiene incluso si el usuario navega a otras secciones del dashboard.
- **Visibilidad condicional**: El indicador de caché y su funcionalidad solo aparecen cuando hay información agregada al menú del día.

### Indicador de Tiempo Restante

- **Ubicación**: Se muestra en la esquina superior derecha de la sección "Menu del Día".
- **Diseño**: Formato compacto con la palabra "Caché:" seguida del tiempo restante en minutos.
- **Actualización**: Se actualiza automáticamente cada minuto.
- **Color adaptativo**: Verde cuando hay tiempo suficiente, rojo cuando quedan 5 minutos o menos.

### Implementación Técnica

- **Hook useMenuCache**: Gestiona toda la lógica de caché, incluyendo almacenamiento, recuperación y actualización.
- **localStorage**: Utiliza el almacenamiento local del navegador para persistir los datos.
- **Tiempo de Expiración**: Sistema que verifica la validez del caché y lo elimina cuando expira.

## Generación de Combinaciones

### Proceso de Generación

Existen dos formas de generar combinaciones en el sistema:

1. **Botón "Generar Combinaciones"** (en la barra superior):
   - Verifica que haya al menos un producto de cada categoría requerida.
   - Genera combinaciones entre los productos de entrada, principio y proteína.
   - Selecciona un acompañamiento y una bebida de forma rotativa para cada combinación.
   - Redirige a la página de combinaciones para mostrar los resultados.
   - Guarda las combinaciones en localStorage para su visualización inmediata.

2. **Botón "Publicar Menu"** (en la sección Menú del Día):
   - Verifica que haya al menos un producto de cada categoría requerida.
   - Genera combinaciones entre los productos de entrada, principio y proteína sin repeticiones.
   - Para cada combinación, incluye todos los acompañamientos disponibles.
   - Selecciona una bebida de forma rotativa para cada combinación.
   - Descarga un archivo JSON con las combinaciones generadas.
   - Este archivo debe guardarse en la ruta E:\Rescate\spoonweb\spoon-restaurant\test-data\combinaciones.json.

El algoritmo de generación de combinaciones ha sido optimizado para:
- Evitar repeticiones innecesarias de combinaciones
- Incluir todos los acompañamientos en cada combinación
- Proporcionar variedad en las bebidas mediante rotación

### Página de Combinaciones

La página de combinaciones muestra todas las combinaciones generadas y permite:

- **Carga desde Archivo JSON**: La página lee automáticamente las combinaciones desde el archivo JSON ubicado en E:\Rescate\spoonweb\spoon-restaurant\test-data\combinaciones.json, generado por el botón "Publicar Menu".
- **Visualización Dual**: Muestra las combinaciones en dos formatos:
  - **Vista Tabla**: Presenta las combinaciones en formato tabular con columnas para cada categoría.
  - **Vista Tarjetas**: Muestra las combinaciones en formato de tarjetas visuales más gráficas.
- **Filtrar por Favoritos**: Mostrar solo las combinaciones marcadas como favoritas.
- **Filtrar por Especiales**: Mostrar solo las combinaciones marcadas como especiales.
- **Programar Combinaciones**: Asignar fechas y cantidades para la preparación futura.
- **Navegar a Páginas Específicas**: Acceder directamente a las páginas de "Platos Favoritos" y "Platos Especiales".
- **Ver Tiempo Restante de Caché**: Muestra el tiempo restante del caché en la barra superior, con el mismo diseño que en la página de creación de menú.

### Componentes de Combinaciones

- **TablaCombinaciones**: Muestra las combinaciones en formato de tabla con columnas para cada categoría.
- **TarjetasCombinaciones**: Muestra las combinaciones en formato de tarjetas visuales.
- **TablaCombinacionesMenu**: Componente reutilizable para mostrar combinaciones en formato de tabla en las páginas de Favoritos y Especiales.
- **ModalProgramacion**: Permite programar una combinación para una fecha específica con una cantidad determinada.

### Funcionalidades de Combinaciones

- **Marcar como Favorito**: Guardar combinaciones preferidas para acceso rápido. Las combinaciones marcadas aparecerán en la página "Platos Favoritos".
- **Marcar como Especial**: Destacar combinaciones especiales. Las combinaciones marcadas aparecerán en la página "Platos Especiales".
- **Actualizar Cantidad**: Especificar cuántas unidades de cada combinación se prepararán.
- **Programación**: Asignar fechas futuras para la preparación de combinaciones específicas.

## Páginas Específicas

### Platos Favoritos

Esta página muestra todas las combinaciones que han sido marcadas como favoritas. Características:
- Utiliza el componente TablaCombinacionesMenu para mostrar las combinaciones
- Permite quitar combinaciones de favoritos
- Permite marcar/desmarcar como especial
- Permite actualizar cantidades y programar combinaciones

### Platos Especiales

Esta página muestra todas las combinaciones que han sido marcadas como especiales. Características:
- Utiliza el componente TablaCombinacionesMenu para mostrar las combinaciones
- Permite quitar combinaciones de especiales
- Permite marcar/desmarcar como favorito
- Permite actualizar cantidades y programar combinaciones

## Flujo de Trabajo Típico

1. **Selección de Categoría**: El usuario selecciona una categoría de la columna izquierda.
2. **Exploración de Productos**: Visualiza los productos disponibles en esa categoría.
3. **Selección de Productos**: Agrega productos al menú del día haciendo clic en ellos.
4. **Repetición**: Repite el proceso para cada categoría hasta completar el menú.
5. **Generación de Combinaciones**: Hace clic en "Generar Combinaciones" para crear diferentes opciones de menú.
6. **Gestión de Combinaciones**: En la página de combinaciones, marca favoritos, especiales y programa la preparación.
7. **Navegación a Páginas Específicas**: Accede a las páginas de "Platos Favoritos" o "Platos Especiales" para gestionar esas combinaciones específicas.
8. **Navegación por el Dashboard**: Puede navegar a otras secciones del dashboard y regresar sin perder su trabajo gracias al sistema de caché.

## Almacenamiento y Persistencia

El sistema utiliza PostgreSQL como base de datos relacional para almacenar toda la información relacionada con categorías, productos, combinaciones y favoritos. También ofrece soporte para Firebase como alternativa.

## Componentes Técnicos Principales

### Hooks Personalizados

- **useCategorias**: Gestiona la obtención y manipulación de categorías.
- **useProductos**: Gestiona la obtención y manipulación de productos.
- **useCombinaciones**: Gestiona la generación y manipulación de combinaciones de menú.
- **useCombinacionesMenu**: Gestiona las combinaciones para las páginas de Favoritos y Especiales.
- **useMenuCache**: Gestiona el almacenamiento, recuperación y actualización del caché del menú.

### Servicios

- **combinacionesService**: Maneja la persistencia de combinaciones en Firebase.
- **combinacionesServicePostgres**: Maneja la persistencia de combinaciones en PostgreSQL.
- **favoritosService**: Maneja la persistencia de favoritos en Firebase.
- **favoritosServicePostgres**: Maneja la persistencia de favoritos en PostgreSQL.

### Tipos de Datos

- **CategoriaMenu**: Enumeración de las categorías disponibles (entrada, principio, proteína, acompañamiento, bebida).
- **Producto**: Interfaz que define la estructura de un producto.
- **Categoria**: Interfaz que define la estructura de una categoría.
- **MenuCombinacion**: Interfaz que define la estructura de una combinación de menú.
- **ProgramacionCombinacion**: Interfaz que define la estructura de una programación de combinación.

## Funcionalidades Avanzadas

### Gestión de Imágenes

- **Subida de Imágenes**: Permite subir imágenes para los productos.
- **Galería de Imágenes**: Permite seleccionar imágenes de una galería predefinida.
- **Validación de Imágenes**: Verifica el formato y tamaño de las imágenes.

### Programación de Menú

- **Programación Diaria**: Asigna combinaciones específicas para fechas concretas.
- **Gestión de Cantidades**: Especifica cuántas unidades de cada combinación se prepararán.
- **Edición de Programación**: Permite modificar programaciones existentes.
- **Eliminación de Programación**: Permite eliminar programaciones que ya no se necesitan.

### Platos Especiales

- **Marcado de Especiales**: Destaca combinaciones como especiales.
- **Período de Disponibilidad**: Define fechas de inicio y fin para la disponibilidad de platos especiales.

## Mejoras Recientes

### Interfaz de Usuario

- **Reducción de Tipografía**: Se ha reducido el tamaño de la tipografía en toda la interfaz para una visualización más compacta.
- **Título "Menú del Día"**: Ahora aparece en una sola línea para mejor visualización.
- **Botón "Agregar Subcategoría"**: Reposicionado debajo de cada categoría para mejor organización.
- **Mejora General de Apariencia**: Espaciado más compacto, iconos más pequeños, mejor alineación de elementos.
- **Indicador de Caché**: Añadido en la barra superior para mostrar el tiempo restante del caché.

### Estructura de Datos

- **Eliminación de Campos de Precio**: Se han eliminado todos los campos relacionados con precios en los productos.
- **Mejora en Generación de Combinaciones**: Algoritmo mejorado para generar combinaciones más diversas y lógicas.

### Sistema de Caché

- **Caché de 60 Minutos**: Implementación de un sistema de caché que permite a los usuarios navegar por el dashboard sin perder su trabajo.
- **Indicador de Tiempo Restante**: Muestra el tiempo restante del caché en la esquina superior derecha de la sección "Menu del Día".
- **Persistencia entre Navegaciones**: Mantiene la información incluso si el usuario navega a otras secciones del dashboard.
- **Visibilidad Condicional**: El indicador de caché y su funcionalidad solo aparecen cuando hay información agregada al menú del día.
- **Color Adaptativo**: El indicador cambia de verde a rojo cuando quedan 5 minutos o menos.

### Mejoras en la Interfaz del Menú del Día

- **Títulos Siempre Visibles**: Los títulos de las categorías (Entradas, Principio, Proteína, Acompañamientos, Bebida) siempre se muestran, incluso cuando no hay productos agregados.
- **Mensaje para Categorías Vacías**: Para las categorías sin productos, se muestra el mensaje "No hay productos seleccionados".
- **Checkbox para Productos**: Implementación de checkboxes para agregar/eliminar productos del menú, manteniendo el estado visual según si el producto está en el menú o no.
- **Botones de Acción Condicionales**: Los botones "Mantener Menu" y "Publicar Menu" solo se activan cuando todas las categorías tienen al menos un producto.

### Nuevas Funcionalidades

- **Páginas Dedicadas**: Nuevas páginas para "Platos Favoritos" y "Platos Especiales".
- **Componente Reutilizable**: Nuevo componente TablaCombinacionesMenu para mostrar combinaciones en diferentes contextos.
- **Navegación Mejorada**: Acceso directo a las páginas específicas desde la barra de navegación.
- **Integración JSON para Combinaciones**: La página de combinaciones ahora lee automáticamente las combinaciones desde el archivo JSON generado por el botón "Publicar Menu", permitiendo una visualización inmediata de las combinaciones en ambos formatos (tabla y tarjetas).
- **API para Lectura de Archivos**: Implementación de un endpoint API que lee el archivo de combinaciones del sistema de archivos y lo sirve a la aplicación cliente.

## Conclusión

El Gestor de Menú de Spoon Restaurant es una herramienta completa y flexible que permite a los propietarios de restaurantes gestionar eficientemente su carta y crear combinaciones atractivas para sus clientes. Su diseño modular y su interfaz intuitiva facilitan la creación y programación de menús, optimizando así la operación diaria del restaurante. Las recientes mejoras en la interfaz de usuario, la estructura de datos y el sistema de caché han hecho que el sistema sea más eficiente, fácil de usar y resistente a interrupciones en el flujo de trabajo.
