# Pantallas Principales del Dashboard de Spoon

Este documento detalla las pantallas y funcionalidades clave del dashboard de administración de Spoon, enfocándose en las principales áreas operativas que los propietarios de restaurantes utilizan diariamente.

## 1. Dashboard Principal (Vista General)

La pantalla de inicio tras el acceso al sistema, que ofrece una visión general del estado del restaurante.

### Elementos Visuales

- **Cabecera Superior**:
  - Nombre del restaurante con selector para cambiar entre restaurantes (si aplica)
  - Estado actual (Abierto/Cerrado) con toggle para cambio rápido
  - Notificaciones pendientes con contador
  - Perfil de usuario con menú desplegable

- **Panel de KPIs**:
  - Tarjetas de métricas principales:
    - Ventas del día (con comparativa vs mismo día semana anterior)
    - Número de pedidos (con tendencia)
    - Ticket promedio
    - Valoración promedio de clientes
  - Todas con indicadores visuales de tendencia (flechas arriba/abajo)

- **Gráfico Principal**:
  - Visualización de ventas por hora, día o semana
  - Opciones para cambiar período (hoy, ayer, esta semana, mes)
  - Comparativa con períodos anteriores (línea superpuesta)
  - Destacado de horas pico

- **Mapa de Calor de Pedidos**:
  - Visualización geográfica de la concentración de pedidos
  - Filtros por período de tiempo
  - Zoom para detallar zonas específicas

- **Pedidos Activos**:
  - Lista de pedidos en curso con:
    - Estado actual (En preparación, En entrega)
    - Tiempo transcurrido
    - Valor del pedido
    - Cliente
    - Repartidor asignado (si aplica)
  - Acciones rápidas (ver detalles, cambiar estado)

- **Alertas y Sugerencias**:
  - Notificaciones inteligentes basadas en datos:
    - "La categoría Ensaladas ha aumentado un 15% en pedidos"
    - "El producto X está agotándose, considera reabastecerlo"
    - "Hay un pico de pedidos previsto para la noche (basado en histórico)"

- **Calendario de Eventos**:
  - Próximos eventos programados (promociones, días festivos)
  - Recordatorios de tareas pendientes
  - Fechas importantes (renovación de licencias, etc.)

### Funcionalidades Técnicas

- **Actualización en Tiempo Real**:
  - WebSockets para mostrar pedidos nuevos instantáneamente
  - Actualización automática de KPIs cada 5 minutos
  - Notificaciones push para eventos críticos

- **Personalización**:
  - Widgets arrastrables (drag & drop)
  - Opción de ocultar/mostrar secciones
  - Guardado de preferencias por usuario
  - Temas visuales (claro/oscuro/personalizado)

- **Exportación de Datos**:
  - Generación de reportes PDF del dashboard
  - Exportación de datos en CSV/Excel
  - Programación de envío automático por email

## 2. Gestión de Menú

Sección dedicada a la administración completa del menú del restaurante.

### Elementos Visuales

- **Lista de Menús**:
  - Diferentes menús configurados (ej. Desayuno, Almuerzo, Cena, Especial)
  - Estado (activo/inactivo) con toggle
  - Horario de disponibilidad
  - Número de categorías/items

- **Editor de Categorías**:
  - Lista jerárquica de categorías
  - Drag & drop para reordenar
  - Imágenes representativas
  - Contador de productos por categoría
  - Opciones de visibilidad

- **Administrador de Productos**:
  - Vista en grid o lista (configurable)
  - Filtros rápidos por categoría, disponibilidad, popularidad
  - Para cada producto:
    - Imagen principal
    - Nombre y descripción corta
    - Precio normal y con descuento (si aplica)
    - Disponibilidad
    - Popularidad (basada en ventas)
    - Acciones rápidas (editar, duplicar, ocultar)

