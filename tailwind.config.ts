import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // COLORES - Mapeando variables CSS existentes
      colors: {
        // Sistema Spoon (conecta con tus variables CSS)
        'spoon': {
          primary: 'var(--spoon-primary)',
          'primary-light': 'var(--spoon-primary-light)',
          'primary-dark': 'var(--spoon-primary-dark)',
          'primary-darker': 'var(--spoon-primary-darker)',
          secondary: '#8B4513', // Del globals.css original
          light: '#FFF9F2',
          dark: '#2C3E50',
        },

        // Sistema de neutros (conecta con variables CSS)
        'spoon-neutral': {
          50: 'var(--spoon-neutral-50)',
          100: 'var(--spoon-neutral-100)',
          200: 'var(--spoon-neutral-200)',
          300: 'var(--spoon-neutral-300)',
          400: 'var(--spoon-neutral-400)',
          500: 'var(--spoon-neutral-500)',
          600: 'var(--spoon-neutral-600)',
          700: 'var(--spoon-neutral-700)',
          800: 'var(--spoon-neutral-800)',
          900: 'var(--spoon-neutral-900)',
        },

        // Estados del sistema
        'spoon-success': 'var(--spoon-success)',
        'spoon-warning': 'var(--spoon-warning)',
        'spoon-error': 'var(--spoon-error)',
        'spoon-info': 'var(--spoon-info)',

        // Fondos y superficies
        'spoon-background': 'var(--spoon-background)',
        'spoon-surface': 'var(--spoon-surface)',
        'spoon-border': 'var(--spoon-border)',

        // Aliases comunes (para compatibilidad)
        background: 'var(--background)',
        foreground: 'var(--spoon-neutral-800)',
        muted: 'var(--spoon-neutral-100)',
        'muted-foreground': 'var(--spoon-neutral-500)',
        border: 'var(--spoon-border)',
        input: 'var(--spoon-surface)',
        ring: 'var(--spoon-primary)',
      },

      // BREAKPOINTS - Del spoon-theme.ts
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },

      // TIPOGRAFÍA - Del spoon-theme.ts
      fontFamily: {
        heading: ['Geist', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        display: ['GeistMono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
        mono: ['GeistMono', 'monospace'],
      },

      fontSize: {
        'xs': '0.75rem',    // 12px
        'sm': '0.875rem',   // 14px
        'base': '1rem',     // 16px
        'lg': '1.125rem',   // 18px
        'xl': '1.25rem',    // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
      },

      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },

      // ESPACIADO - Sistema de 4px
      spacing: {
        '1': '4px',    // 1 * 4
        '2': '8px',    // 2 * 4
        '3': '12px',   // 3 * 4
        '4': '16px',   // 4 * 4
        '5': '20px',   // 5 * 4
        '6': '24px',   // 6 * 4
        '8': '32px',   // 8 * 4
        '10': '40px',  // 10 * 4
        '12': '48px',  // 12 * 4
        '16': '64px',  // 16 * 4
        '20': '80px',  // 20 * 4
        '24': '96px',  // 24 * 4
        '32': '128px', // 32 * 4
      },

      // BORDES Y ESQUINAS - Del spoon-theme.ts
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'full': '9999px',
      },

      // SOMBRAS - Del spoon-theme.ts
      boxShadow: {
        'spoon-sm': '0 1px 3px rgba(0,0,0,0.12)',
        'spoon-md': '0 4px 6px rgba(0,0,0,0.1)',
        'spoon-lg': '0 10px 15px rgba(0,0,0,0.1)',
        'spoon-xl': '0 20px 25px rgba(0,0,0,0.1)',
        'spoon': '0 4px 12px rgba(0,0,0,0.1)',
      },

      // TRANSICIONES - Del spoon-theme.ts
      transitionDuration: {
        'faster': '100ms',
        'fast': '200ms',
        'normal': '300ms',
        'slow': '500ms',
        'slower': '700ms',
      },

      // ANIMACIONES - Del spoon-theme.ts
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'bounce-soft': 'bounceSoft 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(16px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSoft: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      // Z-INDEX - Del spoon-theme.ts
      zIndex: {
        'drawer': '1200',
        'modal': '1300',
        'snackbar': '1400',
        'tooltip': '1500',
      },

      // GRADIENTES PERSONALIZADOS
      backgroundImage: {
        'spoon-gradient': 'linear-gradient(135deg, var(--spoon-primary) 0%, var(--spoon-primary-dark) 100%)',
        'spoon-glow': 'radial-gradient(circle, var(--spoon-primary) 0%, transparent 70%)',
      },
    },
  },
  plugins: [
    // Plugin para animaciones de scroll reveal
    function({ addUtilities }: { addUtilities: any }) {
      addUtilities({
        '.hover-lift': {
          '@apply transition-transform duration-300 hover:-translate-y-1': {},
        },
        '.hover-grow': {
          '@apply transition-transform duration-300 hover:scale-105': {},
        },
        '.text-gradient': {
          '@apply bg-gradient-to-r from-spoon-primary to-spoon-primary-dark bg-clip-text text-transparent': {},
        },
        '.glass-effect': {
          '@apply backdrop-blur-md bg-white/80 border border-white/20': {},
        },
      });
    },
  ],
};

export default config;
