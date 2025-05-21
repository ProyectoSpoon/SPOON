import React from 'react';

// Definición de tipos
interface PropsIconoConfig {
  tipo: 'legal' | 'horario' | 'imagen' | 'menu';
}

export const IconoConfig = ({ tipo }: PropsIconoConfig) => {
  // Estilo base para todos los iconos
  const estilosIcono = "w-6 h-6 text-gray-600";

  // Renderizado condicional según el tipo
  switch (tipo) {
    case 'legal':
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={estilosIcono} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
      );

    case 'horario':
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={estilosIcono} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      );

    case 'imagen':
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={estilosIcono} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      );

    case 'menu':
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={estilosIcono} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
          />
        </svg>
      );

    default:
      return null;
  }
};

export default IconoConfig;