- **Editor de Producto**:
  - Formulario completo de edición:
    - Información básica (nombre, descripción, categoría)
    - Gestión de imágenes con múltiples vistas
    - Precio y opciones de descuento
    - Información nutricional y alérgenos
    - Opciones/variaciones (tamaños, extras)
    - Modificadores (agregar/quitar ingredientes)
    - Etiquetas (Vegano, Sin Gluten, Picante, etc.)
    - Disponibilidad por día/hora
    - Límites de stock

- **Gestión de Combos/Promociones**:
  - Constructor visual de combos
  - Reglas de descuento (porcentaje, monto fijo)
  - Configuración de vigencia
  - Vista previa como lo ve el cliente

- **Importación/Exportación**:
  - Plantilla Excel para carga masiva
  - Validación previa a importación
  - Log de errores detallado
  - Historial de importaciones

### Funcionalidades Técnicas

- **Editor de Imágenes Integrado**:
  - Recorte y ajuste básico de imágenes
  - Optimización automática para web/mobile
  - Generación de miniaturas
  - Biblioteca de imágenes reutilizables

- **Campos Dinámicos**:
  - Configuración personalizada de atributos por categoría
  - Validación específica según tipo de producto
  - Plantillas predefinidas para tipos comunes

- **Vista Previa en Tiempo Real**:
  - Simulador de cómo ve el cliente el producto
  - Versiones para diferentes dispositivos
  - Prueba de proceso de pedido

- **Control de Versiones**:
  - Historial de cambios por producto
  - Capacidad de revertir a versiones anteriores
  - Programación de cambios futuros (precios, disponibilidad)

## 3. Gestión de Pedidos

Centro de operaciones para recibir, procesar y gestionar todos los pedidos del restaurante.

### Elementos Visuales

- **Panel de Pedidos**:
  - Vista dividida por estados:
    - Nuevos (pendientes de aceptación)
    - En preparación
    - Listos para entrega
    - En camino
    - Entregados/Completados
    - Cancelados
  - Sistema tipo Kanban para mover pedidos entre estados
  - Indicadores visuales de tiempo (normal, advertencia, retrasado)

- **Detalles de Pedido**:
  - Información completa:
    - Datos del cliente
    - Items ordenados con modificadores
    - Subtotal, impuestos, descuentos, propina, total
    - Instrucciones especiales
    - Método de pago y estado
    - Dirección de entrega con mapa (si aplica)
    - Historial de estados con timestamps
  - Acciones disponibles según estado:
    - Aceptar/Rechazar
    - Ajustar tiempo de preparación
    - Asignar repartidor
    - Contactar cliente
    - Modificar pedido
    - Cancelar pedido

- **Centro de Notificaciones**:
  - Alertas sonoras para nuevos pedidos
  - Notificaciones visuales destacadas
  - Panel de configuración de alertas
  - Opciones de escalamiento (SMS, llamada)
  - Historial de notificaciones

- **Vista de Cocina**:
  - Diseño optimizado para pantalla en cocina
  - Pedidos organizados por tiempo
  - Items agrupados para preparación eficiente
  - Modo de alto contraste
  - Temporizadores visuales

- **Gestión de Entregas**:
  - Asignación de repartidores
  - Mapa en tiempo real de repartidores
  - Estimación de tiempos según tráfico
  - Optimización de rutas para entregas múltiples
  - Seguimiento de repartidores externos

- **Historial y Búsqueda**:
  - Buscador avanzado con múltiples filtros:
    - Por cliente
    - Por fecha/hora
    - Por estado
    - Por productos
    - Por repartidor
    - Por método de pago
  - Exportación de resultados

### Funcionalidades Técnicas

- **Integración Omnicanal**:
  - Recepción unificada de pedidos de:
    - Aplicación propia
    - Plataformas de terceros
    - Teléfono/POS
    - Sitio web
  - Identificación visual de la fuente

- **Impresión Automática**:
  - Generación de tickets para cocina
  - Facturas para clientes
  - Hojas de ruta para repartidores
  - Configuración por tipo de impresora

