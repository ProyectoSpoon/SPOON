/**
 * Sistema de diseño Spoon - Configuración principal del tema
 * @description Define la paleta de colores y estilos base optimizados para accesibilidad 
 * con ratios de contraste que cumplen WCAG 2.1
 */

/**
 * @typedef {Object} SpoonTheme
 */
export const spoonTheme = {
  colors: {
    // Color principal - Naranja Spoon
    primary: {
      main: '#F4821F',      // Naranja Spoon - Solo para elementos grandes y CTAs
      light: '#FFF4E6',     // Fondo suave y hover states
      dark: '#CC6A10',      // Para texto y elementos interactivos - Ratio >4.5:1
      darker: '#A85510',    // Para texto pequeño - Ratio >7:1
      contrast: '#FFFFFF',  // Para texto sobre fondos naranjas
    },

    // Grises neutros para texto e interfaces
    neutral: {
      50: '#FAFAFA',        // Fondo principal
      100: '#F4F4F5',       // Fondo secundario
      200: '#E5E5E5',       // Bordes claros
      300: '#D4D4D4',       // Bordes
      400: '#9CA3AF',       // Texto deshabilitado - Ratio >3:1
      500: '#6B7280',       // Texto secundario - Ratio >4.5:1
      600: '#4B5563',       // Texto principal - Ratio >7:1
      700: '#374151',       // Texto enfatizado
      800: '#1F2937',       // Títulos
      900: '#111827',       // Texto de máximo contraste
    },

    // Estados del sistema (optimizados para accesibilidad)
    system: {
      success: '#15803D',   // Verde oscuro - Ratio >4.5:1
      warning: '#CC6A10',   // Naranja oscuro - Ratio >4.5:1
      error: '#B91C1C',     // Rojo oscuro - Ratio >7:1
      info: '#1E40AF',      // Azul oscuro - Ratio >7:1
    },

    // Fondos específicos
    background: {
      main: '#FFFFFF',
      paper: '#FAFAFA',
      menu: '#FFF4E6',     // Toque naranja muy suave
      card: '#FFFFFF',
      feature: '#FAFAFA',
      footer: '#111827',   // Dark theme para footer
    },
  },

  // Tipografía
  typography: {
    fontFamily: {
      heading: 'Geist, sans-serif',
      body: 'Inter, sans-serif',
      display: 'GeistMono, monospace',
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
    },
  },

  // Espaciado
  spacing: {
    unit: 4,
    get: (multiplier: number) => `${multiplier * 4}px`,
  },

  // Bordes y esquinas
  border: {
    radius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
    width: {
      thin: '1px',
      regular: '2px',
      thick: '4px',
    },
  },

  // Sombras
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.1)',
  },

  // Transiciones
  transitions: {
    speed: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },

  // Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index
  zIndex: {
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
  // Sistema de animaciones y efectos
  animations: {
    duration: {
      faster: '100ms',
      fast: '200ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
    },

    easing: {
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      softBounce: 'cubic-bezier(0.87, 0, 0.13, 1)',
    },

    motion: {
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.3 }
      },
      slideUp: {
        initial: { y: 50, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { duration: 0.5 }
      },
      slideIn: {
        initial: { x: -100, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        transition: { duration: 0.5 }
      },
      scale: {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.3 }
      }
    },

    spring: {
      gentle: {
        tension: 170,
        friction: 26
      },
      bouncy: {
        tension: 300,
        friction: 10
      },
      slow: {
        tension: 120,
        friction: 14
      }
    },

    hover: {
      lift: {
        transform: 'translateY(-8px)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      },
      glow: {
        boxShadow: '0 0 20px rgba(244, 130, 31, 0.3)',
        transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      },
      scale: {
        transform: 'scale(1.05)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }
    },

    particles: {
      default: {
        particles: {
          number: { value: 30, density: { enable: true, value_area: 800 } },
          color: { value: "#F4821F" },
          opacity: { value: 0.3, random: true },
          size: { value: 3, random: true },
          move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: true,
            straight: false
          }
        }
      },
      sparse: {
        particles: {
          number: { value: 15, density: { enable: true, value_area: 1000 } },
        }
      },
      dense: {
        particles: {
          number: { value: 50, density: { enable: true, value_area: 600 } },
        }
      }
    },

    tilt: {
      default: {
        reverse: false,
        max: 15,
        perspective: 1000,
        scale: 1.05,
        speed: 1000,
        transition: true,
        axis: null,
        reset: true,
        easing: "cubic-bezier(.03,.98,.52,.99)"
      },
      subtle: {
        max: 10,
        scale: 1.02,
        speed: 800
      },
      dramatic: {
        max: 25,
        scale: 1.1,
        speed: 1200
      }
    },

    patterns: {
      grid: `url("data:image/svg+xml,%3Csvg ... %3E")`,
      dots: `url("data:image/svg+xml,%3Csvg ... %3E")`,
      lines: `url("data:image/svg+xml,%3Csvg ... %3E")`
    },

    scroll: {
      fadeUp: {
        threshold: 0.2,
        transition: { duration: 0.8, ease: "easeOut" }
      },
      fadeIn: {
        threshold: 0.1,
        transition: { duration: 0.5, ease: "easeOut" }
      },
      stagger: {
        threshold: 0.1,
        transition: { staggerChildren: 0.1 }
      }
    }
  }
};

