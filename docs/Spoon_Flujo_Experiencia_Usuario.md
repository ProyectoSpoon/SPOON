# Flujo de Experiencia de Usuario en Spoon

Este documento detalla el flujo de experiencia de usuario a través de las principales páginas de la aplicación Spoon, explicando en detalle el contenido, funcionalidades y propósito de cada pantalla en el proceso de onboarding y configuración de un restaurante.

## 1. Página de Inicio

La página de inicio es el primer punto de contacto con los propietarios de restaurantes potenciales y sirve como presentación del producto Spoon.

### Contenido Principal

- **Header/Barra de Navegación**:
  - Logo de Spoon
  
  - Botones de acción: "Iniciar Sesión" y "Registrarse" destacado

- **Hero Section**:
  - Título principal: "Conecta con más clientes en tu zona"
  - Subtítulo: "Expande tu negocio con nuestra plataforma de gestión de restaurantes y domicilios"
  - Imagen de fondo: Restaurante o comida atractiva con superposición oscura
  - Call-to-action primario: "Empieza ahora" (botón prominente)
  - Efecto de partículas animadas para un aspecto moderno
  
- **Formulario de Registro Rápido**:
  - Campos: Nombre, Apellido, Correo electrónico, Teléfono, Contraseña (con visualización opcional)
  - Opción para autenticación de dos factores
  - Alternativa "Continuar con Google" (inicio de sesión social)
  - Términos y condiciones

- **Sección de Beneficios**:
  - Tarjetas informativas sobre beneficios clave organizadas en grid:
    - Geolocalización: "Alcanza clientes en cualquier zona y optimiza tus entregas"
    - Sistema de Reseñas: "Mejora tu servicio con feedback real de los clientes"
    - Notificaciones: "Mantén informados a tus clientes sobre sus pedidos"
    - Gestión de Domicilios: "Control total sobre tus entregas y repartidores"

- **Sección "¿Cómo Funciona?"**:
  - Paso 1: Regístrate y configura tu restaurante
  - Paso 2: Carga tu menú con fotos y precios
  - Paso 3: Gestiona pedidos y domicilios
  - Paso 4: Analiza el rendimiento con estadísticas detalladas

- **Testimonios de Clientes**:
  - Carrusel con historias de éxito
  - Fotografías de clientes satisfechos
  - Citas directas sobre cómo Spoon ha ayudado a sus negocios

- **Sección de Preguntas Frecuentes**:
  - Preguntas comunes con respuestas desplegables
  - Categorías: Primeros pasos, Facturación, Soporte, Personalización

- **Call-to-Action Final**:
  - Invitación a registrarse con un periodo de prueba gratuito
  - Botón grande y destacado

- **Footer**:
  - Enlaces a todas las secciones del sitio
  - Enlaces a políticas (Privacidad, Términos, Cookies)
  - Información de contacto
  - Redes sociales
  - Selección de idioma

### Funcionalidades Técnicas

- **Animaciones** mediante Framer Motion:
  - Aparición con fade-in de los elementos principales
  - Animaciones hover en botones y tarjetas
  - Scroll revelador de contenido

- **Formulario Reactivo**:
  - Validación en tiempo real con retroalimentación visual
  - Gestión de estados de carga durante el envío
  - Mensajes de error contextuales

- **Optimización Mobile**:
  - Diseño completamente responsive
  - Navegación simplificada en dispositivos móviles
  - Optimización de imágenes según dispositivo

## 2. Página de Login

La página de login proporciona acceso seguro a los usuarios registrados mientras ofrece una experiencia agradable y opciones de recuperación de acceso.

### Contenido Principal

- **Estructura de Dos Columnas** (en desktop):
  - Columna izquierda (visual/marketing)
  - Columna derecha (formulario de acceso)

- **Columna Izquierda**:
  - Imagen de fondo atractiva relacionada con restaurantes
  - Superposición con transparencia para mejorar legibilidad
  - Mensaje destacado sobre beneficios clave
  - Testimonios o estadísticas relevantes
  - Logotipo de Spoon integrado sutilmente

- **Columna Derecha (Formulario)**:
  - Logo de Spoon centrado
  - Mensaje de bienvenida "Bienvenido de nuevo"
  - Campos de formulario:
    - Correo electrónico (con validación)
    - Contraseña (con opción de mostrar/ocultar)
  - Enlace "¿Olvidaste tu contraseña?" con modal de recuperación
  - Botón de inicio de sesión principal
  - Separador visual "O continúa con"
  - Botón de inicio de sesión con Google (con logo)
  - Enlace de soporte al final

- **Modal de Recuperación de Contraseña**:
  - Campo para ingresar correo electrónico
  - Información sobre el proceso de recuperación
  - Botón para enviar instrucciones
  - Opción para cerrar modal

### Funcionalidades Técnicas

- **Gestión de Estado de Autenticación**:
  - Manejo de errores específicos (credenciales incorrectas, cuenta bloqueada)
  - Indicador de carga durante proceso de login
  - Redirección inteligente post-login según rol y estado