- **Gestión de Estados Personalizados**:
  - Flujos de trabajo configurables
  - Estados y transiciones personalizables
  - Automatizaciones basadas en tiempo

- **Sistema de Repartidores**:
  - Panel para repartidores propios
  - Aplicación móvil dedicada
  - Integración con servicios externos
  - Métricas de rendimiento

## 4. Análisis y Reportes

Centro de inteligencia de negocios para analizar el rendimiento del restaurante y tomar decisiones informadas.

### Elementos Visuales

- **Panel de Control Analítico**:
  - Filtros globales de período
  - Métricas clave con evolución temporal
  - Selección de KPIs personalizables
  - Comparativas con períodos anteriores

- **Análisis de Ventas**:
  - Gráficos de tendencias (diario, semanal, mensual, anual)
  - Desglose por:
    - Categorías de productos
    - Productos individuales
    - Horas del día
    - Días de la semana
    - Métodos de pago
    - Canales de venta
  - Análisis de promociones y su impacto

- **Rentabilidad y Costos**:
  - Margen bruto por producto/categoría
  - Evolución de costos de insumos
  - Productos más/menos rentables
  - Simulador de cambios de precio

- **Análisis de Clientes**:
  - Segmentación por:
    - Frecuencia de compra
    - Valor promedio de pedido
    - Ubicación geográfica
    - Productos preferidos
    - Horarios habituales
  - Identificación de clientes VIP
  - Métricas de retención vs. adquisición

- **Informes de Rendimiento Operativo**:
  - Tiempos de preparación
  - Tiempos de entrega
  - Cancelaciones (motivos, porcentaje)
  - Devoluciones y problemas
  - Rendimiento de repartidores

- **Gestión de Inventario**:
  - Rotación de productos
  - Predicciones de agotamiento
  - Alertas de nivel bajo
  - Mermas y desperdicios
  - Sugerencias de compra

- **Generador de Informes**:
  - Plantillas predefinidas
  - Constructor personalizado de informes
  - Programación de envíos automáticos
  - Exportación a múltiples formatos

### Funcionalidades Técnicas

- **Motor Analítico Avanzado**:
  - Procesamiento en tiempo real
  - Agregaciones y cálculos complejos
  - Detección de anomalías
  - Forecast basado en históricos y tendencias

- **Visualización Interactiva**:
  - Gráficos dinámicos con drill-down
  - Filtros interactivos
  - Dashboards personalizables
  - Modo presentación para reuniones

- **Machine Learning**:
  - Predicción de demanda
  - Recomendaciones de productos
  - Optimización de precios
  - Detección de fraude

- **Integración de Datos Externos**:
  - Clima y su impacto en ventas
  - Eventos locales
  - Tendencias de mercado
  - Benchmarking con sector

## 5. Configuración de Tienda Online

Herramientas para gestionar la presencia online del restaurante y la experiencia del cliente.

### Elementos Visuales

- **Editor de Tienda Online**:
  - Vista previa en tiempo real
  - Personalización de:
    - Colores y tema
    - Logo y branding
    - Imágenes de cabecera
    - Diseño de la página
    - Categorías destacadas

- **Gestión de Promociones**:
  - Creación de banners promocionales
  - Configuración de ofertas especiales
  - Cupones de descuento
  - Reglas de aplicación (mínimo de compra, productos específicos)
  - Programación temporal

- **Configuración de Experiencia**:
  - Flujo de checkout
  - Opciones de registro/pedido como invitado
  - Configuración de métodos de pago
  - Personalización de correos transaccionales
  - Mensajes de confirmación

- **SEO y Marketing**:
  - Optimización para buscadores
  - Metadatos por página
  - Configuración de URL amigables
  - Integración con redes sociales
  - Pixel de seguimiento