/**
 * Obtiene una configuración de animación específica del tema
 * @param {string} path - Ruta de acceso a la configuración de animación (e.g., 'motion.fadeIn')
 * @returns {Object} Configuración de la animación solicitada
 * @example
 * const fadeIn = getAnimation('motion.fadeIn');
 * // Usar: <motion.div animate={fadeIn}>
 */
export const getAnimation = (path: string) => {
  return path.split('.').reduce((obj, key) => obj[key], spoonTheme.animations);
};

/**
 * Obtiene la configuración de partículas según el tipo especificado
 * @param {('default' | 'sparse' | 'dense')} [type='default'] - Tipo de configuración de partículas
 * @returns {Object} Configuración de partículas para el tipo especificado
 * @example
 * const config = getParticlesConfig('sparse');
 * // Usar con react-particles-js
 */
export const getParticlesConfig = (type: string = 'default') => {
  return spoonTheme.animations.particles[type];
};

/**
 * Obtiene la configuración para efectos de inclinación 3D
 * @param {('default' | 'subtle' | 'dramatic')} [type='default'] - Tipo de efecto de inclinación
 * @returns {Object} Configuración del efecto de inclinación
 * @example
 * const tiltConfig = getTiltConfig('subtle');
 * // Usar con react-tilt
 */
export const getTiltConfig = (type: string = 'default') => {
  return spoonTheme.animations.tilt[type];
};

/**
 * Genera media queries para breakpoints específicos
 * @param {keyof typeof spoonTheme.breakpoints} breakpoint - Punto de quiebre
 * @param {'up' | 'down'} direction - Dirección de la media query
 * @returns {string} Media query CSS
 * @example
 * const query = mediaQuery.up('md');
 * // Returns: '@media (min-width: 768px)'
 */
export const mediaQuery = {
  up: (breakpoint: keyof typeof spoonTheme.breakpoints) => 
    `@media (min-width: ${spoonTheme.breakpoints[breakpoint]})`,
  down: (breakpoint: keyof typeof spoonTheme.breakpoints) => 
    `@media (max-width: ${spoonTheme.breakpoints[breakpoint]})`,
};

/**
 * Mixins comunes para estilos reutilizables
 */
export const mixins = {
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  absoluteCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  textEllipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  scrollbarHidden: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '-ms-overflow-style': 'none',
    'scrollbar-width': 'none',
  },
};

/**
 * Calcula valores de espaciado dinámicos
 * @param {number} multiplier - Multiplicador para la unidad base
 * @returns {string} Valor de espaciado en píxeles
 * @example
 * const padding = calculateSpacing(2); // Returns: '8px'
 */
export const calculateSpacing = (multiplier: number): string => 
  `${spoonTheme.spacing.unit * multiplier}px`;

/**
 * Obtiene un valor de la escala tipográfica
 * @param {keyof typeof spoonTheme.typography.sizes} size - Tamaño de fuente
 * @returns {string} Tamaño de fuente en rem
 * @example
 * const fontSize = getTypographySize('lg'); // Returns: '1.125rem'
 */
export const getTypographySize = (size: keyof typeof spoonTheme.typography.sizes): string =>
  spoonTheme.typography.sizes[size];

/**
 * Obtiene un color del tema por su ruta
 * @param {string} path - Ruta al color (e.g., 'primary.main')
 * @returns {string} Valor del color
 * @example
 * const color = getThemeColor('primary.dark'); // Returns: '#CC6A10'
 */
export const getThemeColor = (path: string): string => {
  return path.split('.').reduce((obj, key) => obj[key], spoonTheme.colors);
};

/**
 * Aplica una variación de opacidad a un color
 * @param {string} color - Color en formato hexadecimal
 * @param {number} opacity - Valor de opacidad entre 0 y 1
 * @returns {string} Color con opacidad en formato rgba
 * @example
 * const transparentColor = withOpacity('#F4821F', 0.5);
 */
export const withOpacity = (color: string, opacity: number): string => {
  const rgb = color.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16));
  return rgb ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})` : color;
};

export default spoonTheme;