- **Seguridad**:
  - Protección contra ataques de fuerza bruta (límite de intentos)
  - Almacenamiento seguro de tokens
  - Verificación de dispositivos nuevos
  - Soporte para 2FA cuando está habilitado

- **Experiencia de Usuario**:
  - Autocompletado de campos optimizado
  - Retención de email entre sesiones (optional)
  - Feedback visual para cada interacción
  - Transiciones suaves entre estados

- **Funcionalidades Específicas**:
  - Detección de caps lock activo
  - Restauración de sesión si existe token válido
  - Detección de navegador privado/incógnito con advertencias relevantes

## 3. Página de Configuración del Restaurante

Esta página permite a los propietarios personalizar todos los aspectos de su restaurante en la plataforma y es crucial para una correcta implementación del servicio.

### Contenido Principal

- **Barra Lateral de Navegación**:
  - Secciones: Información Básica, Ubicación, Horarios, Impuestos, Métodos de Pago, Entrega, Configuración Avanzada
  - Indicador visual de progreso de configuración
  - Estado de cada sección (completa/incompleta)

- **Sección: Información Básica**:
  - Logotipo del restaurante (con uploader de imágenes)
  - Nombre del restaurante
  - Descripción corta (para búsquedas)
  - Descripción larga (para página del restaurante)
  - Categoría/tipo de cocina (múltiple selección)
  - Teléfono de contacto
  - Email de contacto
  - Sitio web (opcional)
  - Redes sociales (opcional)

- **Sección: Ubicación**:
  - Dirección completa con autocompletado
  - Mapa interactivo para ajuste fino de ubicación
  - Área de entrega (radio o polígono personalizable)
  - Puntos de referencia cercanos
  - Instrucciones adicionales para encontrar el local

- **Sección: Horarios**:
  - Horarios de apertura y cierre por día de la semana
  - Configuración de múltiples rangos por día (ej. almuerzo/cena)
  - Días festivos y excepciones
  - Opción de cierre temporal programado
  - Vista previa de horarios como los verá el cliente

- **Sección: Impuestos**:
  - Configuración de IVA/impuestos aplicables
  - Opciones de inclusión/exclusión de impuestos en precios mostrados
  - Reglas específicas por categoría de producto (si aplica)
  - Información fiscal del restaurante
  - Vista previa de cálculos de impuestos

- **Sección: Métodos de Pago**:
  - Activación de métodos aceptados:
    - Efectivo
    - Tarjetas de crédito/débito (con selección de banderas)
    - Pagos digitales/billeteras
    - Vales de comida
  - Configuración de cambio disponible para efectivo
  - Integración con pasarelas de pago
  - Opciones de propina sugerida

- **Sección: Entrega**:
  - Configuración de delivery propio vs. plataformas externas
  - Costo de envío (fijo, por distancia, o por rangos)
  - Tiempo estimado de entrega
  - Pedido mínimo para delivery
  - Configuración de repartidores
  - Zonas con recargo adicional

- **Sección: Configuración Avanzada**:
  - Notificaciones y alertas
  - Integración con sistemas POS
  - Configuración de impresora de tickets
  - Opciones de reserva de mesas
  - Política de cancelaciones
  - Personalización de recibos/facturas

- **Barra Inferior de Acciones**:
  - Botón de guardar cambios
  - Indicador de último guardado
  - Botón de vista previa
  - Botón de publicar/activar restaurante

### Funcionalidades Técnicas

- **Guardado Inteligente**:
  - Autoguardado periódico de cambios
  - Historial de versiones con posibilidad de revertir
  - Validación de campos obligatorios antes de cambiar sección

- **Carga de Archivos**:
  - Optimización automática de imágenes
  - Vista previa de archivos antes de subir
  - Soporte para drag & drop
  - Validación de tamaños y formatos

- **Geolocalización Avanzada**:
  - Integración con APIs de mapas
  - Cálculo preciso de distancias
  - Validación de direcciones
  - Geocodificación inversa para autocompletado

- **Procesamiento Asíncrono**:
  - Operaciones pesadas ejecutadas en background
  - Notificaciones de finalización de procesos largos
  - Estado de sincronización visible
  - Caché de datos para edición offline

- **Accesibilidad**:
  - Compatibilidad con lectores de pantalla
  - Navegación completa por teclado
  - Alto contraste opcional
  - Textos alternativos para todas las imágenes

## Integración entre Páginas

El flujo entre estas tres páginas está diseñado para una transición natural y una experiencia sin fricciones:

1. **Página de Inicio** → El usuario se registra usando el formulario rápido
2. **Redirección automática a Login** → Se solicita confirmar credenciales
3. **Tras login exitoso** → Redirección a Configuración del Restaurante
4. **Durante la Configuración** → Guardado progresivo que permite reanudar desde cualquier punto

Este flujo guiado asegura que los nuevos usuarios completen el proceso de onboarding de manera eficiente, mientras que los usuarios recurrentes pueden acceder rápidamente a la administración de su restaurante.