- **Gestión de Contenido**:
  - Editor para páginas estáticas:
    - Sobre nosotros
    - Política de privacidad
    - Términos y condiciones
    - Preguntas frecuentes
  - Blog integrado (opcional)
  - Galería de imágenes

### Funcionalidades Técnicas

- **Editor Visual (WYSIWYG)**:
  - Drag & drop de elementos
  - Biblioteca de componentes
  - Responsive design automático
  - Modo código para personalizaciones avanzadas

- **Optimización de Rendimiento**:
  - Compresión de imágenes
  - Carga diferida (lazy loading)
  - Minificación de recursos
  - Testing de velocidad

- **Gestión Multilingüe**:
  - Traducción de interfaz
  - Contenido específico por idioma
  - Detección automática de idioma
  - SEO multilingüe

- **Pruebas A/B**:
  - Comparación de variantes de diseño
  - Métricas de conversión
  - Segmentación de audiencia
  - Análisis estadístico de resultados

## 6. Gestión de Cliente y Fidelización

Herramientas para administrar la base de clientes y programas de fidelización.

### Elementos Visuales

- **Directorio de Clientes**:
  - Lista completa con buscador avanzado
  - Ficha por cliente con:
    - Datos personales
    - Historial de pedidos
    - Valor total/promedio
    - Productos favoritos
    - Notas especiales (alergias, preferencias)
    - Interacciones y comunicaciones

- **Segmentación de Clientes**:
  - Creación de segmentos basados en:
    - Frecuencia de compra
    - Valor de cliente
    - Ubicación
    - Preferencias de productos
    - Comportamiento de navegación
  - Segmentos predefinidos (VIP, inactivos, nuevos)
  - Segmentos personalizados

- **Programa de Fidelización**:
  - Configuración de reglas:
    - Puntos por compra
    - Niveles de membresía
    - Beneficios por nivel
    - Promociones exclusivas
  - Seguimiento de puntos y recompensas
  - Notificaciones automáticas
  - Estadísticas de participación

- **Campañas de Marketing**:
  - Creación de campañas por segmento
  - Programación de envíos
  - Plantillas de correo/SMS
  - Seguimiento de resultados (apertura, clics, conversión)
  - Pruebas A/B

- **Gestión de Reseñas**:
  - Monitoreo de opiniones
  - Respuestas a reseñas (plantillas sugeridas)
  - Solicitud automática post-compra
  - Análisis de sentimiento
  - Reportes de satisfacción

### Funcionalidades Técnicas

- **CRM Integrado**:
  - Perfil unificado de cliente
  - Historial completo de interacciones
  - Automatización de seguimiento
  - Sincronización con herramientas externas

- **Motor de Recomendaciones**:
  - Sugerencias personalizadas basadas en historial
  - Productos complementarios
  - "Comprados juntos frecuentemente"
  - Reactivación con ofertas específicas

- **Automatización de Marketing**:
  - Flujos de trabajo automáticos
  - Triggers basados en comportamiento
  - Mensajes personalizados
  - Análisis de efectividad

- **Protección de Datos**:
  - Cumplimiento GDPR/CCPA
  - Gestión de consentimientos
  - Anonimización de datos
  - Políticas de retención

## Integración entre Módulos

Todos los módulos descritos anteriormente están interconectados para ofrecer una experiencia holística:

- **Dashboard → Pedidos**: Acceso directo desde KPIs a detalles de operaciones
- **Menú → Análisis**: Visualización inmediata del rendimiento de productos
- **Pedidos → Clientes**: Acceso con un clic al perfil del cliente desde un pedido
- **Análisis → Marketing**: Creación de campañas basadas en insights descubiertos
- **Configuración → Menú**: Cambios en tienda online reflejados automáticamente
- **Clientes → Pedidos**: Historial completo accesible desde ficha de cliente

Esta integración fluida permite una gestión completa del negocio desde una única plataforma, centralizando la información y facilitando la toma de decisiones estratégicas.
