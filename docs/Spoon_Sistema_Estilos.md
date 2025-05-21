# Sistema de Estilos Spoon

Este documento proporciona un inventario completo del sistema de estilos utilizado en el proyecto Spoon, incluyendo la paleta de colores, tipografía, espaciado, animaciones y clases de utilidad.

## 📋 Índice

1. [Paleta de Colores](#paleta-de-colores)
2. [Tipografía](#tipografía)
3. [Espaciado](#espaciado)
4. [Bordes y Esquinas](#bordes-y-esquinas)
5. [Sombras](#sombras)
6. [Transiciones](#transiciones)
7. [Breakpoints](#breakpoints)
8. [Índices Z](#índices-z)
9. [Animaciones](#animaciones)
10. [Clases Globales](#clases-globales)
11. [Mixins y Utilidades](#mixins-y-utilidades)

## Paleta de Colores

### Colores Primarios

El color principal de la marca Spoon es un naranja cálido, optimizado para accesibilidad con diferentes variantes que cumplen con los ratios de contraste WCAG 2.1:

| Variable | Valor | Descripción | Ratio de Contraste |
|----------|-------|-------------|-------------------|
| `--spoon-primary` | `#F4821F` | Naranja Spoon - Solo para elementos grandes y CTAs | 3.5:1 |
| `--spoon-primary-light` | `#FFF4E6` | Fondo suave y hover states | - |
| `--spoon-primary-dark` | `#CC6A10` | Para texto y elementos interactivos | 4.8:1 |
| `--spoon-primary-darker` | `#A85510` | Para texto pequeño | 7:1 |

### Colores Neutros

Sistema escalable de grises para texto, fondos y elementos de interfaz:

| Variable | Valor | Descripción | Ratio de Contraste |
|----------|-------|-------------|-------------------|
| `--spoon-neutral-50` | `#FAFAFA` | Fondo principal | - |
| `--spoon-neutral-100` | `#F4F4F5` | Fondo secundario | - |
| `--spoon-neutral-200` | `#E5E5E5` | Bordes claros | - |
| `--spoon-neutral-300` | `#D4D4D4` | Bordes | - |
| `--spoon-neutral-400` | `#9CA3AF` | Texto deshabilitado | 3:1 |
| `--spoon-neutral-500` | `#6B7280` | Texto secundario | 4.5:1 |
| `--spoon-neutral-600` | `#4B5563` | Texto principal | 7:1 |
| `--spoon-neutral-700` | `#374151` | Texto enfatizado | - |
| `--spoon-neutral-800` | `#1F2937` | Títulos | - |
| `--spoon-neutral-900` | `#111827` | Texto de máximo contraste | - |

### Estados del Sistema

Colores para comunicar estados y feedback al usuario:

| Variable | Valor | Descripción | Ratio de Contraste |
|----------|-------|-------------|-------------------|
| `--spoon-success` | `#15803D` | Verde oscuro | 4.5:1 |
| `--spoon-warning` | `#CC6A10` | Naranja oscuro | 4.8:1 |
| `--spoon-error` | `#B91C1C` | Rojo oscuro | 7:1 |
| `--spoon-info` | `#1E40AF` | Azul oscuro | 7:1 |

### Fondos

Colores para diferentes superficies y fondos:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `--spoon-background` | `var(--spoon-neutral-50)` | Fondo general de la aplicación |
| `--spoon-surface` | `#FFFFFF` | Fondo para componentes y tarjetas |
| `--spoon-border` | `var(--spoon-neutral-200)` | Color para bordes |

## Tipografía

### Familias de Fuentes

| Uso | Fuente | Variable |
|-----|--------|----------|
| Títulos | Geist, sans-serif | `fontFamily.heading` |
| Cuerpo de texto | Inter, sans-serif | `fontFamily.body` |
| Exhibición (código) | GeistMono, monospace | `fontFamily.display` |

### Pesos de Fuente

| Tipo | Valor | Variable |
|------|-------|----------|
| Regular | 400 | `weights.regular` |
| Medium | 500 | `weights.medium` |
| Semibold | 600 | `weights.semibold` |
| Bold | 700 | `weights.bold` |

### Tamaños de Fuente

| Nombre | Tamaño | Variable |
|--------|--------|----------|
| xs | 0.75rem (12px) | `sizes.xs` |
| sm | 0.875rem (14px) | `sizes.sm` |
| base | 1rem (16px) | `sizes.base` |
| lg | 1.125rem (18px) | `sizes.lg` |
| xl | 1.25rem (20px) | `sizes.xl` |
| 2xl | 1.5rem (24px) | `sizes.2xl` |
| 3xl | 1.875rem (30px) | `sizes.3xl` |
| 4xl | 2.25rem (36px) | `sizes.4xl` |

### Estilos de Texto Predefinidos

El sistema incluye estilos predefinidos para elementos de texto comunes:

```css
h1 {
  @apply text-3xl font-bold text-[var(--spoon-neutral-800)] mb-4;
}

h2 {
  @apply text-2xl font-semibold text-[var(--spoon-neutral-700)] mb-3;
}

h3 {
  @apply text-xl font-medium text-[var(--spoon-neutral-700)] mb-2;
}

p {
  @apply text-[var(--spoon-neutral-600)] leading-relaxed mb-4;
}

a {
  @apply text-[var(--spoon-primary-dark)] hover:text-[var(--spoon-primary-darker)] 
         transition-colors duration-200;
}
```

## Espaciado

El sistema utiliza una unidad base de 4px para mantener consistencia:

| Unidad | Valor | Método |
|--------|-------|--------|
| Base | 4px | `spacing.unit` |
| Multiplicador | `(n * 4)px` | `spacing.get(n)` o `calculateSpacing(n)` |

Por ejemplo:
- `spacing.get(1)` = 4px
- `spacing.get(2)` = 8px
- `spacing.get(4)` = 16px
- `spacing.get(6)` = 24px

## Bordes y Esquinas

### Radios de Borde

| Tamaño | Valor | Variable |
|--------|-------|----------|
| sm | 4px | `border.radius.sm` |
| md | 8px | `border.radius.md` |
| lg | 12px | `border.radius.lg` |
| xl | 16px | `border.radius.xl` |
| full | 9999px | `border.radius.full` |

### Anchos de Borde

| Tipo | Valor | Variable |
|------|-------|----------|
| thin | 1px | `border.width.thin` |
| regular | 2px | `border.width.regular` |
| thick | 4px | `border.width.thick` |

## Sombras

| Tamaño | Valor | Variable |
|--------|-------|----------|
| sm | 0 1px 3px rgba(0,0,0,0.12) | `shadows.sm` |
| md | 0 4px 6px rgba(0,0,0,0.1) | `shadows.md` |
| lg | 0 10px 15px rgba(0,0,0,0.1) | `shadows.lg` |
| xl | 0 20px 25px rgba(0,0,0,0.1) | `shadows.xl` |

Además, hay una clase de utilidad `.shadow-spoon`:
```css
.shadow-spoon {
  @apply shadow-[0_4px_12px_rgba(0,0,0,0.1)];
}
```

## Transiciones

### Velocidades

| Tipo | Valor | Variable |
|------|-------|----------|
| fast | 150ms | `transitions.speed.fast` |
| normal | 250ms | `transitions.speed.normal` |
| slow | 350ms | `transitions.speed.slow` |

### Curvas de Aceleración

| Tipo | Valor | Variable |
|------|-------|----------|
| easeInOut | cubic-bezier(0.4, 0, 0.2, 1) | `transitions.easing.easeInOut` |
| easeOut | cubic-bezier(0.0, 0, 0.2, 1) | `transitions.easing.easeOut` |
| easeIn | cubic-bezier(0.4, 0, 1, 1) | `transitions.easing.easeIn` |

## Breakpoints

Puntos de ruptura para diseño responsivo:

| Nombre | Valor | Variable |
|--------|-------|----------|
| xs | 320px | `breakpoints.xs` |
| sm | 640px | `breakpoints.sm` |
| md | 768px | `breakpoints.md` |
| lg | 1024px | `breakpoints.lg` |
| xl | 1280px | `breakpoints.xl` |
| 2xl | 1536px | `breakpoints.2xl` |

Para generar media queries:
```typescript
mediaQuery.up('md')    // '@media (min-width: 768px)'
mediaQuery.down('lg')  // '@media (max-width: 1024px)'
```

## Índices Z

Valores z-index para capas de UI:

| Capa | Valor | Variable |
|------|-------|----------|
| drawer | 1200 | `zIndex.drawer` |
| modal | 1300 | `zIndex.modal` |
| snackbar | 1400 | `zIndex.snackbar` |
| tooltip | 1500 | `zIndex.tooltip` |

## Animaciones

### Duraciones

| Tipo | Valor | Variable |
|------|-------|----------|
| faster | 100ms | `animations.duration.faster` |
| fast | 200ms | `animations.duration.fast` |
| normal | 300ms | `animations.duration.normal` |
| slow | 500ms | `animations.duration.slow` |
| slower | 700ms | `animations.duration.slower` |

### Curvas de Animación

| Tipo | Valor | Variable |
|------|-------|----------|
| bounce | cubic-bezier(0.68, -0.55, 0.265, 1.55) | `animations.easing.bounce` |
| smooth | cubic-bezier(0.4, 0, 0.2, 1) | `animations.easing.smooth` |
| spring | cubic-bezier(0.175, 0.885, 0.32, 1.275) | `animations.easing.spring` |
| softBounce | cubic-bezier(0.87, 0, 0.13, 1) | `animations.easing.softBounce` |

### Motion Presets

Presets para Framer Motion que pueden ser utilizados en componentes animados:

| Tipo | Descripción | Variable |
|------|-------------|----------|
| fadeIn | Fundido de entrada | `animations.motion.fadeIn` |
| slideUp | Deslizamiento hacia arriba | `animations.motion.slideUp` |
| slideIn | Deslizamiento lateral | `animations.motion.slideIn` |
| scale | Aumento de escala | `animations.motion.scale` |

### Efectos Hover

Estilos predefinidos para efectos al pasar el mouse:

| Efecto | Descripción | Variable |
|--------|-------------|----------|
| lift | Elevación al pasar el mouse | `animations.hover.lift` |
| glow | Brillo al pasar el mouse | `animations.hover.glow` |
| scale | Escala al pasar el mouse | `animations.hover.scale` |

## Clases Globales

El sistema incluye clases CSS predefinidas para usar directamente en los componentes:

### Contenedores y Tarjetas

```css
.spoon-card {
  @apply bg-[var(--spoon-surface)] 
         rounded-xl 
         shadow-sm 
         hover:shadow-md 
         transition-all 
         duration-300
         p-6 
         border 
         border-[var(--spoon-border)] 
         hover:border-[var(--spoon-primary)]/20;
}
```

### Títulos y Texto

```css
.spoon-title {
  @apply text-[var(--spoon-neutral-800)] 
         font-bold 
         leading-tight;
}

.spoon-subtitle {
  @apply text-[var(--spoon-neutral-600)] 
         font-medium;
}

.spoon-text {
  @apply text-[var(--spoon-neutral-600)] 
         leading-relaxed;
}
```

### Enlaces

```css
.spoon-link {
  @apply text-[var(--spoon-primary-dark)]
         hover:text-[var(--spoon-primary-darker)]
         transition-colors 
         duration-200 
         underline-offset-4 
         hover:underline;
}
```

### Estados y Badges

```css
.spoon-status-complete {
  @apply text-[var(--spoon-success)]
         bg-[var(--spoon-success)]/10
         px-3 
         py-1 
         rounded-full 
         text-sm 
         font-medium;
}

.spoon-status-pending {
  @apply text-[var(--spoon-primary-dark)]
         bg-[var(--spoon-primary)]/10
         px-3 
         py-1 
         rounded-full 
         text-sm 
         font-medium;
}
```

### Botones

```css
.spoon-button {
  @apply px-4 
         py-2 
         rounded-lg 
         font-medium 
         transition-all 
         duration-200 
         disabled:opacity-50 
         disabled:cursor-not-allowed;
}

.spoon-button-primary {
  @apply spoon-button
         bg-[var(--spoon-primary)]
         text-white
         hover:bg-[var(--spoon-primary-dark)]
         active:bg-[var(--spoon-primary-darker)];
}

.spoon-button-secondary {
  @apply spoon-button
         bg-[var(--spoon-neutral-100)]
         text-[var(--spoon-neutral-700)]
         hover:bg-[var(--spoon-neutral-200)]
         active:bg-[var(--spoon-neutral-300)];
}
```

### Inputs

```css
.spoon-input {
  @apply w-full
         px-3
         py-2
         rounded-lg
         border
         border-[var(--spoon-border)]
         focus:outline-none
         focus:ring-2
         focus:ring-[var(--spoon-primary)]/50
         focus:border-transparent
         disabled:opacity-50
         disabled:cursor-not-allowed
         bg-white;
}
```

### Animaciones y Efectos

```css
.text-gradient {
  @apply bg-gradient-to-r 
         from-[var(--spoon-primary)] 
         to-[var(--spoon-primary-darker)] 
         bg-clip-text 
         text-transparent;
}

.animate-fade-in {
  @apply opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards];
}

.animate-slide-up {
  @apply opacity-0 translate-y-4 animate-[slideUp_0.5s_ease-out_forwards];
}

.hover-lift {
  @apply transition-transform duration-300 hover:-translate-y-1;
}

.hover-grow {
  @apply transition-transform duration-300 hover:scale-105;
}
```

## Mixins y Utilidades

Funciones utilitarias para trabajar con el sistema de estilos:

### Mixins

```typescript
mixins.flexCenter = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

mixins.absoluteCenter = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
}

mixins.textEllipsis = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

mixins.scrollbarHidden = {
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  '-ms-overflow-style': 'none',
  'scrollbar-width': 'none',
}
```

### Funciones de Utilidad

```typescript
// Obtiene un color del tema por su ruta
getThemeColor('primary.dark')  // Returns: '#CC6A10'

// Aplica transparencia a un color
withOpacity('#F4821F', 0.5)    // Returns: 'rgba(244, 130, 31, 0.5)'

// Calcula valor de espaciado
calculateSpacing(2)            // Returns: '8px'

// Obtiene tamaño de tipografía
getTypographySize('lg')        // Returns: '1.125rem'

// Obtiene configuración de animación
getAnimation('motion.fadeIn')  // Returns: animation config object

// Obtiene configuración de partículas
getParticlesConfig('sparse')   // Returns: particles config object

// Obtiene configuración de efecto de inclinación
getTiltConfig('subtle')        // Returns: tilt config object
```

## Stack Tecnológico

El sistema de estilos está construido utilizando:

- Tailwind CSS - Framework de utilidades CSS
- CSS Variables - Para tokens de diseño
- Framer Motion - Para animaciones
- Class Variance Authority (CVA) - Para variantes de componentes

## Ejemplos de Uso

### Uso de Colores

```tsx
<div className="bg-[var(--spoon-primary)]">
  <p className="text-[var(--spoon-neutral-600)]">Texto con colores del sistema</p>
</div>
```

### Uso de Clases Predefinidas

```tsx
<div className="spoon-card">
  <h2 className="spoon-title">Título de Ejemplo</h2>
  <p className="spoon-text">Texto de ejemplo con estilos predefinidos.</p>
  <button className="spoon-button-primary">Botón Primario</button>
</div>
```

### Uso de Animaciones

```tsx
<div className="animate-fade-in">
  Este contenido aparecerá con un efecto de fundido.
</div>
```

### Uso de Variantes de Botón (con CVA)

```tsx
<Button variant="primary" size="lg">Botón Grande</Button>
<Button variant="outline" size="sm">Botón Pequeño</Button>
```

### Uso de Media Queries

```tsx
const responsiveStyles = css`
  padding: ${calculateSpacing(2)};
  
  ${mediaQuery.up('md')} {
    padding: ${calculateSpacing(4)};
  }
  
  ${mediaQuery.up('lg')} {
    padding: ${calculateSpacing(6)};
  }
`;
